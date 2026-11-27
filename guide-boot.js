/* Starts widgets.js, and the guide chat when the launcher is on the page.
   A click loads them immediately. Otherwise they start on requestIdleCallback
   after the load event, so they do not run before the largest paint. */
(function () {
  var started = false;
  function add(src) {
    if (document.querySelector('script[data-sl-src="' + src + '"]')) return;
    var s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.defer = true;
    s.setAttribute('data-sl-src', src);
    document.body.appendChild(s);
  }
  function load() {
    if (started) return;
    started = true;
    var boot = document.querySelector('script[src="/guide-boot.js"]');
    if (boot && boot.getAttribute('data-widgets') === '1') add('/widgets.js');
    if (document.getElementById('slgOpen')) add('/shore-guide.js');
    var after = boot && boot.getAttribute('data-after');
    if (after) after.split(/[,\s]+/).forEach(function (src) {
      if (!src) return;
      add(src.charAt(0) === '/' ? src : '/' + src);
    });
  }
  var btn = document.getElementById('slgOpen');
  if (btn) btn.addEventListener('click', function () { window.__slgWantOpen = true; load(); });
  function later() {
    if (window.requestIdleCallback) requestIdleCallback(load, { timeout: 4000 });
    else setTimeout(load, 4000);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();
