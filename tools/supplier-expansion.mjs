import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';
import cj from '../netlify/functions/_suppliers/cj.js';
import goods from '../netlify/functions/_goods.js';
import { coastalBrandIssues, MINIMUM_BRAND_SCORE, MINIMUM_PRODUCT_MEAN, productScoreIssues } from './coastal-brand-review.mjs';

const root = new URL('../', import.meta.url);
const load = async (path) => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const API = 'https://api.fourthwall.com/open-api/v1.0';
const KNOWN_FOURTHWALL_OFFER = 'salt-wash-organic-cotton-market-tote';
const HARD_RULES = ['noGrey', 'noClubWording', 'noBadgesOrCircles', 'noStrayLetteringOrNumbers', 'noCheapPhotography'];
const GREY = /\b(gr[ae]y|charcoal|slate|ash|graphite|pepper|smoke|storm|concrete|pewter|steel)\b/i;
const CLUB = /\b(beach|yacht)[\s-]+club\b/i;
const normalize = (s) => String(s ?? '').normalize('NFKC').toLowerCase().replace(/[^a-z0-9]/g, '');
const hasText = (value) => typeof value === 'string' && value.trim().length > 0;
const https = (str) => {
  if (!hasText(str)) return false;
  try { const url = new URL(str); return url.protocol === 'https:' && !url.username && !url.password; }
  catch { return false; }
};
const scoreValid = (v) => Number.isFinite(v) && v >= 0 && v <= 10;
const money = (v) => Number.isSafeInteger(v) && v >= 0;
const promotionalRevenue = (retail, shipping) => retail - Math.ceil(retail * 15 / 100) + shipping;

// A queue status change is operational. All other submission fields are reviewed.
export function releaseRevision({ status, coastalBrandReview, ownerApproval, ...submission }) {
  const canonical = JSON.stringify(submission, (_, value) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return value;
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, value[key]]));
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export const FOURTHWALL_REVIEW_CATEGORIES = Object.freeze([
  'brandAndLocalIdentity', 'garmentAndMaterialQuality', 'artworkAndManufacturing',
  'photographyAndPresentation', 'commercialAndCustomerExperience',
]);
const FOURTHWALL_COMPLIANCE = [
  'intellectualPropertyAndRights', 'labelingAndCare', 'safetyAndApplicableRegulation',
  'truthfulAdvertising', 'checkoutAndFulfillment',
];

// Scores are supplied by independent reviewers, never inferred or averaged.
// These records are included in releaseRevision, so changing one invalidates approval.
export function fourthwallQualityIssues(review, compliance) {
  const issues = [];
  if (review?.independent !== true || !hasText(review?.reviewer)) {
    issues.push('independent five-category Fourthwall review');
  }
  for (const category of FOURTHWALL_REVIEW_CATEGORIES) {
    const entry = review?.categories?.[category];
    if (!Number.isInteger(entry?.score) || entry.score < 90 || entry.score > 100 ||
        !hasText(entry.evidence)) issues.push('Fourthwall ' + category + ' requires 90/100 with evidence');
  }
  for (const rule of FOURTHWALL_COMPLIANCE) {
    if (compliance?.[rule]?.pass !== true || !hasText(compliance[rule].evidence)) {
      issues.push('Fourthwall compliance evidence: ' + rule);
    }
  }
  return issues;
}

