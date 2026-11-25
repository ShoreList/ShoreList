/* ShoreList living coast: gulls that glide across the page and veer away from the cursor,
   rolling surf above every footer, and now and then a fin that dives when tapped.
   Decorative only: never blocks clicks (except the fin itself), pauses in background tabs,
   and is switched off entirely for visitors who ask for reduced motion. */
(function () {
  'use strict';
  if (window.__slAmbient) return;
  window.__slAmbient = true;
  var d = document, w = window;
  if (/^\/(legal|dashboard|success|lookbook-kit|offline|404)/.test(location.pathname)) return;
  var reduce = w.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  function rnd(a, b) { return a + Math.random() * (b - a); }

  var css = '' +
    '.sl-sky{position:fixed;inset:0;pointer-events:none;z-index:45;overflow:hidden;contain:strict}' +
    '.sl-gull{position:absolute;left:0;top:0;width:44px;height:22px;will-change:transform;opacity:.82;filter:drop-shadow(0 2px 2px rgba(0,0,0,.28))}' +
    '.sl-gull svg{display:block;width:100%;height:100%;overflow:visible}' +
    '.sl-gull .wl,.sl-gull .wr{transform-box:fill-box;animation:slFlapL .62s ease-in-out infinite alternate}' +
    '.sl-gull .wl{transform-origin:100% 80%}.sl-gull .wr{transform-origin:0% 80%;animation-name:slFlapR}' +
    '.sl-gull.glide .wl,.sl-gull.glide .wr{animation-duration:2.4s}' +
    '@keyframes slFlapL{from{transform:rotate(16deg)}to{transform:rotate(-24deg)}}' +
    '@keyframes slFlapR{from{transform:rotate(-16deg)}to{transform:rotate(24deg)}}' +
    '.sl-surf{position:relative;height:74px;margin-bottom:-1px;overflow:hidden;pointer-events:none;line-height:0}' +
    '.sl-surf svg{position:absolute;left:0;bottom:0;width:200%;height:100%}' +
    '.sl-surf .s1{animation:slRoll 19s linear infinite;opacity:.35}' +
    '.sl-surf .s2{animation:slRoll 13s linear infinite reverse;opacity:.6}' +
    '.sl-surf .s3{animation:slRoll 9s linear infinite}' +
    '.sl-surf .foam{animation:slRoll 9s linear infinite;fill:none;stroke:#F4F1EA;stroke-width:1.6;opacity:.5}' +
    '@keyframes slRoll{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '.sl-fin{position:absolute;bottom:14px;left:0;width:34px;height:30px;padding:8px 10px 0;box-sizing:content-box;border:0;background:none;cursor:pointer;pointer-events:auto;will-change:transform;opacity:0;transition:opacity .6s}' +
    '.sl-fin svg{display:block;width:34px;height:30px;transition:transform .55s cubic-bezier(.5,0,.8,.4)}' +
    '.sl-fin.on{opacity:.95}.sl-fin.dive svg{transform:translateY(34px) rotate(-18deg)}' +
    '.sl-fin:focus-visible{outline:2px solid #F4F1EA;outline-offset:2px;border-radius:8px}' +
    '.sl-ring{position:absolute;bottom:10px;width:10px;height:5px;border:1.5px solid #F4F1EA;border-radius:50%;opacity:.8;pointer-events:none;animation:slRing .9s ease-out forwards}' +
    '@keyframes slRing{to{transform:scale(7,5);opacity:0}}' +
    '@media (prefers-reduced-motion:reduce){.sl-surf svg{animation:none!important}}';
  var st = d.createElement('style'); st.textContent = css; d.head.appendChild(st);

  /* ---------- surf above the footer ---------- */
  var surf = null, finBtn = null;
  function wavePath(amp, base, n) {
    // one seamless period drawn twice across a 2400-wide box (the svg is 200% wide)
    var seg = 2400 / (n * 4), p = 'M0 ' + base;
    for (var i = 0; i < n * 4; i++) { p += ' q' + (seg / 2) + ' ' + (i % 2 ? amp : -amp) + ' ' + seg + ' 0'; }
    return p;
  }
  function buildSurf() {
    var foot = d.querySelector('body > footer') || d.querySelector('footer');
    if (!foot || d.querySelector('.sl-surf')) return;
    var col = '#0E1F33';
    try { var c = getComputedStyle(foot).backgroundColor; if (c && !/rgba\(0, 0, 0, 0\)|transparent/.test(c)) col = c; } catch (e) {}
    surf = d.createElement('div'); surf.className = 'sl-surf'; surf.setAttribute('aria-hidden', 'true');
    var close = ' V80 H0 Z';
    surf.innerHTML = '<svg viewBox="0 0 2400 80" preserveAspectRatio="none">' +
      '<path class="s1" fill="' + col + '" d="' + wavePath(16, 30, 3) + close + '"/>' +
      '<path class="s2" fill="' + col + '" d="' + wavePath(11, 44, 4) + close + '"/>' +
      '<path class="s3" fill="' + col + '" d="' + wavePath(8, 58, 5) + close + '"/>' +
      '<path class="foam" d="' + wavePath(8, 58, 5) + '"/></svg>';
    foot.parentNode.insertBefore(surf, foot);
    var prev = surf.previousElementSibling;
    if (prev && prev.classList && prev.classList.contains('sl-lead')) surf.style.background = '#0E1F33';
    if (reduce) return;
    finBtn = d.createElement('button'); finBtn.type = 'button'; finBtn.className = 'sl-fin';
    finBtn.setAttribute('aria-label', 'A fin in the surf. Tap to send it under.'); finBtn.tabIndex = -1;
    finBtn.innerHTML = '<svg viewBox="0 0 34 30"><path fill="' + col + '" stroke="#F4F1EA" stroke-opacity=".35" stroke-width="1" d="M2 30 C8 22 12 8 22 1 C21 12 25 22 33 30 Z"/></svg>';
    surf.appendChild(finBtn);
    finBtn.addEventListener('click', function () {
      if (finBtn.classList.contains('dive')) return;
      finBtn.classList.add('dive'); track('fin_tap', { page_path: location.pathname });
      var r = d.createElement('span'); r.className = 'sl-ring'; r.style.left = (fin.x + 22) + 'px'; surf.appendChild(r);
      setTimeout(function () { if (r.parentNode) r.parentNode.removeChild(r); }, 950);
      setTimeout(function () { fin.active = false; finBtn.classList.remove('on'); }, 600);
    });
  }

  /* ---------- gulls ---------- */
  var sky = null, gulls = [], mouse = { x: -999, y: -999 }, last = 0, running = false, nextFlock = 0;
  var fin = { active: false, x: 0, dir: 1, speed: 0, next: 0 }, surfSeen = false;
  var GULL = '<svg viewBox="0 0 44 22"><path class="wl" fill="#F4F1EA" d="M22 13 C17 6 10 3 1 6 C8 6 13 9 19 16 Z"/><path class="wr" fill="#F4F1EA" d="M22 13 C27 6 34 3 43 6 C36 6 31 9 25 16 Z"/><path fill="#F4F1EA" d="M18 14 q4 -3 8 0 q-4 4 -8 0 Z"/></svg>';
  function spawnFlock(now) {
    if (!sky) return;
    var n = Math.random() < 0.45 ? 1 : (Math.random() < 0.7 ? 2 : 3);
    var dir = Math.random() < 0.5 ? 1 : -1, vw = innerWidth, vh = innerHeight;
    var y0 = rnd(vh * 0.1, vh * 0.34), sp = rnd(70, 115), sc = rnd(0.7, 1.15) * (vw < 600 ? 0.8 : 1);
    for (var i = 0; i < n; i++) {
      var el = d.createElement('div'); el.className = 'sl-gull' + (Math.random() < 0.4 ? ' glide' : ''); el.innerHTML = GULL; sky.appendChild(el);
      gulls.push({ el: el, x: dir > 0 ? -60 - i * rnd(46, 70) : vw + 60 + i * rnd(46, 70), y: y0 + i * rnd(-26, 26), vy: 0, dir: dir, sp: sp * rnd(0.94, 1.06), sc: sc * rnd(0.85, 1.05), ph: rnd(0, 6.28), boost: 0 });
    }
    nextFlock = now + rnd(24000, 52000);
  }
  function frame(now) {
    if (!running) return;
    var dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
    if (now > nextFlock && gulls.length === 0) spawnFlock(now);
    for (var i = gulls.length - 1; i >= 0; i--) {
      var g = gulls[i];
      var dx = g.x + 22 - mouse.x, dy = g.y + 11 - mouse.y, dist2 = dx * dx + dy * dy;
      if (dist2 < 150 * 150) { g.boost = Math.min(2.2, g.boost + dt * 5); g.vy += (dy < 0 ? -1 : 1) * 260 * dt - 120 * dt; }
      g.boost = Math.max(0, g.boost - dt * 0.8);
      g.vy *= 0.94;
      g.x += g.dir * g.sp * (1 + g.boost) * dt;
      g.y += g.vy * dt + Math.sin(now / 900 + g.ph) * 6 * dt;
      var tilt = Math.max(-18, Math.min(18, g.vy * 0.08)) * g.dir;
      g.el.style.transform = 'translate3d(' + g.x.toFixed(1) + 'px,' + g.y.toFixed(1) + 'px,0) scale(' + (g.dir * g.sc).toFixed(2) + ',' + g.sc.toFixed(2) + ') rotate(' + tilt.toFixed(1) + 'deg)';
      if (g.x < -260 || g.x > innerWidth + 260 || g.y < -120) { sky.removeChild(g.el); gulls.splice(i, 1); }
    }
    if (finBtn && surfSeen) {
      if (!fin.active && now > fin.next) {
        fin.active = true; fin.dir = Math.random() < 0.5 ? 1 : -1; fin.speed = rnd(26, 44);
        fin.x = fin.dir > 0 ? -60 : surf.clientWidth + 10; fin.next = now + rnd(38000, 80000);
        finBtn.classList.remove('dive'); finBtn.classList.add('on');
      }
      if (fin.active) {
        if (!finBtn.classList.contains('dive')) fin.x += fin.dir * fin.speed * dt;
        finBtn.style.transform = 'translate3d(' + fin.x.toFixed(1) + 'px,' + (Math.sin(now / 520) * 2).toFixed(1) + 'px,0) scaleX(' + fin.dir + ')';
        if (fin.x < -80 || fin.x > surf.clientWidth + 40) { fin.active = false; finBtn.classList.remove('on'); }
      }
    }
    requestAnimationFrame(frame);
  }
  function start() { if (running || reduce) return; running = true; last = performance.now(); requestAnimationFrame(frame); }
  function stop() { running = false; }

  function init() {
    buildSurf();
    if (reduce) return;
    sky = d.createElement('div'); sky.className = 'sl-sky'; sky.setAttribute('aria-hidden', 'true'); d.body.appendChild(sky);
    nextFlock = performance.now() + rnd(3500, 7000);
    fin.next = performance.now() + rnd(6000, 14000);
    addEventListener('pointermove', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    addEventListener('pointerdown', function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    d.addEventListener('visibilitychange', function () { if (d.hidden) stop(); else start(); });
    if (surf && 'IntersectionObserver' in w) {
      new IntersectionObserver(function (es) { surfSeen = es[0].isIntersecting; }, { threshold: 0.2 }).observe(surf);
    } else surfSeen = true;
    if (!d.hidden) start();
  }
  // Decorative: start once the page has loaded and the browser is idle, so it never competes with first paint or input.
  function later() { (w.requestIdleCallback || function (f) { return setTimeout(f, 1500); })(init, { timeout: 4000 }); }
  if (d.readyState === 'complete') later(); else w.addEventListener('load', later, { once: true });
})();
