/* Shop sale banner. Each window shows only between its start and end (UTC epoch; late November Eastern is EST, UTC-5).
   Preview any time: ?promo-preview=1 (launch), ?promo-preview=bf (Black Friday), ?promo-preview=cm (Cyber Monday). Remove after the sales. */
(function () {
  var SALES = [
    { id: '1', label: 'Launch sale offer', lead: 'Launch sale:', code: 'SHORE15', when: 'through Thursday night',
      start: Date.UTC(2026, 10, 25, 4, 0, 0), end: Date.UTC(2026, 10, 27, 4, 59, 0) },
    { id: 'bf', label: 'Black Friday offer', lead: 'Black Friday:', code: 'SHOREFRIDAY15', when: 'today only',
      start: Date.UTC(2026, 10, 27, 5, 0, 0), end: Date.UTC(2026, 10, 28, 4, 59, 0) },
    { id: 'cm', label: 'Cyber Monday offer', lead: 'Cyber Monday:', code: 'SHORECYBER15', when: 'today only',
      start: Date.UTC(2026, 10, 30, 5, 0, 0), end: Date.UTC(2026, 11, 1, 4, 59, 0) }
  ];
  var now = Date.now(), m = /[?&]promo-preview=([A-Za-z0-9]+)(&|$)/.exec(location.search), pv = m && m[1];
  var s = null;
  for (var i = 0; i < SALES.length; i++) {
    if (pv ? SALES[i].id === pv : (now >= SALES[i].start && now < SALES[i].end)) { s = SALES[i]; break; }
  }
  if (!s) return;
  var main = document.getElementById('main'); if (!main) return;
  var bar = document.createElement('aside');
  bar.setAttribute('aria-label', s.label);
  bar.style.cssText = 'background:#0E1F33;color:#fff;text-align:center;padding:14px 16px;font:600 15px/1.4 "DM Sans",system-ui,sans-serif;letter-spacing:.01em';
  var lead = document.createElement('strong'); lead.textContent = s.lead;
  var code = document.createElement('strong'); code.textContent = s.code;
  code.style.cssText = 'border:1px solid #fff;border-radius:6px;padding:1px 8px;margin:0 2px';
  bar.appendChild(lead);
  bar.appendChild(document.createTextNode(' 15% off the whole shop with code '));
  bar.appendChild(code);
  bar.appendChild(document.createTextNode(' ' + s.when + '. Enter it at checkout.'));
  main.insertBefore(bar, main.firstChild);
  var hero = document.querySelector('.hero-cta');
  if (hero) {
    var p = document.createElement('p');
    p.style.cssText = 'margin:14px 0 0;font:600 15px/1.4 "DM Sans",system-ui,sans-serif';
    p.textContent = s.lead + ' 15% off with code ' + s.code + ', ' + s.when + '.';
    hero.parentNode.insertBefore(p, hero.nextSibling);
  }
})();
