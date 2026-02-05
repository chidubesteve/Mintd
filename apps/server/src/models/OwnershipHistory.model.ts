import { model, Schema, InferSchemaType } from 'mongoose';

/**
 * Ownership History — provenance tracking for watches.
 *
 * Every time a watch changes ownership (including the initial registration),
 * a record is created here. This builds an immutable audit trail of who owned
 * the watch when, which is crucial for:
 *   - Insurance claims (proving ownership at time of loss/theft)
 *   - Resale verification (showing legitimate chain of custody)
 *   - Legal disputes 
 *
 * This is separate from the NFT transfer history on-chain because:
 *   1. Not all watches get minted immediately
 *   2. Off-chain ownership changes can happen
 *   3. We want the history to start from initial upload, not just mint date
 *
 */

const OwnershipHistorySchema = new Schema(
    {
        watch: {
            type: Schema.Types.ObjectId,
            ref: 'Watch',
            required: true,
            index: true, // We'll be querying "show me all history for this watch" frequently
        },
        // Who owned the watch before this event
        previousOwner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null, // null for the first record (initial upload)
        },
        // Who owns it now
        currentOwner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        // What triggered this ownership record
        eventType: {
            type: String,
            enum: [
                'INITIAL_REGISTRATION', // User uploaded the watch for the first time,
                'TRANSFER', // On-platform transfer between users
            ],
            required: true,
        },
        // If this was a transfer, reference to the on-chain transaction (if minted)
        transactionHash: { type: String},
        // If this was a transfer, who initiated it
        initiatedBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Optional notes
        notes: { type: String},
        // When this ownership period started
        timestamp: { type: Date, default: Date.now, required: true },
    },
    {
        timestamps: true, // createdAt for when this record was created
    },
);

// Compound index: given a watch, show me its history sorted by time
OwnershipHistorySchema.index({ watch: 1, timestamp: -1 });

export type OwnershipHistoryType = InferSchemaType<
    typeof OwnershipHistorySchema
>;

export const OwnershipHistory = model(
    'OwnershipHistory',
    OwnershipHistorySchema,
);
