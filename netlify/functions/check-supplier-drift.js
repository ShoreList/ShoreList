// Scheduled daily (netlify.toml): compares supplier cost and stock with the catalog and emails flags. Never changes prices.
const F = require('./_fulfill.js');
exports.handler = async () => {
  try { const f = await F.driftCheck(); console.log('check-supplier-drift flags:', f.length); return { statusCode: 200, body: JSON.stringify({ flags: f.length }) }; }
  catch (err) { console.error('check-supplier-drift error:', err.message); return { statusCode: 500, body: 'error' }; }
};