// This evaluates evidence supplied by reviewers. It never assigns a score.
export function releaseIssues(item) {
  const issues = [];
  if (!item.skuVerified || !hasText(item.supplierSku) || !https(item.supplierUrl)) issues.push('exact supplier SKU');
  if (!hasText(item.catalogReconciliation)) issues.push('cross-store duplicate review');
  if (!hasText(item.shippingEvidence) || !hasText(item.checkoutEvidence)) issues.push('shipping, fulfillment and checkout evidence');
  if (item.inStock !== true || !Array.isArray(item.colors) || !item.colors.length || item.colors.some((c) => !hasText(c) || GREY.test(c))) {
    issues.push('available approved colorways');
  }
  if (CLUB.test(item.title) || CLUB.test(item.description ?? '') ||
      !HARD_RULES.every((rule) => item.hardRuleReview?.[rule]?.pass === true && hasText(item.hardRuleReview[rule].evidence))) {
    issues.push('hard-rule review');
  }
  const cost = item.landedCost;
  if (!cost || ![cost.productCents, cost.supplierShippingCents, cost.otherCents, cost.paymentFeesCents,
    cost.shippingRevenueCents, item.retail].every(money) || cost.productCents <= 0 || item.retail <= 0 ||
    cost.currency !== 'USD' || !hasText(cost.evidence)) {
    issues.push('verified landed cost and promotional margin');
  } else {
    if (promotionalRevenue(item.retail, cost.shippingRevenueCents) <=
        cost.productCents + cost.supplierShippingCents + cost.otherCents + cost.paymentFeesCents) {
      issues.push('nonpositive contribution after 15% discount');
    }
  }
  const photos = [item.lookbook, item.studio];
  if (!photos.every((x, i) => x && https(x.url) && /^[a-f0-9]{64}$/.test(x.sha256) &&
      x.role === ['lookbook', 'studio'][i] && x.variantSku === item.supplierSku && hasText(x.evidence)) ||
      photos[0]?.url === photos[1]?.url || photos[0]?.sha256 === photos[1]?.sha256 || item.studio?.actualProduct !== true) {
    issues.push('distinct exact-product images in lookbook, studio order');
  }
  issues.push(...productScoreIssues(item.scores, item.scoreEvidence));
  if (item.supplier === 'fourthwall') {
    issues.push(...fourthwallQualityIssues(item.fiveCategoryReview, item.complianceReview));
  }
  const photo = item.independentPhotoReview;
  if (!photo || photo.blind !== true || !scoreValid(photo.score) || photo.score < 8 ||
      !hasText(photo.reviewer) || !hasText(photo.evidence) ||
      photo.lookbookSha256 !== item.lookbook?.sha256 || photo.studioSha256 !== item.studio?.sha256) {
    issues.push('independent blind review of the exact photo pair');
  }
  const revision = releaseRevision(item);
  const brand = coastalBrandIssues(item.coastalBrandReview);
  issues.push(...brand);
  if (brand.length === 0 && item.coastalBrandReview.reviewedRevision !== revision) {
    issues.push('coastal luxury review is for a different submission revision');
  }
  if (!hasText(item.ownerApproval?.evidence) || item.ownerApproval?.approved !== true ||
      item.ownerApproval.reviewedRevision !== revision) {
    issues.push('owner approval of the exact submission revision');
  }
  return issues;
}

export function harborReleaseIssues(listing, queue) {
  if (listing.store !== 'fourthwall') return ['Harbor Goods requires a Fourthwall checkout'];
  if ([listing.name, listing.meta, listing.alt].some((value) => CLUB.test(value ?? ''))) {
    return ['Harbor Goods customer copy contains prohibited club wording'];
  }
  const matches = queue.items.filter((candidate) => candidate.supplier === 'fourthwall' &&
    candidate.supplierUrl === listing.url && normalize(candidate.title) === normalize(listing.name));
  if (matches.length !== 1 || matches[0].status === 'RESEARCH_ONLY') {
    return ['one release-ready Fourthwall record for this exact product URL and name'];
  }
  const [candidate] = matches;
  const issues = releaseIssues(candidate);
  if (candidate.supplierSku !== listing.sku || candidate.retail !== Math.round(listing.price * 100)) {
    issues.push('storefront SKU and price must match the reviewed submission');
  }
  if (listing.img !== candidate.lookbook?.url || listing.lookbook !== candidate.lookbook?.url ||
      listing.studio !== candidate.studio?.url) {
    issues.push('storefront images must match the reviewed lookbook and studio pair');
  }
  return issues;
}

