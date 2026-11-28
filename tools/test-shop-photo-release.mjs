import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BRAND_CRITERIA, coastalBrandIssues, productScoreIssues } from './coastal-brand-review.mjs';
import { harborReleaseIssues } from './supplier-expansion.mjs';

const root = new URL('../', import.meta.url);
const load = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'));
const catalog = load('shop-catalog.json');
const records = catalog.items;
const { pending, reviews, allowedGenerators } = load('docs/shop-photo-review.json');
const acceptedGenerator = (name) => Array.isArray(allowedGenerators) && allowedGenerators.includes(name);
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
  if (!acceptedGenerator(review.generator) || !documented(review.generationId)) issues.push('Higgsfield job provenance');
  if (!acceptedGenerator(item.lookbookGenerator)) issues.push('Higgsfield storefront disclosure');
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
      assert.equal(card.includes(lookbookDisclosure), acceptedGenerator(byId.get(id)?.lookbookGenerator),
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
  assert.equal(photoReviewIssues(item, { ...approvedReview, generator: 'ChatGPT' }).includes('Higgsfield job provenance'), false);
  assert.equal(photoReviewIssues({ ...item, lookbookGenerator: 'ChatGPT' }, approvedReview).includes('Higgsfield storefront disclosure'), false);
  assert.ok(photoReviewIssues({ ...item, studio: '/new-studio.jpg' }, approvedReview).includes('brand and owner approvals of this exact image revision'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, studioSha256: lookbookSha256 }).includes('distinct image content digests'));
  assert.ok(photoReviewIssues(item, { ...approvedReview, blindPhotoReview: { ...approvedReview.blindPhotoReview, score: 7 } }).includes('independent blind photo score of at least 8/10'));
});

// Owner order, 2026-11-27: drop the Pepper lookbook on the Banks Channel crewneck
// (grey is a brand hard failure). That card stays studio-first on the True Navy
// photo until a scored lookbook pair exists. The Daymark beanie is studio-first
// because it has no lookbook. The ILM crewneck lookbook was removed because the
// lettering was about twice the size on the garment; the card stays on the True
// Navy studio photo until a corrected lookbook passes review.
// The Wrightsville sailfish crewneck lookbook showed a shoreline scene that
// did not match the white crewneck that is sold. The card stays on the studio
// photo until a matching lookbook passes review.
const STUDIO_FIRST_HOLDS = new Set([
  'banks-channel-sunset-sail-crewneck',
  'daymark-cuffed-beanie-wrightsville-beach',
  'ilm-crewneck',
  'wrightsville-beach-sailfish-printed-crewneck-sweatshirt',
  'wrightsville-beach-sloop-printed-mug',
  'wrightsville-beach-sloop-printed-tea-towel',
  'wrightsville-beach-sloop-can-cooler-sleeve',
  'carolina-beach-lifeguard-stand-embroidered-crewneck-sweatshirt',
  'the-pelican-embroidered-crewneck-carolina-beach',
  'the-pelican-corduroy-cap-carolina-beach',
  'the-pelican-cuffed-beanie-carolina-beach',
  'carolina-beach-lifeguard-stand-printed-throw-pillow',
  'carolina-beach-lifeguard-stand-printed-zip-pouch',
  'carolina-beach-lifeguard-stand-printed-mug',
  'carolina-beach-lifeguard-stand-printed-garment-dyed-tee',
  'brown-pelican-carolina-coast-printed-garment-dyed-tee',
  'kure-beach-lifeguard-stand-embroidered-crewneck-sweatshirt',
  'the-blue-crab-embroidered-crewneck-kure-beach',
  'kure-beach-lifeguard-stand-printed-canvas-tote-bag',
  'kure-beach-lifeguard-stand-printed-throw-pillow',
  'kure-beach-lifeguard-stand-printed-zip-pouch',
  'kure-beach-lifeguard-stand-printed-mug',
  'kure-beach-lifeguard-stand-printed-garment-dyed-tee',
  'airlie-oak-framed-art-print-wrightsville-beach-and-wilmington',
  'airlie-oak-wilmington-printed-garment-dyed-tee',
  'azalea-wilmington-printed-garment-dyed-tee',
  'blue-crab-carolina-coast-printed-garment-dyed-tee',
  'sea-oats-carolina-coast-printed-garment-dyed-tee',
  'camellia-wilmington-printed-garment-dyed-tee',
  'airlie-oak-wilmington-printed-mug',
  'airlie-oak-wilmington-ceramic-ornament',
  'airlie-oak-wilmington-all-over-print-zip-pouch',
  'airlie-oak-wilmington-throw-pillow',
  'airlie-oak-wilmington-tea-towel',
  'wrightsville-can-cooler',
  'carolina-beach-can-cooler',
  'carolina-beach-scallop-shell-printed-crewneck-sweatshirt',
  'the-lifeguard-stand-dad-hat-carolina-beach',
  'kure-beach-can-cooler',
  'kure-beach-scallop-shell-printed-canvas-tote-bag',
  'the-lifeguard-stand-dad-hat-kure-beach',
  'kure-beach-sanderling-printed-garment-dyed-tee',
  'wrightsville-ornament-2026',
  'daymark-corduroy-cap-wrightsville-beach',
  'wrightsville-beach-scallop-shell-printed-garment-dyed-tee',
  'wrightsville-beach-oystercatcher-printed-garment-dyed-tee',
  'wrightsville-beach-scallop-shell-printed-mug',
  'camellia-carolina-coast-kiss-cut-vinyl-sticker-3-inch',
  'wild-venus-flytrap-cape-fear-printed-garment-dyed-tee',
  'carolina-beach-megalodon-tooth-framed-art-print',
  'carolina-beach-brown-pelican-framed-art-print',
  'kure-beach-sea-turtle-framed-art-print',
  'kure-beach-blue-crab-framed-art-print',
  'blue-crab-carolina-coast-insulated-stainless-water-bottle-20-oz',
  'blue-crab-carolina-coast-kiss-cut-vinyl-sticker-3-inch',
  'wrightsville-beach-sailfish-framed-art-print',
  'wrightsville-beach-sea-oats-framed-art-print',
  'sea-oats-carolina-coast-insulated-stainless-tumbler-20-oz',
  'sea-oats-carolina-coast-kiss-cut-vinyl-sticker-3-inch',
  'wrightsville-beach-hoodie-varsity',
  'wrightsville-beach-tee-varsity',
  'wrightsville-beach-blue-crab-embroidered-crewneck',
  'carolina-beach-blue-crab-embroidered-crewneck',
  'wrightsville-beach-signature-crewneck',
  'wrightsville-beach-varsity-crewneck',
  'carolina-beach-varsity-crewneck',
  'kure-beach-varsity-crewneck',
  'wilmington-varsity-crewneck',
  'the-sloop-embroidered-crewneck-wrightsville-beach',
  'the-sloop-corduroy-cap-wrightsville-beach',
  'the-sloop-cuffed-beanie-wrightsville-beach',
  'daymark-blue-crab-crewneck',
]);
// These three tees keep the same lookbook lead. Only the studio file changes,
// from the blank back to the Ivory front. That is not a new lookbook pair.
const STUDIO_FRONT_CORRECTIONS = new Set([
]);

