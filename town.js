/* ShoreList town guides: live chip, weather-matched suggestion and next events.
   Shared by wrightsville-beach, carolina-beach, kure-beach and downtown.
   Everything here is an enhancement: with no JavaScript, or if a request fails,
   the static links on the page stay as they are.
   Weather: window.ShoreWX (beachwx.js). Events: /events-data.json. Simple visible rules, no AI. */
(function () {
  'use strict';
  var body = document.body, town = body.getAttribute('data-town');
  if (!town) return;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function word(c) { return c === 0 ? 'Clear' : c < 4 ? 'Partly cloudy' : c < 50 ? 'Foggy' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 95 ? 'Showers' : 'Storms'; }
  function link(a) { return '<a href="' + a[1] + '">' + esc(a[0]) + '</a>'; }

  /* ---- suggestions: every link below already exists on that town's page ---- */
  var TIPS = {
    wrightsville: { surf: ['a surf lesson', '/things-to-do/surf-lessons'], calm: ['paddleboarding on Banks Channel', '/things-to-do/paddleboard'], land: ['a beach photography session', '/things-to-do/beach-photography'], wet: ['what is on nearby', '/events/wrightsville-beach'] },
    carolina: { surf: ['a surf lesson', '/things-to-do/surf-lessons'], calm: ['a fishing charter', '/things-to-do/fishing-charters'], land: ['a Venus flytrap nature walk', '/things-to-do/nature-walks'], wet: ['what is on nearby', '/events/carolina-beach'] },
    kure: { calm: ['a coastal nature walk', '/things-to-do/nature-walks'], land: ['Fort Fisher history and museums', '/things-to-do/museums'], wet: ['Fort Fisher history and museums', '/things-to-do/museums'] },
    downtown: { calm: ['a sunset sail on the river', '/things-to-do/sailboat-rides'], land: ['a walking tour of the Historic District', '/things-to-do/walking-tours'], wet: ['the Wilmington Railroad Museum', '/wilmington-railroad-museum'], cool: ['a ghost walk', '/things-to-do/ghost-tours'] }
  };
  function tipFor(d, air) {
    var t = TIPS[town] || {}, wet = air.code >= 50, beach = town !== 'downtown';
    if (wet && t.wet) return 'Wet weather right now. A good moment for ' + link(t.wet) + '.';
    if (beach && d && d.flag && d.flag.level === 'red' && t.land) return 'The estimate shows rough water. Stay out of the surf and try ' + link(t.land) + '.';
    if (beach && d && d.waveFt != null && d.waveFt >= 2 && d.flag.level !== 'red' && t.surf) return 'There is some swell: about ' + d.waveFt.toFixed(1) + ' ft. Conditions suit ' + link(t.surf) + '.';
    if (air.temp != null && air.temp < 55) return 'Cool out at ' + Math.round(air.temp) + '°F. Layer up for ' + link(t.cool || t.land || t.calm) + '.';
    if (t.calm) return (beach ? 'Easy conditions in the estimate. ' : 'Dry right now. ') + 'A good fit: ' + link(t.calm) + '.';
    return '';
  }

  function weather() {
    var chip = document.querySelector('[data-t-chip]'), tip = document.querySelector('[data-t-tip]');
    var idx = +(body.getAttribute('data-wx') || 0), city = body.getAttribute('data-wx-city');
    function showChip(t) { if (chip) { chip.textContent = t; chip.classList.remove('is-off'); } }
    function showTip(html) { if (tip && html) tip.innerHTML = '<b>Suggested for these conditions</b>' + html; }
    var beachP = window.ShoreWX ? window.ShoreWX.get(idx).catch(function () { return null; }) : Promise.resolve(null);
    if (city) {
      // Downtown has no beach: read Wilmington air from the same source, and label the beach card as the nearest beach.
      var ll = city.split(',');
      var airP = fetch('https://api.open-meteo.com/v1/forecast?latitude=' + ll[0] + '&longitude=' + ll[1] + '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=America%2FNew_York')
        .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) { var c = j.current || {}; if (c.temperature_2m == null) throw 0; return { temp: c.temperature_2m, code: c.weather_code }; }).catch(function () { return null; });
      Promise.all([airP, beachP]).then(function (r) {
        var air = r[0], d = r[1];
        if (air) { showChip('Now in Wilmington: ' + Math.round(air.temp) + '°F ' + word(air.code)); showTip(tipFor(d, air)); }
      });
    } else {
      beachP.then(function (d) {
        if (!d || d.temp == null) return;
        var t = 'Live: ' + Math.round(d.temp) + '°F ' + word(d.code);
        if (d.waterF != null) t += ' · Water ' + Math.round(d.waterF) + '°';
        if (d.waveFt != null) t += ' · Surf ' + d.waveFt.toFixed(1) + ' ft';
        showChip(t); showTip(tipFor(d, { temp: d.temp, code: d.code }));
      });
    }
  }

  /* ---- next events for this area ---- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function todayNY() { try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); } catch (e) { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); } }
  function parts(s) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || ''); if (!m) return null; var dt = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])); return { y: +m[1], m: +m[2] - 1, d: +m[3], w: dt.getUTCDay() }; }
  function md(p) { return MON[p.m] + ' ' + p.d; }
  function events() {
    var box = document.querySelector('[data-t-events]');
    if (!box) return;
    var list = box.querySelector('ol'), area = box.getAttribute('data-t-events');
    function fail() { if (list) list.parentNode.removeChild(list); var h = box.querySelector('h3'); if (h) h.textContent = 'Events calendar'; }
    if (!window.fetch || !list) { fail(); return; }
    fetch('/events-data.json').then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (j) {
      var all = Array.isArray(j) ? j : (j && j.events) || [], today = todayNY();
      var up = all.filter(function (e) { return e && e.area === area && e.title && parts(e.start) && (e.end && parts(e.end) ? e.end : e.start) >= today; });
      up.sort(function (a, b) { var x = a.start < today ? today : a.start, y = b.start < today ? today : b.start; return x < y ? -1 : x > y ? 1 : (a.start < b.start ? -1 : a.start > b.start ? 1 : 0); });
      up = up.slice(0, 4);
      if (!up.length) { list.innerHTML = '<li class="t-ev-none">No dated events are listed for ' + esc(area) + ' right now. The full calendar below covers the whole area.</li>'; list.style.minHeight = '0'; return; }
      list.innerHTML = up.map(function (e) {
        var s = parts(e.start), en = parts(e.end) || s, end = e.end && parts(e.end) ? e.end : e.start, on = e.start < today, multi = end !== e.start;
        var when = on ? 'Now through ' + md(en) : multi ? md(s) + ' to ' + md(en) : DOW[s.w] + ', ' + md(s);
        if (e.time && !on) when += ' · ' + e.time;
        if (e.venue) when += ' · ' + e.venue;
        var date = on ? '<span class="t-ev-d is-now"><b>On</b><span>NOW</span></span>' : '<time class="t-ev-d" datetime="' + esc(e.start) + '"><b>' + MON[s.m] + '</b><span>' + s.d + '</span></time>';
        var inner = date + '<span class="t-ev-b"><strong>' + esc(e.title) + '</strong><span>' + esc(when) + '</span></span>' + (e.cat ? '<span class="t-ev-c">' + esc(e.cat) + '</span>' : '');
        var ok = /^https?:\/\//.test(e.url || '');
        return '<li class="t-ev">' + (ok ? '<a href="' + esc(e.url) + '" target="_blank" rel="noopener noreferrer">' + inner + '<span class="t-sr"> (opens in a new tab)</span></a>' : '<div>' + inner + '</div>') + '</li>';
      }).join('');
      list.style.minHeight = '0';
      list.removeAttribute('aria-hidden');
    }).catch(fail);
  }

  /* ---- mobile booking bar ---- */
  function sticky() {
    var cta = document.getElementById('sticky-cta'); if (!cta) return; var shown = false;
    window.addEventListener('scroll', function () {
      if (window.scrollY > 400 && !shown) { shown = true; cta.classList.add('show'); }
      else if (window.scrollY <= 100 && shown) { shown = false; cta.classList.remove('show'); }
    }, { passive: true });
  }

  function init() { sticky(); events(); weather(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
