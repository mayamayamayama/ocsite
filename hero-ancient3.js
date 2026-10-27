// hero-ancient3.js — 入場画面「古代」のショット 7〜8（hero-ancient.js の続き）
// コンパスで描く「生命の花」から、プラトンの5つの立体が立ち上がる・アルファベット3000年の旅（フェニキア文字 → ギリシャ文字 → ラテン文字）。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-ancient3');

window.OC_HERO_ANC3 = function (K, X, A) {
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp, lerp3, mat, mmul, mv, eul, nrm, lane, eq, spin, hop } = K;
  const { card, BC, RAIN, GOLD, ancRing, PLATO } = X;

  // ===== 7) 生命の花 → メタトロンの立方体 → プラトンの立体 =====
  const F1 = -1.55, RC = 0.5, FC = [[0, 0]].concat(range(6).map((k) => [Co((k * PI) / 3) * RC, S((k * PI) / 3) * RC]), range(6).map((k) => [Co((k * PI) / 3 + PI / 6) * RC * Math.sqrt(3), S((k * PI) / 3 + PI / 6) * RC * Math.sqrt(3)]), range(6).map((k) => [Co((k * PI) / 3) * RC * 2, S((k * PI) / 3) * RC * 2]));
  const FT = (k) => 0.25 + k * 0.088, FD = 0.17;   // 円 k を描き始める時間・かかる時間
  const MET = []; const M13 = [0, 1, 2, 3, 4, 5, 6, 13, 14, 15, 16, 17, 18]; M13.forEach((a, i) => M13.forEach((b, j) => { if (j > i) MET.push([FC[a], FC[b]]); }));   // 13個の中心を、全部つなぐ（78本）
  const SOL = [{ k: 'tetra', n: 'FIRE · 4', fc: [GOLD, 'orange', 'verm', '#ffb24d'], e: 'white' }, { k: 'cube', n: 'EARTH · 6', fc: ['teal', '#0d7d7a', '#3fc6c2'], e: 'white' },
    { k: 'octa', n: 'AIR · 8', fc: ['white', '#fff4ea', '#9ad7ff', 'cream'], e: 'navy' }, { k: 'icosa', n: 'WATER · 20', fc: ['blue', '#5c5cff', 'cyan', '#1d1dc0'], e: 'white' }, { k: 'dodeca', n: 'AETHER · 12', fc: ['navy', '#2b3566', '#5c6aa8'], e: 'cyan' }];

  // ===== 8) アルファベット3000年の旅：OC ARCHIVE の文字は、どれもフェニキア文字から生まれた =====
  // フェニキア文字の形（線の集まり。-1〜1 の四角の中）
  const circ = range(25).map((i) => [Co((i / 24) * TAU) * 0.62, S((i / 24) * TAU) * 0.75]);
  const PH = {
    O: [circ], C: [[[-0.5, -0.8], [0.1, 0.8], [0.5, 0.2]]], A: [[[0.6, 0.72], [-0.6, 0.0], [0.6, -0.72]], [[-0.12, 0.85], [0.28, -0.9]]],
    R: [[[0.35, 0.85], [0.35, -0.9]], [[0.35, 0.85], [-0.4, 0.62], [-0.45, 0.15], [0.35, 0.05]]], H: [[[-0.45, 0.85], [-0.45, -0.85]], [[0.45, 0.85], [0.45, -0.85]], [[-0.45, 0.32], [0.45, 0.4]], [[-0.45, -0.2], [0.45, -0.12]]],
    I: [[[-0.4, 0.75], [0.35, 0.75], [-0.25, 0.1], [0.42, 0.1]], [[-0.25, 0.1], [0.12, -0.85]]], V: [[[-0.5, 0.78], [0, 0.12], [0.5, 0.78]], [[0, 0.12], [0, -0.88]]],
    E: [[[0.42, 0.85], [0.42, -0.9]], [[0.42, 0.85], [-0.48, 0.68]], [[0.42, 0.3], [-0.48, 0.13]], [[0.42, -0.25], [-0.48, -0.42]]]
  };
  const GR = { O: 'Ο', C: 'Γ', A: 'Α', R: 'Ρ', H: 'Η', I: 'Ι', V: 'Υ', E: 'Ε' };
  const WORD = [['O', 0, 1.25], ['C', 1, 1.25], ['A', 0, 0.55], ['R', 1, 0.55], ['C', 2, 0.55], ['H', 3, 0.55], ['I', 4, 0.55], ['V', 5, 0.55], ['E', 6, 0.55]];
  WORD.forEach((w, k) => { w.push(k < 2 ? (w[1] - 0.5) * 0.46 : (w[1] - 3) * 0.46); });   // 横の位置
  const TLC = ['cream', 'peach', 'white', 'cream', 'peach', 'white', 'cream', 'peach', 'white'];
  const ERA = [['1050 BC', 'PHOENICIAN'], ['800 BC', 'GREEK'], ['700 BC', 'ETRUSCAN'], ['100 BC', 'LATIN'], ['2026', 'OC ARCHIVE']];

  return [
    { // 7) コンパスが19個の円を描いて「生命の花」→ 中心を全部つなぐと「メタトロンの立方体」→ そこからプラトンの5つの立体が、面を集めながら立ち上がる
      name: 'PLATONIC', bg: 'pink', sel: 's31',
      cam: (tb, t) => ({ pitch: 0.95 - 0.55 * io(cl((tb - 1.9) / 1.6)) + 0.05 * S(t * 0.4), dist: 10.2, zoom: 1.15, t: [0, -1.0 + 0.85 * io(cl((tb - 1.9) / 1.6)), 0] }),
      act: (t, tb) => {
        const o = {}, Pf = (x, z, y = 0) => [x, F1 + y, z];
        let cur = -1;
        FC.forEach(([cx, cz], k) => { const u = cl((tb - FT(k)) / FD); if (u <= 0) return; cur = k; const n = Math.max(2, Math.ceil(u * 48)), a0 = k * 0.7;
          o['ln' + k] = { pts: range(n + 1).map((i) => { const a = a0 + (i / 48) * TAU * Math.min(1, u); return Pf(cx + Co(a) * RC, cz + S(a) * RC, 0.002); }), c: 'white', lw: 1.6, alpha: 0.95, zp: Pf(0, 0), z: -40 }; });
        o.ln19 = { pts: range(97).map((i) => Pf(Co((i / 96) * TAU) * RC * 3, S((i / 96) * TAU) * RC * 3, 0.002)), c: 'white', lw: 2.5, alpha: 0.9 * cl(tb / 0.4), zp: Pf(0, 0), z: -41 };
        if (cur >= 0 && tb < FT(18) + FD + 0.15) {   // コンパス：針・鉛筆・2本の脚
          const [cx, cz] = FC[cur], u = cl((tb - FT(cur)) / FD), a = cur * 0.7 + u * TAU, pen = Pf(cx + Co(a) * RC, cz + S(a) * RC, 0.01), nd = Pf(cx, cz, 0.01), hg = Pf(cx + Co(a) * RC * 0.5, cz + S(a) * RC * 0.5, 0.75);
          o.ln20 = { pts: [nd, hg, pen], c: 'navy', lw: 3, alpha: 1, cap: 'round', zp: hg, z: 2 }; o.b0 = { p: hg, w: 0.07, g: BC[6], zp: hg, z: 2.1 }; o.gw0 = { p: pen, w: 0.16, c: 'white', c2: 'pink', alpha: 0.9 };
        }
        const mt = cl((tb - 1.95) / 0.5); if (mt > 0) o.ln21 = { segs: MET.slice(0, Math.ceil(mt * MET.length)).map(([p, q]) => [Pf(p[0], p[1], 0.004), Pf(q[0], q[1], 0.004)]), c: 'navy', lw: 1, alpha: 0.75, zp: Pf(0, 0), z: -39 };
        SOL.forEach((s, i) => {   // 立体：床の円の中心から、面を集めながら立ち上がる
          const t0 = 2.25 + i * 0.16, u = io(cl((tb - t0) / 0.9)); if (tb < t0) return;
          const a = ang(i, 5, PI / 2 + t * 0.25), R = 1.55, home = Pf(FC[1 + ((i * 2) % 6)][0], FC[1 + ((i * 2) % 6)][1], 0.05), top = [Co(a) * R, F1 + 1.35 + 0.12 * S(t * 1.6 + i), S(a) * R];
          const br = Math.pow(Math.max(0, S((tb - 3.9 - i * 0.1) * 2.2)), 6) * cl(tb - 3.9);
          o['so' + i] = { p: lerp3(home, top, u), r: [t * 0.7 + i, t * 0.9 + i * 2, 0], V: PLATO[s.k].V.map((v) => v.map((x) => x * 0.5)), F: PLATO[s.k].F, fc: s.fc, edge: s.e, elw: 1.3, ex: 0.9 * (1 - u) + 0.28 * br };
          o['ln' + (22 + i)] = { pts: [home, lerp3(home, top, u)], c: 'white', lw: 1, alpha: 0.6 * u, dash: [3, 4], doff: -t * 20, zp: home, z: -1 };
          o['tx' + i] = { p: add(lerp3(home, top, u), [0, -0.62, 0]), str: s.n, s: 0.1, c: 'navy', alpha: 0.9 * u };
        });
        o.so5 = { p: [0, F1 + 1.3, 0], r: [t * 0.15, -t * 0.2, 0.3], V: PLATO.dodeca.V.map((v) => v.map((x) => x * 2.5)), F: PLATO.dodeca.F, c: 'white', wire: 1, two: 1, edge: 'white', elw: 1, alpha: 0.55 * cl((tb - 2.6) / 0.8), z: -30 };   // 宇宙＝正十二面体
        o.tx5 = { p: [0, F1 + 2.75, 0], str: 'TIMAEUS · PLATO · c. 360 BC', s: 0.14, c: 'navy' };
        o.tx6 = { p: [0, F1 + 2.5, 0], str: tb < 1.95 ? 'FLOWER OF LIFE · ' + Math.max(0, cur + 1) + ' / 19' : tb < 2.5 ? "METATRON'S CUBE · 78 LINES" : 'V − E + F = 2', s: 0.1, c: 'navy' };
        o.s31 = Object.assign({ p: [2.6, -0.6, 1.8], r: [0.4, t * 0.5, 0.2], bw: 0.3, bh: 0.3, bd: 0.3 }, K.bc('teal'));
        ancRing(o, t, 4.3, 0.5, 'navy', 0.3);
        spin(o, 0, 10, 3.6, -2.0, t, t * 0.15, 0.28, 0.25);
        hop(o, 1, 10, 3.2, -2.2, t, 0.45, -t * 0.2, 0.13);
        lane(o, 't', 0, 14, 4.9, 2.3, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, F1 - 0.01, 0], r: FLOOR, c: 'navy', alpha: 0.3 }; o.r0 = { p: [0, F1, 0], r: FLOOR, w: 3.2, c: 'navy', alpha: 0.4 };
        return o;
      }
    },
    { // 8) 文字の石板が9枚。くるっと裏返るたびに、文字が「フェニキア → ギリシャ → ラテン」と、3000年分進化する
      name: 'ARCHEION', bg: 'blue', sel: 's31',
      cam: (tb, t) => ({ pitch: 0.1 + 0.06 * S(t * 0.4), dist: 10.2, zoom: 1.18, t: [0, 0.6, 0], tilt: 0.6 }),
      act: (t, tb) => {
        const o = {}, C = [0, 0, 0], cd = card(t, C, 0.28, 0.4, -0.04), segs = [];
        WORD.forEach(([ch, , y, x], k) => {
          const f1 = 1.55 + k * 0.09, f2 = 3.05 + k * 0.09, u1 = io(cl((tb - f1) / 0.42)), u2 = io(cl((tb - f2) / 0.42)), psi = PI * (u1 + u2);
          const drop = 1 - io(cl((tb - 0.15 - k * 0.07) / 0.5)), hopY = 0.12 * (S(PI * u1) + S(PI * u2)), c = cd.P(x, y + hopY + drop * 2.2, 0), M = mmul(cd.M, mat(0, psi, 0));
          o['s' + k] = Object.assign({ p: c, r: eul(M), bw: 0.4, bh: 0.56, bd: 0.08 }, K.bc(TLC[k]));
          const front = Co(psi) > 0, stage = front ? (tb < f2 + 0.21 ? 0 : 2) : 1, Mf = front ? M : mmul(M, mat(0, PI, 0)), F = (lx, ly) => add(c, mv(Mf, [lx * 0.15, ly * 0.2, 0.045]));
          if (stage === 0) PH[ch].forEach((st) => { for (let i = 0; i < st.length - 1; i++) segs.push([F(st[i][0], st[i][1]), F(st[i + 1][0], st[i + 1][1])]); });
          else o['ty' + k] = { p: add(c, mv(Mf, [0, -0.01, 0.042])), r: eul(Mf), str: stage === 1 ? GR[ch] : ch, s: 0.42, ext: 0.03, z: 0.01, c: stage === 1 ? 'verm' : 'navy', c2: stage === 1 ? '#b83a12' : '#2a2aff' };
        });
        if (segs.length) o.ln0 = { segs, c: 'navy', lw: 3.2, alpha: 1, cap: 'round', zp: cd.P(0, 0.9, 0.1), z: 1 };
        const era = tb < 1.75 ? 0 : tb < 2.6 ? 1 : tb < 3.25 ? 2 : tb < 4.2 ? 3 : 4, sc = cl((tb - 0.3) / 1.2);   // 年表の巻物
        const scroll = range(61).map((i) => { const u = i / 60; return cd.P(-2.3 + u * 4.6 * sc, -0.35 + 0.05 * S(u * 9 + t * 2), 0.25 + 0.12 * S(u * 6 - t)); });
        o.rb0 = { pts: scroll, w: 0.13, face: 1, cs: ['#fff4ea', '#ffe1d2', GOLD, '#ff9ad5'], rep: 3, zp: cd.P(0, -0.35, 0.3), z: 1 };
        ERA.forEach(([yr, nm], k) => { const on = k === era, x = -1.84 + k * 0.92; if (x > -2.3 + 4.6 * sc) return; o['hr' + k] = { p: cd.P(x, -0.66, 0.3), str: yr, s: on ? 0.13 : 0.09, c: on ? 'white' : 'cream', alpha: on ? 1 : 0.6 }; o['hr' + (5 + k)] = { p: cd.P(x, -0.84, 0.3), str: nm, s: on ? 0.09 : 0.065, c: on ? GOLD : 'cream', alpha: on ? 1 : 0.6 }; });
        const mk = cd.P(-1.84 + era * 0.92, -0.35, 0.33); o.b0 = { p: mk, w: 0.08, g: BC[1] }; o.gw0 = { p: mk, w: 0.3, c: 'white', c2: GOLD, alpha: 0.6 };
        const sw = cl((tb - 4.25) / 0.8); if (sw > 0 && sw < 1) [1.25, 0.55].forEach((y, n) => { o['gw' + (1 + n)] = { p: cd.P(-1.7 + 3.4 * io(sw), y, 0.2), w: 0.55, c: 'white', c2: GOLD, alpha: 0.75 * S(PI * sw), mode: 'screen', z: 2 }; });   // 最後に、光が文字の上をなでる
        const st = cd.P(0, 0.85, -0.55); o.so12 = { p: st, r: cd.rr, V: [[-1.9, -1.0, -0.08], [1.9, -1.0, -0.08], [1.75, 1.15, -0.08], [-1.75, 1.15, -0.08], [-1.9, -1.0, 0.08], [1.9, -1.0, 0.08], [1.75, 1.15, 0.08], [-1.75, 1.15, 0.08]], F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]], c: 'navy', alpha: 0.85, edge: '#5c6aa8', z: -5 };   // 後ろの石碑
        const rl = []; range(3).forEach((band) => range(9).forEach((r) => { const y = 0.95 - band * 0.72 - r * 0.065, off = fr(t * (0.05 + band * 0.03)) * 0.3; for (let x = -1.65 + off; x < 1.55; x += 0.3) { const w = 0.06 + 0.15 * rnd(Math.floor(x * 13) + r * 7 + band * 31); rl.push([cd.P(x, y + 0.85, -0.46), cd.P(Math.min(1.6, x + w), y + 0.85, -0.46)]); } }));
        o.ln1 = { segs: rl, c: '#9ad7ff', lw: 1.3, alpha: 0.55, zp: st, z: -4.5 };
        o.tx0 = { p: cd.P(0, 2.2, 0.1), str: tb < 4.3 ? 'ALPHABET · 3000 YEARS' : 'ΑΡΧΕΙΟΝ → ARCHIVE', s: 0.16, c: 'white' };
        o.tx1 = { p: cd.P(0, 1.95, 0.1), str: tb < 4.3 ? 'ALEPH = OX · HETH = FENCE · WAW = HOOK' : '"THE HOUSE OF RECORDS"', s: 0.09, c: GOLD };
        o.s31 = Object.assign({ p: [-2.6, 2.3, -1.0], r: [0.3, t * 0.5, 0.4], bw: 0.3, bh: 0.3, bd: 0.3 }, K.bc('orange'));
        ancRing(o, t, 4.2, 0.6, 'cream', 0.3);
        spin(o, 0, 10, 3.8, -1.7, t, t * 0.15, 0.28, 0.25);
        eq(o, 12, 16, 4.3, -2.3, t, 1.1, 0.2, 0.34, t * 0.05);
        lane(o, 't', 0, 14, 4.9, 2.5, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, -2.3, 0], r: FLOOR, c: 'cream', alpha: 0.3 }; o.r1 = { p: [0, -2.3, 0], r: FLOOR, w: 3.6, c: 'cream', alpha: 0.45 };
        return o;
      }
    }
  ];
};
