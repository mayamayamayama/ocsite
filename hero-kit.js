// hero-kit.js — 入場画面の「空・ゲーム・創作・インダストリアル」のバージョンで、いっしょに使う道具
// （物を輪の形に並べる、軌道に乗せる、目盛りを作る…など）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-kit');

window.OC_HERO_KIT = function (cfg) {
  const S = Math.sin, Co = Math.cos, PI = Math.PI, TAU = PI * 2, DG = PI / 180, FLOOR = [-PI / 2, 0, 0];
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const range = (n) => Array.from({ length: n }, (_, i) => i), ang = (i, n, ph = 0) => ph + (i / n) * TAU;
  const rnd = (i) => { const x = S(i * 12.9898 + 7.1) * 43758.5453; return x - Math.floor(x); };   // いつも同じになる、ばらばらの数
  const fr = (x) => x - Math.floor(x);   // 0〜1 をくり返す
  const lerp = (a, b, u) => a + (b - a) * u, lerp3 = (a, b, u) => a.map((v, i) => v + (b[i] - v) * u), add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  // 箱の色（面・横・上）。grey と black と lime も使える
  const HEX = { grey: '#a8a49c', black: '#1b1b1b', lime: '#d8ff00', steel: '#7d8796' };
  const BOX = { verm: ['#b83a12', '#ff7a4c'], orange: ['#c96a00', '#ffb24d'], teal: ['#0d7d7a', '#3fc6c2'], navy: ['#0b1026', '#2b3566'], cream: ['#d9b9a6', '#fff4ea'], peach: ['#d9765a', '#ffc2a8'],
    white: ['#d8cfc8', '#ffffff'], blue: ['#1d1dc0', '#5c5cff'], pink: ['#c41f7c', '#ff8acb'], grey: ['#6f6c66', '#cfcac2'], black: ['#000000', '#3a3a3a'], lime: ['#9fbd00', '#f0ff9a'], steel: ['#4b5563', '#b8c0cc'] };
  const bc = (c) => ({ c: HEX[c] || c, side: BOX[c][0], top: BOX[c][1] });
  const hx = (c) => HEX[c] || c;
  // 傾いた軌道の上の点（R：半径、a：角度、tilt：傾き、phi：向き）
  const orb = (R, a, tilt, phi) => { const x = R * Co(a), yl = R * S(a), z1 = -yl * Co(tilt); return [x * Co(phi) + z1 * S(phi), yl * S(tilt), -x * S(phi) + z1 * Co(phi)]; };
  // 回転（縦に倒す→横に回す）を、点にかける
  const rot = (v, rx, ry) => { const cx = Co(rx), sx = S(rx), cy = Co(ry), sy = S(ry), a = [v[0], v[1] * cx - v[2] * sx, v[1] * sx + v[2] * cx]; return [a[0] * cy + a[2] * sy, a[1], -a[0] * sy + a[2] * cy]; };
  // 傾いた軌道の上に、等間隔に並べる（いつもカメラの方を向く）
  const lane = (o, pre, from, n, R, y, tilt, phi, ph, st) => range(n).forEach((i) => { const q = orb(R, ph + (i / n) * TAU, tilt, phi); o[pre + (from + i)] = Object.assign({ p: [q[0], q[1] + y, q[2]], bill: 1 }, st ? st(i) : {}); });
  // 床の上に、輪の形に寝かせて並べる
  const floorRing = (o, pre, from, n, R, y, ph, st) => range(n).forEach((i) => { const a = ph + (i / n) * TAU; o[pre + (from + i)] = Object.assign({ p: [Co(a) * R, y, S(a) * R], r: [-PI / 2, 0, -a] }, st ? st(i) : {}); });
  // 床の円の目盛り / 縦の寸法線 / 円の線
  const ticks = (segs, c, R, n, y, every, s1, s2) => range(n).forEach((k) => { const a = (k / n) * TAU, r1 = R + (k % every ? s1 : s2); segs.push([[c[0] + Co(a) * R, y, c[2] + S(a) * R], [c[0] + Co(a) * r1, y, c[2] + S(a) * r1]]); });
  const vdim = (segs, x, z, y0, y1, step, w) => { segs.push([[x, y0, z], [x, y1, z]]); for (let y = y0; y <= y1 + 1e-6; y += step) segs.push([[x, y, z], [x + w, y, z]]); };
  const circle = (R, y, n = 48, c = [0, 0, 0]) => range(n + 1).map((i) => [c[0] + Co((i / n) * TAU) * R, y, c[2] + S((i / n) * TAU) * R]);
  // たるんだひも（a から b へ、真ん中が sag だけ下がる）
  const rope = (a, b, sag, n = 12) => range(n + 1).map((i) => { const u = i / n, q = lerp3(a, b, u); q[1] -= sag * 4 * u * (1 - u); return q; });
  // 小さな形（いろいろな形と色を、順番に）
  const TS = ['circle', 'square', 'tri', 'half', 'quarter', 'diamond', 'lens', 'circle'], TC = ['verm', 'orange', 'teal', 'navy', 'cream', 'peach', 'blue', 'white'];
  const mini = (i, w) => ({ shape: TS[i % 8], w: w || 0.14, c: TC[(i * 3) % 8] });
  // 形を作る（ぐにゃぐにゃ / 正多角形 / 好きな点の並び）
  const blob = (ph, a1, a2) => { const r = new Float32Array(cfg.N); for (let i = 0; i < cfg.N; i++) { const a = -PI / 2 + (i / cfg.N) * TAU; r[i] = 1 + a1 * S(3 * a + ph) + a2 * S(5 * a - ph * 1.3) + 0.04 * S(8 * a + ph * 2); } return r; };
  const ngon = (n, rot0 = 0) => cfg.fromPoly(range(n).map((k) => [Co(rot0 + (k / n) * TAU), S(rot0 + (k / n) * TAU)]));
  const shape = (pts) => cfg.fromPoly(pts);
  // 回転の行列（Y→X→Z の順。部品の向きと同じ決まり）。かけ算して、また角度にもどせる
  const mat = (rx, ry, rz = 0) => { const cx = Co(rx), sx = S(rx), cy = Co(ry), sy = S(ry), cz = Co(rz), sz = S(rz);
    return [[cy, sy * sx, sy * cx], [0, cx, -sx], [-sy, cy * sx, cy * cx]].map((r) => [r[0] * cz + r[1] * sz, -r[0] * sz + r[1] * cz, r[2]]); };
  const mmul = (A, B) => A.map((r) => [0, 1, 2].map((j) => r[0] * B[0][j] + r[1] * B[1][j] + r[2] * B[2][j]));
  const mv = (M, v) => M.map((r) => r[0] * v[0] + r[1] * v[1] + r[2] * v[2]);
  const eul = (M) => [Math.asin(Math.max(-1, Math.min(1, -M[1][2]))), Math.atan2(M[0][2], M[2][2]), Math.atan2(M[1][0], M[1][1])];
  // ベクトルの道具と、「この向きに向ける」回転（ax：向ける軸。箱は 'z'、山や円すいは 'y'）
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const aim = (v, ax = 'z') => { const d = nrm(v); let X, Y, Z;
    if (ax === 'z') { Z = d; X = nrm(cross(Math.abs(d[1]) < 0.95 ? [0, 1, 0] : [1, 0, 0], Z)); Y = cross(Z, X); }
    else { Y = d; X = nrm(cross(Y, Math.abs(d[2]) < 0.95 ? [0, 0, 1] : [1, 0, 0])); Z = cross(X, Y); }
    return eul([[X[0], Y[0], Z[0]], [X[1], Y[1], Z[1]], [X[2], Y[2], Z[2]]]); };
  const camYaw = (t) => (t * TAU) / (cfg.ORBIT_SEC || 22);   // カメラが今どちらを向いているか（だいたい）
  const pool = (A, pre, n, f) => range(n).forEach((i) => { A[pre + i] = f(i); });

  // ===== メイン版と同じ「いろいろな素材」の物体一覧（銀の玉・ガラス・ホログラム・色の帯・ばね…）。4つのバージョンで共通 =====
  const roster = (A) => {
    range(48).forEach((i) => { const o = { type: 'flat', shape: TS[i % 8], w: 0.3, c: TC[(i * 3) % 8] };   // 小さな形 t0〜t47
      if (i % 5 === 0) o.split = i % 2 ? 'navy' : 'verm';
      if (i % 7 === 3) { o.c = 'peach'; o.stripes = 'verm'; }
      if (i % 9 === 4) { o.g = ['cyan', 'blue', 'pink']; o.ga = PI / 2; }
      A['t' + i] = o; });
    const SC = ['cream', 'verm', 'orange', 'teal', 'navy', 'peach', 'blue', 'white'];
    range(40).forEach((i) => { A['s' + i] = Object.assign({ type: 'box', bw: 0.42, bh: 1, bd: 0.42 }, bc(i % 16 === 11 ? 'lime' : SC[(i * 5) % 8]));   // 箱 s0〜s39
      if (i % 6 === 2) A['s' + i].g = ['#ffb08a', '#ff7a7a']; if (i % 6 === 5) A['s' + i].g = ['#2a2a2a', '#3a1a2a', '#ff4fa3']; });
    const CC = ['orange', 'cream', 'verm', 'teal', 'navy', 'white', 'peach', 'blue'];
    range(16).forEach((i) => { const c = CC[i % 8]; A['c' + i] = { type: 'coin', w: 0.5, d: 0.15, c, bull: i % 3 === 0 ? (c === 'cream' ? 'verm' : 'cream') : null }; });   // コイン c0〜c15
    const BG = [null, ['white', 'orange'], ['white', 'teal'], ['white', '#ff9ad5', 'pink'], null, ['white', 'cream', 'verm'], ['white', '#9ad7ff', 'blue'], null, ['white', 'orange', 'verm'], ['white', 'teal', 'navy']];
    range(16).forEach((i) => { A['b' + i] = { type: 'sphere', w: 0.2 + (i % 3) * 0.06 }; if (BG[i % 10]) A['b' + i].g = BG[i % 10]; });   // 玉 b0〜b15（null は銀色）
    const RC = ['cream', 'navy', 'teal', 'orange', 'verm', 'white'];
    range(12).forEach((i) => { A['r' + i] = { type: 'lines', kind: 'ring', w: 1 + (i % 8) * 0.5, c: RC[i % 6], lw: 1.2, alpha: 0.7 }; });   // 線の輪 r0〜r11
    const ROWS = [[[0.5, '#f4f4f4'], [0.9, ['cyan', 'pink', '#ff9ad5']], [0.7, 'teal'], [0.5, 'blue'], [0.9, 'verm'], [0.4, 'peach'], [0.3, 'orange'], [0.8, ['white', '#1b1b1b']]],
      [[0.4, 'white'], [1.2, '#2b2b2b'], [1.4, ['white', '#9a9a9a', '#1b1b1b']], [0.6, 'blue'], [0.7, 'navy']], [[1.4, ['pink', '#ff9ad5', 'blue']], [0.6, 'navy'], [0.6, 'teal'], [0.9, 'cream'], [0.6, 'orange']],
      [[0.6, 'orange'], [1.0, 'teal'], [0.5, '#d8ff00'], [0.8, 'cream'], [0.7, ['#1b1b1b', 'white']], [0.5, 'verm']], [[1.6, ['#1b1b1b', '#bdbdbd']], [0.5, 'orange'], [0.8, 'black'], [0.6, 'verm']],
      [[0.9, 'verm'], [0.5, 'orange'], [1.2, 'navy'], [0.7, ['cyan', 'white']]], [[0.7, 'cream'], [1.1, ['orange', 'pink']], [0.5, 'navy'], [0.8, 'teal']], [[1.2, ['blue', 'cyan']], [0.4, 'white'], [0.9, 'peach'], [0.6, 'navy']]];
    range(8).forEach((i) => { A['st' + i] = { type: 'strip', w: 3.2, h: 0.45, segs: ROWS[i], sp: [0.9, -0.6, 1.2, -1.4, 0.7, -1.0, 0.8, -1.2][i] }; });   // 流れる色の帯 st0〜st7
    range(32).forEach((i) => { A['sc' + i] = { type: 'sector', ro: 1, ri: 0, a0: 0, a1: PI / 2, c: SC[(i * 3) % 8] }; });   // 扇形 sc0〜sc31
    range(32).forEach((i) => { A['fl' + i] = { type: 'flat', shape: 'circle', w: 0.5, c: SC[(i * 7) % 8] }; });   // 大きめの平らな形 fl0〜fl31
    range(8).forEach((i) => { A['w' + i] = { type: 'path', c: 'cream', lw: 1, alpha: 0.85 }; });
    range(12).forEach((i) => { A['tx' + i] = { type: 'text', str: '', c: 'navy', alpha: 0.85, s: 0.13, bill: 1 }; });
    range(6).forEach((i) => { A['ty' + i] = { type: 'type', str: 'A', s: 0.6, ext: 0.15, c: 'cream', c2: 'navy' }; });
    Object.assign(A, {
      chrome0: { type: 'sphere', w: 0.9 }, chrome1: { type: 'sphere', w: 0.5 },
      glass0: { type: 'sphere', w: 1.4, glass: 1 }, glass1: { type: 'sphere', w: 0.9, glass: 1 }, glass2: { type: 'sphere', w: 0.6, glass: 1 },
      holo0: { type: 'box', bw: 2.2, bh: 0.2, bd: 0.6, c: '#e8e8ff', holo: 1 }, holo1: { type: 'box', bw: 1.4, bh: 0.16, bd: 0.5, c: '#e8e8ff', holo: 1 }, holo2: { type: 'box', bw: 0.5, bh: 0.5, bd: 0.5, c: '#e8e8ff', holo: 1 },
      aster0: { type: 'aster', w: 0.6, g: ['cream', 'white', 'pink'] }, aster1: { type: 'aster', w: 0.35, c: 'cream' },
      sun0: { type: 'flat', shape: 'sun', w: 0.32, c: 'cream' },
      pill0: { type: 'flat', shape: 'circle', w: 0.55, sx: 0.75, g: ['#ffd0dc', 'pink', 'blue'], ga: 0.8 }, pill1: { type: 'flat', shape: 'circle', w: 0.45, sx: 0.7, g: ['white', 'cyan', 'blue'], ga: 0.8 },
      bigc: { type: 'flat', shape: 'circle', w: 2.2, g: ['white', '#a0a0a0'], ga: PI / 2, split: '#1b1b1b' },
      dots0: { type: 'lines', kind: 'dots', nx: 12, ny: 12, gap: 0.55, dot: 0.04, c: 'navy', alpha: 0.6, z: -60 }, dots1: { type: 'lines', kind: 'dots', nx: 6, ny: 6, gap: 0.3, dot: 0.035, c: 'cream', alpha: 1 },
      wave0: { type: 'lines', kind: 'wave', w: 2.6, h: 2, n: 12, amp: 0.45, c: 'navy', alpha: 0.85 }, wave1: { type: 'lines', kind: 'wave', w: 2.0, h: 1.4, n: 10, amp: 0.35, c: 'cream', alpha: 0.85 },
      frames0: { type: 'lines', kind: 'frames', w: 6.5, h: 6.5, n: 3, c: 'navy', alpha: 0.7, z: -45 },
      burst0: { type: 'lines', kind: 'burst', w: 3, n: 24, spread: TAU, a0: 0, c: 'navy', alpha: 0.35, z: -42 }, burst1: { type: 'lines', kind: 'burst', w: 0.8, n: 12, spread: TAU, a0: 0, c: 'cream', alpha: 0.9 },
      spring0: { type: 'lines', kind: 'spring', w: 0.45, L: 5, n: 22, c: 'cream', alpha: 0.8 }, spring1: { type: 'lines', kind: 'spring', w: 0.3, L: 1.6, n: 12, c: 'cream', alpha: 0.9 }, spring2: { type: 'lines', kind: 'spring', w: 0.25, L: 2.2, n: 14, c: 'navy', alpha: 0.8 }
    });
    return A; };
  // にぎやかしの小物（はねる棒・回るコイン・はずむ玉）
  const eq = (o, from, n, R, y, t, hmax = 1.3, w = 0.22, d = 0.5, ph = 0, sp = 1.8) => range(n).forEach((i) => { const a = ang(i, n, ph), h = 0.3 + hmax * Math.abs(S(t * sp + i * 0.7)); o['s' + (from + i)] = { p: [Co(a) * R, y + h / 2, S(a) * R], r: [0, -a, 0], bw: w, bd: d, bh: h }; });
  const spin = (o, from, n, R, y, t, ph = 0, w = 0.32, bob = 0) => range(n).forEach((i) => { const a = ang(i, n, ph); o['c' + (from + i)] = { p: [Co(a) * R, y + bob * S(t * 1.5 + i), S(a) * R], r: [0, t * 2 + i, 0], w, d: 0.1 }; });
  const hop = (o, from, n, R, y, t, amp = 0.6, ph = 0, w) => range(n).forEach((i) => { const a = ang(i, n, ph); o['b' + (from + i)] = Object.assign({ p: [Co(a) * R, y + Math.abs(S(t * 2.6 + i * 0.8)) * amp, S(a) * R] }, w ? { w } : {}); });
  const capsule = (L, r = 0.35) => cfg.fromPoly([].concat(range(9).map((k) => { const a = -PI / 2 + (k * PI) / 8; return [L + Co(a) * r, S(a) * r]; }), range(9).map((k) => { const a = PI / 2 + (k * PI) / 8; return [-L + Co(a) * r, S(a) * r]; })));
  return { S, Co, PI, TAU, DG, FLOOR, cl, io, range, ang, rnd, fr, lerp, lerp3, add, bc, hx, orb, rot, lane, floorRing, ticks, vdim, circle, rope, mini, blob, ngon, shape, pool, mat, mmul, mv, eul, sub, nrm, cross, aim, camYaw, roster, eq, spin, hop, capsule, cfg };
};
