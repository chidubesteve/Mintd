/**
 * @file hooks/queries/useVault.ts
 *
 * Read-side hooks for the vault: the watch list and a single watch's
 * details. Kept separate from hooks/mutations/useWatchMutations.ts so the
 * queries/ vs mutations/ split in this folder actually means something.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getUserWatches, getWatchDetails } from '@/services/Watch.service';

export const watchKeys = {
    all: ['watches'] as const,
    lists: () => [...watchKeys.all, 'list'] as const,
    detail: (id: string) => [...watchKeys.all, 'detail', id] as const,
};

export function useVault() {
    return useQuery({
        queryKey: watchKeys.lists(),
        queryFn: getUserWatches,
        staleTime: 5 * 60 * 1000,
        select: (data) => data.watches,
    });
}

export function useWatchDetails(watchId: string) {
    return useQuery({
        queryKey: watchKeys.detail(watchId),
        queryFn: () => getWatchDetails(watchId),
        enabled: !!watchId,
        staleTime: 2 * 60 * 1000,
    });
}
