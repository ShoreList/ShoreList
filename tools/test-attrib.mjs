// Booking-source attribution: server allowlist/caps/sanitize, Stripe metadata, owner email, browser script.
// Run: node tools/test-attrib.mjs   (fetch is mocked; nothing leaves the machine)
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
process.env.STRIPE_SECRET_KEY = 'sk_test_dummy'; process.env.STRIPE_WEBHOOK_SECRET = 'whsec_t'; process.env.RESEND_API_KEY = 're_dummy'; delete process.env.URL;
const S = require('../netlify/functions/_shared.js');
let n = 0; const tests = [];
const t = (name, fn) => tests.push([name, fn]);
let calls = [];
global.fetch = async (url, o = {}) => { calls.push({ url: String(url), o }); const body = String(url).includes('checkout/sessions?') ? { data: [], has_more: false } : String(url).includes('checkout/sessions') ? { url: 'https://checkout.stripe.com/x' } : { id: 'e1' }; return { ok: true, status: 200, json: async () => body }; };
const SITE = 'https://shorelist.net';
const ymd = (d) => d.toISOString().slice(0, 10);
const nyToday = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
let date = ''; for (let i = 1; i < 800; i++) { const d = new Date(nyToday + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + i); if (d.getUTCDay() !== 2) { date = ymd(d); break; } }
const slot = (date.slice(5) >= '03-15' && date.slice(5) <= '11-14') ? '9:00 AM' : '11:30 AM';
const post = (data) => ({ httpMethod: 'POST', headers: { origin: SITE, 'x-nf-client-connection-ip': '203.0.113.' + Math.floor(Math.random() * 200) }, body: JSON.stringify(data) });
const fresh = (f) => { for (const k of Object.keys(require.cache)) if (k.includes('/netlify/functions/')) delete require.cache[k]; return require('../netlify/functions/' + f).handler; };
const stripeBody = () => new URLSearchParams(calls.find((c) => c.o.method === 'POST' && c.url === 'https://api.stripe.com/v1/checkout/sessions').o.body);
const booking = (extra) => ({ operatorId: 'wwt-original', guestName: 'Pat', guestEmail: 'pat@example.com', date, timeSlot: slot, partySize: 1, ...extra });

