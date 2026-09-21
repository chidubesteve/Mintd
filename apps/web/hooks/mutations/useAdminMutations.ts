/**
 * @file hooks/mutations/useAdminMutations.ts
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { approveWatch, rejectWatch } from '@/services/Admin.service';
import { extractErrorMessage } from './useAuthMutations';
import { adminKeys } from '@/hooks/queries/useAdmin';

export function useApproveWatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            watchId,
            addToCatalogue,
        }: {
            watchId: string;
            addToCatalogue: boolean;
        }) => approveWatch(watchId, addToCatalogue),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.pendingReview() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminKeys.auditLog() });
            toast.success('Watch approved.');
        },
        onError: (error: AxiosError) => toast.error(extractErrorMessage(error)),
    });
}

export function useRejectWatch() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ watchId, reason }: { watchId: string; reason: string }) =>
            rejectWatch(watchId, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.pendingReview() });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
            queryClient.invalidateQueries({ queryKey: adminKeys.auditLog() });
            toast.success('Watch rejected.');
        },
        onError: (error: AxiosError) => toast.error(extractErrorMessage(error)),
    });
}
