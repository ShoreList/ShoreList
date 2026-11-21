var CAT_DATA={
  'ghost-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-ghost" xlink:href="#i-ghost"/></svg>',title:'Ghost Tours',sub:'Spine-tingling walks through Wilmington\'s most haunted streets with expert local guides.'},
  'museums':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-train" xlink:href="#i-train"/></svg>',title:'Museums & Attractions',sub:'Wilmington\'s must-see museums and historic attractions &#8212; tickets, hours, and events, all on ShoreList.'},
  'walking-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-compass" xlink:href="#i-compass"/></svg>',title:'Walking & History Tours',sub:'Guided historic strolls through downtown Wilmington and Carolina Beach — architecture, art, prohibition history, and coastal stories with Founding Partner Amanda Leese.'},
  'film-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-film" xlink:href="#i-film"/></svg>',title:'Film & TV Location Tours',sub:'Explore the real sets and locations behind Wilmington\'s legendary film and TV history &#8212; guided by someone who lived it from the inside.'},
  'fishing-charters':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-fish" xlink:href="#i-fish"/></svg>',title:'Fishing Charters',sub:'Half and full-day offshore charters from Carolina Beach and Wrightsville Beach.'},
  'kayak-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-kayak" xlink:href="#i-kayak"/></svg>',title:'Kayak Tours',sub:'Guided paddle adventures through tidal creeks, salt marshes, and barrier islands of coastal NC.'},
  'river-cruises':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-ship" xlink:href="#i-ship"/></svg>',title:'River Cruises',sub:'Sunset and sightseeing cruises along the Wilmington waterfront and Cape Fear River.'},
  'surf-lessons':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-surf" xlink:href="#i-surf"/></svg>',title:'Surf Lessons',sub:'Learn to surf at Wrightsville Beach with certified local instructors. All gear included.'},
  'paddleboard':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-paddleboard" xlink:href="#i-paddleboard"/></svg>',title:'Paddleboard & SUP',sub:'Stand-up paddleboard rentals and guided lessons on the calm coastal waterways.'},
  'bike-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-bike" xlink:href="#i-bike"/></svg>',title:'Bike Tours',sub:'Guided rides through Wilmington\'s historic districts, riverfront, and beachfront communities.'},
  'wildlife-tours':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-dolphin" xlink:href="#i-dolphin"/></svg>',title:'Wildlife Tours',sub:'Dolphin watches, birding excursions, and guided nature tours along the NC coast.'},
  'ebike-rentals':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-ebike" xlink:href="#i-ebike"/></svg>',title:'E-Bike Rentals',sub:'Explore the islands and beach communities on electric bikes. No sweat required.'},
  'scooter-rentals':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-scooter" xlink:href="#i-scooter"/></svg>',title:'Scooter Rentals',sub:'Zip around the beach towns at your own pace. The best way to cover the coast.'},
  'fat-bike-rentals':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-bike" xlink:href="#i-bike"/></svg>',title:'Fat Bike Rentals',sub:'Wide-tire bikes built for the sand. Ride the beach the way the locals do.'},
  'sailboat-rides':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-sailboat" xlink:href="#i-sailboat"/></svg>',title:'Sailboat Rides',sub:'Private and group sailing experiences along the breathtaking North Carolina coastline.'},
  'nature-walks':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-leaf" xlink:href="#i-leaf"/></svg>',title:'Nature Walking Tours',sub:'Guided walks through maritime forests, cypress swamps, and coastal trails.'},
  'beach-photography':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-camera" xlink:href="#i-camera"/></svg>',title:'Beach Photography',sub:'Family portraits, engagement sessions, and couples photos on the beach at golden hour.'},
  'beach-picnics':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-basket" xlink:href="#i-basket"/></svg>',title:'Beach Picnics',sub:'Fully set-up private picnic experiences delivered to the beach. You just show up.'},
  'beach-chairs':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-umbrella" xlink:href="#i-umbrella"/></svg>',title:'Beach Chair Rentals',sub:'Chairs, umbrellas, and beach gear delivered and set up before you arrive.'},
  'jet-ski-rentals':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-jetski" xlink:href="#i-jetski"/></svg>',title:'Jet Ski Rentals',sub:'Hit the open water on a jet ski. Rentals available at Carolina Beach and Wrightsville Beach.'},
  'golf-cart-rentals':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-golf" xlink:href="#i-golf"/></svg>',title:'Golf Cart Rentals',sub:'Cruise the beach communities in a golf cart. The most fun way to explore the island.'},
  'wellness':{icon:'<svg class="ico-lg cd-svg" aria-hidden="true" focusable="false"><use href="#i-lotus" xlink:href="#i-lotus"/></svg>',title:'Wellness & Spa',sub:'Yoga on the beach, reiki, massage, spas, and mindful coastal retreats on the NC coast.'}
};

