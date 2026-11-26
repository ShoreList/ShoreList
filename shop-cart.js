/* ShoreList shop bag. Pick color and size on shorelist.net, keep a bag across the visit,
   then pay at checkout.

   Three groups can sit in the bag:
   - ShoreList Direct (goods): physical goods bought on shorelist.net itself. Lines carry an item id, a variant id
     and a quantity. They check out through create-goods-checkout (Stripe) in this same page; the server re-prices
     every line from its own catalog, so the price shown here is only what the shopper last saw.
   Two other stores sit behind the shop:
   - ShoreList Shop (Shopify): lines with a variant, quantity and price. These check out together
     in ONE Shopify checkout built from the bag at the moment of the tap.
   - ShoreList Gear (Fourthwall): link-out lines. They are held here so nothing is forgotten, but
     each opens its own page and checks out there, separate from the Shopify lines.

   The bag uses localStorage for persistence and tab sync when available, and memory otherwise.
   The Shopify checkout link is rebuilt from the bag when the shopper taps Checkout, and opening
   the bag re-checks price and availability of each Shopify line against the store.

   If the product lookup fails (offline, function down) the dialog stays open and shows a
   plain link to the product page, so a tap always gives a visible result. */
(function () {
  'use strict';
  if (window.__slBag) return;
  window.__slBag = true;

  var STORE = 'https://shorelist.myshopify.com';
  var KEY = 'slBag';
  /* Shopify cart permalinks may add to a cart the browser already holds from an earlier checkout visit.
     Setting this to true sends shoppers through /cart/clear first. It is off because it has not been
     tested against the live store from here. Test it, then switch it on. */
  var CLEAR_FIRST = false;
  var OUT_RE = /^https:\/\/shorelist-shop\.fourthwall\.com\//i;
  var bag = [];
  var storageAvailable = true;

  function clean(list) {
    if (!Array.isArray(list)) return [];
    return list.filter(function (l) {
      if (!l || !(l.qty > 0)) return false;
      if (l.goods === true) return /^[a-z0-9][a-z0-9-]{0,79}$/.test(l.item || '') && /^[a-z0-9][a-z0-9-]{0,79}$/.test(l.variantId || '') && Number.isInteger(l.cents) && l.cents > 0 && typeof l.name === 'string';
      if (l.out === true) return typeof l.id === 'string' && OUT_RE.test(l.url || '') && typeof l.name === 'string';
      return /^\d+$/.test(String(l.id));
    }).map(function (l) { if (l.out === true) l.qty = 1; else l.qty = Math.min(l.goods ? 10 : 20, Math.floor(l.qty)); return l; });
  }
  function load() {
    if (!storageAvailable) return;
    var raw;
    try { raw = localStorage.getItem(KEY); } catch (e) { storageAvailable = false; return; }
    try { bag = clean(JSON.parse(raw || '[]')); } catch (e) { bag = []; }
  }
  function save() {
    if (!storageAvailable) return;
    try { localStorage.setItem(KEY, JSON.stringify(bag)); } catch (e) { storageAvailable = false; }
  }
  /* Re-read the stored bag before changing it to include edits made in another tab. */
  function mutate(fn) { load(); var r = fn(); save(); paintBtn(); return r; }
  load();

  function track(n, p) { try { if (typeof window.gtag === 'function') window.gtag('event', n, p || {}); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function money(n) { return '$' + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, ''); }
  function handleOf(href) { var m = /^https:\/\/shorelist\.myshopify\.com\/products\/([a-z0-9-]+)/i.exec(href || ''); return m ? m[1].toLowerCase() : ''; }
  function shopLines() { return bag.filter(function (l) { return !l.out && !l.goods; }); }
  function outLines() { return bag.filter(function (l) { return l.out; }); }
  function goodsLines() { return bag.filter(function (l) { return l.goods; }); }
  function goodsTotal() { return goodsLines().reduce(function (a, l) { return a + l.qty * l.cents; }, 0) / 100; }
  function buyable() { return shopLines().filter(function (l) { return !l.gone; }); }
  function count() { return buyable().reduce(function (a, l) { return a + l.qty; }, 0) + outLines().length + goodsLines().reduce(function (a, l) { return a + l.qty; }, 0); }
  function total() { return buyable().reduce(function (a, l) { return a + l.qty * l.price; }, 0); }
  function checkoutUrl() {
    var path = '/cart/' + buyable().map(function (l) { return l.id + ':' + l.qty; }).join(',');
    return CLEAR_FIRST ? STORE + '/cart/clear?return_to=' + encodeURIComponent(path) : STORE + path;
  }
  function wearable(name) { return /\b(crewneck|tee|hoodie|cap|beanie|hat)\b/i.test(name || ''); }
  function gaLines() { return buyable().map(function (l) { return { item_id: l.handle, item_name: l.name, item_variant: l.variant, price: l.price, quantity: l.qty }; }); }

  var css = '' +
    '.slbag-btn{position:fixed;right:16px;top:74px;z-index:70;border:0;border-radius:2px;background:var(--navy,#0E1F33);color:var(--on-navy,#F4F1EA);font:700 .78rem "DM Sans",system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;padding:0 18px;min-height:44px;box-shadow:0 10px 30px rgba(0,0,0,.3);cursor:pointer}' +
    '.slbag-btn[hidden]{display:none}' +
    'dialog.slbag{border:0;padding:0;background:#F4F1EA;color:#0E1F33;font-family:"DM Sans",system-ui,sans-serif;box-shadow:0 30px 80px rgba(0,0,0,.45)}' +
    'dialog.slbag::backdrop{background:rgba(14,31,51,.6)}' +
    'dialog.slbag-pick{margin:auto;border-radius:0;width:min(480px,94vw);max-height:92dvh}' +
    'dialog.slbag-drawer{margin:0 0 0 auto;height:100vh;height:100dvh;max-height:100dvh;width:min(440px,100vw);border-radius:0}' +
    '.slbag-in{padding:26px 22px 22px;display:flex;flex-direction:column;gap:14px}' +
    '.slbag-drawer .slbag-in{height:100%;box-sizing:border-box}' +
    '.slbag h3{font-family:"Libre Caslon Display",Georgia,serif;font-size:1.4rem;line-height:1.15;margin:0;padding-right:70px}' +
    '.slbag h4{font-family:"Libre Caslon Display",Georgia,serif;font-size:1.05rem;margin:0}' +
    '.slbag-x{position:absolute;right:0;top:0;min-height:48px;padding:0 16px;border:0;background:none;color:inherit;font:700 .74rem "DM Sans",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;cursor:pointer}' +
    '.slbag-head{display:flex;gap:14px;align-items:flex-start}.slbag-head img{width:96px;height:120px;object-fit:cover;background:#D9C7A3;flex:none}' +
    '.slbag-price{font-weight:500;margin-top:4px}' +
    '.slbag-lbl{display:block;font-size:.72rem;font-weight:500;letter-spacing:.14em;text-transform:uppercase;margin-bottom:6px;opacity:.75}' +
    '.slbag-opts{display:flex;flex-wrap:wrap;gap:8px}' +
    '.slbag-opt{border:1px solid rgba(14,31,51,.35);background:transparent;color:inherit;border-radius:2px;padding:9px 14px;font:inherit;font-size:.9rem;cursor:pointer;min-height:44px}' +
    '.slbag-opt[aria-pressed=true]{background:#0E1F33;color:#F4F1EA;border-color:#0E1F33}' +
    '.slbag-opt:disabled{opacity:.35;text-decoration:line-through;cursor:not-allowed}' +
    '.slbag-go{border:1px solid #0E1F33;border-radius:2px;background:#0E1F33;color:#F4F1EA;font:700 .78rem "DM Sans",system-ui,sans-serif;letter-spacing:.14em;text-transform:uppercase;min-height:50px;padding:0 20px;cursor:pointer;text-align:center;text-decoration:none;display:flex;align-items:center;justify-content:center}' +
    '.slbag-go:hover{background:transparent;color:#0E1F33}' +
    '.slbag-go.ghost{background:transparent;color:#0E1F33}.slbag-go.ghost:hover{background:#0E1F33;color:#F4F1EA}' +
    '.slbag-go:disabled{opacity:.5;cursor:not-allowed}' +
    '.slbag-msg{min-height:1.3em;font-size:.9rem;margin:0;opacity:.85}' +
    '.slbag-fail{font-size:1rem;margin:0}' +
    '.slbag-scroll{flex:1;overflow:auto;display:flex;flex-direction:column;gap:22px;min-height:0}' +
    '.slbag-grp{display:flex;flex-direction:column;gap:12px}' +
    '.slbag-gsub{font-size:.84rem;opacity:.8;margin:-6px 0 0}' +
    '.slbag-two{font-size:.84rem;border:1px solid rgba(14,31,51,.25);padding:10px 12px;margin:0}' +
    '.slbag-lines{display:flex;flex-direction:column;gap:14px;margin:0;padding:0;list-style:none}' +
    '.slbag-line{display:flex;gap:12px}.slbag-line img{width:64px;height:80px;object-fit:cover;background:#D9C7A3;flex:none}' +
    '.slbag-line>div{flex:1;min-width:0}.slbag-line strong{display:block;font-size:.92rem;line-height:1.3}.slbag-line span{font-size:.82rem;opacity:.75;display:block}' +
    '.slbag-line .warn{opacity:1;color:#B5362F;font-weight:500}' +
    '.slbag-qty{display:flex;align-items:center;gap:4px;margin-top:4px}.slbag-qty button{width:44px;height:44px;border:1px solid rgba(14,31,51,.3);border-radius:2px;background:transparent;color:inherit;font-size:1.05rem;cursor:pointer}' +
    '.slbag-qty b{min-width:26px;text-align:center}' +
    '.slbag-qty .rm,.slbag-out{width:auto;min-height:44px;border:0;background:none;border-radius:0;text-decoration:underline;text-underline-offset:3px;font-size:.84rem;margin-left:6px;opacity:.85;padding:0 6px;color:inherit;cursor:pointer;display:inline-flex;align-items:center}' +
    '.slbag-out{margin-left:0;padding:0;font-weight:500;opacity:1}' +
    '.slbag-sum{display:flex;justify-content:space-between;font-weight:500;font-size:1.05rem;border-top:1px solid rgba(14,31,51,.18);padding-top:14px}' +
    '.slbag-note{font-size:.82rem;opacity:.8;margin:0}' +
    '.slbag-pre{margin:0;border-top:1px solid rgba(14,31,51,.18);font-size:.82rem}' +
    '.slbag-pre div{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px solid rgba(14,31,51,.12)}' +
    '.slbag-pre dt{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;font-weight:500;opacity:.7;flex:none;width:36%}' +
    '.slbag-pre dd{margin:0;flex:1;text-align:right}.slbag-pre a{color:inherit;font-weight:500}' +
    'nav.sl-hdr .sl-tools .sl-bag{padding:0 12px}' +
    '@media(max-width:560px){nav.sl-hdr .sl-tools .sl-srch span{display:none}}' +
    '@media (prefers-color-scheme:dark){dialog.slbag{background:#0E1F33;color:#F4F1EA}.slbag-opt,.slbag-qty button{border-color:rgba(244,241,234,.35)}.slbag-opt[aria-pressed=true]{background:#F4F1EA;color:#0E1F33;border-color:#F4F1EA}.slbag-go{background:#F4F1EA;color:#0E1F33;border-color:#F4F1EA}.slbag-go:hover{background:transparent;color:#F4F1EA}.slbag-go.ghost{background:transparent;color:#F4F1EA}.slbag-go.ghost:hover{background:#F4F1EA;color:#0E1F33}.slbag-sum,.slbag-pre,.slbag-pre div{border-color:rgba(244,241,234,.2)}.slbag-two{border-color:rgba(244,241,234,.3)}.slbag-line .warn{color:#D9C7A3}.slbag-head img,.slbag-line img{background:#0E1F33}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  /* ---------- bag button: always in the header ---------- */
  var btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'sl-bag';
  var searchBtn = null;
  function openSearch() {
    if (window.ShorePlus && window.ShorePlus.open) { window.ShorePlus.open('shop'); return; }
    var f = document.querySelector('.sp-fab'); if (f) { f.click(); return; }
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  }
  function mountBtn() {
    if (btn.parentNode) return true;
    var nav = document.querySelector('nav.sl-hdr');
    if (!nav) return false;
    var box = nav.querySelector('.sl-tools');
    if (!box) { box = document.createElement('div'); box.className = 'sl-tools'; nav.insertBefore(box, nav.querySelector('.sl-burger')); }
    searchBtn = document.createElement('button'); searchBtn.type = 'button'; searchBtn.className = 'sl-srch'; searchBtn.setAttribute('aria-label', 'Search ShoreList');
    searchBtn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg><span>Search</span>';
    searchBtn.addEventListener('click', openSearch);
    box.appendChild(searchBtn); box.appendChild(btn);
    return true;
  }
  function paintBtn() {
    var c = count();
    btn.innerHTML = 'Bag (' + c + ')';
    btn.setAttribute('aria-label', 'Open your bag, ' + c + (c === 1 ? ' item' : ' items'));
  }
  paintBtn();
  btn.addEventListener('click', function () { openDrawer(); });
  if (!mountBtn()) {
    /* header not built yet: wait for it, and fall back to a floating button so the bag is never unreachable */
    var tries = 0, iv = setInterval(function () { if (mountBtn() || ++tries > 20) { clearInterval(iv); if (!btn.parentNode) { btn.className = 'slbag-btn'; document.body.appendChild(btn); } } }, 150);
  }

  /* ---------- dialogs ---------- */
  function mk(cls, label, titleId) {
    var d = document.createElement('dialog'); d.className = 'slbag ' + cls;
    /* titleId: the dialog is named by its own heading (the product name) instead of a generic label. */
    if (titleId) d.setAttribute('aria-labelledby', titleId); else d.setAttribute('aria-label', label);
    d.innerHTML = '<button class="slbag-x" type="button" aria-label="Close">Close</button><div class="slbag-in"></div>';
    document.body.appendChild(d);
    d.querySelector('.slbag-x').addEventListener('click', function () { shut(d); });
    d.addEventListener('click', function (e) { if (e.target === d) shut(d); });
    return d;
  }
  function openD(d) { if (d.showModal) { if (!d.open) d.showModal(); } else d.setAttribute('open', ''); }
  function shut(d) { if (d.close) d.close(); else d.removeAttribute('open'); }
  var pick = mk('slbag-pick', 'Choose options', 'slbagPickT');
  var drawer = mk('slbag-drawer', 'Your bag');

  function preBlock(name, cartMode) {
    return '<dl class="slbag-pre">' +
      (wearable(name) ? '<div><dt>Size and fit</dt><dd><a href="/size-guide">Size guide</a></dd></div>' : '') +
      '<div><dt>Delivery</dt><dd><a href="/shipping-returns">Delivery and returns</a></dd></div>' +
      '<div><dt>Made to order</dt><dd>Made after you order, so allow production time before it ships.</dd></div>' +
      '<div><dt>Returns</dt><dd>No returns for change of mind or size preference. Damaged, defective, misprinted or wrong-size items are replaced at no cost if reported within 30 days of delivery. <a href="/shipping-returns">Full details</a></dd></div>' +
      (cartMode ? '' : '<div><dt>Checkout</dt><dd>Shipping and tax are shown at checkout.</dd></div>') + '</dl>';
  }

  /* ---------- option picker ---------- */
  var cur = null;
  var pickRequest = 0;
  function matchVariant() {
    if (!cur) return null;
    return cur.p.variants.filter(function (v) { return v.options.every(function (o, k) { return o === cur.sel[k]; }); })[0] || null;
  }
  function paintPick() {
    var p = cur.p, v = matchVariant();
    var available = p.variants.filter(function (variant) { return variant.available; });
    var body = pick.querySelector('.slbag-in');
    var img = (v && v.image) || cur.img || p.image;
    var h = '<div class="slbag-head">' + (img ? '<img alt="" src="' + esc(img) + '"/>' : '') + '<div><h3 id="slbagPickT">' + esc(cur.name || p.title) + '</h3><div class="slbag-price">' + (v ? money(v.price) : '') + '</div></div></div>';
    p.options.forEach(function (o, k) {
      if (o.values.length === 1 && /^(title|default title)$/i.test(o.name + '')) return;
      h += '<div role="group" aria-labelledby="slbagOpt' + k + '"><span class="slbag-lbl" id="slbagOpt' + k + '">' + esc(o.name) + '</span><div class="slbag-opts">' + o.values.map(function (val) {
        var ok = available.some(function (x) { return x.options[k] === val; });
        return '<button type="button" class="slbag-opt" data-k="' + k + '" data-v="' + esc(val) + '" aria-pressed="' + (cur.sel[k] === val) + '"' + (ok ? '' : ' disabled') + '>' + esc(val) + '</button>';
      }).join('') + '</div></div>';
    });
    var ready = v && v.available;
    var label = available.length ? (v ? 'Sold out in this option' : 'Choose your options') : 'Sold out';
    h += '<button type="button" class="slbag-go" id="slbagAdd"' + (ready ? '' : ' disabled') + '>' + (ready ? 'Add to bag' : label) + '</button>';
    h += '<p class="slbag-msg" role="status" aria-live="polite"></p>';
    h += preBlock(cur.name || p.title, false);
    h += '<p class="slbag-note"><a href="' + esc(cur.url) + '" target="_blank" rel="noopener" style="color:inherit">Full product details</a></p>';
    body.innerHTML = h;
  }
  pick.addEventListener('click', function (e) {
    var o = e.target.closest ? e.target.closest('.slbag-opt') : null;
    if (o && cur) {
      var ok = o.getAttribute('data-k'), ov = o.getAttribute('data-v');
      var index = Number(ok);
      var compatible = cur.p.variants.filter(function (v) { return v.available && v.options[index] === ov; });
      cur.sel[index] = ov;
      /* Keep prior choices that can still form an available combination with the new one. */
      cur.sel.forEach(function (value, k) {
        if (k === index || value == null) return;
        var matches = compatible.filter(function (v) { return v.options[k] === value; });
        if (matches.length) compatible = matches;
        else cur.sel[k] = null;
      });
      paintPick();
      /* the picker was rebuilt: put focus back on the option that was just chosen */
      var again = pick.querySelectorAll('.slbag-opt');
      for (var z = 0; z < again.length; z++) { if (again[z].getAttribute('data-k') === ok && again[z].getAttribute('data-v') === ov) { again[z].focus(); break; } }
      return;
    }
    if (e.target.id === 'slbagAdd' && cur) {
      var v = matchVariant(); if (!v || !v.available) return;
      var c = cur;
      mutate(function () {
        var line = bag.filter(function (l) { return !l.out && !l.goods && String(l.id) === String(v.id); })[0];
        if (line) { line.qty = Math.min(20, line.qty + 1); line.price = v.price; delete line.gone; }
        else bag.push({ id: String(v.id), qty: 1, price: v.price, name: c.name || c.p.title, variant: v.title === 'Default Title' ? '' : v.title, img: v.image || c.img || c.p.image, handle: c.p.handle });
      });
      track('add_to_cart', { currency: 'USD', value: v.price, items: [{ item_id: c.p.handle, item_name: c.name || c.p.title, item_variant: v.title, price: v.price, quantity: 1 }] });
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
    var request = ++pickRequest;
    cur = null;
    pick.querySelector('.slbag-in').innerHTML = '<h3 id="slbagPickT">' + esc(name || 'Loading') + '</h3><p class="slbag-msg" role="status">Loading colors and sizes.</p>';
    openD(pick);
    fetch('/.netlify/functions/shop-product?handle=' + encodeURIComponent(handle))
      .then(function (r) { if (!r.ok) throw new Error('lookup'); return r.json(); })
      .then(function (p) {
        if (request !== pickRequest || !pick.hasAttribute('open')) return;
        if (!p || !p.variants || !p.variants.length) throw new Error('empty');
        cur = { p: p, url: url, name: name, img: img, sel: p.options.map(function (o) { return o.values.length === 1 ? o.values[0] : null; }) };
        if (p.variants.length === 1) cur.sel = p.variants[0].options.slice();
        paintPick();
        /* "seen" means the quick view already sent view_item for this open */
        if (!seen) track('view_item', { currency: 'USD', value: p.variants[0].price, items: [{ item_id: p.handle, item_name: name || p.title, price: p.variants[0].price }] });
      })
      .catch(function () { if (request === pickRequest && pick.hasAttribute('open')) fail(url, name); });
  }

  /* ---------- keep Shopify lines honest: re-check price and availability ---------- */
  var checked = {};
  function refresh() {
    var seenH = {};
    shopLines().forEach(function (l) { if (l.handle && !seenH[l.handle] && !(checked[l.handle] && Date.now() - checked[l.handle] < 60000)) seenH[l.handle] = 1; });
    Object.keys(seenH).forEach(function (h) {
      fetch('/.netlify/functions/shop-product?handle=' + encodeURIComponent(h))
        .then(function (r) { if (!r.ok) throw new Error('lookup'); return r.json(); })
        .then(function (p) {
          if (!p || !p.variants) return;
          checked[h] = Date.now();
          var changed = false;
          mutate(function () {
            bag.forEach(function (l) {
              if (l.out || l.goods || l.handle !== h) return;
              var v = p.variants.filter(function (x) { return String(x.id) === String(l.id); })[0];
              var gone = !v || !v.available;
              if (gone !== !!l.gone) { if (gone) l.gone = true; else delete l.gone; changed = true; }
              if (v && typeof v.price === 'number' && v.price !== l.price) { l.price = v.price; l.moved = true; changed = true; }
            });
          });
          if (changed && drawer.open) { paintDrawer(); }
        })
        .catch(function () { /* offline or function down: keep the bag as it is */ });
    });
  }

  /* ---------- add a Fourthwall link-out line ---------- */
  function addOut(o) {
    if (!o || !o.id || !OUT_RE.test(o.url || '')) return false;
    mutate(function () {
      var id = 'out:' + o.id;
      if (bag.some(function (l) { return l.id === id; })) return;
      bag.push({ out: true, id: id, qty: 1, name: String(o.name || ''), url: o.url, img: o.img || '', price: typeof o.price === 'number' ? o.price : 0, from: o.from === true, store: String(o.store || 'ShoreList Gear') });
    });
    return true;
  }

  /* ---------- add a ShoreList Direct (goods) line ---------- */
  /* o: { item, variant, name, variantLabel, cents, img, lead: [min, max], max }. Returns true when the line joined the bag. */
  function addGoods(o) {
    if (!o || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(o.item || '') || !/^[a-z0-9][a-z0-9-]{0,79}$/.test(o.variant || '') || !Number.isInteger(o.cents) || o.cents <= 0 || !o.name) return false;
    mutate(function () {
      var id = 'goods:' + o.item + ':' + o.variant;
      var cap = Math.min(10, Math.max(1, Math.floor(o.max || 10)));
      var line = bag.filter(function (l) { return l.id === id; })[0];
      if (line) { line.qty = Math.min(cap, line.qty + 1); line.cents = o.cents; }
      else bag.push({ goods: true, id: id, item: o.item, variantId: o.variant, qty: 1, cents: o.cents, price: o.cents / 100, name: String(o.name), variant: String(o.variantLabel || ''), img: o.img || '', cap: cap, lead: Array.isArray(o.lead) && o.lead.length === 2 ? [Math.floor(o.lead[0]), Math.floor(o.lead[1])] : null });
    });
    track('add_to_cart', { currency: 'USD', value: o.cents / 100, items: [{ item_id: o.item, item_name: o.name, item_variant: o.variantLabel, price: o.cents / 100, quantity: 1 }] });
    return true;
  }

  /* ---------- drawer ---------- */
  function shopHtml() {
    var sl = shopLines(); if (!sl.length) return '';
    var gone = sl.some(function (l) { return l.gone; }), n = buyable().reduce(function (a, l) { return a + l.qty; }, 0);
    return '<section class="slbag-grp" aria-labelledby="slbagG1"><h4 id="slbagG1">ShoreList Shop</h4><p class="slbag-gsub">Ships from our Shopify store. These pieces check out together.</p><ul class="slbag-lines">' + sl.map(function (l) {
      var k = bag.indexOf(l);
      return '<li class="slbag-line">' + (l.img ? '<img alt="" src="' + esc(l.img) + '"/>' : '') + '<div><strong>' + esc(l.name) + '</strong><span>' + esc(l.variant || '') + '</span>' +
        (l.gone ? '<span class="warn">No longer available</span>' : (l.moved ? '<span>Price updated to ' + money(l.price) + '</span>' : '')) +
        '<div class="slbag-qty">' + (l.gone ? '' : '<button type="button" data-d="-1" data-k="' + k + '" aria-label="One fewer">&minus;</button><b>' + l.qty + '</b><button type="button" data-d="1" data-k="' + k + '" aria-label="One more">+</button>') + '<button type="button" class="rm" data-rm="' + k + '">Remove</button></div></div><b>' + (l.gone ? '' : money(l.price * l.qty)) + '</b></li>';
    }).join('') + '</ul>' +
      (n ? '<div class="slbag-sum"><span>Subtotal</span><span>' + money(total()) + '</span></div><a class="slbag-go" id="slbagPay" href="' + esc(checkoutUrl()) + '">Check out ShoreList Shop items</a><p class="slbag-note">Shipping and tax are added at checkout.</p>' : '<p class="slbag-note">Nothing here can be checked out right now. Remove the unavailable pieces to continue.</p>') +
      (gone ? '<button type="button" class="slbag-go ghost" data-gone="1">Remove unavailable pieces</button>' : '') + '</section>';
  }
  function goodsHtml() {
    var gl = goodsLines(); if (!gl.length) return '';
    var lead = gl.reduce(function (a, l) { return l.lead ? [Math.max(a[0], l.lead[0]), Math.max(a[1], l.lead[1])] : a; }, [0, 0]);
    return '<section class="slbag-grp" aria-labelledby="slbagG3"><h4 id="slbagG3">ShoreList Direct</h4><p class="slbag-gsub">Made to order and sent to you by our supplier. You pay here on shorelist.net.' + (lead[1] ? ' Allow about ' + lead[0] + ' to ' + lead[1] + ' business days.' : '') + '</p><ul class="slbag-lines">' + gl.map(function (l) {
      var k = bag.indexOf(l);
      return '<li class="slbag-line">' + (l.img ? '<img alt="" src="' + esc(l.img) + '"/>' : '') + '<div><strong>' + esc(l.name) + '</strong><span>' + esc(l.variant || '') + '</span>' +
        (l.moved ? '<span>Price updated to ' + money(l.cents / 100) + '</span>' : '') +
        '<div class="slbag-qty"><button type="button" data-d="-1" data-k="' + k + '" aria-label="One fewer">&minus;</button><b>' + l.qty + '</b><button type="button" data-d="1" data-k="' + k + '" aria-label="One more">+</button><button type="button" class="rm" data-rm="' + k + '">Remove</button></div></div><b>' + money(l.cents * l.qty / 100) + '</b></li>';
    }).join('') + '</ul><div class="slbag-sum"><span>Subtotal</span><span>' + money(goodsTotal()) + '</span></div>' +
      '<button type="button" class="slbag-go" id="slbagGoodsPay">Check out ShoreList Direct items</button><p class="slbag-msg" id="slbagGoodsMsg" role="status" aria-live="polite"></p><p class="slbag-note">Shipping and tax are added at checkout. <a href="/shipping-returns">Delivery and returns</a></p></section>';
  }
  function outHtml() {
    var ol = outLines(); if (!ol.length) return '';
    return '<section class="slbag-grp" aria-labelledby="slbagG2"><h4 id="slbagG2">ShoreList Gear</h4><p class="slbag-gsub">Sold through our second store. Each piece opens on its own page and checks out there, separate from the ShoreList Shop items' + (shopLines().length ? ' above' : '') + '.</p><ul class="slbag-lines">' + ol.map(function (l) {
      var k = bag.indexOf(l);
      return '<li class="slbag-line">' + (l.img ? '<img alt="" src="' + esc(l.img) + '"/>' : '') + '<div><strong>' + esc(l.name) + '</strong><span>' + (l.price ? (l.from ? 'From ' : '') + money(l.price) : '') + '</span><div class="slbag-qty"><a class="slbag-out" href="' + esc(l.url) + '" target="_blank" rel="noopener" data-out="' + esc(l.id) + '">Choose options and buy</a><button type="button" class="rm" data-rm="' + k + '">Remove</button></div></div></li>';
    }).join('') + '</ul></section>';
  }
  function paintDrawer() {
    var body = drawer.querySelector('.slbag-in');
    if (!bag.length) { body.innerHTML = '<h3>Your bag</h3><p class="slbag-msg">Your bag is empty.</p><button type="button" class="slbag-go ghost" data-close="1">Keep shopping</button>'; return; }
    var groups = (shopLines().length ? 1 : 0) + (outLines().length ? 1 : 0) + (goodsLines().length ? 1 : 0);
    body.innerHTML = '<h3>Your bag</h3><div class="slbag-scroll">' +
      (groups > 1 ? '<p class="slbag-two">Your bag has pieces from ' + (groups === 2 ? 'two' : 'three') + ' stores. They check out separately and can arrive separately.</p>' : '') +
      goodsHtml() + shopHtml() + outHtml() +
      preBlock(bag.map(function (l) { return l.name; }).filter(wearable).join(' '), true) + '</div>';
  }
  /* the drawer was rebuilt: put focus back on the same control, or on Close if its line is gone */
  function refocus(sel) { var el = sel ? drawer.querySelector(sel) : null; (el || drawer.querySelector('.slbag-x')).focus(); }
  function openDrawer() {
    load(); paintBtn(); paintDrawer(); openD(drawer); refresh();
    track('view_cart', { currency: 'USD', value: total(), items: gaLines() });
  }
  drawer.addEventListener('click', function (e) {
    var t = e.target.closest ? (e.target.closest('button,a') || e.target) : e.target;
    if (t.hasAttribute && t.hasAttribute('data-close')) { shut(drawer); return; }
    if (t.hasAttribute && t.hasAttribute('data-d')) {
      var dk = +t.getAttribute('data-k'), dd = +t.getAttribute('data-d'), gone = false, rm = null;
      mutate(function () { var l = bag[dk]; if (!l || l.out) return; l.qty = Math.max(0, Math.min(l.goods ? (l.cap || 10) : 20, l.qty + dd)); if (!l.qty) { gone = true; rm = l; bag.splice(dk, 1); } });
      if (gone && rm) track('remove_from_cart', { currency: 'USD', value: rm.price, items: [{ item_id: rm.handle, item_name: rm.name, item_variant: rm.variant, price: rm.price, quantity: 1 }] });
      paintDrawer(); refocus(gone ? null : '[data-d="' + dd + '"][data-k="' + dk + '"]'); return;
    }
    if (t.hasAttribute && t.hasAttribute('data-rm')) {
      var rk = +t.getAttribute('data-rm'), removed = null;
      mutate(function () { removed = bag[rk]; if (removed) bag.splice(rk, 1); });
      if (removed && !removed.out && !removed.goods) track('remove_from_cart', { currency: 'USD', value: removed.price * removed.qty, items: [{ item_id: removed.handle, item_name: removed.name, item_variant: removed.variant, price: removed.price, quantity: removed.qty }] });
      paintDrawer(); refocus(null); return;
    }
    if (t.hasAttribute && t.hasAttribute('data-gone')) { mutate(function () { bag = bag.filter(function (l) { return !l.gone; }); }); paintDrawer(); refocus(null); return; }
    if (t.id === 'slbagGoodsPay') { goodsCheckout(t); return; }
    if (t.id === 'slbagPay') {
      /* Build the link from the bag right now, not from whatever was painted earlier. */
      load();
      if (!buyable().length) { e.preventDefault(); paintDrawer(); return; }
      t.setAttribute('href', checkoutUrl());
      track('begin_checkout', { currency: 'USD', value: total(), items: gaLines() });
    }
  });
  /* ShoreList Direct checkout: send item id, variant id, quantity and the price the shopper saw. The server decides the real price. */
  function goodsCheckout(btnEl) {
    load();
    var gl = goodsLines(), msg = drawer.querySelector('#slbagGoodsMsg');
    if (!gl.length) { paintDrawer(); return; }
    btnEl.disabled = true; if (msg) msg.textContent = 'Starting secure checkout.';
    track('begin_checkout', { currency: 'USD', value: goodsTotal(), items: gl.map(function (l) { return { item_id: l.item, item_name: l.name, item_variant: l.variant, price: l.cents / 100, quantity: l.qty }; }) });
    var body = { lines: gl.map(function (l) { return { id: l.item, variant: l.variantId, qty: l.qty, expect_cents: l.cents }; }) };
    try { if (window.ShoreAttrib && window.ShoreAttrib.get) body.attrib = window.ShoreAttrib.get(); } catch (e) {}
    fetch('/.netlify/functions/create-goods-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json().then(function (d) { return { ok: r.ok, status: r.status, d: d || {} }; }); })
      .then(function (x) {
        if (x.ok && x.d.url && /^https:\/\/checkout\.stripe\.com\//.test(x.d.url)) { location.href = x.d.url; return; }
        if (x.d.code === 'price_changed' && Array.isArray(x.d.lines)) {
          mutate(function () { x.d.lines.forEach(function (n) { bag.forEach(function (l) { if (l.goods && l.item === n.id && l.variantId === n.variant) { l.cents = n.price_cents; l.price = n.price_cents / 100; l.moved = true; } }); }); });
        } else if (x.d.code === 'unavailable' || x.d.code === 'bad_variant') {
          mutate(function () { bag = bag.filter(function (l) { return !l.goods; }); });
        }
        paintDrawer();
        var m2 = drawer.querySelector('#slbagGoodsMsg'); if (m2) m2.textContent = x.d.error || 'Checkout could not be started. Please try again.';
        var b2 = drawer.querySelector('#slbagGoodsPay'); if (b2) b2.disabled = false;
      })
      .catch(function () { var m3 = drawer.querySelector('#slbagGoodsMsg'); if (m3) m3.textContent = 'We could not reach checkout. Check your connection and try again.'; btnEl.disabled = false; });
  }
  /* A change in another tab shows up here without a reload. */
  window.addEventListener('storage', function (e) { if (e.key !== KEY && e.key !== null) return; load(); paintBtn(); if (drawer.open) paintDrawer(); });

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

  window.ShoreBag = { open: openDrawer, count: count, addOut: addOut, addGoods: addGoods };
})();
