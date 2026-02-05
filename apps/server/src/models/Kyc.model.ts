import { model, Schema, InferSchemaType } from 'mongoose';

/**
 * KYC submission record — owns the full audit trail for identity verification.
 *
 * Responsibilities:
 *   - Stores the uploaded documents (ID + selfie)
 *   - Tracks who reviewed it and when
 *   - Stores the rejection reason if applicable
 *   - Integration metadata (provider, referenceId) if using a third-party KYC service
 *
 * The current KYC *status* is denormalised onto the User model (User.kyc.status)
 * so that auth-gated routes can check approval without an extra query.
 * When this model's status changes, the User document must be updated too.
 * That sync is the responsibility of the KYC service layer, not the schema.
 *
 * One record per user — resubmissions update this document rather than
 * creating a new one. This keeps the history clean and avoids ambiguity
 * about which record is "current."
 */

const KycSchema = new Schema(
    {
        // One KYC record per user, ever.
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        // Document uploads — set when the user submits, persisted across resubmissions.
        // If a user resubmits after rejection, these get overwritten with the new uploads.
        documentUrl: String,
        selfieUrl: String,
        // Current status of this KYC submission
        status: {
            type: String,
            enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
            default: 'NOT_SUBMITTED',
            required: true,
        },
        // Populated by the admin when rejecting — tells the user what to fix.
        // Cleared on resubmission so it doesn't linger from a previous rejection.
        rejectionReason: String,
        // The admin who reviewed this submission. 
        reviewer: { type: Schema.Types.ObjectId, ref: 'Admin' },
        // When the user last submitted/resubmitted documents for review.
        // Distinct from createdAt — createdAt is when the KYC record was first
        // created (likely at signup), submittedAt is when docs were actually uploaded.
        submittedAt: { type: Date },
        // When the admin completed their review. Distinct from updatedAt because
        // updatedAt changes on any field update, not specifically on review completion.
        reviewedAt: { type: Date },
        // Third-party KYC provider integration metadata.
        provider: { type: String, default: 'getID' },
        referenceId: { type: String, default: null },
    },
    {
        timestamps: true, // createdAt, updatedAt
    },
);

export type KycType = InferSchemaType<typeof KycSchema>;

export const Kyc = model('Kyc', KycSchema);
