import { Request, Response } from 'express';
import { Watch } from '../models/Watch.models';
import crypto from 'crypto';
import { OwnershipHistory } from '../models/OwnershipHistory.model';
import mongoose from 'mongoose';
import { runMulter, watchImageUpload } from '../middlewares/upload.middleware';
import { WatchCatalogue } from '../models/WatchCatalogue.model';
import { deleteWatchImage, UploadedWatchImage, uploadWatchImage } from '../utils/ImageKit.utils';

type ViewType = 'front' | 'back' | 'left' | 'right';

interface ImageMeta {
    viewType: ViewType;
    isPrimary: boolean;
}

function generateAssetId(): string {
    // generate asset ID - MINTD-{timestamp}-{random}
    const timestamp = Date.now();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `MINTD-${timestamp}-${randomHex}`;
}
/**
 *
 * @function uploadWatchHandler
 * @description Creates a new watch record, calls WatchBase for model verification, generates asset ID, and creates the initial ownership history entry.
 */
export async function uploadWatchHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const userId = req.user!.userId; // from auth middleware

        const {
            brand,
            model,
            serialNumber,
            purchaseDate,
            reference,
            description,
        } = req.body;

        const isCustomBrand = req.body.isCustomBrand === 'true';

        if (!brand || !model || !serialNumber) {
            res.status(400).json({
                message: 'Brand, model, and serial number are required',
            });
            return;
        }

        try {
            await runMulter(watchImageUpload, req, res);
        } catch (uploadErr: any) {
            res.status(400).json({ message: uploadErr.message });
            return;
        }

        const files = req.files as Express.Multer.File[]; // from multer
        if (!files || files.length === 0) {
            res.status(400).json({ message: 'At least one image is required' });
            return;
        }
        // The client sends a JSON array that maps each uploaded image to its viewType.
        // Must be in the same order as the files array.
        // Example: '[{"viewType":"front","isPrimary":true},{"viewType":"back","isPrimary":false}]'
        let imageMeta: ImageMeta[] = [];
        try {
            imageMeta = req.body.imageMeta
                ? JSON.parse(req.body.imageMeta)
                : [];
        } catch (error) {
            res.status(400).json({
                message: 'imageMeta must be a valid JSON string',
            });
            return;
        }

        // if somehow skipped by client genrate one in a sensible order
        if (imageMeta.length === 0) {
            const viewOrder: ViewType[] = ['front', 'back', 'left', 'right'];
            imageMeta = files.map((_, i) => ({
                viewType: viewOrder[i] ?? 'front',
                isPrimary: i === 0, // first image is primary by default
            }));
        }

        if (imageMeta.length !== files.length) {
            res.status(400).json({
                message: `imageMeta has ${imageMeta.length} entries but ${files.length} files were uploaded. Counts must match.`,
            });
            return;
        }

        // ensure only one primary image exists
        const primaryCount = imageMeta.filter((meta) => meta.isPrimary).length;
        if (primaryCount === 0) {
            // if no primary is set, default the first image to primary
            imageMeta[0].isPrimary = true;
        } else if (primaryCount > 1) {
            res.status(400).json({
                message: 'Only one image can be set as primary',
            });
            return;
        }
        // check if serial number already exists
        const existingWatch = await Watch.findOne({
            serialNumber: serialNumber.trim(),
        });
        if (existingWatch) {
            res.status(400).json({
                message:
                    'A watch with this serial number has already been registered',
            });
            return;
        }

        // Step 5: Catalogue lookup (or skip for custom brands)
        //
        // catalogueStatus breakdown:
        //   MATCHED = we found this exact brand+model+reference in our DB
        //   PENDING_REVIEW = either the combo wasn't in our DB (might be valid but unrecorded) OR the user submitted a custom brand (manual review required)
        //
        // In both PENDING_REVIEW cases the watch is registered and visible to the user,
        // but it cannot proceed to minting until an admin approves it - this i think would also be invoked in the client, as the mint button would be disable until the watch is approved.

        //TODO: Call WatchBase API here to verify model and get watchbaseId/familyId. For now we'll skip this step and just create the watch record with the provided data.
        // Step 1: Run multer to parse the multipart form

        // TODO: paraventure the watch is not found on watchbase or there's some form of ambiguity, we should set its status to PENDING_REVIEW and send it tot he admin dashboard for manual review. For now we'll assume all watches are verified and matched successfully.

        let catalogueMatched = false;
        let catalogueStatus: 'MATCHED' | 'PENDING_REVIEW' | 'REJECTED' =
            'PENDING_REVIEW';
        let adminNote: string | undefined;
        let catalogueId: string | undefined;

        if (isCustomBrand) {
            // if it's a custom brand submission, we automatically set it to pending review and add an admin note for the reviewer
            catalogueStatus = 'PENDING_REVIEW';
            catalogueMatched = false;
            adminNote = `Custom brand submission: ${brand} - ${model} - ${reference}. Requires manual review.`;
        } else {
            // standard flow, check catalogue
            const catalogueEntry = await WatchCatalogue.findOne({
                brand: brand.trim(),
                watchModel: model.trim(),
                reference: reference.trim() || '',
            })
                .collation({ locale: 'en', strength: 2 })
                .lean(); // case insensitive
            if (catalogueEntry) {
                catalogueMatched = true;
                catalogueStatus = 'MATCHED';
                catalogueId = catalogueEntry._id.toString();
            } else {
                // not in catalogue but not marked as custom, maybe there's a mistake in our records or the user made a mistake when inputting the values
                catalogueMatched = false;
                catalogueStatus = 'PENDING_REVIEW';
                adminNote = `Brand/model not found in catalogue: "${brand.trim()} ${model.trim()} ${reference?.trim() || ''}".`;
            }
        }

        const assetId = generateAssetId();
        // upload to imageKit
        const uploadedFileIds: string[] = [];

        let uploadedImages: UploadedWatchImage[];

        try {
            uploadedImages = await Promise.all(
                files.map(async (file, i) => {
                    const meta = imageMeta[i];
                    const uploadResult = await uploadWatchImage(
                        file.buffer,
                        file.originalname,
                        meta.viewType,
                        meta.isPrimary,
                    );
                    uploadedFileIds.push(uploadResult.fileId);
                    return uploadResult;
                }),
            );
        } catch (error) {
            console.error('Image upload error, rolling back:', error);
            await Promise.allSettled(
                uploadedFileIds.map((id) => deleteWatchImage(id)),
            );
            res.status(500).json({
                message: 'Image upload failed, please try again',
            });
            return;
        }

        // shape image data for the watch document
        const watchImages = uploadedImages.map((img) => ({
            url: img.processedUrl,
            originalUrl: img.originalUrl, // raw upload
            originalHash: img.originalHash,
            fileId: img.fileId,
            isPrimary: img.isPrimary,
            viewType: img.viewType,
        }));
        // create watch record in DB
        const watch = await Watch.create({
            owner: new mongoose.Types.ObjectId(userId),
            brand: brand.trim(),
            model: model.trim(),
            serialNumber: serialNumber.trim(),
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            reference: reference?.trim() || '',
            description: description || '',
            images: watchImages,
            assetId,
            status: 'REGISTERED',
            isCustomBrand,
            catalog: {
                matched: catalogueMatched,
                status: catalogueStatus,
                catalogueId,
            },
            adminNote,
        });
        // create initial ownership history record - no need to store in variabl eif it won't be sent back to the client, but we want to make sure that the history is recorded
        await OwnershipHistory.create({
            watch: watch._id,
            previousOwner: undefined,
            currentOwner: userId,
            eventType: 'INITIAL_REGISTRATION',
            notes: 'Initial registration by owner',
            timestamp: new Date(),
        });

        // update watch status to OWNERSHIP_RECORDED after creating the ownership history
        watch.status = 'OWNERSHIP_RECORDED';
        await watch.save();

        // respond with the created watch data - the client needs the watch ID and asset ID at minimum, and we can also include the catalogue match status so they can display that in the UI and potentially show an admin note if it's pending review. We should also include the image URLs so they can show a preview of the registered watch immediately after upload, without needing to call the watch details endpoint separately.
        res.status(201).json({
            message: 'Watch registered successfully',
            watch: {
                id: watch.id,
                assetId: watch.assetId,
                brand: watch.brand,
                model: watch.model,
                serialNumber: watch.serialNumber,
                status: watch.status,
                catalogueMatch: catalogueMatched,
                // Tell the frontend whether to show a "Pending Review" badge
                pendingReview: catalogueStatus === 'PENDING_REVIEW',
                isCustomBrand,
                images: watchImages.map((img) => ({
                    url: img.url,
                    viewType: img.viewType,
                    isPrimary: img.isPrimary,
                })),
                ownedSince: watch.createdAt,
            },
        });
    } catch (error) {
        console.error('Error in uploadWatchHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getUserWatchesHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const userId = req.user!.userId; // from auth middleware
        const watches = await Watch.find({ owner: userId })
            .sort({ createdAt: -1 }) // Newest first
            .lean();

        // i don't want to send the entire images array to the client, as it contains both original and processed urls, fileIds, hashes, etc. For the watch listing page we only need to show the primary image (or the first image if no primary is set) and its view type. The client can call the watch details endpoint to get the full images array when needed. This also reduces the payload size for the listing endpoint, improving performance.
        const shaped = watches.map((w) => {
            const primaryImage =
                w.images.find((img) => img.isPrimary) || w.images[0]; // fallback to first image if no primary set
            return { ...w, images: primaryImage };
        });
        res.status(200).json({ watches: shaped });
    } catch (error) {
        console.error('Get watches error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// GET /watches/:watchId - returns watch details including ownership history and all images (with processed urls for display and original urls for reference but not sent to client). This endpoint is used for the watch details page where the user can see all the information about their watch, including the full ownership history and all uploaded images. The client will be shown the processed images by default then an option to request the original images will be available, (e.g. if we want to show a "View Original Image" option in the UI ).
export async function getWatchDetailsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { watchId } = req.params;
        if (!mongoose.Types.ObjectId.isValid(watchId)) {
            res.status(400).json({ message: 'Invalid watch ID' });
            return;
        }
        const userId = req.user!.userId; // from auth middleware
        const watch = await Watch.findById(watchId).lean();
        if (!watch) {
            res.status(404).json({ message: 'Watch not found' });
            return;
        }
        // verify that the user calling this endpoint is the owner of the watch
        if (watch.owner.toString() !== userId) {
            res.status(403).json({ message: 'Forbidden' });
            return;
        }
        // get ownership history for this watch, sorted by most recent first
        const history = await OwnershipHistory.find({ watch: watchId })
            .sort({ timestamp: -1 })
            .populate('currentOwner', 'fName lName email')
            .populate('previousOwner', 'fName lName email')
            .populate('initiatedBy', 'fName lName email')
            .lean();

        // sanitise image data before sending to client - we only want to send the processed url and view type, not the original url or fileId or hash - those are for internal purposes
        const safeImages = (watch.images || []).map((img: any) => ({
            url: img.url,
            viewType: img.viewType,
            isPrimary: img.isPrimary,
        }));

        res.status(200).json({
            watch: { ...watch, images: safeImages },
            ownershipHistory: history,
        });
    } catch (error) {
        console.error('Error in getWatchDetailsHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// GET catalogue/brands
export async function getSupportedBrandsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const brands = await WatchCatalogue.distinct('brand').collation({
            locale: 'en',
            strength: 2,
        });
        res.status(200).json({ brands });
    } catch (error) {
        console.error('Error in getSupportedBrandsHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// GET catalogue/models?brand=xxx
export async function getModelsByBrandHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { brand } = req.query;
        if (typeof brand !== 'string' || brand.trim() === '') {
            res.status(400).json({
                message: 'Brand query parameter is required',
            });
            return;
        }
        const models = await WatchCatalogue.distinct('model', {
            // what does this regex do? it matches the brand field exactly but case insensitively, so "audemars piguet" would match "Audemars Piguet" in the database. This allows for more flexible user input while still ensuring accurate matches in our catalogue.

            brand: { $regex: new RegExp(`^${brand.trim()}$`, 'i') },
        });
        res.status(200).json({ models });
    } catch (error) {
        console.error('Error in getModelsByBrandHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

// GET /catalogue/references?brand=Rolex&model=Submariner

export async function getReferencesByBrandModelHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { brand, model } = req.query;
        if (typeof brand !== 'string' || brand.trim() === '') {
            res.status(400).json({
                message: 'Brand query parameter is required',
            });
            return;
        }
        if (typeof model !== 'string' || model.trim() === '') {
            res.status(400).json({
                message: 'Model query parameter is required',
            });
            return;
        }
        const entries = await WatchCatalogue.find({
            brand:  new RegExp(`^${(brand as string).trim()}$`, 'i'),
             watchModel: new RegExp(`^${(model as string).trim()}$`, 'i'),
        }, { reference: 1, description: 1, _id: 0 })
            .collation({ locale: 'en', strength: 2 })
            .lean();
        res.status(200).json({ references: entries });
    } catch (error) {
        console.error('Error in getReferencesByBrandModelHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
