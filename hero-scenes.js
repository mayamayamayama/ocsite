// hero-scenes.js — 入場画面のループの「隊形」前半（1〜9）。
// 24体の図形（0〜3 は画面からはみ出す巨大な図形）が、隊形から隊形へ、移動・変形・消失・発生しながら、1本の長いループを作ります。
// （後半の 10〜17 は hero-scenes2.js にあります）
//
// 隊形の書き方：act(i, t, K) が、i番目の図形の「目標」を返します（null を返すと、その図形は消える）
//   x, y   … 画面の中の位置（0〜1。0.5 が真ん中。0より小さい・1より大きいと、画面からはみ出す）
//   s      … 大きさ（画面の短いほうの辺に対する割合。1で、短い辺と同じ大きさ）
//   shape  … 形（circle / square / half / quarter / lens / tri / diamond / hex / cross / spark / burst / gear）
//   fill   … 塗り方（solid / split / stripes / dots / grad / holo / bull / ring）
//   c, c2  … 色（paper / ink / lime / red / blue / cyan / lilac / grey / white）
//   sx, sy … 横・縦の伸び　rot … 回転　wob … ぐにゃぐにゃ（0〜1）　ext … 厚み（0〜1）　flip … コインのように回る（0〜1）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2, PI = Math.PI;
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;   // 画面の短い辺を1とした長さを、位置の割合に直す
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const step = (t, sp) => { const v = t * sp, k = Math.floor(v); return k + io(cl((v - k - 0.45) / 0.55)); };   // 止まって、カクッと進む動き
  const AC = { paper: ['ink', 'blue', 'red', 'cyan', 'lilac', 'grey'], ink: ['lime', 'paper', 'blue', 'red', 'cyan', 'lilac'] };
  const col = (bg, k) => { const l = AC[bg]; return l[((k % l.length) + l.length) % l.length]; };
  const SH = ['circle', 'square', 'half', 'quarter', 'lens', 'diamond', 'hex', 'tri', 'cross'];
  const FL = ['solid', 'stripes', 'split', 'solid', 'dots', 'grad', 'solid', 'bull'];

  return [
    { // 1) 巨大な半円・帯・四分円・輪で組んだ構図
      name: 'COMPOSE', bg: 'paper',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.86, y: 0.8, s: 1.35, shape: 'half', rot: -PI / 2 + 0.08 * S(t * 0.9), c: 'ink', z: 0.1 };
        if (i === 1) return { x: 0.3 + 0.08 * S(t * 1.1), y: 0.13, s: 0.5, shape: 'square', sx: 4.8, sy: 0.26, rot: -0.22 + 0.05 * S(t * 0.8), c: 'red', z: 0.2 };
        if (i === 2) return { x: 0.06, y: 0.04, s: 1.05, shape: 'quarter', rot: 0.15 * S(t * 0.7), fill: 'stripes', c: 'blue', c2: 'paper', z: 0.15 };
        if (i === 3) return { x: 0.6, y: 0.42, s: 0.95 + 0.05 * S(t * 2), shape: 'circle', fill: 'ring', c: 'ink', z: 0.3 };
        if (i < 14) { const k = i - 4; return { x: 0.06 + k * 0.1, y: 0.66 - k * 0.055 + 0.03 * S(t * 3 + k), s: 0.12, shape: 'lens', rot: t * 1.6 + k, fill: k % 2 ? 'solid' : 'stripes', c: col('paper', k), c2: 'paper', z: 0.6 }; }
        const a = t * 1.1 + ((i - 14) * TAU) / 10;
        return { x: 0.6 + ox(0.5 * Co(a), K), y: 0.42 + oy(0.5 * S(a), K), s: 0.055, shape: i % 2 ? 'square' : 'circle', rot: a * 2, c: i % 3 ? 'ink' : 'red', z: 0.8 };
      }
    },
    { // 2) 巨大な丸を帯が貫き、二重の輪が逆向きに回る
      name: 'SPLIT', bg: 'paper',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 0.42, s: 1.1, shape: 'circle', fill: 'split', c: 'ink', c2: 'blue', rot: t * 0.8, z: 0.2 };
        if (i === 1) return { x: 0.5, y: 0.42, s: 0.5, shape: 'square', sx: 0.22, sy: 5.5, rot: 0.35 + t * 0.35, c: 'red', z: 0.4 };
        if (i === 2) return { x: 0.03, y: 0.97, s: 1.05, shape: 'quarter', rot: -PI / 2, c: 'blue', z: 0.1 };
        if (i === 3) return { x: 0.5, y: 0.42, s: 1.42, shape: 'gear', fill: 'ring', c: 'ink', rot: -t * 0.4, z: 0.05 };
        if (i < 16) { const k = i - 4, a = t * 0.7 + (k * TAU) / 12; return { x: 0.5 + ox(0.74 * Co(a), K), y: 0.42 + oy(0.74 * S(a), K), s: 0.1, shape: ['hex', 'square', 'diamond'][k % 3], rot: a * 1.5, fill: FL[k % FL.length], c: col('paper', k), c2: 'paper', z: 0.7 }; }
        const k = i - 16, a = -t * 1.1 + (k * TAU) / 8;
        return { x: 0.5 + ox(0.4 * Co(a), K), y: 0.42 + oy(0.4 * S(a), K), s: 0.06, shape: 'circle', c: ['lime', 'paper', 'cyan', 'red'][k % 4], z: 0.8 };
      }
    },
    { // 3) 丸が画面いっぱいに広がって、背景が黒に
      name: 'FLOOD', bg: 'paper', to: 'ink', beats: 0.8,
      act: (i) => i === 0 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'ink', z: 9, dur: 1.25, ease: 'in', delay: 0.05 } : null
    },
    { // 4) 画面を横切る太い帯と、その上を走る形
      name: 'BANDS', bg: 'ink',
      act: (i, t) => {
        if (i === 0) return { x: 0.5 + 0.14 * S(t * 1.3), y: 0.12, s: 0.5, shape: 'square', sx: 5, sy: 0.55, fill: 'stripes', c: 'lime', c2: 'ink', z: 0.2 };
        if (i === 1) return { x: 0.5 - 0.16 * S(t * 1.1), y: 0.3, s: 0.5, shape: 'square', sx: 5, sy: 0.4, c: 'red', z: 0.25 };
        if (i === 2) return { x: 0.5 + 0.18 * S(t * 1.5), y: 0.47, s: 0.5, shape: 'square', sx: 5, sy: 0.3, fill: 'grad', c: 'blue', c2: 'cyan', z: 0.3 };
        if (i === 3) return { x: 0.88 + 0.04 * S(t * 2), y: 0.45, s: 0.5, shape: 'square', sx: 0.35, sy: 4, fill: 'holo', z: 0.35 };
        const k = i - 4, b = k % 4, dir = b % 2 ? 1 : -1, x = ((((t * 0.3 * dir + k * 0.12) % 1.2) + 1.2) % 1.2) - 0.1;
        return { x, y: [0.12, 0.3, 0.47, 0.64][b], s: 0.06 + 0.03 * (k % 2), shape: k % 2 ? 'square' : 'circle', rot: t * 3, c: ['ink', 'paper', 'paper', 'lime'][b], z: 0.6 };
      }
    },
    { // 5) 画面を埋め尽くすマス目（カクッ、カクッと回る）
      name: 'GRID', bg: 'ink',
      act: (i, t, K) => {
        if (i === 0) return { x: 0, y: 0, s: 1.2, shape: 'quarter', c: 'blue', z: 0.05 };
        if (i === 1) return { x: 1, y: 1, s: 1.2, shape: 'quarter', rot: PI, c: 'red', z: 0.05 };
        if (i < 4) return null;
        const k = i - 4, cc = k % 4, r = Math.floor(k / 4), s = Math.min(0.2, (0.15 * K.FH) / K.M, (0.23 * K.W) / K.M);
        return { x: 0.13 + cc * 0.25, y: 0.07 + r * 0.17, s, shape: ['square', 'circle', 'quarter', 'half'][(k + r) % 4], fill: FL[(k * 3) % FL.length],
          c: col('ink', k + r), c2: col('ink', k + r + 2), rot: (step(t + (cc + r) * 0.13, 1.3) * PI) / 2 + (r % 2) * PI / 2, delay: (cc + r) * 0.04, z: 0.5 };
      }
    },
    { // 6) 端からはみ出す巨大な丸と、逆向きの2本の波
      name: 'WAVE', bg: 'ink',
      act: (i, t) => {
        if (i === 0) return { x: -0.06, y: 0.26, s: 1.05, shape: 'circle', c: 'lime', z: 0.1 };
        if (i === 1) return { x: 1.06, y: 0.72, s: 0.9, shape: 'circle', fill: 'stripes', c: 'red', c2: 'ink', rot: t, z: 0.1 };
        if (i === 2) return { x: 0.5, y: 0.45, s: 1.55, shape: 'circle', fill: 'ring', c: 'blue', z: 0.05 };
        if (i === 3) return null;
        const k = (i - 4) % 10, row = i < 14 ? 0 : 1, q = k / 9, ph = row ? PI : 0;
        return { x: 0.03 + q * 0.94, y: (row ? 0.54 : 0.36) + 0.15 * S(q * TAU * 1.1 + t * 3 + ph), s: 0.07 + 0.06 * (0.5 + 0.5 * S(q * TAU * 2 + t * 2.4 + ph)),
          shape: row ? 'square' : 'circle', rot: row ? t * 2 : 0, c: col('ink', k + row * 3), delay: k * 0.03, z: 0.6 };
      }
    },
    { // 7) 大きく積み上がった塔と、まわりを回る火花
      name: 'TOTEM', bg: 'ink',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 1.02, s: 1.45, shape: 'half', c: 'blue', z: 0.1 };
        if (i === 1) return { x: 0.97, y: 0.03, s: 0.9, shape: 'quarter', rot: PI / 2, c: 'lime', fill: 'stripes', c2: 'ink', z: 0.1 };
        if (i < 4) return null;
        if (i < 10) {
          const k = i - 4, L = [['half', 1.4, 1, 'stripes', 'lime'], ['square', 2.4, 0.5, 'solid', 'red'], ['circle', 1.7, 0.7, 'split', 'paper'], ['square', 2, 0.5, 'dots', 'cyan'], ['diamond', 1.2, 1, 'solid', 'lime'], ['half', 1.8, 1, 'grad', 'red']][k];
          return { x: 0.5 + 0.06 * S(t * 2.2 + k * 0.7) * (k + 1) / 6, y: 0.1 + k * 0.11, s: 0.2, shape: L[0], sx: L[1], sy: L[2], fill: L[3], c: L[4], c2: 'ink', rot: k === 5 ? PI : 0, ext: k % 2 ? 0.8 : 0, z: 0.5 + k * 0.05 };
        }
        const k = i - 10, a = t * 2 + (k * TAU) / 14;
        return { x: 0.5 + ox(0.38 * Co(a), K), y: 0.4 + oy(0.24 * S(a), K), s: 0.035, shape: 'spark', rot: t * 4, c: k % 2 ? 'paper' : 'lime', z: S(a) > 0 ? 0.9 : 0.3 };
      }
    },
    { // 8) 全部が画面の外へ、はじけ飛ぶ
      name: 'SHATTER', bg: 'ink', beats: 0.6,
      act: (i, t) => { const a = (i / 24) * TAU + 0.3; return { x: 0.5 + Co(a) * 0.95, y: 0.42 + S(a) * 0.95, s: 0.15, shape: i % 2 ? 'spark' : 'tri', c: col('ink', i), rot: t * 3, dur: 0.72, ease: 'in', delay: i * 0.01, z: 0.5 }; }
    },
    { // 9) 渦を巻いて戻ってくる（外側ほど巨大）
      name: 'VORTEX', bg: 'ink',
      act: (i, t, K) => { const k = i / 23, a = k * TAU * 1.5 + t * 1.3, r = 0.03 + 0.66 * k; return { x: 0.5 + ox(r * Co(a), K), y: 0.42 + oy(r * S(a), K), s: 0.03 + 0.34 * k, shape: SH[i % SH.length], fill: FL[(i * 5) % FL.length], c: col('ink', i), c2: 'ink', rot: a, delay: (23 - i) * 0.02, z: 0.2 + k * 0.6 }; }
    }
  ];
};
