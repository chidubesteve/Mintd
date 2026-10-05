'use client';

import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const artwork = {
    MATCHED: {
        path: 'catalogue_matched_mintd.png',
        label: 'Catalogue matched',
        description: 'This watch model has been verified against our catalogue.',
    },
    PENDING_REVIEW: {
        path: 'Pending_review_mintd.png',
        label: 'Pending catalogue review',
        description: 'This watch is pending admin review before it can be marked as verified.',
    },
} as const;

/** Keep status artwork outside the photo: it stays visible and hoverable at every size. */
export function WatchArtworkBadge({ status }: { status?: string }) {
    const badge = artwork[status as keyof typeof artwork];
    if (!badge) return null;
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <span tabIndex={0} aria-label={badge.label}
                    className='absolute top-3 right-3 z-10 block size-7 cursor-help rounded-lg focus-visible:outline-2 focus-visible:outline-accent'>
                    <Image src={`https://ik.imagekit.io/uw2j2cj9gp/${badge.path}?tr=w-84,f-webp`}
                        alt={badge.label} fill sizes='28px' unoptimized className='object-contain opacity-75 transition-opacity hover:opacity-100' />
                </span>
            </TooltipTrigger>
            <TooltipContent><p className='max-w-64'>{badge.description}</p></TooltipContent>
        </Tooltip>
    );
}
