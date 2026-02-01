/*
* @notice: discriminator pattern - discriminators in mongoose are used to create different collections/variants from the a single base collection
*/
import { InferSchemaType, model, Schema } from 'mongoose';

export type UserRole = 'COLLECTOR' | 'ADMIN';

const UserBaseSchema = new Schema(
    {
        username: { type: String, required: true, trim: true },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: { type: String, required: true },
    },
    { timestamps: true, discriminatorKey: 'role' },
);
export const User = model('User', UserBaseSchema);

export type UserType = InferSchemaType<typeof UserBaseSchema>;

const CollectorSchema = new Schema({
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    kycStatus: {
        type: String,
        enum: ['NOT_SUBMITTED', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NOT_SUBMITTED',
        required: true,
        index: true,
    },
    kycId: { type: Schema.Types.ObjectId, ref: 'Kyc' },
});
export const Collector = User.discriminator('COLLECTOR', CollectorSchema);

const AdminSchema = new Schema({});
export const Admin = User.discriminator('ADMIN', AdminSchema);

export type CollectorType = InferSchemaType<typeof CollectorSchema>;
export type AdminType = InferSchemaType<typeof AdminSchema>;