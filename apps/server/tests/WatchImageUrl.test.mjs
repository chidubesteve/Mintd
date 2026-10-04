import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProcessedImageUrl } from '../src/utils/WatchImageUrl.utils.ts';

const original = 'https://ik.imagekit.io/uw2j2cj9gp/watches/originals/watch.jpg';
test('repairs a persisted legacy URL and preserves other query parameters', () => {
    const url = new URL(buildProcessedImageUrl(`${original}?tr=broken&v=1`, 'PENDING_REVIEW'));
    assert.equal(url.searchParams.get('tr'), 'e-bgremove:w-1200,h-1200,cm-pad_resize,bg-FFFFFF00:f-webp,q-90');
    assert.equal(url.searchParams.getAll('tr').length, 1);
    assert.equal(url.searchParams.get('v'), '1');
});
test('status changes reuse the photo derivative without changing the original', () => {
    const pending = buildProcessedImageUrl(original, 'PENDING_REVIEW');
    const matched = buildProcessedImageUrl(original, 'MATCHED');
    assert.equal(pending, matched);
    assert.ok(!matched.includes('l-image'));
    assert.equal(new URL(matched).pathname, new URL(original).pathname);
    assert.equal(matched, buildProcessedImageUrl(original, 'MATCHED'));
});
test('rejected watches do not receive a matched or pending badge', () => {
    assert.ok(!buildProcessedImageUrl(original, 'REJECTED').includes('l-image'));
});
