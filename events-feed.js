/* ShoreList events feed. Every event is already in the HTML (written by tools/build-events-pages.mjs from
   events-data.json), so this script only enhances what is there, in place: search, area / type / free / weekend
   filters, month paging and day jumps in the mini-calendar, add to calendar (.ics) and share links.
   Nothing is re-rendered, so the page does not move when the script starts. Past events are hidden using
   today's date in America/New_York. Used by /events and every /events/<area> page. */
(function () {
  'use strict';
  var d = document, w = window, root = d.getElementById('events-feed');
  if (!root) return;
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  function $(s, c) { return (c || root).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || root).querySelectorAll(s)); }
  function nyToday() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
  }
  function utc(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function iso(dt) { return dt.toISOString().slice(0, 10); }
  function plus(s, n) { var x = utc(s); x.setUTCDate(x.getUTCDate() + n); return iso(x); }
  var reduce = w.matchMedia && w.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var today = nyToday();
  // This weekend = Friday to Sunday of the current week (same rule as the generator), never earlier than today
  var dow = utc(today).getUTCDay(), fri = plus(today, dow === 0 ? -2 : dow === 6 ? -1 : 5 - dow), sun = plus(fri, 2), wkFrom = fri < today ? today : fri;

  var cards = $$('.evc').map(function (el) {
    var a = $('.evc-t a', el);
    return { el: el, id: el.getAttribute('data-id'), start: el.getAttribute('data-start'), end: el.getAttribute('data-end'), area: el.getAttribute('data-area'), cat: el.getAttribute('data-cat'),
      city: el.getAttribute('data-city') || 'Wilmington', venue: el.getAttribute('data-venue') || '', free: el.getAttribute('data-free') === '1',
      title: a ? a.textContent : '', url: a ? a.href : '', text: (el.textContent || '').toLowerCase() + ' ' + (el.getAttribute('data-area') || '').toLowerCase() };
  });
  var days = $$('.evd'), months = $$('.evmo'), jumps = $$('[data-jump]');
  var q = $('#ef-q'), count = $('.ef-count'), empty = $('.ef-empty'), resets = $$('.ef-reset');
  var state = { q: '', area: '', cat: '', free: false, weekend: false };

  // ---------- filters ----------
  function match(c) {
    if (c.end < today) return false;
    if (state.area && c.area !== state.area) return false;
    if (state.cat && c.cat !== state.cat) return false;
    if (state.free && !c.free) return false;
    if (state.weekend && !(c.start <= sun && c.end >= wkFrom)) return false;
    if (state.q) { var t = state.q.split(/\s+/); for (var i = 0; i < t.length; i++) if (t[i] && c.text.indexOf(t[i]) < 0) return false; }
    return true;
  }
  function active() { return !!(state.q || state.area || state.cat || state.free || state.weekend); }
  function apply(silent) {
    var n = 0, total = 0;
    cards.forEach(function (c) { var ok = match(c); c.el.hidden = !ok; if (ok) n++; if (c.end >= today) total++; });
    var open = {};
    days.forEach(function (s) { var any = !!s.querySelector('.evc:not([hidden])'); s.hidden = !any; if (any) open[s.getAttribute('data-day')] = 1; });
    months.forEach(function (m) { m.hidden = !m.querySelector('.evd:not([hidden])'); });
    jumps.forEach(function (a) { var on = !!open[a.getAttribute('data-jump')]; a.classList.toggle('off', !on); if (on) { a.removeAttribute('aria-disabled'); a.removeAttribute('tabindex'); } else { a.setAttribute('aria-disabled', 'true'); a.setAttribute('tabindex', '-1'); } });
    if (count) count.textContent = active() ? 'Showing ' + n + ' of ' + total + (total === 1 ? ' event' : ' events') : total + (total === 1 ? ' event' : ' events');
    if (empty) empty.hidden = n > 0;
    resets.forEach(function (b) { if (!b.closest('.ef-empty')) b.hidden = !active(); });
    $$('.ef-chip').forEach(function (b) {
      var on = b.hasAttribute('data-area') ? b.getAttribute('data-area') === state.area : b.hasAttribute('data-cat') ? b.getAttribute('data-cat') === state.cat : b.hasAttribute('data-free') ? state.free : state.weekend;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (!silent) url();
  }
  function url() {
    try {
      var p = new URLSearchParams();
      if (state.area) p.set('area', state.area); if (state.cat) p.set('type', state.cat); if (state.free) p.set('free', '1'); if (state.weekend) p.set('when', 'weekend'); if (state.q) p.set('q', state.q);
      var s = p.toString(); history.replaceState(null, '', location.pathname + (s ? '?' + s : '') + location.hash);
    } catch (e) {}
  }
  function clear() { state = { q: '', area: '', cat: '', free: false, weekend: false }; if (q) q.value = ''; apply(); }
  try {
    var sp = new URLSearchParams(location.search);
    var has = function (attr, v) { return !!v && $$('.ef-chip[' + attr + ']').some(function (b) { return b.getAttribute(attr) === v; }); };
    if (has('data-area', sp.get('area'))) state.area = sp.get('area');
    if (has('data-cat', sp.get('type'))) state.cat = sp.get('type');
    if (sp.get('free') === '1') state.free = true;
    if (sp.get('when') === 'weekend' && $('.ef-chip[data-when]')) state.weekend = true;
    if (sp.get('q') && q) { state.q = sp.get('q').toLowerCase().trim().slice(0, 80); q.value = sp.get('q').slice(0, 80); }
  } catch (e) {}

  // ---------- today markers ----------
  days.forEach(function (s) {
    var k = s.getAttribute('data-day'), h = $('.evd-h', s), label = k === today ? 'Today' : k === plus(today, 1) ? 'Tomorrow' : k < today ? 'On now' : '';
    if (h && label) { var t = d.createElement('span'); t.className = 'evd-tag'; t.textContent = label; h.appendChild(t); }
  });
  jumps.forEach(function (a) { if (a.getAttribute('data-jump') === today) a.classList.add('today'); });
  // weekend tiles in the hero: drop any that ended before today
  $$('.wk-row li[data-end]', d).forEach(function (li) { if (li.getAttribute('data-end') < today) li.hidden = true; });

  // ---------- mini-calendar paging ----------
  var cal = $('.ef-cal'), cms = cal ? $$('.cal-m', cal) : [], ci = 0, prev = cal && $('.cal-prev', cal), next = cal && $('.cal-next', cal);
  function showMonth(i) {
    ci = Math.max(0, Math.min(cms.length - 1, i));
    cms.forEach(function (m, j) { m.classList.toggle('on', j === ci); });
    if (prev) prev.disabled = ci === 0; if (next) next.disabled = ci === cms.length - 1;
  }
  if (cms.length) showMonth(0);

  function go(el, focus) {
    if (!el) return;
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    if (focus) { try { focus.focus({ preventScroll: true }); } catch (e) {} }
  }

  // ---------- add to calendar + share ----------
  function ics(c) {
    function t(x) { return String(x).replace(/[\\;,]/g, '\\$&').replace(/\n/g, '\\n'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShoreList//Events//EN', 'BEGIN:VEVENT', 'UID:' + c.id + '@shorelist.net', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d+/g, ''),
      'DTSTART;VALUE=DATE:' + c.start.replace(/-/g, ''), 'DTEND;VALUE=DATE:' + plus(c.end, 1).replace(/-/g, ''), 'SUMMARY:' + t(c.title), 'LOCATION:' + t(c.venue + ', ' + c.city + ', NC'), 'URL:' + c.url, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function download(c) {
    var b = new Blob([ics(c)], { type: 'text/calendar' }), a = d.createElement('a');
    a.href = URL.createObjectURL(b); a.download = c.id + '.ics'; d.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  var live = d.createElement('p'); live.className = 'sr'; live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite'); root.appendChild(live);
  function said(btn, msg) {
    var l = $('.evc-sl', btn); if (!l) return;
    l.textContent = msg; live.textContent = msg; clearTimeout(btn._t); btn._t = setTimeout(function () { l.textContent = 'Share'; live.textContent = ''; }, 2200);
  }
  function share(c, btn) {
    var link = location.origin + '/events#ev-' + c.id;
    if (navigator.share) { navigator.share({ title: c.title, text: c.title + ' | ShoreList events', url: link }).catch(function () {}); return; }
    var fallback = function () {
      var ta = d.createElement('textarea'); ta.value = link; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'; d.body.appendChild(ta); ta.select();
      var ok = false; try { ok = d.execCommand('copy'); } catch (e) {} ta.remove(); said(btn, ok ? 'Link copied' : 'Copy failed');
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(function () { said(btn, 'Link copied'); }, fallback); else fallback();
  }
  function byEl(el) { var li = el.closest('.evc'); return cards.filter(function (c) { return c.el === li; })[0]; }

  // ---------- events ----------
  root.addEventListener('click', function (ev) {
    var t = ev.target, b;
    if (!t.closest) return;
    if ((b = t.closest('.ef-chip'))) {
      if (b.hasAttribute('data-area')) state.area = b.getAttribute('data-area');
      else if (b.hasAttribute('data-cat')) state.cat = b.getAttribute('data-cat');
      else if (b.hasAttribute('data-free')) state.free = !state.free;
      else if (b.hasAttribute('data-when')) state.weekend = !state.weekend;
      apply(); track('events_filter', { area: state.area || 'all', type: state.cat || 'all', free: state.free ? 1 : 0, weekend: state.weekend ? 1 : 0 }); return;
    }
    if (t.closest('.ef-reset')) { clear(); if (q) q.focus(); return; }
    if (t.closest('.cal-prev')) { showMonth(ci - 1); return; }
    if (t.closest('.cal-next')) { showMonth(ci + 1); return; }
    if ((b = t.closest('[data-jump]'))) {
      ev.preventDefault();
      if (b.classList.contains('off')) return;
      var sec = d.getElementById('d-' + b.getAttribute('data-jump'));
      go(sec, sec && $('.evd-h', sec)); try { history.replaceState(null, '', location.pathname + location.search + '#d-' + b.getAttribute('data-jump')); } catch (e) {}
      track('events_jump', { day: b.getAttribute('data-jump') }); return;
    }
    if ((b = t.closest('[data-ics]'))) { var c = byEl(b); if (c) { download(c); track('events_add_calendar', { id: c.id }); } return; }
    if ((b = t.closest('[data-share]'))) { var c2 = byEl(b); if (c2) { share(c2, b); track('events_share', { id: c2.id }); } return; }
    if ((b = t.closest('.evc a'))) { var c3 = byEl(b); if (c3) track('events_click', { id: c3.id }); }
  });
  if (q) {
    var timer; q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { state.q = q.value.toLowerCase().trim(); apply(); }, 120); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Escape' && q.value) { q.value = ''; state.q = ''; apply(); } });
  }
  // weekend tiles link to cards in the list: clear any filter hiding the card, then scroll to it
  d.addEventListener('click', function (ev) {
    var a = ev.target.closest && ev.target.closest('.wk-row a[href^="#ev-"]'); if (!a) return;
    var el = d.getElementById(a.getAttribute('href').slice(1)); if (!el) return;
    ev.preventDefault(); if (el.hidden) clear();
    go(el); el.classList.add('flash'); setTimeout(function () { el.classList.remove('flash'); }, 2400);
    try { history.replaceState(null, '', location.pathname + location.search + a.getAttribute('href')); } catch (e) {}
  });

  // ---------- follow the reader: highlight the day being read in the date strip (phones) and the mini-calendar ----------
  var strip = $('.ef-strip');
  if ('IntersectionObserver' in w && (strip || cal)) {
    var curS = null, curC = null, io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        var day = e.target.getAttribute('data-day'), a = strip && strip.querySelector('[data-jump="' + day + '"]'), c = cal && cal.querySelector('[data-jump="' + day + '"]');
        if (a && a !== curS) {
          if (curS) curS.classList.remove('cur'); curS = a; a.classList.add('cur');
          if (strip.offsetParent) strip.scrollTo({ left: a.offsetLeft - strip.clientWidth / 2 + a.offsetWidth / 2, behavior: reduce ? 'auto' : 'smooth' });
        }
        if (c && c !== curC) {
          if (curC) { curC.classList.remove('cur'); curC.removeAttribute('aria-current'); } curC = c; c.classList.add('cur'); c.setAttribute('aria-current', 'date');
          var m = cms.indexOf(c.closest('.cal-m')); if (m >= 0 && m !== ci) showMonth(m);
        }
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    days.forEach(function (s) { io.observe(s); });
  }

  apply(true);
})();
