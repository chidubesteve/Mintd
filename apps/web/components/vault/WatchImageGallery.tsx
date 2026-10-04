'use client';

import { useState } from 'react';
import type { WatchImage } from '@/services/Watch.service';
import { ImageWithSkeleton } from '@/components/ui/image-with-skeleton';
import { WatchArtworkBadge } from './WatchArtworkBadge';

export function WatchImageGallery({ images, name, catalogueStatus }: {
    images: WatchImage[]; name: string; catalogueStatus?: string;
}) {
    const [selectedUrl, setSelectedUrl] = useState<string>();
    const selected = images.find((image) => image.url === selectedUrl)
        ?? images.find((image) => image.isPrimary) ?? images[0];
    return (
        <div>
            <div className='watch-studio relative aspect-square rounded-2xl overflow-hidden border border-border shadow-card'>
                {/* Feather the display edges only; stored originals and derivative URLs stay intact. */}
                <div className='absolute inset-8 md:inset-12'>
                    <ImageWithSkeleton key={selected?.url} src={selected?.url}
                        alt={`${name}, ${selected?.viewType ?? 'front'} view`} fill
                        sizes='(max-width: 768px) 100vw, 50vw' className='watch-photo-soft object-contain' unoptimized />
                </div>
                <WatchArtworkBadge status={catalogueStatus} />
            </div>
            {images.length > 1 && (
                <div className='grid grid-cols-4 gap-3 mt-3' aria-label='Watch views'>
                    {images.map((image, index) => (
                        <button key={`${image.url}-${index}`} type='button'
                            onClick={() => setSelectedUrl(image.url)}
                            aria-label={`Show ${image.viewType} view`} aria-pressed={selected === image}
                            className={`watch-studio text-foreground rounded-lg border-2 overflow-hidden focus-visible:outline-2 focus-visible:outline-accent ${selected === image ? 'border-accent' : 'border-transparent'}`}>
                            <div className='relative aspect-square'>
                                <ImageWithSkeleton src={image.url} alt={`${name}, ${image.viewType} view`}
                                    fill sizes='120px' className='object-contain p-3' unoptimized />
                            </div>
                            <span className='block pb-2 pt-1 text-xs font-medium capitalize text-white dark:text-black'>{image.viewType}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
