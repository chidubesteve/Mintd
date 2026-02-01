import { model, Schema, InferSchemaType } from 'mongoose';

/**
 * NFT status mirrors WatchStatus in the smart contract exactly.
 * This is intentional – when you query the vault you want to filter
 * by status in MongoDB without hitting the chain for every token.
 *
 *   ACTIVE → certificate is live and visible in the user's vault
 *   SOLD   → user marked the physical watch as sold. NFT is hidden
 *            from the active vault, it should not be allowed to be transferred - this will be implement in the app level and not on the blockchain, admin would also see maybe watches that has been marked as sold in the dashboard so if users try to interact with the code directly when it reaches admin for approval, they should be able to flag it.
 *   STOLEN → admin flagged this watch as stolen. Transfers are blocked.
 *
 * Note: there's no MINTED status. Minting is the event that creates
 * this document – once it exists, it's ACTIVE by default.
 */

const NftSchema = new Schema(
    {
        // The Watch document this NFT is a certificate for.
        // One-to-one: a watch can only ever have one NFT.
        watch: {
            type: Schema.Types.ObjectId,
            ref: 'Watch',
            required: true,
            unique: true, // enforced in DB – matches the serial uniqueness on-chain
        },
        // The User who owns this NFT right now.
        // Updated on successful transfer.
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        status: {
            type: String,
            enum: ['ACTIVE', 'SOLD', 'STOLEN'],
            default: 'ACTIVE',
            required: true,
        },
        // On-chain identifiers – populated after successful mint transaction
        tokenId: { type: String, required: true, unique: true },
        contractAddress: { type: String, required: true },
        // IPFS URI pointing to the token metadata JSON
        tokenURI: { type: String, required: true },
    },
    {
        timestamps: true, // createdAt = when the mint completed, updatedAt on status changes
    },
);

export type NftType = InferSchemaType<typeof NftSchema>;

export const Nft = model('Nft', NftSchema);
