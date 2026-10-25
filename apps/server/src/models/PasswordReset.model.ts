import { model, Schema } from 'mongoose';

const PasswordResetSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        tokenHash: {
            type: String,
            required: true,
            unique: true,
            select: false,
        },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

// TTL deletes this temporary reset record, never the referenced user.
PasswordResetSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PasswordReset = model('PasswordReset', PasswordResetSchema);
