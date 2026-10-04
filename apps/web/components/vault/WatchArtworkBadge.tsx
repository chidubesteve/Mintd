'use client';

import Image from 'next/image';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const artwork = {
    MATCHED: {
        path: 'catalogue_matched_mintd.png',
        label: 'Catalogue matched',
        description: 'This model matches our supported catalogue. This does not yet certify this individual watch or its ownership.',
    },
    PENDING_REVIEW: {
        path: 'Pending_review_mintd.png',
        label: 'Pending catalogue review',
        description: 'This model needs admin review before it can proceed to verification and minting.',
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
                    className='absolute top-3 right-3 z-10 block size-12 cursor-help rounded-lg focus-visible:outline-2 focus-visible:outline-accent'>
                    <Image src={`https://ik.imagekit.io/uw2j2cj9gp/${badge.path}?tr=w-144,f-webp`}
                        alt={badge.label} fill sizes='48px' unoptimized className='object-contain drop-shadow-md' />
                </span>
            </TooltipTrigger>
            <TooltipContent><p className='max-w-64'>{badge.description}</p></TooltipContent>
        </Tooltip>
    );
}
