// ShoreList — secure PDF download for paid guide orders.
// GET ?session_id=cs_...&file=<guide id>
// Stripe is asked (server side) whether the session is paid and includes that
// guide before a single byte of the PDF is read. The PDFs live in
// netlify/guides-private/, are bundled into this function only (included_files
// in netlify.toml) and are blocked from the public site by a redirect rule.

const fs = require('fs');
const path = require('path');
const { corsHeaders, header, originAllowed, clientIp, rateLimitDurable, paidGuideSession, getGuide } = require('./_shared.js');

// Where the bundled PDFs are: next to the repo root in the deployed function, or ../guides-private when run from the repo.
function guideDirs() {
  const dirs = [];
  if (process.env.LAMBDA_TASK_ROOT) dirs.push(path.join(process.env.LAMBDA_TASK_ROOT, 'netlify', 'guides-private'));
  dirs.push(path.join(__dirname, '..', 'guides-private'), path.join(process.cwd(), 'netlify', 'guides-private'));
  return dirs;
}
function readGuide(file) {
  for (const d of guideDirs()) { try { return fs.readFileSync(path.join(d, file)); } catch (e) { /* try next */ } }
  return null;
}

// A same-site page (the success page's links) sends Origin or Referer; a pasted
// link sends neither but is marked Sec-Fetch-Site none. Anything cross-site is refused.
function callerAllowed(event) {
  if (originAllowed(event)) return true;
  const hasOrigin = !!(header(event, 'origin') || header(event, 'referer'));
  if (hasOrigin) return false;
  const site = header(event, 'sec-fetch-site');
  return site === 'same-origin' || site === 'none';
}

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  const deny = (code, msg, extra) => ({ statusCode: code, headers: Object.assign({}, headers, extra || {}), body: JSON.stringify({ error: msg }) });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'GET') return deny(405, 'Method not allowed');
  if (!callerAllowed(event)) return deny(403, 'Request not allowed.');

  const rl = await rateLimitDurable(event, 'guide-download:' + clientIp(event), 20, 10 * 60 * 1000);
  if (!rl.ok) return deny(429, 'Too many downloads. Please wait a few minutes and try again.', { 'Retry-After': String(rl.retryAfter) });

  const STRIPE_KEY = process.env.STRIPE_SECRET_KEY;
  if (!STRIPE_KEY) { console.error('guide-download: STRIPE_SECRET_KEY is not set'); return deny(500, 'Downloads are unavailable right now.'); }

  const q = event.queryStringParameters || {};
  const guide = getGuide(q.file);
  const NOPE = 'We could not confirm a paid order for that file.';
  if (!guide) return deny(404, NOPE);

  let r;
  try { r = await paidGuideSession(STRIPE_KEY, q.session_id); }
  catch (e) { console.error('guide-download stripe error:', e.message); return deny(502, 'We could not check your order just now. Please try again in a moment.'); }
  if (!r.ok || !r.ids.includes(q.file)) return deny(404, NOPE);

  const pdf = readGuide(guide.file);
  if (!pdf) { console.error('guide-download: file missing from bundle:', guide.file); return deny(500, 'That file is unavailable. Please email rj@shorelist.net and we will send it.'); }

  return {
    statusCode: 200,
    isBase64Encoded: true,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${guide.file}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
      'X-Robots-Tag': 'noindex',
    },
    body: pdf.toString('base64'),
  };
};
