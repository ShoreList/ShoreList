import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
  return [item.img, item.lookbook, item.studio, item.alt, item.gallery ?? [], item.lookbookGenerator ?? null];
}

function photoPairValid({ img, lookbook, studio }) {
  return Boolean(asset(lookbook) && asset(studio) && asset(lookbook) !== asset(studio) &&
    asset(img) === asset(lookbook));
}

const landingPages = ['gift-guide.html', 'shop/carolina-beach.html', 'shop/kure-beach.html',
  'shop/wilmington.html', 'shop/wrightsville-beach.html'];
const productCards = (html) => html.match(/<li><a [^>]+data-item-id="[^"]+"[^>]*>[\s\S]*?<\/a><\/li>/g) ?? [];
const lookbookDisclosure = '<small class="gg-line">AI-generated lookbook</small>';

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
  if (item.lookbookGenerator !== 'Higgsfield') issues.push('Higgsfield storefront disclosure');
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

test('town and gift guide cards visibly disclose Higgsfield lookbooks', (t) => {
  const fixture = mkdtempSync(join(tmpdir(), 'shorelist-photo-disclosure-'));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  mkdirSync(join(fixture, 'tools'));
  const generator = join(fixture, 'tools', 'build-store-pages.mjs');
  copyFileSync(new URL('../tools/build-store-pages.mjs', import.meta.url), generator);
  const catalog = load('shop-catalog.json');
  const item = catalog.items.find((entry) => entry.id === 'the-blue-crab-embroidered-crewneck-kure-beach');
  item.img = item.lookbook = '/fixtures/synthetic-lookbook.webp';
  item.lookbookGenerator = 'Higgsfield';
  writeFileSync(join(fixture, 'shop-catalog.json'), JSON.stringify(catalog));
  execFileSync(process.execPath, [generator]);
  for (const page of ['gift-guide.html', 'shop/kure-beach.html']) {
    const html = readFileSync(join(fixture, page), 'utf8');
    const cards = productCards(html);
    assert.match(cards.find((card) => card.includes('data-item-id="' + item.id + '"')),
      /<img src="\/fixtures\/synthetic-lookbook\.webp"[^>]*\/><small class="gg-line">AI-generated lookbook<\/small>/);
    assert.ok(cards.some((card) => !card.includes(item.id) && !card.includes('AI-generated lookbook')));
    assert.equal((html.match(/AI-generated lookbook/g) ?? []).length, 1);
  }
});

test('generated storefront cards match the catalog disclosure metadata', () => {
  const byId = new Map(records.map((item) => [item.id, item]));
  for (const page of landingPages) {
    const html = readFileSync(new URL('../' + page, import.meta.url), 'utf8');
    for (const card of productCards(html)) {
      const id = card.match(/data-item-id="([^"]+)"/)[1];
      assert.equal(card.includes(lookbookDisclosure), byId.get(id)?.lookbookGenerator === 'Higgsfield',
        page + ' has stale photo disclosure for ' + id + '. Run node tools/build-store-pages.mjs.');
    }
  }
});

test('only scored, approved evidence for both exact images passes', () => {
  const item = { img: '/lookbook_640x.jpg', lookbook: '/lookbook.jpg', studio: '/studio.jpg', lookbookGenerator: 'Higgsfield' };
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
  assert.ok(photoReviewIssues({ ...item, lookbookGenerator: null }, approvedReview).includes('Higgsfield storefront disclosure'));
  assert.ok(photoReviewIssues({ ...item, studio: '/new-studio.jpg' }, approvedReview).includes('brand and owner approvals of this exact image revision'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, studioSha256: lookbookSha256 }).includes('distinct image content digests'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, blindPhotoReview: { ...approvedReview.blindPhotoReview, score: 7 } }).includes('independent blind photo score of at least 8/10'));
});

// Owner order, 2026-11-27: drop the Pepper lookbook on this crewneck (grey is a
// brand hard failure). The card stays studio-first on the True Navy variant
// photo, recorded in shop-photo-review.json pending, until a scored lookbook
// pair exists. No other id belongs in this set.
const STUDIO_FIRST_HOLDS = new Set(['banks-channel-sunset-sail-crewneck']);

function studioFirstHold(item) {
  return STUDIO_FIRST_HOLDS.has(item.id) && pendingIds.has(item.id) &&
    !asset(item.lookbook) && !item.lookbookGenerator &&
    asset(item.img) && asset(item.img) === asset(item.studio);
}

const base = process.env.SHOP_PHOTO_BASE;
test('changed storefront media must ship as an approved complete pair', { skip: !base }, () => {
  assert.match(base, /^[a-f0-9]{40}$/);
  const previous = JSON.parse(execFileSync('git', ['show', base + ':shop-catalog.json'], { cwd: root, encoding: 'utf8' }));
  const prior = new Map(previous.items.map((item) => [item.id, item]));
  for (const item of records) {
    const old = prior.get(item.id);
    if (old && JSON.stringify(photoFields(old)) === JSON.stringify(photoFields(item))) continue;
    if (studioFirstHold(item)) continue;
    assert.deepEqual(photoReviewIssues(item, reviews[item.id]), [], item.id + ' needs a reviewed photo pair');
  }
  for (const id of STUDIO_FIRST_HOLDS) {
    const item = records.find((row) => row.id === id);
    assert.ok(item, id + ' is missing from the catalog');
    assert.equal(studioFirstHold(item), true, id + ' must stay a pending studio-first hold with no lookbook');
  }
});