export async function fourthwall(path, { auth, method = 'GET', body } = {}) {
  const response = await fetch(API + path, {
    method,
    headers: {
      ...(auth ? { Authorization: auth } : {}),
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(45000),
    redirect: 'error',
  });
  if (!response.ok) throw new Error('Fourthwall ' + method + ' failed (HTTP ' + response.status + ')');
  return response.json();
}

function fourthwallAuth() {
  const { FOURTHWALL_API_USERNAME: user, FOURTHWALL_API_PASSWORD: pass } = process.env;
  if (!user || !pass) throw new Error('Fourthwall Platform API credentials unavailable');
  return 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');
}

export function selectedVariants(template, colors, sizes) {
  if (![colors, sizes].every((values) => Array.isArray(values) && values.length && values.every(hasText)) ||
      colors.some((color) => GREY.test(color))) throw new Error('Select available, non-grey colors and sizes explicitly');
  const variants = [];
  for (const color of colors) {
    const entry = template.colorVariants.find((v) => v.color.name === color && v.available);
    for (const size of sizes) {
      const variant = entry?.sizeVariants.find((v) => v.size === size && v.available);
      if (!variant || variant.price?.currency !== 'USD' || !Number.isFinite(variant.price.amount) || variant.price.amount <= 0) {
        throw new Error('Selected Fourthwall color and size has no verified USD cost or stock');
      }
      variants.push({ color, size, variantId: variant.variantId, baseCents: Math.round(variant.price.amount * 100) });
    }
  }
  return variants;
}

async function uploadArt(file, bytes, auth) {
  const contentType = 'image/png';
  const size = bytes.byteLength;
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const { uploadUrl, fileUrl } = await fourthwall('/media/upload-url', {
    auth, method: 'POST', body: { fileName: basename(file), contentType, size },
  });
  const upload = new URL(uploadUrl);
  if (!https(uploadUrl) || upload.hostname !== 'storage.googleapis.com' || !https(fileUrl)) {
    throw new Error('Fourthwall returned an unexpected upload destination');
  }
  const result = await fetch(upload, {
    method: 'PUT', headers: { 'Content-Type': contentType, 'x-goog-content-length-range': '0,' + size },
    body: bytes, signal: AbortSignal.timeout(45000), redirect: 'error',
  });
  if (!result.ok) throw new Error('Fourthwall artwork upload failed (HTTP ' + result.status + ')');
  const { id } = await fourthwall('/media/images', { auth, method: 'POST', body: { fileUrl, width, height } });
  if (!/^img_[\w-]+$/.test(id)) throw new Error('Fourthwall did not return a media ID');
  return id;
}

async function existingOffers(auth) {
  const offers = [];
  for (let page = 0; ; page++) {
    const result = await fourthwall('/products?' + new URLSearchParams({ page, size: 100 }), { auth });
    if (!Array.isArray(result.results) || !Number.isSafeInteger(result.totalPages) || result.totalPages < 0) {
      throw new Error('Fourthwall inventory could not be reconciled');
    }
    offers.push(...result.results);
    if (page + 1 >= result.totalPages) break;
  }
  if (!offers.some((offer) => offer.slug === KNOWN_FOURTHWALL_OFFER)) {
    throw new Error('Fourthwall credentials did not resolve the known ShoreList offer');
  }
  return offers;
}

export async function stageDrafts(specs, plans, queue, catalog) {
  if (!Array.isArray(specs) || !specs.length) throw new Error('Provide one or more Fourthwall draft specs');
  const auth = fourthwallAuth();
  const offers = await existingOffers(auth);
  const titles = new Set([
    ...offers.map((item) => item.name),
    ...[...catalog.items, ...(catalog.harborGoods ?? [])].map((item) => item.name),
  ].map(normalize));
  const prepared = [];
  for (const spec of specs) {
    const item = queue.items.find((x) => x.title === spec.title && x.supplier === 'fourthwall');
    const plan = item && plans[item.title];
    if (!plan?.templateId || !plan.description || CLUB.test(plan.description) || titles.has(normalize(spec.title))) {
      throw new Error('Unknown or duplicate candidate, or no eligible draft template and copy');
    }
    if (!hasText(spec.file) || !hasText(spec.region) || !money(spec.profitCents) || spec.profitCents <= 0) {
      throw new Error('Specify a PNG file, product region and positive profit in cents per draft');
    }
    const template = await fourthwall('/product-templates/' + encodeURIComponent(plan.templateId));
    const area = template.customizableAreas.find((entry) =>
      entry.regionId === spec.region && entry.available && entry.supportsBackendRendering);
    if (!template.supportsBackendRendering || !area || template.minimumOrdersNumber > 0) {
      throw new Error('Fourthwall template requires a different fulfillment or design workflow: ' + item.title);
    }
    const variants = selectedVariants(template, spec.colors, spec.sizes);
    const bytes = await readFile(spec.file);
    if (bytes.length < 33 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
        bytes.toString('ascii', 12, 16) !== 'IHDR' || !bytes.readUInt32BE(16) || !bytes.readUInt32BE(20)) {
      throw new Error('Draft artwork must be a PNG with valid dimensions');
    }
    if (area.dimensions?.pixelsWidth > bytes.readUInt32BE(16) || area.dimensions?.pixelsHeight > bytes.readUInt32BE(20)) {
      throw new Error('Draft artwork is smaller than the Fourthwall region');
    }
    titles.add(normalize(item.title));
    prepared.push({ spec, plan, variants, bytes });
  }
  // Serial writes. A failed or ambiguous create stops the batch. Reconcile the offer
  // catalog before retrying, since the API does not document an idempotency key.
  for (const [index, { spec, plan, variants, bytes }] of prepared.entries()) {
    if (index) await delay(12500);
    const imageId = await uploadArt(spec.file, bytes, auth);
    try {
      const result = await fourthwall('/products', {
        auth, method: 'POST', body: {
          type: 'design',
          productTemplateId: plan.templateId,
          name: spec.title,
          description: plan.description,
          regions: [{ region: spec.region, imageId, placementStrategy: 'AUTO' }],
          colors: spec.colors,
          sizes: spec.sizes,
          profitMargin: spec.profitCents / 100,
          publishOnCreate: false,
        },
      });
      if (!result.productId) throw new Error('Missing product ID');
      console.log(JSON.stringify({ title: spec.title, productId: result.productId, variants,
        artSha256: createHash('sha256').update(bytes).digest('hex'), status: 'HIDDEN' }));
    } catch {
      throw new Error('Draft outcome needs reconciliation before retry: ' + spec.title);
    }
  }
}

export async function cjVariants(pid) {
  if (!cj.configured()) throw new Error('CJ API credential unavailable');
  if (!/^[a-z\d-]+$/i.test(pid ?? '')) throw new Error('Provide a valid CJ product ID');
  const variants = await cj.listVariants(pid);
  if (!Array.isArray(variants) || variants.some((variant) =>
    String(variant?.pid) !== pid || !/^[a-z\d-]+$/i.test(String(variant.vid ?? '')) ||
    !hasText(variant.variantSku))) {
    throw new Error('CJ returned invalid variant data for the supplied product');
  }
  return variants.map(({ vid, variantSku, variantNameEn, variantKeyEn, variantImage }) => ({
    vid: String(vid), variantSku, variantNameEn: variantNameEn ?? null, variantKeyEn: variantKeyEn ?? null,
    variantImage: https(variantImage) ? variantImage : null,
  }));
}

async function cjStockedVariant({ pid, vid, origin }) {
  if (!hasText(vid) || !/^[A-Z]{2}$/.test(origin)) {
    throw new Error('Provide CJ variant ID and warehouse country');
  }
  const variants = await cjVariants(pid);
  const variant = variants.find((entry) => entry.vid === vid);
  if (!variant) throw new Error('CJ variant does not belong to the supplied product');
  const cost = await cj.getCost({ vid }, { from_country: origin });
  if (!cost.ok || !cost.in_stock) throw new Error('CJ cost or warehouse stock is unavailable');
  return { variant, cost };
}

async function cjSnapshot({ pid, vid, origin, zip }) {
  if (!/^\d{5}$/.test(zip)) throw new Error('Provide a five-digit US ZIP');
  const { variant, cost } = await cjStockedVariant({ pid, vid, origin });
  const freight = await cj.quoteFreight(vid, { origin, zip });
  if (!Array.isArray(freight) || !freight.length) throw new Error('No CJ freight options for this variant and ZIP');
  return { variant, cost, freight };
}

function cjPostageCents(quote) {
  const charges = quote.totalPostageFee == null ?
    [quote.logisticPrice, quote.taxesFee ?? 0, quote.clearanceOperationFee ?? 0] : [quote.totalPostageFee];
  const amounts = charges.map((value) =>
    (typeof value === 'number' || hasText(value)) && Number(value) >= 0
      ? Math.round(Number(value) * 100) : NaN);
  const total = amounts.reduce((sum, cents) => sum + cents, 0);
  return amounts.every(money) && money(total) ? total : null;
}

export async function cjCoverage({ pid, vid, origin, zips }) {
  if (!zips?.length || zips.length > 10 || zips.some((zip) => !/^\d{5}$/.test(zip)) ||
      new Set(zips).size !== zips.length) {
    throw new Error('Provide 1 to 10 distinct five-digit US ZIPs');
  }
  const { variant, cost } = await cjStockedVariant({ pid, vid, origin });
  const destinations = [];
  for (const zip of zips) {
    try {
      const quotes = await cj.quoteFreight(vid, { origin, zip });
      if (!Array.isArray(quotes)) throw new Error('Invalid freight response');
      const options = [];
      for (const quote of quotes) {
        if (!hasText(quote?.logisticName)) continue;
        const postageCents = cjPostageCents(quote);
        if (postageCents == null) continue;
        options.push({ logistics: quote.logisticName, postageCents,
          quotedTransitDays: quote.logisticAging ?? null });
      }
      const status = options.length ? 'QUOTED' : quotes.length ? 'UNKNOWN' : 'NO_SERVICE';
      destinations.push({ zip, status, options });
    } catch {
      destinations.push({ zip, status: 'UNKNOWN', options: [] });
    }
  }
  return { pid, vid, sku: variant.variantSku, origin, quantity: 1, cost, destinations };
}

export function cjDraft(spec, plan, { variant, cost, freight }) {
  const { title, origin, url, logistics, retailCents, shippingCents, otherCents, paymentFeesCents, leadDays, label } = spec;
  if (!https(url) || !['cjdropshipping.com', 'www.cjdropshipping.com'].includes(new URL(url).hostname) ||
      !hasText(label) || GREY.test(label) || !plan?.description || CLUB.test(plan.description) ||
      ![retailCents, shippingCents, otherCents, paymentFeesCents].every(money)) {
    throw new Error('CJ draft requires a supplier URL, non-grey variant label and complete cost inputs');
  }
  const quotes = freight.filter((entry) => entry.logisticName === logistics);
  if (quotes.length !== 1) throw new Error('Select one unambiguous CJ freight option');
  const quote = quotes[0];
  const supplierShippingCents = cjPostageCents(quote);
  if (supplierShippingCents == null) throw new Error('CJ freight cost is unavailable');
  const marginCents = promotionalRevenue(retailCents, shippingCents) -
    cost.cost_cents - supplierShippingCents - otherCents - paymentFeesCents;
  if (marginCents <= 0) throw new Error('CJ draft has nonpositive contribution after a 15% discount');

  const draft = {
    id: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    status: 'draft-not-live',
    collection: 'direct',
    name: title,
    url: '/shop',
    img: '',
    alt: '',
    meta: plan.description,
    price: retailCents / 100,
    store: 'goods',
    sku: variant.variantSku,
    price_cents: retailCents,
    shipping_cents: shippingCents,
    // This draft is backed by a single-unit freight quote.
    max_qty: 1,
    supplier: { name: 'CJ Dropshipping', url, origin, lead_days: leadDays, adapter: 'cj', logistic_name: logistics, from_country: origin },
    supplier_ship_cents: supplierShippingCents,
    variants: [{ id: 'selected', label, sku: variant.variantSku, price_cents: retailCents,
      cost_cents: cost.cost_cents, supplier_ref: { vid: String(variant.vid) } }],
  };
  const issues = goods.itemProblems(draft);
  if (issues.length) throw new Error('Invalid CJ draft: ' + issues.join(', '));
  return { draft, evidence: { pid: spec.pid, zip: spec.zip, onHand: cost.on_hand, quote, discountStressMarginCents: marginCents } };
}

async function main([command = 'audit', ...args]) {
  const [queue, plans, catalog, direct] = await Promise.all([
    load('docs/supplier-expansion-candidates.json'), load('docs/supplier-expansion-development.json'),
    load('shop-catalog.json'), load('dropship-catalog.json'),
  ]);
  const storefrontItems = [...catalog.items, ...(catalog.harborGoods ?? [])];
  const existing = new Set([...storefrontItems, ...direct.items].map((item) => normalize(item.name)));
  const publicItems = [...storefrontItems, ...direct.items.filter((item) => item.status === 'live')];
  if (command === 'audit') {
    if (queue.minimumMean !== MINIMUM_PRODUCT_MEAN || queue.minimumCoastalBrandMatch !== MINIMUM_BRAND_SCORE) {
      throw new Error('The supplier queue must match ShoreList’s coastal brand and product review thresholds');
    }
    for (const item of queue.items) {
      if (!plans[item.title]) throw new Error('Missing development record: ' + item.title);
      const issues = releaseIssues(item);
      for (const listed of publicItems.filter((entry) => normalize(entry.name) === normalize(item.title))) {
        if (issues.length || item.status === 'RESEARCH_ONLY') {
          throw new Error('Unapproved expansion candidate appears in a live catalog: ' + item.title);
        }
        if (listed.img !== item.lookbook.url || listed.studio !== item.studio.url) {
          throw new Error('Live catalog does not use the approved image pair: ' + item.title);
        }
      }
      console.log(JSON.stringify({ title: item.title, supplier: item.supplier, issues }));
    }
  } else if (command === 'revision' && args.length === 1) {
    const item = queue.items.find((candidate) => candidate.title === args[0]);
    if (!item) throw new Error('Unknown supplier candidate');
    console.log(releaseRevision(item));
  } else if (command === 'fourthwall-templates') {
    const ids = new Set(Object.values(plans).map((plan) => plan.templateId).filter(Boolean));
    for (const id of ids) {
      const { productId, name, priceFrom, priceTo, supportsBackendRendering, customizableAreas } =
        await fourthwall('/product-templates/' + encodeURIComponent(id));
      console.log(JSON.stringify({ productId, name, priceFrom, priceTo, supportsBackendRendering, customizableAreas }));
    }
  } else if (command === 'fourthwall-audit' && args.length === 0) {
    const offers = await existingOffers(fourthwallAuth());
    const titles = new Set(offers.map((offer) => normalize(offer.name)));
    const matchingCandidates = queue.items.filter((item) => titles.has(normalize(item.title))).map((item) => item.title);
    console.log(JSON.stringify({ knownShoreListOffer: KNOWN_FOURTHWALL_OFFER, offerCount: offers.length, matchingCandidates }));
  } else if (command === 'fourthwall-drafts' && args.length === 1) {
    await stageDrafts(JSON.parse(await readFile(args[0], 'utf8')), plans, queue, catalog);
  } else if (command === 'cj-search' && args.length === 1) {
    if (!cj.configured()) throw new Error('CJ API credential unavailable');
    const item = queue.items.find((x) => x.title === args[0] && x.supplier === 'cj');
    if (!item) throw new Error('Unknown CJ candidate');
    const result = await cj.searchProducts(plans[item.title].search, 'US');
    for (const entry of result.content.flatMap((group) => group.productList)) {
      console.log(JSON.stringify({ pid: entry.id, sku: entry.sku, name: entry.nameEn, sellPrice: entry.sellPrice }));
    }
  } else if (command === 'cj-inspect' && (args.length === 1 || args.length === 2)) {
    const [title, selectedPid] = args;
    if (!queue.items.some((entry) => entry.supplier === 'cj' && entry.title === title)) {
      throw new Error('Unknown CJ candidate');
    }
    const pid = selectedPid ?? plans[title].publicResearchLead?.pid;
    if (!pid) throw new Error('Use cj-search to find a product ID and then supply it explicitly');
    const variants = await cjVariants(pid);
    console.log(JSON.stringify({ title, pid, variants }, null, 2));
    if (!variants.length) process.exitCode = 1;
  } else if (command === 'cj-coverage' && args.length >= 4) {
    const [pid, vid, origin, ...zips] = args;
    const report = await cjCoverage({ pid, vid, origin, zips });
    console.log(JSON.stringify(report, null, 2));
    if (report.destinations.some((destination) => destination.status !== 'QUOTED')) process.exitCode = 1;
  } else if (command === 'cj-quote' && args.length === 4) {
    const [pid, vid, origin, zip] = args;
    const { variant, cost, freight } = await cjSnapshot({ pid, vid, origin, zip });
    console.log(JSON.stringify({ pid, vid, sku: variant.variantSku, origin, zip, cost, freight }, null, 2));
  } else if (command === 'cj-draft' && args.length === 1) {
    const spec = JSON.parse(await readFile(args[0], 'utf8'));
    if (!queue.items.some((item) => item.supplier === 'cj' && item.title === spec.title) || existing.has(normalize(spec.title))) {
      throw new Error('Unknown or duplicate CJ candidate');
    }
    const result = cjDraft(spec, plans[spec.title], await cjSnapshot(spec));
    console.log(JSON.stringify(result, null, 2));
  } else {
    throw new Error('Commands: audit, revision TITLE, fourthwall-templates, fourthwall-audit, fourthwall-drafts FILE, cj-search TITLE, cj-inspect TITLE [PID], cj-quote PID VID ORIGIN ZIP, cj-coverage PID VID ORIGIN ZIP..., cj-draft FILE');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2)).catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  });
}
