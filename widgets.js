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
      else tip = 'Easy beach day. Browse <a href="/category">tours</a> or <a href="/shop">beach gear</a>.';
      cond.querySelector('.stats').innerHTML = '<b>' + Math.round(d.temp) + '&deg;F</b> ' + esc(WX(d.code)) + (d.wind != null ? ' &middot; wind ' + Math.round(d.wind) + ' mph' : '') + (waves != null ? ' &middot; waves ' + waves.toFixed(1) + ' ft' : '') + (d.sst != null ? ' &middot; water ' + Math.round(d.sst * 9 / 5 + 32) + '&deg;F' : '') + (d.set ? ' &middot; sunset ' + esc(t12(d.set)) : '');
      cond.querySelector('.tip').innerHTML = tip;
    }
    function get(i) {
      if (cache[i]) return paint(cache[i]);
      var b = B[i], q = b[1] + '&longitude=' + b[2];
      var wx = fetch('https://api.open-meteo.com/v1/forecast?latitude=' + q + '&current=temperature_2m,weather_code,wind_speed_10m&daily=sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=America%2FNew_York&forecast_days=1').then(function (r) { return r.json(); });
      var mr = fetch('https://marine-api.open-meteo.com/v1/marine?latitude=' + q + '&current=wave_height,sea_surface_temperature&timezone=America%2FNew_York').then(function (r) { return r.json(); }).catch(function () { return {}; });
      Promise.all([wx, mr]).then(function (r) {
        var c = r[0].current || {}, m = r[1].current || {};
        cache[i] = { temp: c.temperature_2m, code: c.weather_code, wind: c.wind_speed_10m, wave: m.wave_height, sst: m.sea_surface_temperature, set: r[0].daily && r[0].daily.sunset && r[0].daily.sunset[0] };
        if (cache[i].temp != null) { cond.hidden = false; paint(cache[i]); }
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

  // ---------- concierge ----------
  var fab = document.createElement('button');
  fab.className = 'cc-fab'; fab.type = 'button'; fab.setAttribute('aria-expanded', 'false'); fab.setAttribute('aria-controls', 'cc');
  fab.innerHTML = '<span aria-hidden="true">&#10022;</span> Ask the concierge';
  var box = document.createElement('div');
  box.className = 'cc'; box.id = 'cc'; box.hidden = true; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'ShoreList concierge');
  box.innerHTML = '<header>Shore Concierge<small>Tours, events and shop picks for Wilmington and the beaches</small></header><div class="log" id="ccl" aria-live="polite"><div class="m bot">Hi! Tell me what you feel like doing and I\'ll point you to the right tour, event or shop pick.</div></div><div class="chips" id="ccc"><button type="button">Rainy day plans</button><button type="button">Surf lesson</button><button type="button">Ghost tour</button><button type="button">Beach gear</button></div><form id="ccf"><input id="cci" type="text" maxlength="200" placeholder="Ask anything about the coast" aria-label="Your question" autocomplete="off"/><button type="submit">Ask</button></form>';
  document.body.appendChild(fab); document.body.appendChild(box);
  var log = box.querySelector('#ccl');
  function add(cls, html) { var d = document.createElement('div'); d.className = 'm ' + cls; d.innerHTML = html; log.appendChild(d); log.scrollTop = log.scrollHeight; return d; }
  function section(it) { return it.t === 'cat' ? 'Tours' : /shop/.test(it.url) ? 'Shop' : /event/.test(it.url) ? 'Events' : 'Guide'; }
  function ask(q) {
    q = q.trim(); if (q.length < 2) return; track('concierge_ask');
    add('me', esc(q));
    var wait = add('bot', 'Looking&hellip;');
    loadIndex().then(function () {
      var hits = find(q, 4);
      var extra = [];
      if (/shop|gear|shirt|tee|hat|apparel|merch|tote|chair|umbrella|towel/i.test(q)) extra.push({ title: 'ShoreList Shop', sub: 'Coastal tees, totes and beach gear', url: '/shop' });
      if (/event|tonight|weekend|festival|music|this week|today/i.test(q)) extra.push({ title: 'Events Guide', sub: 'Dated local events, updated regularly', url: '/events' });
      hits = extra.concat(hits).slice(0, 4);
      var fallback = hits.length ? 'Here are the closest matches:' : 'I couldn\'t find an exact match. Try browsing tours, events or the shop:';
      if (!hits.length) hits = [{ title: 'Browse tours', sub: 'All experiences', url: '/category' }, { title: 'Events Guide', sub: 'What is on', url: '/events' }, { title: 'Shop', sub: 'Coastal apparel and gear', url: '/shop' }];
      function show(text) {
        wait.innerHTML = esc(text) + '<div class="links">' + hits.map(function (h) { return '<a href="' + esc(h.url) + '">' + esc(h.title) + ' <small>' + esc(section(h)) + (h.sub ? ' &middot; ' + esc(String(h.sub).slice(0, 80)) : '') + '</small></a>'; }).join('') + '</div>';
        log.scrollTop = log.scrollHeight;
      }
      fetch('/.netlify/functions/concierge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ q: q, candidates: hits.map(function (h) { return { title: h.title, sub: h.sub }; }) }) })
        .then(function (r) { if (!r.ok) throw 0; return r.json(); })
        .then(function (d) { show(d.text || fallback); })
        .catch(function () { show(fallback); });
    });
  }
  fab.addEventListener('click', function () { box.hidden = !box.hidden; fab.setAttribute('aria-expanded', String(!box.hidden)); if (!box.hidden) { loadIndex(); box.querySelector('#cci').focus(); track('concierge_open'); } });
  box.querySelector('#ccf').addEventListener('submit', function (e) { e.preventDefault(); var i = box.querySelector('#cci'); var v = i.value; i.value = ''; ask(v); });
  box.querySelector('#ccc').addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) ask(b.textContent); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !box.hidden) { box.hidden = true; fab.setAttribute('aria-expanded', 'false'); fab.focus(); } });
})();
