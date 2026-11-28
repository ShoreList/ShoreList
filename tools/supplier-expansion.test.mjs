import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { BRAND_CRITERIA, coastalBrandIssues } from './coastal-brand-review.mjs';
import cj from '../netlify/functions/_suppliers/cj.js';
import { cjCoverage, cjDraft, cjVariants, harborReleaseIssues, releaseIssues, releaseRevision, selectedVariants, stageDrafts } from './supplier-expansion.mjs';

const queue = JSON.parse(await readFile(new URL('../docs/supplier-expansion-candidates.json', import.meta.url)));
const plans = JSON.parse(await readFile(new URL('../docs/supplier-expansion-development.json', import.meta.url)));
const brandFixture = () => ({
  independent: true,
  reviewer: 'Fixture reviewer',
  reviewedRevision: 'a'.repeat(64),
  localAccuracyVerified: true,
  references: [{ url: 'https://example.com/test-reference', evidence: 'Synthetic test evidence' }],
  hasHardFailure: false,
  criteria: Object.fromEntries(BRAND_CRITERIA.map((key) => [key, { score: 18, evidence: 'Synthetic test evidence' }])),
});

test('the development data covers all 40 candidates and the gate holds research-only entries', async () => {
  assert.equal(queue.items.filter((x) => x.supplier === 'fourthwall').length, 24);
  assert.equal(queue.items.filter((x) => x.supplier === 'cj').length, 16);
  assert.deepEqual(Object.keys(plans), queue.items.map((x) => x.title));
  for (const item of queue.items) {
    const issues = releaseIssues(item);
    if (item.status === 'RESEARCH_ONLY') assert.ok(issues.length);
    else assert.deepEqual(issues, []);

    if (plans[item.title].artwork) {
      const svg = await readFile(new URL('../' + plans[item.title].artwork, import.meta.url), 'utf8');
      assert.match(svg, /^<svg [^>]*width="2400" height="3000"/);
      assert.doesNotMatch(svg, /<text\b|<circle\b/);
    }
  }
});

