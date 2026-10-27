// hero-scenes.js — 入場画面の「登場する物体の一覧」と、ショット 1〜4。（ショット 5〜8 は hero-scenes2.js）
// カメラは、いつもまわりをぐるぐる回っています（hero.js）。どの向きから見ても楽しめるように、物体は360度に並べています。
//
// 位置 p:[横, 縦(上が＋), 奥行き]　回転 r:[縦に倒す, 横に回す, ひねる]（ラジアン）　大きさ s
// bill: 1 … いつもカメラの方を向く、平らな板（立体の中に、平らな絵が浮かぶ）
// scr: [右, 上, 手前] … カメラから見た向きで位置をずらす（ポスターの形を、どこから見ても保つ）
// 平らな形の shape：circle / square / tri / diamond / half / quarter / lens / spark / sun / wedge
// 色：cream / teal / orange / verm / navy / blue / pink / peach / cyan / white / black、または '#xxxxxx'
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function () {
  const S = Math.sin, Co = Math.cos, PI = Math.PI, TAU = PI * 2;
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const FLOOR = [-PI / 2, 0, 0];   // 床に寝かせる向き
  const range = (n) => Array.from({ length: n }, (_, i) => i);
  const ang = (i, n, ph = 0) => ph + (i / n) * TAU;
  // 箱の色（正面・横・上）
  const BOX = { verm: ['#b83a12', '#ff7a4c'], orange: ['#c96a00', '#ffb24d'], teal: ['#0d7d7a', '#3fc6c2'], navy: ['#0b1026', '#2b3566'], cream: ['#d9b9a6', '#fff4ea'],
    peach: ['#d9765a', '#ffc2a8'], blue: ['#1d1dc0', '#5c5cff'], white: ['#d8cfc8', '#ffffff'], lime: ['#9fbd00', '#f0ff9a'], pink: ['#c41f7c', '#ff8acb'] };
  const bc = (c) => ({ c: c === 'lime' ? '#d8ff00' : c, side: BOX[c][0], top: BOX[c][1] });
  // 傾いた軌道の上の点（R：半径、a：軌道の上の角度、tilt：軌道の傾き、phi：軌道の向き）。輪の r:[-PI/2 + tilt, phi, 0] と同じ形になる
  const orb = (R, a, tilt, phi) => { const x = R * Co(a), yl = R * S(a), z1 = -yl * Co(tilt); return [x * Co(phi) + z1 * S(phi), yl * S(tilt), -x * S(phi) + z1 * Co(phi)]; };
  window.OC_HERO_LIB = { S, Co, PI, TAU, cl, io, FLOOR, range, ang, bc, orb };   // hero-scenes2.js でも使う道具

  // ===== 登場する物体の一覧（ここに書いた値が、ふだんの見た目） =====
  const A = {};
  const TC = ['verm', 'orange', 'teal', 'navy', 'cream', 'peach', 'blue', 'white'], TS = ['circle', 'square', 'tri', 'half', 'quarter', 'diamond', 'lens', 'circle'];
  range(24).forEach((i) => {   // 小さな平らな形 t0〜t23
    const o = { type: 'flat', shape: TS[i % 8], w: 0.32, c: TC[(i * 3) % 8] };
    if (i % 5 === 0) o.split = i % 2 ? 'navy' : 'verm';
    if (i % 7 === 3) { o.c = 'peach'; o.stripes = 'verm'; }
    if (i % 9 === 4) { o.g = ['cyan', 'blue', 'pink']; o.ga = PI / 2; }
    A['t' + i] = o;
  });
  const SC = ['cream', 'verm', 'orange', 'teal', 'navy', 'peach', 'blue', 'white'];
  range(16).forEach((i) => {   // 箱 s0〜s15
    A['s' + i] = Object.assign({ type: 'box', bw: 0.42, bh: 1, bd: 0.42 }, bc(i === 11 ? 'lime' : SC[(i * 5) % 8]));
    if (i % 6 === 2) A['s' + i].g = ['#ffb08a', '#ff7a7a'];
    if (i % 6 === 5) A['s' + i].g = ['#2a2a2a', '#3a1a2a', '#ff4fa3'];
  });
  const CC = ['orange', 'cream', 'verm', 'teal', 'navy', 'white', 'peach', 'blue'];
  range(8).forEach((i) => { A['c' + i] = { type: 'coin', w: 0.5, d: 0.15, c: CC[i], bull: i % 3 === 0 ? (CC[i] === 'cream' ? 'verm' : 'cream') : null }; });   // コイン c0〜c7
  const BG = [null, ['white', 'orange'], ['white', 'teal'], ['white', '#ff9ad5', 'pink'], null, ['white', 'cream', 'verm'], ['white', '#9ad7ff', 'blue'], null, ['white', 'orange', 'verm'], ['white', 'teal', 'navy']];
  range(10).forEach((i) => { A['b' + i] = { type: 'sphere', w: 0.2 + (i % 3) * 0.06 }; if (BG[i]) A['b' + i].g = BG[i]; });   // 玉 b0〜b9
  const RC = ['cream', 'navy', 'teal', 'orange', 'verm', 'white'];
  range(6).forEach((i) => { A['r' + i] = { type: 'lines', kind: 'ring', w: 1 + i * 0.5, c: RC[i], lw: 1.2, alpha: 0.7 }; });   // 線の輪 r0〜r5
  const ROWS = [   // 流れる色の帯 st0〜st5 の、色の並び（[ ] はグラデーション）
    [[0.5, '#f4f4f4'], [0.9, ['cyan', 'pink', '#ff9ad5']], [0.7, 'teal'], [0.5, 'blue'], [0.9, 'verm'], [0.4, 'peach'], [0.3, 'orange'], [0.8, ['white', '#1b1b1b']]],
    [[0.4, 'white'], [1.2, '#2b2b2b'], [1.4, ['white', '#9a9a9a', '#1b1b1b']], [0.6, 'blue'], [0.7, 'navy']],
    [[1.4, ['pink', '#ff9ad5', 'blue']], [0.6, 'navy'], [0.6, 'teal'], [0.9, 'cream'], [0.6, 'orange']],
    [[0.6, 'orange'], [1.0, 'teal'], [0.5, '#d8ff00'], [0.8, 'cream'], [0.7, ['#1b1b1b', 'white']], [0.5, 'verm']],
    [[1.6, ['#1b1b1b', '#bdbdbd']], [0.5, 'orange'], [0.8, 'black'], [0.6, 'verm']],
    [[0.9, 'verm'], [0.5, 'orange'], [1.2, 'navy'], [0.7, ['cyan', 'white']]]
  ];
  range(6).forEach((i) => { A['st' + i] = { type: 'strip', w: 3.2, h: 0.45, segs: ROWS[i], sp: [0.9, -0.6, 1.2, -1.4, 0.7, -1.0][i] }; });
  Object.assign(A, {   // 1つずつの物
    plat: { type: 'coin', w: 4, d: 0.3, c: 'teal', z: -60 },   // 舞台（大きな円盤）
    disc: { type: 'flat', shape: 'circle', w: 3.2, c: 'cream', split: 'verm', z: -50 },
    chrome: { type: 'sphere', w: 0.9 },
    glass0: { type: 'sphere', w: 1.5, glass: 1 }, glass1: { type: 'sphere', w: 1.0, glass: 1 },
    holo0: { type: 'box', bw: 2.2, bh: 0.2, bd: 0.6, c: '#e8e8ff', holo: 1 }, holo1: { type: 'box', bw: 1.4, bh: 0.16, bd: 0.5, c: '#e8e8ff', holo: 1 },
    pillar: Object.assign({ type: 'box', bw: 0.5, bh: 5.4, bd: 0.5 }, bc('navy')),
    aster0: { type: 'aster', w: 0.6, g: ['cream', 'white', 'pink'] }, aster1: { type: 'aster', w: 0.35, c: 'cream' },
    sun0: { type: 'flat', shape: 'sun', w: 0.32, c: 'cream' }, spark0: { type: 'flat', shape: 'spark', w: 0.5, c: 'teal' },
    pill0: { type: 'flat', shape: 'circle', w: 0.55, sx: 0.75, g: ['#ffd0dc', 'pink', 'blue'], ga: 0.8 },
    bigc: { type: 'flat', shape: 'circle', w: 2.2, g: ['white', '#a0a0a0'], ga: PI / 2, split: '#1b1b1b' },
    bar0: { type: 'flat', shape: 'square', sx: 0.14, sy: 1.6, c: 'cream' }, bar1: { type: 'flat', shape: 'square', sx: 0.2, sy: 1.6, c: 'verm' },
    bar2: { type: 'flat', shape: 'square', sx: 0.3, sy: 1.5, holo: 1, ga: PI / 2 },
    wedge0: { type: 'flat', shape: 'wedge', w: 0.8, c: 'verm' }, half0: { type: 'flat', shape: 'half', w: 0.6, c: 'orange' }, quarter0: { type: 'flat', shape: 'quarter', w: 0.6, c: 'navy' },
    dots0: { type: 'lines', kind: 'dots', nx: 9, ny: 9, gap: 0.42, dot: 0.04, c: 'navy', alpha: 1, z: -40 },
    dots1: { type: 'lines', kind: 'dots', nx: 6, ny: 6, gap: 0.3, dot: 0.035, c: 'cream', alpha: 1 },
    wave0: { type: 'lines', kind: 'wave', w: 2.6, h: 2, n: 12, amp: 0.45, c: 'navy', alpha: 0.85 }, wave1: { type: 'lines', kind: 'wave', w: 2.0, h: 1.4, n: 10, amp: 0.35, c: 'cream', alpha: 0.85 },
    frames0: { type: 'lines', kind: 'frames', w: 6.5, h: 6.5, n: 3, c: 'navy', alpha: 0.7, z: -45 },
    burst0: { type: 'lines', kind: 'burst', w: 3, n: 24, spread: TAU, a0: 0, c: 'navy', alpha: 0.35, z: -42 },
    burst1: { type: 'lines', kind: 'burst', w: 0.8, n: 12, spread: TAU, a0: 0, c: 'cream', alpha: 0.9 },
    spring0: { type: 'lines', kind: 'spring', w: 0.45, L: 5, n: 22, c: 'cream', alpha: 0.8 }, spring1: { type: 'lines', kind: 'spring', w: 0.3, L: 1.6, n: 12, c: 'cream', alpha: 0.9 }
  });

  // ===== ショット 1〜4 =====
  // cam：pitch（見下ろす角度。1.4で真上）、dist（距離）、zoom、t（見る場所）。横の向きは hero.js が回し続ける
  const shots = [
    { // 1) 曼荼羅：真上から見ると平らなポスター。カメラが下りてくると、棒や玉が立ち上がる
      name: 'MANDALA', bg: 'cream', sel: 's4',
      cam: (tb, t) => ({ pitch: 1.35 - 0.85 * io(cl((tb - 1.2) / 2.6)), dist: 11, zoom: 1, t: [0, -0.7, 0] }),
      act: (t) => {
        const o = {
          plat: { p: [0, -1.55, 0], r: FLOOR, w: 4, d: 0.3, c: 'teal' },
          disc: { p: [0, -1.39, 0], r: FLOOR, w: 3.2, c: 'cream', split: 'verm', sa: t * 0.4 },
          burst0: { p: [0, -1.38, 0], r: FLOOR, w: 3.1, a0: t * 0.2 },
          aster0: { p: [0, 0.55 + 0.12 * S(t * 1.6), 0], bill: 1, r: [0, 0, t] },
          sun0: { p: [0, 1.5, 0], bill: 1, r: [0, 0, -t * 0.6] },
          r0: { p: [0, -1.72, 0], r: FLOOR, w: 4.4, c: 'navy', alpha: 0.5 }, r1: { p: [0, -1.72, 0], r: FLOOR, w: 4.8, c: 'verm', alpha: 0.5 },
          r2: { p: [0, 0.4, 0], r: [-PI / 2 + 0.35, t * 0.3, 0], w: 2.2, c: 'navy', alpha: 0.6 }
        };
        range(12).forEach((i) => { const a = ang(i, 12, t * 0.25); o['t' + i] = { p: [Co(a) * 2.45, -1.37, S(a) * 2.45], r: [-PI / 2, 0, -a + t], w: 0.36 }; });
        range(12).forEach((i) => { const a = ang(i, 12, -t * 0.4 + 0.26); o['t' + (12 + i)] = { p: [Co(a) * 1.35, -0.55 + 0.18 * S(t * 2 + i), S(a) * 1.35], bill: 1, w: 0.2 }; });
        range(16).forEach((i) => { const a = ang(i, 16, t * 0.25), h = 0.35 + 1.3 * Math.abs(S(t * 1.8 + i * 0.7)); o['s' + i] = { p: [Co(a) * 3.55, -1.4 + h / 2, S(a) * 3.55], r: [0, -a, 0], bw: 0.22, bd: 0.5, bh: h }; });
        range(4).forEach((i) => { o['c' + i] = { p: [0, -1.28 + i * 0.16, 0], r: FLOOR, w: 0.6 - i * 0.08 }; });
        range(4).forEach((i) => { const a = ang(i, 4, t * 0.6); o['c' + (4 + i)] = { p: [Co(a) * 1.95, -0.95, S(a) * 1.95], r: [0, t * 2 + i, 0], w: 0.38 }; });
        range(10).forEach((i) => { const a = ang(i, 10, -t * 0.5); o['b' + i] = { p: [Co(a) * 3.0, -1.18 + Math.abs(S(t * 3 + i)) * 0.4, S(a) * 3.0] }; });
        return o;
      }
    },
    { // 2) 公転：銀の玉のまわりを、傾いた軌道に乗った玉やコインが回る
      name: 'ORBITS', bg: 'navy', sel: 'c3',
      cam: (tb, t) => ({ pitch: 0.32 + 0.12 * S(t * 0.4), dist: 12, zoom: 1, t: [0, 0, 0] }),
      act: (t) => {
        const TL = [0.35, -0.5, 0.9, -0.2, 0.6], PH = [0, 1.1, 2.3, 3.6, 4.9].map((v) => v + t * 0.05);
        const o = {
          chrome: { p: [0, 0, 0], w: 0.85 },
          glass0: { p: [0, 0, 0], w: 1.45, z: 3 },
          spring0: { p: [0, 0, 0], r: FLOOR, w: 0.22, L: 5.4, n: 26, c: 'cream', alpha: 0.6 },
          sun0: { p: [2.8, 2.1, -1.2], bill: 1, r: [0, 0, t * 0.5], w: 0.25 },
          dots0: { p: [0, -2.6, 0], r: FLOOR, nx: 11, ny: 11, gap: 0.55, c: 'cream', alpha: 0.55, z: -70 }
        };
        range(5).forEach((k) => { o['r' + k] = { p: [0, 0, 0], r: [-PI / 2 + TL[k], PH[k], 0], w: 1.45 + k * 0.6, c: ['cream', 'teal', 'orange', 'peach', 'cream'][k], alpha: 0.55 }; });
        range(10).forEach((i) => { const k = i % 5; o['b' + i] = { p: orb(1.45 + k * 0.6, t * (0.9 - k * 0.12) + i * 2.1, TL[k], PH[k]) }; });
        range(8).forEach((i) => { o['c' + i] = { p: orb(3.25, -t * 0.45 + ang(i, 8), TL[3], PH[3]), r: [0, t * 3 + i, 0], w: 0.26, d: 0.08 }; });
        range(12).forEach((i) => { o['t' + i] = { p: orb(4.05, t * 0.3 + ang(i, 12), TL[4], PH[4]), bill: 1, w: 0.17 }; });
        range(12).forEach((i) => { const a = ang(i, 12, t * 0.12); o['t' + (12 + i)] = { p: [Co(a) * 4.6, -2.55, S(a) * 4.6], r: [-PI / 2, 0, -a], shape: 'square', sx: 0.9, sy: 0.18, w: 0.4 }; });
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.12 + 0.13); o['s' + i] = { p: [Co(a) * 3.9, -2.45, S(a) * 3.9], r: [0, -a, 0], bw: 0.6, bh: 0.12, bd: 0.12 }; });
        return o;
      }
    },
    { // 3) 塔：らせん階段を、玉が転がり落ちる。カメラは上下にも動く
      name: 'TOWER', bg: 'teal', sel: 's7',
      cam: (tb, t) => ({ pitch: 0.28 + 0.16 * S(t * 0.5), dist: 12, zoom: 0.95, t: [0, 0.2 + 0.5 * S(tb * 0.5), 0] }),
      act: (t) => {
        const sp = (i) => { const a = i * 0.62 + t * 0.3; return { a, x: Co(a), z: S(a), y: -2.3 + i * 0.3 }; };
        const o = {
          pillar: { p: [0, 0.2, 0] },
          plat: { p: [0, -2.65, 0], r: FLOOR, w: 3.4, d: 0.3, c: 'verm' },
          spring0: { p: [0, 0.3, 0], r: FLOOR, w: 0.5, L: 5.2, n: 30, c: 'cream', alpha: 0.7 },
          aster0: { p: [0, 3.25, 0], bill: 1, r: [0, 0, t], w: 0.55 },
          holo0: { p: [Co(-t * 0.8) * 2.1, 2.5, S(-t * 0.8) * 2.1], r: [0.2, t * 0.8, 0], bw: 1.4 },
          dots0: { p: [0, -2.82, 0], r: FLOOR, nx: 12, ny: 12, gap: 0.6, c: 'cream', alpha: 0.6, z: -70 }
        };
        range(16).forEach((i) => { const q = sp(i); o['s' + i] = { p: [q.x * 1.2, q.y, q.z * 1.2], r: [0, -q.a, 0], bw: 1.05, bh: 0.1, bd: 0.42 }; });
        range(8).forEach((i) => { const q = sp(i * 2 + 1); o['c' + i] = { p: [q.x * 1.45, q.y + 0.2, q.z * 1.45], r: [0, t * 2.4 + i, 0], w: 0.16, d: 0.06 }; });
        range(10).forEach((i) => { const u = (t * 0.12 + i / 10) % 1, q = sp((1 - u) * 15); o['b' + i] = { p: [q.x * 0.95, q.y + 0.25, q.z * 0.95], w: 0.16 }; });
        range(6).forEach((i) => { o['r' + i] = { p: [0, -2 + i, 0], r: [-PI / 2 + 0.18 * S(t + i), t * 0.4 + i, 0], w: 2.0 - i * 0.12, c: i % 2 ? 'cream' : 'navy', alpha: 0.65 }; });
        range(12).forEach((i) => { const q = sp(i * 1.3); o['t' + i] = { p: [q.x * 2.3, q.y + 0.6, q.z * 2.3], bill: 1, w: 0.22 }; });
        range(12).forEach((i) => { const a = ang(i, 12, -t * 0.15); o['t' + (12 + i)] = { p: [Co(a) * 2.75, -2.48, S(a) * 2.75], r: [-PI / 2, 0, -a], w: 0.32 }; });
        range(4).forEach((i) => { const a = ang(i, 4, t * 0.2 + 0.4); o['st' + i] = { p: [Co(a) * 3.3, 0.2, S(a) * 3.3], r: [0, PI / 2 - a, PI / 2], w: 4.2, h: 0.32 }; });
        return o;
      }
    },
    { // 4) 信号：色の帯が回転扉のように回り、まわりを小さな立方体が漂う
      name: 'SIGNAL', bg: '#ececec', sel: 'st1',
      cam: (tb, t) => ({ pitch: 0.2 + 0.1 * S(t * 0.6), dist: 11.5, zoom: 1, t: [0, 0.1, 0] }),
      act: (t) => {
        const o = {
          chrome: { p: [0, 0.1, 0], w: 0.42 },
          dots0: { p: [0, -1.85, 0], r: FLOOR, nx: 13, ny: 13, gap: 0.5, c: 'navy', alpha: 0.7, z: -70 },
          frames0: { p: [0, -1.85, 0], r: FLOOR, w: 7, h: 7, c: 'navy', alpha: 0.6 },
          r0: { p: [0, -1.84, 0], r: FLOOR, w: 3.6, c: 'navy', alpha: 0.6 }, r1: { p: [0, 1.32, 0], r: FLOOR, w: 3.35, c: 'navy', alpha: 0.6 }
        };
        range(6).forEach((i) => { const a = ang(i, 6, t * 0.35); o['st' + i] = { p: [Co(a) * 1.75, -0.25, S(a) * 1.75], r: [0, -a, 0], w: 3.1, h: 2.9 }; });
        range(16).forEach((i) => { const a = ang(i % 8, 8, -t * 0.25 + (i >= 8 ? 0.39 : 0)); o['s' + i] = { p: [Co(a) * 3.5, (i >= 8 ? 1.9 : -1.1) + 0.15 * S(t * 2 + i), S(a) * 3.5], r: [t * 0.7 + i, t * 0.5, 0], bw: 0.36, bh: 0.36, bd: 0.36 }; });
        range(24).forEach((i) => { const k = Math.floor(i / 8), a = ang(i % 8, 8, t * (0.2 + k * 0.1) + k * 0.4), R = [2.4, 3.0, 2.7][k]; o['t' + i] = { p: [Co(a) * R, [2.35, 0.5, -1.35][k], S(a) * R], bill: 1, w: 0.2 }; });
        range(10).forEach((i) => { const a = ang(i, 10, -t * 0.3 + 0.2); o['b' + i] = { p: [Co(a) * 2.35, -1.65 + Math.abs(S(t * 2.6 + i * 0.8)) * 0.9, S(a) * 2.35], w: 0.18 }; });
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.18 + 0.2); o['c' + i] = { p: [Co(a) * 4.2, -1.45, S(a) * 4.2], r: [0, t * 2 + i, 0], w: 0.38 }; });
        return o;
      }
    }
  ];

  window.OC_HERO_ACTORS = A;
  return shots;
};
