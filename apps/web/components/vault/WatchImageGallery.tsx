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
                <ImageWithSkeleton key={selected?.url} src={selected?.url}
                    alt={`${name}, ${selected?.viewType ?? 'front'} view`} fill
                    sizes='(max-width: 768px) 100vw, 50vw' className='object-contain p-8 md:p-12' unoptimized />
                <WatchArtworkBadge status={catalogueStatus} />
            </div>
            {images.length > 1 && (
                <div className='grid grid-cols-4 gap-3 mt-3' aria-label='Watch views'>
                    {images.map((image, index) => (
                        <button key={`${image.url}-${index}`} type='button'
                            onClick={() => setSelectedUrl(image.url)}
                            aria-label={`Show ${image.viewType} view`} aria-pressed={selected === image}
                            className={`rounded-lg border-2 overflow-hidden focus-visible:outline-2 focus-visible:outline-accent ${selected === image ? 'border-accent' : 'border-transparent'}`}>
                            <div className='watch-studio relative aspect-square'>
                                <ImageWithSkeleton src={image.url} alt={`${name}, ${image.viewType} view`}
                                    fill sizes='120px' className='object-contain p-2' unoptimized />
                            </div>
                            <span className='block py-1 text-xs capitalize'>{image.viewType}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
