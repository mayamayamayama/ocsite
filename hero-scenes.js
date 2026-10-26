// hero-scenes.js — 入場画面のループの「隊形」前半（1〜9）。
// 14体の図形が、隊形から隊形へ、移動・変形・消失・発生しながら、1本の長いループを作ります。
// （後半の 10〜17 は hero-scenes2.js にあります）
//
// 隊形の書き方：act(i, t, K) が、i番目の図形の「目標」を返します（null を返すと、その図形は消える）
//   x, y   … 画面の中の位置（0〜1。0.5 が真ん中）
//   s      … 大きさ（画面の短いほうの辺に対する割合）
//   shape  … 形（circle / square / tri / diamond / hex / star / burst / spark / half / cross / flower / gear / drop）
//   fill   … 塗り方（solid / split / stripes / dots / grad / holo / bull / ring）
//   c, c2  … 色（cream / teal / orange / verm / navy / blue / pink / peach / white）
//   sx, sy … 横・縦の伸び　rot … 回転　wob … ぐにゃぐにゃ（0〜1）　ext … 厚み（0〜1）　flip … コインのように回る（0〜1）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const SH = ['circle', 'square', 'tri', 'star', 'half', 'cross', 'flower', 'diamond', 'burst', 'hex', 'spark', 'gear', 'drop'];
  const FILLS = ['solid', 'split', 'stripes', 'dots', 'solid', 'grad', 'holo', 'bull', 'solid', 'ring'];
  const COLS = ['verm', 'teal', 'orange', 'navy', 'cream', 'blue', 'pink', 'peach'];
  const col = (k, bg) => { const l = COLS.filter((c) => c !== bg); return l[((k % l.length) + l.length) % l.length]; };
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;   // 画面の短い辺を1とした長さを、位置の割合に直す

  return [
    { // 1) ばらばらに散らばる
      name: 'SCATTER', bg: 'cream',
      act: (i, t) => ({
        x: 0.08 + 0.84 * rnd(i, 1) + 0.03 * S(t * 0.5 + i), y: 0.12 + 0.6 * rnd(i, 2) + 0.03 * Co(t * 0.4 + i * 1.3),
        s: 0.06 + 0.17 * rnd(i, 3) ** 2, shape: SH[i % SH.length], fill: FILLS[i % FILLS.length],
        c: col(i, 'cream'), c2: col(i + 3, 'cream'), rot: t * (rnd(i, 4) - 0.5) * 1.4, wob: i % 5 === 0 ? 1 : 0
      })
    },
    { // 2) 横一列に並んで、はねる
      name: 'ROW', bg: 'cream', links: true,
      act: (i, t) => i < 7 ? {
        x: 0.1 + i * (0.8 / 6), y: 0.4 + 0.05 * S(t * 3 + i * 0.9), s: 0.1 + 0.02 * S(t * 2 + i),
        shape: i % 2 ? 'square' : 'circle', fill: i % 3 === 0 ? 'split' : 'solid', c: col(i, 'cream'), c2: 'cream', rot: i % 2 ? t * 0.8 : 0
      } : null
    },
    { // 3) 大きな丸と、まわりを回る形
      name: 'ORBIT', bg: 'cream',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 0.38, s: 0.62, shape: 'circle', fill: 'split', c: 'navy', c2: 'orange', rot: t * 0.3 };
        if (i === 7) return { x: 0.5, y: 0.38, s: 0.8, shape: 'gear', fill: 'ring', c: 'verm', rot: -t * 0.2 };
        if (i > 6) return null;
        const a = t * 0.6 + (i * TAU) / 6;
        return { x: 0.5 + ox(0.44 * Co(a), K), y: 0.38 + oy(0.44 * S(a), K), s: 0.09, shape: ['star', 'tri', 'square', 'flower', 'spark', 'hex'][i - 1], fill: i % 2 ? 'solid' : 'stripes', c: col(i, 'cream'), c2: 'cream', rot: a * 2 };
      }
    },
    { // 4) 丸が画面いっぱいに広がって、背景が紺に
      name: 'FLOOD', bg: 'cream', to: 'navy', beats: 0.8,
      act: (i) => i === 0 ? { x: 0.5, y: 0.38, s: 4.4, shape: 'circle', fill: 'solid', c: 'navy', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 5) 4×3のマス目
      name: 'GRID', bg: 'navy',
      act: (i, t) => {
        if (i > 11) return null; const cc = i % 4, r = Math.floor(i / 4);
        return { x: 0.14 + cc * 0.24, y: 0.17 + r * 0.22, s: 0.15, shape: ['square', 'circle', 'diamond', 'half'][(i + r) % 4], fill: FILLS[(i * 3) % FILLS.length],
          c: col(i, 'navy'), c2: col(i + 2, 'navy'), rot: (i % 2 ? 1 : -1) * t * 0.6, delay: (cc + r) * 0.07 };
      }
    },
    { // 6) 波のように並ぶ
      name: 'WAVE', bg: 'navy', links: true,
      act: (i, t) => {
        if (i > 12) return null; const q = i / 12;
        return { x: 0.04 + q * 0.92, y: 0.4 + 0.16 * S(q * TAU * 1.2 + t * 2.2), s: 0.05 + 0.07 * (0.5 + 0.5 * S(q * TAU + t * 1.5)), shape: 'circle', fill: 'solid', c: ['verm', 'orange', 'cream', 'teal'][i % 4], delay: i * 0.04 };
      }
    },
    { // 7) 積み上がった塔
      name: 'TOTEM', bg: 'navy',
      act: (i, t, K) => {
        if (i < 6) {
          const L = [['half', 1.4, 1, 'stripes', 'orange'], ['square', 2.4, 0.5, 'solid', 'verm'], ['circle', 1.7, 0.7, 'split', 'cream'], ['square', 2, 0.5, 'dots', 'teal'], ['diamond', 1.2, 1, 'solid', 'orange'], ['half', 1.8, 1, 'grad', 'verm']][i];
          return { x: 0.5 + 0.05 * S(t * 1.6 + i * 0.7) * (i + 1) / 6, y: 0.13 + i * 0.1, s: 0.13, shape: L[0], sx: L[1], sy: L[2], fill: L[3], c: L[4], c2: 'navy', rot: i === 5 ? Math.PI : 0, ext: i % 2 ? 0.8 : 0 };
        }
        if (i < 10) { const a = t * 1.2 + i * 1.6; return { x: 0.5 + ox(0.34 * Co(a), K), y: 0.4 + oy(0.2 * S(a), K), s: 0.04, shape: 'spark', fill: 'solid', c: 'cream', rot: t * 2 }; }
        return null;
      }
    },
    { // 8) 爆発して、画面の外へ飛び出す
      name: 'BURST OUT', bg: 'navy', beats: 0.6,
      act: (i, t) => { const a = (i / 14) * TAU + 0.3; return { x: 0.5 + Co(a) * 0.85, y: 0.42 + S(a) * 0.85, s: 0.12, shape: 'star', fill: 'solid', c: col(i, 'navy'), rot: t * 3, dur: 0.75, ease: 'in', delay: i * 0.015 }; }
    },
    { // 9) 渦を巻いて戻ってくる
      name: 'SPIRAL', bg: 'navy',
      act: (i, t, K) => { const k = i / 13, a = k * TAU * 1.6 + t * 0.9, r = 0.05 + 0.44 * k; return { x: 0.5 + ox(r * Co(a), K), y: 0.4 + oy(r * S(a), K), s: 0.03 + 0.1 * k, shape: SH[(i * 2) % SH.length], fill: i % 3 ? 'solid' : 'split', c: col(i, 'navy'), c2: col(i + 4, 'navy'), rot: a, delay: (13 - i) * 0.03 }; }
    }
  ];
};
