/* ShoreList guide launcher. Wrighty, Shelby and Captain Cape.
   The character is chosen from the path, then kept for the browser session.
   Answers come from /.netlify/functions/guide. No third-party script. */
(function () {
  'use strict';
  var KEY = 'sl-guide-character';
  var RULES = [
    { id: 'wrighty', name: 'Wrighty', ask: 'Ask Wrighty', accent: '#0E1F33', greeting: "Hi, I'm Wrighty. I can help you find a gift or a souvenir from the ShoreList shop. Who are you shopping for?", paths: ['/shop', '/gift-guide', '/gift-finder', '/holiday-gift-guide', '/wilmington-nc-gifts', '/wrightsville-beach-souvenirs', '/wrightsville-beach-christmas-ornament', '/prints', '/guides', '/shipping-returns', '/size-guide'] },
    { id: 'cape', name: 'Captain Cape', ask: 'Ask Captain Cape', accent: '#B5362F', greeting: "Cap here. I can help you pick a tour or an outing. What are you in the mood for: a walk through history, something on the water, or something after dark?", paths: ['/things-to-do', '/planner', '/join', '/waitlist'] },
    { id: 'shelby', name: 'Shelby', ask: 'Ask Shelby', accent: '#8A7348', greeting: "Hi, I'm Shelby. I know Wilmington and the three beaches well. What brings you here: planning a trip, or figuring out today?", paths: ['/', '/downtown', '/wrightsville-beach', '/carolina-beach', '/kure-beach', '/pleasure-island', '/events', '/shore-picks', '/where-to-stay', '/plan-your-trip', '/wilmington-weather', '/surf'] }
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
  function locked() {
    try { return sessionStorage.getItem(KEY); } catch (e) { return ''; }
  }
  function lock(id) {
    try { sessionStorage.setItem(KEY, id); } catch (e) {}
  }
  function current() { return byId(locked() || fromPath().id); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function avatar(kind) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 64 64');
    svg.setAttribute('aria-hidden', 'true');
    var bg = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    bg.setAttribute('cx', '32'); bg.setAttribute('cy', '32'); bg.setAttribute('r', '30'); bg.setAttribute('fill', '#F4F1EA');
    svg.appendChild(bg);
    if (kind === 'loggerhead') {
      var shell = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      shell.setAttribute('cx', '32'); shell.setAttribute('cy', '36'); shell.setAttribute('rx', '16'); shell.setAttribute('ry', '12'); shell.setAttribute('fill', '#0E1F33');
      var head = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      head.setAttribute('cx', '32'); head.setAttribute('cy', '20'); head.setAttribute('r', '7'); head.setAttribute('fill', '#8A7348');
      svg.appendChild(shell); svg.appendChild(head);
    } else {
      var body = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
      body.setAttribute('cx', '26'); body.setAttribute('cy', '40'); body.setAttribute('rx', '13'); body.setAttribute('ry', '11'); body.setAttribute('fill', '#0E1F33');
      var beak = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      beak.setAttribute('d', 'M36 24h16l-4 4H36z'); beak.setAttribute('fill', '#D9C7A3');
      var pouch = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      pouch.setAttribute('d', 'M38 28c8 1 12 6 10 9-6 1-14-2-16-5z'); pouch.setAttribute('fill', '#D9C7A3');
      svg.appendChild(body); svg.appendChild(beak); svg.appendChild(pouch);
    }
    return svg;
  }
  var who = current();
  var existing = document.getElementById('slgOpen');
  var btn = existing || el('button', 'slg-btn');
  var btnText = existing ? existing.querySelector('.slg-btn-t') : el('span', 'slg-btn-t', who.ask);
  if (!btnText) { btnText = el('span', 'slg-btn-t', who.ask); btn.appendChild(btnText); }
  if (!existing) {
    btn.type = 'button';
    btn.appendChild(avatar(who.id === 'shelby' ? 'loggerhead' : 'pelican'));
    btn.appendChild(btnText);
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'slgPanel');
  } else if (!btn.querySelector('svg')) {
    btn.insertBefore(avatar(who.id === 'shelby' ? 'loggerhead' : 'pelican'), btn.firstChild);
  }
  var panel = el('div', 'slg-panel');
  panel.id = 'slgPanel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'false');
  panel.setAttribute('aria-labelledby', 'slgTitle');
  panel.hidden = true;
  var head = el('header', 'slg-head');
  var title = el('h2', '', 'Ask ' + who.name);
  title.id = 'slgTitle';
  var close = el('button', 'slg-x', 'Close');
  close.type = 'button';
  head.appendChild(avatar(who.id === 'shelby' ? 'loggerhead' : 'pelican'));
  head.appendChild(title);
  head.appendChild(close);
  var log = el('div', 'slg-log');
  log.setAttribute('role', 'log');
  log.setAttribute('aria-live', 'polite');
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
  panel.appendChild(form);
  if (!document.querySelector('link[href="/shore-guide.css"]')) {
    var css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = '/shore-guide.css';
    document.head.appendChild(css);
  }
  var root = existing && existing.parentNode ? existing.parentNode : el('div', 'slg');
  if (!existing) {
    root.appendChild(btn);
    document.body.appendChild(root);
  }
  root.appendChild(panel);
  function paint(next) {
    who = next;
    btnText.textContent = next.ask;
    title.textContent = 'Ask ' + next.name;
    btn.style.setProperty('--slg', next.accent);
    input.setAttribute('aria-label', 'Ask ' + next.name);
    btn.setAttribute('aria-label', next.ask);
  }
  paint(who);
  function addMsg(cls, text) {
    var p = el('p', cls, text);
    log.appendChild(p);
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
  var greeted = false, asked = 0;
  function open() {
    if (!locked()) lock(fromPath().id);
    paint(byId(locked()));
    panel.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    if (!greeted) { addMsg('slg-bot', who.greeting); greeted = true; }
    input.focus();
  }
  function shut() {
    panel.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    btn.focus();
  }
  btn.addEventListener('click', function () { if (panel.hidden) open(); else shut(); });
  if (window.__slgWantOpen) open();
  close.addEventListener('click', shut);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) shut(); });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var q = input.value.replace(/\s+/g, ' ').trim();
    if (q.length < 2) return;
    addMsg('slg-me', q);
    input.value = '';
    sendBtn.disabled = true;
    var pending = addMsg('slg-bot', who.name + ' is checking the ShoreList pages.');
    fetch('/.netlify/functions/guide', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: q, path: pathName(), character: locked(), asked: asked })
    }).then(function (r) { return r.json(); }).then(function (data) {
      if (!data || !data.ok) { pending.textContent = who.name + ' is not sure right now. The pages on the site are still there.'; return; }
      pending.textContent = data.say || (who.name + ' is not sure about that.');
      addLinks(data.links);
      if (typeof data.asked === 'number') asked = data.asked;
    }).catch(function () {
      pending.textContent = who.name + ' could not reach the guide just now.';
    }).then(function () { sendBtn.disabled = false; });
  });
})();
