// This is for a real world watch
import { model, Schema } from 'mongoose';
import { SUPPORTED_BRANDS } from '../constants/supported_brands';

const WatchSchema = new Schema(
    {
        owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        brand: {
            type: String,
            required: true,
            validate: {
                validator: (v: string) =>
                    SUPPORTED_BRANDS.includes(
                        v as (typeof SUPPORTED_BRANDS)[number],
                    ),
                message: (props: { value: string }) =>
                    `"${props.value}" is not a supported brand`,
            },
        },
        model: { type: String, required: true, trim: true },
        serialNumber: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },
        description: { type: String, default: '', trim: true },
        reference: { type: String, default: '', trim: true },
        purchaseDate: { type: Date, default: null },
        images: {
            type: [
                {
                    url: { type: String, required: true },
                    isPrimary: { type: Boolean, default: false },
                    viewType: {
                        type: String,
                        enum: ['front', 'back', 'left', 'right'],
                        default: 'front',
                    },
                },
            ],
            validate: {
                // @ts-ignore
                validator: function (images: any[]) {
                    return images.length >= 1 && images.length <= 4;
                },
                message: 'Watch must have between 1 and 4 images',
            },
        },

        purchasePrice: { type: Number, select: false },
        nft: { type: Schema.Types.ObjectId, ref: 'NFT' },
    },
    { timestamps: true },
);

export const Watch = model('Watch', WatchSchema);
