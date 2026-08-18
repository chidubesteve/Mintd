'use client';

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const StepHeader = ({
    steps,
    current,
}: {
    steps: string[];
    current: number;
}) => {
    return (
        <div className='flex items-center mb-10'>
            {steps.map((label, i) => {
                const isComplete = i < current;
                const isActive = i === current;
                return (
                    <div key={label} className='flex items-center flex-1 last:flex-none'>
                        <div className='flex flex-col items-center gap-2'>
                            <div
                                className={cn(
                                    'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors shrink-0',
                                    isComplete
                                        ? 'bg-accent text-accent-foreground'
                                        : isActive
                                          ? 'bg-primary text-primary-foreground'
                                          : 'bg-muted text-muted-foreground',
                                )}
                            >
                                {isComplete ? <Check className='w-4 h-4' /> : i + 1}
                            </div>
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
