(function () {
  'use strict';
  var buy = document.getElementById('fourthwall-buy');
  var status = document.getElementById('fourthwall-status');
  var checkout = 'https://shorelist-shop.fourthwall.com/cart/checkout?products=fbd55e4d-f4ab-447b-9f82-09612511ad2b:1&currency=USD';

  var opts = typeof AbortSignal.timeout === 'function' ? { signal: AbortSignal.timeout(5000) } : {};
  fetch('/.netlify/functions/fourthwall-market-tote', opts)
    .then(function (response) {
      if (response.ok) return response.json();
    })
    .then(function (product) {
      if (!product) return;
      if (product.available === false) {
        status.textContent = 'Currently unavailable';
        return;
      }
      if (product.available !== true || !Number.isSafeInteger(product.cents) || product.cents < 0) return;
      status.textContent = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.cents / 100);
      // Preserve the destination of a link a keyboard shopper has already focused.
      if (document.activeElement === buy) return;
      buy.href = checkout;
      buy.textContent = 'Checkout on Fourthwall';
    })
    .catch(function () {
      // The original product link works independently of this request.
    });
}());
