// hero-game2.js — 入場画面「ゲーム」のバージョンの、ショット 4〜6（リズム・アイテムの輪・グリッチ）
// hero-game.js から呼ばれます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-game2');

window.OC_HERO_GAME2 = function (K, X) {
  const { S, Co, PI, TAU, FLOOR, range, ang, rnd, fr, lane, floorRing, eq, spin, hop, orb } = K;
  const { SPR, PAL, ITEMS } = X;
  return [
    { // 4) リズム：8本の道を、音符が真ん中の輪へ向かって流れる。輪に届くと波紋が広がり、スピーカーとばねが拍に合わせて動く
      name: 'RHYTHM', bg: 'verm', sel: 'chrome0',
      cam: (tb, t) => ({ pitch: 0.34 + 0.1 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, -0.5, 0] }),
      act: (t) => {
        const o = {}, F = -2.2, beat = t * 2, pulse = Math.pow(Math.max(0, Co(beat * PI)), 6), JR = 0.95, rl = t * 0.08, seg = [], NC = ['cream', 'navy', 'orange', 'white', 'cream', 'navy', '#ffd27a', 'teal'];
        range(4).forEach((k) => { o['r' + k] = { p: [0, F + 0.01, 0], r: FLOOR, w: 1.5 + k * 0.62, c: 'cream', lw: 1, alpha: 0.45 }; });
        o.r4 = { p: [0, F + 0.02, 0], r: FLOOR, w: JR * (1 + 0.1 * pulse), c: 'white', lw: 3, alpha: 1 };
        range(8).forEach((k) => { const a = ang(k, 8, rl); seg.push([[Co(a) * JR, F + 0.01, S(a) * JR], [Co(a) * 3.9, F + 0.01, S(a) * 3.9]]); });
        o.w0 = { segs: seg, c: 'cream', alpha: 0.5 };
        range(24).forEach((i) => { const sp = i % 8, a = ang(sp, 8, rl), u = fr(t * 0.45 + Math.floor(i / 8) / 3 + sp * 0.11), R = 3.75 - u * (3.75 - JR);   // 音符
          o['t' + i] = { p: [Co(a) * R, F + 0.03, S(a) * R], r: [-PI / 2, 0, -a], shape: ['circle', 'diamond', 'square', 'circle'][sp % 4], w: 0.14 + 0.07 * u, c: NC[sp] };
          if (u < 0.22) o['fl' + i] = { p: [Co(a) * JR, F + 0.04, S(a) * JR], r: FLOOR, shape: 'circle', ring: 2, w: 0.08 + u * 2.2, c: 'white', alpha: 1 - u / 0.22 }; });
        range(4).forEach((k) => { const a = ang(k, 4, PI / 4), q = [Co(a) * 3.95, F + 0.95, S(a) * 3.95], s = 1 + 0.14 * pulse;   // スピーカー
          o['c' + k] = { p: q, r: [0, PI / 2 - a, 0], w: 0.5, d: 0.2, s, c: 'navy', bull: 'cream' }; o['c' + (4 + k)] = { p: q, r: [0, PI / 2 - a, 0], w: 0.2, d: 0.3, s, c: 'orange', bull: 'navy' };
          o['s' + (24 + k)] = { p: [q[0] * 1.05, F + 0.4, q[2] * 1.05], r: [0, -a, 0], bw: 0.7, bh: 0.8, bd: 0.5 }; });
        range(3).forEach((k) => { const a = ang(k, 3, 0.6 - rl); o['spring' + k] = { p: [Co(a) * 2.2, F + 0.65 - 0.2 * pulse, S(a) * 2.2], r: FLOOR, w: 0.2, L: 1.3 - 0.4 * pulse, n: 10, c: ['cream', 'white', 'navy'][k] }; o['b' + (10 + k)] = { p: [Co(a) * 2.2, F + 1.4 - 0.4 * pulse, S(a) * 2.2], w: 0.16 }; });
        o.chrome0 = { p: [0, F + 0.7 + 0.2 * pulse, 0], w: 0.5 }; o.glass0 = { p: [0, F + 0.7, 0], w: 1.0 + 0.1 * pulse, z: 2 };
        o.ty0 = { p: [0, 1.0, 0], bill: 0.8, str: String(100 + Math.floor(beat)), s: 0.75 + 0.08 * pulse, ext: 0.14, c: 'cream', c2: 'navy' };
        o.tx0 = { p: [0, 0.45, 0], str: 'COMBO', s: 0.13, c: 'navy' };
        if (pulse > 0.3) o.tx1 = { p: [0, 1.65, 0], str: 'PERFECT', s: 0.16 + 0.04 * pulse, c: 'white' };
        range(6).forEach((k) => { const a = ang(k, 6, t * 0.4); o['st' + k] = { p: [Co(a) * 3.2, 2.55, S(a) * 3.2], r: [0, PI / 2 - a, 0], w: 3.4, h: 0.22, sp: 3 }; });
        o.wave0 = { p: [Co(-t * 0.2) * 3.6, 0.6, S(-t * 0.2) * 3.6], bill: 1, w: 2.0, h: 0.8, n: 8, amp: 0.2 + 0.3 * pulse, c: 'cream' };
        eq(o, 0, 24, 4.6, F, t, 1.3, 0.13, 0.3, rl, 4.0);
        lane(o, 't', 24, 12, 4.9, 1.4, 0.4, t * 0.04, -t * 0.25, () => ({ w: 0.16 }));
        hop(o, 0, 10, 3.3, F + 0.12, t * 1.6, 0.5, -rl, 0.14);
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'cream', alpha: 0.35 };
        o.tx2 = { p: [0, 3.15, 0], str: 'BPM 120 · BEAT ' + ((Math.floor(beat) % 4) + 1) + '/4 · SCORE ' + String(Math.floor(t * 37) * 10).padStart(7, '0'), s: 0.11, c: 'cream' };
        return o;
      }
    },
    { // 5) アイテムの輪：真ん中で大きなドットのハートが回り、3本の傾いた輪の上をアイテムが回る
      name: 'ITEMS', bg: '#ececec', sel: 'px0',
      cam: (tb, t) => ({ pitch: 0.18 + 0.1 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, 0.2, 0] }),
      act: (t) => {
        const o = {}, F = -2.2, C = [0, 0.45, 0];
        o.px0 = { p: C, bill: 0, r: [0, t * 0.7, 0], bits: SPR.heart, w: 1.5, ext: 0.55, c2: '#7a1f0a' };
        range(4).forEach((k) => { o['c' + k] = { p: [0, -0.95 - k * 0.2, 0], r: FLOOR, w: 0.55 + k * 0.13, d: 0.16 }; });
        [[1.9, 0.5, 0.2, 0.6], [2.6, -0.35, 1.4, -0.45], [3.3, 0.85, 2.6, 0.35]].forEach(([R, tl, phi, sp], k) => {
          o['r' + k] = { p: C, r: [tl - PI / 2, phi, 0], w: R, c: ['navy', 'verm', 'teal'][k], lw: 1.2, alpha: 0.55 };
          range(8).forEach((i) => { const q = orb(R, t * sp + (i * TAU) / 8, tl, phi); o['px' + (1 + k * 8 + i)] = { p: [q[0], q[1] + C[1], q[2]], bits: SPR[ITEMS[(i + k * 3) % 8]], pal: PAL, w: 0.36, ext: 0.08 }; }); });
        range(4).forEach((k) => { const u = fr(t * 0.5 + k / 4), a = k * 1.7 + Math.floor(t * 0.5 + k / 4) * 2.3; o['tx' + k] = { p: [Co(a) * 2.4, -0.4 + u * 1.6, S(a) * 2.4], str: ['+100', '+50', 'x2', '1UP'][k], s: 0.14, c: ['verm', 'teal', 'navy', 'orange'][k], alpha: 1 - u }; });
        o.ty0 = { p: [0, 2.75, 0], bill: 0.8, str: 'x3', s: 0.6, ext: 0.14, c: 'verm', c2: 'navy' };
        o.glass0 = { p: [Co(t * 0.3) * 2.0, 1.9, S(t * 0.3) * 2.0], w: 0.6 }; o.glass1 = { p: [Co(t * 0.3 + 2) * 2.4, -1.2, S(t * 0.3 + 2) * 2.4], w: 0.45 }; o.chrome1 = { p: [Co(t * 0.3 + 4) * 1.6, 2.4, S(t * 0.3 + 4) * 1.6], w: 0.25 };
        range(6).forEach((k) => { const a = ang(k, 6, t * 0.12); o['st' + k] = { p: [Co(a) * 2.6, F + 0.01, S(a) * 2.6], r: [-PI / 2, 0, -a], w: 1.9, h: 0.26 }; });
        eq(o, 0, 16, 4.3, F, t, 1.0, 0.2, 0.4, -t * 0.06);
        spin(o, 4, 10, 4.0, 0.0, t, t * 0.15, 0.24, 0.35);
        hop(o, 0, 10, 1.2, F + 0.12, t, 0.5, t * 0.3, 0.14);
        lane(o, 't', 0, 14, 4.9, 1.3, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.17 }));
        floorRing(o, 't', 14, 12, 3.6, F + 0.02, t * 0.1, () => ({ w: 0.22 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.4 }; o.r3 = { p: [0, F, 0], r: FLOOR, w: 4.4, c: 'navy', alpha: 0.4 };
        o.holo0 = { p: [Co(-t * 0.5) * 3.6, 1.2, S(-t * 0.5) * 3.6], r: [0.2, t * 0.5, 0.2], bw: 1.2 };
        o.tx4 = { p: [0, 3.25, 0], str: 'ITEMS 24 / 24 · COMPLETE', s: 0.11, c: 'navy' };
        return o;
      }
    },
    { // 6) グリッチ：色の帯が積み重なって、がたがたとずれる。色ずれの板、散らばるブロック、点滅する文字、行進するドットの敵
      name: 'GLITCH', bg: 'blue', sel: 'ty0',
      cam: (tb, t) => ({ pitch: 0.14 + 0.08 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, 0.2, 0] }),
      act: (t) => {
        const o = {}, F = -2.2, g8 = Math.floor(t * 8), jit = (k) => rnd(g8 * 7 + k) - 0.5;
        range(8).forEach((k) => { const big = rnd(Math.floor(t * 2) * 3 + k) > 0.65; o['st' + k] = { p: [0, -1.35 + k * 0.42, 0], bill: 0.85, scr: [jit(k) * (big ? 1.5 : 0.25), 0, (k % 3) * 0.12], w: 3.6, h: 0.36 }; });
        [['cyan', -0.14], ['pink', 0.14], ['white', 0]].forEach(([c, dx], k) => { o['fl' + k] = { p: [0, 0.15, 0], bill: 1, scr: [dx + jit(20 + k) * 0.15, jit(30 + k) * 0.08, -0.6 - k * 0.05], shape: 'square', w: 1.75, sx: 1.15, sy: 1.0, c, alpha: k === 2 ? 0.25 : 0.5 }; });
        range(24).forEach((k) => { const sd = Math.floor(t * (3 + (k % 3))) * 11 + k, s = 0.12 + 0.22 * rnd(sd + 3);   // 散らばるブロック
          o['v' + k] = Object.assign({ p: [(rnd(sd) - 0.5) * 5.2, -1.6 + 3.4 * rnd(sd + 1), (rnd(sd + 2) - 0.5) * 2.4], r: [0, rnd(sd + 4), 0], bw: s * 1.6, bh: s, bd: s }, K.bc(['verm', 'blue', 'pink', 'cream', 'navy', 'orange'][k % 6])); });
        o.ty0 = { p: [0, 0.15, 0], bill: 1, scr: [jit(40) * 0.1, 0, 1.4], str: 'PRESS START', s: 0.42, ext: 0.12, c: 'white', c2: 'pink', alpha: Math.floor(t * 2.5) % 2 ? 1 : 0.15 };
        o.tx0 = { p: [0, 2.2, 0], str: 'ERR 0x1F · BUFFER ' + String(g8 % 1000).padStart(3, '0'), s: 0.11, c: 'cyan' }; o.tx1 = { p: [0, -1.85, 0], scr: [0, 0, 1], str: 'INSERT COIN · CREDIT 00', s: 0.11, c: 'cream' };
        const SQ = [SPR.jelly, SPR.horn, SPR.bot], st = Math.floor(t * 2), ph = ((st % 20) < 10 ? st % 20 : 20 - (st % 20)) * 0.04;   // 行進する敵
        range(10).forEach((k) => { const a = ang(k, 10, ph + t * 0.05); o['px' + k] = { p: [Co(a) * 3.6, 2.4 + (k % 2) * 0.25, S(a) * 3.6], bits: SQ[k % 3], pal: PAL, w: 0.42, ext: 0.07 }; });
        o.frames0 = { p: [0, 0.15, 0], bill: 1, scr: [0, 0, -0.9], w: 4.4, h: 3.6, n: 2, c: 'cream', alpha: 0.7 };
        o.wave0 = { p: [0, -1.2, 0], bill: 1, scr: [2.4, 0, 0], w: 1.4, h: 1.0, n: 10, amp: 0.1, c: 'cyan' };
        o.holo2 = { p: [Co(t * 0.6) * 2.9, 0.2, S(t * 0.6) * 2.9], r: [t, t * 0.7, 0.4], bw: 0.4, bh: 0.4, bd: 0.4 }; o.chrome1 = { p: [Co(t * 0.6 + PI) * 2.9, -0.6, S(t * 0.6 + PI) * 2.9], w: 0.3 };
        eq(o, 0, 18, 4.5, F, t, 1.2, 0.16, 0.34, t * 0.05, 3.4);
        hop(o, 0, 10, 3.6, F + 0.12, t, 0.6, -t * 0.2, 0.15);
        lane(o, 't', 0, 14, 4.9, 0.9, 0.4, t * 0.04, -t * 0.25, () => ({ w: 0.16 }));
        floorRing(o, 't', 14, 12, 2.8, F + 0.02, -t * 0.1, () => ({ w: 0.2 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'cyan', alpha: 0.4 }; o.r0 = { p: [0, F, 0], r: FLOOR, w: 4.3, c: 'pink', alpha: 0.5 };
        return o;
      }
    }
  ];
};
