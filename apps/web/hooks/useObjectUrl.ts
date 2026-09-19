'use client';

import { useEffect, useMemo } from 'react';

/**
 * Creates an object URL for a File and revokes it when the file changes or
 * the component unmounts. The URL itself is derived synchronously with
 * useMemo (pure given `file`) rather than pushed into state from an effect
 * — only the cleanup (revoking the *previous* URL) needs an effect, since
 * that's the actual side effect that needs to synchronize with the browser.
 */
export function useObjectUrl(file: File | null | undefined): string | null {
    const url = useMemo(
        () => (file ? URL.createObjectURL(file) : null),
        [file],
    );

    useEffect(() => {
        return () => {
            if (url) URL.revokeObjectURL(url);
        };
    }, [url]);

    return url;
}
