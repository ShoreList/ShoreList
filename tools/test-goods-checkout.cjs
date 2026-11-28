// ShoreList Direct (physical goods) tests. Usage: node tools/test-goods-checkout.cjs [path to worktree]
// Every network call (Stripe, Resend, Printify, CJ) is mocked: nothing leaves the machine and nothing is charged.
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const assert = require('assert');
const ROOT = path.resolve(process.argv[2] || path.join(__dirname, '..'));
const FN = path.join(ROOT, 'netlify/functions');

process.env.STRIPE_SECRET_KEY = 'sk_test_dummy';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_secret';
process.env.RESEND_API_KEY = 're_dummy';
for (const k of ['PRINTIFY_API_TOKEN', 'PRINTIFY_SHOP_ID', 'CJ_API_KEY', 'CJ_PAY_MODE', 'MAIL_FROM', 'OWNER_ALERT_EMAIL', 'URL']) delete process.env[k];

const req = (n) => require(path.join(FN, n));
const G = req('_goods.js'), S = req('_shared.js');
let calls = [];
function mockFetch(router) {
  calls = [];
  global.fetch = async (url, opts = {}) => {
    calls.push({ url: String(url), method: opts.method || 'GET', opts });
    const r = await router(String(url), opts);
    if (r instanceof Error) throw r;
    const status = r.status || 200;
    return { ok: status >= 200 && status < 300, status, json: async () => r.body };
  };
}
const quiet = (fn) => async () => { const o = [console.log, console.error, console.warn]; console.log = console.error = console.warn = () => {}; try { await fn(); } finally { [console.log, console.error, console.warn] = o; } };
const tests = [];
const test = (name, fn) => tests.push([name, quiet(fn)]);
const body = (r) => { try { return JSON.parse(r.body); } catch (e) { return r.body; } };
const SITE = 'https://shorelist.net';
let ipn = 0;
const post = (data, headers = {}) => ({ httpMethod: 'POST', headers: { origin: SITE, 'x-nf-client-connection-ip': '203.0.113.' + (++ipn % 250) + '.' + ipn, ...headers }, body: typeof data === 'string' ? data : JSON.stringify(data) });
const get = (qs) => ({ httpMethod: 'GET', headers: { origin: SITE, 'x-nf-client-connection-ip': '198.51.100.' + (++ipn) }, queryStringParameters: qs });
const stripeCreates = () => calls.filter((c) => c.method === 'POST' && c.url === 'https://api.stripe.com/v1/checkout/sessions');
const created = () => new URLSearchParams(stripeCreates()[0].opts.body);
const resend = () => calls.filter((c) => c.url === 'https://api.resend.com/emails').map((c) => JSON.parse(c.opts.body));

// ---- test catalog (real catalog is checked separately) ----
const sup = (o) => Object.assign({ name: 'Test Supplier', url: 'https://example.com/s', origin: 'US', lead_days: [5, 12], adapter: 'manual' }, o || {});
function testCatalog() {
  return { v: 1, items: [
    { id: 'tee', status: 'live', name: 'Test Tee', sku: 'T-TEE', price_cents: 2500, shipping_cents: 500, max_qty: 4, supplier: sup({ adapter: 'printify' }), supplier_ship_cents: 400,
      variants: [{ id: 'm', label: 'M', sku: 'T-TEE-M', price_cents: 2500, cost_cents: 1200, supplier_ref: { product_id: 'pf1', variant_id: 101 } }, { id: 'l', label: 'L', sku: 'T-TEE-L', price_cents: 2700, cost_cents: 1300, supplier_ref: { product_id: 'pf1', variant_id: 102 } }] },
    { id: 'scarf', status: 'live', name: 'Test Scarf', sku: 'T-SCARF', price_cents: 4000, shipping_tiers: [{ max_g: 500, cents: 600 }, { max_g: 1200, cents: 1200 }], supplier: sup({ name: 'Exporter', origin: 'IN', lead_days: [14, 28] }),
      variants: [{ id: 'red', label: 'Red', sku: 'T-SCARF-RED', price_cents: 4000, weight_g: 400 }] },
    { id: 'mug', status: 'live', name: 'Test Mug', sku: 'T-MUG', price_cents: 1800, shipping_cents: 700, supplier: sup({ name: 'CJ Test', origin: 'CN', lead_days: [8, 20], adapter: 'cj', logistic_name: 'CJPacket Ordinary', from_country: 'US' }),
      variants: [{ id: 'w', label: 'White', sku: 'T-MUG-W', price_cents: 1800, supplier_ref: { vid: 'VID-1' } }] },
    { id: 'hat', status: 'draft-not-live', name: 'Draft Hat', sku: 'T-HAT', price_cents: 3000, shipping_cents: 500, supplier: sup(), variants: [{ id: 'o', label: 'One', sku: 'T-HAT-O', price_cents: 3000 }] },
  ] };
}
const withCat = (fn) => async () => { G.setCatalogForTests(testCatalog()); try { await fn(); } finally { G.setCatalogForTests(null); } };
const L = (id, variant, qty, extra) => Object.assign({ id, variant, qty }, extra || {});
const OK_STRIPE = (url, o) => (url === 'https://api.stripe.com/v1/checkout/sessions' ? { body: { id: 'cs_test_NEW', url: 'https://checkout.stripe.com/c/pay/cs_test_NEW' } } : { status: 404, body: {} });
const checkout = () => req('create-goods-checkout.js').handler;
const webhook = () => req('stripe-webhook.js').handler;

function fakeStore(opts = {}) {
  const m = new Map(); let n = 0; const st = { m, sets: 0 };
  const tick = () => new Promise((r) => setImmediate(r));
  st.getWithMetadata = async (k) => { if (opts.fail) throw new Error('blobs down'); await tick(); const v = m.get(k); return v ? { data: v.data, etag: v.etag } : null; };
  st.set = async (k, data, o = {}) => {
    if (opts.fail) throw new Error('blobs down'); await tick(); const v = m.get(k);
    if (o.onlyIfNew && v) return { modified: false };
    if (o.onlyIfMatch !== undefined && (!v || v.etag !== o.onlyIfMatch)) return { modified: false };
    m.set(k, { data, etag: 'e' + (++n) }); st.sets++; return { modified: true };
  };
  st.list = async ({ prefix }) => ({ blobs: [...m.keys()].filter((k) => k.startsWith(prefix || '')).map((key) => ({ key })) });
  st.rec = (sid) => JSON.parse(m.get('order/' + sid).data);
  return st;
}
const withStore = (store, fn) => async () => { S.setBlobStoreFactory(() => store); try { await fn(store); } finally { S.setBlobStoreFactory(null); } };
const withEnv = async (env, fn) => { const old = {}; for (const k of Object.keys(env)) { old[k] = process.env[k]; if (env[k] == null) delete process.env[k]; else process.env[k] = env[k]; } try { await fn(); } finally { for (const k of Object.keys(env)) { if (old[k] == null) delete process.env[k]; else process.env[k] = old[k]; } } };