var OPS={
  'walking-tours':[
    {id:'wwt-original',business:'The Original History & Architecture Tour',operator:'Wilmington Walking Tours',live:true,title:'Led by Amanda Leese',
     desc:'Wilmington 101, from the 1730s to today. Over a relaxed 1.5-mile loop through the Historic District, you\'ll trace the city\'s colonial roots, its industry and its complicated past, and the architecture still lining these streets — Colonial, Greek Revival, Queen Anne, and Italianate. The original tour, and still the best place to start.',
     price:'$25',priceLabel:'per person',priceCents:2500,
     tags:['Wilmington Historic District','1.75 Hours','1.5-Mile Loop','All Ages','ShoreList Founding Partner'],
     note:'Starts at Front Street Inn. Offered daily except Tuesdays. Secure your spot online.',
     schedule:{days:[0,1,3,4,5,6],slots:['9:00 AM'],rules:[{mdFrom:'03-15',mdUntil:'11-14',slots:['9:00 AM']},{slots:['11:30 AM']}],cap:24}},
    {id:'wwt-happyhour',business:'Historic Happy Hour Tour',operator:'Wilmington Walking Tours',live:true,title:'Led by Amanda Leese',
     desc:'A little history, a little libation. This stroll pairs a mini history lesson — from Wilmington\'s founding through the 20th century — with three 25-minute stops at downtown bars. Begin at the Gazebo Bar, wind through The Vine, and finish at the Wine Knot Sky Bar. Drinks are on you.',
     price:'$30',priceLabel:'per person',priceCents:3000,
     tags:['Wilmington Historic District','21+','Every Other Friday','Three Bar Stops','ShoreList Founding Partner'],
     note:'Drinks not included. Every other Friday — times vary seasonally.',
     schedule:{days:[5],slots:['6:00 PM'],rules:[{until:'2026-09-04',slots:['6:00 PM']},{slots:['5:00 PM']}],cap:16}},
    {id:'wwt-speakeasy',business:'Speakeasy & Prohibition Walking Tour',operator:'Wilmington Walking Tours',live:true,title:'Led by Amanda Leese',
     desc:'Step into Wilmington from the 1880s to the 1930s — the days of Barbary Row and the secret watering holes hidden inside today\'s restored downtown buildings. The route starts at The Ivey in the Alley, with stops at Underfront Co. and the Blind Elephant. Prohibition never looked so good.',
     price:'$30',priceLabel:'per person',priceCents:3000,
     tags:['Wilmington Historic District','21+','Every Other Friday','Prohibition Era','ShoreList Founding Partner'],
     note:'Drinks not included. Every other Friday — times vary seasonally.',
     schedule:{days:[5],slots:['6:00 PM'],rules:[{until:'2026-09-04',slots:['6:00 PM']},{slots:['5:00 PM']}],cap:16}},
    {id:'wwt-candlelight',business:'Christmas Candlelight Victorians Walk',operator:'Wilmington Walking Tours',live:true,title:'Led by Amanda Leese',
     desc:'A Wilmington holiday tradition. By the glow of provided candles, this gentle one-mile walk takes in the Historic District\'s decorated Victorian homes and the holiday customs of the era. About 90 minutes of seasonal magic downtown.',
     price:'$20',priceLabel:'per person',priceCents:2000,
     tags:['Wilmington Historic District','Seasonal · December','1.5 Hours','Family Friendly','ShoreList Founding Partner'],
     note:'Starts at Front Street Inn. December only — 4:30 PM or 6:15 PM.',
     schedule:{days:[1,3,5,6],slots:['4:30 PM','6:15 PM'],months:[11],cap:24}},
    {id:'cbt-mural',business:'Carolina Beach History & Mural Walk',operator:'Carolina Beach Tours',live:true,title:'Led by Amanda Leese',
     desc:'Pleasure Island\'s story, told through its art. This easygoing 1.5-mile stroll from Carolina Beach Lake Park weaves coastal history together with the Carolina Beach Mural Project — the surf and shag-culture murals that color the town. Your ticket includes a $5 donation to the Mural Project.',
     price:'$30',priceLabel:'per person',priceCents:3000,
     tags:['Carolina Beach','Seasonal · May–Sep','1.5 Hours','Family Friendly','ShoreList Founding Partner'],
     note:'Starts at CB Lake Park. Includes a $5 Mural Project donation.',
     schedule:{days:[2],slots:['9:30 AM'],months:[4,5,6,7,8],cap:24}},
    {id:'cbt-divebar',business:'Carolina Beach History & Dive Bar Tour',operator:'Carolina Beach Tours',live:true,title:'Led by Amanda Leese',
     desc:'The gritty, colorful side of Pleasure Island. Over about two hours and a mile, you\'ll hit the local spots that built Carolina Beach — starting at The Sea Witch, with stops at the Silver Dollar and the legendary Fat Pelican. History with a little salt.',
     price:'$30',priceLabel:'per person',priceCents:3000,
     tags:['Carolina Beach','21+','Seasonal · May–Sep','2 Hours','ShoreList Founding Partner'],
     note:'Drinks not included. Starts at The Sea Witch.',
     schedule:{days:[3],slots:['5:30 PM'],months:[4,5,6,7,8],cap:20}}
  ],
  'film-tours':[
    {id:'ron-film',business:'Wilmywood Insider Tours',operator:'Industry Insider & Local Expert',title:'20+ Years in the Wilmington Film & Hospitality Industry',
     desc:'Wilmington isn\'t just a beach town &#8212; it\'s one of the most filmed cities in America. One Tree Hill. Dawson\'s Creek. Iron Man 3. Safe Haven. A Walk to Remember. Hundreds of productions have called Wilmington home. Your guide has spent over two decades working inside the Wilmington film and hospitality industry and knows the stories behind the sets, the locations, and the legends that most tourists never hear. This isn\'t a bus tour reading from a brochure. This is Wilmywood &#8212; from the inside.',
     price:'$45',priceLabel:'per person',priceCents:4500,
     tags:['Downtown Wilmington','90 Minutes','All Ages','Film History'],
     note:'Secure your spot online. Balance due at tour.',
     schedule:{days:[3,4,5,6,0],slots:['10:00 AM','2:00 PM','6:00 PM']}}
  ],
  'ghost-tours':[
    {id:'sean-ghost',business:'Sean Austin\'s Wilmington Ghost Walk',operator:'Sean Austin',title:'Led by a Netflix &amp; Travel Channel Paranormal Investigator',
     desc:'This is the most unforgettable ghost walk in Wilmington &mdash; 90 minutes through the haunted heart of one of America&rsquo;s oldest cities, led by Sean Austin: star of Netflix&rsquo;s <em>28 Days Haunted</em>, lead investigator on Travel Channel&rsquo;s <em>Ghost Loop</em> (now on Discovery+), and featured on <em>The Demon Files</em>. Trained demonologist, psychic medium, and published author of <em>Shadow Chaser</em>, Sean brings 16+ years of real paranormal investigation to the city&rsquo;s most haunted streets, antebellum mansions, and burial grounds. Family-friendly, endlessly fascinating, and impossible to forget &mdash; available <strong>exclusively on ShoreList</strong>.',
     price:'$30',priceLabel:'per person',priceCents:3000,
     tags:['ShoreList Founding Partner','Netflix','Travel Channel','90 Minutes','All Ages','Exclusive to ShoreList','Downtown Wilmington'],
     note:'Led by Sean Austin &mdash; nationally recognized paranormal TV investigator. Secure your spot online. Exclusive to ShoreList.',
     schedule:{days:[4,5,6,0],slots:['7:00 PM','8:30 PM','10:00 PM']}}
  ],
  'surf-lessons':[
    {id:'james-surf',business:'Carolina Beach Surf Co.',operator:'Certified Local Instructor',title:'Professional Surf Instructor &middot; 10+ Years Experience',
     desc:'Learn to surf at one of the best beginner beaches on the East Coast with a certified local instructor who has spent years teaching in these exact waters. Whether you\'ve never touched a board or want to level up your skills, this lesson is fun, safe, and unforgettable. Every session is tailored to your level. All equipment included &#8212; board, wetsuit, and rash guard.',
     price:'$100',priceLabel:'per person',priceCents:10000,
     tags:['Carolina Beach','2 Hours','All Skill Levels','All Gear Included'],
     note:'Secure your spot online. Balance due at lesson.',
     schedule:{days:[1,2,4,5,6,0],slots:['8:00 AM','10:00 AM','12:00 PM','2:00 PM']}}
  ],
  'nature-walks':[
    {id:'nature-walk',business:'Coastal Carolina Nature Walks',operator:'',title:'Coming Soon &mdash; Operator Joining Shorelist',
     desc:'Discover the wild, beautiful natural world of coastal North Carolina. From ancient cypress swamps and carnivorous plant bogs of Carolina Beach State Park to pristine maritime forests and tidal marshes, these guided walks reveal the incredible biodiversity that makes this coast so special. This experience is launching soon on Shorelist &#8212; tap to be notified when bookings open.',
     price:'$35',priceLabel:'per person',priceCents:3500,
     tags:['Carolina Beach State Park','2 Hours','Family Friendly','Coming Soon'],
     note:'Secure your spot online. Balance due at walk.',
     schedule:{days:[3,6,0],slots:['8:00 AM','10:00 AM','2:00 PM']}}
  ]
};

