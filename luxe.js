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
    s.innerHTML='<svg viewBox="0 0 64 64" fill="none" stroke="#FFC95E" stroke-width="2.2"><circle cx="32" cy="32" r="26"/><path d="M32 6v52M6 32h52" stroke-opacity=".5"/><path d="M32 14l6 18-6 18-6-18z" fill="#E96645" stroke="none"/></svg><b>Shore<span>List</span></b><i></i>';
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
    if(im.dataset.lx||im.closest('.plates,#lx-splash')||im.loading==='eager'&&im.complete)return;
    im.dataset.lx='1';
    if(im.complete&&im.naturalWidth)return;
    im.classList.add('lx-pending');
    var fin=function(){im.classList.remove('lx-pending');if(im.naturalWidth)im.classList.add('lx-in');};
    im.addEventListener('load',fin,{once:true});im.addEventListener('error',function(){im.classList.remove('lx-pending');},{once:true});
    setTimeout(function(){im.classList.remove('lx-pending');},6000);
  }
  /* scroll reveal for cards and section titles below the fold */
  var io=('IntersectionObserver' in window&&!rm)?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('lx-on');io.unobserve(e.target);}});},{rootMargin:'0px 0px -8% 0px',threshold:.05}):null;
  var SEL='.card,.exp-card,.town-card,.wk-card,.rec-card,.ev-card,.xcard,.visit-card,.tix-card,.feat-card,.stat-card,.op-card,.more-tile,.sec-title,.sec h2';
  function rv(el){
    if(!io||el.dataset.lxr)return;el.dataset.lxr='1';
    var r=el.getBoundingClientRect();if(r.top<innerHeight*.95)return;   /* already on screen: leave it alone */
    el.classList.add('lx-rv');io.observe(el);
  }
  function scan(n){
    (n.querySelectorAll?n:d).querySelectorAll('img').forEach(img);
    (n.querySelectorAll?n:d).querySelectorAll(SEL).forEach(rv);
  }
  function go(){scan(d);
    if('MutationObserver' in window)new MutationObserver(function(ms){ms.forEach(function(m){m.addedNodes.forEach(function(n){if(n.nodeType===1)scan(n);});});}).observe(d.body,{childList:true,subtree:true});
  }
  if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',go);else go();
})();
