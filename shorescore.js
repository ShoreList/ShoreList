/* Shore Score: a live 0-100 beach-day score computed on-device from the current conditions
   (temperature, water, surf, sky, estimated flag). Opens Shore AI with a tailored question. */
(function () {
  'use strict';
  var pill, last = null;
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function score(d) {
    var s = 100, why = [], ft = d.wave != null ? d.wave * 3.281 : null, t = d.temp, w = d.water, c = d.code, f = String(d.flag || '').toLowerCase();
    if (t != null) { var dt = t < 74 ? 74 - t : t > 88 ? (t - 88) * 1.5 : 0; s -= clamp(dt * 1.6, 0, 40); if (t < 60) why.push('chilly'); else if (t > 90) why.push('hot'); }
    if (w != null) { if (w < 68) { s -= clamp((68 - w) * 1.2, 0, 22); why.push('cold water'); } }
    if (ft != null && ft > 3.5) { s -= clamp((ft - 3.5) * 6, 0, 24); why.push('big surf'); }
    if (c != null && c >= 50) { s -= c >= 95 ? 45 : 28; why.push(c >= 95 ? 'storms' : 'rain'); } else if (c != null && c >= 4) { s -= 6; }
    if (/red/.test(f)) { s -= 22; why.push('red flag estimate'); } else if (/yellow/.test(f)) { s -= 6; }
    return { n: Math.round(clamp(s, 5, 100)), why: why, ft: ft };
  }
  function label(n) { return n >= 85 ? 'Perfect' : n >= 70 ? 'Great' : n >= 50 ? 'Decent' : n >= 30 ? 'Meh' : 'Stay dry'; }
  function idea(d, r) {
    var c = d.code, f = String(d.flag || '').toLowerCase();
    if (c != null && c >= 50) return 'Rainy day ideas';
    if (r.ft != null && r.ft >= 2 && !/red/.test(f)) return 'Surf lesson';
    if (r.n >= 80 && d.water != null && d.water >= 72) return 'Paddleboard tours';
    if (r.n >= 70) return 'What is on this weekend?';
    return 'Plan my day';
  }
  function ensure() {
    if (pill) return pill;
    var css = document.createElement('style');
    css.textContent = '.ss{position:fixed;right:16px;bottom:78px;z-index:9000;display:flex;align-items:center;gap:10px;padding:8px 14px 8px 8px;border-radius:100px;border:1px solid rgba(255,255,255,.18);background:rgba(7,35,45,.72);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);color:#F5E8CB;font:600 .78rem/1.1 "DM Sans",system-ui,sans-serif;cursor:pointer;box-shadow:0 10px 30px -10px rgba(0,0,0,.6);opacity:0;transform:translateY(10px);transition:opacity .6s,transform .6s}.ss.on{opacity:1;transform:none}.ss svg{width:38px;height:38px;flex:none}.ss small{display:block;font-weight:500;opacity:.75;margin-top:2px}.ss:hover{border-color:#FFC95E}@media(max-width:700px){.ss{bottom:72px;right:10px}.ss small{display:none}}';
    document.head.appendChild(css);
    pill = document.createElement('button'); pill.type = 'button'; pill.className = 'ss'; pill.setAttribute('aria-label', 'Beach score, open Shore AI for ideas');
    pill.addEventListener('click', function () { if (last) document.dispatchEvent(new CustomEvent('shore:ask', { detail: last.q })); });
    document.body.appendChild(pill); return pill;
  }
  function render(d) {
    var r = score(d), q = idea(d, r), col = r.n >= 70 ? '#8FD3DE' : r.n >= 50 ? '#FFC95E' : '#E96645', C = 2 * Math.PI * 16, off = C * (1 - r.n / 100);
    last = { n: r.n, q: q, why: r.why };
    var p = ensure();
    p.innerHTML = '<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="16" fill="none" stroke="rgba(255,255,255,.15)" stroke-width="4"/><circle cx="20" cy="20" r="16" fill="none" stroke="' + col + '" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + C.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 20 20)"/><text x="20" y="24.5" text-anchor="middle" font-size="12" font-weight="700" fill="#fff" font-family="DM Sans,system-ui">' + r.n + '</text></svg><span>Beach score: ' + label(r.n) + '<small>' + (r.why.length ? r.why.slice(0, 2).join(', ') : 'tap for a plan') + '</small></span>';
    requestAnimationFrame(function () { p.classList.add('on'); });
  }
  document.addEventListener('shore:cond', function (e) { if (e.detail && e.detail.temp != null) render(e.detail); });
  try {
    if (navigator.modelContext && navigator.modelContext.registerTool) navigator.modelContext.registerTool({ name: 'beach_day_score', description: 'Current 0-100 beach-day score for Wilmington beaches with the main reasons and a suggested activity.', inputSchema: { type: 'object', properties: {} }, execute: function () { return Promise.resolve({ content: [{ type: 'text', text: last ? 'Score ' + last.n + '/100 (' + label(last.n) + '). ' + (last.why.join(', ') || 'No major issues') + '. Suggested: ' + last.q : 'Conditions not loaded yet' }] }); } });
  } catch (e) {}
})();
