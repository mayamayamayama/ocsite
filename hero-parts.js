// hero-parts.js — 入場画面で使う、図形を描く部品（hero.js と場面のファイルが使います）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts');

window.OC_HERO_PARTS = function (G) {
  const ctx = G.ctx, TAU = Math.PI * 2;
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  // 奥行き z（0＝奥、1＝手前）に合わせて、傾きの分だけずらす
  const P = (x, y, z = 0.5) => [x + G.tx * z * G.PAR, y + G.ty * z * G.PAR];

  function disc(x, y, r, col, z) { if (r <= 0.2) return; const [a, b] = P(x, y, z); ctx.fillStyle = col; ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill(); }
  function ring(x, y, r, col, lw = 1, z, dash, off = 0) {
    if (r <= 0.2) return; const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = lw;
    if (dash) { ctx.setLineDash(dash); ctx.lineDashOffset = off; }
    ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.stroke(); if (dash) ctx.setLineDash([]);
  }
  function arc(x, y, r, a0, a1, col, lw = 1, z) { if (r <= 0.2) return; const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(a, b, r, a0, a1); ctx.stroke(); }
  function ell(x, y, rx, ry, rot, col, z, stroke) {
    const [a, b] = P(x, y, z); ctx.beginPath(); ctx.ellipse(a, b, Math.max(0.01, rx), Math.max(0.01, ry), rot, 0, TAU);
    if (stroke) { ctx.strokeStyle = col; ctx.lineWidth = stroke; ctx.stroke(); } else { ctx.fillStyle = col; ctx.fill(); }
  }
  function rect(x, y, w, h, col, z, rot = 0) {
    if (w <= 0 || h <= 0) return; const [a, b] = P(x + w / 2, y + h / 2, z);
    ctx.save(); ctx.translate(a, b); if (rot) ctx.rotate(rot); ctx.fillStyle = col; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  }
  // 色がなめらかに変わる四角（stops は色の並び。vert が true なら縦方向）
  function grect(x, y, w, h, stops, z, rot = 0, vert) {
    if (w <= 0 || h <= 0) return; const [a, b] = P(x + w / 2, y + h / 2, z);
    ctx.save(); ctx.translate(a, b); if (rot) ctx.rotate(rot);
    const g = vert ? ctx.createLinearGradient(0, -h / 2, 0, h / 2) : ctx.createLinearGradient(-w / 2, 0, w / 2, 0);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  }
  function split(x, y, r, rot, c1, c2, z) {   // 2色にわかれた円
    if (r <= 0.2) return; const [a, b] = P(x, y, z);
    ctx.save(); ctx.translate(a, b); ctx.rotate(rot);
    ctx.fillStyle = c1; ctx.beginPath(); ctx.arc(0, 0, r, 0, TAU); ctx.fill();
    ctx.fillStyle = c2; ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function pie(x, y, r, secs, rot, z) {       // 円グラフ。secs: [[割合, 色, 大きさ(0〜1)], ...]
    const [a, b] = P(x, y, z); let ang = rot;
    secs.forEach(([f, col, k]) => { const rr = r * (k === undefined ? 1 : k); if (rr > 0.2) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a, b); ctx.arc(a, b, rr, ang, ang + f * TAU); ctx.closePath(); ctx.fill(); } ang += f * TAU; });
  }
  function fan(x, y, secs, rot, z) {          // 扇。secs: [[角度(ラジアン), 半径, 色], ...]
    const [a, b] = P(x, y, z); let ang = rot;
    secs.forEach(([d, r, col]) => { if (r > 0.2 && d > 0) { ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(a, b); ctx.arc(a, b, r, ang, ang + d); ctx.closePath(); ctx.fill(); } ang += d; });
  }
  function hair(x, y, len, n, spread, rot, col, z) {   // 1点から広がる細い線
    if (len <= 0.5) return; const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) { const g = rot + (i / Math.max(1, n - 1) - 0.5) * spread; ctx.moveTo(a, b); ctx.lineTo(a + Math.cos(g) * len, b + Math.sin(g) * len); }
    ctx.stroke();
  }
  function star(x, y, r, n, inner, rot, col, z) {      // とげの数 n の星
    if (r <= 0.3) return; const [a, b] = P(x, y, z); ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const g = rot + (i * Math.PI) / n, rr = i % 2 ? r * inner : r; ctx.lineTo(a + Math.cos(g) * rr, b + Math.sin(g) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function star8(x, y, r, rot, col, z) {      // 細い棒の「＊」
    if (r <= 0.3) return; const [a, b] = P(x, y, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot); ctx.fillStyle = col;
    for (let i = 0; i < 4; i++) { if (i) ctx.rotate(Math.PI / 4); ctx.fillRect(-r, -r * 0.08, r * 2, r * 0.16); }
    ctx.restore();
  }
  function plus(x, y, r, col, lw = 1.5, z) { const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath(); ctx.moveTo(a - r, b); ctx.lineTo(a + r, b); ctx.moveTo(a, b - r); ctx.lineTo(a, b + r); ctx.stroke(); }
  function tri(x, y, r, rot, col, z, sx = 1) {
    if (r <= 0.3) return; const [a, b] = P(x, y, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot); ctx.scale(sx, 1); ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i < 3; i++) { const g = (i / 3) * TAU - Math.PI / 2; ctx.lineTo(Math.cos(g) * r, Math.sin(g) * r); } ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function poly(pts, col, z) { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = P(x, y, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.closePath(); ctx.fill(); }
  function holo(x, y, w, h, rot, t, z) {      // 虹色に光る板
    if (w <= 0 || h <= 0) return; const [a, b] = P(x + w / 2, y + h / 2, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot);
    const g0 = t * 0.7, dx = Math.cos(g0) * w * 0.5, dy = Math.sin(g0) * h * 0.5, g = ctx.createLinearGradient(-dx, -dy, dx, dy);
    g.addColorStop(0, G.PAL.cyan); g.addColorStop(0.35, G.PAL.blue); g.addColorStop(0.62, G.PAL.pink); g.addColorStop(1, G.PAL.white);
    ctx.fillStyle = g; ctx.fillRect(-w / 2, -h / 2, w, h); ctx.restore();
  }
  function sphere(x, y, r, c1, c2, z) {       // 光が当たった玉
    if (r <= 0.3) return; const [a, b] = P(x, y, z), g = ctx.createRadialGradient(a - r * 0.3, b - r * 0.35, r * 0.08, a, b, r);
    g.addColorStop(0, c1); g.addColorStop(1, c2); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(a, b, r, 0, TAU); ctx.fill();
  }
  function blob(x, y, r, t, col, z, lobes = 4, amp = 0.1) {   // ぐにゃぐにゃ動く形
    if (r <= 0.3) return; const [a, b] = P(x, y, z); ctx.fillStyle = col; ctx.beginPath();
    for (let i = 0; i <= 64; i++) { const g = (i / 64) * TAU, rr = r * (1 + amp * Math.sin(lobes * g + t * 1.5) + amp * 0.5 * Math.sin((lobes + 3) * g - t)); i ? ctx.lineTo(a + Math.cos(g) * rr, b + Math.sin(g) * rr) : ctx.moveTo(a + Math.cos(g) * rr, b + Math.sin(g) * rr); }
    ctx.closePath(); ctx.fill();
  }
  function ticks(x, y, r, n, len, rot, col, z, every = 6) {   // 目盛りの輪
    if (r <= 0.5) return; const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 0; i < n; i++) { const g = rot + (i / n) * TAU, l = i % every ? len : len * 2.2; ctx.moveTo(a + Math.cos(g) * r, b + Math.sin(g) * r); ctx.lineTo(a + Math.cos(g) * (r + l), b + Math.sin(g) * (r + l)); }
    ctx.stroke();
  }
  function squiggle(x, y, w, amp, n, t, col, lw = 1.5, z) {   // 波の線
    const [a, b] = P(x, y, z); ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let i = 0; i <= 60; i++) { const q = i / 60, yy = b + Math.sin(q * n * TAU + t) * amp; i ? ctx.lineTo(a + q * w, yy) : ctx.moveTo(a, yy); }
    ctx.stroke();
  }
  function bars(x, y, n, bw, bh, t, col, z) {  // イコライザーのような棒
    const [a, b] = P(x, y, z); ctx.fillStyle = col;
    for (let i = 0; i < n; i++) { const h = bh * (0.25 + 0.75 * Math.abs(Math.sin(t * (1.7 + i * 0.37) + i * 1.3))); ctx.fillRect(a + i * bw * 1.6, b - h, bw, h); }
  }
  // 画面いっぱいの点の模様（sx, sy で流れる）
  function dots(col, gap, r, sx, sy, z = -0.3) {
    const [ox, oy] = P(0, 0, z), x0 = ((ox + sx) % gap + gap) % gap, y0 = ((oy + sy) % gap + gap) % gap; ctx.fillStyle = col;
    for (let gx = x0 - gap; gx < G.W + gap; gx += gap) for (let gy = y0 - gap; gy < G.H; gy += gap) ctx.fillRect(gx - r, gy - r, r * 2, r * 2);
  }
  // 画面いっぱいの線の模様（dir: 'v' 縦線 / 'h' 横線）
  function grid(gap, col, off, dir, z = -0.3) {
    const [ox, oy] = P(0, 0, z); ctx.fillStyle = col;
    if (dir === 'h') { const y0 = ((oy + off) % gap + gap) % gap; for (let y = y0 - gap; y < G.H; y += gap) ctx.fillRect(-G.W, y, G.W * 3, 1); }
    else { const x0 = ((ox + off) % gap + gap) % gap; for (let x = x0 - gap; x < G.W + gap; x += gap) ctx.fillRect(x, -G.H, 1, G.H * 3); }
  }
  function hatch(pts, gap, off, col, lw = 1, z) {    // 斜めのしま模様（多角形の中だけ）
    ctx.save(); ctx.beginPath(); pts.forEach(([x, y], i) => { const [a, b] = P(x, y, z); i ? ctx.lineTo(a, b) : ctx.moveTo(a, b); }); ctx.closePath(); ctx.clip();
    ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.beginPath();
    for (let k = -G.H + (off % gap); k < G.W + gap; k += gap) { ctx.moveTo(k, 0); ctx.lineTo(k + G.H, G.H); } ctx.stroke(); ctx.restore();
  }
  // 網点（f(列の割合, 行の割合) が 0〜1 の大きさを返す）
  function halftone(x, y, w, h, gap, col, f, z) {
    const [a, b] = P(x, y, z); ctx.fillStyle = col;
    for (let i = 0; i * gap <= w; i++) for (let j = 0; j * gap <= h; j++) { const r = f(i * gap / w, j * gap / h) * gap * 0.48; if (r > 0.3) { ctx.beginPath(); ctx.arc(a + i * gap, b + j * gap, r, 0, TAU); ctx.fill(); } }
  }
  function label(text, x, y, col, size = 9, align = 'left', z) {
    const [a, b] = z === undefined ? [x, y] : P(x, y, z);
    ctx.fillStyle = col; ctx.font = `600 ${size}px ${MONO}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.4px'; ctx.fillText(text, a, b);
  }
  // 引き出し線つきの小さなラベル
  function tag(x, y, dx, dy, text, col, z = 0.8) {
    const [a, b] = P(x, y, z); ctx.fillStyle = col; ctx.fillRect(a - 1.5, b - 1.5, 3, 3);
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + dx, b + dy); ctx.lineTo(a + dx + (dx < 0 ? -8 : 8), b + dy); ctx.stroke();
    label(text, a + dx + (dx < 0 ? -11 : 11), b + dy, col, 8, dx < 0 ? 'right' : 'left');
  }
  function otext(text, x, y, size, col, rot = 0, z) {  // ふち取りの文字
    const [a, b] = P(x, y, z); ctx.save(); ctx.translate(a, b); ctx.rotate(rot); ctx.font = `700 ${size}px "Space Grotesk", Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.strokeText(text, 0, 0); ctx.restore();
  }

  return { P, disc, ring, arc, ell, rect, grect, split, pie, fan, hair, star, star8, plus, tri, poly, holo, sphere, blob, ticks, squiggle, bars, dots, grid, hatch, halftone, label, tag, otext };
};
