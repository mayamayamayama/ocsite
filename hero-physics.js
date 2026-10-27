// hero-physics.js — 入場画面の別バージョン「物理」：物体の一覧・道具と、ショット 1〜3（4〜6 は hero-physics2.js、7〜8 は hero-physics3.js）
// どのショットも、始まった瞬間に「実験」がスタートします（tb：ショットが始まってからの秒数 を、実験の時計に使う）。
// ゴルトンボード・ドミノ・振り子の波・二重振り子のカオス・重力の井戸・波の干渉・ビリヤードの衝突・光の屈折。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-physics');

(window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).physics = function (cfg) {
  const K = window.OC_HERO_KIT(cfg);
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp3, mat, mv, eul, nrm, lane, floorRing, eq, spin, hop, orb, camYaw } = K;
  const A = K.roster({});
  K.pool(A, 'pg', 60, () => ({ type: 'sphere', w: 0.05, g: ['white', '#cfd3dc', '#5a6270', '#1b1b1b'] }));   // くぎ・小さな玉
  K.pool(A, 'bl', 64, () => ({ type: 'sphere', w: 0.08 }));   // 玉
  K.pool(A, 'dm', 72, () => Object.assign({ type: 'box', bw: 0.22, bh: 0.42, bd: 0.055 }, K.bc('cream')));   // ドミノ
  K.pool(A, 'ln', 64, () => ({ type: 'path', c: 'navy', lw: 1.5, alpha: 0.9, cap: 'round' }));   // 線
  K.pool(A, 'eq', 10, () => ({ type: 'text', str: '', s: 0.15, c: 'navy', alpha: 0.85, bill: 1 }));   // 式
  // 玉の色（白 → 色 → 濃い色）
  const BC = [['white', '#ffb08a', 'verm'], ['white', '#ffd27a', 'orange'], ['white', '#9ae8e4', 'teal'], ['white', '#9ad7ff', 'blue'], ['white', '#ff9ad5', 'pink'], ['white', '#fff4ea', '#d9b9a6'], ['white', '#5c6aa8', 'navy'], ['white', '#f4ffb0', '#9fbd00']];
  const RAIN = ['verm', 'orange', '#ffd27a', 'teal', 'cyan', 'blue', 'pink', 'navy'];
  const BOXN = ['verm', 'orange', 'cream', 'teal', 'blue', 'navy', 'pink', 'peach'];
  const EQS = ['F = ma', 'E = mc²', 'p = mv', 'Δx·Δp ≥ ħ/2', 'T = 2π√(L/g)', 'F = Gm₁m₂/r²', 'v² = u² + 2as', '∇·E = ρ/ε₀', 'λ = h/p', 'S = k log W'];
  const eqRing = (o, t, R, y, c, tl = 0.35) => range(10).forEach((k) => { const q = orb(R, t * 0.07 + (k * TAU) / 10, tl, 0.6); o['eq' + k] = { p: [q[0], q[1] + y, q[2]], str: EQS[k], s: 0.14, c }; });
  const RT = (t) => { const c = camYaw(t); return [Co(c), 0, -S(c)]; };   // カメラから見た「右」
  // カメラの方を向く板の上の点（P0 を原点に、右へ x、上へ y）
  const onCard = (P0, t, x, y, z = 0) => { const r = RT(t), f = [-r[2], 0, r[0]]; return [P0[0] + r[0] * x + f[0] * z, P0[1] + y, P0[2] + r[2] * x + f[2] * z]; };
  const X = { BC, RAIN, BOXN, EQS, eqRing, RT, onCard };

  // ===== ゴルトンボード：玉ごとに「右か左か」を決めておき、どの箱に何番目に入るかも先に数えておく =====
  const GR = 10, DX = 0.34, DY = 0.27, BR = 0.062, NB = 60, TOP = 2.05, BIN0 = TOP - GR * DY - 0.55;
  const GB = range(NB).map((i) => { const st = range(GR).map((r) => (rnd(i * 37 + r * 3 + 1) < 0.5 ? -1 : 1)); return { st, bin: st.filter((s) => s > 0).length }; });
  const CNT = {}; GB.forEach((b) => { b.stack = CNT[b.bin] = (CNT[b.bin] || 0) + 1; b.stack--; });
  const gx = (b, r) => (DX / 2) * b.st.slice(0, r).reduce((a, s) => a + s, 0);
  // ===== ドミノ：らせんの上に、等間隔に並べる =====
  const DOM = []; { let th = 2.2; while (DOM.length < 70) { const r = 0.42 + 0.13 * th, P = [r * Co(th), r * S(th)], T = nrm([0.13 * Co(th) - r * S(th), 0, 0.13 * S(th) + r * Co(th)]); DOM.push({ P, T, psi: Math.atan2(T[0], T[2]) }); th += 0.2 / Math.hypot(r, 0.13); } }
  const domT = (k) => 0.5 + k * 0.062, FALL = 0.24;
  const domFront = (tb) => { const k = Math.max(0, Math.min(69, (tb - 0.5) / 0.062)), i = Math.floor(k), f = k - i, a = DOM[i].P, b = DOM[Math.min(69, i + 1)].P; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };

  const shots = [
    { // 1) ゴルトンボード：60個の玉が、くぎに当たって右か左へ。箱にたまると、きれいな山（正規分布）になる
      name: 'GALTON', bg: 'cream', sel: 'bl0',
      cam: (tb, t) => ({ pitch: 0.1 + 0.06 * S(t * 0.45), dist: 10.5, zoom: 1.0 + 0.22 * io(cl(tb / 5)), t: [0, 0.3 - 0.35 * io(cl(tb / 5)), 0], tilt: 0.5 }),
      act: (t, tb) => {
        const o = {}, F = -2.3, M = mat(0, camYaw(t) + 0.32 * S(t * 0.25), 0), rr = eul(M), P = (x, y, z = 0) => mv(M, [x, y, z]), hopT = 0.105;
        o.fl0 = { p: P(0, 0.15, -0.14), r: rr, shape: 'square', w: 2.05, sx: 1, sy: 1.25, c: 'white', ext: 0.3, c2: '#d9b9a6', alpha: 0.95 };   // 板
        let n = 0; range(GR).forEach((r) => range(r + 1).forEach((j) => { o['pg' + n++] = { p: P(DX * (j - r / 2), TOP - r * DY, 0) }; }));   // くぎ
        range(GR + 2).forEach((j) => { o['s' + j] = Object.assign({ p: P(DX * (j - (GR + 1) / 2), BIN0 + 0.6, 0), r: rr, bw: 0.025, bh: 1.2, bd: 0.12 }, K.bc('navy')); });   // 仕切り
        o.s12 = Object.assign({ p: P(-0.28, TOP + 0.55, 0), r: eul(K.mmul(M, mat(0, 0, -0.75))), bw: 0.5, bh: 0.05, bd: 0.12 }, K.bc('teal'));   // じょうご
        o.s13 = Object.assign({ p: P(0.28, TOP + 0.55, 0), r: eul(K.mmul(M, mat(0, 0, 0.75))), bw: 0.5, bh: 0.05, bd: 0.12 }, K.bc('teal'));
        let rel = 0; GB.forEach((b, i) => { const t0 = 0.3 + i * 0.07, u = (tb - t0) / hopT;
          if (tb < t0) { const q = t0 - tb; if (q < 0.65) o['bl' + i] = { p: P(0.03 * S(i * 3), TOP + 0.38 + q * 0.75, 0.02), w: BR, g: BC[b.bin % 8] }; return; }
          rel++;
          if (u < GR) { const r = Math.floor(u), f = u - r, x = gx(b, r) + (gx(b, r + 1) - gx(b, r)) * f, y = TOP - r * DY + 0.1 - DY * f + 0.1 * S(PI * f); o['bl' + i] = { p: P(x, y, 0.02), w: BR, g: BC[b.bin % 8] }; return; }
          const v = (tb - t0 - GR * hopT), y0 = TOP - GR * DY + 0.1, ys = BIN0 + BR + b.stack * BR * 1.96; o['bl' + i] = { p: P(DX * (b.bin - GR / 2), Math.max(ys, y0 - 4.5 * v * v - 0.6 * v), 0.02), w: BR, g: BC[b.bin % 8] }; });
        const reveal = cl((tb - 3.2) / 1.6), sg = 1.58, G = range(41).filter((i) => i / 40 <= reveal + 1e-6).map((i) => { const j = (i / 40) * GR, pdf = Math.exp(-((j - 5) * (j - 5)) / (2 * sg * sg)) / (sg * Math.sqrt(TAU)); return P(DX * (j - GR / 2), BIN0 + NB * pdf * BR * 1.96 + 0.05, 0.06); });
        if (G.length > 1) o.ln0 = { pts: G, c: 'verm', lw: 3, alpha: 1, zp: P(0, BIN0, 0.5) };
        range(11).forEach((j) => { o['tx' + j] = { p: P(DX * (j - GR / 2), BIN0 - 0.18, 0.05), str: String(CNT[j] && tb > 0.3 + NB * 0.07 + 1.2 ? CNT[j] : j), s: 0.09, c: 'navy' }; });
        o.tx11 = { p: P(0, TOP + 1.05, 0), str: 'n = 10 · p = ½ · σ ≈ 1.58 · ' + rel + ' / ' + NB, s: 0.11, c: 'navy' };
        eqRing(o, t, 3.8, 0.6, 'navy');
        eq(o, 14, 16, 4.4, F, t, 1.1, 0.2, 0.36, t * 0.05);
        spin(o, 0, 8, 3.4, -1.7, t, -t * 0.15, 0.28, 0.25);
        lane(o, 't', 0, 14, 4.8, 2.2, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        floorRing(o, 't', 14, 12, 2.9, F + 0.02, t * 0.1, () => ({ w: 0.22 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.4 }; o.r0 = { p: [0, F, 0], r: FLOOR, w: 4.2, c: 'verm', alpha: 0.5 };
        return o;
      }
    },
    { // 2) ドミノ：らせんに並んだ70枚のドミノが、真ん中から外へ倒れていく。カメラは倒れる先を追いかける。最後の1枚が玉をはじく
      name: 'DOMINO', bg: 'teal', sel: 'dm35',
      cam: (tb, t) => { const f = domFront(tb); return { pitch: 0.55 + 0.08 * S(t * 0.4), dist: 9.2, zoom: 1, t: [f[0] * 0.45, -1.6, f[1] * 0.45] }; },
      act: (t, tb) => {
        const o = {}, F = -2.3, H = 0.42, D = 0.055, trail = [];
        DOM.forEach((d, k) => { const u = cl((tb - domT(k)) / FALL), ph = (k === 69 ? 1.45 : 1.22) * u * u, M = mat(ph, d.psi, 0), base = [d.P[0], F, d.P[1]], piv = add(base, [d.T[0] * D / 2, 0, d.T[2] * D / 2]);
          o['dm' + k] = Object.assign({ p: add(piv, mv(M, [0, H / 2, -D / 2])), r: [ph, d.psi, 0] }, K.bc(BOXN[Math.floor(k / 9) % 8]));
          if (u > 0.5) trail.push([base[0], F + 0.01, base[2]]); });
        if (trail.length > 1) o.ln0 = { pts: trail, c: 'cream', lw: 3, alpha: 0.9, zp: [0, F, 0], z: -1 };
        const f = domFront(tb), fk = Math.min(69, Math.max(0, Math.floor((tb - 0.5) / 0.062)));
        o.b0 = { p: [f[0], F + 0.75 + 0.08 * S(t * 8), f[1]], w: 0.09, g: ['white', '#ffd27a', 'orange'] }; o.r0 = { p: [f[0], F + 0.01, f[1]], r: FLOOR, w: 0.35 + 0.05 * S(t * 10), c: 'white', lw: 2, alpha: 0.9 };
        const L = DOM[69], tEnd = domT(69) + FALL, rv = Math.max(0, tb - tEnd), dist = Math.min(2.4, rv * 2.2 - rv * rv * 0.45);   // 最後に玉が転がる
        o.chrome0 = { p: [L.P[0] + L.T[0] * (0.3 + dist), F + 0.16, L.P[1] + L.T[2] * (0.3 + dist)], w: 0.16 };
        if (rv > 0.6) { const v = cl((rv - 0.6) / 1.2); o.r1 = { p: [L.P[0] + L.T[0] * 2.7, F + 0.02, L.P[1] + L.T[2] * 2.7], r: FLOOR, w: 0.2 + v * 1.4, c: 'cream', lw: 2, alpha: 1 - v }; o.burst1 = { p: [L.P[0] + L.T[0] * 2.7, F + 0.3, L.P[1] + L.T[2] * 2.7], bill: 1, w: 0.3 + v * 0.6, c: 'cream', alpha: 1 - v }; }
        o.tx0 = { p: [0, 1.0, 0], str: 'n = ' + String(Math.min(70, fk + 1)).padStart(2, '0') + ' / 70', s: 0.22, c: 'cream' };
        o.tx1 = { p: [0, 0.65, 0], str: 'WAVE SPEED ' + (0.2 / 0.062).toFixed(2) + ' m/s · Δt = 62 ms', s: 0.1, c: 'navy' };
        o.fl0 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 3.0, c: '#0d7d7a', alpha: 0.6, z: -60 };
        eqRing(o, t, 4.0, 0.9, 'cream', 0.25);
        spin(o, 0, 10, 4.2, -1.0, t, t * 0.15, 0.28, 0.3);
        hop(o, 1, 10, 3.4, F + 0.12, t, 0.5, -t * 0.2, 0.15);
        lane(o, 't', 0, 14, 4.9, 1.8, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, F - 0.005, 0], r: FLOOR, c: 'cream', alpha: 0.35 }; o.r2 = { p: [0, F, 0], r: FLOOR, w: 3.6, c: 'cream', alpha: 0.5 };
        return o;
      }
    },
    { // 3) 振り子の波：長さの違う16本の振り子が、いっせいに揺れ始める。周期のずれで、へびのような波や、2列・3列の模様が現れる。奥にはニュートンのゆりかご
      name: 'PENDULUM', bg: 'navy', sel: 'bl8',
      cam: (tb, t) => ({ pitch: 0.18 + 0.1 * S(t * 0.4), dist: 10.5, zoom: 1, t: [0, 0.6, 0] }),
      act: (t, tb) => {
        const o = {}, F = -2.3, N = 16, PY = 2.55, T0 = 1.5, th = (k, tt) => 0.42 * Co((TAU * tt) / (30 / (20 + k)));
        o.s0 = Object.assign({ p: [0, PY + 0.06, 0], bw: 5.0, bh: 0.1, bd: 0.12 }, K.bc('steel')); o.s1 = Object.assign({ p: [-2.55, (PY + F) / 2, 0], bw: 0.1, bh: PY - F, bd: 0.1 }, K.bc('steel')); o.s2 = Object.assign({ p: [2.55, (PY + F) / 2, 0], bw: 0.1, bh: PY - F, bd: 0.1 }, K.bc('steel'));
        const bob = (k, tt) => { const L = 2.85 * Math.pow(20 / (20 + k), 2), a = th(k, tt); return [-2.25 + k * 0.3, PY - L * Co(a), L * S(a)]; };
        range(N).forEach((k) => { const q = bob(k, tb), pv = [-2.25 + k * 0.3, PY, 0];
          o['bl' + k] = { p: q, w: 0.13, g: BC[k % 8] }; o['ln' + k] = { pts: [pv, q], c: 'cream', lw: 1, alpha: 0.7, zp: lerp3(pv, q, 0.5) };
          o['ln' + (16 + k)] = { pts: range(14).map((i) => bob(k, tb - i * 0.035)), c: RAIN[k % 8], lw: 3, alpha: 0.55, zp: q, z: -0.05 }; });
        const CR = [0, -0.95, -2.3], w5 = TAU / 1.2, s5 = S(w5 * tb), segs = [];   // ニュートンのゆりかご
        range(5).forEach((k) => { const a = k === 0 ? Math.min(0, 0.6 * s5) : k === 4 ? Math.max(0, 0.6 * s5) : 0, pv = [CR[0] - 0.4 + k * 0.2, CR[1] + 1.0, CR[2]], q = [pv[0] + S(a) * 0.9, pv[1] - Co(a) * 0.9, pv[2]];
          o['bl' + (16 + k)] = { p: q, w: 0.1 }; segs.push([[pv[0], pv[1], pv[2] - 0.2], q], [[pv[0], pv[1], pv[2] + 0.2], q]); });
        o.ln32 = { segs, c: 'cream', lw: 1, alpha: 0.7, zp: CR }; o.s3 = Object.assign({ p: [CR[0], CR[1] + 1.02, CR[2]], bw: 1.4, bh: 0.05, bd: 0.5 }, K.bc('steel')); o.s4 = Object.assign({ p: [CR[0], F + 0.04, CR[2]], bw: 1.6, bh: 0.08, bd: 0.7 }, K.bc('navy'));
        if (Math.abs(s5) > 0.97) o.burst1 = { p: [CR[0] + (s5 > 0 ? 0.3 : -0.3), CR[1] + 0.1, CR[2]], bill: 1, w: 0.25, c: 'cream', alpha: 0.9 };
        const PL = [3.3, 0.6, 0.6]; o.ln33 = { pts: range(60).map((i) => { const tt = tb - i * 0.04; return onCard(PL, t, th(0, tt) * 1.3, th(15, tt) * 1.3); }), c: '#ffd27a', lw: 2, alpha: 0.9, zp: PL };   // 位相の図（リサジュー）
        o.tx0 = { p: [PL[0], PL[1] + 0.85, PL[2]], str: 'θ₀ × θ₁₅', s: 0.1, c: '#ffd27a' };
        o.tx1 = { p: [0, PY + 0.45, 0], str: 'Tₖ = 30 / (20 + k) s · ' + tb.toFixed(1) + ' s', s: 0.13, c: 'cream' }; o.tx2 = { p: [0, PY + 0.75, 0], str: 'PENDULUM WAVE', s: 0.2, c: 'cream' };
        eqRing(o, t, 4.2, 0.2, 'cream', 0.3);
        spin(o, 0, 8, 3.9, -1.9, t, t * 0.12, 0.26, 0.2);
        lane(o, 't', 0, 14, 4.9, 2.4, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.14 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'cream', alpha: 0.35 }; o.r0 = { p: [0, F, 0], r: FLOOR, w: 4.2, c: 'cream', alpha: 0.4 };
        return o;
      }
    }
  ];
  return { shots: shots.concat(typeof window.OC_HERO_PHYS2 === 'function' ? window.OC_HERO_PHYS2(K, X) : [], typeof window.OC_HERO_PHYS3 === 'function' ? window.OC_HERO_PHYS3(K, X) : []), actors: A };
};
