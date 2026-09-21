'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/Auth.store';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const user = useAuthStore((s) => s.user);
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

    useEffect(() => {
        // By the time this layout mounts, SessionProvider (a parent of
        // (main)/layout.tsx) has already finished rehydrating the session,
        // so the store is settled — no separate loading state needed here.
        if (!isAuthenticated() || user?.role !== 'ADMIN') {
            router.replace('/vault');
        }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated() || user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24'>
            {children}
        </div>
    );
}
