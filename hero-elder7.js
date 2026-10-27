// hero-elder7.js — 入場画面「未知の古代」のショット 8（hero-elder.js の続き）
// 8) さかさまのピラミッドと、パイオニア探査機の金の板の模様（光る線で、ひとりでに描かれる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder7');

window.OC_ELDER7 = function (E) {
  const { K, face, grow, garnish } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, fr } = K;
  const F = -2.3, BOXF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const tier = (hx, hz, k, h) => ({ V: [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [-hx * k, h, -hz * k], [hx * k, h, -hz * k], [hx * k, h, hz * k], [-hx * k, h, hz * k]], F: BOXF });
  const ARC = (cx, cy, r, n = 20, a0 = 0, a1 = TAU) => range(n + 1).map((i) => [cx + Co(a0 + ((a1 - a0) * i) / n) * r, cy + S(a0 + ((a1 - a0) * i) / n) * r]);
  // ===== 8) さかさまのピラミッド =====
  const PY = [2.6, 2.0, 1.45, 0.95, 0.5], PTOP = 3.6, PYH = 0.38, PYT = PY.map((hb, i) => ({ y: PTOP - (i + 1) * PYH, s: tier(hb * 0.9, hb * 0.9, 1 / 0.9, PYH) })), TIP = [0, PTOP - PY.length * PYH - 0.05, 0];
  const CN = range(48).map((i) => ({ x: i % 4 ? (rnd(i * 3) - 0.5) * 5.4 : (i % 8 ? 1 : -1) * (2.3 + rnd(i * 3) * 1.0), z: i % 4 ? -0.5 - rnd(i * 5) * 2.2 : 0.3 + rnd(i * 5) * 1.6,   // コインは、模様のうしろか、左右に（模様をかくさない）
    y0: rnd(i * 7), sp: 0.5 + rnd(i * 11), w: 0.12 + rnd(i * 13) * 0.08, c: ['#e8463c', '#141414', '#d9dde6', '#e8463c', '#3a1418'][i % 5], r1: rnd(i * 17) * TAU, r2: 0.5 + rnd(i * 19) * 2 }));

  // パイオニア探査機の金の板（1972・1973年。229 × 152 mm）に刻まれた図。板と人の姿は描かず、模様だけ。座標は mm、板のまん中が原点、上が +
  const MM = 0.017, ST = [], tick = (L, a, b) => ST.push({ L, t0: a, d: b });
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
    { // 8) パイオニアの模様：空からつり下がる、さかさまのピラミッド。その下に、パイオニア探査機の金の板に刻まれた図（水素原子・パルサーの地図・太陽系と探査機の道すじ・探査機の形）だけが、光る線でひとりでに描かれ、ゆっくり降りてくる
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
        o.gw1 = { p: [PC[0] - NN[0] * 0.3, cy, PC[2] - NN[2] * 0.3], w: 2.2, c: '#ffcf80', c2: '#30180a', alpha: 0.16, z: -1 };
        o.cx39 = { p: PC, draw: (ctx, G, ac) => { const al = Math.min(1, ac.s) * (1 - cl((tb - 5.2) / 0.5)), at = (P) => { const O2 = G.proj(P), X = G.proj([P[0] + U[0] * MM * 50, P[1] + U[1] * MM * 50, P[2] + U[2] * MM * 50]), Y = G.proj([P[0] + V[0] * MM * 50, P[1] + V[1] * MM * 50, P[2] + V[2] * MM * 50]); return [O2, [(X[0] - O2[0]) / 50, (X[1] - O2[1]) / 50], [(Y[0] - O2[0]) / 50, (Y[1] - O2[1]) / 50]]; };
          const [O1, ax, ay] = at(PC), d = G.dpr, sc = Math.hypot(ax[0], ax[1]); if (O1[2] < 0.3 || al <= 0) return;
          ctx.save(); ctx.setTransform(d * ax[0], d * ax[1], d * ay[0], d * ay[1], d * O1[0], d * O1[1]); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.globalCompositeOperation = 'lighter';
          const all = new Path2D(), hot = new Path2D(), tips = [], pl = tb > 4.6 ? 0.85 + 0.15 * S(t * 2.5) : 1;
          ST.forEach((s) => { const e = s.d ? (tb - s.t0) / s.d : tb >= s.t0 ? 1 : 0; if (e <= 0) return; const L = grow(s.L, e), h = tb - s.t0 - s.d < 0.5; if (L.length < 2) return; L.forEach(([x, y], i) => { all[i ? 'lineTo' : 'moveTo'](x, y); if (h) hot[i ? 'lineTo' : 'moveTo'](x, y); }); if (h && e < 1) tips.push(L[L.length - 1]); });
          [[6, 0.1, '#ff9a3a'], [2.4, 0.32, '#ffb85a'], [1, 0.95, '#ffe2a8']].forEach(([w, a, c]) => { ctx.strokeStyle = c; ctx.lineWidth = w / sc; ctx.globalAlpha = a * al * pl; ctx.stroke(all); });   // 光る線（太くうすい光・中くらい・芯）
          ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 3.2 / sc; ctx.globalAlpha = 0.45 * al; ctx.stroke(hot); ctx.lineWidth = 1.4 / sc; ctx.globalAlpha = al; ctx.stroke(hot);   // 描いたばかりの線は白く
          tips.forEach(([x, y]) => { const r = 9 / sc, gr = ctx.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.3, 'rgba(255,220,140,.6)'); gr.addColorStop(1, 'rgba(255,180,80,0)'); ctx.fillStyle = gr; ctx.fillRect(x - r, y - r, 2 * r, 2 * r); });
          ctx.restore(); } };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#08102a', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#ffd890', '#ff4a5a', '#ff9aa8', -0.8);
        return o;
      }
    }
  ];
};
