// hero-scenes.js — 入場画面のループの「隊形」前半（1〜9）。
// 16体の図形（0〜3 は画面からはみ出す巨大な図形）が、隊形から隊形へ、移動・変形・消失・発生しながら、1本の長いループを作ります。
// （後半の 10〜17 は hero-scenes2.js にあります）
//
// 隊形の書き方：act(i, t, K) が、i番目の図形の「目標」を返します（null を返すと、その図形は消える）
//   x, y   … 画面の中の位置（0〜1。0.5 が真ん中。0より小さい・1より大きいと、画面からはみ出す）
//   s      … 大きさ（画面の短いほうの辺に対する割合。1で、短い辺と同じ大きさ）
//   shape  … 形（circle / square / half / quarter / lens / tri / diamond / hex / cross / spark / burst / gear）
//   fill   … 塗り方（solid / split / stripes / dots / grad / holo / bull / ring）
//   c, c2  … 色（cream / teal / orange / verm / navy / blue / pink / peach / white）
//   sx, sy … 横・縦の伸び　rot … 回転　wob … ぐにゃぐにゃ（0〜1）　ext … 厚み（0〜1）　flip … コインのように回る（0〜1）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2, PI = Math.PI;
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;   // 画面の短い辺を1とした長さを、位置の割合に直す
  const SH = ['circle', 'square', 'half', 'quarter', 'lens', 'diamond', 'hex', 'tri'];
  const FL = ['solid', 'stripes', 'split', 'solid', 'dots', 'grad', 'solid', 'bull'];

  return [
    { // 1) 巨大な半円・帯・四分円・輪で組んだ構図
      name: 'COMPOSE', bg: 'cream',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.86, y: 0.8, s: 1.3, shape: 'half', rot: -PI / 2 + 0.05 * S(t * 0.7), c: 'navy', z: 0.1 };
        if (i === 1) return { x: 0.28 + 0.04 * S(t * 0.8), y: 0.13, s: 0.5, shape: 'square', sx: 4.6, sy: 0.26, rot: -0.22, c: 'verm', z: 0.2 };
        if (i === 2) return { x: 0.06, y: 0.04, s: 1.0, shape: 'quarter', rot: 0.08 * S(t * 0.5), fill: 'stripes', c: 'teal', c2: 'cream', z: 0.15 };
        if (i === 3) return { x: 0.6, y: 0.42, s: 0.95, shape: 'circle', fill: 'ring', c: 'orange', z: 0.3 };
        if (i < 10) { const k = i - 4; return { x: 0.12 + k * 0.15, y: 0.6 - k * 0.06 + 0.02 * S(t * 2 + k), s: 0.15, shape: 'lens', rot: t * 0.7 + k, fill: k % 2 ? 'solid' : 'stripes', c: ['navy', 'verm', 'teal'][k % 3], c2: 'cream', z: 0.6 }; }
        const a = t * 0.5 + ((i - 10) * TAU) / 6;
        return { x: 0.6 + ox(0.5 * Co(a), K), y: 0.42 + oy(0.5 * S(a), K), s: 0.06, shape: i % 2 ? 'square' : 'circle', rot: a, c: 'navy', z: 0.8 };
      }
    },
    { // 2) 巨大な丸を、帯が斜めに貫く
      name: 'SPLIT', bg: 'cream',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 0.42, s: 1.08, shape: 'circle', fill: 'split', c: 'navy', c2: 'orange', rot: t * 0.25, z: 0.2 };
        if (i === 1) return { x: 0.5, y: 0.42, s: 0.5, shape: 'square', sx: 0.22, sy: 5.5, rot: 0.35 + t * 0.1, c: 'verm', z: 0.4 };
        if (i === 2) return { x: 0.03, y: 0.97, s: 1.0, shape: 'quarter', rot: -PI / 2, c: 'teal', z: 0.1 };
        if (i === 3) return { x: 0.5, y: 0.42, s: 1.4, shape: 'gear', fill: 'ring', c: 'verm', rot: -t * 0.15, z: 0.05 };
        if (i < 10) { const k = i - 4, a = t * 0.4 + (k * TAU) / 6; return { x: 0.5 + ox(0.7 * Co(a), K), y: 0.42 + oy(0.7 * S(a), K), s: 0.13, shape: k % 2 ? 'hex' : 'square', rot: a, fill: FL[k % FL.length], c: ['navy', 'teal', 'orange'][k % 3], c2: 'cream', z: 0.7 }; }
        return null;
      }
    },
    { // 3) 丸が画面いっぱいに広がって、背景が紺に
      name: 'FLOOD', bg: 'cream', to: 'navy', beats: 0.8,
      act: (i) => i === 0 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'navy', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 4) 画面を横切る、太い帯
      name: 'BANDS', bg: 'navy',
      act: (i, t) => {
        if (i === 0) return { x: 0.5 + 0.08 * S(t * 0.9), y: 0.14, s: 0.5, shape: 'square', sx: 5, sy: 0.55, fill: 'stripes', c: 'orange', c2: 'navy', z: 0.2 };
        if (i === 1) return { x: 0.5 - 0.1 * S(t * 0.7), y: 0.33, s: 0.5, shape: 'square', sx: 5, sy: 0.4, c: 'verm', z: 0.25 };
        if (i === 2) return { x: 0.5 + 0.12 * S(t * 1.1), y: 0.5, s: 0.5, shape: 'square', sx: 5, sy: 0.3, fill: 'grad', c: 'teal', c2: 'cream', z: 0.3 };
        if (i === 3) return { x: 0.9, y: 0.45, s: 0.5, shape: 'square', sx: 0.35, sy: 4, fill: 'holo', z: 0.35 };
        const b = (i - 4) % 3, x = ((((t * 0.12 * (b % 2 ? 1 : -1) + (i - 4) * 0.083) % 1.2) + 1.2) % 1.2) - 0.1;
        return { x, y: [0.14, 0.33, 0.5][b], s: 0.07 + 0.03 * (i % 2), shape: i % 2 ? 'square' : 'circle', rot: t * 2, c: ['navy', 'cream', 'navy'][b], z: 0.6 };
      }
    },
    { // 5) 画面を埋め尽くす、4×4のマス目
      name: 'GRID', bg: 'navy',
      act: (i, t, K) => {
        const cc = i % 4, r = Math.floor(i / 4), s = Math.min(0.22, (0.17 * K.FH) / K.M, (0.23 * K.W) / K.M);
        return { x: 0.13 + cc * 0.25, y: 0.1 + r * 0.19, s, shape: ['square', 'circle', 'quarter', 'half'][(i + r) % 4], fill: FL[(i * 3) % FL.length],
          c: ['orange', 'teal', 'verm', 'cream'][(i + r) % 4], c2: ['navy', 'cream', 'navy', 'verm'][(i + r) % 4], rot: (i % 2 ? 1 : -1) * t * 0.5 + (r % 2) * PI / 2, delay: (cc + r) * 0.06, z: 0.5 };
      }
    },
    { // 6) 端からはみ出す巨大な丸と、大きな波
      name: 'WAVE', bg: 'navy',
      act: (i, t) => {
        if (i === 0) return { x: -0.04, y: 0.28, s: 1.0, shape: 'circle', c: 'orange', z: 0.1 };
        if (i === 1) return { x: 1.04, y: 0.7, s: 0.85, shape: 'circle', fill: 'stripes', c: 'verm', c2: 'navy', rot: t * 0.2, z: 0.1 };
        if (i === 2) return { x: 0.5, y: 0.45, s: 1.5, shape: 'circle', fill: 'ring', c: 'teal', z: 0.05 };
        if (i === 3) return null;
        const q = (i - 4) / 11;
        return { x: 0.04 + q * 0.92, y: 0.45 + 0.17 * S(q * TAU * 1.1 + t * 2.4), s: 0.08 + 0.1 * (0.5 + 0.5 * S(q * TAU * 2 + t * 1.8)), shape: 'circle', c: ['cream', 'teal', 'orange', 'pink'][i % 4], delay: (i - 4) * 0.04, z: 0.6 };
      }
    },
    { // 7) 大きく積み上がった塔
      name: 'TOTEM', bg: 'navy',
      act: (i, t) => {
        if (i === 0) return { x: 0.5, y: 1.02, s: 1.4, shape: 'half', c: 'teal', z: 0.1 };
        if (i === 1) return { x: 0.97, y: 0.03, s: 0.9, shape: 'quarter', rot: PI / 2, c: 'orange', fill: 'stripes', c2: 'navy', z: 0.1 };
        if (i < 4 || i > 9) return null;
        const k = i - 4, L = [['half', 1.4, 1, 'stripes', 'orange'], ['square', 2.4, 0.5, 'solid', 'verm'], ['circle', 1.7, 0.7, 'split', 'cream'], ['square', 2, 0.5, 'dots', 'teal'], ['diamond', 1.2, 1, 'solid', 'orange'], ['half', 1.8, 1, 'grad', 'verm']][k];
        return { x: 0.5 + 0.05 * S(t * 1.6 + k * 0.7) * (k + 1) / 6, y: 0.1 + k * 0.11, s: 0.2, shape: L[0], sx: L[1], sy: L[2], fill: L[3], c: L[4], c2: 'navy', rot: k === 5 ? PI : 0, ext: k % 2 ? 0.8 : 0, z: 0.5 + k * 0.05 };
      }
    },
    { // 8) 全部が画面の外へ、はじけ飛ぶ
      name: 'SHATTER', bg: 'navy', beats: 0.6,
      act: (i, t) => { const a = (i / 16) * TAU + 0.3; return { x: 0.5 + Co(a) * 0.95, y: 0.42 + S(a) * 0.95, s: 0.16, shape: i % 2 ? 'spark' : 'tri', c: ['orange', 'verm', 'teal', 'cream'][i % 4], rot: t * 3, dur: 0.75, ease: 'in', delay: i * 0.012, z: 0.5 }; }
    },
    { // 9) 渦を巻いて戻ってくる（外側ほど巨大）
      name: 'VORTEX', bg: 'navy',
      act: (i, t, K) => { const k = i / 15, a = k * TAU * 1.4 + t * 0.8, r = 0.04 + 0.62 * k; return { x: 0.5 + ox(r * Co(a), K), y: 0.42 + oy(r * S(a), K), s: 0.04 + 0.32 * k, shape: SH[i % SH.length], fill: FL[(i * 5) % FL.length], c: ['orange', 'teal', 'verm', 'cream'][i % 4], c2: 'navy', rot: a, delay: (15 - i) * 0.03, z: 0.2 + k * 0.6 }; }
    }
  ];
};
