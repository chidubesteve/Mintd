/**
 * @file hooks/mutations/useWatchMutations.ts
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { WatchRegistrationValues } from '@/app/upload-watch/validation/schema';
import { getUserWatches, getWatchDetails, registerWatch } from '@/services/Watch.service';
import { extractErrorMessage } from './useAuthMutations';
import { AxiosError } from 'axios';

export const watchKeys = {
    all: ['watches'] as const,
    lists: () => [...watchKeys.all, 'list'] as const,
    detail: (id: string) => [...watchKeys.all, 'detail', id] as const,
};

export function useRegisterWatch() {
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: WatchRegistrationValues) => registerWatch(data),
        onSuccess: ({ watch }) => {
            // invalidate the vault list so it re-fetches and shows the new watch
            queryClient.invalidateQueries({ queryKey: watchKeys.lists() });
            if (watch.pendingReview) {
                toast.success(
                    `${watch.brand} ${watch.model} registered! It's pending admin review before verification.`,
                );
            } else {
                toast.success(`${watch.brand} ${watch.model} registered!`);
            }
            router.push('/vault');
        },
        onError: (error: AxiosError) => toast.error(extractErrorMessage(error)),
    });
}

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