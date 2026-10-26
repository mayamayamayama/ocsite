// hero.js — 入場画面のメインビジュアル（動かす本体）
// 14体の図形が、1本の長いループの中で、移動・変形・消失・発生をくり返します。
// 隊形（どこに集まって、どんな形になるか）は hero-scenes.js と hero-scenes2.js、
// 形と塗り方の部品は hero-parts.js にあります。マウス（スマホは傾き）に合わせて、少し傾きます。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  const filesOK = typeof window.OC_HERO_PARTS === 'function' && typeof window.OC_HERO_SCENES === 'function';
  if (!cssOK || !filesOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // 必要なファイルが読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#fde9dc';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const BEAT = 2.4;           // 1つの隊形の長さ（秒）。小さくすると、せわしなくなる
  const MOVE_SEC = 1.0;       // 次の隊形へ動くのにかける時間（秒）
  const TILT = 1;             // マウスや傾きに合わせて傾く強さ（0で傾かない、2で2倍）
  const PARALLAX = 22;        // 奥のものと手前のもののずれ（px）
  const SPEED_LINES = true;   // 速く動く図形に、スピード線をつける
  const CONFETTI = 18;        // ふわふわ浮かぶ小さな形の数
  const GRAIN = 0.09;         // フィルムのようなざらざらの強さ（0で無し）
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', white: '#fffaf4', black: '#1b1b1b', pink: '#ff2fa0', cyan: '#00f0ff', blue: '#2a2aff', peach: '#ff9a76' };
  const INK = { cream: PAL.navy, navy: PAL.cream, orange: PAL.navy, teal: PAL.cream };   // 背景の色ごとの、文字の色
  const NA = 14;              // 図形の数（隊形のファイルも、この数に合わせて書いてあります）

  const TAU = Math.PI * 2;
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const eIn = (t) => t * t * t;
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

  // ---------- 大きな文字（1文字ずつ、下からせり上がる） ----------
  hero.querySelectorAll('[data-t]').forEach((line) => {
    [...line.dataset.t].forEach((ch, i) => {
      const o = document.createElement('span'); o.className = 'ch'; o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i + (line.classList.contains('hm-l2') ? 2 : 0));
      o.appendChild(s); line.appendChild(o);
    });
  });
  setTimeout(() => hero.classList.add('is-in'), 150);
  const titleEls = [hero.querySelector('.hm-title'), hero.querySelector('.subtitle')].filter(Boolean);
  titleEls.forEach((el) => { el.style.transition = 'color .4s'; });

  // ---------- 部品と隊形を読み込む ----------
  const G = { ctx, PAL, tx: 0, ty: 0 };
  const T = window.OC_HERO_PARTS(G);
  const F = [].concat(window.OC_HERO_SCENES(), typeof window.OC_HERO_SCENES2 === 'function' ? window.OC_HERO_SCENES2() : []);
  const NF = F.length, starts = [];
  let LOOP = 0; F.forEach((f) => { starts.push(LOOP); LOOP += (f.beats || 1) * BEAT; });
  const RGB = {}; Object.keys(PAL).forEach((k) => { RGB[k] = T.hex(PAL[k]); });
  const rgbOf = (c) => RGB[c] || RGB.navy;

  let W = 0, H = 0, FH = 0, M = 1, dpr = 1, visible = true, grainPat = null;
  const K = { W: 1, FH: 1, M: 1 };
  const rbuf = Array.from({ length: NA }, () => new Float32Array(T.N));
  const prevR = new Float32Array(NA), prevX = new Float32Array(NA), prevY = new Float32Array(NA);
  const parts = [], rings = [];

  // ---------- 傾き（マウス → スマホの傾き → 自動のゆらゆら、の順に使う） ----------
  const tilt = { mx: 0, my: 0, mt: -1e9, ox: 0, oy: 0, ot: -1e9 };
  const cl = (v) => Math.max(-1, Math.min(1, v));
  window.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    tilt.mx = cl((ev.clientX / window.innerWidth - 0.5) * 2); tilt.my = cl((ev.clientY / window.innerHeight - 0.5) * 2); tilt.mt = performance.now();
  }, { passive: true });
  window.addEventListener('deviceorientation', (ev) => {
    if (ev.gamma == null || ev.beta == null) return;
    tilt.ox = cl(ev.gamma / 30); tilt.oy = cl((ev.beta - 45) / 30); tilt.ot = performance.now();
  }, { passive: true });
  function updateTilt(now, T0) {
    let tx, ty;
    if (now - tilt.mt < 4000) { tx = tilt.mx; ty = tilt.my; }
    else if (now - tilt.ot < 1500) { tx = tilt.ox; ty = tilt.oy; }
    else { tx = Math.sin(T0 * 0.37) * 0.55; ty = Math.sin(T0 * 0.23 + 1) * 0.45; }   // 何もしていないときは、自動でゆらゆら
    G.tx += (tx * TILT - G.tx) * 0.05; G.ty += (ty * TILT - G.ty) * 0.05;
  }

  // ---------- 隊形の目標（書いていないところは、ふつうの値で埋める） ----------
  function target(f, i, t) {
    const o = f.act(i, t, K); if (!o) return null;
    return Object.assign({ x: 0.5, y: 0.5, s: 0.1, sx: 1, sy: 1, rot: 0, shape: 'circle', fill: 'solid', c: 'navy', c2: 'cream', wob: 0, ext: 0, flip: 0, z: 0.3 + (i % 5) * 0.12 }, o);
  }

  // ---------- はじける粒・広がる輪 ----------
  function burst(x, y, c) {
    for (let n = 0; n < 12; n++) { const a = Math.random() * TAU, v = 160 + Math.random() * 260; parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 2 + Math.random() * 4, k: n % 3, c, life: 1, rot: Math.random() * TAU }); }
    rings.push({ x, y, t: 0, c, big: 1.4 });
  }
  function stepFx(dt) {
    for (let n = parts.length - 1; n >= 0; n--) {
      const p = parts[n]; p.life -= dt * 1.5; if (p.life <= 0) { parts.splice(n, 1); continue; }
      p.vy += 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.98; p.rot += dt * 6;
      ctx.globalAlpha = Math.min(1, p.life * 1.6); ctx.fillStyle = ctx.strokeStyle = p.c; ctx.lineWidth = 2;
      if (p.k === 0) { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, TAU); ctx.fill(); }
      else if (p.k === 1) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore(); }
      else { ctx.beginPath(); ctx.moveTo(p.x - p.r, p.y); ctx.lineTo(p.x + p.r, p.y); ctx.moveTo(p.x, p.y - p.r); ctx.lineTo(p.x, p.y + p.r); ctx.stroke(); }
    }
    for (let n = rings.length - 1; n >= 0; n--) {
      const r = rings[n]; r.t += dt / 0.55; if (r.t >= 1) { rings.splice(n, 1); continue; }
      ctx.globalAlpha = 1 - r.t; ctx.strokeStyle = r.c; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(r.x, r.y, (8 + 46 * r.big * Math.sqrt(r.t)) * (M / 400), 0, TAU); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- ふわふわ浮かぶ小さな形 ----------
  const conf = Array.from({ length: CONFETTI }, (_, n) => ({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random(), k: n % 4, s: 2 + Math.random() * 3, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 1.6, vy: 0.012 + Math.random() * 0.03, ph: Math.random() * TAU, ci: n }));
  const ACC = { cream: ['verm', 'teal', 'orange', 'navy'], navy: ['orange', 'teal', 'verm', 'cream'], orange: ['navy', 'cream', 'verm', 'teal'], teal: ['cream', 'orange', 'verm', 'navy'] };
  function confetti(bg, dt, T0) {
    const acc = ACC[bg] || ACC.cream;
    conf.forEach((p) => {
      p.y -= p.vy * dt * (0.6 + p.z); if (p.y < -0.04) { p.y += 1.08; p.x = Math.random(); }
      p.r += p.vr * dt;
      const x = p.x * W + Math.sin(T0 * 0.6 + p.ph) * 10 + G.tx * p.z * PARALLAX, y = p.y * FH + G.ty * p.z * PARALLAX, s = p.s * (0.7 + p.z * 0.5);
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.fillStyle = ctx.strokeStyle = PAL[acc[p.ci % 4]]; ctx.lineWidth = 1.4;
      if (p.k === 0) { ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, TAU); ctx.fill(); }
      else if (p.k === 1) { ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke(); }
      else if (p.k === 2) { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke(); }
      else ctx.strokeRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
      ctx.restore();
    });
  }

  // ---------- 背景の模様 ----------
  function backdrop(bg, ink, T0) {
    ctx.fillStyle = PAL[bg]; ctx.fillRect(0, 0, W, H);
    const gap = Math.max(18, M * 0.055), ox = ((T0 * 8 - G.tx * 6) % gap + gap) % gap, oy = ((T0 * 4 - G.ty * 6) % gap + gap) % gap;
    ctx.fillStyle = ink; ctx.globalAlpha = 0.13;
    for (let x = ox - gap; x < W + gap; x += gap) for (let y = oy - gap; y < H; y += gap) ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
    ctx.globalAlpha = 0.08; ctx.fillRect(0, FH * 0.4, W, 1); ctx.fillRect(W / 2, 0, 1, FH);
    ctx.globalAlpha = 0.18; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.setLineDash([2, 8]); ctx.lineDashOffset = -T0 * 14;
    ctx.beginPath(); ctx.arc(W / 2 - G.tx * 8, FH * 0.4 - G.ty * 8, M * 0.47, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }

  // ---------- 情報の文字・ものさし ----------
  function hud(f, k, tb, loopT, ink, T0) {
    const m = 20, y1 = 58, beat = (f.beats || 1) * BEAT;
    const fr = Math.floor(T0 * 24), tc = `${pad(T0 / 3600)}:${pad((T0 / 60) % 60)}:${pad(T0 % 60)}:${pad(fr % 24)}`;
    T.label(`COMP 01 — ${f.name}`, m, y1, ink, 9);
    T.label('24 FPS', W - m - 44, y1, ink, 9, 'right');
    if (Math.floor(T0 * 1.6) % 2 === 0) { ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(W - m - 34, y1, 3.5, 0, TAU); ctx.fill(); }
    T.label('REC', W - m, y1, ink, 9, 'right');
    T.label(`FORM ${pad(k + 1)} / ${pad(NF)}`, m, y1 + 15, ink, 9);
    T.label(tc, W - m, y1 + 15, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.25; ctx.fillRect(m, y1 + 28, W - m * 2, 1); ctx.globalAlpha = 1;
    ctx.fillRect(m + (W - m * 2) * (tb / beat) - 1, y1 + 24, 2, 9);
    const rx = W - 12, r0 = y1 + 56, r1 = Math.max(r0 + 60, FH * 0.6);   // 右のものさし
    ctx.globalAlpha = 0.7;
    for (let y = r0; y <= r1; y += 6) { const long = Math.round((y - r0) / 6) % 5 === 0; ctx.fillRect(rx - (long ? 8 : 4), y, long ? 8 : 4, 1); }
    const my = r0 + (r1 - r0) * (0.5 + 0.5 * Math.sin(T0 * 0.7));
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(rx - 10, my); ctx.lineTo(rx - 16, my - 4); ctx.lineTo(rx - 16, my + 4); ctx.closePath(); ctx.fill();
    T.label(pad(my, 3), rx - 19, my, ink, 8, 'right');
    const yb = FH - 28, span = W - m * 2;   // 下：ループ全体の進み具合（隊形ごとの区切りつき）
    T.label(`LOOP ${Math.round(LOOP)}s ▶`, m, yb - 16, ink, 9);
    T.label(`TILT ${G.tx >= 0 ? '+' : ''}${G.tx.toFixed(2)} ${G.ty >= 0 ? '+' : ''}${G.ty.toFixed(2)}`, W - m, yb - 16, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(m, yb, span, 2); ctx.globalAlpha = 1; ctx.fillRect(m, yb, span * (loopT / LOOP), 2);
    for (let n = 1; n < NF; n++) ctx.fillRect(m + span * (starts[n] / LOOP), yb - 3, 1, 8);
  }

  // ---------- 1コマを描く ----------
  let start = performance.now(), last = performance.now(), lastGrain = 0, gx = 0, gy = 0, inkNow = '';
  window.OC_HERO = { seek(sec) { start = performance.now() - sec * 1000; } };   // （確認用）
  function frame(now) {
    if (!W) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const T0 = REDUCE ? starts[1] + 1.8 : (now - start) / 1000;
    updateTilt(now, T0);
    const loopT = ((T0 % LOOP) + LOOP) % LOOP;
    let k = NF - 1; for (let n = 0; n < NF; n++) if (loopT < starts[n] + (F[n].beats || 1) * BEAT) { k = n; break; }
    const tb = loopT - starts[k], cur = F[k], prv = F[(k - 1 + NF) % NF], bg = cur.bg;
    const look = cur.to && tb > 1.15 ? cur.to : bg, ink = INK[look] || PAL.navy;   // 画面が新しい色で覆われたら、文字の色も先に切り替える

    backdrop(bg, ink, T0);
    ctx.save();   // 舞台全体を、傾きに合わせて少し傾ける
    ctx.translate(W / 2, FH * 0.45); ctx.rotate(G.tx * 0.025); ctx.transform(1, G.ty * 0.035, -G.tx * 0.035, 1, 0, 0); ctx.translate(-W / 2, -FH * 0.45);

    const list = [];
    for (let i = 0; i < NA; i++) {
      let A = target(prv, i, T0), B = target(cur, i, T0);
      if (!A && !B) { prevR[i] = 0; continue; }
      const appear = !A, vanish = !B;
      if (appear) A = Object.assign({}, B, { s: 0 });
      if (vanish) B = Object.assign({}, A, { s: 0, dur: 0.6, ease: 'back', delay: undefined });
      const delay = B.delay !== undefined ? B.delay : i * 0.035, dur = B.dur || MOVE_SEC, q = clamp01((tb - delay) / dur);
      const p = B.ease === 'in' ? eIn(q) : eBack(q), pc = eIO(q);
      const z = lerp(A.z, B.z, pc), rA = T.SHAPES[A.shape] || T.SHAPES.circle, rB = T.SHAPES[B.shape] || T.SHAPES.circle, r = rbuf[i];
      for (let n = 0; n < T.N; n++) r[n] = rA[n] + (rB[n] - rA[n]) * pc;
      let c = T.mixRGB(rgbOf(A.c), rgbOf(B.c), pc), c2 = T.mixRGB(rgbOf(A.c2), rgbOf(B.c2), pc), sx = lerp(A.sx, B.sx, pc);
      const fl = lerp(A.flip, B.flip, pc);
      if (fl > 0.01) { const cv0 = Math.cos(T0 * 2.4 + i * 0.9); sx *= 1 - fl * (1 - Math.max(0.05, Math.abs(cv0))); if (cv0 < 0 && fl > 0.5) { const tmp = c; c = c2; c2 = tmp; } }
      const o = {
        i, x: lerp(A.x, B.x, p) * W + G.tx * z * PARALLAX, y: lerp(A.y, B.y, p) * FH + G.ty * z * PARALLAX,
        R: Math.max(0, lerp(A.s, B.s, appear ? eBack(q) : p)) * M * 0.5, sx, sy: lerp(A.sy, B.sy, pc), rot: lerp(A.rot, B.rot, p),
        r, wob: lerp(A.wob, B.wob, pc), ph: i * 1.7, c, c2, fill: pc < 0.5 ? A.fill : B.fill, ext: lerp(A.ext, B.ext, pc), z, shape: (pc < 0.5 ? A : B).shape
      };
      if (prevR[i] > 3 && o.R <= 3 && vanish) burst(prevX[i], prevY[i], T.css(c));          // 消えるときは、はじける
      if (prevR[i] <= 3 && o.R > 3 && appear) rings.push({ x: o.x, y: o.y, t: 0, c: T.css(c), big: 1 });   // 出てくるときは、輪が広がる
      o.vx = prevR[i] > 0 ? (o.x - prevX[i]) / dt : 0; o.vy = prevR[i] > 0 ? (o.y - prevY[i]) / dt : 0;
      prevR[i] = o.R; prevX[i] = o.x; prevY[i] = o.y;
      list.push(o);
    }
    list.sort((a, b) => a.z - b.z);

    if (cur.links && tb > 0.4) {   // 図形どうしをつなぐ点線
      const byI = []; list.forEach((o) => { byI[o.i] = o; });
      ctx.strokeStyle = ink; ctx.globalAlpha = 0.45; ctx.lineWidth = 1; ctx.setLineDash([3, 4]); ctx.lineDashOffset = -T0 * 20; ctx.beginPath();
      for (let i = 0; i < NA - 1; i++) { const a = byI[i], b = byI[i + 1]; if (a && b && a.R > 3 && b.R > 3) { ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); } }
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
    }
    list.forEach((o) => {
      if (SPEED_LINES && !REDUCE && o.R > 2 && o.R < M) {   // 速く動いている図形の、後ろのスピード線
        const sp = Math.hypot(o.vx, o.vy);
        if (sp > 450) {
          const ux = -o.vx / sp, uy = -o.vy / sp, L = Math.min(M * 0.3, sp * 0.07);
          ctx.strokeStyle = T.css(o.c); ctx.globalAlpha = Math.min(0.7, (sp - 450) / 600); ctx.lineWidth = 1.5; ctx.beginPath();
          for (const off of [-0.6, 0, 0.6]) { const bx = o.x + ux * o.R * 0.8 - uy * off * o.R, by = o.y + uy * o.R * 0.8 + ux * off * o.R; ctx.moveTo(bx, by); ctx.lineTo(bx + ux * L * (1 - Math.abs(off) * 0.4), by + uy * L * (1 - Math.abs(off) * 0.4)); }
          ctx.stroke(); ctx.globalAlpha = 1;
        }
      }
      T.actor(o, T0);
    });
    [1, 4, 9].forEach((i) => {   // いくつかの図形に、名前と位置のラベル
      const o = list.find((q) => q.i === i);
      if (!o || o.R < 5 || o.R > M * 0.4 || o.x < 0 || o.x > W || o.y < 70 || o.y > FH - 60) return;
      const dx = o.x > W * 0.6 ? -14 : 14;
      T.tag(o.x + (dx < 0 ? -o.R * 0.7 : o.R * 0.7), o.y - o.R * 0.7, dx, -12, `OBJ_${pad(i)} ${o.shape.toUpperCase()}  ${(o.x / W).toFixed(2)}/${(o.y / FH).toFixed(2)}`, ink);
    });
    ctx.restore();

    if (!REDUCE) { stepFx(dt); confetti(look, dt, T0); }
    hud(cur, k, tb, loopT, ink, T0);
    if (ink !== inkNow) { inkNow = ink; titleEls.forEach((el) => { el.style.color = ink; }); }
    if (GRAIN > 0 && grainPat) {   // フィルムのようなざらざら（少しずつ動く）
      if (now - lastGrain > 80) { gx = Math.random() * 128; gy = Math.random() * 128; lastGrain = now; }
      ctx.save(); ctx.globalAlpha = GRAIN; ctx.translate(-gx, -gy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W + 128, H + 128); ctx.restore();
    }
  }

  // ---------- 大きさを決める ----------
  function build() {
    const r0 = hero.getBoundingClientRect();
    W = r0.width; H = r0.height;
    if (!W || !H || H > 4000 || W > 5000) { W = 0; return; }   // 異常に大きいときは動かさない
    FH = H - (parseFloat(getComputedStyle(hero).paddingBottom) || NOISE_H);
    M = Math.min(W, FH); K.W = W; K.FH = FH; K.M = M;
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (W * H)));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!grainPat) {
      const n = document.createElement('canvas'); n.width = n.height = 128; const c = n.getContext('2d'), d = c.createImageData(128, 128);
      for (let q = 0; q < d.data.length; q += 4) { const v = Math.random() < 0.5 ? 0 : 255; d.data[q] = d.data[q + 1] = d.data[q + 2] = v; d.data[q + 3] = Math.random() * 70; }
      c.putImageData(d, 0, 0); grainPat = ctx.createPattern(n, 'repeat');
    }
    frame(performance.now());
  }

  // ---------- ループ ----------
  new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) build(); }).observe(hero);
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(hero);
  function loop(now) { if (visible && W) frame(now); requestAnimationFrame(loop); }
  build();
  if (!REDUCE) requestAnimationFrame(loop);
})();