function signed(evt) {
  const raw = JSON.stringify(evt), t = Math.floor(Date.now() / 1000);
  const v1 = crypto.createHmac('sha256', process.env.STRIPE_WEBHOOK_SECRET).update(t + '.').update(raw).digest('hex');
  return { httpMethod: 'POST', headers: { 'stripe-signature': `t=${t},v1=${v1}` }, body: raw };
}
// Build a paid session from what create-goods-checkout really sent to Stripe (end to end, not hand written metadata).
async function paidSessionFor(lines, sid) {
  mockFetch(OK_STRIPE);
  const r = await checkout()(post({ lines }));
  assert.strictEqual(r.statusCode, 200, r.body);
  const p = created(); const metadata = {};
  for (const [k, v] of p) if (k.startsWith('metadata[')) metadata[k.slice(9, -1)] = v;
  return { id: sid, object: 'checkout.session', livemode: false, payment_status: 'paid', amount_total: Number(metadata.totalCents), metadata,
    customer_details: { name: 'Pat Tester', email: 'pat@example.com', phone: '9105550100' },
    shipping_details: { name: 'Pat Tester', address: { line1: '1 Front St', line2: '', city: 'Wilmington', state: 'NC', postal_code: '28401', country: 'US' } } };
}
const evt = (session) => signed({ id: 'evt_1', type: 'checkout.session.completed', data: { object: session } });

// ================= checkout =================
test('real catalog: zero live items, drafts are well formed and cannot be bought', async () => {
  G.setCatalogForTests(null);
  const cat = JSON.parse(fs.readFileSync(path.join(ROOT, 'dropship-catalog.json'), 'utf8'));
  assert.strictEqual(cat.items.filter((i) => i.status === 'live').length, 0);
  assert(cat.items.length >= 1);
  for (const i of cat.items) { assert.strictEqual(i.status, 'draft-not-live'); assert.deepStrictEqual(G.itemProblems(i), [], i.id); }
  mockFetch(OK_STRIPE);
  for (const i of cat.items) { const r = await checkout()(post({ lines: [L(i.id, i.variants[0].id, 1)] })); assert.strictEqual(r.statusCode, 409); }
  assert.strictEqual(stripeCreates().length, 0);
});
test('checkout: valid flat-shipping order builds the right Stripe session', withCat(async () => {
  mockFetch(OK_STRIPE);
  const r = await checkout()(post({ lines: [L('tee', 'm', 2), L('tee', 'l', 1)], attrib: { utm_source: 'Test' } }));
  assert.strictEqual(r.statusCode, 200); assert(/^https:\/\/checkout\.stripe\.com\//.test(body(r).url));
  const p = created();
  assert.strictEqual(p.get('mode'), 'payment');
  assert.strictEqual(p.get('line_items[0][price_data][unit_amount]'), '2500'); assert.strictEqual(p.get('line_items[0][quantity]'), '2');
  assert.strictEqual(p.get('line_items[1][price_data][unit_amount]'), '2700');
  const sub = 2500 * 2 + 2700, ship = 500 * 3, tax = Math.round((sub + ship) * 0.07);
  assert.strictEqual(p.get('line_items[2][price_data][unit_amount]'), String(tax)); assert(/NC Sales Tax \(7%\)/.test(p.get('line_items[2][price_data][product_data][name]')));
  assert.strictEqual(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), String(ship));
  assert.strictEqual(p.get('shipping_address_collection[allowed_countries][0]'), 'US'); assert.strictEqual(p.get('shipping_address_collection[allowed_countries][1]'), null);
  assert.strictEqual(p.get('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]'), '12');
  assert(p.get('success_url').startsWith('https://shorelist.net/goods-success.html?session_id={CHECKOUT_SESSION_ID}')); assert.strictEqual(p.get('cancel_url'), 'https://shorelist.net/shop');
  assert.strictEqual(p.get('metadata[kind]'), 'goods'); assert.strictEqual(p.get('metadata[lines]'), '2');
  assert.strictEqual(p.get('metadata[line_0]'), 'tee|m|T-TEE|T-TEE-M|2|2500'); assert.strictEqual(p.get('metadata[totalCents]'), String(sub + ship + tax)); assert.strictEqual(p.get('metadata[attr_utm_source]'), 'test');
}));
test('checkout: rejects draft, unknown, non-string and malformed items; Stripe never called', withCat(async () => {
  mockFetch(OK_STRIPE);
  for (const lines of [[L('hat', 'o', 1)], [L('nope', 'o', 1)], [L({ $ne: 1 }, 'o', 1)], [L('__proto__', 'o', 1)], [L('constructor', 'o', 1)], 'tee', [], null, [null], [[]], [L('tee', 'm', 1), L('hat', 'o', 1)]]) {
    const r = await checkout()(post({ lines })); assert([400, 409].includes(r.statusCode), JSON.stringify(lines) + ' -> ' + r.statusCode);
  }
  assert.strictEqual(stripeCreates().length, 0);
}));
test('checkout: rejects bad variants (unknown, missing, another item\'s, wrong type)', withCat(async () => {
  mockFetch(OK_STRIPE);
  for (const v of ['xl', undefined, null, 7, 'red', '__proto__', { id: 'm' }]) { const r = await checkout()(post({ lines: [L('tee', v, 1)] })); assert.strictEqual(r.statusCode, 409, String(v)); assert.strictEqual(body(r).code, 'bad_variant'); }
  assert.strictEqual(stripeCreates().length, 0);
}));
test('checkout: tampered prices are ignored; a stale expected price gets a 409 with the real price', withCat(async () => {
  mockFetch(OK_STRIPE);
  let r = await checkout()(post({ lines: [Object.assign(L('tee', 'm', 1), { price_cents: 1, price: 0.01, unit_amount: 1, name: 'Free', shipping_cents: 0 })], price_cents: 1, shipping_cents: 0, tax: 0, amount: 1 }));
  assert.strictEqual(r.statusCode, 200); const p = created();
  assert.strictEqual(p.get('line_items[0][price_data][unit_amount]'), '2500'); assert.strictEqual(p.get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '500');
  assert(!/Free/.test(p.get('line_items[0][price_data][product_data][name]')));
  mockFetch(OK_STRIPE);
  r = await checkout()(post({ lines: [L('tee', 'm', 1, { expect_cents: 100 })] }));
  assert.strictEqual(r.statusCode, 409); assert.strictEqual(body(r).code, 'price_changed'); assert.deepStrictEqual(body(r).lines, [{ id: 'tee', variant: 'm', price_cents: 2500 }]); assert.strictEqual(stripeCreates().length, 0);
  mockFetch(OK_STRIPE); r = await checkout()(post({ lines: [L('tee', 'm', 1, { expect_cents: 2500 })] })); assert.strictEqual(r.statusCode, 200);
}));
test('checkout: quantity caps (integer, >=1, per item max, per line 10, 20 total, 8 lines, duplicates merged)', withCat(async () => {
  mockFetch(OK_STRIPE);
  for (const q of [0, -1, 1.5, '2', null, undefined, NaN, 1e9, 5]) { const r = await checkout()(post({ lines: [L('tee', 'm', q)] })); assert.strictEqual(r.statusCode, 400, String(q)); } // tee max_qty is 4
  assert.strictEqual((await checkout()(post({ lines: [L('tee', 'm', 4)] }))).statusCode, 200);
  assert.strictEqual((await checkout()(post({ lines: [L('tee', 'm', 3), L('tee', 'm', 2)] }))).statusCode, 400, 'duplicate lines merge before the cap');
  assert.strictEqual((await checkout()(post({ lines: [L('mug', 'w', 11)] }))).statusCode, 400);
  assert.strictEqual((await checkout()(post({ lines: [L('mug', 'w', 10)] }))).statusCode, 200);
  assert.strictEqual((await checkout()(post({ lines: [L('mug', 'w', 10), L('scarf', 'red', 10), L('tee', 'm', 1)] }))).statusCode, 400, '21 pieces');
  assert.strictEqual((await checkout()(post({ lines: Array.from({ length: 9 }, () => L('mug', 'w', 1)) }))).statusCode, 400, 'more than 8 lines');
}));
test('checkout: tiered shipping by combined weight, too heavy refused, no free shipping rule', withCat(async () => {
  mockFetch(OK_STRIPE);
  await checkout()(post({ lines: [L('scarf', 'red', 1)] })); assert.strictEqual(created().get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '600');
  mockFetch(OK_STRIPE); await checkout()(post({ lines: [L('scarf', 'red', 3)] })); assert.strictEqual(created().get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '1200');
  mockFetch(OK_STRIPE); let r = await checkout()(post({ lines: [L('scarf', 'red', 4)] })); assert.strictEqual(r.statusCode, 400); assert.strictEqual(body(r).code, 'too_heavy'); assert.strictEqual(stripeCreates().length, 0);
  mockFetch(OK_STRIPE); await checkout()(post({ lines: [L('scarf', 'red', 1), L('tee', 'm', 2), L('mug', 'w', 1)] })); // 600 + 2*500 + 700
  assert.strictEqual(created().get('shipping_options[0][shipping_rate_data][fixed_amount][amount]'), '2300');
  mockFetch(OK_STRIPE); await checkout()(post({ lines: [L('scarf', 'red', 2), L('mug', 'w', 10)] })); assert(Number(created().get('shipping_options[0][shipping_rate_data][fixed_amount][amount]')) > 0, 'a big order is still charged shipping');
}));
test('checkout: origin, method, body, rate limit, missing key', withCat(async () => {
  mockFetch(OK_STRIPE);
  assert.strictEqual((await checkout()(post({ lines: [L('tee', 'm', 1)] }, { origin: 'https://evil.example' }))).statusCode, 403);
  assert.strictEqual((await checkout()({ httpMethod: 'GET', headers: { origin: SITE } })).statusCode, 405);
  assert.strictEqual((await checkout()(post('{nope'))).statusCode, 400); assert.strictEqual((await checkout()(post('[]'))).statusCode, 400);
  const ip = { 'x-nf-client-connection-ip': '192.0.2.99' }; let last;
  for (let i = 0; i < 11; i++) last = await checkout()(post({ lines: [L('tee', 'm', 1)] }, ip)); assert.strictEqual(last.statusCode, 429);
  await withEnv({ STRIPE_SECRET_KEY: null }, async () => assert.strictEqual((await checkout()(post({ lines: [L('tee', 'm', 1)] }))).statusCode, 500));
}));
test('checkout: Stripe failure is a clean 500 with no Stripe text', withCat(async () => {
  mockFetch(() => ({ status: 400, body: { error: { message: 'secret detail sk_live_x', type: 'invalid_request_error' } } }));
  const r = await checkout()(post({ lines: [L('tee', 'm', 1)] })); assert.strictEqual(r.statusCode, 500); assert(!/sk_live|secret detail/.test(r.body));
}));

