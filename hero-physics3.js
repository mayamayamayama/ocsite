// hero-physics3.js — 入場画面「物理」のバージョンの、ショット 7〜8（ビリヤードの衝突・光の屈折）
// hero-physics.js から呼ばれます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-physics3');

window.OC_HERO_PHYS3 = function (K, X) {
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp3, mat, mv, eul, nrm, lane, floorRing, eq, spin, hop, orb, camYaw } = K;
  const { eqRing, onCard } = X;
  // ===== ビリヤード：16個の玉の、ぶつかり合い（はね返り係数 0.95）と摩擦を、先に 8 秒ぶん計算しておく =====
  const BIL = (() => { const R = 2.2, r = 0.11, N = 16, dt = 1 / 600, P = [[-1.6, 0.0]], V = [[0, 0]], rec = [], ev = [];
    for (let row = 0; row < 5; row++) for (let j = 0; j <= row; j++) { P.push([0.45 + row * r * 1.76, (j - row / 2) * r * 2.03]); V.push([0, 0]); }
    for (let s = 0; s <= 4800; s++) { const tt = s * dt;
      if (s === 300) V[0] = [12, 0.08];
      for (let i = 0; i < N; i++) { const p = P[i], v = V[i]; p[0] += v[0] * dt; p[1] += v[1] * dt; const sp = Math.hypot(v[0], v[1]); if (sp > 0) { const k = Math.max(0, sp - 1.2 * dt) / sp; v[0] *= k; v[1] *= k; }
        const d = Math.hypot(p[0], p[1]); if (d > R - r) { const n = [p[0] / d, p[1] / d], vn = v[0] * n[0] + v[1] * n[1]; if (vn > 0) { v[0] -= 1.9 * vn * n[0]; v[1] -= 1.9 * vn * n[1]; } p[0] = n[0] * (R - r); p[1] = n[1] * (R - r); } }
      for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++) { const a = P[i], b = P[j], dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy); if (d >= 2 * r || d === 0) continue;
        const n = [dx / d, dy / d], vn = (V[i][0] - V[j][0]) * n[0] + (V[i][1] - V[j][1]) * n[1];
        if (vn > 0) { const J = vn * 0.975; V[i][0] -= J * n[0]; V[i][1] -= J * n[1]; V[j][0] += J * n[0]; V[j][1] += J * n[1]; if (vn > 0.4 && ev.length < 80) ev.push([tt, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, vn]); }
        const ov = (2 * r - d) / 2; a[0] -= n[0] * ov; a[1] -= n[1] * ov; b[0] += n[0] * ov; b[1] += n[1] * ov; }
      if (s % 10 === 0) rec.push(P.map((q) => [q[0], q[1]])); }
    return { R, r, rec, ev }; })();
  const bAt = (i, s) => { const x = Math.max(0, Math.min(479.999, s * 60)), k = Math.floor(x), f = x - k, a = BIL.rec[k][i], b = BIL.rec[k + 1][i]; return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]; };
  const BCOL = [['white', 'white', '#d8cfc8'], ['white', '#ffe14d', '#c99a00'], ['white', '#5c5cff', '#1d1dc0'], ['white', '#ff6a4a', '#b83a12'], ['white', '#c08aff', '#5a2aa0'], ['white', '#ffb24d', '#c96a00'], ['white', '#3fc6a2', '#0d7d5a'], ['white', '#d06a5a', '#7a2a1a'], ['#5a5a5a', '#1b1b1b', '#000000']];
  return [
    { // 7) ビリヤード：白い玉が三角に並んだ15個に当たって、はじける。ぶつかった場所に光の輪、動く玉には速さの矢印とあと
      name: 'COLLIDE', bg: 'peach', sel: 'bl0',
      cam: (tb, t) => ({ pitch: 0.62 + 0.1 * S(t * 0.4), dist: 9.5, zoom: 1.1 + 0.3 * io(cl((tb - 0.3) / 0.6)) - 0.15 * io(cl((tb - 1.5) / 2.5)), t: [0, -1.5, 0] }),
      act: (t, tb) => {
        const o = {}, TY = -1.65, r = BIL.r, s = tb, arw = [];
        o.fl0 = { p: [0, TY, 0], r: FLOOR, shape: 'circle', w: BIL.R + 0.02, c: 'teal', ext: 1.4, c2: '#0d3d3c', z: -60 }; o.fl1 = { p: [0, TY + 0.005, 0], r: FLOOR, shape: 'circle', w: BIL.R + 0.25, c: 'navy', ring: 6, z: -59 };
        o.dots0 = { p: [0, TY + 0.006, 0], r: FLOOR, nx: 9, ny: 9, gap: 0.45, dot: 0.02, c: 'cream', alpha: 0.3, z: -58 };
        range(16).forEach((i) => { const q = bAt(i, s), P = [q[0], TY + r, q[1]], q0 = bAt(i, s - 0.05), sp = Math.hypot(q[0] - q0[0], q[1] - q0[1]) / 0.05;
          o['bl' + i] = { p: P, w: r, g: BCOL[i === 0 ? 0 : i === 8 ? 8 : 1 + ((i - 1) % 7)] };
          if (sp > 0.35) { o['ln' + i] = { pts: range(14).map((k) => { const c = bAt(i, s - k * 0.025); return [c[0], TY + 0.012, c[1]]; }), c: 'white', lw: 4, alpha: 0.45, zp: P, z: -50 };
            const v = [(q[0] - q0[0]) * 6, (q[1] - q0[1]) * 6], tip = [P[0] + v[0], P[1] + 0.12, P[2] + v[1]], n = nrm([v[0], 0, v[1]]); arw.push([[P[0], P[1] + 0.12, P[2]], tip], [tip, [tip[0] - n[0] * 0.1 - n[2] * 0.06, tip[1], tip[2] - n[2] * 0.1 + n[0] * 0.06]], [tip, [tip[0] - n[0] * 0.1 + n[2] * 0.06, tip[1], tip[2] - n[2] * 0.1 - n[0] * 0.06]]); } });
        if (arw.length) o.ln16 = { segs: arw, c: 'verm', lw: 2, alpha: 1, zp: [0, TY, 0], z: 2 };
        let fe = 0, hits = 0; BIL.ev.forEach(([et, x, z, vn]) => { if (et <= s) hits++; const a = s - et; if (a < 0 || a > 0.4 || fe >= 14) return;   // ぶつかった場所の光
          o['fl' + (2 + fe)] = { p: [x, TY + r, z], bill: 1, shape: 'circle', ring: 2.5, w: 0.08 + a * (0.6 + vn * 0.1), c: fe % 2 ? 'white' : '#ffd27a', alpha: 1 - a / 0.4 }; fe++; });
        const cue = bAt(0, Math.min(s, 0.49)), pull = s < 0.5 ? 0.25 + 0.35 * (1 - io(cl(s / 0.4))) - (s > 0.4 ? (s - 0.4) * 5 : 0) : 0.05 + (s - 0.5) * 1.5;   // キュー
        if (s < 1.4) o.s0 = Object.assign({ p: [cue[0] - 0.95 - pull, TY + r + 0.08, cue[1]], r: [0, PI / 2, 0.06], bw: 0.05, bh: 0.05, bd: 1.7 }, K.bc('cream'));
        o.tx0 = { p: [0, 0.45, 0], str: 'HITS ' + String(hits).padStart(2, '0') + ' · Σp = const · e = 0.95', s: 0.13, c: 'navy' }; o.tx1 = { p: [0, 0.75, 0], str: 'BREAK · v₀ = 12.0 m/s', s: 0.2, c: 'navy' };
        eqRing(o, t, 4.0, 0.4, 'navy', 0.3);
        spin(o, 0, 10, 3.6, TY + 0.4, t, -t * 0.12, 0.26, 0.15);
        lane(o, 't', 0, 14, 4.6, 1.6, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        floorRing(o, 't', 14, 14, 3.1, -2.38, t * 0.1, () => ({ w: 0.2 }));
        eq(o, 2, 16, 4.2, -2.4, t, 0.9, 0.18, 0.34, -t * 0.05);
        return o;
      }
    },
    { // 8) 光：凸レンズが平行な光を1点に集め、プリズムが白い光を7色に分け、凹面鏡がはね返して集める。まわりでは鏡から鏡へレーザーが星形に走る
      name: 'OPTICS', bg: 'black', sel: 'glass0',
      cam: (tb, t) => ({ pitch: 0.12 + 0.06 * S(t * 0.4), dist: 10.5, zoom: 1, t: [0, 0.2, 0], tilt: 0.5 }),
      act: (t) => {
        const o = {}, F = -2.4, P0 = [0, 0.3, 0], Q = (x, y, z = 0) => onCard(P0, t, x, y, z), cy = camYaw(t), fw = 0.9, LX = -1.0, SP = ['#ff3b3b', '#ff7a1a', '#ffe14d', '#2ecc71', '#00b8ff', '#2a2aff', '#c13cff'];
        let n = 0; const ray = (pts, c, lw = 1.6, flow = true) => { o['ln' + n++] = { pts, c, lw, alpha: 0.95, dash: flow ? [10, 6] : null, doff: -t * 50, cap: 'round', zp: pts[1] }; };
        o.fl0 = { p: Q(LX, 0.6, 0.02), bill: 1, shape: 'lens', w: 0.62, sx: 0.32, g: ['#9ad7ff', 'white', '#9ad7ff'], ga: 0, alpha: 0.5 }; o.fl1 = { p: Q(LX, 0.6, 0.03), bill: 1, shape: 'lens', w: 0.62, sx: 0.32, c: 'cyan', ring: 1.5 };   // 凸レンズ
        range(7).forEach((k) => { const h = -0.5 + k * (1 / 6); ray([Q(-3.2, 0.6 + h), Q(LX, 0.6 + h), Q(LX + fw, 0.6), Q(LX + fw * 1.9, 0.6 - h * 0.9)], k % 2 ? 'white' : 'cyan', 1.4); });
        o.pg0 = { p: Q(LX + fw, 0.6, 0.05), w: 0.06, g: ['white', '#ffd27a', 'orange'] }; o.tx0 = { p: Q(LX + fw, 0.95), str: 'f = 0.90', s: 0.09, c: 'cyan' };
        const PR = [1.75, 1.45];   // プリズム
        o.fl2 = { p: Q(PR[0], PR[1], 0.02), bill: 1, r: [0, 0, PI], shape: 'tri', w: 0.48, g: ['white', '#d8e8ff', '#9ad7ff'], ga: 0.5, alpha: 0.5 }; o.fl3 = { p: Q(PR[0], PR[1], 0.03), bill: 1, r: [0, 0, PI], shape: 'tri', w: 0.48, c: 'white', ring: 1.5 };
        ray([Q(0.2, 2.05), Q(PR[0] - 0.22, PR[1] + 0.05), Q(PR[0] + 0.2, PR[1] - 0.02)], 'white', 3);
        SP.forEach((c, k) => ray([Q(PR[0] + 0.2, PR[1] - 0.02), Q(PR[0] + 1.45, PR[1] - 0.25 - k * 0.075)], c, 2.2, false));
        const MY = -1.55, mf = 0.75, my = (x) => MY + (x * x) / (4 * mf);   // 凹面鏡（放物線）
        o['ln' + n++] = { pts: range(21).map((i) => { const x = -1.3 + i * 0.13; return Q(x + 1.4, my(x)); }), c: 'white', lw: 4, alpha: 1, zp: Q(1.4, MY) };
        [-1.0, -0.6, -0.25, 0.25, 0.6, 1.0].forEach((x) => ray([Q(x + 1.4, 0.0), Q(x + 1.4, my(x)), Q(1.4, MY + mf)], '#ffd27a', 1.4));
        o.pg1 = { p: Q(1.4, MY + mf, 0.05), w: 0.06, g: ['white', '#ffd27a', 'orange'] };
        const GS = Q(-1.6, -1.25); o.glass0 = { p: GS, w: 0.55 };   // 水滴の中の光（虹の 42°）
        range(3).forEach((k) => { const c = ['#ff3b3b', '#2ecc71', '#2a2aff'][k], d = k * 0.035; ray([Q(-3.1, -0.95), Q(-1.95, -0.98), Q(-1.3 - d, -1.55 + d), Q(-1.95 + d, -1.3), Q(-2.9, -1.95 - k * 0.12)], c, 1.8, false); });
        o.tx1 = { p: Q(-1.6, -0.55), str: '42° · RAINBOW', s: 0.09, c: 'white' };
        const ML = range(7).map((k) => { const a = (k * TAU) / 7 + t * 0.1; return [Co(a) * 3.6, 0.2 + 0.6 * S(a * 2 + t * 0.3), S(a) * 3.6]; });   // 鏡のあいだを走るレーザー
        ML.forEach((q, k) => { o['fl' + (4 + k)] = { p: q, r: [0, -(k * TAU) / 7 - t * 0.1 + PI / 2, 0], shape: 'square', w: 0.22, sy: 1.3, holo: 1, ext: 0.3, c2: 'navy' }; });
        const star = range(8).map((i) => ML[(i * 3) % 7]); o['ln' + n++] = { pts: star, c: 'pink', lw: 2.5, alpha: 0.95, dash: [14, 6], doff: -t * 90, zp: [0, 0, 0], z: -1 };
        o.s0 = Object.assign({ p: [ML[0][0] * 1.1, ML[0][1], ML[0][2] * 1.1], r: [0, -t * 0.1, 0], bw: 0.3, bh: 0.2, bd: 0.2 }, K.bc('navy'));
        o.tx2 = { p: [0, 2.75, 0], str: 'n₁ sin θ₁ = n₂ sin θ₂', s: 0.18, c: 'white' }; o.tx3 = { p: [0, 2.45, 0], str: 'n = 1.52 · λ 400 — 700 nm · DISPERSION', s: 0.1, c: 'cyan' };
        eqRing(o, t, 4.4, -0.8, 'cream', 0.3);
        spin(o, 0, 8, 3.0, -1.9, t, t * 0.15, 0.24, 0.2);
        lane(o, 't', 0, 14, 4.9, 2.2, 0.35, -t * 0.04, t * 0.2, (i) => ({ w: 0.12, c: SP[i % 7], g: null, split: null, stripes: null }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'cyan', alpha: 0.3 }; o.r0 = { p: [0, F, 0], r: FLOOR, w: 3.6, c: 'pink', lw: 1.5, alpha: 0.6 };
        return o;
      }
    }
  ];
};
