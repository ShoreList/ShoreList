/* Shared front door for the command palette, Shore AI, and /planner.
   One index, one sessionStorage note, no account. Times on events are the
   listing times. Other times are labeled suggestions. Prices come only from
   the index. */
(function () {
  'use strict';
  if (window.ShoreFront) return;
  var KEY = 'sl-front';
  var items = null, loading = null;

  function esc(s) { return String(s == null ? '' : s); }
  function norm(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(); }
  function remember(patch) {
    try {
      var cur = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      if (!cur || typeof cur !== 'object') cur = {};
      Object.keys(patch || {}).forEach(function (k) { cur[k] = patch[k]; });
      sessionStorage.setItem(KEY, JSON.stringify(cur));
    } catch (e) {}
  }
  function read() {
    try { var cur = JSON.parse(sessionStorage.getItem(KEY) || '{}'); return cur && typeof cur === 'object' ? cur : {}; }
    catch (e) { return {}; }
  }
  function load() {
    if (items) return Promise.resolve(items);
    if (loading) return loading;
    loading = fetch('/search-index.json', { credentials: 'same-origin' }).then(function (r) { return r.json(); })
      .then(function (j) { items = j.items || []; return items; })
      .catch(function () { items = []; return items; });
    return loading;
  }

  var CHIPS = [
    ['Tonight', 'tonight'],
    ['This weekend', 'this weekend'],
    ['Rainy day', 'rainy day'],
    ['With kids', 'with kids'],
    ['Free', 'free'],
    ['Where to eat', 'where to eat'],
    ['Beach report', 'beach report']
  ];

  function intentOf(q) {
    if (/beach report|weather|tide|surf report|\bflag\b|\bwind\b/.test(q)) return 'conditions';
    if (/rainy|\brain\b/.test(q)) return 'rain';
    if (/where to eat|\beat\b|food|dinner|lunch|coffee|restaurant|\bbar\b/.test(q)) return 'picks';
    if (/with kids|\bkids\b|family|children/.test(q)) return 'kids';
    if (q === 'free' || /\bfree\b/.test(q)) return 'free';
    if (/tonight|weekend|event|festival|concert/.test(q)) return 'events';
    if (/shop|gift|\bbuy\b|shirt|hat/.test(q)) return 'shop';
    if (/book|tour|lesson|rent|charter|waitlist/.test(q)) return 'book';
    return '';
  }
  function bucket(it) {
    var url = it.url || '';
    if (it.t === 'page' && /wilmington-weather|\/surf|parking/.test(url)) return 'conditions';
    if (it.t === 'event' || /\/events/.test(url)) return 'events';
    if (/shore-picks/.test(url)) return 'picks';
    if (it.t === 'tour' || it.t === 'cat' || /waitlist/.test(url)) return 'book';
    if (it.t === 'shop' || /\/shop/.test(url)) return 'shop';
    return 'guides';
  }
  function dollars(s) {
    var m = String(s || '').match(/\$(\d+(?:\.\d+)?)/g), hi = null;
    if (!m) return hi;
    m.forEach(function (x) { var n = parseFloat(x.slice(1)); if (hi == null || n > hi) hi = n; });
    return hi;
  }
  function priceOf(it) {
    if (it.t === 'shop' && it.price !== '' && it.price != null && !isNaN(+it.price)) return +it.price;
    if (it.t === 'tour') return dollars(it.price);
    if (it.t === 'event') {
      if (/^free\b/i.test(it.tickets || '')) return 0;
      return dollars(it.tickets);
    }
    if (it.t === 'page' || it.t === 'cat') return 0;
    return null;
  }
  function cta(it) {
    if (!it) return 'View';
    if (it.t === 'tour') return 'Book';
    if (it.t === 'cat') return it.live > 0 ? 'Book' : 'Join waitlist';
    if (it.t === 'event') {
      var note = it.tickets || '';
      if (/^free\b/i.test(note)) return 'View';
      if (/ticket|admission|\$|registration/i.test(note)) return 'Get tickets';
      return 'View';
    }
    if (/waitlist/.test(it.url || '')) return 'Join waitlist';
    return 'View';
  }
  function linksFor(it) {
    if (it.t === 'cat' && !(it.live > 0)) return [['/waitlist', 'Join waitlist'], [it.url, 'View']];
    return [[it.url, cta(it)]];
  }
  function hasWord(hay, t) { return (' ' + hay + ' ').indexOf(' ' + t + ' ') > -1; }
  function score(it, q, tokens) {
    var title = norm(it.title), sub = norm(it.sub), kw = norm(it.kw || ''), tags = norm((it.tags || []).join(' '));
    var s = 0;
    if (title === q) s += 100;
    if (title.indexOf(q) === 0) s += 60;
    if (q && title.indexOf(q) > -1) s += 35;
    tokens.forEach(function (t) {
      if (t.length < 3) return;
      if (hasWord(title, t)) s += 14;
      if (hasWord(kw, t)) s += 10;
      if (hasWord(tags, t)) s += 8;
      if (hasWord(sub, t)) s += 5;
    });
    return s;
  }
  function boost(it, intent) {
    var b = bucket(it), hay = norm((it.title || '') + ' ' + (it.kw || '') + ' ' + (it.cat || '') + ' ' + (it.url || ''));
    var s = 0;
    if (intent === 'conditions' && b === 'conditions') s += 50;
    if (intent === 'events' && b === 'events') s += 40;
    if (intent === 'picks' && b === 'picks') s += 50;
    if (intent === 'book' && b === 'book') s += 36;
    if (intent === 'shop' && b === 'shop') s += 40;
    if (intent === 'rain') {
      if (/museum|indoor|theater|theatre|market|shore-picks|downtown/.test(hay)) s += 34;
      if (/surf|kayak|paddle|beach|fishing|jet/.test(hay)) s -= 30;
    }
    if (intent === 'kids' && /museum|nature|wildlife|family|kids/.test(hay)) s += 28;
    if (intent === 'free') {
      if (priceOf(it) === 0) s += 30;
      if (priceOf(it) > 0) s -= 24;
    }
    if (it.t === 'tour' && s > 0) s += 6;
    return s;
  }
  function suggestions(list) {
    var picks = [];
    (list || []).forEach(function (it) { if (it.t === 'tour') picks.push(it); });
    var wanted = ['Events', 'Shore Picks', 'Plan my day', 'Map', 'Wilmington, NC weather'];
    (list || []).forEach(function (it) { if (it.t === 'page' && wanted.indexOf(it.title) > -1) picks.push(it); });
    return picks;
  }
  function search(list, q, n) {
    var src = list || items || [];
    var nq = norm(q);
    if (!nq) return suggestions(src).slice(0, n || 8);
    var stop = { the: 1, and: 1, for: 1, with: 1, from: 1, this: 1, that: 1, your: 1, you: 1 };
    var tokens = nq.split(' ').filter(function (t) { return t.length > 2 && !stop[t]; }), intent = intentOf(nq), scored = [];
    var order = { conditions: 6, events: 5, picks: 4, book: 3, shop: 2, guides: 1 };
    src.forEach(function (it) {
      var s = score(it, nq, tokens) + boost(it, intent);
      if (s <= 0) return;
      s += (order[bucket(it)] || 0) * 0.01;
      scored.push({ it: it, s: s });
    });
    scored.sort(function (a, b) { return b.s - a.s; });
    return scored.slice(0, n || 8).map(function (x) { return x.it; });
  }

  function todayNY() {
    try { return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()); }
    catch (e) { return new Date().toISOString().slice(0, 10); }
  }
  function utc(s) { var p = String(s || '').split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2])); }
  function plus(s, n) { return new Date(utc(s).getTime() + n * 864e5).toISOString().slice(0, 10); }
  function mins(time) {
    var m = /^(\d+):(\d\d)\s*([AP])M$/i.exec(time || '');
    if (!m) return null;
    return ((+m[1] % 12) + (/p/i.test(m[3]) ? 12 : 0)) * 60 + +m[2];
  }
  function overlaps(e, a, b) { return e.start && e.start <= b && (e.end || e.start) >= a; }
  function areaOk(it, area) {
    if (!area || area === 'any') return true;
    var hay = norm((it.area || '') + ' ' + (it.town || '') + ' ' + (it.title || '') + ' ' + (it.url || ''));
    return hay.indexOf(norm(area)) > -1;
  }
  function budgetOk(it, band) {
    if (!band || band === 'any') return true;
    var p = priceOf(it);
    if (band === 'free') return p === 0;
    if (p == null) return false;
    if (band === 'under25') return p <= 25;
    if (band === 'under75') return p <= 75;
    return true;
  }
  function stop(it, time, why) {
    return {
      time: time || 'Suggested',
      name: it.title,
      description: why,
      tags: [it.area || it.town || it.cat || ''].filter(Boolean).slice(0, 2),
      links: linksFor(it)
    };
  }
  function itinerary(opts) {
    var list = items || [], o = opts || {}, mode = o.mode || 'day';
    var today = todayNY(), dow = utc(today).getUTCDay();
    var fri = plus(today, (5 - dow + 7) % 7), sun = plus(fri, 2);
    if (dow === 5) fri = today;
    if (dow === 6) { fri = plus(today, -1); sun = plus(today, 1); }
    if (dow === 0) { fri = plus(today, -2); sun = today; }
    var pool = list.filter(function (it) {
      if (!areaOk(it, o.area)) return false;
      if (!budgetOk(it, o.budget)) return false;
      return true;
    });
    var chosen = [], seen = {};
    function take(it, time, why) {
      if (!it || seen[it.url] || chosen.length >= 6) return;
      seen[it.url] = 1;
      chosen.push(stop(it, time, why));
    }
    if (mode === 'tonight') {
      pool.filter(function (it) {
        return it.t === 'event' && overlaps(it, today, today) && mins(it.time) != null && mins(it.time) >= 960;
      }).sort(function (a, b) { return (b.verified - a.verified) || ((mins(a.time) || 0) - (mins(b.time) || 0)); })
        .forEach(function (it) { take(it, it.time, 'Evening listing' + (it.tickets ? '. Listing note: ' + it.tickets : '') + '.'); });
    } else if (mode === 'weekend') {
      pool.filter(function (it) { return it.t === 'event' && overlaps(it, fri, sun); })
        .sort(function (a, b) { return (b.verified - a.verified) || String(a.start).localeCompare(String(b.start)); })
        .forEach(function (it) { take(it, it.time || 'Listed', (it.start || '') + (it.tickets ? '. Listing note: ' + it.tickets : '') + '.'); });
    }
    var base = pool;
    if (mode === 'rain') {
      base = pool.filter(function (it) {
        var hay = norm((it.title || '') + ' ' + (it.kw || '') + ' ' + (it.url || '') + ' ' + (it.cat || ''));
        if (/surf|kayak|paddle|fishing|jet-ski|beach-chair/.test(hay)) return false;
        return /museum|indoor|theater|theatre|market|shore-picks|ghost|walking|downtown|shop/.test(hay);
      });
      base.forEach(function (it) { take(it, 'Suggested', 'Indoor or covered stop from the ShoreList index. Confirm hours on the page.'); });
    }
    if (o.move === 'walking') {
      base.filter(function (it) { return /downtown|riverwalk|ghost|walking/.test(norm((it.url || '') + ' ' + (it.area || '') + ' ' + (it.title || ''))); })
        .forEach(function (it) { take(it, it.time || 'Suggested', 'Walkable from downtown listings. Confirm hours on the page.'); });
    }
    var slots = ['9:00 AM', '11:00 AM', '1:00 PM', '3:00 PM', '5:00 PM', '7:00 PM'];
    if (mode === 'tonight' || mode === 'weekend') {
      list.filter(function (it) { return it.t === 'page' && /shore-picks|wilmington-weather|\/events$|\/downtown|\/things-to-do$/.test(it.url || ''); })
        .forEach(function (it) { take(it, 'Suggested', 'ShoreList page. No price or start time is invented here.'); });
    }
    var fill = (mode === 'tonight' || mode === 'weekend') ? [] : search(base.length ? base : pool, mode === 'rain' ? 'rainy day' : (o.like || 'wilmington'), 8);
    fill.forEach(function (it) {
      take(it, it.time || slots[chosen.length] || 'Suggested', it.t === 'event'
        ? 'From the events list' + (it.tickets ? '. Listing note: ' + it.tickets : '') + '.'
        : 'Suggested stop from the ShoreList index. Confirm hours on the page.');
    });
    if (chosen.length < 4) {
      list.filter(function (it) { return it.t === 'page' && /shore-picks|wilmington-weather|\/events$|\/downtown/.test(it.url || ''); })
        .forEach(function (it) { take(it, 'Suggested', 'ShoreList page. No price or start time is invented here.'); });
    }
    if (chosen.length < 4) return null;
    var title = mode === 'tonight' ? 'Tonight from the ShoreList calendar' : mode === 'weekend' ? 'This weekend from the ShoreList calendar' : mode === 'rain' ? 'A rain plan from ShoreList pages' : 'A day from ShoreList pages';
    var narrative = 'These stops are pages and listings already on ShoreList. Event times are the times on those listings. Any time marked Suggested is not an opening hour.';
    if (mode === 'tonight' && !chosen.some(function (s) { return /Evening listing/.test(s.description); })) narrative = 'No timed evening events on the calendar yet. The stops below are ShoreList pages you can open now.';
    if (o.budget && o.budget !== 'any') narrative += ' A budget filter hid listings whose listed price is above that band, and listings with no price.';
    return { title: title, narrative: narrative, items: chosen.slice(0, 6) };
  }

  window.ShoreFront = { remember: remember, read: read, load: load, search: search, cta: cta, itinerary: itinerary, chips: CHIPS };
})();