/* CALENDAR ENGINE */
var SLOT_CAP=25; // max guests per tour time slot — enforced again server-side
var CS={};
var MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
var DW=['Su','Mo','Tu','We','Th','Fr','Sa'];

function calInit(id,sched){
  var n=new Date();
  CS[id]={y:n.getFullYear(),m:n.getMonth(),date:null,slot:null,sched:sched,booked:{},loaded:{}};
  calDraw(id);
  calLoad(id,n.getFullYear(),n.getMonth()+1);
}

function calDraw(id){
  var s=CS[id]; if(!s) return;
  var ml=document.getElementById('cm-'+id); if(ml) ml.textContent=MN[s.m]+' '+s.y;
  var g=document.getElementById('cg-'+id); if(!g) return;
  var today=new Date(); today.setHours(0,0,0,0);
  var tmrw=new Date(today); tmrw.setDate(tmrw.getDate()+1);
  var first=new Date(s.y,s.m,1);
  var dim=new Date(s.y,s.m+1,0).getDate();
  var fdow=first.getDay();
  var ae=document.activeElement, keep=ae&&g.contains(ae)?ae.getAttribute('data-date'):null;
  var h=''; DW.forEach(function(d){h+='<div class="cal-dh" aria-hidden="true">'+d+'</div>';}); 
  for(var i=0;i<fdow;i++) h+='<div class="cal-d empty" aria-hidden="true"></div>';
  for(var day=1;day<=dim;day++){
    var dt=new Date(s.y,s.m,day); dt.setHours(0,0,0,0);
    var ds=pad(s.y)+'-'+pad(s.m+1)+'-'+pad(day);
    var dow=dt.getDay();
    var past=dt<tmrw;
    var avail=!past&&s.sched.days.indexOf(dow)!==-1&&(!s.sched.months||s.sched.months.indexOf(s.m)!==-1);
    var sel=s.date===ds;
    var tod=dt.getTime()===today.getTime();
    var cls='cal-d'+(past?' past':avail?' yes':' no')+(sel?' picked':'')+(tod&&!sel?' today-ring':'');
    var oc=avail?' onclick="cpick(\''+id+'\',\''+ds+'\')\"':' disabled';
    var al=dt.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'})+(avail?(sel?', selected':', available'):', unavailable');
    h+='<button type="button" class="'+cls+'" data-date="'+ds+'" aria-label="'+al+'"'+(avail?' tabindex="-1" aria-pressed="'+(sel?'true':'false')+'"':'')+oc+'>'+day+'</button>';
  }
  g.innerHTML=h;
  if(!g.getAttribute('data-kb')){g.setAttribute('data-kb','1');g.addEventListener('keydown',calKey);}
  // one Tab stop in the grid (roving tabindex): the focused day, else the picked day, else the first available day
  var kb=(keep&&g.querySelector('button[data-date="'+keep+'"]:not([disabled])'))||(s.date&&g.querySelector('button[data-date="'+s.date+'"]:not([disabled])'))||g.querySelector('button.cal-d:not([disabled])');
  if(kb){kb.setAttribute('tabindex','0');if(keep)kb.focus({preventScroll:true});}
  else if(keep){var ar=g.parentNode.querySelectorAll('.cal-arrow');if(ar[1])ar[1].focus({preventScroll:true});}
  if(s.date) slotDraw(id);
}

// arrow keys move between available days (Tab, Enter and Space work natively on the buttons)
function calKey(e){
  var b=e.target&&e.target.closest?e.target.closest('button.cal-d'):null; if(!b) return;
  if(e.key==='PageDown'||e.key==='PageUp'){e.preventDefault();var cid=this.id.slice(3);if(e.key==='PageDown')cnext(cid);else cprev(cid);return;}
  var step={ArrowLeft:-1,ArrowRight:1,ArrowUp:-7,ArrowDown:7}[e.key];
  if(!step) return;
  var all=[].slice.call(this.querySelectorAll('button.cal-d')), i=all.indexOf(b)+step;
  while(i>=0&&i<all.length&&all[i].disabled) i+=step;
  e.preventDefault();
  if(i>=0&&i<all.length){b.setAttribute('tabindex','-1');all[i].setAttribute('tabindex','0');all[i].focus();}
}
function cpick(id,ds){
  var s=CS[id]; if(!s) return;
  s.date=ds; s.slot=null;
  document.getElementById('hd-'+id).value='';
  document.getElementById('ht-'+id).value='';
  sumHide(id);
  calDraw(id);
  slotDraw(id);
}

function getSlots(sched,dateStr){
  if(sched.rules&&dateStr){
    for(var i=0;i<sched.rules.length;i++){var r=sched.rules[i];
      if(r.mdFrom&&r.mdUntil){
        var md=dateStr.slice(5);
        var hit=r.mdFrom<=r.mdUntil?(md>=r.mdFrom&&md<=r.mdUntil):(md>=r.mdFrom||md<=r.mdUntil);
        if(hit)return r.slots;
      } else {
        if(r.from&&dateStr<r.from)continue;
        if(r.until&&dateStr>r.until)continue;
        return r.slots;
      }
    }
  }
  return sched.slots;
}
function slotDraw(id){
  var s=CS[id]; if(!s||!s.date) return;
  var w=document.getElementById('sw-'+id); if(!w) return;
  var taken=s.booked[s.date]||{};
  var do2=new Date(s.date+'T12:00:00');
  var lbl=do2.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});
  var ae=document.activeElement, keep=ae&&w.contains(ae)?ae.getAttribute('data-slot'):null;
  var h='<div class="slots-area"><div class="slots-for" id="sf-'+id+'">Available times for <strong>'+lbl+'</strong></div><div class="slots-row" role="group" aria-labelledby="sf-'+id+'">';
  var slotsForDate=getSlots(s.sched,s.date);
  var slotCap=s.sched.cap||SLOT_CAP;
  slotsForDate.forEach(function(sl){
    var tk=(taken[sl]||0)>=slotCap;
    var pk=s.slot===sl;
    var cls='slt'+(tk?' slt-taken':'')+(pk?' slt-picked':'');
    var oc=tk?' disabled':' onclick="spick(\''+id+'\',\''+sl.replace(/'/g,"\\'")+'\')"';
    h+='<button type="button" class="'+cls+'" data-slot="'+esc(sl)+'"'+(tk?'':' aria-pressed="'+(pk?'true':'false')+'"')+oc+'>'+sl+(tk?'<span class="slt-sub">Sold Out</span>':'')+'</button>';
  });
  h+='</div></div>';
  w.innerHTML=h;
  if(keep){var bs=w.querySelectorAll('button.slt');for(var k=0;k<bs.length;k++){if(bs[k].getAttribute('data-slot')===keep&&!bs[k].disabled){bs[k].focus({preventScroll:true});break;}}}
}

