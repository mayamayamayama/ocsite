// hero.js — 入場画面のメインビジュアル
// あたたかい色のモーショングラフィックス。マウスや指で触ると、図形が逃げたり、ふくらんだり、はじけたりします。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  if (!cssOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // motion.css が読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う（キャンバスは、ページの高さに影響させない）
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#f2e6d0';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ここの数字・色を変えると見た目が変わります
  const MOVE = true;         // false で、動きを止める
  const PUSH = 0.11;         // マウスや指から逃げる量（大きいほど遠くへ逃げる）
  const REACH = 0.30;        // マウスや指の影響が届く広さ
  const PARALLAX = 16;       // 奥行きの動き（px）
  const NOISE_H = 240;       // 下にノイズが重なる高さ（effects.js と同じ数字）
  const COL = { bg: '#f2e6d0', ink: '#2b1d16', orange: '#ff6a2b', coral: '#ff4f5e', mustard: '#f7b32b', teal: '#1f7a74', peach: '#ffb48a' };

  const TAU = Math.PI * 2, P = window.OC_POINTER || { x: 0, y: 0 };
  const pad = (n, l = 2) => String(Math.floor(n)).padStart(l, '0');
  function rng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
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

  // ---------- 画面の大きさ ----------
  let W = 0, H = 0, FH = 0, S = 0, dpr = 1, shapes = [], visible = true;
  const ptr = { x: 0, y: 0, active: false, mouse: false };
  const particles = [], ripples = [];

  // [種類, 横(0〜1), 縦(0〜1), 大きさ(短い辺に対する割合), 色, 奥行き, 回る速さ]
  const DEFS = [
    ['circle', .36, .30, .60, 'orange', .35, 0],
    ['dial', .36, .30, .76, 'ink', .5, .06],
    ['circle', .84, .72, .22, 'mustard', .8, 0],
    ['half', .90, .14, .24, 'coral', .7, -.22],
    ['quarter', .02, .78, .26, 'teal', .6, 0],
    ['badge', .78, .36, .22, 'ink', 1, .45],
    ['sparkle', .30, .052, .07, 'coral', .9, .2], ['sparkle', .60, .052, .05, 'ink', .8, -.3], ['sparkle', .56, .56, .07, 'mustard', 1, .25],
    ['sparkle', .20, .54, .05, 'ink', .6, .15], ['sparkle', .94, .54, .06, 'coral', 1, -.2], ['sparkle', .70, .60, .045, 'teal', .7, .3],
    ['plus', .06, .30, .035, 'ink', .5, .2], ['plus', .50, .06, .03, 'ink', .6, -.3], ['plus', .90, .30, .03, 'ink', .4, .2], ['plus', .62, .44, .03, 'coral', .7, .4],
    ['plus', .30, .62, .03, 'ink', .5, -.2], ['plus', .96, .84, .035, 'ink', .5, .3], ['plus', .08, .58, .028, 'teal', .6, .2],
    ['square', .20, .20, .07, 'ink', .7, .3], ['square', .74, .50, .05, 'coral', .9, -.5], ['square', .48, .72, .045, 'teal', .6, .4],
    ['zig', .62, .56, .22, 'ink', .6, 0], ['zig', .10, .46, .18, 'coral', .5, 0],
    ['tri', .48, .16, .06, 'teal', .8, .5], ['tri', .92, .66, .05, 'coral', .6, -.4],
    ['bars', .90, .46, .12, 'mustard', .9, 0], ['dots', .54, .62, .09, 'ink', .5, 0],
    ['ripple', .72, .78, .34, 'coral', .4, 0], ['pill', .80, .60, .18, 'peach', .6, 0]
  ];

  function build() {
    const rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (!W || !H || H > 4000 || W > 5000) return;   // 異常に大きいときは動かさない（ページが重くなるのを防ぐ）
    const pb = parseFloat(getComputedStyle(hero).paddingBottom) || NOISE_H;
    FH = H - pb; S = Math.min(W, FH);
    dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (W * H)));   // 描く面積に上限
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const r = rng(11);
    shapes = DEFS.map(([k, u, v, sz, col, depth, spin]) => ({
      k, hx: u * W, hy: v * FH, x: u * W, y: v * FH, size: sz * S, col: COL[col], depth, spin,
      sc: 1, rot: r() * TAU, ph: r() * TAU, inf: 0
    }));
    // 大きな文字の位置を測っておく
    const hb = hero.getBoundingClientRect();
    letters.forEach((l) => { const b = l.el.getBoundingClientRect(); l.cx = b.left - hb.left + b.width / 2; l.cy = b.top - hb.top + b.height / 2; });
    draw(performance.now());
  }

  // ---------- 図形を描く部品 ----------
  function star(x, y, r, rot, n, inner) {
    ctx.beginPath();
    for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, rr = i % 2 ? r * inner : r; ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    ctx.closePath();
  }
  function drawShape(s, t) {
    const r = (s.size / 2) * s.sc, x = s.x, y = s.y, rot = s.rot, c = s.col;
    ctx.save(); ctx.fillStyle = c; ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    switch (s.k) {
      case 'circle': { const p = 1 + Math.sin(t * 1.2 + s.ph) * 0.025; ctx.beginPath(); ctx.arc(x, y, r * p, 0, TAU); ctx.fill(); break; }
      case 'dial': {
        ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
        for (let i = 0; i < 72; i++) { const a = rot + (i / 72) * TAU, l = i % 6 === 0 ? 14 : 6; ctx.beginPath(); ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); ctx.lineTo(x + Math.cos(a) * (r + l), y + Math.sin(a) * (r + l)); ctx.stroke(); }
        ctx.lineWidth = 3; ctx.strokeStyle = COL.coral; ctx.beginPath(); ctx.arc(x, y, r - 8, rot * 2, rot * 2 + 1.3); ctx.stroke();
        ctx.fillStyle = COL.coral; star(x + Math.cos(rot * 2) * (r - 8), y + Math.sin(rot * 2) * (r - 8), 6, 0, 4, .3); ctx.fill(); break;
      }
      case 'half': ctx.beginPath(); ctx.arc(x, y, r, rot, rot + Math.PI); ctx.closePath(); ctx.fill(); break;
      case 'quarter': ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, rot, rot + Math.PI / 2); ctx.closePath(); ctx.fill(); break;
      case 'badge': {
        ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
        const text = 'OC ARCHIVE • 2026 • ', n = text.length; ctx.fillStyle = COL.bg; ctx.font = `700 ${Math.max(8, r * 0.2)}px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        for (let i = 0; i < n; i++) { const a = rot + (i / n) * TAU; ctx.save(); ctx.translate(x + Math.cos(a) * r * 0.74, y + Math.sin(a) * r * 0.74); ctx.rotate(a + Math.PI / 2); ctx.fillText(text[i], 0, 0); ctx.restore(); }
        star(x, y, r * 0.3, -rot, 4, .28); ctx.fillStyle = COL.mustard; ctx.fill(); break;
      }
      case 'sparkle': { const p = 0.75 + Math.sin(t * 2 + s.ph) * 0.25; star(x, y, r * p, rot, 4, .22); ctx.fill(); break; }
      case 'plus': ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(x - r, y); ctx.lineTo(x + r, y); ctx.moveTo(x, y - r); ctx.lineTo(x, y + r); ctx.stroke(); break;
      case 'square': ctx.translate(x, y); ctx.rotate(rot); ctx.lineWidth = 2; ctx.strokeRect(-r, -r, r * 2, r * 2); break;
      case 'tri': ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath(); for (let i = 0; i < 3; i++) { const a = (i / 3) * TAU - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); break;
      case 'zig': {
        ctx.lineWidth = 3; ctx.setLineDash([r * 0.5, r * 0.18]); ctx.lineDashOffset = -t * 30; ctx.beginPath();
        for (let i = 0; i <= 8; i++) ctx.lineTo(x - r + (i / 8) * r * 2, y + (i % 2 ? -1 : 1) * r * 0.22); ctx.stroke(); break;
      }
      case 'bars': { const w = r * 0.28; for (let i = 0; i < 5; i++) { const h = r * (0.45 + 0.55 * Math.abs(Math.sin(t * (1.6 + i * 0.35) + i))) ; ctx.fillRect(x - r + i * (w + r * 0.14), y + r - h, w, h); } break; }
      case 'dots': { for (let i = 0; i < 9; i++) { const gx = i % 3, gy = Math.floor(i / 3), p = 0.5 + 0.5 * Math.sin(t * 2 + i * 0.7); ctx.beginPath(); ctx.arc(x - r * .6 + gx * r * .6, y - r * .6 + gy * r * .6, 2 + p * 2.5, 0, TAU); ctx.fill(); } break; }
      case 'ripple': { for (let i = 0; i < 3; i++) { const p = ((t * 0.25 + i / 3 + s.ph) % 1); ctx.globalAlpha = (1 - p) * 0.8; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * p, 0, TAU); ctx.stroke(); } break; }
      case 'pill': { const w = r * 1.6, h = r * 0.5, ox = Math.sin(t * 0.8 + s.ph) * r * 0.5; ctx.beginPath(); ctx.roundRect(x - w / 2 + ox, y - h / 2, w, h, h / 2); ctx.fill(); ctx.fillStyle = COL.ink; ctx.beginPath(); ctx.arc(x - w / 2 + h / 2 + ox + (Math.sin(t * 2) * 0.5 + 0.5) * (w - h), y, h * 0.22, 0, TAU); ctx.fill(); break; }
    }
    ctx.restore();
  }

  // ---------- 情報の文字・ものさし ----------
  function label(text, x, y, align, color, size) {
    ctx.fillStyle = color || COL.ink; ctx.font = `600 ${size || 10}px ${MONO}`; ctx.textAlign = align || 'left'; ctx.textBaseline = 'middle';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
    ctx.fillText(text, x, y);
  }
  function info(t, frame) {
    const m = 20, top = 62, sec = Math.floor(t) % 60, f = Math.floor(t * 24) % 24;
    label('COMP 01 — OC ARCHIVE', m, top); label('24 FPS / 1080 × 1350', m, top + 14, 'left', COL.ink, 9);
    if (Math.floor(t * 1.5) % 2 === 0 || !MOVE) { ctx.fillStyle = COL.coral; ctx.beginPath(); ctx.arc(m + 4, top + 34, 4, 0, TAU); ctx.fill(); }
    label('REC', m + 14, top + 34, 'left', COL.coral);
    label(`00:00:${pad(sec)}:${pad(f)}`, W - m, top, 'right'); label('SCENE 01 / TAKE 03', W - m, top + 14, 'right', COL.ink, 9);
    label(`FRAME ${pad(frame, 4)}`, m, FH - 66, 'left', COL.ink, 9);
    label(`RGB 255 106 043`, W - m, FH - 66, 'right', COL.ink, 9);
  }
  function timeline(t) {
    const y = FH - 34, x0 = 20, x1 = W - 20, len = x1 - x0, p = MOVE ? (t / 9) % 1 : 0.35, px = x0 + len * p;
    ctx.save(); ctx.strokeStyle = COL.ink; ctx.fillStyle = COL.ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.stroke();
    for (let i = 0; i <= len; i += 10) { ctx.beginPath(); ctx.moveTo(x0 + i, y); ctx.lineTo(x0 + i, y + (i % 50 === 0 ? 10 : 5)); ctx.stroke(); }
    [.12, .31, .47, .66, .84].forEach((k) => { const kx = x0 + len * k; ctx.beginPath(); ctx.moveTo(kx, y - 9); ctx.lineTo(kx + 5, y - 4); ctx.lineTo(kx, y + 1); ctx.lineTo(kx - 5, y - 4); ctx.closePath(); if (p > k) ctx.fill(); else ctx.stroke(); });
    ctx.strokeStyle = COL.coral; ctx.fillStyle = COL.coral; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(px, y - 18); ctx.lineTo(px, y + 14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(px - 6, y - 22); ctx.lineTo(px + 6, y - 22); ctx.lineTo(px, y - 14); ctx.closePath(); ctx.fill();
    ctx.restore();
  }

  // ---------- 1コマを描く ----------
  let frameNo = 0;
  function draw(now) {
    if (!W) return;
    const t = MOVE && !REDUCE ? now / 1000 : 0;
    ctx.globalAlpha = 1; ctx.fillStyle = COL.bg; ctx.fillRect(0, 0, W, H);
    // うっすら網点
    ctx.fillStyle = 'rgba(43,29,22,.1)';
    for (let gx = 11; gx < W; gx += 22) for (let gy = 11; gy < H; gy += 22) ctx.fillRect(gx, gy, 1.5, 1.5);

    const R = REACH * S;
    shapes.forEach((s) => {
      let tx = s.hx + P.x * s.depth * PARALLAX, ty = s.hy + P.y * s.depth * PARALLAX, ts = 1, inf = 0;
      if (ptr.active) {
        const dx = s.hx - ptr.x, dy = s.hy - ptr.y, d = Math.hypot(dx, dy) || 1; inf = Math.exp(-Math.pow(d / R, 2));
        tx += (dx / d) * inf * PUSH * S; ty += (dy / d) * inf * PUSH * S; ts = 1 + inf * 0.5;
      }
      s.x += (tx - s.x) * 0.12; s.y += (ty - s.y) * 0.12; s.sc += (ts - s.sc) * 0.15; s.inf = inf;
      s.rot = s.ph + (MOVE && !REDUCE ? t * s.spin : 0) + inf * 0.6;
    });
    // 後ろ（大きい図形）から順に
    shapes.forEach((s) => drawShape(s, t));

    // まわる小さな衛星（大きな丸のまわり）
    const big = shapes[0];
    for (let i = 0; i < 3; i++) {
      const a = t * (0.6 + i * 0.25) + i * 2.1, rr = big.size / 2 * (1.12 + i * 0.1);
      ctx.fillStyle = [COL.ink, COL.mustard, COL.coral][i]; ctx.beginPath(); ctx.arc(big.x + Math.cos(a) * rr, big.y + Math.sin(a) * rr, 5 + i, 0, TAU); ctx.fill();
    }
    // 波の線
    ctx.strokeStyle = COL.ink; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let x = 0; x <= W; x += 6) { const y = FH * 0.625 + Math.sin(x * 0.03 + t * 1.5) * 8; ctx.lineTo(x, y); } ctx.stroke();

    frameNo = Math.floor(t * 24);
    info(t, frameNo); timeline(t);

    // はじけた粒・波紋
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i], p = Math.max(0, (now - rp.t0) / 900); if (p >= 1) { ripples.splice(i, 1); continue; }
      ctx.strokeStyle = COL.ink; ctx.globalAlpha = 1 - p; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(rp.x, rp.y, p * S * 0.35, 0, TAU); ctx.stroke(); ctx.globalAlpha = 1;
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const q = particles[i]; q.life -= 0.016; if (q.life <= 0) { particles.splice(i, 1); continue; }
      q.vy += 0.25; q.x += q.vx; q.y += q.vy; q.vx *= 0.985; q.rot += q.vr;
      ctx.globalAlpha = Math.min(1, q.life * 1.5); ctx.fillStyle = q.col; ctx.strokeStyle = q.col; ctx.lineWidth = 2.5;
      if (q.k === 0) { ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, TAU); ctx.fill(); }
      else if (q.k === 1) { star(q.x, q.y, q.r * 1.6, q.rot, 4, .25); ctx.fill(); }
      else { ctx.beginPath(); ctx.moveTo(q.x - q.r, q.y); ctx.lineTo(q.x + q.r, q.y); ctx.moveTo(q.x, q.y - q.r); ctx.lineTo(q.x, q.y + q.r); ctx.stroke(); }
      ctx.globalAlpha = 1;
    }
    // マウスの目印
    if (ptr.active && ptr.mouse) {
      ctx.strokeStyle = COL.ink; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(ptr.x, ptr.y, 16, 0, TAU); ctx.moveTo(ptr.x - 24, ptr.y); ctx.lineTo(ptr.x - 8, ptr.y); ctx.moveTo(ptr.x + 8, ptr.y); ctx.lineTo(ptr.x + 24, ptr.y); ctx.stroke();
      label(`X ${pad(ptr.x, 3)} Y ${pad(ptr.y, 3)}`, ptr.x + 22, ptr.y - 20, 'left', COL.ink, 9);
    }
    // 大きな文字（近づくとふくらんで、逃げる）
    letters.forEach((l) => {
      let k = 0, dx = 0, dy = 0;
      if (ptr.active) { const ex = l.cx - ptr.x, ey = l.cy - ptr.y, d = Math.hypot(ex, ey) || 1; k = Math.exp(-Math.pow(d / (S * 0.28), 2)); dx = (ex / d) * k * 14; dy = (ey / d) * k * 14; }
      l.k += (k - l.k) * 0.15;
      if (l.k > 0.001 || l.on) { l.el.style.scale = String(1 + l.k * 0.28); l.el.style.translate = `${dx}px ${dy}px`; l.on = l.k > 0.001; }
    });
  }

  // ---------- 触る ----------
  function local(e) { const r = hero.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; }
  hero.addEventListener('pointermove', (e) => { const p = local(e); ptr.x = p.x; ptr.y = p.y; ptr.active = true; ptr.mouse = e.pointerType === 'mouse'; });
  hero.addEventListener('pointerleave', () => { ptr.active = false; });
  hero.addEventListener('pointerup', (e) => { if (e.pointerType !== 'mouse') ptr.active = false; });
  hero.addEventListener('pointercancel', () => { ptr.active = false; });
  hero.addEventListener('pointerdown', (e) => {
    const p = local(e); ptr.x = p.x; ptr.y = p.y; ptr.active = true; ptr.mouse = e.pointerType === 'mouse';
    ripples.push({ x: p.x, y: p.y, t0: performance.now() });
    const cols = [COL.orange, COL.coral, COL.mustard, COL.teal, COL.ink];
    for (let i = 0; i < 16; i++) {
      const a = Math.random() * TAU, v = 3 + Math.random() * 6;
      particles.push({ x: p.x, y: p.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 2, r: 3 + Math.random() * 6, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 0.3, k: i % 3, col: cols[i % cols.length], life: 1 });
    }
    if (REDUCE || !MOVE) draw(performance.now());
  });

  // ---------- ループ ----------
  new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) build(); }).observe(hero);
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
  function loop(now) { if (visible && W) draw(now); requestAnimationFrame(loop); }
  build();
  if (MOVE && !REDUCE) requestAnimationFrame(loop);
})();
