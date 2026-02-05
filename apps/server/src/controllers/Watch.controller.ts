import { Request, Response } from 'express';
import { Watch } from '../models/Watch.models';
import crypto from 'crypto';
import { OwnershipHistory } from '../models/OwnershipHistory.model';
import mongoose from 'mongoose';
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
            images,
        } = req.body;

        if (
            !brand ||
            !model ||
            !serialNumber ||
            !images ||
            images.length === 0
        ) {
            res.status(400).json({
                message:
                    'Brand, model, serial number, and at least one image are required',
            });
            return;
        }

        if (images.length > 4) {
            res.status(400).json({ message: 'Maximum 4 images allowed' });
            return;
        }

        // check if serial number already exists
        const existingWatch = await Watch.findOne({ serialNumber });
        if (existingWatch) {
            res.status(400).json({
                message:
                    'A watch with this serial number has already been registered',
            });
            return;
        }

        // generate asset ID - MINTD-{timestamp}-{random}
        const timestamp = Date.now();
        const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
        const assetId = `MINTD-${timestamp}-${randomHex}`;

        //TODO: Call WatchBase API here to verify model and get watchbaseId/familyId. For now we'll skip this step and just create the watch record with the provided data.

        // TODO: paraventure the watch is not found on watchbase or there's some form of ambiguity, we should set its status to PENDING_REVIEW and send it tot he admin dashboard for manual review. For now we'll assume all watches are verified and matched successfully.

        // TODO: for now the MVP suporst 20 brands, so the brands from req.body would be coming from a dropdown on the frontend. we need to implement a feature where by if they don't see their brand in the dropdown, they can submit a request ( they would first be taken to a like supported-brands route and we'd tell then what we support at this point then they can submit the request) to add it and that request would come to the admin dashboard for review. If the admin approves it, then that brand gets added to the supported brands list and becomes available in the dropdown for future submissions.
        let watchbaseResult: {
            matched: boolean;
            watchbaseId: string | null;
            status: 'MATCHED' | 'PENDING_REVIEW' | 'REJECTED';
        };
        try {
            watchbaseResult = {
                matched: true,
                watchbaseId: `WB-${brand}-${model}`,
                status: 'MATCHED',
            };
        } catch (error) {
            console.error('WatchBase lookup error:', error);
            // If WatchBase is down, flag for manual review rather than blocking the upload
            watchbaseResult = {
                matched: false,
                watchbaseId: null,
                status: 'PENDING_REVIEW',
            };
        }

        const watch = await Watch.create({
            owner: new mongoose.Types.ObjectId(userId),
            brand,
            model,
            serialNumber,
            purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
            reference: reference || '',
            description: description || '',
            images,
            assetId,
            status: 'REGISTERED',
        });
        // create initial ownership history record
        const ownershipHistory = await OwnershipHistory.create({
            watch: watch._id,
            previousOwner: undefined,
            currentOwner: userId,
            eventType: 'INITIAL_REGISTRATION',
            notes: 'Initial registration of the watch by the user',
            timestamp: new Date(),
        });

        // update watch status to OWNERSHIP_RECORDED after creating the ownership history
        watch.status = 'OWNERSHIP_RECORDED';
        await watch.save();

        res.status(201).json({
            message: 'Watch registered successfully',
            watch: {
                id: watch.id,
                assetId: watch.assetId,
                brand: watch.brand,
                model: watch.model,
                serialNumber: watch.serialNumber,
                status: watch.status,
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
        res.status(200).json({ watches });
    } catch (error) {
        console.error('Get watches error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getWatchDetailsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { watchId } = req.params;
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

        res.status(200).json({ watch, ownershipHistory: history });
    } catch (error) {
        console.error('Error in getWatchDetailsHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