function spick(id,sl){
  var s=CS[id]; if(!s) return;
  s.slot=sl;
  document.getElementById('hd-'+id).value=s.date;
  document.getElementById('ht-'+id).value=sl;
  sumShow(id);
  slotDraw(id);
  var sum=document.getElementById('ss-'+id);
  if(sum) setTimeout(function(){sum.scrollIntoView({behavior:'smooth',block:'nearest'});},60);
}

function sumShow(id){
  var s=CS[id]; var el=document.getElementById('ss-'+id); if(!el||!s||!s.date||!s.slot) return;
  var do2=new Date(s.date+'T12:00:00');
  var fmt=do2.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
  el.innerHTML='&#10003;&nbsp; <strong>'+fmt+' at '+s.slot+'</strong> selected &#8212; tap below to confirm';
  el.classList.add('on');
}
function sumHide(id){var el=document.getElementById('ss-'+id); if(el) el.classList.remove('on');}

function cprev(id){var s=CS[id];if(!s)return;if(s.m===0){s.m=11;s.y--;}else s.m--;s.date=null;s.slot=null;var sw=document.getElementById('sw-'+id);if(sw)sw.innerHTML='';sumHide(id);calDraw(id);calLoad(id,s.y,s.m+1);}
function cnext(id){var s=CS[id];if(!s)return;if(s.m===11){s.m=0;s.y++;}else s.m++;s.date=null;s.slot=null;var sw=document.getElementById('sw-'+id);if(sw)sw.innerHTML='';sumHide(id);calDraw(id);calLoad(id,s.y,s.m+1);}

function calLoad(id,y,m){
  var key=y+'-'+m; var s=CS[id]; if(!s||s.loaded[key]) return;
  s.loaded[key]=true;
  fetch('/.netlify/functions/get-availability?operatorId='+encodeURIComponent(id)+'&year='+y+'&month='+m)
    .then(function(r){return r.json();})
    .then(function(data){
      (data.booked||[]).forEach(function(b){
        if(!b.date||!b.timeSlot) return;
        if(!s.booked[b.date]) s.booked[b.date]={};
        s.booked[b.date][b.timeSlot]=(s.booked[b.date][b.timeSlot]||0)+(parseInt(b.guests,10)||1);
      });
      calDraw(id);
    }).catch(function(){});
}

function pad(n){return String(n).padStart(2,'0');}

/* FORM */
  // Calendar init - bookings coming soon
