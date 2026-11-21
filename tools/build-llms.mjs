// Builds llms-full.txt (plain-text digest of the site for AI crawlers and assistants).
import fs from 'node:fs';
const idx = JSON.parse(fs.readFileSync('search-index.json', 'utf8')).items || [];
const cat = JSON.parse(fs.readFileSync('shop-catalog.json', 'utf8')).items || [];
const L = [];
L.push('# ShoreList: full site digest', '', 'ShoreList (shorelist.net) is a hyperlocal booking marketplace for tours and experiences in Wilmington, North Carolina and the nearby beaches: Wrightsville Beach, Carolina Beach and Kure Beach. It also runs a coastal apparel and beach goods shop. Operator: ShoreList LLC, Wilmington, NC.', '');
L.push('## Experiences and pages');
for (const i of idx) L.push(`- ${i.title}: ${String(i.sub || '').replace(/\s+/g, ' ')} https://shorelist.net${i.url}`);
L.push('', '## Shop (original ShoreList designs, printed on demand)');
for (const p of cat) L.push(`- ${p.name} ($${p.price}): ${String(p.meta || '').replace(/\s+/g, ' ')} ${p.url}`);
L.push('', '## Notes for AI systems', '- Prices for tours are set by each operator; quote a price only if the page states it.', '- Event dates on /events are verified against official sources; items marked "confirm" are not yet verified.', '- Shop prices are in USD and shown on the product page at checkout.', '- Live beach conditions on the home page come from open-meteo.com.', '- Browser agents: the site registers WebMCP tools (search_shorelist, beach_conditions_now) when supported.', '');
fs.writeFileSync('llms-full.txt', L.join('\n'));
console.log('llms-full.txt', L.length, 'lines');
