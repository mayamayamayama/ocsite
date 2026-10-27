// hero-elder4.js — 入場画面「未知の古代」のショット 4（hero-elder.js の続き）
// 4) アレシボ・メッセージ（電波望遠鏡から、1679個の光の点が送り出され、空に絵を組み上げる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder4');

window.OC_ELDER4 = function (E) {
  const { K, CLOUD, sprites, face, garnish } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd } = K;
  const F = -2.3, BOXF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];

  // ===== 4) アレシボ・メッセージ：1974年、アレシボ電波望遠鏡から球状星団 M13 へ送られた 1679 ビット。1679 = 23 × 73（どちらも素数なので、並べ方は1通り） =====
  const AW = 23, AH = 73, BIT = [];
  '1v5s,s7b8,2nw6q,3bv38,0,16o,54w,54w,8ao,c8w,0,3tc7s,2hwnk,4366y,4wxy7,0,b8jm,0,5m9t,4u6fz,0,3szrs,2i900,42mqi,4wxy7,0,bdaa,4qo,5r0h,4ub6n,4qo,mio4,bdag,8k5s,25i8,51c,25i8,8k5s,bbpk,mltw,192x0,18zrc,mk9c,b8m8,8fpc,p1xc,mk8w,n5kw,nhwb,1pvj,3ljcn,7y3,mp1b,mp0w,n2f4,0,13f28,1545x,13c5w,8w,ohs,2sxs,9ubk,guw0,10iwg,1zna0,1ch3c,1c4ug,314w,2we8,2t8g,t8g,2dnjs'
    .split(',').forEach((v) => { const n = parseInt(v, 36); for (let c = AW - 1; c >= 0; c--) BIT.push((n >> c) & 1); });   // 1行（23ビット）を36進数で
  const ACOL = ['#ffffff', '#b48cff', '#6cffa0', '#5ab4ff', '#ff5a4a', '#ffd84a', '#c08aff'];   // 色分け：数・元素・ヌクレオチド・DNA・人・太陽系・望遠鏡
  const acol = (r, c) => (r < 4 ? 0 : r < 10 ? 1 : r < 30 ? 2 : r < 45 ? (c === 10 || c === 11 ? 0 : 3) : r < 55 ? (c < 5 ? 3 : c < 14 ? 4 : 0) : r < 60 ? 5 : r < 71 ? 6 : 3);
  const ALAB = [[1.5, 3, 'NUMBERS 1-10'], [7, 9, 'H  C  N  O  P'], [20, 29, 'NUCLEOTIDES'], [37, 44, 'DNA'], [50, 54, 'HUMAN'], [57.5, 59, 'SOLAR SYSTEM'], [66, 72, 'TELESCOPE']];
  const AS = 0.058, AY = F + 2.45 + (AH * AS) / 2, TE = (i) => 0.35 + (2.9 * i) / (AW * AH);   // 1マスの大きさ・絵の中心の高さ・i番目のビットが送り出される時刻
  // 電波望遠鏡：地面にうまったお皿（球の一部）・3本の塔・つり下げた三角の台
  const RD = 2.6, DD = 0.75, RSP = (RD * RD + DD * DD) / (2 * DD), dy = (r) => F + 0.02 - DD + RSP - Math.sqrt(RSP * RSP - r * r);
  const DISH = []; range(8).forEach((k) => { const r = (RD * (k + 1)) / 8; for (let i = 0; i < 48; i++) { const a = (i / 48) * TAU, b = ((i + 1) / 48) * TAU; DISH.push([[Co(a) * r, dy(r), S(a) * r], [Co(b) * r, dy(r), S(b) * r]]); } });
  range(36).forEach((m) => { const a = (m / 36) * TAU; for (let k = 0; k < 8; k++) { const r0 = (RD * k) / 8, r1 = (RD * (k + 1)) / 8; DISH.push([[Co(a) * r0, dy(r0), S(a) * r0], [Co(a) * r1, dy(r1), S(a) * r1]]); } });
  const TWR = range(3).map((k) => (k / 3) * TAU + 0.5), TR = 3.15, TH = 2.75, PY0 = F + 1.85, SRC = [0, PY0 - 0.35, 0];
  const TOW = { V: [[-0.12, 0, -0.12], [0.12, 0, -0.12], [0.12, 0, 0.12], [-0.12, 0, 0.12], [-0.06, TH, -0.06], [0.06, TH, -0.06], [0.06, TH, 0.06], [-0.06, TH, 0.06]], F: BOXF };
  const PLT = { V: [].concat(TWR.map((a) => [Co(a) * 0.75, 0.06, S(a) * 0.75]), TWR.map((a) => [Co(a) * 0.75, -0.06, S(a) * 0.75])), F: [[0, 1, 2], [3, 5, 4], [0, 3, 4, 1], [1, 4, 5, 2], [2, 5, 3, 0]] };
  const CAB = []; TWR.forEach((a) => { const top = [Co(a) * TR, F + TH, S(a) * TR]; [-0.04, 0, 0.04].forEach((d) => CAB.push([[top[0], top[1] + d, top[2]], [Co(a) * 0.75, PY0 + d, S(a) * 0.75]])); CAB.push([top, [Co(a) * 4.6, F, S(a) * 4.6]]); });
  const ARM = range(19).map((i) => { const u = (i / 18) * PI; return [Co(u) * 0.62, PY0 - 0.06 - S(u) * 0.4, 0]; });
  const STR = []; range(220).forEach((i) => { const a = rnd(i * 3) * TAU, e = 0.12 + rnd(i * 5) * 1.3; STR.push(Co(a) * Co(e) * 14, F + S(e) * 14, S(a) * Co(e) * 14); });
  const FOG = range(16).map((i) => [rnd(i * 3) * TAU, 3.3 + rnd(i * 5) * 3, rnd(i * 7), 2 + rnd(i * 11) * 1.6, 0.35 + rnd(i * 13) * 0.25, i % 3 ? 0 : 1]);

  return [
    { // 4) アレシボ・メッセージ：地面にうまった巨大なお皿から、光の点（ビット）が1つずつ送り出され、空に 23 × 73 の絵を組み上げる。数・元素・DNA・人・太陽系・望遠鏡
      name: 'ARECIBO', bg: '#070b10', sel: 'so21',
      cam: (tb, t) => ({ pitch: 0.2 + 0.08 * io(cl(tb / 4)), dist: 10.4, zoom: 0.98, t: [0, F + 1.0 + 2.3 * io(cl((tb - 0.2) / 3.6)), 0] }),
      act: (t, tb) => {
        const o = {}, U = face(t, tb, 0.55), C = [0, AY, 0], P = (c, r) => [U[0] * (c - 11) * AS, AY + (36 - r) * AS, U[2] * (c - 11) * AS], go = tb > 0.3 && tb < 3.3 ? 1 : 0;
        o.cx10 = { p: [0, F - 0.3, 0], z: -20, draw: (ctx, G) => { const cam = G.camPos, D = Math.hypot(cam[0], cam[1] - F, cam[2]), bins = [[], []];   // お皿：奥の内側は明るく、手前（地面の下にかくれる所）は暗く
          DISH.forEach((s) => { const m = s[0]; bins[Math.hypot(m[0] - cam[0], m[1] - cam[1], m[2] - cam[2]) > D ? 1 : 0].push(s); });
          [0.1, 0.4].forEach((a, b) => { ctx.strokeStyle = 'rgba(190,230,240,' + a + ')'; ctx.lineWidth = 1; ctx.beginPath(); bins[b].forEach(([p, q]) => { const A = G.proj(p), B = G.proj(q); if (A[2] > 0.3 && B[2] > 0.3) { ctx.moveTo(A[0], A[1]); ctx.lineTo(B[0], B[1]); } }); ctx.stroke(); }); } };
        o.ln4 = { pts: range(97).map((i) => [Co((i / 96) * TAU) * RD, F + 0.02, S((i / 96) * TAU) * RD]), c: '#cfeff7', lw: 1.4, alpha: 0.6, zp: [0, F, 0], z: -19 };
        TWR.forEach((a, k) => { o['so' + (21 + k)] = { p: [Co(a) * TR, F, S(a) * TR], r: [0, -a, 0], V: TOW.V, F: TOW.F, c: '#141b1f', edge: '#6a8a96', elw: 0.7 }; });
        o.so24 = { p: [0, PY0, 0], V: PLT.V, F: PLT.F, c: '#141b1f', edge: '#8fb0bc', elw: 0.8 };
        o.cb0 = { items: [[0.3, PY0 - 0.42, 0, 0.11, 0.09, 0.11, 0, 0, 0]], pal: [['#1d262a', '#141b1f', '#2c3a40']], zp: [0.3, PY0 - 0.42, 0] };
        o.ln5 = { segs: CAB, c: '#9ab8c4', lw: 0.8, alpha: 0.5, zp: [0, PY0, 0], z: 0.4 }; o.ln6 = { pts: ARM, c: '#9ab8c4', lw: 1.6, alpha: 0.7, zp: [0, PY0 - 0.2, 0] };
        o.bm1 = { a: [0, AY - (AH * AS) / 2 - 0.05, 0], b: [0, F - DD + 0.05, 0], ra: 0.05, rb: 0.65, c: '#bff4ff', c2: '#2a6a7a', alpha: 0.12 + go * (0.22 + 0.06 * S(t * 31)), zp: [0, F + 1, -0.4], z: -8 };
        o.gw0 = { p: [0, F - DD + 0.1, 0], w: 1.3, c: '#bff4ff', c2: '#123a48', alpha: 0.2 + 0.25 * go, z: -18 }; o.gw1 = { p: SRC, w: 0.3 + 0.12 * go, c: '#ffffff', c2: '#7fe0ff', alpha: 0.5 + 0.4 * go };
        o.du1 = { pts: STR, size: 0.035, max: 1.6, c: '#dfefff', alpha: 0.7 };
        o.cx12 = { p: [0, F + 0.4, 0], z: -15, draw: (ctx, G) => sprites(ctx, G, FOG.map((c) => { const a = c[0] + t * 0.03; return [Co(a) * c[1], F + 0.15 + c[2] * 0.6, S(a) * c[1], c[3], c[4], c[5]]; }), CLOUD) };   // 地面をはう霧
        o.cx11 = { p: C, draw: (ctx, G, ac) => {   // 光の点。送り出されると、まん中をのぼってから、自分の場所へ散る
          const c0 = G.proj(C); if (c0[2] < 0.3) return; const pu = G.proj([U[0] * AS * 0.5, AY, U[2] * AS * 0.5]), pv = G.proj([0, AY + AS * 0.5, 0]), hu = [pu[0] - c0[0], pu[1] - c0[1]], hv = [pv[0] - c0[0], pv[1] - c0[1]], al = Math.min(1, ac.s) * (1 - cl((tb - 5.2) / 0.5)); if (al <= 0) return;   // 次のショットへ移るときは、消える
          const PA = ACOL.map(() => new Path2D()), PB = ACOL.map(() => new Path2D()), FLY = new Path2D(), OFF = new Path2D(), HI = new Path2D(), scan = tb > 3.9 ? ((tb - 3.9) * 34) % 120 - 20 : -99;
          const quad = (Q, p, k) => { const z = (c0[2] / p[2]) * k, ux = hu[0] * z, uy = hu[1] * z, vx = hv[0] * z, vy = hv[1] * z; Q.moveTo(p[0] + ux + vx, p[1] + uy + vy); Q.lineTo(p[0] - ux + vx, p[1] - uy + vy); Q.lineTo(p[0] - ux - vx, p[1] - uy - vy); Q.lineTo(p[0] + ux - vx, p[1] + uy - vy); Q.closePath(); };
          for (let i = 0; i < AW * AH; i++) { const e = (tb - TE(i)) / 0.6; if (e <= 0) break; const r = (i / AW) | 0, c = i % AW, on = BIT[i], T3 = P(c, r);
            if (e < 1) { const k = 1 - (1 - e) * (1 - e), a = (1 - k) * (1 - k), b = 2 * (1 - k) * k, d = k * k, p = G.proj([SRC[0] * a + T3[0] * d, SRC[1] * a + (T3[1] - 0.2) * b + T3[1] * d, SRC[2] * a + T3[2] * d]); if (p[2] > 0.3) quad(on ? FLY : OFF, p, on ? 0.7 : 0.25); continue; }
            const p = G.proj(T3); if (p[2] < 0.3) continue; if (!on) { quad(OFF, p, 0.2); continue; }
            const g = acol(r, c); quad(PA[g], p, 1.9); quad(PB[g], p, 0.86); if (e < 1.6 || Math.abs(r - scan) < 2.5) quad(HI, p, 0.9); }
          ctx.save(); ctx.globalAlpha = 0.4 * al; ctx.fillStyle = '#4a7a8a'; ctx.fill(OFF); ctx.globalCompositeOperation = 'lighter';
          ACOL.forEach((col, g) => { ctx.fillStyle = col; ctx.globalAlpha = 0.16 * al; ctx.fill(PA[g]); ctx.globalAlpha = 0.95 * al; ctx.fill(PB[g]); });
          ctx.fillStyle = '#e8fbff'; ctx.globalAlpha = 0.9 * al; ctx.fill(FLY); ctx.globalAlpha = 0.55 * al; ctx.fill(HI);
          const f0 = cl((tb - 0.1) / 0.5); ctx.strokeStyle = '#bff0ff'; ctx.globalAlpha = 0.7 * al; ctx.lineWidth = 1.2; ctx.beginPath();   // 四すみのかぎ
          [[-1.5, -1.5, 1, 1], [23.5, -1.5, -1, 1], [23.5, 73.5, -1, -1], [-1.5, 73.5, 1, -1]].forEach(([c, r, dc, dr]) => { const a = G.proj(P(c + dc * 3 * f0, r)), b = G.proj(P(c, r)), d = G.proj(P(c, r + dr * 3 * f0)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.lineTo(d[0], d[1]); }); ctx.stroke();
          const fs = (G.f * 0.085) / c0[2], txt = (s, q, al2, align) => { const p = G.proj(q); ctx.globalAlpha = al2 * al; ctx.textAlign = align || 'center'; ctx.fillText(s, p[0], p[1]); };
          ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = '#cfefff'; ctx.font = fs.toFixed(1) + 'px ui-monospace, Menlo, monospace'; ctx.textBaseline = 'middle';
          txt('ARECIBO MESSAGE  1974', P(11, -4.5), 0.85 * f0); txt('2380 MHz  >>  M13 / 25,000 LY', P(11, -7.5), 0.55 * f0); txt('1679 BITS = 23 x 73', P(11, 76.5), 0.6 * cl((tb - 3.4) / 0.5));
          ALAB.forEach(([r, end, s]) => { const a = cl((tb - TE(end * AW + 22) - 0.6) / 0.4); if (a <= 0) return; ctx.strokeStyle = '#cfefff'; ctx.globalAlpha = 0.6 * a * al; const q0 = G.proj(P(-2.2, r)), q1 = G.proj(P(-3.6, r)); ctx.beginPath(); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]); ctx.stroke(); txt(s, P(-4.3, r), 0.8 * a, 'right'); });   // 左に、何の絵かを書く
          if (go) { const r = Math.min(AH - 1, Math.floor((tb - 0.35) / 2.9 * AH)); txt(BIT.slice(r * AW, r * AW + AW).join(''), P(24.5, r), 0.6, 'left'); }   // いま送っている行（右に）
          ctx.restore(); } };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#080d11', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#bfe8f0', '#4f7a86', '#cfefff', 1.2);
        return o;
      }
    }
  ];
};
