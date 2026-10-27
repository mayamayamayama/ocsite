// hero-parts3.js — 入場画面の「3Dの部品」のさらに追加分（空・ゲーム・創作・インダストリアルのバージョンで使います）
// 歯車・ドット絵・立体の文字・もこもこの玉（雲や煙）。hero-parts.js の次に読み込みます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts3');

window.OC_HERO_PARTS3 = function (G, T) {
  const ctx = G.ctx, TAU = Math.PI * 2;
  const { basis, W3, shade, col } = T;
  const vis = (pts) => pts.every((q) => q[2] > 0.3);
  const al = (o) => (o.alpha === undefined ? 1 : o.alpha);
  // 穴のあいた形も塗れる（色収差つき）
  function fillE(paths, style, ca) {
    const draw = () => { ctx.beginPath(); paths.forEach((P) => { ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); }); };
    if (G.CA && ca) { ctx.save(); ctx.translate(G.CA, 0); draw(); ctx.fillStyle = 'rgba(0,225,255,.5)'; ctx.fill('evenodd'); ctx.translate(-2 * G.CA, 0); draw(); ctx.fillStyle = 'rgba(255,40,150,.5)'; ctx.fill('evenodd'); ctx.restore(); }
    draw(); ctx.fillStyle = style; ctx.fill('evenodd');
  }

  // ---------- 1) 歯車（w：外の半径、n：歯の数、dp：歯の深さ、hole：真ん中の穴、hub：軸の色、ext：厚み） ----------
  function gear(o) {
    const B = basis(o.r), n = Math.max(3, Math.round(o.n || 12)), R = o.w, r0 = R * (1 - (o.dp || 0.16)), loc = [];
    for (let k = 0; k < n; k++) { const a = (k / n) * TAU, h = TAU / n; [[0, r0], [0.2, r0], [0.3, R], [0.52, R], [0.62, r0]].forEach(([f, rr]) => loc.push([Math.cos(a + f * h) * rr, Math.sin(a + f * h) * rr])); }
    const ring = (r, z) => Array.from({ length: 28 }, (_, i) => G.proj(W3(o, B, Math.cos((i / 28) * TAU) * r, Math.sin((i / 28) * TAU) * r, z)));
    const P = (z) => loc.map(([x, y]) => G.proj(W3(o, B, x, y, z)));
    const front = P(0); if (!vis(front)) return;
    ctx.globalAlpha = al(o);
    if (o.ext > 0.01) for (let k = 3; k >= 1; k--) { const z = -o.ext * k * 0.06; fillE(o.hole ? [P(z), ring(R * o.hole, z)] : [P(z)], shade(col(o.c2 || o.c), 0.55), 0); }
    fillE(o.hole ? [front, ring(R * o.hole, 0)] : [front], col(o.c), al(o) > 0.6);
    if (o.hub) { fillE([ring(R * 0.42, 0.001), ring(R * (o.hole || 0.2) * 1.0001, 0.001)], col(o.hub), 0); }
    ctx.globalAlpha = 1;
  }

  // ---------- 2) ドット絵（bits：文字の行。pal：文字と色の対応。'.' は透明。w：横の幅。ext：厚み） ----------
  function pixel(o) {
    const B = basis(o.r), rows = o.bits || ['x'], nr = rows.length, nc = rows[0].length, cs = o.w / nc, x0 = -o.w / 2, y0 = (nr * cs) / 2, pal = o.pal || {};
    const grid = (z) => { const g = []; for (let j = 0; j <= nr; j++) { g.push([]); for (let i = 0; i <= nc; i++) g[j].push(G.proj(W3(o, B, x0 + i * cs, y0 - j * cs, z))); } return g; };
    const gp = grid(0); if (!vis([gp[0][0], gp[nr][nc], gp[0][nc], gp[nr][0]])) return;
    const byC = {};
    rows.forEach((row, j) => { for (let i = 0; i < nc; i++) { const ch = row[i]; if (ch !== '.' && ch !== ' ') (byC[ch] = byC[ch] || []).push([i, j]); } });
    const quads = (g, list) => { list.forEach(([i, j]) => { const a = g[j][i], b = g[j][i + 1], c = g[j + 1][i + 1], d = g[j + 1][i]; ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.closePath(); }); };
    ctx.globalAlpha = al(o);
    if (o.ext) { const gb = grid(-o.ext); ctx.beginPath(); Object.keys(byC).forEach((ch) => quads(gb, byC[ch])); ctx.fillStyle = col(o.c2 || '#0b1026'); ctx.fill(); }
    Object.keys(byC).forEach((ch) => { ctx.beginPath(); quads(gp, byC[ch]); ctx.fillStyle = col(pal[ch] || ch); ctx.fill(); });
    ctx.globalAlpha = 1;
  }

  // ---------- 3) 立体の文字（str：文字、s：高さ、ext：奥行き、c：表の色、c2：側面の色） ----------
  function type(o) {
    const B = basis(o.r), L = o.ext ? 7 : 1;
    ctx.save(); ctx.globalAlpha = al(o);
    ctx.font = o.font || '700 100px "Space Grotesk", "Hiragino Sans", "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    for (let k = L - 1; k >= 0; k--) {
      const z = -(k / Math.max(1, L - 1)) * (o.ext || 0), p0 = G.proj(W3(o, B, 0, 0, z)), px = G.proj(W3(o, B, 1, 0, z)), py = G.proj(W3(o, B, 0, 1, z)); if (p0[2] < 0.3) continue;
      const q = 0.01; ctx.setTransform(G.dpr * (px[0] - p0[0]) * q, G.dpr * (px[1] - p0[1]) * q, -G.dpr * (py[0] - p0[0]) * q, -G.dpr * (py[1] - p0[1]) * q, G.dpr * p0[0], G.dpr * p0[1]);
      ctx.fillStyle = k ? shade(col(o.c2 || o.c), 0.55 + 0.25 * (1 - k / L)) : col(o.c); ctx.fillText(o.str, 0, 0);
    }
    ctx.restore();
  }

  // ---------- 4) もこもこの玉（雲・煙。w：半径、c：色、c2：かげの色、alpha） ----------
  function puff(o) {
    const c = G.proj(o.p); if (c[2] < 0.3) return;
    const R = (G.f * o.s * o.w) / c[2]; if (R < 0.5) return;
    const g = ctx.createRadialGradient(c[0] - R * 0.3, c[1] - R * 0.35, R * 0.1, c[0], c[1], R);
    g.addColorStop(0, col(o.hl || 'white')); g.addColorStop(0.55, col(o.c || 'white')); g.addColorStop(1, col(o.c2 || o.c || 'white'));
    ctx.globalAlpha = al(o); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.fill(); ctx.globalAlpha = 1;
  }

  return { gear, pixel, type, puff };
};
