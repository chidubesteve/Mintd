/**
 * @file lib/axios.ts
 *
 * Single axios instance used across the entire app.
 *
 *    so individual service functions never need to think about token expiry.

 *
 * The refresh queue pattern:
 *  When multiple requests fail with 401 simultaneously (e.g. on page load
 *  several parallel fetches fire before the token is refreshed), we don't
 *  want to call /auth/refresh N times. Instead, the first 401 triggers the
 *  refresh; subsequent 401s are queued. Once the refresh resolves, the queue
 *  is flushed and all waiting requests are retried with the new token.
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/store/Auth.store';

const BASE_URL =
    process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

export const apiClient = axios.create({
    baseURL: BASE_URL,
    withCredentials: true, // ensures the refresh token cookie is sent on every request
    headers: { 'Content-Type': 'application/json' },
});

// Request interceptor 
// Reads the current access token from Zustand and attaches it as a Bearer token..
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// ─── 401 refresh queue ───────────────────────────────────────────────────────
let isRefreshing = false;

// Each entry in the queue is a pair of resolve/reject callbacks from a
// Promise that wraps the failed request. When the refresh succeeds we
// resolve every queued promise with the new token; on failure we reject them.
type QueueEntry = {
    resolve: (token: string) => void;
    reject: (err: unknown) => void;
};
let failedQueue: QueueEntry[] = [];

function processQueue(error: unknown, token: string | null) {
    failedQueue.forEach((entry) => {
        if (error) {
            entry.reject(error);
        } else {
            entry.resolve(token!);
        }
    });
    failedQueue = [];
}

// Response interceptor 
apiClient.interceptors.response.use(
    // Pass successful responses straight through.
    (response) => response,

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
            _retry?: boolean;
        };

        // Only intercept 401s that haven't already been retried.
        // Also skip the refresh endpoint itself to prevent an infinite loop
        // if the refresh token is also invalid.
        const isRefreshEndpoint =
            originalRequest?.url?.includes('/auth/refresh');
        
        const isPublicAuthEndpoint = [
            '/auth/login',
            '/auth/register',
            '/auth/forgot-password',
            '/auth/verify-email',
            '/auth/resend-verification',
            "/auth/reset-password",
        ].some((path) => originalRequest?.url?.includes(path));
        if (
            error.response?.status !== 401 ||
            originalRequest._retry ||
            isRefreshEndpoint || isPublicAuthEndpoint
        ) {
            return Promise.reject(error);
        }

        // Mark this request so we don't retry it again.
        originalRequest._retry = true;

        if (isRefreshing) {
            // Another request is already refreshing — queue this one.
            return new Promise<string>((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((newToken) => {
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return apiClient(originalRequest);
                })
                .catch(Promise.reject);
        }

        isRefreshing = true;

        try {
            // The refresh endpoint uses the httpOnly cookie automatically
            // because withCredentials: true is set on the instance.
            const { data } = await apiClient.post<{ accessToken: string }>(
                '/auth/refresh',
            );
            const newToken = data.accessToken;

            // Persist the new access token in Zustand.
            useAuthStore.getState().setAccessToken(newToken);

            // Update the Authorization header for the retried request.
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            // Flush the queue — all waiting requests get the new token.
            processQueue(null, newToken);

            return apiClient(originalRequest);
        } catch (refreshError) {
            // Refresh failed (e.g. refresh token expired).
            // Clear auth state and send the user to login.
            processQueue(refreshError, null);
            useAuthStore.getState().clearAuth();

            // In Next.js we can't call router.push here because we're outside
            // React. window.location is the safe escape hatch.
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login?reason=session_expired';
            }
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    },
);

