// hero-philo2.js — 入場画面「哲学」のショット 1〜2（hero-philo.js の続き）
// 1) 形の影（4次元の立方体が回り、3次元の姿が、床に2次元の影を落とす。まわりにはプラトンの5つの立体）
// 2) 原点（デカルトの座標。曲面の式が形を変え、床には等高線、奥にはデカルトの葉線）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-philo2');

window.OC_PHILO2 = function (E) {
  const { NP, vis, K, PAPER, INK, RUB, SEPIA, SERIF, MONO, stage, poly, hull, solid, dot } = E, { S, Co, PI, TAU, cl, io, range, rnd, fr, sub, nrm } = K;
  const F = -2.0;
  const TX = (ctx, G, s, q, a, sz, col, al = 'left', it) => { const p = G.proj(q); if (p[2] < 0.3) return; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.textAlign = al; ctx.font = (it ? 'italic ' : '') + ((G.f * sz) / p[2]).toFixed(1) + 'px ' + (it ? SERIF : MONO); ctx.fillText(s, p[0], p[1]); };

  // ===== 1) 形の影：4次元の立方体（テッセラクト）。点は (±1, ±1, ±1, ±1) の16個、辺は1つの座標だけがちがう2点を結ぶ32本 =====
  const T4 = range(16).map((i) => [0, 1, 2, 3].map((b) => ((i >> b) & 1 ? 1 : -1))), TE = [], TF = [];
  T4.forEach((_, i) => [0, 1, 2, 3].forEach((b) => { const j = i ^ (1 << b); if (j > i) TE.push([i, j]); }));
  for (let a = 0; a < 4; a++) for (let b = a + 1; b < 4; b++) for (let i = 0; i < 16; i++) if (!(i & (1 << a)) && !(i & (1 << b))) TF.push([i, i | (1 << a), i | (1 << a) | (1 << b), i | (1 << b)]);   // 24 個の四角い面
  // 5つの正多面体（プラトン『ティマイオス』：火・土・空気・宇宙・水）
  const ph = (1 + Math.sqrt(5)) / 2, cyc = (a, b, c) => [[a, b, c], [b, c, a], [c, a, b]], sg = (v) => { let L = [v]; [0, 1, 2].forEach((i) => { L = L.concat(L.filter((p) => p[i]).map((p) => p.map((x, j) => (j === i ? -x : x)))); }); return L; };
  const SOL = [[[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]], sg([1, 1, 1]), [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]], sg([1, 1, 1]).concat(...cyc(0, 1 / ph, ph).map((v) => sg(v))), [].concat(...cyc(0, 1, ph).map((v) => sg(v)))]
    .map((V) => { const r = Math.max(...V.map((p) => Math.hypot(...p))); V = V.map((p) => p.map((x) => x / r)); return { V, F: hull(V) }; });
  const SNAME = ['TETRA · IGNIS', 'HEXA · TERRA', 'OCTA · AER', 'DODECA · COSMOS', 'ICOSA · AQUA'];
  const rotP = (p, a, b) => { const x = p[0] * Co(a) - p[2] * S(a), z = p[0] * S(a) + p[2] * Co(a), y = p[1] * Co(b) - z * S(b); return [x, y, p[1] * S(b) + z * Co(b)]; };
  const hull2 = (P) => { P = P.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = []; P.forEach((p) => { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }); P.slice().reverse().forEach((p) => { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }); return lo.slice(0, -1).concat(up.slice(0, -1)); };
  const form = (t, tb) => { const W = stage(t, tb, 0.4), a = t * 0.42, b = t * 0.27, c = t * 0.18, L = W(0.6, F + 4.7, 1.2), C = [0, F + 2.35, 0];   // ある時刻の、4次元の回転と影
    const P3 = T4.map(([x, y, z, w]) => { const X = x * Co(a) - w * S(a); let Wd = x * S(a) + w * Co(a); const Y = y * Co(b) - Wd * S(b); Wd = y * S(b) + Wd * Co(b); const Z = z * Co(c) - Wd * S(c); Wd = z * S(c) + Wd * Co(c); const k = 2.3 / (3.2 - Wd); return W(X * k, C[1] + Y * k, Z * k); });
    const sh = (p) => { const s = (F - L[1]) / (p[1] - L[1]); return [L[0] + (p[0] - L[0]) * s, F + 0.01, L[2] + (p[2] - L[2]) * s]; };
    const sols = SOL.map((so, i) => { const ang = (i / 5) * TAU + t * 0.22, c0 = W(Co(ang) * 3.15, F + 1.0 + 0.25 * S(t * 0.9 + i), S(ang) * 3.15 * 0.75), V = so.V.map((p) => { const q = rotP(p, t * 0.7 + i, t * 0.5 + i * 2); return [c0[0] + q[0] * 0.42, c0[1] + q[1] * 0.42, c0[2] + q[2] * 0.42]; }); return { V, F: so.F, c: c0 }; });
    return { W, L, P3, sh, sols, ang: [a, b, c] }; };

  // ===== 2) 原点：デカルトの座標。z = f(x, y) の曲面が、式を変えながら形を変える =====
  const NG = 18, DX = 2.4, FN = [['f = sin x · cos y', (x, y) => 0.85 * S(x * 1.3) * Co(y * 1.3)], ['f = (x² − y²) / 5', (x, y) => (x * x - y * y) * 0.2], ['f = sin 2r / r', (x, y) => { const r = Math.hypot(x, y) + 0.001; return (0.75 * S(2.4 * r)) / (0.45 + r * 0.6); }], ['f = e^−r² − e^−(r−p)²', (x, y) => 1.3 * Math.exp(-(x * x + y * y) / 1.1) - 0.8 * Math.exp(-((x - 1.1) ** 2 + (y + 0.9) ** 2) / 0.5)]];
  const fAt = (tb) => { const u = cl(tb / 4.6) * (FN.length - 1), i = Math.min(FN.length - 2, Math.floor(u)), e = io(u - i); return [(x, y) => FN[i][1](x, y) * (1 - e) + FN[i + 1][1](x, y) * e, e < 0.5 ? FN[i][0] : FN[i + 1][0]]; };
  const FOL = (s) => { const a = 0.9; return [(3 * a * s) / (1 + s * s * s), (3 * a * s * s) / (1 + s * s * s)]; };   // デカルトの葉線 x³ + y³ = 3axy
  const FOLP = range(220).map((i) => { const s = i < 30 ? -0.62 + (i / 30) * 0.62 : Math.pow((i - 30) / 190, 2.2) * 40; return FOL(s); });
  const ori = (t, tb) => { const W = stage(t, tb, 0.4), O = [0, F + 1.25, 0], [f, name] = fAt(tb); return { W, O, f, name, P: (x, h, y) => W(O[0] + x, O[1] + h, O[2] + y) }; };   // （x, y は床の方向、h は高さ）
  const march = (f, lv) => { const S2 = []; for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) { const x0 = -DX + (2 * DX * i) / NG, y0 = -DX + (2 * DX * j) / NG, d = (2 * DX) / NG, v = [f(x0, y0), f(x0 + d, y0), f(x0 + d, y0 + d), f(x0, y0 + d)].map((q) => q - lv), C = [[x0, y0], [x0 + d, y0], [x0 + d, y0 + d], [x0, y0 + d]], X = [];   // 等高線（マーチング・スクエア）
      for (let k = 0; k < 4; k++) { const a = v[k], b = v[(k + 1) % 4]; if ((a < 0) !== (b < 0)) { const u = a / (a - b), p = C[k], q = C[(k + 1) % 4]; X.push([p[0] + (q[0] - p[0]) * u, p[1] + (q[1] - p[1]) * u]); } }
      if (X.length >= 2) S2.push([X[0], X[1]]); if (X.length === 4) S2.push([X[2], X[3]]); } return S2; };

  return [
    { // 1) 形の影：4次元の立方体が、2つの面でゆっくり回る。3次元に映した姿（中の立方体が、外へ裏返っていく）と、その床の影。まわりを5つの正多面体が回り、それぞれの影も落ちる。光の線が、点と影を結ぶ
      name: 'UMBRA', bg: '#16110c', la: 'Umbrae Formarum', by: 'PLATO · RES PUBLICA VII', pc: '#f3d9a6', ss: [1.1, 0.6],
      data: (tb, t) => { const { ang } = form(t, tb); return ['TESSERACT {4,3,3}', '16 V · 32 E · 24 F · 8 C', 'θxw ' + (ang[0] % TAU).toFixed(3) + '  θyw ' + (ang[1] % TAU).toFixed(3), 'R⁴ → R³ → R²']; },
      swarm: (t, tb) => { const { P3, sh } = form(t, tb), R = []; TE.forEach(([i, j], n) => { for (let m = 0; m < 19; m++) { const u = rnd(n * 19 + m), p = [0, 1, 2].map((k) => P3[i][k] + (P3[j][k] - P3[i][k]) * u); R.push(p.concat([0]), sh(p).concat([n % 9 === 0 ? 1 : 0])); } }); return R; },   // 粒：辺と、その影
      cam: (tb, t) => ({ pitch: 0.36 + 0.06 * S(t * 0.4), dist: 10.4, zoom: 1.0, t: [0, F + 1.6, 0] }),
      act: (t, tb) => {
        const o = {}, { W, L, P3, sh, sols } = form(t, tb), lit = (m) => nrm(sub(L, m));
        o.px0 = { p: W(0, F, 0), z: -50, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; const c = G.proj(W(0, F, 0)), e = G.proj(W(4.6, F, 0)); if (c[2] < 0.3) return;   // 光に照らされた床
          const rx = Math.hypot(e[0] - c[0], e[1] - c[1]), g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], rx); g.addColorStop(0, 'rgba(225,180,110,' + 0.55 * al + ')'); g.addColorStop(1, 'rgba(225,180,110,0)'); ctx.fillStyle = g; ctx.fillRect(c[0] - rx, c[1] - rx, 2 * rx, 2 * rx);
          ctx.globalAlpha = al; const S3 = P3.map(sh), SP = S3.map(G.proj);   // 4次元の立方体の影（面を重ねて、こく）
          ctx.fillStyle = 'rgba(14,8,3,.16)'; TF.forEach((f) => { const [pa] = poly(f.map((i) => SP[i])); ctx.fill(pa); }); ctx.strokeStyle = 'rgba(14,8,3,.85)'; ctx.lineWidth = 1.5; ctx.beginPath(); TE.forEach(([i, j]) => { ctx.moveTo(SP[i][0], SP[i][1]); ctx.lineTo(SP[j][0], SP[j][1]); }); ctx.stroke();
          ctx.fillStyle = 'rgba(14,8,3,.55)'; sols.forEach((s) => { const [pa] = poly(hull2(s.V.map((p) => { const q = G.proj(sh(p)); return [q[0], q[1]]; }))); ctx.fill(pa); });   // 5つの立体の影
          ctx.strokeStyle = 'rgba(200,80,50,.5)'; ctx.lineWidth = 0.7; ctx.setLineDash([3, 4]); ctx.beginPath(); const l = G.proj(L); [0, 3, 5, 6, 9, 10, 12, 15].forEach((i) => { ctx.moveTo(l[0], l[1]); ctx.lineTo(SP[i][0], SP[i][1]); }); ctx.stroke(); ctx.setLineDash([]);   // 光の線
          ctx.globalAlpha = 1; } };
        o.px1 = { p: W(0, F + 2.35, 0), draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; const Q = P3.map(G.proj); if (Q.some((p) => p[2] < 0.3)) return; ctx.globalAlpha = al;   // 4次元の立方体の、3次元の姿
          ctx.fillStyle = 'rgba(243,217,166,.07)'; TF.forEach((f) => { const [pa] = poly(f.map((i) => Q[i])); ctx.fill(pa); });
          const zs = Q.map((p) => p[2]), z0 = Math.min(...zs), z1 = Math.max(...zs); ctx.lineCap = 'round'; ctx.strokeStyle = '#f3dcae';
          TE.forEach(([i, j]) => { const d = 1 - ((Q[i][2] + Q[j][2]) / 2 - z0) / (z1 - z0 + 1e-6); ctx.lineWidth = 0.8 + 1.8 * d; ctx.globalAlpha = al * (0.45 + 0.55 * d); ctx.beginPath(); ctx.moveTo(Q[i][0], Q[i][1]); ctx.lineTo(Q[j][0], Q[j][1]); ctx.stroke(); });
          ctx.fillStyle = '#f3dcae'; Q.forEach((p) => { ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(p[0], p[1], 2.1, 0, TAU); ctx.fill(); }); ctx.fillStyle = '#e06a4a'; ctx.beginPath(); ctx.arc(Q[0][0], Q[0][1], 3.4, 0, TAU); ctx.fill();
          TX(ctx, G, 'R⁴', W(1.7, F + 3.9, 0), al * 0.8, 0.24, '#f3dcae', 'left', 1); ctx.globalAlpha = 1; } };
        sols.forEach((s, i) => { o['px' + (2 + i)] = { p: s.c, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; solid(ctx, G, s.V, s.F, lit, { fill: '#f0d8a8', amb: 0.1, ang: 0.5 + i, al }); TX(ctx, G, SNAME[i], [s.c[0], s.c[1] - 0.62, s.c[2]], al * 0.75, 0.085, '#e8cfa0', 'center'); } }; });   // 5つの立体と、その元素
        o.px7 = { p: L, draw: (ctx, G) => { const al = vis(tb), c = G.proj(L); if (c[2] < 0.3 || al <= 0) return; const r = (G.f * 0.9) / c[2], g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);   // 光（イデアの太陽）
          g.addColorStop(0, 'rgba(255,240,200,' + al + ')'); g.addColorStop(0.2, 'rgba(255,200,120,' + 0.5 * al + ')'); g.addColorStop(1, 'rgba(255,160,60,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(c[0] - r, c[1] - r, 2 * r, 2 * r); ctx.restore(); } };
        return o;
      }
    },
    { // 2) 原点：デカルトの座標の中で、曲面 f(x, y) が式を変えながら波打つ。床にはその等高線、奥の板にはデカルトの葉線が朱で描かれる。曲面の上を点が走り、座標が刻々と変わる。原点は朱の1点（考える私）
      name: 'ORIGO', bg: '#ebe4d4', la: 'Origo Cartesiana', by: 'R. DESCARTES · 1637', pc: INK, ss: [1.3, 0.55],
      data: (tb, t) => { const { f, name } = ori(t, tb), x = 1.6 * S(tb * 0.9), y = 1.3 * S(tb * 1.3 + 1); return [name, 'x³ + y³ = 3axy', 'P = (' + x.toFixed(2) + ', ' + y.toFixed(2) + ', ' + f(x, y).toFixed(3) + ')', 'O = (0, 0, 0) · cogito']; },
      swarm: (t, tb) => { const { f, P } = ori(t, tb), R = []; for (let j = 0; j <= NG; j++) for (let i = 0; i <= NG; i++) { const x = -DX + (2 * DX * i) / NG, y = -DX + (2 * DX * j) / NG; R.push(P(x, f(x, y), y).concat([0]), P(x, -1.25 + 0.012, y).concat([0])); } return R; },   // 粒：曲面の網の目と、床の方眼
      cam: (tb, t) => ({ pitch: 0.42 + 0.05 * S(t * 0.4), dist: 10.2, zoom: 1.02, t: [0, F + 1.3, 0] }),
      act: (t, tb) => {
        const o = {}, { f, P } = ori(t, tb), Lt = nrm([0.4, 1, 0.5]);
        o.px8 = { p: P(0, -1.25, -DX - 0.3), z: -30, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.globalAlpha = al;   // 奥の板（方眼）と、デカルトの葉線
          const B = (x, y) => P(x, y, -DX - 0.3), bq = [B(-DX, -1.25), B(DX, -1.25), B(DX, 2.4), B(-DX, 2.4)].map(G.proj), [bp] = poly(bq); ctx.fillStyle = 'rgba(255,250,238,.55)'; ctx.fill(bp); ctx.strokeStyle = 'rgba(23,19,14,.18)'; ctx.lineWidth = 0.6; ctx.beginPath();
          for (let k = -6; k <= 6; k++) { const a = G.proj(B(k * 0.4, -1.25)), b = G.proj(B(k * 0.4, 2.4)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } for (let k = -3; k <= 6; k++) { const a = G.proj(B(-DX, k * 0.4)), b = G.proj(B(DX, k * 0.4)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke(bp);
          const n = Math.floor(cl((tb - 0.6) / 3.2) * FOLP.length), FL = FOLP.slice(0, n).filter(([x, y]) => Math.abs(x) < DX && y > -1.2 && y < 2.35).map(([x, y]) => G.proj(B(x, y)));
          ctx.strokeStyle = RUB; ctx.lineWidth = 2; ctx.beginPath(); FL.forEach((p, i) => ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1])); ctx.stroke(); ctx.setLineDash([4, 4]); ctx.lineWidth = 0.9; ctx.beginPath(); const a1 = G.proj(B(-DX, DX - 0.9)), a2 = G.proj(B(0.35, -1.25)); ctx.moveTo(a1[0], a1[1]); ctx.lineTo(a2[0], a2[1]); ctx.stroke(); ctx.setLineDash([]);   // x + y + a = 0（漸近線）
          if (FL.length) { const q = FL[FL.length - 1]; ctx.fillStyle = RUB; ctx.beginPath(); ctx.arc(q[0], q[1], 3.5, 0, TAU); ctx.fill(); }
          TX(ctx, G, 'x³ + y³ = 3axy', B(-DX + 0.15, 2.15), al * 0.85, 0.15, INK, 'left', 1); ctx.globalAlpha = 1; } };
        o.px9 = { p: P(0, -1.25, 0), z: -20, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.globalAlpha = al;   // 床：方眼と、等高線
          ctx.strokeStyle = 'rgba(23,19,14,.14)'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let k = 0; k <= NG; k += 2) { const u = -DX + (2 * DX * k) / NG, a = G.proj(P(u, -1.25, -DX)), b = G.proj(P(u, -1.25, DX)), c = G.proj(P(-DX, -1.25, u)), d = G.proj(P(DX, -1.25, u)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); } ctx.stroke();
          [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9, 1.2].forEach((lv, m) => { ctx.strokeStyle = m === 3 ? RUB : SEPIA; ctx.lineWidth = m === 3 ? 1.3 : 0.8; ctx.beginPath(); march(f, lv).forEach(([a, b]) => { const p = G.proj(P(a[0], -1.24, a[1])), q = G.proj(P(b[0], -1.24, b[1])); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); }); ctx.stroke(); });
          ctx.globalAlpha = 1; } };
        o.px10 = { p: P(0, 0, 0), draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; const V = [];   // 曲面（面を奥から塗って、網の目を重ねる）
          for (let j = 0; j <= NG; j++) { V.push([]); for (let i = 0; i <= NG; i++) { const x = -DX + (2 * DX * i) / NG, y = -DX + (2 * DX * j) / NG; V[j].push(P(x, f(x, y), y)); } }
          const Qd = []; for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) { const c = [V[j][i], V[j][i + 1], V[j + 1][i + 1], V[j + 1][i]], m = c[0].map((_, k) => (c[0][k] + c[2][k]) / 2); Qd.push({ c, z: dot(sub(m, G.camPos), sub(m, G.camPos)), n: nrm(K.cross(sub(c[1], c[0]), sub(c[3], c[0]))) }); }
          Qd.sort((a, b) => b.z - a.z); ctx.globalAlpha = al; ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(23,19,14,.75)';
          Qd.forEach((q) => { const p = q.c.map(G.proj); if (p.some((v) => v[2] < 0.3)) return; const [pa] = poly(p), l = Math.abs(dot(q.n, Lt)); ctx.fillStyle = 'rgb(' + [200, 180, 150].map((v, k) => Math.round(v * 0.55 + v * 0.5 * l + [20, 18, 14][k])).join(',') + ')'; ctx.fill(pa); ctx.stroke(pa); });
          const x = 1.6 * S(tb * 0.9), y = 1.3 * S(tb * 1.3 + 1), h = f(x, y), pt = G.proj(P(x, h, y)), pf = G.proj(P(x, -1.25, y)), px = G.proj(P(x, -1.25, 0)), py = G.proj(P(0, -1.25, y));   // 走る点と、その座標の線
          ctx.strokeStyle = RUB; ctx.lineWidth = 1; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(pt[0], pt[1]); ctx.lineTo(pf[0], pf[1]); ctx.lineTo(px[0], px[1]); ctx.moveTo(pf[0], pf[1]); ctx.lineTo(py[0], py[1]); ctx.stroke(); ctx.setLineDash([]);
          ctx.fillStyle = RUB; ctx.beginPath(); ctx.arc(pt[0], pt[1], 4, 0, TAU); ctx.fill(); TX(ctx, G, '(' + x.toFixed(2) + ', ' + y.toFixed(2) + ', ' + h.toFixed(2) + ')', P(x + 0.15, h + 0.25, y), al, 0.11, RUB);
          ctx.strokeStyle = INK; ctx.lineWidth = 1.3; [[[1, 0, 0], 'x'], [[0, 1, 0], 'z'], [[0, 0, 1], 'y']].forEach(([d, nm]) => {   // 座標の軸と目盛り
            const a = G.proj(P(-d[0] * 2.9, d[1] ? -1.25 : 0, -d[2] * 2.9)), b = G.proj(P(d[0] * 3.1, d[1] * 2.6, d[2] * 3.1)); ctx.globalAlpha = al; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); TX(ctx, G, nm, P(d[0] * 3.3, d[1] * 2.8, d[2] * 3.3), al, 0.22, INK, 'center', 1);
            for (let k = -5; k <= 5; k++) { if (!k || (d[1] && k < -2)) continue; const q = G.proj(P(d[0] * k * 0.5, d[1] * k * 0.5, d[2] * k * 0.5)); ctx.globalAlpha = al; ctx.fillStyle = INK; ctx.fillRect(q[0] - 1.5, q[1] - 1.5, 3, 3); if (k % 2 === 0) TX(ctx, G, String(k / 2), P(d[0] * k * 0.5 + 0.08, d[1] * k * 0.5 - 0.16, d[2] * k * 0.5), al * 0.7, 0.1, INK); } });
          const oc = G.proj(P(0, 0, 0)), r = (G.f * 0.5) / oc[2], g = ctx.createRadialGradient(oc[0], oc[1], 0, oc[0], oc[1], r); g.addColorStop(0, 'rgba(168,50,30,.45)'); g.addColorStop(1, 'rgba(168,50,30,0)'); ctx.globalAlpha = al; ctx.fillStyle = g; ctx.fillRect(oc[0] - r, oc[1] - r, 2 * r, 2 * r);   // 原点 O
          ctx.fillStyle = RUB; ctx.beginPath(); ctx.arc(oc[0], oc[1], 5, 0, TAU); ctx.fill(); TX(ctx, G, 'O', P(-0.28, 0.12, 0), al, 0.2, RUB, 'center', 1); ctx.globalAlpha = 1; } };
        return o;
      }
    }
  ];
};
