// hero-parts.js — 入場画面の「3Dの部品」（hero.js が使います）
// 板・円盤・コイン・箱・玉・ばね・波線・枠・文字などを、3Dの空間に置いて、カメラから見た形で描きます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts');

window.OC_HERO_PARTS = function (G) {
  const ctx = G.ctx, TAU = Math.PI * 2, N = 72;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const LIGHT = (() => { const l = [-0.5, 0.8, 0.6], n = Math.hypot(...l); return l.map((v) => v / n); })();

  // ---------- 平らな形（中心から見た72方向の長さ。どの形からどの形へも変形できる） ----------
  const ang = (i) => -Math.PI / 2 + (i / N) * TAU;
  function fromPoly(v) {
    const out = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const dx = Math.cos(ang(i)), dy = Math.sin(ang(i)); let best = 0;
      for (let k = 0; k < v.length; k++) {
        const [px, py] = v[k], [qx, qy] = v[(k + 1) % v.length], ex = qx - px, ey = qy - py, den = dx * ey - dy * ex;
        if (Math.abs(den) < 1e-9) continue;
        const t = (px * ey - py * ex) / den, s = (px * dy - py * dx) / den;
        if (t > 0 && s >= -1e-6 && s <= 1 + 1e-6) best = Math.max(best, t);
      }
      out[i] = best;
    }
    return out;
  }
  const fromFn = (f) => { const o = new Float32Array(N); for (let i = 0; i < N; i++) o[i] = f(ang(i)); return o; };
  const reg = (n, r) => Array.from({ length: n }, (_, k) => [Math.cos(-Math.PI / 2 + (k / n) * TAU) * r, Math.sin(-Math.PI / 2 + (k / n) * TAU) * r]);
  const starV = (n, r1, r2) => Array.from({ length: n * 2 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / n, r = k % 2 ? r2 : r1; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const arcV = (a0, a1, r, ox, oy, n = 24) => Array.from({ length: n + 1 }, (_, k) => { const a = a0 + ((a1 - a0) * k) / n; return [ox + Math.cos(a) * r, oy + Math.sin(a) * r]; });
  const SHAPES = {
    circle: fromFn(() => 1),
    square: fromPoly([[-1, -1], [1, -1], [1, 1], [-1, 1]]),
    tri: fromPoly(reg(3, 1.15)),
    diamond: fromPoly(reg(4, 1.1)),
    half: fromPoly(arcV(Math.PI, TAU, 1.15, 0, 0.49)),
    quarter: fromPoly([[-0.64, -0.64]].concat(arcV(0, Math.PI / 2, 1.5, -0.64, -0.64))),
    lens: fromPoly(arcV(-Math.PI / 3, Math.PI / 3, 1.3, -0.65, 0).concat(arcV((2 * Math.PI) / 3, (4 * Math.PI) / 3, 1.3, 0.65, 0))),
    spark: fromPoly(starV(4, 1.25, 0.32)),
    sun: fromPoly(starV(14, 1.05, 0.82)),
    wedge: fromPoly([[-1.3, 0.35], [1, -0.6], [1, 0.35]])
  };

  // ---------- 回転（Y → X → Z の順）から、物体の向きの3本の軸を作る ----------
  function basis(r) {
    const [x, y, z] = r, cx = Math.cos(x), sx = Math.sin(x), cy = Math.cos(y), sy = Math.sin(y), cz = Math.cos(z), sz = Math.sin(z);
    const f = (v) => { const a = [v[0], v[1] * cx - v[2] * sx, v[1] * sx + v[2] * cx]; return [a[0] * cy + a[2] * sy, a[1], -a[0] * sy + a[2] * cy]; };
    return [f([cz, sz, 0]), f([-sz, cz, 0]), f([0, 0, 1])];
  }
  const W3 = (o, B, x, y, z) => [o.p[0] + o.s * (x * B[0][0] + y * B[1][0] + z * B[2][0]), o.p[1] + o.s * (x * B[0][1] + y * B[1][1] + z * B[2][1]), o.p[2] + o.s * (x * B[0][2] + y * B[1][2] + z * B[2][2])];

  // ---------- 色・塗り ----------
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const shade = (c, k) => { if (c[0] !== '#') return c; const [r, g, b] = hex(c); return `rgb(${Math.min(255, r * k) | 0},${Math.min(255, g * k) | 0},${Math.min(255, b * k) | 0})`; };
  const col = (c) => G.PAL[c] || c;
  // 物体の面の上の2点（ローカル座標）を、画面のグラデーションにする
  function gradOn(o, B, stops, a, R) {
    const p0 = G.proj(W3(o, B, -Math.cos(a) * R, -Math.sin(a) * R, 0)), p1 = G.proj(W3(o, B, Math.cos(a) * R, Math.sin(a) * R, 0));
    const g = ctx.createLinearGradient(p0[0], p0[1], p1[0], p1[1]);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), col(c)));
    return g;
  }
  const HOLO = ['cyan', 'blue', 'pink', 'white'];
  function path(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); }
  // 色収差（ふちが、水色と桃色に少しずれる）つきで塗る
  function fillCA(pts, style, ca = 1) {
    if (G.CA && ca) {
      ctx.save(); path(pts); ctx.translate(G.CA, 0); ctx.fillStyle = 'rgba(0,225,255,.5)'; ctx.fill();
      ctx.translate(-G.CA * 2, 0); ctx.fillStyle = 'rgba(255,40,150,.5)'; ctx.fill(); ctx.restore();
    }
    path(pts); ctx.fillStyle = style; ctx.fill();
  }
  const visible = (pts) => pts.every((q) => q[2] > 0.3);

  // ---------- 1) 平らな形（板） ----------
  // o: { p, r, s, shape(配列), w, sx, sy, c, g(グラデの色), ga(グラデの向き), holo, stripes(色), split(色), sa, ring, ext(厚み), alpha }
  function flat(o, t) {
    const B = basis(o.r), R = o.w, pts = [], c0 = G.proj(o.p);
    const st = (G.f * o.s * R * Math.max(o.sx, o.sy)) / Math.max(c0[2], 0.3) < 40 ? 3 : 1;   // 小さく写るときは、点を減らして軽くする
    for (let i = 0; i < N; i += st) { const a = ang(i), r = o.shape[i] * R; pts.push(G.proj(W3(o, B, Math.cos(a) * r * o.sx, Math.sin(a) * r * o.sy, 0))); }
    if (!visible(pts)) return;
    const alpha = o.alpha === undefined ? 1 : o.alpha; ctx.globalAlpha = alpha;
    if (o.ring) { path(pts); ctx.strokeStyle = col(o.c); ctx.lineWidth = Math.max(1, o.ring); ctx.stroke(); ctx.globalAlpha = 1; return; }
    if (o.ext > 0.01) {   // 厚み（うしろに、濃い色の板を重ねる）
      for (let k = 4; k >= 1; k--) {
        const q = []; for (let i = 0; i < N; i += 2) { const a = ang(i), r = o.shape[i] * R; q.push(G.proj(W3(o, B, Math.cos(a) * r * o.sx, Math.sin(a) * r * o.sy, -o.ext * k * 0.06))); }
        path(q); ctx.fillStyle = shade(col(o.c2 || o.c), 0.55); ctx.fill();
      }
    }
    const style = o.holo ? gradOn(o, B, HOLO, o.ga + t * 0.4, R) : o.g ? gradOn(o, B, o.g, o.ga, R * Math.max(o.sx, o.sy)) : col(o.c);
    fillCA(pts, style, alpha > 0.6);
    if (o.stripes || o.split) {
      ctx.save(); path(pts); ctx.clip();
      if (o.split) { const a = o.sa, L = R * 3; fillCA([[-L, 0], [L, 0], [L, L], [-L, L]].map(([x, y]) => G.proj(W3(o, B, x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), 0))), col(o.split), 0); }
      if (o.stripes) {
        ctx.strokeStyle = col(o.stripes); ctx.lineWidth = Math.max(1, (G.f * o.s * R * 0.05) / Math.max(1, pts[0][2])); ctx.beginPath();
        const gap = 0.16, L = R * 2.4, off = (t * 0.25) % gap;
        for (let y = -L + off; y < L; y += gap) { const a = G.proj(W3(o, B, -L, y * R, 0)), b = G.proj(W3(o, B, L, y * R + L * 0.6, 0)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
        ctx.stroke();
      }
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 2) コイン（厚みのある円盤） ----------
  function hull(P) {
    P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of P) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = P.length - 1; i >= 0; i--) { const p = P[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  }
  function coin(o, t) {
    const B = basis(o.r), R = o.w, d = o.d / 2, a = [], b = [];
    for (let i = 0; i < 48; i++) { const q = (i / 48) * TAU, x = Math.cos(q) * R, y = Math.sin(q) * R; a.push(G.proj(W3(o, B, x, y, d))); b.push(G.proj(W3(o, B, x, y, -d))); }
    if (!visible(a) || !visible(b)) return;
    fillCA(hull(a.concat(b)), shade(col(o.c2 || o.c), 0.62));
    const front = dot(B[2], sub(G.camPos, o.p)) > 0 ? a : b;
    const style = o.holo ? gradOn(o, B, HOLO, t, R) : o.g ? gradOn(o, B, o.g, o.ga, R) : col(o.c);
    fillCA(front, style, 0);
    if (o.bull) {   // 同心円の模様
      for (let k = 3; k >= 1; k--) { const q = []; for (let i = 0; i < 48; i++) { const z = (i / 48) * TAU; q.push(G.proj(W3(o, B, Math.cos(z) * R * k * 0.25, Math.sin(z) * R * k * 0.25, front === a ? d : -d))); } path(q); ctx.fillStyle = col(k % 2 ? o.bull : o.c); ctx.fill(); }
    }
  }

  // ---------- 3) 箱 ----------
  function box(o) {
    const B = basis(o.r), [w, h, d] = [o.bw / 2, o.bh / 2, o.bd / 2];
    const F = [[[0, 0, 1], [[-w, -h, d], [w, -h, d], [w, h, d], [-w, h, d]], 'front'], [[0, 0, -1], [[w, -h, -d], [-w, -h, -d], [-w, h, -d], [w, h, -d]], 'front'],
      [[1, 0, 0], [[w, -h, d], [w, -h, -d], [w, h, -d], [w, h, d]], 'side'], [[-1, 0, 0], [[-w, -h, -d], [-w, -h, d], [-w, h, d], [-w, h, -d]], 'side'],
      [[0, 1, 0], [[-w, h, d], [w, h, d], [w, h, -d], [-w, h, -d]], 'top'], [[0, -1, 0], [[-w, -h, -d], [w, -h, -d], [w, -h, d], [-w, -h, d]], 'top']];
    F.forEach(([n, q, kind]) => {
      const nw = [n[0] * B[0][0] + n[1] * B[1][0] + n[2] * B[2][0], n[0] * B[0][1] + n[1] * B[1][1] + n[2] * B[2][1], n[0] * B[0][2] + n[1] * B[1][2] + n[2] * B[2][2]];
      const c = W3(o, B, (q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, (q[0][2] + q[2][2]) / 2);
      if (dot(nw, sub(G.camPos, c)) <= 0) return;
      const pts = q.map(([x, y, z]) => G.proj(W3(o, B, x, y, z))); if (!visible(pts)) return;
      const base = col(o[kind] || o.c), light = 0.72 + 0.32 * Math.max(0, dot(nw, LIGHT));
      let style = shade(base, light);
      if (o.g && kind === 'front') { const a = G.proj(W3(o, B, 0, h, d * Math.sign(n[2] || 1))), b = G.proj(W3(o, B, 0, -h, d * Math.sign(n[2] || 1))); style = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); o.g.forEach((cc, i) => style.addColorStop(i / (o.g.length - 1), col(cc))); }
      if (o.holo && kind === 'top') { const a = pts[0], b = pts[2]; style = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); HOLO.forEach((cc, i) => style.addColorStop(i / 3, col(cc))); }
      fillCA(pts, style);
    });
  }

  // ---------- 4) 玉（銀色 / ガラス / グラデーション） ----------
  function sphere(o) {
    const c = G.proj(o.p); if (c[2] < 0.3) return;
    const R = (G.f * o.s * o.w) / c[2]; if (R < 0.5) return;
    if (o.glass) {   // ピントの外れたガラス玉
      const g = ctx.createRadialGradient(c[0] - R * 0.2, c[1] - R * 0.25, R * 0.1, c[0], c[1], R);
      g.addColorStop(0, 'rgba(255,255,255,.28)'); g.addColorStop(0.75, 'rgba(255,255,255,.14)'); g.addColorStop(0.97, 'rgba(255,255,255,.3)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.fill(); return;
    }
    if (G.CA) { ctx.fillStyle = 'rgba(0,225,255,.45)'; ctx.beginPath(); ctx.arc(c[0] + G.CA, c[1], R, 0, TAU); ctx.fill(); ctx.fillStyle = 'rgba(255,40,150,.45)'; ctx.beginPath(); ctx.arc(c[0] - G.CA, c[1], R, 0, TAU); ctx.fill(); }
    const g = ctx.createRadialGradient(c[0] - R * 0.35, c[1] - R * 0.4, R * 0.05, c[0], c[1] + R * 0.1, R * 1.05);
    (o.g || ['white', '#bdbdbd', '#3a3a3a', '#111111']).forEach((cc, i, arr) => g.addColorStop(i / (arr.length - 1), col(cc)));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.fill();
  }

  // ---------- 5) 線でできたもの（ばね・波線・枠・放射線・輪・点の並び） ----------
  function strokeLoc(o, B, list, c, lw, closed) {
    const pts = list.map(([x, y, z]) => G.proj(W3(o, B, x, y, z))); if (!visible(pts)) return;
    ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (closed) ctx.closePath();
    ctx.strokeStyle = col(c); ctx.lineWidth = lw; ctx.stroke();
  }
  function lines(o, t) {
    const B = basis(o.r); ctx.globalAlpha = o.alpha === undefined ? 0.9 : o.alpha;
    if (o.kind === 'spring') for (let k = 0; k < o.n; k++) { const z = -o.L / 2 + (k / (o.n - 1)) * o.L, wob = 1 + 0.06 * Math.sin(t * 3 + k * 0.6); strokeLoc(o, B, Array.from({ length: 40 }, (_, i) => [Math.cos((i / 40) * TAU) * o.w * wob, Math.sin((i / 40) * TAU) * o.w * wob, z]), o.c, 1, true); }
    if (o.kind === 'wave') for (let k = 0; k < o.n; k++) { const y = -o.h / 2 + (k / (o.n - 1)) * o.h; strokeLoc(o, B, Array.from({ length: 33 }, (_, i) => { const x = -o.w / 2 + (i / 32) * o.w, env = Math.sin((i / 32) * Math.PI); return [x, y, o.amp * env * Math.sin(x * 2.4 + t * 3 + k * 0.28)]; }), o.c, 1, false); }
    if (o.kind === 'frames') for (let k = 0; k < o.n; k++) { const e = k * 0.12, w = o.w / 2, h = o.h / 2; strokeLoc(o, B, [[-w - e, -h + e, -e], [w - e, -h + e, -e], [w - e, h + e, -e], [-w - e, h + e, -e]], o.c, 1.1, true); }
    if (o.kind === 'burst') for (let k = 0; k < o.n; k++) { const a = o.a0 + (k / Math.max(1, o.n - (o.spread >= TAU - 0.01 ? 0 : 1)) - (o.spread >= TAU - 0.01 ? 0 : 0.5)) * o.spread; strokeLoc(o, B, [[0, 0, 0], [Math.cos(a) * o.w, Math.sin(a) * o.w, 0]], o.c, 1, false); }
    if (o.kind === 'ring') strokeLoc(o, B, Array.from({ length: 64 }, (_, i) => [Math.cos((i / 64) * TAU) * o.w, Math.sin((i / 64) * TAU) * o.w, 0]), o.c, o.lw || 1.2, true);
    if (o.kind === 'dots') {
      ctx.fillStyle = col(o.c);
      for (let i = 0; i < o.nx; i++) for (let j = 0; j < o.ny; j++) {
        const q = G.proj(W3(o, B, (i - (o.nx - 1) / 2) * o.gap, (j - (o.ny - 1) / 2) * o.gap + (o.wave ? Math.sin(t * 2 + i * 0.7) * o.wave : 0), 0)); if (q[2] < 0.3) continue;
        const r = Math.max(0.8, (G.f * o.s * o.dot) / q[2]); ctx.fillRect(q[0] - r, q[1] - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 6) 棒が交差した「＊」 ----------
  function asterisk(o) {
    const B = basis(o.r);
    for (let k = 0; k < 4; k++) {
      const a = (k * Math.PI) / 4, c = Math.cos(a), s = Math.sin(a), L = o.w, T = o.w * 0.13;
      const pts = [[-L, -T], [L, -T], [L, T], [-L, T]].map(([x, y]) => G.proj(W3(o, B, x * c - y * s, x * s + y * c, 0))); if (!visible(pts)) return;
      fillCA(pts, o.g ? gradOn(o, B, o.g, a, L) : col(o.c), k === 0);
    }
  }

  // ---------- 7) 板の上の文字（ふち取り） ----------
  function text(o) {
    const B = basis(o.r), p0 = G.proj(o.p), px = G.proj(W3(o, B, 1, 0, 0)), py = G.proj(W3(o, B, 0, 1, 0)); if (p0[2] < 0.3) return;
    const k = 0.01;   // 文字は100pxで描いて、1/100に縮める
    ctx.save(); ctx.setTransform(G.dpr * (px[0] - p0[0]) * k, G.dpr * (px[1] - p0[1]) * k, -G.dpr * (py[0] - p0[0]) * k, -G.dpr * (py[1] - p0[1]) * k, G.dpr * p0[0], G.dpr * p0[1]);
    ctx.font = '700 100px "Space Grotesk", "Hiragino Sans", "Noto Sans JP", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    const sc = Math.hypot(px[0] - p0[0], px[1] - p0[1]) * k || 1;
    ctx.globalAlpha = o.alpha === undefined ? 0.85 : o.alpha; ctx.strokeStyle = col(o.c); ctx.lineWidth = 1 / sc; ctx.strokeText(o.str, 0, 0);
    ctx.restore();
  }

  // ---------- 8) 流れる色の帯（グリッチ） ----------
  function strip(o, t) {
    const B = basis(o.r), W = o.w, H = o.h, L = o.segs.reduce((a, q) => a + q[0], 0), off = (((t * o.sp) % L) + L) % L;
    let x = -W / 2 - off;
    while (x < W / 2) for (const [w, c] of o.segs) {
      const x0 = Math.max(x, -W / 2), x1 = Math.min(x + w, W / 2);
      if (x1 > x0) {
        const pts = [[x0, -H / 2], [x1, -H / 2], [x1, H / 2], [x0, H / 2]].map(([a, b]) => G.proj(W3(o, B, a, b, 0)));
        if (visible(pts)) {
          let style;
          if (Array.isArray(c)) { style = ctx.createLinearGradient(pts[0][0], pts[0][1], pts[1][0], pts[1][1]); c.forEach((cc, i) => style.addColorStop(i / (c.length - 1), col(cc))); }
          else style = col(c);
          fillCA(pts, style, 0);
        }
      }
      x += w; if (x >= W / 2) break;
    }
  }

  // ---------- 小さな部品 ----------
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  function label(textS, x, y, c, size = 9, align = 'left') {
    ctx.fillStyle = c; ctx.font = `600 ${size}px ${MONO}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.4px'; ctx.fillText(textS, x, y);
  }

  return { N, SHAPES, basis, W3, flat, coin, box, sphere, lines, asterisk, text, strip, label, hex, col, fillCA, shade, gradOn, fromPoly, fromFn, LIGHT, HOLO, path };   // 後ろの方は hero-parts2.js が使う道具
};
