// Manual adapter: emails a ready-to-send supplier order to the owner (default rj@shorelist.net, env OWNER_ALERT_EMAIL).
// Always "configured". Needs RESEND_API_KEY to email; the record in Netlify Blobs is the fallback source of truth.
// There is no status API: the group stays "manual-awaiting-owner" until the owner places the order by hand.
const name = 'manual';
const configured = () => true;
async function placeOrder(order, ctx) {
  const mail = ctx && ctx.sendMail;
  if (!mail) return { ok: false, error: 'no mail route' };
  const a = (order.shipTo && order.shipTo.address) || {};
  const rows = order.lines.map((l) => `<li>${ctx.e(l.qty)} x ${ctx.e(l.name)} (${ctx.e(l.variantLabel)}), SKU ${ctx.e(l.variantSku)}${l.supplier ? ', supplier ' + ctx.e(l.supplier.name) + ' ' + ctx.e(l.supplier.url) : ''}</li>`).join('');
  const html = `<p>Place this order with the supplier. Reference: <strong>${ctx.e(order.externalId)}</strong></p><ul>${rows}</ul>
<p>Ship to:<br>${[order.shipTo.name, a.line1, a.line2, [a.city, a.state, a.postal_code].filter(Boolean).join(' '), a.country].filter(Boolean).map(ctx.e).join('<br>')}<br>Phone ${ctx.e(order.customer.phone) || 'none'}, email ${ctx.e(order.customer.email)}</p>
<p>${ctx.reason ? ctx.e(ctx.reason) : ''}</p>`;
  const sent = await mail({ to: ctx.ownerEmail, subject: `${ctx.test ? '[TEST] ' : ''}Supplier order to place: ${order.externalId.slice(-10)}`, html });
  return sent ? { ok: true, supplierOrderId: null, state: 'manual-awaiting-owner' } : { ok: false, error: 'owner email not sent' };
}
async function getStatus() { return { ok: true, state: 'manual-awaiting-owner', tracking: [] }; }
async function cancel() { return { ok: true, note: 'manual orders are cancelled by hand with the supplier' }; }
async function getCost() { return { ok: false, error: 'manual supplier has no cost API' }; }
module.exports = { name, configured, placeOrder, getStatus, cancel, getCost };
