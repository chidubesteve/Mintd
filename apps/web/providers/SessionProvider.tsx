'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useAuthStore } from '@/store/Auth.store';
import { apiClient, isProtectedPath, refreshSession } from '@/lib/axios';

export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const queryClient = useQueryClient();

    const authenticated = useAuthStore((state) =>
        Boolean(state.user && state.accessToken),
    );

    const [readyPath, setReadyPath] = useState<string | null>(null);
    const [failure, setFailure] = useState(false);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let active = true;

        const checkSession = async () => {
            try {
                if (useAuthStore.getState().accessToken) {
                    // A locally present JWT might have been revoked elsewhere.
                    await apiClient.get('/auth/session');
                } else {
                    await refreshSession();
                }

                if (active) setFailure(false);
            } catch (error) {
                if (axios.isCancel(error)) return;

                if (
                    axios.isAxiosError(error) &&
                    error.response?.status === 401
                ) {
                    if (active) {
                        queryClient.clear();
                        setFailure(false);
                    }
                } else if (active) {
                    setFailure(true);
                }
            } finally {
                if (active) setReadyPath(pathname);
            }
        };

        const onFocus = () => {
            void checkSession();
        };

        void checkSession();
        window.addEventListener('focus', onFocus);

        return () => {
            active = false;
            window.removeEventListener('focus', onFocus);
        };
    }, [pathname, queryClient, attempt]);

    const protectedRoute = isProtectedPath(pathname);

    useEffect(() => {
        if (
            readyPath === pathname &&
            !failure &&
            protectedRoute &&
            !authenticated
        ) {
            router.replace('/auth/login');
        }
    }, [authenticated, failure, pathname, protectedRoute, readyPath, router]);

    if (readyPath !== pathname) {
        return (
            <div className='flex min-h-screen items-center justify-center'>
                <p>Checking your session...</p>
            </div>
        );
    }

    if (failure) {
        return (
            <div className='flex min-h-screen flex-col items-center justify-center gap-4'>
                <p>We could not check your session. Please try again.</p>
                <button
                    type='button'
                    onClick={() => {
                        setFailure(false);
                        setReadyPath(null);
                        setAttempt((value) => value + 1);
                    }}
                    className='text-accent underline'
                >
                    Try again
                </button>
            </div>
        );
    }

    if (protectedRoute && !authenticated) return null;

    return <>{children}</>;
}
