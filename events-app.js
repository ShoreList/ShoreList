var DB = {
'2026-11':{
  label:'November 2026',short:'Nov',
  featured:{
    cat:'family',ico:'sparkle',badge:'Free &mdash; Holiday Kickoff',
    name:'Downtown Wilmington Holiday Tree Lighting',
    date:'Friday, November 27',time:'5:30 PM &#8212; 8:30 PM',
    venue:'2 Princess Street',neighborhood:'Downtown Wilmington',
    tags:['Free','Tree Lighting','Vendor Village','Live Entertainment','Family Friendly'],
    desc:"Downtown kicks off the holiday season with entertainment starting at 5:30, the tree-lighting countdown, and a vendor village. Free to attend. Hours and details come from the City of Wilmington's event listing.",
    price:'Free',
    link:'https://www.wilmingtonnc.gov/Events-directory/City-of-Wilmingtons-Tree-Lighting',tix_text:'Event Details',shorelist_rec:null
  },
  events:[
    {cat:'outdoor',ico:'fireworks',name:'NC Holiday Flotilla &#8212; Wrightsville Beach',date:'Sat, Nov 28',time:'Evening',venue:'Wrightsville Beach',neighborhood:'Wrightsville Beach',desc:'Decorated and lit-up boats parade along the Intracoastal Waterway at Wrightsville Beach. Date is from the Wilmington and Beaches visitors bureau holiday guide. Confirm the date and best viewing spots before you go.',price:'Free to watch',free:true,heat:3,link:'https://www.wilmingtonandbeaches.com/things-to-do/seasonal-highlights/holiday/'},
    {cat:'outdoor',ico:'island',name:'Holiday Lights Cruise &#8212; Wilmington Water Tours',date:'Late Nov through Dec',time:'Evenings',venue:'Cape Fear River, Downtown Wilmington',neighborhood:'Downtown Wilmington',desc:'A heated, fully enclosed catamaran tour along the lit-up Riverwalk. The visitors bureau expects it to sell out, so book ahead.',price:'Tickets required',free:false,heat:2,link:'https://www.wilmingtonandbeaches.com/blog/post/holidays-on-water-in-wilmington/'}
  ]
},
'2026-12':{
  label:'December 2026',short:'Dec',
  featured:{
    cat:'music',ico:'music',badge:'Holiday Concert',
    name:'Leslie Odom Jr.: The Christmas Tour',
    date:'Thursday, December 17',time:'7:30 PM',
    venue:"Wilson Center at Cape Fear Community College",neighborhood:'Downtown Wilmington',
    tags:['Live Music','Holiday','Wilson Center','Downtown'],
    desc:"Tony and Grammy winner Leslie Odom Jr. brings his holiday tour to the Wilson Center in downtown Wilmington. Date and time are from the Wilson Center ticketing page.",
    price:'Tickets required',
    link:'https://wilsoncentertickets.com/events/leslie-odom-jr-2026-12-17-730-pm',tix_text:'Get Tickets',shorelist_rec:null
  },
  events:[
    {cat:'family',ico:'festival',name:'Carolina Beach Christmas Parade',date:'Fri, Dec 4',time:'Check local listing',venue:'Carolina Beach',neighborhood:'Carolina Beach',desc:'Small-town holiday parade at the beach. Date is from the Wilmington and Beaches visitors bureau holiday guide. Confirm the date and start time before you go.',price:'Free',free:true,heat:2,link:'https://www.wilmingtonandbeaches.com/things-to-do/seasonal-highlights/holiday/'},
{cat:'outdoor',ico:'fireworks',name:'Holidays on Water Drone Shows',date:'Sat, Dec 5, 12 &amp; 19',time:'7:00 PM',venue:'Cape Fear River, across from Battleship NORTH CAROLINA',neighborhood:'Downtown Wilmington',desc:'Hundreds of drones form holiday images over the Cape Fear River. Best views are across the river from the Battleship and along the Wilmington Riverwalk, per the visitors bureau.',price:'Free to watch',free:true,heat:3,link:'https://www.wilmingtonandbeaches.com/blog/post/holidays-on-water-in-wilmington/'},
    {cat:'outdoor',ico:'island',name:'Island of Lights Christmas Flotilla',date:'Sat, Dec 5',time:'Evening',venue:'Carolina Beach',neighborhood:'Carolina Beach',desc:'Carolina Beach holiday boat flotilla. Date is from the Wilmington and Beaches visitors bureau holiday guide. Confirm the date and viewing spots before you go.',price:'Free to watch',free:true,heat:2,link:'https://www.wilmingtonandbeaches.com/things-to-do/seasonal-highlights/holiday/'},
    {cat:'outdoor',ico:'ghost',name:'Christmas Colonial Apparition Cruise',date:'Sat, Dec 5',time:'Evening',venue:'Cape Fear River, Downtown Wilmington',neighborhood:'Downtown Wilmington',desc:'A Christmas ghost-story cruise from Wilmington Water Tours with the Burgwin-Wright House and Gardens.',price:'Tickets required',free:false,heat:2,link:'https://www.wilmingtonandbeaches.com/blog/post/holidays-on-water-in-wilmington/'},
    {cat:'outdoor',ico:'sparkle',name:"New Year's Eve River Cruise",date:'Thu, Dec 31',time:'Evening',venue:'Cape Fear Riverboats, Downtown Wilmington',neighborhood:'Downtown Wilmington',desc:"Aboard the Henrietta with DJ music on the open-air upper deck and a midnight champagne toast. Boarding details are on the visitors bureau page. Confirm departure time and tickets before you plan around it.",price:'Tickets required',free:false,heat:2,link:'https://www.wilmingtonandbeaches.com/blog/post/holidays-on-water-in-wilmington/'}
  ]
}
};

