// hero.js — 入場画面のメインビジュアル（芯の部分）
// 2Dと3Dの中間のような、カラフルなモーショングラフィックス。
// 場面は止まらずに、形を変えながら次々と切り替わります。マウス（スマホは傾き）に合わせて、少し傾きます。
// 図形の部品は hero-parts.js、場面は hero-scenes.js（1〜4）と hero-scenes2.js（5〜8）にあります。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  const partsOK = typeof window.OC_HERO_PARTS === 'function' && typeof window.OC_HERO_SCENES === 'function';
  if (!cssOK || !partsOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // 必要なファイルが読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#fde9dc';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const SCENE_SEC = 4.6;      // 1つの場面の長さ（秒）
  const TR_SEC = 1.3;         // 場面が切り替わるのにかける時間（秒）
  const TILT = 1;             // マウスや傾きに合わせて傾く強さ（0で傾かない、2で2倍）
  const PARALLAX = 18;        // 奥のものと手前のもののずれ（px）
  const CONFETTI = 44;        // ふわふわ浮かぶ小さな形の数
  const GRAIN = 0.09;         // フィルムのようなざらざらの強さ（0で無し）
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', navy2: '#2b3466', white: '#fffaf4', black: '#1b1b1b', pink: '#ff2fa0', cyan: '#00f0ff', blue: '#2a2aff', peach: '#ff9a76' };
  // 切り替わり方の種類（この順番でくり返します）
  const TRANS = ['iris', 'cols', 'diag', 'clock', 'blinds', 'pixels'];

  const TAU = Math.PI * 2;
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  const rad = (d) => (d * Math.PI) / 180;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eIn = (t) => t * t * t;
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const e = (t, s, d, f = eOut) => f(clamp01((t - s) / d));   // 時間 t のうち、s秒から d秒かけて 0→1 になる動き

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
  titleEls.forEach((el) => { el.style.transition = 'color .5s'; });

  // ---------- 部品と場面を読み込む ----------
  let W = 0, H = 0, FH = 0, u = 1, cx = 0, cy = 0, dpr = 1, visible = true, grainPat = null;
  const X = (v) => cx + v * u, Y = (v) => cy + v * u;     // 場面の中の位置（単位u）を、画面の位置に直す
  const C = { u: 1, W: 0, H: 0, FH: 0, X, Y };
  const G = { ctx, PAL, TAU, rad, clamp01, eOut, eIO, eBack, e, tx: 0, ty: 0, PAR: PARALLAX, W: 0, H: 0, FH: 0 };
  const T = window.OC_HERO_PARTS(G);
  const LIST = [].concat(window.OC_HERO_SCENES(G, T), typeof window.OC_HERO_SCENES2 === 'function' ? window.OC_HERO_SCENES2(G, T) : []);
  const N = LIST.length;

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

  // ---------- 切り替わりの形（p が 0→1 で、画面全体を覆う） ----------
  function transPath(type, p, seed) {
    ctx.beginPath(); if (p <= 0) return;
    const D = Math.hypot(W, H);
    if (type === 'iris') {
      const ox = W * (0.25 + 0.5 * seed), oy = FH * (0.2 + 0.35 * ((seed * 7.3) % 1)), R = Math.hypot(Math.max(ox, W - ox), Math.max(oy, H - oy));
      ctx.arc(ox, oy, R * eIO(p) + 0.1, 0, TAU);
    } else if (type === 'cols') {
      const n = 6, w = W / n;
      for (let i = 0; i < n; i++) { const q = eIO(clamp01(p * 1.6 - i * 0.12)); if (q > 0) ctx.rect(i * w - 0.5, H * (1 - q), w + 1, H * q + 1); }
    } else if (type === 'diag') {
      const n = 5, a = -0.5, bw = D / n, ca = Math.cos(a), sa = Math.sin(a), mx = W / 2, my = H / 2;
      for (let i = 0; i < n; i++) {
        const q = eIO(clamp01(p * 1.5 - i * 0.1)); if (q <= 0) continue;
        const x0 = -D / 2, x1 = -D / 2 + D * q, y0 = -D / 2 + i * bw - 0.5, y1 = y0 + bw + 1;
        [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], k) => { const X1 = mx + x * ca - y * sa, Y1 = my + x * sa + y * ca; k ? ctx.lineTo(X1, Y1) : ctx.moveTo(X1, Y1); });
        ctx.closePath();
      }
    } else if (type === 'clock') {
      const ox = W / 2, oy = FH * 0.4; ctx.moveTo(ox, oy); ctx.arc(ox, oy, D, -Math.PI / 2, -Math.PI / 2 + TAU * eIO(p)); ctx.closePath();
    } else if (type === 'blinds') {
      const n = 8, h = H / n;
      for (let i = 0; i < n; i++) { const q = eIO(clamp01(p * 1.4 - (i % 2) * 0.2 - i * 0.02)); if (q > 0) ctx.rect(-1, i * h + (h / 2) * (1 - q) - 0.5, W + 2, h * q + 1); }
    } else {
      const n = 7, s = W / n, rows = Math.ceil(H / s);
      for (let r = 0; r < rows; r++) for (let c = 0; c < n; c++) {
        const d = (c + r) / (n + rows), q = eOut(clamp01(p * 2.3 - d * 1.3)); if (q <= 0) continue;
        const z = (s * q) / 2 + 0.5; ctx.rect(c * s + s / 2 - z, r * s + s / 2 - z, z * 2, z * 2);
      }
    }
  }

  // ---------- 1つの場面を描く（out：去っていく度合い、inn：入ってくる度合い） ----------
  function drawScene(sc, t, out, inn) {
    ctx.save();
    const sc0 = (1 + 0.28 * eIn(out)) * (0.86 + 0.14 * inn) * (1 + 0.012 * Math.sin(t * 0.6));
    ctx.translate(cx, cy);
    ctx.rotate(G.tx * 0.03 + 0.05 * eIn(out) - 0.04 * (1 - inn));
    ctx.transform(1, G.ty * 0.04, -G.tx * 0.04, 1, 0, 0);
    ctx.scale(sc0, sc0); ctx.translate(-cx, -cy);
    ctx.fillStyle = sc.bg; ctx.fillRect(-W, -H, W * 3, H * 3);
    ctx.globalAlpha = 1; sc.draw(t, C);
    ctx.restore(); ctx.globalAlpha = 1; ctx.setLineDash([]);
  }

  // ---------- ふわふわ浮かぶ小さな形（場面が変わっても、ずっと漂う） ----------
  const conf = Array.from({ length: CONFETTI }, (_, n) => ({ x: Math.random(), y: Math.random(), z: 0.2 + Math.random(), k: n % 6, s: 2 + Math.random() * 3.5, r: Math.random() * TAU, vr: (Math.random() - 0.5) * 1.6, vy: 0.012 + Math.random() * 0.03, ph: Math.random() * TAU, ci: n % 4 }));
  function confetti(sc, dt, T0) {
    conf.forEach((p) => {
      p.y -= p.vy * dt * (0.6 + p.z); if (p.y < -0.04) { p.y += 1.08; p.x = Math.random(); }
      p.r += p.vr * dt;
      const x = p.x * W + Math.sin(T0 * 0.6 + p.ph) * 10 + G.tx * p.z * PARALLAX * 1.6, y = p.y * FH + G.ty * p.z * PARALLAX * 1.6, s = p.s * (0.7 + p.z * 0.5), col = sc.acc[p.ci];
      ctx.save(); ctx.translate(x, y); ctx.rotate(p.r); ctx.fillStyle = col; ctx.strokeStyle = col; ctx.lineWidth = 1.4;
      if (p.k === 0) { ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, TAU); ctx.fill(); }
      else if (p.k === 1) { ctx.beginPath(); ctx.arc(0, 0, s, 0, TAU); ctx.stroke(); }
      else if (p.k === 2) { ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.stroke(); }
      else if (p.k === 3) ctx.strokeRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4);
      else if (p.k === 4) { ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s * 0.9, s * 0.6); ctx.lineTo(-s * 0.9, s * 0.6); ctx.closePath(); ctx.fill(); }
      else { ctx.beginPath(); for (let i = 0; i < 8; i++) { const a = (i * Math.PI) / 4, rr = i % 2 ? s * 0.3 : s; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); ctx.fill(); }
      ctx.restore();
    });
  }

  // ---------- 情報の文字・ものさし ----------
  function hud(sc, idx, local, T0) {
    const ink = sc.ink, m = 20, y1 = 58, prog = local / SCENE_SEC, i = ((idx % N) + N) % N;
    const f = Math.floor(T0 * 24), tc = `${pad(T0 / 3600)}:${pad((T0 / 60) % 60)}:${pad(T0 % 60)}:${pad(f % 24)}`;
    T.label(`COMP 01 — ${sc.name}`, m, y1, ink, 9);
    T.label('24 FPS', W - m - 44, y1, ink, 9, 'right');
    if (Math.floor(T0 * 1.6) % 2 === 0) { ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(W - m - 34, y1, 3.5, 0, TAU); ctx.fill(); }
    T.label('REC', W - m, y1, ink, 9, 'right');
    T.label(`SCENE ${pad(i + 1)} / ${pad(N)}`, m, y1 + 15, ink, 9);
    T.label(tc, W - m, y1 + 15, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.25; ctx.fillRect(m, y1 + 28, W - m * 2, 1); ctx.globalAlpha = 1;
    ctx.fillRect(m + (W - m * 2) * prog - 1, y1 + 24, 2, 9);
    // 右のものさし
    const rx = W - 12, r0 = y1 + 56, r1 = Math.max(r0 + 60, FH * 0.6);
    ctx.globalAlpha = 0.7;
    for (let y = r0; y <= r1; y += 6) { const long = Math.round((y - r0) / 6) % 5 === 0; ctx.fillRect(rx - (long ? 8 : 4), y, long ? 8 : 4, 1); }
    const my = r0 + (r1 - r0) * (0.5 + 0.5 * Math.sin(T0 * 0.7));
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(rx - 10, my); ctx.lineTo(rx - 16, my - 4); ctx.lineTo(rx - 16, my + 4); ctx.closePath(); ctx.fill();
    T.label(pad(my, 3), rx - 19, my, ink, 8, 'right');
    // 下の進み具合
    const yb = FH - 28, seg = (W - m * 2 - (N - 1) * 6) / N;
    T.label('AUTO PLAY ▶', m, yb - 16, ink, 9);
    T.label(`TILT ${G.tx >= 0 ? '+' : ''}${G.tx.toFixed(2)} ${G.ty >= 0 ? '+' : ''}${G.ty.toFixed(2)}`, W - m, yb - 16, ink, 9, 'right');
    for (let k = 0; k < N; k++) {
      const x = m + k * (seg + 6); ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(x, yb, seg, 2);
      const fr = k < i ? 1 : k === i ? prog : 0; ctx.globalAlpha = 1; ctx.fillRect(x, yb, seg * fr, 2);
    }
  }

  // ---------- 1コマを描く ----------
  let start = performance.now(), last = performance.now(), lastGrain = 0, gx = 0, gy = 0, inkNow = '';
  window.OC_HERO = { seek(sec) { start = performance.now() - sec * 1000; } };   // （確認用）
  function frame(now) {
    if (!W) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const T0 = REDUCE ? 2.6 : (now - start) / 1000;
    updateTilt(now, T0);
    const idx = Math.floor(T0 / SCENE_SEC), local = T0 - idx * SCENE_SEC, i = ((idx % N) + N) % N, j = (i + 1) % N;
    const ti = idx === 0 ? local : local + TR_SEC;
    const k = REDUCE ? 0 : clamp01((local - (SCENE_SEC - TR_SEC)) / TR_SEC);
    drawScene(LIST[i], ti, k, 1);
    if (k > 0) {   // 次の場面が、形を変えながら入ってくる
      const type = TRANS[((idx % TRANS.length) + TRANS.length) % TRANS.length], seed = (idx * 0.618) % 1;
      const pL = clamp01(k * 1.3), pN = clamp01(k * 1.3 - 0.3);
      transPath(type, pL, seed); ctx.fillStyle = LIST[j].lead; ctx.fill();
      if (pN > 0) { ctx.save(); transPath(type, pN, seed); ctx.clip(); drawScene(LIST[j], local - (SCENE_SEC - TR_SEC), 0, eOut(pN)); ctx.restore(); }
    }
    const cur = k > 0.6 ? LIST[j] : LIST[i];
    if (!REDUCE) confetti(cur, dt, T0);
    hud(cur, k > 0.6 ? idx + 1 : idx, k > 0.6 ? 0 : local, T0);
    if (cur.ink !== inkNow) { inkNow = cur.ink; titleEls.forEach((el) => { el.style.color = cur.ink; }); }
    if (GRAIN > 0 && grainPat) {   // フィルムのようなざらざら（少しずつ動く）
      if (now - lastGrain > 80) { gx = Math.random() * 128; gy = Math.random() * 128; lastGrain = now; }
      ctx.save(); ctx.globalAlpha = GRAIN; ctx.translate(-gx, -gy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W + 128, H + 128); ctx.restore();
    }
  }

  // ---------- 大きさを決める ----------
  function textWidth() {   // タイトルの文字の、実際の幅（いちばん長い行）
    let w = 0; hero.querySelectorAll('.hm-l1, .hm-l2').forEach((l) => { const r = document.createRange(); r.selectNodeContents(l); w = Math.max(w, r.getBoundingClientRect().width); });
    return w || W * 0.6;
  }
  function build() {
    const r0 = hero.getBoundingClientRect();
    W = r0.width; H = r0.height;
    if (!W || !H || H > 4000 || W > 5000) { W = 0; return; }   // 異常に大きいときは動かさない
    const pb = parseFloat(getComputedStyle(hero).paddingBottom) || NOISE_H;
    FH = H - pb;
    // タイトルの文字の大きさを測って、空いている場所（タイトルの上か、右）に絵を収める
    const tr = (hero.querySelector('.hm-text') || hero).getBoundingClientRect(), tTop = tr.top - r0.top, tRight = tr.left - r0.left + textWidth();
    const top = 96, A = { x0: 16, x1: W - 22, y0: top, y1: Math.max(top + 40, tTop - 14) }, B = { x0: tRight + 24, x1: W - 26, y0: top, y1: FH - 70 };
    const fit = (R) => Math.max(0, Math.min((R.x1 - R.x0) / 112, (R.y1 - R.y0) / 100));
    const R = fit(B) > fit(A) ? B : A;
    u = Math.min(fit(R), Math.min(W, FH) / 96); cx = (R.x0 + R.x1) / 2; cy = (R.y0 + R.y1) / 2;
    C.u = u; C.W = G.W = W; C.H = G.H = H; C.FH = G.FH = FH;
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
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(build);   // 文字の形が読み込まれたら、測り直す
  if (!REDUCE) requestAnimationFrame(loop);
})();
