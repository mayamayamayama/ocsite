// hero-scenes2.js — 入場画面のショット 5〜8。書き方は hero-scenes.js の上の説明と同じです
// （登場する物体の一覧は hero-scenes.js にあります）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function () {
  const S = Math.sin, Co = Math.cos, PI = Math.PI;
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const FLOOR = [-PI / 2, 0, 0];
  const A = window.OC_HERO_ACTORS;

  // 流れる色の帯（ショット7）の、行ごとの並び。色の配列は、グラデーション
  const ROWS = [
    [[0.5, '#f4f4f4'], [0.9, ['cyan', 'pink', '#ff9ad5']], [0.7, 'teal'], [0.5, 'blue'], [0.9, 'verm'], [0.4, 'peach'], [0.3, 'orange'], [0.8, ['white', '#1b1b1b']]],
    [[0.4, 'white'], [1.2, '#2b2b2b'], [1.4, ['white', '#9a9a9a', '#1b1b1b']], [0.6, 'blue'], [0.7, 'navy']],
    [[1.4, ['pink', '#ff9ad5', 'blue']], [0.6, 'navy'], [0.6, 'teal'], [0.9, 'cream'], [0.6, 'orange']],
    [[0.6, 'orange'], [1.0, 'teal'], [0.5, '#d8ff00'], [0.8, 'cream'], [0.7, ['#1b1b1b', 'white']], [0.5, 'verm']],
    [[1.6, ['#1b1b1b', '#bdbdbd']], [0.5, 'orange'], [0.8, 'black'], [0.6, 'verm']],
    [[0.9, 'verm'], [0.5, 'orange'], [1.2, 'navy'], [0.7, ['cyan', 'white']]]
  ];
  const RY = [2.3, 1.55, 0.72, -0.05, -0.75, -1.42], RH = [0.5, 0.66, 0.86, 0.4, 0.6, 0.38], RS = [0.9, -0.6, 1.2, -1.4, 0.7, -1.0];
  ROWS.forEach((segs, i) => { A['row' + i] = { type: 'strip', w: 13, h: RH[i], segs, sp: RS[i] }; });

  // グラデーションのブロック（ショット8）
  Object.assign(A, {
    b1: { type: 'box', bw: 1.4, bh: 1.4, bd: 1.4, c: 'peach', g: ['#ffb08a', '#ff7a7a'], side: '#e0604f', top: '#ffc6a8' },
    b2: { type: 'box', bw: 1.4, bh: 2.2, bd: 1.4, c: '#1b1b1b', g: ['#2a2a2a', '#3a1a2a', '#ff4fa3'], side: '#111111', top: '#333333' },
    b3: { type: 'box', bw: 1.4, bh: 1.4, bd: 1.4, c: '#d8ff00', side: '#9fbd00', top: '#f0ff9a' },
    b4: { type: 'box', bw: 1.4, bh: 0.9, bd: 1.4, c: '#cfcfcf', g: ['#f2f2f2', '#9a9a9a'], side: '#8a8a8a', top: '#ffffff' },
    b5: { type: 'box', bw: 1.4, bh: 0.4, bd: 1.4, c: 'orange', side: '#c96a00', top: '#ffb24d' },
    b6: { type: 'box', bw: 1.4, bh: 0.45, bd: 1.4, c: 'verm', side: '#b83a12', top: '#ff7a4c' },
    b7: { type: 'box', bw: 0.7, bh: 3.2, bd: 0.7, c: 'blue', g: ['cyan', 'blue'], side: '#1d1dc0', top: '#7fe9ff' },
    b8: { type: 'box', bw: 2.4, bh: 0.28, bd: 1.6, c: 'cream', side: '#d9b9a6', top: '#fff4ea' },
    b9: { type: 'box', bw: 0.9, bh: 0.9, bd: 0.9, c: 'pink', g: ['#ffd0dc', 'pink'], side: '#c41f7c', top: '#ff8acb' },
    b10: { type: 'box', bw: 0.5, bh: 1.9, bd: 0.5, c: 'orange', side: '#c96a00', top: '#ffb24d' },
    // 小物（いろいろなショットに、場所を変えて出てくる）
    pRing: { type: 'lines', kind: 'ring', w: 0.7, c: 'navy', lw: 1.5 },
    pRingDot: { type: 'flat', shape: 'circle', w: 0.14, c: 'verm' },
    pHatch: { type: 'flat', shape: 'square', sx: 1.1, sy: 0.75, c: 'peach', stripes: 'verm' },
    pQuart: { type: 'flat', shape: 'quarter', w: 0.75, c: 'navy' },
    pGrad: { type: 'flat', shape: 'square', sx: 0.32, sy: 1.4, g: ['cyan', 'blue', 'pink'], ga: PI / 2 },
    pBar: { type: 'flat', shape: 'square', sx: 3.2, sy: 0.035, c: 'navy' },
    pTri: { type: 'flat', shape: 'tri', w: 0.45, c: 'teal' },
    pDots: { type: 'lines', kind: 'dots', nx: 6, ny: 4, gap: 0.28, dot: 0.045, c: 'navy', alpha: 1 },
    pCoin: { type: 'coin', w: 0.6, d: 0.22, c: 'cream', c2: 'orange', bull: 'verm' },
    pCube: { type: 'box', bw: 0.75, bh: 0.75, bd: 0.75, c: 'teal', side: '#0d7d7a', top: '#3fc6c2' },
    cube2: { type: 'box', bw: 0.42, bh: 0.42, bd: 0.42, c: 'white', side: '#d8cfc8', top: '#ffffff' },
    ball1: { type: 'sphere', w: 0.3 },
    ring1: { type: 'lines', kind: 'ring', w: 0.6, c: 'cream', lw: 1.5 }
  });

  const shots = [
    { // 5) 回るコインのまわりを、カメラが一周する
      name: 'COINS', bg: 'teal', sel: 'coin2',
      cam: (tb, t) => ({ yaw: t * 0.35, pitch: 0.38, dist: 10, zoom: 1.15, t: [0, -0.4, 0] }),
      act: (t) => {
        const o = {
          coin1: { p: [-1.1, 0.8, 0], r: [0, t * 1.8, 0.14] }, coin2: { p: [-0.2, 0.8, 0.3], r: [0, t * 1.8 + 0.5, 0.14], c: '#d8ff00' }, coin3: { p: [0.7, 0.8, 0.6], r: [0, t * 1.8 + 1, 0.14], c: 'verm', c2: 'verm' },
          stk1: { p: [-2.2, -1.3 + 0.1 * S(t * 1.4), 1.0], r: FLOOR }, stk2: { p: [-2.2, -1.08 + 0.1 * S(t * 1.4), 1.0], r: FLOOR }, stk3: { p: [-2.2, -0.86 + 0.1 * S(t * 1.4), 1.0], r: FLOOR },
          orbitRing: { p: [0, -1.4, 0], r: FLOOR },
          aster: { p: [0.4, -1.4, 1.8], r: [0, 0, t * 1.2] },
          tri1: { p: [0.42, -2.55, 1.7], r: [0, t * 1.6, 0] }, tri2: { p: [0.4, -2.5, 1.65], r: [0, t * 1.6, 0] }, tri3: { p: [0.38, -2.45, 1.6], r: [0, t * 1.6, 0] },
          burst: { p: [1.4, 2.2, -0.4], r: [0, 0, 0], kind: 'burst', w: 1, n: 9, spread: 1, a0: -0.9 + 0.2 * S(t), c: 'cream' }
        };
        Object.assign(o, {
          pCube: { p: [2.3, -1.02, -1.4], r: [0, 0.4, 0] }, cube2: { p: [2.3, -0.43, -1.4], r: [0, t * 0.9, 0] },
          ball1: { p: [Co(-t * 0.7) * 2.4, -1.25, S(-t * 0.7) * 2.4] },
          ring1: { p: [-0.2, 0.8, 0.3], r: [0.3, t * 0.6, 0], w: 1.9, c: 'cream' },
          pGrad: { p: [-3.0, 0.2, -2.0], r: [0, 0.4, 0], sx: 0.3, sy: 1.6 },
          pHatch: { p: [1.8, -1.41, 1.8], r: FLOOR, sx: 0.8, sy: 0.6 },
          floorDots: { p: [0, -1.41, -2.4], r: FLOOR, c: 'cream' },
          pCoin: { p: [-2.9, 1.6 + 0.15 * S(t * 1.4), 0.4], r: [0, t * 2.2, 0] }
        });
        ['ob1', 'ob2', 'ob3'].forEach((k, i) => { const a = t * 0.9 + i * 2.1; o[k] = { p: [Co(a) * 4.2, -1.4, S(a) * 4.2] }; });
        ['rip1', 'rip2', 'rip3'].forEach((k, i) => { const q = (t * 0.35 + i / 3) % 1; o[k] = { p: [0, -1.42, 0], r: FLOOR, w: 0.5 + q * 5, alpha: 0.5 * (1 - q) }; });
        return o;
      }
    },
    { // 6) 正面に戻ると、また平らなポスター（大きな丸と虹色の帯）
      name: 'FLAT', bg: 'teal', sel: 'oDisc',
      cam: () => ({ yaw: 0, pitch: 0, dist: 40, zoom: 1, t: [0, 0.2, 0] }),
      act: (t) => ({
        oRow: { p: [0, 0.05, -0.2] },
        oBig: { p: [0, 0, 0], sa: -PI / 2 + 0.25 * S(t * 0.5) },
        oHolo: { p: [0.4, 2.7 + 0.25 * S(t * 0.9), 0.05] },
        oBar1: { p: [0.15, -2.3, 0.06], sy: 2.4 + 0.15 * S(t * 2) }, oBar2: { p: [0.6, -2.3, 0.06] }, oBar3: { p: [1.0, -2.3, 0.06], sy: 2.4 + 0.15 * S(t * 2 + 1) },
        oTri: { p: [-1.6 + 0.2 * S(t * 0.9), 0.25, 0.05] },
        oDisc: { p: [1.9 + 0.25 * Co(t * 0.6), -1.4 + 0.25 * S(t * 0.6), 0.1], sa: t * 0.4 },
        oSq: { p: [-0.4, -1.0 + 0.15 * S(t * 1.6), 0.05], r: [0, 0, t], c: '#d8ff00' },
        oCen: { p: [0.2, -0.05, 0.08], sa: t * 2 },
        pRing: { p: [0, 0, 0.03], w: 3.35, c: 'cream', lw: 1 }, ring1: { p: [-2.6, 2.5, 0.05], w: 0.38, c: 'cream' },
        pDots: { p: [-2.3, -2.4, 0.05], c: 'cream' },
        pCube: { p: [2.7, 2.4, 0.1], r: [0, 0, t * 0.3], c: 'navy', side: '#0b1026', top: '#2b3566' },
        pCoin: { p: [-2.8, -0.9, 0.1] }, pQuart: { p: [2.9, -0.2, 0.06], r: [0, 0, t * 0.5], c: 'orange' },
        pTri: { p: [-1.0, 2.9, 0.06], r: [0, 0, -t * 0.6], c: 'cream' }, pBar: { p: [0, -3.2, 0.05], c: 'cream', sx: 3.6 },
        cube2: { p: [1.6, 2.05, 0.1], r: [0, 0, -t * 0.5] }
      })
    },
    { // 7) 色の帯が流れる。カメラが回ると、帯が奥行きにばらけていたと分かる
      name: 'SIGNAL', bg: '#ececec', sel: 'row2',
      cam: (tb) => { const k = io(cl((tb - 1.9) / 1.8)); return { yaw: 0.75 * k, pitch: 0.25 * k, dist: 40 - 31 * k, zoom: 1 - 0.08 * k, t: [0, 0.4, 0] }; },
      act: (t) => {
        const o = {}; ROWS.forEach((_, i) => { o['row' + i] = { p: [0, RY[i], (i - 2.5) * 1.1] }; });
        return Object.assign(o, {
          chrome: { p: [2.8 * S(t * 0.7), RY[3], 2.2], w: 0.45 },
          pGrad: { p: [1.3, 0.45, -0.3], sx: 0.28, sy: 2.6 },   // 帯のあいだに差し込まれた、縦の光
          pCube: { p: [2.6, 2.7, 2.4], r: [t * 0.5, t * 0.7, 0] }, cube2: { p: [-2.6, -2.0, 2.0], r: [t * 0.6, t * 0.4, 0] },
          ring1: { p: [-2.4, 2.6, 1.2], r: [0, t * 1.2, 0], w: 0.45, c: 'navy' },
          pTri: { p: [2.9, -1.9, 1.5], r: [0, 0, t], c: 'verm' }
        });
      }
    },
    { // 8) グラデーションのブロックが、立体に積み上がる
      name: 'BLOCKS', bg: 'navy', sel: 'b2',
      cam: (tb, t) => ({ yaw: 0.6 + tb * 0.22, pitch: 0.32, dist: 11, zoom: 1.12, t: [0.2, 0.1, 0] }),
      act: (t) => ({
        b7: { p: [-2.7, 0.2 + 0.1 * S(t * 1.1), -1.2] }, b8: { p: [1.7, -1.05, 1.5], r: [0, 0.3, 0] }, b9: { p: [1.7, -0.45 + 0.12 * Math.abs(S(t * 2.2)), 1.5], r: [0, t * 0.8, 0] },
        b10: { p: [2.9, -0.3, -1.4] }, holoSlab: { p: [-0.6, 2.6 + 0.12 * S(t), -0.4], r: [0.2, t * 0.3, 0] },
        chrome: { p: [-1.0, -0.6 + Math.abs(S(t * 2.4)) * 1.1, 1.8], w: 0.42 }, spring: { p: [0.4, -1.0, 2.2], r: [0, PI / 2, 0], w: 0.4, L: 1.6 },
        b1: { p: [-1.2, 0 + 0.08 * S(t * 2), 0] }, b6: { p: [-1.2, -0.95, 0] },
        b2: { p: [0.2, -0.3, 0.1] }, b3: { p: [0.2, 1.5 + 0.1 * S(t * 1.6), 0.1], r: [0, 0.2 * S(t * 0.8), 0] },
        b4: { p: [1.6, 0.9, 0] }, b5: { p: [1.6, 0.25, 0] },
        frames: { p: [0.2, -1.2, 0], r: FLOOR, w: 6, h: 5, c: 'cream', alpha: 0.4 },
        glass: { p: [2.4 + 0.4 * S(t * 0.7), 1.6, 1.8], w: 1.2 },
        aster: { p: [-2.2, 1.6, 1.0], r: [0, 0.4, t] },
        stk1: { p: [1.6, 1.43, 0], r: FLOOR, w: 0.5, d: 0.16 }, stk2: { p: [1.6, 1.59, 0], r: FLOOR, w: 0.5, d: 0.16 }, stk3: { p: [1.6, 1.75 + 0.06 * S(t * 2), 0], r: FLOOR, w: 0.5, d: 0.16 },
        ring1: { p: [0.2, 0.9, 0.1], r: [-PI / 2 + 0.25 * S(t), 0, 0], w: 1.3, c: 'cream' },
        floorDots: { p: [-1.9, -1.18, 1.7], r: FLOOR, c: 'cream' },
        pTri: { p: [-2.7, 2.2, -1.2], r: [0, t * 1.6, 0], c: 'pink' },
        pCube: { p: [-0.4, -0.82, 2.1], r: [0, 0.6, 0] }, cube2: { p: [-0.4, -0.23, 2.1], r: [0, t * 0.9, 0] },
        ball1: { p: [3.0, -0.9 + Math.abs(S(t * 2.6)) * 0.9, 0.9] },
        pCoin: { p: [-1.2, 1.32, 0], r: [0, t * 2, 0] }
      })
    }
  ];
  return shots;
};
