import { RegisterFormValues } from '@/app/(auth)/auth/register/validation/schema';
import { apiClient } from '@/lib/axios';
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
    const payload = { email, password };
    const response = await apiClient.post<AuthResponse>('/auth/login', payload);
    return response.data;
}

export async function logout(): Promise<AuthResponse> {
    const response = await apiClient.get<AuthResponse>('/auth/logout');
    return response.data;
}

export async function verifyEmailOtp(email: string, otp: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
        `/auth/verify-email`, { email, otp }
    );
    return response.data;
}

export async function forgotPassword(email: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
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
): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
        `/auth/reset-password?token=${token}`,
        { password },
    );
    return response.data;
}