// hero-scenes2.js — 入場画面のループの「隊形」後半（10〜17）。書き方は hero-scenes.js の上の説明と同じです
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function () {
  const S = Math.sin, Co = Math.cos, TAU = Math.PI * 2, PI = Math.PI;
  const rnd = (i, k) => { const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
  const ox = (v, K) => (v * K.M) / K.W, oy = (v, K) => (v * K.M) / K.FH;
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const step = (t, sp) => { const v = t * sp, k = Math.floor(v); return k + io(cl((v - k - 0.45) / 0.55)); };
  const AC = { blue: ['paper', 'ink', 'lime', 'cyan', 'red', 'lilac'], lime: ['ink', 'paper', 'blue', 'red', 'grey'] };
  const col = (bg, k) => { const l = AC[bg]; return l[((k % l.length) + l.length) % l.length]; };
  const SH = ['circle', 'square', 'half', 'quarter', 'lens', 'diamond', 'hex', 'tri', 'cross'];
  const FL = ['solid', 'stripes', 'split', 'solid', 'dots', 'grad', 'solid', 'bull'];

  return [
    { // 10) いちばん外の巨大な形が広がって、背景が青に
      name: 'FLOOD', bg: 'ink', to: 'blue', beats: 0.8,
      act: (i) => i === 23 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'blue', z: 9, dur: 1.25, ease: 'in', delay: 0.05 } : null
    },
    { // 11) 斜めに画面を切る帯と、逆向きに流れる形の列
      name: 'DIAGONAL', bg: 'blue',
      act: (i, t) => {
        if (i === 0) return { x: 0.5 + 0.05 * S(t * 1.2), y: 0.45, s: 0.5, shape: 'square', sx: 7, sy: 0.5, rot: -0.9 + 0.06 * S(t), fill: 'stripes', c: 'ink', c2: 'lime', z: 0.1 };
        if (i === 1) return { x: 0.86, y: 0.14, s: 0.72, shape: 'circle', fill: 'bull', c: 'paper', c2: 'red', rot: t, z: 0.2 };
        if (i === 2) return { x: 0.02, y: 0.98, s: 0.85, shape: 'quarter', rot: -PI / 2, c: 'lime', z: 0.15 };
        if (i === 3) return null;
        if (i < 14) { const k = i - 4, q = k / 9; return { x: 0.08 + q * 0.84, y: 0.78 - q * 0.66, s: 0.07 + q * 0.3, shape: k % 2 ? 'tri' : 'diamond', rot: t * 1.4 * (k % 2 ? 1 : -1) + q, fill: ['solid', 'stripes', 'split'][k % 3], c: col('blue', k), c2: col('blue', k + 1), ext: 1, delay: k * 0.04, z: 0.4 + q * 0.4 }; }
        const k = i - 14, q = (k / 10 + t * 0.15) % 1;
        return { x: 0.1 + q * 0.8, y: 0.15 + q * 0.65, s: 0.045, shape: 'square', rot: t * 3, c: 'paper', z: 0.8 };
      }
    },
    { // 12) 大きなコインが3枚、くるくる回る
      name: 'COINS', bg: 'blue',
      act: (i, t, K) => {
        if (i === 0) return { x: 0.5, y: 0.38, s: 1.5, shape: 'circle', fill: 'ring', c: 'ink', z: 0.05 };
        if (i === 1) return { x: 0.93, y: 0.95, s: 0.95, shape: 'half', rot: -PI / 2, c: 'red', z: 0.1 };
        if (i < 4) return null;
        if (i < 7) { const k = i - 4; return { x: 0.5 + ox((k - 1) * 0.36, K), y: 0.38, s: 0.36, shape: 'circle', flip: 1, ext: 1.2, fill: 'bull', c: ['paper', 'ink', 'lime'][k], c2: ['red', 'paper', 'ink'][k], z: 0.5 + k * 0.05 }; }
        if (i < 19) { const k = i - 7, a = t * 1.3 + (k * TAU) / 12; return { x: 0.5 + ox(0.62 * Co(a), K), y: 0.38 + oy(0.32 * S(a), K), s: 0.05, shape: k % 2 ? 'diamond' : 'circle', c: k % 2 ? 'paper' : 'lime', rot: t * 2, z: S(a) > 0 ? 0.9 : 0.3 }; }
        return null;
      }
    },
    { // 13) 大きな花びらが開き、四隅を巨大な四分円が囲む
      name: 'BLOOM', bg: 'blue',
      act: (i, t, K) => {
        if (i < 4) return { x: [0.02, 0.98, 0.98, 0.02][i], y: [0.02, 0.02, 0.98, 0.98][i], s: 0.8, shape: 'quarter', rot: [0, PI / 2, PI, -PI / 2][i], c: ['ink', 'red', 'paper', 'lime'][i], fill: i % 2 ? 'solid' : 'stripes', c2: 'blue', z: 0.1 };
        if (i < 16) { const k = i - 4, a = (k / 12) * TAU + t * 0.9, r = 0.4 + 0.03 * S(t * 4 + k); return { x: 0.5 + ox(r * Co(a), K), y: 0.4 + oy(r * S(a), K), s: 0.2, shape: 'half', rot: a + PI / 2, fill: k % 2 ? 'solid' : 'stripes', c: col('blue', k), c2: 'blue', z: 0.5 }; }
        if (i === 16) return { x: 0.5, y: 0.4, s: 0.3, shape: 'burst', rot: t * 1.5, fill: 'split', c: 'paper', c2: 'red', z: 0.7 };
        const k = i - 17, a = -t * 1.6 + (k * TAU) / 7;
        return { x: 0.5 + ox(0.2 * Co(a), K), y: 0.4 + oy(0.2 * S(a), K), s: 0.05, shape: 'diamond', rot: a, c: 'lime', z: 0.8 };
      }
    },
    { // 14) 真ん中の形が広がって、背景がライムに
      name: 'FLOOD', bg: 'blue', to: 'lime', beats: 0.8,
      act: (i) => i === 16 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'lime', z: 9, dur: 1.25, ease: 'in', delay: 0.05 } : null
    },
    { // 15) 階段のようにずれる大きな板と、その上を行進する四角
      name: 'STAIRS', bg: 'lime',
      act: (i, t) => {
        if (i === 0) return { x: 0.92, y: 0.9, s: 1.15, shape: 'circle', fill: 'split', c: 'ink', c2: 'blue', rot: t * 0.6, z: 0.1 };
        if (i === 1) return { x: 0.86, y: 0.12, s: 0.52, shape: 'lens', rot: 0.6 + 0.3 * S(t * 1.4), fill: 'stripes', c: 'paper', c2: 'red', z: 0.2 };
        if (i === 2) return { x: 0.03, y: 0.03, s: 0.75, shape: 'quarter', c: 'ink', fill: 'dots', c2: 'lime', z: 0.1 };
        if (i === 3) return null;
        if (i < 12) { const k = i - 4; return { x: 0.12 + k * 0.1 + 0.06 * S(t * 2 + k), y: 0.08 + k * 0.09, s: 0.18, shape: 'square', sx: 2.6, sy: 0.5, fill: k % 2 ? 'solid' : 'stripes', c: col('lime', k), c2: 'lime', ext: 0.8, delay: k * 0.04, z: 0.4 + k * 0.04 }; }
        const k = i - 12, q = (k / 12 + t * 0.25) % 1;
        return { x: 0.12 + q * 0.75, y: 0.05 + q * 0.68, s: 0.04, shape: 'square', rot: (step(t + k * 0.2, 2) * PI) / 2, c: k % 2 ? 'ink' : 'blue', z: 0.8 };
      }
    },
    { // 16) 大小さまざまに、画面いっぱいに散らばる
      name: 'SCATTER', bg: 'lime',
      act: (i, t) => ({
        x: -0.05 + 1.1 * rnd(i, 11) + 0.05 * S(t * 1.2 + i), y: -0.04 + 0.86 * rnd(i, 12) + 0.05 * Co(t * 1.1 + i),
        s: 0.08 + 0.4 * rnd(i, 13) ** 1.8, shape: SH[(i + 2) % SH.length], fill: FL[(i + 3) % FL.length],
        c: col('lime', i), c2: col('lime', i + 2), rot: t * (rnd(i, 14) - 0.5) * 2.4, z: 0.2 + rnd(i, 15) * 0.6
      })
    },
    { // 17) 形が広がって、背景が紙の色に（ここから 1) に戻る）
      name: 'FLOOD', bg: 'lime', to: 'paper', beats: 0.8,
      act: (i) => i === 0 ? { x: 0.5, y: 0.4, s: 4.6, shape: 'circle', c: 'paper', z: 9, dur: 1.25, ease: 'in', delay: 0.05 } : null
    }
  ];
};
