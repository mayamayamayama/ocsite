// hero-scenes2.js — 入場画面のループの「隊形」後半（10〜17）。書き方は hero-scenes.js の上の説明と同じです
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const SH = ['circle', 'square', 'tri', 'star', 'half', 'cross', 'flower', 'diamond', 'burst', 'hex', 'spark', 'gear', 'drop'];
  const FILLS = ['solid', 'split', 'stripes', 'dots', 'solid', 'grad', 'holo', 'bull', 'solid', 'ring'];
  const COLS = ['verm', 'teal', 'orange', 'navy', 'cream', 'blue', 'pink', 'peach'];
  const col = (k, bg) => { const l = COLS.filter((c) => c !== bg); return l[((k % l.length) + l.length) % l.length]; };
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;

  return [
    { // 10) いちばん外の形が広がって、背景がオレンジに
      name: 'FLOOD', bg: 'navy', to: 'orange', beats: 0.8,
      act: (i) => i === 13 ? { x: 0.5, y: 0.4, s: 4.4, shape: 'circle', fill: 'solid', c: 'orange', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 11) 斜めに並ぶ、厚みのある三角とひし形
      name: 'DIAGONAL', bg: 'orange',
      act: (i, t) => {
        if (i > 8) return null; const q = i / 8;
        return { x: 0.12 + q * 0.76, y: 0.7 - q * 0.56, s: 0.06 + q * 0.13, shape: i % 2 ? 'tri' : 'diamond', rot: t * (i % 2 ? 1 : -1) + q, fill: ['solid', 'stripes', 'split'][i % 3], c: col(i, 'orange'), c2: col(i + 1, 'orange'), ext: 1, delay: i * 0.05 };
      }
    },
    { // 12) くるくる回るコイン
      name: 'COINS', bg: 'orange',
      act: (i, t, K) => {
        if (i < 3) return { x: 0.5 + ox((i - 1) * 0.3, K), y: 0.36, s: 0.24, shape: 'circle', flip: 1, ext: 1.2, fill: 'bull', c: ['cream', 'navy', 'verm'][i], c2: ['verm', 'cream', 'teal'][i] };
        if (i < 9) { const a = t * 0.8 + i * 1.05; return { x: 0.5 + ox(0.46 * Co(a), K), y: 0.36 + oy(0.24 * S(a), K), s: 0.04, shape: i % 2 ? 'spark' : 'circle', fill: 'solid', c: i % 2 ? 'cream' : 'navy', rot: t * 2 }; }
        return null;
      }
    },
    { // 13) 花びらのように開く
      name: 'BLOOM', bg: 'orange',
      act: (i, t, K) => {
        if (i < 8) { const a = (i / 8) * TAU + t * 0.5, r = 0.26 + 0.02 * S(t * 3 + i); return { x: 0.5 + ox(r * Co(a), K), y: 0.38 + oy(r * S(a), K), s: 0.15, shape: 'half', rot: a + Math.PI / 2, fill: i % 2 ? 'solid' : 'stripes', c: ['verm', 'navy', 'cream', 'teal'][i % 4], c2: 'orange' }; }
        if (i === 8) return { x: 0.5, y: 0.38, s: 0.17, shape: 'burst', rot: t, fill: 'split', c: 'cream', c2: 'verm' };
        return null;
      }
    },
    { // 14) 真ん中の形が広がって、背景がティールに
      name: 'FLOOD', bg: 'orange', to: 'teal', beats: 0.8,
      act: (i) => i === 8 ? { x: 0.5, y: 0.38, s: 4.4, shape: 'circle', fill: 'solid', c: 'teal', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    },
    { // 15) 階段のようにずれる板
      name: 'STAIRS', bg: 'teal',
      act: (i, t) => {
        if (i < 5) return { x: 0.22 + i * 0.12 + 0.04 * S(t * 1.4 + i), y: 0.18 + i * 0.1, s: 0.14, shape: 'square', sx: 2.4, sy: 0.55, fill: i % 2 ? 'solid' : 'stripes', c: col(i, 'teal'), c2: 'cream', ext: 0.8, delay: i * 0.06 };
        if (i < 8) return { x: 0.72 - (i - 5) * 0.2, y: 0.66 - (i - 5) * 0.04 + 0.02 * S(t * 2 + i), s: 0.08, shape: 'circle', fill: 'split', c: ['orange', 'navy', 'cream'][i - 5], c2: 'verm', rot: t * 1.5 };
        if (i === 8) return { x: 0.8, y: 0.2, s: 0.18, shape: 'drop', wob: 1, fill: 'solid', c: 'navy', rot: S(t) * 0.3 };
        return null;
      }
    },
    { // 16) もう一度、ばらばらに
      name: 'SCATTER', bg: 'teal',
      act: (i, t) => ({
        x: 0.08 + 0.84 * rnd(i, 11) + 0.03 * S(t * 0.6 + i), y: 0.12 + 0.6 * rnd(i, 12) + 0.03 * Co(t * 0.5 + i),
        s: 0.06 + 0.17 * rnd(i, 13) ** 2, shape: SH[(i + 5) % SH.length], fill: FILLS[(i + 3) % FILLS.length],
        c: col(i + 2, 'teal'), c2: col(i + 5, 'teal'), rot: t * (rnd(i, 14) - 0.5) * 1.6, wob: i % 4 === 0 ? 1 : 0
      })
    },
    { // 17) 形が広がって、背景がクリームに（ここから 1) に戻る）
      name: 'FLOOD', bg: 'teal', to: 'cream', beats: 0.8,
      act: (i) => i === 5 ? { x: 0.5, y: 0.4, s: 4.4, shape: 'circle', fill: 'solid', c: 'cream', z: 9, dur: 1.3, ease: 'in', delay: 0.1 } : null
    }
  ];
};
