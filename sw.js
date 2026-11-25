/* ShoreList service worker. Deliberately conservative:
   - never touches checkout, dashboard, success, Stripe or any serverless function
   - HTML: network first, falls back to cache, then /offline.html
   - scripts, styles and JSON: network first with cache fallback; images and fonts: cache first
   Bump VERSION on each deploy that changes cached shell files. */
const VERSION = 'sl-v267-2026-11-25';
const SHELL = ['/offline.html', '/shore-plus.js', '/search-index.json', '/icons/icon-192.png'];
const SKIP = /^\/(\.netlify|dashboard|success|guide-success|goods-success|api)\b/;

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;       // never cache third parties (Stripe, fonts, maps, analytics)
  if (SKIP.test(url.pathname)) return;
  if (url.pathname === '/sw.js') return;

  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match('/offline.html')))
    );
    return;
  }

  // Code and data: network first, so a deploy never pairs new HTML with old scripts, styles or JSON. Cache is the offline fallback.
  if (/\.(css|js|json|webmanifest)$/i.test(url.pathname)) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  // Images and fonts: cache first, refreshed in the background.
  if (/\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname)) {
    e.respondWith(
      caches.match(req).then((hit) => {
        const net = fetch(req).then((res) => {
          if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
          return res;
        }).catch(() => hit);
        return hit || net;
      })
    );
  }
});
