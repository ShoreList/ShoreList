// CJ Dropshipping adapter. Docs: https://developers.cjdropshipping.com/en/api/api2/api/auth.html and .../shopping.html
// Env: CJ_API_KEY. Optional CJ_PAY_MODE=balance (default, pays from CJ balance when the order is created, payType 2)
// or create_only (payType 3: order waits in CJ until you pay it in the CJ dashboard).
// Catalog: variant.supplier_ref = { vid: "<cj variant id>" }; item.supplier.logistic_name (CJ shipping line) and item.supplier.from_country (default "US").
// Verified from the docs: getAccessToken (apiKey -> data.accessToken, header CJ-Access-Token, QPS 1), createOrderV2 required fields and payType values,
// getOrderDetail (orderId; orderStatus CREATED/IN_CART/UNPAID/PENDING/PROCESSING/UNSHIPPED/SHIPPED/DELIVERED/CANCELLED; trackNumber; logisticName), deleteOrder (only CREATED or IN_CART).
// UNVERIFIED: the response envelope {result, code, data:{orderId}}; the variant lookup path /product/variant/queryByVid and its variantSellPrice (USD dollars) field;
// whether shippingProvince accepts a state code; Pay Balance V2 path (not used: we rely on payType).
const BASE = 'https://developers.cjdropshipping.com/api2.0/v1';
const name = 'cj';
const configured = () => !!process.env.CJ_API_KEY;
let tok = null; // { t, exp }

async function raw(method, path, body, token) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const res = await fetch(BASE + path, { method, signal: ctl.signal, headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { 'CJ-Access-Token': token } : {}), body: body ? JSON.stringify(body) : undefined });
    let data = null; try { data = await res.json(); } catch (e) { /* empty body */ }
    return { ok: res.ok && data && (data.result === true || data.code === 200), status: res.status, data };
  } finally { clearTimeout(t); }
}
async function token() {
  if (tok && tok.exp > Date.now()) return tok.t;
  const r = await raw('POST', '/authentication/getAccessToken', { apiKey: process.env.CJ_API_KEY });
  const t = r.ok && r.data && r.data.data && r.data.data.accessToken;
  if (!t) throw new Error('cj auth ' + r.status);
  tok = { t, exp: Date.now() + 6 * 3600 * 1000 };
  return t;
}
const trackUrl = (n) => 'https://www.17track.net/en/track?nums=' + encodeURIComponent(n);

async function placeOrder(order) {
  const a = (order.shipTo && order.shipTo.address) || {};
  const products = [];
  for (const l of order.lines) {
    const r = l.supplierRef || {};
    if (!r.vid) return { ok: false, error: 'missing cj supplier_ref.vid for ' + l.variantSku };
    products.push({ vid: String(r.vid), quantity: l.qty });
  }
  const sup = (order.lines[0] && order.lines[0].supplier) || {};
  if (!sup.logistic_name) return { ok: false, error: 'supplier.logistic_name is required for CJ' };
  const body = {
    orderNumber: order.externalId, shippingCountryCode: a.country || 'US', shippingCountry: 'United States', shippingProvince: a.state || '', shippingCity: a.city || '',
    shippingCustomerName: (order.shipTo && order.shipTo.name) || (order.customer && order.customer.name) || '', shippingAddress: a.line1 || '', shippingAddress2: a.line2 || '',
    shippingZip: a.postal_code || '', shippingPhone: (order.customer && order.customer.phone) || '', email: (order.customer && order.customer.email) || '',
    logisticName: sup.logistic_name, fromCountryCode: sup.from_country || 'US', payType: process.env.CJ_PAY_MODE === 'create_only' ? 3 : 2,
    remark: 'ShoreList Direct ' + order.externalId, products,
  };
  const r = await raw('POST', '/shopping/order/createOrderV2', body, await token());
  const id = r.data && r.data.data && (r.data.data.orderId || r.data.data.id);
  if (!r.ok || !id) return { ok: false, error: 'cj create ' + r.status + ' ' + JSON.stringify(r.data || {}).slice(0, 200) };
  return { ok: true, supplierOrderId: String(id), state: 'processing' };
}

async function getStatus(ref) {
  const r = await raw('GET', '/shopping/order/getOrderDetail?orderId=' + encodeURIComponent(ref), null, await token());
  const d = r.data && r.data.data;
  if (!r.ok || !d) return { ok: false, error: 'cj status ' + r.status };
  const st = String(d.orderStatus || '').toUpperCase();
  const tracking = d.trackNumber ? [{ carrier: d.logisticName || '', number: String(d.trackNumber), url: trackUrl(d.trackNumber) }] : [];
  let state = 'processing';
  if (st === 'CANCELLED') state = 'cancelled';
  else if (st === 'DELIVERED') state = 'delivered';
  else if (st === 'SHIPPED' || tracking.length) state = 'shipped';
  return { ok: true, state, tracking, rawStatus: st };
}

async function cancel(ref) {
  const r = await raw('DELETE', '/shopping/order/deleteOrder?orderId=' + encodeURIComponent(ref), null, await token());
  return { ok: r.ok, error: r.ok ? undefined : 'cj delete ' + r.status };
}

async function getCost(ref) {
  const r = await raw('GET', '/product/variant/queryByVid?vid=' + encodeURIComponent(ref.vid), null, await token());
  const d = r.data && r.data.data;
  const price = d && Number(d.variantSellPrice);
  if (!r.ok || !Number.isFinite(price)) return { ok: false, error: 'cj variant ' + r.status };
  return { ok: true, cost_cents: Math.round(price * 100), in_stock: true /* stock needs the separate inventory endpoint (unverified) */ };
}
module.exports = { name, configured, placeOrder, getStatus, cancel, getCost, _resetToken: () => { tok = null; } };
