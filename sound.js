/* ShoreList soundscape: a procedural beach, generated live with Web Audio (no audio files).
   Layers: breaking waves with foam, wandering wind, gulls, night crickets, distant bell buoy, rain.
   The mix follows the real sun (via ShoreScene), the surf height and weather from widgets.js.
   Starts after the first tap (browser rule), remembers mute and volume, pauses in background tabs. */
(function () {
  'use strict';
  var AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  var ctx = null, master, comp, wet, rev, started = false, on = true, vol = 0.55, timers = [];
  var L = { surf: null, foam: null, wind: null, rain: null, cric: null };
  var state = { night: 0, surf: 0.6, rain: 0 };
  try { var s = localStorage.getItem('slSound'); if (s === 'off') on = false; var v = parseFloat(localStorage.getItem('slVol')); if (v >= 0 && v <= 1) vol = v; } catch (e) {}
  function R(a, b) { return a + Math.random() * (b - a); }
  function later(fn, ms) { var t = setTimeout(fn, ms); timers.push(t); return t; }

  function noiseBuf(kind, secs) {
    var n = Math.floor(ctx.sampleRate * secs), b = ctx.createBuffer(2, n, ctx.sampleRate);
    for (var c = 0; c < 2; c++) {
      var d = b.getChannelData(c), b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (var i = 0; i < n; i++) {
        var w = Math.random() * 2 - 1;
        if (kind === 'brown') { last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; }
        else { b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759; b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856; b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898; d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11; b6 = w * 0.115926; }
      }
      // crossfade loop seam
      var f = Math.floor(n * 0.02); for (var k = 0; k < f; k++) { var m = k / f; d[k] = d[k] * m + d[n - f + k] * (1 - m); }
    }
    return b;
  }
  function loopSrc(buf) { var s = ctx.createBufferSource(); s.buffer = buf; s.loop = true; s.loopStart = 0; s.loopEnd = buf.duration; s.start(0, Math.random() * buf.duration * 0.5); return s; }
  function impulse() { var n = Math.floor(ctx.sampleRate * 2.2), b = ctx.createBuffer(2, n, ctx.sampleRate); for (var c = 0; c < 2; c++) { var d = b.getChannelData(c); for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 2.6); } return b; }
  function gain(v) { var g = ctx.createGain(); g.gain.value = v; return g; }
  function filt(t, f, q) { var x = ctx.createBiquadFilter(); x.type = t; x.frequency.value = f; if (q) x.Q.value = q; return x; }

  function build() {
    ctx = new AC();
    master = gain(0); comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 3;
    master.connect(comp); comp.connect(ctx.destination);
    rev = ctx.createConvolver(); rev.buffer = impulse(); wet = gain(0.5); rev.connect(wet); wet.connect(master);
    var brown = noiseBuf('brown', 14), pink = noiseBuf('pink', 12);

    // surf bed (swells scheduled below)
    L.surf = gain(0.08); var lp = filt('lowpass', 420, 0.6), bp = filt('bandpass', 180, 0.5), pan = ctx.createStereoPanner ? ctx.createStereoPanner() : gain(1);
    loopSrc(brown).connect(lp); lp.connect(bp); bp.connect(L.surf); L.surf.connect(pan); pan.connect(master); L.surf._lp = lp; L.surf._pan = pan;
    // foam hiss
    L.foam = gain(0); var hp = filt('highpass', 1400, 0.4), hp2 = filt('lowpass', 7000, 0.5);
    loopSrc(pink).connect(hp); hp.connect(hp2); hp2.connect(L.foam); L.foam.connect(master);
    // wind
    L.wind = gain(0.03); var wbp = filt('bandpass', 500, 0.7); loopSrc(pink).connect(wbp); wbp.connect(L.wind); L.wind.connect(master); L.wind._f = wbp;
    // rain
    L.rain = gain(0); var rh = filt('highpass', 1800, 0.3); loopSrc(pink).connect(rh); rh.connect(L.rain); L.rain.connect(master);
    // crickets (two detuned voices, pulse + group gating)
    L.cric = gain(0);
    [4300, 4520].forEach(function (f, i) {
      var o = ctx.createOscillator(); o.frequency.value = f; var am = gain(0.5), lfo = ctx.createOscillator(); lfo.type = 'square'; lfo.frequency.value = 33 + i * 3; var lg = gain(0.5); lfo.connect(lg); lg.connect(am.gain);
      var gate = gain(0.5), gl = ctx.createOscillator(); gl.type = 'square'; gl.frequency.value = 2.1 + i * 0.35; var gg = gain(0.5); gl.connect(gg); gg.connect(gate.gain);
      o.connect(am); am.connect(gate); gate.connect(L.cric); o.start(); lfo.start(); gl.start();
    });
    L.cric.connect(master);
    waves(); windWander(); gulls(); bell(); mixLoop();
  }

  function waves() {
    if (!ctx) return;
    var now = ctx.currentTime, dur = R(7.5, 12), rise = dur * 0.38, p = R(0.55, 1) * (0.4 + state.surf * 0.9);
    L.surf.gain.setTargetAtTime(0.06 + p * 0.20, now, rise / 3); L.surf.gain.setTargetAtTime(0.05, now + rise, (dur - rise) / 3.2);
    L.surf._lp.frequency.setTargetAtTime(380 + p * 1500, now, rise / 3); L.surf._lp.frequency.setTargetAtTime(340, now + rise, (dur - rise) / 3);
    if (L.surf._pan.pan) L.surf._pan.pan.setTargetAtTime(R(-0.45, 0.45), now, 2.5);
    L.foam.gain.setTargetAtTime(p * 0.10, now + rise * 0.85, 0.5); L.foam.gain.setTargetAtTime(0, now + rise + 0.4, 1.1);
    later(waves, dur * 780);
  }
  function windWander() {
    if (!ctx) return; var now = ctx.currentTime;
    L.wind.gain.setTargetAtTime(R(0.015, 0.07) * (1 - state.night * 0.45) + state.rain * 0.03, now, 2.5);
    L.wind._f.frequency.setTargetAtTime(R(260, 900), now, 3);
    later(windWander, R(4000, 9000));
  }
  function cry(t, f, dur, pan) {
    var o = ctx.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f * 0.78, t); o.frequency.linearRampToValueAtTime(f * 1.32, t + dur * 0.35); o.frequency.exponentialRampToValueAtTime(f * 0.82, t + dur);
    var vib = ctx.createOscillator(); vib.frequency.value = 24; var vg = gain(f * 0.03); vib.connect(vg); vg.connect(o.frequency);
    var bp = filt('bandpass', f * 1.5, 2.2), g = gain(0), p = ctx.createStereoPanner ? ctx.createStereoPanner() : gain(1); if (p.pan) p.pan.value = pan;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.05, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(bp); bp.connect(g); g.connect(p); p.connect(master); p.connect(rev);
    o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05);
  }
  function gulls() {
    if (!ctx) return;
    if (state.night < 0.5 && state.rain < 0.5 && !document.hidden) {
      var t = ctx.currentTime + 0.05, pan = R(-0.8, 0.8), n = 2 + Math.floor(Math.random() * 3), f = R(1500, 1900);
      for (var i = 0; i < n; i++) cry(t + i * R(0.32, 0.5), f * R(0.92, 1.1), R(0.3, 0.5), pan);
    }
    later(gulls, R(11000, 32000));
  }
  function bell() {
    if (!ctx) return;
    if (state.night > 0.3 || Math.random() < 0.25) {
      var t = ctx.currentTime + 0.05, g = gain(0), f = 392;
      [1, 2.76, 5.4].forEach(function (m, i) { var o = ctx.createOscillator(); o.frequency.value = f * m; var og = gain(0.5 / (i + 1)); o.connect(og); og.connect(g); o.start(t); o.stop(t + 5); });
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.035, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0005, t + 4.5);
      g.connect(rev); g.connect(master);
    }
    later(bell, R(18000, 42000));
  }
  function mixLoop() {
    if (!ctx) return;
    if (window.ShoreScene && ShoreScene.night) state.night = ShoreScene.night();
    var now = ctx.currentTime;
    L.cric.gain.setTargetAtTime(state.night > 0.6 && state.rain < 0.5 ? 0.012 * state.night : 0, now, 3);
    L.rain.gain.setTargetAtTime(state.rain * 0.09, now, 3);
    later(mixLoop, 2000);
  }

  function blip() {
    if (!ctx || !on || ctx.state !== 'running') return;
    var t = ctx.currentTime, o = ctx.createOscillator(), g = gain(0); o.type = 'sine'; o.frequency.setValueAtTime(820, t); o.frequency.exponentialRampToValueAtTime(330, t + 0.1);
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.06, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
    o.connect(g); g.connect(master); g.connect(rev); o.start(t); o.stop(t + 0.16);
  }

  function setMaster(sec) { if (!ctx) return; master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setTargetAtTime(on ? vol * 1.6 : 0, ctx.currentTime, sec || 0.8); }
  function start() {
    if (started) { if (ctx && ctx.state === 'suspended') ctx.resume(); return; }
    started = true;
    try { build(); if (ctx.state === 'suspended') ctx.resume(); setMaster(2.5); var h = document.getElementById('wi-tap'); if (h) h.classList.add('hidden'); } catch (e) { started = false; }
    ui();
  }
  function setOn(v) { on = v; try { localStorage.setItem('slSound', v ? 'on' : 'off'); } catch (e) {} if (v && !started) start(); if (ctx && v && ctx.state === 'suspended') ctx.resume(); setMaster(1); ui(); }

  // ---- control ----
  var wrap, btn, rng;
  var ICON_ON = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
  var ICON_OFF = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>';
  function ui() {
    if (!btn) return;
    var live = on && started;
    btn.innerHTML = (live ? ICON_ON : ICON_OFF) + '<span class="snd-l">' + (live ? 'Ocean' : 'Sound off') + '</span>';
    btn.setAttribute('aria-pressed', String(live)); btn.setAttribute('aria-label', live ? 'Mute ocean sounds' : 'Turn on ocean sounds'); wrap.classList.toggle('live', live);
  }
  function mount() {
    var old = document.getElementById('mute-btn'); if (old) old.remove();
    wrap = document.createElement('div'); wrap.className = 'snd';
    btn = document.createElement('button'); btn.type = 'button'; btn.className = 'snd-b';
    rng = document.createElement('input'); rng.type = 'range'; rng.min = 0; rng.max = 100; rng.value = Math.round(vol * 100); rng.className = 'snd-r'; rng.setAttribute('aria-label', 'Ocean volume');
    wrap.appendChild(btn); wrap.appendChild(rng); document.body.appendChild(wrap); ui();
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (!started) { on = true; try { localStorage.setItem('slSound', 'on'); } catch (x) {} start(); return; } setOn(!on); });
    rng.addEventListener('input', function () { vol = rng.value / 100; try { localStorage.setItem('slVol', String(vol)); } catch (e) {} if (!on && vol > 0) setOn(true); setMaster(0.2); });
  }
  function arm() {
    function go() { if (on) start(); ['pointerdown', 'keydown', 'touchend'].forEach(function (k) { document.removeEventListener(k, go, true); }); }
    ['pointerdown', 'keydown', 'touchend'].forEach(function (k) { document.addEventListener(k, go, true); });
  }
  document.addEventListener('click', function (e) { if (e.target.closest('.path,.btn-fill,.btn-ghost,.tod button,.cc-fab,.heart,.chip,.cond button,.dock a')) blip(); }, true);
  document.addEventListener('visibilitychange', function () { if (!ctx) return; if (document.hidden) ctx.suspend(); else if (on) ctx.resume(); });
  document.addEventListener('shore:cond', function (e) { var d = e.detail || {}; if (d.wave != null) state.surf = Math.max(0, Math.min(1.2, d.wave * 3.281 / 4)); state.rain = d.code >= 50 ? 1 : 0; });
  window._shorelistAudio = function () { on = true; try { localStorage.setItem('slSound', 'on'); } catch (e) {} start(); };
  window.ShoreSound = { on: function () { return on && started; }, set: setOn };
  function init() { mount(); arm(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
