/* ShoreList weather hub: live current conditions, hourly and 7-day forecast for Wilmington and the beaches.
   Data: Open-Meteo forecast API. Not an official forecast: links to the National Weather Service for warnings.
   Paints instantly from the last cached reading, then refreshes. Suggestions are simple transparent rules. */
(function () {
  'use strict';
  var d = document, w = window;
  var P = [
    { n: 'Wilmington', lat: 34.2257, lon: -77.9447 },
    { n: 'Wrightsville Beach', lat: 34.2097, lon: -77.7964 },
    { n: 'Carolina Beach', lat: 34.0345, lon: -77.8976 },
    { n: 'Kure Beach', lat: 33.994, lon: -77.9068 }
  ];
  var TTL = 10 * 60 * 1000, cur = 0, mem = {};
  function $(id) { return d.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  function store(k, v) { try { if (v === undefined) { var s = sessionStorage.getItem(k); return s ? JSON.parse(s) : null; } sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
  function compass(x) { return x == null ? '' : ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round(x / 45) % 8]; }
  function label(c) {
    if (c === 0) return 'Clear'; if (c <= 2) return 'Partly cloudy'; if (c === 3) return 'Overcast'; if (c <= 48) return 'Fog';
    if (c <= 57) return 'Drizzle'; if (c <= 67) return 'Rain'; if (c <= 77) return 'Snow'; if (c <= 82) return 'Showers'; if (c <= 86) return 'Snow showers'; return 'Thunderstorms';
  }
  function kind(c) { return c === 0 ? 'sun' : c <= 2 ? 'part' : c <= 48 ? 'cloud' : c >= 95 ? 'storm' : 'rain'; }
  var ICON = {
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/>',
    part: '<circle cx="8" cy="9" r="3"/><path d="M8 3v1.5M2.5 9H4M4.2 5.2l1 1M7 18h9a4 4 0 0 0 0-8 5 5 0 0 0-9.6 1.6A3.3 3.3 0 0 0 7 18z"/>',
    cloud: '<path d="M7 18h10a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.8A3.7 3.7 0 0 0 7 18z"/>',
    rain: '<path d="M7 15h10a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.8A3.7 3.7 0 0 0 7 15zM9 18l-1 3M13 18l-1 3M17 18l-1 3"/>',
    storm: '<path d="M7 14h10a4.5 4.5 0 0 0 0-9 6 6 0 0 0-11.5 1.8A3.7 3.7 0 0 0 7 14zM13 15l-3 4h3l-2 3"/>'
  };
  function icon(c) { return '<svg viewBox="0 0 24 24" aria-hidden="true">' + ICON[kind(c)] + '</svg>'; }
  function hr12(iso) { var h = +iso.slice(11, 13); return (h % 12 || 12) + (h < 12 ? ' AM' : ' PM'); }
  function clock(iso) { var h = +iso.slice(11, 13), m = iso.slice(14, 16); return (h % 12 || 12) + ':' + m + (h < 12 ? ' AM' : ' PM'); }
  var DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function url(p) {
    return 'https://api.open-meteo.com/v1/forecast?latitude=' + p.lat + '&longitude=' + p.lon +
      '&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,precipitation,is_day' +
      '&hourly=temperature_2m,precipitation_probability,weather_code' +
      '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,uv_index_max' +
      '&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York&forecast_days=7';
  }
  function load(i) {
    var m = mem[i] || store('slwx' + i);
    if (m && Date.now() - m.at < TTL) { mem[i] = m; return Promise.resolve(m.data); }
    return fetch(url(P[i])).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (data) {
      mem[i] = { at: Date.now(), data: data }; store('slwx' + i, mem[i]); return data;
    });
  }

  function suggest(c) {
    var t = c.temperature_2m, wind = c.wind_speed_10m, code = c.weather_code, wet = code >= 51, day = c.is_day, out = [];
    function add(href, title, why) { out.push({ href: href, title: title, why: why }); }
    if (code >= 95) add('/things-to-do/museums', 'Head indoors', 'Thunderstorms nearby. Museums and the aquarium are the smart call.');
    if (wet) { add('/things-to-do/museums', 'Museums and history', 'A wet day is a good day for the Battleship, the railroad museum and galleries.'); add('/shore-picks', 'A long lunch', 'Rain passes faster over good food. See our Shore Picks.'); }
    if (!wet && day && t >= 74) add('/things-to-do/beach-chairs', 'Beach day', Math.round(t) + '°F and dry. Chairs and umbrellas, delivered.');
    if (!wet && day && wind < 10 && t >= 62) add('/things-to-do/paddleboard', 'Paddleboarding', 'Light ' + Math.round(wind) + ' mph wind means flat, easy water.');
    if (!wet && day && wind >= 7 && wind <= 18 && t >= 58) add('/things-to-do/sailboat-rides', 'A sailboat ride', 'A steady ' + Math.round(wind) + ' mph breeze fills the sails.');
    if (!wet && day && t >= 48 && t <= 88) add('/things-to-do/bike-tours', 'Bike or walking tour', Math.round(t) + '°F and dry is ideal for exploring downtown.');
    if (!wet && day && wind < 13 && t >= 52) add('/things-to-do/kayak-tours', 'Kayak the marsh', 'Calm enough for the creeks and Masonboro.');
    if (!wet && !day) add('/things-to-do/ghost-tours', 'Ghost walk tonight', 'A dry evening downtown is made for a ghost tour.');
    if (!wet && t < 50) add('/shore-picks', 'Cozy up downtown', 'Chilly out. Coffee, oysters and a warm table are close by.');
    add('/events', 'See what is on', 'Concerts, markets and festivals happening this week.');
    var seen = {}; return out.filter(function (o) { if (seen[o.title]) return false; seen[o.title] = 1; return true; }).slice(0, 4);
  }

  function paint(i, x) {
    var c = x.current, dly = x.daily, h = x.hourly;
    var T = $('wxT'), C = $('wxC'); T.classList.remove('sk'); C.classList.remove('sk');
    T.innerHTML = Math.round(c.temperature_2m) + '&deg;';
    C.textContent = label(c.weather_code) + ' in ' + P[i].n;
    $('wxF').textContent = 'Feels like ' + Math.round(c.apparent_temperature) + '°F. High ' + Math.round(dly.temperature_2m_max[0]) + '°, low ' + Math.round(dly.temperature_2m_min[0]) + '°.';
    var stats = [
      ['Wind', Math.round(c.wind_speed_10m) + ' mph ' + compass(c.wind_direction_10m)],
      ['Gusts', Math.round(c.wind_gusts_10m) + ' mph'],
      ['Humidity', Math.round(c.relative_humidity_2m) + '%'],
      ['Rain chance', (dly.precipitation_probability_max[0] == null ? '--' : dly.precipitation_probability_max[0]) + '%'],
      ['UV index', dly.uv_index_max[0] == null ? '--' : Math.round(dly.uv_index_max[0])],
      ['Sun', clock(dly.sunrise[0]).replace(' AM', '') + ' / ' + clock(dly.sunset[0]).replace(' PM', '')]
    ];
    $('wxStats').innerHTML = stats.map(function (s) { return '<div class="stat"><small>' + s[0] + '</small><b>' + esc(s[1]) + '</b></div>'; }).join('');
    var sky = c.weather_code >= 51 ? 'rain' : !c.is_day ? 'night' : c.weather_code <= 2 ? 'clear' : 'day';
    $('wxHero').setAttribute('data-sky', sky);
    var start = 0, nowKey = c.time.slice(0, 13);
    for (var k = 0; k < h.time.length; k++) { if (h.time[k].slice(0, 13) >= nowKey) { start = k; break; } }
    var hh = '';
    for (var a = start; a < Math.min(start + 24, h.time.length); a++) {
      hh += '<div class="hr"><small>' + (a === start ? 'Now' : hr12(h.time[a])) + '</small>' + icon(h.weather_code[a]) + '<b>' + Math.round(h.temperature_2m[a]) + '&deg;</b><i>' + (h.precipitation_probability[a] == null ? '' : h.precipitation_probability[a] + '%') + '</i></div>';
    }
    $('wxHours').innerHTML = hh;
    $('wxDays').innerHTML = dly.time.map(function (day, n) {
      var dt = new Date(day + 'T12:00:00');
      return '<div class="day"><span class="n">' + (n === 0 ? 'Today' : DOW[dt.getDay()]) + '</span>' + icon(dly.weather_code[n]) + '<span class="d">' + label(dly.weather_code[n]) + ', ' + (dly.precipitation_probability_max[n] == null ? 0 : dly.precipitation_probability_max[n]) + '% rain</span><span class="hl">' + Math.round(dly.temperature_2m_max[n]) + '&deg; <span>' + Math.round(dly.temperature_2m_min[n]) + '&deg;</span></span></div>';
    }).join('');
    $('wxSug').innerHTML = suggest(c).map(function (s) { return '<a href="' + s.href + '" data-sug="' + esc(s.title) + '"><b>' + esc(s.title) + '</b><span>' + esc(s.why) + '</span><i>See options</i></a>'; }).join('');
    var u = $('wxUpd'); if (u && !u.querySelector('time')) u.insertAdjacentHTML('afterbegin', '<time></time> ');
    if (u) u.querySelector('time').textContent = 'Updated ' + clock(c.time) + '.';
  }
  function fail() {
    var C = $('wxC'); C.classList.remove('sk'); $('wxT').classList.remove('sk'); $('wxT').innerHTML = '--&deg;';
    C.textContent = 'Live weather is not loading right now';
    $('wxF').innerHTML = 'Try again in a moment, or see the <a href="https://www.weather.gov/ilm/" target="_blank" rel="noopener" style="color:inherit">National Weather Service</a>.';
    $('wxStats').innerHTML = '';
  }
  function show(i) {
    cur = i;
    d.querySelectorAll('#wxTabs button').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-i') === i ? 'true' : 'false'); });
    var stale = mem[i] || store('slwx' + i); if (stale && stale.data) { try { paint(i, stale.data); } catch (e) {} }
    load(i).then(function (x) { if (cur === i) paint(i, x); }).catch(function () { if (cur === i && !(stale && stale.data)) fail(); });
  }
  function init() {
    if (!$('wxHero')) return;
    $('wxTabs').addEventListener('click', function (e) { var b = e.target.closest && e.target.closest('button'); if (b) { show(+b.getAttribute('data-i')); track('weather_location', { place: P[+b.getAttribute('data-i')].n }); } });
    $('wxSug').addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('a'); if (a) track('weather_suggestion_click', { pick: a.getAttribute('data-sug') }); });
    show(0);
    setInterval(function () { if (!d.hidden) { delete mem[cur]; try { sessionStorage.removeItem('slwx' + cur); } catch (e) {} show(cur); } }, TTL);
    // warm the other locations when idle so tab switches feel instant
    (w.requestIdleCallback || function (f) { setTimeout(f, 2500); })(function () { [1, 2, 3].forEach(function (i) { load(i).catch(function () {}); }); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
