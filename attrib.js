/* ShoreList booking-source attribution. No cookies, no personal data, nothing leaves the browser until checkout starts.
   Records the FIRST touch of a visit (utm_source, utm_medium, utm_campaign, ref, landing path, referrer host) in
   sessionStorage (this tab only; gone when it closes). window.ShoreAttrib.get() returns a small object of short
   strings for the checkout request; the server re-validates every field (allowlist, length cap, sanitize). */
(function () {
  'use strict';
  if (window.ShoreAttrib) return;
  var KEY = 'sl_attr_v1', MEM = null;
  var clean = function (v, max) {
    return String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9._~:\/ +-]+/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
  };
  function read() {
    try { var s = window.sessionStorage.getItem(KEY); if (s) { var o = JSON.parse(s); if (o && typeof o === 'object') return o; } } catch (e) { /* storage blocked */ }
    return MEM;
  }
  function write(o) {
    MEM = o;
    try { window.sessionStorage.setItem(KEY, JSON.stringify(o)); } catch (e) { /* storage blocked: keep it in memory for this page */ }
  }
  function capture() {
    var q = {};
    try { new URLSearchParams(window.location.search).forEach(function (v, k) { if (!(k in q)) q[k] = v; }); } catch (e) { /* old browser */ }
    var host = '';
    try { if (document.referrer) { var u = new URL(document.referrer); if (u.host !== window.location.host) host = u.hostname.replace(/^www\./, ''); } } catch (e) { /* bad referrer */ }
    var o = {
      utm_source: clean(q.utm_source, 60), utm_medium: clean(q.utm_medium, 60), utm_campaign: clean(q.utm_campaign, 80),
      ref: clean(q.ref, 60), landing: clean(window.location.pathname, 100), referrer_host: clean(host, 80),
    };
    Object.keys(o).forEach(function (k) { if (!o[k]) delete o[k]; });
    return o;
  }
  var first = read();
  if (!first) { first = capture(); write(first); } // first touch wins: later pages and later links never overwrite it
  window.ShoreAttrib = {
    get: function () {
      var o = read() || first, out = {};
      Object.keys(o).forEach(function (k) { if (typeof o[k] === 'string' && o[k]) out[k] = o[k]; });
      return out;
    },
  };
})();
