/* ShoreList guide launcher. Wrighty, Shelby and Captain Cape.
   The character follows the page. Opening the chat keeps that character for the reply.
   Answers come from /.netlify/functions/guide. No third-party script. */
(function () {
  'use strict';
  var KEY = 'sl-guide-character';
  var SOUND = 'sl-guide-sound';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var RULES = [
    { id: 'wrighty', name: 'Wrighty', ask: 'Ask Wrighty', accent: '#0E1F33', greeting: "Hi, I'm Wrighty. I can help you find a gift or a souvenir from the ShoreList shop. Who are you shopping for?", paths: ['/shop', '/gift-guide', '/gift-finder', '/holiday-gift-guide', '/wilmington-nc-gifts', '/wrightsville-beach-souvenirs', '/wrightsville-beach-christmas-ornament', '/prints', '/guides', '/shipping-returns', '/size-guide'] },
    { id: 'cape', name: 'Captain Cape', ask: 'Ask Captain Cape', accent: '#B5362F', greeting: "Cap here. I can help you pick a tour or an outing. What are you in the mood for: a walk through history, something on the water, or something after dark?", paths: ['/things-to-do', '/events', '/planner', '/join', '/waitlist'] },
    { id: 'shelby', name: 'Shelby', ask: 'Ask Shelby', accent: '#8A7348', greeting: "Hi, I'm Shelby. I know Wilmington and the three beaches well. What brings you here: planning a trip, or figuring out today?", paths: ['/', '/downtown', '/wrightsville-beach', '/carolina-beach', '/kure-beach', '/pleasure-island', '/shore-picks', '/where-to-stay', '/plan-your-trip', '/wilmington-weather', '/surf'] }
  ];
  function pathName() { return (location.pathname || '/').replace(/\.html$/, '') || '/'; }
  function byId(id) { for (var i = 0; i < RULES.length; i++) if (RULES[i].id === id) return RULES[i]; return RULES[2]; }
  function fromPath() {
    var path = pathName(), best = RULES[2], bestLen = 0, i, j, rule, hit;
    for (i = 0; i < RULES.length; i++) {
      rule = RULES[i];
      for (j = 0; j < rule.paths.length; j++) {
        hit = rule.paths[j] === '/' ? (path === '/' ? 1 : 0) : (path === rule.paths[j] || path.indexOf(rule.paths[j] + '/') === 0 ? rule.paths[j].length : 0);
        if (hit > bestLen) { best = rule; bestLen = hit; }
      }
    }
    return best;
  }
  function shopPath(path) {
    return path === '/shop' || path.indexOf('/shop/') === 0 || path.indexOf('/gift') === 0 || path.indexOf('/holiday-gift-guide') === 0 || path.indexOf('/prints') === 0 || path.indexOf('/guides') === 0 || path.indexOf('/shipping-returns') === 0 || path.indexOf('/size-guide') === 0 || path.indexOf('/wilmington-nc-gifts') === 0 || path.indexOf('/wrightsville-beach-souvenirs') === 0 || path.indexOf('/wrightsville-beach-christmas-ornament') === 0;
  }
  function teaseFor(path) {
    if (shopPath(path)) return 'Need a gift idea?';
    if (path === '/events' || path.indexOf('/events/') === 0) return 'Want this weekend?';
    if (path.indexOf('/things-to-do') === 0 || path === '/planner' || path === '/join' || path === '/waitlist') return 'A walk, the water, or after dark?';
    return 'Want the tide and the flags?';
  }
  function chipsFor(path) {
    if (shopPath(path)) return ['Under $35', 'For the home', 'Wrightsville'];
    if (path === '/events' || path.indexOf('/events/') === 0) return ['This weekend', 'Free events', 'Downtown'];
    if (path.indexOf('/things-to-do') === 0 || path === '/planner' || path === '/join' || path === '/waitlist') return ['Walking tour', 'On the water', 'After dark'];
    return ['Tides today', 'Which beach', 'Dogs on the beach'];
  }
  function locked() {
    try { return sessionStorage.getItem(KEY); } catch (e) { return ''; }
  }
  function lock(id) {
    try { sessionStorage.setItem(KEY, id); } catch (e) {}
  }
  function soundOn() {
    try { return localStorage.getItem(SOUND) === '1'; } catch (e) { return false; }
  }
  function setSound(on) {
    try { localStorage.setItem(SOUND, on ? '1' : '0'); } catch (e) {}
  }
  function chime() {
    if (!soundOn() || !window.AudioContext) return;
    try {
      var ctx = new AudioContext();
      var o = ctx.createOscillator();
      var g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 392;
      g.gain.value = 0.03;
      o.connect(g); g.connect(ctx.destination);
      o.start();
      o.frequency.setValueAtTime(494, ctx.currentTime + 0.08);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      o.stop(ctx.currentTime + 0.24);
    } catch (e) {}
  }
  function current() { return fromPath(); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function miniAvatar() {
    var pick = null;
    var figs = btn.querySelectorAll('.slg-fig');
    for (var i = 0; i < figs.length; i++) if (getComputedStyle(figs[i]).display !== 'none') pick = figs[i];
    if (!pick) pick = btn.querySelector('.slg-fig');
    var svg = pick && pick.querySelector('svg');
    if (!svg) return el('span', 'slg-mini');
    var copy = svg.cloneNode(true);
    copy.classList.add('slg-mini');
    return copy;
  }
  var who = current();
  var existing = document.getElementById('slgOpen');
  var btn = existing || el('button', 'slg-btn');
  var btnText = existing ? existing.querySelector('.slg-btn-t') : null;
  if (!btnText) { btnText = el('span', 'slg-btn-t', who.ask); btn.appendChild(btnText); }
  if (!existing) {
    btn.type = 'button';
    btn.id = 'slgOpen';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'slgPanel');
  }
  var panel = el('div', 'slg-panel');
  panel.id = 'slgPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'slgTitle');
  panel.hidden = true;
  var head = el('header', 'slg-head');
  var headArt = el('span', 'slg-head-art');
  var title = el('h2', '', 'Ask ' + who.name);
  title.id = 'slgTitle';
  var soundBtn = el('button', 'slg-sound', 'Sound');
  soundBtn.type = 'button';
  soundBtn.setAttribute('aria-pressed', soundOn() ? 'true' : 'false');
  soundBtn.setAttribute('aria-label', soundOn() ? 'Sound on' : 'Sound off');
  var close = el('button', 'slg-x', 'Close');
  close.type = 'button';
  head.appendChild(headArt);
  head.appendChild(title);
  head.appendChild(soundBtn);
  head.appendChild(close);
  var log = el('div', 'slg-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
  var chips = el('div', 'slg-chips');
  var form = el('form', 'slg-form');
  var input = el('input');
  input.type = 'text';
  input.maxLength = 300;
  input.id = 'slgQ';
  input.setAttribute('aria-label', 'Ask ' + who.name);
  var sendBtn = el('button', '', 'Send');
  sendBtn.type = 'submit';
  form.appendChild(input);
  form.appendChild(sendBtn);
  panel.appendChild(head);
  panel.appendChild(log);
  panel.appendChild(chips);
  panel.appendChild(form);
  if (!document.querySelector('link[href="/shore-guide.css"]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/shore-guide.css';
    document.head.appendChild(css);
  }
  var root = existing && existing.closest ? existing.closest('.slg') : null;
  if (!root) root = existing && existing.parentNode && existing.parentNode.classList.contains('slg') ? existing.parentNode : null;
  if (!root) { root = el('div', 'slg'); root.appendChild(btn); document.body.appendChild(root); }
  root.appendChild(panel);
  var tease = document.getElementById('slgTease');
  function paint(next) {
    who = next;
    if (btnText) btnText.textContent = next.ask;
    title.textContent = next.name;
    btn.setAttribute('data-who', next.id);
    btn.setAttribute('aria-label', next.ask);
    input.setAttribute('aria-label', 'Ask ' + next.name);
    while (headArt.firstChild) headArt.removeChild(headArt.firstChild);
    headArt.appendChild(miniAvatar());
    if (tease) tease.textContent = teaseFor(pathName());
    mountArt(next.id);
  }
  var artId = '';
  function mountArt(id) {
    if (!id || artId === id) return;
    artId = id;
    fetch('/img/guides/' + id + '.svg').then(function (r) {
      if (!r.ok) throw new Error('art');
      return r.text();
    }).then(function (txt) {
      var old = btn.querySelectorAll('.slg-fig');
      for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
      var doc = new DOMParser().parseFromString(txt, 'image/svg+xml');
      var art = doc.documentElement;
      if (!art || String(art.nodeName).toLowerCase() !== 'svg') return;
      art.setAttribute('class', 'slg-art');
      art.setAttribute('aria-hidden', 'true');
      var wrap = document.createElement('span');
      wrap.className = 'slg-fig';
      wrap.appendChild(document.importNode(art, true));
      btn.appendChild(wrap);
      while (headArt.firstChild) headArt.removeChild(headArt.firstChild);
      headArt.appendChild(miniAvatar());
    }).catch(function () { artId = ''; });
  }
  paint(who);
  function fillChips() {
    while (chips.firstChild) chips.removeChild(chips.firstChild);
    chipsFor(pathName()).forEach(function (label) {
      var b = el('button', 'slg-chip', label);
      b.type = 'button';
      b.addEventListener('click', function () { ask(label); });
      chips.appendChild(b);
    });
  }
  fillChips();
  function addMsg(cls, text) {
    var row = el('div', 'slg-row ' + cls);
    if (cls === 'slg-bot') row.appendChild(miniAvatar());
    var p = el('p', 'slg-say', text);
    row.appendChild(p);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return p;
  }
  function addLinks(links) {
    if (!links || !links.length) return;
    var ul = el('ul', 'slg-links');
    links.forEach(function (l) {
      if (!l || !l.url || l.url.charAt(0) !== '/') return;
      var li = el('li');
      var a = el('a', '', l.title || l.url);
      a.href = l.url;
      li.appendChild(a);
      ul.appendChild(li);
    });
    log.appendChild(ul);
  }
  function typing() {
    var row = el('div', 'slg-row slg-bot');
    row.appendChild(miniAvatar());
    var p = el('p', 'slg-say');
    var dots = el('span', 'slg-type');
    dots.setAttribute('role', 'status');
    dots.setAttribute('aria-label', who.name + ' is typing');
    dots.appendChild(el('i')); dots.appendChild(el('i')); dots.appendChild(el('i'));
    p.appendChild(dots);
    row.appendChild(p);
    log.appendChild(row);
    log.scrollTop = log.scrollHeight;
    return p;
  }
  function fitPanel() {
    if (!window.visualViewport || panel.hidden) return;
    var vv = window.visualViewport;
    var keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
    if (window.matchMedia('(max-width: 720px)').matches) {
      panel.style.bottom = keyboard + 'px';
      panel.style.maxHeight = Math.max(220, vv.height - 12) + 'px';
    } else {
      panel.style.bottom = '';
      panel.style.maxHeight = '';
    }
  }
  var greeted = false, asked = 0, busy = false;
  function open() {
    lock(fromPath().id);
    paint(current());
    panel.hidden = false;
    root.classList.add('is-open');
    btn.setAttribute('aria-expanded', 'true');
    if (reduce) panel.classList.add('slg-on');
    else requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('slg-on'); }); });
    if (!greeted) { addMsg('slg-bot', who.greeting); greeted = true; chime(); }
    fitPanel();
    input.focus();
  }
  function shut() {
    panel.classList.remove('slg-on');
    root.classList.remove('is-open');
    btn.classList.remove('is-hi');
    btn.setAttribute('aria-expanded', 'false');
    var done = function () { panel.hidden = true; panel.style.bottom = ''; panel.style.maxHeight = ''; };
    if (reduce) done();
    else setTimeout(done, 560);
    btn.focus();
  }
  function ask(q) {
    q = String(q || '').replace(/\s+/g, ' ').trim();
    if (q.length < 2 || busy) return;
    busy = true;
    addMsg('slg-me', q);
    input.value = '';
    sendBtn.disabled = true;
    var pending = typing();
    fetch('/.netlify/functions/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q, path: pathName(), character: locked(), asked: asked })
    }).then(function (r) { return r.json(); }).then(function (data) {
      pending.textContent = (!data || !data.ok) ? (who.name + ' is not sure right now. The pages on the site are still there.') : (data.say || (who.name + ' is not sure about that.'));
      if (data && data.ok) addLinks(data.links);
      if (data && typeof data.asked === 'number') asked = data.asked;
      chime();
    }).catch(function () {
      pending.textContent = who.name + ' could not reach the guide just now.';
    }).then(function () { sendBtn.disabled = false; busy = false; });
  }
  var waving = false;
  function greetTap(then) {
    btn.classList.add('is-hi');
    if (reduce || waving) { then(); return; }
    waving = true;
    setTimeout(function () { waving = false; then(); }, 420);
  }
  btn.addEventListener('click', function () { if (panel.hidden) greetTap(open); else shut(); });
  if (window.__slgWantOpen || location.hash === '#ask') greetTap(open);
  close.addEventListener('click', shut);
  soundBtn.addEventListener('click', function () {
    var on = !soundOn();
    setSound(on);
    soundBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
    soundBtn.setAttribute('aria-label', on ? 'Sound on' : 'Sound off');
    if (on) chime();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) shut(); });
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });
  if (!reduce) {
    var tick = false;
    window.addEventListener('scroll', function () {
      if (tick) return;
      tick = true;
      requestAnimationFrame(function () {
        tick = false;
        var drift = Math.sin((window.scrollY || 0) / 180) * 8;
        root.style.setProperty('--drift', drift.toFixed(2) + 'px');
      });
    }, { passive: true });
    window.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) / Math.max(1, window.innerWidth);
      var dy = (e.clientY - (r.top + r.height / 2)) / Math.max(1, window.innerHeight);
      root.style.setProperty('--gx', (Math.max(-1, Math.min(1, dx)) * 4).toFixed(2) + 'px');
      root.style.setProperty('--gy', (Math.max(-1, Math.min(1, dy)) * 3).toFixed(2) + 'px');
    }, { passive: true });
  }
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', fitPanel);
    window.visualViewport.addEventListener('scroll', fitPanel);
  }
})();
