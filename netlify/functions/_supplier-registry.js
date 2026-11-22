// Pluggable supplier adapters live in _suppliers/<name>.js and share one interface:
//   configured() -> bool; placeOrder(order, ctx) -> {ok, supplierOrderId, state, error?};
//   getStatus(ref) -> {ok, state, tracking:[{carrier,number,url}]}; cancel(ref) -> {ok}; getCost(supplierRef) -> {ok, cost_cents, in_stock}
// To add a supplier: drop a file in _suppliers/, add it below, allow its name in _goods.js itemProblems.
const ADAPTERS = {
  printify: require('./_suppliers/printify.js'),
  cj: require('./_suppliers/cj.js'),
  manual: require('./_suppliers/manual.js'),
};
const adapterName = (supplier) => (supplier && supplier.adapter) || 'manual';
// The adapter to use right now. A real adapter whose env vars are missing is NOT called: the order falls back to the manual email.
function pick(supplier) {
  const want = adapterName(supplier);
  const a = ADAPTERS[want];
  if (a && a.configured()) return { adapter: a, wanted: want, fallback: false };
  return { adapter: ADAPTERS.manual, wanted: want, fallback: want !== 'manual' };
}
module.exports = { ADAPTERS, adapterName, pick };
module.exports.handler = async () => ({ statusCode: 404, body: '' });
