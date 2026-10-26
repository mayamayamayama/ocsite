// bridge.js — 入場画面（明るくてカラフル）と、下の一覧（黒と黄緑）を「つなぐ」演出
// 1) 色の帯：入場画面の「SIGNAL」と同じ色の帯を、ノイズの下と、最後の文字の上に細く流す
// 2) ポロポロ落ちてくる部品：カードの後ろを、入場画面の部品（コイン・立方体・銀の玉など）が、ときどき落ちていく
// 3) フィルムの粒子：暗い部分にも、入場画面と同じザラッとした質感を薄くかける
// スクロールがガクつかないように、動きはすべてブラウザの得意な方法（transform のアニメーション）で動かしています。
// このファイルが無くても、サイトはふつうに動きます（つなぎの演出が出ないだけ）。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('bridge');
  const $ = (s) => document.querySelector(s);
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const EVERY = [0.9, 2.3];   // 次の部品が落ちてくるまでの秒数（最短, 最長）
  const AT_ONCE = 3;          // 1回に落ちてくる数の最大（1〜この数のあいだで、毎回ばらばら）
  const MAX_LIVE = 10;        // 同時に落ちている数の上限
  const SIZE = 1;             // 部品の大きさ（2で2倍）
  const FALL_SEC = [2.6, 4.6];// 画面の上から下まで落ちるのにかかる秒数（速い, 遅い）

  // ---------- 1) 色の帯 ----------
  const SEGS = [[46, '#f4f4f4'], [70, ['#00f0ff', '#ff2fa0', '#ff9ad5']], [54, '#14a39f'], [38, '#2a2aff'], [70, '#e8501e'], [30, '#ff9a76'],
    [24, '#fa8c14'], [60, ['#fffaf4', '#1b1b1b']], [40, '#d8ff00'], [90, '#2b2b2b'], [50, ['#fffaf4', '#9a9a9a', '#1b1b1b']], [36, '#141b3a'], [64, '#fde9dc']];
  function cbar(cls) {
    const d = document.createElement('div'); d.className = 'cbar ' + cls; d.setAttribute('aria-hidden', 'true');
    let half = '';
    for (let k = 0; k < 4; k++) SEGS.forEach(([w, c], n) => {
      const bg = Array.isArray(c) ? `linear-gradient(90deg,${c.join(',')})` : c;
      half += `<i style="width:${Math.round(w * (0.7 + ((n * 7 + k * 3) % 5) * 0.18))}px;background:${bg}"></i>`;
    });
    d.innerHTML = `<div class="cbar-track">${half}${half}</div>`;
    return d;
  }
  const ticker = $('.ticker'), reel = $('#reel');
  if (ticker) ticker.parentNode.insertBefore(cbar(''), ticker);
  if (reel) reel.parentNode.insertBefore(cbar('rev thin'), reel);

  // ---------- 3) フィルムの粒子（ページの背景そのものに、薄い粒を敷く。スクロール中の負担はゼロ） ----------
  (function () {
    const n = document.createElement('canvas'); n.width = n.height = 128; const c = n.getContext('2d'), im = c.createImageData(128, 128);
    for (let q = 0; q < im.data.length; q += 4) {
      const lit = Math.random() < 0.5; im.data[q] = im.data[q + 1] = im.data[q + 2] = lit ? 255 : 0; im.data[q + 3] = Math.random() * (lit ? 16 : 30);
    }
    c.putImageData(im, 0, 0);
    document.body.style.backgroundImage = `url(${n.toDataURL()})`; document.body.style.backgroundRepeat = 'repeat';
  })();

  // ---------- 2) ポロポロ落ちてくる部品 ----------
  const grid = $('#character-grid'), view = $('#index-screen'), band = $('.deco-band');
  if (typeof window.OC_HERO_PARTS !== 'function' || !grid || !view || REDUCE) return;   // 3Dの部品（hero-parts.js）が無いときは、出さない

  // 部品の絵を、最初に1回だけ描いておく（落ちている間は、絵を動かすだけなので軽い）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', blue: '#2a2aff', pink: '#ff2fa0', peach: '#ff9a76', cyan: '#00f0ff', white: '#fffaf4', black: '#1b1b1b', lime: '#d8ff00' };
  const PI = Math.PI, PT = 0.36, D = 900, cp = Math.cos(PT), sp = Math.sin(PT), BOX = 96, RES = 5;   // RES：絵の細かさ（大きく表示しても、ぼやけないように）
  const pc = document.createElement('canvas'); pc.width = pc.height = BOX * RES; const ctx = pc.getContext('2d');
  const G = { ctx, PAL, f: D, dpr: RES, CA: 1, tx: 0, ty: 0, camPos: [0, D * sp, D * cp] };
  G.proj = (p) => { const yc = p[1] * cp - p[2] * sp, depth = D - (p[1] * sp + p[2] * cp), k = D / Math.max(depth, 1); return [BOX / 2 + p[0] * k, BOX / 2 - yc * k, depth]; };
  const T = window.OC_HERO_PARTS(G);
  const base = { p: [0, 0, 0], s: 1, sx: 1, sy: 1, r: [0, 0, 0], ga: 0, sa: 0 };
  // flip：コインのように、縦にくるくる回る（そうでないものは、平らに回る）
  const KINDS = [
    { o: { type: 'coin', w: 26, d: 8, c: 'cream', c2: 'orange', bull: 'verm', r: [0, 0.55, 0] }, flip: 1 },
    { o: { type: 'box', bw: 34, bh: 34, bd: 34, c: 'teal', side: '#0d7d7a', top: '#3fc6c2', r: [0, 0.6, 0] } },
    { o: { type: 'sphere', w: 22 } },
    { o: { type: 'flat', shape: 'tri', w: 24, g: ['cyan', 'blue', 'pink'], ga: PI / 2, r: [0, 0, PI] }, flip: 1 },
    { o: { type: 'lines', kind: 'ring', w: 24, c: 'lime', lw: 3, alpha: 1, r: [0.2, 0.5, 0] }, flip: 1 },
    { o: { type: 'flat', shape: 'half', w: 26, c: 'orange' } },
    { o: { type: 'flat', shape: 'square', w: 22, sy: 0.72, c: 'peach', stripes: 'verm' } },
    { o: { type: 'box', bw: 50, bh: 9, bd: 22, c: '#e8e8ff', holo: 1, r: [0.15, 0.5, 0] } },
    { o: { type: 'box', bw: 26, bh: 26, bd: 26, c: '#d8ff00', side: '#9fbd00', top: '#f0ff9a', r: [0, -0.5, 0] } },
    { o: { type: 'flat', shape: 'wedge', w: 22, c: 'verm' } },
    { o: { type: 'flat', shape: 'circle', w: 22, sx: 0.72, g: ['#ffd0dc', 'pink', 'blue'], ga: 0.8 }, flip: 1 },
    { o: { type: 'coin', w: 22, d: 7, c: 'teal', c2: 'teal', bull: 'cream', r: [0, -0.5, 0] }, flip: 1 }
  ];
  // 1つずつ、少し時間をずらして描く（ページを開いた瞬間が重くならないように）
  (function paint(n) {
    if (n >= KINDS.length) return;
    const k = KINDS[n], o = Object.assign({}, base, k.o); if (typeof o.shape === 'string') o.shape = T.SHAPES[o.shape];
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, pc.width, pc.height); ctx.setTransform(RES, 0, 0, RES, 0, 0);
    if (o.type === 'coin') T.coin(o, 0.8); else if (o.type === 'box') T.box(o); else if (o.type === 'sphere') T.sphere(o);
    else if (o.type === 'lines') T.lines(o, 0); else T.flat(o, 1.2);
    const next = () => setTimeout(() => paint(n + 1), 60);
    if (pc.toBlob) pc.toBlob((b) => { if (b) k.src = URL.createObjectURL(b); next(); }); else { k.src = pc.toDataURL(); next(); }
  })(0);

  // カードの後ろに、部品が落ちる層を敷く
  const layer = document.createElement('div'); layer.className = 'fall-layer'; layer.setAttribute('aria-hidden', 'true');
  grid.insertBefore(layer, grid.firstChild);
  let live = 0, last = null;
  const rnd = (a, b) => a + Math.random() * (b - a);

  function drop() {
    if (live >= MAX_LIVE) return;
    if (!layer.isConnected) grid.insertBefore(layer, grid.firstChild);
    const g0 = grid.getBoundingClientRect(), b0 = band ? band.getBoundingClientRect() : g0;
    layer.style.top = -Math.max(0, g0.top - b0.top) + 'px';   // 文字の輪の帯から、カードの並びの下まで
    const gr = layer.getBoundingClientRect(), vh = window.innerHeight, vw = window.innerWidth;
    const ready = KINDS.filter((q) => q.src); if (!ready.length) return;
    let k = Math.floor(Math.random() * ready.length); if (ready[k] === last && ready.length > 1) k = (k + 1) % ready.length;
    const K = ready[k], far = Math.random() < 0.35; last = K;   // 奥のもの（小さく、うすく、ゆっくり）と、手前のもの
    const size = Math.round((far ? rnd(60, 90) : rnd(110, 170)) * SIZE * Math.min(1.5, Math.max(1, vw / 700)));
    const top = Math.max(-size, -gr.top - size - 10);                 // 今見ている画面の、少し上から
    const dist = Math.min(vh + size * 2 + 40, gr.height - top);      // 画面の下まで（カードの並びの下の端まで）
    if (dist < 120) return;
    const x = rnd(-0.06, 0.92) * vw, dx = rnd(-40, 40);   // 層の左はしが、画面の左はし
    const dur = (far ? FALL_SEC[1] : FALL_SEC[0]) * 1000 * (dist / vh) * rnd(0.85, 1.15);
    const r0 = rnd(-40, 40), r1 = r0 + rnd(160, 420) * (Math.random() < 0.5 ? -1 : 1), fy = K.flip ? rnd(360, 900) : 0;
    const img = new Image(); img.src = K.src; img.alt = ''; img.draggable = false;
    img.style.cssText = `left:${x}px;top:${top}px;width:${size * 96 / 64}px;opacity:${far ? 0.55 : 1}`;
    layer.appendChild(img); live++;
    const a = img.animate([
      { transform: `translate3d(0,0,0) rotate(${r0}deg) perspective(400px) rotateY(0deg)` },
      { transform: `translate3d(${dx}px,${dist}px,0) rotate(${r1}deg) perspective(400px) rotateY(${fy}deg)` }
    ], { duration: dur, easing: 'cubic-bezier(.42,0,.86,.62)', fill: 'forwards' });   // 落ちるほど速くなる
    a.onfinish = a.oncancel = () => { img.remove(); live--; };
  }
  function tick() {
    setTimeout(tick, rnd(EVERY[0], EVERY[1]) * 1000);
    if (document.hidden || !view.classList.contains('active')) return;
    const gr = layer.getBoundingClientRect(); if (gr.bottom < 0 || gr.top > window.innerHeight || !gr.height) return;   // カードの並びが見えているときだけ
    const n = 1 + Math.floor(Math.random() * AT_ONCE);
    for (let i = 0; i < n; i++) setTimeout(drop, i * rnd(120, 380));   // ポロ、ポロ、と少しずつずらして
  }
  setTimeout(tick, 800);
})();
