// hero-ancient2.js — 入場画面「古代」のショット 2〜3（hero-ancient.js の続き）
// アンティキティラの歯車・フーリエ級数で描くホルスの目。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-ancient2');

window.OC_HERO_ANC2 = function (K, X, A) {
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp, lerp3, mat, mmul, mv, eul, nrm, lane, eq, spin } = K;
  const { card, BC, RAIN, GOLD, ancRing } = X;

  // ===== 2) アンティキティラの歯車：歯の数の比で、正しくかみ合って回る =====
  const GM = 0.0128, PR = (n) => (GM * n) / 2;
  const GE = [{ N: 223, at: [0, 0], L: 0, c: '#ffb24d', c2: '#c96a00', hole: 0.86 }, { N: 64, mesh: 0, a: 0.62, L: 0, c: 'cream', c2: '#d9b9a6' }, { N: 38, co: 1, L: 1, c: 'verm', c2: '#b83a12' },
    { N: 48, mesh: 2, a: 2.05, L: 1, c: GOLD, c2: '#c99a2e' }, { N: 24, co: 0, L: 1, c: 'navy', c2: '#0b1026' }, { N: 127, mesh: 4, a: -2.35, L: 1, c: '#3fc6c2', c2: '#0d7d7a', hole: 0.3 },
    { N: 32, co: 5, L: 2, c: 'cream', c2: '#d9b9a6' }, { N: 50, mesh: 6, a: 0.9, L: 2, c: 'verm', c2: '#b83a12' }, { N: 53, mesh: 0, a: -0.75, L: 0, c: 'navy', c2: '#0b1026' },
    { N: 27, co: 8, L: 1, c: GOLD, c2: '#c99a2e' }, { N: 60, mesh: 9, a: -1.6, L: 1, c: 'cream', c2: '#d9b9a6' }, { N: 57, mesh: 0, a: 2.5, L: 0, c: 'blue', c2: '#1d1dc0' }];
  GE.forEach((g) => { g.p = PR(g.N); g.R = g.p + GM; g.dp = (2.2 * GM) / g.R; g.h = TAU / g.N;
    if (g.mesh !== undefined) { const q = GE[g.mesh], d = q.p + g.p; g.at = [q.at[0] + Co(g.a) * d, q.at[1] + S(g.a) * d]; } else if (g.co !== undefined) g.at = GE[g.co].at.slice(); });
  const gearAng = (th0) => { const th = []; GE.forEach((g, i) => { if (i === 0) th.push(th0); else if (g.co !== undefined) th.push(th[g.co] * 1 + 0.3); else { const q = GE[g.mesh]; th.push(g.a + PI + (g.a - th[g.mesh]) * (q.N / g.N) - 1.32 * g.h); } }); return th; };

  // ===== 3) フーリエ級数：ホルスの目を1本の線にして、64個の回る円で描く =====
  const EYE = (() => {
    const bez = (a, b, c, d, n) => range(n + 1).map((i) => { const u = i / n, v = 1 - u; return [v * v * v * a[0] + 3 * v * v * u * b[0] + 3 * v * u * u * c[0] + u * u * u * d[0], v * v * v * a[1] + 3 * v * v * u * b[1] + 3 * v * u * u * c[1] + u * u * u * d[1]]; });
    const seg = (a, b, n = 6) => range(n + 1).map((i) => [a[0] + ((b[0] - a[0]) * i) / n, a[1] + ((b[1] - a[1]) * i) / n]), rev = (p) => p.slice().reverse();
    const LC = [-0.95, 0.02], RC = [0.95, 0.06], upper = bez(LC, [-0.55, 0.42], [0.45, 0.46], RC, 30), low = bez(RC, [0.55, -0.26], [-0.45, -0.26], LC, 30), iS = 9, iT = 19;
    const sp = [low[iS], [0.36, -0.4], [0.48, -0.62], [0.66, -0.78], [0.86, -0.8], [1.0, -0.68], [0.98, -0.53], [0.86, -0.49], [0.79, -0.58], [0.85, -0.65]], te = [low[iT], [-0.27, -0.45], [-0.3, -0.7], [-0.33, -0.86], [-0.24, -0.92], [-0.2, -0.82]];
    const pupil = range(25).map((i) => { const a = PI / 2 - (i / 24) * TAU; return [0.02 + 0.2 * Co(a), 0.08 + 0.2 * S(a)]; }), top = upper[15];
    const brow = bez([-1.0, 0.56], [-0.4, 0.86], [0.6, 0.84], [1.3, 0.66], 26), brow2 = bez([1.3, 0.58], [0.6, 0.72], [-0.4, 0.74], [-1.0, 0.47], 26);
    const s1 = bez(sp[0], sp[1], sp[2], sp[3], 8), s2 = seg(sp[3], sp[4], 3), s3b = bez(sp[4], sp[5], sp[6], sp[7], 8), s4 = seg(sp[7], sp[8], 2), s5 = seg(sp[8], sp[9], 2);
    const t1 = bez(te[0], te[1], te[2], te[3], 8), t2 = seg(te[3], te[4], 2), t3 = seg(te[4], te[5], 2);
    const T = [].concat(upper.slice(0, 16), seg(top, [0.02, 0.28], 3), pupil, seg([0.02, 0.28], top, 3), upper.slice(15), seg(RC, [1.4, 0.03], 8), seg([1.4, 0.03], RC, 8),
      low.slice(0, iS + 1), s1, s2, s3b, s4, s5, rev(s5), rev(s4), rev(s3b), rev(s2), rev(s1), low.slice(iS, iT + 1), t1, t2, t3, rev(t3), rev(t2), rev(t1), low.slice(iT),
      seg(LC, [-1.0, 0.56], 5), brow, seg([1.3, 0.66], [1.3, 0.58], 1), brow2, seg([-1.0, 0.47], LC, 5));
    const Ls = [0]; for (let i = 1; i < T.length; i++) Ls.push(Ls[i - 1] + Math.hypot(T[i][0] - T[i - 1][0], T[i][1] - T[i - 1][1]));
    const tot = Ls[Ls.length - 1] + Math.hypot(T[0][0] - T[T.length - 1][0], T[0][1] - T[T.length - 1][1]), N = 256, R = []; let j = 0;
    for (let k = 0; k < N; k++) { const s = (k / N) * tot; while (j < T.length - 2 && Ls[j + 1] < s) j++; const a = T[j], b = T[j + 1], f = Math.min(1, (s - Ls[j]) / Math.max(1e-9, Ls[j + 1] - Ls[j])); R.push([a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]); }
    const C = []; for (let k = -N / 2; k < N / 2; k++) { let re = 0, im = 0; R.forEach((p, n) => { const a = (-TAU * k * n) / N, c = Co(a), s = S(a); re += p[0] * c - p[1] * s; im += p[0] * s + p[1] * c; }); C.push([k, re / N, im / N, Math.hypot(re / N, im / N)]); }
    C.sort((a, b) => b[3] - a[3]);
    const use = C.slice(0, 64);
    const at = (u, upto = 64) => { let x = 0, y = 0; for (let i = 0; i < upto; i++) { const [k, re, im] = use[i], a = TAU * k * u; x += re * Co(a) - im * S(a); y += re * S(a) + im * Co(a); } return [x, y]; };
    const chain = (u) => { const pts = []; let x = 0, y = 0; for (let i = 0; i < 64; i++) { pts.push([x, y]); const [k, re, im] = use[i], a = TAU * k * u; x += re * Co(a) - im * S(a); y += re * S(a) + im * Co(a); } pts.push([x, y]); return pts; };
    const curve = range(601).map((i) => at(i / 600));
    return { use, at, chain, curve };
  })();

  return [
    { // 2) アンティキティラの機械：ばらばらの歯車が手前と奥から集まり、歯の数の比どおりに回り出す。太陽と月の針、月の満ち欠けの玉
      name: 'ANTIKYTHERA', bg: 'teal', sel: 's24',
      cam: (tb, t) => ({ pitch: 0.12 + 0.07 * S(t * 0.4), dist: 10.4, zoom: 1.16 + 0.1 * io(cl((tb - 1) / 3)), t: [0, 0.7, 0], tilt: 0.6 }),
      act: (t, tb) => {
        const o = {}, C = [0, 0.35, 0], cd = card(t, C, 0.34, 0, -0.06, 0.18), gap = 0.07 + 0.55 * (1 - io(cl((tb - 0.15) / 1.5))) + 0.42 * io(cl((tb - 3.7) / 0.9));   // 最後に、もう一度ばらして奥行きを見せる
        const yr = 6, th0 = (-TAU * tb) / yr, th = gearAng(th0), lz = (L) => (L - 1) * gap;
        GE.forEach((g, i) => { const R = mat(0, 0, th[i]), M = mmul(cd.M, R); o['gr' + i] = { p: cd.P(g.at[0], g.at[1], lz(g.L)), r: eul(M), w: g.R, n: g.N, dp: g.dp, c: g.c, c2: g.c2, ext: 0.55, hole: g.hole || 0.22, hub: g.hole && g.hole > 0.5 ? null : 'navy' }; });
        [0, PI / 2].forEach((a, n) => { o['s' + (24 + n)] = Object.assign({ p: cd.P(0, 0, lz(0) + 0.01), r: eul(mmul(cd.M, mat(0, 0, th0 + a))), bw: GE[0].R * 1.78, bh: 0.075, bd: 0.03 }, K.bc('orange')); });   // 大歯車の4本の腕
        const LZ = lz(3) + 0.02;   // いちばん前の文字盤
        range(12).forEach((k) => { o['sc' + k] = { p: cd.P(0, 0, LZ), r: cd.rr, ro: 1.5, ri: 1.31, a0: (k * TAU) / 12 + 0.012, a1: ((k + 1) * TAU) / 12 - 0.012, c: k % 2 ? 'cream' : 'navy', alpha: 0.92 }; });
        const segs = []; range(73).forEach((k) => { const a = (k * TAU) / 73, r1 = k % 6 ? 1.6 : 1.67; segs.push([cd.P(Co(a) * 1.53, S(a) * 1.53, LZ), cd.P(Co(a) * r1, S(a) * r1, LZ)]); });
        o.ln0 = { segs, c: 'cream', lw: 1, alpha: 0.85, zp: cd.P(0, 0, LZ) };
        const as = th0 + PI / 2, am = as * 13.368, sunT = cd.P(Co(as) * 1.38, S(as) * 1.38, LZ + 0.05), moonT = cd.P(Co(am) * 1.05, S(am) * 1.05, LZ + 0.08);
        o.ln1 = { pts: [cd.P(0, 0, LZ + 0.05), sunT], c: GOLD, lw: 3.5, alpha: 1, cap: 'round', zp: sunT };
        o.ln2 = { pts: [cd.P(0, 0, LZ + 0.08), moonT], c: 'white', lw: 2, alpha: 1, cap: 'round', zp: moonT };
        o.b0 = { p: sunT, w: 0.11, g: ['white', GOLD, 'orange'] }; o.gw0 = { p: sunT, w: 0.22, c: 'white', c2: GOLD, alpha: 0.7, mode: 'screen' };
        o.fl0 = { p: moonT, bill: 1, shape: 'circle', w: 0.1, c: 'white', split: 'navy', sa: am - as };   // 月の満ち欠け
        o.b1 = { p: cd.P(0, 0, LZ + 0.1), w: 0.07, g: ['white', '#bdbdbd', '#3a3a3a'] };
        const MC = cd.P(0, 2.45, lz(0)), turns = 5, spi = range(181).map((i) => { const u = i / 180, a = u * turns * TAU, r = 0.25 + u * 0.45; return add(MC, mv(cd.M, [Co(a) * r, S(a) * r, 0])); });   // 上の文字盤：メトン周期の5重らせん
        o.ln3 = { pts: spi, c: 'cream', lw: 1.3, alpha: 0.9, zp: MC };
        const mu = fr(tb / 4.5), ma = mu * turns * TAU, mr = 0.25 + mu * 0.45, mp = add(MC, mv(cd.M, [Co(ma) * mr, S(ma) * mr, 0.03]));
        o.ln4 = { pts: [MC, mp], c: 'verm', lw: 2.5, alpha: 1, zp: mp }; o.b2 = { p: mp, w: 0.07, g: BC[0] };
        o.tx0 = { p: add(MC, [0, 0.95, 0]), str: 'METONIC · 19 y = 235 m', s: 0.11, c: 'cream' };
        o.tx1 = { p: cd.P(0, -2.0, 0), str: 'ANTIKYTHERA · c. 100 BC', s: 0.15, c: 'navy' };
        o.tx2 = { p: cd.P(0, -2.25, 0), str: 'SAROS 223 m = 18.03 y · 223 : 64 · 38 : 48 · 24 : 127', s: 0.085, c: 'navy' };
        o.tx3 = { p: cd.P(-1.75, 1.75, 0.2), str: 'YEAR ' + (-100 + Math.floor(tb / yr * 1)) + ' · ' + Math.floor(fr(tb / yr) * 365) + ' d', s: 0.1, c: 'cream' };
        o.tx4 = { p: cd.P(1.9, -1.0, 0.2), str: 'ω ∝ 1 / N', s: 0.12, c: 'cream' };
        range(4).forEach((n) => { const g = GE[[0, 5, 1, 10][n]]; o['tx' + (5 + n)] = { p: cd.P(g.at[0] + g.R * 0.75, g.at[1] - g.R * 0.75 - 0.08, lz(g.L) + 0.1), str: 'N = ' + g.N, s: 0.08, c: 'cream' }; });
        range(4).forEach((n) => { const sz = [14, 20, 10, 16][n], R0 = 0.12 + n * 0.03, a = ang(n, 4, t * 0.1 + 0.4), q = [Co(a) * 3.2, -1.6 + n * 0.5, S(a) * 3.2]; o['gr' + (12 + n)] = { p: q, r: [0, -a + PI / 2, t * (n % 2 ? 1 : -1) * 1.2], w: R0, n: sz, dp: 0.22, c: ['cream', GOLD, 'navy', 'verm'][n], c2: '#0d7d7a', ext: 0.5, hole: 0.25 }; });
        ancRing(o, t, 4.2, 0.9, 'cream', 0.25);
        spin(o, 0, 10, 3.9, -1.9, t, t * 0.15, 0.3, 0.25);
        eq(o, 0, 14, 4.4, -2.3, t, 1.0, 0.18, 0.32, t * 0.05);
        lane(o, 't', 0, 14, 4.9, 2.4, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, -2.3, 0], r: FLOOR, c: 'cream', alpha: 0.35 }; o.r0 = { p: [0, -2.3, 0], r: FLOOR, w: 3.6, c: 'cream', alpha: 0.5 };
        return o;
      }
    },
    { // 3) フーリエ級数：64個の円が、それぞれの速さで回る。つながった先のペンが、ホルスの目を1本の線で描く
      name: 'EPICYCLE', bg: 'navy', sel: 's0',
      cam: (tb, t) => ({ pitch: 0.1 + 0.06 * S(t * 0.4), dist: 10.2, zoom: 1.18 + 0.1 * io(cl(tb / 4)), t: [0, 0.75, 0], tilt: 0.6 }),
      act: (t, tb) => {
        const o = {}, SC = 1.45, C = [0, 0.75, 0], cd = card(t, C, 0.42, 0.5, -0.05), u = cl((tb - 0.25) / 3.7), uu = tb < 3.95 ? u : fr((tb - 3.95) / 3.7);
        const ch = EYE.chain(uu), DZ = 0.032, pts = ch.map(([x, y], i) => cd.P(x * SC, y * SC, (64 - i) * DZ * (1 - 0.6 * io(cl((tb - 4) / 1)))));
        range(28).forEach((i) => { const r = EYE.use[i][3] * SC; o['ep' + i] = { p: pts[i], r: cd.rr, w: r, c: i < 2 ? 'cream' : RAIN[i % 8], lw: i < 6 ? 1.3 : 1, alpha: i < 6 ? 0.75 : 0.55 }; });
        o.ln0 = { pts, c: 'white', lw: 1.3, alpha: 0.9, zp: pts[0] };
        const jp = []; pts.slice(1, 40).forEach((p) => jp.push(p[0], p[1], p[2])); o.du1 = { pts: jp, size: 0.035, c: 'white', alpha: 0.9, zp: pts[0] };
        const n = Math.max(2, Math.floor(u * 600)), cur = EYE.curve.slice(0, n + 1).map(([x, y]) => cd.P(x * SC, y * SC, 0));
        o.ln1 = { pts: cur, c: GOLD, lw: 2.6, alpha: 1, zp: C, z: -0.02 }; o.ln2 = { pts: cur, c: GOLD, lw: 9, alpha: 0.2, zp: C, z: -0.01 };
        const pen = pts[64]; o.gw0 = { p: pen, w: 0.2 + 0.05 * S(t * 12), c: 'white', c2: GOLD, z: -0.03 }; o.b4 = { p: pen, w: 0.06, g: BC[1] };
        const done = cl((tb - 3.95) / 0.6);
        if (done > 0) { o.fl1 = { p: cd.P(0.02 * SC, 0.08 * SC, -0.01), r: cd.rr, shape: 'circle', w: 0.2 * SC * io(done), g: ['white', GOLD, 'orange'], ga: PI / 2 }; o.gw1 = { p: cd.P(0.02 * SC, 0.08 * SC, 0.02), w: 0.55 * done, c: GOLD, c2: 'orange', alpha: 0.3 }; }
        o.tx0 = { p: cd.P(0, -1.55, 0), str: 'WEDJAT · EYE OF HORUS', s: 0.15, c: 'cream' };
        o.tx1 = { p: cd.P(0, -1.8, 0), str: 'Σ c(k) · e^(2πikt) · 64 CIRCLES · ' + Math.round(u * 100) + '%', s: 0.09, c: GOLD };
        // 左上：プトレマイオスの「周転円」— 惑星が逆行して、輪を描く
        const PL = cd.P(-2.15, 2.15, -0.6), P2 = (x, y) => add(PL, mv(cd.M, [x, y, 0])), w1 = 0.8, w2 = 5.6, ep = (tt) => [0.5 * Co(w1 * tt) + 0.18 * Co(w2 * tt), 0.5 * S(w1 * tt) + 0.18 * S(w2 * tt)];
        o.r0 = { p: PL, r: cd.rr, w: 0.5, c: 'cream', lw: 1, alpha: 0.6 }; const ec = [0.5 * Co(w1 * t), 0.5 * S(w1 * t)]; o.r1 = { p: P2(ec[0], ec[1]), r: cd.rr, w: 0.18, c: 'pink', lw: 1.2, alpha: 0.8 };
        o.ln3 = { pts: range(90).map((i) => { const q = ep(t - i * 0.05); return P2(q[0], q[1]); }), c: 'pink', lw: 2, alpha: 0.85, zp: PL };
        const pq = ep(t); o.b5 = { p: P2(pq[0], pq[1]), w: 0.06, g: BC[4] }; o.b6 = { p: PL, w: 0.09, g: BC[3] };
        o.ln4 = { segs: [[PL, P2(ec[0], ec[1])], [P2(ec[0], ec[1]), P2(pq[0], pq[1])]], c: 'cream', lw: 1, alpha: 0.8, zp: PL };
        o.tx2 = { p: add(PL, [0, 0.78, 0]), str: 'PTOLEMY · c. 150 AD · RETROGRADE', s: 0.08, c: 'pink' };
        // 床：円の大きさ（スペクトル）の棒グラフ
        range(32).forEach((k) => { const a = ang(k, 32, t * 0.06), h = 0.1 + 1.5 * Math.sqrt(EYE.use[k][3] / EYE.use[0][3]) * (0.85 + 0.15 * Math.abs(S(t * 2.4 + k))); o['s' + k] = Object.assign({ p: [Co(a) * 3.3, -2.3 + h / 2, S(a) * 3.3], r: [0, -a, 0], bw: 0.16, bh: h, bd: 0.16 }, K.bc(['cream', 'teal', 'blue', 'pink', 'orange', 'verm', 'white', 'peach'][k % 8])); });
        const st = []; range(240).forEach((i) => { const th = rnd(i * 3) * TAU + t * 0.02, ph = Math.acos(2 * rnd(i * 7 + 1) - 1), R = 7 + 2 * rnd(i * 5); st.push(R * S(ph) * Co(th), R * Co(ph) * 0.7 + 1, R * S(ph) * S(th)); });
        o.du0 = { pts: st, size: 0.04, max: 2.5, c: 'cream', alpha: 0.7, z: -80 };
        ancRing(o, t, 4.3, 0.2, 'cream', 0.3);
        spin(o, 0, 8, 3.9, -1.8, t, t * 0.12, 0.26, 0.2);
        o.dots0 = { p: [0, -2.3, 0], r: FLOOR, c: 'cream', alpha: 0.3 }; o.r2 = { p: [0, -2.3, 0], r: FLOOR, w: 3.0, c: 'cream', alpha: 0.4 };
        return o;
      }
    }
  ];
};
