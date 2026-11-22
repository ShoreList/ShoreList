/* Rip, the ShoreList shop stylist.
   - Original sea-glass wave bot drawn in inline SVG (no images, no libraries).
   - Instant, offline matching over shop-catalog.json: scene, vibe, budget, who-for, free text,
     season and (when the beach report loads) weather. Nothing here needs the network once the
     catalog is on the page.
   - Optional AI re-rank through /.netlify/functions/shop-bot. It can only pick ids the page
     already knows, and any failure leaves the instant picks exactly as they were.
   - Shopify pieces go through the existing on-site bag (shop-cart.js takes over a.buy links),
     other stores get a plain link. */
(function () {
  'use strict';
  if (window.RipBot) return;

  var AI_URL = '/.netlify/functions/shop-bot';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function $(s, r) { return (r || document).querySelector(s); }
  function track(n, p) { try { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); } catch (e) {} }
  function fmt(n) { return '$' + (Math.round(n * 100) % 100 === 0 ? n.toFixed(0) : n.toFixed(2)); }

  /* ------------------------------------------------------------------ mascot */
  function mascot(uid, label, cls) {
    var u = uid;
    return '<svg class="rb-fig ' + (cls || '') + '" viewBox="0 0 160 210" width="160" height="210" focusable="false" ' + (label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"') + '>' +
      '<defs>' +
      '<linearGradient id="rbg' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2F8F1"/><stop offset=".55" stop-color="#93D9CB"/><stop offset="1" stop-color="#5FB5AB"/></linearGradient>' +
      '<linearGradient id="rbf' + u + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#B5EBDD"/></linearGradient>' +
      '<linearGradient id="rbv' + u + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B1D31"/><stop offset="1" stop-color="#143A52"/></linearGradient>' +
      '<filter id="rbk' + u + '" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs>' +
      '<ellipse class="rb-shadow" cx="80" cy="207" rx="50" ry="4" fill="#021018"/>' +
      '<g class="rb-float">' +
      /* a little hover surfboard under the feet, glowing underneath */
      '<ellipse class="rb-jet" cx="80" cy="198" rx="52" ry="4" fill="#5CF0D8" filter="url(#rbk' + u + ')"/>' +
      '<path d="M12 188 Q14 179 40 178 L120 178 Q148 179 150 188 Q148 197 120 198 L40 198 Q14 197 12 188 Z" fill="#F5E8CB" stroke="#0A4D5C" stroke-width="2.5"/>' +
      '<path d="M26 188 H134" stroke="#E96645" stroke-width="3.2" stroke-linecap="round"/><path d="M30 183 Q60 180 90 181" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/>' +
      /* feet */
      '<rect x="48" y="168" width="28" height="15" rx="7.5" fill="#3F9B94" stroke="#0A4D5C" stroke-width="2"/><rect x="84" y="168" width="28" height="15" rx="7.5" fill="#3F9B94" stroke="#0A4D5C" stroke-width="2"/>' +
      /* left arm (down) */
      '<path d="M47 124 Q30 132 31 152" fill="none" stroke="#0A4D5C" stroke-width="12" stroke-linecap="round"/><path d="M47 124 Q30 132 31 152" fill="none" stroke="url(#rbg' + u + ')" stroke-width="8" stroke-linecap="round"/><circle cx="31" cy="155" r="7" fill="#93D9CB" stroke="#0A4D5C" stroke-width="2"/>' +
      /* torso */
      '<path d="M44 124 Q44 106 62 106 H98 Q116 106 116 124 V156 Q116 174 96 174 H64 Q44 174 44 156 Z" fill="url(#rbg' + u + ')" stroke="#0A4D5C" stroke-width="2.5"/>' +
      '<path d="M52 118 Q54 111 62 111" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="3" stroke-linecap="round"/>' +
      '<rect x="59" y="124" width="42" height="34" rx="11" fill="#0B1D31" stroke="#5CF0D8" stroke-opacity=".7" stroke-width="1.4"/>' +
      '<path class="rb-wave" d="M63 142 q4.5 -9 9 0 t9 0 t9 0 t9 0" fill="none" stroke="#5CF0D8" stroke-width="2.4" stroke-linecap="round" filter="url(#rbk' + u + ')"/>' +
      '<circle class="rb-led" cx="94" cy="130" r="2.4" fill="#E96645"/>' +
      '<path d="M60 168 H100" stroke="#0A4D5C" stroke-opacity=".35" stroke-width="2" stroke-linecap="round"/>' +
      /* right arm: raised, shaka */
      '<g class="rb-arm"><path d="M113 124 Q136 126 141 100" fill="none" stroke="#0A4D5C" stroke-width="12" stroke-linecap="round"/><path d="M113 124 Q136 126 141 100" fill="none" stroke="url(#rbg' + u + ')" stroke-width="8" stroke-linecap="round"/>' +
      '<path d="M134 92 L124 81" stroke="#0A4D5C" stroke-width="10" stroke-linecap="round"/><path d="M134 92 L124 81" stroke="#93D9CB" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M148 89 L156 74" stroke="#0A4D5C" stroke-width="9" stroke-linecap="round"/><path d="M148 89 L156 74" stroke="#93D9CB" stroke-width="5" stroke-linecap="round"/>' +
      '<rect x="131" y="85" width="21" height="23" rx="9" fill="#93D9CB" stroke="#0A4D5C" stroke-width="2"/><path d="M138 94 V102 M145 94 V102" stroke="#0A4D5C" stroke-opacity=".45" stroke-width="1.6" stroke-linecap="round"/></g>' +
      /* head */
      '<rect x="28" y="24" width="104" height="88" rx="38" fill="url(#rbg' + u + ')" stroke="#0A4D5C" stroke-width="2.5"/>' +
      '<circle cx="27" cy="72" r="9" fill="#0B1D31" stroke="#0A4D5C" stroke-width="2"/><circle cx="27" cy="72" r="4.2" fill="none" stroke="#5CF0D8" stroke-width="1.8" class="rb-led"/>' +
      '<circle cx="133" cy="72" r="9" fill="#0B1D31" stroke="#0A4D5C" stroke-width="2"/><circle cx="133" cy="72" r="4.2" fill="none" stroke="#5CF0D8" stroke-width="1.8" class="rb-led"/>' +
      '<rect x="40" y="46" width="80" height="48" rx="22" fill="url(#rbv' + u + ')" stroke="#5CF0D8" stroke-opacity=".7" stroke-width="1.6"/>' +
      '<path d="M50 54 Q64 49 78 51" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>' +
      '<rect class="rb-eye" x="58" y="58" width="13" height="19" rx="6.5" fill="#5CF0D8" filter="url(#rbk' + u + ')"/><rect class="rb-eye" x="89" y="58" width="13" height="19" rx="6.5" fill="#5CF0D8" filter="url(#rbk' + u + ')"/>' +
      '<path d="M69 84 Q80 92 91 84" fill="none" stroke="#5CF0D8" stroke-width="2.8" stroke-linecap="round" filter="url(#rbk' + u + ')"/>' +
      '<circle cx="50" cy="84" r="3.4" fill="#E96645" opacity=".55"/><circle cx="110" cy="84" r="3.4" fill="#E96645" opacity=".55"/>' +
      /* wave crest on top of the head: a curling wave, the whole point of Rip */
      '<path d="M30 50 C22 20 50 -4 88 0 C120 4 142 24 133 48 C131 55 121 55 121 47 C123 37 115 28 103 28 C113 19 105 9 91 9 C65 9 48 28 49 52 Z" fill="url(#rbf' + u + ')" stroke="#0A4D5C" stroke-width="2.5" stroke-linejoin="round"/>' +
      '<path d="M104 27 C112 28 117 36 113 43" fill="none" stroke="#5FB5AB" stroke-width="2.4" stroke-linecap="round"/>' +
      '<path d="M44 40 C46 24 62 12 84 10" fill="none" stroke="#5FB5AB" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>' +
      '<path d="M56 18 Q74 8 92 13" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width="2.6" stroke-linecap="round"/>' +
      '<circle cx="136" cy="18" r="2.6" fill="#fff"/><circle cx="144" cy="30" r="1.9" fill="#fff"/><circle cx="126" cy="8" r="1.7" fill="#fff"/><circle cx="148" cy="42" r="1.4" fill="#fff"/>' +
      '</g>' +
      '<circle class="rb-bub" cx="22" cy="150" r="2.6" fill="#BFF6EC"/><circle class="rb-bub rb-bub2" cx="14" cy="130" r="2" fill="#BFF6EC"/><circle class="rb-bub rb-bub3" cx="148" cy="150" r="2.2" fill="#BFF6EC"/>' +
      '</svg>';
  }

  /* ------------------------------------------------------------------ catalog + features */
  var TYPES = [
    ['hoodie', /hoodie/i], ['crewneck', /crewneck/i], ['beanie', /beanie/i], ['cap', /\bcap\b|dad hat/i],
    ['softcooler', /soft cooler/i], ['cooler', /can cooler/i], ['umbrella', /umbrella/i], ['chair', /\bchair\b/i],
    ['towel', /towel/i], ['ornament', /ornament/i], ['print', /art print/i], ['tote', /\btote\b/i], ['tee', /\btee\b/i]
  ];
  /* w: warmth, s: season (w winter, s summer, a any), g: gift-friendliness, quip: Rip's line (plain, no claims) */
  var TM = {
    hoodie: { s: 'w', g: 1, q: ['A hoodie for when the sea breeze gets opinions.', 'Pullover weather, handled.'] },
    crewneck: { s: 'w', g: 1.2, q: ['A crewneck that works from boardwalk to bonfire.', 'The easy layer. Throw it on and go.'] },
    beanie: { s: 'w', g: 1.6, q: ['A cuffed beanie for chilly shoreline mornings.', 'Small, warm, easy to gift.'] },
    cap: { s: 's', g: 1.4, q: ['A cap for sun duty.', 'Brim down, day sorted.'] },
    softcooler: { s: 's', g: 1, q: ['A shoulder-strap soft cooler for the beach run.', 'Snacks and drinks, one bag.'] },
    cooler: { s: 'a', g: 1.8, q: ['A foam-lined can cooler, easy to pocket and easy to gift.', 'Tiny gift, big shore energy.'] },
    umbrella: { s: 's', g: .4, q: ['A tilting canopy for shade on the sand.', 'Your own patch of shade.'] },
    chair: { s: 's', g: .6, q: ['A backpack chair so your hands stay free.', 'Sit low, stay long.'] },
    towel: { s: 's', g: 1.2, q: ['An oversized terry towel for the sand.', 'The towel that does the most.'] },
    ornament: { s: 'x', g: 2.4, q: ['A dated ceramic keepsake for the tree.', 'Hang a little beach on the tree.'] },
    print: { s: 'a', g: 2, q: ['Wall art, no sand required.', 'A local landmark for the wall.'] },
    tote: { s: 'a', g: 1.4, q: ['A tote that actually carries the beach stuff.', 'Market run or beach run, it handles both.'] },
    tee: { s: 's', g: .8, q: ['An easy tee that goes with everything.', 'Wear it today, wear it all season.'] },
    item: { s: 'a', g: 0, q: ['A local pick from the shop.'] }
  };
  var VIBE = {
    chill: { label: 'Chill', types: { tee: 2, cap: 2, tote: 2, towel: 2, chair: 2, softcooler: 1.5, umbrella: 1.5 }, coll: { 'sea-oats': 3, 'tide-line': 3, 'beach-setup': 1.5 } },
    sporty: { label: 'Sporty', types: { tee: 1, cap: 1.5 }, coll: {}, kw: /surf|pickleball|tennis|golf/, kwv: 5 },
    classic: { label: 'Classic', types: { print: 1 }, coll: { heritage: 3, classics: 3, 'local-icons': 2.5, landmarks: 1.5 } },
    cozy: { label: 'Cozy', types: { hoodie: 4, crewneck: 3.5, beanie: 3.5 }, coll: {} },
    gift: { label: 'Gift mode', types: { ornament: 3, print: 3, cooler: 3, tote: 2, cap: 1.5, beanie: 1.5, towel: 1.5, tee: .5 }, coll: { 'local-icons': 1 } }
  };
  var SCENE_NAMES = { beach: 'Beach', boardwalk: 'Boardwalk', riverwalk: 'Riverwalk', 'harbor-night': 'Harbor night' };
  var BUDGETS = { u25: 25, u50: 50, u100: 100, any: 0 };
  var BUDGET_LABEL = { u25: 'Under $25', u50: 'Under $50', u100: 'Under $100', any: 'No limit' };
  var WHO_LABEL = { me: 'For me', partner: 'For my person', parent: 'For a parent', friend: 'For a friend', crew: 'For the crew' };

  var live = [], FEATS = [], byId = {}, stores = {}, allowed = [], catData = null;
  function safeUrl(u) {
    var m = /^https:\/\/([a-z0-9.-]+)\//i.exec(u || ''); if (!m) return '';
    var h = m[1].toLowerCase(); if (!allowed.length) return u;
    return allowed.some(function (a) { return h === a || h.slice(-a.length - 1) === '.' + a; }) ? u : '';
  }
  function townOf(n) {
    if (/wrightsville/i.test(n)) return 'wb'; if (/carolina beach/i.test(n)) return 'cb'; if (/kure beach/i.test(n)) return 'kb';
    if (/wilmington|\bilm\b|airlie|uss north carolina|live oak/i.test(n)) return 'ilm'; return '';
  }
  function build(data) {
    catData = data; allowed = (data.allowedHosts || []).map(function (x) { return String(x).toLowerCase(); });
    var cn = {}; (data.collections || []).forEach(function (c) { cn[c.id] = c.name; });
    stores = {}; (data.stores || []).forEach(function (s) { stores[s.id] = s; });
    live = (data.items || []).filter(function (i) { return i && i.id && i.name && i.url && safeUrl(i.url); });
    FEATS = live.map(function (i) {
      var t = 'item'; for (var k = 0; k < TYPES.length; k++) if (TYPES[k][1].test(i.name)) { t = TYPES[k][0]; break; }
      var nm = i.name.toLowerCase();
      var interests = ['surf', 'pickleball', 'tennis', 'golf', 'sail', 'fish', 'pelican', 'crab', 'oak'].filter(function (w) {
        return w === 'sail' ? /sail|sloop|pennant|yacht|harbor/.test(nm + ' ' + (i.meta || '').toLowerCase()) : w === 'fish' ? /fishing|pier/.test(nm) : nm.indexOf(w) > -1;
      });
      var f = { i: i, type: t, town: townOf(i.name), interests: interests, xmas: i.collection === 'coastal-christmas' || t === 'ornament',
        kw: (nm + ' ' + (i.alt || '') + ' ' + (cn[i.collection] || '')).toLowerCase(), kw2: (i.meta || '').toLowerCase(),
        price: typeof i.price === 'number' && isFinite(i.price) ? i.price : null, shop: /^https:\/\/shorelist\.myshopify\.com\/products\//i.test(i.url) };
      byId[i.id] = f; return f;
    });
  }

  /* ------------------------------------------------------------------ text parsing */
  var STOP = /^(a|an|the|and|or|for|to|of|in|on|at|my|me|i|is|it|im|i'm|want|need|looking|something|some|find|get|show|give|please|that|this|with|who|loves|love|like|likes|good|nice|cool|best|about|around|under|over|below|less|than|max|up|budget|new|one|any|can|you|help|ideas|idea|pick|gift|present)$/;
  var SYN = {
    hoodie: /hood(?:y|ie|ies)|sweatshirt|pullover/, crewneck: /crew ?necks?|sweater|jumper/, tee: /\b(?:tee|tees|t-shirt|tshirt|shirt|shirts)\b/, cap: /\b(?:hat|hats|cap|caps)\b|dad hat|baseball/,
    beanie: /beanie|knit hat|winter hat|toque/, tote: /\btotes?\b|market bag|carryall/, print: /\bprints?\b|poster|wall art|\bart\b|frame|decor/, cooler: /cooler|koozie|can holder/,
    umbrella: /umbrella|shade|sunshade/, chair: /\bchairs?\b|\bseats?\b/, towel: /towel/, ornament: /ornament|christmas|xmas|stocking|\btree\b/
  };
  var TOWN_RX = { wb: /wrightsville|\bwb\b/, cb: /carolina beach|\bcb\b|boardwalk/, kb: /kure|\bkb\b/, ilm: /wilmington|\bilm\b|downtown|riverwalk|historic|airlie|battleship/ };
  var INT_RX = { surf: /surf/, pickleball: /pickle/, tennis: /tennis/, golf: /golf/, sail: /sail|sloop|boat|yacht|pennant|harbor/, fish: /fish|pier/, pelican: /pelican/, crab: /crab/, oak: /\boak\b/ };
  function parseText(q) {
    q = String(q || '').toLowerCase().replace(/[^a-z0-9$'\s.+-]/g, ' ').replace(/\s+/g, ' ').trim();
    var P = { q: q, types: [], towns: [], interests: [], words: [], cap: 0, gift: false, parent: false, lux: false, cheap: false, kids: false, cozy: false, sunny: false, signal: false };
    if (!q) return P;
    var m = /(?:under|below|less than|max(?:imum)?|up to|budget(?: of)?|around|about|within|\$)\s*\$?\s*(\d{1,4})/.exec(q) || /\$\s*(\d{1,4})/.exec(q) || /(\d{1,4})\s*(?:dollars|bucks|or less)/.exec(q);
    if (m) P.cap = parseInt(m[1], 10);
    if (/cheap|affordable|inexpensive|stocking stuffer|small gift|little gift/.test(q)) { P.cheap = true; if (!P.cap) P.cap = 30; }
    if (/splurge|treat myself|luxury|fancy|premium|nice one/.test(q)) P.lux = true;
    if (/gift|present|birthday|anniversary|stocking|for my|for a |secret santa|host(?:ess)? gift|housewarming|thank you/.test(q)) P.gift = true;
    if (/\b(mom|mother|dad|father|grandma|grandpa|grandmother|grandfather|parents?|in-laws?)\b/.test(q)) { P.gift = true; P.parent = true; }
    if (/\b(kid|kids|child|children|baby|toddler|boy|girl|son|daughter)\b/.test(q)) P.kids = true;
    if (/cozy|cold|chilly|winter|warm up|layer|fireside|bonfire/.test(q)) P.cozy = true;
    if (/sun|sunny|hot|summer|beach day|swim|shade|tan/.test(q)) P.sunny = true;
    Object.keys(SYN).forEach(function (k) { if (SYN[k].test(q)) P.types.push(k); });
    if (P.types.indexOf('cooler') > -1 && /\b(?:soft|18|bag|picnic|group|crew)\b/.test(q)) P.types.push('softcooler');
    Object.keys(TOWN_RX).forEach(function (k) { if (TOWN_RX[k].test(q)) P.towns.push(k); });
    Object.keys(INT_RX).forEach(function (k) { if (INT_RX[k].test(q)) P.interests.push(k); });
    q.split(' ').forEach(function (w) { w = w.replace(/^[$.+-]+|[$.+-]+$/g, ''); if (w.length > 2 && !STOP.test(w) && !/^\d+$/.test(w) && P.words.indexOf(w) < 0) P.words.push(w); });
    P.words = P.words.slice(0, 8);
    P.signal = !!(P.types.length || P.towns.length || P.interests.length || P.words.length);
    return P;
  }
  function textScore(f, P) {
    var s = 0, hit = false;
    P.types.forEach(function (t) { if (f.type === t) { s += 5; hit = true; } });
    P.towns.forEach(function (t) { if (f.town === t) { s += 4; hit = true; } else if (f.town) s -= 1.2; });
    P.interests.forEach(function (x) { if (f.interests.indexOf(x) > -1) { s += 5; hit = true; } });
    P.words.forEach(function (w) {
      var stem = w.replace(/(es|s)$/, ''); if (stem.length < 3) stem = w;
      if (f.kw.indexOf(stem) > -1) { s += 1.6; hit = true; } else if (f.kw2.indexOf(stem) > -1) { s += .6; hit = true; }
    });
    return hit ? Math.max(s, .5) : 0;
  }

  /* ------------------------------------------------------------------ ranking */
  function nyParts() {
    try {
      var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', month: 'numeric', day: 'numeric', year: 'numeric' }).formatToParts(new Date()), o = {};
      p.forEach(function (x) { o[x.type] = +x.value; }); return o;
    } catch (e) { var d = new Date(); return { month: d.getMonth() + 1, day: d.getDate(), year: d.getFullYear() }; }
  }
  function seasonOf(m) { return (m >= 11 || m <= 3) ? 'w' : (m >= 6 && m <= 9) ? 's' : 'h'; }
  function xmasWindow(np) { return np.month === 11 || np.month === 12 || (np.month === 1 && np.day <= 10); }
  function hash(str) { var h = 7; for (var k = 0; k < str.length; k++) h = (h * 31 + str.charCodeAt(k)) % 100003; return h; }
  var MOODS = {
    rain: { add: { hoodie: 2, crewneck: 2, beanie: 1.5, tote: 1 }, sub: { umbrella: 2.5, chair: 2, towel: 1.5, cap: 1 }, tag: 'Rainy day' },
    cold: { add: { hoodie: 3, beanie: 3, crewneck: 2.5 }, sub: { tee: 2, cap: 1.5, umbrella: 3, chair: 2.5, towel: 2.5, softcooler: 2 }, tag: 'Cold snap' },
    cool: { add: { crewneck: 2, hoodie: 1.5, beanie: 1 }, sub: { umbrella: 1.5, towel: 1, chair: 1 }, tag: 'Cool day' },
    mild: { add: { tee: 1, cap: .8, crewneck: .6, tote: .6 }, sub: {}, tag: 'Mild day' },
    warm: { add: { tee: 1.6, cap: 1.4, towel: 1, chair: 1, umbrella: 1, softcooler: 1 }, sub: { hoodie: 2, beanie: 2 }, tag: 'Sunny day' },
    hot: { add: { tee: 2, cap: 2, umbrella: 2.5, towel: 2, softcooler: 2, cooler: 1.5, chair: 1.5 }, sub: { hoodie: 3, beanie: 3, crewneck: 2 }, tag: 'Hot day' }
  };
  function seasonalMood(np) { return np.month >= 6 && np.month <= 9 ? 'warm' : (np.month === 12 || np.month <= 2) ? 'cool' : 'mild'; }

  /* o: {scene,vibe,budget,who,q,mood}. Returns every item ranked, best first. */
  function rank(o) {
    var np = nyParts(), ss = seasonOf(np.month), xm = xmasWindow(np), P = parseText(o.q), md = MOODS[o.mood] || null;
    var cap = BUDGETS[o.budget] || 0; if (P.cap && (!cap || P.cap < cap)) cap = P.cap;
    var who = o.who || (P.gift ? 'friend' : 'me'), giftish = who !== 'me' || P.gift || o.vibe === 'gift';
    var day = np.year * 400 + np.month * 31 + np.day;
    var out = FEATS.map(function (f) {
      var s = 0, facets = 0, matched = 0, tags = [], tm = TM[f.type] || TM.item;
      if (o.scene) { facets++; if ((f.i.scenes || []).indexOf(o.scene) > -1) { matched++; s += 2.5; tags.push(SCENE_NAMES[o.scene] || o.scene); } }
      if (o.vibe && VIBE[o.vibe]) {
        facets++; var V = VIBE[o.vibe], vs = (V.types[f.type] || 0) + (V.coll[f.i.collection] || 0) + (V.kw && V.kw.test(f.kw + ' ' + f.kw2) ? V.kwv : 0);
        if (vs > 0) { matched++; s += vs; tags.push(V.label); }
      }
      if (P.signal) {
        facets++; var ts = textScore(f, P);
        if (ts > 0) { matched++; s += ts; f.interests.forEach(function (x) { if (P.interests.indexOf(x) > -1) tags.push(x === 'sail' ? 'Sail' : x.charAt(0).toUpperCase() + x.slice(1)); }); }
      }
      /* season: the calendar always counts, weather adds to it */
      if (f.xmas) { s += xm ? 4 : -9; if (xm) tags.push('Holiday'); }
      else if (tm.s === 'w') s += ss === 'w' ? 2.2 : ss === 's' ? -2 : 0;
      else if (tm.s === 's') s += ss === 's' ? 2.2 : ss === 'w' ? -1.6 : 0;
      if (P.cozy) s += (tm.s === 'w' ? 3 : 0); if (P.sunny) s += (tm.s === 's' ? 2 : 0);
      if (md) {
        var d = (md.add[f.type] || 0) - (md.sub[f.type] || 0); s += d;
        if (d >= 1.5 && !o.vibe) tags.push(md.tag);
      }
      if (giftish) { s += tm.g; if (tm.g >= 1.4 && who !== 'me') tags.push('Gift friendly'); }
      if (who === 'crew' && (f.type === 'cooler' || f.type === 'softcooler' || f.type === 'umbrella' || f.type === 'chair' || f.type === 'towel')) s += 2;
      if (who === 'parent' || P.parent) { if (f.i.collection === 'heritage' || f.i.collection === 'classics' || f.type === 'print') s += 1.2; }
      if (P.lux && f.price != null && f.price >= 80) s += 2.5;
      if (P.cheap && f.price != null && f.price <= 30) s += 2;
      s += (hash(f.i.id + day) % 100) / 100 * 1.1; /* tiny daily shuffle so near-ties rotate */
      var rel = facets === 0 || matched === facets, inB = !cap || f.price == null || f.price <= cap, near = cap && f.price != null && f.price > cap && f.price <= cap * 1.8;
      if (cap && inB && f.price != null) tags.push(o.budget && BUDGETS[o.budget] ? BUDGET_LABEL[o.budget] : 'Under ' + fmt(cap));
      if (cap && near) s -= (f.price - cap) / cap * 3;
      var tier = rel && inB ? 3 : rel && near ? 2 : inB ? 1 : 0;
      return { f: f, s: s, tier: tier, over: !inB, tags: dedupe(tags).slice(0, 3), matched: matched, facets: facets };
    });
    out.sort(function (a, b) { return b.tier - a.tier || b.s - a.s; });
    out.P = P; out.cap = cap; out.who = who;
    return out;
  }
  function dedupe(a) { var seen = {}; return a.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }
  /* Greedy pick with variety: not three of the same kind or town. */
  function choose(ranked, n, exclude) {
    var pool = ranked.filter(function (r) { return !exclude || exclude.indexOf(r.f.i.id) < 0; }), out = [];
    while (out.length < n && pool.length) {
      var bi = 0, bk = -1e9;
      for (var k = 0; k < pool.length; k++) {
        var p = pool[k], pen = 0;
        out.forEach(function (q) { if (q.f.type === p.f.type) pen += 2.6; if (q.f.xmas && p.f.xmas) pen += 3; if (p.f.town && q.f.town === p.f.town) pen += 1.2; if (q.f.i.collection === p.f.i.collection) pen += .6; });
        var key = p.tier * 30 + p.s - pen; if (key > bk) { bk = key; bi = k; }
      }
      out.push(pool.splice(bi, 1)[0]);
    }
    return out;
  }
  function search(o, n, exclude) {
    var ranked = rank(o), picks = choose(ranked, n || 3, exclude);
    var anyHit = ranked.some(function (r) { return r.matched > 0; }), want = o.scene || o.vibe || ranked.P.signal;
    return { ranked: ranked, picks: picks, over: picks.some(function (p) { return p.tier === 2 || p.over; }), blank: !!want && !anyHit, P: ranked.P, cap: ranked.cap };
  }

  /* ------------------------------------------------------------------ voice */
  var turnN = 0;
  function rot(a) { turnN++; return a[(turnN + (hash(String(Date.now() >> 14)) % 3)) % a.length]; }
  var SAY = {
    scene: { beach: ['Beach mode. Sand-proof is a vibe, not a promise.', 'Beach it is. Nothing here minds a little salt.'], boardwalk: ['Boardwalk night, got it. Snack-compatible gear only.', 'Boardwalk lap incoming. Pockets optional, style required.'], riverwalk: ['Riverwalk stroll. Slow pace, good light.', 'Riverwalk it is. Easy walking, easy wearing.'], 'harbor-night': ['Harbor night. Deep navy does most of the work.', 'After-dark by the water. Keep it dark and simple.'] },
    vibe: { chill: ['Keeping it chill.', 'Low effort, high comfort.'], sporty: ['Sporty, so nothing that fights your swing or your stride.', 'Sporty picks, ready to move.'], classic: ['Classic lettering, no trend to outlive.', 'Classic, the kind you can just keep wearing.'], cozy: ['Cozy mode. Layers beat sunburn this time of year.', 'Cozy it is. Sleeves down, shoulders up.'], gift: ['Gift mode, so I leaned on the easy yeses.', 'For gifting, I went with pieces that are simple to say yes to.'] },
    who: { partner: 'For your person, so nothing too loud.', parent: 'For a parent, so I went dependable.', friend: 'For a friend, so nothing too niche.', crew: 'For the whole crew, so I leaned toward group-friendly gear.' },
    generic: ['Three from the shop, picked for right now.', 'Here are three that fit the moment.', 'Tide check done. Here are three.'],
    close: ['Say the word for three more.', 'Want a different angle? Tap more.', 'No rush. Poke around.']
  };
  function compose(o, res) {
    var P = res.P, bits = [];
    if (res.blank) return rot(["That one stumped my circuits, so I went with what fits the season.", "I couldn't read that one, so here is what suits the moment."]);
    if (P.kids) bits.push("I can't promise kids' sizes from here, so check sizes on the product page. These are the easiest to gift.");
    if (o.scene) bits.push(rot(SAY.scene[o.scene] || ['']));
    else if (o.vibe) bits.push(rot(SAY.vibe[o.vibe]));
    else if (P.signal) bits.push(rot(['On it.', 'Got it.', 'Good ask.']));
    if (o.vibe && o.scene) bits.push(rot(SAY.vibe[o.vibe]));
    if (res.over && res.cap) {
      var cheapest = res.picks.reduce(function (m, p) { return p.f.price != null && (m == null || p.f.price < m) ? p.f.price : m; }, null);
      bits.push('Nothing matching that fits under ' + fmt(res.cap) + (cheapest ? ', so the nearest starts at ' + fmt(cheapest) : '') + '.');
    } else if (res.cap && (o.budget || P.cap)) bits.push('All within ' + fmt(res.cap) + '.');
    if (o.who && SAY.who[o.who]) bits.push(SAY.who[o.who]);
    if (!bits.length) bits.push(mood && MOOD_QUIP[mood] ? MOOD_QUIP[mood] : rot(SAY.generic));
    return bits.slice(0, 3).join(' ');
  }

  /* ------------------------------------------------------------------ cards */
  function cardHtml(r, why) {
    var f = r.f, i = f.i, tm = TM[f.type] || TM.item;
    var quip = why || tm.q[hash(i.id) % tm.q.length];
    var price = f.price != null ? (i.from === true ? 'From ' : '') + fmt(f.price) : '';
    var st = stores[i.store], buy;
    if (f.shop) buy = '<a class="buy" href="' + esc(i.url) + '">Add to bag</a>';
    else buy = '<a class="buy" target="_blank" rel="noopener" href="' + esc(i.url) + '">' + esc(i.cta || 'Choose options and buy') + '</a><span class="rb-out">Opens ' + esc(st && st.name ? st.name : 'our second store') + ' in a new tab</span>';
    return '<article class="rb-card" data-id="' + esc(i.id) + '"><div class="rb-ph">' + (i.img ? '<img src="' + esc(i.img) + '" alt="' + esc(i.alt || i.name) + '" loading="lazy" decoding="async" width="84" height="112"/>' : '') + '</div>' +
      '<div class="rb-bd"><h3 class="rb-name">' + esc(i.name) + '</h3>' + (price ? '<div class="rb-price">' + esc(price) + '</div>' : '') +
      '<p class="rb-why">' + esc(quip) + '</p>' + (r.tags && r.tags.length ? '<div class="rb-tags">' + r.tags.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' : '') + buy + '</div></article>';
  }
  function asRanked(items) { return items.map(function (i) { return { f: byId[i.id] || { i: i, type: 'item', price: typeof i.price === 'number' ? i.price : null, shop: /^https:\/\/shorelist\.myshopify\.com\/products\//i.test(i.url || '') }, tags: [] }; }); }

  /* ------------------------------------------------------------------ weather mood */
  var mood = '', moodText = '', moodListeners = [];
  function moodFrom(d) {
    if (d.code >= 61) return 'rain';
    var t = d.temp; if (t == null) return '';
    return t < 48 ? 'cold' : t < 64 ? 'cool' : t < 78 ? 'mild' : t < 86 ? 'warm' : 'hot';
  }
  var MOOD_QUIP = {
    rain: 'Rain on the radar, so layers and a tote. The sea can wait.', cold: 'Cold snap. Hoodies and beanies are doing the heavy lifting.', cool: 'Cool and crisp. Crewneck weather, no notes.',
    mild: 'Mild out there. A tee and a light layer, you are set.', warm: 'Warm and bright. Caps and tees, sunscreen is on you.', hot: 'Hot one. Shade, towel, cold can, in that order.'
  };
  var SEASON_QUIP = { warm: 'Summer mode. Shade, caps and easy tees.', cool: 'Cool season. Layers first, beach second.', mild: 'Shoulder season. A tee and a light layer cover most days.' };
  function loadMood() {
    var W = window.ShoreWX; if (!W || typeof W.get !== 'function') return;
    var done = false, timer = setTimeout(function () { done = true; }, 6000);
    W.get(0).then(function (d) {
      clearTimeout(timer); if (done || !d || d.temp == null) return;
      mood = moodFrom(d);
      var s = '';
      try { s = String(W.summary(d).split(': ')[1] || '').split(',')[0]; } catch (e) {}
      var m = /^(\d+)F\s*(.*)$/.exec(s);
      moodText = d.beach.name + ' is ' + (m ? m[1] + '°F' + (m[2] ? ' and ' + m[2].toLowerCase() : '') : Math.round(d.temp) + '°F') + ' right now.';
      moodListeners.forEach(function (fn) { try { fn(); } catch (e) {} });
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------ chat panel */
  var S = { scene: '', vibe: '', budget: '', who: '', q: '' };
  var pending = null, autoCollapsed = false;
  var ui = null, uidN = 0, seen = [], lastSig = '', lastChip = null, aiOK = true, aiCache = {}, lastFocus = null, opened = false, lastTurn = null;
  var DIAL = null;
  function sceneOpts() {
    var sc = (catData && catData.scenes) || []; var out = [];
    sc.forEach(function (s) { if (SCENE_NAMES[s.id] && live.some(function (i) { return (i.scenes || []).indexOf(s.id) > -1; })) out.push([s.id, s.name || SCENE_NAMES[s.id]]); });
    return out;
  }
  function dialHtml() {
    DIAL = [
      { k: 'scene', l: 'Where', o: sceneOpts() },
      { k: 'vibe', l: 'Vibe', o: [['chill', 'Chill'], ['sporty', 'Sporty'], ['classic', 'Classic'], ['cozy', 'Cozy'], ['gift', 'Gift mode']] },
      { k: 'budget', l: 'Budget', o: [['u25', 'Under $25'], ['u50', 'Under $50'], ['u100', 'Under $100'], ['any', 'No limit']] },
      { k: 'who', l: 'Who for', o: [['me', 'Me'], ['partner', 'My person'], ['parent', 'A parent'], ['friend', 'A friend'], ['crew', 'The crew']] }
    ];
    return DIAL.filter(function (g) { return g.o.length; }).map(function (g) {
      var id = 'rbL' + g.k;
      return '<div class="rb-grp" role="group" aria-labelledby="' + id + '"><p class="rb-lab" id="' + id + '">' + g.l + '</p><div class="rb-row">' + g.o.map(function (x) { return '<button class="rb-chip" type="button" data-k="' + g.k + '" data-v="' + esc(x[0]) + '" aria-pressed="false">' + esc(x[1]) + '</button>'; }).join('') + '</div></div>';
    }).join('');
  }
  function summary() {
    var b = []; if (S.scene) b.push(SCENE_NAMES[S.scene] || S.scene); if (S.vibe) b.push(VIBE[S.vibe].label); if (S.budget) b.push(BUDGET_LABEL[S.budget]); if (S.who) b.push(WHO_LABEL[S.who]);
    return b.join(', ');
  }
  function syncChips() {
    ui.panel.querySelectorAll('.rb-chip').forEach(function (c) { c.setAttribute('aria-pressed', S[c.getAttribute('data-k')] === c.getAttribute('data-v') ? 'true' : 'false'); });
    var s = summary(); ui.sum.textContent = s || 'tap to choose';
  }
  function scrollTo(el) {
    if (!el) return;
    var lg = ui.log; lg.scrollTop += (el.getBoundingClientRect().top - lg.getBoundingClientRect().top) - 8;
  }
  function addMsg(cls, html) { var d = document.createElement('div'); d.className = 'rb-msg ' + cls; d.innerHTML = html; ui.log.appendChild(d); return d; }
  function setThink(on) { ui.panel.querySelectorAll('.rb-fig').forEach(function (s) { s.classList.toggle('rb-think', !!on); }); }
  function stale() { ui.log.querySelectorAll('.rb-cards,.rb-actions,.rb-note').forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); }); }

  function greet() {
    var d = addMsg('rb-bot', 'Hey, I\'m <b>Rip</b>. Wave bot, sea-glass heart, zero surf skills, strong opinions about crewnecks. Tap a few chips below or tell me what you\'re after, and I\'ll pull three pieces from the shop.' + (moodText ? '<br><br>' + esc(moodText) : ''));
    var a = document.createElement('div'); a.className = 'rb-actions'; a.innerHTML = '<button class="rb-btn" type="button" data-act="surprise">Surprise me</button><button class="rb-btn" type="button" data-act="today">What suits today?</button>'; ui.log.appendChild(a);
  }
  function ensureMoodNow() { return mood || seasonalMood(nyParts()); }
  function oNow(extra) { var o = { scene: S.scene, vibe: S.vibe, budget: S.budget, who: S.who, q: S.q, mood: ensureMoodNow() }; for (var k in (extra || {})) o[k] = extra[k]; return o; }

  function run(kind, userText) {
    var o = oNow(), sig = JSON.stringify([o.scene, o.vibe, o.budget, o.who, o.q, kind === 'surprise' ? 's' : '']);
    if (kind === 'surprise') o = { scene: '', vibe: '', budget: S.budget, who: S.who, q: '', mood: ensureMoodNow() };
    if (kind !== 'more' && sig !== lastSig) { seen = []; lastSig = sig; }
    if (pending) { clearTimeout(pending.t); pending.nodes.forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); }); pending = null; }
    var res = search(o, 3, seen);
    if (kind === 'more' && res.picks.length < 3) { seen = []; res = search(o, 3, []); }
    seen = seen.concat(res.picks.map(function (p) { return p.f.i.id; }));
    var now = Date.now();
    if (kind === 'chip' && lastChip && lastChip.node.parentNode && now - lastChip.t < 9000 && lastChip.last === ui.log.lastElementChild) {
      lastChip.nodes.forEach(function (n) { n.parentNode && n.parentNode.removeChild(n); });
    }
    stale();
    var label = kind === 'surprise' ? 'Surprise me' : kind === 'today' ? 'What suits today?' : kind === 'more' ? 'Show me three more' : userText || (summary() + (S.q ? (summary() ? ', ' : '') + '"' + S.q + '"' : ''));
    var me = addMsg('rb-me', esc(label));
    var typing = addMsg('rb-bot', '<span class="rb-typing" aria-hidden="true"><i></i><i></i><i></i></span><span class="rb-sr">Rip is picking</span>');
    ui.log.setAttribute('aria-busy', 'true'); setThink(true); scrollTo(me);
    track('rip_match', { kind: kind, scene: o.scene || '', vibe: o.vibe || '', budget: o.budget || '', who: o.who || '', typed: o.q ? 1 : 0 });
    var turn = { o: o, res: res, sig: sig, kind: kind, ai: false };
    pending = { nodes: [me, typing] };
    pending.t = setTimeout(function () {
      pending = null; setThink(false); ui.log.removeAttribute('aria-busy');
      if (!typing.parentNode) return;
      turn.node = typing; typing.innerHTML = esc(compose(o, res)); turn.say = typing;
      var wrap = document.createElement('div'); wrap.className = 'rb-turn';
      var cards = document.createElement('div'); cards.className = 'rb-cards'; cards.innerHTML = res.picks.map(function (p) { return cardHtml(p); }).join('');
      var acts = document.createElement('div'); acts.className = 'rb-actions';
      acts.innerHTML = '<button class="rb-btn" type="button" data-act="more">Show 3 more</button>' + (aiOK ? '<button class="rb-btn" type="button" data-act="ai">Tune with AI</button>' : '') + '<button class="rb-btn" type="button" data-act="reset">Start over</button>';
      wrap.appendChild(cards); wrap.appendChild(acts); ui.log.appendChild(wrap);
      turn.cards = cards; turn.acts = acts; turn.wrap = wrap; lastTurn = turn;
      if (!autoCollapsed && ui.tog.getAttribute('aria-expanded') === 'true') { autoCollapsed = true; ui.tog.setAttribute('aria-expanded', 'false'); ui.dial.hidden = true; }
      if (kind === 'chip') lastChip = { t: Date.now(), node: me, nodes: [me, typing, wrap], last: wrap };
      scrollTo(me);
      if (aiOK && o.q && o.q.length >= 3 && kind === 'text') aiTune(turn, true);
    }, reduce ? 0 : 320);
  }

  /* ---------- optional AI pass ---------- */
  function aiTune(turn, auto) {
    if (!turn || turn.ai || !aiOK || !turn.cards) return;
    turn.ai = true;
    var btn = turn.acts && turn.acts.querySelector('[data-act="ai"]'); if (btn) { btn.disabled = true; btn.textContent = 'Rip is thinking'; }
    setThink(true);
    var o = turn.o, ids = turn.res.ranked.slice(0, 12).map(function (r) { return r.f.i.id; });
    var body = { q: o.q || '', scene: o.scene, vibe: o.vibe, budget: o.budget, who: o.who, mood: o.mood, ids: ids };
    var key = JSON.stringify(body), p;
    if (aiCache[key]) p = Promise.resolve(aiCache[key]);
    else {
      var ctrl = typeof AbortController === 'function' ? new AbortController() : null, tm = setTimeout(function () { if (ctrl) ctrl.abort(); }, 10000);
      p = fetch(AI_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl ? ctrl.signal : undefined })
        .then(function (r) { clearTimeout(tm); return r.ok ? r.json() : { ok: false, reason: 'http' }; })
        .catch(function () { clearTimeout(tm); return { ok: false, reason: 'net' }; });
    }
    p.then(function (j) {
      setThink(false); track('rip_ai', { ok: j && j.ok ? 1 : 0, reason: (j && j.reason) || '' });
      var note = function (t, strong) { var n = document.createElement('p'); n.className = 'rb-note'; n.setAttribute('role', 'status'); n.innerHTML = strong ? '<b>Tuned with AI.</b> ' + esc(t) : esc(t); turn.wrap.insertBefore(n, turn.acts); };
      if (!j || !j.ok || !Array.isArray(j.picks)) {
        var why = j && j.reason;
        if (why === 'off' || why === 'not_configured' || why === 'catalog' || why === 'daily_cap') { aiOK = false; if (btn) btn.remove(); }
        else if (btn) { btn.disabled = false; btn.textContent = 'Tune with AI'; turn.ai = false; }
        if (!auto) note(why === 'rate' ? 'Easy there, give me a minute and try again. Your instant picks stay put.' : 'The AI pass is napping, so you keep the instant picks.');
        return;
      }
      aiCache[key] = j;
      /* only ids the page already ranked, never anything else */
      var chosen = [], whys = {};
      j.picks.forEach(function (x) { if (x && typeof x.id === 'string' && ids.indexOf(x.id) > -1 && byId[x.id] && chosen.indexOf(x.id) < 0 && chosen.length < 3) { chosen.push(x.id); whys[x.id] = typeof x.why === 'string' ? x.why.slice(0, 110) : ''; } });
      if (!chosen.length) { if (btn) { btn.disabled = false; btn.textContent = 'Tune with AI'; turn.ai = false; } return; }
      var rest = turn.res.picks.filter(function (r) { return chosen.indexOf(r.f.i.id) < 0; });
      var rk = {}; turn.res.ranked.forEach(function (r) { rk[r.f.i.id] = r; });
      var final = chosen.map(function (id) { return rk[id]; }).concat(rest).slice(0, 3);
      turn.cards.innerHTML = final.map(function (r) { return cardHtml(r, whys[r.f.i.id] || ''); }).join('');
      seen = seen.concat(chosen.filter(function (id) { return seen.indexOf(id) < 0; }));
      if (typeof j.say === 'string' && j.say) turn.say.textContent = j.say.slice(0, 160);
      note('Same shop, sharper eye.', true);
      if (btn) btn.remove();
    });
  }

  /* ---------- open / close / focus ---------- */
  function isSheet() { try { return window.matchMedia('(max-width:640px)').matches; } catch (e) { return false; } }
  function openPanel() {
    if (!ui || opened) return; opened = true; lastFocus = document.activeElement;
    var sheet = isSheet();
    ui.panel.hidden = false; ui.panel.setAttribute('aria-modal', sheet ? 'true' : 'false'); ui.scrim.hidden = !sheet;
    ui.launch.hidden = true; ui.tip.hidden = true; ui.launch.setAttribute('aria-expanded', 'true');
    if (sheet) document.documentElement.style.overflow = 'hidden';
    if (!ui.log.children.length) greet();
    syncChips();
    var fine = false; try { fine = window.matchMedia('(pointer:fine)').matches; } catch (e) {}
    (fine ? ui.input : ui.panel).focus({ preventScroll: true });
    track('rip_open', { sheet: sheet ? 1 : 0 });
  }
  function closePanel(noFocus) {
    if (!ui || !opened) return; opened = false;
    ui.panel.hidden = true; ui.scrim.hidden = true; ui.launch.hidden = false; ui.launch.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
    var t = lastFocus && document.contains(lastFocus) && lastFocus !== document.body ? lastFocus : ui.launch;
    if (!noFocus) { try { (t.offsetParent !== null || t === ui.launch ? t : ui.launch).focus({ preventScroll: true }); } catch (e) { ui.launch.focus(); } }
  }
  function trap(e) {
    if (e.key !== 'Tab' || !opened || ui.panel.getAttribute('aria-modal') !== 'true') return;
    if (document.querySelector('dialog[open]')) return; /* the bag dialogs manage their own focus */
    var f = Array.prototype.filter.call(ui.panel.querySelectorAll('button:not([disabled]),input,a[href],[tabindex]:not([tabindex="-1"])'), function (n) { return n.offsetParent !== null; });
    if (!f.length) return; var first = f[0], last = f[f.length - 1], a = document.activeElement;
    if (!ui.panel.contains(a)) { first.focus(); e.preventDefault(); return; }
    if (e.shiftKey && (a === first || a === ui.panel)) { last.focus(); e.preventDefault(); } else if (!e.shiftKey && a === last) { first.focus(); e.preventDefault(); }
  }

  function mountUi() {
    var root = document.createElement('div'); root.className = 'rb-root';
    var id = ++uidN;
    root.innerHTML =
      '<button class="rb-launch" type="button" aria-haspopup="dialog" aria-expanded="false" aria-controls="rbPanel" aria-label="Ask Rip, the shop stylist">' + mascot('L' + id, '') + '<span class="rb-lbl" aria-hidden="true">Ask Rip</span></button>' +
      '<div class="rb-tip" hidden aria-hidden="true">Need a fit? Ask Rip.</div>' +
      '<div class="rb-scrim" hidden></div>' +
      '<section class="rb-panel" id="rbPanel" role="dialog" aria-modal="false" aria-labelledby="rbTitle" tabindex="-1" hidden>' +
        '<header class="rb-head">' + mascot('P' + id, '') + '<div><h2 id="rbTitle">Rip</h2><p><b>Shop stylist</b> &middot; instant picks</p></div><button class="rb-x" type="button" aria-label="Close Rip">&times;</button></header>' +
        '<div class="rb-log" id="rbLog" role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation with Rip" tabindex="0"></div>' +
        '<div class="rb-dial"><button class="rb-dialtog" type="button" aria-expanded="true" aria-controls="rbDial">Dial it in <span id="rbSum">tap to choose</span></button><div class="rb-dialbody" id="rbDial">' + dialHtml() + '</div></div>' +
        '<form class="rb-form" autocomplete="off"><label class="rb-sr" for="rbQ">Tell Rip what you are after</label><input id="rbQ" type="text" maxlength="140" placeholder="Try: gift for my dad who loves golf" enterkeyhint="send"/><button class="rb-send" type="submit">Go</button></form>' +
        '<p class="rb-fine">Picks come from the live shop catalog. Optional AI tuning only chooses from the same shop.</p>' +
      '</section>';
    document.body.appendChild(root);
    var st = document.createElement('style'); st.textContent = '.rb-sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}'; document.head.appendChild(st);
    ui = { root: root, launch: $('.rb-launch', root), tip: $('.rb-tip', root), scrim: $('.rb-scrim', root), panel: $('.rb-panel', root), log: $('.rb-log', root), input: $('#rbQ', root), sum: $('#rbSum', root), dial: $('#rbDial', root), tog: $('.rb-dialtog', root) };
    ui.launch.addEventListener('click', openPanel);
    $('.rb-x', root).addEventListener('click', function () { closePanel(); });
    ui.scrim.addEventListener('click', function () { closePanel(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && opened && !document.querySelector('dialog[open]')) { e.preventDefault(); closePanel(); return; }
      trap(e);
    });
    ui.tog.addEventListener('click', function () { var ex = ui.tog.getAttribute('aria-expanded') === 'true'; ui.tog.setAttribute('aria-expanded', String(!ex)); ui.dial.hidden = ex; });
    ui.dial.addEventListener('click', function (e) {
      var c = e.target.closest ? e.target.closest('.rb-chip') : null; if (!c) return;
      var k = c.getAttribute('data-k'), v = c.getAttribute('data-v'); S[k] = S[k] === v ? '' : v; syncChips();
      if (S.scene || S.vibe || S.budget || S.who || S.q) run('chip');
    });
    ui.panel.querySelector('.rb-form').addEventListener('submit', function (e) {
      e.preventDefault(); var v = ui.input.value.replace(/\s+/g, ' ').trim().slice(0, 140); if (v.length < 2) { ui.input.focus(); return; }
      S.q = v; ui.input.value = ''; run('text', v);
    });
    ui.log.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null; if (!b) return;
      var a = b.getAttribute('data-act');
      if (a === 'surprise' || a === 'today') { run(a); if (a === 'today') { /* weather-led, no chips */ } }
      else if (a === 'more') run('more');
      else if (a === 'ai') aiTune(lastTurn, false);
      else if (a === 'reset') { S = { scene: '', vibe: '', budget: '', who: '', q: '' }; seen = []; lastSig = ''; lastChip = null; ui.log.innerHTML = ''; syncChips(); greet(); ui.log.scrollTop = 0; ui.input.value = ''; }
    });
    /* a successful tap on an add/buy link is a conversion signal, nothing more */
    ui.log.addEventListener('click', function (e) { var a = e.target.closest ? e.target.closest('.rb-card .buy') : null; if (a) track('rip_pick_click', { item_id: (a.closest('.rb-card') || {}).getAttribute ? a.closest('.rb-card').getAttribute('data-id') : '' }); });
    /* a one-time friendly nudge, never repeated in a session, and never when motion is reduced */
    var shown = false; try { shown = sessionStorage.getItem('rbTip') === '1'; } catch (e) {}
    if (!shown && !reduce) setTimeout(function () { if (!opened) { ui.tip.hidden = false; try { sessionStorage.setItem('rbTip', '1'); } catch (e) {} setTimeout(function () { ui.tip.hidden = true; }, 6500); } }, 4500);
    document.querySelectorAll('[data-rip-open]').forEach(function (b) { b.hidden = false; b.addEventListener('click', openPanel); });
    var hc = document.getElementById('ripHeroCta'); if (hc) hc.hidden = false;
  }

  /* ------------------------------------------------------------------ picks strip (weather and season) */
  function buildStrip() {
    var main = document.getElementById('main'); if (!main || document.getElementById('ripStrip')) return;
    var s = document.createElement('section'); s.id = 'ripStrip'; s.className = 'rb-strip'; s.setAttribute('aria-labelledby', 'ripStripH');
    s.innerHTML = '<div class="rb-sh">' + mascot('S' + (++uidN), 'Rip, the shop stylist robot') + '<div><p class="rb-eyebrow">Fresh from the tide</p><h2 id="ripStripH">Rip\'s picks today</h2><p class="rb-wx" id="ripWx"></p></div><div class="rb-ask"><button class="rb-btn" type="button" data-rip-open>Ask Rip for more</button></div></div><div class="rb-tiles" id="ripTiles"></div><p class="rb-src" id="ripSrc"></p>';
    main.insertBefore(s, main.firstChild);
    s.querySelector('[data-rip-open]').addEventListener('click', openPanel);
    function paint() {
      var md = mood || seasonalMood(nyParts());
      var res = search({ mood: md, q: '', scene: '', vibe: '', budget: '', who: '' }, 4);
      $('#ripWx', s).textContent = (mood ? moodText + ' ' + MOOD_QUIP[mood] : SEASON_QUIP[md]);
      $('#ripTiles', s).innerHTML = res.picks.map(function (p) { return cardHtml(p); }).join('');
      $('#ripSrc', s).textContent = mood ? 'Picks rotate daily with the weather and the season. Weather from the live beach report (Open-Meteo, NOAA).' : 'Picks rotate daily with the season.';
    }
    paint(); moodListeners.push(paint);
  }

  /* ------------------------------------------------------------------ hero tide canvas */
  function tide() {
    var hero = document.querySelector('.hero'); if (!hero || hero.querySelector('canvas.rb-tide')) return;
    var cv = document.createElement('canvas'); cv.className = 'rb-tide'; cv.setAttribute('aria-hidden', 'true');
    var art = hero.querySelector('.art'); hero.insertBefore(cv, art ? art.nextSibling : hero.firstChild);
    var ctx = cv.getContext && cv.getContext('2d'); if (!ctx) return;
    var W = 0, H = 0, dpr = 1, running = false, vis = true, last = 0;
    var L = [{ a: 9, l: 360, v: .00055, y: .55, c: '92,240,216', al: .13 }, { a: 13, l: 540, v: -.00038, y: .66, c: '168,199,192', al: .16 }, { a: 7, l: 250, v: .0009, y: .78, c: '92,240,216', al: .2 }, { a: 10, l: 420, v: -.0006, y: .88, c: '14,31,51', al: .55 }];
    function size() { var r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height)); cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function draw(t) {
      ctx.clearRect(0, 0, W, H);
      L.forEach(function (w, n) {
        var base = H * w.y; ctx.beginPath(); ctx.moveTo(0, H);
        for (var x = 0; x <= W; x += 8) ctx.lineTo(x, base + Math.sin(x / w.l * 6.283 + t * w.v * 6.283 * 1000 / 6.283 + n) * w.a + Math.sin(x / (w.l * .47) + t * w.v * 1300 + n * 2) * w.a * .35);
        ctx.lineTo(W, H); ctx.closePath(); ctx.fillStyle = 'rgba(' + w.c + ',' + w.al + ')'; ctx.fill();
        if (n < 3) { ctx.beginPath(); for (var y = 0; y <= W; y += 8) { var yy = base + Math.sin(y / w.l * 6.283 + t * w.v * 1000 + n) * w.a + Math.sin(y / (w.l * .47) + t * w.v * 1300 + n * 2) * w.a * .35; if (y) ctx.lineTo(y, yy); else ctx.moveTo(y, yy); } ctx.strokeStyle = 'rgba(92,240,216,' + (n === 2 ? .55 : .3) + ')'; ctx.lineWidth = 1.2; ctx.stroke(); }
      });
    }
    function frame(ts) { if (!running) return; if (ts - last > 40) { last = ts; draw(ts); } requestAnimationFrame(frame); }
    function start() { if (running || reduce || !vis || document.hidden) return; running = true; requestAnimationFrame(frame); }
    function stop() { running = false; }
    size(); draw(0);
    window.addEventListener('resize', function () { size(); draw(last || 0); });
    document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; vis ? start() : stop(); }).observe(hero);
    start();
  }

  /* ------------------------------------------------------------------ boot */
  var booted = false;
  function boot(data) {
    if (booted || !data || !Array.isArray(data.items)) return;
    build(data); if (!live.length) return;
    booted = true;
    tide(); mountUi(); buildStrip(); loadMood();
    if (window.ShoreWX === undefined) window.addEventListener('load', loadMood);
    document.dispatchEvent(new CustomEvent('rip:ready'));
  }
  window.RipBot = {
    open: function () { openPanel(); },
    ready: function () { return booted; },
    pick: function (o, n) { return search(o || {}, n || 3).picks.map(function (p) { return { id: p.f.i.id, tier: p.tier, s: Math.round(p.s * 10) / 10, tags: p.tags }; }); },
    /* Stylist section: three varied pieces for a scene. excl = ids already shown, so "another look" really is another. */
    scenePicks: function (scene, excl) {
      var o = { scene: scene, mood: ensureMoodNow() }, ex = excl || [], r = search(o, 3, ex);
      if (r.picks.length < 3) { ex = []; r = search(o, 3, []); }
      return { ids: ex.concat(r.picks.map(function (p) { return p.f.i.id; })), html: r.picks.map(function (p) { return cardHtml(p); }).join('') };
    },
    cards: function (items) { return asRanked(items).map(function (r) { return cardHtml(r); }).join(''); },
    mascot: function (label) { return mascot('X' + (++uidN), label || ''); }
  };
  if (window.__slCatalog) boot(window.__slCatalog); else document.addEventListener('sl:catalog', function (e) { boot(e.detail || window.__slCatalog); });
})();
