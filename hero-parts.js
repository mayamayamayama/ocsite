// hero-parts.js — 入場画面で使う、図形を描く部品（hero.js が使います）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts');

window.OC_HERO_PARTS = function (G) {
  const { ctx, PAL, TAU, rad } = G;
  const fx = (x, y, z) => G.fx(x, y, z);

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
  function dotsGrid(col, gap, r, shift) { ctx.fillStyle = col; for (let gx = gap / 2 + shift; gx < G.W; gx += gap) for (let gy = gap / 2; gy < G.FH + 60; gy += gap) { ctx.beginPath(); ctx.arc(gx, gy, r, 0, TAU); ctx.fill(); } }
  function hatch(pts, gap, off, col, lw) {    // 斜めのしま模様（多角形の中だけ）
    ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let k = -G.H + (off % gap); k < G.W; k += gap) { ctx.moveTo(k, 0); ctx.lineTo(k + G.H, G.H); } ctx.stroke(); ctx.restore();
  }

  return { disc, ell, rect, split, pie, fan, hair, star8, tri, holo, greyBar, dotsGrid, hatch };
};
