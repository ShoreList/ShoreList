/* ShoreList live events feed: renders /events-data.json (refreshed daily by tools/refresh-events.mjs).
   Past events are hidden automatically. Filters by area, category and "this weekend". Add-to-calendar (.ics) per event. */
(function () {
  'use strict';
  var d = document, w = window, mount = d.getElementById('events-feed');
  if (!mount) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  function ymd(dt) { return dt.getFullYear() + '-' + ('0' + (dt.getMonth() + 1)).slice(-2) + '-' + ('0' + dt.getDate()).slice(-2); }
  function parse(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var CSS = '#events-feed{padding:64px 20px;background:#F4F1EA}#events-feed .ef-in{max-width:1180px;margin:0 auto}#events-feed .ef-eye{font-size:.74rem;font-weight:800;letter-spacing:.22em;text-transform:uppercase;color:#C0412A;margin:0 0 8px}' +
    '#events-feed h2{font-family:"Playfair Display",serif;font-size:clamp(1.9rem,4vw,2.8rem);font-weight:900;color:#0A4D5C;margin:0 0 8px;line-height:1.08}#events-feed h2 em{color:#C0412A}#events-feed .ef-sub{color:#1A7585;margin:0 0 22px;max-width:640px;line-height:1.6}' +
    '#events-feed .ef-chips{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 22px}#events-feed .ef-chip{font:inherit;font-weight:700;font-size:.86rem;min-height:40px;padding:8px 16px;border-radius:100px;border:1.5px solid rgba(10,77,92,.18);background:#fff;color:#0A4D5C;cursor:pointer}#events-feed .ef-chip[aria-pressed=true]{background:#0A4D5C;color:#fff;border-color:#0A4D5C}#events-feed .ef-chip:focus-visible,#events-feed a:focus-visible{outline:2px solid #0A4D5C;outline-offset:2px}' +
    '#events-feed .ef-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}#events-feed .ef-card{display:flex;gap:16px;background:#fff;border:1px solid rgba(10,77,92,.12);border-radius:18px;padding:16px;box-shadow:0 6px 18px rgba(10,77,92,.05);transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s}@media(hover:hover){#events-feed .ef-card:hover{transform:translateY(-3px);box-shadow:0 18px 36px rgba(10,77,92,.12)}}' +
    '#events-feed .ef-date{flex:none;width:64px;border-radius:14px;background:#0E1F33;color:#F4F1EA;text-align:center;padding:9px 0;line-height:1}#events-feed .ef-date b{display:block;font-family:"Playfair Display",serif;font-size:1.7rem;margin:3px 0}#events-feed .ef-date span{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#9FC3B8;font-weight:800}' +
    '#events-feed h3{font-family:"Playfair Display",serif;font-size:1.12rem;font-weight:800;margin:0 0 4px;color:#0A4D5C;line-height:1.2}#events-feed .ef-meta{font-size:.88rem;color:#2A4850;line-height:1.5;margin:0 0 8px}#events-feed .ef-tag{display:inline-block;font-size:.74rem;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#C0412A;margin-right:8px}' +
    '#events-feed .ef-act{display:flex;gap:14px;flex-wrap:wrap}#events-feed .ef-act a,#events-feed .ef-act button{font:inherit;font-weight:800;font-size:.86rem;color:#C0412A;text-decoration:none;background:none;border:0;padding:6px 0;cursor:pointer;min-height:32px}#events-feed .ef-act a:hover,#events-feed .ef-act button:hover{text-decoration:underline}' +
    '#events-feed .ef-note{margin:18px 0 0;font-size:.78rem;color:#2C4A52;line-height:1.55}#events-feed .ef-empty{padding:26px;border-radius:16px;background:#fff;color:#2A4850}';
  function ics(e) {
    var s = e.start.replace(/-/g, ''), en = ymd(new Date(parse(e.end).getTime() + 864e5)).replace(/-/g, '');
    function t(x) { return String(x).replace(/[\;,]/g, '\\$&').replace(/\n/g, '\\n'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ShoreList//Events//EN', 'BEGIN:VEVENT', 'UID:' + e.id + '@shorelist.net', 'DTSTAMP:' + new Date().toISOString().replace(/[-:]|\.\d+/g, ''), 'DTSTART;VALUE=DATE:' + s, 'DTEND;VALUE=DATE:' + en, 'SUMMARY:' + t(e.title), 'LOCATION:' + t(e.venue + ', Wilmington, NC'), 'URL:' + e.url, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }
  function download(e) {
    var b = new Blob([ics(e)], { type: 'text/calendar' }), a = d.createElement('a');
    a.href = URL.createObjectURL(b); a.download = e.id + '.ics'; d.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  }
  fetch('/events-data.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (data) {
    var today = ymd(new Date()), all = (data.events || []).filter(function (e) { return e.end >= today; });
    if (!all.length) return;
    var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
    var areas = []; all.forEach(function (e) { if (areas.indexOf(e.area) < 0) areas.push(e.area); });
    var state = { f: 'all' };
    var sat = new Date(), add = (6 - sat.getDay() + 7) % 7; sat = new Date(sat.getFullYear(), sat.getMonth(), sat.getDate() + add); var sun = new Date(sat.getTime() + 864e5);
    if (new Date().getDay() === 0) { sat = new Date(); sun = sat; }
    function match(e) {
      if (state.f === 'all') return true;
      if (state.f === 'weekend') return e.start <= ymd(sun) && e.end >= ymd(sat);
      return e.area === state.f;
    }
    function card(e) {
      var s = parse(e.start < today ? today : e.start), multi = e.end !== e.start;
      var when = e.recurring ? 'Every ' + e.recurring.replace(/s$/, '') : (multi ? MON[parse(e.start).getMonth()] + ' ' + parse(e.start).getDate() + ' to ' + MON[parse(e.end).getMonth()] + ' ' + parse(e.end).getDate() : DOW[s.getDay()] + ', ' + MON[s.getMonth()] + ' ' + s.getDate());
      return '<article class="ef-card"><div class="ef-date" aria-hidden="true"><span>' + MON[s.getMonth()] + '</span><b>' + s.getDate() + '</b><span>' + DOW[s.getDay()] + '</span></div><div><h3>' + esc(e.title) + '</h3><p class="ef-meta"><span class="ef-tag">' + esc(e.cat) + '</span>' + esc(when) + '<br>' + esc(e.venue) + '</p><div class="ef-act"><a href="' + esc(e.url) + '" target="_blank" rel="noopener" data-id="' + esc(e.id) + '">Details</a><button type="button" data-ics="' + esc(e.id) + '">Add to calendar</button></div></div></article>';
    }
    function render() {
      var list = all.filter(match);
      mount.querySelector('.ef-grid').innerHTML = list.length ? list.map(card).join('') : '<div class="ef-empty">Nothing listed for that filter yet. Try All events.</div>';
      mount.querySelectorAll('.ef-chip').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-f') === state.f ? 'true' : 'false'); });
    }
    mount.innerHTML = '<div class="ef-in"><div class="ef-eye">Updated automatically</div><h2>What&rsquo;s on <em>in Wilmington</em></h2><p class="ef-sub">Upcoming events, refreshed daily. Past events drop off on their own.</p><div class="ef-chips" role="group" aria-label="Filter events"><button type="button" class="ef-chip" data-f="all" aria-pressed="true">All events</button><button type="button" class="ef-chip" data-f="weekend" aria-pressed="false">This weekend</button>' +
      areas.map(function (a) { return '<button type="button" class="ef-chip" data-f="' + esc(a) + '" aria-pressed="false">' + esc(a) + '</button>'; }).join('') + '</div><div class="ef-grid"></div><p class="ef-note">Event details come from public community calendars and can change. Confirm dates, times and tickets with the organizer before you go. Last refreshed ' + esc(data.updated || '') + '.</p></div>';
    mount.hidden = false; render();
    mount.addEventListener('click', function (ev) {
      var c = ev.target.closest && ev.target.closest('.ef-chip'); if (c) { state.f = c.getAttribute('data-f'); render(); track('events_filter', { f: state.f }); return; }
      var b = ev.target.closest && ev.target.closest('[data-ics]'); if (b) { var e = all.filter(function (x) { return x.id === b.getAttribute('data-ics'); })[0]; if (e) { download(e); track('events_add_calendar', { id: e.id }); } return; }
      var a = ev.target.closest && ev.target.closest('.ef-act a'); if (a) track('events_click', { id: a.getAttribute('data-id') });
    });
    try { var ld = all.slice(0, 20).map(function (e) { return { '@type': 'Event', name: e.title, startDate: e.start, endDate: e.end, eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode', location: { '@type': 'Place', name: e.venue, address: { '@type': 'PostalAddress', addressLocality: 'Wilmington', addressRegion: 'NC', addressCountry: 'US' } }, url: e.url }; }); var s = d.createElement('script'); s.type = 'application/ld+json'; s.textContent = JSON.stringify(ld); d.head.appendChild(s); } catch (e) {}
  }).catch(function () {});
})();
