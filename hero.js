// hero.js — 入場画面のメインビジュアル
// 2Dと3Dの中間のような、カラフルなモーショングラフィックス。場面が次々に切り替わります。
// タップ（クリック）すると、その場所から次の場面へ。マウスや指を近づけると、図形が逃げて、ふくらみます。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  if (!cssOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // motion.css が読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#fde9dc';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ここの数字・色を変えると見た目が変わります
  const MOVE = true;          // false で、動きを止める
  const AUTO = true;          // false で、タップしたときだけ次の場面へ
  const SCENE_SEC = 4.4;      // 1つの場面の長さ（秒）
  const PUSH = 0.07;          // マウスや指から逃げる量
  const REACH = 0.26;         // マウスや指の影響が届く広さ
  const PARALLAX = 14;        // 奥行きの動き（px）
  const GRAIN = 0.09;         // フィルムのようなざらざらの強さ（0で無し）
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', white: '#fffaf4', black: '#1b1b1b', pink: '#ff2fa0', cyan: '#00f0ff', blue: '#2a2aff', peach: '#ff9a76' };

  const TAU = Math.PI * 2, P = window.OC_POINTER || { x: 0, y: 0 };
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  const rad = (d) => (d * Math.PI) / 180;
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const eOut = (t) => 1 - Math.pow(1 - t, 3);
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const e = (t, s, d, f = eOut) => f(clamp01((t - s) / d));   // 時間 t のうち、s秒から d秒かけて 0→1 になる動き
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';

  // ---------- 大きな文字（1文字ずつ。マウスが近づくとふくらむ） ----------
  const letters = [];
  hero.querySelectorAll('[data-t]').forEach((line) => {
    [...line.dataset.t].forEach((c, i) => {
      const o = document.createElement('span'); o.className = 'ch'; o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.textContent = c; s.style.setProperty('--i', i + (line.classList.contains('hm-l2') ? 2 : 0));
      o.appendChild(s); line.appendChild(o); letters.push({ el: o, cx: 0, cy: 0, k: 0 });
    });
  });
  setTimeout(() => hero.classList.add('is-in'), 150);
  const titleEls = [hero.querySelector('.hm-title'), hero.querySelector('.subtitle')].filter(Boolean);
  titleEls.forEach((el) => { el.style.transition = 'color .5s'; });

  // ---------- 画面の大きさ・マウス ----------
  let W = 0, H = 0, FH = 0, S = 0, u = 1, cx = 0, cy = 0, dpr = 1, visible = true, grainPat = null;
  const ptr = { x: 0, y: 0, sx: 0, sy: 0, k: 0, active: false, mouse: false };
  const X = (v) => cx + v * u, Y = (v) => cy + v * u;     // 場面の中の位置（単位u）を、画面の位置に直す

  // 図形の中心(x,y)に、マウスの影響と奥行きの動きを足す
  function fx(x, y, z) {
    let ox = P.x * z * PARALLAX, oy = P.y * z * PARALLAX, s = 1;
    if (ptr.k > 0.01) {
      const dx = x - ptr.sx, dy = y - ptr.sy, d = Math.hypot(dx, dy) || 1, inf = Math.exp(-Math.pow(d / (REACH * S), 2)) * ptr.k;
      ox += (dx / d) * inf * PUSH * S; oy += (dy / d) * inf * PUSH * S; s += inf * 0.35;
    }
    return [x + ox, y + oy, s];
  }

  // ---------- 図形の部品と、場面（hero-parts.js と hero-scenes.js） ----------
  if (typeof window.OC_HERO_PARTS !== 'function' || typeof window.OC_HERO_SCENES !== 'function') { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }
  const C = { u: 1, W: 0, H: 0, FH: 0, X, Y };    // 場面に渡す、画面の大きさの情報
  const G = { ctx, PAL, TAU, rad, clamp01, eBack, e, fx, P, W: 0, H: 0, FH: 0, u: 1 };
  const T = window.OC_HERO_PARTS(G), SC = window.OC_HERO_SCENES(G, T);

  const SCENES = [
    { bg: PAL.cream, ink: PAL.navy, draw: SC.sStairs }, { bg: PAL.teal, ink: PAL.cream, draw: SC.sCoins }, { bg: PAL.navy, ink: PAL.cream, draw: SC.sPie },
    { bg: PAL.cream, ink: PAL.navy, draw: SC.sFan }, { bg: PAL.orange, ink: PAL.navy, draw: SC.sIso }, { bg: PAL.verm, ink: PAL.cream, draw: SC.sRoom }
  ];
  const N = SCENES.length, st = { i: 0, t0: performance.now(), wipe: null };
  function applyInk() { titleEls.forEach((el) => { el.style.color = SCENES[st.i].ink; }); }
  function startWipe(x, y, now) { if (st.wipe) return; st.wipe = { x, y, t0: now, to: (st.i + 1) % N }; }
  window.OC_HERO = { goto(i) { st.i = i; st.t0 = performance.now(); st.wipe = null; applyInk(); } };   // （確認用）

  // ---------- 情報の文字・場面の数 ----------
  function label(text, x, y, align, col, size) {
    ctx.fillStyle = col; ctx.font = `600 ${size || 10}px ${MONO}`; ctx.textAlign = align; ctx.textBaseline = 'middle'; if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px'; ctx.fillText(text, x, y);
  }
  function hud(prog) {
    const ink = SCENES[st.i].ink, m = 20, y = FH - 28;
    label(`SCENE ${pad(st.i + 1)} / ${pad(N)}`, m, y - 16, 'left', ink, 9); label('TAP → NEXT', W - m, y - 16, 'right', ink, 9);
    const seg = (W - m * 2 - (N - 1) * 6) / N;
    for (let i = 0; i < N; i++) {
      const x = m + i * (seg + 6); ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(x, y, seg, 2);
      const f = i < st.i ? 1 : i === st.i ? prog : 0; ctx.globalAlpha = 1; ctx.fillRect(x, y, seg * f, 2);
    }
  }

  // ---------- 1コマを描く ----------
  let lastGrain = 0, gx = 0, gy = 0;
  function draw(now) {
    if (!W) return;
    ptr.sx += (ptr.x - ptr.sx) * 0.2; ptr.sy += (ptr.y - ptr.sy) * 0.2; ptr.k += ((ptr.active ? 1 : 0) - ptr.k) * 0.12;
    if (MOVE && !REDUCE && AUTO && !st.wipe && now - st.t0 > SCENE_SEC * 1000) startWipe(W / 2, FH * 0.35, now);
    const sc = SCENES[st.i], t = MOVE && !REDUCE ? (now - st.t0) / 1000 : SCENE_SEC * 0.7;
    ctx.globalAlpha = 1; ctx.fillStyle = sc.bg; ctx.fillRect(0, 0, W, H);
    ctx.save(); sc.draw(t, C); ctx.restore();
    if (st.wipe) {   // 次の場面の色が、タップした場所から広がる
      const w = st.wipe, p = clamp01((now - w.t0) / 650), R = Math.hypot(Math.max(w.x, W - w.x), Math.max(w.y, H - w.y));
      ctx.fillStyle = SCENES[w.to].bg; ctx.beginPath(); ctx.arc(w.x, w.y, eIO(p) * R, 0, TAU); ctx.fill();
      if (p >= 1) { st.i = w.to; st.t0 = now; st.wipe = null; applyInk(); }
    }
    hud(clamp01(((now - st.t0) / 1000) / SCENE_SEC));
    if (GRAIN > 0 && grainPat) {   // フィルムのようなざらざら（少しずつ動く）
      if (now - lastGrain > 80) { gx = Math.random() * 128; gy = Math.random() * 128; lastGrain = now; }
      ctx.save(); ctx.globalAlpha = GRAIN; ctx.translate(-gx, -gy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W + 128, H + 128); ctx.restore();
    }
    // 大きな文字（近づくとふくらんで、逃げる）
    letters.forEach((l) => {
      let k = 0, dx = 0, dy = 0;
      if (ptr.k > 0.01) { const ex = l.cx - ptr.sx, ey = l.cy - ptr.sy, d = Math.hypot(ex, ey) || 1; k = Math.exp(-Math.pow(d / (S * 0.28), 2)) * ptr.k; dx = (ex / d) * k * 14; dy = (ey / d) * k * 14; }
      l.k += (k - l.k) * 0.15;
      if (l.k > 0.001 || l.on) { l.el.style.scale = String(1 + l.k * 0.28); l.el.style.translate = `${dx}px ${dy}px`; l.on = l.k > 0.001; }
    });
  }

  // ---------- 大きさを決める ----------
  function build() {
    const rect0 = hero.getBoundingClientRect();
    W = rect0.width; H = rect0.height;
    if (!W || !H || H > 4000 || W > 5000) return;   // 異常に大きいときは動かさない
    const pb = parseFloat(getComputedStyle(hero).paddingBottom) || NOISE_H;
    FH = H - pb; S = Math.min(W, FH * 0.8); u = S / 112; cx = W > FH * 1.1 ? W * 0.62 : W / 2; cy = FH * 0.32;   // 横長の画面では、絵を右に寄せて、文字と重ならないようにする
    C.u = G.u = u; C.W = G.W = W; C.H = G.H = H; C.FH = G.FH = FH;
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (W * H)));
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!grainPat) {
      const n = document.createElement('canvas'); n.width = n.height = 128; const c = n.getContext('2d'), d = c.createImageData(128, 128);
      for (let i = 0; i < d.data.length; i += 4) { const v = Math.random() < 0.5 ? 0 : 255; d.data[i] = d.data[i + 1] = d.data[i + 2] = v; d.data[i + 3] = Math.random() * 70; }
      c.putImageData(d, 0, 0); grainPat = ctx.createPattern(n, 'repeat');
    }
    const hb = hero.getBoundingClientRect();
    letters.forEach((l) => { const b = l.el.getBoundingClientRect(); l.cx = b.left - hb.left + b.width / 2; l.cy = b.top - hb.top + b.height / 2; });
    applyInk(); draw(performance.now());
  }

  // ---------- 触る ----------
  function local(ev) { const r = hero.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; }
  hero.addEventListener('pointermove', (ev) => { const p = local(ev); if (!ptr.active) { ptr.sx = p.x; ptr.sy = p.y; } ptr.x = p.x; ptr.y = p.y; ptr.active = true; ptr.mouse = ev.pointerType === 'mouse'; });
  hero.addEventListener('pointerleave', () => { ptr.active = false; });
  hero.addEventListener('pointerup', (ev) => { if (ev.pointerType !== 'mouse') ptr.active = false; });
  hero.addEventListener('pointercancel', () => { ptr.active = false; });
  hero.addEventListener('pointerdown', (ev) => {
    const p = local(ev); ptr.sx = ptr.x = p.x; ptr.sy = ptr.y = p.y; ptr.active = true; ptr.mouse = ev.pointerType === 'mouse';
    startWipe(p.x, p.y, performance.now());   // タップした場所から、次の場面へ
    if (REDUCE || !MOVE) { st.i = (st.i + 1) % N; st.wipe = null; applyInk(); draw(performance.now()); }
  });

  // ---------- ループ ----------
  new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) build(); }).observe(hero);
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; if (visible) st.t0 = Math.max(st.t0, performance.now() - 1000 * SCENE_SEC * 0.5); }).observe(hero);
  function loop(now) { if (visible && W) draw(now); requestAnimationFrame(loop); }
  build();
  if (MOVE && !REDUCE) requestAnimationFrame(loop);
})();
