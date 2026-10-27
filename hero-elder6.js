// hero-elder6.js — 入場画面「未知の古代」のショット 7〜8（hero-elder.js の続き）
// 7) 生きている模様の柱（反応拡散。その場で計算して、柱の表面に育つ）　8) さかさまのピラミッドと、パイオニア探査機の金の板（刻まれた図が、ひとりでに描かれる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder6');

window.OC_ELDER6 = function (E) {
  const { K, mk, sheet, face, grow, garnish } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, fr } = K;
  const F = -2.3, BOXF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const tier = (hx, hz, k, h) => ({ V: [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [-hx * k, h, -hz * k], [hx * k, h, -hz * k], [hx * k, h, hz * k], [-hx * k, h, hz * k]], F: BOXF });
  const cyl = (n, r, h) => ({ V: [].concat(range(n).map((i) => [Co((i / n) * TAU) * r, 0, S((i / n) * TAU) * r]), range(n).map((i) => [Co((i / n) * TAU) * r, h, S((i / n) * TAU) * r])), F: [range(n), range(n).map((i) => n + i)].concat(range(n).map((i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i])) });

  // ===== 7) 反応拡散（グレイ・スコット）。2つの物質が混ざるだけで、迷路のような模様が育つ =====
  const N = 96, GU = new Float32Array(N * N), GV = new Float32Array(N * N), GU2 = new Float32Array(N * N), GV2 = new Float32Array(N * N), GF = 0.029, GK = 0.057, DU = 0.12, DV = 0.06;
  const GC = document.createElement('canvas'); GC.width = GC.height = N; const gx = GC.getContext('2d'), GI = gx.createImageData(N, N);
  const TP = mk(N * 4, N * 2, () => {}), tx = TP.getContext('2d');   // 柱にまく絵（模様を 4×2 に並べる。模様は端がつながっている）
  const LUT = range(256).map((i) => { const v = i / 255, a = Math.min(1, v * 1.6), b = Math.max(0, v * 2 - 1); return [12 + a * 120 + b * 90, 9 + a * 44 + b * 70, 8 + a * 18 + b * 34]; });
  let gsT = -1, gsLoop = -1, gsLast = 0, A = GU, B = GV, A2 = GU2, B2 = GV2;
  const gsReset = (seed) => { A.fill(1); B.fill(0); for (let s = 0; s < 34; s++) { const cx = Math.floor(rnd(seed * 7 + s * 3) * N), cy = Math.floor(rnd(seed * 11 + s * 5) * N); for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) { const i = ((cy + y + N) % N) * N + ((cx + x + N) % N); A[i] = 0.5; B[i] = 0.25 + rnd(i + seed) * 0.1; } } };
  const gsStep = (n) => { for (let it = 0; it < n; it++) { for (let y = 0; y < N; y++) { const ym = ((y + N - 1) % N) * N, yp = ((y + 1) % N) * N, y0 = y * N;
    for (let x = 0; x < N; x++) { const xm = (x + N - 1) % N, xp = (x + 1) % N, i = y0 + x, u = A[i], v = B[i], uvv = u * v * v;
      A2[i] = u + DU * (A[ym + x] + A[yp + x] + A[y0 + xm] + A[y0 + xp] - 4 * u) - uvv + GF * (1 - u); B2[i] = v + DV * (B[ym + x] + B[yp + x] + B[y0 + xm] + B[y0 + xp] - 4 * v) + uvv - (GF + GK) * v; } }
    let q = A; A = A2; A2 = q; q = B; B = B2; B2 = q; }
    const d = GI.data; for (let i = 0; i < N * N; i++) { const c = LUT[Math.max(0, Math.min(255, (B[i] * 3.2 * 255) | 0))], tl = (1 - A[i]) * 60; d[i * 4] = c[0]; d[i * 4 + 1] = c[1] + tl * 0.4; d[i * 4 + 2] = c[2] + tl; d[i * 4 + 3] = 255; }
    gx.putImageData(GI, 0, 0); for (let i = 0; i < 8; i++) tx.drawImage(GC, (i % 4) * N, Math.floor(i / 4) * N); };
  const PR = 0.95, PH = 4.2, LA = -0.7, PIL = (u, v) => [Co(u * TAU) * PR, F + 0.22 + PH * (1 - v), S(u * TAU) * PR];
  const CAP = cyl(20, 1.08, 0.22), LIT = [2.6, F + 4.8, -2.2];
  const PET = range(16).map((i) => ({ a: rnd(i * 3) * TAU, r: 1.5 + rnd(i * 5) * 1.9, y: rnd(i * 7), s: 0.08 + rnd(i * 11) * 0.18, sp: 0.3 + rnd(i * 13), c: [['#e0703a', '#7a2a14'], ['#3ab0a0', '#0e3b36'], ['#e8b060', '#8a4a1a'], ['#c04a3a', '#3a1010']][i % 4] }));

  // ===== 8) さかさまのピラミッド =====
  const PY = [2.6, 2.0, 1.45, 0.95, 0.5], PTOP = 3.6, PYH = 0.38, PYT = PY.map((hb, i) => ({ y: PTOP - (i + 1) * PYH, s: tier(hb * 0.9, hb * 0.9, 1 / 0.9, PYH) })), TIP = [0, PTOP - PY.length * PYH - 0.05, 0];
  const CN = range(48).map((i) => ({ x: i % 4 ? (rnd(i * 3) - 0.5) * 5.4 : (i % 8 ? 1 : -1) * (1.9 + rnd(i * 3) * 1.1), z: i % 4 ? -0.5 - rnd(i * 5) * 2.2 : 0.3 + rnd(i * 5) * 1.6,   // コインは、板のうしろか、左右に（板をかくさない）
    y0: rnd(i * 7), sp: 0.5 + rnd(i * 11), w: 0.12 + rnd(i * 13) * 0.08, c: ['#e8463c', '#141414', '#d9dde6', '#e8463c', '#3a1418'][i % 5], r1: rnd(i * 17) * TAU, r2: 0.5 + rnd(i * 19) * 2 }));

  // パイオニア探査機の金の板（1972・1973年。229 × 152 mm）。人の姿は省いて、ほかの図を刻む。座標は mm、板のまん中が原点、上が +
  const PW = 114.5, PHH = 76, MM = 0.015, ST = [], tick = (L, a, b) => ST.push({ L, t0: a, d: b });
  const ARC = (cx, cy, r, n = 20, a0 = 0, a1 = TAU) => range(n + 1).map((i) => [cx + Co(a0 + ((a1 - a0) * i) / n) * r, cy + S(a0 + ((a1 - a0) * i) / n) * r]);
  [ARC(-100, 60, 5), ARC(-100, 60, 0.6, 6), [[-100, 66], [-100, 72]], ARC(-80, 60, 5), ARC(-80, 60, 0.6, 6), [[-80, 54], [-80, 48]], [[-100, 44], [-80, 44]], [[-90, 41], [-90, 47]]].forEach((L, i) => tick(L, 0.45 + i * 0.07, 0.25));   // 水素原子（いちばん単純な原子の、2つの状態）
  const O = [-55, 8]; tick([O, [100, 8]], 0.9, 0.45);   // 銀河の中心への線
  // パルサーの地図：14本の線の向きと長さで、太陽の場所を示す。線の上の 1・0 は、パルサーの点滅の周期（水素の単位）
  '-17:27:jhn20a -49:2:66qaun -58:56:944cxk -95:15:23g71j -129:1:5y0dab -162:2:cgriq3 -174:18:s0ltu -177:11:2fzgkas 145:7:gs8ys6 97:10:cnd7zl 68:3:d3ugi5 52:40:8fdf6m 45:1:5bk4vs 16:4:93uvu4'.split(' ').forEach((v, i) => {
    const [a, d, b] = v.split(':'), r = (+a * PI) / 180, L = 18 + 40 * Math.sqrt(+d / 56), u = [Co(r), S(r)], bits = parseInt(b, 36).toString(2), t0 = 1.05 + i * 0.1, sp = Math.min(1.5, (L * 0.78) / bits.length);
    tick([O, [O[0] + u[0] * L, O[1] + u[1] * L]], t0, 0.4);
    [...bits].forEach((c, k) => { const q = L - 2 - k * sp, h = c === '1' ? 1.7 : 0.6, x = O[0] + u[0] * q, y = O[1] + u[1] * q; tick([[x - u[1] * h, y + u[0] * h], [x + u[1] * h, y - u[0] * h]], t0 + 0.4 + k * 0.012, 0); }); });
  // 太陽系：太陽と9つの惑星。下の 1・0 は、太陽からの距離（水星の 1/10 が単位）
  tick(ARC(-102, -60, 5.5, 24), 2.3, 0.3); range(9).forEach((i) => { const x = [-90, -82, -73, -64, -48, -28, -10, 6, 20][i], r = [1.1, 1.8, 1.9, 1.3, 5, 4.2, 2.8, 2.7, 0.9][i], t0 = 2.45 + i * 0.08;
    tick(ARC(x, -60, r, 16), t0, 0.25); if (i === 5) tick(ARC(x, -60, 7.5, 24).map(([p, q]) => [p, -60 + (q + 60) * 0.25]), t0 + 0.2, 0.3);
    const b = [10, 19, 26, 40, 135, 247, 497, 777, 1020][i].toString(2); [...b].forEach((c, k) => { const xx = x + (k - (b.length - 1) / 2) * 1.3; tick(c === '1' ? [[xx, -68], [xx, -72]] : [[xx, -70], [xx, -70.6]], t0 + 0.3 + k * 0.02, 0); }); });
  tick([[-73, -57.5], [-69, -45], [-60, -42], [-52, -47], [-47, -53.5], [-38, -52], [-4, -42]], 3.1, 0.6); tick([[-9, -40], [-4, -42], [-9, -45.5]], 3.7, 0.12);   // 地球を出て、木星のそばを通り、外へ
  // 探査機の形（正面から）：大きなお皿のアンテナ・本体・原子力電池の腕・磁力計の腕
  const SC = [ARC(60, 12, 24, 40), ARC(60, 12, 19, 32), ARC(60, 12, 3.5, 12), [[60, 36], [60, 15.5]], [[39.2, 0], [57, 10.2]], [[80.8, 0], [63, 10.2]], ARC(60, -18, 7, 6, PI / 6, PI / 6 + TAU), [[54, -22], [36, -40]], [[66, -22], [84, -40]],
    [[33, -37], [39, -43], [36, -46], [30, -40], [33, -37]], [[87, -37], [81, -43], [84, -46], [90, -40], [87, -37]], [[84, 12], [108, 32]], ARC(109.2, 33, 1.6, 10)];
  SC.forEach((L, i) => tick(L, 3.3 + i * 0.09, 0.35));

  return [
    { // 7) 生きている模様の柱：小さな種から、迷路のような模様が、その場の計算で柱いっぱいに育っていく。まわりを花びらが舞う
      name: 'SPECIMEN', bg: '#0c0907', sel: 'so40',
      over: (ctx, I) => { const G = I.G, l = G.proj(LIT); if (l[2] < 0.3) return; const cx = I.CX, cy = I.CY, R = Math.min(I.W, I.FH);   // レンズのフレア
        ctx.save(); ctx.globalCompositeOperation = 'screen'; const g = ctx.createRadialGradient(l[0], l[1], 0, l[0], l[1], R * 0.32); g.addColorStop(0, 'rgba(255,220,170,.5)'); g.addColorStop(1, 'rgba(255,160,90,0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, I.W, I.FH);
        [[0.6, 0.06, 'rgba(120,220,200,.09)'], [1.25, 0.04, 'rgba(255,170,90,.11)'], [1.7, 0.1, 'rgba(160,140,255,.05)']].forEach(([k, s, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(l[0] + (cx - l[0]) * k * 2, l[1] + (cy - l[1]) * k * 2, R * s, 0, TAU); ctx.fill(); });
        ctx.strokeStyle = 'rgba(255,200,150,.1)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx + (cx - l[0]) * 0.6, cy + (cy - l[1]) * 0.6, R * 0.2, 0, TAU); ctx.stroke(); ctx.restore(); },
      cam: (tb, t) => ({ pitch: 0.12 + 0.06 * S(t * 0.4), dist: 9.4, zoom: 1.18, t: [0, F + 2.1, 0] }),
      act: (t, tb) => {
        const o = {}, loop = Math.round((t - tb) * 10);
        if (loop !== gsLoop || tb < gsT) { gsLoop = loop; gsReset(loop % 997); gsLast = tb; gsStep(1); }
        if (tb > gsT + 1e-4) { gsStep(tb > 0.3 ? Math.max(1, Math.min(10, Math.round((tb - gsLast) * 260))) : 1); gsLast = tb; }
        gsT = tb;
        o.cx37 = { p: [0, F + 2.3, 0], draw: (ctx, G, ac) => sheet(ctx, G, TP, PIL, 28, 3, Math.min(1, ac.s), (u) => 0.62 * (1 - Math.max(0, Co(u * TAU - LA))) + 0.04, true) };
        o.so39 = { p: [0, F, 0], V: CAP.V, F: CAP.F, c: '#141010', edge: '#a0703a', elw: 0.8 }; o.so40 = { p: [0, F + PH + 0.22, 0], V: CAP.V, F: CAP.F, c: '#141010', edge: '#a0703a', elw: 0.8 };
        o.gw0 = { p: LIT, w: 0.8, c: '#ffffff', c2: '#ffb070', alpha: 0.8, z: -20 };
        PET.forEach((p, i) => { const a = p.a + t * 0.12 * p.sp, y = F + 0.4 + fr(p.y + t * 0.04 * p.sp) * 4.2; o['fl' + i] = { p: [Co(a) * p.r, y, S(a) * p.r], r: [t * 0.5 * p.sp + i, t * 0.7 * p.sp, i], shape: 'lens', w: p.s, sx: 1, sy: 0.45, g: p.c, ga: PI / 2, alpha: 0.9 }; });
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#120d0a', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#e8a070', '#7a4a2a', '#ffd9a8', 0.7);
        return o;
      }
    },
    { // 8) パイオニアの金の板：空からつり下がる、さかさまのピラミッド。その下に、金色の板がゆっくり降りてくる。刻まれた図（水素原子・パルサーの地図・太陽系と探査機の道すじ・探査機の形）が、光りながら、ひとりでに描かれていく
      name: 'PIONEER', bg: '#0a1430', sel: 'cn3',
      cam: (tb, t) => ({ pitch: -0.04 + 0.04 * S(t * 0.4), dist: 9.6, zoom: 1.1, t: [0, 0.45 - 0.5 * io(cl(tb / 5)), 0] }),
      act: (t, tb) => {
        const o = {}, cy = 0.35 - 0.8 * io(cl(tb / 5.2)), PC = [0, cy, 0], R0 = face(t, tb, 0.5), N0 = [-R0[2], 0, R0[0]], ph = 0.1 * S(t * 0.5), ro = 0.07 * S(t * 0.33);
        const V0 = [N0[0] * S(ph), Co(ph), N0[2] * S(ph)], U = [R0[0] * Co(ro) + V0[0] * S(ro), V0[1] * S(ro), R0[2] * Co(ro) + V0[2] * S(ro)], V = [V0[0] * Co(ro) - R0[0] * S(ro), V0[1] * Co(ro), V0[2] * Co(ro) - R0[2] * S(ro)], NN = [U[1] * V[2] - U[2] * V[1], U[2] * V[0] - U[0] * V[2], U[0] * V[1] - U[1] * V[0]];
        o.cx38 = { p: [0, 1, 0], z: -40, draw: (ctx, G) => { const c = G.proj(TIP); if (c[2] < 0.3) return; const k = G.f / c[2]; ctx.strokeStyle = 'rgba(230,60,90,.13)'; ctx.lineWidth = 1.4;   // うしろの模様
          range(22).forEach((r) => { ctx.beginPath(); range(65).forEach((j) => { const a = (j / 64) * TAU, rr = (0.4 + r * 0.34 + 0.06 * S(a * 5 + r + t * 0.3)) * k; ctx[j ? 'lineTo' : 'moveTo'](c[0] + Co(a) * rr, c[1] + S(a) * rr * 0.7); }); ctx.stroke(); }); } };
        PYT.forEach((q, i) => { o['so' + (41 + i)] = { p: [0, q.y, 0], r: [0, t * 0.06, 0], V: q.s.V, F: q.s.F, fc: ['#16295a', '#1c3570', '#11214a'], edge: '#ff4a5a', elw: 0.8 }; });
        o.gw0 = { p: TIP, w: 0.95, c: '#ff8a8a', c2: '#c0203a', alpha: 0.75 }; o.bm0 = { a: TIP, b: [0, F, 0], ra: 0.08, rb: 0.9, c: '#ff8a9a', c2: '#401020', alpha: 0.22, zp: [0, 0, -0.5], z: -6 };
        CN.forEach((c, i) => { o['cn' + i] = { p: [R0[0] * c.x + N0[0] * c.z, 2.8 - fr(c.y0 + t * 0.05 * c.sp) * 5.4, R0[2] * c.x + N0[2] * c.z], r: [c.r1 + t * c.r2 * 0.5, t * c.sp, 0], w: c.w, d: 0.03, c: c.c }; });
        o.gw1 = { p: [PC[0] - NN[0] * 0.3, cy, PC[2] - NN[2] * 0.3], w: 1.9, c: '#ffd890', c2: '#40200a', alpha: 0.3, z: -1 };
        o.cx39 = { p: PC, draw: (ctx, G, ac) => { const al = Math.min(1, ac.s) * (1 - cl((tb - 5.2) / 0.5)), at = (P) => { const O2 = G.proj(P), X = G.proj([P[0] + U[0] * MM * 50, P[1] + U[1] * MM * 50, P[2] + U[2] * MM * 50]), Y = G.proj([P[0] + V[0] * MM * 50, P[1] + V[1] * MM * 50, P[2] + V[2] * MM * 50]); return [O2, [(X[0] - O2[0]) / 50, (X[1] - O2[1]) / 50], [(Y[0] - O2[0]) / 50, (Y[1] - O2[1]) / 50]]; };
          const [O1, ax, ay] = at(PC), [O3, bx, by] = at([PC[0] - NN[0] * 0.035, PC[1] - NN[1] * 0.035, PC[2] - NN[2] * 0.035]), d = G.dpr, sc = Math.hypot(ax[0], ax[1]); if (O1[2] < 0.3 || al <= 0) return;
          ctx.save(); ctx.globalAlpha = al; ctx.setTransform(d * bx[0], d * bx[1], d * by[0], d * by[1], d * O3[0], d * O3[1]); ctx.fillStyle = '#4a3410'; ctx.fillRect(-PW, -PHH, 2 * PW, 2 * PHH);   // 板の厚み
          ctx.setTransform(d * ax[0], d * ax[1], d * ay[0], d * ay[1], d * O1[0], d * O1[1]); const sp = 0.5 + 0.32 * S(t * 0.7) + 0.4 * (R0[0] * U[2] - R0[2] * U[0]), g = ctx.createLinearGradient(-PW, PHH, PW, -PHH);
          [[0, '#6a4a1a'], [sp - 0.25, '#b08236'], [sp, '#f2d58e'], [sp + 0.25, '#b08236'], [1, '#5a3e14']].forEach(([q, c]) => g.addColorStop(Math.max(0, Math.min(1, q)), c)); ctx.fillStyle = g; ctx.fillRect(-PW, -PHH, 2 * PW, 2 * PHH);
          ctx.strokeStyle = 'rgba(255,240,200,.6)'; ctx.lineWidth = 0.8 / sc; ctx.strokeRect(-PW, -PHH, 2 * PW, 2 * PHH);
          if (ax[0] * ay[1] - ax[1] * ay[0] < 0) {   // 表が見えているときだけ、刻んだ図を描く
            const groove = new Path2D(), hot = new Path2D(), tips = []; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
            ST.forEach((s) => { const e = s.d ? (tb - s.t0) / s.d : tb >= s.t0 ? 1 : 0; if (e <= 0) return; const L = grow(s.L, e), h = tb - s.t0 - s.d < 0.5; if (L.length < 2) return; L.forEach(([x, y], i) => { groove[i ? 'lineTo' : 'moveTo'](x, y); if (h) hot[i ? 'lineTo' : 'moveTo'](x, y); }); if (h && e < 1) tips.push(L[L.length - 1]); });
            ctx.strokeStyle = 'rgba(60,36,8,.9)'; ctx.lineWidth = 1.3 / sc; ctx.stroke(groove); ctx.translate(0.5 / sc, -0.5 / sc); ctx.strokeStyle = 'rgba(255,246,214,.55)'; ctx.lineWidth = 0.55 / sc; ctx.stroke(groove); ctx.translate(-0.5 / sc, 0.5 / sc);
            ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#fff0b8'; ctx.lineWidth = 3 / sc; ctx.globalAlpha = 0.35 * al; ctx.stroke(hot); ctx.lineWidth = 1.2 / sc; ctx.globalAlpha = 0.9 * al; ctx.stroke(hot);
            tips.forEach(([x, y]) => { const r = 9 / sc, gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,220,140,.6)'); gr.addColorStop(1, 'rgba(255,180,80,0)'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); }); }
          ctx.restore(); } };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#08102a', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#ffd890', '#ff4a5a', '#ff9aa8', -0.8);
        return o;
      }
    }
  ];
};
