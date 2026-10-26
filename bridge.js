// bridge.js — 入場画面（明るくてカラフル）と、下の一覧（黒と黄緑）を「つなぐ」演出
// 1) 色の帯：入場画面の「SIGNAL」と同じ色の帯を、ノイズの下と、最後の文字の上に細く流す
// 2) 落ちてくる物体：スクロールすると、入場画面のコインや立方体がノイズをすり抜けて落ちてきて、
//    「CHARACTER」の文字の上に着地する。そのあとも、その場で回り続ける
// 3) フィルムの粒子：暗い部分にも、入場画面と同じザラッとした質感を薄くかける
// このファイルが無くても、サイトはふつうに動きます（つなぎの演出が出ないだけ）。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('bridge');
  const $ = (s) => document.querySelector(s);
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const GRAVITY = 2600;    // 落ちる速さ（大きいほど、速く落ちる）
  const BOUNCE = 0.42;     // 着地したときの弾み（0で弾まない）
  const SIZE = 1;          // 落ちてくる物体の大きさ（2で2倍）

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

  // ---------- 3) フィルムの粒子 ----------
  const grain = document.createElement('div'); grain.className = 'oc-grain'; grain.setAttribute('aria-hidden', 'true');
  (function () {
    const n = document.createElement('canvas'); n.width = n.height = 128; const c = n.getContext('2d'), im = c.createImageData(128, 128);
    for (let q = 0; q < im.data.length; q += 4) { const v = Math.random() * 255; im.data[q] = im.data[q + 1] = im.data[q + 2] = v; im.data[q + 3] = 255; }
    c.putImageData(im, 0, 0); grain.style.backgroundImage = `url(${n.toDataURL()})`;
  })();
  document.body.appendChild(grain);
  const noise = $('#noise-divider');
  function updGrain() { const top = noise ? noise.getBoundingClientRect().top : 0; grain.classList.toggle('on', top < window.innerHeight * 0.6); }   // 入場画面を見ている間は、かけない（入場画面にはもう粒子があるので）
  window.addEventListener('scroll', updGrain, { passive: true }); window.addEventListener('resize', updGrain); updGrain();
  new MutationObserver(updGrain).observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ---------- 2) 落ちてくる物体 ----------
  if (typeof window.OC_HERO_PARTS !== 'function') return;   // 3Dの部品（hero-parts.js）が無いときは、物体だけ出さない
  const view = $('#index-screen'), title = $('#list-title'), rule = $('.meta .rule'), head = $('#list-head'), grid = $('#character-grid');
  if (!view || !title || !head || !rule || !grid) return;
  const cv = document.createElement('canvas'); cv.id = 'drop-cv'; cv.setAttribute('aria-hidden', 'true');
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', blue: '#2a2aff', pink: '#ff2fa0', peach: '#ff9a76', cyan: '#00f0ff', white: '#fffaf4', black: '#1b1b1b', lime: '#d8ff00' };

  // カメラ：少し上から見下ろす。物体ごとに、その物体の真正面に置く
  const PT = 0.36, D = 900, cp = Math.cos(PT), sp = Math.sin(PT);
  let ax = 0, ay = 0, dpr = 1, W = 0, H = 0;
  const G = { ctx, PAL, f: D, dpr: 1, CA: 0.8, tx: 0, ty: 0, camPos: [0, D * sp, D * cp] };
  G.proj = (p) => {
    const yc = p[1] * cp - p[2] * sp, depth = D - (p[1] * sp + p[2] * cp), k = D / Math.max(depth, 1);
    return [ax + p[0] * k, ay - yc * k, depth];
  };
  const T = window.OC_HERO_PARTS(G);
  const PI = Math.PI, FLOOR = [-PI / 2, 0, 0];

  // 物体の一覧。on：どこに着地するか（文字の何番目 / 線の上のどこ）、h：中心から底までの高さ、rest：着地したあとの動き
  const OBJ = [
    { o: { type: 'coin', w: 15, d: 6, c: 'cream', c2: 'orange', bull: 'verm' }, on: ['ch', 1], h: 15, rest: (t) => ({ r: [0, t * 2.4, 0] }) },
    { o: { type: 'stack' }, on: ['ch', 3], h: 9, rest: () => ({ r: FLOOR }) },
    { o: { type: 'lines', kind: 'ring', w: 13, c: 'lime', lw: 1.6, alpha: 1 }, on: ['ch', 4], h: 13, air: 30, rest: (t) => ({ r: [0, t * 1.6, 0], dy: 4 * Math.sin(t * 2) }) },
    { o: { type: 'box', bw: 26, bh: 26, bd: 26, c: 'teal', side: '#0d7d7a', top: '#3fc6c2' }, on: ['ch', 6], h: 18, rest: (t) => ({ r: [0, 0.5 + t * 0.5, 0] }) },
    { o: { type: 'sphere', w: 12 }, on: ['ch', 7], h: 12, rest: (t) => ({ dx: 8 * Math.sin(t * 0.9) }) },
    { o: { type: 'flat', shape: T.SHAPES.tri, w: 11, g: ['cyan', 'blue', 'pink'], ga: PI / 2 }, on: ['rule', 0.28], h: 8, rest: (t) => ({ r: [0, t * 1.8, PI] }) },
    { o: { type: 'box', bw: 18, bh: 18, bd: 18, c: '#d8ff00', side: '#9fbd00', top: '#f0ff9a' }, on: ['rule', 0.66], h: 13, rest: (t) => ({ r: [0, -t * 0.7, 0] }) }
  ];
  const STACK = [['white', '#bdbdbd'], ['verm', null], ['orange', null]];
  OBJ.forEach((b, i) => { b.i = i; b.st = 'wait'; b.y = 0; b.vy = 0; b.tum = [0, 0, 0]; b.w = [3 + i, 5 - i * 0.6, 2 + (i % 3)]; Object.assign(b.o, { p: [0, 0, 0], s: 1, sx: 1, sy: 1, r: [0, 0, 0], ga: b.o.ga || 0, sa: 0 }); });

  // 着地する場所（画面の上での位置）を、文字の位置から計算する
  let capOff = 0.18, fontKey = '';
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { fontKey = ''; });   // 文字が読み込めたら、測り直す
  function measureCap(F, fam) {   // 文字の上の端が、行の上からどれくらい下にあるか
    const c = document.createElement('canvas').getContext('2d'); c.font = `700 ${F}px ${fam}`;
    const m = c.measureText('H'), fa = m.fontBoundingBoxAscent || F * 0.9, fd = m.fontBoundingBoxDescent || F * 0.22, cap = m.actualBoundingBoxAscent || F * 0.7;
    return ((0.95 * F - (fa + fd)) / 2 + fa - cap) / F;
  }
  function spot(b) {
    if (b.on[0] === 'ch') {
      const chs = title.querySelectorAll('.ch'), el = chs[Math.min(b.on[1], chs.length - 1)] || title;
      const cs = getComputedStyle(title), F = parseFloat(cs.fontSize) || 50, key = F + cs.fontFamily;
      if (key !== fontKey) { fontKey = key; capOff = measureCap(F, cs.fontFamily); }
      const r = el.getBoundingClientRect(), tr = title.getBoundingClientRect();
      return { x: r.left + r.width / 2, y: tr.top + capOff * F, u: Math.pow(F / 52, 0.75) };   // 大きな画面では、文字ほどは大きくしない
    }
    const r = rule.getBoundingClientRect(), u = Math.pow((parseFloat(getComputedStyle(title).fontSize) || 52) / 52, 0.75) * 0.85;
    return { x: r.left + rule.offsetWidth * b.on[1], y: r.top, u };
  }

  function draw(b, x, y, r, s, u) {
    const k = s * u * SIZE; if (k < 0.02) return;
    ax = x; ay = y; b.o.r = r; b.o.s = k;
    if (b.o.type === 'stack') {   // 3枚重なったコイン
      STACK.forEach(([c, c2], n) => { ay = y - n * 6 * k; T.coin({ type: 'coin', p: [0, 0, 0], r, s: k, w: 15, d: 5, c, c2, bull: n === 2 ? 'cream' : null }, 0); });
    } else if (b.o.type === 'coin') T.coin(b.o, 0);
    else if (b.o.type === 'box') T.box(b.o);
    else if (b.o.type === 'sphere') T.sphere(b.o);
    else if (b.o.type === 'lines') T.lines(b.o, 0);
    else if (b.o.type === 'flat') T.flat(b.o, 0);
  }

  // 一覧のカードの、右上の切り欠きにも、小さな物体を1つずつ置く（カードの色と同じ色）
  const CARD = [
    { type: 'coin', w: 9, d: 3.5, c: 'verm', c2: 'verm', bull: 'cream', rest: (t) => [0, t * 2, 0] },
    { type: 'box', bw: 14, bh: 14, bd: 14, c: 'orange', side: '#c96a00', top: '#ffb24d', rest: (t) => [0, t * 0.8, 0] },
    { type: 'lines', kind: 'ring', w: 9, c: 'teal', lw: 1.6, alpha: 1, rest: (t) => [0, t * 1.6, 0] },
    { type: 'flat', shape: T.SHAPES.tri, w: 8, g: ['cyan', 'blue', 'pink'], ga: PI / 2, rest: (t) => [0, t * 1.8, PI] }
  ].map((o) => Object.assign({ p: [0, 0, 0], s: 1, sx: 1, sy: 1, r: [0, 0, 0], ga: 0, sa: 0 }, o));
  let cards = [], cardsAt = 0;
  function drawCards(t) {
    if (t - cardsAt > 1) { cards = [...document.querySelectorAll('.card')]; cardsAt = t; }
    cards.forEach((c, i) => {
      if (!c.classList.contains('is-in')) return;
      const m = c.querySelector('.card-media'); if (!m) return;
      const r = m.getBoundingClientRect(); if (r.bottom < -40 || r.top > H + 40 || !r.width) return;
      const o = CARD[i % CARD.length], u = Math.max(1, Math.min(1.6, r.width / 300));
      ax = r.right - 7 * u; ay = r.top + 7 * u - 2 * u * Math.sin(t * 1.5 + i); o.r = o.rest(t + i); o.s = u;
      if (o.type === 'coin') T.coin(o, 0); else if (o.type === 'box') T.box(o); else if (o.type === 'lines') T.lines(o, 0); else T.flat(o, 0);
    });
  }

  // ---------- 動かす ----------
  let started = false, t0 = 0, last = 0, cleared = true;
  const lerpA = (a, c, p) => a + (((c - a + PI) % (2 * PI) + 2 * PI) % (2 * PI) - PI) * p;
  function resize() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2); G.dpr = dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); cleared = true;
  }
  function frame(now) {
    requestAnimationFrame(frame);
    const t = now / 1000, dt = Math.min(0.05, last ? t - last : 0); last = t;
    const hr = head.getBoundingClientRect(), nr = noise ? noise.getBoundingClientRect() : hr;
    const active = view.classList.contains('active') && hr.height > 0;
    const near = active && nr.top < H + 200 && hr.bottom > -200;   // 見出しが画面の近くにあるか
    const gr = active ? grid.getBoundingClientRect() : null, nearCards = !!gr && gr.top < H && gr.bottom > 0;
    if (started && (!active || !near)) OBJ.forEach((b) => { if (b.st !== 'rest') { b.st = 'rest'; b.rt = t - 10; b.from = b.tum.slice(); } });   // 見ていない間に落ちきったことにする
    if (near && !started) {   // 見出しが見えたら、落とし始める
      if (hr.bottom < 0 || REDUCE) { started = true; t0 = t - 10; OBJ.forEach((b) => { b.st = 'rest'; b.rt = t - 10; }); }   // もう通り過ぎていたら、着地した状態から
      else if (head.classList.contains('is-in') && hr.top < H * 0.85) { started = true; t0 = t + 0.45; }
    }
    const drawHead = near && started;
    if (!drawHead && !nearCards) { if (!cleared) { ctx.clearRect(0, 0, W, H); cleared = true; } return; }   // 描くものが無いときは、何もしない
    ctx.clearRect(0, 0, W, H); cleared = false;
    if (nearCards) drawCards(t);
    if (!drawHead) return;
    const sy = window.scrollY;
    OBJ.forEach((b) => {
      const sp0 = spot(b), floor = sp0.y + sy - (b.h + (b.air || 0)) * sp0.u * SIZE;   // ページの上での、着地する高さ
      const st = t0 + b.i * 0.09;
      if (b.st === 'wait') { if (t < st) return; b.st = 'fall'; b.y = nr.top + sy - 20; b.vy = 0; b.bn = 0; }
      if (b.st === 'fall') {
        b.vy += GRAVITY * dt; b.y += b.vy * dt;
        for (let a = 0; a < 3; a++) b.tum[a] += b.w[a] * dt;
        if (b.y >= floor) {
          b.y = floor; b.vy = -b.vy * BOUNCE; b.bn++;
          if (Math.abs(b.vy) < 160 || b.bn >= 3) { b.st = 'rest'; b.rt = t; b.from = b.tum.slice(); }
        }
      }
      let y = b.st === 'rest' ? floor : b.y, x = sp0.x, r = b.tum;
      if (b.st === 'rest') {
        const R = b.rest(t), q = Math.min(1, (t - b.rt) / 0.35), e = q < 0.5 ? 4 * q * q * q : 1 - Math.pow(-2 * q + 2, 3) / 2, rr = R.r || [0, 0, 0];
        r = q < 1 ? [0, 1, 2].map((a) => lerpA(b.from[a], rr[a], e)) : rr;
        x += (R.dx || 0) * sp0.u; y += (R.dy || 0) * sp0.u;
      }
      draw(b, x, y - sy, r, Math.min(1, (t - st) / 0.15), sp0.u);
    });
  }
  window.addEventListener('resize', resize); resize();
  requestAnimationFrame(frame);
})();
