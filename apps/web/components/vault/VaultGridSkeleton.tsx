import { Skeleton } from '@/components/ui/skeleton';

const VaultGridSkeleton = () => {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className='rounded-xl border border-border bg-card overflow-hidden'
                >
                    <Skeleton className='aspect-4/3 rounded-none' />
                    <div className='p-4 space-y-2'>
                        <Skeleton className='h-3.5 w-2/3' />
                        <Skeleton className='h-3 w-1/3' />
                        <Skeleton className='mt-3 h-3 w-full' />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VaultGridSkeleton;
