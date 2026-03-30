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
                    url: { type: String, required: true }, // this is the transformed/procesed url (bg removed, webp, overlay applied). used by public facing ui and nft metadata
                    originalUrl: { type: String, required: true }, // this is the original uploaded url
                    originalHash: { type: String, required: true }, // hash of the original image for verification and duplicate detection. sha256
                    fileId: { type: String, required: true }, // the file identifier from the image hosting service (eg ImageKit) to allow for future management of the image (deletion, transformation, etc)
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
            default: [],            
        },
        isCustomBrand: { type: Boolean, default: false },
        adminNote: { type: String, default: "" },

        catalog: {
            matched: { type: Boolean, default: false },
            catalogueId : String,
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
                'SOLD',
            ],
            default: 'REGISTERED',
        },
    },
    { timestamps: true },
);

export const Watch = model('Watch', WatchSchema);
