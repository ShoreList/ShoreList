/* ShoreList "Best bets for today": ranks things to do from live Wrightsville Beach conditions.
   Simple transparent rules, no AI claims. Needs window.ShoreWX (beachwx.js). */
(function () {
  'use strict';
  var d = document, w = window, mount = d.getElementById('today-plan');
  if (!mount) return;
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  var CSS = '#today-plan{padding:76px 20px;background:#0E1F33;color:#F4F1EA;position:relative;overflow:hidden}#today-plan::before{content:"";position:absolute;inset:0;background:radial-gradient(900px 420px at 85% -10%,rgba(159,195,184,.22),transparent 60%),radial-gradient(700px 380px at 0% 110%,rgba(181,54,47,.2),transparent 60%);pointer-events:none}' +
    '#today-plan .tp-in{max-width:1180px;margin:0 auto;position:relative}#today-plan .tp-eye{display:inline-flex;gap:10px;align-items:center;font-size:.74rem;font-weight:500;letter-spacing:.22em;text-transform:uppercase;color:#9FC3B8;margin-bottom:12px}#today-plan .tp-eye i{width:7px;height:7px;border-radius:50%;background:#9FC3B8;animation:tpP 2.2s infinite}@keyframes tpP{70%{box-shadow:0 0 0 9px rgba(159,195,184,0)}100%{box-shadow:0 0 0 0 rgba(159,195,184,0)}}' +
    '#today-plan h2{font-family:"Libre Caslon Display",serif;font-size:clamp(1.9rem,4vw,3rem);font-weight:500;margin:0 0 10px;line-height:1.05;color:#F4F1EA}#today-plan h2 em{color:#D9C7A3}#today-plan .tp-now{color:rgba(244,241,234,.82);margin:0 0 28px;font-size:1.02rem;line-height:1.6;max-width:720px}' +
    '#today-plan .tp-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px}#today-plan .tp-card{display:flex;flex-direction:column;gap:10px;padding:22px;border-radius:22px;background:rgba(244,241,234,.07);border:1px solid rgba(244,241,234,.18);backdrop-filter:blur(12px);text-decoration:none;color:inherit;transition:transform .3s cubic-bezier(.2,.7,.2,1),border-color .3s,background .3s;opacity:0;transform:translateY(14px);animation:tpIn .7s forwards}' +
    '@keyframes tpIn{to{opacity:1;transform:none}}#today-plan .tp-card:hover{transform:translateY(-5px);border-color:rgba(217,199,163,.7);background:rgba(244,241,234,.12)}' +
    '#today-plan .tp-top{display:flex;justify-content:space-between;align-items:center}#today-plan .tp-rank{font-family:"Libre Caslon Display",serif;font-size:2rem;font-weight:500;color:#D9C7A3;line-height:1}#today-plan .tp-fit{font-size:.74rem;font-weight:500;letter-spacing:.12em;text-transform:uppercase;padding:5px 11px;border-radius:100px;background:rgba(159,195,184,.18);color:#9FC3B8}' +
    '#today-plan .tp-card h3{font-family:"Libre Caslon Display",serif;font-size:1.35rem;font-weight:500;margin:0;color:#F4F1EA}#today-plan .tp-card p{margin:0;color:rgba(244,241,234,.8);font-size:.94rem;line-height:1.55}#today-plan .tp-go{margin-top:auto;font-weight:500;font-size:.9rem;color:#D9C7A3}' +
    '#today-plan .tp-note{margin:22px 0 0;font-size:.78rem;color:rgba(244,241,234,.66);line-height:1.55}@media(prefers-reduced-motion:reduce){#today-plan .tp-card,#today-plan .tp-eye i{animation:none;opacity:1;transform:none}}';
  var RULES = [
    ['surf-lessons', 'Surf lessons', function (c) { return c.waves >= 1.2 && c.waves <= 5 && c.temp >= 60 && c.wind < 20 && !c.rain ? 60 + Math.min(30, c.waves * 8) : 0; }, function (c) { return c.waves.toFixed(1) + ' ft surf and manageable wind'; }],
    ['paddleboard', 'Paddleboarding', function (c) { return c.wind < 10 && c.temp >= 62 && c.waves < 2.5 && !c.rain ? 88 - c.wind * 2 : 0; }, function (c) { return 'light ' + Math.round(c.wind) + ' mph wind, flat water'; }],
    ['kayak-tours', 'Kayak tours', function (c) { return c.wind < 13 && c.temp >= 52 && c.temp <= 92 && !c.rain ? 78 - c.wind : 0; }, function (c) { return 'calm enough for the marsh and creeks'; }],
    ['sailboat-rides', 'Sailboat rides', function (c) { return c.wind >= 7 && c.wind <= 18 && c.temp >= 58 && !c.rain ? 84 - Math.abs(c.wind - 12) * 2 : 0; }, function (c) { return 'a breeze near ' + Math.round(c.wind) + ' mph fills the sails'; }],
    ['fishing-charters', 'Fishing charters', function (c) { return c.wind < 17 && c.waves < 4 && !c.rain ? 72 - c.wind : 0; }, function (c) { return 'seas ' + c.waves.toFixed(1) + ' ft, workable for the boats'; }],
    ['bike-tours', 'Bike tours', function (c) { return c.temp >= 48 && c.temp <= 88 && c.wind < 20 && !c.rain ? 76 : 0; }, function (c) { return Math.round(c.temp) + '°F and dry, good riding weather'; }],
    ['ebike-rentals', 'E-bike rentals', function (c) { return c.temp >= 45 && c.temp <= 90 && c.wind < 22 && !c.rain ? 68 : 0; }, function (c) { return 'easy miles in ' + Math.round(c.temp) + '°F'; }],
    ['beach-chairs', 'Beach chairs and umbrellas', function (c) { return c.temp >= 74 && !c.rain && c.code <= 3 ? 82 : 0; }, function (c) { return Math.round(c.temp) + '°F and mostly clear, a true beach day'; }],
    ['beach-photography', 'Beach photography', function (c) { return c.golden ? 90 : 0; }, function (c) { return 'golden hour is close'; }],
    ['river-cruises', 'River cruises', function (c) { return !c.rain && c.wind < 22 ? 66 : 0; }, function (c) { return 'smooth riverfront views'; }],
    ['walking-tours', 'Walking tours', function (c) { return c.temp >= 45 && c.temp <= 86 && !c.rain ? 70 : 0; }, function (c) { return 'comfortable for a stroll through downtown'; }],
    ['ghost-tours', 'Ghost tours', function (c) { return c.evening ? 86 : c.code >= 45 && c.code < 50 ? 80 : 0; }, function (c) { return c.evening ? 'evening is when downtown comes alive' : 'foggy and atmospheric'; }],
    ['museums', 'Museums', function (c) { return c.rain || c.temp < 50 || c.wind >= 22 ? 90 : 40; }, function (c) { return c.rain ? 'rain is falling, stay dry inside' : c.temp < 50 ? 'a chilly day suits indoor history' : c.wind >= 22 ? 'too windy outside for comfort' : 'a good indoor option any day'; }],
    ['wellness', 'Wellness and spa', function (c) { return c.rain || c.temp < 50 ? 82 : 35; }, function (c) { return c.rain || c.temp < 50 ? 'a cozy reset away from the weather' : 'a calm option any day'; }],
    ['nature-walks', 'Nature walks', function (c) { return c.temp >= 45 && c.temp <= 86 && !c.rain ? 69 : 0; }, function (c) { return 'dry trails and mild air'; }],
    ['wildlife-tours', 'Wildlife tours', function (c) { return c.temp >= 48 && c.temp <= 88 && !c.rain && c.wind < 18 ? 67 : 0; }, function (c) { return 'calm conditions for spotting wildlife'; }]
  ];
  function minutes(iso) { var m = /T(\d\d):(\d\d)/.exec(iso || ''); return m ? +m[1] * 60 + +m[2] : null; }
  function go() {
    if (!w.ShoreWX) return;
    w.ShoreWX.get(0).then(function (x) {
      var now = new Date(), nyNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' })), mins = nyNow.getHours() * 60 + nyNow.getMinutes();
      var ss = minutes(x.sunset), sr = minutes(x.sunrise);
      var c = { temp: x.temp, wind: x.wind || 0, waves: x.waveFt || 0, code: x.code == null ? 0 : x.code, rain: x.code >= 51, evening: mins >= 16 * 60 && mins <= 22 * 60,
        golden: (ss != null && Math.abs(mins - ss) <= 90 && mins <= ss + 30) || (sr != null && Math.abs(mins - sr) <= 60) };
      var picks = RULES.map(function (r) { return { slug: r[0], name: r[1], s: r[2](c), why: r[3](c) }; }).filter(function (p) { return p.s > 0; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 4);
      if (picks.length < 2) return;
      var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
      var weather = Math.round(x.temp) + '°F, ' + (w.ShoreWX.summary(x).split(': ')[1] || '').split(',')[0].replace(/^\d+F\s*/, '').toLowerCase();
      mount.innerHTML = '<div class="tp-in"><div class="tp-eye"><i></i>Live plan</div><h2>Best bets for <em>right now</em></h2><p class="tp-now">At Wrightsville Beach it is ' + esc(weather) + ', wind ' + Math.round(c.wind) + ' mph' + (x.waveFt != null ? ', surf ' + x.waveFt.toFixed(1) + ' ft' : '') + (x.waterF != null ? ', water ' + Math.round(x.waterF) + '°F' : '') + '. Here is what fits those conditions.</p><div class="tp-grid">' +
        picks.map(function (p, i) { return '<a class="tp-card" style="animation-delay:' + (i * 90) + 'ms" href="/things-to-do/' + p.slug + '" data-slug="' + p.slug + '"><div class="tp-top"><span class="tp-rank">' + (i + 1) + '</span><span class="tp-fit">' + (i === 0 ? 'Top fit' : 'Good fit') + '</span></div><h3>' + esc(p.name) + '</h3><p>' + esc(p.why.charAt(0).toUpperCase() + p.why.slice(1)) + '.</p><span class="tp-go">See options &rarr;</span></a>'; }).join('') +
        '</div><p class="tp-note">Picks are ranked by simple rules from live weather, wind and wave data. They are suggestions, not safety advice. Always follow posted beach flags and operator guidance.</p></div>';
      mount.hidden = false;
      mount.addEventListener('click', function (e) { var a = e.target.closest && e.target.closest('.tp-card'); if (a) track('today_plan_click', { slug: a.getAttribute('data-slug') }); });
    }).catch(function () {});
  }
  if (w.ShoreWX) go(); else w.addEventListener('load', go);
})();
