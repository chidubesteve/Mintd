'use client';
import { LoginFormValues } from '@/app/(auth)/auth/login/validation/schema';
import { RegisterFormValues } from '@/app/(auth)/auth/register/validation/schema';
import {
    login,
    logout,
    register,
    resendVerificationEmail,
    verifyEmailOtp,
} from '@/services/Auth.service';
import { useAuthStore } from '@/store/Auth.store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

/**
 * @file hooks/mutations/useAuthMutations.ts
 *
 * TanStack Query mutation hooks for auth flows.
 *
 * Rule: services handle HTTP, hooks handle side-effects.
 * Every mutation follows the same pattern:
 *   1. Call the service function.
 *   2. On success → update Zustand + navigate.
 *   3. On error   → extract a readable message and surface it.
 *
 * Why extract error messages in one place?
 * Axios wraps server errors in error.response.data. If we let each component
 * handle this, we'd repeat the same nullish chain everywhere. Centralising it
 * here means components just receive a plain string.
 */

export function extractErrorMessage(error: AxiosError) {
    if (error instanceof AxiosError) {
        const serverMessage = (error.response?.data as { message?: string })
            ?.message;
        if (typeof serverMessage === 'string') {
            return serverMessage;
        }
    }
    return 'Something went wrong. Please try again';
}

export function useRegister() {
    const router = useRouter();

    return useMutation({
        mutationFn: (data: RegisterFormValues) => register(data),
        onSuccess: ({ user }) => {
            // don 't set auth state yet, wait for email verification
            toast.success(
                'Successful! Please check your email to verify your email address.',
            );
            //TODO: redirect to like a placeholder verify email page
            router.push(
                `/auth/verify-email?email=${encodeURIComponent(user.email)}`,
            );
        },
        onError: (error) =>
            toast.error(extractErrorMessage(error as AxiosError)),
    });
}

export function useLogin() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    return useMutation({
        mutationFn: ({ email, password }: LoginFormValues) =>
            login(email, password),
        onSuccess: ({ user, accessToken }) => {
            // i want to check for when the user tryign to signin has not verified their email , so they would be naviagted to the verify email page instead of vault the error code returned from the server is EMAIL_NOT_VERIFIED
            setAuth(user, accessToken);
            toast.success('Welcome back, ' + user.fName + '!');
            // role based redirection
            if (user.role === 'ADMIN') router.push('/admin');
            else router.push('/vault');
        },
        onError: (error) => {
            if (error instanceof AxiosError) {
                if (error.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
                    const email = (error.response.data as { email?: string })
                        .email;
                    if (typeof email === 'string') {
                        router.push(
                            `/auth/verify-email?email=${encodeURIComponent(email)}`,
                        );
                    } else {
                        toast.error(
                            'Email not verified. Please check your email for the verification link.',
                        );
                    }
                    return;
                }
            }
            toast.error(extractErrorMessage(error as AxiosError));
        },
    });
}

export function useLogout() {
    const clearAuth = useAuthStore((state) => state.clearAuth);
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            clearAuth();
            queryClient.clear(); // clear cache
            router.push('/auth/login');
        },
        onError: () => {
            // still logout even on error, clear local state
            clearAuth();
            router.push('/auth/login');
        },
    });
}

export function useResendVerification() {
    return useMutation({
        mutationFn: (email: string) => resendVerificationEmail(email),
        onSuccess: () => {
            toast.success('New code sent, please check your email.');
        },
        onError: (error) =>
            toast.error(extractErrorMessage(error as AxiosError)),
    });
}

export function useVerifyEmail() {
    const setAuth = useAuthStore((state) => state.setAuth);
    const router = useRouter();

    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) =>
            verifyEmailOtp(email, otp),
        onSuccess: ({ user, accessToken }) => {
            // First time the client becomes authenticated —
            // token issued here, store populated here, access granted here.
            setAuth(user, accessToken);
            toast.success('Email verified! You can now access your vault.');
            router.replace('/vault');
        },
        onError: (error) => {
            // error toast will not be handled here but in the component
        },
    });
}
