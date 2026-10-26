// hero-mountain2.js — 入場画面の別バージョン「山」：ショット 4〜6（物体の一覧と 1〜3 は hero-mountain.js）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-mountain2');

window.OC_HERO_MTN2 = function (L) {
  const { S, Co, PI, TAU, cl, io, FLOOR, range, ang, rnd, bc, LAYS, ringRidges, flag, birds, clouds, lane, balloon } = L;
  return [
    { // 4) 地層：薄い板を積み重ねた山。真上から見ると等高線の地図、横から見ると立体。断面の面と、掘り出した柱
      name: 'STRATA', bg: 'cream', sel: 'ly0',
      cam: (tb, t) => ({ pitch: 1.2 - 0.82 * io(cl((tb - 0.8) / 3)), dist: 11.5, zoom: 1, t: [0, -1.0, 0] }),
      act: (t) => {
        const o = {}, Y = -2, gap = 0.1 + 0.16 * (0.5 + 0.5 * S(t * 0.9)), pins = [];
        const LC = ['#0d7d7a', 'teal', '#3fc6c2', '#bfe6d9', 'cream', 'peach', '#ffb08a', 'orange', 'verm', '#b83a12', 'navy', 'white'];
        const W = (k) => 3.1 * Math.pow(1 - k / 12, 0.9), C = (k) => [0.15 * S(k), Y + k * gap, 0.12 * Co(k * 1.3)];
        range(12).forEach((k) => { o['ly' + k] = { p: C(k), r: [-PI / 2, 0, t * 0.04 * (k % 2 ? 1 : -1) + k * 0.3], shape: LAYS[k], w: W(k), c: LC[k], ext: 0.6 }; });
        range(4).forEach((k) => { o['r' + k] = { p: [0, Y - 0.02, 0], r: FLOOR, w: 3.5 + k * 0.32, c: 'navy', alpha: 0.4 }; });
        o.dots0 = { p: [0, Y - 0.03, 0], r: FLOOR, nx: 15, ny: 15, gap: 0.6, c: 'navy', alpha: 0.35 };
        range(4).forEach((i) => { const a = ang(i, 4, 0.6 - t * 0.05); o['pk' + i] = { p: [Co(a) * 4.2, Y, S(a) * 4.2], w: 0.45, h: 0.8 + 0.3 * rnd(i), n: 5, c: ['navy', 'verm', 'teal', 'orange'][i], snow: 0.25, seed: i }; });
        flag(o, [C(11)[0], C(11)[1] + 0.03, C(11)[2]], 0);
        const RX = [3.2, Y, 1.4], segs = [[RX, [RX[0], Y + 11 * gap, RX[2]]]];   // 高さのものさし
        range(12).forEach((k) => segs.push([[RX[0], Y + k * gap, RX[2]], [RX[0] + (k % 3 ? 0.1 : 0.22), Y + k * gap, RX[2]]]));
        o.w1 = { segs, c: 'navy', lw: 1, alpha: 0.8 };
        range(4).forEach((k) => { o['tx' + k] = { p: [RX[0] + 0.45, Y + k * 3 * gap + 0.06, RX[2]], bill: 1, str: String(k * 600), s: 0.15, c: 'navy' }; });
        o.tx4 = { p: [RX[0] + 0.5, Y + 12 * gap + 0.2, RX[2]], bill: 1, str: 'Δ ' + gap.toFixed(2), s: 0.14, c: 'verm' };
        [1.0, 2.6, 4.2].forEach((a, c) => range(4).forEach((k) => {   // 掘り出した柱（地層の見本）
          o['s' + (c * 4 + k)] = Object.assign({ p: [Co(a) * 3.5, Y + 0.12 + k * 0.24, S(a) * 3.5], r: [0, -a, 0], bw: 0.22, bh: 0.22, bd: 0.22 }, { c: LC[(k * 3 + c) % 12], side: '#9a8a80', top: LC[(k * 3 + c + 1) % 12] }); }));
        const xs = 2.3 * S(t * 0.5);   // 断面の面（左右に動く）
        o.fl5 = { p: [xs, Y + 1.0, 0], r: [0, PI / 2, 0], shape: 'square', w: 1, sx: 2.0, sy: 1.05, c: 'white', alpha: 0.16 };
        o.w4 = { pts: [[xs, Y, -2], [xs, Y, 2], [xs, Y + 2.05, 2], [xs, Y + 2.05, -2], [xs, Y, -2]], c: 'verm', lw: 1.2, alpha: 0.8 };
        o.tx5 = { p: [xs, Y + 2.3, 2], bill: 1, str: 'X ' + xs.toFixed(2), s: 0.13, c: 'verm' };
        range(12).forEach((k) => { const a = 0.3 + k * 0.13; o['t' + k] = { p: [Co(a) * 4.7, Y + 0.01, S(a) * 4.7], r: [-PI / 2, 0, -a], shape: 'square', w: 0.07, c: LC[k] }; });   // 色の見本
        [4, 7, 10].forEach((k, i) => { const c = C(k), a = i * 2.1 + 0.5, p = [c[0] + Co(a) * W(k) * 0.6, c[1] + 0.01, c[2] + S(a) * W(k) * 0.6], q = [p[0], p[1] + 0.45, p[2]]; pins.push([p, q]); o['b' + i] = { p: q, w: 0.08 }; });
        o.w5 = { segs: pins, c: 'navy', lw: 1, alpha: 0.8 };
        lane(o, 't', 12, 12, 4.3, -0.5, 0.2, t * 0.04, -t * 0.15, (i) => ({ shape: 'diamond', w: 0.05, c: i % 2 ? 'verm' : 'navy' }));
        clouds(o, 1, 4, 3.4, 0.6, t, 'white');
        return o;
      }
    },
    { // 5) 夕日：何重にも重なった山脈のあいだから、しま模様の太陽がのぞく。灯台・ヨット・月・雲の筋
      name: 'SUNSET', bg: 'orange', sel: 'fl0',
      cam: (tb, t) => ({ pitch: 0.12 + 0.06 * S(t * 0.5), dist: 12, zoom: 1, t: [0, -0.2, 0] }),
      act: (t) => {
        const o = {}, Y = -1.5, sp = [0, -0.3 + 0.5 * S(t * 0.35), 0];
        o.fl0 = { p: sp, bill: 1, w: 1.5, g: ['#fff4d6', 'peach', 'verm'], ga: PI / 2 };
        o.bu0 = { p: sp, bill: 1, scr: [0, 0, -0.06], w: 2.5, n: 28, spread: TAU, a0: t * 0.05, c: 'peach', alpha: 0.5 };   // 光の筋
        range(5).forEach((k) => { o['fl' + (1 + k)] = { p: sp, bill: 1, scr: [0, -0.25 - k * 0.24, 0.02 * (k + 1)], shape: 'square', w: 1, sx: 1.6, sy: 0.035 + k * 0.014, c: 'orange' }; });   // 太陽のしま
        o.tx0 = { p: [sp[0], sp[1] + 1.15, sp[2]], bill: 1, str: '18:42', s: 0.22, c: 'navy' }; o.tx1 = { p: [sp[0], sp[1] + 0.88, sp[2]], bill: 1, str: 'SUNSET', s: 0.11, c: 'navy' };
        ringRidges(o, 0, 8, 2.2, Y, { h: 1.5, c: 'peach', snow: 0.85, snowc: 'cream' }, t);
        ringRidges(o, 8, 10, 3.1, Y, { h: 1.05, c: 'verm' }, t);
        ringRidges(o, 18, 12, 4.0, Y, { h: 0.7, c: 'navy', edge: 'orange' }, t);
        o.fl6 = { p: [0, Y - 0.02, 0], r: FLOOR, w: 4.9, c: 'navy', z: -60 };   // 水面
        o.wave0 = { p: [0, Y - 0.01, 0], r: FLOOR, w: 4, h: 3, n: 14, amp: 0.06, c: 'cream', alpha: 0.4 };
        o.fl7 = { p: [0, Y - 0.005, 0], r: FLOOR, w: 1.1, sx: 1, sy: 0.4, g: ['#fff4d6', 'verm'], ga: 0, alpha: 0.6, z: -50 };
        range(3).forEach((k) => { const q = (t * 0.25 + k / 3) % 1; o['r' + (1 + k)] = { p: [0, Y - 0.01, 0], r: FLOOR, w: 2.0 + q * 2.6, c: 'cream', alpha: (1 - q) * 0.4 }; });   // 水の輪
        const LH = [4.45, Y, 0.3];   // 灯台
        o.pk20 = { p: LH, w: 0.32, h: 0.28, n: 5, c: 'navy', seed: 2 };
        o.s0 = Object.assign({ p: [LH[0], Y + 0.25 + 0.45, LH[2]], bw: 0.16, bh: 0.9, bd: 0.16 }, bc('cream'));
        o.b1 = { p: [LH[0], Y + 1.25, LH[2]], w: 0.1, g: ['white', '#fff4d6', 'orange'] };
        o.beam = { p: [LH[0], Y + 1.25, LH[2]], r: [-PI / 2 + 0.06, t * 1.2, 0], ro: 3.2, ri: 0.1, a0: -0.12, a1: 0.12, c: '#fff4d6', alpha: 0.35 };
        range(3).forEach((i) => { const a = t * 0.06 + i * 2.1, p = [Co(a) * 4.45, Y + 0.04, S(a) * 4.45];   // ヨット
          o['s' + (1 + i)] = Object.assign({ p, r: [0, -a, 0], bw: 0.3, bh: 0.07, bd: 0.12 }, bc('navy')); o['t' + i] = { p: [p[0], p[1] + 0.17, p[2]], r: [0, -a + PI / 2, 0], shape: 'tri', w: 0.14, c: 'cream' }; });
        range(10).forEach((i) => { const a = ang(i, 10, t * 0.03 + 0.5); o['t' + (3 + i)] = { p: [Co(a) * 3.5, 0.6 + 1.8 * rnd(i + 3), S(a) * 3.5], bill: 1, shape: 'square', w: 0.5 + 0.5 * rnd(i), sx: 1, sy: 0.04, c: 'cream', alpha: 0.7 }; });   // 雲の筋
        range(10).forEach((i) => { const a = ang(i, 10, -t * 0.04) + 0.15 * S(t + i); o['t' + (13 + i)] = { p: [Co(a) * 4.5, Y - 0.004, S(a) * 4.5], r: [-PI / 2, 0, -a + PI / 2], shape: 'square', w: 0.25, sx: 1, sy: 0.05, c: 'cream', alpha: 0.5 + 0.3 * S(t * 3 + i) }; });   // 水面のきらめき
        o.b2 = { p: [-Co(t * 0.1) * 4.4, 2.6, -S(t * 0.1) * 4.4], w: 0.2 };   // 月
        const bs = []; balloon(o, 'b3', 's4', bs, [Co(t * 0.12 + 1) * 3.0, 1.6 + 0.2 * S(t * 0.6), S(t * 0.12 + 1) * 3.0]); balloon(o, 'b4', 's5', bs, [Co(t * 0.12 + 3.6) * 3.6, 2.3 + 0.2 * S(t * 0.5 + 1), S(t * 0.12 + 3.6) * 3.6]);
        o.w5 = { segs: bs, c: 'navy', lw: 1, alpha: 0.8 };
        range(3).forEach((i) => { const u = (t * 0.12 + i / 3) % 1, a = i * 2.3 + 0.7, R = 1.6 + i * 0.7; o['b' + (5 + i)] = { p: [Co(a) * R, Y + 0.2 + u * 4.2, S(a) * R], w: 0.07 * (1 - u * 0.5), g: ['white', '#fff4d6', 'orange'] }; });   // 空に上がる灯り
        birds(o, 8, 6, 2.0, 1.4, t);
        clouds(o, 14, 4, 2.8, 1.5, t, 'cream');
        o.r0 = { p: [0, Y, 0], r: FLOOR, w: 4.9, c: 'cream', alpha: 0.4 };
        return o;
      }
    },
    { // 6) 積み木の地形：箱の柱が山の形になり、頂上がぐるぐる場所を変える。ドローンがレーザーで測る
      name: 'VOXEL', bg: '#ececec', sel: 'vx24',
      cam: (tb, t) => ({ pitch: 0.5 + 0.12 * S(t * 0.4), dist: 12.5, zoom: 1, t: [0, -0.6, 0] }),
      act: (t) => {
        const o = {}, Y = -2, cx = 0.8 * Co(t * 0.4), cz = 0.8 * S(t * 0.4), segs = [];
        let mx = -1, mi = 0;
        range(49).forEach((i) => {
          const x = ((i % 7) - 3) * 0.6, z = (Math.floor(i / 7) - 3) * 0.6;
          const h = 0.15 + 2.6 * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / 2.2) + 0.25 * S(x * 1.7 + t * 1.5) * Co(z * 1.3 - t * 1.2), hh = Math.max(0.1, h);
          const c = hh < 0.45 ? 'navy' : hh < 0.9 ? 'teal' : hh < 1.4 ? 'orange' : hh < 2.0 ? 'verm' : 'white';
          o['vx' + i] = Object.assign({ p: [x, Y + hh / 2, z], bh: hh, bw: 0.56, bd: 0.56 }, bc(c)); if (hh > mx) { mx = hh; mi = i; }
        });
        const fy = Y + 2.4 * (0.5 + 0.5 * S(t * 0.7));
        o.fl0 = { p: [0, fy, 0], r: FLOOR, shape: 'square', w: 2.5, c: 'white', alpha: 0.3 }; o.r0 = { p: [0, fy, 0], r: FLOOR, w: 3.0, c: 'navy', alpha: 0.7 };   // 輪切りの面
        range(3).forEach((k) => { o['r' + (1 + k)] = { p: [cx, Y - 0.01, cz], r: FLOOR, w: 0.9 + k * 0.7, c: 'navy', alpha: 0.5 }; });   // 頂上の下の等高線
        o.frames0 = { p: [0, Y - 0.02, 0], r: FLOOR, w: 5, h: 5, c: 'navy', alpha: 0.6 };
        o.dots0 = { p: [0, Y - 0.03, 0], r: FLOOR, nx: 15, ny: 15, gap: 0.6, c: 'navy', alpha: 0.35 };
        o.terr = { p: [0, Y - 0.05, 0], w: 9, nx: 20, amp: 0.25, sg: 0.8, ph: t * 0.4, c: 'navy', alpha: 0.2 };
        const tp = o['vx' + mi].p, top = [tp[0], Y + mx, tp[2]]; o.b0 = { p: [tp[0], Y + mx + 0.2, tp[2]], w: 0.18 };
        o.tx0 = { p: [tp[0] + 0.6, Y + mx + 0.45, tp[2]], bill: 1, str: 'MAX ' + Math.round(mx * 1000), s: 0.18, c: 'navy' };
        o.w0 = { pts: [top, [tp[0] + 0.5, Y + mx + 0.4, tp[2]]], c: 'navy', lw: 1, alpha: 0.8 };
        range(7).forEach((i) => { const v = (i - 3) * 0.6; segs.push([[v, Y, -2.1], [v, Y, -2.28]], [[-2.1, Y, v], [-2.28, Y, v]]); });   // 目盛りと記号
        ['A', 'C', 'E', 'G'].forEach((s, k) => { o['tx' + (1 + k)] = { p: [(k * 2 - 3) * 0.6, Y + 0.1, -2.5], bill: 1, str: s, s: 0.15, c: 'navy' }; });
        ['1', '4', '7'].forEach((s, k) => { o['tx' + (5 + k)] = { p: [-2.5, Y + 0.1, (k * 3 - 3) * 0.6], bill: 1, str: s, s: 0.15, c: 'navy' }; });
        o.w2 = { segs, c: 'navy', lw: 1, alpha: 0.8 };
        ['navy', 'teal', 'orange', 'verm', 'white'].forEach((c, i) => { o['t' + i] = { p: [2.6, Y + 0.01, -1.6 + i * 0.35], r: FLOOR, shape: 'square', w: 0.1, c }; });   // 色の見本
        const dr = [Co(t * 0.6) * 2.2, 1.4 + 0.2 * S(t * 2), S(t * 0.6) * 2.2];   // ドローンと、レーザー
        o.b1 = { p: dr, w: 0.12, g: ['white', '#9a9a9a', '#1b1b1b'] }; o.as0 = { p: [dr[0], dr[1] + 0.12, dr[2]], r: [-PI / 2, 0, t * 8], w: 0.2, c: 'navy' };
        o.w1 = { pts: [dr, top], c: 'verm', lw: 1.4, alpha: 0.9, dash: [3, 3] };
        lane(o, 't', 5, 12, 4.6, 0.4, 0.3, t * 0.05, t * 0.25, (i) => ({ shape: 'tri', w: 0.08, c: ['navy', 'verm', 'teal'][i % 3] }));
        const bs = []; balloon(o, 'b2', 's0', bs, [Co(-t * 0.18 + 1) * 3.2, 1.8 + 0.25 * S(t * 0.7), S(-t * 0.18 + 1) * 3.2]); o.w4 = { segs: bs, c: 'navy', lw: 1, alpha: 0.8 };
        clouds(o, 1, 4, 3.3, 1.2, t);
        range(4).forEach((i) => { const a = ang(i, 4, 0.8 + t * 0.05); o['pk' + i] = { p: [Co(a) * 4.0, Y, S(a) * 4.0], w: 0.5, h: 0.9 + 0.3 * rnd(i + 5), n: 5, c: ['navy', 'verm', 'teal', 'orange'][i], snow: 0.25, seed: i * 3 }; });
        return o;
      }
    }
  ];
};
