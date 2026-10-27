// hero-philo3.js — 入場画面「哲学」のショット 3〜4（hero-philo.js の続き）
// 3) 二分法（半分、そのまた半分…と枝分かれする「Hの木」のフラクタルへ、どこまでもズーム）
// 4) テセウスの結び目（三つ葉結び目の管を作るタイル 432 枚を、1枚ずつ取りかえる。古いタイルは、となりでもう1つの結び目になる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-philo3');

window.OC_PHILO3 = function (E) {
  const { NP, vis, K, PAPER, INK, RUB, SEPIA, SERIF, MONO, stage, hatch, poly, dot } = E, { S, Co, PI, TAU, cl, io, range, rnd, sub, nrm, cross } = K;
  const F = -2.0, R2 = Math.SQRT1_2;
  const memo = (f) => { let K0 = '', R0 = null; return (t, tb) => { const k = t + '|' + tb; if (k !== K0) { K0 = k; R0 = f(t, tb); } return R0; }; };   // 同じ時刻なら、計算は1回だけ
  const TX = (ctx, G, s, q, a, sz, col, al = 'left', it) => { const p = G.proj(q); if (p[2] < 0.3) return; ctx.globalAlpha = a; ctx.fillStyle = col; ctx.textAlign = al; ctx.font = (it ? 'italic ' : '') + ((G.f * sz) / p[2]).toFixed(1) + 'px ' + (it ? SERIF : MONO); ctx.fillText(s, p[0], p[1]); };

  // ===== 3) 二分法（ゼノン）：線を半分にし、そのはしで、また半分の長さの線を直角に… 。行きつく1点（T）へ、カメラはどこまでも近づく =====
  const L0 = 4.2, PATH = range(60).map((n) => (rnd(n * 7.7 + 3) < 0.5 ? 1 : -1)); let TGT = [0, 0];
  { let c = [0, 0]; for (let n = 0; n < 60; n++) { const l = L0 * Math.pow(R2, n), d = n % 2 ? [0, 1] : [1, 0]; c = [c[0] + d[0] * PATH[n] * l / 2, c[1] + d[1] * PATH[n] * l / 2]; } TGT = c; }   // 決めた道すじの先の、行きつく点
  const htree = memo((t, tb) => { const W = stage(t, tb, 0.25), z = tb * 2.1, s = Math.pow(2, z / 2), M = (p, h = 0) => W((p[0] - TGT[0]) * s, F + h, -(p[1] - TGT[1]) * s), SG = [];   // 見えている線だけを、根から順に集める
    const rec = (c, n) => { const l = L0 * Math.pow(R2, n), ls = l * s; if (ls < 0.14 || n > 44) return; if (Math.hypot((c[0] - TGT[0]) * s, (c[1] - TGT[1]) * s) - ls * 1.3 > 6.5) return;
      const d = n % 2 ? [0, 1] : [1, 0], a = [c[0] - d[0] * l / 2, c[1] - d[1] * l / 2], b = [c[0] + d[0] * l / 2, c[1] + d[1] * l / 2]; if (ls < 9) SG.push({ a, b, n, ls }); rec(a, n + 1); rec(b, n + 1); };
    rec([0, 0], 0); return { W, z, s, M, SG }; });
  const sumS = (k) => 1 - Math.pow(0.5, k + 1);

  // ===== 4) テセウスの結び目：三つ葉結び目 T(2,3)。管は 72 × 6 = 432 枚のタイル。1枚ずつ新しくなり、古いタイルは、うしろで同じ形に組み上がる（ホッブズの問い） =====
  const NU = 72, NV = 6, KR = 1.15, Kr = 0.48, TR = 0.25;
  const knot = (u) => [(KR + Kr * Co(3 * u)) * Co(2 * u), Kr * S(3 * u), (KR + Kr * Co(3 * u)) * S(2 * u)];
  const TUBE = range(NU + 1).map((i) => { const u = (i / NU) * TAU, c = knot(u), T = nrm(sub(knot(u + 0.002), knot(u - 0.002))), N1 = nrm(cross(T, [0, 1, 0])), N2 = cross(N1, T); return range(NV + 1).map((j) => { const v = (j / NV) * TAU; return [0, 1, 2].map((k) => c[k] + (N1[k] * Co(v) + N2[k] * S(v)) * TR); }); });
  const TL = []; for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) TL.push({ c: [TUBE[i][j], TUBE[i + 1][j], TUBE[i + 1][j + 1], TUBE[i][j + 1]], ax: knot(((i + 0.5) / NU) * TAU) });
  const ORD = range(TL.length).sort((a, b) => rnd(a * 5.3) - rnd(b * 5.3)), TAUT = []; ORD.forEach((p, n) => { TAUT[p] = 0.35 + (3.45 * n) / TL.length; });
  const KN = memo((t, tb) => { const W = stage(t, tb, 0.4), sp = t * 0.25, rot = (q, c) => { const x = q[0] * Co(sp) - q[2] * S(sp), z = q[0] * S(sp) + q[2] * Co(sp); return W(c[0] + x, c[1] + q[1] * Co(0.5) - z * S(0.5), c[2] + q[1] * S(0.5) + z * Co(0.5)); };   // ある時刻の、タイルの位置
    const C1 = [-0.85, F + 2.2, 0.6], C2 = [1.55, F + 2.6, -2.4], Q = [];
    TL.forEach((tl, i) => { const e = (tb - TAUT[i]) / 0.6, A1 = (q) => rot(q, C1), A2 = (q) => rot(q, C2);
      if (e < 0) { Q.push({ c: tl.c.map(A1), old: 1, cull: 1 }); return; }
      const f = io(cl(e)), arc = S(PI * f) * 1.4, mv = (q) => { const a = A1(q), b = A2(q); return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f + arc, a[2] + (b[2] - a[2]) * f]; }; Q.push({ c: tl.c.map(mv), old: 1, cull: f >= 1 });   // 古いタイルは、うしろの結び目へ
      const d = io(cl(e * 1.5)), out = (q) => { const p = [0, 1, 2].map((k) => q[k] + (q[k] - tl.ax[k]) * (1 - d) * 3); return A1(p); }; Q.push({ c: tl.c.map(out), old: 0, cull: d >= 1, a: d }); });   // 新しいタイルは、外から管に吸いつく
    return { W, Q, n: TL.filter((_, i) => tb > TAUT[i] + 0.4).length }; });

  return [
    { // 3) 二分法：H の形に、半分ずつ枝分かれしていく木。根もとから、行きつく1点へ向かって、カメラはどこまでも落ちていく。大きな枝は壁になって立ち、名前（1/2ⁿ）がつく。朱の点は、いつまでも跳びつづける
      name: 'DICHOTOMIA', bg: '#e4dccb', la: 'Dichotomia', by: 'ZENO OF ELEA · c. 450 BC', ss: [1.1, 0.5],
      data: (tb, t) => { const k = Math.floor(tb * 2.1); return ['H-TREE · 2ⁿ RAMI', 'Lₙ = L · 2^(−n/2)', 'n = ' + String(k).padStart(2, '0') + '   zoom ×' + Math.pow(2, (tb * 2.1) / 2).toFixed(2), 'Σ 1/2ⁿ = ' + sumS(k).toFixed(Math.min(14, 2 + Math.ceil(k * 0.31)))]; },
      swarm: (t, tb) => { const { M, SG } = htree(t, tb), R = [], T = SG.reduce((a, g) => a + g.ls, 0) || 1; SG.forEach((g, m) => { const k = Math.ceil((g.ls / T) * NP); for (let i = 0; i < k; i++) { const u = rnd(m * 13 + i); R.push(M([g.a[0] + (g.b[0] - g.a[0]) * u, g.a[1] + (g.b[1] - g.a[1]) * u], Math.min(0.5, g.ls * 0.22)).concat([g.n % 6 === 5 ? 1 : 0])); } }); return R.slice(0, NP); },   // 粒：枝の上
      cam: (tb, t) => ({ pitch: 0.88 + 0.07 * S(t * 0.3), dist: 10, zoom: 1.04, t: [0, F + 0.2, 0] }),
      act: (t, tb) => {
        const o = {}, { W, z, s, M, SG } = htree(t, tb);
        o.px10 = { p: W(0, F, 0), draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.lineCap = 'round';
          const big = SG.filter((g) => g.ls > 0.9).sort((p, q) => q.ls - p.ls), lines = {};   // 細い枝は線で（まとめて描く）
          SG.forEach((g) => { if (g.ls > 0.9) return; const w = Math.max(0.5, Math.min(3, g.ls * 1.4)).toFixed(1); (lines[w] = lines[w] || new Path2D()); const a = G.proj(M(g.a)), b = G.proj(M(g.b)); lines[w].moveTo(a[0], a[1]); lines[w].lineTo(b[0], b[1]); });
          ctx.globalAlpha = al; ctx.strokeStyle = INK; Object.keys(lines).forEach((w) => { ctx.lineWidth = +w; ctx.stroke(lines[w]); });
          big.forEach((g) => { const h = Math.min(1.6, g.ls * 0.22), q = [M(g.a), M(g.b), M(g.b, h), M(g.a, h)].map(G.proj); if (q.some((p) => p[2] < 0.3)) return; const [pa, bb] = poly(q);   // 太い枝は、立った壁（線のかげ）
            ctx.globalAlpha = al; ctx.fillStyle = g.n % 6 === 5 ? '#d98a6a' : PAPER; ctx.fill(pa); hatch(ctx, pa, bb, 0.55 + 0.1 * (g.n % 3), g.n % 2 ? 0.3 : 1.9, INK); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(pa);
            if (g.ls > 1.4 && g.ls < 7) TX(ctx, G, '1/' + Math.pow(2, g.n + 1), M([(g.a[0] + g.b[0]) / 2, (g.a[1] + g.b[1]) / 2], h + 0.12), al * 0.85, 0.16, g.n % 6 === 5 ? RUB : INK, 'center', 1); });
          const k = Math.floor(z), u = z - k, cpt = (n) => { let c = [0, 0]; for (let m = 0; m < n; m++) { const l = L0 * Math.pow(R2, m), d = m % 2 ? [0, 1] : [1, 0]; c = [c[0] + d[0] * PATH[m] * l / 2, c[1] + d[1] * PATH[m] * l / 2]; } return c; };   // 跳びつづける朱の点
          const a = cpt(k), b = cpt(k + 1), p = G.proj(M([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u], S(u * PI) * L0 * Math.pow(R2, k) * s * 0.35 + 0.05)); if (p[2] > 0.3) { ctx.globalAlpha = al; ctx.fillStyle = RUB; ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p[0], p[1], 5, 0, TAU); ctx.fill(); ctx.stroke(); }
          const tg = G.proj(M(TGT)); ctx.strokeStyle = RUB; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(tg[0], tg[1], 9 + 3 * S(t * 4), 0, TAU); ctx.moveTo(tg[0] - 16, tg[1]); ctx.lineTo(tg[0] + 16, tg[1]); ctx.moveTo(tg[0], tg[1] - 16); ctx.lineTo(tg[0], tg[1] + 16); ctx.stroke();   // 行きつく点（照準）
          ctx.globalAlpha = 1; } };
        return o;
      }
    },
    { // 4) テセウスの結び目：三つ葉結び目の管。タイルが1枚ずつ、外から吸いつく新しいタイル（白と朱）に替わる。はずれた古いタイルは空を飛び、うしろで、同じ結び目を組み上げる
      name: 'NODUS', bg: '#dfe3dc', la: 'Nodus Thesei', by: 'PLUTARCH · HOBBES · 1655', ss: [1.0, 0.45],
      data: (tb, t) => { const { n } = KN(t, tb); return ['TREFOIL KNOT T(2,3)', 'π₁ = ⟨a, b | a² = b³⟩', 'tabulae ' + String(n).padStart(3, '0') + ' / ' + TL.length, n >= TL.length ? 'quae est nodus Thesei ?' : 'identitas · ' + (1 - n / TL.length).toFixed(3)]; },
      swarm: (t, tb) => KN(t, tb).Q.map((q) => [0, 1, 2].map((k) => (q.c[0][k] + q.c[2][k]) / 2).concat([q.old ? 0 : 1])),   // 粒：タイルのまん中
      cam: (tb, t) => ({ pitch: 0.3 + 0.05 * S(t * 0.4), dist: 10.4, zoom: 1.0, t: [0, F + 2.0, -0.6] }),
      act: (t, tb) => {
        const o = {}, { W, Q } = KN(t, tb), Lt = nrm([0.4, 1, 0.6]);
        o.px11 = { p: W(0, F, 0), z: -40, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.globalAlpha = 0.5 * al; ctx.strokeStyle = SEPIA; ctx.lineWidth = 0.7; ctx.beginPath();   // 床の、等角の方眼
          for (let k = -9; k <= 9; k++) { [[k * 0.5, -4.5, k * 0.5, 4.5], [-4.5, k * 0.5, 4.5, k * 0.5]].forEach(([x0, z0, x1, z1]) => { const a = G.proj(W(x0, F, z0)), b = G.proj(W(x1, F, z1)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }); } ctx.stroke(); ctx.globalAlpha = 1; } };
        o.px12 = { p: W(0, F + 2.2, -0.8), draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; const cam = G.camPos, L = [];
          Q.forEach((q) => { const n = nrm(cross(sub(q.c[1], q.c[0]), sub(q.c[3], q.c[0]))), m = [0, 1, 2].map((k) => (q.c[0][k] + q.c[2][k]) / 2), fc = dot(n, sub(cam, m)); if (q.cull && fc < 0) return; L.push({ q, m, l: Math.abs(dot(n, Lt)), back: fc < 0, z: dot(sub(m, cam), sub(m, cam)) }); });
          L.sort((a, b) => b.z - a.z); ctx.lineJoin = 'round';
          L.forEach(({ q, l, back }) => { const P = q.c.map(G.proj); if (P.some((p) => p[2] < 0.3)) return; const [pa] = poly(P), k = l * (back ? 0.5 : 1); ctx.globalAlpha = al * (q.a === undefined ? 1 : q.a);
            ctx.fillStyle = q.old ? 'rgb(' + [70, 54, 36].map((v) => Math.round(v + k * 80)).join(',') + ')' : 'rgb(' + [196, 188, 170].map((v) => Math.round(v + k * 55)).join(',') + ')'; ctx.fill(pa); ctx.strokeStyle = q.old ? INK : RUB; ctx.lineWidth = q.old ? 0.7 : 0.9; ctx.stroke(pa); });
          ctx.globalAlpha = 1; } };
        return o;
      }
    }
  ];
};
