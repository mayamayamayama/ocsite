// hero-philo.js — 入場画面の別バージョン「哲学（PHILO）」：道具と、画面の文字組み
// 紙とインクの世界です。物体は銅版画のような「線のかげ（ハッチング）」で描き、色は赤インク（朱）を少しだけ。
// いつもの飾り（SHOT 01 / 08 など）の代わりに、古い本のページのような文字組みを重ねます。
// 1200個の「インクの粒」が、ループ全体を1本につなぎます。粒はいつも今の場面の形の上にいて、場面が変わると、ほどけて渦を巻き、次の形を組み上げます。
// ショットは hero-philo2.js〜hero-philo5.js にあります。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-philo');

if (typeof window.OC_HERO_KIT === 'function') (window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).philo = function (cfg) {
  if (!cfg.HOOKS) throw new Error('hero.js が古いので、哲学は使えません');
  const K = window.OC_HERO_KIT(cfg), { S, Co, PI, TAU, cl, io, range, rnd, fr, camYaw, sub, nrm, cross } = K;
  const A = {}; K.pool(A, 'px', 40, () => ({ type: 'custom', draw: null }));   // このバージョンの物は、ぜんぶ自分で描く
  const PAPER = '#ebe4d4', INK = '#17130e', RUB = '#a8321e', SEPIA = '#7a5a3a', LAPIS = '#24427a';   // 紙・インク・朱・セピア・群青
  const lum = (h) => { const n = parseInt(String(h).slice(1), 16) || 0; return (0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255; };
  const SERIF = 'Georgia, "Times New Roman", serif', MIN = '"Hiragino Mincho ProN", "Yu Mincho", "YuMincho", serif', MONO = 'ui-monospace, Menlo, monospace';
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };

  // ===== 道具 =====
  const RT = (t) => { const c = camYaw(t); return [Co(c), 0, -S(c)]; };   // カメラから見た「右」
  // 舞台：カメラの動きに少し遅れてついていく向き（x：右、y：上、z：手前）。だから、いつも見やすく、でも立体に見える
  const stage = (t, tb, lag = 0.5, C = [0, 0, 0]) => { const R = RT(t - (tb - 2.6) * lag), N = [-R[2], 0, R[0]]; return (x, y, z = 0) => [C[0] + R[0] * x + N[0] * z, C[1] + y, C[2] + R[2] * x + N[2] * z]; };
  // 線のかげ（ハッチング）：形の中に、平行な線を引く。tone：0 = 暗い（線が細かく、十字に重なる）〜 1 = 明るい（線なし）
  //   （線を1本ずつ引くと重いので、線の入った小さな絵を「模様」としてくり返し、向きだけ回して塗る）
  const PAT = {}, hatch = (ctx, path, bb, tone, ang, col) => {
    if (tone > 0.92) return; const sp = Math.round(2.1 + tone * 7), cr = tone < 0.36, key = sp + (cr ? 'x' : '') + col;
    if (!PAT[key]) PAT[key] = ctx.createPattern(mk(sp, sp, (x) => { x.strokeStyle = col; x.lineWidth = 0.75; x.beginPath(); x.moveTo(0, 0.5); x.lineTo(sp, 0.5); if (cr) { x.moveTo(0.5, 0); x.lineTo(0.5, sp); } x.stroke(); }), 'repeat');
    const p = PAT[key]; if (p.setTransform && window.DOMMatrix) p.setTransform(new DOMMatrix().rotate((ang * 180) / PI)); ctx.fillStyle = p; ctx.fill(path); };
  const poly = (P) => { const path = new Path2D(), bb = [1e9, 1e9, -1e9, -1e9]; P.forEach((p, i) => { path[i ? 'lineTo' : 'moveTo'](p[0], p[1]); bb[0] = Math.min(bb[0], p[0]); bb[1] = Math.min(bb[1], p[1]); bb[2] = Math.max(bb[2], p[0]); bb[3] = Math.max(bb[3], p[1]); }); path.closePath(); return [path, bb]; };
  // 凸の多面体の面を、点だけから求める（どの3点の平面にも、ほかの点が片側にしかないとき、それが面）
  const hull = (V) => { const F = [], seen = {}, n = V.length;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) {
      const nn = cross(sub(V[j], V[i]), sub(V[k], V[i])); if (Math.hypot(...nn) < 1e-9) continue; let pos = 0, neg = 0; const on = [];
      V.forEach((p, m) => { const d = dot(nn, sub(p, V[i])); if (Math.abs(d) < 1e-6) on.push(m); else if (d > 0) pos++; else neg++; });
      if (pos && neg) continue; const key = on.join(','); if (seen[key]) continue; seen[key] = 1;
      const c = on.reduce((s, m) => [s[0] + V[m][0] / on.length, s[1] + V[m][1] / on.length, s[2] + V[m][2] / on.length], [0, 0, 0]), u = nrm(sub(V[on[0]], c)), w = cross(nrm(nn), u);
      F.push(on.slice().sort((a, b) => Math.atan2(dot(sub(V[a], c), w), dot(sub(V[a], c), u)) - Math.atan2(dot(sub(V[b], c), w), dot(sub(V[b], c), u)))); }
    return F; };
  // 多面体を、銅版画のように描く（V：世界の点、F：面、light(m)：その面への光の向き。手前を向く面だけを、奥から順に）
  const solid = (ctx, G, V, F, light, o = {}) => {
    const P = V.map(G.proj); if (P.some((p) => p[2] < 0.3)) return; const C = V.reduce((s, p) => [s[0] + p[0] / V.length, s[1] + p[1] / V.length, s[2] + p[2] / V.length], [0, 0, 0]), L = [];
    F.forEach((f, i) => { const m = f.reduce((s, j) => [s[0] + V[j][0] / f.length, s[1] + V[j][1] / f.length, s[2] + V[j][2] / f.length], [0, 0, 0]); let n = nrm(cross(sub(V[f[1]], V[f[0]]), sub(V[f[2]], V[f[0]]))); if (dot(n, sub(m, C)) < 0) n = n.map((v) => -v);
      if (dot(n, sub(G.camPos, m)) <= 0) return; L.push({ f, i, z: dot(sub(m, G.camPos), sub(m, G.camPos)), tone: (o.amb || 0.12) + (1 - (o.amb || 0.12)) * Math.max(0, dot(n, light(m))) }); });
    L.sort((a, b) => b.z - a.z).forEach(({ f, i, tone }) => { const [path, bb] = poly(f.map((j) => P[j])); ctx.globalAlpha = o.al === undefined ? 1 : o.al; ctx.fillStyle = o.fill || PAPER; ctx.fill(path);
      hatch(ctx, path, bb, tone, (o.ang || 0.6) + i * 0.9, o.ink || INK); ctx.strokeStyle = o.edge || INK; ctx.lineWidth = o.lw || 1.3; ctx.lineJoin = 'round'; ctx.stroke(path); });
    ctx.globalAlpha = 1; };
  // 文字を、1文字ずつ間をあけて書く（小さな大文字の飾り文字に）
  const spaced = (ctx, s, x, y, sp, align) => { const w = [...s].reduce((a, ch) => a + ctx.measureText(ch).width + sp, -sp); let xx = align === 'right' ? x - w : align === 'center' ? x - w / 2 : x; [...s].forEach((ch) => { ctx.fillText(ch, xx, y); xx += ctx.measureText(ch).width + sp; }); return w; };
  const ROMAN = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  // 紙のすじ（細い繊維と、まだらの汚れ）
  const PAPERTX = mk(320, 320, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const x = rnd(i * 3) * w, y = rnd(i * 5) * h, a = rnd(i * 7) * PI, L = 4 + rnd(i * 11) * 22; c.strokeStyle = 'rgba(120,96,60,' + (0.05 + rnd(i * 13) * 0.12) + ')'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + Co(a) * L * 0.5 + 3, y + S(a) * L * 0.5, x + Co(a) * L, y + S(a) * L); c.stroke(); }
    for (let i = 0; i < 40; i++) { const x = rnd(i * 17) * w, y = rnd(i * 19) * h, r = 10 + rnd(i * 23) * 50, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(150,110,60,' + (0.03 + rnd(i * 29) * 0.05) + ')'); g.addColorStop(1, 'rgba(150,110,60,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    const d = c.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { const v = (rnd(i * 0.37) - 0.5) * 18; d.data[i] += v; d.data[i + 1] += v; d.data[i + 2] += v; } c.putImageData(d, 0, 0); });
  // 背景：紙の色 × 紙のすじ × ふちの焼け を、1枚の絵にまとめておく（毎回重ねると重いので）
  const BGC = new Map(), bgImg = (col, W, H, FH) => { const key = col + '|' + Math.round(W) + 'x' + Math.round(H); let c = BGC.get(key);
    if (!c) { const dark = lum(col) < 0.45; c = mk(Math.ceil(W), Math.ceil(H), (x, w, h) => { x.fillStyle = col; x.fillRect(0, 0, w, h); x.globalCompositeOperation = 'multiply'; x.globalAlpha = dark ? 0.5 : 0.85; x.fillStyle = x.createPattern(PAPERTX, 'repeat'); x.fillRect(0, 0, w, h);
      const g = x.createRadialGradient(w / 2, FH * 0.45, Math.min(w, FH) * 0.32, w / 2, FH * 0.45, Math.hypot(w, FH) * 0.66); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, dark ? 'rgba(20,12,4,0.65)' : 'rgba(150,110,60,0.42)'); x.globalAlpha = 1; x.fillStyle = g; x.fillRect(0, 0, w, h); });
      if (BGC.size > 3) BGC.delete(BGC.keys().next().value); BGC.set(key, c); } return c; };
  const cap = (I, fy) => (I.W > I.FH * 1.1 ? [I.W * 0.8, I.FH * 0.82] : [I.W / 2, I.FH * fy]);   // 説明の文字の場所（横長の画面では、右下に。大きな題とかさならない）
  // ===== インクの粒（ループ全体の主人公） =====
  const NP = 1200, SH = cfg.SHOT_SEC || 5.2, vis = (tb) => cl((tb - 0.45) / 0.9) * (1 - cl((tb - SH) / 0.55));   // vis：場面の絵の見え方（粒が集まると現れ、粒が飛び立つと消える）
  const fit = (P) => (P.length >= NP ? P : P.length ? range(NP).map((i) => P[i % P.length]) : range(NP).map(() => [0, -1, 0, 0]));
  let SHOTS = [];
  const SWARM = { p: [0, -1, 0], z: 1e4, draw: (ctx, G, o, T0) => {   // 今の場面と1つ前の場面から、粒の位置を決める（どのショットから呼ばれても、同じ絵になる）
    const NS = SHOTS.length, L = NS * SH, lt = ((T0 % L) + L) % L, k = Math.min(NS - 1, Math.floor(lt / SH)), tb = lt - k * SH, cur = SHOTS[k], prv = SHOTS[(k - 1 + NS) % NS];
    const B = fit(cur.swarm(T0, tb)), A = tb < 2.0 ? fit(prv.swarm(T0, tb + SH)) : null, [ss, sa] = cur.ss || [1.1, 0.45], col = tb < 0.5 ? prv.pc || INK : cur.pc || INK;
    const dots = new Path2D(), reds = new Path2D(), fl = new Path2D(), flr = new Path2D(), at = (P, Q, e, i) => { const sw = S(PI * e), ang = rnd(i * 3) * TAU + e * 3.2 * (i % 2 ? 1 : -1), r = sw * (0.3 + rnd(i * 5) * 0.9);
      return [P[0] + (Q[0] - P[0]) * e + Co(ang) * r, P[1] + (Q[1] - P[1]) * e + S(ang) * r * 0.6 + sw * 0.5, P[2] + (Q[2] - P[2]) * e + S(ang * 1.3) * r]; };
    for (let i = 0; i < NP; i++) { const e = A ? io(cl((tb - 0.1 - rnd(i * 1.7) * 0.5) / 1.2)) : 1, Q = B[i];
      if (e >= 1) { const p = G.proj(Q); if (p[2] < 0.3) continue; const s = Math.min(4, (ss * 10) / p[2]) * (0.75 + 0.5 * rnd(i * 7)); (Q[3] ? reds : dots).rect(p[0] - s / 2, p[1] - s / 2, s, s); continue; }
      const P = A[i], p = G.proj(at(P, Q, e, i)), q = G.proj(at(P, Q, Math.max(0, e - 0.03), i)); if (p[2] < 0.8 || q[2] < 0.8) continue; const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy), m = L > 22 ? 22 / L : 1, pth = (e > 0.5 ? Q[3] : P[3]) || i % 13 === 0 ? flr : fl;
      pth.moveTo(p[0] + dx * m, p[1] + dy * m); pth.lineTo(p[0] + 0.01, p[1]); }   // 飛んでいる粒は、短いすじ（長くなりすぎないように）
    ctx.save(); ctx.globalAlpha = sa; ctx.fillStyle = cur.pc || INK; ctx.fill(dots); ctx.fillStyle = RUB; ctx.fill(reds); ctx.lineCap = 'round'; ctx.lineWidth = 1.4; ctx.globalAlpha = 0.8; ctx.strokeStyle = col; ctx.stroke(fl); ctx.strokeStyle = RUB; ctx.stroke(flr); ctx.restore(); } };
  const E = { NP, vis, cap, K, A, PAPER, INK, RUB, SEPIA, LAPIS, SERIF, MIN, MONO, mk, RT, stage, hatch, poly, hull, solid, spaced, dot };

  // ===== 画面の文字組み：章の番号（朱）・ラテン語の題・哲学者と年。右上は、ページの番号 =====
  const opts = {
    hud: false, grid: false, gizmo: false, bigNum: false, vignette: 0, grain: 0,
    bg: (ctx, I) => { const { W, H, FH, tb, cur, prv } = I; ctx.drawImage(bgImg(prv.bg !== cur.bg && tb < 0.9 ? prv.bg : cur.bg, W, H, FH), 0, 0, W, H);   // 色が変わるときは、真ん中から丸く広がる
      if (prv.bg !== cur.bg && tb < 0.9) { ctx.save(); ctx.beginPath(); ctx.arc(I.CX, I.CY, io(tb / 0.9) * Math.hypot(W, H), 0, TAU); ctx.clip(); ctx.drawImage(bgImg(cur.bg, W, H, FH), 0, 0, W, H); ctx.restore(); } },
    post: (ctx, I) => {
      const { W, FH, tb, k, cur } = I, dark = lum(cur.bg) < 0.45, ink = dark ? '#efe6d2' : INK, sy = window.scrollY || 0;
      if (cur.over) cur.over(ctx, I);
      ctx.save(); if (sy > 0) { ctx.beginPath(); ctx.rect(0, sy + 46, W, I.H); ctx.clip(); }   // 少しスクロールしたら、サイトの上の文字の下にもぐらせる
      { const n = parseInt(cur.bg.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].join(','), g = ctx.createLinearGradient(0, 0, 0, 185); g.addColorStop(0, 'rgba(' + c + ',.9)'); g.addColorStop(0.75, 'rgba(' + c + ',.55)'); g.addColorStop(1, 'rgba(' + c + ',0)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, 185); }   // 文字の下に、紙の色をうすく敷く（込み入った絵の上でも読める）
      const x0 = 20, y0 = 50, a = cl((tb - 0.2) / 0.6);   // 文字は、場面にあわせて静かに入れかわる
      ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left'; ctx.fillStyle = dark ? '#e06a4a' : RUB; ctx.globalAlpha = a; ctx.font = '600 9.5px ' + SERIF; spaced(ctx, 'CAPUT ' + ROMAN[k], x0, y0, 3.2);
      ctx.fillStyle = ink; ctx.font = 'italic 25px ' + SERIF; ctx.fillText(cur.la, x0, y0 + 28);   // ラテン語の題
      ctx.globalAlpha = a * 0.85; ctx.font = '600 8.5px ' + SERIF; spaced(ctx, cur.by, x0, y0 + 47, 1.8);   // 哲学者と年
      if (cur.data) { ctx.font = '9.5px ' + MONO; ctx.fillStyle = ink; cur.data(tb, I.T0).forEach((l, i) => { ctx.globalAlpha = a * (i ? 0.6 : 0.85); ctx.fillText(l, x0, y0 + 84 + i * 12.5); }); }   // 余白の注記（式と数値）
      ctx.globalAlpha = a; ctx.textAlign = 'right'; ctx.font = 'italic 12px ' + SERIF; ctx.fillText('fol. ' + (k + 1) + (tb % 1.6 < 0.8 ? 'r' : 'v'), W - x0, y0); ctx.textAlign = 'left';   // ページの番号（表 r と 裏 v）
      for (let i = 0; i < 8; i++) { const cx = W - x0 - (7 - i) * 11 - 3, cy = y0 + 13; ctx.beginPath(); ctx.moveTo(cx, cy - 3.2); ctx.lineTo(cx + 3.2, cy); ctx.lineTo(cx, cy + 3.2); ctx.lineTo(cx - 3.2, cy); ctx.closePath(); if (i === k) { ctx.fillStyle = dark ? '#e06a4a' : RUB; ctx.fill(); } else { ctx.strokeStyle = ink; ctx.lineWidth = 0.8; ctx.stroke(); } }
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.45 * a; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(x0, y0 + 60); ctx.lineTo(W - x0, y0 + 60); ctx.moveTo(x0, y0 + 63); ctx.lineTo(x0 + (W - 2 * x0) * cl(tb / 5.2), y0 + 63); ctx.stroke();   // 二重のけい線（下の線は、時間とともにのびる）
      ctx.restore();
    }
  };
  const more = (f) => (typeof f === 'function' ? f(E) : []);
  SHOTS = [].concat(more(window.OC_PHILO2), more(window.OC_PHILO3), more(window.OC_PHILO4), more(window.OC_PHILO5));
  SHOTS.forEach((s) => { const a0 = s.act; s.act = (t, tb) => { const o = a0(t, tb) || {}; o.px39 = SWARM; return o; }; if (!s.swarm) s.swarm = () => []; });   // どの場面にも、同じ粒を入れる
  return { shots: SHOTS, actors: A, opts };
};
