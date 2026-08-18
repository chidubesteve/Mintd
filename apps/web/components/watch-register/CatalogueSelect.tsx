'use client';

import { useMemo, useState } from 'react';
import { Check, ChevronDown, Loader2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Popover,
    PopoverAnchor,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

export interface CatalogueOption {
    value: string;
    label: string;
    sublabel?: string;
}

type SharedProps = {
    label: string;
    placeholder: string;
    options: CatalogueOption[];
    value: string;
    onChange: (value: string) => void;
    isLoading?: boolean;
    disabled?: boolean;
};

/**
 * CatalogueSelect
 *
 * Backs the brand → model → reference cascade in the register-watch wizard.
 * Two modes because the two use cases are genuinely different:
 *
 *  - "strict": the field can ONLY be one of `options` (used for brand,
 *    which is a closed enum on the backend — Watch.brand is validated
 *    against SUPPORTED_BRANDS). Renders as a picker button + list.
 *
 *  - "freeText" (default): the field is free text with catalogue
 *    suggestions (used for model/reference, which aren't enum-constrained
 *    on the backend — our seed data doesn't claim to cover every
 *    reference a brand ever made). Renders as a normal input; suggestions
 *    appear as you type but you're never blocked from keeping what you
 *    typed. The parent step reads the value back to decide whether to
 *    show a "verified" tick or a "we'll check this on review" hint.
 *
 * We didn't reach for a generic combobox library (cmdk/react-select) —
 * the lists are small and the exact interaction (never blocking free
 * text, plus a "not found → add manually" escape hatch on brand only)
 * is specific enough that this is less code than wiring one up.
 */
const CatalogueSelect = ({
    mode = 'freeText',
    label,
    placeholder,
    searchPlaceholder = 'Search…',
    notFoundSlot,
    ...props
}: SharedProps & {
    mode?: 'strict' | 'freeText';
    searchPlaceholder?: string;
    notFoundSlot?: React.ReactNode;
}) => {
    if (mode === 'strict') {
        return (
            <StrictSelect
                label={label}
                placeholder={placeholder}
                searchPlaceholder={searchPlaceholder}
                notFoundSlot={notFoundSlot}
                {...props}
            />
        );
    }
    return (
        <FreeTextSelect
            label={label}
            placeholder={placeholder}
            {...props}
        />
    );
};

function useFiltered(options: CatalogueOption[], query: string) {
    return useMemo(() => {
        if (!query.trim()) return options;
        const q = query.trim().toLowerCase();
        return options.filter(
            (opt) =>
                opt.label.toLowerCase().includes(q) ||
                opt.sublabel?.toLowerCase().includes(q),
        );
    }, [options, query]);
}

function StrictSelect({
    label,
    placeholder,
    searchPlaceholder,
    options,
    value,
    onChange,
    isLoading,
    disabled,
    notFoundSlot,
}: SharedProps & { searchPlaceholder?: string; notFoundSlot?: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const filtered = useFiltered(options, query);
    const selected = options.find((o) => o.value === value);

    return (
        <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>{label}</label>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button
                        type='button'
                        disabled={disabled}
                        className={cn(
                            'h-12 w-full rounded-md border border-input bg-transparent px-3 text-sm flex items-center justify-between gap-2 transition-colors',
                            'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none',
                            disabled && 'opacity-50 cursor-not-allowed',
                        )}
                    >
                        <span className={cn('truncate', !selected && 'text-muted-foreground')}>
                            {selected ? selected.label : placeholder}
                        </span>
                        {isLoading ? (
                            <Loader2 className='size-4 shrink-0 animate-spin text-muted-foreground' />
                        ) : (
                            <ChevronDown className='size-4 shrink-0 text-muted-foreground' />
                        )}
                    </button>
                </PopoverTrigger>
                <PopoverContent align='start' className='w-(--radix-popover-trigger-width) p-0'>
                    <div className='flex items-center gap-2 border-b border-border px-3'>
                        <Search className='size-4 text-muted-foreground shrink-0' />
                        <Input
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={searchPlaceholder}
                            className='border-0 shadow-none h-10 px-0 focus-visible:ring-0'
                        />
                    </div>
                    <div className='max-h-64 overflow-y-auto p-1'>
                        {filtered.length === 0 ? (
                            <div className='px-3 py-6'>
                                {notFoundSlot ?? (
                                    <p className='text-sm text-muted-foreground text-center'>
                                        No matches found.
                                    </p>
                                )}
                            </div>
                        ) : (
                            filtered.map((opt) => (
                                <button
                                    key={opt.value}
                                    type='button'
                                    onClick={() => {
                                        onChange(opt.value);
                                        setQuery('');
                                        setOpen(false);
                                    }}
                                    className={cn(
                                        'w-full text-left px-3 py-2 rounded-sm text-sm flex items-center justify-between gap-2 hover:bg-accent hover:text-accent-foreground transition-colors',
                                        value === opt.value && 'bg-accent/10 text-foreground',
                                    )}
                                >
                                    <span className='min-w-0'>
                                        <span className='block truncate'>{opt.label}</span>
                                        {opt.sublabel && (
                                            <span className='block truncate text-xs text-muted-foreground'>
                                                {opt.sublabel}
                                            </span>
                                        )}
                                    </span>
                                    {value === opt.value && (
                                        <Check className='size-4 shrink-0 text-accent' />
                                    )}
                                </button>
                            ))
                        )}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

function FreeTextSelect({
    label,
    placeholder,
    options,
    value,
    onChange,
    isLoading,
    disabled,
}: SharedProps) {
    const [open, setOpen] = useState(false);
    const filtered = useFiltered(options, value);
    const showSuggestions = filtered.length > 0 && !disabled;

    return (
        <div className='space-y-2'>
            <label className='text-sm font-medium text-foreground'>{label}</label>
            <Popover open={open && showSuggestions} onOpenChange={setOpen}>
                <PopoverAnchor asChild>
                    <div className='relative'>
                        <Input
                            value={value}
                            disabled={disabled}
                            placeholder={placeholder}
                            className='h-12'
                            onFocus={() => setOpen(true)}
                            onChange={(e) => {
                                onChange(e.target.value);
                                setOpen(true);
                            }}
                        />
                        {isLoading && (
                            <Loader2 className='absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground' />
                        )}
                    </div>
                </PopoverAnchor>
                <PopoverContent
                    align='start'
                    className='w-(--radix-popover-trigger-width) p-1'
                    onOpenAutoFocus={(e) => e.preventDefault()}
                    onInteractOutside={(e) => {
                        // Let normal outside clicks close it, but don't steal focus back
                        // from the input while the user is still typing.
                        if (e.target instanceof Node && e.target.nodeName === 'INPUT') {
                            e.preventDefault();
                        }
                    }}
                >
                    <div className='max-h-56 overflow-y-auto'>
                        {filtered.map((opt) => (
                            <button
                                key={opt.value}
                                type='button'
                                onMouseDown={(e) => e.preventDefault()} // keep input focus
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className='w-full text-left px-3 py-2 rounded-sm text-sm hover:bg-accent hover:text-accent-foreground transition-colors'
                            >
                                <span className='block truncate'>{opt.label}</span>
                                {opt.sublabel && (
                                    <span className='block truncate text-xs text-muted-foreground'>
                                        {opt.sublabel}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
}

export default CatalogueSelect;
