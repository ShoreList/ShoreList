// Printify adapter. Docs: https://developers.printify.com/ (OpenAPI: https://developers.printify.com/openapi.json)
// Env: PRINTIFY_API_TOKEN, PRINTIFY_SHOP_ID. Catalog variant.supplier_ref = { product_id: "<printify product id>", variant_id: <integer> }.
// Verified from the OpenAPI file: create order, send_to_production, get order, cancel, bearer auth, shipments {carrier, number, url, delivered_at}.
// UNVERIFIED: order.status value list; the product variant "cost" field used by getCost (assumed cents); webhook-free polling only.
const BASE = 'https://api.printify.com';
const name = 'printify';
const configured = () => !!(process.env.PRINTIFY_API_TOKEN && process.env.PRINTIFY_SHOP_ID);

async function call(method, path, body) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const res = await fetch(BASE + path, { method, signal: ctl.signal, headers: { 'Authorization': 'Bearer ' + process.env.PRINTIFY_API_TOKEN, 'Content-Type': 'application/json;charset=utf-8', 'User-Agent': 'ShoreList-Direct' }, body: body ? JSON.stringify(body) : undefined });
    let data = null; try { data = await res.json(); } catch (e) { /* empty body */ }
    return { ok: res.ok, status: res.status, data };
  } finally { clearTimeout(t); }
}
const shop = () => encodeURIComponent(process.env.PRINTIFY_SHOP_ID);

// order: { externalId, lines:[{supplierRef, qty}], shipTo:{name,address}, customer:{email,phone}, existingSupplierOrderId? }
async function placeOrder(order) {
  let id = order.existingSupplierOrderId || null;
  if (!id) {
    const items = [];
    for (const l of order.lines) {
      const r = l.supplierRef || {};
      if (!r.product_id || !Number.isInteger(r.variant_id)) return { ok: false, error: 'missing printify supplier_ref for ' + l.variantSku };
      items.push({ product_id: String(r.product_id), variant_id: r.variant_id, quantity: l.qty });
    }
    const a = (order.shipTo && order.shipTo.address) || {};
    const parts = String((order.shipTo && order.shipTo.name) || (order.customer && order.customer.name) || '').trim().split(/\s+/);
    const body = {
      external_id: order.externalId, label: 'ShoreList ' + order.externalId.slice(-10),
      line_items: items, shipping_method: 1, send_shipping_notification: false,
      address_to: { first_name: parts[0] || 'Customer', last_name: parts.slice(1).join(' ') || '-', email: (order.customer && order.customer.email) || '', phone: (order.customer && order.customer.phone) || '', country: a.country || 'US', region: a.state || '', address1: a.line1 || '', address2: a.line2 || '', city: a.city || '', zip: a.postal_code || '' },
    };
    const c = await call('POST', `/v1/shops/${shop()}/orders.json`, body);
    if (!c.ok || !c.data || !c.data.id) return { ok: false, error: 'printify create ' + c.status + ' ' + JSON.stringify(c.data || {}).slice(0, 200) };
    id = String(c.data.id);
  }
  const p = await call('POST', `/v1/shops/${shop()}/orders/${encodeURIComponent(id)}/send_to_production.json`);
  if (!p.ok) return { ok: false, supplierOrderId: id, error: 'printify send_to_production ' + p.status };
  return { ok: true, supplierOrderId: id, state: 'processing' };
}

async function getStatus(ref) {
  const r = await call('GET', `/v1/shops/${shop()}/orders/${encodeURIComponent(ref)}.json`);
  if (!r.ok || !r.data) return { ok: false, error: 'printify status ' + r.status };
  const ships = Array.isArray(r.data.shipments) ? r.data.shipments : [];
  const tracking = ships.filter((s) => s && s.number).map((s) => ({ carrier: s.carrier || '', number: String(s.number), url: s.url || '' }));
  const st = String(r.data.status || '').toLowerCase();
  let state = 'processing';
  if (/cancel/.test(st)) state = 'cancelled';
  else if (ships.length && ships.every((s) => s && s.delivered_at)) state = 'delivered';
  else if (tracking.length || st === 'fulfilled' || st === 'shipped') state = 'shipped';
  return { ok: true, state, tracking, rawStatus: st };
}

async function cancel(ref) {
  const r = await call('POST', `/v1/shops/${shop()}/orders/${encodeURIComponent(ref)}/cancel.json`);
  return { ok: r.ok, error: r.ok ? undefined : 'printify cancel ' + r.status };
}

// Supplier cost for one variant in cents (UNVERIFIED field names: product.variants[].cost, is_available).
async function getCost(ref) {
  const r = await call('GET', `/v1/shops/${shop()}/products/${encodeURIComponent(ref.product_id)}.json`);
  if (!r.ok || !r.data || !Array.isArray(r.data.variants)) return { ok: false, error: 'printify product ' + r.status };
  const v = r.data.variants.find((x) => x && x.id === ref.variant_id);
  if (!v || !Number.isFinite(v.cost)) return { ok: false, error: 'variant not found or no cost' };
  return { ok: true, cost_cents: Math.round(v.cost), in_stock: v.is_available !== false && v.is_enabled !== false };
}
module.exports = { name, configured, placeOrder, getStatus, cancel, getCost };
