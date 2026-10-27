// hero-physics2.js — 入場画面「物理」のバージョンの、ショット 4〜6（二重振り子のカオス・重力の井戸・波の干渉）
// hero-physics.js から呼ばれます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-physics2');

window.OC_HERO_PHYS2 = function (K, X) {
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp3, mat, mv, eul, nrm, lane, floorRing, eq, spin, hop, orb, camYaw } = K;
  const { BC, RAIN, eqRing, onCard } = X;
  // ===== 二重振り子：5本を、ほんの少しだけ違う角度から放す。ルンゲ・クッタ法で 8 秒ぶん先に計算しておく =====
  const DP = (() => { const g = 9.81, dt = 1 / 600, out = [];
    const f = (y) => { const [a1, a2, w1, w2] = y, d = a1 - a2, den = 3 - Co(2 * d);
      return [w1, w2, (-g * 3 * S(a1) - g * S(a1 - 2 * a2) - 2 * S(d) * (w2 * w2 + w1 * w1 * Co(d))) / den, (2 * S(d) * (w1 * w1 * 2 + g * 2 * Co(a1) + w2 * w2 * Co(d))) / den]; };
    range(5).forEach((k) => { let y = [2.3, 2.6 + k * 0.0015, 0, 0]; const rec = [y.slice(0, 2)];
      for (let i = 1; i <= 4800; i++) { const k1 = f(y), k2 = f(y.map((v, j) => v + (dt / 2) * k1[j])), k3 = f(y.map((v, j) => v + (dt / 2) * k2[j])), k4 = f(y.map((v, j) => v + dt * k3[j]));
        y = y.map((v, j) => v + (dt / 6) * (k1[j] + 2 * k2[j] + 2 * k3[j] + k4[j])); if (i % 10 === 0) rec.push(y.slice(0, 2)); }
      out.push(rec); }); return out; })();
  const dpAt = (k, s) => { const x = Math.max(0, Math.min(479.999, s * 60)), i = Math.floor(x), f = x - i, a = DP[k][i], b = DP[k][i + 1]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  // ===== 重力の井戸の形と、ケプラーの楕円軌道（周期の2乗は、半径の3乗に比例） =====
  const Y0 = 0.35, well = (r) => Y0 - 1.7 / Math.sqrt(1 + (r / 0.5) * (r / 0.5));
  const kep = (a, e, w, ph, t) => { const M = (2.0 / Math.pow(a, 1.5)) * t + ph; let E = M; for (let i = 0; i < 6; i++) E -= (E - e * S(E) - M) / (1 - e * Co(E)); const x = a * (Co(E) - e), y = a * Math.sqrt(1 - e * e) * S(E); return [x * Co(w) - y * S(w), x * S(w) + y * Co(w)]; };
  const PLN = [[0.95, 0.15, 0.3, 0.1, 0.09, 0], [1.55, 0.3, 2.0, 1.5, 0.13, 1], [2.25, 0.08, 4.0, 3.1, 0.17, 2], [3.05, 0.42, 1.2, 4.6, 0.12, 3]];
  return [
    { // 4) カオス：5本の二重振り子を、0.0015 rad だけずらして放す。最初は重なっているのに、数秒でばらばらの軌跡になる（バタフライ効果）
      name: 'CHAOS', bg: '#ececec', sel: 'bl4',
      cam: (tb, t) => ({ pitch: 0.08 + 0.06 * S(t * 0.4), dist: 10.5, zoom: 1.0 + 0.15 * io(cl(tb / 5)), t: [0, 0.4, 0], tilt: 0.5 }),
      act: (t, tb) => {
        const o = {}, F = -2.3, P0 = [0, 1.75, 0], L = 1.12, s0 = tb - 0.45, CC = ['navy', 'verm', 'blue', 'pink', 'orange'], seg = [];
        const pos = (k, s) => { const [a1, a2] = dpAt(k, Math.max(0, s)), b1 = [S(a1) * L, -Co(a1) * L], b2 = [b1[0] + S(a2) * L, b1[1] - Co(a2) * L]; return [onCard(P0, t, b1[0], b1[1], k * 0.02), onCard(P0, t, b2[0], b2[1], k * 0.02)]; };
        range(5).forEach((k) => { const [b1, b2] = pos(k, s0);
          o['ln' + k] = { pts: [onCard(P0, t, 0, 0, k * 0.02), b1, b2], c: CC[k], lw: 3, alpha: 0.95, zp: b1 };
          o['bl' + k * 2] = { p: b1, w: 0.07, g: ['white', '#cfd3dc', '#5a6270'] }; o['bl' + (k * 2 + 1)] = { p: b2, w: 0.13, g: BC[[6, 0, 3, 4, 1][k]] };
          if (s0 > 0) o['ln' + (5 + k)] = { pts: range(70).map((i) => pos(k, s0 - i * 0.03)[1]), c: CC[k], lw: 2, alpha: 0.75, zp: P0, z: -0.5 }; });
        o.chrome1 = { p: P0, w: 0.1 }; o.s0 = Object.assign({ p: [P0[0], P0[1] + 0.1, P0[2]], bw: 0.9, bh: 0.08, bd: 0.2, r: [0, camYaw(t), 0] }, K.bc('navy'));
        const GP = [0, -1.25, 0], gs = Math.max(0, Math.min(7.5, s0)), dev = range(31).map((i) => { const s = (i / 30) * gs, a = dpAt(0, s), b = dpAt(4, s); return Math.log10(Math.abs(a[1] - b[1]) + 1e-4); });   // ずれのグラフ（対数）
        o.ln10 = { pts: dev.map((v, i) => onCard(GP, t, -1.4 + (i / 30) * (gs / 7.5) * 2.8, (v + 4) * 0.18, 0.3)), c: 'verm', lw: 2.5, alpha: 1, zp: GP };
        seg.push([onCard(GP, t, -1.4, 0, 0.3), onCard(GP, t, 1.4, 0, 0.3)], [onCard(GP, t, -1.4, 0, 0.3), onCard(GP, t, -1.4, 0.8, 0.3)]); o.ln11 = { segs: seg, c: 'navy', lw: 1, alpha: 0.7, zp: GP };
        o.tx0 = { p: onCard(GP, t, -1.3, 0.95, 0.3), str: 'log |Δθ|', s: 0.09, c: 'verm' }; o.tx1 = { p: [0, 2.6, 0], str: 'Δθ₀ = 0.0015 rad · ×5', s: 0.15, c: 'navy' }; o.tx2 = { p: [0, 2.32, 0], str: 'DOUBLE PENDULUM · t = ' + Math.max(0, s0).toFixed(2) + ' s', s: 0.1, c: 'verm' };
        eqRing(o, t, 4.0, 0.3, 'navy');
        eq(o, 2, 16, 4.4, F, t, 1.0, 0.18, 0.36, t * 0.05);
        hop(o, 0, 10, 3.0, F + 0.12, t, 0.5, -t * 0.25, 0.15);
        lane(o, 't', 0, 14, 4.9, 2.4, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        floorRing(o, 't', 14, 12, 2.4, F + 0.02, t * 0.1, () => ({ w: 0.22 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.4 }; o.r0 = { p: [0, F, 0], r: FLOOR, w: 4.2, c: 'navy', alpha: 0.4 };
        return o;
      }
    },
    { // 5) 重力の井戸：星のまわりで空間がへこむ（ゴムの膜のたとえ）。惑星は本物のケプラーの法則で、近いほど速く回る。ほうき星の尾は星の反対を向く
      name: 'GRAVITY', bg: 'blue', sel: 'b0',
      cam: (tb, t) => ({ pitch: 1.25 - 0.8 * io(cl((tb - 0.4) / 3.2)) + 0.05 * S(t * 0.4), dist: 10.5, zoom: 1, t: [0, -0.6, 0] }),
      act: (t) => {
        const o = {}, F = -2.4, arw = [];
        range(16).forEach((k) => { const a = (k * TAU) / 16; o['ln' + k] = { pts: range(15).map((i) => { const r = 0.12 + i * 0.25; return [Co(a) * r, well(r), S(a) * r]; }), c: 'cream', lw: 1, alpha: 0.5, zp: [Co(a) * 1.8, well(1.8), S(a) * 1.8] }; });
        range(9).forEach((k) => { const r = 0.3 + k * 0.42; o['ln' + (16 + k)] = { pts: range(49).map((i) => { const a = (i / 48) * TAU; return [Co(a) * r, well(r), S(a) * r]; }), c: k % 3 === 2 ? 'cyan' : 'cream', lw: 1.2, alpha: 0.55, zp: [0, well(r) - 0.3, 0] }; });
        const SY = well(0) + 0.32;
        o.b0 = { p: [0, SY, 0], w: 0.42, g: ['white', '#fff4d6', '#ffd27a', 'orange'] }; o.glass0 = { p: [0, SY, 0], w: 0.85 }; o.burst1 = { p: [0, SY, 0], bill: 1, scr: [0, 0, -0.5], w: 0.9, n: 24, a0: t * 0.2, c: '#ffd27a', alpha: 0.6 };
        PLN.forEach(([a, e, w, ph, sz, k]) => { const q = kep(a, e, w, ph, t), q2 = kep(a, e, w, ph, t + 0.02), r = Math.hypot(...q), P = [q[0], well(r) + sz, q[1]];
          o['bl' + k] = { p: P, w: sz, g: BC[[0, 2, 3, 1][k]] };
          o['ln' + (25 + k)] = { pts: range(61).map((i) => { const c = kep(a, e, w, ph, (i / 60) * TAU * Math.pow(a, 1.5) / 2.0 + 0.0001), rr = Math.hypot(...c); return [c[0], well(rr) + 0.01, c[1]]; }), c: ['#ffd27a', 'cyan', 'pink', 'white'][k], lw: 1.5, alpha: 0.8, dash: k === 3 ? [5, 5] : null, zp: [0, well(a), 0] };
          const v = [(q2[0] - q[0]) * 12, (q2[1] - q[1]) * 12], tip = [P[0] + v[0], P[1], P[2] + v[1]], n = nrm([v[0], 0, v[1]]);   // 速さの矢印
          arw.push([P, tip], [tip, [tip[0] - n[0] * 0.12 - n[2] * 0.07, tip[1], tip[2] - n[2] * 0.12 + n[0] * 0.07]], [tip, [tip[0] - n[0] * 0.12 + n[2] * 0.07, tip[1], tip[2] - n[2] * 0.12 - n[0] * 0.07]]);
          o['tx' + k] = { p: [P[0], P[1] + 0.3, P[2]], str: 'a ' + a.toFixed(2) + ' · e ' + e.toFixed(2), s: 0.075, c: 'cream' }; });
        o.ln29 = { segs: arw, c: 'verm', lw: 2, alpha: 1, zp: [0, 0, 0], z: 1 };
        const m3 = kep(2.25, 0.08, 4.0, 3.1, t), mr = Math.hypot(...m3), mp = [m3[0] + Co(t * 3) * 0.35, well(mr) + 0.17 + 0.1 * S(t * 3), m3[1] + S(t * 3) * 0.35]; o.bl4 = { p: mp, w: 0.05, g: ['white', '#cfd3dc', '#5a6270'] };   // 月
        const cq = kep(2.6, 0.82, 5.2, 0.5, t), cr = Math.hypot(...cq), CP = [cq[0], well(cr) + 0.12, cq[1]], away = nrm([cq[0], 0, cq[1]]), tl = 0.4 + 1.2 / (cr + 0.3);   // ほうき星
        o.bl5 = { p: CP, w: 0.07, g: ['white', 'cyan', 'blue'] }; o.ln30 = { pts: [CP, add(CP, [away[0] * tl, 0.05, away[2] * tl])], c: 'cyan', lw: 6, alpha: 0.35, zp: CP }; o.ln31 = { pts: [CP, add(CP, [away[0] * tl * 0.8, 0.04, away[2] * tl * 0.8])], c: 'white', lw: 2, alpha: 0.9, zp: CP, z: 0.05 };
        o.tx4 = { p: [0, 1.9, 0], str: 'T² ∝ a³ · KEPLER', s: 0.17, c: 'cream' }; o.tx5 = { p: [0, 1.6, 0], str: 'GRAVITY WELL · M = 1.0 M☉', s: 0.1, c: 'cyan' };
        eqRing(o, t, 4.3, 1.0, 'cream', 0.3);
        spin(o, 0, 10, 4.0, -0.3, t, t * 0.12, 0.26, 0.25);
        lane(o, 't', 0, 14, 4.9, 2.2, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.14 }));
        o.r0 = { p: [0, well(3.6), 0], r: FLOOR, w: 3.7, c: 'cream', lw: 2, alpha: 0.7 };
        return o;
      }
    },
    { // 6) 波の干渉：2つの点から出た波が重なって、強めあう所と弱めあう所ができる。網の面が本当の式で波打つ。赤い点線は「ずっと揺れない線」
      name: 'WAVES', bg: 'orange', sel: 'chrome0',
      cam: (tb, t) => ({ pitch: 0.95 - 0.55 * io(cl(tb / 4)) + 0.05 * S(t * 0.4), dist: 10.5, zoom: 1, t: [0, -0.9, 0] }),
      act: (t) => {
        const o = {}, F = -2.4, Y = -0.95, N = 25, R = 3.0, lam = 0.9, kk = TAU / lam, w = TAU * 0.8, Sx = 0.9;
        const hgt = (x, z) => { const r1 = Math.hypot(x + Sx, z), r2 = Math.hypot(x - Sx, z); return Y + 0.3 * (Co(kk * r1 - w * t) / Math.sqrt(1 + r1 * 1.2) + Co(kk * r2 - w * t) / Math.sqrt(1 + r2 * 1.2)); };
        range(N).forEach((i) => { const z = -R + (i / (N - 1)) * 2 * R, x = z;
          o['ln' + i] = { pts: range(N).map((j) => { const xx = -R + (j / (N - 1)) * 2 * R; return [xx, hgt(xx, z), z]; }), c: 'navy', lw: 1.3, alpha: 0.8, zp: [0, Y, z] };
          o['ln' + (N + i)] = { pts: range(N).map((j) => { const zz = -R + (j / (N - 1)) * 2 * R; return [x, hgt(x, zz), zz]; }), c: 'cream', lw: 1, alpha: 0.6, zp: [x, Y, 0] }; });
        const nod = [];   // 節の線（2つの点からの距離の差が、半波長の奇数倍）
        [lam / 4, (3 * lam) / 4].forEach((a) => [-1, 1].forEach((sg) => { let pv = null; range(25).forEach((i) => { const z = -R + (i / 24) * 2 * R, x = sg * a * Math.sqrt(1 + (z * z) / (Sx * Sx - a * a)); const q = [x, Y + 0.02, z]; if (pv && Math.abs(x) < R) nod.push([pv, q]); pv = q; }); }));
        o.ln50 = { segs: nod, c: 'verm', lw: 2.5, alpha: 0.95, dash: [6, 5], zp: [0, Y, 0], z: 0.5 };
        [-Sx, Sx].forEach((x, k) => { o['bl' + k] = { p: [x, hgt(x, 0) + 0.12, 0], w: 0.14 }; range(3).forEach((j) => { const rr = fr(t * 0.8 + j / 3) * 2.7; o['r' + (k * 3 + j)] = { p: [x, Y + 0.02, 0], r: FLOOR, w: rr + 0.05, c: 'white', lw: 1.5, alpha: 0.8 * (1 - rr / 2.7) }; }); });
        [[0, 1.6], [0.45, -1.1], [-1.9, 1.9], [2.2, -0.4], [-1.2, -2.3]].forEach(([x, z], k) => { o['bl' + (2 + k)] = { p: [x, hgt(x, z) + 0.07, z], w: 0.08, g: BC[k % 8] }; });   // 浮き
        o.chrome0 = { p: [0, hgt(0, 0) + 0.15, 0], w: 0.1 };
        o.tx0 = { p: [0, 1.15, 0], str: '∂²u/∂t² = c²∇²u', s: 0.18, c: 'navy' }; o.tx1 = { p: [0, 0.85, 0], str: 'λ = 0.90 · f = 0.80 Hz · d = 1.80', s: 0.1, c: 'navy' }; o.tx2 = { p: [0, Y + 0.25, R + 0.3], str: 'NODAL LINES', s: 0.1, c: 'verm' };
        eqRing(o, t, 4.4, 0.6, 'navy', 0.3);
        spin(o, 0, 10, 4.2, -1.6, t, -t * 0.12, 0.26, 0.2);
        lane(o, 't', 0, 14, 4.9, 1.8, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.4 };
        return o;
      }
    }
  ];
};
