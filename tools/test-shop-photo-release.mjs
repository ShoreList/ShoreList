import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { BRAND_CRITERIA, coastalBrandIssues, productScoreIssues } from './coastal-brand-review.mjs';

const root = new URL('../', import.meta.url);
const load = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const records = load('shop-catalog.json').items;
const { pending, reviews } = load('docs/shop-photo-review.json');
const pendingIds = new Set(pending.map(({ id }) => id));
const asset = (url) => String(url ?? '').split('?')[0].replace(/_\d+x(?=\.)/, '');
const hash = (value) => typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const documented = (value) => typeof value === 'string' && Boolean(value.trim());

function photoFields(item) {
  return [item.img, item.lookbook, item.studio, item.alt, item.gallery ?? []];
}

function photoPairValid({ img, lookbook, studio }) {
  return Boolean(asset(lookbook) && asset(studio) && asset(lookbook) !== asset(studio) &&
    asset(img) === asset(lookbook));
}

function photoRevision(item, lookbookSha256, studioSha256) {
  return createHash('sha256')
    .update(JSON.stringify([...photoFields(item), lookbookSha256, studioSha256])).digest('hex');
}

function photoReviewIssues(item, review = {}) {
  const issues = [];
  if (!photoPairValid(item)) issues.push('distinct lookbook lead and exact studio photo');
  const { lookbookSha256, studioSha256, blindPhotoReview, coastalBrandReview } = review;
  if (!hash(lookbookSha256) || !hash(studioSha256) || lookbookSha256 === studioSha256) {
    issues.push('distinct image content digests');
  }
  if (review.generator !== 'Higgsfield' || !documented(review.generationId)) issues.push('Higgsfield job provenance');
  for (const field of ['variant', 'fidelityEvidence', 'realismEvidence', 'studioEvidence', 'disclosureEvidence']) {
    if (!documented(review[field])) issues.push(field);
  }
  const revision = photoRevision(item, lookbookSha256, studioSha256);
  if (coastalBrandReview?.reviewedRevision !== revision || review.ownerApproval?.reviewedRevision !== revision ||
      review.ownerApproval?.approved !== true || !documented(review.ownerApproval?.reviewer)) {
    issues.push('brand and owner approvals of this exact image revision');
  }
  issues.push(...coastalBrandIssues(coastalBrandReview), ...productScoreIssues(review.scores, review.scoreEvidence));
  if (blindPhotoReview?.independent !== true || blindPhotoReview.blind !== true ||
      !documented(blindPhotoReview.reviewer) || !documented(blindPhotoReview.evidence) ||
      !Number.isFinite(blindPhotoReview.score) || blindPhotoReview.score < 8 || blindPhotoReview.score > 10 ||
      blindPhotoReview.reviewedRevision !== revision) {
    issues.push('independent blind photo score of at least 8/10');
  }
  return issues;
}

test('the storefront has no untracked photo-pair gaps', () => {
  assert.equal(pendingIds.size, pending.length, 'pending items are unique');
  for (const item of records) {
    if (!photoPairValid(item)) assert.ok(pendingIds.has(item.id), item.id + ' is missing an approved pair');
  }
});

test('a missing lookbook or duplicate image fails release review', () => {
  assert.equal(photoPairValid({ img: '/a_640x.jpg', lookbook: '/a_1000x.jpg', studio: '/a.jpg' }), false);
  assert.equal(photoPairValid({ img: '/studio.jpg', lookbook: '/coast.jpg', studio: '/studio.jpg' }), false);
  assert.ok(photoReviewIssues({ img: '/coast.jpg', lookbook: '/coast.jpg', studio: '/studio.jpg' }).length);
});

test('only scored, approved evidence for both exact images passes', () => {
  const item = { img: '/lookbook_640x.jpg', lookbook: '/lookbook.jpg', studio: '/studio.jpg' };
  const lookbookSha256 = 'a'.repeat(64);
  const studioSha256 = 'b'.repeat(64);
  const reviewedRevision = photoRevision(item, lookbookSha256, studioSha256);
  const evidence = 'Synthetic evidence for this test only';
  const productCriteria = ['MOOD', 'ORIGINALITY', 'EMBELLISHMENT', 'PLACE', 'COLOR', 'TYPE',
    'SELL', 'MOCKUP QUALITY', 'AWARD', 'REALNESS'];
  const approvedReview = {
    lookbookSha256, studioSha256, generator: 'Higgsfield', generationId: 'synthetic-job',
    variant: 'Test Cream', fidelityEvidence: evidence,
    realismEvidence: evidence, studioEvidence: evidence, disclosureEvidence: evidence,
    scores: Object.fromEntries(productCriteria.map((name) => [name, 9])),
    scoreEvidence: Object.fromEntries(productCriteria.map((name) => [name, evidence])),
    coastalBrandReview: {
      reviewedRevision, reviewer: 'Synthetic brand reviewer', independent: true,
      localAccuracyVerified: true, hasHardFailure: false,
      references: [{ url: 'https://example.com/test', evidence }],
      criteria: Object.fromEntries(BRAND_CRITERIA.map((name) => [name, { score: 18, evidence }])),
    },
    blindPhotoReview: { reviewedRevision, independent: true, blind: true, reviewer: 'Synthetic photo reviewer', score: 8, evidence },
    ownerApproval: { reviewedRevision, approved: true, reviewer: 'Synthetic owner' },
  };
  assert.deepEqual(photoReviewIssues(item, approvedReview), []);
  assert.ok(photoReviewIssues({ ...item, studio: '/new-studio.jpg' }, approvedReview).includes('brand and owner approvals of this exact image revision'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, studioSha256: lookbookSha256 }).includes('distinct image content digests'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, blindPhotoReview: { ...approvedReview.blindPhotoReview, score: 7 } }).includes('independent blind photo score of at least 8/10'));
});

const base = process.env.SHOP_PHOTO_BASE;
test('changed storefront media must ship as an approved complete pair', { skip: !base }, () => {
  assert.match(base, /^[a-f0-9]{40}$/);
  const previous = JSON.parse(execFileSync('git', ['show', base + ':shop-catalog.json'], { cwd: root, encoding: 'utf8' }));
  const prior = new Map(previous.items.map((item) => [item.id, item]));
  for (const item of records) {
    const old = prior.get(item.id);
    if (old && JSON.stringify(photoFields(old)) === JSON.stringify(photoFields(item))) continue;
    assert.deepEqual(photoReviewIssues(item, reviews[item.id]), [], item.id + ' needs a reviewed photo pair');
  }
});
