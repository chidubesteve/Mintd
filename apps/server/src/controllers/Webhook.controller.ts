import { Request, Response } from 'express';
import { Kyc } from '../models/Kyc.model';
import { Collector } from '../models/User.model';
import { DiditWebhookEvent } from '../models/DiditWebhookEvent.model';
import {
    isDiditEventFresh,
    mapDiditStatus,
    verifyDiditWebhookSignature,
} from '../utils/Didit.utils';

interface DiditWebhookEnvelope {
    event_id: string;
    webhook_type: string;
    timestamp: number;
    session_id: string;
    status: string;
    vendor_data?: string;
}

/**
 * @function handleDiditWebhook
 * @description Receives Didit's V3 verification-result events. Requires the
 * raw request body (see index.ts — this route is mounted with
 * express.raw() ahead of the global express.json()) because X-Signature-V2
 * is computed over a canonicalized re-serialization of the exact bytes
 * Didit sent, not a copy that's already been through another JSON parser.
 */
export async function handleDiditWebhook(
    req: Request,
    res: Response,
): Promise<void> {
    const rawBody = req.body as Buffer;
    const signature = req.header('x-signature-v2');

    if (!verifyDiditWebhookSignature(rawBody, signature)) {
        res.status(401).json({ message: 'Invalid signature' });
        return;
    }

    let event: DiditWebhookEnvelope;
    try {
        event = JSON.parse(rawBody.toString('utf-8'));
    } catch {
        res.status(400).json({ message: 'Invalid JSON' });
        return;
    }

    if (!isDiditEventFresh(event.timestamp)) {
        res.status(401).json({ message: 'Stale event' });
        return;
    }

    // Dedupe on event_id — Didit retries a failed delivery twice, and this
    // insert is the atomic guard against processing the same delivery more
    // than once. A duplicate-key error means we've already handled this
    // exact event; treat it as a successful no-op, not an error.
    try {
        await DiditWebhookEvent.create({ eventId: event.event_id });
    } catch (error: unknown) {
        if ((error as { code?: number }).code === 11000) {
            res.status(200).json({ received: true, duplicate: true });
            return;
        }
        throw error;
    }

    // Always 200 past this point — a malformed/irrelevant event isn't
    // something Didit should retry forever over, it's just a no-op.
    if (event.webhook_type !== 'status.updated' || !event.session_id || !event.status) {
        res.status(200).json({ received: true });
        return;
    }

    const status = mapDiditStatus(event.status);

    const kyc = await Kyc.findOneAndUpdate(
        { referenceId: event.session_id },
        { status, reviewedAt: new Date() },
        { new: true },
    );

    if (kyc) {
        await Collector.findByIdAndUpdate(kyc.user, { kycStatus: status });
    }

    res.status(200).json({ received: true });
}
