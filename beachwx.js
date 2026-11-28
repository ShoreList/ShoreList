/* ShoreList Beach Report: live conditions, tide chart and an automatic beach flag for
   Wrightsville, Carolina and Kure Beach.
   Data: NOAA CO-OPS (measured water temperature, tide predictions, station 8658163 Wrightsville Beach),
   open-meteo (weather, waves, wind). The flag is an ESTIMATE from those numbers and is not an
   official lifeguard flag: always obey the flags posted on the beach. */
(function () {
  'use strict';
  var B = [
    { id: 'wrightsville', name: 'Wrightsville Beach', lat: 34.2097, lon: -77.7964, sea: [34.19, -77.77] },
    { id: 'carolina', name: 'Carolina Beach', lat: 34.0345, lon: -77.8976, sea: [34.02, -77.87] },
    { id: 'kure', name: 'Kure Beach', lat: 33.994, lon: -77.9068, sea: [33.97, -77.89] }
  ];
  var STATION = '8658163', TTL = 10 * 60 * 1000, cache = {}, noaa = null, noaaAt = 0;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function j(u) { return fetch(u).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }); }
  function ymd(d) { var p = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d).replace(/-/g, ''); return p; }
  function parseNoaa(s) { var m = String(s).match(/(\d+)-(\d+)-(\d+) (\d+):(\d+)/); return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]).getTime() : NaN; } // station-local, same wall clock as NY
  function nyNowMs() { var p = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date()), o = {}; p.forEach(function (x) { o[x.type] = x.value; }); return new Date(+o.year, +o.month - 1, +o.day, +o.hour % 24, +o.minute).getTime(); }
  function compass(d) { return d == null ? '' : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'][Math.round(d / 22.5) % 16]; }
  function t12(ms) { return new Date(ms).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }

  function loadNoaa() {
    if (noaa && Date.now() - noaaAt < TTL) return Promise.resolve(noaa);
    var base = 'https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?application=shorelist&station=' + STATION + '&time_zone=lst_ldt&units=english&format=json';
    var d0 = new Date(Date.now() - 86400000), bd = ymd(d0);
    var temp = j(base + '&product=water_temperature&date=latest').catch(function () { return null; });
    var hilo = j(base + '&product=predictions&datum=MLLW&interval=hilo&begin_date=' + bd + '&range=72').catch(function () { return null; });
    var hr = j(base + '&product=predictions&datum=MLLW&interval=h&begin_date=' + bd + '&range=72').catch(function () { return null; });
    return Promise.all([temp, hilo, hr]).then(function (r) {
      noaa = {
        waterF: r[0] && r[0].data && r[0].data[0] ? parseFloat(r[0].data[0].v) : null,
        waterAt: r[0] && r[0].data && r[0].data[0] ? parseNoaa(r[0].data[0].t) : null,
        hilo: ((r[1] && r[1].predictions) || []).map(function (p) { return { t: parseNoaa(p.t), v: parseFloat(p.v), type: p.type }; }),
        hourly: ((r[2] && r[2].predictions) || []).map(function (p) { return { t: parseNoaa(p.t), v: parseFloat(p.v) }; })
      };
      noaaAt = Date.now(); return noaa;
    });
  }

  // ---- flag logic (estimate) ----
  function flag(d) {
    var why = [], lvl = 0; // 0 green, 1 yellow, 2 red
    var ft = d.waveFt, g = d.gust != null ? d.gust : d.wind;
    function up(n, msg) { if (n > lvl) lvl = n; why.push(msg); }
    if (d.code >= 95) up(2, 'Thunderstorms nearby');
    if (ft != null) { if (ft >= 6) up(2, 'Surf ' + ft.toFixed(1) + ' ft and rough'); else if (ft >= 3.5) up(1, 'Surf ' + ft.toFixed(1) + ' ft'); }
    if (g != null) { if (g >= 35) up(2, 'Gusts ' + Math.round(g) + ' mph'); else if (g >= 22) up(1, 'Gusts ' + Math.round(g) + ' mph'); }
    if (d.period != null && ft != null && d.period >= 10 && ft >= 2.5) up(1, 'Long-period swell, strong currents likely');
    if (d.code >= 61 && d.code < 95) up(1, 'Rain');
    if (d.waterF != null && d.waterF < 55) up(1, 'Cold water ' + Math.round(d.waterF) + '\u00b0F');
    var risk = 'Low';
    if (ft != null && ((ft >= 3 && d.period >= 8) || ft >= 4.5)) risk = 'High'; else if (ft != null && (ft >= 2 || d.period >= 9)) risk = 'Moderate';
    if (!why.length) why.push('Calm, easy conditions');
    return { level: ['green', 'yellow', 'red'][lvl], label: ['Green flag', 'Yellow flag', 'Red flag'][lvl], meaning: ['Low hazard', 'Moderate hazard', 'High hazard'][lvl], why: why, rip: risk };
  }
  function surfNote(d) {
    if (d.waveFt == null) return '';
    var offshore = d.windDir != null && (d.windDir >= 250 || d.windDir <= 20), w = d.wind || 0;
    var q = w < 5 ? 'glassy' : (offshore && w < 15) ? 'clean' : (!offshore && w > 12) ? 'choppy' : 'fair';
    return d.waveFt.toFixed(1) + ' ft at ' + (d.period != null ? Math.round(d.period) + 's ' : '') + compass(d.waveDir) + ', ' + q;
  }
  function tideInfo(n, now) {
    if (!n || !n.hilo.length) return null;
    var prev = null, next = null;
    n.hilo.forEach(function (p) { if (p.t <= now) prev = p; else if (!next) next = p; });
    var out = { prev: prev, next: next, rising: next ? next.type === 'H' : null };
    if (prev && next) { var f = (now - prev.t) / (next.t - prev.t); out.height = prev.v + (next.v - prev.v) * (1 - Math.cos(Math.PI * f)) / 2; }
    return out;
  }

  function get(i) {
    var c = cache[i]; if (c && Date.now() - c.at < TTL) return Promise.resolve(c.d);
    var b = B[i], tz = '&timezone=America%2FNew_York';
    var wx = j('https://api.open-meteo.com/v1/forecast?latitude=' + b.lat + '&longitude=' + b.lon + '&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,uv_index&daily=sunrise,sunset&temperature_unit=fahrenheit&wind_speed_unit=mph&forecast_days=1' + tz);
    var mr = j('https://marine-api.open-meteo.com/v1/marine?latitude=' + b.sea[0] + '&longitude=' + b.sea[1] + '&current=wave_height,wave_period,wave_direction,sea_surface_temperature' + tz).catch(function () { return {}; });
    return Promise.all([wx, mr, loadNoaa()]).then(function (r) {
      var c0 = r[0].current || {}, m = r[1].current || {}, n = r[2], now = nyNowMs();
      var d = { beach: b, temp: c0.temperature_2m, feels: c0.apparent_temperature, code: c0.weather_code, wind: c0.wind_speed_10m, gust: c0.wind_gusts_10m, windDir: c0.wind_direction_10m, uv: c0.uv_index,
        waveFt: m.wave_height != null ? m.wave_height * 3.281 : null, period: m.wave_period, waveDir: m.wave_direction,
        waterF: n && n.waterF != null ? n.waterF : (m.sea_surface_temperature != null ? m.sea_surface_temperature * 9 / 5 + 32 : null), waterSrc: n && n.waterF != null ? (b.id === 'wrightsville' ? 'NOAA station, Wrightsville Beach' : 'nearest NOAA station: Wrightsville Beach') : 'model estimate',
        sunrise: r[0].daily && r[0].daily.sunrise && r[0].daily.sunrise[0], sunset: r[0].daily && r[0].daily.sunset && r[0].daily.sunset[0], now: now, noaa: n, tide: tideInfo(n, now), at: Date.now() };
      d.flag = flag(d); d.surf = surfNote(d); cache[i] = { at: Date.now(), d: d }; return d;
    });
  }
  function wxWord(c) { return c === 0 ? 'Clear' : c < 4 ? 'Partly cloudy' : c < 50 ? 'Foggy' : c < 70 ? 'Rain' : c < 80 ? 'Snow' : c < 95 ? 'Showers' : 'Storms'; }
  function summary(d) { return d.beach.name + ': ' + Math.round(d.temp) + 'F ' + wxWord(d.code) + ', wind ' + Math.round(d.wind) + ' mph gusting ' + Math.round(d.gust || d.wind) + ', surf ' + (d.waveFt != null ? d.waveFt.toFixed(1) + ' ft at ' + Math.round(d.period || 0) + 's' : 'n/a') + ', water ' + (d.waterF != null ? Math.round(d.waterF) + 'F' : 'n/a') + ', tide ' + (d.tide && d.tide.next ? (d.tide.rising ? 'rising to high' : 'falling to low') + ' at ' + t12(d.tide.next.t) : 'n/a') + ', estimated ' + d.flag.label + ' (' + d.flag.why.join('; ') + ')'; }
  function template(d) {
    var s = 'Estimated ' + d.flag.label.toLowerCase() + ' at ' + d.beach.name + ': ' + d.flag.why.slice(0, 2).join(', ').toLowerCase() + '.';
    if (d.tide && d.tide.next) s += ' Tide is ' + (d.tide.rising ? 'rising toward high' : 'falling toward low') + ' at ' + t12(d.tide.next.t) + '.';
    if (d.waterF != null) s += ' Water is ' + Math.round(d.waterF) + '°F.';
    return s;
  }
  var reports = {};
  function aiReport(d) {
    var k = d.beach.id; if (reports[k] && Date.now() - reports[k].at < TTL) return Promise.resolve(reports[k].t);
    return fetch('/.netlify/functions/concierge', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode: 'report', context: summary(d) }) })
      .then(function (r) { if (!r.ok) throw 0; return r.json(); }).then(function (x) { if (!x.text) throw 0; reports[k] = { at: Date.now(), t: x.text }; return x.text; }).catch(function () { return template(d); });
  }

  // ---- rendering ----
  function tideSvg(d) {
    var n = d.noaa; if (!n || n.hourly.length < 6) return '';
    var from = d.now - 6 * 3600000, to = d.now + 18 * 3600000, pts = n.hourly.filter(function (p) { return p.t >= from && p.t <= to; });
    if (pts.length < 4) return '';
    var vs = pts.map(function (p) { return p.v; }), mn = Math.min.apply(null, vs), mx = Math.max.apply(null, vs), W = 300, H = 70, pad = 8;
    function X(t) { return (t - from) / (to - from) * W; } function Y(v) { return H - pad - (v - mn) / (mx - mn || 1) * (H - pad * 2); }
    var path = pts.map(function (p, i) { return (i ? 'L' : 'M') + X(p.t).toFixed(1) + ' ' + Y(p.v).toFixed(1); }).join(' ');
    var area = path + ' L' + X(pts[pts.length - 1].t).toFixed(1) + ' ' + H + ' L' + X(pts[0].t).toFixed(1) + ' ' + H + ' Z';
    var nowX = X(d.now), lab = '';
    n.hilo.filter(function (p) { return p.t >= from && p.t <= to; }).forEach(function (p) { lab += '<text x="' + Math.min(W - 34, Math.max(34, X(p.t))).toFixed(0) + '" y="' + (p.type === 'H' ? Math.max(9, Y(p.v) - 4) : Math.min(H - 2, Y(p.v) + 11)).toFixed(0) + '" text-anchor="middle">' + (p.type === 'H' ? 'H ' : 'L ') + t12(p.t).replace(':00', '').replace(' ', '') + '</text>'; });
    return '<svg class="tide-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Tide chart for the next 18 hours"><path class="ta" d="' + area + '"/><path class="tl" d="' + path + '"/><line class="tn" x1="' + nowX.toFixed(1) + '" x2="' + nowX.toFixed(1) + '" y1="0" y2="' + H + '"/><circle class="td" cx="' + nowX.toFixed(1) + '" cy="' + Y(d.tide && d.tide.height != null ? d.tide.height : vs[0]).toFixed(1) + '" r="4"/>' + lab + '</svg>';
  }
  function flagHtml(d) {
    var w = d.wind || 6, dur = Math.max(0.9, 3.2 - w * 0.09).toFixed(2);
    return '<div class="flagwrap" role="img" aria-label="' + esc(d.flag.label + ' estimate, ' + d.flag.meaning) + '"><div class="pole"></div><div class="flagcloth f-' + d.flag.level + '" style="--dur:' + dur + 's"></div></div>';
  }
  function card(d) {
    var t = d.tide, tideTxt = t && t.next ? (t.rising ? 'Rising' : 'Falling') + ', ' + (t.rising ? 'high' : 'low') + ' ' + t12(t.next.t) + ' (' + t.next.v.toFixed(1) + ' ft)' : 'n/a';
    return '<article class="bwc" data-b="' + d.beach.id + '"><header><h3>' + esc(d.beach.name) + '</h3><span class="upd">Updated ' + t12(d.at) + '</span></header>' +
      '<div class="bwf">' + flagHtml(d) + '<div><b class="fl-' + d.flag.level + '">' + esc(d.flag.label) + '</b><span>' + esc(d.flag.meaning) + ' (estimate)</span><ul>' + d.flag.why.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></div></div>' +
      '<p class="ai" data-ai>' + esc(template(d)) + '</p>' +
      '<dl class="bwg"><div><dt>Air</dt><dd>' + Math.round(d.temp) + '&deg;F<small>' + esc(wxWord(d.code)) + '</small></dd></div>' +
      '<div><dt>Water</dt><dd>' + (d.waterF != null ? Math.round(d.waterF) + '&deg;F' : 'n/a') + '<small>' + esc(d.waterSrc) + '</small></dd></div>' +
      '<div><dt>Surf</dt><dd>' + (d.waveFt != null ? d.waveFt.toFixed(1) + ' ft' : 'n/a') + '<small>' + esc(d.surf) + '</small></dd></div>' +
      '<div><dt>Wind</dt><dd>' + Math.round(d.wind) + ' mph<small>' + esc(compass(d.windDir)) + (d.gust ? ', gusts ' + Math.round(d.gust) : '') + '</small></dd></div>' +
      '<div><dt>Rip risk</dt><dd>' + esc(d.flag.rip) + '<small>estimated</small></dd></div>' +
      '<div><dt>UV</dt><dd>' + (d.uv != null ? Math.round(d.uv) : 'n/a') + '<small>' + (d.sunset ? 'sunset ' + t12(new Date(d.sunset).getTime()) : '') + '</small></dd></div></dl>' +
      '<div class="bwt"><div class="tt"><b>Tide</b> ' + esc(tideTxt) + '</div>' + tideSvg(d) + '<small>' + (d.beach.id === 'wrightsville' ? 'NOAA tide station: Wrightsville Beach' : 'Tide from the nearest NOAA station: Wrightsville Beach') + '</small></div></article>';
  }
  function mount(el) {
    var ids = el.getAttribute('data-beachwx'), list = ids === 'all' || !ids ? [0, 1, 2] : [B.map(function (b) { return b.id; }).indexOf(ids)].filter(function (x) { return x > -1; });
    el.classList.add('bw-loading');
    Promise.all(list.map(get)).then(function (ds) {
      el.classList.remove('bw-loading');
      el.innerHTML = ds.map(card).join('') + '<p class="bwn">Flags shown are ShoreList estimates from live wave, wind and weather data. They are not official lifeguard flags. Always follow the flags and instructions posted on the beach and never swim alone. Data: NOAA, open-meteo.</p>';
      var live = ds[0];
      if (live) window.__slSea = { wind: live.wind || 0, wave: live.waveFt || 0, tide: live.tide && live.tide.height };
      // The summary line is rule-based (template). No automatic AI calls on page view.
    }).catch(function () { el.classList.remove('bw-loading'); el.innerHTML = '<p class="bwn">Live conditions are unavailable right now. Check the posted beach flags.</p>'; });
  }
  window.ShoreWX = { get: get, beaches: B, summary: summary, flag: flag };
  function init() {
    var reports = Array.from(document.querySelectorAll('[data-beachwx]'));
    if (!reports.length) return;
    var mounted = [];
    function begin(el) { mounted.push(el); mount(el); }
    var observer = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        observer.unobserve(entry.target);
        begin(entry.target);
      });
    }, { rootMargin: '320px' }) : null;
    reports.forEach(function (el) {
      if (observer && el.hasAttribute('data-beachwx-defer')) observer.observe(el);
      else begin(el);
    });
    setInterval(function () { if (!document.hidden) mounted.forEach(mount); }, TTL);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