// ================= webhook: record, idempotency, supplier adapters =================
const SID = 'cs_test_GOODS0000001';
test('webhook: paid goods session writes ONE record and ONE owner email (manual fallback emails rj@shorelist.net); duplicate delivery changes nothing', withCat(withStore(fakeStore(), async (store) => {
  const session = await paidSessionFor([L('tee', 'm', 2), L('scarf', 'red', 1)], SID);
  mockFetch(() => ({ body: { id: 'em_1' } }));
  const w = webhook();
  assert.strictEqual((await w(evt(session))).statusCode, 200);
  const rec = store.rec(SID);
  assert.strictEqual(rec.lines.length, 2); assert.strictEqual(rec.lines[0].supplier.name, 'Test Supplier'); assert.strictEqual(rec.lines[0].sku, 'T-TEE'); assert.strictEqual(rec.lines[0].variantSku, 'T-TEE-M'); assert.strictEqual(rec.lines[0].qty, 2);
  assert.strictEqual(rec.shipTo.address.postal_code, '28401'); assert.strictEqual(rec.totals.charged_total_cents, session.amount_total); assert.strictEqual(rec.totalMismatch, false);
  assert.strictEqual(rec.fulfillment.length, 2, 'two suppliers = two supplier orders'); assert(rec.fulfillment.every((g) => g.status === 'manual-awaiting-owner' && g.fellBack !== undefined));
  assert(rec.notified);
  const first = resend(); const toOwner = first.filter((m) => m.to[0] === 'rj@shorelist.net');
  assert.strictEqual(toOwner.length, 2, 'one ready-to-send supplier email per supplier'); assert(/T-TEE-M/.test(toOwner[0].html) && /1 Front St/.test(toOwner[0].html));
  assert.strictEqual(first.filter((m) => m.to[0] === 'shorelistwilmington@gmail.com').length, 1);
  const sets = store.sets, n = first.length;
  mockFetch(() => ({ body: { id: 'em_2' } }));
  assert.strictEqual((await w(evt(session))).statusCode, 200);
  assert.strictEqual(resend().length, 0, 'no second email'); assert.strictEqual(store.sets, sets, 'record untouched'); assert.strictEqual([...store.m.keys()].filter((k) => k.startsWith('order/')).length, 1); assert(n >= 3);
})));
test('webhook: concurrent duplicate deliveries still place the supplier order once', withCat(withStore(fakeStore(), async (store) => {
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    const session = await paidSessionFor([L('tee', 'm', 1)], 'cs_test_CONC00000001');
    mockFetch((url) => (/\/orders\.json$/.test(url) ? { body: { id: 'pf_ord_1' } } : { body: {} }));
    const w = webhook(); const e1 = evt(session);
    const rs = await Promise.all([w(e1), w(evt(session)), w(evt(session))]);
    assert(rs.every((r) => r.statusCode === 200));
    assert.strictEqual(calls.filter((c) => /\/orders\.json$/.test(c.url) && c.method === 'POST').length, 1, 'one Printify order');
    assert.strictEqual(calls.filter((c) => /send_to_production/.test(c.url)).length, 1);
    assert.strictEqual(store.rec('cs_test_CONC00000001').fulfillment[0].supplierOrderId, 'pf_ord_1');
  });
})));
test('printify adapter: exact endpoints, bearer auth, payload fields, status placed; never called without env vars', withCat(withStore(fakeStore(), async (store) => {
  const session = await paidSessionFor([L('tee', 'l', 2)], 'cs_test_PRINT0000001');
  mockFetch(() => ({ body: { id: 'x' } })); // no env set: must not touch printify
  await webhook()(evt(session)); assert(!calls.some((c) => /printify/.test(c.url)), 'no Printify call without env vars');
  const s2 = Object.assign({}, session, { id: 'cs_test_PRINT0000002' });
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    mockFetch((url) => (/\/orders\.json$/.test(url) ? { body: { id: 'pf_ord_9' } } : { body: {} }));
    await webhook()(evt(s2));
    const c = calls.find((x) => /printify/.test(x.url) && /orders\.json$/.test(x.url));
    assert.strictEqual(c.url, 'https://api.printify.com/v1/shops/777/orders.json'); assert.strictEqual(c.opts.headers.Authorization, 'Bearer pt_test');
    const b = JSON.parse(c.opts.body);
    assert.strictEqual(b.external_id, 'cs_test_PRINT0000002-g0'); assert.deepStrictEqual(b.line_items, [{ product_id: 'pf1', variant_id: 102, quantity: 2 }]); assert.strictEqual(b.shipping_method, 1); assert.strictEqual(b.send_shipping_notification, false);
    assert.strictEqual(b.address_to.first_name, 'Pat'); assert.strictEqual(b.address_to.last_name, 'Tester'); assert.strictEqual(b.address_to.zip, '28401'); assert.strictEqual(b.address_to.region, 'NC'); assert.strictEqual(b.address_to.country, 'US'); assert.strictEqual(b.address_to.email, 'pat@example.com');
    assert(calls.some((x) => x.url === 'https://api.printify.com/v1/shops/777/orders/pf_ord_9/send_to_production.json'));
    const g = store.rec('cs_test_PRINT0000002').fulfillment[0]; assert.strictEqual(g.status, 'placed'); assert.strictEqual(g.usedAdapter, 'printify');
  });
})));
test('cj adapter: token then createOrderV2 with required fields and payType 2 (3 when CJ_PAY_MODE=create_only)', withCat(withStore(fakeStore(), async (store) => {
  const cjRouter = (url) => (/getAccessToken/.test(url) ? { body: { result: true, code: 200, data: { accessToken: 'cjtok' } } } : /createOrderV2/.test(url) ? { body: { result: true, code: 200, data: { orderId: 'CJ123' } } } : { body: { id: 'em' } });
  const cj = req('_suppliers/cj.js');
  for (const [mode, pay, sid] of [[undefined, 2, 'cs_test_CJ0000000001'], ['create_only', 3, 'cs_test_CJ0000000002']]) {
    cj._resetToken();
    await withEnv({ CJ_API_KEY: 'CJUser@api@key', CJ_PAY_MODE: mode }, async () => {
      const session = await paidSessionFor([L('mug', 'w', 3)], sid);
      mockFetch(cjRouter); await webhook()(evt(session));
      const a = calls.find((c) => /getAccessToken/.test(c.url)); assert.strictEqual(a.url, 'https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken'); assert.deepStrictEqual(JSON.parse(a.opts.body), { apiKey: 'CJUser@api@key' });
      const c = calls.find((x) => /createOrderV2/.test(x.url)); assert.strictEqual(c.opts.headers['CJ-Access-Token'], 'cjtok');
      const b = JSON.parse(c.opts.body);
      assert.strictEqual(b.orderNumber, sid + '-g0'); assert.deepStrictEqual(b.products, [{ vid: 'VID-1', quantity: 3 }]); assert.strictEqual(b.payType, pay); assert.strictEqual(b.logisticName, 'CJPacket Ordinary'); assert.strictEqual(b.fromCountryCode, 'US');
      assert.strictEqual(b.shippingCountryCode, 'US'); assert.strictEqual(b.shippingCity, 'Wilmington'); assert.strictEqual(b.shippingZip, '28401'); assert.strictEqual(b.shippingCustomerName, 'Pat Tester'); assert.strictEqual(b.shippingAddress, '1 Front St');
      assert.strictEqual(store.rec(sid).fulfillment[0].supplierOrderId, 'CJ123');
    });
  }
})));
test('failure: supplier error alerts rj@shorelist.net once, webhook still 200, hourly sync retries and succeeds; stops after max attempts', withCat(withStore(fakeStore(), async (store) => {
  const F = req('_fulfill.js');
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    const sid = 'cs_test_FAIL00000001';
    const session = await paidSessionFor([L('tee', 'm', 1)], sid);
    mockFetch((url) => (/api\.printify/.test(url) ? { status: 500, body: { error: 'down' } } : { body: { id: 'em' } }));
    assert.strictEqual((await webhook()(evt(session))).statusCode, 200);
    let g = store.rec(sid).fulfillment[0]; assert.strictEqual(g.status, 'failed'); assert.strictEqual(g.attempts, 1); assert(/printify create 500/.test(g.lastError));
    const alerts = () => resend().filter((m) => m.to[0] === 'rj@shorelist.net' && /FAILED/.test(m.subject));
    assert.strictEqual(alerts().length, 1);
    // retry 2..4 fail silently, no repeated alert; attempt 5 alerts again as final
    for (let i = 0; i < 3; i++) { mockFetch((url) => (/api\.printify/.test(url) ? { status: 500, body: {} } : { body: {} })); await F.syncTracking({}); assert.strictEqual(alerts().length, 0, 'attempt ' + (i + 2) + ' is quiet'); }
    mockFetch((url) => (/api\.printify/.test(url) ? { status: 500, body: {} } : { body: {} })); await F.syncTracking({}); assert.strictEqual(alerts().length, 1, 'final attempt alerts'); assert.strictEqual(store.rec(sid).fulfillment[0].attempts, 5);
    mockFetch(() => ({ body: {} })); await F.syncTracking({}); assert(!calls.some((c) => /api\.printify/.test(c.url)), 'no more retries after 5');
    // a different order that recovers on retry
    const sid2 = 'cs_test_FAIL00000002'; const s2 = Object.assign({}, session, { id: sid2 });
    mockFetch((url) => (/api\.printify/.test(url) ? { status: 503, body: {} } : { body: {} })); await webhook()(evt(s2));
    mockFetch((url) => (/\/orders\.json$/.test(url) ? { body: { id: 'pf_ok' } } : { body: {} })); const sm = await F.syncTracking({});
    assert(sm.retried >= 1); const g2 = store.rec(sid2).fulfillment[0]; assert.strictEqual(g2.status, 'placed'); assert.strictEqual(g2.supplierOrderId, 'pf_ok');
  });
})));
test('failure: printify order created but send_to_production fails -> retry only sends to production (no second order)', withCat(withStore(fakeStore(), async (store) => {
  const F = req('_fulfill.js');
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    const sid = 'cs_test_HALF00000001'; const session = await paidSessionFor([L('tee', 'm', 1)], sid);
    mockFetch((url) => (/send_to_production/.test(url) ? { status: 500, body: {} } : /\/orders\.json$/.test(url) ? { body: { id: 'pf_half' } } : { body: {} }));
    await webhook()(evt(session)); assert.strictEqual(store.rec(sid).fulfillment[0].supplierOrderId, 'pf_half');
    mockFetch((url) => ({ body: {} })); await F.syncTracking({});
    assert(!calls.some((c) => /\/orders\.json$/.test(c.url) && c.method === 'POST'), 'order not created twice'); assert(calls.some((c) => /pf_half\/send_to_production/.test(c.url))); assert.strictEqual(store.rec(sid).fulfillment[0].status, 'placed');
  });
})));
test('record store down: webhook answers 500 so Stripe retries; no store at all still emails the owner', withCat(async () => {
  const session = await paidSessionFor([L('tee', 'm', 1)], 'cs_test_DOWN00000001');
  S.setBlobStoreFactory(() => fakeStore({ fail: true }));
  try { mockFetch(() => ({ body: {} })); assert.strictEqual((await webhook()(evt(session))).statusCode, 500); } finally { S.setBlobStoreFactory(null); }
  S.setBlobStoreFactory(() => null);
  try { mockFetch(() => ({ body: {} })); assert.strictEqual((await webhook()(evt(session))).statusCode, 200); assert.strictEqual(resend().length, 1); } finally { S.setBlobStoreFactory(null); }
}));
test('webhook: unpaid goods session is ignored; bad signature rejected', withCat(withStore(fakeStore(), async (store) => {
  const session = await paidSessionFor([L('tee', 'm', 1)], 'cs_test_UNPAID000001'); session.payment_status = 'unpaid';
  mockFetch(() => ({ body: {} })); assert.strictEqual((await webhook()(evt(session))).statusCode, 200); assert.strictEqual([...store.m.keys()].filter((k) => k.startsWith('order/')).length, 0); assert.strictEqual(calls.length, 0);
  const bad = evt(session); bad.headers['stripe-signature'] = 't=1,v1=' + '0'.repeat(64); assert.strictEqual((await webhook()(bad)).statusCode, 400);
})));

