// trans.js — 画面が切り替わるときの演出。入場画面と同じ3Dの部品で描きます。
// 4種類（WALL：ブロックの壁 / DISCS：巨大なコイン / SIGNAL：色の帯 / IRIS：図形の穴）から、毎回ランダムに選びます。
// 元の幕（#curtain）が動くタイミングに合わせて、上から描いているだけなので、site.js は変えていません。
// このファイルが無いときは、元の幕がそのまま出ます。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('trans');
  const curtain = document.getElementById('curtain');
  if (!curtain || typeof window.OC_HERO_PARTS !== 'function') return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // ===== ここの数字を変えると、見た目が変わります =====
  const COVER = 0.6;     // 画面を覆いきるまでの秒数（0.65より短くしてね。0.65秒で中身が入れ替わるため）
  const REVEAL = 0.95;   // 覆いが開いて、新しい画面が見えるまでの秒数
  const ONLY = '';       // 'wall' / 'discs' / 'signal' / 'iris' と書くと、その1種類だけになる（確認用）

  const css = document.createElement('style'); css.textContent = '.curtain i{visibility:hidden!important}';   // 元の幕の色の柱は、見えなくする
  document.head.appendChild(css);
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:51;pointer-events:none;display:none';
  document.body.appendChild(cv);
  const ctx = cv.getContext('2d');
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', blue: '#2a2aff', pink: '#ff2fa0', peach: '#ff9a76', cyan: '#00f0ff', white: '#fffaf4', black: '#1b1b1b', lime: '#d8ff00' };
  const col = (c) => PAL[c] || c;
  const PI = Math.PI, D = 2400;
  let W = 0, H = 0, dpr = 1;
  const G = { ctx, PAL, f: D, dpr: 1, CA: 0, tx: 0, ty: 0, camPos: [0, 0, D] };
  G.proj = (p) => { const z = D - p[2], k = D / Math.max(z, 1); return [W / 2 + p[0] * k, H / 2 - p[1] * k, z]; };
  const T = window.OC_HERO_PARTS(G);

  const cl = (x) => Math.max(0, Math.min(1, x));
  const eOut = (x) => 1 - Math.pow(1 - x, 3), eIn = (x) => x * x * x, eX = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  const pad = (n) => String(n).padStart(2, '0');
  const fill = (c) => { ctx.fillStyle = col(c); ctx.fillRect(0, 0, W, H); };
  // 箱の色（正面・横・上）
  const BOXC = { verm: ['verm', '#b83a12', '#ff7a4c'], orange: ['orange', '#c96a00', '#ffb24d'], teal: ['teal', '#0d7d7a', '#3fc6c2'], navy: ['navy', '#0b1026', '#2b3566'],
    cream: ['cream', '#d9b9a6', '#fff4ea'], lime: ['lime', '#9fbd00', '#f0ff9a'], pink: ['pink', '#c41f7c', '#ff8acb'], blue: ['blue', '#1d1dc0', '#5c5cff'] };

  // ---------- 1) WALL：ブロックが飛んできて壁になり、崩れ落ちる ----------
  function wall() {
    const cols = Math.max(4, Math.round(W / 130)), tw = W / cols, rows = Math.ceil(H / tw), th = H / rows;
    const SETS = [['navy', 'teal', 'orange', 'verm'], ['verm', 'orange', 'cream', 'teal'], ['navy', 'blue', 'pink', 'cream']], set = SETS[Math.floor(Math.random() * SETS.length)];
    const oi = Math.random() < 0.5 ? 0 : cols - 1, oj = Math.random() < 0.5 ? 0 : rows - 1, md = Math.hypot(cols, rows), tiles = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const r = Math.random(), c = r < 0.06 ? 'lime' : r < 0.32 ? set[1 + Math.floor(Math.random() * 3)] : set[0];   // ほとんどは1色。ときどき差し色と黄緑
      tiles.push({ x: -W / 2 + (i + 0.5) * tw, y: H / 2 - (j + 0.5) * th, c: BOXC[c], d: (Math.hypot(i - oi, j - oj) / md) * 0.4,
        fr: (1 - j / rows) * 0.32 + Math.random() * 0.12, a: Math.random() * 2 - 1, b: Math.random() * 2 - 1 });
    }
    const box = (t, p, r) => ({ type: 'box', p, r, s: 1, bw: tw + 1, bh: th + 1, bd: Math.min(tw, th) * 0.6, c: t.c[0], side: t.c[1], top: t.c[2] });
    const draw = (list) => list.sort((a, b) => a.p[2] - b.p[2]).forEach((o) => T.box(o));
    return {
      ca: 0, bg: set[0],
      cover(p) {
        if (p >= 0.999) fill(set[0]);
        draw(tiles.map((t) => { const e = eOut(cl((p - t.d) / 0.6)); return e <= 0 ? null : box(t, [t.x, t.y, -(1 - e) * 2600], [(1 - e) * 1.6 * t.a, (1 - e) * 1.8 * t.b, 0]); }).filter(Boolean));
      },
      reveal(q) {
        draw(tiles.map((t) => { const u = cl((q - t.fr) / 0.5); return u >= 1 ? null : box(t, [t.x + t.b * 90 * u, t.y - u * u * H * 1.4, u * 600], [u * 2.2 * t.a, u * 1.4 * t.b, u * 1.6 * t.a]); }).filter(Boolean));
      }
    };
  }

  // ---------- 2) DISCS：巨大なコインが回りながら重なり、めくれるように去っていく ----------
  function discs() {
    const R = (Math.hypot(W, H) / 2) * 1.06;
    const L = [[1, 'navy', '#0b1026'], [0.8, 'teal', '#0d7d7a'], [0.62, 'orange', '#c96a00'], [0.45, 'cream', '#d9b9a6', 'verm'], [0.26, 'verm', '#b83a12'], [0.11, 'lime', '#9fbd00']];
    const coin = (n, z, r) => ({ type: 'coin', p: [0, 0, z], r, s: 1, w: R * L[n][0], d: R * L[n][0] * 0.1, c: L[n][1], c2: L[n][2], bull: L[n][3] });
    return {
      ca: 1.4, bg: 'navy',
      cover(p, t) {
        if (p >= 0.999) fill('navy');
        L.forEach((_, n) => { const e = eX(cl((p - n * 0.07) / 0.6)); if (e > 0) T.coin(coin(n, -(1 - e) * 2600, [(1 - e) * 0.6, (1 - e) * (PI / 2 - 0.03) * (n % 2 ? 1 : -1), 0]), t); });
      },
      reveal(q, t) {
        L.forEach((_, n) => { const u = cl((q - (L.length - 1 - n) * 0.07) / 0.5); if (u < 1) T.coin(coin(n, -eIn(u) * 2200, [eIn(u) * 0.5, eIn(u) * (PI / 2) * (n % 2 ? -1 : 1), 0]), t); });
      }
    };
  }

  // ---------- 3) SIGNAL：入場画面の色の帯が、左右から斜めに飛び込んでくる ----------
  const ROWS = [
    [[0.5, '#f4f4f4'], [0.9, ['cyan', 'pink', '#ff9ad5']], [0.7, 'teal'], [0.5, 'blue'], [0.9, 'verm'], [0.4, 'peach'], [0.3, 'orange'], [0.8, ['white', '#1b1b1b']]],
    [[0.4, 'white'], [1.2, '#2b2b2b'], [1.4, ['white', '#9a9a9a', '#1b1b1b']], [0.6, 'blue'], [0.7, 'navy']],
    [[1.4, ['pink', '#ff9ad5', 'blue']], [0.6, 'navy'], [0.6, 'teal'], [0.9, 'cream'], [0.6, 'orange']],
    [[0.6, 'orange'], [1.0, 'teal'], [0.5, 'lime'], [0.8, 'cream'], [0.7, ['#1b1b1b', 'white']], [0.5, 'verm']],
    [[1.6, ['#1b1b1b', '#bdbdbd']], [0.5, 'orange'], [0.8, 'black'], [0.6, 'verm']],
    [[0.9, 'verm'], [0.5, 'orange'], [1.2, 'navy'], [0.7, ['cyan', 'white']]]
  ];
  function signal() {
    const n = W > H ? 7 : 9, rh = H / n, sc = Math.max(W, 520) / 6, rows = [];
    for (let k = 0; k < n; k++) rows.push({ y: H / 2 - (k + 0.5) * rh, s: k % 2 ? 1 : -1, segs: ROWS[k % 6].map(([w, c]) => [w * sc, c]), sp: (k % 2 ? 1 : -1) * sc * (0.5 + (k % 3) * 0.3), d: Math.random() * 0.18 });
    const strip = (r, x, z, a) => ({ type: 'strip', p: [x, r.y, z], r: [0, a, 0], s: 1, w: W * 1.8, h: rh + 1, segs: r.segs, sp: r.sp });
    return {
      ca: 0, bg: '#ececec',
      cover(p, t) {
        if (p >= 0.999) fill('#ececec');
        rows.forEach((r) => { const e = eX(cl((p - r.d) / 0.62)); if (e > 0) T.strip(strip(r, r.s * (1 - e) * W * 1.9, (1 - e) * 300, r.s * (1 - e) * 1.0), t); });
      },
      reveal(q, t) {
        rows.forEach((r) => { const u = eIn(cl((q - (0.18 - r.d)) / 0.6)); if (u < 1) T.strip(strip(r, -r.s * u * W * 2, u * 200, -r.s * u * 1.0), t); });
      }
    };
  }

  // ---------- 4) IRIS：図形が回りながら広がって覆い、図形の形の穴が開いて抜けていく ----------
  function iris() {
    const Dg = Math.hypot(W, H) / 2;
    const S = [['circle', 'navy', 1.06], ['sun', 'orange', 0.8], ['square', 'teal', 0.48, PI / 4], ['circle', 'cream', 0.28, 0, 'verm'], ['spark', 'lime', 0.15]];
    const holes = ['diamond', 'spark', 'tri', 'square'], hole = holes[Math.floor(Math.random() * holes.length)];
    const sh = (n, e, t, z) => ({ type: 'flat', shape: T.SHAPES[S[n][0]], p: [0, 0, 0], r: [(1 - e) * 1.1, -(1 - e) * 0.9, (S[n][3] || 0) + (1 - e) * 2.4 + t * 0.4 * (n % 2 ? 1 : -1)],
      s: z, w: Dg * S[n][2] * e, sx: 1, sy: 1, c: S[n][1], split: S[n][4], sa: t * 1.5, ga: 0 });
    return {
      ca: 1.2, bg: 'navy',
      cover(p, t) {
        if (p >= 0.999) fill('navy');
        S.forEach((_, n) => { const e = eOut(cl((p - n * 0.06) / 0.6)); if (e > 0) T.flat(sh(n, e, t, 1), t); });
      },
      reveal(q, t) {
        const e = eIn(q);
        fill('navy'); S.forEach((_, n) => { if (n) T.flat(sh(n, 1, t, 1 + e * (0.4 + n * 0.25)), t); });   // 奥へ吸い込まれるように、内側ほど大きく
        ctx.save(); ctx.globalCompositeOperation = 'destination-out';   // 図形の形に、穴をあける
        T.flat({ type: 'flat', shape: T.SHAPES[hole], p: [0, 0, 0], r: [(1 - e) * 0.7, (1 - e) * 0.5, q * 1.8], s: 1, w: Dg * 1.5 * (hole === 'spark' ? 3.6 : hole === 'tri' ? 2.1 : 1.4) * e, sx: 1, sy: 1, c: '#000', ga: 0, sa: 0 }, t);
        ctx.restore();
      }
    };
  }

  // ---------- 真ん中に出る、行き先の名前 ----------
  function info() {
    const id = decodeURIComponent((location.hash || '').slice(1));
    let ch = null; try { ch = typeof characters === 'object' && characters[id]; } catch (e) {}
    if (!ch) return { name: 'INDEX', sub: 'BACK TO ARCHIVE' };
    let ids = []; try { ids = Object.keys(characters); } catch (e) {}
    return { name: String(ch.name || id), sub: `OPENING FILE ${pad(ids.indexOf(id) + 1)} / ${pad(ids.length)}` };
  }
  function label(I, p, q) {
    const size = Math.min(W * 0.16, 132), chars = [...I.name];
    ctx.save(); ctx.font = `700 ${size}px "Space Grotesk", "Helvetica Neue", Arial, sans-serif`; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    const ws = chars.map((c) => ctx.measureText(c).width * 0.97), total = ws.reduce((a, b) => a + b, 0), k = Math.min(1, (W * 0.9) / total);
    const by = H / 2 + size * 0.32 * k; let x = W / 2 - (total * k) / 2;
    ctx.beginPath(); ctx.rect(0, by - size * 0.95 * k, W, size * 1.25 * k); ctx.clip();   // この帯の中だけに見える（下からせり上がる）
    ctx.translate(0, 0); ctx.lineJoin = 'round'; ctx.lineWidth = 7 * k; ctx.strokeStyle = PAL.navy; ctx.fillStyle = PAL.cream;
    chars.forEach((c, i) => {
      const a = eOut(cl((p - 0.4 - i * 0.03) / 0.35)), b = eIn(cl((q - i * 0.02) / 0.32)), dy = (1 - a) * size * 1.1 * k - b * size * 1.2 * k;
      ctx.save(); ctx.translate(x, by + dy); ctx.scale(k, k); ctx.strokeText(c, 0, 0); ctx.fillText(c, 0, 0); ctx.restore();
      x += ws[i] * k;
    });
    ctx.restore();
    const a2 = cl((p - 0.55) / 0.2) * (1 - cl(q / 0.25));   // 下の小さな文字
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2; ctx.font = '600 10px ui-monospace, "SF Mono", Menlo, Consolas, monospace'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      if ('letterSpacing' in ctx) ctx.letterSpacing = '2.5px';
      const ty = by + size * 0.42 * k, tw = ctx.measureText(I.sub).width + 24;
      ctx.fillStyle = PAL.navy; ctx.fillRect(W / 2 - tw / 2, ty - 10, tw, 20); ctx.fillStyle = PAL.lime; ctx.fillText(I.sub, W / 2, ty + 1);
      ctx.restore();
    }
  }

  // ---------- 動かす ----------
  const FX = { wall, discs, signal, iris };
  let phase = '', t0 = 0, t1 = 0, fx = null, lastK = '', I = null, raf = 0;
  function start() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.5e6 / (W * H))); G.dpr = dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const keys = Object.keys(FX).filter((k) => k !== lastK), k = FX[ONLY] ? ONLY : keys[Math.floor(Math.random() * keys.length)];
    lastK = k; fx = FX[k](); I = info(); phase = 'cover'; t0 = performance.now(); cv.style.display = 'block';
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function loop(now) {
    raf = 0; const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); G.CA = fx.ca;
    if (phase === 'cover') { const p = cl((now - t0) / 1000 / COVER); fx.cover(p, t); label(I, p, 0); }
    else if (phase === 'reveal') {
      const q = cl((now - t1) / 1000 / REVEAL); fx.reveal(q, t); label(I, 1, q);
      if (q >= 1) { phase = ''; ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; return; }
    } else { cv.style.display = 'none'; return; }
    raf = requestAnimationFrame(loop);
  }
  new MutationObserver(() => {
    const c = curtain.className;
    if (/\bin\b/.test(c) && phase !== 'cover') start();
    else if (/\bout\b/.test(c) && phase === 'cover') { phase = 'reveal'; t1 = performance.now(); }
    else if (!/\bon\b/.test(c) && phase === 'cover') { phase = 'reveal'; t1 = performance.now(); }
  }).observe(curtain, { attributes: true, attributeFilter: ['class'] });
  window.OC_TRANS = { test(k, p, q) { if (k) lastK = ''; start(); if (FX[k]) { fx = FX[k](); } phase = q == null ? 'cover' : 'reveal'; t0 = performance.now() - p * COVER * 1000; t1 = performance.now() - (q || 0) * REVEAL * 1000; } };   // （確認用）
})();
