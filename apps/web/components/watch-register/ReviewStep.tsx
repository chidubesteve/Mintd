'use client';

import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, Clock, PenLine } from 'lucide-react';
import { WatchRegistrationValues } from '@/app/(main)/watch/register/validation/schema';
import { useCatalogueReferences } from '@/hooks/queries/useCatalogue';
import { useObjectUrl } from '@/hooks/useObjectUrl';

const Thumb = ({
    file,
    alt,
    className,
}: {
    file: File;
    alt: string;
    className?: string;
}) => {
    const url = useObjectUrl(file);
    if (!url) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={url} alt={alt} className={className} />;
};

const Row = ({ label, value }: { label: string; value?: string }) => {
    if (!value) return null;
    return (
        <div className='flex justify-between gap-4 py-2.5 border-b border-border/60 last:border-0'>
            <dt className='text-sm text-muted-foreground shrink-0'>{label}</dt>
            <dd className='text-sm text-foreground font-medium text-right'>
                {value}
            </dd>
        </div>
    );
};

const ReviewStep = ({
    form,
    onEditStep,
}: {
    form: UseFormReturn<WatchRegistrationValues>;
    onEditStep: (step: number) => void;
}) => {
    const values = form.watch();
    const { data: references } = useCatalogueReferences(
        values.brand,
        values.watchModel,
    );
    const isVerified =
        !values.isCustomBrand &&
        !!values.referenceNo &&
        (references ?? []).some(
            (r) =>
                r.reference.toLowerCase() ===
                values.referenceNo.trim().toLowerCase(),
        );

    const primaryImage = values.images?.find((img) => img.isPrimary);

    return (
        <div className='space-y-6'>
            <div
                className={
                    values.isCustomBrand
                        ? 'flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40'
                        : isVerified
                          ? 'flex items-start gap-3 p-4 rounded-xl border border-accent/20 bg-accent/5'
                          : 'flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40'
                }
            >
                {values.isCustomBrand || !isVerified ? (
                    <Clock className='w-4 h-4 text-muted-foreground mt-0.5 shrink-0' />
                ) : (
                    <CheckCircle2 className='w-4 h-4 text-accent mt-0.5 shrink-0' />
                )}
                <p className='text-sm text-muted-foreground'>
                    {values.isCustomBrand
                        ? 'This is a custom submission — an admin will review it before it appears as verified in your vault.'
                        : isVerified
                          ? 'This watch matches our catalogue and will appear as verified immediately.'
                          : "We couldn't match this exact reference — it'll be sent for a quick admin review after you submit."}
                </p>
            </div>

            <div className='flex gap-4'>
                {primaryImage && (
                    <div className='w-24 h-24 rounded-lg overflow-hidden bg-muted shrink-0 border border-border'>
                        <Thumb
                            file={primaryImage.file}
                            alt='Primary'
                            className='w-full h-full object-cover'
                        />
                    </div>
                )}
                <div className='flex-1 min-w-0'>
                    <div className='flex items-center justify-between'>
                        <h3 className='font-bold text-foreground'>
                            {values.brand} {values.watchModel}
                        </h3>
                        <button
                            type='button'
                            onClick={() => onEditStep(0)}
                            className='text-xs text-accent hover:underline inline-flex items-center gap-1 shrink-0'
                        >
                            <PenLine className='w-3 h-3' /> Edit
                        </button>
                    </div>
                    {values.referenceNo && (
                        <p className='text-sm text-muted-foreground font-mono'>
                            Ref. {values.referenceNo}
                        </p>
                    )}
                    {values.description && (
                        <p className='text-xs text-muted-foreground mt-1 line-clamp-2'>
                            {values.description}
                        </p>
                    )}
                </div>
            </div>

            <div className='rounded-xl border border-border p-4'>
                <div className='flex items-center justify-between mb-1'>
                    <h4 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        Details
                    </h4>
                    <button
                        type='button'
                        onClick={() => onEditStep(1)}
                        className='text-xs text-accent hover:underline inline-flex items-center gap-1'
                    >
                        <PenLine className='w-3 h-3' /> Edit
                    </button>
                </div>
                <dl>
                    <Row label='Serial number' value={values.serialNumber} />
                    <Row label='Purchase date' value={values.purchaseDate} />
                </dl>
            </div>

            <div className='rounded-xl border border-border p-4'>
                <div className='flex items-center justify-between mb-3'>
                    <h4 className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                        Photos ({values.images?.length ?? 0})
                    </h4>
                    <button
                        type='button'
                        onClick={() => onEditStep(2)}
                        className='text-xs text-accent hover:underline inline-flex items-center gap-1'
                    >
                        <PenLine className='w-3 h-3' /> Edit
                    </button>
                </div>
                <div className='flex gap-2'>
                    {values.images?.map((img) => (
                        <div
                            key={img.viewType}
                            className='w-14 h-14 rounded-md overflow-hidden bg-muted border border-border'
                        >
                            <Thumb
                                file={img.file}
                                alt={img.viewType}
                                className='w-full h-full object-cover'
                            />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewStep;
