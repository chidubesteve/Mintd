'use client';

import Link from 'next/link';
import { CheckCircle2, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { WatchListItem } from '@/services/Watch.service';
import { WatchArtworkBadge } from './WatchArtworkBadge';
import { CopyButton } from '@/components/ui/copy-button';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';

// "MINTD-<timestamp>-<random>" -> "MINTD-<random>" — the timestamp segment
// is the least useful part to show in a compact space, the random suffix is
// what actually distinguishes one watch's asset ID from another's.
function truncateAssetId(assetId: string) {
    const parts = assetId.split('-');
    return parts.length >= 3 ? `${parts[0]}-${parts[2]}` : assetId;
}

const STATUS_LABEL: Record<string, string> = {
    REGISTERED: 'Registered',
    OWNERSHIP_RECORDED: 'Registered',
    CERTIFICATION_PENDING: 'Minting…',
    CERTIFIED: 'Minted',
    LOCKED: 'Locked',
    SOLD: 'Sold',
};

function statusVariant(status: string): 'accent' | 'outline' | 'muted' | 'warning' {
    if (status === 'CERTIFIED') return 'accent';
    if (status === 'CERTIFICATION_PENDING') return 'warning';
    if (status === 'SOLD' || status === 'LOCKED') return 'muted';
    return 'outline';
}

const WatchCard = ({ watch }: { watch: WatchListItem }) => {
    const isVerified = watch.catalog?.status === 'MATCHED';
    const isMinted = watch.status === 'CERTIFIED';
    const imageUrl = watch.images?.url;

    return (
        <Link
            href={`/watch/${watch._id}`}
            className='group block rounded-xl border border-border bg-card overflow-hidden shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury hover:border-accent/30'
        >
            {/* Image */}
            <div className='watch-studio relative aspect-4/3 overflow-hidden'>
                <ImageWithSkeleton
                    src={imageUrl}
                    alt={`${watch.brand} ${watch.model}`}
                    fill
                    sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                    className='object-contain p-6'
                    unoptimized
                />


                {/* Status pill */}
                <Badge
                    variant={statusVariant(watch.status)}
                    className='absolute top-3 left-3 shadow-md'
                >
                    {isMinted && <Sparkles className='w-3 h-3' />}
                    {STATUS_LABEL[watch.status] ?? watch.status}
                </Badge>

                <WatchArtworkBadge status={watch.catalog?.status} />
            </div>

            {/* Details */}
            <div className='p-4'>
                <h3 className='text-sm font-bold text-foreground truncate'>
                    {watch.brand} {watch.model}
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 font-mono truncate'>
                    {watch.reference ? `Ref. ${watch.reference}` : watch.assetId}
                </p>
                <div className='flex items-center gap-1 mt-1 text-[11px] text-muted-foreground/80 font-mono'>
                    <span className='truncate'>{truncateAssetId(watch.assetId)}</span>
                    <CopyButton value={watch.assetId} label='Copy asset ID' className='p-0.5' />
                </div>

                <div className='flex items-center justify-between mt-3 pt-3 border-t border-border/70'>
                    <span className='text-[11px] text-muted-foreground'>
                        Owned since{' '}
                        {new Date(watch.createdAt).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                    {isVerified && (
                        <CheckCircle2
                            className='w-4 h-4 text-accent'
                            strokeWidth={2.25}
                            fill='currentColor'
                            fillOpacity={0.15}
                        />
                    )}
                </div>
            </div>
        </Link>
    );
};

export default WatchCard;
