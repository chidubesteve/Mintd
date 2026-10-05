'use client';

import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';

export function CopyButton({
    value,
    className,
    label = 'Copy',
}: {
    value: string;
    className?: string;
    label?: string;
}) {
    const { copied, copy } = useCopyToClipboard();

    return (
        <button
            type='button'
            onClick={(e) => {
                // Several call sites nest this inside a <Link> card — without
                // these, clicking copy would also navigate away.
                e.preventDefault();
                e.stopPropagation();
                copy(value);
            }}
            aria-label={copied ? 'Copied' : label}
            className={cn(
                'inline-flex items-center justify-center rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer',
                className,
            )}
        >
            {copied ? (
                <Check className='w-3.5 h-3.5 text-accent' />
            ) : (
                <Copy className='w-3.5 h-3.5' />
            )}
        </button>
    );
}
