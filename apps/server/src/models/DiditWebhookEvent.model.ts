import { model, Schema } from 'mongoose';

/**
 * Records every processed Didit webhook delivery by its event_id.
 *
 * Didit retries a failed delivery up to twice (~1 min, then ~4 min apart),
 * and the unique index here is the dedupe guard: inserting the same
 * event_id twice throws a duplicate-key error, which the webhook handler
 * uses to short-circuit a retried/duplicate delivery without reprocessing
 * it against Kyc/Collector a second time.
 */
const DiditWebhookEventSchema = new Schema(
    {
        eventId: { type: String, required: true, unique: true },
    },
    { timestamps: true },
);

export const DiditWebhookEvent = model(
    'DiditWebhookEvent',
    DiditWebhookEventSchema,
);
