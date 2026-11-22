// Scheduled hourly (netlify.toml): retries failed supplier orders, polls supplier status, emails tracking to customers.
const F = require('./_fulfill.js');
exports.handler = async (event) => {
  try { const s = await F.syncTracking(event); console.log('sync-supplier-orders:', JSON.stringify(s)); return { statusCode: 200, body: JSON.stringify(s) }; }
  catch (err) { console.error('sync-supplier-orders error:', err.message); return { statusCode: 500, body: 'error' }; }
};
