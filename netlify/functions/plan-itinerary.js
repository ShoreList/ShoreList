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

const ALLOWED_ORIGINS = ['https://shorelist.net', 'https://www.shorelist.net'];

exports.handler = async (event) => {
  const origin = (event.headers && event.headers.origin) || '';
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  };
  if (event.httpMethod === 'OPTIONS') return { statusCode: 204, headers, body: '' };
  if (event.httpMethod !== 'POST') return { statusCode: 405, headers, body: JSON.stringify({ error: 'POST only' }) };

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { statusCode: 503, headers, body: JSON.stringify({ error: 'Planner not configured' }) };

  let input = '';
  try { input = String(JSON.parse(event.body || '{}').input || ''); } catch (e) {}
  input = input.replace(/\s+/g, ' ').trim().slice(0, 600);
  if (input.length < 3) return { statusCode: 400, headers, body: JSON.stringify({ error: 'Tell us a bit about your group' }) };

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
    if (!res.ok) throw new Error((data.error && data.error.message) || 'upstream ' + res.status);
    const raw = (data.content || []).map((b) => b.text || '').join('').replace(/```json|```/g, '').trim();
    const plan = JSON.parse(raw);
    if (!plan || !Array.isArray(plan.items)) throw new Error('bad shape');
    return { statusCode: 200, headers, body: JSON.stringify(plan) };
  } catch (err) {
    console.error('plan-itinerary error:', err.message);
    return { statusCode: 502, headers, body: JSON.stringify({ error: 'Planner unavailable' }) };
  }
};
