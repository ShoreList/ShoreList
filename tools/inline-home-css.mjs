// Inline the first-party stylesheets for the key landing pages.
// Source of truth stays in the .css files. Run: node tools/inline-home-css.mjs   (writes index.html)
//      Check only: node tools/inline-home-css.mjs --check   (exit 1 if index.html is out of date)
// Order is the cascade order the page used when these were separate <link> tags: tokens.css is repeated after home.css on purpose.
import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
const PAGES = [
  ['index.html', ['scene.css', 'fixes.css', 'luxe.css', 'tokens.css', 'home.css', 'tokens.css']],
  ['events.html', ['events.css', 'scene.css', 'luxe.css', 'tokens.css']],
  ['things-to-do/ghost-tours.html', ['category.css', 'fixes.css', 'scene.css', 'luxe.css', 'tokens.css']],
];
const START = '<!--HOME-CSS:start-->', END = '<!--HOME-CSS:end-->';
export function inlinePageCss(page, html) {
  const order = PAGES.find(([name]) => name === page)[1];
  if (!html.includes(START)) {
    for (const [index, file] of order.entries()) {
      const tag = `<link rel="stylesheet" href="/${file}"/>`;
      if (!html.includes(tag)) throw new Error(`${page}: missing stylesheet ${file}`);
      html = html.replace(tag + '\n', index === 0 ? START + END + '\n' : '');
    }
  }
  const start = html.indexOf(START);
  const end = html.indexOf(END);
  if (end < start) throw new Error(`${page}: missing CSS end marker`);
  const css = order.map((file) => fs.readFileSync(file, 'utf8').trim()).join('\n');
  if (/<\/style/i.test(css)) throw new Error('a stylesheet contains </style>; cannot inline');
  return html.slice(0, start) + START + '<style id="home-css">\n' + css + '\n</style>' + html.slice(end);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  for (const [page] of PAGES) {
    const html = fs.readFileSync(page, 'utf8');
    const out = inlinePageCss(page, html);
    if (!check) {
      fs.writeFileSync(page, out);
    } else if (out !== html) {
      console.error(`${page}: inlined CSS is out of date (run node tools/inline-home-css.mjs)`);
      process.exitCode = 1;
    }
  }
  if (!process.exitCode) console.log(check ? 'ok: inlined page CSS is current' : 'wrote inlined page CSS');
}