var RECURRING = [
  {ico:'building',name:'Second Sunday Market',freq:'Monthly &#8212; Every 2nd Sunday',desc:'Local art, food, jewelry, pottery, vintage finds, and live music at Second Glass Wine Bar. A beloved Wilmington community tradition for locals and visitors alike.',venue:'120 Greenfield St, Downtown',schedule:'2nd Sunday each month, morning&#8211;afternoon',free:true},
  {ico:'theater',name:'Dead Crow Comedy Room',freq:'Weekly Shows',desc:"Wilmington\'s premier comedy venue, featuring local and touring stand-up comedians weekly. Thursday open mic nights are free and some of the best laughs in the Southeast.",venue:'511 N 3rd St, Downtown',schedule:'Thursdays (free open mic) + weekend headliners year-round',free:false},
  {ico:'music',name:'Seven Mile Post Live Music',freq:'Fri, Sat &amp; Sun Year-Round',desc:"Wilmington\'s live music heartbeat &#8212; free shows almost every weekend at this beloved local bar. 12 drafts, great sound, and a rotating lineup of local and regional acts.",venue:'7219 Market St, Ogden',schedule:'Fri/Sat/Sun evenings &#8212; most shows free',free:true},
];

/* ── COUNTDOWN EVENTS (major events only, chronological) ── */
var COUNTDOWN_TARGETS = [
  {date:'2026-11-27T17:30:00',name:'Downtown Holiday Tree Lighting &#8212; 2 Princess Street'},
  {date:'2026-12-17T19:30:00',name:'Leslie Odom Jr. &#8212; Wilson Center'}
];


/* ═══════════════════════════════
   STATE
═══════════════════════════════ */