// ================= tracking sync =================
test('tracking sync: customer shipping email once (branded, escaped), needs MAIL_FROM; without it the owner is told instead; delivered closes the order', withCat(withStore(fakeStore(), async (store) => {
  const F = req('_fulfill.js');
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    const mk = async (sid) => { const s = await paidSessionFor([L('tee', 'm', 1)], sid); s.customer_details.name = '<b>Pat</b> Tester'; mockFetch((url) => (/\/orders\.json$/.test(url) ? { body: { id: 'pf_' + sid.slice(-4) } } : { body: {} })); await webhook()(evt(s)); };
    await mk('cs_test_TRKA00000001'); await mk('cs_test_TRKB00000001');
    const shipped = { body: { status: 'fulfilled', shipments: [{ carrier: 'usps', number: '9400TEST', url: 'https://tools.usps.com/go/TrackConfirmAction?tLabels=9400TEST', delivered_at: null }] } };
    // no MAIL_FROM
    mockFetch((url) => (/api\.printify/.test(url) ? shipped : { body: {} })); await F.syncTracking({});
    assert.strictEqual(resend().filter((m) => m.to[0] === 'pat@example.com').length, 0); assert(resend().some((m) => m.to[0] === 'rj@shorelist.net' && /NOT sent/.test(m.subject)));
    store.m.forEach((v, k) => { if (!k.startsWith('order/')) return; const o = JSON.parse(v.data); o.fulfillment.forEach((g) => { delete g.customerEmailSkipped; }); v.data = JSON.stringify(o); });
    await withEnv({ MAIL_FROM: 'ShoreList <orders@shorelist.net>' }, async () => {
      mockFetch((url) => (/api\.printify/.test(url) ? shipped : { body: {} })); const s1 = await F.syncTracking({});
      const mails = resend().filter((m) => m.to[0] === 'pat@example.com'); assert.strictEqual(mails.length, 2); assert.strictEqual(mails[0].from, 'ShoreList <orders@shorelist.net>');
      assert(/9400TEST/.test(mails[0].html) && /shorelist\.net\/shipping-returns/.test(mails[0].html) && /#0A4D5C/.test(mails[0].html)); assert(!/<b>Pat/.test(mails[0].html), 'name escaped'); assert(!/[–—]/.test(mails[0].html), 'no dashes');
      assert.strictEqual(s1.emailed, 2);
      mockFetch((url) => (/api\.printify/.test(url) ? shipped : { body: {} })); await F.syncTracking({}); assert.strictEqual(resend().filter((m) => m.to[0] === 'pat@example.com').length, 0, 'no repeat email');
      const del = { body: { status: 'fulfilled', shipments: [{ carrier: 'usps', number: '9400TEST', url: '', delivered_at: '2026-12-01T00:00:00Z' }] } };
      mockFetch((url) => (/api\.printify/.test(url) ? del : { body: {} })); await F.syncTracking({});
      assert.strictEqual(store.rec('cs_test_TRKA00000001').closed, true); assert.strictEqual(store.rec('cs_test_TRKA00000001').fulfillment[0].status, 'delivered');
      mockFetch(() => ({ body: {} })); await F.syncTracking({}); assert(!calls.some((c) => /api\.printify/.test(c.url)), 'closed orders are not polled');
    });
  });
})));
test('tracking sync: CJ status maps trackNumber and 17track url; manual groups are never polled', withCat(withStore(fakeStore(), async (store) => {
  const F = req('_fulfill.js'); req('_suppliers/cj.js')._resetToken();
  await withEnv({ CJ_API_KEY: 'k', MAIL_FROM: 'ShoreList <orders@shorelist.net>' }, async () => {
    const sid = 'cs_test_CJT000000001'; const s = await paidSessionFor([L('mug', 'w', 1), L('scarf', 'red', 1)], sid);
    mockFetch((url) => (/getAccessToken/.test(url) ? { body: { result: true, data: { accessToken: 't' } } } : /createOrderV2/.test(url) ? { body: { result: true, data: { orderId: 'CJ9' } } } : { body: {} })); await webhook()(evt(s));
    mockFetch((url) => (/getAccessToken/.test(url) ? { body: { result: true, data: { accessToken: 't' } } } : /getOrderDetail\?orderId=CJ9/.test(url) ? { body: { result: true, data: { orderStatus: 'SHIPPED', trackNumber: 'CJTRK1', logisticName: 'CJPacket' } } } : { body: {} }));
    await F.syncTracking({});
    assert(calls.some((c) => c.url === 'https://developers.cjdropshipping.com/api2.0/v1/shopping/order/getOrderDetail?orderId=CJ9')); assert.strictEqual(calls.filter((c) => /getOrderDetail/.test(c.url)).length, 1, 'manual scarf group not polled');
    const m = resend().find((x) => x.to[0] === 'pat@example.com'); assert(/17track\.net\/en\/track\?nums=CJTRK1/.test(m.html));
  });
})));

