import Link  from 'next/link';
import { Button } from '@/components/ui/button';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '404 - Page Not Found',
    description: 'The page you are looking for does not exist.',
};

const GlobalNotFound = () => {

    return (
        <div className='flex min-h-screen items-center justify-center bg-background p-6'>
            <div className='text-center max-w-md'>
                <h1 className='mb-4 text-8xl font-bold text-primary'>404</h1>
                <p className='mb-8 text-2xl font-medium text-foreground'>
                    Page not found
                </p>
                <p className='mb-8 text-muted-foreground'>
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <Link href='/'>
                    <Button size='lg' className='h-12'>
                        Return to Home
                    </Button>
                </Link>
            </div>
        </div>
    );
};

export default GlobalNotFound;
