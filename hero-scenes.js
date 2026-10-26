// hero-scenes.js — 入場画面の場面（6つ）。色や形を変えたいときは、ここを直します
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function (G, T) {
  const { ctx, PAL, TAU, rad, clamp01, eBack, e, fx, P } = G;
  const { disc, ell, rect, split, pie, fan, hair, star8, tri, holo, greyBar, dotsGrid, hatch } = T;

  // ---------- 場面（1つずつ、色と形がちがう） ----------
  // 1) 階段のように積み重なる四角
  function sStairs(t, c) {
    const { u, X, Y, W, H, FH } = c;
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
  function sCoins(t, c) {
    const { u, X, Y, W, H, FH } = c;
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
  function sPie(t, c) {
    const { u, X, Y, W, H, FH } = c;
    dotsGrid('rgba(250,140,20,.95)', 6.2 * u, 0.45 * u, P.x * 4);
    hatch([[0, 0], [W * 0.62, 0], [0, FH * 0.7]], 7, t * 14, 'rgba(232,80,30,.9)', 2.2);
    const k = (i) => eBack(clamp01((t - i * 0.1) / 0.7));
    pie(X(3), Y(0), 25 * u, [[0.22, PAL.verm, k(0)], [0.2, PAL.white, k(1)], [0.28, PAL.teal, k(2)], [0.16, PAL.orange, k(3)], [0.14, PAL.navy, k(4)]], t * 0.5, 0.5);
    pie(X(3), Y(0), 8.5 * u, [[0.5, PAL.white, k(2)], [0.3, PAL.orange, k(3)], [0.2, PAL.verm, k(4)]], -t * 0.9, 0.6);
    ell(X(3), Y(0), 31 * u * e(t, 0.2, 0.8), 31 * u * e(t, 0.2, 0.8), 0, 'rgba(255,250,244,.35)', 0.5, 1);
    star8(X(-26), Y(24), 4 * u * e(t, 0.8, 0.5, eBack), t * 1.5, PAL.white, 1);
  }
  // 4) 開いていく扇
  function sFan(t, c) {
    const { u, X, Y, W, H, FH } = c;
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
  function sIso(t, c) {
    const { u, X, Y, W, H, FH } = c;
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
  function sRoom(t, c) {
    const { u, X, Y, W, H, FH } = c;
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

  return { sStairs, sCoins, sPie, sFan, sIso, sRoom };
};
