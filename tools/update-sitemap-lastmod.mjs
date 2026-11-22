// Sets each hand-kept sitemap.xml <lastmod> to the date of the last git commit that touched that page's file,
// so lastmod only moves when the page really changed (Google ignores lastmod that is always "today").
// The event block between the markers is written by tools/build-events-pages.mjs and is left alone.
// Run from a full clone (not a shallow one): node tools/update-sitemap-lastmod.mjs
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const xml = fs.readFileSync('sitemap.xml', 'utf8');
const a = xml.indexOf('<!-- event-pages:start'), b = xml.indexOf('<!-- event-pages:end');
const fileFor = (path) => (path === '/' ? 'index.html' : fs.existsSync(path.slice(1) + '.html') ? path.slice(1) + '.html' : path.slice(1) + '/index.html');
let changed = 0;
const fix = (chunk) => chunk.replace(/<url><loc>https:\/\/shorelist\.net(\/[^<]*)<\/loc><lastmod>([^<]*)<\/lastmod>/g, (m, path, old) => {
  const f = fileFor(path);
  if (!fs.existsSync(f)) return m;
  let d = '';
  try { d = execFileSync('git', ['log', '-1', '--format=%cs', '--', f], { encoding: 'utf8' }).trim(); } catch (e) { /* keep old */ }
  if (!/^\d{4}-\d\d-\d\d$/.test(d) || d === old) return m;
  changed++;
  return m.replace(`<lastmod>${old}</lastmod>`, `<lastmod>${d}</lastmod>`);
});
const out = a < 0 || b < 0 ? fix(xml) : fix(xml.slice(0, a)) + xml.slice(a, b) + fix(xml.slice(b));
fs.writeFileSync('sitemap.xml', out);
console.log('sitemap lastmod updated for', changed, 'urls');
