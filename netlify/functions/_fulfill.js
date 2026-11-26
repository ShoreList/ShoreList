// ShoreList Direct fulfillment: record, auto supplier order, tracking sync, drift check, alerts.
// Record: Netlify Blobs store "shorelist-goods-orders", key "order/<stripe session id>" (JSON).
// Every state change is a compare-and-set update (blobUpdate), so duplicate Stripe deliveries or overlapping
// scheduled runs cannot place a supplier order twice: a group is "claimed" (status placing) before any supplier call.
const { escapeHtml, attribSummary, getBlobStore, blobUpdate } = require('./_shared.js');
const G = require('./_goods.js');
const R = require('./_supplier-registry.js');

const STORE = 'shorelist-goods-orders';
const MAX_ATTEMPTS = 5;
const CLAIM_MS = 5 * 60 * 1000;
const e = (v) => escapeHtml(String(v == null ? '' : v).slice(0, 400));
const usd = (c) => (Number.isFinite(c) ? '$' + (c / 100).toFixed(2) : 'n/a');
const ownerEmail = () => process.env.OWNER_ALERT_EMAIL || 'rj@shorelist.net';
const bookingsEmail = () => 'shorelistwilmington@gmail.com'; // the route the existing webhook already uses

// ---------- mail ----------
// Route today: Resend (RESEND_API_KEY). The sandbox sender onboarding@resend.dev only delivers to the Resend account owner,
// so mail to the OWNER works with it, while mail to CUSTOMERS needs MAIL_FROM on a domain verified in Resend (for example
// "ShoreList <orders@shorelist.net>"). Without MAIL_FROM no customer email is sent (see syncTracking).
async function sendMail({ to, subject, html, from }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) { console.log('No RESEND_API_KEY set, mail skipped:', String(subject).slice(0, 60)); return false; }
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { 'Authorization': `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: from || 'ShoreList Bookings <onboarding@resend.dev>', to: Array.isArray(to) ? to : [to], subject, html }),
    });
    if (!r.ok) { console.error('Resend error (goods):', r.status); return false; }
    return true;
  } catch (err) { console.error('Mail failed (goods):', err.message); return false; }
}
async function alertOwner(subject, html) { return sendMail({ to: ownerEmail(), subject: '[ShoreList Direct] ' + subject, html }); }

// ---------- record ----------
function groupLines(lines) {
  const groups = [];
  lines.forEach((l, i) => {
    const adapter = R.adapterName(l.supplier);
    const sname = (l.supplier && l.supplier.name) || 'unknown';
    const route = adapter === 'cj' ? JSON.stringify(R.ADAPTERS.cj.fulfillmentRoute(l.supplier)) : null;
    let g = groups.find((x) => x.adapter === adapter && x.supplierName === sname && (x.route || null) === route);
    if (!g) { g = { id: 'g' + groups.length, adapter, supplierName: sname, ...(route ? { route } : {}), lineIdx: [], status: 'pending', attempts: 0, supplierOrderId: null, lastError: '', tracking: [] }; groups.push(g); }
    g.lineIdx.push(i);
  });
  return groups;
}

function buildGoodsOrder(session) {
  const meta = session.metadata || {};
  const ship = session.shipping_details || (session.collected_information && session.collected_information.shipping_details) || {};
  const cust = session.customer_details || {};
  const lines = G.decodeLines(meta).map((l) => ({
    itemId: l.itemId, variantId: l.variantId, sku: l.sku, variantSku: l.variantSku,
    name: l.item ? l.item.name : '', variantLabel: l.variant ? l.variant.label : '', qty: l.qty, unit_cents: l.unit_cents,
    supplierRef: l.variant && l.variant.supplier_ref ? l.variant.supplier_ref : null,
    supplier: l.item && l.item.supplier ? { name: l.item.supplier.name, url: l.item.supplier.url, origin: l.item.supplier.origin, lead_days: l.item.supplier.lead_days, adapter: l.item.supplier.adapter || 'manual', logistic_name: l.item.supplier.logistic_name || '', from_country: l.item.supplier.from_country || '' } : null,
  }));
  const num = (k) => { const v = parseInt(meta[k], 10); return Number.isFinite(v) ? v : null; };
  const expected = num('totalCents');
  return {
    v: 2, sessionId: session.id, createdAt: new Date().toISOString(), livemode: !!session.livemode, notified: false, closed: false,
    lines, fulfillment: groupLines(lines),
    totals: { subtotal_cents: num('subtotalCents'), shipping_cents: num('shippingCents'), tax_cents: num('taxCents'), expected_total_cents: expected, charged_total_cents: Number.isFinite(session.amount_total) ? session.amount_total : null },
    totalMismatch: expected != null && Number.isFinite(session.amount_total) && expected !== session.amount_total,
    customer: { name: cust.name || ship.name || '', email: cust.email || '', phone: cust.phone || '' },
    shipTo: { name: ship.name || '', address: ship.address || null },
    source: attribSummary(meta) || '',
  };
}

async function readRecord(store, key) {
  const cur = await store.getWithMetadata(key, { type: 'text' });
  if (!cur) return null;
  try { return JSON.parse(String(cur.data)); } catch { return null; }
}
// fn(record) mutates and returns true to save. Returns the saved/last record.
async function updateRecord(store, key, fn) {
  let out = null;
  await blobUpdate(store, key, (cur) => {
    if (cur == null) return undefined;
    let o; try { o = JSON.parse(cur); } catch { return undefined; }
    out = o;
    return fn(o) === false ? undefined : JSON.stringify(o);
  });
  return out;
}

const adapterOrder = (rec, g) => ({
  externalId: rec.sessionId + '-' + g.id, lines: g.lineIdx.map((i) => rec.lines[i]), shipTo: rec.shipTo, customer: rec.customer, existingSupplierOrderId: g.supplierOrderId || undefined,
});
const mailCtx = (rec, reason) => ({ sendMail, e, ownerEmail: ownerEmail(), test: !rec.livemode, reason });

// Place every group that is not yet placed. Safe to call again (webhook retry, scheduled retry): placed groups are skipped.
async function placeGroups(store, key) {
  const rec0 = await readRecord(store, key);
  if (!rec0) return;
  for (const g0 of rec0.fulfillment) {
    let claimed = null;
    // claim: pending or failed (with attempts left) or a stale claim becomes "placing" atomically
    const rec1 = await updateRecord(store, key, (rec) => {
      const g = rec.fulfillment.find((x) => x.id === g0.id);
      const stale = g.status === 'placing' && Date.now() - Date.parse(g.claimedAt || 0) > CLAIM_MS;
      if (!(g.status === 'pending' || (g.status === 'failed' && g.attempts < MAX_ATTEMPTS) || stale)) { claimed = null; return false; }
      g.status = 'placing'; g.claimedAt = new Date().toISOString(); g.attempts += 1; claimed = JSON.parse(JSON.stringify(g)); return true;
    });
    if (!claimed || !rec1) continue;
    const rec = rec1;
    const sup = rec.lines[claimed.lineIdx[0]].supplier;
    const pick = R.pick(sup);
    let res;
    try { res = await pick.adapter.placeOrder(adapterOrder(rec, claimed), mailCtx(rec, pick.fallback ? `Automatic ordering with ${pick.wanted} is not configured (missing env vars), so this order needs placing by hand.` : '')); }
    catch (err) { res = { ok: false, error: String(err && err.message || err).slice(0, 300) }; }
    let failedNow = false;
    await updateRecord(store, key, (r) => {
      const g = r.fulfillment.find((x) => x.id === claimed.id);
      g.usedAdapter = pick.adapter.name; g.fellBack = pick.fallback;
      if (res.supplierOrderId) g.supplierOrderId = res.supplierOrderId;
      if (res.ok) { g.status = res.state === 'manual-awaiting-owner' ? 'manual-awaiting-owner' : 'placed'; g.lastError = ''; g.placedAt = new Date().toISOString(); }
      else { g.status = 'failed'; g.lastError = String(res.error || 'unknown').slice(0, 300); failedNow = g.attempts === 1 || g.attempts >= MAX_ATTEMPTS; }
      return true;
    });
    if (!res.ok && failedNow) {
      await alertOwner(`Supplier order FAILED for ${String(rec.sessionId).slice(-10)}`, `<p>The automatic supplier order failed (${e(pick.adapter.name)}, supplier ${e(claimed.supplierName)}), attempt ${e(claimed.attempts)} of ${MAX_ATTEMPTS}.</p><p>Error: ${e(res.error)}</p><p>The customer has paid. The order is retried hourly until ${MAX_ATTEMPTS} attempts, then it needs placing by hand. Stripe session ${e(rec.sessionId)}; record: store ${STORE}, key ${e(key)}.</p>`);
    }
  }
}

async function sendOrderSummary(rec) {
  const a = (rec.shipTo && rec.shipTo.address) || {};
  const rows = rec.lines.map((l) => `<tr><td>${e(l.qty)} x</td><td>${e(l.name)} (${e(l.variantLabel)})<br>SKU ${e(l.sku)} / ${e(l.variantSku)}</td><td>${l.supplier ? e(l.supplier.name) + ' (' + e(l.supplier.origin) + ')<br>lead ' + e((l.supplier.lead_days || []).join(' to ')) + ' business days' : 'supplier not in catalog'}</td><td>${usd(l.unit_cents)}</td></tr>`).join('');
  const fl = rec.fulfillment.map((g) => `<li>${e(g.supplierName)} via ${e(g.usedAdapter || g.adapter)}${g.fellBack ? ' (fallback, adapter not configured)' : ''}: <strong>${e(g.status)}</strong>${g.supplierOrderId ? ', supplier order ' + e(g.supplierOrderId) : ''}${g.lastError ? ', error ' + e(g.lastError) : ''}</li>`).join('');
  const html = `<h2>ShoreList Direct order</h2>
<p>${rec.livemode ? '' : '<strong>TEST MODE ORDER. Do not fulfill.</strong><br>'}${rec.totalMismatch ? '<strong>Charged total does not match the expected total. Check Stripe before fulfilling.</strong><br>' : ''}Stripe session: ${e(rec.sessionId)}</p>
<table border="1" cellpadding="6" cellspacing="0">${rows}</table>
<p>Subtotal ${usd(rec.totals.subtotal_cents)}, shipping ${usd(rec.totals.shipping_cents)}, NC tax ${usd(rec.totals.tax_cents)}. Charged ${usd(rec.totals.charged_total_cents)}.</p>
<p><strong>Supplier orders</strong></p><ul>${fl}</ul>
<p><strong>Ship to</strong><br>${[rec.shipTo.name, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(' '), a.country].filter(Boolean).map(e).join('<br>')}</p>
<p>Buyer: ${e(rec.customer.name)}, ${e(rec.customer.email)}, ${e(rec.customer.phone) || 'no phone'}${rec.source ? '<br>Source: ' + e(rec.source) : ''}</p>`;
  return sendMail({ to: bookingsEmail(), subject: `${rec.livemode ? '' : '[TEST] '}Goods order: ${String(rec.sessionId).slice(-10)}`, html });
}

// Called by stripe-webhook for a PAID goods session. Returns { ok, duplicate }. ok:false -> webhook answers 500 so Stripe retries.
async function handlePaidGoodsSession(event, session) {
  const rec = buildGoodsOrder(session);
  if (!rec.lines.length) { console.error('goods order without readable lines:', session.id); return { ok: false }; }
  const store = getBlobStore(event, STORE);
  const key = 'order/' + session.id;
  if (!store) {
    // No durable store: nothing can be idempotent or retried. Tell the owner, who places the order by hand from Stripe.
    console.error('goods order: Netlify Blobs unavailable, email only:', session.id);
    rec.fulfillment.forEach((g) => { g.status = 'manual-awaiting-owner'; });
    const sent = await sendOrderSummary(rec);
    return { ok: sent };
  }
  let duplicate = false;
  try {
    const r = await store.set(key, JSON.stringify(rec), { onlyIfNew: true });
    duplicate = !r || !r.modified;
  } catch (err) { console.error('goods order: could not write record:', err.message); return { ok: false }; }
  try { await placeGroups(store, key); } catch (err) { console.error('goods order: placement error:', err.message); }
  try {
    const cur = await readRecord(store, key);
    if (cur && !cur.notified) {
      if (await sendOrderSummary(cur)) await updateRecord(store, key, (o) => { if (o.notified) return false; o.notified = true; o.notifiedAt = new Date().toISOString(); return true; });
    }
  } catch (err) { console.error('goods order: summary email error:', err.message); }
  return { ok: true, duplicate };
}

// ---------- tracking sync (scheduled hourly) ----------
function shippingEmailHtml(rec, g, tracking) {
  const items = g.lineIdx.map((i) => rec.lines[i]);
  const trk = tracking.map((t) => `<p style="margin:0 0 6px"><strong>${e(t.carrier) || 'Carrier'}</strong> ${t.url ? `<a href="${e(t.url)}" style="color:#E96645">${e(t.number)}</a>` : e(t.number)}</p>`).join('');
  return `<!DOCTYPE html><html><body style="margin:0;background:#f2f4f3;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
<div style="max-width:560px;margin:32px auto;background:#fff;border-radius:14px;overflow:hidden">
<div style="background:#0A4D5C;padding:18px 26px"><span style="color:#fff;font-size:22px;font-weight:800">Shore<span style="color:#E96645">List</span></span></div>
<div style="padding:26px"><h1 style="margin:0 0 10px;font-size:24px;color:#0A4D5C">Your order is on its way</h1>
<p style="color:#33454d;line-height:1.6">Hi${rec.customer.name ? ' ' + e(rec.customer.name.split(' ')[0]) : ''}, your ShoreList order has shipped. Here is what is in this package and how to track it.</p>
<ul style="color:#33454d;line-height:1.6">${items.map((l) => `<li>${e(l.qty)} x ${e(l.name)} (${e(l.variantLabel)})</li>`).join('')}</ul>
<div style="background:#f2f4f3;border-radius:10px;padding:14px 16px;color:#33454d">${trk}</div>
<p style="color:#33454d;line-height:1.6">Tracking can take a day to show movement. Your order total and receipt are in the Stripe email we sent at checkout. Returns and damaged items: <a href="https://shorelist.net/shipping-returns" style="color:#E96645">shorelist.net/shipping-returns</a>, or write to <a href="mailto:rj@shorelist.net" style="color:#E96645">rj@shorelist.net</a>.</p></div>
<div style="background:#f2f4f3;padding:14px 26px;font-size:12px;color:#6b7a80">ShoreList LLC, Wilmington, NC, shorelist.net</div></div></body></html>`;
}

// Retries failed groups, polls placed groups, emails customers when tracking appears. Returns a summary for tests and logs.
async function syncTracking(event) {
  const store = getBlobStore(event, STORE);
  const sum = { checked: 0, emailed: 0, retried: 0, errors: 0 };
  if (!store || typeof store.list !== 'function') return sum;
  const listing = await store.list({ prefix: 'order/' });
  for (const b of (listing && listing.blobs) || []) {
    const key = b.key;
    let rec; try { rec = await readRecord(store, key); } catch { continue; }
    if (!rec || rec.closed) continue;
    if (rec.fulfillment.some((g) => g.status === 'failed' && g.attempts < MAX_ATTEMPTS)) { sum.retried++; try { await placeGroups(store, key); rec = await readRecord(store, key); } catch (err) { sum.errors++; } }
    for (const g of rec.fulfillment) {
      if (!['placed', 'shipped'].includes(g.status) || !g.supplierOrderId) continue;
      const pick = R.ADAPTERS[g.usedAdapter || g.adapter];
      if (!pick || !pick.configured() || pick.name === 'manual') continue;
      sum.checked++;
      let st;
      try { st = await pick.getStatus(g.supplierOrderId); } catch (err) { st = { ok: false, error: err.message }; }
      if (!st.ok) { sum.errors++; continue; }
      let sendNow = null;
      await updateRecord(store, key, (r) => {
        const x = r.fulfillment.find((y) => y.id === g.id);
        if (st.state === 'cancelled') { x.status = 'cancelled'; return true; }
        if (st.tracking && st.tracking.length) { x.tracking = st.tracking; x.status = st.state === 'delivered' ? 'delivered' : 'shipped'; }
        if (x.tracking.length && !x.customerEmailed && !x.customerEmailSkipped) sendNow = x.tracking;
        r.closed = r.fulfillment.every((y) => ['delivered', 'cancelled'].includes(y.status));
        return true;
      });
      if (sendNow) {
        const from = process.env.MAIL_FROM;
        let ok = false, skipped = false;
        if (!rec.customer.email) { skipped = true; }
        else if (!from) { skipped = true; await alertOwner('Tracking ready, customer email NOT sent', `<p>Order ${e(rec.sessionId)} shipped (${e(sendNow.map((t) => t.number).join(', '))}) but MAIL_FROM is not set, so the customer was not emailed. Verify a sending domain in Resend and set MAIL_FROM, or send the tracking by hand to ${e(rec.customer.email)}.</p>`); }
        else ok = await sendMail({ from, to: rec.customer.email, subject: 'Your ShoreList order has shipped', html: shippingEmailHtml(rec, g, sendNow) });
        if (ok || skipped) await updateRecord(store, key, (r) => { const x = r.fulfillment.find((y) => y.id === g.id); if (ok) x.customerEmailed = true; else x.customerEmailSkipped = true; return true; });
        if (ok) sum.emailed++;
      }
    }
  }
  return sum;
}

// ---------- stock and price drift (scheduled daily) ----------
const STRIPE_FEE = (c) => Math.round(c * 0.029) + 30;
// Flags only. Never changes a price. Margin per single piece: price + shipping charged - supplier cost - supplier shipping - Stripe fee.
async function driftCheck() {
  const flags = [];
  for (const it of (G.catalog().items || [])) {
    if (it.status !== 'live') continue;
    const pick = R.pick(it.supplier);
    if (pick.adapter.name === 'manual') continue;
    for (const v of it.variants) {
      if (!v.supplier_ref) continue;
      let c; try { c = await pick.adapter.getCost(v.supplier_ref, it.supplier); } catch (err) { c = { ok: false, error: err.message }; }
      if (!c.ok) { flags.push({ sku: v.sku, kind: 'lookup-failed', detail: c.error }); continue; }
      const ship = it.shipping_cents != null ? it.shipping_cents : it.shipping_tiers[0].cents;
      const revenue = v.price_cents + ship;
      const margin = revenue - c.cost_cents - (it.supplier_ship_cents || 0) - STRIPE_FEE(revenue);
      if (margin < 0) flags.push({ sku: v.sku, kind: 'negative-margin', detail: `price ${usd(v.price_cents)} + shipping ${usd(ship)}, cost now ${usd(c.cost_cents)}, margin ${usd(margin)}` });
      if (v.cost_cents != null && v.cost_cents !== c.cost_cents) flags.push({ sku: v.sku, kind: 'cost-changed', detail: `catalog cost ${usd(v.cost_cents)}, supplier now ${usd(c.cost_cents)}` });
      if (c.in_stock === false) flags.push({ sku: v.sku, kind: 'out-of-stock', detail: 'supplier reports unavailable' });
    }
  }
  if (flags.length) await alertOwner(`Supplier drift: ${flags.length} item(s) need a look`, `<p>No prices were changed. Review dropship-catalog.json.</p><ul>${flags.map((f) => `<li>${e(f.sku)}: <strong>${e(f.kind)}</strong>, ${e(f.detail)}</li>`).join('')}</ul>`);
  return flags;
}

module.exports = { STORE, MAX_ATTEMPTS, sendMail, alertOwner, buildGoodsOrder, handlePaidGoodsSession, placeGroups, syncTracking, driftCheck, readRecord };
module.exports.handler = async () => ({ statusCode: 404, body: '' });
