/* ShoreList local directory: real nearby businesses for every things-to-do category.
   Shown on category pages under "More local favorites". Data: /local-directory.json.
   These businesses are listed as a free local resource and are not booked through ShoreList. */
(function () {
  'use strict';
  var d = document, w = window;
  var cat = (d.body && d.body.getAttribute('data-cat')) || w.__CAT || '';
  if (!/^\/things-to-do\/./.test(location.pathname) || !cat) return;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function track(n, p) { try { if (typeof w.gtag === 'function') w.gtag('event', n, p || {}); } catch (e) {} }
  var ORDER = ['Downtown Wilmington', 'Wrightsville Beach', 'Carolina Beach', 'Kure Beach', 'Greater Wilmington'];
  var CSS = '.ld{margin:56px 0 8px}.ld-eyebrow{font-size:.72rem;font-weight:800;letter-spacing:.2em;text-transform:uppercase;color:#C0412A;margin:0 0 8px}' +
    '.ld h2{font-family:"Playfair Display",serif;font-size:clamp(1.6rem,3vw,2.2rem);font-weight:900;margin:0 0 8px;color:var(--teal,#0A4D5C);line-height:1.1}.ld h2 em{color:var(--coral,#E96645)}' +
    '.ld-sub{color:var(--teal2,#1A7585);max-width:640px;line-height:1.65;margin:0 0 20px;font-size:.98rem}' +
    '.ld-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 22px}.ld-tab{font:inherit;font-weight:700;font-size:.86rem;min-height:44px;padding:8px 16px;border-radius:100px;border:1.5px solid rgba(10,77,92,.16);background:#fff;color:var(--teal,#0A4D5C);cursor:pointer}' +
    '.ld-tab[aria-pressed=true]{background:var(--teal,#0A4D5C);color:#fff;border-color:var(--teal,#0A4D5C)}.ld-tab:focus-visible,.ld a:focus-visible{outline:2px solid var(--teal,#0A4D5C);outline-offset:2px}' +
    '.ld-town{margin:0 0 26px}.ld-town h3{font-size:.76rem;font-weight:800;letter-spacing:.16em;text-transform:uppercase;color:var(--teal2,#1A7585);margin:0 0 12px;display:flex;align-items:center;gap:10px}.ld-town h3::after{content:"";flex:1;height:1px;background:rgba(10,77,92,.14)}' +
    '.ld-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:14px}' +
    '.ld-card{background:#fff;border:1px solid rgba(10,77,92,.12);border-radius:16px;padding:18px 18px 16px;display:flex;flex-direction:column;gap:8px;box-shadow:0 6px 18px rgba(10,77,92,.05);transition:transform .3s cubic-bezier(.2,.7,.2,1),box-shadow .3s,border-color .3s}' +
    '@media(hover:hover){.ld-card:hover{transform:translateY(-3px);box-shadow:0 18px 38px rgba(10,77,92,.13);border-color:rgba(233,102,69,.35)}}' +
    '.ld-card h4{font-family:"Playfair Display",serif;font-size:1.1rem;font-weight:800;margin:0;color:var(--teal,#0A4D5C);line-height:1.2}.ld-card p{margin:0;font-size:.9rem;line-height:1.55;color:#2A4850}' +
    '.ld-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:auto;padding-top:6px}.ld-row a{display:inline-flex;align-items:center;min-height:44px;padding:0 15px;border-radius:100px;font-weight:800;font-size:.84rem;text-decoration:none}' +
    '.ld-web{background:#C0412A;color:#fff}.ld-call{background:#C0412A;color:#fff}.ld-soc{border:1.5px solid rgba(10,77,92,.2);color:var(--teal,#0A4D5C);font-weight:700}.ld-soc:hover{border-color:var(--coral,#E96645)}' +

    '.ld-lead{margin:30px 0 0;background:linear-gradient(135deg,#0E1F33,#0A4D5C);color:#F4F1EA;border-radius:20px;padding:26px 24px;display:grid;gap:14px}.ld-lead h3{font-family:"Playfair Display",serif;font-size:1.35rem;margin:0;color:#fff}.ld-lead p{margin:0;font-size:.92rem;line-height:1.55;color:#E6EEF0}' +
    '.ld-lead form{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:10px}.ld-lead input,.ld-lead textarea{font:inherit;font-size:.92rem;min-height:44px;padding:10px 14px;border-radius:12px;border:1.5px solid rgba(255,255,255,.3);background:rgba(255,255,255,.1);color:#fff}.ld-lead input::placeholder,.ld-lead textarea::placeholder{color:#C9D8DB}.ld-lead textarea{grid-column:1/-1;min-height:80px}' +
    '.ld-lead button{font:inherit;font-weight:800;min-height:44px;border-radius:100px;border:0;background:#fff;color:#8E2D1F;cursor:pointer;padding:0 22px}.ld-lead .ld-fine{grid-column:1/-1;font-size:.76rem;color:#D4E0E3;margin:0}.ld-lead .ld-ok{font-weight:700}' +
    '.ld-spon a{display:inline-flex;align-items:center;min-height:44px}.ld-spon{border:1.5px dashed rgba(10,77,92,.3);border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:8px;background:#F4F1EA}.ld-spon b{font-size:.7rem;letter-spacing:.16em;text-transform:uppercase;color:#6B4A12}.ld-spon a{font-weight:800;color:#8E2D1F}' +
    '.ld-note{font-size:.78rem;color:var(--mid,#2C4A52);opacity:.85;margin:6px 0 0;line-height:1.55}';
  function card(b) {
    var h = '<article class="ld-card"><h4>' + esc(b.n) + '</h4><p>' + esc(b.d) + '</p><div class="ld-row">';
    var clean = function (u) { return String(u).replace(/[?#].*$/, ''); };
    if (b.w) h += '<a class="ld-web" href="https://' + esc(b.w.replace(/^https?:\/\//, '')) + '" target="_blank" rel="noopener" data-biz="' + esc(b.n) + '">Website</a>';
    else if (b.p) h += '<a class="ld-call" href="tel:' + esc(b.p.replace(/[^0-9+]/g, '')) + '" data-biz="' + esc(b.n) + '">Call ' + esc(b.p) + '</a>';
    if (b.f) h += '<a class="ld-soc" href="https://www.facebook.com/' + esc(clean(b.f)) + '" target="_blank" rel="noopener" data-biz="' + esc(b.n) + '" aria-label="' + esc(b.n) + ' on Facebook">Facebook</a>';
    if (b.i) h += '<a class="ld-soc" href="https://www.instagram.com/' + esc(clean(b.i)) + '/" target="_blank" rel="noopener" data-biz="' + esc(b.n) + '" aria-label="' + esc(b.n) + ' on Instagram">Instagram</a>';
    return h + '</div></article>';
  }
  function build(list) {
    var towns = ORDER.filter(function (t) { return list.some(function (b) { return b.t === t; }); });
    var s = d.createElement('section'); s.className = 'ld'; s.setAttribute('aria-labelledby', 'ldH');
    var title = (w.__H1 || '').replace(/\s*(in|near)\b.*$/i, '') || 'this category';
    s.innerHTML = '<div class="ld-eyebrow">Local favorites</div><h2 id="ldH">More places to try, <em>straight from the locals</em></h2>' +
      '<p class="ld-sub">Not everything is bookable on ShoreList yet, and that is fine. These are real Wilmington-area businesses in this category. Reach out to them directly.</p>' +
      (towns.length > 1 ? '<div class="ld-tabs" role="group" aria-label="Filter by town"><button type="button" class="ld-tab" data-t="all" aria-pressed="true">All towns</button>' + towns.map(function (t) { return '<button type="button" class="ld-tab" data-t="' + esc(t) + '" aria-pressed="false">' + esc(t) + '</button>'; }).join('') + '</div>' : '') +
      '<div class="ld-body">' + towns.map(function (t) { return '<div class="ld-town" data-t="' + esc(t) + '"><h3>' + esc(t) + '</h3><div class="ld-grid">' + list.filter(function (b) { return b.t === t; }).map(card).join('') + '</div></div>'; }).join('') + '</div>' +
      '<p class="ld-note">Listed as a free local resource using each business’s public information. ShoreList does not book these businesses and is not affiliated with them. Hours, prices and availability are theirs to confirm. Own one of these and want changes? <a href="mailto:rj@shorelist.net" style="color:#C0412A;font-weight:700">Email us</a>.</p>';
    s.addEventListener('click', function (e) {
      var tab = e.target.closest && e.target.closest('.ld-tab');
      if (tab) {
        var t = tab.getAttribute('data-t');
        s.querySelectorAll('.ld-tab').forEach(function (x) { x.setAttribute('aria-pressed', x === tab ? 'true' : 'false'); });
        s.querySelectorAll('.ld-town').forEach(function (x) { x.hidden = t !== 'all' && x.getAttribute('data-t') !== t; });
        track('directory_filter', { cat: cat, town: t }); return;
      }
      var a = e.target.closest && e.target.closest('.ld-row a');
      if (a) track('directory_click', { cat: cat, business: a.getAttribute('data-biz'), kind: a.className.replace('ld-', '') });
    });
    return s;
  }

  function lead() {
    var f = d.createElement('div'); f.className = 'ld-lead';
    f.innerHTML = '<h3>Planning a group, wedding or private trip?</h3><p>Tell us what you need and we will pass your request to a few local businesses in this category who can help.</p>' +
      '<form action="https://formspree.io/f/xeevzzqd" method="POST"><input type="hidden" name="list" value="Local lead: ' + esc(cat) + '"><input name="name" required placeholder="Your name" aria-label="Your name" autocomplete="name"><input name="email" type="email" required placeholder="Email" aria-label="Email" autocomplete="email"><input name="date" placeholder="Date or month" aria-label="Date or month"><input name="size" placeholder="Group size" aria-label="Group size"><textarea name="details" placeholder="What are you looking for?" aria-label="Details"></textarea><button type="submit">Send my request</button>' +
      '<p class="ld-fine">By sending, you agree we may share this request with relevant local businesses so they can contact you. We never sell your email to advertisers.</p></form>';
    var fm = f.querySelector('form');
    fm.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = fm.querySelector('button'); b.disabled = true; b.textContent = 'Sending...';
      fetch(fm.action, { method: 'POST', body: new FormData(fm), headers: { Accept: 'application/json' } }).then(function (r) {
        if (!r.ok) throw 0; track('generate_lead', { cat: cat }); fm.innerHTML = '<p class="ld-ok">Thank you. We will be in touch soon.</p>';
      }).catch(function () { b.disabled = false; b.textContent = 'Send my request'; });
    });
    return f;
  }
  function spon() {
    var a = d.createElement('article'); a.className = 'ld-spon';
    a.innerHTML = '<b>Sponsored spot available</b><p>Own a business in this category? Featured spots are clearly labeled and reach visitors who are planning right now.</p><a href="/advertise">See partner options</a>';
    return a;
  }
  function place(sec) {
    var tries = 0, t = setInterval(function () {
      var anchor = d.querySelector('.list-cta') || d.querySelector('.more-sec');
      if (anchor && anchor.parentNode) { clearInterval(t); anchor.parentNode.insertBefore(sec, anchor); }
      else if (++tries > 14) { clearInterval(t); var mc = d.getElementById('mc'); if (mc) mc.appendChild(sec); }
    }, 150);
  }
  function go() {
    fetch('/local-directory.json').then(function (r) { return r.json(); }).then(function (all) {
      var list = all.filter(function (b) { return b.c.indexOf(cat) > -1; });
      if (!list.length) return;
      var st = d.createElement('style'); st.textContent = CSS; d.head.appendChild(st);
      var sec = build(list); var g = sec.querySelector('.ld-grid'); if (g) g.appendChild(spon()); sec.appendChild(lead()); place(sec);
    }).catch(function () {});
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', go); else go();
})();
