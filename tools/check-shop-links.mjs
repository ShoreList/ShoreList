// Check direct-to-merchant product pages signed out. A 200 alone does not establish a product page.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';

const attr = (tag, name) => tag.match(new RegExp('\\s' + name + '\\s*=\\s*["\']([^"\']+)["\']', 'i'))?.[1];
const productRoute = (url) => url.origin + url.pathname.replace(/\/+$/, '');

export async function checkProductPage(value, allowedHosts, fetchPage = fetch) {
  let expected;
  try { expected = new URL(value); }
  catch { return 'Invalid product URL'; }
  if (expected.protocol !== 'https:' || !allowedHosts.includes(expected.host) || expected.username || expected.password ||
      !/^\/products\/[^/]+\/?$/.test(expected.pathname)) return 'Unapproved merchant product URL';
  try {
    const response = await fetchPage(expected, {
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(15000),
    });
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
  const items = catalog.items.filter((item) => item.store === 'shopify' || item.store === 'fourthwall');
  const urls = [...new Set(items.map((item) => item.url))];
  const results = new Map();
  let next = 0;
  await Promise.all(Array.from({ length: Math.min(8, urls.length) }, async () => {
    while (next < urls.length) {
      const url = urls[next++];
      results.set(url, await checkProductPage(url, catalog.allowedHosts));
    }
  }));
  const problems = items.flatMap((item) => {
    const issue = results.get(item.url);
    return issue ? ['- ' + item.id + ': ' + issue] : [];
  });
  const report = ['## Merchant product destinations', '',
    items.length + ' cards checked across ' + urls.length + ' destinations. ' + problems.length + ' failures.', ...problems].join('\n');
  console.log(report);
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, '\n' + report + '\n');
  if (problems.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
