import { InferSchemaType, model, Schema } from "mongoose";

const WalletSchema = new Schema({
    address: { type: String, unique: true },
    encryptedPrivateKey: { type: String, select: false },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
});

export const Wallet = model("Wallet", WalletSchema);
export type WalletType = InferSchemaType<typeof WalletSchema>
