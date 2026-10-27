// hero-philo5.js — 入場画面「哲学」のショット 7〜8（hero-philo.js の続き）
// 7) バベルの図書館（六角形の部屋が、上にも下にも、どこまでも続く。カメラは吹き抜けの中に入る）　8) 永劫回帰（メビウスの帯の上を、言葉が終わりなく流れる）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-philo5');

window.OC_PHILO5 = function (E) {
  const { NP, vis, cap, K, PAPER, INK, RUB, SEPIA, LAPIS, SERIF, MIN, mk, stage, poly, dot } = E, { S, Co, PI, TAU, cl, io, range, rnd, fr, sub } = K;
  const F = -2.0;
  // 絵（img）を、曲がった面に貼る。P(u, v) が面の上の点（u, v は 0〜1）。cull：裏を向いた所は描かない。fog：暗さ（0〜0.9）
  const sheet = (ctx, G, img, P, nu, nv, al, fog, cull) => { const Q = range(nv + 1).map((j) => range(nu + 1).map((i) => G.proj(P(i / nu, j / nv)))), sw = img.width / nu, sh = img.height / nv, d = G.dpr, m = nv >> 1, back = [];
    for (let i = 0; i < nu; i++) { const a = Q[m][i], b = Q[m][i + 1], c = Q[m + 1][i]; back[i] = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0; }
    ctx.save(); ctx.globalAlpha = al;
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { if (cull && back[i]) continue; const a = Q[j][i], b = Q[j][i + 1], c = Q[j + 1][i]; if (a[2] < 0.3 || b[2] < 0.3 || c[2] < 0.3 || Q[j + 1][i + 1][2] < 0.3) continue;
      ctx.setTransform((d * (b[0] - a[0])) / sw, (d * (b[1] - a[1])) / sw, (d * (c[0] - a[0])) / sh, (d * (c[1] - a[1])) / sh, d * a[0], d * a[1]); ctx.drawImage(img, i * sw, j * sh, sw + 0.8, sh + 0.8, 0, 0, sw + 0.8, sh + 0.8); }
    ctx.restore(); if (fog > 0.02) { ctx.fillStyle = 'rgba(14,11,8,' + Math.min(0.92, fog) * al + ')'; for (let i = 0; i < nu; i++) { if (cull && back[i]) continue; const pts = range(nv + 1).map((j) => Q[j][i]).concat(range(nv + 1).map((j) => Q[nv - j][i + 1])); if (pts.some((p) => p[2] < 0.3)) continue; ctx.fill(poly(pts)[0]); } } };

  // ===== 7) バベルの図書館（ボルヘス、1941）：すべての本は 410 ページ。使われる記号は 25 個。ありうる文字の並びは、すべてどこかの棚にある =====
  const SHELF = [0, 1].map((v) => mk(512, 300, (c, w, h) => { c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h);
    for (let r = 0; r < 5; r++) { const y0 = 12 + r * 57; c.fillStyle = '#5a3a20'; c.fillRect(0, y0 + 50, w, 7); let x = 6;   // 5段の棚（両わきの壁に、5段ずつ）
      while (x < w - 8) { const bw = 7 + rnd(x * 1.3 + r * 77 + v * 999) * 10, bh = 36 + rnd(x * 2.1 + r * 31 + v * 11) * 13, col = ['#7a2a1a', '#2a3a5a', '#6a5a2a', '#3a4a2a', '#8a6a3a', '#4a2a3a', '#b89a6a'][Math.floor(rnd(x * 3.7 + r + v * 3) * 7)];
        c.fillStyle = col; c.fillRect(x, y0 + 50 - bh, bw - 1, bh); c.fillStyle = 'rgba(230,190,110,.55)'; c.fillRect(x, y0 + 50 - bh + 5, bw - 1, 1.2); c.fillRect(x, y0 + 50 - 7, bw - 1, 1.2); c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(x + bw - 2, y0 + 50 - bh, 1, bh); x += bw; } }
    c.strokeStyle = '#1a0f08'; c.lineWidth = 8; c.strokeRect(0, 0, w, h); }));
  const DOOR = mk(256, 300, (c, w, h) => { c.fillStyle = '#2a1a10'; c.fillRect(0, 0, w, h); c.fillStyle = '#0a0705'; c.fillRect(70, 40, 116, 260); c.strokeStyle = '#6a4a2a'; c.lineWidth = 6; c.strokeRect(70, 40, 116, 262); c.fillStyle = '#5a3a20'; for (let y = 60; y < 300; y += 22) c.fillRect(96, y, 64, 3); });   // 細い通路と、らせん階段
  const FOGL = [0, 0.3, 0.55, 0.78], fogged = (img) => FOGL.map((f) => mk(img.width, img.height, (c, w, h) => { c.drawImage(img, 0, 0); c.fillStyle = 'rgba(14,11,8,' + f + ')'; c.fillRect(0, 0, w, h); })), TEX = [fogged(SHELF[0]), fogged(SHELF[1]), fogged(DOOR)];   // 遠いほど暗い絵を、先に作っておく
  const HR = 2.4, HI = 1.55, LV = 1.35, NL = 5, hx = (r, k) => [Co((k / 6) * TAU + PI / 6) * r, S((k / 6) * TAU + PI / 6) * r];
  const ABC = 'ABCDEFGHILMNOPQRSTVXYZ., ', EGG = 'OC ARCHIVE';   // 25 個の記号（22 文字・ピリオド・コンマ・空白）

  // ===== 8) 永劫回帰（ニーチェ『ツァラトゥストラはこう語った』1883）：メビウスの帯は、裏と表がつながっている。言葉は 2 周してもとにもどる =====
  const QUOTE = 'ALLES GEHT, ALLES KOMMT ZURÜCK; EWIG ROLLT DAS RAD DES SEINS  ✦  ';
  const BAND = mk(4096, 150, (c, w, h) => { c.fillStyle = '#efe7d4'; c.fillRect(0, 0, w, h); c.fillStyle = RUB; c.fillRect(0, 10, w, 5); c.fillRect(0, h - 15, w, 5); c.fillStyle = INK; c.fillRect(0, 22, w, 1.5); c.fillRect(0, h - 23, w, 1.5);
    c.font = '600 72px ' + SERIF; c.textBaseline = 'middle'; const tw = c.measureText(QUOTE).width, n = Math.max(1, Math.round(w / tw)); c.save(); c.scale(w / (n * tw), 1); for (let i = 0; i < n; i++) c.fillText(QUOTE, i * tw, h / 2 + 3); c.restore(); });
  const BQ = range(4).map((k) => mk(1024, 150, (c) => c.drawImage(BAND, -k * 1024, 0)));   // 帯の絵を4つに分ける（奥と手前で、描く順番を変えるため）
  const MR = 2.45, MW = 0.36, mob = (a, v) => [(MR + v * Co(a / 2)) * Co(a), v * S(a / 2), (MR + v * Co(a / 2)) * S(a)];
  const mobX = (t, tb) => { const W = stage(t, tb, 0.15), C = [0, F + 2.2, 0], tilt = 0.3 + 0.1 * S(t * 0.4), spin = t * 0.12;   // 帯の、ある時刻の向き
    return { W, C, sh: fr(t * 0.035), X: (q) => { const y1 = q[1] * Co(tilt) - q[2] * S(tilt), z1 = q[1] * S(tilt) + q[2] * Co(tilt), x2 = q[0] * Co(spin) - z1 * S(spin), z2 = q[0] * S(spin) + z1 * Co(spin); return W(x2, C[1] + y1, z2); } }; };
  // ローレンツ方程式（1963）：dx/dt = σ(y − x)、dy/dt = x(ρ − z) − y、dz/dt = xy − βz。ほんの少しだけちがう2つの点から、同時に計算する
  const LZ = (p0) => { let [x, y, z] = p0; const P = []; for (let i = 0; i < 7300; i++) { for (let k = 0; k < 2; k++) { const dx = 10 * (y - x), dy = x * (28 - z) - y, dz = x * y - (8 / 3) * z; x += dx * 0.004; y += dy * 0.004; z += dz * 0.004; } if (i >= 300) P.push([x, y, z]); } return P; };
  const LA = LZ([1, 1, 1]), LB = LZ([1.0001, 1, 1]), lz = (q) => [q[0] * 0.07, (q[2] - 24) * 0.07, q[1] * 0.07], nOf = (tb) => Math.min(LA.length - 1, 300 + Math.floor((cl(tb / 5) * (LA.length - 300))));

  return [
    { // 7) バベルの図書館：カメラは六角形の吹き抜けの中へ。底の見えない下から、果てのない上まで、ゆっくり見上げていく。宙を回る文字は、でたらめ。でも、どこかに「OC ARCHIVE」が
      name: 'BABEL', bg: '#120e0a', la: 'La biblioteca de Babel', by: 'J. L. BORGES · 1941', pc: '#e8dcc0', ss: [1.3, 0.6],
      swarm: (t, tb) => range(NP).map((i) => { const u = i / NP, a = u * TAU * 9 + tb * 0.5 + (i % 2) * PI, r = 0.85 + 0.35 * rnd(i * 3), y = -4.6 + ((u * 9.5 + tb * 0.3) % 9.5); return [Co(a) * r, y, S(a) * r, i % 23 === 0 ? 1 : 0]; }),   // 粒：吹き抜けを、らせんにのぼるちり
      data: (tb, t) => ['ALPHABETUM · 25 SYMBOLA', '410 pp. · 40 × 80 · libri 25^1312000', 'hexagona ∞ · gradus ∞', range(26).map((i) => ABC[Math.floor(rnd(i * 7 + Math.floor(t * 6)) * 25)]).join('')],
      cam: (tb, t) => { const e = io(cl((tb - 0.2) / 4.6)); return { pitch: 1.15 - 1.35 * e, dist: 0.9, zoom: 6.6, t: [0, -1.6 + 4.2 * e, 0], tilt: 0.3, wob: 0 }; },   // 底なしの下をのぞきこみながら、上の階へのぼっていく
      act: (t, tb) => {
        const o = {};
        o.px21 = { p: [0, 0, 0], draw: (ctx, G, ac) => { const al = vis(tb); if (al <= 0) return; const cam = G.camPos, Lq = [];
          for (let L = -NL; L <= NL; L++) { const y0 = L * LV, fd = (p) => Math.min(0.9, Math.abs(p[1] - cam[1]) / 9 + Math.hypot(p[0] - cam[0], p[2] - cam[2]) / 30);
            for (let k = 0; k < 6; k++) { const a = hx(HR, k), b = hx(HR, k + 1), door = (k + (L & 1)) % 3 === 0, P = (u, v) => [a[0] + (b[0] - a[0]) * u, y0 + 0.12 + (LV - 0.12) * (1 - v), a[1] + (b[1] - a[1]) * u], m = P(0.5, 0.5);   // 壁（本棚 4 面、通路 2 面）
              const fg = fd(m), cq = [P(0, 0), P(1, 0), P(1, 1), P(0, 1)].map(G.proj), cw = ctx.canvas.width / G.dpr, ch = ctx.canvas.height / G.dpr, off = cq.every((q) => q[2] < 0.3) || cq.every((q) => q[0] < 0) || cq.every((q) => q[0] > cw) || cq.every((q) => q[1] < 0) || cq.every((q) => q[1] > ch);   // 画面の外の壁は、描かない
              if (fg < 0.9 && !off) Lq.push({ z: dot(sub(m, cam), sub(m, cam)), f: () => sheet(ctx, G, TEX[door ? 2 : (k + L + 6) % 2][Math.min(3, Math.round(fg / 0.26))], P, 3, 2, al, 0, false) });
              const ia = hx(HI, k), ib = hx(HI, k + 1), sl = [[a[0], y0, a[1]], [b[0], y0, b[1]], [ib[0], y0, ib[1]], [ia[0], y0, ia[1]]], ms = [(a[0] + ib[0]) / 2, y0, (a[1] + ib[1]) / 2];   // 床（手すりまで）
              Lq.push({ z: dot(sub(ms, cam), sub(ms, cam)) - 0.5, f: () => { const pp = sl.map(G.proj); if (pp.some((p) => p[2] < 0.3)) return; const [path] = poly(pp), fg = fd(ms); ctx.globalAlpha = al; ctx.fillStyle = 'rgb(' + [70, 48, 30].map((c) => Math.round(c * (1 - fg) + 14 * fg)).join(',') + ')'; ctx.fill(path);
                const r0 = G.proj([ia[0], y0 + 0.45, ia[1]]), r1 = G.proj([ib[0], y0 + 0.45, ib[1]]), q0 = G.proj([ia[0], y0, ia[1]]), q1 = G.proj([ib[0], y0, ib[1]]); ctx.strokeStyle = 'rgba(190,150,90,' + (1 - fg) * 0.9 + ')'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(r0[0], r0[1]); ctx.lineTo(r1[0], r1[1]); ctx.moveTo(q0[0], q0[1]); ctx.lineTo(q1[0], q1[1]);
                for (let s = 0; s <= 6; s++) { const u = s / 6; ctx.moveTo(q0[0] + (q1[0] - q0[0]) * u, q0[1] + (q1[1] - q0[1]) * u); ctx.lineTo(r0[0] + (r1[0] - r0[0]) * u, r0[1] + (r1[1] - r0[1]) * u); } ctx.stroke(); } });   // 低い手すり
              if (door) { const lp = [(a[0] + b[0]) * 0.47, y0 + LV * 0.78, (a[1] + b[1]) * 0.47]; Lq.push({ z: dot(sub(lp, cam), sub(lp, cam)) - 0.2, f: () => { const c = G.proj(lp), fg = fd(lp); if (c[2] < 0.3 || fg > 0.7) return; const r = Math.min(150, (G.f * 0.32) / c[2]), g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], r);   // 丸い「ランプ」
                g.addColorStop(0, 'rgba(255,225,160,' + (1 - fg) + ')'); g.addColorStop(0.25, 'rgba(255,170,80,' + 0.5 * (1 - fg) + ')'); g.addColorStop(1, 'rgba(255,140,40,0)'); ctx.save(); ctx.globalAlpha = al; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(c[0] - r, c[1] - r, 2 * r, 2 * r); ctx.restore(); } }); } } }
          Lq.sort((a, b) => b.z - a.z).forEach((q) => q.f());
          ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const lock = cl((tb - 2.6) / 0.6);   // 宙を回る、でたらめな文字の輪（「OC ARCHIVE」だけは、朱で止まる）
          for (let i = 0; i < 44; i++) { const a = (i / 44) * TAU + t * 0.15, p = [Co(a) * 1.05, 0.15 + 0.06 * S(t * 2 + i), S(a) * 1.05], c = G.proj(p); if (c[2] < 0.3) continue; const e = i >= 17 && i < 27 && lock > rnd(i) * 0.9, ch = e ? EGG[i - 17] : ABC[Math.floor(rnd(i * 13 + Math.floor(t * 9 + i * 0.3)) * 25)];
            ctx.globalAlpha = al * Math.min(1, 6 / c[2]); ctx.fillStyle = e ? '#ff7a50' : '#e8dcc0'; ctx.font = (e ? 'bold ' : '') + ((G.f * 0.16) / c[2]).toFixed(1) + 'px ' + SERIF; ctx.fillText(ch, c[0], c[1]); }
          ctx.restore(); } };
        return o;
      }
    },
    { // 8) 永劫回帰：ローレンツのアトラクタ。ほとんど同じところから出た2本の軌道（墨と朱）が、蝶の羽のような2つの輪を、永遠に回りつづける。はじめは重なっているが、やがて離れ、二度と同じ道には戻らない。まわりを「すべては去り、すべては還る」の帯が回る
      name: 'AETERNUM', bg: '#e6dcc6', la: 'Die ewige Wiederkunft', by: 'F. NIETZSCHE · 1883', ss: [1.1, 0.5],
      data: (tb) => { const n = nOf(tb), a = LA[n], b = LB[n], d = Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); return ['LORENZ 1963 · σ 10 · ρ 28 · β 8/3', '(' + a.map((v) => v.toFixed(2)).join(', ') + ')', '|Δ| = ' + (d < 0.01 ? d.toExponential(2) : d.toFixed(3)) + '   Δ₀ = 1e-4', 'ewig rollt das Rad des Seins']; },
      swarm: (t, tb) => { const { X } = mobX(t, tb), n = nOf(tb), R = range(900).map((i) => X(lz(LA[Math.floor((i / 900) * n)])).concat([0])); range(300).forEach((i) => R.push(X(mob((i / 300) * 2 * TAU + tb * 0.5, (i % 2 ? 1 : -1) * MW * cl(tb / 1.4))).concat([i % 9 === 0 ? 1 : 0]))); return R; },   // 粒：軌道の上と、帯のふち
      cam: (tb, t) => ({ pitch: 0.34 + 0.1 * S(t * 0.35), dist: 10, zoom: 1.08, t: [0, F + 2.0, 0] }),
      act: (t, tb) => {
        const o = {}, { W, C, X, sh } = mobX(t, tb), n = nOf(tb), grow = cl(tb / 1.4);
        o.px30 = { p: W(0, F, 0), z: -20, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.globalAlpha = al * 0.45; ctx.strokeStyle = SEPIA; ctx.lineWidth = 0.6; ctx.beginPath();   // 床に落ちる、軌道の影
          for (let i = 0; i <= n; i += 3) { const q = X(lz(LA[i])), p = G.proj([q[0], F + 0.01, q[2]]); ctx[i ? 'lineTo' : 'moveTo'](p[0], p[1]); } ctx.stroke(); ctx.globalAlpha = 1; } };
        o.px31 = { p: C.slice(), draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return; ctx.lineJoin = 'round'; ctx.lineCap = 'round';   // 2本の軌道（古い所はうすく、新しい所は太く）
          [[LB, RUB, 0.55], [LA, INK, 0.75]].forEach(([Lz, col, a0]) => { const Pp = new Path2D(), Pn = new Path2D(), k0 = Math.max(0, n - 500); for (let i = 0; i <= n; i += i < k0 ? 2 : 1) { const p = G.proj(X(lz(Lz[i]))); if (i < k0) Pp[i ? 'lineTo' : 'moveTo'](p[0], p[1]); else { if (i === k0) { Pp.lineTo(p[0], p[1]); Pn.moveTo(p[0], p[1]); } else Pn.lineTo(p[0], p[1]); } }
            ctx.strokeStyle = col; ctx.globalAlpha = al * a0 * 0.6; ctx.lineWidth = 0.7; ctx.stroke(Pp); ctx.globalAlpha = al; ctx.lineWidth = 1.7; ctx.stroke(Pn); });
          const a = G.proj(X(lz(LA[n]))), b = G.proj(X(lz(LB[n]))); ctx.globalAlpha = al; ctx.setLineDash([3, 3]); ctx.strokeStyle = RUB; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke(); ctx.setLineDash([]);   // 2つの先頭と、そのへだたり
          [[a, INK], [b, RUB]].forEach(([p, c]) => { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(p[0], p[1], 4.5, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1; } };
        range(4).forEach((k) => { const mid = X(mob(((k + 0.5) / 4 * 2 + sh * 2) * TAU, 0)); o['px' + (32 + k)] = { p: mid, draw: (ctx, G) => { const al = vis(tb); if (al <= 0) return;   // 言葉の帯（4つに分けて、奥と手前を正しく重ねる）
          const P = (u, v) => X(mob((((k + u) / 4) * 2 + sh * 2) * TAU, (v - 0.5) * 2 * MW * grow)); sheet(ctx, G, BQ[k], P, 32, 1, al, 0, true);
          ctx.globalAlpha = al; ctx.strokeStyle = INK; ctx.lineWidth = 1.2; [0, 1].forEach((v) => { ctx.beginPath(); range(33).forEach((j) => { const p = G.proj(P(j / 32, v)); ctx[j ? 'lineTo' : 'moveTo'](p[0], p[1]); }); ctx.stroke(); }); ctx.globalAlpha = 1; } }; });
        return o;
      }
    }
  ];
};
