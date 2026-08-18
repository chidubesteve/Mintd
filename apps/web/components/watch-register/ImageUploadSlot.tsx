'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Star, Upload, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    ACCEPTED_IMAGE_TYPES,
    MAX_FILE_SIZE,
} from '@/app/(main)/watch/register/validation/schema';

const ImageUploadSlot = ({
    label,
    required,
    file,
    previewUrl,
    isPrimary,
    canSetPrimary,
    onSelect,
    onRemove,
    onSetPrimary,
}: {
    label: string;
    required?: boolean;
    file: File | null;
    previewUrl: string | null;
    isPrimary: boolean;
    canSetPrimary: boolean;
    onSelect: (file: File) => void;
    onRemove: () => void;
    onSetPrimary: () => void;
}) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragActive, setDragActive] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function validateAndSelect(f: File) {
        if (!ACCEPTED_IMAGE_TYPES.includes(f.type)) {
            setError('Unsupported file type');
            return;
        }
        if (f.size > MAX_FILE_SIZE) {
            setError('File must be under 2MB');
            return;
        }
        setError(null);
        onSelect(f);
    }

    return (
        <div
            className={cn(
                'relative aspect-square rounded-xl border-2 border-dashed overflow-hidden transition-colors',
                dragActive
                    ? 'border-accent bg-accent/5'
                    : file
                      ? 'border-border'
                      : 'border-border hover:border-accent/40',
            )}
            onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                const f = e.dataTransfer.files?.[0];
                if (f) validateAndSelect(f);
            }}
        >
            <input
                ref={inputRef}
                type='file'
                accept={ACCEPTED_IMAGE_TYPES.join(',')}
                className='hidden'
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) validateAndSelect(f);
                    e.target.value = '';
                }}
            />

            {file && previewUrl ? (
                <>
                    <Image
                        src={previewUrl}
                        alt={label}
                        fill
                        className='object-cover'
                        unoptimized
                    />
                    <div className='absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent' />

                    <button
                        type='button'
                        onClick={onRemove}
                        aria-label={`Remove ${label} photo`}
                        className='absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors'
                    >
                        <X className='w-3.5 h-3.5' />
                    </button>

                    <div className='absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2'>
                        <span className='text-xs font-medium text-white drop-shadow'>
                            {label}
                        </span>
                        {isPrimary ? (
                            <span className='inline-flex items-center gap-1 text-[11px] font-medium bg-accent text-accent-foreground px-2 py-0.5 rounded-full shadow'>
                                <Star className='w-3 h-3 fill-current' />
                                Primary
                            </span>
                        ) : (
                            canSetPrimary && (
                                <button
                                    type='button'
                                    onClick={onSetPrimary}
                                    className='text-[11px] font-medium bg-white/90 hover:bg-white text-foreground px-2 py-0.5 rounded-full shadow transition-colors'
                                >
                                    Set as primary
                                </button>
                            )
                        )}
                    </div>
                </>
            ) : (
                <button
                    type='button'
                    onClick={() => inputRef.current?.click()}
                    className='w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-accent transition-colors p-3'
                >
                    <Upload className='w-5 h-5' />
                    <span className='text-xs font-medium text-center'>
                        {label}
                        {required && (
                            <span className='text-accent'> *</span>
                        )}
                    </span>
                    <span className='text-[10px] text-muted-foreground/70 text-center'>
                        Click or drag a photo
                    </span>
                </button>
            )}

            {error && (
                <p className='absolute -bottom-5 left-0 text-[11px] text-destructive'>
                    {error}
                </p>
            )}
        </div>
    );
};

export default ImageUploadSlot;