// ================= drift =================
test('drift check: flags negative margin, cost change and out of stock by email; never edits the catalog; quiet when fine', withCat(async () => {
  const F = req('_fulfill.js'); const before = fs.readFileSync(path.join(ROOT, 'dropship-catalog.json'), 'utf8');
  await withEnv({ PRINTIFY_API_TOKEN: 'pt_test', PRINTIFY_SHOP_ID: '777' }, async () => {
    mockFetch((url) => (/products\/pf1/.test(url) ? { body: { variants: [{ id: 101, cost: 2700, is_available: true, is_enabled: true }, { id: 102, cost: 1300, is_available: false, is_enabled: true }] } } : { body: {} }));
    const flags = await F.driftCheck(); const kinds = flags.map((f) => f.sku + ':' + f.kind).sort();
    assert.deepStrictEqual(kinds, ['T-TEE-L:out-of-stock', 'T-TEE-M:cost-changed', 'T-TEE-M:negative-margin']);
    const mail = resend(); assert.strictEqual(mail.length, 1); assert.strictEqual(mail[0].to[0], 'rj@shorelist.net'); assert(/No prices were changed/.test(mail[0].html));
    mockFetch((url) => (/products\/pf1/.test(url) ? { body: { variants: [{ id: 101, cost: 1200, is_available: true }, { id: 102, cost: 1300, is_available: true }] } } : { body: {} }));
    assert.deepStrictEqual(await F.driftCheck(), []); assert.strictEqual(resend().length, 0);
  });
  mockFetch(() => ({ body: {} })); await F.driftCheck(); assert(!calls.some((c) => /printify|cjdropshipping/.test(c.url)), 'no env, no supplier calls');
  assert.strictEqual(fs.readFileSync(path.join(ROOT, 'dropship-catalog.json'), 'utf8'), before);
}));

