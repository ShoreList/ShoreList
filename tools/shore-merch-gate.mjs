import fs from 'node:fs';

const productUrl = /^https:\/\/shorelist-shop\.fourthwall\.com\/products\/([a-z0-9-]+)$/;
const officialImage = /^https:\/\/imgproxy\.fourthwall\.dev\/[\w/:-]+\.(jpg|png|webp)$/;
const lookbookPath = /^\/shop-art\/shore-merch-[a-z0-9-]+\.webp$/;
const excludedCopy = /\b(yacht(?:\s*&\s*beach)? club|beach club|shore thing|burgee|nantucket reds|vineyard vines|kiel james patrick|kjp|faherty|ralph lauren|helly hansen|great harbor|murray'?s|l\.?l\.?\s?bean)\b|[—–]/i;
const fadedGrey = /\b(gr[ae]y|charcoal|slate|ash|graphite|pepper|smoke|storm|concrete|pewter|steel)\b/i;
const scoreFields = ['brandFit','localAccuracy','productFidelity','customerClarity','originality'];

export function validateShoreMerch(merch, catalog, aliases, archive, assetExists = fs.existsSync) {
  if (!Array.isArray(merch)) throw new Error('Shore Merch catalog must be an array');
  const reserved = new Set();
  const retired = { ...catalog.retired?.archive, ...catalog.retired?.items };
  const blockedUrls = new Set(Object.values(archive.items || {}).map(x => x.item?.url));
  for (const p of merch) {
    const m = typeof p?.url === 'string' && p.url.match(productUrl);
    const reject = message => { throw new Error('Shore Merch [' + (p?.name || 'unnamed') + ']: ' + message); };
    if (!m || reserved.has(p.url)) reject('invalid or duplicate Fourthwall product URL');
    if (blockedUrls.has(p.url) || Object.hasOwn(retired,m[1]) || Object.hasOwn(retired,aliases[m[1]] ?? m[1])) reject('retired or held item');
    if (typeof p.name !== 'string' || !p.name.trim() || !officialImage.test(p.image) ||
        !Number.isSafeInteger(p.price) || p.price <= 0 || typeof p.vary !== 'boolean') reject('invalid listing data');
    const words = [p.name,p.alt,p.description].filter(Boolean).join(' ');
    if (excludedCopy.test(words) || (/\bpier\b/i.test(p.name) && !/\b(art|print|poster)\b/i.test(p.name)) ||
        (/\b(poster|big print)\b/i.test(words) && /\b(tee|shirt)\b/i.test(p.name))) reject('disallowed customer-facing copy');
    if ((/\bbeanie\b/i.test(p.name) && p.price > 3200) ||
        (/\b(cap|hat)\b/i.test(p.name) && p.price > 4900)) reject('outside cap or beanie price limit');
    const alreadyListed = (catalog.items || []).some(i => i.store === 'fourthwall' && i.url === p.url);
    if (!alreadyListed) {
      const q = p.review;
      if (!q?.evidence || !q.officialCatalogVerified || !Array.isArray(q.colors) || !q.colors.length ||
          q.colors.some(c => typeof c !== 'string' || !c.trim() || (fadedGrey.test(c) && !/\b(raw|unwashed)\b/i.test(c))) ||
          !scoreFields.every(k => Number.isInteger(q.scores?.[k]) && q.scores[k] >= 90 && q.scores[k] <= 100))
        reject('new listing needs exact variant colors, catalog verification and independent scores of at least 90/100');
    }
    if (p.lookbook) {
      const l = p.lookbook;
      if (!lookbookPath.test(l.path) || !officialImage.test(l.reference) || l.reference === l.path ||
          l.method !== 'higgsfield-background-only' || l.originalProductPixelsPreserved !== true ||
          !l.fidelityEvidence || !assetExists('.' + l.path))
        reject('lookbook must use verified original product pixels, a Higgsfield background and a local asset');
    }
    reserved.add(p.url);
  }
}
