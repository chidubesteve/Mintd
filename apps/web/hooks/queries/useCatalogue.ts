/**
 * @file hooks/queries/useCatalogue.ts
 *
 * Backs the brand → model → reference cascade on the "identify your watch"
 * step of registration. Each level only fetches once its parent is chosen
 * (enabled: !!brand / !!model), so we don't fire useless requests.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import {
    getSupportedBrands,
    getModelsByBrand,
    getReferencesByBrandModel,
} from '@/services/Watch.service';

export const catalogueKeys = {
    all: ['catalogue'] as const,
    brands: () => [...catalogueKeys.all, 'brands'] as const,
    models: (brand: string) => [...catalogueKeys.all, 'models', brand] as const,
    references: (brand: string, model: string) =>
        [...catalogueKeys.all, 'references', brand, model] as const,
};

export function useCatalogueBrands() {
    return useQuery({
        queryKey: catalogueKeys.brands(),
        queryFn: getSupportedBrands,
        staleTime: Infinity, // the ~19 supported brands basically never change within a session
    });
}

export function useCatalogueModels(brand: string) {
    return useQuery({
        queryKey: catalogueKeys.models(brand),
        queryFn: () => getModelsByBrand(brand),
        enabled: !!brand,
        staleTime: 10 * 60 * 1000,
    });
}

export function useCatalogueReferences(brand: string, model: string) {
    return useQuery({
        queryKey: catalogueKeys.references(brand, model),
        queryFn: () => getReferencesByBrandModel(brand, model),
        enabled: !!brand && !!model,
        staleTime: 10 * 60 * 1000,
    });
}