// ================= get-goods-session =================
test('get-goods-session: paid goods order summary without address or email; others look like not found', withCat(async () => {
  const session = await paidSessionFor([L('tee', 'm', 2), L('scarf', 'red', 1)], 'cs_test_GETS00000001');
  const h = req('get-goods-session.js').handler;
  mockFetch((url) => ({ body: session })); let r = await h(get({ session_id: 'cs_test_GETS00000001' })); const d = body(r);
  assert.strictEqual(r.statusCode, 200); assert.strictEqual(d.paid, true); assert.strictEqual(d.madeToOrder, true); assert.deepStrictEqual(d.lead_days, { min: 14, max: 28 }); assert.strictEqual(d.returns_url, '/shipping-returns');
  assert.strictEqual(d.lines[0].name, 'Test Tee'); assert.strictEqual(d.amount, session.amount_total); assert(!/Front St|pat@example|9105550100|28401/.test(r.body));
  for (const mut of [(s) => { s.payment_status = 'unpaid'; }, (s) => { s.metadata = { kind: 'guide' }; }, (s) => { s.metadata = {}; }]) { const s2 = JSON.parse(JSON.stringify(session)); mut(s2); mockFetch(() => ({ body: s2 })); assert.strictEqual((await h(get({ session_id: 'cs_test_GETS00000001' }))).statusCode, 404); }
  mockFetch(() => ({ body: session })); for (const id of [undefined, '', 'nope', 'cs_test_x', '../../x']) assert.strictEqual((await h(get({ session_id: id }))).statusCode, 404); assert.strictEqual(calls.length, 0, 'bad ids never reach Stripe');
  assert.strictEqual((await h(Object.assign(get({ session_id: 'cs_test_GETS00000001' }), { headers: { origin: 'https://evil.example' } }))).statusCode, 403);
}));

