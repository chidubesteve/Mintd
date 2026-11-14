/**
 * @file services/Kyc.service.ts
 *
 * Handles KYC-related API calls.
 */

import { apiClient } from '@/lib/axios';

export interface CreateKycSessionResponse {
    url: string;
}

/**
 * Starts (or resumes/resubmits) a hosted Didit verification session.
 * Resolves to the hosted URL to redirect the user to.
 */
export async function createKycSession(): Promise<CreateKycSessionResponse> {
    const response = await apiClient.post<CreateKycSessionResponse>(
        '/kyc/session',
    );
    return response.data;
}