function getCat(){return window.__CAT||new URLSearchParams(window.location.search).get('cat')||'';}
function rich(s){return esc(s).replace(/&lt;(\/?)(em|strong)&gt;/g,'<$1$2>');}
function esc(s){return String(s).replace(/&(?!#?\w+;)/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}

function renderMuseumsCategory(){
  var mh='<div class="hm-badge live">Official Partner On Board</div>'
    +'<div class="hm-badge">Open Daily &middot; Rain or Shine</div>'
    +'<div class="hm-badge">Tickets &amp; Events</div>';
  var hm=document.getElementById('hmeta'); if(hm){hm.innerHTML=mh;}
  var container=document.getElementById('mc');
  if(!container) return;
  var h='';
  h+='<div class="section-label">Featured Partner</div>';
  h+='<h2 class="section-title">Wilmington\u2019s <em>Museums</em></h2>';
  h+='<p class="section-sub">Real local institutions, partnered with ShoreList &mdash; explore what makes this coast worth remembering.</p>';
  h+='<div class="operator-grid">';
  h+='<div class="op-card" id="card-railroad-museum"><div class="op-card-body">';
  h+='<div class="op-card-header"><div><div class="op-live-badge"><span class="op-live-dot"></span>Official ShoreList Partner</div><div class="op-business-name">Wilmington Railroad Museum</div><div class="op-operator-name">505 Nutt Street &nbsp;&middot;&nbsp; Downtown Wilmington &nbsp;&middot;&nbsp; Since 1979</div></div><div class="op-price-tag"><div class="op-price">From $8</div><div class="op-price-label">per person</div></div></div>';
  h+='<p class="op-desc">Climb aboard a real 1911 Baldwin steam locomotive, walk through a life-size caboose, and watch 20+ model trains run through a 1,600 sq ft layout &mdash; all inside an authentic 1883 freight warehouse from Wilmington\u2019s days as headquarters of the Atlantic Coast Line Railroad. A 501(c)(3) nonprofit, fun for every age, and one of the best rain-or-shine things to do downtown.</p>';
  h+='<div class="op-tags"><span class="op-tag">Official Partner</span><span class="op-tag">All Ages</span><span class="op-tag">Rain or Shine</span><span class="op-tag">1911 Steam Locomotive</span><span class="op-tag">20+ Model Trains</span><span class="op-tag">Downtown</span></div>';
  h+='<div class="op-divider"></div>';
  h+='<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.78rem;color:#3a5a61;font-weight:600;margin:0 0 14px;"><span>&#10003; Tickets online &amp; at the door</span><span>&#10003; Supports a local nonprofit</span><span>&#10003; Museum events posted here first</span></div>';
  h+='<div class="op-book-row"><a href="/wilmington-railroad-museum" class="btn-sub" style="width:100%;font-size:1rem;display:block;text-align:center;text-decoration:none;box-sizing:border-box;">View Tickets, Hours &amp; Events &#8594;</a></div>';
  h+='</div></div>';
  h+='</div>';
  h+='<div style="margin-top:28px;text-align:center;background:var(--cream,#F5E8CB);border:1.5px dashed var(--coral,#E96645);border-radius:14px;padding:22px 24px;">';
  h+='<div style="font-weight:800;color:var(--teal,#0A4D5C);font-size:1.02rem;margin-bottom:6px;">More museums &amp; attractions joining soon</div>';
  h+='<div style="font-size:0.9rem;color:#3a5a61;line-height:1.7;max-width:520px;margin:0 auto;">Run a museum, historic site, or attraction in Wilmington or at the beaches? <a href="/join" style="color:var(--coral,#E96645);font-weight:700;">Partner with ShoreList &#8594;</a></div>';
  h+='</div>';
  container.innerHTML=h;
}
function renderPage(){
  var cat=getCat(); var d=CAT_DATA[cat]; if(!d){window.location.replace('/things-to-do');return;}
  if(!window.__CAT)document.title=d.title+' \u2014 ShoreList Wilmington, NC';
  document.body.setAttribute('data-cat',cat);
  document.getElementById('hico').innerHTML=d.icon;
  document.getElementById('htitle').textContent=window.__H1||d.title;
  document.getElementById('hsub').textContent=String(d.sub).replace(/&#(\d+);/g,function(_,n){return String.fromCharCode(+n);});
  document.getElementById('hbc').textContent=d.title;
  if(cat==='museums'){renderMuseumsCategory();return;}
  var ops=OPS[cat]||[];
  var mh='';
  var liveOps=ops.filter(function(o){return o.live;});
  if(liveOps.length>0){mh+='<div class="hm-badge live">Bookings Open Now</div>';mh+='<div class="hm-badge">'+liveOps.length+' Experience'+(liveOps.length>1?'s':'')+' Live</div>';mh+='<div class="hm-badge">Secure Checkout via Stripe</div>';mh+='<div class="hm-badge">Free Cancellation 24hrs+</div>';}
  else if(ops.length>0){mh+='<div class="hm-badge live">'+ops.length+' Operator'+(ops.length>1?'s':'')+' Ready to Book</div>';mh+='<div class="hm-badge">Waitlist Open Now</div>';mh+='<div class="hm-badge">Bookings Opening Soon</div>';mh+='<div class="hm-badge">Secure Checkout via Stripe</div>';}
  else{mh+='<div class="hm-badge">Coming Soon</div>';mh+='<div class="hm-badge">Notify Me</div>';}
  document.getElementById('hmeta').innerHTML=mh;

  var h='';
  if(ops.length>0){
    h+='<div class="section-label">Book an Experience</div>';
    h+='<h2 class="section-title">Our <em>Local Operators</em></h2>';
    h+= liveOps.length>0
      ? '<p class="section-sub">Pick your experience, choose a date and time, and book securely online. Checkout is powered by Stripe &#8212; full refund if you cancel 24+ hours before your experience.</p>'
      : '<p class="section-sub">Bookings open soon. Drop your email below or <a href="/waitlist" style="color:var(--coral);font-weight:600;">join the full waitlist</a> to tell us more about your trip.</p>';
    h+='<div class=\"guarantee-bar\">';
    h+='<span class=\"gb-ico\" style=\"color:#1a7a4a;display:inline-flex;align-items:center;\"><svg class=\"ico-sm\" aria-hidden=\"true\" focusable=\"false\"><use href=\"#i-shield\" xlink:href=\"#i-shield\"/></svg></span>';
    h+='<div class=\"gb-text\">ShoreList Guarantee &nbsp;&mdash;&nbsp; <span>Operators we know personally. Full refund if you cancel 24+ hours before your experience.</span></div>';
    h+='</div>';
    h+='<div class=\"booking-steps\">';
    h+='<div class=\"bs-step\"><span class=\"bs-step-n\">1</span><span>Browse</span></div>';
    h+='<div class=\"bs-step active\"><span class=\"bs-step-n\">2</span><span>Experience</span></div>';
    h+='<div class=\"bs-step\"><span class=\"bs-step-n\">3</span><span>Book Securely</span></div>';
    h+='<div class=\"bs-step\"><span class=\"bs-step-n\">4</span><span>Show Up &amp; Enjoy</span></div>';
    h+='</div>';
    h+='<div class=\"operator-grid\">';
    ops.forEach(function(op){
      var oid=esc(op.id);
      h+='<div class="op-card" id="card-'+oid+'">';
      h+='<div class="op-card-body">';
      h+='<div class="op-card-header"><div><div class="op-live-badge"><span class="op-live-dot"></span>Available to Book</div><div class="op-business-name">'+esc(op.business)+'</div><div class="op-operator-name">'+esc(op.operator)+' &nbsp;&middot;&nbsp; '+esc(op.title)+'</div></div><div class="op-price-tag"><div class="op-price">'+esc(op.price)+'</div><div class="op-price-label">'+esc(op.priceLabel)+'</div></div></div>';
      h+='<p class="op-desc">'+rich(op.desc)+'</p>';
      h+='<div class="op-tags">'; op.tags.forEach(function(t){h+='<span class="op-tag">'+esc(t)+'</span>';}); h+='</div>';
      h+='<div class="op-divider"></div>';
      h+='<div style="display:flex;flex-wrap:wrap;gap:16px;font-size:0.78rem;color:#3a5a61;font-weight:600;margin:0 0 14px;"><span>&#10003; Free cancellation 24hrs</span><span>&#10003; Local Wilmington operator</span><span>&#10003; Secure checkout</span></div>';
      if(op.live){
        h+='<div class="op-book-row"><button type="button" class="btn-sub" style="width:100%;font-size:1rem;" id="ob-'+oid+'" aria-expanded="false" aria-controls="bf-'+oid+'" onclick="toggleBook(\''+oid+'\')">Book This Experience &#8212; '+esc(op.price)+' <span style="opacity:0.75;font-weight:600;">'+esc(op.priceLabel)+'</span></button></div>';
      } else {
        h+='<div class="op-book-row"><div class="op-book-note-pre">Bookings open <strong>soon</strong> &#8212; join the early list to lock your spot before we open to the public.</div></div>';
      }
      h+='<div style="font-size:0.75rem;color:rgba(44,74,82,0.45);margin-top:8px;line-height:1.6;">By booking through ShoreList you acknowledge activities involve inherent risks and agree to our <a href="/legal#risk" style="color:var(--teal2);">Terms &amp; Assumption of Risk</a>. Full refunds available with 24+ hours cancellation notice. Operators are independent contractors, not employees of ShoreList.</div>';
      h+='</div>'; // end op-card-body
      if(op.live){
        h+='<div class="book-form-wrap" id="bf-'+oid+'">';
        h+='<div class="book-form-title">Book: '+esc(op.business)+'</div>';
        h+='<div class="cal-section"><div class="cal-lbl">1 &middot; Pick a Date</div>';
        h+='<div class="cal-box">';
        h+='<div class="cal-hd"><button type="button" class="cal-arrow" onclick="cprev(\''+oid+'\')" aria-label="Previous month">&#8592;</button><div class="cal-mlbl" id="cm-'+oid+'" aria-live="polite"></div><button type="button" class="cal-arrow" onclick="cnext(\''+oid+'\')" aria-label="Next month">&#8594;</button></div>';
        h+='<div class="cal-g" id="cg-'+oid+'" role="group" aria-label="Choose a date. Arrow keys move between available days, Page Up and Page Down change the month."></div><div class="cal-kb" aria-hidden="true">Arrow keys move between days &middot; Enter selects</div>';
        h+='<div id="sw-'+oid+'" aria-live="polite"></div>';
        h+='<div class="bk-sel-summary" id="ss-'+oid+'" role="status"></div>';
        h+='</div></div>';
        h+='<input type="hidden" id="hd-'+oid+'"/><input type="hidden" id="ht-'+oid+'"/>';
        h+='<div class="cal-lbl" style="margin:22px 0 12px;">2 &middot; Your Details</div>';
        h+='<div class="bk-row">';
        h+='<div class="bk-field"><label class="bk-label" for="bn-'+oid+'">Full Name *</label><input class="bk-input" type="text" id="bn-'+oid+'" placeholder="Your name" autocomplete="name"/></div>';
        h+='<div class="bk-field"><label class="bk-label" for="be-'+oid+'">Email *</label><input class="bk-input" type="email" id="be-'+oid+'" placeholder="your@email.com" autocomplete="email"/></div>';
        h+='</div>';
        h+='<div class="bk-row">';
        h+='<div class="bk-field"><label class="bk-label" for="bp-'+oid+'">Phone (optional)</label><input class="bk-input" type="tel" id="bp-'+oid+'" placeholder="(910) 555-0100" autocomplete="tel"/></div>';
        h+='<div class="bk-field"><label class="bk-label" for="bs-'+oid+'">Party Size</label><select class="bk-input" id="bs-'+oid+'" onchange="updTotal(\''+oid+'\')">';
        for(var g=1;g<=8;g++){h+='<option value="'+g+'">'+g+' Guest'+(g>1?'s':'')+'</option>';}
        h+='</select></div>';
        h+='</div>';
        h+='<div class="bk-row full"><div class="bk-field"><label class="bk-label" for="bo-'+oid+'">Notes for Your Guide (optional)</label><textarea class="bk-input" id="bo-'+oid+'" placeholder="Anything we should know? Mobility needs, celebrations, questions&hellip;"></textarea></div></div>';
        h+='<div class="dep-row"><div><div class="dep-lbl">Total &#8212; <span id="bqty-'+oid+'">1 guest</span></div><div class="dep-note">Includes 7% NC sales tax &middot; Paid securely via Stripe &middot; Full refund if you cancel 24+ hours before</div></div><div class="dep-amt" id="btot-'+oid+'">'+esc(op.price)+'</div></div>';
        h+='<div class="bk-err" id="berr-'+oid+'" role="alert"></div>';
        h+='<div class="bk-acts"><button type="button" class="btn-sub" id="bb-'+oid+'" onclick="doBook(\''+oid+'\')">Confirm &amp; Pay '+esc(op.price)+' &#8594;</button></div>';
        h+='</div>';
      } else {
        h+='<div style="padding:0 40px 32px;">';
        h+='<div class="prelaunch-card">';
        h+='<div class="plc-left"><div class="plc-tag">&#10022; Reserve Early</div><div class="plc-title">Reserve with '+esc(op.business)+'</div><div class="plc-sub">Drop your email. We\'ll notify you the moment bookings go live &#8212; before we announce it anywhere else.</div></div>';
        h+='<div class="plc-form"><input class="plc-input" type="email" id="plc-'+oid+'" aria-label="Email address" placeholder="your@email.com" autocomplete="email"/><button class="plc-btn" onclick="doPrelaunch(\''+oid+'\',\''+esc(op.business)+'\')">Notify Me &#8594;</button><div class="plc-done" id="plcd-'+oid+'">&#10003; You\'re on the list!</div></div>';
        h+='</div>';
        h+='</div>';
      }
      h+='</div>'; // end op-card
    });
    h+='</div>'; // end operator-grid
  } else {
    h+='<div class="coming-soon"><span class="cs-ico">'+d.icon+'</span><h2 class="cs-title">'+esc(d.title)+' &#8212; Coming Soon</h2><p class="cs-sub">We\'re signing local '+esc(d.title.toLowerCase())+' operators right now. Drop your email and we\'ll notify you the moment bookings go live.</p><div class="notify-form"><input class="notify-inp" type="email" id="ni-'+esc(cat)+'" aria-label="Email address" placeholder="your@email.com" autocomplete="email"/><button class="btn-notify" onclick="doNotify(\''+esc(cat)+'\',\''+esc(d.title)+'\')">Notify Me</button></div><div class="notify-done" id="nd-'+esc(cat)+'">Got it! We\'ll email you when '+esc(d.title)+' goes live. &#10003;</div></div>';
  }

  h+='<div class="list-cta"><div class="lc-text"><div class="lc-tag">For Local Operators</div><div class="lc-title">Run a '+esc(d.title)+' business in Wilmington?</div><div class="lc-sub">Get listed on ShoreList free. No upfront cost, no monthly fees. Commission only on completed bookings. We put your listing directly in front of visitors who are already looking for something to do.</div></div><a href="/join" class="lc-btn">List Your Business Free &rarr;</a></div>';

  h+='<div class="more-sec"><div class="section-label">Keep Exploring</div><h2 class="section-title">More Adventures Await</h2><div class="more-grid">';
  var shown=0; var keys=Object.keys(CAT_DATA);
  for(var i=0;i<keys.length&&shown<8;i++){
    var k=keys[i]; if(k===cat) continue;
    var cd=CAT_DATA[k]; var hasOps=OPS[k]&&OPS[k].length>0; var liveNow=hasOps&&OPS[k].some(function(o){return o.live;});
    h+='<a class="more-card" href="/things-to-do/'+esc(k)+'"><div class="more-ico">'+cd.icon+'</div><div class="more-name">'+esc(cd.title)+'</div>'+(liveNow?'<div class="more-live">Live Now</div>':hasOps?'<div class="more-live">Live Soon</div>':'')+'</a>';
    shown++;
  }
  h+='</div></div>';

  document.getElementById('mc').innerHTML=h;
}

function getOp(id){
  var ops=OPS[getCat()]||[]; for(var i=0;i<ops.length;i++){if(ops[i].id===id)return ops[i];} return null;
}
function toggleBook(id){
  var f=document.getElementById('bf-'+id); if(!f)return;
  var open=f.classList.toggle('open');
  var b=document.getElementById('ob-'+id);
  if(b)b.setAttribute('aria-expanded',open?'true':'false');
  var op=getOp(id);
  if(b&&op)b.innerHTML=open?'Hide Booking Form &#8593;':'Book This Experience &#8212; '+esc(op.price)+' <span style="opacity:0.75;font-weight:600;">'+esc(op.priceLabel)+'</span>';
  if(open){
    if(!CS[id]&&op)calInit(id,op.schedule);
    updTotal(id);
    setTimeout(function(){f.scrollIntoView({behavior:'smooth',block:'nearest'});},80);
  }
}
function fmtUsd(c){return '$'+(c%100===0?(c/100):(c/100).toFixed(2));}
var TAX_RATE=0.07; // NC sales tax: 4.75% state + 2.25% New Hanover County
function updTotal(id){
  var op=getOp(id); if(!op)return;
  var sel=document.getElementById('bs-'+id);
  var n=sel?parseInt(sel.value,10)||1:1;
  var sub=op.priceCents*n;
  var tax=Math.round(sub*TAX_RATE);
  var tot=sub+tax;
  var q=document.getElementById('bqty-'+id); if(q)q.textContent=n+' guest'+(n>1?'s':'')+' \u00d7 '+op.price+' + '+fmtUsd(tax)+' tax';
  var t=document.getElementById('btot-'+id); if(t)t.textContent=fmtUsd(tot);
  var bb=document.getElementById('bb-'+id); if(bb&&!bb.disabled)bb.innerHTML='Confirm &amp; Pay '+fmtUsd(tot)+' &#8594;';
}
function doBook(id){
  var op=getOp(id); if(!op)return;
  var err=document.getElementById('berr-'+id);
  function fail(m){if(err){err.textContent=m;err.style.display='block';}}
  if(err)err.style.display='none';
  var s=CS[id]||{};
  var date=(document.getElementById('hd-'+id)||{}).value||s.date||'';
  var slot=(document.getElementById('ht-'+id)||{}).value||s.slot||'';
  if(!date||!slot){fail('Pick a date and time slot on the calendar above first.');return;}
  var name=(document.getElementById('bn-'+id)||{}).value||''; name=name.trim();
  var email=(document.getElementById('be-'+id)||{}).value||''; email=email.trim();
  if(!name){fail('Please enter your full name.');return;}
  if(!email||email.indexOf('@')===-1||email.indexOf('.')===-1){fail('Please enter a valid email \u2014 your confirmation and tickets go there.');return;}
  var phone=((document.getElementById('bp-'+id)||{}).value||'').trim();
  var size=parseInt((document.getElementById('bs-'+id)||{}).value,10)||1;
  var notes=((document.getElementById('bo-'+id)||{}).value||'').trim();
  var btn=document.getElementById('bb-'+id);
  if(btn){btn.disabled=true;btn.textContent='Opening secure checkout\u2026';}
  fetch('/.netlify/functions/create-checkout',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({operatorId:id,operatorName:op.operator,category:getCat(),categoryLabel:op.business,guestName:name,guestEmail:email,guestPhone:phone,date:date,timeSlot:slot,partySize:size,notes:notes,priceInCents:op.priceCents})
  }).then(function(r){return r.json().then(function(d){return {ok:r.ok,d:d};});})
  .then(function(res){
    if(res.ok&&res.d&&res.d.url){window.location.href=res.d.url;}
    else{throw new Error((res.d&&res.d.error)||'Checkout could not be started');}
  }).catch(function(e){
    if(btn){btn.disabled=false;updTotal(id);}
    fail('Something went wrong opening checkout. Please try again in a moment. ('+e.message+')');
  });
}

function doPrelaunch(id,business){
  var inp=document.getElementById('plc-'+id);
  var done=document.getElementById('plcd-'+id);
  if(!inp||!inp.value.trim()){if(inp)inp.focus();return;}
  if(!inp.value.includes('@')){inp.style.borderColor='rgba(233,102,69,0.8)';inp.focus();return;}
  fetch('https://formspree.io/f/xeevzzqd',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({email:inp.value.trim(),type:'guest-waitlist',experience:business})}).catch(function(){});
  inp.style.display='none';
  var btn=inp.parentElement.querySelector('.plc-btn');
  if(btn)btn.style.display='none';
  if(done)done.style.display='block';
}
function doNotify(cat,title){
  var inp=document.getElementById('ni-'+cat);
  var done=document.getElementById('nd-'+cat);
  if(!inp||!inp.value.trim()){if(inp)inp.focus();return;}
  fetch('https://formspree.io/f/xeevzzqd',{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({email:inp.value.trim(),category:title,type:'coming-soon-notify'})}).catch(function(){});
  if(inp.parentElement)inp.parentElement.style.display='none';
  if(done)done.style.display='block';
}

document.addEventListener('DOMContentLoaded',renderPage);
/* Ghost Tours cross-promo: the haunted museum */
(function(){
  function injectMuseumPromo(n){
    try{
      var params=new URLSearchParams(window.location.search);
      if((params.get('cat')||'')!=='ghost-tours') return;
      var container=document.getElementById('mc');
      if(!container||!container.querySelector('.op-card')){ if(n<20){setTimeout(function(){injectMuseumPromo(n+1);},150);} return; }
      if(document.getElementById('museum-cross-promo')) return;
      var x=document.createElement('div');
      x.className='cat-ghost-banner';
      x.id='museum-cross-promo';
      x.innerHTML='<div class="cgb-inner">'
        +'<span class="cgb-ico"><svg class="cgb-svg"><use href="#i-train" xlink:href="#i-train"/></svg></span>'
        +'<div class="cgb-body">'
        +'<div class="cgb-title">Also Haunted: The Wilmington Railroad Museum</div>'
        +'<div class="cgb-sub">An authentic 1883 freight warehouse with a haunted reputation of its own &mdash; explore the steam locomotive and model trains by day, and keep an eye out for after-dark events. <a href="/wilmington-railroad-museum">View tickets, hours &amp; events &#8599;</a></div>'
        +'<div class="cgb-badges"><span class="cgb-badge cgb-badge-coral">&#9733; Official Partner</span><span class="cgb-badge">1883 Freight Warehouse</span><span class="cgb-badge">Downtown</span><span class="cgb-badge">Open Daily</span></div>'
        +'</div></div>';
      container.appendChild(x);
    }catch(e){}
  }
  if(document.readyState!=='loading'){injectMuseumPromo(0);}
  else{document.addEventListener('DOMContentLoaded',function(){injectMuseumPromo(0);});}
})();

/* Show paranormal banner when ghost-tours loaded */
(function(){
  var cat=getCat();
  if(cat==='ghost-tours'){
    var container=document.getElementById('mc')||document.getElementById('op-container')||document.querySelector('.sec-inner');
    if(container){
      var banner=document.createElement('div');
      banner.className='cat-ghost-banner';
      banner.innerHTML='<div class="cgb-inner">'
        +'<span class="cgb-ico"><svg class="cgb-svg"><use href="#i-ghost" xlink:href="#i-ghost"/></svg></span>'
        +'<div class="cgb-body">'
        +'<div class="cgb-title">&#9889; The Most Unforgettable Ghost Walk in Wilmington</div>'
        +'<div class="cgb-sub">Sean Austin &mdash; star of Netflix&rsquo;s <strong>28 Days Haunted</strong> and Travel Channel&rsquo;s <strong>Ghost Loop</strong> &mdash; leads his Wilmington Ghost Walk exclusively through ShoreList. A real paranormal TV investigator guiding you through the city&rsquo;s most haunted streets. <a href="https://www.seandaustin.com" target="_blank" rel="noopener noreferrer">Learn more at seandaustin.com &#8599;</a></div>'
        +'<div class="cgb-badges">'
        +'<span class="cgb-badge cgb-badge-coral">&#9733; Founding Partner</span>'+'<span class="cgb-badge">Netflix</span>'
        +'<span class="cgb-badge">Travel Channel</span>'
        +'<span class="cgb-badge">Paranormal Investigator</span>'
        +'<span class="cgb-badge">Demonologist</span>'
        +'<span class="cgb-badge cgb-badge-coral">Exclusive to ShoreList</span>'
        +'</div>'
        +'</div>'
        +'</div>';
      container.insertBefore(banner,container.firstChild);
    }
    /* Trigger creepy sound + particles after 1.5s */
    setTimeout(function(){
      try{
        var AC=window.AudioContext||window.webkitAudioContext;
        if(AC){
          var ctx=new AC();
          var osc=ctx.createOscillator();var gain=ctx.createGain();
          osc.connect(gain);gain.connect(ctx.destination);
          osc.type='sawtooth';
          osc.frequency.setValueAtTime(70,ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(30,ctx.currentTime+0.9);
          gain.gain.setValueAtTime(0,ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.06,ctx.currentTime+0.05);
          gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.9);
          osc.start(ctx.currentTime);osc.stop(ctx.currentTime+0.9);
        }
      }catch(e){}
    },1500);
  }
})();

/* Founding Partner banner when walking-tours loaded */
(function(){
  var cat=getCat();
  if(cat!=='walking-tours')return;
  function inject(tries){
    var container=document.getElementById('mc')||document.getElementById('op-container')||document.querySelector('.sec-inner');
    if(!container){if((tries||0)<10){setTimeout(function(){inject((tries||0)+1);},150);}return;}
    if(document.getElementById('fp-banner'))return;
    var b=document.createElement('div');
    b.id='fp-banner';
    b.style.cssText='background:linear-gradient(135deg,#fffdf7 0%,#f5e8cb 100%);border:1px solid rgba(10,77,92,0.18);border-radius:14px;padding:26px 30px;margin-bottom:28px;box-shadow:0 1px 3px rgba(10,77,92,0.06);';
    b.innerHTML='<div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap;">'
      +'<div style="display:flex;gap:18px;align-items:center;flex:none;">'
      +'<img src="/wilmington-walking-tours.webp" width="440" height="366" alt="Wilmington Walking Tours" style="height:76px;width:auto;" loading="lazy"/>'
      +'<img src="/carolina-beach-tours.webp" width="440" height="371" alt="Carolina Beach Tours" style="height:76px;width:auto;" loading="lazy"/>'
      +'</div>'
      +'<div style="flex:1;min-width:250px;">'
      +'<div style="font-size:0.66rem;font-weight:700;letter-spacing:0.16em;text-transform:uppercase;color:#E96645;margin-bottom:7px;">&#9733; ShoreList Founding Partner</div>'
      +'<div style="font-family:\'Playfair Display\',serif;font-size:1.4rem;font-weight:800;color:#0A4D5C;line-height:1.15;margin-bottom:8px;">Wilmington Walking Tours &amp; Carolina Beach Tours</div>'
      +'<div style="font-size:0.9rem;color:#3a5a61;line-height:1.6;">Led by historian Amanda Leese, these guided strolls bring the history, architecture, art, and local flavor of Wilmington &amp; the Beaches to life. Six tours across downtown and Carolina Beach, now on ShoreList.</div>'+'<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:14px;">'+'<span style="font-size:0.72rem;font-weight:700;color:#0A4D5C;background:rgba(10,77,92,0.08);border-radius:100px;padding:5px 12px;">&#9733; 4.9 Rating</span>'+'<span style="font-size:0.72rem;font-weight:700;color:#0A4D5C;background:rgba(10,77,92,0.08);border-radius:100px;padding:5px 12px;">Hundreds of Reviews</span>'+'<span style="font-size:0.72rem;font-weight:700;color:#0A4D5C;background:rgba(10,77,92,0.08);border-radius:100px;padding:5px 12px;">Viator &middot; TripAdvisor &middot; Airbnb</span>'+'<span style="font-size:0.72rem;font-weight:700;color:#E96645;background:rgba(233,102,69,0.10);border-radius:100px;padding:5px 12px;">Featured by Wilmington &amp; Beaches</span>'+'</div>'+'<div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:14px;">'+'<span style="font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#6b8483;">Follow along</span>'+'<a href="https://www.instagram.com/wilmingtonwalkingtours" target="_blank" rel="noopener noreferrer" aria-label="Wilmington Walking Tours on Instagram" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(10,77,92,0.08);color:#0A4D5C;text-decoration:none;"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4.2"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></svg></a>'+'<a href="https://www.facebook.com/wilmingtonwalkingtours" target="_blank" rel="noopener noreferrer" aria-label="Wilmington Walking Tours on Facebook" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(10,77,92,0.08);color:#0A4D5C;text-decoration:none;"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M13.5 21v-7h2.3l.4-2.9h-2.7V9.3c0-.8.3-1.4 1.5-1.4h1.3V5.3c-.6-.1-1.4-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v1.9H7.7V14h2.2v7h3.6z"/></svg></a>'+'<a href="https://www.tiktok.com/@wilmingtonwalkingtours" target="_blank" rel="noopener noreferrer" aria-label="Wilmington Walking Tours on TikTok" style="display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:50%;background:rgba(10,77,92,0.08);color:#0A4D5C;text-decoration:none;"><svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor"><path d="M16.5 3c.3 2 1.6 3.6 3.5 3.9v2.4c-1.3 0-2.5-.4-3.5-1.1v5.9a5.3 5.3 0 1 1-5.3-5.3c.3 0 .6 0 .9.1v2.5a2.8 2.8 0 1 0 2 2.7V3h2.4z"/></svg></a>'+'</div>'
      +'</div>'
      +'</div>';
    container.insertBefore(b,container.firstChild);
  }
  if(document.readyState!=='loading')inject(0);else document.addEventListener('DOMContentLoaded',function(){inject(0);});
})();

/* Booking button paranormal effect */
function seanEffect(e){
  try{
    var AC=window.AudioContext||window.webkitAudioContext;
    if(AC){
      var ctx=new AC();var osc=ctx.createOscillator();var gain=ctx.createGain();
      osc.connect(gain);gain.connect(ctx.destination);osc.type='sawtooth';
      osc.frequency.setValueAtTime(85,ctx.currentTime);osc.frequency.exponentialRampToValueAtTime(35,ctx.currentTime+1.0);
      gain.gain.setValueAtTime(0,ctx.currentTime);gain.gain.linearRampToValueAtTime(0.08,ctx.currentTime+0.06);
      gain.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+1.0);
      osc.start(ctx.currentTime);osc.stop(ctx.currentTime+1.0);
    }
  }catch(err){}
  var g=['✨','✦','✧'];
  for(var i=0;i<5;i++){(function(idx){setTimeout(function(){
    var p=document.createElement('div');p.className='ghost-p';p.innerHTML=g[idx%g.length];
    var x=(e?e.clientX:window.innerWidth/2)+(Math.random()-0.5)*60;var y=e?e.clientY:window.innerHeight/2;
    p.style.cssText='position:fixed;left:'+x+'px;top:'+y+'px;pointer-events:none;font-size:1.3rem;z-index:9999;animation:gRise 1.4s ease-out forwards;';
    document.body.appendChild(p);setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},1500);
  },idx*90);})(i);}
  if(navigator.vibrate)navigator.vibrate([40,20,40]);
}
