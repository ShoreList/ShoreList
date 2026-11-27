/* Starts widgets.js, and the guide chat when the launcher is on the page.
   A click loads them immediately. Otherwise they wait until 5 seconds after
   the load event, then requestIdleCallback, so they do not run during the
   largest paint. The guide stylesheet stays print-only until that same moment. */
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
  function enableGuideCss() {
    var links = document.querySelectorAll('link[href="/shore-guide.css"]');
    for (var i = 0; i < links.length; i++) if (links[i].media === 'print') links[i].media = 'all';
  }
  function load() {
    if (started) return;
    started = true;
    enableGuideCss();
    add('/front-door.js');
    var boot = document.querySelector('script[src="/guide-boot.js"]');
    if (boot && boot.getAttribute('data-widgets') === '1') add('/widgets.js');
    var after = boot && boot.getAttribute('data-after');
    if (after) after.split(/[,\s]+/).forEach(function (src) {
      if (!src) return;
      add(src.charAt(0) === '/' ? src : '/' + src);
    });
  }
  function later() {
    setTimeout(function () {
      if (window.requestIdleCallback) requestIdleCallback(load);
      else load();
    }, 5000);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();