t('cleanAttrib: allowlist only, strings only, lower-cased, sanitized, capped', () => {
  const a = S.cleanAttrib({ utm_source: 'Google', utm_medium: 'CPC<script>', utm_campaign: 'x'.repeat(500), ref: 'a"b\'c;d', landing: '/things-to-do/walking-tours', referrer_host: 'chat.openai.com', guestEmail: 'p@x.com', utm_term: 'k', extra: { a: 1 } });
  assert.deepStrictEqual(Object.keys(a).sort(), ['landing', 'ref', 'referrer_host', 'utm_campaign', 'utm_medium', 'utm_source']);
  assert.strictEqual(a.utm_source, 'google'); assert.strictEqual(a.utm_medium, 'cpcscript'); assert.strictEqual(a.utm_campaign.length, 80); assert.strictEqual(a.ref, 'abcd');
  assert.deepStrictEqual(S.cleanAttrib({ utm_source: 5, ref: ['x'], landing: {} }), {});
  for (const bad of [null, undefined, 'str', 7, [], [1]]) assert.deepStrictEqual(S.cleanAttrib(bad), {});
  assert.deepStrictEqual(S.attribMetadata({ utm_source: 'g', ref: 'r' }), { attr_utm_source: 'g', attr_ref: 'r' });
});
t('create-checkout: attribution lands in Stripe metadata; junk dropped; core metadata and price unaffected', async () => {
  calls = []; const r = await fresh('create-checkout.js')(post(booking({ attrib: { utm_source: 'Facebook', utm_medium: 'social', utm_campaign: 'spring', ref: 'amanda', landing: '/things-to-do/walking-tours', referrer_host: 'l.facebook.com', operatorId: 'james-surf', guestEmail: 'evil@x.com', holdId: 'x', priceInCents: 1 } })));
  assert.strictEqual(r.statusCode, 200); const p = stripeBody();
  assert.strictEqual(p.get('metadata[attr_utm_source]'), 'facebook'); assert.strictEqual(p.get('metadata[attr_ref]'), 'amanda'); assert.strictEqual(p.get('metadata[attr_landing]'), '/things-to-do/walking-tours'); assert.strictEqual(p.get('metadata[attr_referrer_host]'), 'l.facebook.com');
  assert.strictEqual(p.get('metadata[operatorId]'), 'wwt-original'); assert.strictEqual(p.get('metadata[guestEmail]'), 'pat@example.com'); assert.strictEqual(p.get('line_items[0][price_data][unit_amount]'), '2500');
  for (const [k] of p) if (k.startsWith('metadata[')) assert(/^metadata\[(?:operatorId|operatorName|category|categoryLabel|guestName|guestEmail|guestPhone|date|timeSlot|partySize|taxCents|notes|yearMonth|dateSlot|holdId|attr_(?:utm_source|utm_medium|utm_campaign|ref|landing|referrer_host))\]$/.test(k), k);
});
t('create-checkout: no attrib, or garbage attrib, still books normally with no attr_ keys', async () => {
  for (const a of [undefined, null, 'x', [1], 5, { utm_source: 7 }]) { calls = []; const r = await fresh('create-checkout.js')(post(booking({ attrib: a }))); assert.strictEqual(r.statusCode, 200); assert(![...stripeBody().keys()].some((k) => k.includes('attr_'))); }
});
t('create-guide-checkout: attribution in metadata; price and ids still server-side', async () => {
  calls = []; const r = await fresh('create-guide-checkout.js')(post({ product: 'beach-day-field-guide', attrib: { utm_source: 'Newsletter', landing: '/guides', referrer_host: 'google.com', amount: 1 }, price: 1 }));
  assert.strictEqual(r.statusCode, 200); const p = stripeBody();
  assert.strictEqual(p.get('metadata[attr_utm_source]'), 'newsletter'); assert.strictEqual(p.get('metadata[attr_landing]'), '/guides'); assert.strictEqual(p.get('metadata[guideIds]'), 'beach-day-field-guide'); assert.strictEqual(p.get('line_items[0][price_data][unit_amount]'), '1400');
  assert(![...p.keys()].some((k) => k.includes('attr_amount')));
});
const sign = (raw) => { const ts = Math.floor(Date.now() / 1000); return `t=${ts},v1=${crypto.createHmac('sha256', 'whsec_t').update(`${ts}.${raw}`).digest('hex')}`; };
t('owner emails show the source (escaped); no source row when none', async () => {
  const hook = (meta) => { const raw = JSON.stringify({ id: 'evt_' + Math.random(), type: 'checkout.session.completed', data: { object: { id: 'cs_test_abc', payment_status: 'paid', amount_total: 5350, metadata: meta } } }); return { httpMethod: 'POST', headers: { 'stripe-signature': sign(raw) }, body: raw }; };
  calls = []; await fresh('stripe-webhook.js')(hook({ operatorId: 'wwt-original', categoryLabel: 'T', operatorName: 'O', guestName: 'G', guestEmail: 'g@x.com', date, timeSlot: slot, partySize: '1', attr_utm_source: 'google', attr_utm_medium: 'organic', attr_landing: '/things-to-do/walking-tours', attr_ref: '<b>x</b>' }));
  let html = JSON.parse(calls.find((c) => c.url.includes('resend')).o.body).html;
  assert(html.includes('Source') && html.includes('google / organic') && html.includes('landing /things-to-do/walking-tours')); assert(!html.includes('<b>x</b>'));
  calls = []; await fresh('stripe-webhook.js')(hook({ operatorId: 'wwt-original', categoryLabel: 'T', operatorName: 'O', guestName: 'G', guestEmail: 'g@x.com', date, timeSlot: slot, partySize: '1' }));
  html = JSON.parse(calls.find((c) => c.url.includes('resend')).o.body).html; assert(!html.includes('>Source<'));
  calls = []; await fresh('stripe-webhook.js')(hook({ kind: 'guide', product: 'beach-day-field-guide', attr_utm_source: 'newsletter' }));
  html = JSON.parse(calls.find((c) => c.url.includes('resend')).o.body).html; assert(html.includes('Source: newsletter'));
});
t('get-bookings exposes source columns', () => { const s = fs.readFileSync(new URL('../netlify/functions/get-bookings.js', import.meta.url), 'utf8'); for (const k of ['attr_utm_source', 'attr_utm_medium', 'attr_utm_campaign', 'attr_ref', 'attr_landing', 'attr_referrer_host']) assert(s.includes(k)); assert(/'Source','Medium','Campaign','Ref','Landing page','Referrer'/.test(fs.readFileSync(new URL('../dashboard.html', import.meta.url), 'utf8'))); });
// browser script: first touch, no overwrite, no query string/hash in landing, storage blocked, no cookies
function browser({ url, referrer = '', store = new Map(), blocked = false }) {
  const u = new URL(url); const win = { location: u, sessionStorage: blocked ? { getItem() { throw new Error('x'); }, setItem() { throw new Error('x'); } } : { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) } };
  win.window = win; const doc = { referrer, get cookie() { throw new Error('cookies must not be read'); }, set cookie(v) { throw new Error('cookies must not be written'); } };
  vm.runInNewContext(fs.readFileSync(new URL('../attrib.js', import.meta.url), 'utf8'), { window: win, document: doc, URLSearchParams, URL, String, Object });
  return { get: () => JSON.parse(JSON.stringify(win.ShoreAttrib.get())) };
}
t('attrib.js: captures utm/ref/landing/referrer host; first touch wins across pages; no query or hash stored; no cookies', () => {
  const store = new Map();
  const a = browser({ url: 'https://shorelist.net/things-to-do/walking-tours?utm_source=Google&utm_medium=CPC&utm_campaign=Spring&ref=Amanda&email=p@x.com#x', referrer: 'https://www.google.com/search?q=secret', store }).get();
  assert.deepStrictEqual(a, { utm_source: 'google', utm_medium: 'cpc', utm_campaign: 'spring', ref: 'amanda', landing: '/things-to-do/walking-tours', referrer_host: 'google.com' });
  assert(!JSON.stringify(a).includes('secret') && !JSON.stringify(a).includes('p@x'));
  const b = browser({ url: 'https://shorelist.net/guides?utm_source=other', referrer: 'https://shorelist.net/', store }).get();
  assert.deepStrictEqual(b, a);
});
t('attrib.js: direct visit, blocked storage and junk values do not throw', () => {
  assert.deepStrictEqual(browser({ url: 'https://shorelist.net/' }).get(), { landing: '/' });
  assert.deepStrictEqual(browser({ url: 'https://shorelist.net/guides?utm_source=%3Cscript%3E', blocked: true }).get(), { utm_source: 'script', landing: '/guides' });
  assert.deepStrictEqual(browser({ url: 'https://shorelist.net/x', referrer: 'https://shorelist.net/y' }).get(), { landing: '/x' });
});
t('pages: checkout starters load attrib.js and send it', () => {
  const r = (f) => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
  assert(/attrib\.js[\s\S]*category-app\.js/.test(r('category.html'))); assert(r('guides.html').includes('/attrib.js')); assert(r('index.html').includes('/attrib.js'));
  assert(r('category-app.js').includes('attrib:window.ShoreAttrib')); assert(r('guides.html').includes('attrib:window.ShoreAttrib'));
  for (const f of fs.readdirSync(new URL('../things-to-do/', import.meta.url)).filter((x) => x.endsWith('.html'))) assert(r('things-to-do/' + f).includes('/attrib.js'), f);
});
(async () => { for (const [name, fn] of tests) { const q = [console.log, console.error, console.warn]; console.error = console.warn = () => {}; try { await fn(); n++; console.error = q[1]; console.warn = q[2]; console.log('ok  ' + name); } catch (e) { console.error = q[1]; console.warn = q[2]; console.log('FAIL ' + name + '\n  ' + (e && e.stack || e)); process.exitCode = 1; } } console.log(`\n${n}/${tests.length} passed`); })();
