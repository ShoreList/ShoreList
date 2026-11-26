import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateShoreMerch } from './shore-merch-gate.mjs';
const read = p => JSON.parse(fs.readFileSync(p, 'utf8'));
const catalog = read('shop-catalog.json');
const aliases = read('docs/shore-merch-retired-aliases.json');
const archive = read('docs/retired-items.json');
const merch = read('data/shore-merch.json');
const check = items => validateShoreMerch(items, catalog, aliases, archive);
const candidate = () => ({
  name: 'Dune Walk Cap',
  url: 'https://shorelist-shop.fourthwall.com/products/test-dune-walk-cap',
  image: 'https://imgproxy.fourthwall.dev/abc/w:720/sm:1/enc/def.jpg',
  price: 4200, vary: false,
  review: {
    evidence: 'fixture only', officialCatalogVerified: true, colors: ['Navy'],
    scores: {brandFit:90,localAccuracy:90,productFidelity:90,customerClarity:90,originality:90}
  }
});
test('curated existing listings pass with or without verified style photo', () => {
  check(merch);
  check([candidate()]);
});
test('publicly available retired Fourthwall URLs stay out, including renamed aliases', () => {
  for (const slug of Object.keys(aliases)) {
    const p = candidate();
    p.url = 'https://shorelist-shop.fourthwall.com/products/' + slug;
    assert.throws(() => check([p]), /retired or held/, slug);
  }
});
test('does not accept off-store, query-string, or duplicate product links', () => {
  for (const url of ['https://other.fourthwall.com/products/dune', candidate().url + '?hide=1']) {
    assert.throws(() => check([{...candidate(),url}]), /invalid or duplicate/);
  }
  assert.throws(() => check([candidate(),candidate()]), /invalid or duplicate/);
});
test('every individual required review score must be at least 90', () => {
  for (const score of [undefined,89,NaN,101]) {
    const p = candidate();
    p.review.scores.productFidelity = score;
    assert.throws(() => check([p]), /independent scores/);
  }
});
test('keeps off-brand wording, unverified grey and overpriced caps out', () => {
  for (const name of ['Dune Beach Club Cap','KJP Cap','Pier Tee','Poster Tee']) {
    assert.throws(() => check([{...candidate(), name}]), /disallowed/);
  }
  assert.throws(() => check([{...candidate(), price:4901}]), /price limit/);
  const p = candidate();
  p.review.colors = ['Heather Grey'];
  assert.throws(() => check([p]), /exact variant colors/);
});
test('an unverified, redrawn, or missing lookbook asset fails closed', () => {
  const p = candidate();
  p.lookbook = {path:'/shop-art/shore-merch-draft.webp',reference:p.image,
    method:'higgsfield-background-only',originalProductPixelsPreserved:true,fidelityEvidence:'fixture only'};
  assert.throws(() => check([p]), /verified original product pixels/);
  for (const method of ['image-edit','higgsfield-background-only']) {
    const fake = {...p,lookbook:{...p.lookbook,method,originalProductPixelsPreserved:false}};
    assert.throws(() => validateShoreMerch([fake],catalog,aliases,archive,() => true), /verified original product pixels/);
  }
  validateShoreMerch([p],catalog,aliases,archive,() => true);
});
