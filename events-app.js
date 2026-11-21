/* ShoreList events page helpers.
   The dated calendar is the verified feed (events-data.json, written into the page by tools/build-events-pages.mjs
   and enhanced by events-feed.js). This file only does two small jobs:
   1. hides "Seasonal highlights" cards once their last date has passed (data-until, compared in America/New_York);
   2. fills the live conditions bar from open-meteo.
   The older hard-coded month guide that lived here was retired: its dated entries either duplicated the verified
   feed or now live as the Seasonal highlights and Recurring Events sections in events.html. */
(function () {
  'use strict';
  var d = document;
  function nyToday() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
  }

  /* ── SEASONAL HIGHLIGHTS: never show a card whose last date is in the past ── */
  function pruneHighlights() {
    var today = nyToday(), grid = d.querySelector('.sh-grid');
    if (!grid) return;
    var left = 0;
    Array.prototype.forEach.call(grid.querySelectorAll('[data-until]'), function (li) {
      if (li.getAttribute('data-until') < today) li.hidden = true; else left++;
    });
    if (!left) {
      // nothing current: hide the whole highlights block (eyebrow, heading, intro, grid) and keep Recurring Events
      var sec = grid.closest('.sh'), el = sec && sec.querySelector('.sec-in').firstElementChild;
      while (el && !el.classList.contains('rec-eye')) { el.hidden = true; el = el.nextElementSibling; }
      if (el) el.classList.add('first');
    }
  }

  /* ── LIVE WEATHER: open-meteo ── */
  var WC_MAP = { 0: 'Clear', 1: 'Mostly Clear', 2: 'Partly Cloudy', 3: 'Overcast', 45: 'Foggy', 51: 'Light Drizzle', 61: 'Rain', 80: 'Showers', 95: 'Storms' };
  function fetchWeather() {
    var locs = [
      { lat: 34.2257, lon: -77.9447, ti: 'bc-temp-0', ci: 'bc-cond-0' },
      { lat: 34.0345, lon: -77.8976, ti: 'bc-temp-1', ci: 'bc-cond-1' },
      { lat: 34.2097, lon: -77.7964, ti: 'bc-temp-2', ci: 'bc-cond-2' }
    ];
    locs.forEach(function (loc) {
      var t = d.getElementById(loc.ti), c = d.getElementById(loc.ci);
      if (!t && !c) return;
      fetch('https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat + '&longitude=' + loc.lon + '&current=temperature_2m,weather_code&temperature_unit=fahrenheit&forecast_days=1')
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (t) t.innerHTML = Math.round(j.current.temperature_2m) + '&deg;F';
          if (c) {
            var wc = j.current.weather_code, keys = Object.keys(WC_MAP).map(Number).sort(function (a, b) { return a - b; }), closest = keys[0];
            for (var i = 0; i < keys.length; i++) { if (keys[i] <= wc) closest = keys[i]; }
            c.textContent = WC_MAP[closest] || 'Good conditions';
          }
        })
        .catch(function () {
          if (t) t.innerHTML = '--&deg;F';
          if (c) c.textContent = 'Check local forecast';
        });
    });
  }

  function init() { pruneHighlights(); fetchWeather(); }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', init); else init();
})();
