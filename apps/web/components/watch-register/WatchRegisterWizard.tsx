'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useRegisterWatch } from '@/hooks/mutations/useWatchMutations';
import {
    watchRegistrationSchema,
    WatchRegistrationValues,
} from '@/app/(main)/watch/register/validation/schema';

import StepHeader from './StepHeader';
import IdentifyStep from './IdentifyStep';
import DetailsStep from './DetailsStep';
import PhotosStep from './PhotosStep';
import ReviewStep from './ReviewStep';

const STEPS = ['Identify', 'Details', 'Photos', 'Review'];

// Which fields must pass validation before we let the user move past a step.
const STEP_FIELDS: (keyof WatchRegistrationValues)[][] = [
    ['brand', 'watchModel'],
    ['serialNumber'],
    ['images'],
    [],
];

const WatchRegisterWizard = () => {
    const [step, setStep] = useState(0);
    const [maxStepReached, setMaxStepReached] = useState(0);
    const { mutate: submitWatch, isPending } = useRegisterWatch();

    const form = useForm<WatchRegistrationValues>({
        resolver: zodResolver(watchRegistrationSchema),
        defaultValues: {
            brand: '',
            watchModel: '',
            serialNumber: '',
            referenceNo: '',
            description: '',
            purchaseDate: '',
            isCustomBrand: false,
            images: [],
        },
        mode: 'onChange',
    });

    async function handleNext() {
        const fields = STEP_FIELDS[step];
        const valid = fields.length ? await form.trigger(fields) : true;
        if (!valid) return;
        const next = Math.min(step + 1, STEPS.length - 1);
        setStep(next);
        setMaxStepReached((m) => Math.max(m, next));
    }

    function handleBack() {
        setStep((s) => Math.max(s - 1, 0));
    }

    function handleStepClick(target: number) {
        // Always safe to jump back to a step already reached — going
        // forward past where the user has actually validated to isn't
        // offered (StepHeader disables those buttons), so no re-validation
        // is needed here.
        if (target <= maxStepReached) setStep(target);
    }

    function onSubmit(values: WatchRegistrationValues) {
        submitWatch(values);
    }

    return (
        <div className='w-full max-w-2xl mx-auto'>
            <StepHeader
                steps={STEPS}
                current={step}
                maxReached={maxStepReached}
                onStepClick={handleStepClick}
            />

            <div className='bg-card rounded-2xl border border-border shadow-luxury p-6 sm:p-8'>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    {step === 0 && <IdentifyStep form={form} />}
                    {step === 1 && <DetailsStep form={form} />}
                    {step === 2 && <PhotosStep form={form} />}
                    {step === 3 && (
                        <ReviewStep form={form} onEditStep={setStep} />
                    )}

                    <div className='flex items-center justify-between mt-8 pt-6 border-t border-border'>
                        <Button
                            type='button'
                            variant='ghost'
                            onClick={handleBack}
                            disabled={step === 0 || isPending}
                        >
                            <ArrowLeft className='size-4' />
                            Back
                        </Button>

                        {step < STEPS.length - 1 ? (
                            <Button
                                type='button'
                                onClick={handleNext}
                                className='bg-accent text-accent-foreground hover:bg-accent/90 px-6'
                            >
                                Continue
                                <ArrowRight className='size-4' />
                            </Button>
                        ) : (
                            <Button
                                type='submit'
                                disabled={isPending}
                                className='bg-accent text-accent-foreground hover:bg-accent/90 px-6 hover:cursor-pointer disabled:cursor-not-allowed disabled:bg-accent/50 disabled:text-accent-foreground/70'
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className='size-4 animate-spin' />
                                        Registering…
                                    </>
                                ) : (
                                    'Register watch'
                                )}
                            </Button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default WatchRegisterWizard;
