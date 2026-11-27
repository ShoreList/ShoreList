/* ShoreList Luxe layer: progress bar, first-visit splash, image fade-in, scroll reveal.
   Everything degrades to the plain page if this script fails. */
(function(){
  'use strict';
  var d=document,root=d.documentElement,rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var seen=false;try{seen=sessionStorage.getItem('lx-splash')==='1';}catch(e){}
  var isHome=location.pathname==='/'||/\/index(\.html)?$/.test(location.pathname);
  /* splash: home page, first visit per session, never for reduced motion; auto-clears fast */
  if(isHome&&!seen&&!rm){
    var s=d.createElement('div');s.id='lx-splash';s.setAttribute('aria-hidden','true');
    s.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="#D9C7A3" stroke-width="2.2"><circle cx="32" cy="32" r="26"/><path d="M32 6v52M6 32h52" stroke-opacity=".5"/><path d="M32 14l6 18-6 18-6-18z" fill="#B5362F" stroke="none"/></svg><b>Shore<span>List</span></b><i></i>';
    root.appendChild(s);
    var gone=function(){s.classList.add('out');setTimeout(function(){s.remove();},800);try{sessionStorage.setItem('lx-splash','1');}catch(e){}};
    var t0=Date.now();
    var ready=function(){setTimeout(gone,Math.max(0,900-(Date.now()-t0)));};
    if(d.readyState==='complete')ready();else addEventListener('load',ready);
    setTimeout(gone,2600);
  }
  /* navigation progress bar */
  var bar;function mk(){if(!bar){bar=d.createElement('div');bar.id='lx-bar';d.body.appendChild(bar);}return bar;}
  d.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href]');
    if(!a||e.defaultPrevented||e.metaKey||e.ctrlKey||e.shiftKey||e.button||a.target==='_blank'||a.hasAttribute('download'))return;
    var u;try{u=new URL(a.href,location.href);}catch(x){return;}
    if(u.origin!==location.origin||(u.pathname===location.pathname&&u.search===location.search))return;
    var b=mk();b.className='';void b.offsetWidth;b.className='go';
  });
  addEventListener('pageshow',function(){if(bar)bar.className='done';});
  /* images: shimmer until decoded, then fade in */
  function img(im){
    if(im.dataset.lx||im.fetchPriority==='high'||im.closest('.plates,#lx-splash')||im.loading==='eager'&&im.complete)return;
    im.dataset.lx='1';
    if(im.complete&&im.naturalWidth)return;
    im.classList.add('lx-pending');
    var fin=function(){im.classList.remove('lx-pending');if(im.naturalWidth)im.classList.add('lx-in');};
    im.addEventListener('load',fin,{once:true});im.addEventListener('error',function(){im.classList.remove('lx-pending');},{once:true});
    setTimeout(function(){im.classList.remove('lx-pending');},6000);
  }
  /* scroll reveal for cards and section titles below the fold */
  var seen=new WeakSet();
  var io=('IntersectionObserver' in window&&!rm)?new IntersectionObserver(function(es){es.forEach(function(e){var t=e.target;
    if(!seen.has(t)){seen.add(t);if(e.isIntersecting){io.unobserve(t);return;}   /* already on screen: leave it alone */
      t.classList.add('lx-rv');return;}
    if(e.isIntersecting){t.classList.add('lx-on');io.unobserve(t);}});},{rootMargin:'0px 0px -8% 0px',threshold:.05}):null;
  var SEL='.card,.exp-card,.town-card,.wk-card,.rec-card,.ev-card,.xcard,.visit-card,.tix-card,.feat-card,.stat-card,.op-card,.more-tile,.sec-title,.sec h2';
  /* No layout reads at all: IntersectionObserver tells us which elements start on screen. Its first report marks off-screen ones, later reports reveal them. */
  function rvAll(list){
    if(!io)return;
    list.forEach(function(el){if(!el.dataset.lxr){el.dataset.lxr='1';io.observe(el);}});
  }
  var q=[],qs=0;
  function flush(){qs=0;var n=q;q=[];n.forEach(function(x){if(!x.isConnected)return;x.querySelectorAll('img').forEach(img);rvAll([].slice.call(x.querySelectorAll(SEL)));if(x.matches&&x.matches(SEL))rvAll([x]);});}
  function scan(n){
    if(n===d){d.querySelectorAll('img').forEach(img);rvAll([].slice.call(d.querySelectorAll(SEL)));return;}
    q.push(n);if(!qs){qs=1;(window.requestAnimationFrame||setTimeout)(flush);}
  }
  function go(){scan(d);
    if('MutationObserver' in window)new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);});});}).observe(d.body,{childList:true,subtree:true});
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',go);else go();

  /* instant navigation: prerender likely next pages (Speculation Rules), where supported */
  try{
    if(HTMLScriptElement.supports&&HTMLScriptElement.supports('speculationrules')&&!(navigator.connection&&navigator.connection.saveData)){
      var sp=d.createElement('script');sp.type='speculationrules';
      sp.textContent=JSON.stringify({prerender:[{where:{and:[{href_matches:'/*'},{not:{href_matches:['/dashboard*','/success*','/.netlify/*','/api/*']}}]},eagerness:'moderate'}]});
      d.head.appendChild(sp);
    }
  }catch(e){}
  /* photo tiles: pointer-tracked light and tilt, plus a live "right now" chip from the conditions feed */
  (function(){
    var grid=d.querySelector('#explore .cats-grid');if(!grid)return;
    var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
    grid.querySelectorAll('.cat').forEach(function(c){var s=d.createElement('span');s.className='cat-sheen';s.setAttribute('aria-hidden','true');c.appendChild(s);});
    if(fine&&!rm){
      var raf=0;
      grid.addEventListener('pointermove',function(e){
        var c=e.target.closest&&e.target.closest('.cat');if(!c)return;
        if(raf)cancelAnimationFrame(raf);
        raf=requestAnimationFrame(function(){
          var r=c.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;
          c.style.setProperty('--mx',(x*100).toFixed(1)+'%');c.style.setProperty('--my',(y*100).toFixed(1)+'%');
          c.style.setProperty('--ry',((x-.5)*7).toFixed(2)+'deg');c.style.setProperty('--rx',((.5-y)*7).toFixed(2)+'deg');
        });
      });
      grid.addEventListener('pointerout',function(e){var c=e.target.closest&&e.target.closest('.cat');if(c&&!c.contains(e.relatedTarget)){c.style.setProperty('--rx','0deg');c.style.setProperty('--ry','0deg');}});
    }
    function chip(slug,text){
      var c=grid.querySelector('.cat[href$="/things-to-do/'+slug+'"]');if(!c)return;
      var el=c.querySelector('.cat-live');if(!el){el=d.createElement('span');el.className='cat-live';c.appendChild(el);}
      el.textContent=text;requestAnimationFrame(function(){el.classList.add('on');});
    }
    d.addEventListener('shore:cond',function(e){
      var c=e.detail||{};if(c.temp==null)return;
      grid.querySelectorAll('.cat-live').forEach(function(n){n.remove();});
      var ft=c.wave!=null?c.wave*3.281:null,rain=c.code!=null&&c.code>=50,red=/red/i.test(String(c.flag||'')),now=Date.now(),set=c.set?new Date(c.set).getTime():0;
      if(rain){chip('museums','Rainy-day pick');chip('film-tours','Rainy-day pick');chip('wellness','Rainy-day pick');return;}
      var day=set&&now<set;
      if(day&&ft!=null&&ft>=1.5&&ft<=3.5&&!red)chip('surf-lessons','Learner surf · '+ft.toFixed(1)+' ft');
      if(day&&ft!=null&&ft<1.5){chip('paddleboard','Calm water now');chip('kayak-tours','Calm water now');}
      if(set&&now<set&&set-now<2.5*36e5){chip('river-cruises','Golden hour soon');chip('sailboat-rides','Golden hour soon');chip('beach-photography','Golden hour soon');}
      if(set&&now>set)chip('ghost-tours','After-dark favorite');
    });
  })();
  /* Shore Score widget on pages that carry the live conditions */
  addEventListener('load',function(){
    if(d.querySelector('script[src*="widgets.js"]')){var s=d.createElement('script');s.src='/shorescore.js';s.defer=true;d.body.appendChild(s);}
  });
})();

