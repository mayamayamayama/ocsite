// trans.js — 画面が切り替わるときの演出（文字なし・入場画面と同じ色）
// 今は COLUMNS だけを使っています。
//   COLUMNS：6本の色の柱が、下から順に伸びて覆い、上へ抜けていく（最初の幕と同じ動き）
//   SIGNAL ：色の帯が、左右から斜めに飛び込む（入場画面のショット7）※今は使っていません
// 元の幕（#curtain）の動きに合わせて上から描いているだけなので、site.js は変えていません。このファイルが無いときは、元の幕が出ます。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('trans');
  const curtain = document.getElementById('curtain');
  if (!curtain || typeof window.OC_HERO_PARTS !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ===== ここの数字を変えると、見た目が変わります =====
  const COVER = 0.6;     // 画面を覆いきるまでの秒数（0.65より短くしてね。0.65秒で中身が入れ替わるため）
  const REVEAL = 0.9;    // 覆いが開いて、新しい画面が見えるまでの秒数
  const ONLY = 'columns';   // 使う種類。'' にすると COLUMNS と SIGNAL が毎回ランダムに、'signal' にすると SIGNAL だけになる
  const COLS = 6;        // COLUMNS の柱の本数
  // COLUMNS の柱の色（毎回ここから選んで並べる。[ ] で囲んだものは、グラデーション）
  const COLORS = ['teal', 'verm', 'orange', 'navy', 'cream', 'blue', 'peach', '#2b2b2b', ['cyan', 'pink', '#ff9ad5'], ['white', '#1b1b1b'], ['pink', '#ff9ad5', 'blue'], ['#1b1b1b', '#bdbdbd']];

  const css = document.createElement('style'); css.textContent = '.curtain i{visibility:hidden!important}';   // 元の幕の色の柱は、見えなくする
  document.head.appendChild(css);
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:51;pointer-events:none;display:none';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', blue: '#2a2aff', pink: '#ff2fa0', peach: '#ff9a76', cyan: '#00f0ff', white: '#fffaf4', black: '#1b1b1b' };
  const col = (c) => PAL[c] || c;
  const D = 2400;
  let W = 0, H = 0, dpr = 1;
  const G = { ctx, PAL, f: D, dpr: 1, CA: 0, tx: 0, ty: 0, camPos: [0, 0, D] };
  G.proj = (p) => { const z = D - p[2], k = D / Math.max(z, 1); return [W / 2 + p[0] * k, H / 2 - p[1] * k, z]; };
  const T = window.OC_HERO_PARTS(G);

  const cl = (x) => Math.max(0, Math.min(1, x));
  const eIn = (x) => x * x * x, eX = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const fill = (c) => { ctx.fillStyle = col(c); ctx.fillRect(0, 0, W, H); };

  // フィルムの粒子（描いたものの上にだけかける、明るい粒と暗い粒）
  const sp = document.createElement('canvas'); sp.width = sp.height = 160;
  (function () { const g = sp.getContext('2d'), im = g.createImageData(160, 160); for (let q = 0; q < im.data.length; q += 4) { const lit = Math.random() < 0.5; im.data[q] = im.data[q + 1] = im.data[q + 2] = lit ? 255 : 0; im.data[q + 3] = Math.random() * (lit ? 34 : 46); } g.putImageData(im, 0, 0); })();
  let spPat = null;

  // ---------- 1) SIGNAL：入場画面の色の帯が、左右から斜めに飛び込んでくる ----------
  const ROWS = [
    [[0.5, '#f4f4f4'], [0.9, ['cyan', 'pink', '#ff9ad5']], [0.7, 'teal'], [0.5, 'blue'], [0.9, 'verm'], [0.4, 'peach'], [0.3, 'orange'], [0.8, ['white', '#1b1b1b']]],
    [[0.4, 'white'], [1.2, '#2b2b2b'], [1.4, ['white', '#9a9a9a', '#1b1b1b']], [0.6, 'blue'], [0.7, 'navy']],
    [[1.4, ['pink', '#ff9ad5', 'blue']], [0.6, 'navy'], [0.6, 'teal'], [0.9, 'cream'], [0.6, 'orange']],
    [[0.6, 'orange'], [1.0, 'teal'], [0.8, 'cream'], [0.7, ['#1b1b1b', 'white']], [0.5, 'verm']],
    [[1.6, ['#1b1b1b', '#bdbdbd']], [0.5, 'orange'], [0.8, 'black'], [0.6, 'verm']],
    [[0.9, 'verm'], [0.5, 'orange'], [1.2, 'navy'], [0.7, ['cyan', 'white']]]
  ];
  function signal() {
    const n = W > H ? 7 : 9, rh = H / n, sc = Math.max(W, 520) / 6, rows = [];
    for (let k = 0; k < n; k++) rows.push({ y: H / 2 - (k + 0.5) * rh, s: k % 2 ? 1 : -1, segs: ROWS[k % 6].map(([w, c]) => [w * sc, c]), sp: (k % 2 ? 1 : -1) * sc * (0.5 + (k % 3) * 0.3), d: Math.random() * 0.18 });
    const strip = (r, x, z, a) => ({ type: 'strip', p: [x, r.y, z], r: [0, a, 0], s: 1, w: W * 1.8, h: rh + 1, segs: r.segs, sp: r.sp });
    return {
      cover(p, t) {
        if (p >= 0.999) fill('navy');
        rows.forEach((r) => { const e = eX(cl((p - r.d) / 0.62)); if (e > 0) T.strip(strip(r, r.s * (1 - e) * W * 1.9, (1 - e) * 300, r.s * (1 - e) * 1.0), t); });
      },
      reveal(q, t) {
        rows.forEach((r) => { const u = eIn(cl((q - (0.18 - r.d)) / 0.6)); if (u < 1) T.strip(strip(r, -r.s * u * W * 2, u * 200, -r.s * u * 1.0), t); });
      }
    };
  }

  // ---------- 2) COLUMNS：6本の色の柱が、下から順に伸びて覆い、上へ抜けていく ----------
  const eQ = (x) => (x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2);   // 最初の幕と同じ、ゆっくり→速く→ゆっくり
  function columns() {
    const mix = (a) => a.sort(() => Math.random() - 0.5);
    const grad = mix(COLORS.filter(Array.isArray)).slice(0, 1 + Math.floor(Math.random() * 2));   // グラデーションは1〜2本
    const list = mix(grad.concat(mix(COLORS.filter((c) => !Array.isArray(c))).slice(0, COLS - grad.length)));
    const cw = W / COLS;
    function col1(k, y0, y1) {   // k本目の柱を、y0 から y1 の高さまで塗る
      if (y1 - y0 < 0.5) return;
      const c = list[k], x = Math.floor(k * cw), w = Math.ceil((k + 1) * cw) - x;
      if (Array.isArray(c)) { const g = ctx.createLinearGradient(x, 0, x + w, 0); c.forEach((cc, i) => g.addColorStop(i / (c.length - 1), col(cc))); ctx.fillStyle = g; }
      else ctx.fillStyle = col(c);
      ctx.fillRect(x, y0, w, y1 - y0);
    }
    return {
      cover(p) { const s = p * COVER; for (let k = 0; k < COLS; k++) { const e = eQ(cl((s - k * 0.04) / 0.42)); col1(k, H * (1 - e), H); } },   // 下から伸びる
      reveal(q) { const s = q * REVEAL; for (let k = 0; k < COLS; k++) { const e = eQ(cl((s - k * 0.055) / 0.55)); col1(k, 0, H * (1 - e)); } }   // 下の端が上へ抜ける
    };
  }

  // ---------- 動かす ----------
  const FX = { signal, columns };
  let phase = '', t0 = 0, t1 = 0, fx = null, lastK = '', raf = 0;
  function start() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.5e6 / (W * H))); G.dpr = dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); if (!spPat) spPat = ctx.createPattern(sp, 'repeat');
    const f = window.OC_TRANS && window.OC_TRANS.force, k = FX[ONLY] ? ONLY : FX[f] ? f : pick(Object.keys(FX));
    lastK = k; fx = FX[k](); phase = 'cover'; t0 = performance.now(); cv.style.display = 'block';
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function loop(now) {
    raf = 0; const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H);
    if (phase === 'cover') fx.cover(cl((now - t0) / 1000 / COVER), t);
    else if (phase === 'reveal') {
      const q = cl((now - t1) / 1000 / REVEAL); fx.reveal(q, t);
      if (q >= 1) { phase = ''; ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; return; }
    } else { cv.style.display = 'none'; return; }
    if (spPat) { ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = spPat; ctx.fillRect(0, 0, W, H); ctx.restore(); }   // 描いたものの上にだけ、粒子
    raf = requestAnimationFrame(loop);
  }
  const toReveal = () => { phase = 'reveal'; t1 = performance.now(); };
  new MutationObserver(() => {
    const c = curtain.className;
    if (/\bin\b/.test(c) && phase !== 'cover') start();
    else if (/\bout\b/.test(c) && phase === 'cover') toReveal();
    else if (!/\bon\b/.test(c) && phase === 'cover') toReveal();
  }).observe(curtain, { attributes: true, attributeFilter: ['class'] });
  window.OC_TRANS = { force: '', test(k, p, q) {   // （確認用）
    start(); if (FX[k]) fx = FX[k]();
    if (q == null) { phase = 'cover'; t0 = performance.now() - p * COVER * 1000; } else { phase = 'reveal'; t1 = performance.now() - q * REVEAL * 1000; }
  } };
})();