/* ── AUTO-PRUNE: hide anything that has already happened, so this page never goes stale ── */
(function pruneDB(){
  var MI={January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11,Jan:0,Feb:1,Mar:2,Apr:3,Jun:5,Jul:6,Aug:7,Sep:8,Sept:8,Oct:9,Nov:10,Dec:11};
  var today=new Date(); today.setHours(0,0,0,0);
  function lastDay(ev,key){
    if(!ev||!ev.date) return null;
    var str=String(ev.date).replace(/&amp;/g,'&').replace(/&#8211;|&ndash;/g,'-');
    var mm=str.match(/(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sept|Sep|Oct|Nov|Dec)\.?\s+(\d{1,2})/);
    if(!mm) return null;
    var nums=(str.slice(str.indexOf(mm[0])).match(/\b\d{1,2}\b/g)||[]).map(Number).filter(function(n){return n>=1&&n<=31;});
    var day=Math.max.apply(null,nums);
    return new Date(parseInt(key.split('-')[0],10), MI[mm[1]], day);
  }
  Object.keys(DB).forEach(function(key){
    var y=parseInt(key.split('-')[0],10), m=parseInt(key.split('-')[1],10)-1;
    if(new Date(y,m+1,0) < today){ delete DB[key]; return; }
    var d=DB[key], e;
    if(d.featured){ e=lastDay(d.featured,key); if(e && e<today) d.featured=null; }
    d.events=(d.events||[]).filter(function(ev){ var x=lastDay(ev,key); return !(x && x<today); });
  });
  Object.keys(DB).forEach(function(key){ if(!DB[key].featured && !(DB[key].events||[]).length && new Date(parseInt(key.split('-')[0],10), parseInt(key.split('-')[1],10)-1,1) <= today){ delete DB[key]; } });
})();

var MONTHS = Object.keys(DB);
var currentMonth = '';
var currentFilter = 'all';
var freeOnly = false;

/* ═══════════════════════════════
   INIT
═══════════════════════════════ */
document.addEventListener('DOMContentLoaded', function() {
  var now = new Date();
  var key = now.getFullYear() + '-' + String(now.getMonth()+1).padStart(2,'0');
  currentMonth = MONTHS.indexOf(key) >= 0 ? key : MONTHS[0];
  buildMonthNav();
  buildMain();
  buildWeekend();
  buildCountdown();
  setInterval(tickCountdown, 1000);
  initScrollObserver();
  fetchWeather();
  initAudio();
});

/* ═══════════════════════════════
   LIVE WEATHER &#8212; Open-Meteo API
═══════════════════════════════ */
var WC_MAP = {0:'Clear',1:'Mostly Clear',2:'Partly Cloudy',3:'Overcast',45:'Foggy',51:'Light Drizzle',61:'Rain',80:'Showers',95:'Storms'};
function fetchWeather() {
  var locs = [
    {lat:34.2257,lon:-77.9447,ti:'bc-temp-0',ci:'bc-cond-0'},
    {lat:34.0345,lon:-77.8976,ti:'bc-temp-1',ci:'bc-cond-1'},
    {lat:34.2097,lon:-77.7964,ti:'bc-temp-2',ci:'bc-cond-2'}
  ];
  locs.forEach(function(loc) {
    fetch('https://api.open-meteo.com/v1/forecast?latitude='+loc.lat+'&longitude='+loc.lon+'&current=temperature_2m,weather_code&temperature_unit=fahrenheit&forecast_days=1')
      .then(function(r){return r.json();})
      .then(function(d){
        var t=document.getElementById(loc.ti);
        var c=document.getElementById(loc.ci);
        if(t){t.style.opacity='0';t.innerHTML=Math.round(d.current.temperature_2m)+'&deg;F';setTimeout(function(){t.style.opacity='1';},50);}
        if(c) {
          var wc = d.current.weather_code;
          // Find closest match
          var keys = Object.keys(WC_MAP).map(Number).sort(function(a,b){return a-b;});
          var closest = keys[0];
          for(var i=0;i<keys.length;i++){if(keys[i]<=wc)closest=keys[i];}
          c.innerHTML = WC_MAP[closest] || 'Good conditions';
        }
      })
      .catch(function(){
        var t=document.getElementById(loc.ti);
        if(t) t.innerHTML = '--&deg;F';
        var cc=document.getElementById(loc.ci);
        if(cc) cc.textContent = 'Check local forecast';
      });
  });
}

/* ═══════════════════════════════
   COUNTDOWN
═══════════════════════════════ */
var countdownTarget = null;
function buildCountdown() {
  var now = Date.now();
  for (var i = 0; i < COUNTDOWN_TARGETS.length; i++) {
    var t = new Date(COUNTDOWN_TARGETS[i].date).getTime();
    if (t > now + 3600000) { countdownTarget = COUNTDOWN_TARGETS[i]; break; }
  }
  if (!countdownTarget) { var box=document.querySelector('.countdown-box'); if (box) box.style.display='none'; return; }
  var el = document.getElementById('cd-event');
  if (el) el.innerHTML = countdownTarget.name;
  tickCountdown();
}
function tickCountdown() {
  if (!countdownTarget) return;
  var diff = new Date(countdownTarget.date).getTime() - Date.now();
  if (diff <= 0) { buildCountdown(); return; }
  var d = Math.floor(diff / 86400000);
  var h = Math.floor((diff % 86400000) / 3600000);
  var m = Math.floor((diff % 3600000) / 60000);
  var s = Math.floor((diff % 60000) / 1000);
  var set = function(id, v) { var el = document.getElementById(id); if (el) el.textContent = String(v).padStart(2,'0'); };
  set('cd-d', d); set('cd-h', h); set('cd-m', m); set('cd-s', s);
}

/* ═══════════════════════════════
   THIS WEEKEND
═══════════════════════════════ */
function buildWeekend() {
  var now = new Date();
  var upcoming = [];
  MONTHS.forEach(function(mkey) {
    var d = DB[mkey];
    (d.events || []).forEach(function(ev) {
      if (!ev.date || ev.date.toLowerCase().indexOf('all') !== -1 || ev.date.toLowerCase().indexOf('tbd') !== -1) return;
      var ds = ev.date.replace(/[A-Za-z]+,\s*/,'').replace(/&amp;/g,'&').replace(/&#8211;/g,'-');
      var parts = ds.match(/(\w+)\s+(\d+)/);
      if (!parts) return;
      var months = {January:0,February:1,March:2,April:3,May:4,June:5,July:6,August:7,September:8,October:9,November:10,December:11,Jan:0,Feb:1,Mar:2,Apr:3,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
      var mIdx = months[parts[1]];
      if (mIdx === undefined) return;
      var yr = parseInt(mkey.split('-')[0]);
      var evDate = new Date(yr, mIdx, parseInt(parts[2]));
      var diff = evDate - now;
      if (diff > -86400000 && diff < 10 * 86400000) upcoming.push({ev:ev,date:evDate,mkey:mkey});
    });
  });
  upcoming.sort(function(a,b){ return a.date - b.date; });
  var row = document.getElementById('weekend-row');
  var title = document.getElementById('weekend-title');
  if (!upcoming.length) {
    row.innerHTML = '<div class="we-none">Check back soon &#8212; great events are coming to Wilmington.</div>';
    return;
  }
  title.innerHTML = 'Coming Up in Wilmington &mdash; ' + upcoming[0].date.toLocaleDateString('en-US', {month:'long', day:'numeric'});
  var html = '';
  upcoming.slice(0,8).forEach(function(item) {
    var ev = item.ev;
    var url = ev.shore ? ev.link : (ev.link ? ev.link : '#');
    var isExt = ev.link && !ev.shore;
    var fw = ev.fireworks ? ' onclick="launchFireworks()"' : '';
    html += '<a href="' + url + '"' + (isExt ? ' target="_blank" rel="noopener"' : '') + fw + ' class="we-chip">';
    html += '<span class="we-chip-ico"><svg class="ico-sm" aria-hidden="true" focusable="false"><use href="#i-' + ev.ico + '" xlink:href="#i-' + ev.ico + '"/></svg></span>';
    html += '<div class="we-chip-body"><div class="we-chip-name">' + ev.name + '</div><div class="we-chip-date">' + ev.date + (ev.time ? ' &middot; ' + ev.time : '') + '</div></div>';
    html += '</a>';
  });
  row.innerHTML = html;
}

/* ═══════════════════════════════
   MONTH NAV
═══════════════════════════════ */
function buildMonthNav() {
  var nav = document.getElementById('month-nav');
  var html = '';
  MONTHS.forEach(function(key) {
    var d = DB[key];
    var count = (d.events || []).length + 1;
    var isActive = key === currentMonth;
    html += '<div class="m-tab' + (isActive ? ' active' : '') + '" onclick="switchMonth(\'' + key + '\')" id="mtab-' + key + '">';
    html += '<span class="m-tab-name">' + d.short + '</span>';
    html += '<span class="m-tab-count">' + count + '</span>';
    html += '</div>';
  });
  nav.innerHTML = html;
}

function switchMonth(key) {
  currentMonth = key;
  MONTHS.forEach(function(k) {
    var t = document.getElementById('mtab-' + k);
    if (t) t.classList.toggle('active', k === key);
    var s = document.getElementById('msec-' + k);
    if (s) s.classList.toggle('active', k === key);
  });
  var main = document.getElementById('main-content');
  if (main) main.scrollIntoView({behavior:'smooth', block:'start'});
  setTimeout(function(){ if(cardObserver) document.querySelectorAll('.ev-card:not(.visible),.pairing-card:not(.visible)').forEach(function(el){cardObserver.observe(el);}); }, 100);
}

/* ═══════════════════════════════
   FILTERS
═══════════════════════════════ */
function setFilter(el, cat) {
  currentFilter = cat;
  document.querySelectorAll('.f-chip:not(.free-chip)').forEach(function(c){ c.classList.remove('active'); });
  el.classList.add('active');
  updateAllGrids();
}
function toggleFree(el) {
  freeOnly = !freeOnly;
  el.classList.toggle('active', freeOnly);
  updateAllGrids();
}
function updateAllGrids() {
  MONTHS.forEach(function(key) {
    var grid = document.getElementById('egrid-' + key);
    if (!grid) return;
    grid.innerHTML = buildEventCards(DB[key].events || [], DB[key], key);
    setTimeout(function(){ if(cardObserver) document.querySelectorAll('.ev-card:not(.visible),.pairing-card:not(.visible)').forEach(function(el){cardObserver.observe(el);}); }, 50);
  });
}

/* ═══════════════════════════════
   BUILD MAIN
═══════════════════════════════ */
function buildMain() {
  var main = document.getElementById('main-content');
  var html = '';
  MONTHS.forEach(function(key) {
    var d = DB[key];
    var isActive = key === currentMonth;
    html += '<div class="month-section' + (isActive ? ' active' : '') + '" id="msec-' + key + '">';
    html += buildMonthHeader(d, key);
    html += buildFeaturedCard(d.featured, key);
    html += '<div class="ev-grid" id="egrid-' + key + '">' + buildEventCards(d.events || [], d, key) + '</div>';
    html += '</div>';
  });
  if (!MONTHS.length) html += '<div class="empty-state"><h3 class="empty-title">New events are being added</h3><p>Check the venue calendars below, or browse tours and experiences you can book on ShoreList.</p><p><a href="/category" class="ev-link tix-link">Browse ShoreList experiences &#8594;</a></p></div>';
  html += buildRecurringSection();
  html += buildBookingStrip();
  html += buildSEOSection();
  main.innerHTML = html;
}

function buildMonthHeader(d, key) {
  var count = (d.events || []).length + 1;
  var heat = Math.min(3, Math.ceil(count / 3));
  var dots = '';
  for (var i = 1; i <= 3; i++) dots += '<div class="m-heat-dot' + (i <= heat ? ' on' : '') + '"></div>';
  return '<div class="m-header"><div class="m-header-left"><div class="m-month-label">Events &amp; Things To Do</div><h2 class="m-month-title">' + d.short + ' <em>' + key.split('-')[0] + '</em></h2></div><div class="m-header-right"><span class="m-count">' + count + ' events</span><div class="m-heat">' + dots + '</div></div></div>';
}

function catGrad(cat){var m={music:'mf-bg-music',festival:'mf-bg-festival',outdoor:'mf-bg-outdoor',arts:'mf-bg-arts',family:'mf-bg-family',food:'mf-bg-food',sports:'mf-bg-sports'};return m[cat]||'mf-bg-music';}
function catHead(cat){var m={music:'cat-music',festival:'cat-festival',outdoor:'cat-outdoor',arts:'cat-arts',family:'cat-family',food:'cat-food',sports:'cat-sports'};return m[cat]||'cat-music';}
function catBadge(cat){var m={music:'eb-music',festival:'eb-festival',outdoor:'eb-outdoor',arts:'eb-arts',family:'eb-family',food:'eb-food',sports:'eb-sports'};return m[cat]||'eb-music';}
function heatStars(h){var html='<div class="ev-heat">';for(var i=1;i<=3;i++)html+='<span class="ev-heat-s'+(i>h?' off':'')+'">★</span>';return html+'</div>';}

function buildFeaturedCard(f, key) {
  if (!f) return '';
  var tagsHtml = (f.tags || []).map(function(t){ return '<span class="mf-tag">' + t + '</span>'; }).join('');
  var actHtml = '';
  if (f.link && f.link.startsWith('/')) {
    actHtml = '<a href="' + f.link + '" class="btn-tix">' + (f.tix_text || 'Learn More') + ' &#8594;</a><a href="/waitlist" class="btn-tix-ghost">Join ShoreList Waitlist</a>';
  } else if (f.link) {
    actHtml = '<a href="' + f.link + '" target="_blank" rel="noopener" class="btn-tix">' + (f.tix_text || 'Get Tickets') + ' &#8599;</a><a href="/waitlist" class="btn-tix-ghost">Join ShoreList Waitlist</a>';
  }
  var recHtml = '';
  if (f.shorelist_rec) {
    var r = f.shorelist_rec;
    recHtml = '<div class="mf-tag" style="background:rgba(233,102,69,0.22);border:1px solid rgba(233,102,69,0.40);"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:4px;"><use href="#i-pin" xlink:href="#i-pin"/></svg>ShoreList Recommends: <svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:3px;"><use href="#i-' + r.ico + '" xlink:href="#i-' + r.ico + '"/></svg>' + r.name + '</div>';
  }
  return '<div class="m-featured ' + catGrad(f.cat) + '">' +
    '<div class="mf-body"><div class="mf-inner">' +
    '<div class="mf-badge">' + f.badge + '</div>' +
    '<h3 class="mf-title">' + f.name + '</h3>' +
    '<div class="mf-meta"><strong>' + f.date + '</strong> &nbsp;&middot;&nbsp; ' + f.time + '<br/>' + f.venue + ' &nbsp;&middot;&nbsp; ' + f.neighborhood + '<br/>' + f.price + '</div>' +
    '<div class="mf-tags">' + tagsHtml + (recHtml ? '<br/>' + recHtml : '') + '</div>' +
    '<p class="mf-desc">' + f.desc + '</p>' +
    '<div class="mf-actions">' + actHtml + '</div>' +
    '</div></div>' +
    '<div class="mf-ico-col"><svg class="ico-lg" aria-hidden="true" focusable="false"><use href="#i-' + f.ico + '" xlink:href="#i-' + f.ico + '"/></svg></div>' +
    '</div>';
}

var PAIRINGS = [
  {ico:'building',logo:'/wilmington-walking-tours.webp',tag:'ShoreList Founding Partner',name:'Wilmington Walking &amp; Carolina Beach Tours',sub:'Founding Partner Amanda Leese &#8212; six guided history walks across downtown Wilmington and Carolina Beach. From $20.',link:'/things-to-do/walking-tours'},
  {ico:'ghost',tag:'ShoreList Founding Partner',name:"Sean Austin\'s Wilmington Ghost Walk",sub:"Led by a Netflix &amp; Travel Channel paranormal investigator. 90 minutes through Wilmington\'s most haunted streets. From $30.",link:'/things-to-do/ghost-tours'},
  {ico:'film',tag:'ShoreList Experience',name:'Film &amp; TV Location Tours',sub:'Explore One Tree Hill sets and Iron Man 3 locations. 20+ years of insider knowledge. From $45.',link:'/things-to-do/film-tours'},
  {ico:'surf',tag:'ShoreList Experience',name:'Surf Lessons &#8212; Carolina Beach',sub:'Certified local instructor. All gear. All levels. 2-hour lesson from $100.',link:'/things-to-do/surf-lessons'},
  {ico:'leaf',tag:'ShoreList Experience',name:'Coastal Nature Walks',sub:'Wild Venus flytraps, maritime forest, Carolina Beach State Park. From $35.',link:'/things-to-do/nature-walks'}
];

function makeCalLink(ev, key) {
  if (!ev.date) return '';
  var ds = ev.date.replace(/[A-Za-z]+,\s*/,'').replace(/&#8211;|&ndash;/g,'-').replace(/&amp;/g,'&');
  var parts = ds.match(/(\w+)\s+(\d+)/);
  if (!parts) return '';
  var months = {January:'01',February:'02',March:'03',April:'04',May:'05',June:'06',July:'07',August:'08',September:'09',October:'10',November:'11',December:'12',Jan:'01',Feb:'02',Mar:'03',Apr:'04',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12'};
  var mo = months[parts[1]];
  if (!mo) return '';
  var day = parts[2].padStart(2,'0');
  var yr = key ? key.split('-')[0] : '2026';
  var dateStr = yr + mo + day;
  var title = encodeURIComponent(ev.name + ' - Wilmington, NC');
  var loc = encodeURIComponent(ev.venue + ', ' + ev.neighborhood + ', NC');
  return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + title + '&dates=' + dateStr + 'T180000/' + dateStr + 'T230000&location=' + loc;
}

function shareEvent(name, msg) {
  var text = name + ' &#8212; check out this Wilmington event via ShoreList: shorelist.net/events';
  if (navigator.share) {
    navigator.share({title: name, text: name + ' &#8212; Wilmington, NC event', url: 'https://shorelist.net/events'}).catch(function(){});
  } else {
    navigator.clipboard.writeText('Check out ' + name + ' in Wilmington, NC! More at shorelist.net/events').then(function(){
      showToast('Link copied to clipboard!');
    }).catch(function(){
      showToast('shorelist.net/events');
    });
  }
}

function showToast(msg) {
  var t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(function(){t.classList.remove('show');}, 2800);
}

function buildEventCards(events, monthData, key) {
  if (!events.length) return '<div class="empty-state"><span class="empty-ico" aria-hidden="true"><svg style="width:3rem;height:3rem;color:var(--coral);" aria-hidden="true" focusable="false"><use href="#i-science" xlink:href="#i-science"/></svg></span><h3 class="empty-title">No events match your filter</h3><p class="empty-sub">Try "All Events" or switch to another month &#8212; there\'s always something happening in Wilmington.</p></div>';
  var pi = 0;
  var html = '';
  var shown = 0;
  events.forEach(function(ev) {
    if (currentFilter !== 'all' && ev.cat !== currentFilter) return;
    if (freeOnly && !ev.free) return;
    shown++;
    var fwClick = ev.fireworks ? ' onclick="launchFireworks()"' : '';
    html += '<div class="ev-card"' + fwClick + '>';
    html += '<div class="ev-card-header ' + catHead(ev.cat) + '"></div>';
    html += '<div class="ev-card-body">';
    html += '<div class="ev-cat-row"><span class="ev-badge ' + catBadge(ev.cat) + '"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:4px;vertical-align:-2px;"><use href="#i-' + ev.ico + '" xlink:href="#i-' + ev.ico + '"/></svg>' + ev.cat.charAt(0).toUpperCase() + ev.cat.slice(1) + '</span>' + heatStars(ev.heat) + '</div>';
    html += '<div class="ev-title">' + ev.name + (ev.fireworks ? ' <svg class="ico-xs" aria-hidden="true" focusable="false" style="color:var(--coral);"><use href="#i-fireworks" xlink:href="#i-fireworks"/></svg>' : '') + '</div>';
    html += '<div class="ev-desc">' + ev.desc + '</div>';
    html += '<div class="ev-details">';
    html += '<div class="ev-detail"><span class="ev-detail-ico"><svg class="ico-xs" aria-hidden="true" focusable="false"><use href="#i-calendar" xlink:href="#i-calendar"/></svg></span><span><strong>' + ev.date + '</strong>' + (ev.time ? ' &nbsp;&middot;&nbsp; ' + ev.time : '') + '</span></div>';
    html += '<div class="ev-detail"><span class="ev-detail-ico"><svg class="ico-xs" aria-hidden="true" focusable="false"><use href="#i-pin" xlink:href="#i-pin"/></svg></span><span>' + ev.venue + ' &nbsp;&middot;&nbsp; ' + ev.neighborhood + '</span></div>';
    html += '</div></div>';
    html += '<div class="ev-card-foot">';
    var priceClass = ev.free ? 'free-p' : 'paid-p';
    html += '<div class="ev-price ' + priceClass + '">' + ev.price + '</div>';
    html += '<div class="ev-foot-actions">';
    var calLink = makeCalLink(ev, key);
    if (calLink) html += '<a href="' + calLink + '" target="_blank" rel="noopener" class="ev-action-btn" title="Add to Google Calendar" aria-label="Add to Google Calendar"><svg class="ico-sm" aria-hidden="true" focusable="false"><use href="#i-calendar" xlink:href="#i-calendar"/></svg></a>';
    html += '<button class="ev-action-btn" onclick="event.stopPropagation();shareEvent(\'' + ev.name.replace(/'/g,"\\'") + '\')" title="Share this event" aria-label="Share this event"><svg class="ico-sm" aria-hidden="true" focusable="false" style="transform:rotate(-45deg);"><use href="#i-arrow-right" xlink:href="#i-arrow-right"/></svg></button>';
    if (ev.fireworks) html += '<button class="ev-action-btn fw-trigger" onclick="event.stopPropagation();launchFireworks()" title="Click for fireworks!" aria-label="Trigger fireworks effect"><svg class="ico-sm" aria-hidden="true" focusable="false"><use href="#i-fireworks" xlink:href="#i-fireworks"/></svg></button>';
    if (ev.shore && ev.link) {
      html += '<a href="' + ev.link + '" class="ev-link shore-link">Book ShoreList &#8594;</a>';
    } else if (ev.link) {
      html += '<a href="' + ev.link + '" target="_blank" rel="noopener" class="ev-link tix-link">Get Tickets &#8599;</a>';
    } else if (ev.free) {
      html += '<span class="ev-link free-link">Free Event &#10003;</span>';
    } else {
      html += '<span class="ev-link free-link">Check Dates</span>';
    }
    html += '</div></div></div>';
    if (shown % 5 === 0 && PAIRINGS[pi % PAIRINGS.length]) {
      var p = PAIRINGS[pi % PAIRINGS.length]; pi++;
      html += '<div class="ev-card pairing-card"><div class="ev-card-header" style="background:linear-gradient(90deg,rgba(233,102,69,0.5),rgba(233,102,69,0.8));"></div><div class="pc-body"><div class="pc-tag"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:4px;"><use href="#i-pin" xlink:href="#i-pin"/></svg>' + p.tag + '</div><div class="pc-title">' + (p.logo ? '<span style="display:inline-flex;align-items:center;background:#fff;border-radius:8px;padding:4px 7px;margin-right:8px;vertical-align:-7px;"><img src="' + p.logo + '" alt="" style="height:24px;width:auto;"></span>' : '<svg class="ico-sm" aria-hidden="true" focusable="false" style="margin-right:6px;vertical-align:-3px;color:var(--coral);"><use href="#i-' + p.ico + '" xlink:href="#i-' + p.ico + '"/></svg>') + p.name + '</div><div class="pc-sub">' + p.sub + '</div><a href="' + p.link + '" class="pc-link">Book This &#8594;</a></div></div>';
    }
  });
  if (!shown) return '<div class="empty-state"><span class="empty-ico" aria-hidden="true"><svg style="width:3rem;height:3rem;color:var(--coral);" aria-hidden="true" focusable="false"><use href="#i-science" xlink:href="#i-science"/></svg></span><h3 class="empty-title">No events match this filter</h3><p class="empty-sub">Try "All Events" &#8212; there is always something to do in Wilmington.</p></div>';
  return html;
}

function buildRecurringSection() {
  var html = '<div class="recurring-section"><div class="m-header"><div class="m-header-left"><div class="m-month-label">Year-Round &amp; Weekly</div><h2 class="m-month-title">Recurring <em>Events</em></h2></div></div><div class="rec-scroll">';
  RECURRING.forEach(function(r) {
    var fwAttr = r.fireworks ? ' class="rec-card fw-event" onclick="launchFireworks()"' : ' class="rec-card"';
    html += '<div' + fwAttr + '><div class="rec-ico"><svg class="ico-lg" aria-hidden="true" focusable="false"><use href="#i-' + r.ico + '" xlink:href="#i-' + r.ico + '"/></svg></div><div class="rec-content"><div class="rec-name">' + r.name + (r.fireworks ? ' <svg class="ico-xs" aria-hidden="true" focusable="false" style="color:var(--coral);"><use href="#i-fireworks" xlink:href="#i-fireworks"/></svg>' : '') + '</div><div class="rec-freq">' + r.freq + '</div><div class="rec-desc">' + r.desc + '</div><div class="rec-pills"><span class="rec-pill"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:3px;"><use href="#i-pin" xlink:href="#i-pin"/></svg>' + r.venue + '</span><span class="rec-pill"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:3px;"><use href="#i-calendar" xlink:href="#i-calendar"/></svg>' + r.schedule + '</span><span class="rec-pill rec-free">' + (r.free ? '&#10003; Free' : 'Ticketed') + '</span></div></div></div>';
  });
  return html + '</div></div>';
}

function buildBookingStrip() {
  return '<div class="booking-strip"><div class="bs-left"><div class="bs-tag">While You\'re in Wilmington</div><h3 class="bs-title">Make your visit<br/><em>unforgettable.</em></h3><p class="bs-sub">The event brings you to Wilmington. ShoreList makes sure you experience everything the coast has to offer. Ghost tours, film location tours, surf lessons, nature walks, and historic walking tours &#8212; book instantly on ShoreList.</p></div><div class="bs-right"><a href="/things-to-do/ghost-tours" class="bs-chip"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:5px;vertical-align:-2px;"><use href="#i-ghost" xlink:href="#i-ghost"/></svg>Ghost Walk &mdash; From $30</a><a href="/things-to-do/film-tours" class="bs-chip"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:5px;vertical-align:-2px;"><use href="#i-film" xlink:href="#i-film"/></svg>Film &amp; TV Tours &mdash; From $45</a><a href="/things-to-do/surf-lessons" class="bs-chip"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:5px;vertical-align:-2px;"><use href="#i-surf" xlink:href="#i-surf"/></svg>Surf Lessons &mdash; From $100</a><a href="/things-to-do/nature-walks" class="bs-chip"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:5px;vertical-align:-2px;"><use href="#i-leaf" xlink:href="#i-leaf"/></svg>Nature Walks &mdash; From $35</a><a href="/things-to-do/walking-tours" class="bs-chip"><svg class="ico-xs" aria-hidden="true" focusable="false" style="margin-right:5px;vertical-align:-2px;"><use href="#i-building" xlink:href="#i-building"/></svg>Walking Tours &mdash; From $20</a><a href="/" class="bs-cta">Explore Experiences &#8594;</a></div></div>';
}

function buildSEOSection() {
  return '<div class="seo-section"><h3 class="seo-title">Your Complete Guide to Things to Do in Wilmington, NC</h3><div class="seo-grid"><p class="seo-p"><strong>Wilmington, NC</strong> is the heart of one of the most vibrant coastal communities on the East Coast. From holiday tree lightings, drone shows and boat flotillas on the Cape Fear to concerts at the <strong>Wilson Center</strong> and <strong>Live Oak Bank Pavilion</strong>, and beloved annual festivals, there is genuinely something to do in Wilmington every week of the year.<br/><br/>The <strong>Greenfield Lake Amphitheater</strong> offers intimate lakeside shows with artists like Blackberry Smoke, Rhiannon Giddens, and Band of Horses. The <strong>Wilson Center at CFCC</strong> brings world-class touring artists downtown. And Dead Crow Comedy Room and Seven Mile Post keep local entertainment alive year-round.</p><p class="seo-p"><strong>ShoreList</strong> is Wilmington\'s only hyperlocal experience booking platform. While this guide keeps you informed on every major event, ShoreList connects you directly with the local operators &#8212; the ghost tour guides, surf instructors, nature walk naturalists, and film location experts &#8212; who make a Wilmington visit extraordinary.<br/><br/>This page features <strong>live real-time beach weather</strong> for Wilmington, Carolina Beach, and Wrightsville Beach, plus direct links to live Surfchex webcams for all four beach communities. ShoreList is built by locals, for visitors &#8212; and it shows in every detail.</p></div></div>';
}

/* ═══════════════════════════════
   SCROLL REVEAL
═══════════════════════════════ */
var cardObserver;
function initScrollObserver() {
  if (!('IntersectionObserver' in window)) {
    document.querySelectorAll('.ev-card,.pairing-card').forEach(function(el){el.classList.add('visible');});
    return;
  }
  cardObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        cardObserver.unobserve(entry.target);
      }
    });
  }, {threshold: 0.08, rootMargin: '0px 0px -30px 0px'});
  document.querySelectorAll('.ev-card,.pairing-card').forEach(function(el){cardObserver.observe(el);});
}

/* ═══════════════════════════════
   FIREWORKS
═══════════════════════════════ */
var FW = {active:false, particles:[], raf:null};
function launchFireworks() {
  var canvas = document.getElementById('fw-canvas');
  canvas.style.display = 'block';
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  var ctx = canvas.getContext('2d');
  FW.active = true;
  FW.particles = [];
  var colors = ['#E96645','#F5E8CB','#FFD700','#4ade80','#60a5fa','#f472b6','#a78bfa','#fb923c'];
  var launches = 9;
  for (var i = 0; i < launches; i++) {
    (function(idx) {
      setTimeout(function() {
        if (!FW.active) return;
        var x = 80 + Math.random() * (window.innerWidth - 160);
        var y = 60 + Math.random() * (window.innerHeight * 0.45);
        var color = colors[Math.floor(Math.random() * colors.length)];
        var count = 55 + Math.floor(Math.random() * 25);
        for (var j = 0; j < count; j++) {
          var angle = (Math.PI * 2 / count) * j + Math.random() * 0.3;
          var spd = 1.8 + Math.random() * 4.5;
          FW.particles.push({x:x,y:y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd,alpha:1,color:color,size:1.5+Math.random()*2.5,decay:0.012+Math.random()*0.014,trail:[]});
        }
      }, idx * 380);
    })(i);
  }
  if (FW.raf) cancelAnimationFrame(FW.raf);
  animateFW(ctx, canvas);
  setTimeout(function(){
    FW.active = false;
    setTimeout(function(){
      FW.particles = [];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.display = 'none';
    }, 1200);
  }, 4200);
}
function animateFW(ctx, canvas) {
  if (!FW.active && FW.particles.length === 0) return;
  FW.raf = requestAnimationFrame(function(){animateFW(ctx, canvas);});
  ctx.fillStyle = 'rgba(0,0,0,0.13)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  FW.particles = FW.particles.filter(function(p) {
    p.x += p.vx; p.y += p.vy;
    p.vy += 0.055;
    p.vx *= 0.979;
    p.alpha -= p.decay;
    if (p.alpha <= 0) return false;
    ctx.save();
    ctx.globalAlpha = Math.max(0, p.alpha);
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.fill();
    ctx.restore();
    return true;
  });
}