/* Magnetic press on fine pointers. Touch gets a short scale, and one tick on a primary control. */
(function(){
  'use strict';
  var d=document, rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
  var sel='a.path,a.hx-tile,a.hx-ev,a.sbtn,a.hx-more,button.scene-play';
  if(rm)return;
  if(fine){
    var box=null, raf=0, px=0, py=0;
    d.addEventListener('pointermove',function(e){
      px=e.clientX; py=e.clientY;
      if(raf)return;
      raf=requestAnimationFrame(function(){
        raf=0;
        var el=d.elementFromPoint(px,py);
        el=el&&el.closest?el.closest(sel):null;
        if(box&&box!==el){box.style.transform='';box=null;}
        if(!el)return;
        var r=el.getBoundingClientRect();
        var dx=Math.max(-6,Math.min(6,(px-(r.left+r.width/2))/r.width*10));
        var dy=Math.max(-6,Math.min(6,(py-(r.top+r.height/2))/r.height*10));
        el.style.transform='translate('+dx.toFixed(1)+'px,'+dy.toFixed(1)+'px)';
        box=el;
      });
    },{passive:true});
    d.addEventListener('pointerleave',function(){if(box)box.style.transform='';box=null;});
  }else{
    d.addEventListener('pointerdown',function(e){
      var el=e.target.closest&&e.target.closest(sel); if(!el)return;
      el.style.transform='scale(.97)';
      if(navigator.vibrate&&el.classList.contains('p-main')){try{navigator.vibrate(10);}catch(err){}}
    },{passive:true});
    d.addEventListener('pointerup',function(){
      var nodes=d.querySelectorAll(sel);
      for(var i=0;i<nodes.length;i++) nodes[i].style.transform='';
    },{passive:true});
    d.addEventListener('pointercancel',function(){
      var nodes=d.querySelectorAll(sel);
      for(var i=0;i<nodes.length;i++) nodes[i].style.transform='';
    },{passive:true});
  }
})();

