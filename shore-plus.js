/* ShoreList Plus: search & concierge palette, install-as-app, offline shell.
   Additive and self-contained. Does not touch booking, checkout or dashboard code.
   Open with Ctrl/Cmd+K, "/", or the Search button. */
(function () {
  'use strict';
  if (window.__shorePlus) return;
  window.__shorePlus = true;

  /* first-touch booking-source capture on every page (pages that start checkout load attrib.js themselves) */
  if (!window.ShoreAttrib) { try { var at = document.createElement('script'); at.src = '/attrib.js'; at.async = true; document.head.appendChild(at); } catch (e) {} }

  var INDEX = null, loading = null;
  var deferredInstall = null;

  /* ---------- analytics (no personal data) ---------- */
  function track(name, params) {
    try { if (typeof window.gtag === 'function') window.gtag('event', name, params || {}); } catch (e) {}
  }

  /* ---------- sales tracking: every buy, book and signup click (no personal data) ---------- */
  function hostOf(u) { try { return new URL(u, location.href).hostname.toLowerCase(); } catch (e) { return ''; } }
  function label(el) { return (el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80); }
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href],button') : null;
    if (!a) return;
    var href = a.getAttribute('href') || '';
    var h = href ? hostOf(href) : '';
    var page = location.pathname;
    if (h && /(^|\.)myshopify\.com$|(^|\.)fourthwall\.com$|(^|\.)shorelist\.shop$/.test(h)) {
      track('shop_click', { item_id: a.getAttribute('data-id') || '', link_text: label(a), link_domain: h, page_path: page });
    } else if (/create-checkout|\/success|book/i.test(href) || /\bbook\b|reserve|check availability/i.test(label(a))) {
      track('book_click', { link_text: label(a), link_url: href.slice(0, 120), page_path: page });
    } else if (/^tel:/.test(href)) {
      track('call_click', { page_path: page });
    } else if (/^mailto:/.test(href)) {
      track('email_click', { page_path: page });
    } else if (h && h !== location.hostname) {
      track('outbound_click', { link_domain: h, link_text: label(a), page_path: page });
    } else if (a.classList && (a.classList.contains('btn') || a.classList.contains('cta') || a.classList.contains('buy'))) {
      track('cta_click', { link_text: label(a), link_url: href.slice(0, 120), page_path: page });
    }
  }, true);
  document.addEventListener('submit', function (e) {
    var f = e.target; if (!f || f.tagName !== 'FORM' || f.id === 'dropForm') return;
    track('generate_lead', { form_id: f.id || f.getAttribute('name') || 'form', page_path: location.pathname });
  }, true);
  document.addEventListener('sl:shop-signup-complete', function (e) {
    if (e.target && e.target.id === 'dropForm') track('generate_lead', { form_id: 'dropForm', page_path: location.pathname });
  });
  (function () {
    var marks = [25, 50, 75, 90], seen = {};
    function onScroll() {
      var d = document.documentElement, max = d.scrollHeight - innerHeight; if (max <= 0) return;
      var pct = Math.round((scrollY / max) * 100);
      marks.forEach(function (m) { if (pct >= m && !seen[m]) { seen[m] = 1; track('scroll_depth', { percent: m, page_path: location.pathname }); } });
    }
    addEventListener('scroll', onScroll, { passive: true });
  })();

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
    '.sp-fab{position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:8001;display:flex;align-items:center;gap:8px;background:rgba(14,31,51,.88);color:#D9C7A3;border:1px solid rgba(217,199,163,.22);border-radius:100px;min-height:44px;padding:10px 18px;font:600 .9rem "DM Sans",system-ui,sans-serif;cursor:pointer;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 6px 24px rgba(0,0,0,.28);transition:transform .2s,background .2s}',
    '.sp-fab:hover{background:rgba(14,31,51,.95);transform:translateX(-50%) translateY(-2px)}',
    '.sp-fab kbd{font:600 .68rem "DM Sans",system-ui,sans-serif;border:1px solid rgba(217,199,163,.3);border-radius:5px;padding:1px 6px;opacity:.75}',
    '@media(max-width:640px){.sp-fab kbd{display:none}.sp-fab{left:auto;right:76px;bottom:16px;transform:none;width:48px;height:48px;min-height:48px;padding:0;justify-content:center}.sp-fab:hover{transform:none}.sp-fab span{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}.sp-fab svg{width:20px;height:20px}}',
    '.sp-ov{position:fixed;inset:0;z-index:10050;background:rgba(14,31,51,.62);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;padding:max(8vh,16px) 14px 14px}',
    '.sp-ov.sp-open{display:flex}',
    '.sp-box{width:100%;max-width:620px;background:#0E1F33;color:#D9C7A3;border:1px solid rgba(217,199,163,.16);border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.5);overflow:hidden;font-family:"DM Sans",system-ui,sans-serif}',
    '.sp-in{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid rgba(217,199,163,.12)}',
    '.sp-in svg{flex:none;opacity:.7}',
    '.sp-in input{flex:1;min-width:0;background:transparent;border:0;outline:0;color:#D9C7A3;font:500 1.05rem "DM Sans",system-ui,sans-serif}',
    '.sp-in input::placeholder{color:rgba(217,199,163,.5)}',
    '.sp-esc{font:600 12px "DM Sans",system-ui,sans-serif;border:1px solid rgba(217,199,163,.3);border-radius:5px;padding:2px 7px;opacity:.7;background:none;color:inherit;cursor:pointer}',
    '.sp-list{list-style:none;margin:0;padding:8px;max-height:min(56vh,420px);overflow:auto}',
    '.sp-h{padding:8px 10px 4px;font:700 12px "DM Sans",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#D9C7A3}',
    '.sp-li a{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:12px;color:inherit;text-decoration:none}',
    '.sp-li a[aria-selected=true],.sp-li a:hover{background:rgba(181,54,47,.18)}',
    '.sp-t{font-weight:500;font-size:.98rem;line-height:1.25}',
    '.sp-s{font-size:.8rem;opacity:.7;line-height:1.35;margin-top:2px}',
    '.sp-b{margin-left:auto;flex:none;font:700 12px "DM Sans",system-ui,sans-serif;border-radius:100px;padding:3px 10px;background:rgba(217,199,163,.12);white-space:nowrap}',
    '.sp-b.sp-book{background:#B5362F;color:#fff}',
    '.sp-empty{padding:26px 18px;text-align:center;opacity:.8;font-size:.95rem;line-height:1.5}',
    '.sp-empty a{color:#D9C7A3;font-weight:500}',
    '.sp-foot{display:flex;gap:16px;justify-content:space-between;padding:10px 16px;border-top:1px solid rgba(217,199,163,.12);font-size:.74rem;opacity:.65}',
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

  /* living coast layer (gulls, surf, fin): loaded after the page is interactive */
  function ambient() {
    var go = function () { var s = document.createElement('script'); s.src = '/ambient.js'; s.defer = true; document.head.appendChild(s); };
    if ('requestIdleCallback' in window) requestIdleCallback(go, { timeout: 2500 }); else setTimeout(go, 1200);
  }

  /* sitewide signup: one slim email form above the footer on pages that have no email field */
  function leadBar() {
    if (/^\/(legal|dashboard|success|lookbook-kit|offline|404|join|waitlist)/.test(location.pathname)) return;
    if (document.querySelector('input[type=email]')) return;
    var foot = document.querySelector('body > footer') || document.querySelector('footer');
    if (!foot) return;
    var st = document.createElement('style');
    st.textContent = '.sl-lead{background:#0E1F33;color:#F4F1EA;padding:44px 20px;text-align:center;font-family:"DM Sans",system-ui,sans-serif}' +
      '.sl-lead h2{font-family:"Libre Caslon Display",Georgia,serif;font-size:1.6rem;margin:0 0 8px;color:#F4F1EA}' +
      '.sl-lead p{margin:0 auto 18px;max-width:46ch;color:#D9C7A3;line-height:1.55}' +
      '.sl-lead form{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:520px;margin:0 auto}' +
      '.sl-lead input{flex:1;min-width:220px;min-height:44px;padding:13px 18px;border-radius:100px;border:1.5px solid rgba(244,241,234,.35);background:rgba(244,241,234,.08);color:#F4F1EA;font:inherit}' +
      '.sl-lead input::placeholder{color:rgba(244,241,234,.6)}.sl-lead input:focus{outline:2px solid #9FC3B8;outline-offset:2px}' +
      '.sl-lead button{border:0;border-radius:100px;background:#B5362F;color:#fff;font:700 .95rem "DM Sans",system-ui,sans-serif;padding:13px 24px;cursor:pointer}' +
      '.sl-lead .msg{flex-basis:100%;min-height:1.4em;margin:6px 0 0;color:#9FC3B8;font-size:.92rem}' +
      '.sl-lead .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}';
    document.head.appendChild(st);
    var s = document.createElement('section'); s.className = 'sl-lead'; s.setAttribute('aria-label', 'Email signup');
    s.innerHTML = '<h2>Get the locals’ list</h2><p>One email when new tours, events and shop drops go live around Wilmington and the beaches. Unsubscribe any time.</p>' +
      '<form id="slLead" novalidate><label class="sr" for="slLeadEmail">Email address</label><input id="slLeadEmail" type="email" name="email" inputmode="email" autocomplete="email" placeholder="you@email.com" required/><button type="submit">Sign me up</button><p class="msg" role="status" aria-live="polite"></p></form>';
    var surf = document.querySelector('.sl-surf');
    foot.parentNode.insertBefore(s, surf || foot);
    var f = s.querySelector('form'), i = s.querySelector('input'), m = s.querySelector('.msg'), busy = false;
    f.addEventListener('submit', function (e) {
      e.preventDefault(); if (busy) return;
      var v = (i.value || '').trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v)) { m.textContent = 'Please enter a valid email address.'; i.focus(); return; }
      busy = true; m.textContent = 'Adding you to the list.';
      fetch('https://formspree.io/f/xeevzzqd', { method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ email: v, list: 'Locals list', source: location.pathname, _subject: 'ShoreList locals list signup' }) })
        .then(function (r) { if (!r.ok) throw new Error('bad'); m.textContent = 'You’re on the list. Talk soon.'; f.reset(); })
        .catch(function () { m.textContent = 'That didn’t go through. Please try again in a moment.'; })
        .then(function () { busy = false; });
    });
  }

  /* Contrast fixer: brand coral text on dark panels and white text on coral fills fall below 4.5:1.
     This nudges only those cases (lighter coral on dark, deeper coral behind white) and lifts tiny labels to 12px. */
  function contrastFix(done) {
    function rgb(c) { var m = c && c.match(/[\d.]+/g); return m ? m.map(Number) : null; }
    function lum(m) { var f = function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(m[0]) + 0.7152 * f(m[1]) + 0.0722 * f(m[2]); }
    function bgOf(e) { var x = e; while (x && x.nodeType === 1) { var cs = getComputedStyle(x), m = rgb(cs.backgroundColor); if (m && (m.length < 4 || m[3] > 0.5) && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') return m; if (cs.backgroundImage !== 'none') return null; x = x.parentElement; } return [255, 255, 255]; }
    var els = document.body.querySelectorAll('*');
    var i = 0, count = Math.min(els.length, 4000);
    function slice() {
      var edits = [], until = performance.now() + 6;
      try {
        while (i < count && performance.now() < until) {
          var e = els[i++], tag = e.tagName;
          if (!e.isConnected || tag === 'SCRIPT' || tag === 'STYLE' || tag === 'SVG' || tag === 'PATH' || !e.firstChild) continue;
          var own = false; for (var c = e.firstChild; c; c = c.nextSibling) if (c.nodeType === 3 && c.textContent.trim().length > 2) { own = true; break; }
          if (!own) continue;
          var cs = getComputedStyle(e);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          var fs = parseFloat(cs.fontSize);
          if (fs < 11.5 && e.textContent.length < 60) edits.push([e, 'fontSize', '12px']);
          var col = rgb(cs.color), bg = bgOf(e); if (!col || !bg || col.length > 3 && col[3] < 0.5) continue;
          var L1 = lum(col), L2 = lum(bg), cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
          var big = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
          if (cr >= (big ? 3 : 4.5)) continue;
          var coralText = col[0] > 170 && col[1] < 120 && col[2] < 100 && L2 < 0.2;
          if (coralText) { edits.push([e, 'color', '#D9C7A3']); continue; }
          if (bg[0] > 170 && bg[1] < 130 && bg[2] < 110 && L1 > 0.6) {
            var host = e; while (host && host !== document.body) { var b2 = rgb(getComputedStyle(host).backgroundColor); if (b2 && b2[0] > 170 && b2[1] < 130 && getComputedStyle(host).backgroundColor !== 'rgba(0, 0, 0, 0)') { edits.push([host, 'backgroundColor', '#B5362F']); break; } host = host.parentElement; }
          }
        }
        edits.forEach(function (edit) { edit[0].style[edit[1]] = edit[2]; });
      } catch (e) { done(); return; }
      if (i < count) setTimeout(slice, 0);
      else done();
    }
    slice();
  }
  function scheduleFix() {
    // Home uses fixed CSS for these styles; avoid a whole-document scan during startup.
    if (location.pathname === '/' || /^\/index(?:\.html)?$/.test(location.pathname)) return;
    var timer, running = false, pending = false;
    function run() {
      if (running) { pending = true; return; }
      running = true;
      contrastFix(function () {
        running = false;
        if (pending) { pending = false; setTimeout(run, 0); }
      });
    }
    setTimeout(run, 900);
    if ('MutationObserver' in window) new MutationObserver(function () {
      clearTimeout(timer);
      timer = setTimeout(run, 700);
    }).observe(document.body, { childList: true, subtree: true });
  }

  function init() { build(); load(); leadBar(); ambient(); scheduleFix(); }
  // Search button, install prompt, newsletter strip and click tracking are not needed for first paint: build them when the browser is idle (at most 2.5 s after the page is ready).
  function later() { (window.requestIdleCallback || function (f) { return setTimeout(f, 800); })(init, { timeout: 2500 }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', later); else later();
})();
