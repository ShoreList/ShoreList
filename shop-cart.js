/* ShoreList shop bag: pick color and size on shorelist.net, keep a bag across the
   visit, then pay once at Shopify checkout. Works for products hosted on the ShoreList
   Shopify store; other products keep their normal product-page link.
   If the product lookup fails (offline, function down) the dialog stays open and shows a
   plain link to the product page, so a tap always gives a visible result. */
(function () {
  'use strict';
  if (window.__slBag) return;
  window.__slBag = true;

  var STORE = 'https://shorelist.myshopify.com';
  var KEY = 'slBag';
  var bag = [];
  try { bag = JSON.parse(localStorage.getItem(KEY) || '[]') || []; } catch (e) { bag = []; }
  if (!Array.isArray(bag)) bag = [];
  bag = bag.filter(function (l) { return l && /^\d+$/.test(String(l.id)) && l.qty > 0; });

  function save() { try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) {} }
  function track(n, p) { try { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ''); }
  function handleOf(href) { var m = /^https:\/\/shorelist\.myshopify\.com\/products\/([a-z0-9-]+)/i.exec(href || ''); return m ? m[1].toLowerCase() : ''; }
  function count() { return bag.reduce(function (a, l) { return a + l.qty; }, 0); }
  function total() { return bag.reduce(function (a, l) { return a + l.qty * l.price; }, 0); }
  function checkoutUrl() { return STORE + '/cart/' + bag.map(function (l) { return l.id + ':' + l.qty; }).join(','); }

  var css = '' +
    '.slbag-btn{position:fixed;right:16px;top:74px;z-index:70;border:0;border-radius:100px;background:#0E1F33;color:#F4F1EA;font:700 .9rem "DM Sans",system-ui,sans-serif;padding:11px 18px;box-shadow:0 10px 30px rgba(0,0,0,.35);cursor:pointer;display:flex;gap:8px;align-items:center}' +
    '.slbag-btn b{background:#C0412A;color:#fff;border-radius:100px;min-width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:.8rem;padding:0 6px}' +
    'dialog.slbag{border:0;padding:0;background:#FEFCF7;color:#0D1F25;font-family:"DM Sans",system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.45)}' +
    'dialog.slbag::backdrop{background:rgba(6,18,24,.6)}' +
    'dialog.slbag-pick{margin:auto;border-radius:20px;width:min(480px,94vw);max-height:92vh}' +
    '.slbag-btn[hidden]{display:none}' +
    'dialog.slbag-drawer{margin:0 0 0 auto;height:100vh;max-height:100vh;width:min(420px,100vw);border-radius:0}' +
    '.slbag-in{padding:22px;display:flex;flex-direction:column;gap:14px}' +
    '.slbag-drawer .slbag-in{height:100%;box-sizing:border-box}' +
    '.slbag h3{font-family:"Playfair Display",Georgia,serif;font-size:1.3rem;margin:0;padding-right:36px}' +
    '.slbag-x{position:absolute;right:12px;top:12px;width:40px;height:40px;border:0;border-radius:50%;background:rgba(127,127,127,.15);color:inherit;font-size:1.4rem;cursor:pointer;line-height:1}' +
    '.slbag-head{display:flex;gap:14px;align-items:flex-start}.slbag-head img{width:96px;height:128px;object-fit:cover;border-radius:10px;background:#e8e3d8;flex:none}' +
    '.slbag-price{font-weight:700;color:#0A4D5C;margin-top:4px}' +
    '.slbag-lbl{display:block;font-size:.8rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px;opacity:.75}' +
    '.slbag-opts{display:flex;flex-wrap:wrap;gap:8px}' +
    '.slbag-opt{border:1.5px solid rgba(13,31,37,.25);background:transparent;color:inherit;border-radius:100px;padding:9px 14px;font:inherit;font-size:.9rem;cursor:pointer;min-height:40px}' +
    '.slbag-opt[aria-pressed=true]{background:#0E1F33;color:#F4F1EA;border-color:#0E1F33}' +
    '.slbag-opt:disabled{opacity:.35;text-decoration:line-through;cursor:not-allowed}' +
    '.slbag-go{border:0;border-radius:100px;background:#C0412A;color:#fff;font:700 1rem "DM Sans",system-ui,sans-serif;padding:14px 20px;cursor:pointer;text-align:center;text-decoration:none;display:block}' +
    '.slbag-go:disabled{opacity:.5;cursor:not-allowed}' +
    '.slbag-msg{min-height:1.3em;font-size:.9rem;margin:0;opacity:.85}' +
    '.slbag-fail{font-size:1rem;margin:0}' +
    '.slbag-lines{flex:1;overflow:auto;display:flex;flex-direction:column;gap:14px;margin:0;padding:0;list-style:none}' +
    '.slbag-line{display:flex;gap:12px}.slbag-line img{width:64px;height:84px;object-fit:cover;border-radius:8px;background:#e8e3d8;flex:none}' +
    '.slbag-line div{flex:1;min-width:0}.slbag-line strong{display:block;font-size:.95rem}.slbag-line span{font-size:.85rem;opacity:.75}' +
    '.slbag-qty{display:flex;align-items:center;gap:6px;margin-top:6px}.slbag-qty button{width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(13,31,37,.25);background:transparent;color:inherit;font-size:1rem;cursor:pointer}' +
    '.slbag-qty .rm{width:auto;border:0;border-radius:0;text-decoration:underline;font-size:.82rem;margin-left:8px;height:auto;opacity:.75}' +
    '.slbag-sum{display:flex;justify-content:space-between;font-weight:700;font-size:1.05rem;border-top:1px solid rgba(13,31,37,.15);padding-top:14px}' +
    '.slbag-note{font-size:.82rem;opacity:.75;margin:0}' +
    '@media (prefers-color-scheme:dark){dialog.slbag{background:#12303a;color:#F5E8CB}.slbag-price{color:#7FC3CF}.slbag-opt,.slbag-qty button{border-color:rgba(245,232,203,.3)}.slbag-opt[aria-pressed=true]{background:#F5E8CB;color:#0D1F25;border-color:#F5E8CB}.slbag-sum{border-color:rgba(245,232,203,.2)}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- bag button ---------- */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'slbag-btn'; btn.hidden = true;
  btn.setAttribute('aria-label', 'Open your bag');
  document.body.appendChild(btn);
  function paintBtn() { var c = count(); btn.hidden = !c; btn.innerHTML = 'Bag <b>' + c + '</b>'; }

  /* ---------- dialogs ---------- */
  function mk(cls, label, titleId) {
    var d = document.createElement('dialog'); d.className = 'slbag ' + cls;
    /* titleId: the dialog is named by its own heading (the product name) instead of a generic label. */
    if (titleId) d.setAttribute('aria-labelledby', titleId); else d.setAttribute('aria-label', label);
    d.innerHTML = '<button class="slbag-x" type="button" aria-label="Close">&times;</button><div class="slbag-in"></div>';
    document.body.appendChild(d);
    d.querySelector('.slbag-x').addEventListener('click', function () { shut(d); });
    d.addEventListener('click', function (e) { if (e.target === d) shut(d); });
    return d;
  }
  function openD(d) { if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); }
  function shut(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  var pick = mk('slbag-pick', 'Choose options', 'slbagPickT');
  var drawer = mk('slbag-drawer', 'Your bag');

  /* ---------- option picker ---------- */
  var cur = null;
  function matchVariant() {
    if (!cur) return null;
    return cur.p.variants.filter(function (v) { return v.options.every(function (o, k) { return o === cur.sel[k]; }); })[0] || null;
  }
  function paintPick() {
    var p = cur.p, v = matchVariant();
    var body = pick.querySelector('.slbag-in');
    var img = (v && v.image) || cur.img || p.image;
    var h = '<div class="slbag-head">' + (img ? '<img alt="" src="' + esc(img) + '"/>' : '') + '<div><h3 id="slbagPickT">' + esc(cur.name || p.title) + '</h3><div class="slbag-price">' + (v ? money(v.price) : '') + '</div></div></div>';
    p.options.forEach(function (o, k) {
      if (o.values.length === 1 && /^(title|default title)$/i.test(o.name + '') ) return;
      h += '<div role="group" aria-labelledby="slbagOpt' + k + '"><span class="slbag-lbl" id="slbagOpt' + k + '">' + esc(o.name) + '</span><div class="slbag-opts">' + o.values.map(function (val) {
        var ok = p.variants.some(function (x) { return x.available && x.options[k] === val && x.options.every(function (ov, j) { return j === k || cur.sel[j] == null || ov === cur.sel[j]; }); });
        return '<button type="button" class="slbag-opt" data-k="' + k + '" data-v="' + esc(val) + '" aria-pressed="' + (cur.sel[k] === val) + '"' + (ok ? '' : ' disabled') + '>' + esc(val) + '</button>';
      }).join('') + '</div></div>';
    });
    var ready = v && v.available;
    h += '<button type="button" class="slbag-go" id="slbagAdd"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Add to bag' : (v ? 'Sold out in this option' : 'Choose your options')) + '</button>';
    h += '<p class="slbag-msg" role="status" aria-live="polite"></p>';
    h += '<p class="slbag-note">Made to order. Shipping and tax are shown at checkout. <a href="' + esc(cur.url) + '" target="_blank" rel="noopener" style="color:inherit">Full product details</a></p>';
    body.innerHTML = h;
  }
  pick.addEventListener('click', function (e) {
    var o = e.target.closest ? e.target.closest('.slbag-opt') : null;
    if (o && cur) {
      var ok = o.getAttribute('data-k'), ov = o.getAttribute('data-v');
      cur.sel[+ok] = ov; paintPick();
      /* the picker was rebuilt: put focus back on the option that was just chosen */
      var again = pick.querySelectorAll('.slbag-opt');
      for (var z = 0; z < again.length; z++) { if (again[z].getAttribute('data-k') === ok && again[z].getAttribute('data-v') === ov) { again[z].focus(); break; } }
      return;
    }
    if (e.target.id === 'slbagAdd' && cur) {
      var v = matchVariant(); if (!v || !v.available) return;
      var line = bag.filter(function (l) { return String(l.id) === String(v.id); })[0];
      if (line) line.qty = Math.min(20, line.qty + 1);
      else bag.push({ id: String(v.id), qty: 1, price: v.price, name: cur.name || cur.p.title, variant: v.title === 'Default Title' ? '' : v.title, img: v.image || cur.img || cur.p.image, handle: cur.p.handle });
      save(); paintBtn();
      track('add_to_cart', { currency: 'USD', value: v.price, items: [{ item_id: cur.p.handle, item_name: cur.name || cur.p.title, item_variant: v.title, price: v.price, quantity: 1 }] });
      shut(pick); openDrawer();
    }
  });
  /* Lookup failed: no popup (blocked outside a tap on mobile). Keep the dialog open with a real link. */
  function fail(url, name) {
    cur = null;
    pick.querySelector('.slbag-in').innerHTML = '<h3 id="slbagPickT">' + esc(name || 'This piece') + '</h3>' +
      '<p class="slbag-fail" role="alert">We could not load the options for this piece here.</p>' +
      '<a class="slbag-go" id="slbagOut" href="' + esc(url) + '" target="_blank" rel="noopener">Open the product page</a>' +
      '<p class="slbag-note">You can choose your options and buy there.</p>';
    var a = pick.querySelector('#slbagOut'); if (a && pick.open) a.focus();
  }
  function start(handle, url, name, img, seen) {
    cur = null;
    pick.querySelector('.slbag-in').innerHTML = '<h3 id="slbagPickT">' + esc(name || 'Loading') + '</h3><p class="slbag-msg" role="status">Loading colors and sizes.</p>';
    openD(pick);
    fetch('/.netlify/functions/shop-product?handle=' + encodeURIComponent(handle))
      .then(function (r) { if (!r.ok) throw new Error('lookup'); return r.json(); })
      .then(function (p) {
        if (!p || !p.variants || !p.variants.length) throw new Error('empty');
        cur = { p: p, url: url, name: name, img: img, sel: p.options.map(function (o) { return o.values.length === 1 ? o.values[0] : null; }) };
        if (p.variants.length === 1) cur.sel = p.variants[0].options.slice();
        paintPick();
        /* "seen" means the quick view already sent view_item for this open */
        if (!seen) track('view_item', { currency: 'USD', value: p.variants[0].price, items: [{ item_id: p.handle, item_name: name || p.title, price: p.variants[0].price }] });
      })
      .catch(function () { fail(url, name); });
  }

  /* ---------- drawer ---------- */
  function paintDrawer() {
    var body = drawer.querySelector('.slbag-in');
    if (!bag.length) { body.innerHTML = '<h3>Your bag</h3><p class="slbag-msg">Your bag is empty.</p>'; return; }
    body.innerHTML = '<h3>Your bag</h3><ul class="slbag-lines">' + bag.map(function (l, k) {
      return '<li class="slbag-line">' + (l.img ? '<img alt="" src="' + esc(l.img) + '"/>' : '') + '<div><strong>' + esc(l.name) + '</strong><span>' + esc(l.variant || '') + '</span><div class="slbag-qty"><button type="button" data-d="-1" data-k="' + k + '" aria-label="One fewer">&minus;</button><b>' + l.qty + '</b><button type="button" data-d="1" data-k="' + k + '" aria-label="One more">+</button><button type="button" class="rm" data-rm="' + k + '">Remove</button></div></div><b>' + money(l.price * l.qty) + '</b></li>';
    }).join('') + '</ul><div class="slbag-sum"><span>Subtotal</span><span>' + money(total()) + '</span></div><a class="slbag-go" id="slbagPay" href="' + esc(checkoutUrl()) + '">Checkout</a><p class="slbag-note">One secure checkout on Shopify for everything in your bag. Shipping and tax are added there.</p>';
  }
  /* the drawer was rebuilt: put focus back on the same control, or on Close if its line is gone */
  function refocus(sel) { var el = sel ? drawer.querySelector(sel) : null; (el || drawer.querySelector('.slbag-x')).focus(); }
  function openDrawer() { paintDrawer(); openD(drawer); track('view_cart', { currency: 'USD', value: total(), items: bag.map(function (l) { return { item_id: l.handle, item_name: l.name, item_variant: l.variant, price: l.price, quantity: l.qty }; }) }); }
  drawer.addEventListener('click', function (e) {
    var t = e.target;
    if (t.hasAttribute && t.hasAttribute('data-d')) { var dk = t.getAttribute('data-k'), dd = t.getAttribute('data-d'), l = bag[+dk]; if (l) { l.qty = Math.max(0, Math.min(20, l.qty + (+dd))); var gone = !l.qty; if (gone) bag.splice(+dk, 1); save(); paintBtn(); paintDrawer(); refocus(gone ? null : '[data-d="' + dd + '"][data-k="' + dk + '"]'); } return; }
    if (t.hasAttribute && t.hasAttribute('data-rm')) { bag.splice(+t.getAttribute('data-rm'), 1); save(); paintBtn(); paintDrawer(); refocus(null); return; }
    if (t.id === 'slbagPay') { track('begin_checkout', { currency: 'USD', value: total(), items: bag.map(function (l) { return { item_id: l.handle, item_name: l.name, item_variant: l.variant, price: l.price, quantity: l.qty }; }) }); }
  });
  btn.addEventListener('click', openDrawer);

  /* ---------- take over buy clicks for Shopify products ---------- */
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target && e.target.closest ? e.target.closest('a.buy[href]') : null;
    if (!a || a.id === 'slbagPay') return;
    var h = handleOf(a.getAttribute('href')); if (!h) return;
    e.preventDefault();
    var card = a.closest('.card,.rb-card'), qv = a.closest('#qv');
    var name = '', img = '';
    if (card) { var t = card.querySelector('h3'); name = t ? t.textContent : ''; var im = card.querySelector('img'); img = im ? im.currentSrc || im.src : ''; }
    else if (qv) { var n = qv.querySelector('#qvn'); name = n ? n.textContent : ''; var qi = qv.querySelector('#qvi'); img = qi ? qi.src : ''; if (qv.close) qv.close(); }
    start(h, a.getAttribute('href'), name, img, !!qv);
  });

  paintBtn();
  window.ShoreBag = { open: openDrawer, count: count };
})();
