/* ShoreList Plus: search & concierge palette, install-as-app, offline shell.
   Additive and self-contained. Does not touch booking, checkout or dashboard code.
   Open with Ctrl/Cmd+K, "/", or the Search button. */
(function () {
  'use strict';
  if (window.__shorePlus) return;
  window.__shorePlus = true;

  var INDEX = null, loading = null;
  var deferredInstall = null;

  /* ---------- analytics (no personal data) ---------- */
  function track(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }

  /* ---------- tiny helpers ---------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }

  /* Plain-language intents. Each phrase maps to category slugs or page urls already in the index. */
  var INTENTS = [
    { re: /\b(ghost|haunt|haunted|spooky|paranormal|scary)\b/, slugs: ['ghost-tours'] },
    { re: /\b(history|historic|architecture|walking|stroll|downtown tour)\b/, slugs: ['walking-tours', 'museums'] },
    { re: /\b(museum|museums|train|trains|railroad|rain|rainy|indoor)\b/, slugs: ['museums'] },
  { re: /\b(kids|family|children|toddler)\b/, slugs: ['museums', 'nature-walks', 'wildlife-tours'] },
    { re: /\b(film|movie|tv|one tree hill|iron man|set locations?)\b/, slugs: ['film-tours'] },
    { re: /\b(surf|surfing|learn to surf|lesson|lessons)\b/, slugs: ['surf-lessons'] },
    { re: /\b(paddle|paddleboard|sup|stand up)\b/, slugs: ['paddleboard', 'kayak-tours'] },
    { re: /\b(kayak|canoe)\b/, slugs: ['kayak-tours'] },
    { re: /\b(boat|cruise|river|sail|sailing|sunset cruise)\b/, slugs: ['river-cruises', 'sailboat-rides'] },
    { re: /\b(fish|fishing|charter)\b/, slugs: ['fishing-charters'] },
    { re: /\b(bike|biking|cycle|cycling)\b/, slugs: ['bike-tours', 'ebike-rentals', 'fat-bike-rentals'] },
    { re: /\b(scooter|golf cart|jet ?ski|rental|rentals|rent)\b/, slugs: ['scooter-rentals', 'golf-cart-rentals', 'jet-ski-rentals', 'ebike-rentals', 'beach-chairs'] },
    { re: /\b(photo|photos|photographer|photography|pictures|engagement|couples)\b/, slugs: ['beach-photography'] },
    { re: /\b(picnic|romantic|date)\b/, slugs: ['beach-picnics'] },
    { re: /\b(chair|chairs|umbrella|beach setup)\b/, slugs: ['beach-chairs'] },
    { re: /\b(yoga|spa|massage|relax|wellness)\b/, slugs: ['wellness'] },
    { re: /\b(wildlife|dolphin|birds?|nature|turtle|flytrap)\b/, slugs: ['wildlife-tours', 'nature-walks'] }
  ];

  function score(item, q, tokens) {
    var title = norm(item.title), sub = norm(item.sub), tags = norm((item.tags || []).join(' ')), kw = norm(item.kw || '');
    var s = 0;
    if (title === q) s += 100;
    if (title.indexOf(q) === 0) s += 60;
    if (title.indexOf(q) > -1) s += 35;
    for (var i = 0; i < tokens.length; i++) {
      var t = tokens[i]; if (t.length < 2) continue;
      var hit = 0;
      if (title.indexOf(t) > -1) { s += 14; hit = 1; }
      if (kw.indexOf(t) > -1) { s += 10; hit = 1; }
      if (tags.indexOf(t) > -1) { s += 8; hit = 1; }
      if (sub.indexOf(t) > -1) { s += 5; hit = 1; }
      if (!hit && t.length > 4 && (title + ' ' + kw).indexOf(t.slice(0, t.length - 1)) > -1) s += 4;  // light stemming
    }
    return s;
  }

  function search(q) {
    if (!INDEX) return [];
    var nq = norm(q);
    if (!nq) return suggestions();
    var tokens = nq.split(' ');
    var boostSlugs = {};
    INTENTS.forEach(function (it) { if (it.re.test(nq)) it.slugs.forEach(function (s, i) { boostSlugs[s] = Math.max(boostSlugs[s] || 0, 40 - i * 4); }); });
    var scored = [];
    INDEX.items.forEach(function (it) {
      var s = score(it, nq, tokens);
      if (it.slug && boostSlugs[it.slug]) s += boostSlugs[it.slug];
      if (it.t === 'tour' && s > 0) s += 6;            // bookable things first
      if (s > 0) scored.push({ it: it, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, 8).map(function (x) { return x.it; });
  }

  function suggestions() {
    if (!INDEX) return [];
    var picks = [];
    INDEX.items.forEach(function (it) { if (it.t === 'tour') picks.push(it); });
    var wanted = ['Events', 'Shore Picks', 'Plan my day', 'Map'];
    INDEX.items.forEach(function (it) { if (it.t === 'page' && wanted.indexOf(it.title) > -1) picks.push(it); });
    return picks.slice(0, 8);
  }

  /* ---------- styles ---------- */
  var css = [
    '.sp-fab{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:8001;display:flex;align-items:center;gap:8px;background:rgba(13,31,37,.88);color:#F5E8CB;border:1px solid rgba(245,232,203,.22);border-radius:100px;padding:10px 18px;font:600 .9rem "DM Sans",system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 6px 24px rgba(0,0,0,.28);transition:transform .2s,background .2s}',
    '.sp-fab:hover{background:rgba(10,77,92,.95);transform:translateX(-50%) translateY(-2px)}',
    '.sp-fab kbd{font:600 .68rem "DM Sans",system-ui,sans-serif;border:1px solid rgba(245,232,203,.3);border-radius:5px;padding:1px 6px;opacity:.75}',
    '@media(max-width:640px){.sp-fab kbd{display:none}}',
    '.sp-ov{position:fixed;inset:0;z-index:10050;background:rgba(4,31,40,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;padding:max(8vh,16px) 14px 14px}',
    '.sp-ov.sp-open{display:flex}',
    '.sp-box{width:100%;max-width:620px;background:#0D1F25;color:#F5E8CB;border:1px solid rgba(245,232,203,.16);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden;font-family:"DM Sans",system-ui,sans-serif}',
    '.sp-in{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(245,232,203,.12)}',
    '.sp-in svg{flex:none;opacity:.7}',
    '.sp-in input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#F5E8CB;font:500 1.05rem "DM Sans",system-ui,sans-serif}',
    '.sp-in input::placeholder{color:rgba(245,232,203,.5)}',
    '.sp-esc{font:600 .68rem "DM Sans",system-ui,sans-serif;border:1px solid rgba(245,232,203,.3);border-radius:5px;padding:2px 7px;opacity:.7;background:none;color:inherit;cursor:pointer}',
    '.sp-list{list-style:none;margin:0;padding:8px;max-height:min(56vh,420px);overflow:auto}',
    '.sp-h{padding:8px 10px 4px;font:700 .68rem "DM Sans",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F07A5A}',
    '.sp-li a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;color:inherit;text-decoration:none}',
    '.sp-li a[aria-selected=true],.sp-li a:hover{background:rgba(233,102,69,.18)}',
    '.sp-t{font-weight:600;font-size:.98rem;line-height:1.25}',
    '.sp-s{font-size:.8rem;opacity:.7;line-height:1.35;margin-top:2px}',
    '.sp-b{margin-left:auto;flex:none;font:700 .7rem "DM Sans",system-ui,sans-serif;border-radius:100px;padding:3px 10px;background:rgba(245,232,203,.12);white-space:nowrap}',
    '.sp-b.sp-book{background:#E96645;color:#fff}',
    '.sp-empty{padding:26px 18px;text-align:center;opacity:.8;font-size:.95rem;line-height:1.5}',
    '.sp-empty a{color:#F07A5A;font-weight:700}',
    '.sp-foot{display:flex;gap:16px;justify-content:space-between;padding:10px 16px;border-top:1px solid rgba(245,232,203,.12);font-size:.74rem;opacity:.65}',
    '@media(prefers-reduced-motion:reduce){.sp-fab{transition:none}}'
  ].join('\n');

  /* ---------- UI ---------- */
  var ov, input, list, fab, active = -1, results = [], lastFocus = null;

  function build() {
    if (ov) return;
    var st = document.createElement('style'); st.setAttribute('data-shore-plus', ''); st.textContent = css; document.head.appendChild(st);

    fab = document.createElement('button');
    fab.className = 'sp-fab'; fab.type = 'button'; fab.setAttribute('aria-label', 'Search ShoreList');
    fab.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><span>Search</span><kbd>Ctrl K</kbd>';
    fab.addEventListener('click', function () { open('button'); });
    document.body.appendChild(fab);

    ov = document.createElement('div');
    ov.className = 'sp-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Search ShoreList');
    ov.innerHTML = '<div class="sp-box"><div class="sp-in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>' +
      '<input type="text" id="sp-input" role="combobox" aria-expanded="true" aria-controls="sp-list" aria-autocomplete="list" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Try: ghost tour, surf lesson, rainy day, events" />' +
      '<button type="button" class="sp-esc" aria-label="Close search">Esc</button></div>' +
      '<ul class="sp-list" id="sp-list" role="listbox" aria-label="Results"></ul>' +
      '<div class="sp-foot"><span>Up and down to move, Enter to open</span><span>Prices and times are shown at checkout</span></div></div>';
    document.body.appendChild(ov);
    input = ov.querySelector('#sp-input'); list = ov.querySelector('#sp-list');
    ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.sp-esc').addEventListener('click', close);
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', onKey);
    list.addEventListener('mousemove', function (e) { var a = e.target.closest && e.target.closest('a[data-i]'); if (a) setActive(+a.getAttribute('data-i')); });
    list.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a[data-i]'); if (a) track('search_select', { search_term: input.value.slice(0, 60), item_type: results[+a.getAttribute('data-i')].t }); });
  }

  function load() {
    if (INDEX) return Promise.resolve();
    if (loading) return loading;
    loading = fetch('/search-index.json', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
      .then(function (j) { INDEX = j; }).catch(function () { INDEX = { items: [] }; });
    return loading;
  }

  function badge(it) {
    if (it.t === 'tour') return '<span class="sp-b sp-book">Book' + (it.price ? ' · ' + esc(it.price) : '') + '</span>';
    if (it.t === 'cat') return it.live ? '<span class="sp-b sp-book">' + it.live + ' live</span>' : '<span class="sp-b">Coming soon</span>';
    return '';
  }

  function render(q) {
    results = search(q);
    var html = '', lastType = '', labels = { tour: 'Book now', cat: 'Experiences', page: 'Explore' };
    if (!results.length) {
      list.innerHTML = '<li class="sp-empty">Nothing matches "' + esc(q) + '" yet.<br/>Try a plain word like <em>surf</em>, <em>ghost</em> or <em>events</em>, or <a href="/category">browse all experiences</a>.</li>';
      input.removeAttribute('aria-activedescendant'); active = -1; return;
    }
    results.forEach(function (it, i) {
      if (it.t !== lastType) { html += '<li class="sp-h" role="presentation">' + labels[it.t] + '</li>'; lastType = it.t; }
      html += '<li class="sp-li" role="presentation"><a id="sp-o' + i + '" role="option" data-i="' + i + '" href="' + esc(it.url) + '" aria-selected="false"><span><div class="sp-t">' + esc(it.title) + '</div><div class="sp-s">' + esc(it.sub) + '</div></span>' + badge(it) + '</a></li>';
    });
    if (deferredInstall && !norm(q)) html += '<li class="sp-li" role="presentation"><a role="option" href="#install" data-install="1" id="sp-install" aria-selected="false"><span><div class="sp-t">Install the ShoreList app</div><div class="sp-s">Add it to your home screen for quick access</div></span></a></li>';
    list.innerHTML = html;
    var ia = list.querySelector('[data-install]');
    if (ia) ia.addEventListener('click', function (e) { e.preventDefault(); promptInstall(); });
    setActive(0);
  }

  function setActive(i) {
    var opts = list.querySelectorAll('a[data-i]');
    if (!opts.length) { active = -1; return; }
    active = Math.max(0, Math.min(i, opts.length - 1));
    opts.forEach(function (a, k) { a.setAttribute('aria-selected', k === active ? 'true' : 'false'); });
    var cur = opts[active]; input.setAttribute('aria-activedescendant', cur.id);
    if (cur.scrollIntoView) cur.scrollIntoView({ block: 'nearest' });
  }

  function onKey(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
    else if (e.key === 'Enter') {
      var opts = list.querySelectorAll('a[data-i]');
      if (opts[active]) { e.preventDefault(); track('search_select', { search_term: input.value.slice(0, 60), item_type: results[active].t }); window.location.href = opts[active].getAttribute('href'); }
    } else if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'Tab') { e.preventDefault(); }   // keep focus inside the dialog
  }

  function open(src) {
    build();
    lastFocus = document.activeElement;
    ov.classList.add('sp-open');
    document.documentElement.style.overflow = 'hidden';
    input.value = '';
    load().then(function () { render(''); });
    setTimeout(function () { input.focus(); }, 0);
    track('search_open', { method: src || 'key' });
  }
  function close() {
    if (!ov) return;
    ov.classList.remove('sp-open');
    document.documentElement.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '', typing = /INPUT|TEXTAREA|SELECT/.test(tag) || (e.target && e.target.isContentEditable);
    if ((e.key === 'k' || e.key === 'K') && (e.ctrlKey || e.metaKey)) { e.preventDefault(); ov && ov.classList.contains('sp-open') ? close() : open('shortcut'); }
    else if (e.key === '/' && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) { e.preventDefault(); open('slash'); }
  });

  /* ---------- install as app + offline shell ---------- */
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); deferredInstall = e; });
  window.addEventListener('appinstalled', function () { deferredInstall = null; track('pwa_installed'); });
  function promptInstall() {
    if (!deferredInstall) return;
    deferredInstall.prompt();
    deferredInstall.userChoice.then(function (c) { track('pwa_install_choice', { outcome: c && c.outcome }); deferredInstall = null; close(); });
  }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('/sw.js').catch(function () {}); });
  }

  /* public hooks so pages can open the palette (e.g. a hero button: onclick="ShorePlus.open('hero')") */
  window.ShorePlus = { open: open, close: close, search: search };

  function init() { build(); load(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
