// Inlines the homepage's first-party stylesheets into index.html so no stylesheet request blocks first paint.
// Source of truth stays in the .css files. Run: node tools/inline-home-css.mjs   (writes index.html)
//      Check only: node tools/inline-home-css.mjs --check   (exit 1 if index.html is out of date)
// Order is the cascade order the page used when these were separate <link> tags: tokens.css is repeated after home.css on purpose.
import fs from 'node:fs';
const PAGES = [
  ['index.html', ['scene.css', 'fixes.css', 'luxe.css', 'tokens.css', 'home.css', 'tokens.css']],
  ['shop.html', ['scene.css', 'fixes.css', 'luxe.css', 'shop.css', 'tokens.css']],
];
const START = '<!--HOME-CSS:start-->', END = '<!--HOME-CSS:end-->';
let stale = false;
for (const [page, ORDER] of PAGES) {
  const html = fs.readFileSync(page, 'utf8');
  const a = html.indexOf(START), b = html.indexOf(END);
  if (a < 0 || b < a) { console.error(page + ': HOME-CSS markers not found'); process.exit(1); }
  const css = ORDER.map((f) => fs.readFileSync(f, 'utf8').trim()).join('\n');
  if (/<\/style/i.test(css)) { console.error('a stylesheet contains </style; cannot inline'); process.exit(1); }
  const out = html.slice(0, a) + START + '<style id="home-css">\n' + css + '\n</style>' + html.slice(b);
  if (process.argv.includes('--check')) { if (out !== html) { console.error(page + ' inlined CSS is out of date: run node tools/inline-home-css.mjs'); stale = true; } continue; }
  fs.writeFileSync(page, out);
  console.log(`${page}: inlined ${ORDER.length} stylesheets, ${css.length} bytes`);
}
if (process.argv.includes('--check')) { if (stale) process.exit(1); console.log('ok: inlined page CSS is current'); }
