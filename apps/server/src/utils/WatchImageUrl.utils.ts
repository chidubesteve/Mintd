/** Stable transparent display derivative. Original uploads remain the provenance source. */
export function buildProcessedImageUrl(originalUrl: string, _catalogueStatus: string): string {
    const url = new URL(originalUrl);
    url.searchParams.delete('tr');
    // Fit the complete upload to a square without cropping or stretching.
    // Status artwork is a UI element so it can expose a tooltip independently.
    url.searchParams.set('tr', 'e-bgremove:w-1200,h-1200,cm-pad_resize,bg-FFFFFF00:f-webp,q-90');
    return url.toString();
}
