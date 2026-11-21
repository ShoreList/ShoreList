// IndexNow ping. Usage: node tools/indexnow-ping.mjs [--all] [--dry-run] [--base HEAD~1] [--head HEAD]
// Submits changed (or all) sitemap URLs to https://api.indexnow.org/indexnow. Never throws on network failure:
// a failed ping must not fail a deploy. The key file lives at the site root (<key>.txt).
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const HOST = 'shorelist.net';
export const ORIGIN = 'https://' + HOST;
export const ENDPOINT = 'https://api.indexnow.org/indexnow';
export const KEY = '60b1936088d41a0557e460c5cf6952d7'; // public by design; verified via /<KEY>.txt
export const BATCH = 10000;

export function sitemapUrls(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]).filter((u) => u.startsWith(ORIGIN + '/') || u === ORIGIN);
}

// Map a repo-relative HTML path to its public URL (extensionless, as the sitemap lists it).
export function pathToUrl(p) {
  if (!p.endsWith('.html') || p.includes('/node_modules/')) return null;
  if (p === 'index.html') return ORIGIN + '/';
  return ORIGIN + '/' + p.replace(/\/index\.html$/, '').replace(/\.html$/, '');
}

export function changedUrls(files, known) {
  const set = new Set(known);
  const out = new Set();
  for (const f of files) {
    const u = pathToUrl(f);
    if (u && set.has(u)) out.add(u);
  }
  return [...out];
}

export function chunk(arr, n = BATCH) {
  const r = [];
  for (let i = 0; i < arr.length; i += n) r.push(arr.slice(i, i + n));
  return r;
}

export function gitChangedFiles(base = 'HEAD~1', head = 'HEAD', run = execFileSync) {
  try {
    return String(run('git', ['diff', '--name-only', '--diff-filter=AMR', base, head], { encoding: 'utf8' })).split('\n').filter(Boolean);
  } catch (e) {
    console.warn('indexnow: git diff failed (' + e.message.split('\n')[0] + '); nothing to ping');
    return [];
  }
}

export async function ping(urls, { fetchImpl = fetch, dryRun = false, key = KEY, log = console.log } = {}) {
  const res = { sent: 0, failed: 0, batches: 0 };
  for (const batch of chunk(urls)) {
    res.batches++;
    const body = { host: HOST, key, keyLocation: `${ORIGIN}/${key}.txt`, urlList: batch };
    if (dryRun) { log(`dry-run: would POST ${batch.length} URLs`); batch.forEach((u) => log('  ' + u)); res.sent += batch.length; continue; }
    try {
      const r = await fetchImpl(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) });
      if (r.status === 200 || r.status === 202) { res.sent += batch.length; log(`indexnow: ${r.status} for ${batch.length} URLs`); }
      else { res.failed += batch.length; console.warn(`indexnow: HTTP ${r.status} for ${batch.length} URLs (continuing)`); }
    } catch (e) {
      res.failed += batch.length;
      console.warn('indexnow: request failed: ' + e.message + ' (continuing)');
    }
  }
  return res;
}

export async function main(argv, deps = {}) {
  const arg = (n, d) => { const i = argv.indexOf(n); return i >= 0 ? argv[i + 1] : d; };
  const all = argv.includes('--all');
  const dryRun = argv.includes('--dry-run');
  const known = sitemapUrls(fs.readFileSync(deps.sitemap || 'sitemap.xml', 'utf8'));
  const urls = all ? known : changedUrls((deps.files || gitChangedFiles)(arg('--base', 'HEAD~1'), arg('--head', 'HEAD')), known);
  if (!urls.length) { console.log('indexnow: no changed URLs'); return { sent: 0, failed: 0, batches: 0 }; }
  return ping(urls, { dryRun, fetchImpl: deps.fetchImpl });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2)).catch((e) => console.warn('indexnow: ' + e.message)).finally(() => { process.exitCode = 0; });
}
