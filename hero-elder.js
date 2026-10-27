// hero-elder.js — 入場画面の別バージョン「未知の古代（ELDER）」：道具と、どのショットにも出る飾り
// いつものように、カメラが3Dの空間をぐるぐる回ります。暗くて、巨大で、得体の知れない古代の世界です。
// ショットは hero-elder2.js〜hero-elder6.js にあります（人の形や円盤は使わず、図形と光だけで描きます）。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder');

if (typeof window.OC_HERO_PARTS4 === 'function') (window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).elder = function (cfg) {
  if (!cfg.HOOKS) throw new Error('hero.js が古いので、未知の古代は使えません');
  const K = window.OC_HERO_KIT(cfg), { S, Co, PI, TAU, cl, range, rnd, fr, orb, camYaw } = K;
  const A = {};
  K.pool(A, 'cx', 48, () => ({ type: 'custom', draw: null }));   // 自分で描く物
  K.pool(A, 'so', 60, () => ({ type: 'solid', V: [[0, 0, 0]], F: [], c: '#1b2528' }));   // 多面体
  K.pool(A, 'sh', 10, () => ({ type: 'solid', V: [[0, 0, 0]], F: [], c: '#121214' }));   // 浮かぶかけら
  K.pool(A, 'gw', 16, () => ({ type: 'glow', w: 0.3, c: 'white' }));
  K.pool(A, 'bm', 4, () => ({ type: 'beam', a: [0, 0, 0], b: [0, 1, 0], c: 'white' }));
  K.pool(A, 'du', 3, () => ({ type: 'dust', pts: [], size: 0.02, c: 'white' }));
  K.pool(A, 'ln', 40, () => ({ type: 'path', c: 'white', lw: 1, alpha: 0.8 }));
  K.pool(A, 'cn', 48, () => ({ type: 'coin', w: 0.16, d: 0.035, c: '#e8463c' }));
  K.pool(A, 'fl', 20, () => ({ type: 'flat', shape: 'lens', w: 0.3, c: '#c4672e' }));
  K.pool(A, 'cb', 2, () => ({ type: 'cubes', items: [], pal: [['#1b2528', '#141c1f', '#2a3a3e']] }));

  // ===== 道具 =====
  const mk = (w, h, f) => { const c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); return c; };
  const RT = (t) => { const c = camYaw(t); return [Co(c), 0, -S(c)]; };   // カメラから見た「右」（図を、いつもこちらに向ける）
  // 雲のかたまり（色ちがい4つ）
  const CLOUD = ['#1a2629', '#4d5f63', '#c3d0d2', '#0c1012'].map((tint, k) => mk(128, 128, (c) => {
    for (let i = 0; i < 20; i++) { const x = 64 + (rnd(i * 7 + k * 3) - 0.5) * 64, y = 66 + (rnd(i * 11 + k) - 0.5) * 38, r = 16 + rnd(i * 13 + k) * 28, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(255,255,255,0.5)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    c.globalCompositeOperation = 'source-in'; c.fillStyle = tint; c.fillRect(0, 0, 128, 128); }));
  // 絵を空間に並べる（list：[x, y, z, 大きさ, 濃さ, 絵の番号]。奥から順に）
  const sprites = (ctx, G, list, imgs, al = 1) => {
    list.map((q) => [G.proj(q), q]).filter(([p]) => p[2] > 0.3).sort((a, b) => b[0][2] - a[0][2]).forEach(([p, q]) => { const s = (G.f * q[3]) / p[2]; ctx.globalAlpha = al * q[4]; ctx.drawImage(imgs[q[5] || 0], p[0] - s / 2, p[1] - s / 2, s, s); });
    ctx.globalAlpha = 1;
  };
  // 絵（img）を、曲がった面に貼る。P(u, v) が面の上の点。shade(u) で縦の帯ごとの暗さ。cull：裏を向いた所は描かない。そうでなければ、裏は暗く（紙の裏すけ）
  const sheet = (ctx, G, img, P, nu, nv, al, shade, cull, bx = [0, 1, 0, 1]) => {
    const U = (i) => bx[0] + ((bx[1] - bx[0]) * i) / nu, Vv = (j) => bx[2] + ((bx[3] - bx[2]) * j) / nv;
    const Q = []; for (let j = 0; j <= nv; j++) { Q.push([]); for (let i = 0; i <= nu; i++) Q[j].push(G.proj(P(U(i), Vv(j)))); }
    const sw = (img.width * (bx[1] - bx[0])) / nu, sh = (img.height * (bx[3] - bx[2])) / nv, d = G.dpr, back = [];
    ctx.save(); ctx.globalAlpha = al;
    for (let i = 0; i < nu; i++) { const a = Q[nv >> 1][i], b = Q[nv >> 1][i + 1], c = Q[(nv >> 1) + 1] ? Q[(nv >> 1) + 1][i] : Q[nv][i]; back[i] = (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]) < 0; }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { if (cull && back[i]) continue; const a = Q[j][i], b = Q[j][i + 1], c = Q[j + 1][i]; if (a[2] < 0.3 || b[2] < 0.3 || c[2] < 0.3) continue;
      ctx.setTransform((d * (b[0] - a[0])) / sw, (d * (b[1] - a[1])) / sw, (d * (c[0] - a[0])) / sh, (d * (c[1] - a[1])) / sh, d * a[0], d * a[1]);
      ctx.drawImage(img, U(i) * img.width, Vv(j) * img.height, sw + 0.8, sh + 0.8, 0, 0, sw + 0.8, sh + 0.8); }
    ctx.restore();
    for (let i = 0; i < nu; i++) { if (cull && back[i]) continue; const k = (shade ? shade(U(i + 0.5)) : 0) + (back[i] ? 0.6 : 0); if (Math.abs(k) < 0.02) continue;   // 縦の帯ごとに、まとめて暗く
      ctx.fillStyle = k > 0 ? 'rgba(8,6,4,' + Math.min(0.88, k) * al + ')' : 'rgba(255,240,220,' + Math.min(0.5, -k) * al + ')'; ctx.beginPath();
      for (let j = 0; j <= nv; j++) ctx[j ? 'lineTo' : 'moveTo'](Q[j][i][0], Q[j][i][1]); for (let j = nv; j >= 0; j--) ctx.lineTo(Q[j][i + 1][0], Q[j][i + 1][1]); ctx.closePath(); ctx.fill(); }
  };
  // 図を描く板：板の向きは、カメラの動きに少し遅れてついていく（だから図が立体に見える）。lag が大きいほど遅れる
  const face = (t, tb, lag = 0.5) => RT(t - (tb - 2.6) * lag);
  const board = (C, U, V, k) => (x, y) => [C[0] + (U[0] * x + V[0] * y) * k, C[1] + (U[1] * x + V[1] * y) * k, C[2] + (U[2] * x + V[2] * y) * k];
  // 線を、長さの f の割合まで（ひとりでに描かれていく線に使う）
  const grow = (l, f) => { if (f >= 1) return l; if (f <= 0 || l.length < 2) return []; const d = []; let T = 0; for (let i = 1; i < l.length; i++) { d.push(Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1])); T += d[i - 1]; }
    let r = f * T; const o = [l[0]]; for (let i = 1; i < l.length; i++) { if (r >= d[i - 1]) { o.push(l[i]); r -= d[i - 1]; } else { const k = d[i - 1] ? r / d[i - 1] : 0; o.push([l[i - 1][0] + (l[i][0] - l[i - 1][0]) * k, l[i - 1][1] + (l[i][1] - l[i - 1][1]) * k]); break; } } return o; };
  // 光る線（L：3Dの点の列のリスト）。太くうすい光・中くらいの光・芯 の3回重ねる
  const neon = (ctx, G, L, col, lw, a = 1, core = '#ffffff') => { const P = new Path2D(); let any = false;
    L.forEach((l) => { let pen = false; l.forEach((q) => { const p = G.proj(q); if (p[2] < 0.3) { pen = false; return; } if (pen) P.lineTo(p[0], p[1]); else P.moveTo(p[0], p[1]); pen = any = true; }); });
    if (!any || a <= 0) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = col;
    ctx.lineWidth = lw * 5; ctx.globalAlpha = 0.1 * a; ctx.stroke(P); ctx.lineWidth = lw * 2.2; ctx.globalAlpha = 0.3 * a; ctx.stroke(P);
    ctx.strokeStyle = core; ctx.lineWidth = lw; ctx.globalAlpha = Math.min(1, a); ctx.stroke(P); ctx.restore(); };
  // 見たことのない文字（40文字。3×4の点を、線でつないで作る）
  const GL = range(40).map((g) => { const L = [], n = 2 + Math.floor(rnd(g * 7 + 1) * 3); let p = [Math.floor(rnd(g * 3 + 2) * 3), Math.floor(rnd(g * 5 + 3) * 4)];
    for (let k = 0; k < n; k++) { const q = [Math.max(0, Math.min(2, p[0] + Math.floor(rnd(g * 11 + k * 3) * 3) - 1)), Math.max(0, Math.min(3, p[1] + Math.floor(rnd(g * 13 + k * 5) * 3) - 1))];
      if (q[0] !== p[0] || q[1] !== p[1]) L.push([p, q]); p = rnd(g * 17 + k) < 0.3 ? [Math.floor(rnd(g * 19 + k) * 3), Math.floor(rnd(g * 23 + k) * 4)] : q; }
    if (!L.length) L.push([[0, 0], [2, 3]]);
    return { L, dot: rnd(g * 29) < 0.35 ? [Math.floor(rnd(g * 31) * 3), Math.floor(rnd(g * 37) * 4)] : null, ring: rnd(g * 41) < 0.18 }; });
  const glyph = (ctx, g, x, y, s) => { const u = s / 3, G2 = GL[g % GL.length]; ctx.beginPath(); G2.L.forEach(([a, b]) => { ctx.moveTo(x + a[0] * u * 0.8, y + a[1] * u); ctx.lineTo(x + b[0] * u * 0.8, y + b[1] * u); }); ctx.stroke();
    if (G2.ring) { ctx.beginPath(); ctx.arc(x + u * 0.8, y + u * 1.5, u * 0.55, 0, TAU); ctx.stroke(); } if (G2.dot) ctx.fillRect(x + G2.dot[0] * u * 0.8 - 1, y + G2.dot[1] * u - 1, 2.2, 2.2); };
  // ほのお（p：根元、s：大きさ。ゆらゆら）
  const flame = (ctx, G, p, s, t, i) => { const b = G.proj(p); if (b[2] < 0.3) return; const k = (G.f * s) / b[2], fl = 1 + 0.18 * S(t * 19 + i * 2) + 0.1 * S(t * 31 + i * 5), sw = 0.1 * S(t * 7 + i) * k, g = ctx.createRadialGradient(b[0], b[1] - 0.35 * k, 0, b[0], b[1] - 0.35 * k, k * fl);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, '#ffd98a'); g.addColorStop(1, 'rgba(255,110,30,0)'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(b[0] + sw, b[1] - 1.25 * fl * k);
    ctx.quadraticCurveTo(b[0] - 0.5 * k, b[1] - 0.25 * k, b[0], b[1] + 0.08 * k); ctx.quadraticCurveTo(b[0] + 0.5 * k, b[1] - 0.25 * k, b[0] + sw, b[1] - 1.25 * fl * k); ctx.fill(); ctx.restore(); };
  // 浮かぶ黒いかけら（ゆがんだ八面体）
  const OCTF = [[0, 2, 4], [0, 4, 3], [0, 3, 5], [0, 5, 2], [1, 4, 2], [1, 3, 4], [1, 5, 3], [1, 2, 5]];
  const SHV = range(10).map((i) => { const a = 0.08 + rnd(i * 3) * 0.12, b = 0.06 + rnd(i * 5) * 0.1, h = 0.14 + rnd(i * 7) * 0.22; return [[0, h, 0], [0, -h * 0.7, 0], [a, 0.02, 0], [-a * 0.8, -0.02, 0.01], [0.01, 0, b], [-0.02, 0.03, -b * 0.9]]; });
  // ===== どのショットにも出る飾り：見知らぬ文字の輪（奥と手前に分ける）・黒いかけら・舞う粒・床の輪 =====
  const garnish = (o, t, F, gcol, rim, ecol, rise = 1) => {
    const ring = (far) => ({ p: [0, F + 2.4, 0], z: far ? -3 : 3, draw: (ctx, G) => { const c0 = G.proj([0, F + 2.4, 0])[2]; ctx.strokeStyle = gcol; ctx.fillStyle = gcol; ctx.lineWidth = 1.2; ctx.lineCap = 'round';
      for (let i = 0; i < 30; i++) { const q = orb(4.3, t * 0.06 + (i / 30) * TAU, 0.32, 0.5), c = G.proj([q[0], q[1] + F + 2.4, q[2]]); if (c[2] < 0.3 || (c[2] > c0) !== far) continue; const s = (G.f * 0.16) / c[2];
        ctx.globalAlpha = Math.max(0.18, Math.min(0.95, 1.7 - c[2] / 8)); glyph(ctx, (i * 7 + 3) % 40, c[0] - s * 0.3, c[1] - s * 0.5, s); }
      ctx.globalAlpha = 1; ctx.lineCap = 'butt'; } });
    o.cx46 = ring(true); o.cx47 = ring(false);
    range(10).forEach((i) => { const a = (i / 10) * TAU + t * (0.05 + rnd(i) * 0.04), R = 3.6 + rnd(i * 3) * 1.1, y = F + 0.6 + rnd(i * 5) * 2.6 + 0.2 * S(t * 0.8 + i); o['sh' + i] = { p: [Co(a) * R, y, S(a) * R], r: [t * (0.3 + rnd(i * 7) * 0.5), t * 0.4 + i, 0.3], V: SHV[i], F: OCTF, c: '#121214', edge: rim, elw: 0.7 }; });
    const ds = []; range(130).forEach((i) => { const a = rnd(i * 3) * TAU + t * 0.03, R = 0.4 + rnd(i * 5) * 4.4; ds.push(Co(a) * R + 0.15 * S(t * 0.5 + i), F + fr(rnd(i * 7) + t * 0.035 * rise * (0.4 + rnd(i * 11))) * 5.6, S(a) * R); });
    o.du0 = { pts: ds, size: 0.022, max: 2.6, c: ecol, alpha: 0.8 };
    o.ln38 = { pts: range(97).map((i) => [Co((i / 96) * TAU) * 3.1, F, S((i / 96) * TAU) * 3.1]), c: rim, lw: 1, alpha: 0.35, zp: [0, F, 0], z: -50 };
    o.ln39 = { pts: range(97).map((i) => [Co((i / 96) * TAU) * 4.4, F, S((i / 96) * TAU) * 4.4]), c: rim, lw: 1, alpha: 0.3, dash: [2, 7], doff: -t * 12, zp: [0, F, 0], z: -50 };
  };
  const E = { K, A, mk, RT, CLOUD, sprites, sheet, face, board, grow, neon, glyph, flame, garnish, GL };

  // ===== 画面の質感：ふちを、いつもより暗く。稲妻の光 =====
  const opts = {
    grain: 0.44, vignette: 0,   // いつものふちの暗さは使わず、下の post で、もっと暗く
    post: (ctx, I) => {
      const g = ctx.createRadialGradient(I.W / 2, I.FH * 0.42, Math.min(I.W, I.FH) * 0.3, I.W / 2, I.FH * 0.42, Math.hypot(I.W, I.FH) * 0.62); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.6)'); ctx.fillStyle = g; ctx.fillRect(0, 0, I.W, I.H);
      if (I.cur.flash) { const a = I.cur.flash(I.tb); if (a > 0) { ctx.fillStyle = 'rgba(225,238,255,' + a + ')'; ctx.fillRect(0, 0, I.W, I.H); } }
      if (I.cur.over) I.cur.over(ctx, I);
    }
  };
  const more = (f) => (typeof f === 'function' ? f(E) : []);
  return { shots: [].concat(more(window.OC_ELDER2), more(window.OC_ELDER3), more(window.OC_ELDER4), more(window.OC_ELDER5), more(window.OC_ELDER6)), actors: A, opts };
};
