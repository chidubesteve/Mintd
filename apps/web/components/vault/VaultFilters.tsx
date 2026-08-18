'use client';

import { cn } from '@/lib/utils';

export type VaultFilter = 'ALL' | 'REGISTERED' | 'MINTED';

const OPTIONS: { value: VaultFilter; label: string }[] = [
    { value: 'ALL', label: 'All watches' },
    { value: 'REGISTERED', label: 'Registered' },
    { value: 'MINTED', label: 'NFT / Minted' },
];

const VaultFilters = ({
    value,
    onChange,
    counts,
}: {
    value: VaultFilter;
    onChange: (v: VaultFilter) => void;
    counts: Record<VaultFilter, number>;
}) => {
    return (
        <div className='inline-flex items-center gap-1 rounded-full bg-muted p-1 w-fit'>
            {OPTIONS.map((opt) => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        'px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap',
                        value === opt.value
                            ? 'bg-card text-foreground shadow-subtle'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {opt.label}
                    <span
                        className={cn(
                            'ml-1.5 text-xs',
                            value === opt.value
                                ? 'text-accent'
                                : 'text-muted-foreground/70',
                        )}
                    >
                        {counts[opt.value]}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default VaultFilters;
