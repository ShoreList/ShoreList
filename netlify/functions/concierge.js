// ShoreList concierge: short, grounded answers. Links come from the client's
// own search results, never from the model. 503 when no key, client falls back.
const ORIGINS = ['https://shorelist.net', 'https://www.shorelist.net'];
exports.handler = async (event) => {
  const o = (event.headers && event.headers.origin) || '';
  const headers = { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': ORIGINS.includes(o) ? o : ORIGINS[0], 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: '{}' };
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'not configured' }) };
  let q = '', c = [];
  try { const b = JSON.parse(event.body || '{}'); q = String(b.q || ''); c = Array.isArray(b.candidates) ? b.candidates : []; } catch (e) {}
  q = q.replace(/\s+/g, ' ').trim().slice(0, 300);
  if (q.length < 2) return { statusCode: 400, headers, body: '{}' };
  const list = c.slice(0, 6).map((x) => '- ' + String(x.title || '').slice(0, 80) + ': ' + String(x.sub || '').slice(0, 160)).join('\n');
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.PLANNER_MODEL || 'claude-sonnet-4-5', max_tokens: 220,
        system: 'You are the ShoreList concierge for Wilmington, NC and Wrightsville, Carolina and Kure Beach. Answer in at most 2 short, warm sentences using only the listed options. Do not invent prices, dates or hours. Never say "Cape Fear coast". If nothing fits, say so and suggest browsing tours, events or the shop.',
        messages: [{ role: 'user', content: 'Visitor asks: ' + q + '\n\nOptions:\n' + list }],
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error('upstream ' + r.status);
    const text = (d.content || []).map((b) => b.text || '').join('').trim().slice(0, 500);
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };
  } catch (e) { console.error('concierge', e.message); return { statusCode: 502, headers, body: '{}' }; }
};
