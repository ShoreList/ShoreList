/* ShoreList shop analytics helper. Tiny, consent-respecting, no-op by default.
   It sends GA4 ecommerce events through the page's own gtag/dataLayer. It never loads gtag.js and never sets a cookie.
   Turn it on by naming the GA4 id on the script tag:
     <script src="/shop-analytics.js" data-ga-id="G-XXXXXXXXXX" defer></script>
   (window.SHORELIST_GA_ID or <meta name="shorelist-ga-id" content="G-..."> also work.) With no id, every call does nothing.
   Stays silent when the browser sends Global Privacy Control or Do Not Track, or when the visitor has opted out here.
   Add data-require-consent="true" to stay silent until ShopAnalytics.setConsent(true) is called.
   Hook names are documented in plans/shop-analytics-hooks.md. */
(function () {
  'use strict';
  var w = window, d = document;
  var script = d.currentScript;
  var cfg = (script && script.getAttribute('data-ga-id')) || w.SHORELIST_GA_ID || '';
  if (!cfg) { var m = d.querySelector('meta[name="shorelist-ga-id"]'); cfg = m ? m.getAttribute('content') || '' : ''; }
  var GA_ID = /^G-[A-Z0-9]{4,}$/i.test(cfg) ? cfg : '';
  var needConsent = !!(script && script.getAttribute('data-require-consent') === 'true');
  var consent = !needConsent;
  var KEY = 'sl-analytics-optout';
  var seenLists = {};
  var MAX_ITEMS = 50;

  function store(fn) { try { return fn(w.localStorage); } catch (e) { return null; } }
  function optedOut() { return store(function (s) { return s.getItem(KEY) === '1'; }) === true; }
  function browserSaysNo() {
    var n = w.navigator || {};
    return n.globalPrivacyControl === true || n.doNotTrack === '1' || w.doNotTrack === '1' || n.msDoNotTrack === '1';
  }
  function active() { return !!GA_ID && consent && !browserSaysNo() && !optedOut(); }

  function send() {
    try {
      if (typeof w.gtag === 'function') { w.gtag.apply(w, arguments); return; }
      (w.dataLayer = w.dataLayer || []).push(arguments);
    } catch (e) {}
  }
  function fire(name, params) { if (active()) send('event', name, params || {}); }

  function num(v) { var n = Number(v); return isFinite(n) ? n : undefined; }
  /* Catalog item -> GA4 item. Accepts the shop-catalog.json shape; extra fields are ignored. */
  function toItem(it, index, listName) {
    if (!it) return null;
    var o = { item_id: String(it.id || it.item_id || ''), item_name: String(it.name || it.item_name || ''), item_brand: 'ShoreList' };
    var price = num(it.price); if (price !== undefined) o.price = price;
    if (it.collection || it.item_category) o.item_category = String(it.collection || it.item_category);
    if (it.town || it.item_category2) o.item_category2 = String(it.town || it.item_category2);
    if (it.variant || it.item_variant) o.item_variant = String(it.variant || it.item_variant);
    if (it.store) o.store = String(it.store);
    var q = num(it.quantity); if (q) o.quantity = q;
    if (index !== undefined) o.index = index;
    if (listName) { o.item_list_name = listName; }
    return o.item_id ? o : null;
  }
  function toItems(list, listName) {
    var out = [];
    for (var i = 0; i < list.length && out.length < MAX_ITEMS; i++) { var o = toItem(list[i], i, listName); if (o) out.push(o); }
    return out;
  }
  function total(items) { var t = 0; for (var i = 0; i < items.length; i++) t += (items[i].price || 0) * (items[i].quantity || 1); return Math.round(t * 100) / 100; }

  var API = {
    enabled: active,
    /* A list of products came into view. Once per list name per page view. */
    viewItemList: function (listName, items) {
      listName = String(listName || 'shop');
      if (seenLists[listName] || !items || !items.length) return;
      seenLists[listName] = 1;
      fire('view_item_list', { item_list_name: listName, items: toItems(items, listName) });
    },
    /* A product card was chosen (click or quick view open). */
    selectItem: function (listName, item) {
      var it = toItem(item, undefined, listName); if (!it) return;
      fire('select_item', { item_list_name: String(listName || 'shop'), items: [it] });
    },
    /* One item added to the bag. extra: { variant, quantity, store }. */
    addToCart: function (item, extra) {
      var src = {}, k; for (k in (item || {})) src[k] = item[k]; for (k in (extra || {})) src[k] = extra[k];
      var it = toItem(src); if (!it) return;
      if (!it.quantity) it.quantity = 1;
      fire('add_to_cart', { currency: 'USD', value: total([it]), items: [it] });
    },
    /* Checkout handoff. store: 'shopify' | 'fourthwall' | 'stripe'. */
    beginCheckout: function (items, store_) {
      var its = toItems(items || []); if (!its.length) return;
      var p = { currency: 'USD', value: total(its), items: its }; if (store_) p.store = String(store_);
      fire('begin_checkout', p);
    },
    /* Tidebot opened. source: 'launcher' | 'picks' | 'search' or any short label. */
    tidebotOpen: function (source) { fire('tidebot_open', { source: String(source || 'launcher').slice(0, 40) }); },
    /* Consent and opt-out. */
    setConsent: function (yes) { consent = !!yes; },
    optOut: function () { store(function (s) { s.setItem(KEY, '1'); }); },
    optIn: function () { store(function (s) { s.removeItem(KEY); }); },
    _toItem: toItem
  };
  w.ShopAnalytics = API;

  /* Optional decoupled hooks: d.dispatchEvent(new CustomEvent('shopanalytics:add_to_cart', { detail: { item: {...}, extra: {...} } })) */
  var map = {
    view_item_list: function (x) { API.viewItemList(x.list, x.items); },
    select_item: function (x) { API.selectItem(x.list, x.item); },
    add_to_cart: function (x) { API.addToCart(x.item, x.extra); },
    begin_checkout: function (x) { API.beginCheckout(x.items, x.store); },
    tidebot_open: function (x) { API.tidebotOpen(x.source); }
  };
  Object.keys(map).forEach(function (n) {
    d.addEventListener('shopanalytics:' + n, function (e) { try { map[n](e.detail || {}); } catch (err) {} });
  });
})();
