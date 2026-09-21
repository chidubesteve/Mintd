import ImageKit from '@imagekit/nodejs';
import crypto from 'crypto';
import fs from 'fs';

const imageKit = new ImageKit({
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
});

export interface UploadedWatchImage {
    fileId: string;
    originalUrl: string;
    processedUrl: string;
    originalHash: string;
    isPrimary: boolean;
    viewType: 'front' | 'back' | 'left' | 'right';
}

/**
 * Builds the processed image URL using ImageKit URL transformations.
 *  ImageKit caches the result at the CDN edge after the first request
 * - We can change the transformation later without re-uploading anything
 * - No additional compute cost at upload time
 *
 *  * Transformation chain:
 *   e-bgremove     → AI background removal
 *   l-image,...    → layer our Mintd watermark/luxury background overlay. this would be the mintd logo
 * I am thinking, is a change background step needed to include like a luxurious background after bg removal? or should we just do bg removal and then overlay the watch on a transparent background? I guess it depends on the look we want for the NFTs. If we want a consistent look with a branded background, then we should include a background change step to add that in. If we want a more raw look that just focuses on the watch itself, then we can skip the background change and just have the watch on a transparent background with the overlay. We can experiment with both looks and see which one resonates better with our audience and fits our brand identity. For now, I'll include the background change step in the transformation chain as a placeholder, and we can adjust it later based on our design decisions.
 *   f-webp         → convert to WebP (typically 30-50% smaller than JPEG)
 *   q-90           → quality 90 (good balance of size vs. clarity for watch detail)
 *   w-1200         → standardise width to 1200px (enough for NFT display)
 *
 * Overlay choice depends on where the watch is in its verification journey.
 * Only MATCHED and PENDING_REVIEW are wired in below, because those are the
 * only two states known at registration time (see Watch.controller.ts,
 * where catalogueStatus is resolved before the upload loop runs). CERTIFIED
 * only exists in the map for when the KYC/KYA flow is actually built — it's
 * not reachable from any code path yet, since nothing sets a watch to
 * CERTIFIED today. When that flow lands, it should NOT reuse this
 * upload-time approach: this bakes the overlay into a URL stored once on
 * the Watch document, so a watch that goes from PENDING_REVIEW to CERTIFIED
 * later would keep showing its old badge forever unless something
 * recomputes and overwrites the stored url. The correct fix then is to stop
 * persisting a final url and instead build the transform URL on demand from
 * originalUrl + the watch's current status whenever it's served to the
 * client — that's what ImageKit's on-the-fly transforms are for.
 */
// Paths relative to the media library root (both overlays live at the root,
// same account as the watch photos) — NOT full URLs. ImageKit's overlay
// layer resolves `i-<path>` against your own library; a fully-qualified
// external URL needs a different (base64-url) form we don't need here.
const OVERLAY_LOGOS: Record<'MATCHED' | 'PENDING_REVIEW', string> = {
    MATCHED: 'catalogue_matched_mintd.png',
    PENDING_REVIEW: 'Pending_review_mintd.png',
};

function buildProcessedImageUrl(
    originalUrl: string,
    catalogueStatus: 'MATCHED' | 'PENDING_REVIEW',
): string {
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';
    const overlayPath = OVERLAY_LOGOS[catalogueStatus];

    // extract the path of the original url
    const filePath = originalUrl.replace(urlEndpoint, '');

    // Layer transforms are their own block: `l-image` opens it, `i-<path>`
    // names the overlay, `l-end` closes it. The previous version wrote
    // `l-<url>` directly, which isn't valid ImageKit syntax at all — there
    // was no `l-image`/`i-`/`l-end`, so every processed-image request
    // failed with "invalid transformation".
    const transforms = `e-bgremove,l-image,i-${encodeURIComponent(overlayPath)},lx-30,l-end,f-webp,q-90,w-1200`;
    return `${urlEndpoint}${filePath}?tr=${transforms}`;
}

export async function uploadWatchImage(
    fileBuffer: Buffer,
    originalFileName: string,
    viewType: 'front' | 'back' | 'left' | 'right',
    isPrimary: boolean,
    catalogueStatus: 'MATCHED' | 'PENDING_REVIEW',
): Promise<UploadedWatchImage> {
    const originalHash = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

    // make file name unique by appending timestamp and random string to prevent collisions in ImageKit storage
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    const fileName = `${originalFileName}-${uniqueSuffix}`;

    // upload to ImageKit
    const uploadResponse = await imageKit.files.upload({
        file: fileBuffer.toString('base64'), // fileBuffer,
        fileName: fileName,
        folder: 'watches/originals',
        useUniqueFileName: false, // we are already making the file name unique with the suffix
        tags: [`watch-${viewType}`, `filename-${fileName}`],
        isPrivateFile: false,
    });

    if (!uploadResponse.fileId || !uploadResponse.url) {
        throw new Error('Upload failed: missing fileId or url');
    }

    return {
        fileId: uploadResponse.fileId,
        originalUrl: uploadResponse.url,
        processedUrl: buildProcessedImageUrl(uploadResponse.url, catalogueStatus),
        originalHash,
        isPrimary,
        viewType,
    };
}

/**
 * 
 * @param fileId the file identifier from ImageKit for the image to be deleted. This allows us to manage our storage and remove images that are no longer needed, such as when a watch is deleted or an image is replaced. We can call this function from our service layer whenever we need to delete an image, ensuring that we keep our ImageKit storage clean and organized.
 * @returns 
 * @throws error if deletion fails
 */
export async function deleteWatchImage(fileId: string): Promise<void> {
    await imageKit.files.delete(fileId);
}