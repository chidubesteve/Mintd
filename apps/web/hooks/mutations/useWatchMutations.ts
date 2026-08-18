/**
 * @file hooks/mutations/useWatchMutations.ts
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { WatchRegistrationValues } from '@/app/(main)/watch/register/validation/schema';
import { registerWatch } from '@/services/Watch.service';
import { extractErrorMessage } from './useAuthMutations';
import { watchKeys } from '@/hooks/queries/useVault';
import { AxiosError } from 'axios';

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
