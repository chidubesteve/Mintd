/**
 * @file services/watch.service.ts
 *
 * Handles all watch-related API calls.
 */

import { apiClient } from '@/lib/axios';
import { WatchRegistrationValues } from '@/app/(main)/watch/register/validation/schema';

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
    reference?: string;
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
    isCustomBrand: boolean;
    catalog: {
        matched: boolean;
        status: 'MATCHED' | 'PENDING_REVIEW' | 'REJECTED';
    };
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
    if (data.purchaseDate) formData.append('purchaseDate', data.purchaseDate);

    formData.append('isCustomBrand', data.isCustomBrand ? 'true' : 'false');

    const imageMeta = data.images.map(({ viewType, isPrimary }) => ({
        viewType,
        isPrimary,
    }));
    formData.append('imageMeta', JSON.stringify(imageMeta));

    data.images.forEach(({ file }) => formData.append('images', file)); // multer expects all files under 'images' key

    // NOTE: the watch routes are mounted at /api/watches (see server routes/index.ts),
    // and the create endpoint is POST /api/watches — not /watch/register.
    const response = await apiClient.post<RegisterWatchResponse>(
        '/watches',
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

// ─── Catalogue lookups ──────────────────────────────────────────────────────
// Backs the "identify your watch" step of the registration wizard. Brand →
// model → reference are cascading queries against our seeded WatchCatalogue
// collection (the WatchBase-API replacement), so the user gets a live
// "verified" tick instead of us silently accepting anything they type.

export interface CatalogueReference {
    reference: string;
    description?: string;
}

export async function getSupportedBrands(): Promise<string[]> {
    const response = await apiClient.get<{ brands: string[] }>(
        '/watches/catalogue/brands',
    );
    return response.data.brands;
}

export async function getModelsByBrand(brand: string): Promise<string[]> {
    const response = await apiClient.get<{ models: string[] }>(
        '/watches/catalogue/models',
        { params: { brand } },
    );
    return response.data.models;
}

export async function getReferencesByBrandModel(
    brand: string,
    model: string,
): Promise<CatalogueReference[]> {
    const response = await apiClient.get<{ references: CatalogueReference[] }>(
        '/watches/catalogue/references',
        { params: { brand, model } },
    );
    return response.data.references;
}
