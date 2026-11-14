/**
 * Thin wrapper around Didit's V3 verification-session REST API.
 *
 * V3, not V2 — endpoint, webhook signature scheme (X-Signature-V2, a
 * canonicalized re-serialization rather than a raw-body HMAC), and the
 * full literal status set below all come from Didit's own integration
 * guide for this application, not a guess.
 */
import crypto from 'crypto';

const DIDIT_API_BASE =
    process.env.DIDIT_API_BASE_URL || 'https://verification.didit.me';

export interface DiditSession {
    sessionId: string;
    url: string;
}

/**
 * Starts a hosted verification session for a Collector. The returned `url`
 * is handed to the Web SDK modal (DiditSdk.shared.startVerification), which
 * runs OCR + liveness + face match on Didit's own hosted flow.
 */
export async function createDiditSession(
    userId: string,
    callbackUrl: string,
): Promise<DiditSession> {
    const apiKey = process.env.DIDIT_KYC_API_KEY;
    if (!apiKey) {
        throw new Error('DIDIT_KYC_API_KEY is not set');
    }
    const workflowId = process.env.DIDIT_WORKFLOW_ID;
    if (!workflowId) {
        throw new Error('DIDIT_WORKFLOW_ID is not set');
    }

    const response = await fetch(`${DIDIT_API_BASE}/v3/session/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
        },
        body: JSON.stringify({
            workflow_id: workflowId,
            vendor_data: userId,
            callback: callbackUrl,
        }),
    });

    if (!response.ok) {
        // A 403 here specifically means a missing/invalid/revoked api key —
        // Didit returns the same {"detail": "..."} shape for every auth
        // failure, no machine-readable discriminator.
        const text = await response.text().catch(() => '');
        throw new Error(
            `Didit session creation failed: ${response.status} ${text}`,
        );
    }

    const data = (await response.json()) as { session_id: string; url: string };
    return { sessionId: data.session_id, url: data.url };
}

// ─── Webhook signature verification (X-Signature-V2) ──────────────────────
//
// Didit signs a canonicalized re-serialization of the parsed body, not the
// raw bytes — this survives re-encoding by any body-parsing middleware in
// between. The two transforms below must exactly match Didit's own
// canonicalization or every signature will mismatch.

/** Whole-number floats (1.0) -> integers (1), recursively. */
function shortenFloats(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(shortenFloats);
    if (value && typeof value === 'object') {
        return Object.fromEntries(
            Object.entries(value as Record<string, unknown>).map(([k, v]) => [
                k,
                shortenFloats(v),
            ]),
        );
    }
    if (typeof value === 'number' && !Number.isInteger(value) && value % 1 === 0) {
        return Math.trunc(value);
    }
    return value;
}

/** Recursive lexicographic key sort (array element order is preserved). */
function sortKeys(value: unknown): unknown {
    if (Array.isArray(value)) return value.map(sortKeys);
    if (value && typeof value === 'object') {
        return Object.keys(value as object)
            .sort()
            .reduce<Record<string, unknown>>((acc, k) => {
                acc[k] = sortKeys((value as Record<string, unknown>)[k]);
                return acc;
            }, {});
    }
    return value;
}

/**
 * Verifies the inbound webhook's X-Signature-V2 header. Must be called
 * with the untouched raw bytes — the canonicalization re-parses them, but
 * starting from an already-parsed/re-serialized body risks silently
 * normalizing away a tampered field before it's ever compared.
 */
export function verifyDiditWebhookSignature(
    rawBody: Buffer,
    signatureHeader: string | undefined,
): boolean {
    const secret = process.env.DIDIT_WEBHOOK_SECRET_KEY;
    if (!secret || !signatureHeader) return false;

    let parsed: unknown;
    try {
        parsed = JSON.parse(rawBody.toString('utf-8'));
    } catch {
        return false;
    }

    const canonical = JSON.stringify(sortKeys(shortenFloats(parsed)));
    const expected = crypto
        .createHmac('sha256', secret)
        .update(canonical, 'utf8')
        .digest('hex');

    // Constant-time comparison — a plain === leaks timing information
    // proportional to how many leading bytes match, letting an attacker
    // guess the signature byte-by-byte over many requests.
    const a = Buffer.from(expected);
    const b = Buffer.from(signatureHeader);
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
}

/**
 * Freshness check against the SIGNED body `timestamp` field — never the
 * unsigned `X-Timestamp` header, which isn't part of the HMAC input, so a
 * captured (body, signature) pair replayed with a freshened header would
 * otherwise still pass.
 */
export function isDiditEventFresh(timestampSeconds: number): boolean {
    if (!timestampSeconds) return false;
    return Math.abs(Date.now() / 1000 - timestampSeconds) <= 300;
}

/** Maps Didit's literal session status to Mintd's Kyc/Collector status enum. */
export function mapDiditStatus(
    diditStatus: string,
): 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED' {
    if (diditStatus === 'Approved') return 'APPROVED';
    if (diditStatus === 'Declined') return 'REJECTED';
    // The prior approval aged out per Didit's retention policy — closest
    // existing enum value to "needs to start over", not "still pending".
    if (diditStatus === 'Kyc Expired') return 'NOT_SUBMITTED';
    // 'Not Started' | 'In Progress' | 'Awaiting User' | 'In Review' |
    // 'Resubmitted' | 'Abandoned' | 'Expired' — none of these is a final
    // yes/no, so they all just sit as PENDING.
    return 'PENDING';
}
