'use client';

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast } from 'sonner';

import VaultGridSkeleton from '@/components/vault/VaultGridSkeleton';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/Auth.store';
import {
    apiClient,
    isAuthChangeInProgress,
    isProtectedPath,
    refreshSession,
} from '@/lib/axios';

type BootstrapState = 'checking' | 'ready' | 'unavailable';

type SessionStatus = 'checking' | 'authenticated' | 'guest' | 'unavailable';

interface SessionContextValue {
    status: SessionStatus;
    retry: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function useSessionStatus(): SessionContextValue {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error('useSessionStatus requires SessionProvider');
    }

    return context;
}

export default function SessionProvider({ children }: { children: ReactNode }) {
    const queryClient = useQueryClient();

    const authenticated = useAuthStore((state) =>
        Boolean(state.user && state.accessToken),
    );

    const [bootstrap, setBootstrap] = useState<BootstrapState>(() =>
        useAuthStore.getState().isAuthenticated() ? 'ready' : 'checking',
    );
    const [connectionIssue, setConnectionIssue] = useState(false);

    const bootstrapRef = useRef<BootstrapState>(bootstrap);
    const lastAttempt = useRef(0);
    const checking = useRef<Promise<void> | null>(null);
    const mounted = useRef(false);

    const checkSession = useCallback(
        (force = false): Promise<void> => {
            if (isAuthChangeInProgress()) return Promise.resolve();
            if (checking.current) return checking.current;

            const hasAuth = useAuthStore.getState().isAuthenticated();

            // A confirmed guest does not need another refresh on every route.
            if (!force && !hasAuth && bootstrapRef.current === 'ready') {
                return Promise.resolve();
            }

            // Throttle navigation and focus checks to once per minute.
            if (!force && Date.now() - lastAttempt.current < 60_000) {
                return Promise.resolve();
            }

            lastAttempt.current = Date.now();

            const task = (async () => {
                try {
                    if (hasAuth) {
                        await apiClient.get('/auth/session');
                    } else {
                        await refreshSession();
                    }

                    if (mounted.current) {
                        bootstrapRef.current = 'ready';
                        setBootstrap('ready');
                        setConnectionIssue(false);
                    }
                } catch (error) {
                    if (axios.isCancel(error)) return;
                    if (!mounted.current) return;

                    if (
                        axios.isAxiosError(error) &&
                        error.response?.status === 401
                    ) {
                        // The shared Axios auth flow clears invalid credentials.
                        // Avoid clearing a newer login accepted in the meantime.
                        if (!useAuthStore.getState().isAuthenticated()) {
                            queryClient.clear();
                        }

                        bootstrapRef.current = 'ready';
                        setBootstrap('ready');
                        setConnectionIssue(false);
                        return;
                    }

                    // An outage is not evidence that the login was revoked.
                    setConnectionIssue(true);

                    const nextState = useAuthStore.getState().isAuthenticated()
                        ? 'ready'
                        : 'unavailable';

                    bootstrapRef.current = nextState;
                    setBootstrap(nextState);
                }
            })().finally(() => {
                if (checking.current === task) {
                    checking.current = null;
                }
            });

            checking.current = task;
            return task;
        },
        [queryClient],
    );

    const retry = useCallback(() => {
        setConnectionIssue(false);
        void checkSession(true);
    }, [checkSession]);

    useEffect(() => {
        mounted.current = true;

        if (useAuthStore.getState().isAuthenticated()) {
            // Login already supplied a server-confirmed session.
            bootstrapRef.current = 'ready';
            lastAttempt.current = Date.now();
        } else {
            void checkSession(true);
        }

        return () => {
            mounted.current = false;
        };
    }, [checkSession]);

    useEffect(() => {
        if (authenticated) {
            bootstrapRef.current = 'ready';
        }
    }, [authenticated]);

    useEffect(() => {
        const onFocus = () => {
            void checkSession();
        };

        const onOnline = () => {
            void checkSession(true);
        };

        window.addEventListener('focus', onFocus);
        window.addEventListener('online', onOnline);

        return () => {
            window.removeEventListener('focus', onFocus);
            window.removeEventListener('online', onOnline);
        };
    }, [checkSession]);

    useEffect(() => {
        const toastId = 'session-connection-issue';

        if (!connectionIssue) {
            toast.dismiss(toastId);
            return;
        }

        toast.error('Unable to verify your session', {
            id: toastId,
            description:
                'The server could not be reached. Your page is still available. Please try again.',
            duration: Infinity,
            action: { label: 'Retry', onClick: retry },
        });
    }, [connectionIssue, retry]);

    const status: SessionStatus = authenticated
        ? 'authenticated'
        : bootstrap === 'ready'
          ? 'guest'
          : bootstrap === 'unavailable'
            ? 'unavailable'
            : 'checking';

    return (
        <SessionContext.Provider value={{ status, retry }}>
            {children}
        </SessionContext.Provider>
    );
}

function SessionContentSkeleton({ pathname }: { pathname: string }) {
    return (
        <div
            className='container mx-auto space-y-6 px-6 pb-24 pt-32'
            aria-busy='true'
        >
            <span className='sr-only'>Loading page content</span>
            <div className='space-y-3'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-4 w-72 max-w-full' />
            </div>

            {pathname.startsWith('/vault') ? (
                <VaultGridSkeleton />
            ) : pathname.startsWith('/admin') ? (
                <div className='space-y-6'>
                    <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                        {Array.from({ length: 3 }).map((_, index) => (
                            <div
                                key={index}
                                className='space-y-3 rounded-lg border border-border bg-card p-4'
                            >
                                <Skeleton className='h-4 w-1/2' />
                                <Skeleton className='h-8 w-2/3' />
                            </div>
                        ))}
                    </div>
                    <div className='space-y-3 rounded-lg border border-border bg-card p-4'>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <Skeleton key={index} className='h-12' />
                        ))}
                    </div>
                </div>
            ) : (
                <div className='grid gap-6 lg:grid-cols-2'>
                    <Skeleton className='min-h-64 rounded-lg border border-border' />
                    <div className='space-y-4 rounded-lg border border-border bg-card p-6'>
                        <Skeleton className='h-6 w-1/2' />
                        <Skeleton className='h-12' />
                        <Skeleton className='h-12' />
                        <Skeleton className='h-12 w-1/2' />
                    </div>
                </div>
            )}
        </div>
    );
}

export function SessionGate({ children }: { children: ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const { status } = useSessionStatus();
    const protectedRoute = isProtectedPath(pathname);

    useEffect(() => {
        if (protectedRoute && status === 'guest') {
            router.replace('/auth/login');
        }
    }, [pathname, protectedRoute, router, status]);

    if (!protectedRoute || status === 'authenticated') {
        return <>{children}</>;
    }

    if (status === 'guest') return null;

    return <SessionContentSkeleton pathname={pathname} />;
}