/* Unified site header: every page gets the same logo, links and call to action.
   The page's own <nav> stays in the HTML as the no-script fallback. */
(function(){
  'use strict';
  var d=document,p=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  if(p==='/'||p==='/index'||/^\/(dashboard|success|offline)/.test(p))return;
  var go=function(){
    var navs=d.querySelectorAll('nav'),nav=null;
    for(var i=0;i<navs.length;i++){var n=navs[i];if(n.closest('footer')||/foot-links|links/.test(n.className)&&!/site-nav/.test(n.className))continue;nav=n;break;}
    if(!nav||nav.classList.contains('sl-hdr'))return;
    var L=[['/things-to-do','Things to Do'],['/events','Events'],['/shore-picks','Shore Picks'],['/cams','Live cams'],['/wilmington-weather','Weather'],['/shop','Shop'],['/map','Map'],['/planner','Plan My Trip']];
    var h='<a href="/" class="sl-logo" aria-label="ShoreList home">Shore<span>List</span></a><div class="sl-links" id="sl-links">';
    for(var j=0;j<L.length;j++){var on=p===L[j][0]||p.indexOf(L[j][0]+'/')===0;h+='<a href="'+L[j][0]+'"'+(on?' aria-current="page"':'')+'>'+L[j][1]+'</a>';}
    h+='<a href="/things-to-do" class="sl-cta">Book Experiences</a></div><button type="button" class="sl-burger" aria-label="Open menu" aria-expanded="false" aria-controls="sl-links"><span></span><span></span><span></span></button>';
    nav.innerHTML=h;nav.classList.add('sl-hdr');if(nav.getBoundingClientRect().width<d.documentElement.clientWidth-4&&nav.parentNode!==d.body){d.body.insertBefore(nav,d.body.firstChild);}nav.setAttribute('aria-label','Primary');
    var b=nav.querySelector('.sl-burger');
    b.addEventListener('click',function(){var o=nav.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');b.setAttribute('aria-label',o?'Close menu':'Open menu');});
    d.addEventListener('keydown',function(e){if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');b.setAttribute('aria-expanded','false');b.focus();}});
  };
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',go);else go();
})();
