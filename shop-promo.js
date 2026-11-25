/* Shore Friday promo: shows only Nov 27 00:00 to Nov 30 23:59 US Eastern 2026 (EST, UTC-5).
   Preview any time with ?promo-preview=1. Remove after the sale. */
(function () {
  var START = Date.UTC(2026, 10, 27, 5, 0, 0), END = Date.UTC(2026, 11, 1, 5, 0, 0);
  var now = Date.now(), preview = /[?&]promo-preview=1(&|$)/.test(location.search);
  if (!preview && (now < START || now >= END)) return;
  var main = document.getElementById('main'); if (!main) return;
  var bar = document.createElement('aside');
  bar.setAttribute('aria-label', 'Shore Friday offer');
  bar.style.cssText = 'background:#0E1F33;color:#fff;text-align:center;padding:14px 16px;font:600 15px/1.4 "DM Sans",system-ui,sans-serif;letter-spacing:.01em';
  bar.innerHTML = '<strong>Shore Friday:</strong> 15% off the whole shop with code <strong style="border:1px solid #fff;border-radius:6px;padding:1px 8px;margin:0 2px">SHORE15</strong> Nov 27 to 30. Enter it at checkout.';
  main.insertBefore(bar, main.firstChild);
  var hero = document.querySelector('.hero-cta');
  if (hero) { var p = document.createElement('p'); p.style.cssText = 'margin:14px 0 0;font:600 15px/1.4 "DM Sans",system-ui,sans-serif'; p.textContent = 'Shore Friday: 15% off with code SHORE15, Nov 27 to 30.'; hero.parentNode.insertBefore(p, hero.nextSibling); }
})();
