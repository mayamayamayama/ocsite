// hero-mountain.js — 入場画面の別バージョン「山」：登場する物体と、ショット 1〜3（4〜6 は hero-mountain2.js）
// 低ポリの山・山脈の切り絵・等高線・積み重ねた地層・夕日・積み木の地形を、3Dの空間で見せます。
// 書き方は hero-scenes.js の上の説明と同じです。部品の山（peak）や山脈（ridge）などは hero-parts2.js にあります。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-mountain');

(window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).mountain = function (cfg) {
  const S = Math.sin, Co = Math.cos, PI = Math.PI, TAU = PI * 2;
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const FLOOR = [-PI / 2, 0, 0];
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const ang = (i, n, ph = 0) => ph + (i / n) * TAU;
  const rnd = (i) => { const x = S(i * 12.9898 + 7.1) * 43758.5453; return x - Math.floor(x); };   // いつも同じになる、ばらばらの数
  const BOX = { verm: ['#b83a12', '#ff7a4c'], orange: ['#c96a00', '#ffb24d'], teal: ['#0d7d7a', '#3fc6c2'], navy: ['#0b1026', '#2b3566'], cream: ['#d9b9a6', '#fff4ea'], white: ['#d8cfc8', '#ffffff'], peach: ['#d9765a', '#ffc2a8'] };
  const bc = (c) => ({ c, side: BOX[c][0], top: BOX[c][1] });
  const orb = (R, a, tilt, phi) => { const x = R * Co(a), yl = R * S(a), z1 = -yl * Co(tilt); return [x * Co(phi) + z1 * S(phi), yl * S(tilt), -x * S(phi) + z1 * Co(phi)]; };
  const lerp3 = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u);
  const circle = (R, y, n = 48, c = [0, 0, 0]) => range(n + 1).map((i) => [c[0] + Co((i / n) * TAU) * R, y, c[2] + S((i / n) * TAU) * R]);
  // 地層の1枚ずつの形（少しずつ違う、ぐにゃっとした丸）
  const LAYS = range(12).map((k) => { const r = new Float32Array(cfg.N); for (let i = 0; i < cfg.N; i++) { const a = -PI / 2 + (i / cfg.N) * TAU; r[i] = 1 + 0.1 * S(3 * a + k * 0.7 + 1) + 0.07 * S(5 * a - k * 0.5) + 0.04 * S(9 * a + k); } return r; });
  // 山脈を、輪の形にぐるっと並べる（R：半径、n：枚数）
  const ringRidges = (o, from, n, R, y, st, t) => range(n).forEach((i) => { const a = ang(i, n, 0.15 * from + t * 0.015); o['rg' + (from + i)] = Object.assign({ p: [Co(a) * R, y, S(a) * R], r: [0, PI / 2 - a, 0], w: ((TAU * R) / n) * 1.1, seed: (from + i) * 1.7 }, st, { h: st.h * (0.8 + 0.4 * rnd(from + i)) }); });
  const spiral = (c, w, h, turns, ph) => range(48).map((i) => { const u = i / 47, a = u * TAU * turns + ph, rr = w * (1 - u) * 1.08 + 0.03; return [c[0] + Co(a) * rr, c[1] + h * u * 0.98, c[2] + S(a) * rr]; });
  const flag = (o, top, k) => { o.w3 = { pts: [top, [top[0], top[1] + 0.55, top[2]]], c: 'navy', lw: 1.4, alpha: 1 }; o['fl' + k] = { p: [top[0] + 0.12, top[1] + 0.47, top[2]], r: [0, k, -PI / 2], shape: 'tri', w: 0.12, c: 'verm' }; };
  const birds = (o, from, n, R, y, t) => range(n).forEach((i) => { const a = ang(i, n, t * 0.35) + 0.2 * S(i * 3); o['fl' + (from + i)] = { p: [Co(a) * (R + 0.3 * S(i)), y + 0.25 * S(t * 2 + i), S(a) * (R + 0.3 * S(i))], bill: 1, shape: 'wedge', w: 0.09, c: 'navy', r: [0, 0, 0.3 * S(t * 6 + i)] }; });
  const clouds = (o, from, n, R, y, t, c) => range(n).forEach((i) => { const a = ang(i, n, t * 0.08 + 1); o['fl' + (from + i)] = { p: [Co(a) * (R + 0.5 * rnd(i)), y + 0.7 * rnd(i + 9), S(a) * (R + 0.5 * rnd(i))], bill: 1, shape: 'circle', w: 0.3, sx: 2.4, sy: 0.5, c: c || 'white', alpha: 0.95 }; });
  // 傾いた軌道の上に、等間隔に並べる（いつもカメラの方を向く）
  const lane = (o, pre, from, n, R, y, tilt, phi, ph, st) => range(n).forEach((i) => { const q = orb(R, ph + (i / n) * TAU, tilt, phi); o[pre + (from + i)] = Object.assign({ p: [q[0], q[1] + y, q[2]], bill: 1 }, st ? st(i) : {}); });
  // 気球（玉と、かごと、ひも）
  const balloon = (o, sph, bask, segs, p) => { o[sph] = { p, w: 0.3, g: ['white', 'verm', '#b83a12'] }; const b = [p[0], p[1] - 0.58, p[2]]; o[bask] = Object.assign({ p: b, bw: 0.12, bh: 0.09, bd: 0.12 }, bc('cream'));
    segs.push([[p[0] - 0.2, p[1] - 0.2, p[2]], [b[0] - 0.05, b[1], b[2]]], [[p[0] + 0.2, p[1] - 0.2, p[2]], [b[0] + 0.05, b[1], b[2]]]); };
  // 風車（柱と、回る羽根）
  const windmill = (o, id, segs, base, h, t, i) => { const top = [base[0], base[1] + h, base[2]]; segs.push([base, top]); o[id] = { p: top, r: [0, i * 1.3, t * 2.4 + i], w: 0.22, c: 'cream' }; };
  const L = { S, Co, PI, TAU, cl, io, FLOOR, range, ang, rnd, bc, orb, lerp3, circle, LAYS, ringRidges, spiral, flag, birds, clouds, lane, balloon, windmill, cfg };

  // ===== 登場する物体 =====
  const A = {};
  range(24).forEach((i) => { A['pk' + i] = { type: 'peak', w: 0.8, h: 1.2, n: 6, c: 'navy', snow: 0, seed: i * 1.3 }; });   // 低ポリの山
  range(30).forEach((i) => { A['rg' + i] = { type: 'ridge', w: 2, h: 1, c: 'teal', seed: i * 1.7 }; });   // 山脈の切り絵
  range(20).forEach((i) => { A['fl' + i] = { type: 'flat', shape: 'circle', w: 0.3, c: 'white' }; });   // 平らな形（雲・太陽・鳥など）
  range(24).forEach((i) => { A['t' + i] = { type: 'flat', shape: 'circle', w: 0.06, c: 'orange' }; });   // 小さな印
  range(12).forEach((i) => { A['ly' + i] = { type: 'flat', shape: LAYS[i], w: 1, c: 'cream', ext: 0.6 }; });   // 地層
  range(49).forEach((i) => { A['vx' + i] = Object.assign({ type: 'box', bw: 0.56, bh: 1, bd: 0.56 }, bc('teal')); });   // 積み木の地形
  range(12).forEach((i) => { A['s' + i] = Object.assign({ type: 'box', bw: 0.2, bh: 0.2, bd: 0.2 }, bc(['verm', 'cream', 'orange', 'teal', 'navy', 'white'][i % 6])); });   // 小さな箱（ゴンドラ・電車・家など）
  const BG = [['white', '#fff4d6', 'orange'], ['white', '#e8e8ff', '#9a9a9a'], null, ['white', 'orange', 'verm'], ['white', 'teal'], null, ['white', 'cream'], null];
  range(8).forEach((i) => { A['b' + i] = { type: 'sphere', w: 0.16 }; if (BG[i]) A['b' + i].g = BG[i]; });
  range(3).forEach((i) => { A['ct' + i] = { type: 'contour', w: 2, h: 2, n: 10, c: 'cream', amp: 0.18 }; });   // 等高線の山
  range(4).forEach((i) => { A['r' + i] = { type: 'lines', kind: 'ring', w: 2, c: 'navy', lw: 1.2, alpha: 0.5 }; });
  range(6).forEach((i) => { A['w' + i] = { type: 'path', c: 'orange', lw: 1.2, alpha: 0.9 }; });
  range(8).forEach((i) => { A['tx' + i] = { type: 'text', str: '0', c: 'navy', alpha: 0.85 }; });   // 標高の数字など
  range(3).forEach((i) => { A['as' + i] = { type: 'aster', w: 0.22, c: 'cream' }; });   // 風車の羽根
  Object.assign(A, {
    base: { type: 'coin', w: 4.4, d: 0.35, c: 'peach', c2: '#d9765a', z: -60 },
    terr: { type: 'terrain', w: 9, nx: 22, amp: 0.4, sg: 0.6, c: 'teal', alpha: 0.45, z: -70 },
    dots0: { type: 'lines', kind: 'dots', nx: 14, ny: 14, gap: 0.6, dot: 0.035, c: 'navy', alpha: 0.4, z: -55 },
    wave0: { type: 'lines', kind: 'wave', w: 2, h: 1.2, n: 10, amp: 0.08, c: 'cream', alpha: 0.7 },
    frames0: { type: 'lines', kind: 'frames', w: 5, h: 5, n: 3, c: 'navy', alpha: 0.6, z: -45 },
    bu0: { type: 'lines', kind: 'burst', w: 0.5, n: 16, spread: TAU, a0: 0, c: 'navy', alpha: 0.8 },   // 方位磁針・光の筋
    beam: { type: 'sector', ro: 3, ri: 0.1, a0: -0.12, a1: 0.12, c: '#fff4d6', alpha: 0.35 }   // 灯台の光
  });

  // ===== ショット 1〜3 =====
  const shots = [
    { // 1) 頂上：雪をかぶった大きな山と、まわりを囲む山脈。ロープウェイ・風車・気球・登山道・方位磁針
      name: 'SUMMIT', bg: 'cream', sel: 'base',
      cam: (tb, t) => ({ pitch: 0.28 + 0.08 * S(t * 0.5), dist: 12.5, zoom: 1, t: [0, 0.1, 0] }),
      act: (t) => {
        const o = { base: { p: [0, -1.9, 0], r: FLOOR, w: 4.4, d: 0.35, c: 'peach', c2: '#d9765a' } }, Y = -1.72, segs = [];
        [[0, 0, 1.9, 3.0, 9, 'navy', 0.32], [1.9, -0.9, 1.0, 1.6, 6, 'verm', 0.25], [-1.8, 0.8, 1.15, 1.45, 7, 'teal', 0.2], [0.7, 2.1, 0.75, 1.0, 6, 'orange', 0], [-0.9, -2.1, 0.8, 1.1, 5, 'teal', 0.2]]
          .forEach(([x, z, w, h, n, c, snow], i) => { o['pk' + i] = { p: [x, Y, z], w, h, n, c, snow, seed: i * 1.3, ax: i ? 0 : 0.05 }; });
        range(10).forEach((i) => { const a = ang(i, 10, 0.4), R = 2.7 + rnd(i) * 0.9; o['pk' + (5 + i)] = { p: [Co(a) * R, Y, S(a) * R], w: 0.13, h: 0.4 + 0.15 * rnd(i + 3), n: 4, c: '#0b5e5b', snow: 0, seed: i }; });
        [[3.9, 0.9, 'verm'], [2.4, 3.3, 'orange'], [-3.7, -1.4, 'navy']].forEach(([x, z, c], i) => { o['pk' + (16 + i)] = { p: [x, Y, z], w: 0.13, h: 0.17, n: 4, c, seed: 0.78 }; });   // テント
        ringRidges(o, 0, 12, 3.9, Y, { h: 0.8, c: 'teal', g: ['#3fc6c2', 'teal'], snow: 0.82 }, t);
        ringRidges(o, 12, 12, 4.5, Y, { h: 0.55, c: 'orange', g: ['#ffb24d', 'orange'] }, t);
        clouds(o, 0, 6, 2.9, 1.0, t); birds(o, 7, 6, 2.4, 2.0, t);
        o.b0 = { p: [Co(-t * 0.25) * 4.6, 2.6, S(-t * 0.25) * 4.6], w: 0.42 };
        o.w2 = { pts: circle(4.6, 2.6), c: 'orange', lw: 1, alpha: 0.5, dash: [3, 5] };   // 太陽の通り道と、時刻の点
        range(12).forEach((i) => { const a = ang(i, 12); o['t' + (9 + i)] = { p: [Co(a) * 4.6, 2.6, S(a) * 4.6], bill: 1, w: 0.045, c: i % 3 ? 'orange' : 'navy' }; });
        const top = [0.095, Y + 3.0, 0]; flag(o, top, 6);
        const tr = spiral([0, Y, 0], 1.9, 3.0, 2.3, 0.5); o.w0 = { pts: tr, c: 'orange', lw: 1.6, dash: [4, 3] };   // 登山道と、その目印
        range(8).forEach((i) => { o['t' + (1 + i)] = { p: tr[4 + i * 5], bill: 1, w: 0.045, c: 'verm' }; });
        const CA = [3.3, Y + 0.3, 1.9], CB = [0.55, Y + 2.5, 0.3], yaw = Math.atan2(CB[0] - CA[0], CB[2] - CA[2]);   // ロープウェイ
        segs.push([CA, CB]); [0.33, 0.66].forEach((u) => { const q = lerp3(CA, CB, u); segs.push([[q[0], Y, q[2]], q]); });
        range(3).forEach((i) => { const q = lerp3(CA, CB, (t * 0.07 + i / 3) % 1); segs.push([q, [q[0], q[1] - 0.16, q[2]]]); o['s' + i] = { p: [q[0], q[1] - 0.24, q[2]], r: [0, yaw, 0], bw: 0.16, bh: 0.13, bd: 0.13 }; });
        o.s3 = Object.assign({ p: [CA[0], Y + 0.15, CA[2]], r: [0, yaw, 0], bw: 0.32, bh: 0.3, bd: 0.32 }, bc('navy'));
        [[-3.0, 0.9], [2.6, -2.4], [-1.2, 3.1]].forEach(([x, z], i) => windmill(o, 'as' + i, segs, [x, Y, z], 0.75, t, i));
        balloon(o, 'b5', 's4', segs, [Co(-t * 0.2 + 2) * 3.0, 1.9 + 0.25 * S(t * 0.7), S(-t * 0.2 + 2) * 3.0]);
        o.w4 = { segs, c: 'navy', lw: 1, alpha: 0.9 };
        o.bu0 = { p: [-2.6, Y + 0.01, -2.9], r: FLOOR, w: 0.5 }; o.t0 = { p: [-2.6, Y + 0.02, -2.9], r: [-PI / 2, 0, PI / 2 + 0.15 * S(t)], shape: 'diamond', w: 0.4, sx: 0.22, c: 'verm' };   // 方位磁針
        o.tx3 = { p: [-2.6, Y + 0.18, -3.55], bill: 1, str: 'N', s: 0.18, c: 'navy' };
        o.t21 = { p: [-2.3, Y + 0.012, 1.9], r: FLOOR, w: 0.38, sx: 1.5, c: 'blue' };   // 池
        o.tx0 = { p: [top[0] + 0.55, top[1] + 0.25, 0], bill: 1, str: '3776', s: 0.3, c: 'navy' };
        o.tx1 = { p: [1.9, Y + 1.85, -0.9], bill: 1, str: '1820', s: 0.18, c: 'navy' }; o.tx2 = { p: [-1.8, Y + 1.7, 0.8], bill: 1, str: '1540', s: 0.18, c: 'navy' };
        o.tx4 = { p: [Co(2.2) * 2.45, Y + 0.12, S(2.2) * 2.45], bill: 1, str: '2 km', s: 0.13, c: 'navy' }; o.tx5 = { p: [Co(2.2) * 4.8, Y + 0.12, S(2.2) * 4.8], bill: 1, str: '4 km', s: 0.13, c: 'navy' };
        o.r0 = { p: [0, Y, 0], r: FLOOR, w: 4.75, c: 'navy', alpha: 0.5 }; o.r1 = { p: [0, Y + 0.005, 0], r: FLOOR, w: 2.4, c: 'navy', alpha: 0.35 };
        o.dots0 = { p: [0, Y + 0.005, 0], r: FLOOR, nx: 13, ny: 13, gap: 0.6, c: 'navy', alpha: 0.3 };
        return o;
      }
    },
    { // 2) 等高線：線だけでできた山。光の輪が、山を上から下までなぞる。飛行機の通り道と、測量の印
      name: 'CONTOUR', bg: 'navy', sel: 'fl0',
      cam: (tb, t) => ({ pitch: 0.45 + 0.12 * S(t * 0.5), dist: 12, zoom: 1, t: [0, -0.4, 0] }),
      act: (t) => {
        const o = {}, Y = -2, f = 0.5 + 0.5 * S(t * 0.9), sy = Y + 3.0 * f * 0.95, sw = 2.6 * Math.pow(1 - f, 0.85) * 1.15 + 0.05;
        o.terr = { p: [0, Y - 0.1, 0], w: 9, nx: 22, amp: 0.35, sg: 0.6, ph: t * 0.5, c: 'teal', alpha: 0.45 };
        o.ct0 = { p: [0, Y, 0], w: 2.6, h: 3.0, n: 15, amp: 0.2, ph: t * 0.3, c: 'cream' };
        o.ct1 = { p: [2.6, Y, -1.5], w: 1.3, h: 1.5, n: 8, amp: 0.22, ph: -t * 0.4, c: 'orange' };
        o.ct2 = { p: [-2.4, Y, 1.6], w: 1.1, h: 1.2, n: 7, amp: 0.2, ph: t * 0.5, c: '#3fc6c2' };
        o.r0 = { p: [0, sy, 0], r: FLOOR, w: sw, c: 'verm', lw: 2.2, alpha: 1 }; o.r1 = { p: [0, sy, 0], r: FLOOR, w: sw + 0.5, c: 'cream', alpha: 0.35 };
        o.fl0 = { p: [0, sy, 0], r: FLOOR, shape: 'square', w: 2.6, c: 'cream', alpha: 0.08 };   // なぞる面
        o.tx7 = { p: [sw + 0.75, sy + 0.12, 0], bill: 1, str: 'SCAN ' + Math.round(f * 100) + '%', s: 0.14, c: 'verm' };
        range(2).forEach((k) => { const q = (t * 0.6 + k * 0.5) % 1; o['r' + (2 + k)] = { p: [0, Y + 3.02, 0], r: FLOOR, w: 0.15 + q * 1.6, c: 'orange', alpha: (1 - q) * 0.7 }; });   // 頂上の電波
        o.w0 = { pts: spiral([0, Y, 0], 2.6, 3.0, 2.6, t * 0.2), c: 'orange', lw: 1.5, dash: [4, 3] };
        flag(o, [0, Y + 3.0, 0], 1);
        const RX = [3.3, Y, -2.3], segs = [[RX, [RX[0], Y + 3.2, RX[2]]]];   // 標高のものさし
        range(12).forEach((k) => { const y = Y + k * 0.27; segs.push([[RX[0], y, RX[2]], [RX[0] + (k % 3 ? 0.1 : 0.22), y, RX[2]]]); });
        o.w2 = { segs, c: 'cream', lw: 1, alpha: 0.8 };
        range(4).forEach((k) => { o['tx' + k] = { p: [RX[0] + 0.45, Y + k * 0.81 + 0.08, RX[2]], bill: 1, str: String(k * 1000), s: 0.16, c: 'cream' }; });
        o.tx3.str = 'H ' + Math.round(f * 3776);
        [['35°21\'N', -3.6, 2.6], ['138°43\'E', 3.4, 2.8], ['GRID 07', -3.4, -2.6]].forEach(([s, x, z], i) => { o['tx' + (4 + i)] = { p: [x, Y + 0.25, z], bill: 1, str: s, s: 0.14, c: 'cream' }; });
        const pins = [];
        range(6).forEach((i) => { const a = ang(i, 6, 0.7), R = 3.0 + 0.5 * rnd(i); const p = [Co(a) * R, Y - 0.05, S(a) * R]; pins.push([p, [p[0], p[1] + 0.5 + 0.2 * rnd(i + 2), p[2]]]); o['b' + i] = { p: pins[i][1], w: 0.1 }; });
        [[3.9, 3.9], [-3.9, 3.9], [3.9, -3.9], [-3.9, -3.9]].forEach(([x, z], i) => { pins.push([[x, Y - 0.1, z], [x, Y + 1.1, z]]); o['t' + (20 + i)] = { p: [x, Y + 1.15, z], bill: 1, w: 0.06, c: 'orange' }; });   // 測量の柱
        o.w1 = { segs: pins, c: 'cream', lw: 1, alpha: 0.7 };
        range(12).forEach((i) => { const k = 1 + (i % 6) * 2, fk = k / 15, a = i * 1.7, r = 2.6 * Math.pow(1 - fk, 0.85); o['t' + i] = { p: [Co(a) * r, Y + fk * 3.0, S(a) * r], bill: 1, shape: 'diamond', w: 0.05, c: i % 2 ? 'orange' : 'cream' }; });   // 測量の点
        const FP = (u) => { const q = orb(4.0, u, 0.3, 0.4); return [q[0], q[1] + 1.6, q[2]]; };   // 飛行機の通り道
        o.w4 = { pts: range(49).map((i) => FP((i / 48) * TAU)), c: 'cream', lw: 1, alpha: 0.45, dash: [2, 4] };
        o.t12 = { p: FP(t * 0.5), bill: 1, shape: 'tri', w: 0.12, c: 'cream', r: [0, 0, -PI / 2] };
        range(6).forEach((k) => { o['t' + (13 + k)] = { p: FP(t * 0.5 - (k + 1) * 0.1), bill: 1, w: 0.035 * (1 - k * 0.12), c: 'cream' }; });
        o.bu0 = { p: [-3.4, Y - 0.08, -3.2], r: FLOOR, w: 0.55, c: 'cream' }; o.t19 = { p: [-3.4, Y - 0.07, -3.2], r: [-PI / 2, 0, PI / 2 + 0.2 * S(t)], shape: 'diamond', w: 0.45, sx: 0.22, c: 'verm' };
        o.dots0 = { p: [0, Y - 0.12, 0], r: FLOOR, nx: 15, ny: 15, gap: 0.6, c: 'cream', alpha: 0.25 };
        return o;
      }
    },
    { // 3) 低ポリの国：台の上の山々が、息をするように伸び縮み。線路を走る電車、村、風車、湖のボート
      name: 'LOWPOLY', bg: 'teal', sel: 'base',
      cam: (tb, t) => ({ pitch: 0.42 + 0.1 * S(t * 0.45), dist: 12.5, zoom: 1, t: [0, -0.5, 0] }),
      act: (t) => {
        const o = { base: { p: [0, -2.05, 0], r: FLOOR, w: 4.0, d: 0.4, c: 'cream', c2: '#d9b9a6' } }, Y = -1.85, segs = [], LK = [1.8, Y, 1.9];
        [[0, 0, 1.3, 2.4, 'navy', 0.3], [1.6, -0.9, 0.9, 1.6, 'verm', 0.25], [-1.5, 0.7, 1.0, 1.8, 'orange', 0.28], [0.4, 1.7, 0.7, 1.1, 'peach', 0], [-0.7, -1.6, 0.75, 1.3, '#0d7d7a', 0.2], [2.2, 0.9, 0.55, 0.9, 'navy', 0.3], [-2.3, -0.8, 0.5, 0.8, 'verm', 0]]
          .forEach(([x, z, w, h, c, snow], i) => { o['pk' + i] = { p: [x, Y, z], w, h: h * (1 + 0.1 * S(t * 1.2 + i)), n: 5 + (i % 3), c, snow, seed: i * 2.1 }; });
        range(9).forEach((i) => { const a = ang(i, 9, 2), R = 2.6 + rnd(i + 20) * 0.9; o['pk' + (7 + i)] = { p: [Co(a) * R, Y, S(a) * R], w: 0.12, h: 0.38 + 0.12 * rnd(i), n: 5, c: '#0b5e5b', seed: i }; });
        [3.7, 4.05, 4.4, 4.75].forEach((a, i) => { const p = [Co(a) * 2.95, Y, S(a) * 2.95];   // 村（家と屋根）
          o['s' + (5 + i)] = Object.assign({ p: [p[0], Y + 0.12, p[2]], r: [0, PI / 4, 0], bw: 0.24, bh: 0.24, bd: 0.24 }, bc(['cream', 'white', 'peach', 'cream'][i]));
          o['pk' + (16 + i)] = { p: [p[0], Y + 0.24, p[2]], w: 0.2, h: 0.17, n: 4, c: ['verm', 'navy', 'orange', 'verm'][i], seed: PI / 4 }; });
        o.fl0 = { p: [LK[0], Y + 0.01, LK[2]], r: FLOOR, w: 0.62, sx: 1.4, c: 'blue', z: -40 };   // 湖
        o.wave0 = { p: [LK[0], Y + 0.02, LK[2]], r: FLOOR, w: 1.4, h: 0.7, n: 8, amp: 0.05, c: 'cream', alpha: 0.8 };
        range(2).forEach((i) => { const a = t * 0.4 + i * PI, p = [LK[0] + Co(a) * 0.45, Y + 0.05, LK[2] + S(a) * 0.3];   // ボート
          o['s' + (10 + i)] = Object.assign({ p, r: [0, -a, 0], bw: 0.16, bh: 0.05, bd: 0.07 }, bc('navy')); o['t' + i] = { p: [p[0], p[1] + 0.11, p[2]], r: [0, -a, 0], shape: 'tri', w: 0.08, c: 'cream' }; });
        o.w4 = { pts: range(49).map((i) => [Co((i / 48) * TAU) * 3.55, Y + 0.02, S((i / 48) * TAU) * 3.55]), c: 'navy', lw: 1.5, alpha: 0.9 };   // 線路
        range(36).forEach((k) => { const a = (k / 36) * TAU; segs.push([[Co(a) * 3.43, Y + 0.015, S(a) * 3.43], [Co(a) * 3.67, Y + 0.015, S(a) * 3.67]]); });
        range(5).forEach((i) => { const a = t * 0.35 - i * 0.13; o['s' + i] = Object.assign({ p: [Co(a) * 3.55, Y + 0.1, S(a) * 3.55], r: [0, -a - PI / 2, 0], bw: 0.26, bh: 0.14, bd: 0.14 }, bc(['verm', 'cream', 'orange', 'teal', 'cream'][i])); });   // 電車
        [[-3.2, 0.4], [2.8, -2.0]].forEach(([x, z], i) => windmill(o, 'as' + i, segs, [x, Y, z], 0.7, t, i));
        balloon(o, 'b2', 's9', segs, [Co(t * 0.15 + 4) * 2.6, 2.0 + 0.3 * S(t * 0.6), S(t * 0.15 + 4) * 2.6]);
        o.w5 = { segs, c: 'navy', lw: 1, alpha: 0.7 };
        range(12).forEach((i) => { const a = i * 2.7, R = 3.0 + rnd(i + 40) * 0.8; o['t' + (2 + i)] = { p: [Co(a) * R, Y + 0.015, S(a) * R], r: FLOOR, w: 0.04 + 0.02 * rnd(i), c: ['cream', 'peach', 'verm'][i % 3] }; });   // 花
        lane(o, 't', 14, 10, 4.4, 2.4, 0.25, t * 0.05, t * 0.2, (i) => ({ shape: 'diamond', w: 0.07, sx: 0.7, c: ['verm', 'cream', 'orange', 'navy'][i % 4] }));   // 凧
        o.b0 = { p: [Co(t * 0.3) * 4.8, 2.4 + 0.4 * S(t * 0.3), S(t * 0.3) * 4.8], w: 0.3 }; o.b1 = { p: [-Co(t * 0.3) * 4.5, 2.2 - 0.4 * S(t * 0.3), -S(t * 0.3) * 4.5], w: 0.24 };
        clouds(o, 1, 4, 3.0, 1.2, t); birds(o, 5, 6, 2.6, 2.2, t);
        ringRidges(o, 0, 12, 4.7, Y - 0.2, { h: 0.55, c: '#0d7d7a' }, t);
        flag(o, [0, Y + 2.4 * (1 + 0.1 * S(t * 1.2)), 0], 11);
        o.tx0 = { p: [0.5, Y + 2.7, 0], bill: 1, str: String(Math.round(2400 * (1 + 0.1 * S(t * 1.2)))), s: 0.2, c: 'navy' };
        o.tx1 = { p: [LK[0], Y + 0.4, LK[2]], bill: 1, str: 'LAKE', s: 0.13, c: 'navy' }; o.tx2 = { p: [Co(4.2) * 2.95, Y + 0.65, S(4.2) * 2.95], bill: 1, str: 'VILLAGE', s: 0.13, c: 'navy' };
        o.tx3 = { p: [Co(t * 0.35) * 3.55, Y + 0.45, S(t * 0.35) * 3.55], bill: 1, str: 'EXP.07', s: 0.12, c: 'cream' };
        return o;
      }
    }
  ];
  return { shots: shots.concat(typeof window.OC_HERO_MTN2 === 'function' ? window.OC_HERO_MTN2(L) : []), actors: A };
};
