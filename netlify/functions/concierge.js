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
  let q = '', c = [], ctx = '', mode = '';
  try { const b = JSON.parse(event.body || '{}'); q = String(b.q || ''); c = Array.isArray(b.candidates) ? b.candidates : []; ctx = String(b.context || '').slice(0, 600); mode = String(b.mode || ''); } catch (e) {}
  q = q.replace(/\s+/g, ' ').trim().slice(0, 300);
  if (mode !== 'report' && q.length < 2) return { statusCode: 400, headers, body: '{}' };
  if (mode === 'report' && ctx.length < 20) return { statusCode: 400, headers, body: '{}' };
  const list = c.slice(0, 6).map((x) => '- ' + String(x.title || '').slice(0, 80) + ': ' + String(x.sub || '').slice(0, 160)).join('\n');
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.PLANNER_MODEL || 'claude-sonnet-4-5', max_tokens: 220,
        system: mode === 'report' ? 'You write a 2 sentence beach report for locals and visitors from the numbers given. Use only the numbers provided, never invent any. Lead with safety (the estimated flag and why), then what it is good for (swimming, surfing, walking, sun). Plain, warm, no emojis, never say Cape Fear coast. Say the flag is an estimate if you mention it.' : 'You are the ShoreList concierge for Wilmington, NC and Wrightsville, Carolina and Kure Beach. Answer in at most 2 short, warm sentences using only the listed options. Do not invent prices, dates or hours. Never say "Cape Fear coast". If nothing fits, say so and suggest browsing tours, events or the shop.',
        messages: [{ role: 'user', content: mode === 'report' ? 'Conditions now: ' + ctx : (ctx ? 'Right now at the beach: ' + ctx + '\n' : '') + 'Visitor asks: ' + q + '\n\nOptions:\n' + list }],
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error('upstream ' + r.status);
    const text = (d.content || []).map((b) => b.text || '').join('').trim().slice(0, 500);
    return { statusCode: 200, headers, body: JSON.stringify({ text }) };
  } catch (e) { console.error('concierge', e.message); return { statusCode: 502, headers, body: '{}' }; }
};
