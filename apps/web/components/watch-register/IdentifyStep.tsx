'use client';

import { UseFormReturn } from 'react-hook-form';
import { CheckCircle2, PenLine, Search as SearchIcon } from 'lucide-react';

import { WatchRegistrationValues } from '@/app/(main)/watch/register/validation/schema';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import CatalogueSelect from './CatalogueSelect';
import {
    useCatalogueBrands,
    useCatalogueModels,
    useCatalogueReferences,
} from '@/hooks/queries/useCatalogue';

/**
 * IdentifyStep
 *
 * This is the step that does the actual job of the catalogue: confirm the
 * user is registering a real, supported model before we spend an image
 * pipeline and admin attention on it. Brand is a closed pick from our
 * supported list; model and reference are catalogue-assisted free text —
 * if it's a reference we don't have on file, the user can still carry on
 * and it lands with the admin as PENDING_REVIEW instead of getting
 * silently rejected.
 */
const IdentifyStep = ({
    form,
}: {
    form: UseFormReturn<WatchRegistrationValues>;
}) => {
    const { watch, setValue, register, formState } = form;
    const brand = watch('brand');
    const watchModel = watch('watchModel');
    const referenceNo = watch('referenceNo');
    const isCustomBrand = watch('isCustomBrand');

    const { data: brands, isLoading: brandsLoading } = useCatalogueBrands();
    const { data: models, isLoading: modelsLoading } = useCatalogueModels(brand);
    const { data: references, isLoading: refsLoading } = useCatalogueReferences(
        brand,
        watchModel,
    );

    const brandOptions = (brands ?? []).map((b) => ({ value: b, label: b }));
    const modelOptions = (models ?? []).map((m) => ({ value: m, label: m }));
    const referenceOptions = (references ?? []).map((r) => ({
        value: r.reference,
        label: r.reference,
        sublabel: r.description,
    }));

    const isReferenceVerified =
        !!referenceNo &&
        (references ?? []).some(
            (r) => r.reference.toLowerCase() === referenceNo.trim().toLowerCase(),
        );

    function switchToManual(prefillBrand = '') {
        setValue('isCustomBrand', true);
        setValue('brand', prefillBrand);
        setValue('watchModel', '');
        setValue('referenceNo', '');
    }

    function switchToCatalogue() {
        setValue('isCustomBrand', false);
        setValue('brand', '');
        setValue('watchModel', '');
        setValue('referenceNo', '');
    }

    if (isCustomBrand) {
        return (
            <div className='space-y-6'>
                <div className='flex items-start gap-3 p-4 rounded-xl border border-border bg-muted/40'>
                    <PenLine className='w-4 h-4 text-muted-foreground mt-0.5 shrink-0' />
                    <p className='text-sm text-muted-foreground'>
                        This watch isn&apos;t in our verified catalogue yet.
                        An admin will manually review the details below
                        before it can be minted —{' '}
                        <button
                            type='button'
                            onClick={switchToCatalogue}
                            className='text-accent hover:underline font-medium'
                        >
                            search our catalogue instead
                        </button>
                        .
                    </p>
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                        Brand
                    </label>
                    <Input
                        placeholder='e.g. Rolex'
                        className='h-12'
                        {...register('brand')}
                    />
                    {formState.errors.brand && (
                        <p className='text-xs text-destructive'>
                            {formState.errors.brand.message}
                        </p>
                    )}
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                        Model
                    </label>
                    <Input
                        placeholder='e.g. Submariner'
                        className='h-12'
                        {...register('watchModel')}
                    />
                    {formState.errors.watchModel && (
                        <p className='text-xs text-destructive'>
                            {formState.errors.watchModel.message}
                        </p>
                    )}
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                        Reference number{' '}
                        <span className='text-muted-foreground font-normal'>
                            (optional)
                        </span>
                    </label>
                    <Input
                        placeholder='e.g. 16610'
                        className='h-12'
                        {...register('referenceNo')}
                    />
                </div>

                <div className='space-y-2'>
                    <label className='text-sm font-medium text-foreground'>
                        Description
                    </label>
                    <Textarea
                        placeholder='Anything that helps us identify this watch; dial colour, bracelet, notable features…'
                        rows={3}
                        {...register('description')}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className='space-y-6'>
            <CatalogueSelect
                mode='strict'
                label='Brand'
                placeholder='Select a brand'
                searchPlaceholder='Search brands…'
                options={brandOptions}
                value={brand}
                isLoading={brandsLoading}
                onChange={(v) => {
                    setValue('brand', v);
                    setValue('watchModel', '');
                    setValue('referenceNo', '');
                }}
                notFoundSlot={(query) => (
                    <div className='text-center space-y-2'>
                        <p className='text-sm text-muted-foreground'>
                            We couldn&apos;t find this brand in our database.
                        </p>
                        <button
                            type='button'
                            onClick={() => switchToManual(query.trim())}
                            className='text-sm text-accent hover:underline font-medium inline-flex items-center gap-1'
                        >
                            <PenLine className='w-3.5 h-3.5' />
                            Add it manually
                        </button>
                    </div>
                )}
            />
            {formState.errors.brand && (
                <p className='text-xs text-destructive -mt-4'>
                    {formState.errors.brand.message}
                </p>
            )}

            <CatalogueSelect
                label='Model'
                placeholder={
                    brand ? 'e.g. Submariner' : 'Choose a brand first'
                }
                options={modelOptions}
                value={watchModel}
                isLoading={modelsLoading}
                disabled={!brand}
                onChange={(v) => {
                    setValue('watchModel', v);
                    setValue('referenceNo', '');
                }}
            />
            {formState.errors.watchModel && (
                <p className='text-xs text-destructive -mt-4'>
                    {formState.errors.watchModel.message}
                </p>
            )}

            <div className='space-y-2'>
                <CatalogueSelect
                    label='Reference number'
                    placeholder={
                        watchModel ? 'e.g. 16610LN' : 'Choose a model first'
                    }
                    options={referenceOptions}
                    value={referenceNo}
                    isLoading={refsLoading}
                    disabled={!watchModel}
                    onChange={(v) => {
                        setValue('referenceNo', v);
                        const match = (references ?? []).find(
                            (r) =>
                                r.reference.toLowerCase() === v.toLowerCase(),
                        );
                        // Auto-fill description from the catalogue if the user
                        // hasn't already written their own.
                        if (match?.description && !watch('description')) {
                            setValue('description', match.description);
                        }
                    }}
                />

                {referenceNo && (
                    <div className='flex items-center gap-1.5 text-xs px-0.5'>
                        {isReferenceVerified ? (
                            <>
                                <CheckCircle2 className='w-3.5 h-3.5 text-accent' />
                                <span className='text-accent font-medium'>
                                    Verified — this exact reference is in our
                                    catalogue.
                                </span>
                            </>
                        ) : (
                            <>
                                <SearchIcon className='w-3.5 h-3.5 text-muted-foreground' />
                                <span className='text-muted-foreground'>
                                    We couldn&apos;t match this exact
                                    reference. it&apos;ll be sent for a
                                    quick admin review after you submit.
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                    Description{' '}
                    <span className='text-muted-foreground font-normal'>
                        (optional)
                    </span>
                </label>
                <Textarea
                    placeholder='Dial colour, bracelet, box & papers, notable features…'
                    rows={3}
                    {...register('description')}
                />
            </div>
        </div>
    );
};

export default IdentifyStep;
