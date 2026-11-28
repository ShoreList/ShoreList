/* Live cam desk. Facades until a click. At most one YouTube iframe on a phone,
   two on a wide screen. Link-only cards never get a player. */
(function () {
  'use strict';
  var d = document;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); }
  function wide() { return window.matchMedia && matchMedia('(min-width: 821px)').matches; }
  function maxPlayers() { return wide() ? 2 : 1; }
  var playing = [];
  var COMPASS = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  function compass(deg) { return deg == null ? '' : COMPASS[Math.round(deg / 22.5) % 16]; }

  function srcOf(cam) {
    var q = 'autoplay=1&mute=1&playsinline=1&rel=0';
    if (cam.embed && cam.embed.channel) return 'https://www.youtube-nocookie.com/embed/live_stream?channel=' + encodeURIComponent(cam.embed.channel) + '&' + q;
    return 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(cam.embed.video) + '?' + q;
  }
  function stop(node) {
    var frame = node.querySelector('iframe');
    if (frame) frame.remove();
    node.classList.remove('is-on');
    var btn = node.querySelector('.cam-play');
    if (btn) btn.hidden = false;
    var note = node.querySelector('.cam-offline');
    if (note) note.hidden = true;
    playing = playing.filter(function (n) { return n !== node; });
  }
  function play(node, cam) {
    if (!cam || !cam.embed || node.classList.contains('is-on')) return;
    while (playing.length >= maxPlayers()) stop(playing[0]);
    var btn = node.querySelector('.cam-play');
    if (btn) btn.hidden = true;
    var note = node.querySelector('.cam-offline');
    if (note) note.hidden = true;
    var stage = node.querySelector('.cam-stage');
    var iframe = d.createElement('iframe');
    iframe.src = srcOf(cam);
    iframe.title = cam.name + ', live video';
    iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
    iframe.setAttribute('allowfullscreen', '');
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    stage.appendChild(iframe);
    node.classList.add('is-on');
    playing.push(node);
    watch(node);
  }
  function watch(node) {
    if (!('IntersectionObserver' in window)) return;
    var timer = null;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { if (timer) clearTimeout(timer); timer = null; return; }
        if (timer) clearTimeout(timer);
        timer = setTimeout(function () { stop(node); io.disconnect(); }, 4000);
      });
    }, { threshold: 0.2 });
    io.observe(node);
  }
  function showOffline(node) {
    stop(node);
    var note = node.querySelector('.cam-offline');
    if (note) note.hidden = false;
  }

  function chip(el, cam) {
    if (!el || !window.ShoreWX) return;
    var map = { wrightsville: 0, carolina: 1, kure: 2 };
    var i = map[cam.wx];
    if (i == null) return;
    ShoreWX.get(i).then(function (wx) {
      if (!wx) return;
      var t = wx.tide;
      var tide = (t && t.height != null) ? ((t.rising ? 'Rising' : 'Falling') + ' ' + t.height.toFixed(1) + ' ft vs MLLW') : 'Tide reading unavailable';
      var wind = wx.wind != null ? (Math.round(wx.wind) + ' mph ' + compass(wx.windDir)).trim() : 'wind unavailable';
      var when = wx.at ? new Date(wx.at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';
      var where = cam.wxNote || (wx.beach && wx.beach.name) || '';
      el.textContent = tide + ', wind ' + wind + (when ? ', as of ' + when : '') + '. ' + where + (where ? '. ' : '') + 'Estimated conditions, not a lifeguard flag.';
    }).catch(function () { el.textContent = ''; });
  }

  function card(cam) {
    var art = d.createElement('article');
    art.className = 'cam-card cam-' + cam.status;
    art.id = cam.id;
    art.setAttribute('data-area', cam.area);
    var h = d.createElement('h3');
    h.textContent = cam.name;
    art.appendChild(h);
    var place = d.createElement('p');
    place.className = 'cam-place';
    place.textContent = cam.place;
    art.appendChild(place);
    if (cam.status === 'embed' || cam.status === 'optional-embed') {
      var frame = d.createElement('div');
      frame.className = 'cam-frame';
      var stage = d.createElement('div');
      stage.className = 'cam-stage';
      if (cam.poster) {
        var img = d.createElement('img');
        img.src = cam.poster;
        img.alt = '';
        img.width = 480;
        img.height = 360;
        img.decoding = 'async';
        img.loading = 'lazy';
        stage.appendChild(img);
      } else {
        stage.classList.add('cam-stage-type');
        var mark = d.createElement('p');
        mark.textContent = cam.owner;
        stage.appendChild(mark);
      }
      var btn = d.createElement('button');
      btn.type = 'button';
      btn.className = 'cam-play';
      btn.textContent = 'Play live cam: ' + cam.name;
      btn.addEventListener('click', function () { play(frame, cam); });
      stage.appendChild(btn);
      frame.appendChild(stage);
      var close = d.createElement('button');
      close.type = 'button';
      close.className = 'cam-close';
      close.textContent = 'Close cam';
      close.addEventListener('click', function () { stop(frame); });
      frame.appendChild(close);
      var offBtn = d.createElement('button');
      offBtn.type = 'button';
      offBtn.className = 'cam-offbtn';
      offBtn.textContent = 'Cam not playing';
      offBtn.addEventListener('click', function () { showOffline(frame); });
      frame.appendChild(offBtn);
      var off = d.createElement('p');
      off.className = 'cam-offline';
      off.hidden = true;
      off.textContent = cam.offline || 'This cam is offline right now.';
      var open = d.createElement('a');
      open.href = cam.watchUrl || cam.creditUrl;
      open.target = '_blank';
      open.rel = 'noopener noreferrer';
      open.textContent = 'Open on ' + cam.owner;
      off.appendChild(d.createTextNode(' '));
      off.appendChild(open);
      frame.appendChild(off);
      art.appendChild(frame);
      var wx = d.createElement('p');
      wx.className = 'cam-wx';
      art.appendChild(wx);
      chip(wx, cam);
      if (!window.ShoreWX) {
        var tries = 0;
        var wait = setInterval(function () {
          if (window.ShoreWX || ++tries > 40) { clearInterval(wait); chip(wx, cam); }
        }, 300);
      }
    }
    var blurb = d.createElement('p');
    blurb.textContent = cam.blurb;
    art.appendChild(blurb);
    if (cam.host) {
      var host = d.createElement('p');
      host.className = 'cam-host';
      host.textContent = cam.host;
      art.appendChild(host);
    }
    var credit = d.createElement('p');
    credit.className = 'cam-credit';
    if (cam.status === 'link-only') {
      var a = d.createElement('a');
      a.href = cam.watchUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.textContent = 'Watch live on ' + cam.owner;
      credit.appendChild(a);
      credit.appendChild(d.createTextNode('. Opens on their site. Camera network: ' + cam.owner + '.'));
    } else {
      credit.appendChild(d.createTextNode('Live cam by '));
      var c = d.createElement('a');
      c.href = cam.creditUrl;
      c.target = '_blank';
      c.rel = 'noopener noreferrer';
      c.textContent = cam.owner;
      credit.appendChild(c);
      credit.appendChild(d.createTextNode('. ShoreList does not operate this camera.'));
    }
    art.appendChild(credit);
    if (cam.status !== 'link-only') {
      var tr = d.createElement('p');
      tr.className = 'cam-tr';
      tr.textContent = 'Live video. No transcript is available.';
      art.appendChild(tr);
    }
    return art;
  }

  function render(list) {
    var grid = d.getElementById('cam-grid');
    if (!grid) return;
    grid.textContent = '';
    var live = d.createElement('div');
    live.className = 'cam-row';
    var liveH = d.createElement('h2');
    liveH.id = 'cam-live-h';
    liveH.textContent = 'Players ShoreList can run';
    live.appendChild(liveH);
    var more = d.createElement('div');
    more.className = 'cam-row';
    var moreH = d.createElement('h2');
    moreH.id = 'cam-more-h';
    moreH.textContent = 'More local cams';
    more.appendChild(moreH);
    list.forEach(function (cam) {
      var node = card(cam);
      if (cam.status === 'link-only') more.appendChild(node);
      else live.appendChild(node);
    });
    grid.appendChild(live);
    grid.appendChild(more);
    grid.removeAttribute('aria-busy');
    var hash = (location.hash || '').replace('#', '');
    if (hash) {
      var el = d.getElementById(hash);
      if (el && el.scrollIntoView) el.scrollIntoView();
    }
  }

  function filter(area) {
    d.querySelectorAll('#cam-grid .cam-card').forEach(function (card) {
      var show = area === 'all' || card.getAttribute('data-area') === area;
      card.hidden = !show;
      if (!show) {
        var frame = card.querySelector('.cam-frame');
        if (frame && frame.classList.contains('is-on')) stop(frame);
      }
    });
  }

  function bindFilters() {
    var group = d.getElementById('cam-filters');
    if (!group) return;
    var radios = [].slice.call(group.querySelectorAll('[role="radio"]'));
    function set(i) {
      radios.forEach(function (r, n) { r.setAttribute('aria-checked', n === i ? 'true' : 'false'); r.tabIndex = n === i ? 0 : -1; });
      filter(radios[i].getAttribute('data-area'));
      radios[i].focus();
    }
    radios.forEach(function (r, i) {
      r.addEventListener('click', function () { set(i); });
      r.addEventListener('keydown', function (e) {
        var next = i;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % radios.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + radios.length) % radios.length;
        else return;
        e.preventDefault();
        set(next);
      });
    });
  }

  function bindFeature() {
    var node = d.querySelector('[data-home-cam]');
    if (!node) return;
    var cam = {
      name: "Johnnie Mercer's Pier, south view",
      embed: { video: 'itXoEFJZtD0' },
      wx: 'wrightsville',
      watchUrl: 'https://www.youtube.com/watch?v=itXoEFJZtD0',
      creditUrl: 'https://johnniemercersfishingpier.com/live-cam/',
      owner: "Johnnie Mercer's Fishing Pier"
    };
    var frame = node.querySelector('.cam-frame');
    var btn = node.querySelector('.cam-play');
    if (btn) btn.addEventListener('click', function () { play(frame, cam); });
    var close = node.querySelector('.cam-close');
    if (close) close.addEventListener('click', function () { stop(frame); });
    var wxEl = node.querySelector('.cam-wx');
    (function later(n) { if (window.ShoreWX) chip(wxEl, cam); else if (n < 40) setTimeout(function () { later(n + 1); }, 400); })(0);
  }

  bindFeature();
  if (d.getElementById('cam-grid')) {
    bindFilters();
    fetch('/cams.json', { credentials: 'same-origin' }).then(function (r) { return r.json(); }).then(function (j) {
      render(j.cams || []);
    }).catch(function () {
      var grid = d.getElementById('cam-grid');
      grid.textContent = '';
      var p = d.createElement('p');
      p.textContent = 'The cam list did not load. The pier\'s own live cam page is still open.';
      var a = d.createElement('a');
      a.href = 'https://johnniemercersfishingpier.com/live-cam/';
      a.textContent = 'Johnnie Mercer\'s Fishing Pier live cam';
      grid.appendChild(p);
      grid.appendChild(a);
    });
  }
})();
