/* Loads non-critical scripts after the page load, on requestIdleCallback,
   or on the first tap if the visitor acts sooner. A setTimeout is the fallback
   when requestIdleCallback is missing. */
(function () {
  var started = false;
  function add(node) {
    var src = node.getAttribute('data-idle');
    if (!src || document.querySelector('script[data-sl-src="' + src + '"]')) return;
    var s = document.createElement('script');
    for (var i = 0; i < node.attributes.length; i++) {
      var a = node.attributes[i];
      if (a.name === 'data-idle') continue;
      s.setAttribute(a.name, a.value);
    }
    s.src = src;
    s.async = false;
    s.setAttribute('data-sl-src', src);
    document.body.appendChild(s);
  }
  function load() {
    if (started) return;
    started = true;
    var nodes = document.querySelectorAll('script[data-idle]');
    for (var i = 0; i < nodes.length; i++) add(nodes[i]);
  }
  document.addEventListener('pointerdown', load, { once: true, capture: true, passive: true });
  function later() {
    if (window.requestIdleCallback) requestIdleCallback(load);
    else setTimeout(load, 1);
  }
  if (document.readyState === 'complete') later();
  else window.addEventListener('load', later);
})();
