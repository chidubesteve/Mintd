import { model, Schema } from 'mongoose';

const authSessionSchema = new Schema(
    {
        _id: { type: String, required: true },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        refreshHash: { type: String, required: true, select: false },
        expiresAt: { type: Date, required: true },
    },
    { timestamps: true },
);

authSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthSession = model('AuthSession', authSessionSchema);
