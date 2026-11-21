/* ShoreList cinematic scene: a live, resolution-independent beach rendered in WebGL.
   Sky, sun/moon, stars, clouds, rolling sea with glints and shore foam.
   Time of day follows the visitor's clock and can be changed with buttons.
   Falls back to a CSS gradient without WebGL; stills when reduced motion is on. */
(function () {
  'use strict';
  var host = document.querySelector('[data-scene]');
  if (!host) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // keyframes: skyTop, skyHorizon, sun, seaDeep, seaLight, sunY(0..1 horizon-relative), stars, warmth
  var K = {
    dawn:   { top: [0.20, 0.27, 0.46], hor: [1.00, 0.67, 0.55], sun: [1.00, 0.72, 0.50], deep: [0.07, 0.20, 0.30], lite: [0.55, 0.52, 0.55], sy: 0.06, st: 0.15 },
    noon:   { top: [0.10, 0.45, 0.78], hor: [0.62, 0.86, 0.95], sun: [1.00, 0.97, 0.88], deep: [0.02, 0.33, 0.42], lite: [0.30, 0.78, 0.80], sy: 0.62, st: 0.0 },
    golden: { top: [0.16, 0.30, 0.52], hor: [1.00, 0.55, 0.30], sun: [1.00, 0.62, 0.30], deep: [0.06, 0.20, 0.30], lite: [0.95, 0.52, 0.34], sy: 0.10, st: 0.05 },
    night:  { top: [0.01, 0.03, 0.09], hor: [0.07, 0.16, 0.28], sun: [0.80, 0.88, 1.00], deep: [0.01, 0.05, 0.10], lite: [0.18, 0.28, 0.42], sy: 0.40, st: 1.0 }
  };
  var ORDER = ['dawn', 'noon', 'golden', 'night'];
  function mix(a, b, t) { return a + (b - a) * t; }
  function mixv(a, b, t) { return [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)]; }
  function blend(p) { // p in [0,4) loops dawn->noon->golden->night->dawn
    var i = Math.floor(p) % 4, f = p - Math.floor(p), s = f * f * (3 - 2 * f);
    var A = K[ORDER[i]], B = K[ORDER[(i + 1) % 4]];
    return { top: mixv(A.top, B.top, s), hor: mixv(A.hor, B.hor, s), sun: mixv(A.sun, B.sun, s), deep: mixv(A.deep, B.deep, s), lite: mixv(A.lite, B.lite, s), sy: mix(A.sy, B.sy, s), st: mix(A.st, B.st, s) };
  }
  // Real sun for Wilmington, NC (NOAA sunrise equation): no network needed.
  var LAT = 34.2257, LON = -77.9447, RAD = Math.PI / 180;
  function sunDay(ms) {
    var jd = ms / 86400000 + 2440587.5, n = Math.ceil(jd - 2451545.0 + 0.0008), js = n - LON / 360;
    var M = (357.5291 + 0.98560028 * js) % 360, C = 1.9148 * Math.sin(M * RAD) + 0.02 * Math.sin(2 * M * RAD) + 0.0003 * Math.sin(3 * M * RAD);
    var L = (M + C + 180 + 102.9372) % 360, tr = 2451545.0 + js + 0.0053 * Math.sin(M * RAD) - 0.0069 * Math.sin(2 * L * RAD);
    var dec = Math.asin(Math.sin(L * RAD) * Math.sin(23.4397 * RAD));
    var w = Math.acos((Math.sin(-0.833 * RAD) - Math.sin(LAT * RAD) * Math.sin(dec)) / (Math.cos(LAT * RAD) * Math.cos(dec))) / RAD;
    function ms2(j) { return (j - 2440587.5) * 86400000; }
    return { rise: ms2(tr - w / 360), noon: ms2(tr), set: ms2(tr + w / 360) };
  }
  function phaseAt(ms) {
    var pts = [], H = 3600000;
    for (var i = -1; i <= 1; i++) { var d = sunDay(ms + i * 86400000); pts.push([d.rise - 1.0 * H, 4 * (i - 1) + 3], [d.rise, 4 * i], [d.noon, 4 * i + 1], [d.set - 0.4 * H, 4 * i + 2], [d.set + 0.9 * H, 4 * i + 3]); }
    pts.sort(function (a, b) { return a[0] - b[0]; });
    for (var k = 0; k < pts.length - 1; k++) {
      if (ms >= pts[k][0] && ms < pts[k + 1][0]) { var f = (ms - pts[k][0]) / (pts[k + 1][0] - pts[k][0]); return (((pts[k][1] + f * (pts[k + 1][1] - pts[k][1])) % 4) + 4) % 4; }
    }
    return 1;
  }
  function phaseNow() { return phaseAt(Date.now()); }
  window.ShoreSun = { phaseAt: phaseAt, now: phaseNow };
  var autoMode = true;

  var cv = document.createElement('canvas');
  cv.className = 'scene-cv'; cv.setAttribute('aria-hidden', 'true');
  host.insertBefore(cv, host.firstChild);
  var gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' });
  if (!gl) { host.classList.add('scene-fallback'); return; }

  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision mediump float;uniform vec2 R;uniform float T;uniform vec3 top,hor,sun,deep,lite;uniform float sy,st;uniform vec2 M;uniform vec3 RP[4];' +
  'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
  'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}' +
  'float fbm(vec2 p){float a=.5,s=0.;for(int i=0;i<4;i++){s+=a*n(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}' +
  'void main(){vec2 uv=gl_FragCoord.xy/R;float asp=R.x/R.y;vec2 q=vec2((uv.x-.5)*asp,uv.y);' +
  'float hz=.40+M.y*.012;float sx=.18+M.x*.02;vec2 sp=vec2(sx*asp*.5,hz+sy*.42);' +
  'vec3 col;' +
  'if(uv.y>hz){float k=(uv.y-hz)/(1.-hz);vec3 sk=mix(hor,top,pow(k,.62));' +
    'float d=length(q-sp+vec2(0.,0.));float glow=exp(-d*3.2)*.55+exp(-d*14.)*.9;sk+=sun*glow*(1.-st*.55);' +
    'float disc=smoothstep(.055,.050,d);sk=mix(sk,sun,disc);' +
    'vec2 cp=vec2(q.x*1.2+T*.012+M.x*.01,uv.y*2.6);float c=fbm(cp*vec2(2.2,3.4));c=smoothstep(.48,.82,c)*smoothstep(0.,.25,k)*(1.-k*.55);' +
    'vec3 cc=mix(sk*1.05,mix(hor,vec3(1.),.55),.65);sk=mix(sk,cc,c*.7);' +
    'vec2 sg=floor(uv*vec2(R.x,R.y)/3.);float s=step(.9965,h(sg))*st*smoothstep(.15,.5,k);sk+=vec3(s)*(.6+.4*sin(T*2.+h(sg)*30.));' +
    'col=sk;}' +
  'else{float k=(hz-uv.y)/hz;float z=1./(k+.06);vec2 wp=vec2(q.x*z*.55,z*1.1);' +
    'float w=fbm(wp*vec2(1.4,1.)+vec2(T*.10,T*.22))+.5*fbm(wp*vec2(3.1,2.2)-vec2(T*.15,T*.31));' +
    'float e=.012;float w2=fbm((wp+vec2(e,0.))*vec2(1.4,1.)+vec2(T*.10,T*.22))+.5*fbm((wp+vec2(e,0.))*vec2(3.1,2.2)-vec2(T*.15,T*.31));' +
    'float sl=(w2-w)/e;float rf=sl*.06;' +
    'vec3 sea=mix(lite,deep,pow(clamp(k*1.5,0.,1.),.55));sea=mix(sea,deep,clamp(w*.35,0.,1.));' +
    'float refl=exp(-pow((q.x-sp.x+rf*3.)*(2.4+k*9.),2.))*pow(1.-k,1.4);sea+=sun*refl*(.55+1.2*smoothstep(.45,.75,w))*(1.-st*.65);' +
    'float sparkle=smoothstep(.78,.95,w)*(1.-k)*.25;sea+=sun*sparkle*(1.-st*.8);' +
    'float shore=smoothstep(.0,.06,.12-k);float line=sin(k*38.-T*.9+w*3.)*.5+.5;float foam=smoothstep(.55,.95,line)*smoothstep(.16,.0,k)*(.5+.5*n(wp*8.));' +
    'sea=mix(sea,vec3(1.),foam*.55);float rp=0.;for(int i=0;i<4;i++){vec3 r=RP[i];if(r.z>0.){float ag=T-r.z;vec2 dv=(uv-r.xy)*vec2(asp,1.9);float dd=length(dv);rp+=sin((dd-ag*.55)*60.)*exp(-ag*1.15)*exp(-abs(dd-ag*.55)*10.);}}sea+=vec3(rp*.16)*(1.-st*.55)+sun*max(rp,0.)*.25*(1.-st*.7);' +
    'float wet=smoothstep(.07,.0,k);sea=mix(sea,mix(vec3(.82,.72,.56),hor,.22)*(.35+.65*(1.-st*.8)),smoothstep(.045,.0,k-.0));' +
    'col=sea;}' +
  'float vg=smoothstep(1.25,.25,length((uv-.5)*vec2(1.,1.15)));col*=mix(.74,1.,vg);' +
  'col+= (h(gl_FragCoord.xy+T)-.5)*.012;' +
  'gl_FragColor=vec4(pow(col,vec3(.92)),1.);}';

  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { throw new Error(gl.getShaderInfoLog(o)); } return o; }
  var pr = gl.createProgram();
  try { gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); }
  catch (e) { host.classList.add('scene-fallback'); if (window.console) console.warn('scene shader', e.message); return; }
  gl.useProgram(pr);
  var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  var U = {}; ['R', 'T', 'top', 'hor', 'sun', 'deep', 'lite', 'sy', 'st', 'M', 'RP'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });

  var rips = new Float32Array(12), ripI = 0, lastRip = 0;
  function ripple(x, y) { var now = (performance.now() - t0) / 1000; rips[ripI * 3] = x; rips[ripI * 3 + 1] = y; rips[ripI * 3 + 2] = now; ripI = (ripI + 1) % 4; }
  var scale = Math.min(window.devicePixelRatio || 1, 2), cur = phaseNow(), target = cur, mx = 0, my = 0, tmx = 0, tmy = 0;
  var visible = true, t0 = performance.now(), last = t0, slow = 0, frames = 0;
  function size() { var r = host.getBoundingClientRect(); cv.width = Math.max(2, Math.floor(r.width * scale)); cv.height = Math.max(2, Math.floor(r.height * scale)); gl.viewport(0, 0, cv.width, cv.height); }
  function draw(now) {
    var s = blend(cur);
    gl.uniform2f(U.R, cv.width, cv.height); gl.uniform1f(U.T, (now - t0) / 1000);
    gl.uniform3fv(U.top, s.top); gl.uniform3fv(U.hor, s.hor); gl.uniform3fv(U.sun, s.sun); gl.uniform3fv(U.deep, s.deep); gl.uniform3fv(U.lite, s.lite);
    gl.uniform1f(U.sy, s.sy); gl.uniform1f(U.st, s.st); gl.uniform2f(U.M, mx, my); gl.uniform3fv(U.RP, rips);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
  function loop(now) {
    requestAnimationFrame(loop);
    if (!visible || document.hidden || host.classList.contains('plates-on')) { last = now; return; }
    var dt = now - last; last = now;
    if (dt > 34) slow++; else if (slow > 0) slow -= .5;
    if (slow > 30 && scale > .6) { scale = Math.max(.6, scale - .25); slow = 0; size(); }
    var d = target - cur; if (d > 2) d -= 4; if (d < -2) d += 4;
    if (Math.abs(d) > .002) { cur = (cur + d * Math.min(1, dt / 700) + 4) % 4; }
    mx += (tmx - mx) * .06; my += (tmy - my) * .06;
    draw(now); frames++;
    if (frames === 3) host.classList.add('scene-ready');
  }
  window.addEventListener('resize', size);
  host.addEventListener('pointerdown', function (e) { if (e.target.closest('a,button,input,select,textarea,.cond,.tod,.paths')) return; var r = host.getBoundingClientRect(); ripple((e.clientX - r.left) / r.width, 1 - (e.clientY - r.top) / r.height); });
  host.addEventListener('pointermove', function (e) { var n = performance.now(); if (n - lastRip > 420) { var r0 = host.getBoundingClientRect(), yy = 1 - (e.clientY - r0.top) / r0.height; if (yy < 0.4) { lastRip = n; ripple((e.clientX - r0.left) / r0.width, yy); } } var r = host.getBoundingClientRect(); tmx = (e.clientX - r.left) / r.width - .5; tmy = (e.clientY - r.top) / r.height - .5; });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(host);
  size();
  if (reduce) { draw(performance.now()); host.classList.add('scene-ready'); }
  else requestAnimationFrame(loop);

  window.ShoreScene = {
    set: function (name) { var i = ORDER.indexOf(name); if (i < 0) return; autoMode = false; target = i; if (reduce) { cur = i; draw(performance.now()); } host.setAttribute('data-tod', name); document.dispatchEvent(new CustomEvent('shorescene', { detail: name })); },
    live: function () { autoMode = true; target = phaseNow(); host.setAttribute('data-tod', 'live'); if (reduce) { cur = target; draw(performance.now()); } document.dispatchEvent(new CustomEvent('shorescene', { detail: 'live' })); },
    auto: function () { return 'live'; },
    night: function () { return blend(cur).st; },
    names: ORDER
  };
  setInterval(function () { if (autoMode) target = phaseNow(); }, 20000);
  host.setAttribute('data-tod', 'live');
})();
