/**
 * @file store/auth.store.ts
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type UserRole = 'COLLECTOR' | 'ADMIN';

// The minimal user shape the UI needs. We derive this from the login response.
// We don't store the full Mongoose document — only what the client consumes.
export interface AuthUser {
    id: string;
    fName: string;
    lName: string;
    email: string;
    role: UserRole;
    emailVerified: boolean;
    // kycStatus is only present for COLLECTORs (gating watch registration).
    // undefined means the user is an ADMIN.
    kycStatus?: 'NOT_SUBMITTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
}

interface AuthState {
    user: AuthUser | null;
    accessToken: string | null;

    // Called after a successful login or token refresh.
    setAuth: (user: AuthUser, accessToken: string) => void;

    // Called only when a new access token arrives (e.g. after silent refresh),
    // without clobbering the user object.
    setAccessToken: (token: string) => void;

    // Called on logout or when the refresh token is invalid.
    clearAuth: () => void;

    // Convenience selector — avoids nullish checks in components.
    isAuthenticated: () => boolean;
}



export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,

    setAuth: (user, accessToken) => set({ user, accessToken }),

    setAccessToken: (token) => set({ accessToken: token }),

    clearAuth: () => set({ user: null, accessToken: null }),

    isAuthenticated: () => !!get().accessToken && !!get().user,
}));

interface AuthUIState {
    resendCooldownStart: number | null; // timestamp when cooldown started
    setResendCooldownStart: (ts: number) => void;
    clearResendCooldown: () => void;
}

export const useAuthUIStore = create<AuthUIState>()(
    persist(
        (set) => ({
            resendCooldownStart: null,
            setResendCooldownStart: (ts) => set({ resendCooldownStart: ts }),
            clearResendCooldown: () => set({ resendCooldownStart: null }),
        }),
        {
            name: 'mintd_auth-ui', // session key
            storage: createJSONStorage(() => sessionStorage),
        }
    )
)