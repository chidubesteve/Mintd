import axios, {
    AxiosError,
    CanceledError,
    InternalAxiosRequestConfig,
} from 'axios';
import { useAuthStore, type AuthUser } from '@/store/Auth.store';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

const options = {
    baseURL: BASE_URL,
    withCredentials: true,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
};

export const apiClient = axios.create(options);

// Separate transport prevents refresh from entering its own interceptor.
const authTransport = axios.create(options);

interface SessionResponse {
    message: string;
    user: AuthUser;
    accessToken: string;
}

type TrackedRequest = InternalAxiosRequestConfig & {
    _authEpoch?: number;
    _retry?: boolean;
};

let authEpoch = 0;
let changingAuth = false;
let refreshFlight: Promise<SessionResponse> | null = null;

function canceled() {
    return new CanceledError('Authentication changed during the request');
}

function isPublicAuthRequest(url = '') {
    const path = url.split('?')[0];

    return [
        '/auth/login',
        '/auth/register',
        '/auth/logout',
        '/auth/refresh',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
        '/auth/resend-verification',
    ].some((endpoint) => path.endsWith(endpoint));
}

export function isProtectedPath(path: string): boolean {
    return ['/vault', '/watch', '/admin', '/kyc', '/settings'].some(
        (prefix) => path === prefix || path.startsWith(`${prefix}/`),
    );
}

async function withCookieLock<T>(operation: () => Promise<T>): Promise<T> {
    if (typeof navigator !== 'undefined' && navigator.locks) {
        return navigator.locks.request('mintd-auth-cookie', () => operation());
    }

    return operation();
}

export function clearClientSession(): void {
    authEpoch += 1;
    useAuthStore.getState().clearAuth();
}

// Used for login, verification, logout and password reset.
export async function runAuthChange<T>(
    operation: () => Promise<T>,
): Promise<T> {
    if (changingAuth) throw canceled();

    changingAuth = true;
    authEpoch += 1;

    try {
        // Let an existing cookie response settle before changing cookies.
        await refreshFlight?.catch(() => undefined);
        return await withCookieLock(operation);
    } finally {
        changingAuth = false;
    }
}

export function refreshSession(): Promise<SessionResponse> {
    if (changingAuth) return Promise.reject(canceled());
    if (refreshFlight) return refreshFlight;

    const epoch = authEpoch;

    const flight = withCookieLock(async () => {
        if (changingAuth || epoch !== authEpoch) throw canceled();

        const { data } =
            await authTransport.post<SessionResponse>('/auth/refresh');

        if (changingAuth || epoch !== authEpoch) throw canceled();

        useAuthStore.getState().setAuth(data.user, data.accessToken);
        return data;
    })
        .catch((error: unknown) => {
            if (changingAuth || epoch !== authEpoch) throw canceled();

            if (axios.isAxiosError(error) && error.response?.status === 401) {
                clearClientSession();
            }

            // Network errors and 503 responses do not mean "logged out".
            throw error;
        })
        .finally(() => {
            if (refreshFlight === flight) refreshFlight = null;
        });

    refreshFlight = flight;
    return flight;
}

function redirectToLogin(): void {
    if (
        typeof window !== 'undefined' &&
        isProtectedPath(window.location.pathname)
    ) {
        window.location.replace('/auth/login?reason=session_expired');
    }
}

export function isAuthChangeInProgress(): boolean {
    return changingAuth;
}

apiClient.interceptors.request.use((config: TrackedRequest) => {
    if (changingAuth && !isPublicAuthRequest(config.url)) {
        throw canceled();
    }

    config._authEpoch = authEpoch;

    const token = useAuthStore.getState().accessToken;

    if (token) config.headers.Authorization = `Bearer ${token}`;
    else config.headers.delete('Authorization');

    return config;
});

apiClient.interceptors.response.use(
    (response) => {
        const config = response.config as TrackedRequest;

        // A late private response must not repopulate a signed-out cache.
        if (
            !isPublicAuthRequest(config.url) &&
            config._authEpoch !== authEpoch
        ) {
            throw canceled();
        }

        return response;
    },
    async (error: AxiosError) => {
        const request = error.config as TrackedRequest | undefined;

        if (!request || isPublicAuthRequest(request.url)) throw error;

        if (changingAuth || request._authEpoch !== authEpoch) {
            throw canceled();
        }

        if (error.response?.status !== 401) throw error;

        if (request._retry) {
            clearClientSession();
            redirectToLogin();
            throw error;
        }

        request._retry = true;

        // Another request may already have refreshed the old token.
        const currentToken = useAuthStore.getState().accessToken;

        if (
            currentToken &&
            request.headers.Authorization !== `Bearer ${currentToken}`
        ) {
            return apiClient(request);
        }

        try {
            await refreshSession();
        } catch (refreshError) {
            if (
                axios.isAxiosError(refreshError) &&
                refreshError.response?.status === 401 &&
                !useAuthStore.getState().accessToken &&
                !changingAuth
            ) {
                redirectToLogin();
            }

            throw refreshError;
        }

        if (changingAuth || request._authEpoch !== authEpoch) {
            throw canceled();
        }

        return apiClient(request);
    },
);
