// ShoreList Direct: physical goods bought on shorelist.net.
// The catalog (dropship-catalog.json) is the only source of prices, shipping, status and supplier.
// Nothing the browser sends is trusted except item id, variant id and quantity.

const fs = require('fs');
const path = require('path');

const NC_TAX_RATE = 0.07; // 4.75% state + 2.25% New Hanover County, same rate the guides checkout uses
const MAX_LINES = 8;
const MAX_QTY_PER_LINE = 10;
const MAX_TOTAL_QTY = 20;
const MAX_SHIP_CENTS = 20000;
const ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
const SKU_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,39}$/;

let CAT = null;
function readCatalog() {
  const dirs = [path.join(__dirname, '..', '..'), __dirname, process.env.LAMBDA_TASK_ROOT || '/var/task', process.cwd()];
  for (const d of dirs) { try { return JSON.parse(fs.readFileSync(path.join(d, 'dropship-catalog.json'), 'utf8')); } catch (e) { /* try the next one */ } }
  try { return require('../../dropship-catalog.json'); } catch (e) { /* static require lets the bundler inline it if the layout differs */ }
  throw new Error('dropship-catalog.json not found (check included_files in netlify.toml)');
}
function catalog() { return CAT || (CAT = readCatalog()); }
function setCatalogForTests(c) { CAT = c || null; }