function onlyStudioChanged(item, old) {
  if (!old) return false;
  const before = photoFields(old);
  const after = photoFields(item);
  before[2] = after[2] = null;
  return JSON.stringify(before) === JSON.stringify(after) && photoPairValid(item) &&
    asset(item.studio) !== asset(old.studio);
}

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
    if (old && STUDIO_FRONT_CORRECTIONS.has(item.id) && onlyStudioChanged(item, old)) continue;
    assert.deepEqual(photoReviewIssues(item, reviews[item.id]), [], item.id + ' needs a reviewed photo pair');
  }
  for (const id of STUDIO_FIRST_HOLDS) {
    const item = records.find((row) => row.id === id);
    assert.ok(item, id + ' is missing from the catalog');
    assert.equal(studioFirstHold(item), true, id + ' must stay a pending studio-first hold with no lookbook');
  }
});

test('new or materially changed Harbor Goods listings require exact release evidence', { skip: !base }, () => {
  assert.match(base, /^[a-f0-9]{40}$/);
  const previous = JSON.parse(execFileSync('git', ['show', base + ':shop-catalog.json'], { cwd: root, encoding: 'utf8' }));
  const queue = load('docs/supplier-expansion-candidates.json');
  const prior = new Map((previous.harborGoods ?? []).map((item) => [item.id, item]));
  const productFields = (item) => [item.store, item.name, item.url, item.sku, item.price, item.meta, ...photoFields(item)];
  for (const item of catalog.harborGoods ?? []) {
    const old = prior.get(item.id);
    if (old && JSON.stringify(productFields(old)) === JSON.stringify(productFields(item))) continue;
    assert.deepEqual([
      ...harborReleaseIssues(item, queue),
      ...photoReviewIssues(item, reviews[item.id]),
    ], [], item.id + ' needs exact supplier, product and photo release evidence');
  }
});
