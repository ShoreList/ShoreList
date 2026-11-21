/* ShoreList hero photo plates: four styled beach scenes (dawn, midday, golden hour, night),
   one shown at a time and chosen by the real sun at Wilmington. Slow drift and pointer parallax; click the water for ripples.
   If the photos fail to load, the live shader scene underneath stays visible. */
(function () {
  'use strict';
  var host = document.querySelector('[data-scene]');
  if (!host) return;
  var BASE = 'https://cdn.shopify.com/s/files/1/0686/5213/8580/files/shorelist-wb4-', V = '';
  var NAMES = ['dawn', 'midday', 'golden', 'night'], ALT = ['People walking a beach by a fishing pier at sunrise', 'Families enjoying a beach by a fishing pier at midday', 'People on a beach by a fishing pier at golden hour', 'Friends on a moonlit beach by a fishing pier'];
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var sun = window.ShoreSun;
  function nowPhase() { return sun ? Math.round(sun.now()) % 4 : 1; } // snap to one photo: blending two different photos ghosts the scene
  var cur = nowPhase(), target = cur, auto = true, loaded = 0, raf = 0;

  var wrap = document.createElement('div'); wrap.className = 'plates'; wrap.setAttribute('aria-hidden', 'true');
  var imgs = NAMES.map(function (n, i) {
    var im = new Image(); im.alt = ''; im.decoding = 'async'; im.draggable = false;
    im.sizes = '100vw'; im.setAttribute('data-p', i); wrap.appendChild(im); return im;
  });
  host.insertBefore(wrap, host.firstChild);
  function src(i) { var b = BASE + NAMES[i]; return { s: b + '_1000x.webp' + V + ' 1000w, ' + b + '_1920x.webp' + V + ' 1920w, ' + b + '_2752x.webp' + V + ' 2752w', f: b + '_1920x.webp' + V }; }
  function load(i, high) { var im = imgs[i]; if (im.src || im.getAttribute('data-l')) return; im.setAttribute('data-l', 1); var u = src(i); if (high) im.fetchPriority = 'high'; im.srcset = u.s; im.src = u.f; im.addEventListener('load', function () { loaded++; im.classList.add('ok'); paint(); if (loaded >= 1) host.classList.add('plates-on'); }); im.addEventListener('error', function () { im.removeAttribute('src'); im.removeAttribute('srcset'); }); }
  function weights(p) { return NAMES.map(function (_, i) { var d = Math.abs(p - i); d = Math.min(d, 4 - d); var w = Math.max(0, 1 - d); return w * w * (3 - 2 * w); }); }
  function paint() {
    var w = weights(cur), sum = 0; w.forEach(function (x) { sum += x; });
    imgs.forEach(function (im, i) { var o = sum ? w[i] / sum : 0; if (!im.classList.contains('ok')) o = 0; im.style.opacity = o.toFixed(3); im.style.visibility = o < 0.004 ? 'hidden' : 'visible'; });
  }
  function ensureNeighbors() { var a = Math.round(cur) % 4; load(a, true); setTimeout(function () { load((a + 1) % 4); load((a + 3) % 4); }, 600); setTimeout(function () { for (var i = 0; i < 4; i++) load(i); }, 3500); }
  function frame() {
    raf = 0; var d = target - cur; if (d > 2) d -= 4; if (d < -2) d += 4;
    if (Math.abs(d) > 0.002) { cur = (cur + d * 0.05 + 4) % 4; paint(); raf = requestAnimationFrame(frame); } else { cur = target; paint(); }
  }
  function go(t) { target = ((t % 4) + 4) % 4; ensureNeighbors(); if (reduce) { cur = target; paint(); } else if (!raf) raf = requestAnimationFrame(frame); }
  setInterval(function () { if (auto && sun) go(nowPhase()); }, 20000);

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
