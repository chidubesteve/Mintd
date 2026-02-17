'use client';
import React from 'react';
import { ThemeProvider } from '@/components/ThemeProvider';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { Toaster } from 'sonner';

type Props = { children: React.ReactNode };

const ClientLayout = ({ children }: Props) => {
    return (
        <ThemeProvider attribute='class' defaultTheme='light' enableSystem>
            <Header />
            <main>{children}</main>
            <Footer />
            <Toaster />
        </ThemeProvider>
    );
};

export default ClientLayout;
