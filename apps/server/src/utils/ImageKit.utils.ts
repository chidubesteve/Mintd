import ImageKit from '@imagekit/nodejs';
import crypto from 'crypto';

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

export { buildProcessedImageUrl } from './WatchImageUrl.utils';
import { buildProcessedImageUrl } from './WatchImageUrl.utils';

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