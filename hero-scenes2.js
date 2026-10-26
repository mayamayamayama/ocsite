// hero-scenes2.js — 入場画面のショット 5〜8。書き方は hero-scenes.js の上の説明と同じです
// （登場する物体の一覧と、道具は hero-scenes.js にあります）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function () {
  const { S, Co, PI, cl, io, FLOOR, range, ang, orb } = window.OC_HERO_LIB;

  const shots = [
    { // 5) 街：箱のビルが伸び縮みして、上に看板が浮かぶ。まわりを玉が飛ぶ
      name: 'CITY', bg: 'verm', sel: 's5',
      cam: (tb, t) => ({ pitch: 0.55 + 0.1 * S(t * 0.45), dist: 12.5, zoom: 1, t: [0, -0.3, 0] }),
      act: (t) => {
        const H = (i) => 0.4 + 1.6 * Math.abs(S(t * 0.7 + i * 1.9)), G = (i) => [((i % 4) - 1.5) * 0.82, (Math.floor(i / 4) - 1.5) * 0.82];
        const o = {
          plat: { p: [0, -1.75, 0], r: FLOOR, w: 3.4, d: 0.3, c: 'navy' },
          glass0: { p: [1.1 * Co(t * 0.4), 2.3, 1.1 * S(t * 0.4)], w: 0.9, z: 0 },
          holo0: { p: [0, 0.9 + 0.1 * S(t), 0], r: [0, PI / 4 + t * 0.1, 0], bw: 2.6, bh: 0.1, bd: 0.4 },
          holo1: { p: [0, 1.5, 0], r: [0, -PI / 4 + t * 0.1, 0], bw: 2.2, bh: 0.1, bd: 0.4 },
          aster0: { p: [0, 3.0, 0], bill: 1, r: [0, 0, t * 0.8], w: 0.5 },
          spring1: { p: [Co(t * 0.5 + 2) * 3.1, 0.4, S(t * 0.5 + 2) * 3.1], r: [0, -t * 0.5, 0] },
          r3: { p: [0, -1.82, 0], r: FLOOR, w: 4.3, c: 'cream', alpha: 0.5 }
        };
        range(16).forEach((i) => { const [x, z] = G(i), h = H(i); o['s' + i] = { p: [x, -1.6 + h / 2, z], r: [0, 0, 0], bw: 0.6, bd: 0.6, bh: h }; });
        range(8).forEach((i) => { const [x, z] = G(i * 2); o['c' + i] = { p: [x, -1.6 + H(i * 2) + 0.28, z], r: [0, t * 2.4 + i, 0], w: 0.22, d: 0.07 }; });
        range(16).forEach((i) => { const [x, z] = G(i); o['t' + i] = { p: [x, -1.6 + H(i) + (i % 2 ? 0.75 : 1.15), z], bill: 1, w: 0.2 }; });
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.2); o['t' + (16 + i)] = { p: [Co(a) * 2.75, -1.58, S(a) * 2.75], r: [-PI / 2, 0, -a], w: 0.3 }; });
        range(10).forEach((i) => { const a = ang(i, 10, t * (i % 2 ? 0.5 : -0.4)); o['b' + i] = { p: [Co(a) * (3 + (i % 3) * 0.35), 0.3 + 0.7 * S(t * 1.2 + i), S(a) * (3 + (i % 3) * 0.35)] }; });
        range(3).forEach((k) => { o['r' + k] = { p: [0, 0.4, 0], r: [-PI / 2 + [0.25, -0.4, 0.6][k], t * 0.15 + k * 2, 0], w: [3.2, 3.6, 2.6][k], c: ['cream', 'navy', 'orange'][k], alpha: 0.55 }; });
        return o;
      }
    },
    { // 6) ポスター：真ん中の平らなポスターは、いつも正面を向く。そのまわりを、立体の物が前と後ろを通って回る
      name: 'POSTER', bg: 'teal', sel: 'c2',
      cam: (tb, t) => ({ pitch: 0.12 + 0.08 * S(t * 0.5), dist: 11, zoom: 1.05, t: [0, 0.1, 0] }),
      act: (t) => {
        const P = [0, 0.2, 0], TL = [0.3, -0.45, 1.2], PH = [0.2, 1.4, 2.6].map((v) => v + t * 0.1);
        const o = {
          bigc: { p: P, bill: 1, scr: [0, 0, 0], sa: -PI / 2 + 0.3 * S(t * 0.5) },
          bar2: { p: P, bill: 1, scr: [0.35, 1.0 + 0.15 * S(t), 0.05] },
          bar0: { p: P, bill: 1, scr: [0.15, -1.2, 0.06] }, bar1: { p: P, bill: 1, scr: [0.5, -1.2, 0.06] },
          wedge0: { p: P, bill: 1, scr: [-1.2, 0.2, 0.05] },
          half0: { p: P, bill: 1, scr: [1.55, -0.95, 0.08], r: [0, 0, t * 0.5] },
          quarter0: { p: P, bill: 1, scr: [1.7, 0.9, 0.05], r: [0, 0, -t * 0.4] },
          pill0: { p: P, bill: 1, scr: [-1.5, -1.3, 0.1] },
          dots1: { p: P, bill: 1, scr: [0, 0.05, -0.1], nx: 16, ny: 2, gap: 0.45, dot: 0.035, c: 'cream' },
          sun0: { p: P, bill: 1, scr: [0.1, 0, 0.12], r: [0, 0, t], w: 0.16 },
          frames0: { p: [0, -2.2, 0], r: FLOOR, w: 6, h: 6, c: 'cream', alpha: 0.5 }
        };
        range(3).forEach((k) => { o['r' + k] = { p: P, r: [-PI / 2 + TL[k], PH[k], 0], w: 2.6 + k * 0.45, c: ['cream', 'orange', 'navy'][k], alpha: 0.65 }; });
        range(10).forEach((i) => { const k = i % 3, q = orb(2.6 + k * 0.45, t * (0.8 - k * 0.15) + i * 1.9, TL[k], PH[k]); o['b' + i] = { p: [q[0], q[1] + 0.2, q[2]] }; });
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.35); o['c' + i] = { p: [Co(a) * 3.4, -0.2 + 0.5 * S(a * 2 + t), S(a) * 3.4], r: [0, t * 2 + i, 0.3], w: 0.32 }; });
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.25 + 0.4); o['s' + i] = { p: [Co(a) * 4.1, 1.6 + 0.2 * S(t + i), S(a) * 4.1], r: [t * 0.6 + i, t * 0.4, 0.3], bw: 0.32, bh: 0.32, bd: 0.32 }; });
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.12), h = 0.4 + 0.6 * Math.abs(S(t * 1.5 + i)); o['s' + (8 + i)] = { p: [Co(a) * 4.3, -2.2 + h / 2, S(a) * 4.3], r: [0, -a, 0], bw: 0.2, bd: 0.5, bh: h }; });
        range(12).forEach((i) => { const a = ang(i, 12, t * 0.1); o['t' + i] = { p: [Co(a) * 3.0, -2.18, S(a) * 3.0], r: [-PI / 2, 0, -a + t], w: 0.3 }; });
        range(12).forEach((i) => { const q = orb(3.7, t * 0.5 + ang(i, 12), 1.45, t * 0.1); o['t' + (12 + i)] = { p: [q[0], q[1] + 0.2, q[2]], bill: 1, w: 0.16 }; });
        return o;
      }
    },
    { // 7) 等角：斜め上から見下ろす床に、波線・円盤・点・回る大きなコイン
      name: 'ISOMETRIC', bg: 'orange', sel: 'c0',
      cam: (tb, t) => ({ pitch: 0.62 + 0.1 * S(t * 0.5), dist: 13, zoom: 1.05, t: [0, -0.5, 0] }),
      act: (t) => {
        const F = -1.3;
        const o = {
          frames0: { p: [0, F, 0], r: FLOOR, w: 6.4, h: 6.4, c: 'navy', alpha: 0.7 },
          disc: { p: [0, F + 0.01, 0], r: FLOOR, w: 1.8, c: 'verm', split: '', sa: 0 },
          wave0: { p: [1.6, F + 0.02, -1.5], r: FLOOR, w: 2.4, h: 1.8, c: 'navy' },
          wave1: { p: [-1.7, F + 0.02, 1.5], r: [-PI / 2, 0, PI / 2], w: 2.2, h: 1.5, c: 'cream' },
          dots0: { p: [-1.6, F + 0.02, -1.6], r: FLOOR, nx: 7, ny: 7, gap: 0.3, dot: 0.035, c: 'blue', alpha: 1, z: -30 },
          holo0: { p: [-0.9, 0.9, -0.6], r: [0.25, 0.5 + 0.3 * S(t * 0.8), 0], bw: 2.6 },
          holo1: { p: [1.5, -0.2, 1.2], r: [0, 0.6 + t * 0.5, 0.4], bw: 1.5 },
          aster0: { p: [0.2, 0.3, 0.6], r: [0, t * 0.5, 0], w: 0.75 },
          aster1: { p: [-2.4, 0.6, -0.4], bill: 1, r: [0, 0, t] },
          spark0: { p: [2.1, 0.4, -0.3], r: [0, t * 1.4, 0] },
          pill0: { p: [0.4, 2.0 + 0.15 * S(t * 1.3), -0.2], r: [0, 0.4 + 0.3 * S(t), 0.3] },
          burst1: { p: [-2.0, 1.8, 1.0], bill: 1, r: [0, 0, t * 0.3], c: 'navy' },
          glass1: { p: [2.0, 0.7, -2.0], w: 0.9 },
          r0: { p: [0, F + 0.02, 0], r: FLOOR, w: 2.3, c: 'navy', alpha: 0.6 }, r1: { p: [0.2, 0.3, 0.6], r: [0, t * 0.9, 0], w: 1.1, c: 'cream', alpha: 0.8 }
        };
        range(3).forEach((i) => { o['c' + i] = { p: [0.9 - i * 0.14, -0.35, 0.9 - i * 0.14], r: [0, t * 2.2 + i * 0.4, 0], w: 0.85, d: 0.18 }; });
        range(5).forEach((i) => { o['c' + (3 + i)] = { p: [1.75, F + 0.09 + i * 0.16 + (i === 4 ? 0.08 * Math.abs(S(t * 2)) : 0), 1.75], r: FLOOR, w: 0.45 }; });
        range(8).forEach((i) => { o['t' + i] = { p: [-1.6, 0.25, -2.1 + i * 0.16], r: [0, 0, 0], shape: 'square', c: '#ffe1a0', alpha: 0.25 + (i === 7 ? 0.1 : 0), sx: 0.55, sy: 0.75, w: 1, split: '', stripes: '', g: null }; });
        range(8).forEach((i) => { o['t' + (8 + i)] = { p: [-0.6 + (i % 4) * 0.42 - (i > 3 ? 0.2 : 0), F + 0.03, 2.3 + (i > 3 ? 0.45 : 0)], r: FLOOR, shape: 'circle', c: 'cream', w: 0.12, sx: 1.3, split: '', stripes: '', g: null }; });
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.1 + 0.3); o['t' + (16 + i)] = { p: [Co(a) * 2.9, F + 0.04, S(a) * 2.9], r: [-PI / 2, 0, t + i], w: 0.24 }; });
        o.s0 = { p: [-0.4, 1.4, 1.5], r: [0, 0.5, -0.35 + 0.1 * S(t)], bw: 1.7, bh: 0.2, bd: 0.2, g: ['white', '#1b1b1b'] };
        range(7).forEach((i) => { const a = ang(i, 7, -t * 0.15 + 1); o['s' + (1 + i)] = { p: [Co(a) * 2.2, F + 0.09, S(a) * 2.2], r: [0, a, 0], bw: 0.5, bh: 0.16, bd: 0.3 }; });
        range(8).forEach((i) => { const h = 0.3 + 1.0 * Math.abs(S(t * 2.2 + i * 0.8)); o['s' + (8 + i)] = { p: [-2.45 + i * 0.7, F + h / 2, -2.9], r: [0, 0, 0], bw: 0.32, bd: 0.32, bh: h }; });
        range(10).forEach((i) => { const u = ((((t * 0.08 + i / 10) % 1) + 1) % 1) * 4, sd = Math.floor(u) % 4, f = u - sd, e = 3.2, c = [[-e, -e], [e, -e], [e, e], [-e, e]], a = c[sd], b = c[(sd + 1) % 4];
          o['b' + i] = { p: [a[0] + (b[0] - a[0]) * f, F + 0.2, a[1] + (b[1] - a[1]) * f], w: 0.18 }; });
        return o;
      }
    },
    { // 8) 花：花びらが開いたり閉じたりしながら回る。真上から下りてくる
      name: 'BLOOM', bg: 'navy', sel: 't9',
      cam: (tb, t) => ({ pitch: 1.1 - 0.65 * io(cl(tb / 3.6)), dist: 11.5, zoom: 1, t: [0, -0.7, 0] }),
      act: (t) => {
        const o = {
          plat: { p: [0, -1.85, 0], r: FLOOR, w: 3.0, d: 0.25, c: 'teal' },
          chrome: { p: [0, -0.9 + 0.1 * S(t * 1.5), 0], w: 0.55 },
          burst0: { p: [0, -1.71, 0], r: FLOOR, w: 2.9, c: 'cream', alpha: 0.35, a0: -t * 0.15 },
          aster0: { p: [0, 0.4 + 0.1 * S(t * 2), 0], bill: 1, r: [0, 0, -t], w: 0.4 }
        };
        const PC = [['verm', 'verm'], ['orange', '#ffb24d'], ['cream', 'peach']];
        range(24).forEach((i) => {
          const k = Math.floor(i / 8), dir = k % 2 ? -1 : 1, a = ang(i % 8, 8, k * 0.39 + t * (0.15 + k * 0.05) * dir);
          const tilt = [1.2, 0.85, 0.5][k] + 0.18 * S(t * 0.9 + k), R = [0.75, 1.35, 1.95][k];
          o['t' + i] = { p: [Co(a) * R, -1.45 + k * 0.12 + S(tilt) * 0.4, S(a) * R], r: [-PI / 2 + tilt, PI / 2 - a, 0], shape: 'lens', w: [0.4, 0.5, 0.6][k], sx: 0.55, sy: 1,
            c: PC[k][i % 2], g: k === 1 && i % 2 ? ['#ffb24d', 'verm'] : null, ga: PI / 2, split: '', stripes: '' };
        });
        range(16).forEach((i) => { const a = ang(i, 16, -t * 0.1), h = 0.6 + 1.4 * Math.abs(S(t * 1.1 + i * 0.9)); o['s' + i] = { p: [Co(a) * 3.6, -1.85 + h / 2, S(a) * 3.6], r: [0, -a, 0], bw: 0.12, bd: 0.12, bh: h }; });
        range(6).forEach((i) => { const q = (t * 0.3 + i / 6) % 1; o['r' + i] = { p: [0, -1.71, 0], r: FLOOR, w: 0.6 + q * 4.2, c: i % 2 ? 'cream' : 'orange', alpha: 0.6 * (1 - q) }; });
        range(10).forEach((i) => { const a = ang(i, 10, t * 0.35); o['b' + i] = { p: [Co(a) * 2.7, -0.3 + 0.6 * S(t + i * 1.3), S(a) * 2.7] }; });
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.25 + 0.2); o['c' + i] = { p: [Co(a) * 4.3, -0.5 + 0.3 * S(t * 1.5 + i), S(a) * 4.3], r: [0, t * 2 + i, 0], w: 0.34 }; });
        return o;
      }
    }
  ];
  return shots;
};