const isInt = (n) => Number.isInteger(n);
// Returns a list of problems for one catalog item (empty list = well formed). Used on live items at request time and by check-site.
function itemProblems(it) {
  const p = [];
  if (!it || typeof it !== 'object') return ['not an object'];
  if (!ID_RE.test(String(it.id || ''))) p.push('bad id');
  if (!SKU_RE.test(String(it.sku || ''))) p.push('bad sku');
  if (!['live', 'draft-not-live'].includes(it.status)) p.push('status must be live or draft-not-live');
  if (typeof it.name !== 'string' || !it.name.trim() || it.name.length > 120) p.push('bad name');
  if (!isInt(it.price_cents) || it.price_cents < 50) p.push('bad price_cents');
  const flat = it.shipping_cents != null, tiers = it.shipping_tiers != null;
  if (flat === tiers) p.push('exactly one of shipping_cents or shipping_tiers is required');
  if (flat && (!isInt(it.shipping_cents) || it.shipping_cents < 0 || it.shipping_cents > MAX_SHIP_CENTS)) p.push('bad shipping_cents');
  if (tiers) {
    const t = it.shipping_tiers;
    if (!Array.isArray(t) || !t.length) p.push('bad shipping_tiers');
    else {
      let last = 0;
      for (const x of t) {
        if (!x || !isInt(x.max_g) || x.max_g <= last || !isInt(x.cents) || x.cents < 0 || x.cents > MAX_SHIP_CENTS) { p.push('shipping_tiers must be ascending {max_g, cents}'); break; }
        last = x.max_g;
      }
    }
  }
  if (it.max_qty != null && (!isInt(it.max_qty) || it.max_qty < 1 || it.max_qty > MAX_QTY_PER_LINE)) p.push('bad max_qty');
  const s = it.supplier;
  if (!s || typeof s.name !== 'string' || !s.name || typeof s.url !== 'string' || !/^https:\/\//.test(s.url) || typeof s.origin !== 'string' || !s.origin) p.push('supplier needs name, https url, origin');
  const ld = s && s.lead_days;
  if (!Array.isArray(ld) || ld.length !== 2 || !isInt(ld[0]) || !isInt(ld[1]) || ld[0] < 1 || ld[1] < ld[0] || ld[1] > 120) p.push('supplier.lead_days must be [min,max] business days');
  const adapter = (s && s.adapter) || 'manual';
  if (!['printify', 'cj', 'manual'].includes(adapter)) p.push('supplier.adapter must be printify, cj or manual');
  if (!Array.isArray(it.variants) || !it.variants.length || it.variants.length > 60) p.push('variants required');
  else {
    const seen = new Set(), seenSku = new Set();
    for (const v of it.variants) {
      if (!v || !ID_RE.test(String(v.id || '')) || typeof v.label !== 'string' || !v.label.trim() || v.label.length > 60 || !SKU_RE.test(String(v.sku || '')) || !isInt(v.price_cents) || v.price_cents < 50) { p.push('bad variant ' + (v && v.id)); continue; }
      if (seen.has(v.id)) p.push('duplicate variant id ' + v.id);
      if (seenSku.has(v.sku)) p.push('duplicate variant sku ' + v.sku);
      seen.add(v.id); seenSku.add(v.sku);
      if (adapter === 'printify' && !(v.supplier_ref && v.supplier_ref.product_id && isInt(v.supplier_ref.variant_id))) p.push('printify variant needs supplier_ref {product_id, variant_id}: ' + v.id);
      if (adapter === 'cj' && !(v.supplier_ref && v.supplier_ref.vid)) p.push('cj variant needs supplier_ref {vid}: ' + v.id);
      if (v.cost_cents != null && (!isInt(v.cost_cents) || v.cost_cents < 0)) p.push('bad cost_cents: ' + v.id);
      if (tiers && (!isInt(v.weight_g) && !isInt(it.weight_g))) p.push('weight_g needed on variant or item for tiered shipping: ' + v.id);
    }
  }
  return p;
}

function findItem(id) {
  if (typeof id !== 'string') return null;
  const items = (catalog().items || []);
  return items.find((i) => i && i.id === id) || null;
}
const findVariant = (it, vid) => (it && typeof vid === 'string' && (it.variants || []).find((v) => v && v.id === vid)) || null;
const weightOf = (it, v) => (isInt(v.weight_g) ? v.weight_g : it.weight_g);

// raw: [{ id, variant, qty, expect_cents? }] from the browser. Returns { ok:true, lines } or { ok:false, status, error, code?, lines? }.
function resolveLines(raw) {
  if (!Array.isArray(raw) || !raw.length) return { ok: false, status: 400, error: 'Your bag has no ShoreList Direct items.' };
  if (raw.length > MAX_LINES) return { ok: false, status: 400, error: 'Too many different items in one order.' };
  const merged = new Map();
  for (const r of raw) {
    if (!r || typeof r !== 'object' || Array.isArray(r)) return { ok: false, status: 400, error: 'Invalid item.' };
    const it = findItem(r.id);
    if (!it || it.status !== 'live' || itemProblems(it).length) return { ok: false, status: 409, code: 'unavailable', error: 'One of these items is not available to order right now.' };
    const v = findVariant(it, r.variant);
    if (!v) return { ok: false, status: 409, code: 'bad_variant', error: 'That option is not available. Please choose it again.' };
    if (!isInt(r.qty) || r.qty < 1) return { ok: false, status: 400, error: 'Invalid quantity.' };
    const k = it.id + '|' + v.id;
    const prev = merged.get(k);
    merged.set(k, { it, v, qty: (prev ? prev.qty : 0) + r.qty, expect: r.expect_cents });
  }
  const lines = [];
  let total = 0;
  for (const m of merged.values()) {
    const cap = Math.min(m.it.max_qty || MAX_QTY_PER_LINE, MAX_QTY_PER_LINE);
    if (m.qty > cap) return { ok: false, status: 400, code: 'qty_cap', error: `You can order up to ${cap} of "${m.it.name}" at a time.` };
    total += m.qty;
    lines.push({ item: m.it, variant: m.v, qty: m.qty, unit_cents: m.v.price_cents, expect: m.expect });
  }
  if (total > MAX_TOTAL_QTY) return { ok: false, status: 400, code: 'qty_cap', error: `One order can hold up to ${MAX_TOTAL_QTY} pieces.` };
  // The price on screen must be the price charged. If it moved, tell the browser the real numbers instead of charging a different amount.
  const moved = lines.filter((l) => l.expect != null && l.expect !== l.unit_cents);
  if (moved.length) return { ok: false, status: 409, code: 'price_changed', error: 'A price changed. Your bag has been updated, please review it.', lines: moved.map((l) => ({ id: l.item.id, variant: l.variant.id, price_cents: l.unit_cents })) };
  return { ok: true, lines };
}

// Flat items: shipping_cents per piece. Tiered items: one tier chosen from the combined weight of all tiered pieces. No free shipping rule.
function shippingCents(lines) {
  let flat = 0, grams = 0;
  for (const l of lines) {
    if (l.item.shipping_tiers) grams += weightOf(l.item, l.variant) * l.qty;
    else flat += l.item.shipping_cents * l.qty;
  }
  let tiered = 0;
  for (const l of lines) {
    if (!l.item.shipping_tiers) continue;
    const t = l.item.shipping_tiers.find((x) => grams <= x.max_g); // each item's own table, applied to the combined tiered weight
    if (!t) return { ok: false, error: 'This order is too heavy to ship in one parcel. Please order fewer pieces.' };
    tiered = Math.max(tiered, t.cents);
  }
  return { ok: true, cents: flat + tiered, grams };
}

function leadRange(lines) {
  let min = 0, max = 0;
  for (const l of lines) { const d = (l.item.supplier || {}).lead_days || [0, 0]; min = Math.max(min, d[0]); max = Math.max(max, d[1]); }
  return { min, max };
}

function totals(lines) {
  const sh = shippingCents(lines);
  if (!sh.ok) return sh;
  const subtotal = lines.reduce((a, l) => a + l.unit_cents * l.qty, 0);
  const taxable = subtotal + sh.cents; // NC taxes delivery charges on taxable goods; confirm with your accountant
  const tax = Math.round(taxable * NC_TAX_RATE);
  return { ok: true, subtotal, shipping: sh.cents, tax, total: subtotal + sh.cents + tax, grams: sh.grams };
}

// Compact, Stripe-metadata-safe line record: metadata[line_N] = itemId|variantId|sku|variantSku|qty|unitCents
function encodeLine(l) { return [l.item.id, l.variant.id, l.item.sku, l.variant.sku, l.qty, l.unit_cents].join('|'); }
function decodeLines(meta) {
  const out = [];
  const n = Math.min(parseInt(meta && meta.lines, 10) || 0, MAX_LINES);
  for (let i = 0; i < n; i++) {
    const p = String((meta && meta['line_' + i]) || '').split('|');
    if (p.length !== 6) continue;
    const it = findItem(p[0]); const v = findVariant(it, p[1]);
    out.push({ itemId: p[0], variantId: p[1], sku: p[2], variantSku: p[3], qty: parseInt(p[4], 10) || 0, unit_cents: parseInt(p[5], 10) || 0, item: it, variant: v });
  }
  return out;
}

const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]{8,250}$/;
// Asks Stripe whether this session is a PAID goods order. { ok:true, session, lines } or { ok:false }. Throws only if Stripe is unreachable.
async function paidGoodsSession(stripeKey, id) {
  if (typeof id !== 'string' || !SESSION_ID_RE.test(id)) return { ok: false };
  const res = await fetch('https://api.stripe.com/v1/checkout/sessions/' + id, { headers: { 'Authorization': `Bearer ${stripeKey}` } });
  if (res.status >= 500) throw new Error('stripe ' + res.status);
  const session = await res.json();
  if (!res.ok || !session || session.payment_status !== 'paid') return { ok: false };
  if (!session.metadata || session.metadata.kind !== 'goods') return { ok: false };
  const lines = decodeLines(session.metadata);
  return lines.length ? { ok: true, session, lines } : { ok: false };
}

module.exports = {
  NC_TAX_RATE, MAX_LINES, MAX_QTY_PER_LINE, MAX_TOTAL_QTY,
  catalog, setCatalogForTests, itemProblems, findItem, findVariant, resolveLines, shippingCents, totals, leadRange,
  encodeLine, decodeLines, paidGoodsSession, SESSION_ID_RE,
};
// Netlify publishes every file in this folder as a function; this one has nothing to serve.
module.exports.handler = async () => ({ statusCode: 404, body: '' });
