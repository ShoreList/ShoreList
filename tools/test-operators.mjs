// Proves data/operators.json reproduces the old hard-coded tables exactly, and that the public file leaks nothing server-only.
// Run: node tools/test-operators.mjs   (exits 1 on any failure)
import fs from 'node:fs';
import assert from 'node:assert';
import { createRequire } from 'node:module';
import { loadOperators, toPublic, publicJson } from './operators-lib.mjs';

const require = createRequire(import.meta.url);
const legacy = JSON.parse(fs.readFileSync(new URL('./fixtures/legacy-operators-snapshot.json', import.meta.url), 'utf8'));
const data = loadOperators();
const shared = require('../netlify/functions/_shared.js');
let n = 0;
const t = (name, fn) => { fn(); n++; console.log('ok  ' + name); };

t('server table: every legacy TOURS entry is identical (category, label, operator, live, days, slots, rules, months), same ids', () => {
  assert.deepStrictEqual(Object.keys(shared.TOURS).sort(), Object.keys(legacy.TOURS).sort());
  for (const [id, old] of Object.entries(legacy.TOURS)) {
    const now = shared.getTour(id);
    for (const k of Object.keys(old)) assert.deepStrictEqual(now[k], old[k], id + '.' + k);
    for (const k of ['rules', 'months']) assert.strictEqual(k in now, k in old, id + ' has ' + k);
  }
});
t('server prices: PRICES[id] == tour.priceCents for every id (and no new ids)', () => {
  assert.deepStrictEqual(Object.keys(legacy.PRICES).sort(), Object.keys(shared.TOURS).sort());
  for (const [id, c] of Object.entries(legacy.PRICES)) assert.strictEqual(shared.getTour(id).priceCents, c, id);
});
t('server capacity: CAPS[id] || 25 == tour.capacity for every id', () => {
  for (const id of Object.keys(legacy.PRICES)) assert.strictEqual(shared.getTour(id).capacity, legacy.CAPS[id] || 25, id);
});
t('city defaults: cancellation 24h, tax 7% "NC Sales Tax (7%)"', () => {
  assert.strictEqual(shared.CITY.defaults.cancellationHours, 24);
  assert.strictEqual(shared.CITY.defaults.tax.rate, 0.07);
  assert.strictEqual(shared.CITY.defaults.tax.label, 'NC Sales Tax (7%)');
});
t('browser OPS: public categories deep-equal the old OPS (values, category order, tour order, absent keys)', () => {
  const pub = toPublic(data).categories;
  assert.deepStrictEqual(pub, legacy.OPS);
  assert.deepStrictEqual(Object.keys(pub), Object.keys(legacy.OPS));
  for (const c of Object.keys(pub)) assert.deepStrictEqual(pub[c].map((o) => o.id), legacy.OPS[c].map((o) => o.id));
  assert.strictEqual(JSON.stringify(pub), JSON.stringify(legacy.OPS), 'same key order too');
});
t('committed operators-public.json is current', () => {
  assert.strictEqual(fs.readFileSync(new URL('../operators-public.json', import.meta.url), 'utf8'), publicJson(data));
});
t('public file leaks no server-only field', () => {
  const txt = fs.readFileSync(new URL('../operators-public.json', import.meta.url), 'utf8');
  for (const bad of ['stripeAccount', '"server"', 'operatorId', '"capacity"', 'defaults', 'tax"', 'timezone']) assert(!txt.includes(bad), 'leaked ' + bad);
  const planted = JSON.parse(JSON.stringify(data));
  planted.tours[0].secretField = 'S3CRET'; planted.tours[0].server = { x: 'S3CRET' }; planted.operators[0].server = { stripeAccount: 'acct_S3CRET' }; planted.operators[0].email = 'S3CRET@x.com';
  assert(!publicJson(planted).includes('S3CRET'), 'allowlist must drop unknown fields');
});
t('category-app.js and create-checkout.js hold no prices, slot tables or capacities any more', () => {
  const app = fs.readFileSync(new URL('../category-app.js', import.meta.url), 'utf8');
  const cc = fs.readFileSync(new URL('../netlify/functions/create-checkout.js', import.meta.url), 'utf8');
  assert(!/priceCents:\d/.test(app) && !/slots:\[/.test(app) && !/var OPS=\{\s*'/.test(app));
  assert(!/PRICES|CAPS\b/.test(cc) && !/'wwt-original'/.test(cc));
  assert(!/'wwt-original'/.test(fs.readFileSync(new URL('../netlify/functions/_shared.js', import.meta.url), 'utf8')));
});
t('loader refuses malformed data (bad price, unknown operator, duplicate tour, missing schedule)', () => {
  const src = fs.readFileSync(new URL('../netlify/functions/_shared.js', import.meta.url), 'utf8');
  const m = src.slice(src.indexOf('const isInt'), src.indexOf('// Loaded on first use'));
  const buildCity = new Function(m + '; return buildCity;')();
  const mut = (f) => { const d = JSON.parse(JSON.stringify(data)); f(d); return d; };
  buildCity(data);
  for (const f of [(d) => { d.tours[0].priceCents = 0; }, (d) => { d.tours[0].priceCents = 12.5; }, (d) => { d.tours[0].operatorId = 'nope'; }, (d) => { d.tours[1].id = d.tours[0].id; }, (d) => { delete d.tours[0].schedule; }, (d) => { d.tours[0].schedule.days = [7]; }, (d) => { d.schemaVersion = 2; }, (d) => { d.tours[0].capacity = 0; }])
    assert.throws(() => buildCity(mut(f)));
});
console.log(`\n${n} passed`);
