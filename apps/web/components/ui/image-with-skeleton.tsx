'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';
import { cn } from '@/lib/utils';

/**
 * A fill-mode next/image wrapped with an animated skeleton instead of a
 * text fallback. Covers two cases with the same visual treatment: no src
 * yet (data missing), and a src that's still loading — ImageKit's on-the-fly
 * transforms can take a couple of seconds on first request before they're
 * cached at the edge, and a blank/text placeholder during that window reads
 * as broken rather than "on its way."
 */
export function ImageWithSkeleton({
    src,
    className,
    onLoad,
    onError,
    ...props
}: Omit<ImageProps, 'src'> & { src?: string | null }) {
    // Track the source as well: switching gallery views must reset loading/error UI.
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const [failedSrc, setFailedSrc] = useState<string | null>(null);
    const loaded = !!src && loadedSrc === src;
    const failed = !!src && failedSrc === src;

    return (
        <>
            {(!src || (!loaded && !failed)) && (
                <div className='absolute inset-0 bg-muted animate-pulse' />
            )}
            {failed && <div role='status' className='absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-muted'>Image unavailable</div>}
            {src && (
                // eslint-disable-next-line jsx-a11y/alt-text -- alt comes through ...props; ImageProps makes it a required, type-checked prop on every call site, the linter just can't see through the spread.
                <Image
                    src={src}
                    className={cn(
                        'transition-opacity duration-500',
                        loaded ? 'opacity-100' : 'opacity-0',
                        className,
                    )}
                    onLoad={(e) => {
                        setLoadedSrc(src);
                        setFailedSrc(null);
                        onLoad?.(e);
                    }}
                    onError={(e) => {
                        setFailedSrc(src);
                        onError?.(e);
                    }}
                    {...props}
                />
            )}
        </>
    );
}
