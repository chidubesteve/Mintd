'use client';

import { UseFormReturn } from 'react-hook-form';
import { WatchRegistrationValues } from '@/app/(main)/watch/register/validation/schema';
import { Input } from '@/components/ui/input';

const DetailsStep = ({
    form,
}: {
    form: UseFormReturn<WatchRegistrationValues>;
}) => {
    const { register, formState } = form;

    return (
        <div className='space-y-6'>
            <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                    Serial number
                </label>
                <Input
                    placeholder='e.g. Z123456'
                    className='h-12 font-mono uppercase'
                    {...register('serialNumber')}
                />
                <p className='text-xs text-muted-foreground'>
                    Usually engraved between the lugs or on the case back.
                    This is what ties your watch to its digital certificate,
                    so it must be unique — one Mintd registration per
                    physical watch.
                </p>
                {formState.errors.serialNumber && (
                    <p className='text-xs text-destructive'>
                        {formState.errors.serialNumber.message}
                    </p>
                )}
            </div>

            <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                    Purchase date{' '}
                    <span className='text-muted-foreground font-normal'>
                        (optional)
                    </span>
                </label>
                <Input
                    type='date'
                    className='h-12'
                    max={new Date().toISOString().split('T')[0]}
                    {...register('purchaseDate')}
                />
                <p className='text-xs text-muted-foreground'>
                    Helps establish provenance — you can always add this
                    later.
                </p>
            </div>
        </div>
    );
};

export default DetailsStep;
