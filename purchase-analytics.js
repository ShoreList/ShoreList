/* ShoreList GA4 purchase event for the three success pages.
   Analytics only: it reads values the page already received from its existing session lookup, sends nothing anywhere
   except the page's own gtag, and adds no endpoint. Fires once per checkout session (sessionStorage guard).
   The Stripe session id is a secret that unlocks paid downloads, so it is never sent to GA: transaction_id is a
   one-way SHA-256 digest of it. Honors Global Privacy Control, Do Not Track and the site opt-out key. */
(function () {
  'use strict';
  var w = window;
  function blocked() {
    try {
      var n = w.navigator || {};
      if (n.globalPrivacyControl === true || n.doNotTrack === '1' || w.doNotTrack === '1' || n.msDoNotTrack === '1') return true;
      try { if (w.localStorage.getItem('sl-analytics-optout') === '1') return true; } catch (e) {}
    } catch (e) {}
    return false;
  }
  function hex(buf) {
    var a = new Uint8Array(buf), s = '';
    for (var i = 0; i < a.length; i++) s += (a[i] < 16 ? '0' : '') + a[i].toString(16);
    return s;
  }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60); }
  var fired = false;
  /* sessionId: the cs_ id from the URL. p: { value (USD number), tax, shipping, items: [{item_id,item_name,...}] }.
     Does nothing when there is no usable value: it never invents numbers. */
  w.slPurchase = function (sessionId, p) {
    try {
      if (fired || !p || typeof w.gtag !== 'function' || blocked()) return;
      if (!(typeof p.value === 'number' && isFinite(p.value) && p.value >= 0)) return;
      if (!w.crypto || !w.crypto.subtle || !w.TextEncoder) return;
      var key = 'sl-purchase-' + String(sessionId).slice(-24);
      var seen = false;
      try { seen = w.sessionStorage.getItem(key) === '1'; } catch (e) {}
      if (seen) return;
      fired = true;
      w.crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(sessionId))).then(function (d) {
        var ev = { transaction_id: 'sl_' + hex(d).slice(0, 32), value: p.value, currency: 'USD' };
        if (typeof p.tax === 'number' && isFinite(p.tax)) ev.tax = p.tax;
        if (typeof p.shipping === 'number' && isFinite(p.shipping)) ev.shipping = p.shipping;
        if (p.items && p.items.length) ev.items = p.items.slice(0, 50);
        w.gtag('event', 'purchase', ev);
        try { w.sessionStorage.setItem(key, '1'); } catch (e) {}
      }, function () { fired = false; });
    } catch (e) {}
  };
  w.slPurchaseSlug = slug;
})();
