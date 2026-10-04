import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { Watch } from '../models/Watch.models';
import { buildProcessedImageUrl } from '../utils/WatchImageUrl.utils';

dotenv.config();

async function main(): Promise<void> {
    const args = process.argv.slice(2);
    const apply = args.includes('--apply');
    const ownerArg = args.find((arg) => arg.startsWith('--owner='));
    const watchArg = args.find((arg) => arg.startsWith('--watch='));
    if (args.some((arg) => arg !== '--apply' && arg !== '--dry-run' &&
        !arg.startsWith('--owner=') && !arg.startsWith('--watch='))) {
        throw new Error('Usage: repair:images -- [--dry-run | --apply] [--owner=<id>] [--watch=<id>]');
    }
    if (apply && args.includes('--dry-run')) throw new Error('Choose --dry-run or --apply.');
    const filter: Record<string, unknown> = {};
    for (const [field, arg] of [['owner', ownerArg], ['_id', watchArg]] as const) {
        if (!arg) continue;
        const id = arg.slice(arg.indexOf('=') + 1);
        if (!/^[a-fA-F0-9]{24}$/.test(id)) throw new Error(`Invalid ${field} ObjectId`);
        filter[field] = new mongoose.Types.ObjectId(id);
    }
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI is missing. Run from apps/server with its .env configured.');
    await mongoose.connect(uri);
    console.log(`${apply ? 'APPLY' : 'DRY RUN'}: database=${mongoose.connection.name}, collection=${Watch.collection.name}`);
    let changed = 0;
    let imagesChanged = 0;
    let skipped = 0;
    let conflicts = 0;
    const cursor = Watch.collection.find(filter, { projection: { images: 1, catalog: 1, status: 1 } });
    for await (const watch of cursor) {
        const status = watch.catalog?.status;
        if (watch.status === 'CERTIFIED' || !['MATCHED', 'PENDING_REVIEW', 'REJECTED'].includes(status)) {
            console.log(`SKIP ${watch._id}: unsupported/certified status (certified overlay is not configured).`);
            skipped++;
            continue;
        }
        const images = watch.images;
        if (!Array.isArray(images) || images.length === 0) continue;
        const updates: Record<string, string> = {};
        try {
            images.forEach((image, index) => {
                if (typeof image.originalUrl !== 'string') throw new Error(`Image ${index} has no originalUrl`);
                const original = new URL(image.originalUrl);
                if (original.protocol !== 'https:') throw new Error(`Image ${index} originalUrl must use HTTPS`);
                const url = buildProcessedImageUrl(image.originalUrl, status);
                if (url !== image.url) updates[`images.${index}.url`] = url;
            });
        } catch (error) {
            console.log(`SKIP ${watch._id}: ${error instanceof Error ? error.message : 'Invalid image'}`);
            skipped++;
            continue;
        }
        if (Object.keys(updates).length === 0) continue;
        console.log(`WATCH ${watch._id}: ${Object.keys(updates).length} image URL(s)`);
        Object.entries(updates).forEach(([field, url]) => console.log(`  ${field}: ${url}`));
        if (apply) {
            // Compare the snapshot before updating; don't overwrite concurrent
            // image edits or status changes. Raw collection avoids save hooks.
            const result = await Watch.collection.updateOne(
                { _id: watch._id, images, catalog: watch.catalog, status: watch.status },
                { $set: updates },
            );
            if (result.matchedCount !== 1) {
                console.log(`CONFLICT ${watch._id}: changed during migration; rerun.`);
                conflicts++;
                continue;
            }
        }
        changed++;
        imagesChanged += Object.keys(updates).length;
    }
    console.log(`${apply ? 'Updated' : 'Would update'} ${changed} watch(es), ${imagesChanged} image URL(s). Skipped=${skipped}, conflicts=${conflicts}.`);
    if (skipped || conflicts) process.exitCode = 1;
}

main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Migration failed');
    process.exitCode = 1;
}).finally(() => mongoose.disconnect());
