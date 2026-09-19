'use client';

import { useEffect, useState } from 'react';

/**
 * Creates an object URL for a File and revokes it when the file changes or
 * the component unmounts. The URL is created inside the effect (not during
 * render via useMemo) so React 18 Strict Mode's dev-only mount->cleanup->
 * mount cycle creates a fresh URL on the second mount instead of revoking
 * the one render already handed to the DOM — otherwise a component that
 * mounts with a file already present (e.g. the review step's thumbnails)
 * gets a URL that's revoked before it's ever painted.
 */
export function useObjectUrl(file: File | null | undefined): string | null {
    const [url, setUrl] = useState<string | null>(null);

    useEffect(() => {
        const objectUrl = file ? URL.createObjectURL(file) : null;
        // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate: this setState IS the Strict Mode fix (see comment above), not a derivable-during-render value.
        setUrl(objectUrl);
        return () => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [file]);

    return url;
}