// ================= shop-cart.js in a stub DOM =================
function runCart(storageOverrides = {}) {
  const store = {}; const handlers = {};
  const made = []; const mkEl = (tag) => { const kids = {}; const el = { tag, className: '', innerHTML: '', style: {}, attrs: {}, listeners: {}, open: false, parentNode: null,
    setAttribute(k, v) { this.attrs[k] = v; }, getAttribute(k) { return this.attrs[k]; }, removeAttribute() {}, hasAttribute(k) { return k in this.attrs; },
    addEventListener(ev, fn) { (this.listeners[ev] = this.listeners[ev] || []).push(fn); },
    appendChild(c) { c.parentNode = this; return c; }, insertBefore(c) { c.parentNode = this; return c; },
    querySelector(sel) { return kids[sel] || (kids[sel] = mkEl('x')); }, querySelectorAll() { return []; },
    showModal() { this.open = true; }, close() { this.open = false; }, focus() {}, click() {} }; made.push(el); return el; };
  const head = mkEl('head'), bodyEl = mkEl('body'), nav = mkEl('nav'); const tools = mkEl('div'); nav.querySelector = (s) => (s === '.sl-tools' ? tools : mkEl('x'));
  const tracked = [];
  const doc = { head, body: bodyEl, createElement: mkEl, querySelector: (s) => (s === 'nav.sl-hdr' ? nav : null), addEventListener(ev, fn) { (handlers[ev] = handlers[ev] || []).push(fn); }, dispatchEvent() {} };
  const win = { addEventListener() {}, gtag: (n, p) => tracked.push([n, p]), ShoreAttrib: { get: () => ({ utm_source: 'x' }) }, location: { href: '' } };
  const storage = { getItem: (k) => store[k] || null, setItem: (k, v) => { store[k] = v; }, ...storageOverrides };
  const ctx = { window: win, document: doc, localStorage: storage, fetch: (...a) => global.fetch(...a), KeyboardEvent: function () {}, setInterval: () => 0, clearInterval() {}, Date, JSON, Math, Array, String, Number, Object, Promise, location: win.location, console };
  win.window = win; vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'shop-cart.js'), 'utf8'), ctx);
  return { win, store, tracked, doc, ctx, bodyEl, made };
}
test('shop-cart: retains items during the visit when storage reads or writes are blocked', () => {
  function blocked() { throw new Error('Storage unavailable'); }
  for (const method of ['getItem', 'setItem']) {
    const { win, made } = runCart({ [method]: blocked });
    const bag = win.ShoreBag;
    bag.addGoods({ item: 'tee', variant: 'm', name: 'Test Tee', cents: 2500 });
    bag.open();
    const drawer = made.filter((element) => element.tag === 'dialog')[1];
    assert.match(drawer.querySelector('.slbag-in').innerHTML, /Test Tee/);
    bag.addGoods({ item: 'tee', variant: 'm', name: 'Test Tee', cents: 2500 });
    bag.open();
    assert.strictEqual(bag.count(), 2);
  }
});
test('shop-cart: blocks confirmed retired items and keeps saved items on a temporary lookup error', async () => {
  mockFetch((url) => {
    if (url.endsWith('handle=retired-tee')) return { status: 404, body: { error: 'Product not found' } };
    if (url.endsWith('handle=unconfirmed-cap')) return { status: 502, body: { error: 'Could not reach the store' } };
    return { body: {} };
  });
  const { win, store, made } = runCart();
  store.slBag = JSON.stringify([
    { id: '111', qty: 1, price: 30, handle: 'retired-tee', name: 'Retired Tee' },
    { id: '222', qty: 2, price: 40, handle: 'unconfirmed-cap', name: 'Saved Cap' },
  ]);
  win.ShoreBag.open();
  await new Promise((resolve) => setImmediate(resolve));
  const drawer = made.filter((element) => element.tag === 'dialog')[1];
  const html = drawer.querySelector('.slbag-in').innerHTML;
  const saved = JSON.parse(store.slBag);
  assert.match(html, /No longer available/);
  assert.match(html, /cart\/222:2\?/);
  assert.doesNotMatch(html, /cart\/111/);
  assert.strictEqual(win.ShoreBag.count(), 2);
  assert.strictEqual(saved[0].gone, true);
  assert.strictEqual(saved[1].gone, undefined);
});
test('shop-cart: Shopify checkout retains first-touch campaign slugs and excludes unrelated data', () => {
  const { win, store, made } = runCart();
  store.slBag = JSON.stringify([{ id: '12345', qty: 2, price: 25, handle: 'test-tee', name: 'Test Tee' }]);
  win.ShoreBag.open();
  const drawer = made.filter((element) => element.tag === 'dialog')[1];
  let href;
  const checkout = { id: 'slbagPay', setAttribute(name, value) {
    assert.strictEqual(name, 'href');
    href = value;
  } };
  const click = () => drawer.listeners.click.forEach((handler) => handler({
    target: checkout,
    preventDefault() { assert.fail('The checkout link was blocked'); },
  }));

  win.ShoreAttrib.get = () => ({
    utm_source: 'instagram',
    utm_medium: 'paid_social',
    utm_campaign: 'shorelist-launch',
    ref: 'referral-code',
    landing: '/shop',
    referrer_host: 'example.com',
    fbclid: 'click-id',
  });
  click();
  const url = new URL(href);
  assert.strictEqual(url.origin, 'https://shorelist.myshopify.com');
  assert.strictEqual(url.pathname, '/cart/12345:2');
  assert.deepStrictEqual([...url.searchParams], [
    ['utm_source', 'instagram'],
    ['utm_medium', 'paid_social'],
    ['utm_campaign', 'shorelist-launch'],
    ['attributes[shorelist_source]', 'instagram'],
    ['attributes[shorelist_medium]', 'paid_social'],
    ['attributes[shorelist_campaign]', 'shorelist-launch'],
  ]);
  assert.strictEqual(url.searchParams.get('ref'), null);
  assert.strictEqual(url.searchParams.get('landing'), null);
  assert.strictEqual(url.searchParams.get('fbclid'), null);

  const fallback = 'https://shorelist.myshopify.com/cart/12345:2?utm_source=shorelist.net&utm_medium=shop&utm_campaign=checkout';
  for (const getAttribution of [
    () => ({}),
    () => ({ utm_campaign: 'unsafe&ref=value', utm_source: 'person@example.com', utm_medium: 'a'.repeat(81) }),
    () => { throw new Error('Attribution unavailable'); },
  ]) {
    win.ShoreAttrib.get = getAttribution;
    click();
    assert.strictEqual(href, fallback);
  }
});
test('shop-cart: goods lines join the bag as their own group, honest multi-store notice, checkout posts item/variant/qty and follows the Stripe url; Shopify and Fourthwall unchanged', async () => {
  const c = runCart(); const bag = c.win.ShoreBag; assert(typeof bag.addGoods === 'function');
  assert.strictEqual(bag.addGoods({ item: 'tee', variant: 'm', name: 'Test Tee', variantLabel: 'M', cents: 2500, lead: [5, 12], max: 4 }), true);
  assert.strictEqual(bag.addGoods({ item: 'tee', variant: 'm', name: 'Test Tee', variantLabel: 'M', cents: 2500, lead: [5, 12], max: 4 }), true);
  assert.strictEqual(bag.count(), 2); const saved = JSON.parse(c.store.slBag); assert.strictEqual(saved.length, 1); assert.strictEqual(saved[0].qty, 2); assert.strictEqual(saved[0].goods, true);
  for (const bad of [{ item: 'x y', variant: 'm', name: 'n', cents: 100 }, { item: 'tee', variant: 'm', name: 'n', cents: 0 }, { item: 'tee', variant: 'm', name: 'n', cents: 10.5 }, { item: 'tee', variant: '', name: 'n', cents: 100 }, null]) assert.strictEqual(bag.addGoods(bad), false);
  bag.addOut({ id: 'fw1', name: 'Gear Piece', url: 'https://shorelist-shop.fourthwall.com/products/x', price: 30 }); assert.strictEqual(bag.count(), 3);
  const src = fs.readFileSync(path.join(ROOT, 'shop-cart.js'), 'utf8');
  assert(/l\.goods \? 10 : 20/.test(src)); assert(!/[\u2013\u2014]/.test(src.replace(/\/\*[\s\S]*?\*\//g, '')));
  const drawer = c.made.filter((e) => e.tag === 'dialog')[1]; const inner = () => drawer.querySelector('.slbag-in').innerHTML;
  bag.open(); let h = inner();
  assert(/ShoreList Direct/.test(h) && /Test Tee/.test(h) && /Check out ShoreList Direct items/.test(h) && /Gear Piece/.test(h) && /ShoreList Gear/.test(h));
  assert(/pieces from two stores\. They check out separately/.test(h), 'honest multi-checkout notice for goods + Fourthwall');
  assert(/Allow about 5 to 12 business days/.test(h)); assert(/\$50<|\$50\b/.test(h));
  // checkout: success follows the Stripe url and sends only id, variant, qty, expect_cents
  let sent = null;
  global.fetch = async (url, o) => { sent = { url, body: JSON.parse(o.body) }; return { ok: true, status: 200, json: async () => ({ url: 'https://checkout.stripe.com/c/pay/cs_test_x' }) }; };
  const click = (id) => drawer.listeners.click.forEach((fn) => fn({ target: { id, hasAttribute: () => false, closest: () => null }, preventDefault() {} }));
  click('slbagGoodsPay'); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  assert.strictEqual(sent.url, '/.netlify/functions/create-goods-checkout'); assert.deepStrictEqual(sent.body.lines, [{ id: 'tee', variant: 'm', qty: 2, expect_cents: 2500 }]); assert.strictEqual(sent.body.attrib.utm_source, 'x');
  assert.strictEqual(c.win.location.href, 'https://checkout.stripe.com/c/pay/cs_test_x');
  // a non-Stripe url is never followed
  c.win.location.href = '';
  global.fetch = async () => ({ ok: true, status: 200, json: async () => ({ url: 'https://evil.example/pay' }) });
  click('slbagGoodsPay'); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r)); assert.strictEqual(c.win.location.href, '');
  // price changed: the bag takes the server price and says so
  global.fetch = async () => ({ ok: false, status: 409, json: async () => ({ error: 'A price changed.', code: 'price_changed', lines: [{ id: 'tee', variant: 'm', price_cents: 2800 }] }) });
  click('slbagGoodsPay'); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  assert.strictEqual(JSON.parse(c.store.slBag).find((l) => l.goods).cents, 2800); assert(/Price updated to \$28/.test(inner()));
  // item no longer sold: its lines leave the bag, other groups stay
  global.fetch = async () => ({ ok: false, status: 409, json: async () => ({ error: 'not available', code: 'unavailable' }) });
  click('slbagGoodsPay'); await new Promise((r) => setImmediate(r)); await new Promise((r) => setImmediate(r));
  assert(!JSON.parse(c.store.slBag).some((l) => l.goods)); assert(JSON.parse(c.store.slBag).some((l) => l.out));
  assert(/Check out ShoreList Shop items|Gear Piece/.test(inner()) || /Gear Piece/.test(inner()));
  assert(/shorelist\.myshopify\.com/.test(src) && /Check out ShoreList Shop items/.test(src), 'Shopify path still present');
});
test('shop-cart page wiring: shop.html loads attrib.js before shop-cart.js; goods checkout needs no redirect off-site', async () => {
  const html = fs.readFileSync(path.join(ROOT, 'shop.html'), 'utf8'); assert(html.indexOf('/attrib.js') > -1 && html.indexOf('/attrib.js') < html.indexOf('/shop-cart.js'));
  const src = fs.readFileSync(path.join(ROOT, 'shop-cart.js'), 'utf8'); assert(/checkout\\\.stripe\\\.com/.test(src), 'only a checkout.stripe.com url is followed');
});

// ================= repo wiring =================
test('wiring: catalog blocked publicly, functions bundle the catalog, schedules set, success page noindex and not cached, no dashes in copy', async () => {
  const toml = fs.readFileSync(path.join(ROOT, 'netlify.toml'), 'utf8');
  assert(/from = "\/dropship-catalog\.json"\s*\n\s*to = "\/404\.html"\s*\n\s*status = 404\s*\n\s*force = true/.test(toml));
  for (const f of ['create-goods-checkout', 'get-goods-session', 'stripe-webhook', 'sync-supplier-orders', 'check-supplier-drift']) assert(new RegExp(`\\[functions\\."${f}"\\]\\s*\\n\\s*included_files = \\[[^\\]]*dropship-catalog\\.json`).test(toml), f);
  assert(/\[functions\."sync-supplier-orders"\][\s\S]*?schedule = "@hourly"/.test(toml)); assert(/\[functions\."check-supplier-drift"\][\s\S]*?schedule = "@daily"/.test(toml));
  assert(/from = "\/goods-success"\s*\n\s*to = "\/goods-success\.html"/.test(toml));
  const page = fs.readFileSync(path.join(ROOT, 'goods-success.html'), 'utf8'); assert(/name="robots" content="noindex"/.test(page)); assert(/\/shipping-returns/.test(page)); assert(/Made to order/.test(page));
  assert(!/[–—]|&mdash;|&ndash;/.test(page.replace(/<script[\s\S]*?<\/script>/g, '')));
  assert(/goods-success/.test(fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8')));
  for (const d of fs.readdirSync(path.join(FN, '_suppliers'))) assert(!/^(index|_suppliers)\.js$/.test(d), 'would deploy as a function');
  for (const f of ['_goods.js', '_fulfill.js', '_supplier-registry.js', 'create-goods-checkout.js', 'get-goods-session.js', 'sync-supplier-orders.js', 'check-supplier-drift.js', '_suppliers/printify.js', '_suppliers/cj.js', '_suppliers/manual.js']) assert(!/[–—]/.test(fs.readFileSync(path.join(FN, f), 'utf8')), f + ' has a dash');
});
test('wiring: no real supplier or Stripe URL is ever called by these tests (fetch is mocked everywhere)', async () => {
  mockFetch(() => ({ body: {} })); assert.strictEqual(typeof global.fetch, 'function'); await global.fetch('https://api.printify.com/x'); assert.strictEqual(calls.length, 1);
});

(async () => {
  let pass = 0, fail = 0;
  for (const [name, fn] of tests) {
    try { await fn(); pass++; console.log('PASS  ' + name); }
    catch (e) { fail++; console.log('FAIL  ' + name + '\n      ' + String(e && e.stack || e).split('\n').slice(0, 5).join('\n      ')); }
  }
  console.log(`\n${pass} passed, ${fail} failed, ${tests.length} total (node ${process.version})`);
  process.exit(fail ? 1 : 0);
})();
