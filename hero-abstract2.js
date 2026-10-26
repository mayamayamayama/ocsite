// hero-abstract2.js — 入場画面の別バージョン「抽象」：ショット 4〜6（物体の一覧と 1〜3 は hero-abstract.js）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-abstract2');

window.OC_HERO_ABS2 = function (L) {
  const { S, Co, PI, TAU, DG, FLOOR, range, ang, rnd, bc, blob, mini, lane, floorRing, vdim } = L;
  return [
    { // 4) 円グラフ：床の円グラフが、ふくらんだり縮んだり。数字と引き出し線、まわりに棒グラフと積んだコイン
      name: 'PIE', bg: 'orange', sel: 'fl0',
      cam: (tb, t) => ({ pitch: 0.7 + 0.15 * S(t * 0.4), dist: 12, zoom: 1, t: [0, -0.8, 0] }),
      act: (t) => {
        const o = {}, F = -1.78, VAL = [0.26, 0.18, 0.14, 0.2, 0.12, 0.1], PCL = [['navy'], ['verm'], ['cream', 'teal'], ['teal'], ['peach'], ['cream']], FC = ['verm', 'teal', 'navy', 'cream', 'peach'], lead = [];
        let acc = t * 0.15;
        VAL.forEach((v, k) => { const a0 = acc, a1 = acc + v * TAU; acc = a1; const m = (a0 + a1) / 2, e = 0.15 + 0.25 * (0.5 + 0.5 * S(t * 1.1 + k * 1.2)), y = -1.4 + 0.3 * (0.5 + 0.5 * S(t * 1.3 + k * 2));
          o['sc' + k] = { p: [Co(m) * e, y, -S(m) * e], r: FLOOR, a0, a1, ro: 1.9, ri: 0.25, c: PCL[k][0], hatch: PCL[k][1] || null, hg: 0.1, ext: 1.4 };
          const p1 = [Co(m) * (e + 1.7), y + 0.05, -S(m) * (e + 1.7)], p2 = [Co(m) * (e + 2.25), y + 0.5, -S(m) * (e + 2.25)];   // 引き出し線と、割合の数字
          lead.push([p1, p2]); o['tx' + k] = { p: [p2[0], p2[1] + 0.16, p2[2]], bill: 1, str: Math.round(v * 100) + '%', s: 0.22, c: 'navy' }; });
        o.w1 = { segs: lead, c: 'navy', alpha: 0.8 };
        range(4).forEach((i) => { const ph = (i * PI) / 2 + t * 0.12, sp = 0.65 + 0.35 * S(t * 1.3 + i * 1.5), cp = [Co(ph) * 3.4, -0.4 + 0.25 * S(t * 0.9 + i), S(ph) * 3.4];
          range(4).forEach((j) => { const a0 = (40 + j * 28 * sp) * DG; o['sc' + (6 + i * 4 + j)] = { p: cp, r: [0, PI / 2 - ph, 0], a0, a1: a0 + 26 * sp * DG, ro: 1.25 - j * 0.08, ri: 0.3, c: FC[(i + j) % 5], ext: 0.5 }; }); });
        o.bu0 = { p: [0, 1.4, 0], bill: 1, w: 0.9, c: 'navy', spread: 0.5, n: 18, a0: 0 }; o.bu1 = { p: [0, 1.4, 0], bill: 1, w: 0.9, c: 'navy', spread: 0.5, n: 18, a0: PI };
        o.b0 = { p: [0, 1.4, 0], w: 0.16 };
        range(6).forEach((i) => { const a = ang(i, 6, -t * 0.5); o['b' + (1 + i)] = { p: [Co(a) * 2.45, -1.55, S(a) * 2.45] }; });
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.08 + 0.4); o['fl' + i] = { p: [Co(a) * 4.5, -1.3, S(a) * 4.5], r: [0, PI / 2 - a, 0], shape: i % 2 ? 'quarter' : 'half', w: 0.45, c: ['navy', 'cream', 'verm', 'teal'][i % 4], ext: 0.6 }; });
        range(12).forEach((i) => { const a = ang(i, 12, -t * 0.06), h = 0.3 + 1.4 * Math.abs(S(t * 1.2 + i * 0.8)); o['s' + i] = { p: [Co(a) * 5.3, F + h / 2, S(a) * 5.3], r: [0, -a, 0], bw: 0.3, bh: h, bd: 0.3 }; });   // 棒グラフ
        range(8).forEach((i) => { const k = i >> 1, j = i & 1, a = PI / 4 + (k * PI) / 2 + t * 0.05; o['c' + i] = { p: [Co(a) * 2.9, F + 0.07 + j * 0.14 + (j ? 0.08 * Math.abs(S(t * 2 + k)) : 0), S(a) * 2.9], r: FLOOR, w: 0.3, d: 0.12 }; });   // 積んだコイン
        lane(o, 't', 0, 12, 4.6, 1.6, 0.3, t * 0.04, t * 0.25, (i) => mini(i, 0.12));
        floorRing(o, 't', 12, 12, 4.0, F + 0.01, -t * 0.05, (i) => ({ shape: 'tri', w: 0.1, c: i % 3 ? 'navy' : 'cream' }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, nx: 14, ny: 14, gap: 0.6, c: 'navy', alpha: 0.5 };
        o.w0 = { pts: range(41).map((i) => [Co((i / 40) * TAU) * 2.25, F + 0.04, S((i / 40) * TAU) * 2.25]), c: 'navy', alpha: 0.6, dash: [4, 4] };
        o.r0 = { p: [0, F + 0.02, 0], r: FLOOR, w: 4.0, c: 'navy', alpha: 0.5 };
        o.as0 = { p: [0, 2.6, 0], bill: 1, r: [0, 0, t * 0.5] }; o.gl0 = { p: [3.0, 0.8, -2.6], w: 0.8 }; o.hs0 = { p: [-3.2, 0.6, 2.0], r: [0.2, t * 0.5, 0.2] };
        return o;
      }
    },
    { // 5) ぐにゃぐにゃ：うねる形が漂い、点線のネットワークでつながる。まわりに的と交差した棒
      name: 'BLOBS', bg: 'cream', sel: 'cn0',
      cam: (tb, t) => ({ pitch: 0.22 + 0.1 * S(t * 0.5), dist: 12, zoom: 1, t: [0, 0, 0] }),
      act: (t) => {
        const o = {}, BC = ['teal', 'verm', 'orange', 'navy', 'peach', 'teal', 'verm', 'orange'], P = [];
        range(8).forEach((i) => { const R = 1.4 + (i % 3) * 0.75, a = t * 0.21 + i * 0.8, p = [Co(a) * R, -0.6 + 1.5 * S(t * 0.3 + i * 1.7), S(a) * R]; P.push(p);
          o['fl' + i] = Object.assign({ p, shape: blob(t * (0.5 + i * 0.07) + i, 0.1 + 0.04 * (i % 3), 0.06), w: 0.55 + (i % 4) * 0.2, c: BC[i] }, i % 2 ? { r: [0, t * 0.3 + i, 0], ext: 0.6 } : { bill: 1 });
          o['t' + i] = { p, bill: 1, scr: [0, 0, 0.9], shape: 'diamond', w: 0.06, c: 'navy' };   // ネットワークの点
          if (i < 4) o['tx' + i] = { p: [p[0], p[1] + 1.0, p[2]], bill: 1, str: 'B.0' + (i + 1), s: 0.14, c: 'navy' }; });
        const net = []; range(8).forEach((i) => { net.push([P[i], P[(i + 1) % 8]]); if (i % 2 === 0) net.push([P[i], P[(i + 3) % 8]]); });
        o.w1 = { segs: net, c: 'navy', alpha: 0.5, dash: [3, 4] };
        o.sc0 = { p: [0, 0.2, 0], bill: 1, a0: 0, a1: TAU, ri: 0.82, ro: 1.0, c: 'teal' };   // 真ん中の的
        o.sc1 = { p: [0, 0.2, 0], bill: 1, scr: [0, 0, 0.01], a0: 0.4, a1: 5.6, ri: 0.86, ro: 0.9, c: 'cream' };
        o.fl8 = { p: [0, 0.2, 0], bill: 1, scr: [0, 0, 0.02], w: 0.78, c: 'navy' }; o.fl9 = { p: [0, 0.2, 0], bill: 1, scr: [0, 0, 0.03], w: 0.56, c: 'verm' };
        o.fl10 = { p: [0, 0.2, 0], bill: 1, scr: [0, 0, 0.04], shape: 'sun', w: 0.3, c: 'orange', r: [0, 0, t * 0.6] };
        range(3).forEach((k) => { const a = ang(k, 3, -t * 0.18 + 0.5), p = [Co(a) * 3.3, 1.2 - k * 0.9, S(a) * 3.3];   // 交差した棒
          o['fl' + (11 + k * 2)] = { p, bill: 1, shape: 'square', w: 1, sx: 0.45, sy: 0.05, c: 'verm', r: [0, 0, 0.5 + t * 0.3] };
          o['fl' + (12 + k * 2)] = { p, bill: 1, scr: [0, 0, 0.02], shape: 'square', w: 1, sx: 0.45, sy: 0.05, c: 'teal', r: [0, 0, -0.6 + t * 0.3] }; });
        range(4).forEach((i) => { const a = ang(i, 4, t * 0.25); o['cn' + i] = { p: [Co(a) * 3.8, -0.9 + 0.3 * S(t + i), S(a) * 3.8], r: [0, t * 0.7 + i, 0], w: 0.45 }; });
        range(4).forEach((i) => { const a = ang(i, 4, -t * 0.6 + 0.4); o['c' + i] = { p: [Co(a) * 2.0, -2.3 + 0.28, S(a) * 2.0], r: [0, PI / 2 - a, t * 3], w: 0.28 }; });   // 床を転がるコイン
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.3); o['s' + i] = { p: [Co(a) * 2.8, 2.3 + 0.4 * S(t * 1.2 + i), S(a) * 2.8], r: [t * 0.8 + i, t * 0.6, 0.4], bw: 0.24, bh: 0.24, bd: 0.24 }; });
        lane(o, 't', 8, 16, 4.5, 1.0, 0.4, -t * 0.04, -t * 0.22, (i) => mini(i + 8, 0.12));
        o.wave0 = { p: [0, -2.3, 0], r: FLOOR, w: 3.4, h: 2.4, n: 14, amp: 0.35, c: 'navy' };
        o.dots0 = { p: [0, -2.32, 0], r: FLOOR, nx: 14, ny: 14, gap: 0.55, c: 'navy', alpha: 0.4 };
        o.bu0 = { p: [-2.4, 2.2, -1.4], bill: 1, w: 0.9, c: 'navy', spread: 0.35, n: 22, a0: -0.6 };
        range(5).forEach((i) => { const a = ang(i, 5, -t * 0.4); o['b' + i] = { p: [Co(a) * 2.2, 1.7 + 0.3 * S(t * 1.5 + i), S(a) * 2.2] }; });
        o.r0 = { p: [0, -2.3, 0], r: FLOOR, w: 4.3, c: 'navy', alpha: 0.5 };
        o.gl0 = { p: [2.2, 2.4, -1.4], w: 1.0 }; o.hs0 = { p: [-2.8, -1.4, -1.8], r: [0.3, t * 0.4, 0.2] }; o.as0 = { p: [-1.2, 2.8, 1.6], bill: 1, r: [0, 0, t * 0.7] };
        o.sp0 = { p: [3.0, -1.6, 1.8], r: FLOOR, w: 0.25, L: 1.3, n: 13, c: 'navy' };
        return o;
      }
    },
    { // 6) 積み木の彫刻：形を積み上げた彫刻が、段ごとに違う向きへ回る。高さの寸法つき
      name: 'STACK', bg: 'verm', sel: 'bx0',
      cam: (tb, t) => ({ pitch: 0.25 + 0.1 * S(t * 0.5), dist: 11.5, zoom: 1, t: [0, 0.2, 0] }),
      act: (t) => {
        const o = {}, wob = (k) => 0.06 * S(t * 1.7 + k), F = -2.3;
        o.bx0 = Object.assign({ p: [0, -2.05, 0], r: [0, t * 0.1, 0], bw: 1.8, bh: 0.5, bd: 1.8 }, bc('navy'));
        o.fl0 = { p: [wob(0), -1.48, 0], r: [0, t * 0.3, 0], shape: 'square', w: 0.66, sx: 1, sy: 0.5, c: 'navy', ext: 0.8 };
        o.fl1 = { p: [wob(1), -0.4, 0], r: [0, -t * 0.45, 0], w: 0.56, c: 'cream', split: 'teal', sa: t * 0.3, ext: 0.6 };
        o.fl2 = { p: [wob(2), 0.5, 0], r: [0, t * 0.6, PI], shape: 'half', w: 0.6, c: 'orange', ext: 0.6 };
        o.fl3 = { p: [wob(3), 1.25, 0], r: [0, -t * 0.8, 0], shape: 'quarter', w: 0.55, c: 'teal', ext: 0.6 };
        o.b0 = { p: [wob(4), 1.95, 0], w: 0.26 }; o.gl0 = { p: [wob(4), 1.95, 0], w: 0.5, z: 0.5 };
        o.fl4 = { p: [wob(5), 2.55, 0], bill: 1, shape: 'lens', w: 0.3, sx: 0.5, c: 'peach', r: [0, 0, t] };
        const dm = [[[0, -1.8, 0], [0, 3.1, 0]]]; vdim(dm, 1.25, 0, -1.8, 2.7, 0.3, 0.1);   // 真ん中の軸と、高さの寸法
        o.w0 = { segs: dm, c: 'cream', alpha: 0.6 };
        [-1.48, -0.4, 0.5, 1.25, 1.95].forEach((y, i) => { o['tx' + i] = { p: [1.75, y, 0], bill: 1, str: 'H ' + (y + 1.8).toFixed(2), s: 0.13, c: 'cream' }; });
        const GB = [['#ffb08a', '#ff7a7a'], ['#2a2a2a', '#3a1a2a', '#ff4fa3'], null, ['#f2f2f2', '#9a9a9a'], null, ['cyan', 'blue'], null, ['#fff4d6', 'orange']], GC = ['peach', 'navy', 'teal', 'cream', 'orange', 'navy', 'cream', 'orange'];
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.1), h = 0.8 + 1.3 * Math.abs(S(t * 0.8 + i * 1.1)), p = [Co(a) * 3.3, F + h / 2, S(a) * 3.3];
          o['bx' + (1 + i)] = Object.assign({ p, r: [0, -a, 0], bw: 0.75, bh: h, bd: 0.75, g: GB[i] }, bc(GC[i]));
          o['s' + i] = { p: [p[0], F + h + 0.16 + 0.06 * S(t * 3 + i), p[2]], r: [0, t + i, 0], bw: 0.26, bh: 0.26, bd: 0.26 }; });   // 箱の上の、小さな箱
        range(8).forEach((i) => { const a = ang(i, 8, t * 0.4), tl = 0.5; o['sc' + i] = { p: [Co(a) * 2.2, 0.6 + S(a) * Co(tl) * 0.8, S(a) * 2.2 * Co(tl)], r: [0, -a + t, 0], a0: 0, a1: PI / 2 + 0.4 * S(t + i), ro: 0.32, ri: 0.1, c: ['cream', 'orange', 'navy', 'teal'][i % 4], ext: 0.4 }; });
        range(8).forEach((i) => { const a = ang(i, 8, -t * 0.5); o['c' + i] = { p: [Co(a) * 2.35, F + 0.28, S(a) * 2.35], r: [0, PI / 2 - a, t * 3], w: 0.28 }; });   // 床を転がるコイン
        lane(o, 't', 0, 12, 2.9, 0.6, 0.6, t * 0.06, -t * 0.35, (i) => mini(i, 0.12));
        floorRing(o, 't', 12, 12, 3.95, F + 0.01, t * 0.05, (i) => ({ shape: 'square', w: 0.16, c: i % 2 ? 'cream' : 'navy' }));
        o.sc8 = { p: [0, F - 0.02, 0], r: FLOOR, a0: 0, a1: TAU, ro: 4.3, ri: 0, c: '#b83a12', z: -60 };
        o.dots0 = { p: [0, F, 0], r: FLOOR, nx: 13, ny: 13, gap: 0.55, c: 'cream', alpha: 0.45 };
        o.bu0 = { p: [-3.4, 1.4, 0.8], bill: 1, w: 0.8, c: 'cream', spread: 0.5, n: 16, a0: 0 }; o.bu1 = { p: [-3.4, 1.4, 0.8], bill: 1, w: 0.8, c: 'cream', spread: 0.5, n: 16, a0: PI };
        range(5).forEach((i) => { const a = ang(i, 5, t * 0.3); o['b' + (1 + i)] = { p: [Co(a) * 4.2, -2.1 + Math.abs(S(t * 2.2 + i)) * 0.9, S(a) * 4.2] }; });
        o.r0 = { p: [0, F + 0.02, 0], r: FLOOR, w: 2.4, c: 'cream', alpha: 0.6 };
        o.as0 = { p: [0, 3.35, 0], bill: 1, r: [0, 0, t * 0.6] }; o.hs0 = { p: [Co(t * 0.5) * 2.6, 2.6, S(t * 0.5) * 2.6], r: [0.2, -t * 0.5, 0] };
        o.sp0 = { p: [2.6, F + 0.7, 2.2], r: FLOOR, w: 0.25, L: 1.4, n: 14, c: 'cream' };
        return o;
      }
    }
  ];
};
