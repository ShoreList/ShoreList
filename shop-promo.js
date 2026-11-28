/* Shop sale state. The banner itself is in the HTML (home and /shop) so it cannot push the page after load.
   This script only sets data-sale on the document, before paint when it is inlined, and again if a tab stays open
   across a window boundary. Late November Eastern is EST, UTC-5. */
(function () {
  var SALES = [
    { id: '1', code: 'SHORE15',
      start: Date.UTC(2026, 10, 25, 4, 0, 0), end: Date.UTC(2026, 10, 27, 4, 59, 0) },
    { id: 'bf', code: 'SHOREFRIDAY15',
      start: Date.UTC(2026, 10, 27, 5, 0, 0), end: Date.UTC(2026, 10, 28, 4, 59, 0) },
    { id: 'cm', code: 'SHORECYBER15',
      start: Date.UTC(2026, 10, 30, 5, 0, 0), end: Date.UTC(2026, 11, 1, 4, 59, 0) },
    /* Christmas order-by note. Not a sale. It must stay LAST so a sale above always wins.
       It starts the instant Cyber Monday ends and hides at Dec 8, 12:00 AM EST. */
    { id: 'xmas', code: 'xmas',
      start: Date.UTC(2026, 11, 1, 4, 59, 0), end: Date.UTC(2026, 11, 8, 5, 0, 0) }
  ];
  var root = document.documentElement;
  if (!root || !root.setAttribute) return;
  var timer;

  function codeAt(now) {
    var code = 'off';
    for (var i = 0; i < SALES.length; i++) {
      var sale = SALES[i];
      if (now >= sale.start && now < sale.end) { code = sale.code; break; }
    }
    return code;
  }

  function refresh() {
    clearTimeout(timer);
    timer = null;
    var now = Date.now(), next = Infinity;
    for (var i = 0; i < SALES.length; i++) {
      var sale = SALES[i];
      if (now < sale.start) next = Math.min(next, sale.start);
      else if (now < sale.end) next = Math.min(next, sale.end);
    }
    var code = codeAt(now);
    if (root.getAttribute('data-sale') !== code) root.setAttribute('data-sale', code);
    if (Number.isFinite(next)) timer = setTimeout(refresh, Math.min(next - now, 2147483647));
  }

  document.addEventListener('visibilitychange', function () {
    if (!document.hidden) refresh();
  });
  window.addEventListener('pageshow', refresh);
  refresh();
})();
