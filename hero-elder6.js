// hero-elder6.js — 入場画面「未知の古代」のショット 7（hero-elder.js の続き）
// 7) ナスカの地上絵（暗い大地に、ハチドリとクモが一筆書きで描かれ、調査の線と文字が重なる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder6');

window.OC_ELDER6 = function (E) {
  const { K, grow, neon, garnish, GL } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, camYaw } = K;
  const F = -2.3, BOXF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const ARC = (cx, cy, r, n = 20, a0 = 0, a1 = TAU) => range(n + 1).map((i) => [cx + Co(a0 + ((a1 - a0) * i) / n) * r, cy + S(a0 + ((a1 - a0) * i) / n) * r]);
  // ===== 7) ナスカの地上絵（ペルー、紀元前500年〜紀元500年ごろ）。どれも、交わらない1本の線で描かれている =====
  // ハチドリ（93 m）：長く細いくちばし・5本と4本の羽根（左右で少しちがう）・3本のつめの足・長い尾羽。右半分を作り、左は写して、1本につなぐ
  const bHalf = (tips, wa) => { const P = [[0, 4.6], [0.05, 2.06]].concat(range(9).map((i) => { const a = 1.4 - (i / 8) * 2.25; return [Co(a) * 0.33, 1.75 + S(a) * 0.33]; }), [[0.22, 1.36]]), W = [[0.36, 1.15]];
    tips.forEach((x1, k) => { const yc = 1.04 - k * 0.27; if (k) W.push([1.85, yc + 0.1]); W.push([x1 - 0.1, yc + 0.1], ...ARC(x1 - 0.1, yc, 0.1, 6, PI / 2, -PI / 2), [1.85, yc - 0.1]); });
    W.push([0.42, 0.28]); const ca = Co(wa), sa = S(wa); W.forEach(([x, y]) => P.push([0.38 + (x - 0.38) * ca - (y - 0.7) * sa, 0.7 + (x - 0.38) * sa + (y - 0.7) * ca]));
    return P.concat([[0.44, -0.1], [0.38, -0.8], [0.3, -1.22], [0.72, -1.6], [0.98, -1.5], [0.8, -1.7], [1.04, -1.78], [0.8, -1.82], [0.95, -2.02], [0.62, -1.8], [0.26, -1.5], [0.24, -1.62], [0.78, -3.2]], ARC(0.7, -3.24, 0.09, 6, -0.4, -0.4 - PI).slice(1),
      [[0.16, -1.86], [0.42, -3.55]], ARC(0.34, -3.55, 0.08, 6, 0, -PI).slice(1), [[0.08, -1.98], [0.16, -4.95]], ARC(0.09, -4.95, 0.07, 6, 0, -PI).slice(1), [[0, -2.2]]); };
  const BIRD = bHalf([3.15, 3.35, 3.4, 3.3, 3.05], -0.06).map(([u, v]) => [-u, v]).concat(bHalf([3.2, 3.4, 3.35, 3.1], 0.07).reverse());
  // クモ（47 m）：頭胸部・腹・8本の脚。右の1本だけ長くのびる
  const leg = (C, w = 0.045) => { const N = C.map((_, i) => { const a = C[Math.max(0, i - 1)], b = C[Math.min(C.length - 1, i + 1)], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return [-(b[1] - a[1]) / L, (b[0] - a[0]) / L]; }), off = (s) => C.slice(0, -1).map((c, i) => [c[0] + N[i][0] * w * s, c[1] + N[i][1] * w * s]); return off(1).concat([C[C.length - 1]], off(-1).reverse()); };
  const sHalf = (ext) => [[0, 0.87], [0.14, 0.85]].concat(...[[[0.2, 0.78], [0.72, 1.35], [0.86, 2.1]], [[0.26, 0.66], [1, 0.98], [1.45, 1.55]], ext ? [[0.27, 0.5], [1.05, 0.32], [1.6, -0.4], [1.95, -0.95], [2.1, -1]] : [[0.27, 0.5], [1.05, 0.32], [1.5, -0.25]], [[0.22, 0.37], [0.8, -0.2], [0.95, -1.05]]].map((c) => leg(c)),
    [[0.12, 0.25], [0.06, 0.16]], range(13).map((i) => { const a = 0.35 + (i * (PI - 0.35)) / 12; return [S(a) * 0.42, -0.45 + Co(a) * 0.6]; }));
  const SPID = sHalf(true).concat(sHalf(false).map(([u, v]) => [-u, v]).reverse()); SPID.push(SPID[0]);
  const walk = (P) => { const C = [0]; for (let i = 1; i < P.length; i++) C.push(C[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return (f) => { const L = cl(f) * C[C.length - 1]; let i = 1; while (i < C.length - 1 && C[i] < L) i++; const k = (L - C[i - 1]) / (C[i] - C[i - 1] || 1); return [P[i - 1][0] + (P[i][0] - P[i - 1][0]) * k, P[i - 1][1] + (P[i][1] - P[i - 1][1]) * k]; }; };
  // 大地の向き：カメラの動きに少し遅れてついていく（ハチドリのくちばしが、だいたい画面の上を向く）。u：画面の右、v：画面の上
  const YW = (t, tb) => camYaw(t - (tb - 2.6) * 0.5), WD = (Y) => ([u, v], h = 0.012) => [u * Co(Y) - v * S(Y), F + h, -(u * S(Y) + v * Co(Y))];
  const pl = (o, r, k) => ([u, v]) => [o[0] + (u * Co(r) - v * S(r)) * k, o[1] + (u * S(r) + v * Co(r)) * k], pB = pl([0.2, -0.4], 0.35, 0.48), pS = pl([-2.3, 2.6], 0.4, 0.6), bAt = walk(BIRD), sAt = walk(SPID);
  const bf = (tb) => io(cl((tb - 0.45) / 3.2)), sf = (tb) => io(cl((tb - 0.9) / 2.5)), BEAK = pB([0, 3.2]);   // 描く速さ（ハチドリ・クモ）
  const RC = [3.0, -3.3], RAYS = range(12).map((i) => { const a = 1.62 + i * 0.17, L = 6.5 + (i % 3) * 1.5; return [RC, [RC[0] + Co(a) * L, RC[1] + S(a) * L]]; });   // 1点から放射状にのびる直線
  const TRAP = [[[-5.5, -1.2], [-5.3, -1.6], [4.8, -3.6], [4.9, -3.3], [-5.5, -1.2]], [[-1.5, 5.2], [-0.8, 5.4], [1.6, -5.5], [1.2, -5.6], [-1.5, 5.2]]];   // 細長い台形
  const SPI = [[-1.6, -4.5]].concat(range(70).map((i) => { const a = (i / 69) * 2.6 * TAU, r = 0.7 * (1 - i / 74); return [-2.6 + Co(a) * r, -3.5 + S(a) * r]; }));   // うず巻き
  const HID = range(8).map((i) => { const a = (i / 8) * TAU + 0.4, r = 3.9 + rnd(i * 3) * 1.5, c = [Co(a) * r, S(a) * r]; return { y: c[1], L: GL[(i * 5 + 3) % 40].L.map(([p, q]) => [[c[0] + p[0] * 0.3, c[1] - p[1] * 0.3], [c[0] + q[0] * 0.3, c[1] - q[1] * 0.3]]) }; });   // AI の調査で見つかった、まだ知られていない絵
  const PEB = []; range(360).forEach((i) => { const a = rnd(i * 3) * TAU, r = Math.sqrt(rnd(i * 5)) * 6; PEB.push(Co(a) * r, F + 0.01, S(a) * r); });   // 地面の小石
  const GRID = []; for (let k = -6; k <= 6; k++) { const h = Math.sqrt(Math.max(0, 36 - k * k)); GRID.push([[k, -h], [k, h]], [[-h, k], [h, k]]); }   // 測量の方眼
  const SK = (ctx, G, L, col, a, lw = 1) => { ctx.strokeStyle = col; ctx.globalAlpha = a; ctx.lineWidth = lw; ctx.beginPath(); L.forEach((l) => l.forEach((q, i) => { const p = G.proj(q); ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); })); ctx.stroke(); };
  const TX = (ctx, G, s, q, a, sz = 0.11, al = 'left') => { const p = G.proj(q); if (p[2] < 0.3) return; ctx.globalAlpha = a; ctx.textAlign = al; ctx.font = ((G.f * sz) / p[2]).toFixed(1) + 'px ui-monospace, Menlo, monospace'; ctx.fillText(s, p[0], p[1]); };
  const BOX = (g, u0, u1, v0, v1, m = 0.5) => [[[u0 + m, v1], [u0, v1], [u0, v1 - m]], [[u1 - m, v1], [u1, v1], [u1, v1 - m]], [[u1, v0 + m], [u1, v0], [u1 - m, v0]], [[u0, v0 + m], [u0, v0], [u0 + m, v0]]].map((l) => l.map((q) => g(q)));   // 四すみのかぎ

  return [
    { // 7) ナスカの地上絵：夕暮れの大地。地面すれすれから、カメラが空高くのぼっていく。直線と台形が地平線まで走り、2つの光るペン先が、ハチドリとクモを一筆書きで描く。描き終わると、測量の枠と数字が重なり、AI 調査の光が大地をなでて、かくれた絵を見つけていく
      name: 'NAZCA', bg: '#100a08', sel: 'so39',
      cam: (tb, t) => { const e = io(cl(tb / 4.4)), b = WD(YW(t, tb))(BEAK); return { pitch: 0.3 + 0.72 * e, dist: 8.2 + 3.6 * e, zoom: 1, t: [b[0] * (1 - e), F + 0.2 * (1 - e), b[2] * (1 - e)] }; },
      act: (t, tb) => {
        const o = {}, gG = WD(YW(t, tb)), gB = (q, h) => gG(pB(q), h), gS = (q, h) => gG(pS(q), h), f = bf(tb), g = sf(tb), bT = gB(bAt(f), 0.05), sT = gS(sAt(g), 0.05), bd = tb > 0.45 && tb < 3.7, sd = tb > 0.9 && tb < 3.45, out = 1 - cl((tb - 5.2) / 0.5), y = camYaw(t), sy = 6.4 - 12.8 * cl((tb - 3.75) / 1.4);
        o.gw0 = { p: [-S(y) * 9, F + 0.9, -Co(y) * 9], w: 3.6, c: '#ff9a5a', c2: '#401a08', alpha: 0.4, z: -50 };   // 地平線の夕日（いつもカメラの正面）
        o.du1 = { pts: PEB, size: 0.03, max: 1.4, c: '#5a4634', alpha: 0.7 }; o.ln6 = { segs: GRID.map((l) => l.map((q) => gG(q, 0.005))), c: '#8a6a4a', lw: 1, alpha: 0.13, zp: [0, F, 0], z: -40 };
        o.so39 = { p: gG(RC, 0), r: [0, 0.4, 0], V: [[-0.16, 0, -0.12], [0.16, 0, -0.12], [0.16, 0, 0.12], [-0.16, 0, 0.12], [-0.1, 0.16, -0.08], [0.1, 0.16, -0.08], [0.1, 0.16, 0.08], [-0.1, 0.16, 0.08]], F: BOXF, c: '#2a2018', edge: '#8a6a4a', elw: 0.7 };   // 直線が集まる所の石づみ
        o.cx37 = { p: [0, F, 0], z: -30, draw: (ctx, G, ac) => { const al = Math.min(1, ac.s) * out; if (al <= 0) return; const r = cl(tb / 0.9), G3 = (L, gf) => L.map((q) => gf(q));
          const RL = RAYS.concat(TRAP).map((l) => grow(l, r)); neon(ctx, G, RL.map((l) => G3(l, gG)), '#c08a5a', 1, 0.5 * al, '#ecd0a8');   // 直線と台形。先頭は光る
          if (r < 1) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#fff0d0'; RL.forEach((l) => { const p = G.proj(gG(l[l.length - 1])); ctx.globalAlpha = al; ctx.beginPath(); ctx.arc(p[0], p[1], 2.6, 0, TAU); ctx.fill(); }); ctx.restore(); }
          neon(ctx, G, [G3(grow(SPI, cl((tb - 1.1) / 1.8)), gG)], '#7fd8e0', 1.1, 0.75 * al, '#e0fbff');   // うず巻き
          HID.forEach((h) => { const a = cl((h.y - sy) / 0.4) * (0.45 + 0.55 * cl(1 - (h.y - sy) / 2)); if (a > 0) neon(ctx, G, h.L.map((l) => G3(l, gG)), '#6ff0e0', 1, a * al, '#d8fff8'); });   // 調査で見つかる絵
          if (g > 0) { const L = grow(SPID, g); neon(ctx, G, [G3(L, gS)], '#5fd0c8', 1.4, 0.85 * al, '#dafff8'); if (sd) neon(ctx, G, [G3(L.slice(-10), gS)], '#ffffff', 2, al, '#ffffff'); }   // クモ
          if (f > 0) { const L = grow(BIRD, f); neon(ctx, G, [G3(L, gB)], '#ffa040', 1.7, al * (tb > 3.7 ? 0.85 + 0.15 * S(t * 3) : 0.8), '#ffe2b0'); if (bd) neon(ctx, G, [G3(L.slice(-14), gB)], '#ffffff', 2.4, al, '#ffffff'); }   // ハチドリ
          if (tb > 3.65 && tb < 4.4) neon(ctx, G, [G3(grow(BIRD, cl((tb - 3.65) / 0.7)).slice(-24), gB)], '#ffffff', 3, al * (1 - cl((tb - 4.2) / 0.2)), '#ffffff');   // 描き終わりに、光が頭から尾へ走る
          ctx.save(); ctx.fillStyle = '#e8fff8'; ctx.textBaseline = 'middle'; const k1 = cl((tb - 3.75) / 0.4), k2 = cl((tb - 3.5) / 0.4);   // 測量の枠と数字
          if (k1 > 0) { SK(ctx, G, BOX(gB, -3.6, 3.6, -5.1, 4.75), '#bff0e8', 0.75 * k1 * al); SK(ctx, G, [[[4.1, -4.95], [4.1, 4.6]], [[3.9, -4.95], [4.3, -4.95]], [[3.9, 4.6], [4.3, 4.6]]].map((l) => G3(l, gB)), '#bff0e8', 0.6 * k1 * al);
            TX(ctx, G, '93 m', gB([4.35, -0.2]), k1 * al, 0.13); TX(ctx, G, 'COLIBRI / HUMMINGBIRD', gB([-3.6, -5.5]), 0.9 * k1 * al, 0.13); }
          if (k2 > 0) { SK(ctx, G, BOX(gS, -1.6, 2.25, -1.15, 2.25, 0.35), '#bff0e8', 0.7 * k2 * al); TX(ctx, G, 'ARANA / SPIDER  47 m', gS([-0.9, 2.55]), 0.9 * k2 * al, 0.12); }
          TX(ctx, G, 'PAMPA DE NAZCA, PERU', gB([-3.6, -6.4]), 0.8 * cl((tb - 0.4) / 0.5) * al); TX(ctx, G, '14\u00b041\u203251\u2033S  75\u00b008\u203206\u2033W   500 BC - 500 AD', gB([-3.6, -7.0]), 0.6 * cl((tb - 0.6) / 0.5) * al, 0.085);
          if (bd) TX(ctx, G, 'ONE LINE  ' + Math.round(f * 100) + '%', [bT[0], F + 0.45, bT[2]], 0.85 * al, 0.09, 'center');
          if (sy > -6.4 && sy < 6.4) { const h = Math.sqrt(Math.max(0, 36 - sy * sy)); neon(ctx, G, [[gG([-h, sy]), gG([h, sy])]], '#6ff0e0', 1.6, 0.9 * al, '#ffffff'); neon(ctx, G, [[gG([-h, sy + 0.25]), gG([h, sy + 0.25])]], '#6ff0e0', 0.8, 0.3 * al);
            TX(ctx, G, 'AI SURVEY 2024 : 303 NEW GEOGLYPHS', gG([-2.2, sy + 0.2]), 0.9 * al, 0.11); }   // AI 調査の光（2024年、303個の新しい地上絵が見つかった）
          ctx.restore(); } };
        if (bd) { o.gw1 = { p: bT, w: 0.42 + 0.08 * S(t * 40), c: '#ffffff', c2: '#ff9a40', alpha: 0.95 }; o.bm0 = { a: [bT[0], F + 1.6, bT[2]], b: bT, ra: 0.01, rb: 0.07, c: '#fff4d8', alpha: 0.5, zp: bT }; }   // ペン先（光の柱つき）
        if (sd) { o.gw2 = { p: sT, w: 0.32 + 0.06 * S(t * 37), c: '#ffffff', c2: '#40d0c8', alpha: 0.9 }; o.bm1 = { a: [sT[0], F + 1.3, sT[2]], b: sT, ra: 0.01, rb: 0.06, c: '#d8fff8', alpha: 0.45, zp: sT }; }
        const sp = []; [[bd, bf, gB, bAt], [sd, sf, gS, sAt]].forEach(([on, ff, gg, at], m) => { if (on) range(30).forEach((j) => { const age = (j % 15) * 0.03 + rnd(j + m * 50) * 0.02, q = gg(at(ff(tb - age)), 0), a = rnd(j * 3 + m) * TAU, v = 0.4 + rnd(j * 5) * 0.9; sp.push(q[0] + Co(a) * v * age, F + 0.05 + Math.max(0, age * (2.4 - age * 4.5)) * (0.5 + rnd(j * 7)), q[2] + S(a) * v * age); }); });
        if (sp.length) o.du2 = { pts: sp, size: 0.035, max: 2.2, c: '#ffd08a', alpha: 0.9 };   // 飛び散る火の粉
        if (tb > 3.7) o.ln5 = { pts: BIRD.map((q) => gB(q)), c: '#fff4d8', lw: 2.2, alpha: 0.85 * cl((tb - 4.3) / 0.3) * out, dash: [8, 90], doff: -tb * 160, cap: 'round', zp: [0, F, 0], z: -29 };   // 線の上をめぐる光
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 6.3, c: '#1a120c', alpha: 0.95, z: -60 };
        garnish(o, t, F, '#e8b080', '#7a5a3a', '#ffd9a8', 0.7);
        return o;
      }
    }
  ];
};
