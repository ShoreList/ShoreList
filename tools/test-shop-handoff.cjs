// Run with Playwright installed. Visits Shopify checkout and stops before payment.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const BASE = process.env.SHORELIST_TEST_ORIGIN || 'https://shorelist.net';
const HANDLE = 'carolina-beach-lifeguard-stand-embroidered-crewneck-sweatshirt';
const SELLER = 'https://shorelist.myshopify.com';
const promo = process.argv[2];
const codes = ['SHORE15', 'SHOREFRIDAY15', 'SHORECYBER15', 'SHOREWELCOME10'];
assert.ok(!promo || codes.includes(promo), 'Use a known public discount code');

async function run() {
  const browser = await chromium.launch({
    executablePath: process.env.CHROME_PATH || undefined,
    args: ['--no-sandbox'],
  });
  try {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    page.setDefaultTimeout(20000);
    await page.goto(new URL('/shop', BASE).href, { waitUntil: 'domcontentloaded' });

    const bag = page.getByRole('button', { name: /open your bag/i });
    await bag.focus();
    await page.keyboard.press('Enter');
    await page.getByText('Your bag is empty.', { exact: true }).waitFor();
    await page.keyboard.press('Escape');
    await page.locator('dialog.slbag-drawer').waitFor({ state: 'hidden' });
    assert.ok(await bag.evaluate((button) => button === document.activeElement), 'keyboard focus returns to the bag');

    await page.locator('[data-qv="' + HANDLE + '"]').first().click();
    const lookup = page.waitForResponse((r) => r.url().includes('/shop-product?handle=' + HANDLE));
    await page.locator('#qvb').click();
    const response = await lookup;
    assert.ok(response.ok(), 'live product lookup should succeed');
    const product = await response.json();
    const variant = product.variants.find((row) => row.available);
    assert.ok(variant, 'the product has an available variant');
    const picker = page.locator('dialog.slbag-pick');
    for (const [index, value] of variant.options.entries()) {
      const options = picker.locator('.slbag-opt[data-k="' + index + '"]');
      await options.first().waitFor();
      await options.and(page.getByRole('button', { name: value, exact: true })).click();
    }
    const add = picker.locator('#slbagAdd');
    const selected = (await picker.getByRole('button', { pressed: true }).allTextContents()).map((label) => label.trim());
    assert.deepEqual(selected, variant.options);
    assert.ok(await add.isEnabled(), 'the shopper-selected variant is available');
    await add.click();
    const drawer = page.locator('dialog.slbag-drawer');
    await drawer.getByRole('button', { name: 'One more', exact: true }).click();
    const pay = drawer.locator('#slbagPay');
    assert.equal(await pay.getAttribute('href'), SELLER + '/cart/' + variant.id + ':2');
    assert.equal(await drawer.locator('.slbag-sum span').last().textContent(), '$' + (variant.price * 2).toFixed(2).replace(/\.00$/, ''));
    const bounds = await drawer.boundingBox();
    assert.ok(bounds && bounds.width <= 390, 'bag fits at 390px');

    const checkoutRequest = page.waitForRequest((r) => r.isNavigationRequest() && r.url() === SELLER + '/cart/' + variant.id + ':2');
    await pay.click();
    await checkoutRequest;
    await page.waitForURL((url) => /\/(checkouts?|checkout)\//.test(url.pathname));
    await page.getByText(product.title, { exact: true }).first().waitFor();
    if (promo) {
      await page.getByRole('textbox', { name: /discount code/i }).fill(promo);
      await page.getByRole('button', { name: /apply discount code/i }).click();
      await page.getByRole('button', { name: 'Remove ' + promo }).waitFor();
    }
    console.log('Verified Shopify checkout handoff for variant ' + variant.id + ', quantity 2.');
    if (promo) console.log('Verified checkout accepted ' + promo + '.');
  } finally {
    await browser.close();
  }
}

run().catch((error) => {
  // Checkout URLs are session-bound. Only emit the unspecific error name or our own assertions.
  const networkError = /net::ERR_[A-Z_]+/.exec(error.message)?.[0];
  console.error(error.code === 'ERR_ASSERTION' ? error.message : 'Browser handoff check failed: ' + (networkError || error.name));
  process.exitCode = 1;
});
