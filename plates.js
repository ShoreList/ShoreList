/* ShoreList hero photo plates: real, openly licensed photos of Wrightsville Beach, Carolina Beach, Kure Beach and Fort Fisher
   (credits on the homepage), grouped by phase of day; one shown at a time, the phase chosen by the real sun at Wilmington, the photo rotating. Slow drift and pointer parallax; click the water for ripples.
   If the photos fail to load, the live shader scene underneath stays visible. */
(function () {
  'use strict';
  var host = document.querySelector('[data-scene]');
  if (!host) return;
  var BASE = 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-hero-';
  // Real, openly licensed photos (credits are listed under the town cards on this page and in /hero-photo-credits.txt).
  // ph = phase index: 0 dawn, 1 midday, 2 golden hour, 3 night (night is darkened in CSS). pos/mpos = focal point on desktop/phone.
  var PICS = [
    { f: 'kure-dawn2', ph: 0, pos: '50% 62%', place: 'Kure Beach', by: 'Staniulis', lic: 'CC0' },
    { f: 'wb-sunrise', ph: 0, pos: '50% 38%', place: 'Wrightsville Beach', by: 'James Willamor', lic: 'CC BY-SA 2.0' },
    { f: 'wb-ocean', ph: 1, pos: '50% 45%', place: 'Wrightsville Beach', by: 'DiscoA340', lic: 'CC BY-SA 4.0' },
    { f: 'wb-banks', ph: 1, pos: '50% 72%', place: 'Banks Channel, Wrightsville Beach', by: 'Gerry Dincher', lic: 'CC BY-SA 2.0' },
    { f: 'ff-oaks', ph: 1, pos: '50% 82%', place: 'Fort Fisher', by: 'Staniulis', lic: 'CC0', f2: 'contrast(1.03) saturate(.82) brightness(1)' },
    { f: 'cb-dunes', ph: 1, pos: '50% 58%', place: 'Carolina Beach', by: 'Mx. Granger', lic: 'CC0' },
    { f: 'wb-golden', ph: 2, pos: '58% 60%', mpos: '62% 60%', place: 'Wrightsville Beach', by: 'NCSU16', lic: 'CC BY-SA 3.0' },
    { f: 'wb-aerial2', ph: 2, pos: '50% 50%', mpos: '40% 50%', place: 'Wrightsville Beach and the sound', by: 'FOCIIS Photography', lic: 'CC BY-SA 4.0' },
    { f: 'wb-twilight', ph: 3, pos: '70% 55%', mpos: '78% 55%', place: 'Wrightsville Beach', by: 'NCSU16', lic: 'CC BY-SA 3.0' }
  ];
  var NAMES = ['dawn', 'midday', 'golden', 'night'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var H0 = window.__slHero; // set early by index.html: the real-sun phase and photo it already preloaded
  function nowPhase() { var s = window.ShoreSun; return s ? Math.round(s.now()) % 4 : (H0 && typeof H0.ph === 'number' ? H0.ph : 1); } // snap to one photo: blending two different photos ghosts the scene
  var cur = nowPhase(), target = cur, auto = true, loaded = 0, raf = 0;

  // which photo of each phase is showing (random start, then rotates)
  var LIST = [[], [], [], []];
  PICS.forEach(function (p, i) { LIST[p.ph].push(i); });
  var pick = LIST.map(function (l) { return l[Math.floor(Math.random() * l.length)]; });
  // index.html decides the first photo early (so it can be preloaded); use the same one so the preloaded file is the one shown.
  if (H0 && PICS[0] && typeof H0.ph === 'number') PICS.forEach(function (p, i) { if (p.f === H0.f && p.ph === H0.ph) pick[H0.ph] = i; });
  var rv = PICS.map(function (p, i) { return pick[p.ph] === i ? 1 : 0; }); // per-photo rotation fade 0..1

  var wrap = document.createElement('div'); wrap.className = 'plates'; wrap.setAttribute('aria-hidden', 'true');
  var imgs = PICS.map(function (p, i) {
    var im = new Image(); im.alt = ''; im.decoding = 'async'; im.draggable = false;
    im.sizes = need(); im.setAttribute('data-p', p.ph); im.setAttribute('data-i', i);
    im.style.setProperty('--pos', p.pos); if (p.mpos) im.style.setProperty('--mpos', p.mpos); if (p.f2) im.style.setProperty('--f', p.f2);
    im.style.animationDelay = '-' + (i * 13 % 70) + 's';
    wrap.appendChild(im); return im;
  });
  host.insertBefore(wrap, host.firstChild);
  var cap = document.createElement('p'); cap.className = 'plate-credit'; host.appendChild(cap);
  function credit() { var p = PICS[pick[Math.round(cur) % 4]]; cap.textContent = 'Photo: ' + p.place + ', ' + p.by + ', ' + p.lic; }
  function src(i) { var b = BASE + PICS[i].f, c = 'x.jpg'; return { s: [1280, 1920, 2560, 3200, 3840].map(function (w) { return b + '_' + w + c + ' ' + w + 'w'; }).join(', '), f: b + '_2560' + c }; }
  // Same rule as the preload in index.html. Phones get one 1280 px photo at any density; larger screens get the width the photo is really drawn at (density capped at 1.5). Uses window size, not a layout read, so it never forces a reflow.
  function need() { if (H0 && H0.sz) return H0.sz; var vw = innerWidth, vh = innerHeight, d = window.devicePixelRatio || 1; return (vw <= 820 ? Math.floor(1280 / d) : Math.ceil(Math.max(vw, vh * 1.5) * 1.08 * Math.min(d, 1.5) / d)) + 'px'; }
  function load(i, high) { var im = imgs[i]; if (im.src || im.getAttribute('data-l')) return; im.setAttribute('data-l', 1); var u = src(i); if (high) im.fetchPriority = 'high'; im.srcset = u.s; im.src = u.f; im.addEventListener('load', function () { loaded++; im.classList.add('ok'); paint(); if (loaded >= 1) host.classList.add('plates-on'); if (loaded === 1) extras(); }); im.addEventListener('error', function () { im.removeAttribute('src'); im.removeAttribute('srcset'); if (!loaded) host.dispatchEvent(new Event('shoreheroerror')); }); }
  function weights(p) { return NAMES.map(function (_, i) { var d = Math.abs(p - i); d = Math.min(d, 4 - d); var w = Math.max(0, 1 - d); return w * w * (3 - 2 * w); }); }
  function paint() {
    var w = weights(cur), sum = 0, v = imgs.map(function (im, i) { var x = PICS[i].ph, o = im.classList.contains('ok') ? w[x] * rv[i] : 0; sum += o; return o; });
    imgs.forEach(function (im, i) { var o = sum ? v[i] / sum : 0; im.style.opacity = o.toFixed(3); im.style.visibility = o < 0.004 ? 'hidden' : 'visible'; });
    credit();
  }
  // Other times of day are fetched only after the first photo has painted. On phones and on slow or Data Saver connections they are fetched only when that time of day is shown (button, or the real sun moving on), so they never compete with the photo the visitor is waiting for.
  var calm = ((H0 && H0.vw) || innerWidth) <= 820 || !!(navigator.connection && (navigator.connection.saveData || /(^|-)(2g|3g)$/.test(navigator.connection.effectiveType || '')));
  var extrasOn = false;
  function extras() { if (calm || extrasOn) return; extrasOn = true; var a = Math.round(target) % 4; setTimeout(function () { load(pick[(a + 1) % 4]); load(pick[(a + 3) % 4]); }, 1500); setTimeout(function () { for (var i = 0; i < 4; i++) load(pick[i]); }, 6000); }
  function ensureNeighbors() { load(pick[Math.round(target) % 4], true); }
  function frame() {
    raf = 0; var d = target - cur; if (d > 2) d -= 4; if (d < -2) d += 4;
    var moving = Math.abs(d) > 0.002;
    if (moving) cur = (cur + d * 0.05 + 4) % 4; else cur = target;
    rv.forEach(function (x, i) { var t = pick[PICS[i].ph] === i ? 1 : 0, dd = t - x; if (Math.abs(dd) > 0.004) { rv[i] = x + Math.sign(dd) * Math.min(Math.abs(dd), reduce ? 1 : 0.025); moving = true; } else rv[i] = t; });
    paint(); if (moving) raf = requestAnimationFrame(frame);
  }
  function go(t) { target = ((t % 4) + 4) % 4; ensureNeighbors(); if (reduce) { cur = target; } if (!raf) raf = requestAnimationFrame(frame); }
  // rotate the photo inside the current phase every ~50 s (only while the page is visible)
  setInterval(function () {
    if (document.hidden) return; var p = Math.round(cur) % 4, l = LIST[p]; if (l.length < 2) return;
    var n = l[(l.indexOf(pick[p]) + 1) % l.length], im = imgs[n]; load(n, true);
    if (im.classList.contains('ok')) { pick[p] = n; if (!raf) raf = requestAnimationFrame(frame); }
  }, 50000);
  setInterval(function () { if (auto && (window.ShoreSun)) go(nowPhase()); }, 20000);

  document.addEventListener('shorescene', function (e) { var n = e.detail; if (n === 'live') { auto = true; go(nowPhase()); } else { var i = NAMES.indexOf(n === 'noon' ? 'midday' : n); if (i > -1) { auto = false; go(i); } } });
  if (!window.ShoreScene) {
    window.ShoreScene = { set: function (n) { document.dispatchEvent(new CustomEvent('shorescene', { detail: n })); }, live: function () { document.dispatchEvent(new CustomEvent('shorescene', { detail: 'live' })); }, auto: function () { return 'live'; }, night: function () { var w = weights(cur); return w[3] + w[0] * 0.2; }, names: ['dawn', 'noon', 'golden', 'night'] };
  }
  paint(); ensureNeighbors();

  // pointer parallax
  if (!reduce && window.matchMedia && matchMedia('(hover: hover)').matches) {
    var tx = 0, ty = 0, px = 0, py = 0, pr = 0;
    host.addEventListener('pointermove', function (e) { var r = host.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width - 0.5) * -14; ty = ((e.clientY - r.top) / r.height - 0.5) * -8; if (!pr) pr = requestAnimationFrame(pp); });
    function pp() { pr = 0; px += (tx - px) * 0.08; py += (ty - py) * 0.08; wrap.style.setProperty('--px', px.toFixed(2) + 'px'); wrap.style.setProperty('--py', py.toFixed(2) + 'px'); if (Math.abs(tx - px) > 0.05 || Math.abs(ty - py) > 0.05) pr = requestAnimationFrame(pp); }
  }
  // water ripples (CSS rings on the sea half)
  host.addEventListener('pointerdown', function (e) {
    if (e.target.closest('a,button,input,select,textarea,.cond,.tod,.paths')) return;
    var r = host.getBoundingClientRect(), y = (e.clientY - r.top) / r.height; if (y < 0.5 || reduce) return;
    var d = document.createElement('i'); d.className = 'ripple'; d.style.left = (e.clientX - r.left) + 'px'; d.style.top = (e.clientY - r.top) + 'px'; host.appendChild(d); setTimeout(function () { d.remove(); }, 1800);
  });
})();