test('review gate rejects missing score evidence, duplicate images, hard failures and a loss after discount', () => {
  const criteria = Object.keys(queue.items[0].scores);
  const rules = ['noGrey', 'noClubWording', 'noBadgesOrCircles', 'noStrayLetteringOrNumbers', 'noCheapPhotography'];
  // Synthetic QA fixture only. The real candidate queue has no assigned scores.
  const item = {
    title: 'QA fixture',
    supplier: 'fourthwall',
    status: 'READY',
    supplierSku: 'test-sku',
    skuVerified: true,
    supplierUrl: 'https://example.com/product',
    catalogReconciliation: 'test',
    shippingEvidence: 'test',
    checkoutEvidence: 'test',
    inStock: true,
    colors: ['Oyster'],
    hardRuleReview: Object.fromEntries(rules.map((r) => [r, { pass: true, evidence: 'test' }])),
    retail: 4000,
    landedCost: { productCents: 2000, supplierShippingCents: 480, otherCents: 0, paymentFeesCents: 130,
      shippingRevenueCents: 0, currency: 'USD', evidence: 'test' },
    lookbook: { url: 'https://example.com/lookbook.png', sha256: 'a'.repeat(64), role: 'lookbook', variantSku: 'test-sku', evidence: 'test' },
    studio: { url: 'https://example.com/studio.png', sha256: 'b'.repeat(64), role: 'studio', variantSku: 'test-sku',
      actualProduct: true, evidence: 'test' },
    scores: Object.fromEntries(criteria.map((c) => [c, 9])),
    scoreEvidence: Object.fromEntries(criteria.map((c) => [c, 'test'])),
    independentPhotoReview: { blind: true, score: 8, reviewer: 'test', evidence: 'test',
      lookbookSha256: 'a'.repeat(64), studioSha256: 'b'.repeat(64) },
    coastalBrandReview: brandFixture(),
    ownerApproval: { approved: true, evidence: 'test' },
  };
  const signFixture = () => {
    item.coastalBrandReview.reviewedRevision = releaseRevision(item);
    item.ownerApproval.reviewedRevision = releaseRevision(item);
  };
  signFixture();
  assert.deepEqual(releaseIssues(item), []);
  const listing = { store: 'fourthwall', name: item.title, url: item.supplierUrl, sku: item.supplierSku, price: 40,
    img: item.lookbook.url, lookbook: item.lookbook.url, studio: item.studio.url };
  assert.deepEqual(harborReleaseIssues(listing, { items: [item] }), []);
  assert.match(harborReleaseIssues(listing, { items: [{ ...item, status: 'RESEARCH_ONLY' }] }).join(), /release-ready/);
  assert.match(harborReleaseIssues({ ...listing, url: 'https://example.com/other' }, { items: [item] }).join(), /exact product URL/);
  assert.match(harborReleaseIssues({ ...listing, sku: 'wrong', price: 42 }, { items: [item] }).join(), /SKU and price/);
  assert.match(harborReleaseIssues({ ...listing, img: listing.studio }, { items: [item] }).join(), /reviewed lookbook/);
  assert.match(harborReleaseIssues({ ...listing, alt: 'Yacht & Beach Club artwork' }, { items: [item] }).join(), /club wording/);
  assert.equal(releaseRevision({ ...item, status: 'READY' }), releaseRevision(item));
  assert.equal(releaseRevision(Object.fromEntries(Object.entries(item).reverse())), releaseRevision(item));
  assert.deepEqual(releaseIssues({ ...item, description: 'Revised fixture artwork copy.' }), [
    'coastal luxury review is for a different submission revision', 'owner approval of the exact submission revision',
  ]);
  item.scores.MOOD = 8;
  signFixture();
  assert.deepEqual(releaseIssues(item), ['product review mean below 9/10']);
  item.scores.MOOD = 7;
  signFixture();
  assert.deepEqual(releaseIssues(item), ['criterion score below 8', 'product review mean below 9/10']);
  item.scores.MOOD = '9';
  item.studio.sha256 = item.lookbook.sha256;
  item.studio.actualProduct = false;
  item.colors = ['Pepper'];
  item.hardRuleReview.noBadgesOrCircles.pass = false;
  item.landedCost.productCents = 3300;
  signFixture();
  assert.deepEqual(releaseIssues(item), [
    'available approved colorways', 'hard-rule review', 'nonpositive contribution after 15% discount',
    'distinct exact-product images in lookbook, studio order', 'evidence for all ten scores',
    'independent blind review of the exact photo pair',
  ]);
});

test('the coastal luxury review requires 90, exact revision, local references and zero hard failures', () => {
  const review = brandFixture();
  assert.deepEqual(coastalBrandIssues(review), []);
  review.criteria.localFidelity.score = 17;
  assert.deepEqual(coastalBrandIssues(review), ['coastal luxury brand match below 90/100']);
  review.criteria.localFidelity.score = 20;
  review.localAccuracyVerified = false;
  review.hasHardFailure = true;
  assert.deepEqual(coastalBrandIssues(review), ['verified local references', 'coastal brand hard-failure review']);
  review.reviewedRevision = 'version unspecified';
  assert.deepEqual(coastalBrandIssues(review), ['independent coastal luxury review of the exact revision']);
});

test('Fourthwall variant selection requires exact available colors and sizes with USD base cost', () => {
  const template = { colorVariants: [{ color: { name: 'Natural' }, available: true, sizeVariants: [
    { size: 'S', available: true, variantId: 'var_test', price: { currency: 'USD', amount: 12.99 } },
    { size: 'M', available: false, variantId: 'var_off', price: { currency: 'USD', amount: 12.99 } },
  ] }] };
  assert.deepEqual(selectedVariants(template, ['Natural'], ['S']), [
    { color: 'Natural', size: 'S', variantId: 'var_test', baseCents: 1299 },
  ]);
  assert.throws(() => selectedVariants(template, [], ['S']), /explicitly/);
  assert.throws(() => selectedVariants(template, ['Pepper'], ['S']), /non-grey/);
  assert.throws(() => selectedVariants(template, ['Natural'], ['M']), /no verified/);
});

