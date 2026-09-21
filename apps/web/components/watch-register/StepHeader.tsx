'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const StepHeader = ({
    steps,
    current,
    maxReached = current,
    onStepClick,
}: {
    steps: string[];
    current: number;
    /** Highest step index the user has already validated into — steps up
     * to and including this one are safe to jump back to directly. */
    maxReached?: number;
    onStepClick?: (step: number) => void;
}) => {
    return (
        <div className='flex items-center mb-10'>
            {steps.map((label, i) => {
                const isComplete = i < current;
                const isActive = i === current;
                const isReachable = i <= maxReached && i !== current;
                return (
                    <div key={label} className='flex items-center flex-1 last:flex-none'>
                        <div className='flex flex-col items-center gap-2'>
                            <button
                                type='button'
                                disabled={!isReachable}
                                onClick={() => isReachable && onStepClick?.(i)}
                                aria-current={isActive ? 'step' : undefined}
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0',
                                    isReachable && 'cursor-pointer hover:opacity-80',
                                    !isReachable && !isActive && 'cursor-default',
                                    isComplete
                                        ? 'bg-accent text-accent-foreground'
                                        : isActive
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {isComplete ? <Check className='w-4 h-4' /> : i + 1}
                            </button>
                            <span
                                className={cn(
                                    'text-[11px] font-medium whitespace-nowrap hidden sm:block',
                                    isActive
                                        ? 'text-foreground'
                                        : 'text-muted-foreground',
                                )}
                            >
                                {label}
                            </span>
                        </div>
                        {i < steps.length - 1 && (
                            <div
                                className={cn(
                                    'h-px flex-1 mx-2 sm:mx-3 transition-colors',
                                    isComplete ? 'bg-accent' : 'bg-border',
                                )}
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default StepHeader;
