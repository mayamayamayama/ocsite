// hero.js — 入場画面のメインビジュアル
// 2Dと3Dの中間のような、カラフルなモーショングラフィックス。場面が次々に切り替わります。
// タップ（クリック）すると、その場所から次の場面へ。マウスや指を近づけると、図形が逃げて、ふくらみます。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  if (!cssOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // motion.css が読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#fde9dc';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ここの数字・色を変えると見た目が変わります
  const MOVE = true;          // false で、動きを止める
  const AUTO = true;          // false で、タップしたときだけ次の場面へ
  const SCENE_SEC = 4.4;      // 1つの場面の長さ（秒）
  const PUSH = 0.07;          // マウスや指から逃げる量
  const REACH = 0.26;         // マウスや指の影響が届く広さ
  const PARALLAX = 14;        // 奥行きの動き（px）
  const GRAIN = 0.09;         // フィルムのようなざらざらの強さ（0で無し）
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', white: '#fffaf4', black: '#1b1b1b', pink: '#ff2fa0', cyan: '#00f0ff', blue: '#2a2aff', peach: '#ff9a76' };

  const TAU = Math.PI * 2, P = window.OC_POINTER || { x: 0, y: 0 };
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  const rad = (d) => (d * Math.PI) / 180;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const e = (t, s, d, f = eOut) => f(clamp01((t - s) / d));   // 時間 t のうち、s秒から d秒かけて 0→1 になる動き
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  // ---------- 大きな文字（1文字ずつ。マウスが近づくとふくらむ） ----------
  const letters = [];
  hero.querySelectorAll('[data-t]').forEach((line) => {
    [...line.dataset.t].forEach((c, i) => {
      const o = document.createElement('span'); o.className = 'ch'; o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i + (line.classList.contains('hm-l2') ? 2 : 0));
      o.appendChild(s); line.appendChild(o); letters.push({ el: o, cx: 0, cy: 0, k: 0 });
    });
  });
  setTimeout(() => hero.classList.add('is-in'), 150);
  const titleEls = [hero.querySelector('.hm-title'), hero.querySelector('.subtitle')].filter(Boolean);
  titleEls.forEach((el) => { el.style.transition = 'color .5s'; });

  // ---------- 画面の大きさ・マウス ----------
  let W = 0, H = 0, FH = 0, S = 0, u = 1, cx = 0, cy = 0, dpr = 1, visible = true, grainPat = null;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0, k: 0, active: false, mouse: false };
  const X = (v) => cx + v * u, Y = (v) => cy + v * u;     // 場面の中の位置（単位u）を、画面の位置に直す

  // 図形の中心(x,y)に、マウスの影響と奥行きの動きを足す
  function fx(x, y, z) {
    let ox = P.x * z * PARALLAX, oy = P.y * z * PARALLAX, s = 1;
    if (ptr.k > 0.01) {
      const dx = x - ptr.sx, dy = y - ptr.sy, d = Math.hypot(dx, dy) || 1, inf = Math.exp(-Math.pow(d / (REACH * S), 2)) * ptr.k;
      ox += (dx / d) * inf * PUSH * S; oy += (dy / d) * inf * PUSH * S; s += inf * 0.35;
    }
    return [x + ox, y + oy, s];
  }

  // ---------- 図形を描く部品 ----------
  function disc(x, y, r, col, z) { const [a, b, s] = fx(x, y, z); if (r <= 0) return; ctx.fillStyle = col; ctx.beginPath(); ctx.arc(a, b, r * s, 0, TAU); ctx.fill(); }
  function ell(x, y, rx, ry, rot, col, z, stroke) {
    const [a, b, s] = fx(x, y, z); ctx.beginPath(); ctx.ellipse(a, b, Math.max(0.01, rx * s), Math.max(0.01, ry * s), rot, 0, TAU);
    if (stroke) { ctx.strokeStyle = col; ctx.lineWidth = stroke; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); }
  }
  function rect(x, y, w, h, col, z) { const [a, b, s] = fx(x + w / 2, y + h / 2, z); ctx.fillStyle = col; ctx.fillRect(a - (w * s) / 2, b - (h * s) / 2, w * s, h * s); }
  function split(x, y, r, rot, c1, c2, z) {   // 2色にわかれた円
    const [a, b, s] = fx(x, y, z), R = r * s; if (R <= 0) return;
    ctx.save(); ctx.translate(a, b); ctx.rotate(rot);
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(0, 0, R, 0, TAU); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function pie(x, y, r, secs, rot, z) {       // 円グラフ。secs: [[割合, 色, 大きさ(0〜1)], ...]
    const [a, b, s] = fx(x, y, z); let ang = rot;
    secs.forEach(([f, col, k]) => { const rr = r * s * (k === undefined ? 1 : k); if (rr > 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a, b); ctx.arc(a, b, rr, ang, ang + f * TAU); ctx.closePath(); ctx.fill(); } ang += f * TAU; });
  }
  function fan(x, y, secs, rot, z) {          // 扇。secs: [[角度(度), 半径, 色], ...]
    const [a, b, s] = fx(x, y, z); let ang = rot;
    secs.forEach(([deg, r, col]) => { if (r > 0 && deg > 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a, b); ctx.arc(a, b, r * s, ang, ang + rad(deg)); ctx.closePath(); ctx.fill(); } ang += rad(deg); });
  }
  function hair(x, y, len, n, spread, rot, col, z) {   // 1点から広がる細い線
    const [a, b, s] = fx(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) { const ang = rot + (i / (n - 1) - 0.5) * spread; ctx.moveTo(a, b); ctx.lineTo(a + Math.cos(ang) * len * s, b + Math.sin(ang) * len * s); }
    ctx.stroke();
  }
  function star8(x, y, r, rot, col, z) {      // 細い棒の「＊」
    const [a, b, s] = fx(x, y, z); if (r <= 0) return; ctx.save(); ctx.translate(a, b); ctx.fillStyle = col;
    for (let i = 0; i < 4; i++) { ctx.rotate(i ? Math.PI / 4 : rot); ctx.fillRect(-r * s, -r * s * 0.08, r * s * 2, r * s * 0.16); }
    ctx.restore();
  }
  function tri(x, y, r, rot, col, z, sx) {
    const [a, b, s] = fx(x, y, z); if (r <= 0) return; ctx.save(); ctx.translate(a, b); ctx.rotate(rot); ctx.scale(sx === undefined ? 1 : sx, 1); ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const t = (i / 3) * TAU - Math.PI / 2; ctx.lineTo(Math.cos(t) * r * s, Math.sin(t) * r * s); } ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function holo(x, y, w, h, rot, t, z) {      // 虹色に光る板
    const [a, b, s] = fx(x + w / 2, y + h / 2, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot);
    const ang = t * 0.7, dx = Math.cos(ang) * w * s * 0.5, dy = Math.sin(ang) * h * s * 0.5, g = ctx.createLinearGradient(-dx, -dy, dx, dy);
    g.addColorStop(0, PAL.cyan); g.addColorStop(0.35, PAL.blue); g.addColorStop(0.62, PAL.pink); g.addColorStop(1, PAL.white);
    ctx.fillStyle = g; ctx.fillRect((-w * s) / 2, (-h * s) / 2, w * s, h * s); ctx.restore();
  }
  function greyBar(x, y, w, h, rot, z) {
    const [a, b, s] = fx(x + w / 2, y + h / 2, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot);
    const g = ctx.createLinearGradient(-w * s / 2, 0, w * s / 2, 0); g.addColorStop(0, PAL.white); g.addColorStop(1, PAL.black);
    ctx.fillStyle = g; ctx.fillRect((-w * s) / 2, (-h * s) / 2, w * s, h * s); ctx.restore();
  }
  function dotsGrid(col, gap, r, shift) { ctx.fillStyle = col; for (let gx = gap / 2 + shift; gx < W; gx += gap) for (let gy = gap / 2; gy < FH + 60; gy += gap) { ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); } }
  function hatch(pts, gap, off, col, lw) {    // 斜めのしま模様（多角形の中だけ）
    ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let k = -H + (off % gap); k < W; k += gap) { ctx.moveTo(k, 0); ctx.lineTo(k + H, H); } ctx.stroke(); ctx.restore();
  }

  // ---------- 場面（1つずつ、色と形がちがう） ----------
  // 1) 階段のように積み重なる四角
  function sStairs(t) {
    const bars = [
      { c: 'teal', x: -30, y: -10, w: 52, h: 13, dir: -1, dl: 0, z: 0.4, sub: { c: 'orange', dx: 0, dy: 9.5, w: 14, h: 3.5 } },
      { c: 'orange', x: 22, y: -24, w: 44, h: 14, dir: 1, dl: 0.15, z: 0.8, disk: { dx: 38, dy: 7, r: 5.5, c1: 'white', c2: 'verm' } },
      { c: 'navy', x: -46, y: 6, w: 28, h: 16, dir: -1, dl: 0.3, z: 0.6, disk: { dx: 6, dy: 7.5, r: 3.3, c1: 'teal', c2: 'white' } },
      { c: 'verm', x: -43, y: 22, w: 36, h: 8, dir: 1, dl: 0.45, z: 0.9, disk: { dx: 34, dy: 4, r: 5.2, c1: 'orange', c2: 'verm' } }
    ];
    bars.forEach((b, i) => {
      const p = e(t, b.dl, 0.8, eBack), off = b.dir * 90 * u * (1 - p);
      rect(X(b.x) + off, Y(b.y), b.w * u, b.h * u, PAL[b.c], b.z);
      if (b.sub) rect(X(b.x) + off, Y(b.y + b.sub.dy), b.sub.w * u, b.sub.h * u, PAL[b.sub.c], b.z);
      if (b.disk) split(X(b.x + b.disk.dx) + off, Y(b.y + b.disk.dy), b.disk.r * u * e(t, b.dl + 0.6, 0.5, eBack), t * (0.8 + i * 0.3) + i, PAL[b.disk.c1], PAL[b.disk.c2], b.z);
    });
    const ph = e(t, 0.9, 0.7);
    hair(X(22), Y(-3.5), 30 * u * ph, 14, rad(40), 0, 'rgba(20,27,58,.85)', 0.5);
    hair(X(22), Y(-3.5), 9 * u * ph, 10, rad(40), Math.PI, 'rgba(20,27,58,.85)', 0.5);
    const pt = e(t, 0.5, 0.5, eBack);
    disc(X(-8), Y(-30), 3.2 * u * pt, PAL.teal, 1); disc(X(-8), Y(-30), 0.5 * u * pt, PAL.cream, 1);
  }
  // 2) 立てたコインと、横たわる円盤
  function sCoins(t) {
    ell(X(0), Y(14), 42 * u, 15 * u, 0, 'rgba(20,27,58,.3)', 0.2, 1);
    ['orange', 'white', 'verm'].forEach((c, i) => {
      const p = e(t, i * 0.12, 0.9, eBack), spin = t * 2.2 + i * 0.6, rx = (1 + 3.4 * Math.abs(Math.cos(spin))) * u;
      ell(X(-3 + i * 3.4), Y(-16 - (1 - p) * 60), rx, 10.5 * u, 0.14, PAL[c], 0.6 + i * 0.1);
    });
    const pd = e(t, 0.3, 0.9, eBack), lx = X(-17) - (1 - pd) * 60 * u;
    ell(lx, Y(12.5), 11 * u, 5 * u, 0, PAL.navy, 0.5); ell(lx, Y(11), 11 * u, 5 * u, 0, PAL.verm, 0.5); ell(lx, Y(9.4), 11 * u, 5 * u, 0, PAL.white, 0.5);
    star8(X(2), Y(19), 6 * u * e(t, 0.5, 0.6, eBack), t * 1.2, PAL.cream, 0.9);
    const sx = Math.abs(Math.cos(t * 1.4)) * 0.9 + 0.1, pt = e(t, 0.6, 0.7, eBack);
    tri(X(1.4), Y(30.6), 7 * u * pt, 0, PAL.orange, 0.7, sx); tri(X(1), Y(30), 7 * u * pt, 0, PAL.teal, 0.7, sx); tri(X(0.6), Y(29.4), 7 * u * pt, 0, PAL.cream, 0.7, sx);
    [[-8, 1, 1.1, 'orange'], [-5.2, 3.6, 0.9, 'cream'], [11, -4, 1.3, 'cream'], [14, 6, 0.8, 'orange']].forEach(([x, y, r, c], i) => disc(X(x), Y(y + Math.sin(t * 2 + i) * 0.8), r * u * e(t, 0.7 + i * 0.1, 0.4, eBack), PAL[c], 1));
  }
  // 3) 回る円グラフ（点と斜線の背景）
  function sPie(t) {
    dotsGrid('rgba(250,140,20,.95)', 6.2 * u, 0.45 * u, P.x * 4);
    hatch([[0, 0], [W * 0.62, 0], [0, FH * 0.7]], 7, t * 14, 'rgba(232,80,30,.9)', 2.2);
    const k = (i) => eBack(clamp01((t - i * 0.1) / 0.7));
    pie(X(3), Y(0), 25 * u, [[0.22, PAL.verm, k(0)], [0.2, PAL.white, k(1)], [0.28, PAL.teal, k(2)], [0.16, PAL.orange, k(3)], [0.14, PAL.navy, k(4)]], t * 0.5, 0.5);
    pie(X(3), Y(0), 8.5 * u, [[0.5, PAL.white, k(2)], [0.3, PAL.orange, k(3)], [0.2, PAL.verm, k(4)]], -t * 0.9, 0.6);
    ell(X(3), Y(0), 31 * u * e(t, 0.2, 0.8), 31 * u * e(t, 0.2, 0.8), 0, 'rgba(255,250,244,.35)', 0.5, 1);
    star8(X(-26), Y(24), 4 * u * e(t, 0.8, 0.5, eBack), t * 1.5, PAL.white, 1);
  }
  // 4) 開いていく扇
  function sFan(t) {
    const base = [[22, 46, 'verm'], [16, 40, 'teal'], [18, 44, 'orange'], [14, 38, 'navy'], [16, 48, 'teal']], total = 86, sway = Math.sin(t * 1.3) * 0.05;
    let start = -Math.PI / 2 - rad(total / 2) + sway;
    const secs = base.map(([deg, r, c], i) => { const p = e(t, i * 0.08, 0.8, eBack); return [deg * Math.max(0, p), r * u * Math.max(0, p), PAL[c]]; });
    const used = secs.reduce((a, s) => a + s[0], 0);
    fan(X(0), Y(8), secs, start + rad((total - used) / 2), 0.4);
    const pd = e(t, 0.4, 0.7, eBack);
    split(X(-26), Y(14), 7.2 * u * pd, rad(-40) + Math.sin(t) * 0.3, PAL.orange, PAL.navy, 0.8);
    rect(X(15) + (1 - e(t, 0.6, 0.6)) * 30 * u, Y(3), 4 * u, 4 * u, PAL.teal, 1); rect(X(19) + (1 - e(t, 0.7, 0.6)) * 30 * u, Y(7), 6.5 * u, 6.5 * u, PAL.verm, 1);
    const [bx, by, bs] = fx(X(28), Y(36), 0.7), g = e(t, 0.3, 1, eBack);
    ctx.fillStyle = PAL.teal; ctx.beginPath();
    for (let i = 0; i <= 72; i++) { const th = (i / 72) * TAU, r = 26 * u * bs * g * (1 + 0.1 * Math.sin(4 * th + t * 1.5) + 0.05 * Math.sin(7 * th - t)); if (i) ctx.lineTo(bx + Math.cos(th) * r, by + Math.sin(th) * r); else ctx.moveTo(bx + Math.cos(th) * r, by + Math.sin(th) * r); }
    ctx.fill();
  }
  // 5) 斜めの板の上の波の線（立体のように見える）
  function sIso(t) {
    const p = e(t, 0, 0.9), q = u;
    ctx.save(); ctx.translate(X(0) + (1 - p) * 70 * u + P.x * 14, Y(12) + (1 - p) * 30 * u + P.y * 8); ctx.transform(1, -0.16, 0.62, 0.46, 0, 0);
    ctx.strokeStyle = 'rgba(20,27,58,.75)'; ctx.lineWidth = 1.2;
    for (let k = 0; k < 3; k++) ctx.strokeRect((-30 - k * 1.3) * q, (-24 + k * 1.5) * q, 60 * q, 48 * q);
    ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(-4 * q, 6 * q, 13 * q * e(t, 0.4, 0.7, eBack), 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(42,42,255,.9)';
    for (let gx = -24; gx <= -4; gx += 3) for (let gy = -18; gy <= 2; gy += 3) { ctx.beginPath(); ctx.arc(gx * q, gy * q, 0.35 * q, 0, TAU); ctx.fill(); }
    ctx.strokeStyle = 'rgba(20,27,58,.85)'; ctx.lineWidth = 1;
    const amp = e(t, 0.5, 0.8) * 3.2 * q;
    for (let row = 0; row < 14; row++) { ctx.beginPath(); for (let x = 2; x <= 26; x += 1) { const y = (-20 + row * 1.5) * q + Math.sin(x * 0.45 + t * 3 + row * 0.28) * amp * Math.sin(((x - 2) / 24) * Math.PI); if (x === 2) ctx.moveTo(x * q, y); else ctx.lineTo(x * q, y); } ctx.stroke(); }
    ctx.restore();
    const pn = e(t, 0.3, 0.8, eBack);
    ell(X(9), Y(9) - (1 - pn) * 40 * u, 5.5 * u, 14 * u, 0.15, PAL.navy, 0.8); ell(X(9), Y(9) - (1 - pn) * 40 * u, 1.3 * u, 2.4 * u, 0.15, PAL.pink, 0.8);
    holo(X(-6) + (1 - e(t, 0.5, 0.8)) * 60 * u, Y(-18), 34 * u, 5 * u, rad(14), t, 1);
    greyBar(X(-16), Y(-8) - (1 - e(t, 0.6, 0.8)) * 40 * u, 30 * u, 4.5 * u, rad(-22), 0.9);
    rect(X(24) + (1 - e(t, 0.7, 0.8)) * 50 * u, Y(15), 9 * u, 2.4 * u, PAL.white, 1);
    const [sx, sy, ss] = fx(X(-26), Y(-24), 1), sp = e(t, 0.6, 0.6, eBack);
    ctx.fillStyle = PAL.teal; ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU + t * 0.5, r = (i % 2 ? 2.2 : 6) * u * ss * sp; ctx.lineTo(sx + Math.cos(a) * r, sy + Math.sin(a) * r * 0.7); } ctx.closePath(); ctx.fill();
  }
  // 6) 部屋の中に浮かぶ形
  function sRoom(t) {
    const wx = W * 0.34 + P.x * 10;
    ctx.fillStyle = '#ff7a4c'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(wx, FH * 0.04); ctx.lineTo(wx, FH * 0.66); ctx.lineTo(0, FH * 0.8); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d63f14'; ctx.beginPath(); ctx.moveTo(0, FH * 0.8); ctx.lineTo(wx, FH * 0.66); ctx.lineTo(W, FH * 0.66); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
    for (let i = 0; i < 5; i++) { const h = (13 + 9 * Math.abs(Math.sin(t * 1.8 + i * 1.3))) * u * e(t, i * 0.08, 0.6, eBack); rect(X(-6 + i * 5.4), Y(12) - h, 3.8 * u, h, '#fff4f4', 0.8 + i * 0.03); }
    rect(X(-14), Y(-24) - (1 - e(t, 0.1, 0.7)) * 50 * u, 11 * u, 26 * u, PAL.blue, 0.7);
    const bounce = Math.abs(Math.sin(t * 2.2)) * 7 * u, [sx, sy, ss] = fx(X(7), Y(14) - bounce, 1), R = 8 * u * ss * e(t, 0.3, 0.7, eBack);
    if (R > 0) { const g = ctx.createRadialGradient(sx - R * 0.3, sy - R * 0.35, R * 0.1, sx, sy, R); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#2a2a2a'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.fill(); }
    holo(X(-14) + (1 - e(t, 0.4, 0.8)) * 70 * u, Y(15), 32 * u, 6 * u, rad(3), t, 0.9);
    holo(X(10) + (1 - e(t, 0.5, 0.8)) * 70 * u, Y(2), 18 * u, 5 * u, rad(-8), t + 2, 1);
    rect(X(-1), Y(-14), 1.8 * u, 22 * u, PAL.teal, 0.9);
    ctx.save(); const [ax, ay] = fx(X(0), Y(-6), 1); ctx.translate(ax, ay); ctx.rotate(rad(38) + Math.sin(t) * 0.1); ctx.fillStyle = PAL.orange; ctx.fillRect(-14 * u, -0.9 * u, 28 * u * e(t, 0.5, 0.6), 1.8 * u); ctx.restore();
    ell(X(-27), Y(12), 8 * u * e(t, 0.2, 0.7), 12 * u * e(t, 0.2, 0.7), 0, 'rgba(255,240,230,.7)', 0.6, 1); ell(X(-27), Y(12), 5 * u * e(t, 0.3, 0.7), 8 * u * e(t, 0.3, 0.7), 0, 'rgba(255,240,230,.7)', 0.6, 1);
    star8(X(-18), Y(26), 5.5 * u * e(t, 0.6, 0.5, eBack), t * 1.3, PAL.cream, 1);
    disc(X(25), Y(-14), 2.6 * u * e(t, 0.7, 0.4, eBack), PAL.white, 1);
  }

  const SCENES = [
    { bg: PAL.cream, ink: PAL.navy, draw: sStairs }, { bg: PAL.teal, ink: PAL.cream, draw: sCoins }, { bg: PAL.navy, ink: PAL.cream, draw: sPie },
    { bg: PAL.cream, ink: PAL.navy, draw: sFan }, { bg: PAL.orange, ink: PAL.navy, draw: sIso }, { bg: PAL.verm, ink: PAL.cream, draw: sRoom }
  ];
  const N = SCENES.length, st = { i: 0, t0: performance.now(), wipe: null };
  function applyInk() { titleEls.forEach((el) => { el.style.color = SCENES[st.i].ink; }); }
  function startWipe(x, y, now) { if (st.wipe) return; st.wipe = { x, y, t0: now, to: (st.i + 1) % N }; }
  window.OC_HERO = { goto(i) { st.i = i; st.t0 = performance.now(); st.wipe = null; applyInk(); } };   // （確認用）

  // ---------- 情報の文字・場面の数 ----------
  function label(text, x, y, align, col, size) {
    ctx.fillStyle = col; ctx.font = `600 ${size || 10}px ${MONO}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px'; ctx.fillText(text, x, y);
  }
  function hud(prog) {
    const ink = SCENES[st.i].ink, m = 20, y = FH - 28;
    label(`SCENE ${pad(st.i + 1)} / ${pad(N)}`, m, y - 16, 'left', ink, 9); label('TAP → NEXT', W - m, y - 16, 'right', ink, 9);
    const seg = (W - m * 2 - (N - 1) * 6) / N;
    for (let i = 0; i < N; i++) {
      const x = m + i * (seg + 6); ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(x, y, seg, 2);
      const f = i < st.i ? 1 : i === st.i ? prog : 0; ctx.globalAlpha = 1; ctx.fillRect(x, y, seg * f, 2);
    }
  }

  // ---------- 1コマを描く ----------
  let lastGrain = 0, gx = 0, gy = 0;
  function draw(now) {
    if (!W) return;
    ptr.sx += (ptr.x - ptr.sx) * 0.2; ptr.sy += (ptr.y - ptr.sy) * 0.2; ptr.k += ((ptr.active ? 1 : 0) - ptr.k) * 0.12;
    if (MOVE && !REDUCE && AUTO && !st.wipe && now - st.t0 > SCENE_SEC * 1000) startWipe(W / 2, FH * 0.35, now);
    const sc = SCENES[st.i], t = MOVE && !REDUCE ? (now - st.t0) / 1000 : SCENE_SEC * 0.7;
    ctx.globalAlpha = 1; ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); sc.draw(t); ctx.restore();
    if (st.wipe) {   // 次の場面の色が、タップした場所から広がる
      const w = st.wipe, p = clamp01((now - w.t0) / 650), R = Math.hypot(Math.max(w.x, W - w.x), Math.max(w.y, H - w.y));
      ctx.fillStyle = SCENES[w.to].bg; ctx.beginPath(); ctx.arc(w.x, w.y, eIO(p) * R, 0, TAU); ctx.fill();
      if (p >= 1) { st.i = w.to; st.t0 = now; st.wipe = null; applyInk(); }
    }
    hud(clamp01(((now - st.t0) / 1000) / SCENE_SEC));
    if (GRAIN > 0 && grainPat) {   // フィルムのようなざらざら（少しずつ動く）
      if (now - lastGrain > 80) { gx = Math.random() * 128; gy = Math.random() * 128; lastGrain = now; }
      ctx.save(); ctx.globalAlpha = GRAIN; ctx.translate(-gx, -gy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W + 128, H + 128); ctx.restore();
    }
    // 大きな文字（近づくとふくらんで、逃げる）
    letters.forEach((l) => {
      let k = 0, dx = 0, dy = 0;
      if (ptr.k > 0.01) { const ex = l.cx - ptr.sx, ey = l.cy - ptr.sy, d = Math.hypot(ex, ey) || 1; k = Math.exp(-Math.pow(d / (S * 0.28), 2)) * ptr.k; dx = (ex / d) * k * 14; dy = (ey / d) * k * 14; }
      l.k += (k - l.k) * 0.15;
      if (l.k > 0.001 || l.on) { l.el.style.scale = String(1 + l.k * 0.28); l.el.style.translate = `${dx}px ${dy}px`; l.on = l.k > 0.001; }
    });
  }

  // ---------- 大きさを決める ----------
  function build() {
    const rect0 = hero.getBoundingClientRect();
  // ---------- 変更 -------------