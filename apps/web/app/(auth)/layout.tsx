/**
 * @file app/(auth)/layout.tsx
 *
 * Route group layout for all auth pages.
 *
 * Why a route group and not a pathname check in ClientLayout?
 *
 * The pathname-check approach looks like this:
 *   const pathname = usePathname();
 *   const isAuth = pathname.startsWith('/auth');
 *   return <>{!isAuth && <Header />} ... </>
 *
 * Problems with that:
 *  1. It's a runtime check — the Header renders for one frame then
 *     disappears, causing a flash on every auth page load.
 *  2. It's fragile — every new auth route has to be remembered and
 *     added to the check.
 *  3. ClientLayout is a client component, so it re-runs on every
 *     navigation, doing unnecessary work.
 *
 * Route groups solve all three: Next.js picks the correct layout at
 * build time, zero JS overhead, zero flash, zero maintenance burden.
 *
 * File structure this creates:
 *   app/
 *     (auth)/               ← route group — no URL segment added
 *       layout.tsx          ← this file, no Header/Footer
 *       auth/
 *         login/page.tsx
 *         register/page.tsx
 *         forgot-password/page.tsx
 *         reset-password/page.tsx
 *         verify-email/page.tsx
 *     (main)/               ← everything else
 *       layout.tsx          ← has Header + Footer
 *       vault/page.tsx
 *       watch/...
 *
 * The parentheses in the folder name tell Next.js it's a group —
 * it does NOT appear in the URL. /auth/login stays /auth/login.
 */

import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryProvider from '@/providers/QueryProvider';
import { Toaster } from 'sonner';

export const metadata: Metadata = { title: 'Mintd — Authentication' };

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
                <TooltipProvider>
                    <main>{children}</main>
                </TooltipProvider>
                <Toaster />
            </ThemeProvider>
        </QueryProvider>
    );
}
