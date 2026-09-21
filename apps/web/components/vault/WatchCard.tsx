'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import type { WatchListItem } from '@/services/Watch.service';
import logoWhite from '@/public/logo-white.webp';

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
    const isPendingReview = watch.catalog?.status === 'PENDING_REVIEW';
    const isMinted = watch.status === 'CERTIFIED';
    const imageUrl = watch.images?.url;

    return (
        <Link
            href={`/watch/${watch._id}`}
            className='group block rounded-xl border border-border bg-card overflow-hidden shadow-subtle transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury hover:border-accent/30'
        >
            {/* Image */}
            <div className='relative aspect-4/3 bg-muted overflow-hidden'>
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={`${watch.brand} ${watch.model}`}
                        fill
                        sizes='(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw'
                        className='object-cover transition-transform duration-500 group-hover:scale-105'
                        unoptimized
                    />
                ) : (
                    <div className='w-full h-full flex items-center justify-center text-muted-foreground/40 text-xs'>
                        Image processing…
                    </div>
                )}

                <div className='absolute inset-0 bg-linear-to-t from-card/70 via-transparent to-transparent' />

                {/* Status pill */}
                <Badge
                    variant={statusVariant(watch.status)}
                    className='absolute top-3 left-3 shadow-md'
                >
                    {isMinted && <Sparkles className='w-3 h-3' />}
                    {STATUS_LABEL[watch.status] ?? watch.status}
                </Badge>

                {/* Verified mark */}
                {isVerified && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            {/* Fixed dark chip regardless of theme, so the silver/white Mintd
                                mark stays legible whether the page is in light or dark mode —
                                this is the "consistent branded look" cue across every card. */}
                            <div className='absolute top-3 right-3 bg-mintd-forest/85 backdrop-blur-md rounded-full p-1.5 shadow-md'>
                                <Image
                                    src={logoWhite}
                                    alt='Verified by Mintd'
                                    width={14}
                                    height={14}
                                    className='opacity-95'
                                />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='max-w-56'>
                                This watch has been verified as an existing
                                type of wristwatch in our catalogue.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                )}

                {isPendingReview && !isVerified && (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div className='absolute top-3 right-3 bg-background/80 backdrop-blur-md rounded-full p-1.5 shadow-md border border-border/50'>
                                <Clock className='w-3.5 h-3.5 text-muted-foreground' />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className='max-w-56'>
                                Pending admin review before it can be
                                verified and minted.
                            </p>
                        </TooltipContent>
                    </Tooltip>
                )}
            </div>

            {/* Details */}
            <div className='p-4'>
                <h3 className='text-sm font-bold text-foreground truncate'>
                    {watch.brand} {watch.model}
                </h3>
                <p className='text-xs text-muted-foreground mt-0.5 font-mono truncate'>
                    {watch.reference ? `Ref. ${watch.reference}` : watch.assetId}
                </p>

                <div className='flex items-center justify-between mt-3 pt-3 border-t border-border/70'>
                    <span className='text-[11px] text-muted-foreground'>
                        Owned since{' '}
                        {new Date(watch.createdAt).toLocaleDateString('en-GB', {
                            month: 'short',
                            year: 'numeric',
                        })}
                    </span>
                    {isVerified && (
                        <CheckCircle2 className='w-3.5 h-3.5 text-accent' />
                    )}
                </div>
            </div>
        </Link>
    );
};

export default WatchCard;
