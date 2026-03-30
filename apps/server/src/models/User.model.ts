/*
* @notice: discriminator pattern - discriminators in mongoose are used to create different collections/variants from the a single base collection
*/
import { InferSchemaType, model, Schema } from 'mongoose';

export type UserRole = 'COLLECTOR' | 'ADMIN';

const UserBaseSchema = new Schema(
    {
        fName: { type: String, required: true, trim: true },
        lName: { type: String, required: true, trim: true },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        passwordHash: { type: String, required: true },

        // email verification
        emailVerified: { type: Boolean, default: false },
        emailVerificationCode: { type: String, select: false }, //the hash would always be stored
        emailVerificationCodeExpiry: { type: Date, select: false },

        // password reset
        passwordResetToken: { type: String, select: false },
        passwordResetTokenExpiry: { type: Date, select: false },
        role: { type: String, required: true, enum: ['COLLECTOR', 'ADMIN'] },
    },
    { timestamps: true, discriminatorKey: 'role' },
);
// immediately delete expired email verification tokens and password reset tokens using TTL index
UserBaseSchema.index({ emailVerificationTokenExpiry: 1 }, { expireAfterSeconds: 0 });
UserBaseSchema.index({ passwordResetTokenExpiry: 1 }, { expireAfterSeconds: 0 });
export const User = model('User', UserBaseSchema);

export type BaseUserType = InferSchemaType<typeof UserBaseSchema>;

const CollectorSchema = new Schema({
    walletId: { type: Schema.Types.ObjectId, ref: 'Wallet' },
    // denormalized kyc status for easy access without needing to read the Kyc collection every time
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

const AdminSchema = new Schema({ adminLevel: { type: Number, default: 1 } });
export const Admin = User.discriminator('ADMIN', AdminSchema);

export type CollectorType = InferSchemaType<typeof CollectorSchema> & BaseUserType;
export type AdminType = InferSchemaType<typeof AdminSchema> & BaseUserType;