test('CJ cost lookup checks warehouse and excludes factory inventory', async (t) => {
  const original = process.env.CJ_API_KEY;
  process.env.CJ_API_KEY = 'mock-key';
  cj._resetToken();
  t.after(() => {
    cj._resetToken();
    if (original == null) delete process.env.CJ_API_KEY;
    else process.env.CJ_API_KEY = original;
  });
  let invalidStock = false;
  let tokenRequests = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    const { pathname } = new URL(url);
    if (pathname.endsWith('/getAccessToken')) {
      tokenRequests++;
      return Response.json({ code: 200, data: { accessToken: 'mock-token' } });
    }
    if (pathname.endsWith('/queryByVid') && pathname.includes('/variant/')) {
      return Response.json({ code: 200, data: { vid: 'test-vid', variantSellPrice: 19.25 } });
    }
    assert.ok(pathname.endsWith('/stock/queryByVid'));
    return Response.json({ code: 200, data: [
      { vid: 'test-vid', countryCode: 'US', cjInventoryNum: invalidStock ? null : 0, factoryInventoryNum: 6 },
      { vid: 'test-vid', countryCode: 'CN', cjInventoryNum: 12, factoryInventoryNum: 200 },
    ] });
  });
  const ref = { vid: 'test-vid' };
  const [us, cn] = await Promise.all([cj.getCost(ref), cj.getCost(ref, { from_country: 'CN' })]);
  assert.deepEqual(us, { ok: true, cost_cents: 1925, in_stock: false, on_hand: 0 });
  assert.deepEqual(cn, { ok: true, cost_cents: 1925, in_stock: true, on_hand: 12 });
  assert.equal(tokenRequests, 1);
  invalidStock = true;
  assert.equal((await cj.getCost(ref)).ok, false);
});

test('Fourthwall writes use the hidden option and keep credentials off the signed upload', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'shorelist-art-'));
  const file = join(dir, 'draft.png');
  const png = Buffer.alloc(33);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  png.write('IHDR', 12);
  png.writeUInt32BE(2400, 16);
  png.writeUInt32BE(3000, 20);
  await writeFile(file, png);
  const values = { FOURTHWALL_API_USERNAME: 'mock-user', FOURTHWALL_API_PASSWORD: 'mock-password' };
  const prior = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]));
  Object.assign(process.env, values);
  t.after(async () => {
    for (const [key, value] of Object.entries(prior)) {
      if (value == null) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(dir, { recursive: true, force: true });
  });
  const responses = [
    { results: [{ name: 'Salt Wash Organic Cotton Market Tote', slug: 'salt-wash-organic-cotton-market-tote' }], totalPages: 1 },
    {
      supportsBackendRendering: true,
      customizableAreas: [{ regionId: 'default', available: true, supportsBackendRendering: true,
        dimensions: { pixelsWidth: 2400, pixelsHeight: 3000 } }],
      colorVariants: [{ color: { name: 'Red Oak' }, available: true, sizeVariants: [
        { size: '8x10', available: true, variantId: 'var_test', price: { currency: 'USD', amount: 20.35 } },
      ] }],
    },
    { uploadUrl: 'https://storage.googleapis.com/mock-art', fileUrl: 'https://cdn.fourthwall.com/mock-art' },
    {},
    { id: 'img_test' },
    { productId: 'off_test' },
  ];
  const calls = [];
  t.mock.method(console, 'log', () => {});
  t.mock.method(globalThis, 'fetch', async (url, request) => {
    calls.push({ url: String(url), request });
    assert.ok(responses.length, 'unexpected API call');
    return Response.json(responses.shift());
  });
  await stageDrafts([{ title: 'Banks Channel at Dawn', file, colors: ['Red Oak'], sizes: ['8x10'],
    region: 'default', profitCents: 1000 }], plans, queue, { items: [] });
  assert.equal(responses.length, 0);
  assert.equal(calls[3].request.method, 'PUT');
  assert.equal(calls[3].request.headers.Authorization, undefined);
  assert.equal(calls[3].request.headers['x-goog-content-length-range'], '0,33');
  assert.equal(JSON.parse(calls[5].request.body).publishOnCreate, false);
  responses.push({ results: [], totalPages: 0 });
  await assert.rejects(() => stageDrafts([{ title: 'Banks Channel at Dawn' }], plans, queue, { items: [] }), /known ShoreList offer/);
  assert.equal(calls.length, 7, 'an unrecognized shop triggers no additional API call');
});

