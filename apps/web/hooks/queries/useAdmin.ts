/**
 * @file hooks/queries/useAdmin.ts
 *
 * Read-side hooks for the admin dashboard.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import {
    getAdminStats,
    getPendingReviewWatches,
    getAuditLog,
} from '@/services/Admin.service';

export const adminKeys = {
    all: ['admin'] as const,
    stats: () => [...adminKeys.all, 'stats'] as const,
    pendingReview: () => [...adminKeys.all, 'pending-review'] as const,
    auditLog: () => [...adminKeys.all, 'audit-log'] as const,
};

export function useAdminStats() {
    return useQuery({
        queryKey: adminKeys.stats(),
        queryFn: getAdminStats,
        staleTime: 60 * 1000,
    });
}

export function usePendingReviewWatches() {
    return useQuery({
        queryKey: adminKeys.pendingReview(),
        queryFn: getPendingReviewWatches,
        select: (data) => data.watches,
        staleTime: 30 * 1000,
    });
}

export function useAuditLog() {
    return useQuery({
        queryKey: adminKeys.auditLog(),
        queryFn: getAuditLog,
        select: (data) => data.entries,
        staleTime: 30 * 1000,
    });
}