/* ═══════════════════════════════
   OCEAN AUDIO
═══════════════════════════════ */
var audioCtx, audioMuted = true, gainNode, sourceNode;
function initAudio() {
  // Audio is muted by default &#8212; user activates
}
function toggleAudio() {
  var btn = document.getElementById('audio-btn');
  var lbl = document.getElementById('audio-label');
  if (audioMuted) {
    audioMuted = false;
    btn.classList.remove('muted');
    if (lbl) lbl.textContent = 'Mute Ocean';
    startOceanAudio();
  } else {
    audioMuted = true;
    btn.classList.add('muted');
    if (lbl) lbl.textContent = 'Ocean Sounds';
    stopOceanAudio();
  }
}
function startOceanAudio() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + 2.5);
    gainNode.connect(audioCtx.destination);
    // Generate ocean sound with layered noise
    function makeWave(freq, gain) {
      var buf = audioCtx.createBuffer(1, audioCtx.sampleRate * 4, audioCtx.sampleRate);
      var data = buf.getChannelData(0);
      for (var i = 0; i < data.length; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.5;
      }
      var src = audioCtx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      var bpf = audioCtx.createBiquadFilter();
      bpf.type = 'bandpass';
      bpf.frequency.value = freq;
      bpf.Q.value = 0.8;
      var g = audioCtx.createGain();
      g.gain.value = gain;
      src.connect(bpf);
      bpf.connect(g);
      g.connect(gainNode);
      src.start();
      return src;
    }
    // Layer low, mid, and high ocean frequencies
    window._oceanSrcs = [
      makeWave(180, 0.7),
      makeWave(380, 0.5),
      makeWave(600, 0.3),
      makeWave(90, 0.8)
    ];
    // Add slow LFO swell
    var lfo = audioCtx.createOscillator();
    lfo.frequency.value = 0.08;
    var lfoGain = audioCtx.createGain();
    lfoGain.gain.value = 0.06;
    lfo.connect(lfoGain);
    lfoGain.connect(gainNode.gain);
    lfo.start();
    window._oceanLFO = lfo;
  } catch(e) {}
}
function stopOceanAudio() {
  try {
    if (gainNode) {
      gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.5);
      setTimeout(function(){
        if(window._oceanSrcs) window._oceanSrcs.forEach(function(s){try{s.stop();}catch(e){}});
        if(window._oceanLFO) try{window._oceanLFO.stop();}catch(e){}
      }, 1600);
    }
  } catch(e) {}
}

