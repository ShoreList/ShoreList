// Writes operators-public.json (what the browser loads) from data/operators.json.
// Run after editing data/operators.json:  node tools/build-operators-public.mjs
// `--check` writes nothing and exits 1 if the committed file is stale (check-site.mjs does the same).
import fs from 'node:fs';
import { loadOperators, publicJson, PUBLIC_FILE } from './operators-lib.mjs';

const out = publicJson(loadOperators());
if (process.argv.includes('--check')) {
  if (!fs.existsSync(PUBLIC_FILE) || fs.readFileSync(PUBLIC_FILE, 'utf8') !== out) { console.error('operators-public.json is stale: run node tools/build-operators-public.mjs'); process.exit(1); }
  console.log('operators-public.json is up to date');
} else {
  fs.writeFileSync(PUBLIC_FILE, out);
  console.log('wrote operators-public.json' + ' (' + out.length + ' bytes)');
}
