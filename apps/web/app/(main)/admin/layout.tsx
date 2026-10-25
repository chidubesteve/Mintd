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
    const authenticated = useAuthStore((state) =>
        Boolean(state.user && state.accessToken),
    );
    useEffect(() => {
        if (!authenticated) {
            router.replace('/auth/login');
        } else if (user?.role !== 'ADMIN') {
            router.replace('/vault');
        }
    }, [authenticated, user?.role, router]);

    if (!authenticated || user?.role !== 'ADMIN') {
        return null;
    }

    if (!authenticated || user?.role !== 'ADMIN') {
        return null;
    }

    return (
        <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24'>
            {children}
        </div>
    );
}
