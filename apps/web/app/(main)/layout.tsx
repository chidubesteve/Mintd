/**
 * @file app/(main)/layout.tsx
 *
 * Layout for all authenticated/public non-auth pages.
 * This is where Header and Footer live.
 *
 * Move these pages into app/(main)/:
 *   vault/, watch/, kyc/, admin/, settings/, and any public pages like /
 */

import { ThemeProvider } from '@/components/ThemeProvider';
import { TooltipProvider } from '@/components/ui/tooltip';
import QueryProvider from '@/providers/QueryProvider';
import SessionProvider, { SessionGate } from '@/providers/SessionProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <QueryProvider>
            <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
                <SessionProvider>
                    <TooltipProvider>
                        <Header />
                        <main>
                            <SessionGate>{children}</SessionGate>
                        </main>
                        <Footer />
                    </TooltipProvider>
                </SessionProvider>
            </ThemeProvider>
        </QueryProvider>
    );
}
