/**
 * @file services/watch.service.ts
 *
 * Handles all watch-related API calls.
 */

import { apiClient } from '@/lib/axios';
import { WatchRegistrationValues } from '@/app/upload-watch/validation/schema';

export interface WatchImage {
    url: string;
    viewType: string;
    isPrimary: boolean;
}

export interface RegisteredWatch {
    id: string;
    assetId: string;
    brand: string;
    model: string;
    reference: string;
    serialNumber: string;
    status: string;
    catalogueMatch: boolean;
    pendingReview: boolean;
    isCustomBrand: boolean;
    images: WatchImage[];
    ownedSince: string;
}

export interface RegisterWatchResponse {
    message: string;
    watch: RegisteredWatch;
}

// The listing endpoint returns a slimmed-down shape (only primary image).
export interface WatchListItem {
    _id: string;
    assetId: string;
    brand: string;
    reference: string;
    model: string;
    serialNumber: string;
    status: string;
    images: WatchImage; // single object — backend returns primaryImage, not array
    createdAt: string;
}

export interface GetWatchesResponse {
    watches: WatchListItem[];
}

/**
 * Register a new watch
 * @param watch - The watch data to be registered
 * @returns A promise that resolves to the registered watch data
 */

export async function registerWatch(
    data: WatchRegistrationValues,
): Promise<RegisterWatchResponse> {
    const formData = new FormData();

    formData.append('brand', data.brand);
    formData.append('model', data.watchModel);
    formData.append('serialNumber', data.serialNumber);
    if (data.referenceNo) formData.append('reference', data.referenceNo);
    if (data.description) formData.append('description', data.description);

    formData.append('isCustomBrand', data.isCustomBrand ? 'true' : 'false');

    const imageMeta = data.images.map(({ viewType, isPrimary }) => ({
        viewType, isPrimary
    }));
    formData.append('imageMeta', JSON.stringify(imageMeta));
    
    data.images.forEach(({ file }) => formData.append('images', file)); // multer expects all files under 'images' key


    const response = await apiClient.post<RegisterWatchResponse>(
        '/watch/register',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        },
    );
    return response.data;
}

/**
 * Fetch all watches belonging to the authenticated user.
 * Used to populate the Vault page.
 */
export async function getUserWatches(): Promise<GetWatchesResponse> {
    const response = await apiClient.get<GetWatchesResponse>('/watches');
    return response.data;
}

/**
 * Fetch full details for a single watch including ownership history.
 */
export async function getWatchDetails(watchId: string): Promise<unknown> {
    const response = await apiClient.get(`/watches/${watchId}`);
    return response.data;
}
