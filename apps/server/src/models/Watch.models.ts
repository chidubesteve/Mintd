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

        watchbase: {
            matched: { type: Boolean, default: false },
            watchbaseId: String,
            familyId: String,
            status: {
                type: String,
                enum: ['MATCHED', 'PENDING_REVIEW', 'REJECTED'],
                default: 'PENDING_REVIEW',
            },
        },
        // Public-facing asset identifier
        // Generated on creation: MINTD-{timestamp}-{random}
        assetId: { type: String, unique: true, index: true, required: true },
        status: {
            type: String,
            enum: [
                'REGISTERED', //USER UPLOADS THE WATCH
                'OWNERSHIP_RECORDED', // ASSET ID ISSUED,
                'CERTIFICATION_PENDING',
                'CERTIFIED', // KYC + possession + mint
                'LOCKED', // during trigger event
            ],
            default: 'REGISTERED',
        },
    },
    { timestamps: true },
);

export const Watch = model('Watch', WatchSchema);
