/** Build stable display URLs; originals remain unchanged for provenance. */
const OVERLAY_PATHS = {
    MATCHED: 'catalogue_matched_mintd.png',
    PENDING_REVIEW: 'Pending_review_mintd.png',
} as const;

export function buildProcessedImageUrl(
    originalUrl: string,
    catalogueStatus: string,
): string {
    const url = new URL(originalUrl);
    // Strip legacy transforms rather than appending a second tr parameter.
    url.searchParams.delete('tr');
    const overlay = OVERLAY_PATHS[catalogueStatus as keyof typeof OVERLAY_PATHS];
    const steps = ['e-bgremove', 'w-1200'];
    if (overlay) {
        // Layer width/opacity use w/o, not lw/lo. Resize the base first so
        // the badge stays 80px wide regardless of the uploaded resolution.
        steps.push(`l-image,i-${overlay},w-80,lx-30,ly-30,o-85,l-end`);
    }
    steps.push('f-webp,q-90');
    url.searchParams.set('tr', steps.join(':'));
    return url.toString();
}
