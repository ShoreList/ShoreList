/* ShoreList widgets: time-of-day buttons, live beach conditions, Surprise me, concierge.
   No third-party scripts. Data: open-meteo (weather + marine), /search-index.json. */
(function () {
  'use strict';
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (window.gtag) gtag('event', n, p || {}); } catch (e) {} }
  var index = null, idxP = null;
  function loadIndex() { return idxP || (idxP = fetch('/search-index.json').then(function (r) { return r.json(); }).then(function (j) { index = (j.items || []); return index; }).catch(function () { index = []; return index; })); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' '); }
  var STOP = { the: 1, a: 1, and: 1, for: 1, to: 1, in: 1, of: 1, is: 1, what: 1, where: 1, can: 1, i: 1, we: 1, do: 1, with: 1, on: 1, my: 1, me: 1, near: 1, good: 1 };
  function find(q, n) {
    var t = norm(q).split(/\s+/).filter(function (w) { return w.length > 1 && !STOP[w]; });
    return (index || []).map(function (it) {
      var hay = norm(it.title + ' ' + (it.sub || '') + ' ' + (it.slug || '')), s = 0;
      t.forEach(function (w) { if (hay.indexOf(w) > -1) s += (norm(it.title).indexOf(w) > -1 ? 3 : 1); });
      return { it: it, s: s };
    }).filter(function (x) { return x.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, n || 4).map(function (x) { return x.it; });
  }

  // ---------- hero: path buttons ripple, time of day ----------
  var hero = document.querySelector('.hero-cine');
  if (hero) {
    hero.querySelectorAll('.path').forEach(function (a) {
      a.addEventListener('pointerdown', function (e) { var r = a.getBoundingClientRect(); a.style.setProperty('--x', (e.clientX - r.left) + 'px'); a.classList.remove('rip'); void a.offsetWidth; a.classList.add('rip'); track('hero_path', { to: a.getAttribute('data-p') }); });
    });
    var tod = document.getElementById('tod');
    function mark(n) { if (!tod) return; tod.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-t') === n)); }); }
    if (tod) {
      tod.addEventListener('click', function (e) { var b = e.target.closest('button'); if (!b || !window.ShoreScene) return; var t = b.getAttribute('data-t'); if (t === 'live') ShoreScene.live(); else ShoreScene.set(t); mark(t); track('scene_time', { t: b.getAttribute('data-t') }); });
      mark('live');
    }
  }

  // ---------- live conditions ----------
  var cond = document.getElementById('cond');
  if (cond) {
    var B = [['Wrightsville', 34.2097, -77.7964], ['Carolina Beach', 34.0345, -77.8976], ['Kure Beach', 33.994, -77.9068]];
    var cur = 1, cache = {};
    var WX = function (c) { return c === 0 ? 'Clear' : c < 4 ? 'Partly cloudy' : c < 50 ? 'Foggy' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 95 ? 'Showers' : 'Storms'; };
    function t12(iso) { var d = new Date(iso); return isNaN(d) ? '' : d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
    function paint(d) {
      var tip;
      var wet = d.code >= 50, waves = d.wave != null ? d.wave * 3.281 : null;
      if (wet) tip = 'Wet one. A museum or an evening <a href="/category?cat=ghost-tours">ghost walk</a> fits.';
      else if (waves != null && waves >= 2) tip = 'Good swell. Try a <a href="/category?cat=surf-lessons">surf lesson</a>.';
      else if (d.temp < 55) tip = 'Layer up and see <a href="/shop">the coastal shop</a>, then a <a href="/events">local event</a>.';
      else tip = 'Easy beach day. Browse <a href="/category">experiences</a> or <a href="/shop">beach gear</a>.';
      cond.querySelector('.stats').innerHTML = '<b>' + Math.round(d.temp) + '&deg;F</b> ' + esc(WX(d.code)) + (d.wind != null ? ' &middot; wind ' + Math.round(d.wind) + ' mph' : '') + (waves != null ? ' &middot; waves ' + waves.toFixed(1) + ' ft' : '') + (d.sst != null ? ' &middot; water ' + Math.round(d.sst * 9 / 5 + 32) + '&deg;F' : '') + (d.set ? ' &middot; sunset ' + esc(t12(d.set)) : '');
      cond.querySelector('.tip').innerHTML = tip;
    }
    function paintWX(d) {
      var waves = d.waveFt, tip, wet = d.code >= 50;
      if (d.flag.level === 'red') tip = 'Rough water today. Stay out of the surf and see <a href="/category">things to do on land</a>.';
      else if (wet) tip = 'Wet one. A museum or an evening <a href="/category?cat=ghost-tours">ghost walk</a> fits.';
      else if (waves != null && waves >= 2) tip = 'Good swell. Try a <a href="/category?cat=surf-lessons">surf lesson</a>.';
      else if (d.temp < 55) tip = 'Layer up and see <a href="/shop">the coastal shop</a>, then a <a href="/events">local event</a>.';
      else tip = 'Easy beach day. Browse <a href="/category">experiences</a> or <a href="/shop">beach gear</a>.';
      var col = { green: '#1fa35c', yellow: '#f2b705', red: '#d93025' }[d.flag.level];
      cond.querySelector('.stats').innerHTML = '<span class="fl" title="Estimated from live data, not an official lifeguard flag"><i style="background:' + col + '"></i>' + esc(d.flag.label) + '</span> &middot; <b>' + Math.round(d.temp) + '&deg;F</b> ' + esc(WX(d.code)) + (d.wind != null ? ' &middot; wind ' + Math.round(d.wind) + ' mph' : '') + (waves != null ? ' &middot; waves ' + waves.toFixed(1) + ' ft' : '') + (d.waterF != null ? ' &middot; water ' + Math.round(d.waterF) + '&deg;F' : '') + (d.sunset ? ' &middot; sunset ' + esc(t12(d.sunset)) : '');
      cond.querySelector('.tip').innerHTML = tip;
    }
    function get(i) {
      if (!window.ShoreWX) return;
      ShoreWX.get(i).then(function (d) {
        cond.hidden = false; paintWX(d);
        if (window.__shoreCtx) window.__shoreCtx({ temp: d.temp, code: d.code, wave: d.waveFt != null ? d.waveFt / 3.281 : null, set: d.sunset, flag: d.flag.label, water: d.waterF }, B[i][0]);
      }).catch(function () {});
    }
    cond.querySelectorAll('[data-b]').forEach(function (b) {
      b.addEventListener('click', function () { cur = +b.getAttribute('data-b'); cond.querySelectorAll('[data-b]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); get(cur); track('conditions_beach', { b: B[cur][0] }); });
    });
    var sur = cond.querySelector('.sur');
    if (sur) sur.addEventListener('click', function () {
      loadIndex().then(function (ix) {
        var pool = ix.filter(function (i) { return i.t === 'cat' && i.url; });
        if (!pool.length) { location.href = '/category'; return; }
        var p = pool[Math.floor(Math.random() * pool.length)]; track('surprise_me', { to: p.slug }); location.href = p.url;
      });
    });
    get(cur);
  }

  // ---------- concierge ("Shore AI") ----------
  // Answer path: on-device model (Chrome Prompt API, private, no key) -> server model -> site search.
  var ctx = { text: '' }, ctxExtra = '';
  function setCtx(d, beach) { ctxExtra = (d.flag ? ', estimated ' + d.flag : '') + (d.water != null ? ', water ' + Math.round(d.water) + 'F' : ''); try { document.dispatchEvent(new CustomEvent('shore:cond', { detail: d })); } catch (e) {} ctx.text = beach + ': ' + Math.round(d.temp) + 'F, ' + WXs(d.code) + (d.wave != null ? ', waves ' + (d.wave * 3.281).toFixed(1) + ' ft' : '') + (d.set ? ', sunset ' + new Date(d.set).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '') + ctxExtra; }
  function WXs(c) { return c === 0 ? 'clear' : c < 4 ? 'partly cloudy' : c < 50 ? 'foggy' : c < 70 ? 'rain' : c < 95 ? 'showers' : 'storms'; }
  window.__shoreCtx = setCtx;
  var fab = document.createElement('button');
  fab.className = 'cc-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Open Shore AI concierge'); fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'cc');
  fab.innerHTML = '<span class="orb" aria-hidden="true"></span><span class="lbl">Shore AI</span>';
  var box = document.createElement('div');
  box.className = 'cc'; box.id = 'cc'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Shore AI concierge');
  box.innerHTML = '<header><span class="orb big" aria-hidden="true"></span><div>Shore AI<small id="ccs">Experiences, events and shop picks, tuned to right now</small></div><button type="button" class="spk" id="ccsp" aria-pressed="false" title="Read answers aloud">&#128266;</button></header><div class="log" id="ccl" aria-live="polite"><div class="m bot">Hi, I\'m Shore AI. Ask me anything about Wilmington and the beaches, or tap the mic.</div></div><div class="chips" id="ccc"></div><form id="ccf"><input id="cci" type="text" maxlength="200" placeholder="Ask anything about the coast" aria-label="Your question" autocomplete="off"/><button type="button" id="ccm" class="mic" aria-label="Speak your question" hidden>&#127908;</button><button type="submit">Ask</button></form>';
  document.body.appendChild(fab); document.body.appendChild(box);
  var log = box.querySelector('#ccl'), speakOn = false;
  function add(cls, html) { var d = document.createElement('div'); d.className = 'm ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function section(it) { return it.t === 'cat' ? 'Experiences' : /shop/.test(it.url) ? 'Shop' : /event/.test(it.url) ? 'Events' : 'Guide'; }
  function chipsNow() {
    var c = ['Plan my day', 'Surf lesson', 'Ghost tour', 'Beach gear'];
    var t = ctx.text;
    if (/rain|shower|storm/.test(t)) c.unshift('Rainy day ideas');
    else if (/waves (\d+\.\d)/.test(t) && parseFloat(RegExp.$1) >= 2) c.unshift('Is it good for surfing?');
    else c.unshift('What is on this weekend?');
    box.querySelector('#ccc').innerHTML = c.slice(0, 5).map(function (x) { return '<button type="button">' + esc(x) + '</button>'; }).join('');
  }
  chipsNow();
  function typeInto(el, text, cb) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) { el.textContent = text; cb && cb(); return; }
    var i = 0; (function step() { el.textContent = text.slice(0, i); i += 2; log.scrollTop = log.scrollHeight; if (i <= text.length + 1) setTimeout(step, 14); else { el.textContent = text; cb && cb(); } })();
  }
  var local = null;
  function onDevice(q, hits) {
    if (!window.LanguageModel || !LanguageModel.create) return Promise.reject();
    return (local || (local = LanguageModel.create({ initialPrompts: [{ role: 'system', content: 'You are the ShoreList concierge for Wilmington NC and Wrightsville, Carolina and Kure Beach. Answer in at most 2 short warm sentences using only the options given. Never invent prices or dates.' }] }))).then(function (s) {
      return s.prompt('Now: ' + ctx.text + '\nVisitor asks: ' + q + '\nOptions:\n' + hits.map(function (h) { return '- ' + h.title + ': ' + (h.sub || ''); }).join('\n'));
    });
  }
  function ask(q) {
    q = q.trim(); if (q.length < 2) return; track('concierge_ask');
    add('me', esc(q));
    var wait = add('bot', '<span class="think"><i></i><i></i><i></i></span>');
    loadIndex().then(function () {
      var hits = find(q, 4), extra = [];
      if (/shop|gear|shirt|tee|hat|apparel|merch|tote|chair|umbrella|towel/i.test(q)) extra.push({ title: 'ShoreList Shop', sub: 'Coastal tees, totes and beach gear', url: '/shop' });
      if (/event|tonight|weekend|festival|music|this week|today/i.test(q)) extra.push({ title: 'Events Guide', sub: 'Dated local events, updated regularly', url: '/events' });
      if (/plan|itinerary|day|trip/i.test(q)) extra.push({ title: 'AI Trip Planner', sub: 'Build a full day for your group', url: '/planner' });
      hits = extra.concat(hits).slice(0, 4);
      var fallback = hits.length ? 'Here are the closest matches:' : 'I could not find an exact match. Try experiences, events or the shop:';
      if (!hits.length) hits = [{ title: 'Browse experiences', sub: 'All experiences', url: '/category' }, { title: 'Events Guide', sub: 'What is on', url: '/events' }, { title: 'Shop', sub: 'Coastal apparel and gear', url: '/shop' }];
      function show(text) {
        wait.innerHTML = '<span class="tx"></span><div class="links">' + hits.map(function (h) { return '<a href="' + esc(h.url) + '">' + esc(h.title) + ' <small>' + esc(section(h)) + (h.sub ? ' &middot; ' + esc(String(h.sub).slice(0, 80)) : '') + '</small></a>'; }).join('') + '</div>';
        typeInto(wait.querySelector('.tx'), text, function () { if (speakOn && window.speechSynthesis) { try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(text)); } catch (e) {} } });
      }
      onDevice(q, hits).then(function (t) { box.querySelector('#ccs').textContent = 'Answered on your device'; show(String(t).slice(0, 500)); })
        .catch(function () {
          return fetch('/.netlify/functions/concierge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q, context: ctx.text, candidates: hits.map(function (h) { return { title: h.title, sub: h.sub }; }) }) })
            .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (d) { show(d.text || fallback); }).catch(function () { show(fallback); });
        });
    });
  }
  fab.addEventListener('click', function () { box.hidden = !box.hidden; fab.setAttribute('aria-expanded', String(!box.hidden)); if (!box.hidden) { loadIndex(); chipsNow(); box.querySelector('#cci').focus(); track('concierge_open'); } });
  box.querySelector('#ccf').addEventListener('submit', function (e) { e.preventDefault(); var i = box.querySelector('#cci'); var v = i.value; i.value = ''; ask(v); });
  box.querySelector('#ccc').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });
  box.querySelector('#ccsp').addEventListener('click', function () { speakOn = !speakOn; this.setAttribute('aria-pressed', String(speakOn)); if (!speakOn && window.speechSynthesis) speechSynthesis.cancel(); });
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition, mic = box.querySelector('#ccm');
  if (SR) { mic.hidden = false; mic.addEventListener('click', function () { try { var r = new SR(); r.lang = 'en-US'; r.interimResults = false; mic.classList.add('on'); r.onresult = function (e) { var t = e.results[0][0].transcript; speakOn = true; box.querySelector('#ccsp').setAttribute('aria-pressed', 'true'); ask(t); }; r.onend = function () { mic.classList.remove('on'); }; r.onerror = r.onend; r.start(); } catch (e) { mic.classList.remove('on'); } }); }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) { box.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); } });
  document.addEventListener('shore:ask', function (e) { box.hidden = false; fab.setAttribute('aria-expanded', 'true'); ask(String(e.detail || '')); });


  // ---------- floating quick dock + tilt ----------
  (function () {
    var d = document.createElement('div'); d.className = 'dock'; d.setAttribute('role', 'navigation'); d.setAttribute('aria-label', 'Quick links');
    d.innerHTML = '<a href="/category" aria-label="Experiences">&#9875;<span>Experiences</span></a><a href="/events" aria-label="Events">&#9733;<span>Events</span></a><a href="/shop" aria-label="Shop">&#9728;<span>Shop</span></a><a href="/planner" aria-label="Plan my day">&#10022;<span>Plan my day</span></a>';
    document.body.appendChild(d);
    var tick = false; function upd() { tick = false; d.classList.toggle('show', window.scrollY > 520); }
    window.addEventListener('scroll', function () { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true }); upd();
    if (!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce), (hover: none)').matches)) {
      document.querySelectorAll('.path').forEach(function (p) {
        p.addEventListener('pointermove', function (e) { var r = p.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; p.style.transform = 'perspective(600px) rotateX(' + (-y * 9) + 'deg) rotateY(' + (x * 11) + 'deg) translateY(-4px)'; p.style.animation = 'none'; });
        p.addEventListener('pointerleave', function () { p.style.transform = ''; p.style.animation = ''; });
      });
    }
  })();

  // ---------- WebMCP: let in-browser AI agents use the site as tools ----------
  try {
    if (navigator.modelContext && navigator.modelContext.registerTool) {
      navigator.modelContext.registerTool({
        name: 'search_shorelist', description: 'Search ShoreList tours, experiences, events and shop items for Wilmington NC and Wrightsville, Carolina and Kure Beach.',
        inputSchema: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] },
        execute: function (a) { return loadIndex().then(function () { var r = find(String(a.query || ''), 6).map(function (i) { return { title: i.title, summary: i.sub, url: 'https://shorelist.net' + i.url }; }); return { content: [{ type: 'text', text: JSON.stringify(r) }] }; }); }
      });
      navigator.modelContext.registerTool({
        name: 'beach_conditions_now', description: 'Current weather, waves and water temperature at the Wilmington beaches as shown on shorelist.net.',
        inputSchema: { type: 'object', properties: {} },
        execute: function () { return Promise.resolve({ content: [{ type: 'text', text: ctx.text || 'Conditions not loaded yet' }] }); }
      });
    }
  } catch (e) {}
})();
