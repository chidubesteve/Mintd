import assert from 'node:assert/strict';
import test from 'node:test';
import { buildProcessedImageUrl } from '../src/utils/WatchImageUrl.utils.ts';

const original = 'https://ik.imagekit.io/uw2j2cj9gp/watches/originals/watch.jpg';
test('repairs a persisted legacy URL and preserves other query parameters', () => {
    const url = new URL(buildProcessedImageUrl(`${original}?tr=broken&v=1`, 'PENDING_REVIEW'));
    assert.equal(url.searchParams.get('tr'), 'e-bgremove:w-1200:l-image,i-Pending_review_mintd.png,w-80,lx-30,ly-30,o-85,l-end:f-webp,q-90');
    assert.equal(url.searchParams.getAll('tr').length, 1);
    assert.equal(url.searchParams.get('v'), '1');
});
test('status changes select a different URL without changing the original', () => {
    const pending = buildProcessedImageUrl(original, 'PENDING_REVIEW');
    const matched = buildProcessedImageUrl(original, 'MATCHED');
    assert.notEqual(pending, matched);
    assert.match(matched, /catalogue_matched_mintd\.png/);
    assert.equal(new URL(matched).pathname, new URL(original).pathname);
    assert.equal(matched, buildProcessedImageUrl(original, 'MATCHED'));
});
test('rejected watches do not receive a matched or pending badge', () => {
    assert.ok(!buildProcessedImageUrl(original, 'REJECTED').includes('l-image'));
});
