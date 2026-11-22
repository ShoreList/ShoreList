// Run: node tools/test-shop-analytics.mjs
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';
const src = fs.readFileSync(new URL('../shop-analytics.js', import.meta.url), 'utf8');
function run({ id, nav = {}, store = {}, require = false, gtag = false } = {}) {
  const listeners = {}; const pushed = []; const calls = [];
  const w = { navigator: nav, localStorage: { getItem: (k) => store[k] ?? null, setItem: (k, v) => { store[k] = v; }, removeItem: (k) => { delete store[k]; } }, dataLayer: pushed };
  if (gtag) w.gtag = function () { calls.push([...arguments]); };
  const script = { getAttribute: (a) => (a === 'data-ga-id' ? id : a === 'data-require-consent' && require ? 'true' : null) };
  const d = { currentScript: script, querySelector: () => null, addEventListener: (n, f) => { listeners[n] = f; } };
  w.window = w; w.document = d;
  vm.runInNewContext(src, w);
  return { w, listeners, pushed, calls };
}
const item = { id: 'a', name: 'A', price: 30, collection: 'local-icons', store: 'shopify' };
let r = run({});                       // no id: nothing at all
r.w.ShopAnalytics.addToCart(item); r.w.ShopAnalytics.tidebotOpen('x'); assert.strictEqual(r.pushed.length, 0); assert.strictEqual(r.w.ShopAnalytics.enabled(), false);
r = run({ id: 'G-TEST1234' });         // dataLayer path
r.w.ShopAnalytics.viewItemList('grid', [item, item]); r.w.ShopAnalytics.viewItemList('grid', [item]);
r.w.ShopAnalytics.selectItem('grid', item); r.w.ShopAnalytics.addToCart(item, { variant: 'Navy / M' }); r.w.ShopAnalytics.beginCheckout([{ ...item, quantity: 2 }], 'shopify'); r.w.ShopAnalytics.tidebotOpen('launcher');
const ev = r.pushed.map((a) => [...a]);
assert.deepStrictEqual(ev.map((e) => e[1]), ['view_item_list', 'select_item', 'add_to_cart', 'begin_checkout', 'tidebot_open']);
assert.strictEqual(ev[0][2].items.length, 2); assert.strictEqual(ev[2][2].value, 30); assert.strictEqual(ev[3][2].value, 60); assert.strictEqual(ev[2][2].items[0].item_variant, 'Navy / M');
r = run({ id: 'G-TEST1234', gtag: true }); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.calls.length, 1); assert.strictEqual(r.pushed.length, 0);
for (const nav of [{ globalPrivacyControl: true }, { doNotTrack: '1' }]) { r = run({ id: 'G-TEST1234', nav }); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.pushed.length, 0, JSON.stringify(nav)); }
r = run({ id: 'G-TEST1234', store: { 'sl-analytics-optout': '1' } }); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.pushed.length, 0);
r = run({ id: 'G-TEST1234', require: true }); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.pushed.length, 0); r.w.ShopAnalytics.setConsent(true); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.pushed.length, 1);
r = run({ id: 'not-an-id' }); r.w.ShopAnalytics.tidebotOpen(); assert.strictEqual(r.pushed.length, 0);
r = run({ id: 'G-TEST1234' }); r.listeners['shopanalytics:add_to_cart']({ detail: { item } }); assert.strictEqual(r.pushed.length, 1);
console.log('shop-analytics ok');
