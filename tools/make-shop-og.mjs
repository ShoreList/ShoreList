// Renders the 1200x630 share cards for the shop town pages: node tools/make-shop-og.mjs
// Needs Playwright with Chromium. Brand-only art (no photos, no third-party names), so the files are safe to reuse in ads.
import { chromium } from 'playwright';
import fs from 'node:fs';

const cat = JSON.parse(fs.readFileSync(new URL('../shop-catalog.json', import.meta.url), 'utf8'));
const ICON = {
  'wrightsville-beach': '<path d="M32 4v34M32 6c10 6 16 18 16 30H32zM30 12C22 18 16 26 14 36h16z"/><path d="M8 40h48l-6 6H14z"/>',
  'carolina-beach': '<path d="M6 40h52M12 40V22M24 40V22M36 40V22M48 40V22M8 22h48M8 30h48"/><path d="M4 44c6-4 10 4 16 0s10 4 16 0 10 4 16 0 6 2 8 0"/>',
  'kure-beach': '<path d="M20 30c0-9 6-13 12-13s12 4 12 13-5 9-12 9-12 0-12-9zM21 33l-8 4M22 37l-7 6M43 33l8 4M42 37l7 6M23 23l-7-7M41 23l7-7M16 16c-5 0-8-4-7-8 4 0 8 2 10 5M48 16c5 0 8-4 7-8-4 0-8 2-10 5M29 18v-4M35 18v-4"/>',
  wilmington: '<path d="M32 4v34M32 6c10 6 16 18 16 30H32zM30 12C22 18 16 26 14 36h16z"/><path d="M4 44c6-4 10 4 16 0s10 4 16 0 10 4 16 0 6 2 8 0"/>',
};
const tag = { 'wrightsville-beach': 'Sloops, marinas and the sound', 'carolina-beach': 'The boardwalk at blue hour', 'kure-beach': 'The Atlantic blue crab', wilmington: 'For the whole coast' };
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
for (const t of cat.shelves.filter((s) => s.town)) {
  const html = `<html><body style="margin:0;width:1200px;height:630px;background:#0E1F33;color:#F4F1EA;font-family:Georgia,'Times New Roman',serif;position:relative;overflow:hidden">
<div style="position:absolute;left:0;right:0;top:0;height:14px;background:repeating-linear-gradient(115deg,#D9C7A3 0 9px,#0E1F33 9px 13px,#D9C7A3 13px 22px,transparent 22px 26px);opacity:.8"></div>
<svg viewBox="0 0 64 48" style="position:absolute;right:90px;top:120px;width:380px;height:285px;fill:none;stroke:#D9C7A3;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round">${ICON[t.id] || ICON.wilmington}</svg>
<div style="position:absolute;left:80px;top:150px;width:640px">
<div style="font:700 22px Arial,sans-serif;letter-spacing:.28em;text-transform:uppercase;color:#C9D3DB">The ShoreList Shop</div>
<div style="font-size:92px;line-height:1.02;font-weight:700;margin-top:22px">${t.name}</div>
<div style="font:30px Arial,sans-serif;margin-top:26px;color:#D9C7A3">${tag[t.id] || ''}</div></div>
<div style="position:absolute;left:80px;bottom:56px;font:700 22px Arial,sans-serif;letter-spacing:.2em;text-transform:uppercase;color:#C9D3DB">Made to order &middot; shorelist.net/shop</div></body></html>`;
  await page.setContent(html);
  await page.screenshot({ path: new URL(`../og-shop-${t.id}.jpg`, import.meta.url).pathname, type: 'jpeg', quality: 86 });
  console.log('wrote og-shop-' + t.id + '.jpg');
}
await browser.close();
