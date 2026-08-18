'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { TbDeviceWatchPlus } from 'react-icons/tb';

import { Button } from '@/components/ui/button';
import { useVault } from '@/hooks/queries/useVault';
import { useAuthStore } from '@/store/Auth.store';

import KycBanner from '@/components/vault/KycBanner';
import EmptyVault from '@/components/vault/EmptyVault';
import WatchCard from '@/components/vault/WatchCard';
import VaultFilters, { VaultFilter } from '@/components/vault/VaultFilters';
import VaultGridSkeleton from '@/components/vault/VaultGridSkeleton';

const VaultPage = () => {
    const { user } = useAuthStore();
    const { data: watches, isLoading, isError, refetch, isFetching } =
        useVault();
    const [filter, setFilter] = useState<VaultFilter>('ALL');

    const counts = useMemo(() => {
        const list = watches ?? [];
        const minted = list.filter((w) => w.status === 'CERTIFIED').length;
        return {
            ALL: list.length,
            MINTED: minted,
            REGISTERED: list.length - minted,
        };
    }, [watches]);

    const filtered = useMemo(() => {
        const list = watches ?? [];
        if (filter === 'MINTED') return list.filter((w) => w.status === 'CERTIFIED');
        if (filter === 'REGISTERED')
            return list.filter((w) => w.status !== 'CERTIFIED');
        return list;
    }, [watches, filter]);

    return (
        <div className='min-h-screen bg-background'>
            <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24'>
                {/* KYC nudge — only relevant for collectors, hidden once approved */}
                <KycBanner kycStatus={user?.kycStatus} />

                <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8'>
                    <div>
                        <h1 className='text-3xl md:text-4xl font-bold text-foreground'>
                            Your <span className='italic text-accent'>Vault</span>
                        </h1>
                        <p className='text-muted-foreground mt-1'>
                            {user?.fName ? `Welcome back, ${user.fName}. ` : ''}
                            Every timepiece you&apos;ve registered lives here.
                        </p>
                    </div>

                    {!isLoading && (watches?.length ?? 0) > 0 && (
                        <Link href='/watch/register'>
                            <Button
                                size='lg'
                                className='bg-accent text-accent-foreground hover:bg-accent/90 h-11 px-6 shrink-0'
                            >
                                <TbDeviceWatchPlus className='size-4.5!' />
                                Register a watch
                            </Button>
                        </Link>
                    )}
                </div>

                {isLoading && <VaultGridSkeleton />}

                {isError && !isLoading && (
                    <div className='flex flex-col items-center justify-center text-center py-24 px-6 rounded-2xl border border-destructive/20 bg-destructive/5'>
                        <AlertTriangle className='w-8 h-8 text-destructive mb-4' />
                        <h2 className='text-lg font-semibold text-foreground mb-1'>
                            We couldn&apos;t load your vault
                        </h2>
                        <p className='text-sm text-muted-foreground max-w-sm mb-6'>
                            Something went wrong while fetching your watches.
                            Please try again.
                        </p>
                        <Button
                            variant='outline'
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCcw className='size-4' />
                            {isFetching ? 'Retrying…' : 'Try again'}
                        </Button>
                    </div>
                )}

                {!isLoading && !isError && (watches?.length ?? 0) === 0 && (
                    <EmptyVault />
                )}

                {!isLoading && !isError && (watches?.length ?? 0) > 0 && (
                    <>
                        <div className='mb-6'>
                            <VaultFilters
                                value={filter}
                                onChange={setFilter}
                                counts={counts}
                            />
                        </div>

                        {filtered.length === 0 ? (
                            <p className='text-sm text-muted-foreground py-16 text-center'>
                                No watches in this view yet.
                            </p>
                        ) : (
                            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                                {filtered.map((watch) => (
                                    <WatchCard key={watch._id} watch={watch} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default VaultPage;
