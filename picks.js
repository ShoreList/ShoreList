/* Shore Picks: filters, live search, a saved list, share, and scroll reveals. */
(function () {
  'use strict';
  var d = document, w = window;
  var cards = [].slice.call(d.querySelectorAll('.card, .spotlight'));
  if (!cards.length) return;
  var LOCS = { all: 'everywhere', downtown: 'Downtown', wrightsville: 'Wrightsville Beach', 'carolina-beach': 'Carolina Beach', kure: 'Kure Beach' };
  var activeLoc = 'all', activeCat = 'all', activeVibes = [], query = '', savedOnly = false;
  var KEY = 'slPicks', saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { saved = []; }
  function persist() { try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) {} }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  function $(id) { return d.getElementById(id); }
  function nameOf(c) { var h = c.querySelector('.c-name, h3'); return h ? h.textContent.trim() : ''; }

  // searchable text per card, built once
  cards.forEach(function (c) { c._txt = (c.textContent || '').toLowerCase().replace(/\s+/g, ' '); });

  var HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.600-7.500 10.200-7.500 10.200z"/></svg>';
  cards.forEach(function (c) {
    var id = c.getAttribute('data-pick'); if (!id) return;
    var b = d.createElement('button'); b.type = 'button'; b.className = 'c-save'; b.innerHTML = HEART;
    function paint() { var on = saved.indexOf(id) > -1; b.setAttribute('aria-pressed', on ? 'true' : 'false'); b.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + nameOf(c) + (on ? ' from my list' : ' to my list')); }
    paint(); c._paint = paint;
    b.addEventListener('click', function (e) {
      e.preventDefault(); e.stopPropagation();
      var i = saved.indexOf(id);
      if (i > -1) saved.splice(i, 1); else saved.push(id);
      persist(); paint(); counts();
      track(i > -1 ? 'pick_unsave' : 'pick_save', { pick: id });
      if (savedOnly) apply();
    });
    c.appendChild(b);
  });

  function counts() {
    var n = saved.length, el = $('savedN'); if (el) el.textContent = n;
    var sh = $('shareList'); if (sh) sh.hidden = !n;
  }

  function run() {
    var shown = 0, terms = query.split(' ').filter(Boolean);
    cards.forEach(function (c) {
      if (c.id === 'kureCross') { var hideX = !!(query || savedOnly) || (activeLoc !== 'all' && activeLoc !== 'kure') || (activeCat !== 'all' && activeCat !== 'drinks') || activeVibes.length; c.classList.toggle('hidden', !!hideX); return; }
      var vibes = (c.getAttribute('data-vibe') || '').split(' ');
      var ok = (activeLoc === 'all' || c.getAttribute('data-loc') === activeLoc) &&
        (activeCat === 'all' || c.getAttribute('data-cat') === activeCat) &&
        activeVibes.every(function (v) { return vibes.indexOf(v) > -1; }) &&
        terms.every(function (t) { return c._txt.indexOf(t) > -1; }) &&
        (!savedOnly || saved.indexOf(c.getAttribute('data-pick')) > -1);
      c.classList.toggle('hidden', !ok);
      if (ok) { shown++; c.classList.add('in'); }
    });
    d.querySelectorAll('.filter-sec').forEach(function (sec) {
      sec.classList.toggle('hidden', !sec.querySelector('.card:not(.hidden):not(.cross-card), .spotlight:not(.hidden)'));
    });
    var el = $('count');
    if (el) el.textContent = shown + (shown === 1 ? ' pick ' : ' picks ') + (savedOnly ? 'on your list' : (activeLoc === 'all' ? 'everywhere' : 'in ' + LOCS[activeLoc]));
    var em = $('pickEmpty'); if (em) { em.hidden = shown > 0; if (!shown && savedOnly && !saved.length) em.textContent = 'Your list is empty. Tap the heart on any pick to save it.'; else em.textContent = 'Nothing matches that yet. Try a different word or clear the filters.'; }
    var cl = $('clearAll'); if (cl) cl.hidden = !(query || savedOnly || activeVibes.length || activeCat !== 'all' || activeLoc !== 'all');
  }
  function apply() {
    var reduce = w.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (d.startViewTransition && !reduce) { try { d.startViewTransition(run); return; } catch (e) {} }
    run();
  }
  function press(sel, test) { d.querySelectorAll(sel).forEach(function (x) { var on = test(x); x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false'); }); }

  function setLoc(loc, quiet) {
    activeLoc = loc; press('.chip.loc', function (x) { return x.getAttribute('data-loc') === loc; }); apply();
    try { var u = new URL(location.href); if (loc === 'all') u.searchParams.delete('loc'); else u.searchParams.set('loc', loc); history.replaceState(null, '', u); } catch (e) {}
    if (!quiet) track('pick_filter', { kind: 'location', value: loc });
  }
  d.querySelectorAll('.chip.loc').forEach(function (ch) { ch.addEventListener('click', function () { setLoc(ch.getAttribute('data-loc')); }); });
  d.querySelectorAll('.chip.cat').forEach(function (ch) {
    ch.addEventListener('click', function () { activeCat = ch.getAttribute('data-cat'); press('.chip.cat', function (x) { return x === ch; }); apply(); track('pick_filter', { kind: 'category', value: activeCat }); });
  });
  d.querySelectorAll('.chip.vibe').forEach(function (ch) {
    ch.addEventListener('click', function () {
      var v = ch.getAttribute('data-vibe'), i = activeVibes.indexOf(v);
      if (i > -1) activeVibes.splice(i, 1); else activeVibes.push(v);
      ch.classList.toggle('active', i === -1); ch.setAttribute('aria-pressed', i === -1 ? 'true' : 'false'); apply();
      track('pick_filter', { kind: 'vibe', value: v });
    });
  });
  var sc = $('savedChip');
  if (sc) sc.addEventListener('click', function () { savedOnly = !savedOnly; sc.classList.toggle('active', savedOnly); sc.setAttribute('aria-pressed', savedOnly ? 'true' : 'false'); apply(); track('pick_list_view', { count: saved.length }); });

  var si = $('pickSearch'), st = 0;
  if (si) si.addEventListener('input', function () {
    clearTimeout(st); st = setTimeout(function () { query = si.value.trim().toLowerCase(); apply(); if (query.length > 2) track('pick_search', { search_term: query }); }, 140);
  });
  // "/" focuses search, like the best docs sites
  d.addEventListener('keydown', function (e) {
    if (e.key === '/' && si && !/input|textarea|select/i.test((e.target.tagName || '')) && !e.metaKey && !e.ctrlKey) { e.preventDefault(); si.focus(); }
  });

  var ca = $('clearAll');
  if (ca) ca.addEventListener('click', function () {
    query = ''; if (si) si.value = ''; savedOnly = false; activeVibes = []; activeCat = 'all';
    if (sc) { sc.classList.remove('active'); sc.setAttribute('aria-pressed', 'false'); }
    press('.chip.vibe', function () { return false; }); press('.chip.cat', function (x) { return x.getAttribute('data-cat') === 'all'; });
    setLoc('all', true);
  });

  var sp = $('surprise');
  if (sp) sp.addEventListener('click', function () {
    var pool = cards.filter(function (c) { return !c.classList.contains('hidden') && c.classList.contains('card') && c.id !== 'kureCross'; });
    if (!pool.length) return;
    var c = pool[Math.floor(Math.random() * pool.length)];
    c.scrollIntoView({ behavior: 'smooth', block: 'center' });
    c.classList.remove('flash'); void c.offsetWidth; c.classList.add('flash');
    track('pick_surprise', { pick: c.getAttribute('data-pick') });
  });

  var sh = $('shareList');
  if (sh) sh.addEventListener('click', function () {
    var names = cards.filter(function (c) { return saved.indexOf(c.getAttribute('data-pick')) > -1; }).map(nameOf);
    var url = location.origin + '/shore-picks#list=' + saved.join(',');
    var text = 'My ShoreList picks: ' + names.join(', ');
    track('pick_list_share', { count: saved.length });
    if (navigator.share) { navigator.share({ title: 'My Shore Picks', text: text, url: url }).catch(function () {}); return; }
    var done = function () { sh.textContent = 'Link copied'; setTimeout(function () { sh.textContent = 'Share my list'; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text + ' ' + url).then(done, function () {});
  });

  // a shared list link opens straight into that list
  var m = /[#&]list=([a-z0-9,]+)/.exec(location.hash || '');
  if (m) {
    var known = cards.map(function (c) { return c.getAttribute('data-pick'); });
    m[1].split(',').forEach(function (id) { if (known.indexOf(id) > -1 && saved.indexOf(id) === -1) saved.push(id); });
    persist(); cards.forEach(function (c) { if (c._paint) c._paint(); });
    savedOnly = true; if (sc) { sc.classList.add('active'); sc.setAttribute('aria-pressed', 'true'); }
  }

  // Kure crossover card
  var cross = $('kureCross');
  if (cross) cross.addEventListener('click', function () { setLoc('carolina-beach'); var s = $('drinks'); if (s && s.scrollIntoView) s.scrollIntoView({ behavior: 'smooth' }); });

  // outbound clicks from a pick
  d.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.c-link, .c-dir, .c-book, .sl-actions a'); if (!a) return;
    var c = a.closest('[data-pick]'); track('pick_click', { pick: c ? c.getAttribute('data-pick') : '', action: (a.textContent || '').trim().toLowerCase().replace(/[^a-z ]/g, '').trim() });
  });

  // reveals
  var rev = [].slice.call(d.querySelectorAll('.crit'));
  if ('IntersectionObserver' in w) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    rev.forEach(function (x) { io.observe(x); });
  } else rev.forEach(function (x) { x.classList.add('in'); });

  counts();
  try {
    var p = new URL(location.href).searchParams.get('loc');
    if (p && LOCS[p] && p !== 'all') setLoc(p, true); else run();
  } catch (e) { run(); }
})();

/* Photo fallback: if a card photo is missing, drop the broken image so the navy gradient shows. */
(function () {
  function fix(img) { img.addEventListener('error', function () { img.remove(); }); if (img.complete && img.naturalWidth === 0 && img.src) img.remove(); }
  Array.prototype.forEach.call(document.querySelectorAll('.c-img img, .spotlight img'), fix);
})();
