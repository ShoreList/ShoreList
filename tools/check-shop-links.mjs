// Check direct-to-merchant product pages signed out. A 200 alone does not establish a product page.
import fs from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';
import { pathToFileURL } from 'node:url';

const attr = (tag, name) => tag.match(new RegExp('\\s' + name + '\\s*=\\s*["\']([^"\']+)["\']', 'i'))?.[1];
const productRoute = (url) => url.origin + url.pathname.replace(/\/+$/, '');
const rateLimited = 'Merchant rate-limited verification (429)';
const nightlyShopifyCount = 12;

export function nightlyTargets(items, utcDay) {
  const shopify = [...new Set(items.filter((item) => item.store === 'shopify').map((item) => item.url))];
  const start = (utcDay * nightlyShopifyCount) % Math.max(1, shopify.length);
  const selected = new Set(shopify.concat(shopify).slice(start, start + Math.min(shopify.length, nightlyShopifyCount)));
  return items.filter((item) => item.store !== 'shopify' || selected.has(item.url));
}

function retryDelay(header) {
  if (!header) return 2000;
  if (/^\d+$/.test(header)) return Number(header) * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? 2000 : Math.max(0, date - Date.now());
}

export async function checkProductPage(value, allowedHosts, fetchPage = fetch, wait = delay) {
  let expected;
  try { expected = new URL(value); }
  catch { return 'Invalid product URL'; }
  if (expected.protocol !== 'https:' || !allowedHosts.includes(expected.host) || expected.username || expected.password ||
      !/^\/products\/[^/]+\/?$/.test(expected.pathname)) return 'Unapproved merchant product URL';
  try {
    const request = () => fetchPage(expected, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
    let response = await request();
    if (response.status === 429) {
      const pause = retryDelay(response.headers.get('retry-after'));
      if (pause <= 20000) {
        await response.body?.cancel();
        await wait(pause);
        response = await request();
      }
      if (response.status === 429) {
        await response.body?.cancel();
        return rateLimited;
      }
    }
    const resolved = new URL(response.url);
    if (response.status !== 200 || resolved.username || resolved.password || productRoute(resolved) !== productRoute(expected) ||
      !/^text\/html(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) {
      await response.body?.cancel();
      if (response.status !== 200) return 'Merchant returned ' + response.status;
      return 'Merchant did not return the requested product page';
    }

    const html = await response.text();
    const head = html.match(/<head(?:\s[^>]*)?>([\s\S]*?)<\/head>/i)?.[1] ?? '';
    const canonical = (head.match(/<link\b[^>]+>/gi) ?? []).find((tag) => attr(tag, 'rel') === 'canonical');
    const product = (head.match(/<meta\b[^>]+>/gi) ?? []).find((tag) => attr(tag, 'property') === 'og:type');
    const href = canonical && attr(canonical, 'href');
    const canonicalUrl = href && new URL(href, resolved);
    if (!canonicalUrl || canonicalUrl.username || canonicalUrl.password ||
        productRoute(canonicalUrl) !== productRoute(expected) || !product || attr(product, 'content') !== 'product') {
      return 'Missing or mismatched product metadata';
    }
    return null;
  } catch {
    return 'Merchant response could not be verified';
  }
}

async function main() {
  const catalog = JSON.parse(fs.readFileSync(new URL('../shop-catalog.json', import.meta.url), 'utf8'));
  // Report each catalog card even if several cards share one merchant page.
  const allItems = catalog.items.filter((item) => item.store === 'shopify' || item.store === 'fourthwall');
  const nightly = process.argv.includes('--nightly');
  const items = nightly ? nightlyTargets(allItems, Math.floor(Date.now() / 86400000)) : allItems;
  const urls = [...new Set(items.map((item) => item.url))];
  const results = new Map();
  const pausedHosts = new Set();
  let skipped = 0;
  // Keep signed-out merchant monitoring below a sustained request burst.
  for (const url of urls) {
    const host = URL.parse(url)?.host;
    if (pausedHosts.has(host)) {
      results.set(url, 'Merchant check paused after rate limiting');
      skipped++;
      continue;
    }
    const issue = await checkProductPage(url, catalog.allowedHosts);
    results.set(url, issue);
    if (issue === rateLimited) pausedHosts.add(host);
    await delay(400);
  }
  const problems = items.flatMap((item) => {
    const issue = results.get(item.url);
    return issue ? ['- ' + item.id + ': ' + issue] : [];
  });
  const report = ['## Merchant product destinations', '',
    nightly ? 'Nightly rotation checks Shopify product pages in batches and every Fourthwall product page.' : 'Full catalog mode.',
    items.length + ' cards, ' + (urls.length - skipped) + ' of ' + urls.length + ' destinations requested. ' +
    problems.length + ' card failures or unavailable checks.', ...problems].join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '\n' + report + '\n');
  if (problems.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
