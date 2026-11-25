/* ShoreList home page behaviour below the hero: verified events list, experiences carousel,
   planner prompt demo and the live notes on the "Plan your visit" tiles.
   Everything here is progressive: the page reads fine if this file never loads. */
(function () {
  'use strict';
  var d = document, w = window;
  var reduce = w.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }

  /* ---------- dates, always in Wilmington time ---------- */
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function todayNY() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
  }
  function utc(s) { var p = s.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function plus(s, n) { return new Date(utc(s).getTime() + n * 864e5).toISOString().slice(0, 10); }
  function short(s) { var x = utc(s); return MON[x.getUTCMonth()] + ' ' + x.getUTCDate(); }

  /* ---------- what's on: next six events from the verified feed ---------- */
  function loadEvents(list) {
    var today = todayNY(), dow = utc(today).getUTCDay();
    var sat = dow === 0 ? today : plus(today, 6 - dow), sun = dow === 0 ? today : plus(sat, 1);
    function fail() {
      list.innerHTML = '<li class="hx-ev-fail">The live list did not load just now. The full, dated calendar is on the <a href="/events">events guide</a>, and <a href="/events/this-weekend">this weekend</a> has its own page.</li>';
    }
    function clock(t) { var m = /^(\d+):(\d\d)\s*([AP])M$/i.exec(t || ''); return m ? ((+m[1] % 12) + (/p/i.test(m[3]) ? 12 : 0)) * 60 + +m[2] : 1440; }
    function label(e) {
      var multi = e.end !== e.start;
      if (e.recurring) return 'Every ' + e.recurring.replace(/s$/, '');
      if (multi && e.start < today) return 'On now, through ' + short(e.end);
      if (multi) return short(e.start) + ' to ' + short(e.end);
      if (e.start === today) return 'Today';
      if (e.start === plus(today, 1)) return 'Tomorrow';
      if (e.start >= sat && e.start <= sun) return 'This weekend';
      return DOW[utc(e.start).getUTCDay()] + ', ' + short(e.start);
    }
    function card(e) {
      var show = utc(e.start < today ? today : e.start);
      var where = e.venue + (e.area && e.venue.indexOf(e.area) < 0 ? ', ' + e.area : '');
      return '<li><a class="hx-ev" href="' + esc(e.url) + '" target="_blank" rel="noopener" data-id="' + esc(e.id) + '">' +
        '<span class="hx-ev-date" aria-hidden="true"><span>' + MON[show.getUTCMonth()] + '</span><b>' + show.getUTCDate() + '</b><span>' + DOW[show.getUTCDay()] + '</span></span>' +
        '<div class="hx-ev-body"><p class="hx-ev-when">' + esc(label(e)) + (e.time ? ' &middot; ' + esc(e.time) : '') + '</p>' +
        '<h3>' + esc(e.title) + '</h3><p class="hx-ev-meta">' + esc(where) + '</p>' +
        '<p class="hx-ev-tag">' + esc(e.cat || 'Event') + ' &middot; organizer site &#8599;</p></div></a></li>';
    }
    fetch('/events-data.json', { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (data) {
      var all = (data.events || []).filter(function (e) { return e && e.title && e.url && /^\d{4}-\d\d-\d\d$/.test(e.start || '') && /^https?:\/\//.test(e.url) && (e.end || (e.end = e.start)) >= today; });
      all.sort(function (x, y) {
        var a = x.start < today ? today : x.start, b = y.start < today ? today : y.start;
        if (a !== b) return a < b ? -1 : 1;
        var mx = x.end !== x.start, my = y.end !== y.start;
        if (mx !== my) return mx ? 1 : -1;
        if (x.start !== y.start) return x.start > y.start ? -1 : 1;
        return clock(x.time) - clock(y.time);
      });
      if (!all.length) { fail(); return; }
      list.innerHTML = all.slice(0, 6).map(card).join('');
      list.removeAttribute('aria-busy');
      var wk = all.filter(function (e) { return e.start <= sun && e.end >= sat; }).length, t = d.querySelector('[data-plan="weekend"]');
      if (t && wk) { t.textContent = wk + (wk === 1 ? ' event listed' : ' events listed') + (dow === 0 ? ' today' : ' this weekend'); t.classList.add('live'); }
    }).catch(fail);
    list.addEventListener('click', function (ev) { var a = ev.target.closest && ev.target.closest('a.hx-ev'); if (a) track('home_event_click', { id: a.getAttribute('data-id') }); });
  }

  var eventList = d.getElementById('hx-events');
  if (eventList && w.fetch) {
    if ('IntersectionObserver' in w) {
      var eventObserver = new IntersectionObserver(function (entries) {
        if (!entries[0].isIntersecting) return;
        eventObserver.disconnect();
        loadEvents(eventList);
      }, { rootMargin: '500px' });
      eventObserver.observe(eventList);
    } else loadEvents(eventList);
  }

  /* ---------- plan your visit: live weather note from the shared conditions feed ---------- */
  (function () {
    var el = d.querySelector('[data-plan="weather"]');
    if (!el) return;
    function go() {
      if (!w.ShoreWX) return;
      w.ShoreWX.get(0).then(function (x) {
        if (x.temp == null) return;
        el.textContent = 'Now ' + Math.round(x.temp) + '°F' + (x.waveFt != null ? ', surf ' + x.waveFt.toFixed(1) + ' ft' : '') + ' at Wrightsville';
        el.classList.add('live');
      }).catch(function () {});
    }
    if (w.ShoreWX) go(); else w.addEventListener('load', go);
  })();

  /* ---------- experiences carousel: arrows, dots, optional slow auto-advance with a pause control ---------- */
  (function () {
    var track_ = d.getElementById('wkTrack'), dotsBox = d.getElementById('wkDots');
    if (!track_ || !dotsBox) return;
    var cards = [].slice.call(track_.children);
    if (!cards.length) return;
    var idx = 0, timer = null, hold = false, playing = !reduce;
    var prev = d.getElementById('wkPrev'), next = d.getElementById('wkNext'), play = d.getElementById('wkPlay');
    var dots = cards.map(function (c, i) {
      var b = d.createElement('button');
      b.type = 'button'; b.className = 'hx-dot';
      b.setAttribute('aria-label', 'Show experience ' + (i + 1) + ' of ' + cards.length);
      b.addEventListener('click', function () { go(i); restart(); });
      dotsBox.appendChild(b); return b;
    });
    function mark() { dots.forEach(function (b, i) { b.setAttribute('aria-current', i === idx ? 'true' : 'false'); }); }
    function go(i) {
      idx = (i + cards.length) % cards.length;
      var x = cards[idx].offsetLeft - track_.offsetLeft;
      if (x > track_.scrollWidth - track_.clientWidth) x = track_.scrollWidth - track_.clientWidth;
      try { track_.scrollTo({ left: x, behavior: reduce ? 'auto' : 'smooth' }); } catch (e) { track_.scrollLeft = x; }
      mark();
    }
    function tick() { if (!hold && !d.hidden) go(idx + 1); }
    function restart() { if (timer) clearInterval(timer); timer = playing ? setInterval(tick, 6000) : null; }
    function setPlay(v) {
      playing = v; restart();
      if (play) { play.setAttribute('aria-pressed', String(!v)); play.setAttribute('aria-label', v ? 'Pause the carousel' : 'Play the carousel'); play.classList.toggle('paused', !v); }
    }
    if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });
    if (play) { if (reduce) play.hidden = true; play.addEventListener('click', function () { setPlay(!playing); }); }
    ['mouseenter', 'touchstart', 'focusin'].forEach(function (e) { track_.addEventListener(e, function () { hold = true; }, { passive: true }); });
    ['mouseleave', 'focusout'].forEach(function (e) { track_.addEventListener(e, function () { hold = false; }); });
    var st = null;
    track_.addEventListener('scroll', function () {
      if (st) clearTimeout(st);
      st = setTimeout(function () {
        var best = 0, bd = Infinity, end = track_.scrollLeft >= track_.scrollWidth - track_.clientWidth - 2;
        cards.forEach(function (c, i) { var q = Math.abs((c.offsetLeft - track_.offsetLeft) - track_.scrollLeft); if (q < bd) { bd = q; best = i; } });
        if (end && idx > best) best = idx;
        idx = best; mark();
      }, 120);
    }, { passive: true });
    mark(); setPlay(playing);
    /* only run the timer while the carousel is on screen */
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { hold = !es[0].isIntersecting; }, { threshold: .25 }).observe(track_);
  })();

  /* ---------- planner prompt demo ---------- */
  (function () {
    var el = d.getElementById('typewriter-text');
    if (!el) return;
    var P = ['Romantic weekend for 2. We love sunsets and the water...', 'Family trip with kids: adventure, nature, and fun...', 'Bachelor party for 6. Max adrenaline. Flexible budget...', 'Solo traveler, one day, show me the real Wilmington...'];
    var txt = d.createElement('span'), cur = d.createElement('span');
    cur.className = 'pc-cursor'; cur.setAttribute('aria-hidden', 'true');
    el.textContent = ''; el.appendChild(txt); el.appendChild(cur);
    if (reduce) { txt.textContent = P[0]; cur.remove(); return; }
    var pi = 0, n = 0, del = false, on = false, t = null;
    function step() {
      var p = P[pi];
      if (!on) { t = null; return; }
      if (!del) { n++; txt.textContent = p.slice(0, n); if (n === p.length) { del = true; t = setTimeout(step, 2200); return; } }
      else { n--; txt.textContent = p.slice(0, n); if (n === 0) { del = false; pi = (pi + 1) % P.length; t = setTimeout(step, 400); return; } }
      t = setTimeout(step, del ? 25 : 50);
    }
    if ('IntersectionObserver' in w) new IntersectionObserver(function (es) { on = es[0].isIntersecting; if (on && !t) step(); }, { threshold: .2 }).observe(el);
    else { on = true; step(); }
  })();
})();
