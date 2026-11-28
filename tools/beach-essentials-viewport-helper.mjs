// Exact Beach-Day Essentials buyer-layout check; reuses the already approved Puppeteer browser.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import http from 'node:http';
import path from 'node:path';

const route = '/shop/beach-day-essentials';
const shopifyAssets = new Set([
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/3245672284682119365_2048.jpg?v=1795405115&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/6462593349328086418_2048.jpg?v=1795406807&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/7066691774119677009_2048.jpg?v=1795405231&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/15683278664081730040_2048.jpg?v=1795404394&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/9689393900630634296_2048.jpg?v=1795444779&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/4978189819285394626_2048.jpg?v=1795397485&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/11495380665131246352_2048.jpg?v=1795451445&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/13085431489695915564_2048.jpg?v=1795451430&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/15530950866645752954_2048.jpg?v=1795397602&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/1925704596928453072_2048.jpg?v=1795397442&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/17349877194870767359_2048.jpg?v=1795376602&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/16675080237515692816_2048.jpg?v=1795234262&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/18309295045651903048_2048.jpg?v=1795234374&width=480",
  "https://cdn.shopify.com/s/files/1/0686/5213/8580/files/5200674536494590319_2048.jpg?v=1795234481&width=480"
]);

export async function checkBeachEssentials({ browser, root }) {
  const html = await readFile(path.join(root, route.slice(1) + '.html'));
  const digest = createHash('sha256').update(html).digest('hex');
  const declared = new Set([...html.toString().matchAll(/<img src="(https:\/\/cdn\.shopify\.com\/[^"]+)" /g)].map((m) => m[1].replaceAll('&amp;', '&')));
  assert.deepEqual(declared, shopifyAssets, 'unexpected/missing studio image URL; independently review new asset');
  console.log('Beach Essentials exact bytes', JSON.stringify({ checkout: process.env.GITHUB_SHA || null, sha256: digest }));
  const proof = process.env.BEACH_QA_SCREENSHOTS === '1' ? await mkdtemp(path.join(process.env.RUNNER_TEMP || os.tmpdir(), 'shorelist-beach-proof-')) : null;
  const screenshot = '<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480"><rect width="480" height="480" fill="#f4f1ea"/><rect x="35" y="35" width="410" height="410" fill="#0e1f33"/><text x="240" y="247" text-anchor="middle" fill="white" font-size="36">QA MOCK</text></svg>';
  const server = http.createServer((q,r)=>{
    if (q.method!=='GET' || new URL(q.url,'http://local.invalid').pathname!==route) {r.writeHead(404); r.end();return;}
    r.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});r.end(html);
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const localhost='http://127.0.0.1:'+server.address().port;
  const failures=[];
  try {
    for (const [width,height] of [[320,800],[390,844],[1280,800]]) {
      const label=width+'x'+height;
      const ctx=await browser.createBrowserContext();
      try {
        const page = await ctx.newPage();
        await page.setViewport({width,height,deviceScaleFactor:width<700?2:1,isMobile:width<700,hasTouch:width<700});
        await page.setRequestInterception(true);
        page.on('request', request=>{
          if(request.isInterceptResolutionHandled())return;
          const u=request.url();
          if(u.startsWith(localhost+route))return void request.continue();
          if(shopifyAssets.has(u))return void request.respond({status:200,contentType:'image/svg+xml',body:screenshot});
          void request.abort('blockedbyclient');
        });
        const load=await page.goto(localhost+route,{waitUntil:'load'});
        assert.equal(load.status(),200);
        assert.equal(page.url(),localhost+route);
        const top=await page.evaluate(()=>{
          const d=document.documentElement;
          return {viewport:[innerWidth,innerHeight],clipped:d.scrollWidth>d.clientWidth,heading:document.querySelector('h1').textContent,
            canonical:document.querySelector('link[rel=canonical]')?.getAttribute('href'),
            grid:getComputedStyle(document.querySelector('.grid')).gridTemplateColumns.split(' ').length,
            buttons:[...document.querySelectorAll('header a,.jumps a')].map(a=>({name:a.textContent,w:a.getBoundingClientRect().width,h:a.getBoundingClientRect().height})),
            groups:[...document.querySelectorAll('main section')].map(s=>s.querySelectorAll('.product').length),
            cards:[...document.querySelectorAll('.product')].map(a=>[a.getAttribute('href'),a.querySelector('.price').textContent,a.querySelector('img').alt,getComputedStyle(a.querySelector('img')).objectFit])};
        });
        assert.deepEqual(top.viewport,[width,height]);assert.equal(top.clipped,false);assert.equal(top.heading,'Beach-day essentials');assert.equal(top.canonical,'https://shorelist.net/shop/beach-day-essentials');
        assert.equal(top.grid,width<700?1:4);assert.deepEqual(top.groups,[6,2,2,4]);assert.equal(top.cards.length,14);
        assert.equal(new Set(top.cards.map(c=>c[0])).size,14);
        assert(top.cards.every(c=>/^https:\/\/shorelist\.net\/shop\/products\/[a-z0-9-]+$/.test(c[0])&&c[2]&&c[3]==='contain'));
        assert.deepEqual(top.cards.map(c=>c[1]),['$48','$48','$48','$36','$48','$36','$39','$38','$30','$30','$14','$12','$12','$12']);
        if (proof) await page.screenshot({path:path.join(proof,label+'-landing.png')});
        // Record known target issues, but collect the full matrix before failing the gate.
        for (const x of top.buttons) if(x.w<44||x.h<44) failures.push({label,criterion:'44px target',...x});
        await page.keyboard.press('Tab');
        assert(await page.$eval('.skip', x=>x.matches(':focus-visible')&&x.getBoundingClientRect().top>=0));
        await page.keyboard.press('Enter');
        assert.equal(new URL(page.url()).hash,'#essentials');
        await page.$eval('a[href="#canSleeves"]',a=>a.focus());
        await page.keyboard.press('Enter');
        assert.equal(new URL(page.url()).hash,'#canSleeves');
        const jump=await page.$eval('#canSleeves h2',h=>h.getBoundingClientRect().top);
        assert(jump>=0&&jump<height);
        await page.$eval('#canSleeves .product',a=>a.focus());
        await page.keyboard.press('Tab');
        const keyboardFocus = await page.evaluate(()=>{const a=document.activeElement,r=a.getBoundingClientRect();return a.classList.contains('product')&&a.innerText.includes('Wrightsville Beach Can Cooler')&&a.matches(':focus-visible')&&parseFloat(getComputedStyle(a).outlineWidth)>=3&&r.top>=0&&r.top<innerHeight;});
        assert(keyboardFocus, label+' expected visible 3px focus on alternate Wrightsville sleeve');
        if (proof) await page.screenshot({path:path.join(proof,label+'-sleeves-focus.png')});
        // Only after visual and keyboard checks, naturally scroll each item into lazy-load range.
        for (let i=0;i<14;i++) await page.$$eval('.product img',(a,index)=>a[index].scrollIntoView({block:'nearest'}),i);
        await page.waitForFunction(()=>[...document.querySelectorAll('.product img')].every(i=>i.naturalWidth===480&&i.naturalHeight===480),{timeout:5000});
        console.log(JSON.stringify({label,grid:top.grid,groups:top.groups,dimensions:top.viewport,noHorizontalOverflow:!top.clipped,keyboardFocus,jump,photos:'dimension-matched mocks',buttons:top.buttons}));
      } finally {await ctx.close();}
    }
    assert.deepEqual(failures,[], 'One or more click/tap targets are not 44×44px');
  } finally {
    await new Promise(resolve=>server.close(resolve));
  }
}
