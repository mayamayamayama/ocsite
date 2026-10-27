// hero-elder5.js — 入場画面「未知の古代」のショット 5〜6（hero-elder.js の続き）
// 5) 骨組みだけの円屋根の下の儀式（光の線で「生命の樹」がひとりでに描かれる）　6) 古代の星図（ワームホール）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder5');

window.OC_ELDER5 = function (E) {
  const { K, face, board, grow, neon, glyph, flame, garnish } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, fr } = K;
  const F = -2.3;
  const cyl = (n, r, h) => ({ V: [].concat(range(n).map((i) => [Co((i / n) * TAU) * r, 0, S((i / n) * TAU) * r]), range(n).map((i) => [Co((i / n) * TAU) * r, h, S((i / n) * TAU) * r])), F: [range(n), range(n).map((i) => n + i)].concat(range(n).map((i) => [i, (i + 1) % n, n + ((i + 1) % n), n + i])) });

  // ===== 5) 儀式 =====
  const RR = 2.75, RH = 4.3, RIB = range(8).map((k) => { const a = (k / 8) * TAU + 0.2; return range(19).map((i) => { const th = (i / 18) * (PI / 2), r = RR * Co(th); return [Co(a) * r, F + RH * S(th), S(a) * r]; }); });
  const CAN = range(8).map((k) => { const a = (k / 8) * TAU + 0.6, h = 0.35 + rnd(k * 3) * 0.3; return { p: [Co(a) * 1.6, F, S(a) * 1.6], h, s: cyl(8, 0.06, h) }; });
  // 生命の樹：10個の円（セフィラ）と、それを結ぶ22本の小径。小径には、ヘブライ文字22字を1字ずつ
  const SN = [[0, 0], [1, 0.6], [-1, 0.6], [1, 2], [-1, 2], [0, 2.7], [1, 3.8], [-1, 3.8], [0, 4.5], [0, 5.6]], SR = 0.27, SK = 0.55;
  const SNAME = ['KETHER', 'CHOKMAH', 'BINAH', 'CHESED', 'GEBURAH', 'TIPHARETH', 'NETZACH', 'HOD', 'YESOD', 'MALKUTH'];
  const SCOL = ['#ffffff', '#a8c8ff', '#ff6a7a', '#4a8cff', '#ff4a3a', '#ffd24a', '#4ae07a', '#ff9a3a', '#b46aff', '#d8c84a'], MQ = ['#d8c84a', '#8aa83a', '#c0683a', '#5a5a6a'];   // 色。マルクトは4色に分かれる
  const SP = '01 02 05 12 15 13 25 24 34 35 36 45 47 56 58 57 67 68 69 78 79 89'.split(' ').map((v) => [+v[0], +v[1]]), HEB = 'אבגדהוזחטיכלמנסעפצקרשת';
  const LF = SP.map((_, j) => ({ 2: 0.62, 3: 0.3, 8: 0.3, 14: 0.4, 16: 0.3 })[j] || 0.5);   // 文字を置く位置（線の重なりをさける）
  const PATH = SP.map(([a, b]) => { const A = SN[a], B = SN[b], L = Math.hypot(B[0] - A[0], B[1] - A[1]), u = [(B[0] - A[0]) / L, (B[1] - A[1]) / L]; return [[A[0] + u[0] * SR, A[1] + u[1] * SR], [B[0] - u[0] * SR, B[1] - u[1] * SR]]; });
  const RING = (n, r, a0 = 0, a1 = TAU) => range(n + 1).map((i) => [Co(a0 + ((a1 - a0) * i) / n) * r, S(a0 + ((a1 - a0) * i) / n) * r]);
  const TN = (i) => 0.35 + (1.1 * i) / 9, TP = (j) => 1.45 + j * 0.07;   // 円が灯る時刻・小径が描かれ始める時刻
  const ALT = cyl(12, 0.36, 0.5);

  // ===== 6) ワームホール（フラムの放物面：y = ±2√(rs(r − rs))） =====
  const RS = 0.32, RM = 2.7, NR = 15, NM = 28, wy = (r) => 2 * Math.sqrt(RS * Math.max(0, r - RS)), rk = (k) => RS + (RM - RS) * Math.pow(k / NR, 1.8);
  const WH = (t) => { const segs = [], a0 = t * 0.15, P = (r, a, s) => [Co(a + a0) * r, s * wy(r), S(a + a0) * r];
    range(NR + 1).forEach((k) => [1, -1].forEach((s) => { const r = rk(k); for (let i = 0; i < 48; i++) segs.push([P(r, (i / 48) * TAU, s), P(r, ((i + 1) / 48) * TAU, s)]); }));
    range(NM).forEach((m) => { const a = (m / NM) * TAU; [1, -1].forEach((s) => { for (let k = 0; k < NR; k++) segs.push([P(rk(k), a, s), P(rk(k + 1), a, s)]); }); });
    return segs; };
  const GLB = [0, 2.55, 0], GR = 0.5;

  return [
    { // 5) 生命の樹：骨組みだけの円屋根の下、ろうそくの輪の中。稲妻（炎の剣）が上から1→10の順に円を灯し、22本の小径とヘブライ文字が、光の線でひとりでに描かれていく
      name: 'SEPHIROT', bg: '#090605', sel: 'so37',
      cam: (tb, t) => ({ pitch: 0.12 + 0.05 * S(t * 0.4), dist: 9.2, zoom: 1.4, t: [0, F + 2.35, 0] }),
      act: (t, tb) => {
        const o = {};
        RIB.forEach((P, k) => { o['cx' + (15 + k)] = { p: P[7], draw: (ctx, G) => { const Q = P.map(G.proj); if (Q.some((q) => q[2] < 0.3)) return; const w = (G.f * 0.13) / Q[7][2];   // 円屋根のあばら
          ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = '#17100b'; ctx.lineWidth = w; ctx.beginPath(); Q.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1])); ctx.stroke();
          ctx.strokeStyle = 'rgba(190,120,60,.35)'; ctx.lineWidth = w * 0.22; ctx.beginPath(); Q.forEach((q, i) => ctx[i ? 'lineTo' : 'moveTo'](q[0], q[1] + w * 0.3)); ctx.stroke(); ctx.lineCap = 'butt'; ctx.lineJoin = 'miter'; } }; });
        CAN.forEach((c, i) => { const tip = [c.p[0], F + c.h + 0.02, c.p[2]];
          o['so' + (29 + i)] = { p: c.p, V: c.s.V, F: c.s.F, c: '#28324c' };
          o['gw' + i] = { p: [tip[0], tip[1] + 0.12, tip[2]], w: 0.8 * (1 + 0.15 * S(t * 19 + i * 2)), c: '#ffb35c', c2: '#5a2a08', alpha: 0.5, z: 0.5 };
          o['cx' + (23 + i)] = { p: tip, z: 0.6, draw: (ctx, G) => flame(ctx, G, tip, 0.12, t, i) };
          o['ln' + (24 + i)] = { pts: range(12).map((j) => [tip[0] + 0.04 * S(t * 2 + j * 0.7 + i) * (j / 11), tip[1] + 0.2 + j * 0.09, tip[2]]), c: '#a09080', lw: 1, alpha: 0.16, zp: tip }; });
        o.so37 = { p: [0, F, 0], V: ALT.V, F: ALT.F, c: '#1c1612', edge: '#6a4a30', elw: 0.8 };
        const C = [0, F + 0.85 + 2.8 * SK, 0], B = board(C, face(t, tb, 0.5), [0, 1, 0], SK), Q = (x, y) => B(x, 2.8 - y), L3 = (l, dx = 0, dy = 0) => l.map(([x, y]) => Q(x + dx, y + dy));
        o.cx31 = { p: C, draw: (ctx, G, ac) => { const al = Math.min(1, ac.s) * (1 - cl((tb - 5.2) / 0.5)), c0 = G.proj(C); if (c0[2] < 0.3 || al <= 0) return; const k = G.f / c0[2];
          // 22本の小径（金色）と、その上を流れる光の粒
          const PL = []; PATH.forEach((l, j) => { const f = cl((tb - TP(j)) / 0.55); if (f > 0) PL.push(L3(grow(l, f))); }); neon(ctx, G, PL, '#ffb84a', 1.3, 0.85 * al, '#ffe9b0');
          if (tb > 3.3) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#fff4d0'; PATH.forEach((l, j) => { const f = (tb * 0.5 + j * 0.37) % 1, p = G.proj(Q(l[0][0] + (l[1][0] - l[0][0]) * f, l[0][1] + (l[1][1] - l[0][1]) * f)); ctx.globalAlpha = 0.8 * al * cl((tb - 3.3) / 0.5); ctx.beginPath(); ctx.arc(p[0], p[1], Math.max(1.2, 0.012 * k), 0, TAU); ctx.fill(); }); ctx.restore(); }
          // ダアト（かくれた11番目。点線の円）
          const dv = cl((tb - 3.0) / 0.6); if (dv > 0) { const P = new Path2D(); RING(24, SR).forEach(([x, y], i) => { const p = G.proj(Q(x, 1.35 + y)); P[i ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.save(); ctx.setLineDash([3, 4]); ctx.strokeStyle = '#d8c8ff'; ctx.globalAlpha = 0.5 * dv * al; ctx.lineWidth = 1; ctx.stroke(P); ctx.restore(); }
          // 10個の円：黒くぬって、色の輪を描く。中に数字、横に名前
          ctx.save(); ctx.textBaseline = 'middle';
          SN.forEach(([x, y], i) => { const f = cl((tb - TN(i)) / 0.35); if (f <= 0) return; const P = new Path2D(); RING(24, SR).forEach(([u, v], j) => { const p = G.proj(Q(x + u, y + v)); P[j ? 'lineTo' : 'moveTo'](p[0], p[1]); });
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.92 * al * f; ctx.fillStyle = '#0b0705'; ctx.fill(P);
            const g = G.proj(Q(x, y)), gr = ctx.createRadialGradient(g[0], g[1], 0, g[0], g[1], SR * SK * k * 1.9); gr.addColorStop(0, SCOL[i]); gr.addColorStop(1, 'rgba(0,0,0,0)'); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.28 * al * f * (0.85 + 0.15 * S(t * 3 + i)); ctx.fillStyle = gr; ctx.fillRect(g[0] - SR * SK * k * 2, g[1] - SR * SK * k * 2, SR * SK * k * 4, SR * SK * k * 4);
            if (i < 9) neon(ctx, G, [L3(grow(RING(24, SR, -PI / 2, PI * 1.5), f), x, y)], SCOL[i], 1.4, al, '#ffffff');
            else MQ.forEach((c, q) => neon(ctx, G, [L3(grow(RING(6, SR, -PI / 2 + (q * PI) / 2, (q * PI) / 2), f), x, y)], c, 1.4, al, c));   // マルクトは4つに分かれた輪
            const n = cl((tb - TN(i) - 0.3) / 0.4); if (n <= 0) return; ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = SCOL[i]; ctx.globalAlpha = 0.9 * n * al; ctx.textAlign = 'center'; ctx.font = (0.12 * k).toFixed(1) + 'px Georgia, serif'; ctx.fillText(i + 1, g[0], g[1]);
            const side = x < 0 ? -1 : 1, lp = G.proj(Q(x + side * (SR + 0.12), y)); ctx.textAlign = side < 0 ? 'right' : 'left'; ctx.globalAlpha = 0.85 * n * al; ctx.fillStyle = '#f0dcc0'; ctx.font = (0.075 * k).toFixed(1) + 'px Georgia, serif'; ctx.fillText(SNAME[i], lp[0], lp[1]); });
          // ヘブライ文字（小径が描き終わると、浮かびあがる）
          ctx.textAlign = 'center'; ctx.font = (0.11 * k).toFixed(1) + 'px "Times New Roman", serif';
          PATH.forEach((l, j) => { const a = cl((tb - TP(j) - 0.6) / 0.35); if (a <= 0) return; const f = LF[j], p = G.proj(Q(l[0][0] + (l[1][0] - l[0][0]) * f, l[0][1] + (l[1][1] - l[0][1]) * f));
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 0.85 * a * al; ctx.fillStyle = '#0b0705'; ctx.beginPath(); ctx.arc(p[0], p[1], 0.07 * k, 0, TAU); ctx.fill();
            ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = '#ffd890'; ctx.fillText(HEB[j], p[0], p[1] + 0.005 * k); });
          ctx.restore();
          // 炎の剣：上から下へ、1→10の順に走る稲妻
          const sw = cl((tb - 0.35) / 1.1), fade = 1 - 0.85 * cl((tb - 1.6) / 0.8); if (sw > 0) { const Z = []; SN.forEach(([x, y], i) => { if (!i) return; const [px, py] = SN[i - 1]; for (let s = 1; s <= 6; s++) { const u = s / 6, j = s < 6 ? (rnd(i * 9 + s + Math.floor(t * 14) * 31) - 0.5) * 0.22 : 0; Z.push([px + (x - px) * u + j, py + (y - py) * u + j * 0.5]); } });
            neon(ctx, G, [L3(grow([SN[0]].concat(Z), sw))], '#9fe8ff', 2, al * fade, '#ffffff'); } } };
        o.gw9 = { p: [0, F + 2.4, 0], w: 2.1, c: '#ffcf80', c2: '#3a1a08', alpha: 0.22 * cl((tb - 0.4) / 2), z: -2 };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#0f0a07', alpha: 0.92, z: -60 };
        garnish(o, t, F, '#ffb46a', '#6a4a30', '#ffcf9a', 0.8);
        return o;
      }
    },
    { // 6) 古代の星図：上と下の漏斗が、細い「のど」でつながる。粒が吸い込まれて、反対側へ。のどには石の輪、上には網の目の星
      name: 'GATE', bg: '#04080a', sel: 'so38',
      cam: (tb, t) => ({ pitch: 0.38 + 0.05 * S(t * 0.4), dist: 9.2, zoom: 1.05, t: [0, 0.35, 0] }),
      act: (t, tb) => {
        const o = {}, segs = WH(t), rv = cl(tb / 1.8);
        o.cx35 = { p: [0, 0, 0], draw: (ctx, G) => {   // 線を、手前・奥で3段の明るさに分けて描く
          const cam = G.camPos, D = Math.hypot(cam[0], cam[1], cam[2]), bins = [[], [], []];
          segs.forEach((s, i) => { if (i / segs.length > rv) return; const m = [(s[0][0] + s[1][0]) / 2, (s[0][1] + s[1][1]) / 2, (s[0][2] + s[1][2]) / 2], d = Math.hypot(m[0] - cam[0], m[1] - cam[1], m[2] - cam[2]) - D; bins[d < -0.8 ? 2 : d < 0.9 ? 1 : 0].push(s); });
          [0.22, 0.5, 0.95].forEach((a, b) => { ctx.strokeStyle = 'rgba(200,240,255,' + a + ')'; ctx.lineWidth = b === 2 ? 1.4 : 1; ctx.beginPath(); bins[b].forEach(([p, q]) => { const P = G.proj(p), Q = G.proj(q); if (P[2] > 0.3 && Q[2] > 0.3) { ctx.moveTo(P[0], P[1]); ctx.lineTo(Q[0], Q[1]); } }); ctx.stroke(); });
          ctx.strokeStyle = 'rgba(160,230,255,.85)'; ctx.fillStyle = 'rgba(160,230,255,.85)'; ctx.lineWidth = 1.2;
          range(24).forEach((i) => { const a = (i / 24) * TAU - t * 0.1, c = G.proj([Co(a) * (RM + 0.32), wy(RM) + 0.05, S(a) * (RM + 0.32)]); if (c[2] > 0.3) glyph(ctx, (i * 7) % 40, c[0] - 4, c[1] - 6, (G.f * 0.16) / c[2]); }); } };
        o.gw0 = { p: [0, 0, 0], w: 0.95, c: '#e8fbff', c2: '#3a9ab0', alpha: 0.65 };
        o.cb1 = { items: range(12).map((i) => { const a = (i / 12) * TAU + t * 0.3; return [Co(a) * 0.62, 0, S(a) * 0.62, 0.11, 0.07, 0.06, 0, -a + PI / 2, 0]; }), pal: [['#1a2226', '#11171a', '#2a383e']], edge: '#5fb8d0', elw: 0.6, zp: [0, 0, 0] };   // のどの石の輪
        o.cx36 = { p: GLB, draw: (ctx, G) => { const c = G.proj(GLB); if (c[2] < 0.3) return; const r = (G.f * GR) / c[2], a0 = t * 0.4;   // 網の目の星
          ctx.fillStyle = '#04080a'; ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, TAU); ctx.fill(); ctx.strokeStyle = 'rgba(210,245,255,.9)'; ctx.lineWidth = 1; ctx.beginPath();
          range(8).forEach((m) => { const a = (m / 8) * PI + a0; range(25).forEach((j) => { const b = (j / 24) * PI, q = G.proj([GLB[0] + Co(a) * S(b) * GR, GLB[1] + Co(b) * GR, GLB[2] + S(a) * S(b) * GR]); ctx[j ? 'lineTo' : 'moveTo'](q[0], q[1]); }); });
          range(5).forEach((p) => { const b = ((p + 1) / 6) * PI; range(33).forEach((j) => { const a = (j / 32) * TAU, q = G.proj([GLB[0] + Co(a) * S(b) * GR, GLB[1] + Co(b) * GR, GLB[2] + S(a) * S(b) * GR]); ctx[j ? 'lineTo' : 'moveTo'](q[0], q[1]); }); });
          ctx.stroke(); ctx.beginPath(); ctx.arc(c[0], c[1], r, 0, TAU); ctx.lineWidth = 1.6; ctx.stroke(); } };
        o.so38 = { p: [0, GLB[1] - GR - 0.35, 0], r: [0, t * 0.5, 0], V: [[0, 0.22, 0], [0, -0.22, 0], [0.12, 0, 0], [-0.12, 0, 0], [0, 0, 0.12], [0, 0, -0.12]], F: [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]], c: '#0e1418', edge: '#9fe6ff', elw: 0.8 };
        const ds = []; range(150).forEach((i) => { const s = fr(rnd(i * 3) + t * (0.05 + rnd(i * 5) * 0.06)), r = s < 0.5 ? RM - (RM - RS) * Math.pow(s * 2, 0.6) : RS + (RM - RS) * Math.pow((s - 0.5) * 2, 1.6), a = rnd(i * 7) * TAU + s * 9 + t * 0.15; ds.push(Co(a) * r, (s < 0.5 ? 1 : -1) * wy(r) + 0.02, S(a) * r); });
        o.du1 = { pts: ds, size: 0.03, max: 2.4, c: '#ffffff', alpha: 0.9 };
        garnish(o, t, F, '#9fe6ff', '#3a8aa0', '#cfefff', 0.5);
        return o;
      }
    }
  ];
};
