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
    ...props
}: Omit<ImageProps, 'src'> & { src?: string | null }) {
    const [loaded, setLoaded] = useState(false);

    return (
        <>
            {(!src || !loaded) && (
                <div className='absolute inset-0 bg-muted animate-pulse' />
            )}
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
                        setLoaded(true);
                        onLoad?.(e);
                    }}
                    {...props}
                />
            )}
        </>
    );
}
