// trans.js — 画面が切り替わるときの演出。入場画面と同じ3Dの部品で描きます。
// 4種類（WALL：ブロックの壁 / DISCS：巨大なコイン / SIGNAL：帯 / IRIS：図形の穴）から、毎回ランダムに選びます。
// 色は、切り替わったあとの画面と同じ「黒・黄緑・生成り色」だけを使います。
// 真ん中の名前は、サイトの見出しと同じ文字（Space Grotesk）で出します。
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

  // ---------- 見た目（元の幕を隠す・真ん中の名前） ----------
  const css = document.createElement('style');
  css.textContent = `.curtain i{visibility:hidden!important}
.tr-label{position:fixed;left:0;right:0;top:50%;z-index:52;pointer-events:none;display:none;transform:translateY(-50%);text-align:center}
.tr-label.on,.tr-label.off{display:block}
.tr-band{position:absolute;left:0;right:0;top:-18px;bottom:-14px;background:#0d0d0d;transform:scaleX(0);transform-origin:left}
.tr-band::before,.tr-band::after{content:"";position:absolute;left:0;right:0;height:1px;background:#d8ff00}
.tr-band::before{top:0}.tr-band::after{bottom:0}
.tr-name{position:relative;display:inline-block;color:#ece9e1;font-family:'Space Grotesk','Helvetica Neue',Arial,sans-serif;font-weight:700;
 font-size:clamp(3rem,16vw,8.5rem);line-height:.95;letter-spacing:-.04em;white-space:nowrap;padding:0 .04em}
.tr-name i{display:inline-block;overflow:hidden;vertical-align:bottom;font-style:normal;padding-bottom:.08em;margin-bottom:-.08em}
.tr-name b{display:inline-block;font-weight:inherit;transform:translateY(110%)}
.tr-sub{position:relative;display:flex;justify-content:center;gap:14px;margin-top:10px;color:#d8ff00;opacity:0;
 font-family:ui-monospace,"SF Mono",Menlo,Consolas,monospace;font-size:.62rem;letter-spacing:.24em;text-transform:uppercase}
.tr-sub span:first-child,.tr-sub span:last-child{color:#8a8780}
.tr-label.on .tr-band{animation:trBand .32s cubic-bezier(.7,0,.2,1) .18s both}
.tr-label.on .tr-name b{animation:trRise .55s cubic-bezier(.16,1,.3,1) both;animation-delay:calc(.3s + var(--i) * 32ms)}
.tr-label.on .tr-sub{animation:trFade .3s .48s both}
.tr-label.off .tr-band{transform:scaleX(1);transform-origin:right;animation:trBandOut .38s cubic-bezier(.7,0,.2,1) .16s both}
.tr-label.off .tr-name b{transform:none;animation:trOut .32s cubic-bezier(.7,0,.84,0) both;animation-delay:calc(var(--i) * 18ms)}
.tr-label.off .tr-sub{opacity:1;animation:trFadeOut .2s both}
@keyframes trBand{to{transform:scaleX(1)}}@keyframes trBandOut{to{transform:scaleX(0)}}
@keyframes trRise{to{transform:none}}@keyframes trOut{from{transform:none}to{transform:translateY(-110%)}}
@keyframes trFade{to{opacity:1}}@keyframes trFadeOut{to{opacity:0}}`;
  document.head.appendChild(css);
  const lab = document.createElement('div'); lab.className = 'tr-label'; lab.setAttribute('aria-hidden', 'true');
  lab.innerHTML = '<div class="tr-band"></div><div class="tr-name"></div><div class="tr-sub"></div>';
  const cv = document.createElement('canvas'); cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;z-index:51;pointer-events:none;display:none';
  document.body.appendChild(cv); document.body.appendChild(lab);
  const ctx = cv.getContext('2d');

  // サイトの色：黒・濃い灰色・生成り色・黄緑
  const PAL = { bk: '#0d0d0d', d1: '#161616', d2: '#222222', d3: '#343434', sub: '#8a8780', ink: '#ece9e1', lime: '#d8ff00' };
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
  const BOXC = { d1: ['#191919', '#0c0c0c', '#2a2a2a'], d2: ['#232323', '#141414', '#353535'], ink: ['#ece9e1', '#b9b5ab', '#ffffff'], lime: ['#d8ff00', '#9fbd00', '#f0ff9a'] };

  // ---------- 1) WALL：黒いブロックが飛んできて壁になり、崩れ落ちる ----------
  function wall() {
    const cols = Math.max(4, Math.round(W / 130)), tw = W / cols, rows = Math.ceil(H / tw), th = H / rows;
    const oi = Math.random() < 0.5 ? 0 : cols - 1, oj = Math.random() < 0.5 ? 0 : rows - 1, md = Math.hypot(cols, rows), tiles = [];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const r = Math.random(), c = r < 0.07 ? 'lime' : r < 0.13 ? 'ink' : r < 0.4 ? 'd2' : 'd1';   // ほとんど黒。ときどき生成り色と黄緑
      tiles.push({ x: -W / 2 + (i + 0.5) * tw, y: H / 2 - (j + 0.5) * th, c: BOXC[c], d: (Math.hypot(i - oi, j - oj) / md) * 0.4,
        fr: (1 - j / rows) * 0.32 + Math.random() * 0.12, a: Math.random() * 2 - 1, b: Math.random() * 2 - 1 });
    }
    const box = (t, p, r) => ({ type: 'box', p, r, s: 1, bw: tw + 1, bh: th + 1, bd: Math.min(tw, th) * 0.6, c: t.c[0], side: t.c[1], top: t.c[2] });
    const draw = (list) => list.sort((a, b) => a.p[2] - b.p[2]).forEach((o) => T.box(o));
    return {
      ca: 0,
      cover(p) {
        if (p >= 0.999) fill('bk');
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
    const L = [[1, '#141414', '#050505'], [0.78, '#d8ff00', '#9fbd00'], [0.7, '#0d0d0d', '#000000'], [0.44, '#ece9e1', '#b9b5ab'], [0.36, '#0d0d0d', '#000000'], [0.12, '#d8ff00', '#9fbd00']];
    const coin = (n, z, r) => ({ type: 'coin', p: [0, 0, z], r, s: 1, w: R * L[n][0], d: R * L[n][0] * 0.1, c: L[n][1], c2: L[n][2] });
    return {
      ca: 1.2,
      cover(p, t) {
        if (p >= 0.999) fill('bk');
        L.forEach((_, n) => { const e = eX(cl((p - n * 0.07) / 0.6)); if (e > 0) T.coin(coin(n, -(1 - e) * 2600, [(1 - e) * 0.6, (1 - e) * (PI / 2 - 0.03) * (n % 2 ? 1 : -1), 0]), t); });
      },
      reveal(q, t) {
        L.forEach((_, n) => { const u = cl((q - (L.length - 1 - n) * 0.07) / 0.5); if (u < 1) T.coin(coin(n, -eIn(u) * 2200, [eIn(u) * 0.5, eIn(u) * (PI / 2) * (n % 2 ? -1 : 1), 0]), t); });
      }
    };
  }

  // ---------- 3) SIGNAL：黒と灰色と黄緑の帯が、左右から斜めに飛び込んでくる ----------
  const ROWS = [
    [[0.6, '#ece9e1'], [1.1, ['#141414', '#5a5a5a']], [0.5, 'lime'], [0.9, '#0d0d0d'], [0.4, '#8a8780'], [1.2, '#1c1c1c'], [0.3, '#ece9e1']],
    [[1.3, '#111111'], [0.4, '#ece9e1'], [0.9, ['#2a2a2a', '#0d0d0d']], [0.3, 'lime'], [1.0, '#1b1b1b']],
    [[0.8, '#262626'], [0.6, 'lime'], [1.4, ['#0d0d0d', '#3a3a3a', '#0d0d0d']], [0.5, '#ece9e1'], [0.7, '#141414']],
    [[1.6, ['#ece9e1', '#8a8780']], [0.9, '#0d0d0d'], [0.4, '#d8ff00'], [1.1, '#202020']],
    [[0.7, '#0d0d0d'], [0.5, '#343434'], [1.2, '#121212'], [0.35, 'lime'], [0.8, ['#1b1b1b', '#4a4a4a']]],
    [[1.0, '#181818'], [0.5, '#ece9e1'], [1.3, '#0d0d0d'], [0.6, '#2c2c2c']]
  ];
  function signal() {
    const n = W > H ? 7 : 9, rh = H / n, sc = Math.max(W, 520) / 6, rows = [];
    for (let k = 0; k < n; k++) rows.push({ y: H / 2 - (k + 0.5) * rh, s: k % 2 ? 1 : -1, segs: ROWS[k % 6].map(([w, c]) => [w * sc, c]), sp: (k % 2 ? 1 : -1) * sc * (0.5 + (k % 3) * 0.3), d: Math.random() * 0.18 });
    const strip = (r, x, z, a) => ({ type: 'strip', p: [x, r.y, z], r: [0, a, 0], s: 1, w: W * 1.8, h: rh + 1, segs: r.segs, sp: r.sp });
    return {
      ca: 0,
      cover(p, t) {
        if (p >= 0.999) fill('bk');
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
    const S = [['circle', '#0d0d0d', 1.06], ['sun', '#1c1c1c', 0.8], ['square', '#d8ff00', 0.47, PI / 4], ['circle', '#0d0d0d', 0.3], ['circle', '#ece9e1', 0.2, 0, '#0d0d0d'], ['spark', '#d8ff00', 0.1]];
    const holes = ['diamond', 'spark', 'tri', 'square'], hole = holes[Math.floor(Math.random() * holes.length)];
    const sh = (n, e, t, z) => ({ type: 'flat', shape: T.SHAPES[S[n][0]], p: [0, 0, 0], r: [(1 - e) * 1.1, -(1 - e) * 0.9, (S[n][3] || 0) + (1 - e) * 2.4 + t * 0.4 * (n % 2 ? 1 : -1)],
      s: z, w: Dg * S[n][2] * e, sx: 1, sy: 1, c: S[n][1], split: S[n][4], sa: t * 1.5, ga: 0 });
    return {
      ca: 1.2,
      cover(p, t) {
        if (p >= 0.999) fill('bk');
        S.forEach((_, n) => { const e = eOut(cl((p - n * 0.06) / 0.6)); if (e > 0) T.flat(sh(n, e, t, 1), t); });
      },
      reveal(q, t) {
        const e = eIn(q);
        fill('bk'); S.forEach((_, n) => { if (n) T.flat(sh(n, 1, t, 1 + e * (0.4 + n * 0.25)), t); });   // 奥へ吸い込まれるように、内側ほど大きく
        ctx.save(); ctx.globalCompositeOperation = 'destination-out';   // 図形の形に、穴をあける
        T.flat({ type: 'flat', shape: T.SHAPES[hole], p: [0, 0, 0], r: [(1 - e) * 0.7, (1 - e) * 0.5, q * 1.8], s: 1, w: Dg * 1.5 * (hole === 'spark' ? 3.6 : hole === 'tri' ? 2.1 : 1.4) * e, sx: 1, sy: 1, c: '#000', ga: 0, sa: 0 }, t);
        ctx.restore();
      }
    };
  }

  // ---------- 真ん中に出る、行き先の名前（サイトと同じ文字で） ----------
  function setLabel() {
    const id = decodeURIComponent((location.hash || '').slice(1));
    let ch = null, ids = []; try { ch = typeof characters === 'object' && characters[id]; ids = Object.keys(characters); } catch (e) {}
    const name = ch ? String(ch.name || id) : 'INDEX';
    const sub = ch ? ['FILE', `${pad(ids.indexOf(id) + 1)} / ${pad(ids.length)}`, 'OPEN'] : ['RETURN', 'TO ARCHIVE', 'INDEX'];
    lab.querySelector('.tr-name').innerHTML = [...name].map((c, i) => `<i><b style="--i:${i}">${c === ' ' ? '&nbsp;' : c.replace(/[<&>]/g, '')}</b></i>`).join('');
    lab.querySelector('.tr-sub').innerHTML = sub.map((s) => `<span>${s}</span>`).join('');
    const nm = lab.querySelector('.tr-name'); nm.style.fontSize = '';
    const w = nm.offsetWidth; if (w > W * 0.9) nm.style.fontSize = (parseFloat(getComputedStyle(nm).fontSize) * W * 0.9) / w + 'px';   // 長い名前は小さく
  }
  const labOn = () => { lab.className = 'tr-label'; void lab.offsetWidth; lab.className = 'tr-label on'; };
  const labOff = () => { lab.className = 'tr-label off'; };

  // ---------- 動かす ----------
  const FX = { wall, discs, signal, iris };
  let phase = '', t0 = 0, t1 = 0, fx = null, lastK = '', raf = 0;
  function start() {
    W = window.innerWidth; H = window.innerHeight; dpr = Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(3.5e6 / (W * H))); G.dpr = dpr;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const keys = Object.keys(FX).filter((k) => k !== lastK), k = FX[ONLY] ? ONLY : keys[Math.floor(Math.random() * keys.length)];
    lastK = k; fx = FX[k](); phase = 'cover'; t0 = performance.now(); cv.style.display = 'block';
    lab.className = 'tr-label on'; setLabel(); labOn();
    if (!raf) raf = requestAnimationFrame(loop);
  }
  function loop(now) {
    raf = 0; const t = now / 1000;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.clearRect(0, 0, W, H); G.CA = fx.ca;
    if (phase === 'cover') fx.cover(cl((now - t0) / 1000 / COVER), t);
    else if (phase === 'reveal') {
      const q = cl((now - t1) / 1000 / REVEAL); fx.reveal(q, t);
      if (q >= 1) { phase = ''; ctx.clearRect(0, 0, W, H); cv.style.display = 'none'; lab.className = 'tr-label'; return; }
    } else { cv.style.display = 'none'; lab.className = 'tr-label'; return; }
    raf = requestAnimationFrame(loop);
  }
  const toReveal = () => { phase = 'reveal'; t1 = performance.now(); labOff(); };
  new MutationObserver(() => {
    const c = curtain.className;
    if (/\bin\b/.test(c) && phase !== 'cover') start();
    else if (/\bout\b/.test(c) && phase === 'cover') toReveal();
    else if (!/\bon\b/.test(c) && phase === 'cover') toReveal();
  }).observe(curtain, { attributes: true, attributeFilter: ['class'] });
  window.OC_TRANS = { test(k, p, q) {   // （確認用）
    start(); if (FX[k]) fx = FX[k]();
    if (q == null) { phase = 'cover'; t0 = performance.now() - p * COVER * 1000; } else { phase = 'reveal'; t1 = performance.now() - q * REVEAL * 1000; labOff(); }
  } };
})();
