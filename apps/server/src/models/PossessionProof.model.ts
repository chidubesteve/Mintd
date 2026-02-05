import { InferSchemaType, model, Schema } from "mongoose";

 const PossessionProofSchema = new Schema(
    {
        watch: { type: Schema.Types.ObjectId, ref: 'Watch', required: true },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true },

        imageUrl: String,
        challengeCode: String,
        submittedAt: { type: Date },

        status: {
            type: String,
            enum: ['PENDING', 'APPROVED', 'REJECTED'],
            default: 'PENDING',
        },
        reviewedAt: { type: Date, default: null },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
        approved: { type: Boolean, default: false },
        rejectionReason: { type: String, default: null },
    },
    { timestamps: true },
);

export const PossessionProof = model('PossessionProof', PossessionProofSchema);
export type PossessionProof = InferSchemaType<typeof PossessionProofSchema>;
