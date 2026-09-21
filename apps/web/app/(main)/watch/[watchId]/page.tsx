'use client';

/**
 * Watch detail page — intentionally a lightweight first pass.
 *
 * The vault card grid needs somewhere to link to, so this exists rather
 * than leaving a dead link. It covers the basics the PRD calls out
 * (images, catalogue verification, ownership history, a mint CTA) but the
 * fuller certificate/QR/provenance experience described for this page is
 * scoped as a follow-up once the register flow and minting are wired up.
 */

import { use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, Sparkles, ShieldCheck, Info } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CopyButton } from '@/components/ui/copy-button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useWatchDetails } from '@/hooks/queries/useVault';

interface WatchImage {
    url: string;
    viewType: string;
    isPrimary: boolean;
}

interface WatchDetail {
    _id: string;
    assetId: string;
    brand: string;
    model: string;
    reference?: string;
    serialNumber: string;
    description?: string;
    status: string;
    isCustomBrand: boolean;
    catalog: { matched: boolean; status: 'MATCHED' | 'PENDING_REVIEW' | 'REJECTED' };
    images: WatchImage[];
    createdAt: string;
}

interface OwnershipEvent {
    _id: string;
    eventType: string;
    timestamp: string;
    notes?: string;
    currentOwner?: { fName?: string; lName?: string };
}

const WatchDetailPage = ({
    params,
}: {
    params: Promise<{ watchId: string }>;
}) => {
    const { watchId } = use(params);
    const { data, isLoading, isError } = useWatchDetails(watchId);
    const payload = data as
        | { watch: WatchDetail; ownershipHistory: OwnershipEvent[] }
        | undefined;

    if (isLoading) {
        return (
            <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24'>
                <div className='animate-pulse space-y-6'>
                    <div className='h-8 w-48 bg-muted rounded' />
                    <div className='grid md:grid-cols-2 gap-8'>
                        <div className='aspect-square bg-muted rounded-2xl' />
                        <div className='space-y-3'>
                            <div className='h-5 w-2/3 bg-muted rounded' />
                            <div className='h-4 w-1/2 bg-muted rounded' />
                            <div className='h-4 w-full bg-muted rounded' />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isError || !payload) {
        return (
            <div className='container mx-auto px-6 pt-32 pb-24 text-center'>
                <p className='text-muted-foreground'>
                    We couldn&apos;t find that watch.
                </p>
                <Link
                    href='/vault'
                    className='text-accent hover:underline text-sm inline-flex items-center gap-1 mt-3'
                >
                    <ArrowLeft className='w-3.5 h-3.5' /> Back to vault
                </Link>
            </div>
        );
    }

    const { watch, ownershipHistory } = payload;
    const primaryImage =
        watch.images?.find((img) => img.isPrimary) ?? watch.images?.[0];
    const isVerified = watch.catalog?.status === 'MATCHED';
    const isMinted = watch.status === 'CERTIFIED';

    return (
        <div className='container mx-auto px-6 xl:max-w-[calc(100%-6rem)] pt-28 md:pt-32 pb-24'>
            <Link
                href='/vault'
                className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6'
            >
                <ArrowLeft className='w-3.5 h-3.5' /> Back to vault
            </Link>

            <div className='grid md:grid-cols-2 gap-10 lg:gap-14'>
                {/* Image */}
                <div className='relative aspect-square rounded-2xl overflow-hidden bg-muted border border-border shadow-card'>
                    {primaryImage ? (
                        <Image
                            src={primaryImage.url}
                            alt={`${watch.brand} ${watch.model}`}
                            fill
                            className='object-cover'
                            unoptimized
                        />
                    ) : (
                        <div className='w-full h-full flex items-center justify-center text-muted-foreground/40 text-sm'>
                            Image processing…
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <div className='flex items-center gap-2 flex-wrap mb-3'>
                        <Badge variant={isMinted ? 'accent' : 'outline'}>
                            {isMinted && <Sparkles className='w-3 h-3' />}
                            {watch.status.replaceAll('_', ' ')}
                        </Badge>
                        {isVerified ? (
                            <Badge variant='secondary'>
                                <CheckCircle2 className='w-3 h-3' /> Verified watch
                            </Badge>
                        ) : (
                            <Badge variant='muted'>
                                <Clock className='w-3 h-3' /> Pending review
                            </Badge>
                        )}
                    </div>

                    <h1 className='text-2xl md:text-3xl font-bold text-foreground'>
                        {watch.brand} {watch.model}
                    </h1>
                    <p className='text-sm text-muted-foreground font-mono mt-1 inline-flex items-center gap-1.5'>
                        {watch.reference ? `Ref. ${watch.reference} · ` : ''}
                        {watch.assetId}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Info className='w-3.5 h-3.5 cursor-help' />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className='max-w-56'>
                                    Your asset ID. Use this to identify this
                                    watch on Mintd.
                                </p>
                            </TooltipContent>
                        </Tooltip>
                        <CopyButton value={watch.assetId} label='Copy asset ID' />
                    </p>

                    {watch.description && (
                        <p className='text-sm text-foreground/80 mt-4 leading-relaxed'>
                            {watch.description}
                        </p>
                    )}

                    <dl className='grid grid-cols-2 gap-4 mt-6 text-sm'>
                        <div>
                            <dt className='text-muted-foreground'>Serial number</dt>
                            <dd className='font-mono text-foreground mt-0.5'>
                                {watch.serialNumber}
                            </dd>
                        </div>
                        <div>
                            <dt className='text-muted-foreground'>Registered</dt>
                            <dd className='text-foreground mt-0.5'>
                                {new Date(watch.createdAt).toLocaleDateString('en-GB', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                })}
                            </dd>
                        </div>
                    </dl>

                    {/* Mint CTA */}
                    <div className='mt-8 p-5 rounded-xl border border-accent/20 bg-accent/5'>
                        {isMinted ? (
                            <div className='flex items-center gap-3'>
                                <ShieldCheck className='w-5 h-5 text-accent shrink-0' />
                                <p className='text-sm text-foreground'>
                                    This watch has a live NFT certificate on
                                    Polygon — its permanent, tamper-proof
                                    proof of ownership.
                                </p>
                            </div>
                        ) : (
                            <>
                                <p className='text-sm text-foreground font-medium mb-1'>
                                    Seal this ownership on the blockchain
                                </p>
                                <p className='text-sm text-muted-foreground mb-4'>
                                    Get a permanent, tamper-proof certificate
                                    for this watch — no wallet setup, no gas
                                    fees, we handle it for you.
                                </p>
                                <Button
                                    className='bg-accent text-accent-foreground hover:bg-accent/90'
                                    disabled
                                >
                                    Generate NFT certificate
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Ownership history */}
                    <div className='mt-8'>
                        <h2 className='text-sm font-semibold text-foreground mb-3'>
                            Ownership history
                        </h2>
                        <ol className='space-y-3'>
                            {(ownershipHistory ?? []).map((event) => (
                                <li
                                    key={event._id}
                                    className='flex items-start gap-3 text-sm'
                                >
                                    <div className='w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0' />
                                    <div>
                                        <p className='text-foreground'>
                                            {event.eventType === 'INITIAL_REGISTRATION'
                                                ? 'Registered on the platform'
                                                : 'Ownership transferred'}
                                        </p>
                                        <p className='text-xs text-muted-foreground'>
                                            {new Date(event.timestamp).toLocaleDateString(
                                                'en-GB',
                                                {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                },
                                            )}
                                        </p>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchDetailPage;
