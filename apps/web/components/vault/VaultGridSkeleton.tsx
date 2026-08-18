const VaultGridSkeleton = () => {
    return (
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className='rounded-xl border border-border bg-card overflow-hidden animate-pulse'
                >
                    <div className='aspect-[4/3] bg-muted' />
                    <div className='p-4 space-y-2'>
                        <div className='h-3.5 w-2/3 rounded bg-muted' />
                        <div className='h-3 w-1/3 rounded bg-muted' />
                        <div className='h-3 w-full rounded bg-muted mt-3' />
                    </div>
                </div>
            ))}
        </div>
    );
};

export default VaultGridSkeleton;
