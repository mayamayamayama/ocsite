// hero-philo4.js — 入場画面「哲学」のショット 5〜6（hero-philo.js の続き）
// 5) 万物は流転する（墨流し：インクを落とし、くしでひっかく。模様は、数式でその場で計算）　6) ライフゲーム（4つの決まりだけで「生き物」が生まれる。世代を、上へ積み重ねる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-philo4');

window.OC_PHILO4 = function (E) {
  const { NP, vis, cap, K, PAPER, INK, RUB, SEPIA, LAPIS, SERIF, stage, hatch, poly, hull, solid, dot } = E, { S, Co, PI, TAU, cl, io, range, rnd, fr, nrm } = K;
  const F = -2.0;

  // ===== 5) 墨流し（マーブリング）。数学的な墨流し（Jaffer & Lu, 2012）の式で、インクの輪をゆがめる =====
  // 落としたインクの輪：まわりの線を、外へ押しのける　P' = C + (P − C)·√(1 + r² / |P − C|²)
  // くしでひっかく：線からの距離 d が近いほど、大きく動く　P' = P + z·(1/2)^(d / c)·M
  const PALS = [[INK, '#f1e9d6', RUB, '#f1e9d6'], [LAPIS, '#f1e9d6', '#c8902e', INK], [RUB, INK, '#f1e9d6', LAPIS], ['#c8902e', LAPIS, '#f1e9d6', RUB], [INK, '#c8902e', '#f1e9d6', LAPIS], [LAPIS, RUB, '#f1e9d6', INK]];
  const DROPS = []; [[-1.6, 0.7], [1.3, -0.5], [0.1, 1.15], [-0.6, -0.9], [1.9, 1.0], [-2.2, -0.5]].forEach(([x, y], s) => range(4).forEach((k) => DROPS.push({ t: 0.15 + s * 0.33 + k * 0.07, c: [x + (rnd(s * 9 + k) - 0.5) * 0.08, y + (rnd(s * 7 + k) - 0.5) * 0.08], r: 0.56 - k * 0.11, col: PALS[s][k] })));   // 6か所に4滴ずつ
  const TINES = [{ t: 2.3, d: 0.75, m: [1, 0], z: 0.7, sp: 0.42, c: 0.08 }, { t: 3.1, d: 0.75, m: [0, -1], z: 0.55, sp: 0.32, c: 0.07 }, { t: 3.85, d: 0.6, m: [1, 0], z: -0.45, sp: 0.6, c: 0.12 }];   // くしを3回
  const NPT = 160, circ = (c, r) => range(NPT).map((i) => [c[0] + Co((i / NPT) * TAU) * r, c[1] + S((i / NPT) * TAU) * r]);
  const marble = (tb) => {   // tb の時点の、すべての輪の形（最初の輪から順に。あとの操作ほど、前の輪をゆがめる）
    const ops = []; DROPS.forEach((d) => { if (tb > d.t) ops.push({ t: d.t, k: 'd', c: d.c, r: d.r * Math.sqrt(io(cl((tb - d.t) / 0.4))) }); });
    TINES.forEach((q) => { if (tb > q.t) ops.push({ t: q.t, k: 't', q, z: q.z * io(cl((tb - q.t) / q.d)) }); });
    if (tb > 4.45) ops.push({ t: 4.45, k: 's', a: 1.4 * io(cl((tb - 4.45) / 0.8)) });
    ops.sort((a, b) => a.t - b.t);
    return DROPS.filter((d) => tb > d.t).map((d) => { let P = circ(d.c, Math.max(0.001, d.r * Math.sqrt(io(cl((tb - d.t) / 0.4)))));
      ops.forEach((op) => { if (op.t <= d.t) return;
        if (op.k === 'd') P = P.map((p) => { const dx = p[0] - op.c[0], dy = p[1] - op.c[1], q = Math.sqrt(1 + (op.r * op.r) / (dx * dx + dy * dy + 1e-9)); return [op.c[0] + dx * q, op.c[1] + dy * q]; });
        else if (op.k === 't') { const m = op.q.m, n = [-m[1], m[0]], sp = op.q.sp; P = P.map((p) => { const w = (((p[0] * n[0] + p[1] * n[1]) % sp) + sp) % sp, dd = Math.min(w, sp - w), f = op.z * Math.pow(0.5, dd / op.q.c); return [p[0] + m[0] * f, p[1] + m[1] * f]; }); }
        else P = P.map((p) => { const r = Math.hypot(p[0], p[1]), a = op.a * Math.exp(-r / 1.2), c = Co(a), s = S(a); return [p[0] * c - p[1] * s, p[0] * s + p[1] * c]; }); });
      return { P, col: d.col }; }); };
  let mC = { tb: -1 }; const marbleM = (tb) => { if (mC.tb !== tb) mC = { tb, r: marble(tb) }; return mC.r; };   // 同じ時刻なら、計算は1回だけ
  const TRAY = [[-3.1, -2.15], [3.1, -2.15], [3.1, 2.15], [-3.1, 2.15]];

  // ===== 6) ライフゲーム（コンウェイ、1970）。生きているマスのまわりに、生きているマスが 2 か 3 なら生き残る。3 なら生まれる =====
  const NG = 44, GEN = []; { let g = new Uint8Array(NG * NG); const put = (x, y, P) => P.forEach(([a, b]) => { g[((y + b + NG) % NG) * NG + ((x + a + NG) % NG)] = 1; });
    put(2, 2, [].concat(...['........................O', '......................O.O', '............OO......OO............OO', '...........O...O....OO............OO', 'OO........O.....O...OO', 'OO........O...O.OO....O.O', '..........O.....O.......O', '...........O...O', '............OO'].map((r, y) => [...r].map((c, x) => (c === 'O' ? [x, y] : null)).filter(Boolean))));   // ゴスパーのグライダー銃（30世代ごとに、グライダーを撃ち出す）
    for (let y = 22; y < 36; y++) for (let x = 16; x < 32; x++) if (rnd(x * 31 + y * 17) < 0.33) g[y * NG + x] = 1;   // でたらめな「スープ」
    put(34, 14, [[1, 0], [2, 0], [0, 1], [1, 1], [1, 2]]);   // R ペントミノ（5マスなのに、長く暴れつづける）
    [[38, 30], [6, 36]].forEach(([x, y], i) => put(x, y, i % 2 ? [[0, 0], [1, 0], [2, 0], [2, 1], [1, 2]] : [[1, 0], [2, 1], [0, 2], [1, 2], [2, 2]]));   // グライダー（歩くように進む）
    for (let n = 0; n < 48; n++) { GEN.push(g); const h = new Uint8Array(NG * NG); for (let y = 0; y < NG; y++) for (let x = 0; x < NG; x++) { let c = 0; for (let b = -1; b <= 1; b++) for (let a = -1; a <= 1; a++) if (a || b) c += g[((y + b + NG) % NG) * NG + ((x + a + NG) % NG)]; const v = g[y * NG + x]; h[y * NG + x] = c === 3 || (v && c === 2) ? 1 : 0; } g = h; } }
  const CS = 0.112, LH = 0.11, gen = (tb) => Math.min(40, Math.floor(tb * 4));

  return [
    { // 5) 万物は流転する：水に浮かべたインク。輪を落とすたびに、前の輪が押し広げられる。くしでひっかくと、羽根のような模様に。最後は、ゆっくり渦を巻く
      name: 'RHEI', bg: '#d8d2c2', la: 'Panta rhei', by: 'HERACLITUS · c. 500 BC', ss: [1.0, 0.4],
      data: (tb) => ['GUTTAE ' + String(DROPS.filter((d) => tb > d.t).length).padStart(2, '0') + ' · PECTINES ' + TINES.filter((q) => tb > q.t).length, "P' = C + (P−C)·√(1 + r²/|P−C|²)", "P' = P + z · (½)^(d/c) · M", 'πάντα ῥεῖ'],
      swarm: (t, tb) => { const W = stage(t, tb, 0.3), M = (p, h) => W(p[0], F + h, -p[1]), res = marbleM(tb), ND = DROPS.length;   // 粒：まず、しずくの形で空に浮かび、落ちると、インクの輪のふちに乗る（輪がゆがむと、いっしょに流れる）
        return range(NP).map((i) => { const j = i % ND, m = Math.floor(i / ND), d = DROPS[j], n = DROPS.filter((q) => tb > q.t).indexOf(d);
          if (n >= 0) { const P = res[n].P; return M(P[Math.floor((m * P.length) / Math.ceil(NP / ND)) % P.length], 0.02).concat([d.col === RUB ? 1 : 0]); }
          const h = Math.max(0.05, 2.6 - (tb - d.t + 0.55) * 6), a = rnd(i * 3) * TAU, r = 0.09 * Math.sqrt(rnd(i * 5)); return M([d.c[0] + Co(a) * r, d.c[1] + S(a) * r], h + (rnd(i * 7) - 0.5) * 0.15).concat([d.col === RUB ? 1 : 0]); }); },
      cam: (tb, t) => ({ pitch: 0.92 + 0.08 * S(t * 0.3), dist: 9.6, zoom: 1.08, t: [0, F, 0.2] }),
      act: (t, tb) => {
        const o = {}, W = stage(t, tb, 0.3), M = (p, h = 0.012) => W(p[0], F + h, -p[1]);
        o.px13 = { p: W(0, F, 0), draw: (ctx, G, ac) => { const al = vis(tb); if (al <= 0) return; ctx.globalAlpha = al;
          const tq = TRAY.map((p) => G.proj(M(p, 0))); if (tq.some((p) => p[2] < 0.3)) return; const [tp] = poly(tq); ctx.fillStyle = '#f1e9d6'; ctx.fill(tp);   // 水の面
          ctx.save(); ctx.clip(tp); marbleM(tb).forEach(({ P, col }) => { const [pp] = poly(P.map((p) => G.proj(M(p)))); ctx.fillStyle = col; ctx.fill(pp); ctx.strokeStyle = 'rgba(23,19,14,.25)'; ctx.lineWidth = 0.6; ctx.stroke(pp); });
          TINES.forEach((q) => { if (tb < q.t || tb > q.t + q.d + 0.15) return; const u = cl((tb - q.t) / q.d), n = [-q.m[1], q.m[0]]; ctx.strokeStyle = INK; ctx.lineWidth = 1.4; ctx.beginPath();   // くしの歯（線を引いていく）
            for (let k = -8; k <= 8; k++) { const o0 = k * q.sp, a = [n[0] * o0 - q.m[0] * 3.4, n[1] * o0 - q.m[1] * 3.4], b = [a[0] + q.m[0] * 6.8 * u, a[1] + q.m[1] * 6.8 * u], pa = G.proj(M(a, 0.05)), pb = G.proj(M(b, 0.05)); ctx.moveTo(pa[0], pa[1]); ctx.lineTo(pb[0], pb[1]); } ctx.stroke(); });
          ctx.restore();
          const fr0 = [[-3.3, -2.35], [3.3, -2.35], [3.3, 2.35], [-3.3, 2.35]], sides = [[0, 1], [1, 2], [2, 3], [3, 0]];   // 木の枠
          sides.forEach(([i, j], m) => { const a = fr0[i], b = fr0[j], c = TRAY[j], d = TRAY[i], V = [a, b, c, d].map((p) => M(p, 0)).concat([a, b, c, d].map((p) => M(p, 0.18))); solid(ctx, G, V, hull(V), () => nrm([0.4, 1, 0.5]), { fill: '#b88a56', amb: 0.3, ang: m * 0.8, lw: 1, al }); });
          const g = G.proj(M([0, -2.75], 0)), k = G.f / g[2]; ctx.fillStyle = INK; ctx.globalAlpha = al * 0.8; ctx.textAlign = 'center'; ctx.font = (0.3 * k).toFixed(1) + 'px ' + SERIF; ctx.fillText('ΠΑΝΤΑ ΡΕΙ', g[0], g[1]); ctx.textAlign = 'left'; ctx.globalAlpha = 1; } };
        return o;
      }
    },
    { // 6) ライフゲーム：44 × 44 のマスで（グライダー銃つき）、4つの決まりだけをくり返す。世代を上へ積むと、時間がそのまま形になる。グライダーの通り道は、ななめの管になる
      name: 'LIFE', bg: '#e9e1cf', la: 'Ludus Vitae', by: 'J. H. CONWAY · 1970', ss: [1.2, 0.5],
      data: (tb) => { const g = gen(tb); return ['B3 / S23 · ' + NG + ' × ' + NG, 'generatio ' + String(g).padStart(2, '0') + ' · ' + GEN[g].reduce((s, v) => s + v, 0) + ' vivae', 'GOSPER GUN · p30 · R-PENTOMINO', 'emergentia']; },
      swarm: (t, tb) => { const W = stage(t, tb, 0.35), g = gen(tb), G0 = GEN[g], live = []; for (let n = 0; n < NG * NG; n++) if (G0[n]) live.push(n); if (!live.length) return [];   // 粒：いま生きているマスの、角
        return range(NP).map((i) => { const n = live[i % live.length], c = Math.floor(i / live.length) % 4, x = (n % NG) + (c === 1 || c === 2 ? 0.9 : 0.1), y = Math.floor(n / NG) + (c >= 2 ? 0.9 : 0.1); return W((x - NG / 2) * CS, F + (g + 1) * LH + 0.01, (y - NG / 2) * CS).concat([c === 0 ? 1 : 0]); }); },
      cam: (tb, t) => ({ pitch: 0.48 + 0.06 * S(t * 0.4), dist: 10.2, zoom: 1.0, t: [0, F + 0.4 + LH * gen(tb) * 0.55, 0] }),
      act: (t, tb) => {
        const o = {}, W = stage(t, tb, 0.35), g = gen(tb), at = (i, j, h) => W((i - NG / 2) * CS, F + h, (j - NG / 2) * CS);
        o.px20 = { p: W(0, F + LH * g * 0.5, 0), draw: (ctx, G, ac) => { const al = vis(tb); if (al <= 0) return;
          const base = [at(0, 0, 0), at(NG, 0, 0), at(NG, NG, 0), at(0, NG, 0)].map(G.proj); if (base.some((p) => p[2] < 0.3)) return; const [bp, bb] = poly(base);   // 台の板（方眼）
          ctx.globalAlpha = al; ctx.fillStyle = '#f3ecdc'; ctx.fill(bp); ctx.strokeStyle = 'rgba(23,19,14,.18)'; ctx.lineWidth = 0.6; ctx.beginPath(); for (let i = 0; i <= NG; i += 2) { const a = G.proj(at(i, 0, 0)), b = G.proj(at(i, NG, 0)), c = G.proj(at(0, i, 0)), d = G.proj(at(NG, i, 0)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); } ctx.stroke(); ctx.strokeStyle = INK; ctx.lineWidth = 1.2; ctx.stroke(bp);
          for (let L = 0; L <= g; L++) { const h = L * LH, O = G.proj(at(0, 0, h)), X = G.proj(at(1, 0, h)), Y = G.proj(at(0, 1, h)), du = [X[0] - O[0], X[1] - O[1]], dv = [Y[0] - O[0], Y[1] - O[1]], age = g - L, cur = age === 0, G0 = GEN[L];   // 1つの世代 = 1つの層（下ほど古い）
            const top = new Path2D(), side = new Path2D(), Oh = cur ? G.proj(at(0, 0, h + LH)) : O, sh = [Oh[0] - O[0], Oh[1] - O[1]];
            for (let j = 0; j < NG; j++) for (let i = 0; i < NG; i++) { if (!G0[j * NG + i]) continue; const x = Oh[0] + du[0] * i + dv[0] * j, y = Oh[1] + du[1] * i + dv[1] * j, s = cur ? 1 : 0.86, e = cur ? 0 : 0.07;
              top.moveTo(x + du[0] * e + dv[0] * e, y + du[1] * e + dv[1] * e); top.lineTo(x + du[0] * s + dv[0] * e, y + du[1] * s + dv[1] * e); top.lineTo(x + du[0] * s + dv[0] * s, y + du[1] * s + dv[1] * s); top.lineTo(x + du[0] * e + dv[0] * s, y + du[1] * e + dv[1] * s); top.closePath();
              if (cur) { const bx = x - sh[0], by = y - sh[1]; side.moveTo(x + dv[0], y + dv[1]); side.lineTo(x + du[0] + dv[0], y + du[1] + dv[1]); side.lineTo(bx + du[0] + dv[0], by + du[1] + dv[1]); side.lineTo(bx + dv[0], by + dv[1]); side.closePath(); } }
            const f = Math.pow(0.86, age); ctx.globalAlpha = al * (cur ? 1 : 0.25 + 0.6 * f);
            if (cur) { ctx.fillStyle = '#6a2a1a'; ctx.fill(side); ctx.fillStyle = RUB; ctx.fill(top); ctx.strokeStyle = INK; ctx.lineWidth = 0.9; ctx.stroke(top); }   // 今の世代（朱の箱）
            else { ctx.fillStyle = age < 3 ? INK : age < 9 ? '#4a3a2a' : SEPIA; ctx.fill(top); } }
          ctx.globalAlpha = 1; } };
        return o;
      }
    }
  ];
};
