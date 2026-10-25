import { RegisterFormValues } from '@/app/(auth)/auth/register/validation/schema';

import {
    apiClient,
    clearClientSession,
    runAuthChange,
    refreshSession,
} from '@/lib/axios';
import { AuthUser } from '@/store/Auth.store';

export interface AuthResponse {
    message: string;
    accessToken: string;
    user: AuthUser;
}

interface MessageResponse {
    message: string;
}

export async function register(
    data: RegisterFormValues,
): Promise<AuthResponse> {
    const payload = {
        fName: data.firstName,
        lName: data.lastName,
        email: data.email,
        password: data.password,
    };
    const response = await apiClient.post<AuthResponse>(
        '/auth/register',
        payload,
    );
    return response.data;
}

export async function login(
    email: string,
    password: string,
): Promise<AuthResponse> {
    return runAuthChange(async () => {
        const response = await apiClient.post<AuthResponse>('/auth/login', {
            email,
            password,
        });

        return response.data;
    });
}

export async function verifyEmailOtp(
    email: string,
    otp: string,
): Promise<AuthResponse> {
    return runAuthChange(async () => {
        const response = await apiClient.post<AuthResponse>(
            '/auth/verify-email',
            { email, otp },
        );

        return response.data;
    });
}

export async function logout(): Promise<MessageResponse> {
    return runAuthChange(async () => {
        const response = await apiClient.post<MessageResponse>('/auth/logout');

        clearClientSession();
        return response.data;
    });
}

export async function forgotPassword(email: string): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
        '/auth/forgot-password',
        { email },
    );

    return response.data;
}

export async function resendVerificationEmail(
    email: string,
): Promise<MessageResponse> {
    const response = await apiClient.post<MessageResponse>(
        '/auth/resend-verification',
        { email },
    );
    return response.data;
}

export async function resetPassword(
    token: string,
    password: string,
): Promise<MessageResponse> {
    return runAuthChange(async () => {
        const response = await apiClient.post<MessageResponse>(
            '/auth/reset-password',
            { token, newPassword: password },
        );

        clearClientSession();
        return response.data;
    });
}

export { refreshSession } from '@/lib/axios';
