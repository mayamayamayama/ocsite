// hero-scenes2.js — 入場画面のループの「隊形」後半（10〜17）。書き方は hero-scenes.js の上の説明と同じです
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2, PI = Math.PI;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;
  const SH = ['circle', 'square', 'half', 'quarter', 'lens', 'diamond', 'hex', 'tri', 'cross'];
  const FL = ['solid', 'stripes', 'split', 'solid', 'dots', 'grad', 'solid', 'bull'];

  return [
    { // 10) いちばん外の巨大な形が広がって、背景がオレンジに
      name: 'FLOOD', bg: 'navy', to: 'orange', beats: 0.8,
      act: (i) => i === 15 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'orange', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 11) 斜めに画面を切る帯と、厚みのある三角・ひし形
      name: 'DIAGONAL', bg: 'orange',
      act: (i, t) => {
        if (i === 0) return { x: 0.5, y: 0.45, s: 0.5, shape: 'square', sx: 7, sy: 0.5, rot: -0.9 + 0.03 * S(t * 0.6), fill: 'stripes', c: 'navy', c2: 'verm', z: 0.1 };
        if (i === 1) return { x: 0.86, y: 0.15, s: 0.7, shape: 'circle', fill: 'bull', c: 'cream', c2: 'verm', z: 0.2 };
        if (i === 2) return { x: 0.02, y: 0.98, s: 0.8, shape: 'quarter', rot: -PI / 2, c: 'teal', z: 0.15 };
        if (i === 3 || i > 12) return null;
        const q = (i - 4) / 8;
        return { x: 0.1 + q * 0.8, y: 0.75 - q * 0.62, s: 0.08 + q * 0.3, shape: i % 2 ? 'tri' : 'diamond', rot: t * (i % 2 ? 0.8 : -0.8) + q, fill: ['solid', 'stripes', 'split'][i % 3], c: ['navy', 'cream', 'verm'][i % 3], c2: ['cream', 'navy', 'teal'][i % 3], ext: 1, delay: (i - 4) * 0.05, z: 0.4 + q * 0.4 };
      }
    },
    { // 12) 大きなコインが3枚、くるくる回る
      name: 'COINS', bg: 'orange',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 0.38, s: 1.45, shape: 'circle', fill: 'ring', c: 'navy', z: 0.05 };
        if (i === 1) return { x: 0.92, y: 0.95, s: 0.9, shape: 'half', rot: -PI / 2, c: 'verm', z: 0.1 };
        if (i > 3 && i < 7) { const k = i - 4; return { x: 0.5 + ox((k - 1) * 0.36, K), y: 0.38, s: 0.36, shape: 'circle', flip: 1, ext: 1.2, fill: 'bull', c: ['cream', 'navy', 'verm'][k], c2: ['verm', 'cream', 'teal'][k], z: 0.5 + k * 0.05 }; }
        if (i > 6 && i < 13) { const a = t * 0.7 + (i - 7) * 1.05; return { x: 0.5 + ox(0.62 * Co(a), K), y: 0.38 + oy(0.32 * S(a), K), s: 0.06, shape: i % 2 ? 'diamond' : 'circle', c: i % 2 ? 'cream' : 'navy', rot: t * 2, z: 0.7 }; }
        return null;
      }
    },
    { // 13) 大きな花びらが開き、四隅を巨大な四分円が囲む
      name: 'BLOOM', bg: 'orange',
      act: (i, t, K) => {
        if (i < 4) return { x: [0.02, 0.98, 0.98, 0.02][i], y: [0.02, 0.02, 0.98, 0.98][i], s: 0.75, shape: 'quarter', rot: [0, PI / 2, PI, -PI / 2][i], c: ['navy', 'verm', 'cream', 'teal'][i], fill: i % 2 ? 'solid' : 'stripes', c2: 'orange', z: 0.1 };
        if (i < 12) { const k = i - 4, a = (k / 8) * TAU + t * 0.45, r = 0.38 + 0.02 * S(t * 3 + k); return { x: 0.5 + ox(r * Co(a), K), y: 0.4 + oy(r * S(a), K), s: 0.26, shape: 'half', rot: a + PI / 2, fill: k % 2 ? 'solid' : 'stripes', c: ['verm', 'navy', 'cream', 'teal'][k % 4], c2: 'orange', z: 0.5 }; }
        if (i === 12) return { x: 0.5, y: 0.4, s: 0.3, shape: 'burst', rot: t, fill: 'split', c: 'cream', c2: 'verm', z: 0.7 };
        return null;
      }
    },
    { // 14) 真ん中の形が広がって、背景がティールに
      name: 'FLOOD', bg: 'orange', to: 'teal', beats: 0.8,
      act: (i) => i === 12 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'teal', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 15) 階段のようにずれる、大きな板
      name: 'STAIRS', bg: 'teal',
      act: (i, t) => {
        if (i === 0) return { x: 0.92, y: 0.9, s: 1.1, shape: 'circle', fill: 'split', c: 'navy', c2: 'orange', rot: t * 0.2, z: 0.1 };
        if (i === 1) return { x: 0.86, y: 0.13, s: 0.5, shape: 'lens', rot: 0.6 + 0.1 * S(t), fill: 'stripes', c: 'cream', c2: 'verm', z: 0.2 };
        if (i < 4 || i > 9) return null;
        const k = i - 4;
        return { x: 0.2 + k * 0.12 + 0.04 * S(t * 1.4 + k), y: 0.12 + k * 0.11, s: 0.2, shape: 'square', sx: 2.6, sy: 0.5, fill: k % 2 ? 'solid' : 'stripes', c: ['navy', 'orange', 'cream', 'verm'][k % 4], c2: 'teal', ext: 0.8, delay: k * 0.06, z: 0.4 + k * 0.05 };
      }
    },
    { // 16) 大小さまざまに、画面いっぱいに散らばる
      name: 'SCATTER', bg: 'teal',
      act: (i, t) => ({
        x: -0.05 + 1.1 * rnd(i, 11) + 0.03 * S(t * 0.6 + i), y: -0.04 + 0.86 * rnd(i, 12) + 0.03 * Co(t * 0.5 + i),
        s: 0.1 + 0.42 * rnd(i, 13) ** 1.6, shape: SH[(i + 2) % SH.length], fill: FL[(i + 3) % FL.length],
        c: ['navy', 'cream', 'orange', 'verm'][i % 4], c2: ['cream', 'verm', 'navy', 'teal'][i % 4], rot: t * (rnd(i, 14) - 0.5) * 1.2, z: 0.2 + rnd(i, 15) * 0.6
      })
    },
    { // 17) 形が広がって、背景がクリームに（ここから 1) に戻る）
      name: 'FLOOD', bg: 'teal', to: 'cream', beats: 0.8,
      act: (i) => i === 0 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'cream', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    }
  ];
};
