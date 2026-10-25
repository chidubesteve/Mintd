import { Request, Response } from 'express';
import { Kyc } from '../models/Kyc.model';
import { Collector } from '../models/User.model';
import { createDiditSession } from '../utils/Didit.utils';

/**
 * @function createKycSessionHandler
 * @description Starts a hosted Didit verification session for the
 * authenticated collector and upserts the Kyc record to PENDING. One
 * handler serves "start", "resubmit", and "resume" — they're all just
 * "create a fresh session" from Mintd's side; Didit owns everything that
 * happens on the hosted page itself.
 */
export async function createKycSessionHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const userId = req.user!.userId;

        const callbackUrl = `${process.env.FRONTEND_URL?.split(',')[0] ?? 'http://localhost:3000'}/kyc`;
        const session = await createDiditSession(userId, callbackUrl);

        const kyc = await Kyc.findOneAndUpdate(
            { user: userId },
            {
                user: userId,
                status: 'PENDING',
                referenceId: session.sessionId,
                provider: 'didit',
                submittedAt: new Date(),
                rejectionReason: null,
            },
            { upsert: true, new: true },
        );

        await Collector.findByIdAndUpdate(userId, {
            kycStatus: 'PENDING',
            kycId: kyc._id,
        });

        res.status(200).json({ url: session.url });
    } catch (error) {
        console.error('KYC session creation error:', error);
        res.status(500).json({ message: 'Could not start verification' });
    }
}
