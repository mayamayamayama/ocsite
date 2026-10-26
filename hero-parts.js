// hero-parts.js — 入場画面の「形」と「塗り方」の部品（hero.js が使います）
// どの形も、中心から見た96方向の長さとして持っているので、どの形からどの形へも、なめらかに変形できます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts');

window.OC_HERO_PARTS = function (G) {
  const ctx = G.ctx, TAU = Math.PI * 2, N = 96;
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  // ---------- 形のライブラリ ----------
  const ang = (i) => -Math.PI / 2 + (i / N) * TAU;
  function fromPoly(v) {   // 多角形 → 96方向の長さ
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
  const fromFn = (f) => { const out = new Float32Array(N); for (let i = 0; i < N; i++) out[i] = f(ang(i)); return out; };
  const reg = (n, r, off = -Math.PI / 2) => Array.from({ length: n }, (_, k) => [Math.cos(off + (k / n) * TAU) * r, Math.sin(off + (k / n) * TAU) * r]);
  const starV = (n, r1, r2) => Array.from({ length: n * 2 }, (_, k) => { const a = -Math.PI / 2 + (k * Math.PI) / n, r = k % 2 ? r2 : r1; return [Math.cos(a) * r, Math.sin(a) * r]; });
  const half = (() => { const v = []; for (let k = 0; k <= 32; k++) { const a = Math.PI + (k / 32) * Math.PI; v.push([Math.cos(a) * 1.15, Math.sin(a) * 1.15 + 0.49]); } return v; })();
  const w = 0.34, cross = [[-w, -1], [w, -1], [w, -w], [1, -w], [1, w], [w, w], [w, 1], [-w, 1], [-w, w], [-1, w], [-1, -w], [-w, -w]];
  const SHAPES = {
    circle: fromFn(() => 1),
    square: fromPoly([[-0.88, -0.88], [0.88, -0.88], [0.88, 0.88], [-0.88, 0.88]]),
    tri: fromPoly(reg(3, 1.15)),
    diamond: fromPoly(reg(4, 1.08)),
    hex: fromPoly(reg(6, 1)),
    star: fromPoly(starV(5, 1.18, 0.5)),
    burst: fromPoly(starV(12, 1.08, 0.78)),
    spark: fromPoly(starV(4, 1.25, 0.3)),
    half: fromPoly(half),
    cross: fromPoly(cross),
    flower: fromFn((a) => 0.72 + 0.28 * Math.cos(5 * (a + Math.PI / 2))),
    gear: fromFn((a) => 0.9 + 0.12 * Math.sign(Math.sin(8 * a))),
    drop: fromFn((a) => 0.62 + 0.42 * Math.pow((1 - Math.sin(a)) / 2, 1.6))
  };

  // ---------- 色 ----------
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const mixRGB = (a, b, p) => [a[0] + (b[0] - a[0]) * p, a[1] + (b[1] - a[1]) * p, a[2] + (b[2] - a[2]) * p];
  const css = (c, k = 1) => `rgb(${c[0] * k | 0},${c[1] * k | 0},${c[2] * k | 0})`;

  // ---------- 形の道すじを作る ----------
  const buf = new Float32Array(N * 2);
  function path(o, t) {
    const R = o.R, cr = Math.cos(o.rot), sr = Math.sin(o.rot);
    for (let i = 0; i < N; i++) {
      const a = ang(i); let r = o.r[i] * R;
      if (o.wob > 0.001) r *= 1 + o.wob * (0.12 * Math.sin(4 * a + t * 2.2 + o.ph) + 0.06 * Math.sin(7 * a - t * 1.7));
      const x = Math.cos(a) * r * o.sx, y = Math.sin(a) * r * o.sy;
      buf[i * 2] = o.x + x * cr - y * sr; buf[i * 2 + 1] = o.y + x * sr + y * cr;
    }
    ctx.beginPath(); ctx.moveTo(buf[0], buf[1]);
    for (let i = 1; i < N; i++) ctx.lineTo(buf[i * 2], buf[i * 2 + 1]);
    ctx.closePath();
  }

  // ---------- 1つの図形を描く（塗り方つき） ----------
  // o: { x, y, R(半径px), sx, sy, rot, r(形), wob, ph, c, c2(色[r,g,b]), fill, ext(厚み) }
  function actor(o, t) {
    if (o.R < 0.6) return;
    if (o.ext > 0.01) {   // 厚み（下に、濃い色を2枚ずらして重ねる）
      const dx = o.R * 0.16 * o.ext, dy = o.R * 0.2 * o.ext, x0 = o.x, y0 = o.y;
      for (let k = 2; k >= 1; k--) { o.x = x0 + dx * k / 2; o.y = y0 + dy * k / 2; path(o, t); ctx.fillStyle = css(k === 2 ? o.c2 : o.c, 0.62); ctx.fill(); }
      o.x = x0; o.y = y0;
    }
    path(o, t);
    const f = o.fill, R = o.R;
    if (f === 'ring') { ctx.strokeStyle = css(o.c); ctx.lineWidth = Math.max(1.5, R * 0.12); ctx.stroke(); return; }
    if (f === 'holo' || f === 'grad') {
      const g0 = t * 0.8 + o.ph, g = ctx.createLinearGradient(o.x - Math.cos(g0) * R, o.y - Math.sin(g0) * R, o.x + Math.cos(g0) * R, o.y + Math.sin(g0) * R);
      if (f === 'holo') { g.addColorStop(0, G.PAL.cyan); g.addColorStop(0.35, G.PAL.blue); g.addColorStop(0.65, G.PAL.pink); g.addColorStop(1, '#fffaf4'); }
      else { g.addColorStop(0, css(o.c)); g.addColorStop(1, css(o.c2)); }
      ctx.fillStyle = g; ctx.fill(); return;
    }
    ctx.fillStyle = css(o.c); ctx.fill();
    if (f === 'solid') return;
    ctx.save(); ctx.clip();
    ctx.translate(o.x, o.y); ctx.rotate(o.rot + (f === 'split' ? t * 0.6 + o.ph : 0.6));
    ctx.fillStyle = css(o.c2); ctx.strokeStyle = css(o.c2);
    const L = R * 1.6;
    if (f === 'split') ctx.fillRect(-L, 0, L * 2, L);
    else if (f === 'stripes') { const gap = Math.max(4, R * 0.2), off = (t * R * 0.4) % gap; ctx.lineWidth = Math.max(1, gap * 0.38); ctx.beginPath(); for (let y = -L - gap + off; y < L; y += gap) { ctx.moveTo(-L, y); ctx.lineTo(L, y); } ctx.stroke(); }
    else if (f === 'dots') { const gap = Math.max(5, R * 0.24), rr = gap * 0.22, off = (t * R * 0.3) % gap; for (let x = -L; x < L; x += gap) for (let y = -L + off - gap; y < L; y += gap) ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    else if (f === 'bull') { for (let k = 4; k >= 1; k--) { ctx.fillStyle = css(k % 2 ? o.c2 : o.c); ctx.beginPath(); ctx.arc(0, 0, R * k * 0.22 * (1 + 0.06 * Math.sin(t * 3 - k)), 0, TAU); ctx.fill(); } }
    ctx.restore();
  }

  // ---------- 小さな部品 ----------
  function label(text, x, y, col, size = 9, align = 'left') {
    ctx.fillStyle = col; ctx.font = `600 ${size}px ${MONO}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.4px'; ctx.fillText(text, x, y);
  }
  function tag(x, y, dx, dy, text, col) {   // 引き出し線つきの小さなラベル
    ctx.fillStyle = col; ctx.fillRect(x - 1.5, y - 1.5, 3, 3);
    ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + dx, y + dy); ctx.lineTo(x + dx + (dx < 0 ? -8 : 8), y + dy); ctx.stroke();
    label(text, x + dx + (dx < 0 ? -11 : 11), y + dy, col, 8, dx < 0 ? 'right' : 'left');
  }

  return { N, SHAPES, hex, mixRGB, css, path, actor, label, tag };
};