test('CJ draft maps an exact variant and freight option into a dormant catalog record', () => {
  const input = { title: 'Coastal Beach Cart', origin: 'US', url: 'https://cjdropshipping.com/product/example.html',
    logistics: 'Test carrier', retailCents: 8000, shippingCents: 0, otherCents: 100, paymentFeesCents: 250,
    leadDays: [4, 7], label: 'Oyster', pid: 'test-pid', zip: '28401' };
  const snapshot = { variant: { vid: 'test-vid', variantSku: 'test-sku' }, cost: { cost_cents: 3500, on_hand: 2 },
    freight: [{ logisticName: 'Test carrier', logisticPrice: 9, totalPostageFee: 10 }] };
  const plan = plans[input.title];
  const { draft, evidence } = cjDraft(input, plan, snapshot);
  assert.equal(draft.status, 'draft-not-live');
  assert.equal(draft.supplier_ship_cents, 1000);
  assert.deepEqual(draft.variants[0].supplier_ref, { vid: 'test-vid' });
  assert.equal(evidence.discountStressMarginCents, 1950);
  assert.throws(() => cjDraft({ ...input, retailCents: 4000 }, plan, snapshot), /nonpositive/);
  assert.throws(() => cjDraft(input, plan, { ...snapshot,
    freight: [{ logisticName: 'Test carrier', totalPostageFee: ' ' }] }), /cost is unavailable/);
});

test('CJ inspection preserves exact variant IDs and coverage separates quotes from unavailable evidence', async (t) => {
  t.mock.method(cj, 'configured', () => true);
  const image = 'https://example.com/test-variant.png';
  const variants = [
    { pid: 'test-pid', vid: 'test-vid', variantSku: 'test-sku', variantNameEn: 'Oyster / 10 L',
      variantKeyEn: 'Oyster-10 L', variantImage: image },
    { pid: 'test-pid', vid: 'second-vid', variantSku: 'second-sku', variantImage: 'file:///tmp/wrong.png' },
  ];
  t.mock.method(cj, 'listVariants', async () => variants);
  t.mock.method(cj, 'getCost', async () => ({ ok: true, in_stock: true, cost_cents: 1000, on_hand: 3 }));
  const freight = t.mock.method(cj, 'quoteFreight', async (_, { zip }) => {
    if (zip === '28401') return [
      { logisticName: 'Test carrier', logisticPrice: 4, totalPostageFee: '5.20', logisticAging: '2-5' },
      { logisticName: 'Alternative carrier', logisticPrice: 4, taxesFee: '0.40' },
    ];
    if (zip === '98101') return [];
    if (zip === '96813') return [{ logisticName: 'Unpriced carrier', totalPostageFee: '-0.001' }];
    throw new Error('temporary upstream failure');
  });
  const selected = await cjVariants('test-pid');
  assert.equal(selected[0].vid, 'test-vid');
  assert.equal(selected[0].variantImage, image);
  assert.equal(selected[1].variantImage, null);
  const spec = { pid: 'test-pid', vid: 'test-vid', origin: 'US', zips: ['28401', '98101', '96813', '99501'] };
  const report = await cjCoverage(spec);
  assert.equal(report.quantity, 1);
  assert.equal(report.cost.on_hand, 3);
  assert.deepEqual(report.destinations, [
    { zip: '28401', status: 'QUOTED', options: [
      { logistics: 'Test carrier', postageCents: 520, quotedTransitDays: '2-5' },
      { logistics: 'Alternative carrier', postageCents: 440, quotedTransitDays: null },
    ] },
    { zip: '98101', status: 'NO_SERVICE', options: [] },
    { zip: '96813', status: 'UNKNOWN', options: [] },
    { zip: '99501', status: 'UNKNOWN', options: [] },
  ]);
  await assert.rejects(cjCoverage({ ...spec, zips: ['28401', '28401'] }), /distinct/);
  await assert.rejects(cjCoverage({ ...spec, vid: 'wrong-vid' }), /does not belong/);
  await assert.rejects(cjVariants('wrong-pid'), /invalid variant data/);
  assert.equal(freight.mock.callCount(), 4);
});
