/**
 * @file services/Admin.service.ts
 *
 * Handles all admin-dashboard API calls. Every endpoint here requires an
 * ADMIN-role session — the backend enforces this independently, this is
 * just the client side of it.
 */

import { apiClient } from '@/lib/axios';

export interface AdminStats {
    pendingReviewCount: number;
    totalWatches: number;
    totalUsers: number;
}

export interface PendingReviewWatch {
    _id: string;
    assetId: string;
    brand: string;
    model: string;
    reference?: string;
    description?: string;
    serialNumber: string;
    isCustomBrand: boolean;
    adminNote?: string;
    owner: { _id: string; fName: string; lName: string; email: string };
    createdAt: string;
}

export interface AuditLogEntry {
    _id: string;
    admin: { _id: string; fName: string; lName: string; email: string };
    action: 'WATCH_APPROVED' | 'WATCH_REJECTED' | 'CATALOGUE_ENTRY_ADDED';
    targetType: 'Watch' | 'WatchCatalogue';
    targetId: string;
    details?: Record<string, unknown>;
    createdAt: string;
}

export async function getAdminStats(): Promise<AdminStats> {
    const response = await apiClient.get<AdminStats>('/admin/stats');
    return response.data;
}

export async function getPendingReviewWatches(): Promise<{
    watches: PendingReviewWatch[];
}> {
    const response = await apiClient.get('/admin/watches/pending-review');
    return response.data;
}

export async function approveWatch(
    watchId: string,
    addToCatalogue: boolean,
): Promise<void> {
    await apiClient.post(`/admin/watches/${watchId}/approve`, {
        addToCatalogue,
    });
}

export async function rejectWatch(
    watchId: string,
    reason: string,
): Promise<void> {
    await apiClient.post(`/admin/watches/${watchId}/reject`, { reason });
}

export async function getAuditLog(): Promise<{ entries: AuditLogEntry[] }> {
    const response = await apiClient.get('/admin/audit-log');
    return response.data;
}
