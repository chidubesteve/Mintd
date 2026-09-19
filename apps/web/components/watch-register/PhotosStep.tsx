'use client';

import { useEffect, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Sparkles } from 'lucide-react';
import {
    VIEW_TYPES,
    ViewType,
    WatchRegistrationValues,
} from '@/app/(main)/watch/register/validation/schema';
import ImageUploadSlot from './ImageUploadSlot';

const VIEW_LABELS: Record<ViewType, string> = {
    front: 'Front',
    back: 'Back / Case back',
    left: 'Left side',
    right: 'Right side',
};

/**
 * PhotosStep
 *
 * Manages the 4 view slots as local state (keyed by view type) and syncs
 * them into the form's `images` field array on every change. Only "front"
 * is required — the zod schema needs at least 1 image — but we nudge for
 * all 4 since that's what the AI image pipeline downstream uses to produce
 * the consistent, polished card image shown across the platform.
 */
const PhotosStep = ({
    form,
}: {
    form: UseFormReturn<WatchRegistrationValues>;
}) => {
    const { setValue, watch, formState } = form;
    const existingImages = watch('images');

    const [slots, setSlots] = useState<Record<ViewType, File | null>>(() => {
        const initial: Record<ViewType, File | null> = {
            front: null,
            back: null,
            left: null,
            right: null,
        };
        existingImages?.forEach((img) => {
            initial[img.viewType] = img.file;
        });
        return initial;
    });

    const [primary, setPrimary] = useState<ViewType | null>(
        () => existingImages?.find((img) => img.isPrimary)?.viewType ?? null,
    );

    // Object URLs for previews — created/revoked inside the effect (not
    // during render) so React 18 Strict Mode's dev-only mount->cleanup->
    // mount cycle doesn't revoke a URL before it's painted. That matters
    // here because this step can remount with files already in `slots`
    // (e.g. navigating back from Review), not just on first upload.
    const [previewUrls, setPreviewUrls] = useState<
        Partial<Record<ViewType, string>>
    >({});

    useEffect(() => {
        const urls: Partial<Record<ViewType, string>> = {};
        VIEW_TYPES.forEach((v) => {
            const f = slots[v];
            if (f) urls[v] = URL.createObjectURL(f);
        });
        setPreviewUrls(urls);
        return () => {
            Object.values(urls).forEach((url) => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [slots]);

    // Push local state into the form whenever it changes.
    useEffect(() => {
        const filled = VIEW_TYPES.filter((v) => slots[v]);
        const effectivePrimary = primary && slots[primary] ? primary : filled[0];

        const images = filled.map((viewType) => ({
            file: slots[viewType]!,
            viewType,
            isPrimary: viewType === effectivePrimary,
        }));

        setValue('images', images, { shouldValidate: true });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slots, primary]);

    function handleSelect(view: ViewType, file: File) {
        setSlots((prev) => ({ ...prev, [view]: file }));
        setPrimary((prev) => prev ?? view);
    }

    function handleRemove(view: ViewType) {
        setSlots((prev) => ({ ...prev, [view]: null }));
        setPrimary((prev) => (prev === view ? null : prev));
    }

    const filledCount = VIEW_TYPES.filter((v) => slots[v]).length;

    return (
        <div className='space-y-5'>
            <div className='flex items-start gap-3 p-4 rounded-xl border border-accent/20 bg-accent/5'>
                <Sparkles className='w-4 h-4 text-accent mt-0.5 shrink-0' />
                <p className='text-sm text-muted-foreground'>
                    We&apos;ll lightly retouch these — consistent background
                    and framing — so every watch looks equally polished
                    across Mintd. Your original photos are always kept too.
                </p>
            </div>

            <div className='grid grid-cols-2 gap-4'>
                {VIEW_TYPES.map((view) => (
                    <ImageUploadSlot
                        key={view}
                        label={VIEW_LABELS[view]}
                        required={view === 'front'}
                        file={slots[view]}
                        previewUrl={previewUrls[view] ?? null}
                        isPrimary={primary === view}
                        canSetPrimary={filledCount > 1}
                        onSelect={(f) => handleSelect(view, f)}
                        onRemove={() => handleRemove(view)}
                        onSetPrimary={() => setPrimary(view)}
                    />
                ))}
            </div>

            <p className='text-xs text-muted-foreground'>
                JPEG, PNG, WEBP or HEIC, up to 2MB each. At least the front
                view is required — the rest help with verification and
                provenance.
            </p>

            {formState.errors.images && (
                <p className='text-xs text-destructive'>
                    {formState.errors.images.message as string}
                </p>
            )}
        </div>
    );
};

export default PhotosStep;
