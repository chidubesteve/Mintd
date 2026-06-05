// sessionprovider to restore user session on page refresh and provide user data to the rest of the app
'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/Auth.store';
import { refreshSession } from '@/services/Auth.service';


export default function SessionProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const setAuth = useAuthStore((s) => s.setAuth);
    const clearAuth = useAuthStore((s) => s.clearAuth);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [isLoading, setIsLoading] = useState(true);

    // On app load, try to restore session if there's a refresh token cookie
    useEffect(() => {
        const initializeSession = async () => {
            try {
                // if we already have an access token, no need to refresh( no network roundtrip) (e.g. just logged in without refreshing the page)
                if (isAuthenticated()) {
                    setIsLoading(false);
                    return;
                };

                // call the refresh endpoint to get a new access token using the refresh token cookie
                const { user, accessToken } = await refreshSession();
                setAuth(user, accessToken);
              
            } catch (error) {
                clearAuth();
                console.error('Session initialization failed:', error);
            } finally {
                // stop showing the loading screen
                setIsLoading(false);
            }
        };

        initializeSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isLoading) {
        // You can replace this with a proper loading spinner or skeleton screen
        return (
            <div className="flex items-center justify-center h-screen w-screen">
                <p>Loading Application...</p>
            </div>
        );
    }

    return <>{children}</>;
}