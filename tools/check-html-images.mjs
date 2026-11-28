// Fail when an img src, srcset, or og:image in a built HTML page is not a 200.
// Local and shorelist.net URLs are checked as files in this repo. Other https URLs are fetched.
// Run: node tools/check-html-images.mjs
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = 'https://shorelist.net';
const CONCURRENCY = 12;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (name === 'node_modules' || name === '.git') continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) walk(full, out);
    else if (name.endsWith('.html')) out.push(full);
  }
  return out;
}

function urlsFromSrcset(value) {
  return String(value).split(',').map((part) => part.trim().split(/\s+/)[0]).filter(Boolean);
}

export function imageRefs(html) {
  const refs = [];
  const add = (url) => { if (url) refs.push(url.trim()); };
  for (const tag of html.match(/<img\b[^>]*>/gi) || []) {
    const src = tag.match(/\ssrc\s*=\s*["']([^"']+)["']/i);
    const set = tag.match(/\ssrcset\s*=\s*["']([^"']+)["']/i);
    if (src) add(src[1]);
    if (set) urlsFromSrcset(set[1]).forEach(add);
  }
  for (const tag of html.match(/<source\b[^>]*>/gi) || []) {
    const set = tag.match(/\ssrcset\s*=\s*["']([^"']+)["']/i);
    if (set) urlsFromSrcset(set[1]).forEach(add);
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const prop = tag.match(/\s(?:property|name)\s*=\s*["']([^"']+)["']/i)?.[1]?.toLowerCase();
    if (prop === 'og:image' || prop === 'twitter:image') {
      const content = tag.match(/\scontent\s*=\s*["']([^"']+)["']/i);
      if (content) add(content[1]);
    }
  }
  return refs.filter((url) => url && !url.startsWith('data:') && !url.startsWith('blob:'));
}

function localFile(url, htmlFile) {
  if (url.startsWith(SITE + '/') || url.startsWith('http://shorelist.net/')) {
    const pathname = decodeURIComponent(new URL(url).pathname);
    return path.join(root, pathname);
  }
  if (url.startsWith('/')) return path.join(root, decodeURIComponent(url.split('?')[0]));
  if (!/^[a-z]+:/i.test(url)) return path.resolve(path.dirname(htmlFile), url.split('?')[0]);
  return null;
}

async function oneStatus(url, method) {
  const response = await fetch(url, {
    method,
    redirect: 'follow',
    headers: { 'User-Agent': 'ShoreList-image-check' },
    signal: AbortSignal.timeout(20000),
  });
  const status = response.status;
  await response.body?.cancel();
  return status;
}

async function remoteStatus(url) {
  try {
    const head = await oneStatus(url, 'HEAD');
    if (head === 200) return 200;
    const get = await oneStatus(url, 'GET');
    return get === 200 ? 200 : get;
  } catch {
    try {
      const get = await oneStatus(url, 'GET');
      return get === 200 ? 200 : get;
    } catch (err) {
      return 'error:' + (err.name || 'fetch');
    }
  }
}

async function mapPool(items, limit, fn) {
  const out = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i], i);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

async function main() {
  const pages = walk(root);
  const uses = new Map();
  for (const file of pages) {
    const html = fs.readFileSync(file, 'utf8');
    const rel = path.relative(root, file);
    for (const url of imageRefs(html)) {
      if (!uses.has(url)) uses.set(url, new Set());
      uses.get(url).add(rel);
    }
  }
  const urls = [...uses.keys()];
  const broken = [];
  await mapPool(urls, CONCURRENCY, async (url) => {
    const sample = [...uses.get(url)][0];
    const file = localFile(url, path.join(root, sample));
    if (file) {
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) broken.push({ url, status: 404, pages: [...uses.get(url)] });
      return;
    }
    if (!/^https?:\/\//i.test(url)) {
      broken.push({ url, status: 'unsupported', pages: [...uses.get(url)] });
      return;
    }
    const status = await remoteStatus(url);
    if (status !== 200) broken.push({ url, status, pages: [...uses.get(url)] });
  });
  broken.sort((a, b) => String(a.url).localeCompare(String(b.url)));
  if (!broken.length) {
    console.log(`ok: ${urls.length} image URLs in ${pages.length} HTML pages return 200`);
    return;
  }
  for (const item of broken) {
    console.error(`${item.status}\t${item.url}\n  ${item.pages.slice(0, 8).join(', ')}${item.pages.length > 8 ? ` (+${item.pages.length - 8})` : ''}`);
  }
  console.error(`${broken.length} image URL${broken.length === 1 ? '' : 's'} did not return 200`);
  process.exit(1);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main();
