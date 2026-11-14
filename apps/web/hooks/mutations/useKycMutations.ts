'use client';
import { DiditSdk } from '@didit-protocol/sdk-web';
import { createKycSession } from '@/services/Kyc.service';
import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { toast } from 'sonner';
import { extractErrorMessage } from './useAuthMutations';

/**
 * Starts a Didit verification session and opens it in the SDK's in-page
 * modal (the integration surface selected in the Didit console) rather
 * than a full-page redirect — the user never leaves /kyc.
 */
export function useStartKyc() {
    return useMutation({
        mutationFn: createKycSession,
        onSuccess: ({ url }) => {
            DiditSdk.shared.startVerification({ url });
        },
        onError: (error) =>
            toast.error(extractErrorMessage(error as AxiosError)),
    });
}
