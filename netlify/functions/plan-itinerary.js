// ShoreList: Trip planner proxy.
// Keeps the Anthropic key on the server. If ANTHROPIC_API_KEY is not set the
// function answers 503 and the page shows its built-in sample itinerary.
const SYSTEM = `You are ShoreList's AI Trip Planner for Wilmington, NC and the surrounding beaches (Wrightsville Beach, Carolina Beach, Kure Beach). You build personalized day itineraries for visitors and locals.

Available bookable experiences on ShoreList:
- Film & TV Location Tours: Wilmywood Insider Tours, guided by a 20+ year film industry veteran (daytime and evening, downtown Wilmington). category: film-tours
- Ghost Tours / Historic Walking Tours (evening, downtown Wilmington). category: ghost-tours
- Surf Lessons at Carolina Beach or Wrightsville Beach. category: surf-lessons
- Coastal Carolina Nature Walks (Carolina Beach State Park). category: nature-walks

Other experiences available on ShoreList (coming soon, browse only):
- Kayak Tours, Fishing Charters, River Cruises, Paddleboard/SUP, Bike Tours, Wildlife Tours, Beach Picnics, Beach Photography, Jet Ski Rentals, Golf Cart Rentals, Sailboat Rides, Wellness/Spa

Respond ONLY with valid JSON, no markdown, no backticks, no text outside the JSON.

{
  "title": "Your Perfect [X] Day in Wilmington",
  "narrative": "2-3 sentence personal intro for this group, warm and excited",
  "items": [
    { "time": "9:00 AM", "name": "Experience Name", "description": "2 sentences on why it fits them", "tags": ["tag1","tag2"], "category": "category-key-or-null", "bookable": true }
  ]
}

Rules:
- 4-6 items per itinerary
- Match timing realistically (no surf at 10pm)
- Make descriptions personal to the group
- "bookable": true only for ghost-tours, surf-lessons, nature-walks, film-tours
- Tags are short: "2 Hours", "Family Friendly", "On the Water"
- Sound like a local friend wrote it
- Never call the area the "Cape Fear coast"`;

const { corsHeaders, originAllowed, clientIp, rateLimitDurable, aiDailyCheck, AI_CAP_BODY } = require('./_shared.js');
const MAX_BODY = 4000;      // bytes; the form sends one field of at most 600 characters
const RATE = { max: 5, windowMs: 60000 }; // per IP, per warm instance: best effort only (see _shared.js)

exports.handler = async (event) => {
  const headers = corsHeaders(event, { 'Cache-Control': 'no-store' });
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };
  // Only our own pages may spend the AI budget. Foreign or missing Origin/Referer is refused.
  if (!originAllowed(event)) return { statusCode: 403, headers, body: JSON.stringify({ error: 'Forbidden' }) };
  const size = Buffer.byteLength(event.body || '', event.isBase64Encoded ? 'base64' : 'utf8');
  if (size > MAX_BODY) return { statusCode: 413, headers, body: JSON.stringify({ error: 'Request too large' }) };
  const rl = await rateLimitDurable(event, 'ai:' + clientIp(event), RATE.max, RATE.windowMs);
  if (!rl.ok) return { statusCode: 429, headers: { ...headers, 'Retry-After': String(rl.retryAfter) }, body: JSON.stringify({ error: 'Too many requests. Please try again in a minute.' }) };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Planner not configured' }) };

  let input = '';
  try { input = String((JSON.parse((event.isBase64Encoded ? Buffer.from(event.body || '', 'base64').toString('utf8') : event.body) || '{}') || {}).input || ''); } catch (e) {}
  input = input.replace(/\s+/g, ' ').trim().slice(0, 600);
  if (input.length < 3) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Tell us a bit about your group' }) };

  if (!(await aiDailyCheck(event)).ok) return { statusCode: 429, headers: { ...headers, 'Retry-After': '3600' }, body: AI_CAP_BODY };

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: process.env.PLANNER_MODEL || 'claude-sonnet-4-5',
        max_tokens: 1000,
        system: SYSTEM,
        messages: [{ role: 'user', content: 'Build a Wilmington itinerary for: ' + input }],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error('upstream ' + res.status + ' ' + ((data.error && data.error.type) || ''));
    const raw = (data.content || []).map((b) => b.text || '').join('').replace(/```json|```/g, '').trim();
    const plan = JSON.parse(raw.slice(0, 20000));
    if (!plan || !Array.isArray(plan.items)) throw new Error('bad shape');
    return { statusCode: 200, headers, body: JSON.stringify(plan) };
  } catch (err) {
    console.error('plan-itinerary error:', err.message);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Planner unavailable' }) };
  }
};
