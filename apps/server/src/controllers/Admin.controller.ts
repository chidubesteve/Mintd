import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Watch } from '../models/Watch.models';
import { WatchCatalogue } from '../models/WatchCatalogue.model';
import { AdminAuditLog } from '../models/AdminAuditLog.model';
import { User } from '../models/User.model';

export async function getStatsHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const [pendingReviewCount, totalWatches, totalUsers] =
            await Promise.all([
                Watch.countDocuments({ 'catalog.status': 'PENDING_REVIEW' }),
                Watch.countDocuments({}),
                User.countDocuments({}),
            ]);
        res.status(200).json({ pendingReviewCount, totalWatches, totalUsers });
    } catch (error) {
        console.error('Error in getStatsHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function listPendingReviewWatchesHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const watches = await Watch.find({ 'catalog.status': 'PENDING_REVIEW' })
            .populate('owner', 'fName lName email')
            .sort({ createdAt: 1 }) // oldest first — first in, first reviewed
            .lean();
        res.status(200).json({ watches });
    } catch (error) {
        console.error('Error in listPendingReviewWatchesHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function approveWatchHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { watchId } = req.params;
        if (typeof watchId !== 'string' || !mongoose.Types.ObjectId.isValid(watchId)) {
            res.status(400).json({ message: 'Invalid watch ID' });
            return;
        }
        const addToCatalogue = req.body?.addToCatalogue === true;

        const watch = await Watch.findById(watchId);
        if (!watch) {
            res.status(404).json({ message: 'Watch not found' });
            return;
        }

        watch.catalog!.matched = true;
        watch.catalog!.status = 'MATCHED';
        await watch.save();

        await AdminAuditLog.create({
            admin: req.user!.userId,
            action: 'WATCH_APPROVED',
            targetType: 'Watch',
            targetId: watch.id,
            details: { addToCatalogue, brand: watch.brand, model: watch.model },
        });

        if (addToCatalogue) {
            // Upsert — the compound unique index (brand+watchModel+reference,
            // case-insensitive) means this is a no-op if it somehow already
            // exists rather than a duplicate-key error.
            await WatchCatalogue.findOneAndUpdate(
                {
                    brand: watch.brand,
                    watchModel: watch.model,
                    reference: watch.reference || '',
                },
                {
                    $setOnInsert: {
                        brand: watch.brand,
                        watchModel: watch.model,
                        reference: watch.reference || '',
                        description: watch.description || '',
                    },
                },
                { upsert: true, collation: { locale: 'en', strength: 2 } },
            );

            await AdminAuditLog.create({
                admin: req.user!.userId,
                action: 'CATALOGUE_ENTRY_ADDED',
                targetType: 'WatchCatalogue',
                targetId: watch.id, // catalogue entry has no stable id here worth logging; the watch it came from is the useful reference
                details: { brand: watch.brand, model: watch.model, reference: watch.reference },
            });
        }

        res.status(200).json({ message: 'Watch approved', watch });
    } catch (error) {
        console.error('Error in approveWatchHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function rejectWatchHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const { watchId } = req.params;
        if (typeof watchId !== 'string' || !mongoose.Types.ObjectId.isValid(watchId)) {
            res.status(400).json({ message: 'Invalid watch ID' });
            return;
        }
        const reason = (req.body?.reason || '').trim();
        if (!reason) {
            res.status(400).json({ message: 'A rejection reason is required' });
            return;
        }

        const watch = await Watch.findById(watchId);
        if (!watch) {
            res.status(404).json({ message: 'Watch not found' });
            return;
        }

        watch.catalog!.status = 'REJECTED';
        watch.adminNote = reason;
        await watch.save();

        await AdminAuditLog.create({
            admin: req.user!.userId,
            action: 'WATCH_REJECTED',
            targetType: 'Watch',
            targetId: watch.id,
            details: { reason, brand: watch.brand, model: watch.model },
        });

        res.status(200).json({ message: 'Watch rejected', watch });
    } catch (error) {
        console.error('Error in rejectWatchHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function listAuditLogHandler(
    req: Request,
    res: Response,
): Promise<void> {
    try {
        const entries = await AdminAuditLog.find({})
            .populate('admin', 'fName lName email')
            .sort({ createdAt: -1 })
            .limit(100)
            .lean();
        res.status(200).json({ entries });
    } catch (error) {
        console.error('Error in listAuditLogHandler:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
