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

export function extractErrorMessage(error: AxiosError) {
    if (error instanceof AxiosError) {
        const serverMessage = (error.response?.data as { message?: string })
            ?.message;
        if (typeof serverMessage === 'string') return serverMessage;
    }
    return 'Something went wrong. Please try again';
}

export function useRegister() {
    const router = useRouter();
    const setPendingEmail = useAuthStore((s) => s.setPendingEmail);

    return useMutation({
        mutationFn: (data: RegisterFormValues) => register(data),
        onSuccess: ({ user }) => {
            // Store email for the verify page — no email in the URL
            setPendingEmail(user.email);
            toast.success(
                'Account created! Check your email for a verification code.',
            );
            router.push('/auth/verify-email?source=signup');
        },
        onError: (error) =>
            toast.error(extractErrorMessage(error as AxiosError)),
    });
}

export function useLogin() {
    const setAuth = useAuthStore((s) => s.setAuth);
    const setPendingEmail = useAuthStore((s) => s.setPendingEmail);
    const router = useRouter();

    return useMutation({
        mutationFn: ({ email, password }: LoginFormValues) =>
            login(email, password),
        onSuccess: ({ user, accessToken }) => {
            setAuth(user, accessToken);
            toast.success('Welcome back, ' + user.fName + '!');
            if (user.role === 'ADMIN') router.push('/admin');
            else router.push('/vault');
        },
        onError: (error) => {
            if (
                error instanceof AxiosError &&
                error.response?.data?.code === 'EMAIL_NOT_VERIFIED'
            ) {
                const email = (error.response.data as { email?: string })
                    ?.email;
                if (typeof email === 'string') {
                    setPendingEmail(email);
                    // Auto-send a fresh code — login never sends one
                    resendVerificationEmail(email).catch(() => {});
                    router.push('/auth/verify-email?source=login');
                }
                return;
            }
            toast.error(extractErrorMessage(error as AxiosError));
        },
    });
}

export function useLogout() {
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const router = useRouter();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSuccess: () => {
            clearAuth();
            queryClient.clear();
            router.push('/auth/login');
        },
        onError: () => {
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
    const setAuth = useAuthStore((s) => s.setAuth);
    const clearPendingEmail = useAuthStore((s) => s.clearPendingEmail);
    const router = useRouter();

    return useMutation({
        mutationFn: ({ email, otp }: { email: string; otp: string }) =>
            verifyEmailOtp(email, otp),
        onSuccess: ({ user, accessToken }) => {
            setAuth(user, accessToken);
            clearPendingEmail(); // clean up — no longer needed
            toast.success('Email verified! Welcome to Mintd.');
            router.replace('/vault');
        },
        onError: () => {
            // handled inline in the component via isError + error
        },
    });
}
