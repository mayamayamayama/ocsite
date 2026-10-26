// hero-abstract.js — 入場画面の別バージョン「抽象」：登場する物体と、ショット 1〜3（4〜6 は hero-abstract2.js）
// バウハウスのポスターのような、丸・扇形・半円・斜線を、3Dの空間でばらばらにしたり、組み立てたりします。
// 書き方は hero-scenes.js の上の説明と同じです。部品の扇形（sector）などは hero-parts2.js にあります。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-abstract');

(window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).abstract = function (cfg) {
  const S = Math.sin, Co = Math.cos, PI = Math.PI, TAU = PI * 2, DG = PI / 180;
  const FLOOR = [-PI / 2, 0, 0];
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const ang = (i, n, ph = 0) => ph + (i / n) * TAU;
  const rnd = (i) => { const x = S(i * 12.9898 + 7.1) * 43758.5453; return x - Math.floor(x); };
  const BOX = { verm: ['#b83a12', '#ff7a4c'], orange: ['#c96a00', '#ffb24d'], teal: ['#0d7d7a', '#3fc6c2'], navy: ['#0b1026', '#2b3566'], cream: ['#d9b9a6', '#fff4ea'], peach: ['#d9765a', '#ffc2a8'], white: ['#d8cfc8', '#ffffff'], blue: ['#1d1dc0', '#5c5cff'] };
  const bc = (c) => ({ c, side: BOX[c][0], top: BOX[c][1] });
  const blob = (ph, a1, a2) => { const r = new Float32Array(cfg.N); for (let i = 0; i < cfg.N; i++) { const a = -PI / 2 + (i / cfg.N) * TAU; r[i] = 1 + a1 * S(3 * a + ph) + a2 * S(5 * a - ph * 1.3) + 0.04 * S(8 * a + ph * 2); } return r; };
  const rot = (v, rx, ry) => { const cx = Co(rx), sx = S(rx), cy = Co(ry), sy = S(ry), a = [v[0], v[1] * cx - v[2] * sx, v[1] * sx + v[2] * cx]; return [a[0] * cy + a[2] * sy, a[1], -a[0] * sy + a[2] * cy]; };
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const orb = (R, a, tilt, phi) => { const x = R * Co(a), yl = R * S(a), z1 = -yl * Co(tilt); return [x * Co(phi) + z1 * S(phi), yl * S(tilt), -x * S(phi) + z1 * Co(phi)]; };
  // 小さな形（いろいろな形と色を、順番に）
  const TS = ['circle', 'square', 'tri', 'half', 'quarter', 'diamond', 'lens', 'circle'], TC = ['verm', 'orange', 'teal', 'navy', 'cream', 'peach', 'blue', 'white'];
  const mini = (i, w) => ({ shape: TS[i % 8], w: w || 0.14, c: TC[(i * 3) % 8], split: i % 5 === 0 ? 'navy' : null, sa: i });
  // 傾いた軌道の上に、等間隔に並べる（いつもカメラの方を向く）
  const lane = (o, pre, from, n, R, y, tilt, phi, ph, st) => range(n).forEach((i) => { const q = orb(R, ph + (i / n) * TAU, tilt, phi); o[pre + (from + i)] = Object.assign({ p: [q[0], q[1] + y, q[2]], bill: 1 }, st ? st(i) : {}); });
  // 床の上に、輪の形に寝かせて並べる
  const floorRing = (o, pre, from, n, R, y, ph, st) => range(n).forEach((i) => { const a = ph + (i / n) * TAU; o[pre + (from + i)] = Object.assign({ p: [Co(a) * R, y, S(a) * R], r: [-PI / 2, 0, -a] }, st ? st(i) : {}); });
  // 床の円の目盛り（every 本ごとに長い線）
  const ticks = (segs, c, R, n, y, every, s1, s2) => range(n).forEach((k) => { const a = (k / n) * TAU, r1 = R + (k % every ? s1 : s2); segs.push([[c[0] + Co(a) * R, y, c[2] + S(a) * R], [c[0] + Co(a) * r1, y, c[2] + S(a) * r1]]); });
  // 縦の寸法線（目盛りつき）
  const vdim = (segs, x, z, y0, y1, step, w) => { segs.push([[x, y0, z], [x, y1, z]]); for (let y = y0; y <= y1 + 1e-6; y += step) segs.push([[x, y, z], [x + w, y, z]]); };
  const L = { S, Co, PI, TAU, DG, FLOOR, range, ang, rnd, bc, blob, rot, add, orb, mini, lane, floorRing, ticks, vdim, cfg };

  // ===== 登場する物体 =====
  const A = {};
  range(24).forEach((i) => { A['sc' + i] = { type: 'sector', ro: 1, ri: 0, a0: 0, a1: PI / 2, c: 'verm' }; });   // 扇形
  range(20).forEach((i) => { A['fl' + i] = { type: 'flat', shape: 'circle', w: 0.3, c: 'cream' }; });   // 平らな形
  range(24).forEach((i) => { A['t' + i] = Object.assign({ type: 'flat' }, mini(i)); });   // 小さな形
  range(9).forEach((i) => { A['bx' + i] = Object.assign({ type: 'box', bw: 0.5, bh: 1, bd: 0.5 }, bc('navy')); });   // 箱
  range(12).forEach((i) => { A['s' + i] = Object.assign({ type: 'box', bw: 0.3, bh: 0.3, bd: 0.3 }, bc(['verm', 'orange', 'teal', 'navy', 'cream', 'peach'][i % 6])); });   // 小さな箱
  const BG = [null, ['white', 'orange'], ['white', 'teal'], null, ['white', 'cream', 'verm'], ['white', '#9ad7ff', 'blue'], null, ['white', 'orange', 'verm'], ['white', '#ff9ad5', 'pink'], null];
  range(10).forEach((i) => { A['b' + i] = { type: 'sphere', w: 0.16 + (i % 3) * 0.05 }; if (BG[i]) A['b' + i].g = BG[i]; });   // 玉
  [['cream', 'verm'], ['teal', 'cream'], ['navy', 'orange'], ['orange', 'navy']].forEach(([c, b], i) => { A['cn' + i] = { type: 'coin', w: 0.45, d: 0.12, c, bull: b }; });   // 的
  range(8).forEach((i) => { A['c' + i] = { type: 'coin', w: 0.28, d: 0.1, c: ['orange', 'cream', 'verm', 'teal', 'navy', 'peach', 'white', 'blue'][i], bull: i % 3 === 0 ? 'navy' : null }; });   // コイン
  range(4).forEach((i) => { A['r' + i] = { type: 'lines', kind: 'ring', w: 2, c: 'cream', lw: 1.2, alpha: 0.5 }; });
  range(4).forEach((i) => { A['w' + i] = { type: 'path', c: 'cream', lw: 1, alpha: 0.8 }; });   // 線
  range(8).forEach((i) => { A['tx' + i] = { type: 'text', str: '', c: 'navy', alpha: 0.85 }; });   // 数字や記号
  Object.assign(A, {
    dots0: { type: 'lines', kind: 'dots', nx: 14, ny: 14, gap: 0.55, dot: 0.035, c: 'navy', alpha: 0.6, z: -70 },
    bu0: { type: 'lines', kind: 'burst', w: 0.8, n: 14, spread: 0.5, a0: 0, c: 'navy', alpha: 0.9 },
    bu1: { type: 'lines', kind: 'burst', w: 0.8, n: 14, spread: 0.5, a0: PI, c: 'navy', alpha: 0.9 },
    wave0: { type: 'lines', kind: 'wave', w: 2.6, h: 1.6, n: 12, amp: 0.4, c: 'navy', alpha: 0.8 },
    gl0: { type: 'sphere', w: 0.9, glass: 1 },
    hs0: { type: 'box', bw: 1.6, bh: 0.14, bd: 0.45, c: '#e8e8ff', holo: 1 },
    as0: { type: 'aster', w: 0.4, g: ['cream', 'white', 'pink'] },
    sp0: { type: 'lines', kind: 'spring', w: 0.28, L: 1.4, n: 14, c: 'cream', alpha: 0.9 }
  });

  // 「だまし絵」：ある1つの向きから見たときだけ、ばらばらの板がぴったり1枚のポスターに並ぶ
  function lensCam(t, tb, P, Dd, at) {
    const Y = ((t - tb + at) * TAU) / cfg.ORBIT_SEC, cp = Co(P), pos = [Dd * S(Y) * cp, Dd * S(P), Dd * Co(Y) * cp];
    const n = Math.hypot(...pos), fw = pos.map((v) => -v / n), rl = Math.hypot(fw[2], fw[0]) || 1, rt = [-fw[2] / rl, 0, fw[0] / rl];
    const up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
    return { pos, place: (sx, sy, dz, rz = 0) => { const k = (Dd - dz) / Dd; return { p: [0, 1, 2].map((i) => pos[i] + (rt[i] * sx + up[i] * sy - pos[i]) * k), s: k, r: [-P, Y, rz] }; } };
  }

  // モビール（つるした飾り）。arm：左右の腕の長さ、sp：回る速さ、drop：ひもの長さ、id：先につるす形
  const LEAF = {
    fl0: { shape: 'circle', w: 0.72, c: 'verm', split: 'orange', sa: 0.6 }, fl1: { shape: 'half', w: 0.55, c: 'orange' }, fl2: { shape: 'lens', w: 0.42, sx: 0.6, c: 'navy' },
    fl3: { shape: 'circle', w: 0.3, c: 'cream', split: 'verm', sa: 1 }, fl4: { shape: 'tri', w: 0.36, c: 'cream' }, fl5: { shape: 'circle', w: 0.4, c: 'navy' },
    fl6: { shape: 'quarter', w: 0.42, c: 'verm' }, fl7: { shape: 'circle', w: 0.22, c: 'orange' }, fl8: { shape: blob(0, 0.12, 0.07), w: 0.45, c: 'peach' }, fl9: { shape: 'square', w: 0.26, c: 'navy' }
  };
  const MOB = [
    [[0.2, 3.3, 0], { drop: 0.45, arm: [1.1, 2.2], sp: 0.22, ph: 0, L: { drop: 0.55, arm: [0.8, 1.5], sp: -0.4, ph: 1, L: { drop: 0.45, arm: [0.55, 0.85], sp: 0.65, ph: 2, L: { id: 'fl2', drop: 0.3 }, R: { id: 'fl3', drop: 0.25 } }, R: { id: 'fl1', drop: 0.35 } }, R: { id: 'fl0', drop: 0.4 } }],
    [[-2.5, 3.0, 1.6], { drop: 0.4, arm: [0.7, 1.1], sp: -0.3, ph: 0.5, L: { id: 'fl4', drop: 0.3 }, R: { drop: 0.4, arm: [0.5, 0.7], sp: 0.5, ph: 1, L: { id: 'fl7', drop: 0.25 }, R: { id: 'fl5', drop: 0.3 } } }],
    [[2.4, 2.9, -1.8], { drop: 0.4, arm: [0.8, 0.9], sp: 0.35, ph: 2, L: { id: 'fl6', drop: 0.3 }, R: { drop: 0.35, arm: [0.4, 0.6], sp: -0.6, ph: 0, L: { id: 'fl8', drop: 0.25 }, R: { id: 'fl9', drop: 0.2 } } }]
  ];
  function hang(nd, an, t, o, segs, py) {
    const C = [an[0], an[1] - nd.drop, an[2]]; segs.push([an, C]);
    if (nd.id) { const Lf = LEAF[nd.id], i = +nd.id.slice(2), y = py + 0.4 * S(t * 0.8 + i); o[nd.id] = Object.assign({ p: [C[0], C[1] - Lf.w, C[2]], r: [0, y, 0], ext: 0.5 }, Lf);
      o['fl' + (10 + i)] = { p: [C[0], -2.36, C[2]], r: [-PI / 2, 0, y], shape: Lf.shape, w: Lf.w, sx: 0.25 + 0.75 * Math.abs(Co(y)), sy: 1, c: '#0a5553', alpha: 0.55 }; return; }   // 床の影
    const y = nd.ph + t * nd.sp, dx = Co(y), dz = -S(y);
    const EL = [C[0] - dx * nd.arm[0], C[1], C[2] - dz * nd.arm[0]], ER = [C[0] + dx * nd.arm[1], C[1], C[2] + dz * nd.arm[1]];
    segs.push([EL, ER]); hang(nd.L, EL, t, o, segs, y); hang(nd.R, ER, t, o, segs, y);
  }

  // ===== ショット 1〜3 =====
  const shots = [
    { // 1) だまし絵：ばらばらに浮かぶ板が、ある向きから見たときだけ、1枚のポスターになる（寸法線と数字も、いっしょに並ぶ）
      name: 'COMPOSE', bg: 'cream', sel: 'fl0',
      cam: () => ({ pitch: 0.18, dist: 11, zoom: 1, t: [0, 0, 0], tilt: 0.1, wob: 0 }),   // だまし絵がずれないよう、ゆれを止める
      act: (t, tb) => {
        const LC = lensCam(t, tb, 0.18, 11, 2.9), o = {};
        const put = (id, sx, sy, dz, st, rz) => { o[id] = Object.assign(LC.place(sx, sy, dz, rz || 0), st); };
        const putT = (id, sx, sy, dz, str, size) => { const q = LC.place(sx, sy, dz, 0); o[id] = Object.assign(q, { str, s: q.s * size, c: 'navy' }); };
        const P = (sx, sy, dz) => LC.place(sx, sy, dz || 0, 0).p;
        const F = [0.15, 0.15];   // 扇の中心
        [[50, 68, 2.0, 'verm', 1.8], [68, 86, 2.35, 'teal', -0.9], [86, 102, 1.85, 'navy', 2.6], [102, 116, 2.2, 'orange', -2.3], [116, 132, 1.55, 'teal', 0.5]]
          .forEach(([a0, a1, ro, c, dz], i) => put('sc' + i, F[0], F[1], dz, { a0: a0 * DG, a1: a1 * DG, ro, ri: 0, c, ext: 0.7 }));
        put('sc5', F[0], F[1], -0.4, { a0: 68 * DG, a1: 86 * DG, ri: 0.95, ro: 1.15, c: 'orange' });
        put('sc6', F[0], F[1], 2.9, { a0: 86 * DG, a1: 102 * DG, ri: 0.6, ro: 0.8, c: 'orange' });
        put('sc7', F[0], F[1], 3.0, { a0: 50 * DG, a1: 132 * DG, ri: 0, ro: 0.32, c: 'orange' });
        put('sc8', -1.55, 1.85, 2.1, { a0: 0, a1: TAU, ri: 0.56, ro: 0.7, c: 'teal' });   // 的
        put('fl4', -1.55, 1.85, -1.8, { w: 0.5, c: 'navy' }); put('fl5', -1.55, 1.85, 0.6, { w: 0.37, c: 'verm' }); put('fl6', -1.55, 1.85, 2.7, { shape: 'sun', w: 0.2, c: 'orange' }, t * 0.5);
        [[-15, 100, 'teal', null, 0.2], [100, 250, 'cream', 'teal', 1.4], [250, 290, 'orange', null, -2.0], [290, 345, 'verm', null, 2.3]]   // 円グラフ
          .forEach(([a0, a1, c, h, dz], i) => put('sc' + (9 + i), -0.2, -1.45, dz, { a0: a0 * DG, a1: a1 * DG, ro: i === 3 ? 0.82 : 0.75, ri: 0, c, hatch: h, hg: 0.07, ext: 0.6 }));
        put('fl7', 0.12, -1.15, -0.6, { w: 0.26, c: 'navy', split: 'verm', sa: PI / 2 });
        put('fl0', -1.75, 0.35, -2.6, { w: 0.58, c: 'orange', split: 'navy', sa: -PI / 4 + 0.15 * S(t * 0.6), ext: 0.6 });
        put('fl1', 1.05, 0.45, 1.2, { shape: 'square', w: 0.12, c: 'teal' }); put('fl2', 1.32, 0.17, -1.7, { shape: 'square', w: 0.17, c: 'verm' });
        put('fl3', 1.75, -1.75, -1.3, { shape: blob(t * 0.7, 0.1, 0.06), w: 1.05, c: 'teal' });
        put('fl8', -1.35, -1.95, 2.5, { shape: 'square', w: 1, sx: 0.55, sy: 0.055, c: 'verm' }, 0.5); put('fl9', -1.35, -1.95, -2.5, { shape: 'square', w: 1, sx: 0.55, sy: 0.055, c: 'teal' }, -0.7);
        [[0.9, 1.2, 1.5], [1.9, 0.9, -2.2], [-0.8, 0.8, 2.8], [0.6, -0.9, -1.1], [-2.2, -0.9, 1.0], [2.1, -0.4, 2.2]].forEach(([x, y, dz], i) => put('fl' + (10 + i), x, y, dz, { w: 0.055, c: i % 2 ? 'navy' : 'verm' }));
        put('bu0', 0.95, -0.55, 0.8, { w: 0.7, a0: 0, spread: 0.5, n: 14, c: 'navy' }); put('bu1', 0.95, -0.55, -0.8, { w: 0.7, a0: PI, spread: 0.5, n: 14, c: 'navy' });
        putT('tx0', 1.85, 2.3, 0.4, '50°—132°', 0.15); putT('tx1', -0.5, 2.45, 1.0, 'R 0.70', 0.13); putT('tx2', 0.75, -2.15, 1.6, '26%', 0.16); putT('tx3', -2.25, -2.45, -1.0, 'FIG.01', 0.13);
        putT('tx4', 2.95, 0, 0.2, '4.70', 0.12); putT('tx5', 0.1, -2.95, -0.3, '4.60', 0.12);
        o.w1 = { segs: [[P(-2.2, -2.7), P(2.4, -2.7)], [P(-2.2, -2.6), P(-2.2, -2.8)], [P(2.4, -2.6), P(2.4, -2.8)], [P(0.1, -2.65), P(0.1, -2.75)], [P(2.65, -2.4), P(2.65, 2.3)], [P(2.55, -2.4), P(2.75, -2.4)], [P(2.55, 2.3), P(2.75, 2.3)]], c: 'navy', alpha: 0.7 };   // 寸法線
        o.w2 = { pts: range(25).map((i) => { const a = (50 + i * (82 / 24)) * DG; return P(F[0] + Co(a) * 2.65, F[1] + S(a) * 2.65); }), c: 'verm', lw: 1.2, alpha: 0.8 };   // 角度の弧
        const segs = []; ['sc0', 'sc2', 'sc3', 'fl0', 'fl3', 'sc8', 'sc10', 'fl8', 'fl9', 'fl2', 'fl6', 'sc12'].forEach((id) => { const q = o[id].p; segs.push([q, q.map((v, i) => v + (LC.pos[i] - v) * 0.5)]); });
        o.w0 = { segs, c: 'navy', alpha: 0.3, dash: [3, 4] };   // 見る向きへ集まる線（だまし絵の仕掛け）
        // まわりの立体
        lane(o, 't', 0, 12, 3.7, -0.2, 0.5, t * 0.05, t * 0.3, (i) => mini(i, 0.13));
        floorRing(o, 't', 12, 12, 3.0, -2.68, t * 0.15, (i) => mini(i + 12, 0.16));
        range(12).forEach((i) => { const a = ang(i, 12, t * 0.1), h = 0.3 + 1.2 * Math.abs(S(t * 1.6 + i * 0.9)); o['s' + i] = { p: [Co(a) * 4.8, -2.7 + h / 2, S(a) * 4.8], r: [0, -a, 0], bw: 0.2, bd: 0.2, bh: h }; });
        range(4).forEach((i) => { const a = ang(i, 4, t * 0.4); o['c' + i] = { p: [Co(a) * 2.9, 2.4, S(a) * 2.9], r: [0, t * 2 + i, 0] }; });
        o.gl0 = { p: [3.2, 1.0, -2.2], w: 0.9 }; o.hs0 = { p: [-3.0, -1.6, 1.6], r: [0.2, t * 0.5, 0.3] }; o.as0 = { p: [0, 3.2, 0], bill: 1, r: [0, 0, t * 0.6] };
        o.dots0 = { p: [0, -2.7, 0], r: FLOOR, nx: 14, ny: 14, gap: 0.55, c: 'navy', alpha: 0.45 };
        o.r0 = { p: [0, -2.7, 0], r: FLOOR, w: 3.9, c: 'navy', alpha: 0.4 }; o.r1 = { p: [0, -2.7, 0], r: FLOOR, w: 4.4, c: 'verm', alpha: 0.4 };
        range(6).forEach((i) => { const a = ang(i, 6, t * 0.3); o['b' + i] = { p: [Co(a) * 4.3, -2.4 + Math.abs(S(t * 2.4 + i)) * 0.8, S(a) * 4.3] }; });
        return o;
      }
    },
    { // 2) モビール：つるした形が、ゆっくり回る。床には影。まわりに台座と、高さの目盛り
      name: 'MOBILE', bg: 'teal', sel: 'fl0',
      cam: (tb, t) => ({ pitch: 0.15 + 0.1 * S(t * 0.4), dist: 12, zoom: 1, t: [0, 0.5, 0] }),
      act: (t) => {
        const o = {}, segs = [], F = -2.36;
        MOB.forEach(([an, nd]) => hang(nd, an, t, o, segs, 0));
        o.w0 = { segs, c: 'cream', lw: 1.2, alpha: 0.85 };
        o.sc0 = { p: [0, -2.4, 0], r: FLOOR, a0: 0, a1: TAU, ro: 4.3, ri: 0, c: '#0d7d7a', z: -60 };
        o.dots0 = { p: [0, F - 0.02, 0], r: FLOOR, nx: 13, ny: 13, gap: 0.55, c: 'cream', alpha: 0.5 };
        o.r0 = { p: [0, F - 0.02, 0], r: FLOOR, w: 4.3, c: 'cream', alpha: 0.6 };
        range(3).forEach((k) => { o['r' + (1 + k)] = { p: [0, 0.6, 0], r: [-PI / 2 + [0.3, -0.5, 0.8][k], t * 0.1 + k * 2, 0], w: [3.6, 4.1, 3.2][k], c: ['cream', 'orange', 'navy'][k], alpha: 0.45 }; });
        MOB.forEach(([an], i) => { o['b' + i] = { p: add(an, [0, 0.12, 0]), w: 0.12 }; o['tx' + (1 + i)] = { p: add(an, [0.4, 0.3, 0]), bill: 1, str: 'M-0' + (i + 1), s: 0.13, c: 'cream' }; });
        [0.6, 1.1, 0.8, 1.4, 0.5].forEach((h, i) => { const a = ang(i, 5, 0.6 + t * 0.05), p = [Co(a) * 3.2, F + h / 2, S(a) * 3.2];   // 台座と、その上の玉
          o['s' + i] = { p, r: [0, -a, 0], bw: 0.5, bh: h, bd: 0.5 }; o['b' + (3 + i)] = { p: [p[0], F + h + 0.22 + 0.15 * Math.abs(S(t * 2 + i)), p[2]], w: 0.2 }; });
        range(12).forEach((i) => { const a = i * 2.39, R = 1.4 + (i % 4) * 0.65; o['t' + i] = Object.assign(mini(i, 0.18 + 0.1 * rnd(i)), { p: [Co(a) * R, F + 0.01, S(a) * R], r: [-PI / 2, 0, t * 0.2 * (i % 2 ? 1 : -1) + i] }); });   // 床の切り絵
        lane(o, 't', 12, 12, 4.3, 0.6, 0.35, t * 0.05, t * 0.25, (i) => mini(i + 12, 0.12));
        range(4).forEach((i) => { const a = ang(i, 4, -t * 0.3); o['c' + i] = { p: [Co(a) * 3.4, 3.6, S(a) * 3.4], r: [0, t * 2.2 + i, 0] }; });
        const hs = []; vdim(hs, 3.9, 0, F, 3.3, 0.5, 0.12); o.w1 = { segs: hs, c: 'cream', alpha: 0.75 };   // 高さの目盛り
        o.tx0 = { p: [4.35, 0.5, 0], bill: 1, str: 'H 5.66', s: 0.16, c: 'cream' };
        o.sp0 = { p: [-3.3, F + 0.7, -1.5], r: FLOOR, w: 0.28, L: 1.4, n: 14, c: 'cream' };
        o.as0 = { p: [0, 3.75, 0], bill: 1, r: [0, 0, t * 0.6] }; o.hs0 = { p: [2.6, -1.2, 2.4], r: [0.3, t * 0.4, 0.2] }; o.gl0 = { p: [-1.6, 1.2, -2.6], w: 0.8 };
        o.bu0 = { p: [3.2, 1.6, 0], bill: 1, w: 0.6, c: 'cream', spread: 0.5, n: 14, a0: 0 }; o.bu1 = { p: [3.2, 1.6, 0], bill: 1, w: 0.6, c: 'cream', spread: 0.5, n: 14, a0: PI };
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.15 + 0.2); o['sc' + (1 + i)] = { p: [Co(a) * 4.0, F + 0.02, S(a) * 4.0], r: FLOOR, a0: -a, a1: -a + PI / 2, ro: 0.35, ri: 0, c: ['orange', 'verm', 'cream', 'navy'][i % 4] }; });
        return o;
      }
    },
    { // 3) ジャイロ：途切れた輪が、いろいろな向きに傾きながら回る。床は分度器
      name: 'ARCS', bg: 'navy', sel: 'fl0',
      cam: (tb, t) => ({ pitch: 0.35 + 0.15 * S(t * 0.45), dist: 11, zoom: 1, t: [0, 0, 0] }),
      act: (t) => {
        const o = {}, AC = ['verm', 'orange', 'teal', 'cream'], F = -2.6;
        range(6).forEach((k) => range(3).forEach((j) => {
          const R = 0.8 + k * 0.42, a0 = ang(j, 3, t * (0.35 + k * 0.08) * (k % 2 ? -1 : 1) + k), gap = 0.45 + 0.15 * S(t + k + j);
          const r = [-PI / 2 + 0.55 * S(t * 0.3 + k * 1.3), t * 0.12 * (k % 2 ? 1 : -1) + k * 0.9, 0], m = a0 + (TAU / 3 - gap) / 2;
          o['sc' + (k * 3 + j)] = { p: [0, 0, 0], zp: rot([Co(m) * R, S(m) * R, 0], r[0], r[1]), r, a0, a1: a0 + TAU / 3 - gap, ro: R, ri: R - 0.15, c: AC[(k + j) % 4], ext: 0.5, hatch: j === 1 && k % 2 ? 'navy' : null, hg: 0.05 };
        }));
        o.fl0 = { p: [0, 0, 0], bill: 1, w: 0.42, c: 'cream', split: 'verm', sa: t * 0.8 }; o.fl1 = { p: [0, 0, 0], bill: 1, scr: [0, 0, 0.05], w: 0.11, c: 'navy' };
        o.gl0 = { p: [0, 0, 0], w: 0.7, z: 0.5 };
        o.sc18 = { p: [0, F, 0], r: FLOOR, a0: 0, a1: PI, ro: 4.4, ri: 0, c: 'navy', hatch: 'verm', hg: 0.14, ha: 0.8, z: -60 };
        o.sc19 = { p: [0, F, 0], r: FLOOR, a0: PI, a1: TAU, ro: 4.4, ri: 0, c: '#1c2550', z: -60 };
        o.dots0 = { p: [0, F + 0.02, 2.0], r: FLOOR, nx: 14, ny: 7, gap: 0.55, c: 'verm', alpha: 0.8 };
        const tk = []; ticks(tk, [0, 0, 0], 4.45, 72, F + 0.01, 6, 0.12, 0.3); o.w1 = { segs: tk, c: 'cream', alpha: 0.7 };   // 分度器の目盛り
        ['0°', '90°', '180°', '270°'].forEach((s, i) => { const a = (i * PI) / 2; o['tx' + i] = { p: [Co(a) * 5.05, F + 0.15, -S(a) * 5.05], bill: 1, str: s, s: 0.2, c: 'cream' }; });
        o.tx4 = { p: [0, 2.75, 0], bill: 1, str: 'ω ' + (0.42 + 0.08 * S(t)).toFixed(2), s: 0.2, c: 'cream' };
        range(18).forEach((i) => { const th = Math.acos(1 - (2 * (i + 0.5)) / 18), ph = i * 2.4 + t * 0.2, R = 3.4; o['fl' + (2 + i)] = { p: [R * S(th) * Co(ph), R * Co(th) * 0.8, R * S(th) * S(ph)], bill: 1, w: 0.05 + (i % 3) * 0.025, c: ['cream', 'verm', 'orange'][i % 3] }; });
        range(6).forEach((i) => { const a = ang(i, 6, t * (i % 2 ? 0.5 : -0.4)); o['b' + i] = { p: [Co(a) * 3.0, 0.9 * S(t + i * 1.7), S(a) * 3.0] }; });
        range(12).forEach((i) => { const a = ang(i, 12, -t * 0.2); o['s' + i] = { p: [Co(a) * 4.1, 1.0 * S(t * 0.8 + i * 1.1), S(a) * 4.1], r: [t * 0.7 + i, t * 0.5, 0.3], bw: 0.26, bh: 0.26, bd: 0.26 }; });
        range(8).forEach((i) => { const q = orb(3.7, t * 0.4 + ang(i, 8), -0.6, 1.2); o['c' + i] = { p: q, r: [0, t * 2.5 + i, 0], w: 0.24 }; });
        lane(o, 't', 0, 12, 4.6, 0, 0.25, -t * 0.04, -t * 0.2, (i) => mini(i, 0.12));
        lane(o, 't', 12, 12, 5.2, 1.5, 0.1, t * 0.03, t * 0.15, (i) => mini(i + 12, 0.1));
        o.hs0 = { p: [Co(-t * 0.6) * 3.2, -1.6, S(-t * 0.6) * 3.2], r: [0.2, t * 0.6, 0] };
        o.bu0 = { p: [3.4, 1.4, -1], bill: 1, w: 0.6, c: 'cream', spread: 0.45, n: 16, a0: 0 }; o.bu1 = { p: [-3.2, -1.2, 1.2], bill: 1, w: 0.6, c: 'cream', spread: 0.45, n: 16, a0: PI };
        range(3).forEach((k) => { o['r' + k] = { p: [0, 0, 0], r: [-PI / 2 + [0.2, -0.7, 1.1][k], -t * 0.08 + k, 0], w: 3.4 + k * 0.35, c: 'cream', alpha: 0.25 }; });
        return o;
      }
    }
  ];
  return { shots: shots.concat(typeof window.OC_HERO_ABS2 === 'function' ? window.OC_HERO_ABS2(L) : []), actors: A };
};
