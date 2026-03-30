'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import iconDark from '@/public/logo-mixed-green.webp';
import iconLight from '@/public/logo-mixed.webp';

export default function InvalidTokenPage() {
    const { resolvedTheme } = useTheme();
    const iconSrc = resolvedTheme === 'light' ? iconDark : iconLight;
    const searchParams = useSearchParams();
    // we would get an error code of `EXPIRED_TOKEN` from the backend if the link was expired
    const isExpired = searchParams.get('reason') === 'expired';

    return (
        <div className='min-h-screen flex items-center justify-center bg-muted/30 p-6'>
            <div className='w-full max-w-md'>
                <div className='text-center mb-8'>
                    <Link href='/'>
                        <Image
                            src={iconSrc}
                            alt='Mintd'
                            className='h-10 mx-auto mb-6 w-auto'
                        />
                    </Link>
                    <h1 className='text-2xl font-bold text-foreground'>
                        {isExpired ? 'Link expired' : 'Invalid link'}
                    </h1>
                </div>

                <div className='bg-card rounded-2xl p-8 shadow-luxury border border-border space-y-6'>
                    <div className='text-center space-y-3'>
                        <div className='w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto'>
                            <AlertTriangle className='w-7 h-7 text-destructive' />
                        </div>
                        <p className='text-sm text-muted-foreground'>
                            {isExpired
                                ? 'This verification link has expired. Links are valid for 1 hour.'
                                : 'This link is broken or has already been used.'}
                        </p>
                    </div>

                    <Button asChild className='w-full h-11'>
                        <Link href='/auth/register'>Back to sign up</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
