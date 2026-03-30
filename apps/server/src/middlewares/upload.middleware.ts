/**
 *  Multer configuration for handling image uploads. This middleware will be used in routes that allow users to upload watch images. It sets up the storage engine, file filter, and limits for the uploaded files.
 * 
 * Design decision: We use multer's memory storage to store the uploaded files in memory as buffers. This allows us to process the images (remove background, convert to webp, apply overlay) before uploading them to our image hosting service (ImageKit). Storing in memory also allows us to easily access the file data for hashing and transformation without needing to read from disk. We set limits on file size and accepted file types to prevent abuse and ensure we only process valid images.
 * */
import multer, { FileFilterCallback } from 'multer';
import type { Request, RequestHandler, Response } from 'express';
const ACCEPTED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic', // for ios devices which often use heic/heif format for photos
    'image/heif',
]; 

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

const fileFilter = (
    req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback,
) => {
    if (ACCEPTED_IMAGE_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                `Unsupported file type: ${file.mimetype}. Only JPEG, PNG, WEBP, HEIC/HEIF are allowed.`,
            ),
        );
    }
};


export const watchImageUpload = multer({
    storage, fileFilter, limits: { fileSize: MAX_FILE_SIZE, files: 4 }
}).array('images', 4); // field name is 'images', max 4 files per watch

export function runMulter(multerFn: RequestHandler, req: Request, res: Response): Promise<void> {
     return new Promise((resolve, reject) => {
        // @ts-ignore — multer types are a bit loose here
        multerFn(req, res, (err: any) => {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_COUNT') {
                    reject(new Error('Maximum 4 images allowed'));
                } else if (err.code === 'LIMIT_FILE_SIZE') {
                    reject(new Error('Each image must be under 2MB'));
                } else {
                    reject(new Error(`Upload error: ${err.message}`));
                }
            } else if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}