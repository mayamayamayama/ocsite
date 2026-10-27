// hero-game.js — 入場画面の別バージョン「ゲーム」：ドット絵と、ショット 1〜3（4〜6 は hero-game2.js）
// ゲームを「画面」ではなく、ドット・ブロック・照準・リズム・グリッチの動きとして見せるモーショングラフィックス。
// ドット絵はぜんぶ、このサイトのためのオリジナルです。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-game');

(window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).game = function (cfg) {
  const K = window.OC_HERO_KIT(cfg);
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, mat, mv, eul, lane, floorRing, eq, spin, hop, orb } = K;

  // ===== ドット絵（'.' は透明） =====
  const SPR = {
    hero: ['...aa.....', '....a.....', '..bbbbbb..', '.bbbbbbbb.', '.bwkbbwkb.', '.bwkbbwkb.', '.bcbbbbcb.', '..bbbbbb..', '..d....d..', '.dd....dd.'],
    heart: ['.rr.rr.', 'rrrrrrr', 'rrwrrrr', '.rrrrr.', '..rrr..', '...r...'],
    star: ['...y...', '..yyy..', 'yyyyyyy', '.yyyyy.', '..yyy..', '.yy.yy.', 'y.....y'],
    gem: ['..ggg..', '.gwggg.', 'gwggggg', 'ggggggg', '.ggggg.', '..ggg..', '...g...'],
    coin: ['.yyyy.', 'yywyyy', 'ywyyoy', 'ywyyoy', 'ywyyoy', 'yyyyyy', '.yyyy.'],
    jelly: ['...ppp...', '.ppppppp.', 'ppwkpwkpp', 'ppppppppp', '.p.p.p.p.', 'p.p.p.p.p'],
    horn: ['y.......y', 'yy.....yy', '.yyyyyyy.', 'yyywwwyyy', 'yyywkwyyy', '.yyyyyyy.', '..y.y.y..'],
    bot: ['.ccccccc.', 'cc.ccc.cc', 'ccccccccc', 'c.c.c.c.c', '.ccccccc.', '..c...c..'],
    slime: ['..ssss..', '.ssssss.', 'sswwssss', 'swkkwsss', 'swkkwsss', 'ssssssss', '.s.ss.s.'],
    key: ['.yyy.....', 'y...y....', 'y...yyyyy', 'y...y.y.y', '.yyy.....'],
    bolt: ['...oo', '..oo.', '.oooo', 'oooo.', '..oo.', '.oo..', 'oo...']
  };
  const PAL = { a: 'cream', b: 'verm', w: 'white', k: 'navy', c: 'cyan', d: 'navy', r: 'verm', y: '#ffd27a', o: 'orange', g: 'teal', p: 'pink', s: 'teal' };
  const ITEMS = ['heart', 'star', 'gem', 'coin', 'key', 'bolt', 'slime', 'jelly'];

  // ===== 物体の一覧 =====
  const A = K.roster({});
  K.pool(A, 'v', 64, (i) => Object.assign({ type: 'box', bw: 0.3, bh: 0.3, bd: 0.3 }, K.bc(['verm', 'orange', 'teal', 'cream', 'blue', 'pink', 'navy'][i % 7])));   // ブロック
  K.pool(A, 'px', 32, (i) => ({ type: 'pixel', bits: SPR[ITEMS[i % 8]], pal: PAL, w: 0.4, bill: 1, ext: 0.06, c2: 'navy' }));   // ドット絵
  const TET = [[[0, 0], [1, 0], [2, 0], [3, 0]], [[0, 0], [1, 0], [2, 0], [1, 1]], [[0, 0], [1, 0], [1, 1], [2, 1]], [[0, 0], [1, 0], [2, 0], [2, 1]], [[0, 0], [1, 0], [0, 1], [1, 1]], [[1, 0], [2, 0], [0, 1], [1, 1]], [[0, 0], [1, 0], [2, 0], [0, 1]]];
  const PC = ['verm', 'orange', 'teal', 'blue', 'pink', 'cream', 'navy'];
  // ブロック4つのピースを、行列 M の向きで置く
  const piece = (o, from, k, C, M, cs, col) => { const T = TET[k % 7], mx = T.reduce((a, q) => a + q[0], 0) / 4, my = T.reduce((a, q) => a + q[1], 0) / 4, r = eul(M);
    T.forEach(([x, y], i) => { o['v' + (from + i)] = Object.assign({ p: add(C, mv(M, [(x - mx) * cs, (y - my) * cs, 0])), r, bw: cs * 0.94, bh: cs * 0.94, bd: cs * 0.94 }, K.bc(col)); }); };
  const X = { SPR, PAL, ITEMS, TET, PC, piece };

  const shots = [
    { // 1) ボクセルの波：7×7のブロックが、波紋のように上下する（高さで色が変わる）。その上を銀の玉がはねる
      name: 'VOXEL', bg: 'navy', sel: 'chrome0',
      cam: (tb, t) => ({ pitch: 0.32 + 0.1 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, -0.4, 0] }),
      act: (t) => {
        const o = {}, F = -2.2, N = 7, CS = 0.6, VC = ['navy', 'blue', 'teal', 'cream', 'orange', 'verm'];
        const hAt = (x, z) => { const d = Math.hypot(x, z); return 0.2 + 1.6 * (0.5 + 0.5 * S(d * 1.5 - t * 2.6)) * (1 - (d / 3.6) * 0.45); };
        range(N * N).forEach((q) => { const x = ((q % N) - 3) * CS, z = (Math.floor(q / N) - 3) * CS, h = hAt(x, z);
          o['v' + q] = Object.assign({ p: [x, F + h / 2, z], bw: CS * 0.9, bh: h, bd: CS * 0.9 }, K.bc(VC[Math.min(5, Math.floor(h / 0.29))])); });
        const bx = 1.2 * S(t * 0.7), bz = 1.2 * S(t * 0.53 + 1); o.chrome0 = { p: [bx, F + hAt(bx, bz) + 0.25 + Math.abs(S(t * 4)) * 0.9, bz], w: 0.24 };
        range(4).forEach((k) => { const a = ang(k, 4, t * 0.25); o['px' + k] = { p: [Co(a) * 2.7, 1.2 + 0.2 * S(t * 1.5 + k), S(a) * 2.3], w: 0.55, ext: 0.1 }; });
        range(6).forEach((k) => { const a = ang(k, 6, -t * 0.15); o['st' + k] = { p: [Co(a) * 3.3, 2.3, S(a) * 3.3], r: [0, PI / 2 - a, 0], w: 3.2, h: 0.2 }; });
        spin(o, 0, 12, 4.15, -0.3, t, t * 0.12, 0.26, 0.25);
        eq(o, 0, 16, 4.7, F, t, 1.0, 0.16, 0.36, -t * 0.05, 3.0);
        hop(o, 0, 10, 3.6, F + 0.12, t, 0.6, t * 0.2, 0.15);
        lane(o, 't', 0, 12, 4.9, 1.0, 0.4, t * 0.04, t * 0.22, () => ({ w: 0.16 }));
        o.frames0 = { p: [0, F, 0], r: FLOOR, w: 4.8, h: 4.8, n: 3, c: 'cyan', alpha: 0.6 }; o.dots0 = { p: [0, F - 0.01, 0], r: FLOOR, c: 'cyan', alpha: 0.4 };
        o.r0 = { p: [0, F, 0], r: FLOOR, w: 4.3, c: 'pink', alpha: 0.5 }; o.r1 = { p: [0, 1.0, 0], r: [-PI / 2 + 0.3, t * 0.2, 0], w: 3.0, c: 'cream', alpha: 0.4 };
        o.ty0 = { p: [0, 2.45, 0], bill: 0.8, str: '1UP', s: 0.55, ext: 0.12, c: 'pink', c2: 'navy' };
        o.tx0 = { p: [0, 2.0, 0], str: 'SCORE ' + String(4200 + Math.floor(t * 3) * 10).padStart(6, '0') + '   STAGE 1-1', s: 0.12, c: 'cream' };
        o.holo1 = { p: [Co(-t * 0.5) * 3.0, 0.4, S(-t * 0.5) * 3.0], r: [0.2, t * 0.5, 0.2], bw: 1.2 };
        return o;
      }
    },
    { // 2) 照準：何重もの輪のメーターが、別々に回る。体力のゲージ、ロックオンの枠、コンボの数字
      name: 'HUD', bg: 'teal', sel: 'chrome0',
      cam: (tb, t) => ({ pitch: 0.18 + 0.08 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, 0.3, 0] }),
      act: (t) => {
        const o = {}, F = -2.3, C = [0, 0.35, 0], RC = ['cream', 'navy', 'orange', 'cream'];
        range(4).forEach((k) => { const n = 8, rotk = t * (0.4 + k * 0.15) * (k % 2 ? -1 : 1) + k, ro = 0.75 + k * 0.42, hi = Math.floor(t * 3 + k * 2) % n;
          range(n).forEach((q) => { const a0 = rotk + (q * TAU) / n; o['sc' + (k * n + q)] = { p: C, bill: 0.8, r: [0.25 * k - 0.4, 0.3 * k, 0], scr: [0, 0, (k - 1.5) * 0.35], a0, a1: a0 + TAU / n - 0.08 - k * 0.02, ro, ri: ro - 0.13 + k * 0.01, c: q === hi ? 'verm' : RC[k], ext: k === 2 ? 0.3 : 0, alpha: q === hi ? 1 : 0.9 }; }); });
        o.chrome0 = { p: C, w: 0.38 }; o.glass0 = { p: C, w: 0.95, z: 3 };
        range(4).forEach((k) => { const a = (k * PI) / 2 + t * 0.3; o['fl' + k] = { p: C, bill: 1, scr: [Co(a) * 0.55, S(a) * 0.55, 1.0], r: [0, 0, a + PI / 2], shape: 'square', w: 0.17, sx: 0.12, c: 'white' }; });   // 照準の十字
        const hp = 7 + Math.round(3 * S(t * 0.6));   // 体力ゲージ
        range(12).forEach((k) => { const a = -PI * 0.78 + (k / 11) * PI * 0.56; o['s' + (20 + k)] = Object.assign({ p: C, bill: 1, scr: [Co(a) * 2.25, S(a) * 2.25, 0.2], r: [0, 0, a + PI / 2], bw: 0.26, bh: 0.12, bd: 0.12 }, K.bc(k < hp ? (k < 3 ? 'verm' : 'cream') : 'navy')); });
        o.tx0 = { p: C, scr: [0, -2.62, 0.2], str: 'HP ' + hp * 8 + ' / 96', s: 0.12, c: 'cream' };
        range(3).forEach((k) => { const q = orb(2.9, t * (0.5 + k * 0.2) + k * 2.1, 0.5 - k * 0.4, k), lock = Math.floor(t * 1.2) % 3 === k;   // ロックオン
          o['c' + k] = { p: q, r: [0, t * 2 + k, 0], w: 0.22, d: 0.08, bull: 'cream' };
          o['fl' + (4 + k)] = { p: q, bill: 1, shape: 'square', w: lock ? 0.36 : 0.3 + 0.03 * S(t * 8), c: lock ? 'verm' : 'cream', ring: lock ? 2.5 : 1.2, r: [0, 0, lock ? t * 2 : PI / 4] };
          o['tx' + (1 + k)] = { p: q, scr: [0.45, 0.4, 0], str: lock ? 'LOCK' : 'T-0' + (k + 1), s: 0.09, c: lock ? 'verm' : 'cream' }; });
        o.ty0 = { p: C, scr: [2.0, 1.25, 0.3], bill: 0.8, str: 'x' + (12 + Math.floor(t * 2) % 40), s: 0.5, ext: 0.12, c: 'cream', c2: 'navy' };
        o.tx4 = { p: C, scr: [2.0, 0.88, 0.3], str: 'COMBO', s: 0.1, c: 'navy' };
        range(3).forEach((k) => { o['r' + k] = { p: [0, F + 0.01 + k * 0.004, 0], r: FLOOR, w: 1.6 + k * 1.2, c: ['cream', 'navy', 'cream'][k], lw: 1.2, alpha: 0.55 }; });
        eq(o, 0, 18, 4.3, F, t, 1.1, 0.14, 0.34, t * 0.06, 2.4);
        hop(o, 0, 10, 3.5, F + 0.12, t, 0.7, -t * 0.25, 0.16);
        spin(o, 3, 8, 4.0, 1.8, t, -t * 0.2, 0.24, 0.2);
        lane(o, 't', 0, 14, 4.9, 0.3, 0.45, -t * 0.04, -t * 0.2, () => ({ w: 0.16 }));
        floorRing(o, 't', 14, 12, 2.6, F + 0.02, t * 0.1, () => ({ w: 0.2 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.45 };
        o.spring1 = { p: [0, F + 0.8, 0], r: FLOOR, w: 0.3, L: 1.6, n: 12, c: 'cream' }; o.aster1 = { p: [0, 2.9, 0], bill: 1, r: [0, 0, t] };
        o.holo0 = { p: [Co(t * 0.4) * 3.4, -0.8, S(t * 0.4) * 3.4], r: [0.2, -t * 0.4, 0.2], bw: 1.4 };
        return o;
      }
    },
    { // 3) 落ちものピース：4つのブロックのピースが、らせんを描いて回りながら降ってくる。真ん中では大きなピースが転がる
      name: 'TETRA', bg: 'cream', sel: 'v32',
      cam: (tb, t) => ({ pitch: 0.2 + 0.08 * S(t * 0.45), dist: 11.5, zoom: 1, t: [0, 0.1, 0] }),
      act: (t) => {
        const o = {}, F = -2.3;
        range(8).forEach((k) => { const u = fr(t * 0.09 + k / 8), a = u * TAU * 1.4 + k * 0.8, R = 2.35 + 0.3 * S(k * 2), C = [Co(a) * R, 2.8 - u * 5.0, S(a) * R];
          piece(o, k * 4, k, C, mat(t * 0.9 + k, t * 0.7 + k * 2, t * 0.5 + k), 0.3, PC[k % 7]); });
        piece(o, 32, 1, [0, 0.2, 0], mat(t * 0.5, t * 0.8, t * 0.3), 0.62, 'navy');
        o.glass0 = { p: [0, 0.2, 0], w: 1.6, z: 3 };
        const rows = [[0, 1, 2, 3, 4, 5, 6, 7], [0, 1, 3, 4, 6, 7], [1, 2, 5]];   // 床に積まれたブロック（下の列が光る）
        let n = 36; rows.forEach((row, j) => row.forEach((i) => { if (n > 63) return; const a = ang(i, 8, t * 0.05); o['v' + n++] = Object.assign({ p: [Co(a) * 1.25, F + 0.17 + j * 0.34, S(a) * 1.25], r: [0, -a, 0], bw: 0.32, bh: 0.32, bd: 0.32 }, K.bc(j === 0 && Math.floor(t * 6) % 2 ? 'white' : PC[(i + j * 3) % 7])); }));
        range(4).forEach((k) => { const a = ang(k, 4, -t * 0.25); o['st' + k] = { p: [Co(a) * 1.9, F + 0.01, S(a) * 1.9], r: [-PI / 2, 0, -a + PI / 2], w: 1.6, h: 0.22 }; });
        o.spring0 = { p: [0, 0.3, 0], r: FLOOR, w: 1.0, L: 5.6, n: 20, c: 'navy', alpha: 0.35 };
        range(4).forEach((k) => { o['r' + k] = { p: [0, F + 1.2 * k + 0.3, 0], r: [-PI / 2 + 0.15 * S(t + k), t * 0.3, 0], w: 3.0 - k * 0.2, c: k % 2 ? 'verm' : 'navy', alpha: 0.45 }; });
        eq(o, 0, 16, 4.4, F, t, 1.2, 0.2, 0.4, t * 0.05);
        spin(o, 0, 8, 3.8, 2.4, t, -t * 0.15, 0.28);
        hop(o, 0, 8, 3.1, F + 0.12, t, 0.55, t * 0.3, 0.16);
        lane(o, 't', 0, 12, 4.9, 0.4, 0.35, t * 0.03, -t * 0.2, () => ({ w: 0.17 }));
        floorRing(o, 't', 12, 12, 3.4, F + 0.02, -t * 0.08, () => ({ w: 0.22 }));
        o.dots0 = { p: [0, F, 0], r: FLOOR, c: 'navy', alpha: 0.45 }; o.frames0 = { p: [0, F, 0], r: FLOOR, w: 4.2, h: 4.2, n: 2, c: 'navy', alpha: 0.5 };
        o.tx0 = { p: [0, 3.25, 0], str: 'LINES ' + String(42 + Math.floor(t * 0.5)).padStart(3, '0') + ' · LEVEL 07', s: 0.13, c: 'navy' };
        if (Math.floor(t * 6) % 2) o.tx1 = { p: [0, F + 1.3, 0], scr: [0, 0, 1.6], str: 'LINE CLEAR', s: 0.16, c: 'verm' };
        o.aster0 = { p: [0, 2.85, 0], bill: 1, r: [0, 0, t * 0.6], w: 0.35 };
        return o;
      }
    }
  ];
  return { shots: shots.concat(typeof window.OC_HERO_GAME2 === 'function' ? window.OC_HERO_GAME2(K, X) : []), actors: A };
};
