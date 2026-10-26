// hero.js — 入場画面のメインビジュアル（動かす本体）
// 24体の図形（そのうち4体は、画面からはみ出す巨大な図形）が、1本の長いループの中で、移動・変形・消失・発生をくり返します。
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
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#ecece6';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const BEAT = 1.9;           // 1つの隊形の長さ（秒）。小さくすると、せわしなくなる
  const MOVE_SEC = 1.05;      // 次の隊形へ動くのにかける時間（秒）
  const TILT = 1;             // マウスや傾きに合わせて傾く強さ（0で傾かない、2で2倍）
  const PARALLAX = 22;        // 奥のものと手前のもののずれ（px）
  const ECHO = true;          // 速く動く図形に、残像をつける
  const BIG_NUMBER = true;    // 背景に、隊形の番号を大きな縁取り文字で出す
  const DOT_FIELD = true;     // 背景いっぱいの、波打つドットの網目
  const TICKERS = true;       // 画面を斜めに横切る、流れる文字の帯
  const AE_UI = true;         // 選択枠や動きの軌跡など、映像編集ソフトの画面のような飾り
  const CAMERA = true;        // 画面全体が、カメラのようにゆっくりズーム・回転し続ける
  const GRAIN = 0.09;         // フィルムのようなざらざらの強さ（0で無し）
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  // 色（paper：紙のようなグレー / ink：黒 / lime：ライム / red：赤 / blue：青 / cyan：水色 / lilac：薄むらさき / grey：グレー）
  const PAL = { paper: '#ecece6', ink: '#0e0e10', lime: '#d8ff00', red: '#ff3d55', blue: '#2b3dff', cyan: '#18d8ff', lilac: '#b9b3ff', grey: '#8e9299', white: '#ffffff', pink: '#ff4fa3' };
  const INK = { paper: PAL.ink, ink: PAL.paper, blue: PAL.paper, lime: PAL.ink };   // 背景の色ごとの、文字の色
  const NA = 24;              // 図形の数（隊形のファイルも、この数に合わせて書いてあります）

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
  const rgbOf = (c) => RGB[c] || RGB.ink;

  let W = 0, H = 0, FH = 0, M = 1, dpr = 1, visible = true, grainPat = null;
  const K = { W: 1, FH: 1, M: 1 };
  const rbuf = Array.from({ length: NA }, () => new Float32Array(T.N));
  const prevR = new Float32Array(NA), prevX = new Float32Array(NA), prevY = new Float32Array(NA);

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
    return Object.assign({ x: 0.5, y: 0.5, s: 0.1, sx: 1, sy: 1, rot: 0, shape: 'circle', fill: 'solid', c: 'ink', c2: 'paper', wob: 0, ext: 0, flip: 0, z: 0.3 + (i % 5) * 0.12 }, o);
  }

  // ---------- 背景の模様 ----------
  function ticker(y, ang, speed, solid, text, ink, bgc, T0) {   // 斜めに横切る、流れる文字の帯
    const h = Math.max(20, M * 0.055), L = Math.hypot(W, FH);
    ctx.save(); ctx.translate(W / 2 - G.tx * 8, y - G.ty * 8); ctx.rotate(ang);
    ctx.fillStyle = ink;
    if (solid) ctx.fillRect(-L, -h / 2, L * 2, h);
    else { ctx.globalAlpha = 0.55; ctx.fillRect(-L, -h / 2, L * 2, 1); ctx.fillRect(-L, h / 2, L * 2, 1); ctx.globalAlpha = 1; }
    ctx.font = `600 ${h * 0.42}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`; ctx.textBaseline = 'middle'; ctx.textAlign = 'left';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    const w = ctx.measureText(text).width || 100; ctx.fillStyle = solid ? bgc : ink;
    for (let x = -L - ((((T0 * speed) % w) + w) % w); x < L; x += w) ctx.fillText(text, x, 0);
    ctx.restore();
  }
  function backdrop(bg, ink, T0, k, tb, f) {
    ctx.fillStyle = PAL[bg]; ctx.fillRect(0, 0, W, H);
    const gap = Math.max(16, M * 0.045);
    if (DOT_FIELD) {   // 波打つドットの網目（波の中心が、ゆっくり画面を動き回る）
      const fx = W * (0.5 + 0.38 * Math.sin(T0 * 0.41)), fy = FH * (0.42 + 0.3 * Math.cos(T0 * 0.33)), kk = TAU / (gap * 7), ph = T0 * 4;
      const ox = ((T0 * 6 - G.tx * 6) % gap + gap) % gap, oy = ((-G.ty * 6) % gap + gap) % gap;
      ctx.fillStyle = ink; ctx.globalAlpha = 0.16;
      for (let x = ox - gap; x < W + gap; x += gap) for (let y = oy - gap; y < H; y += gap) {
        const v = 0.5 + 0.5 * Math.sin(Math.hypot(x - fx, y - fy) * kk - ph), r = gap * 0.22 * v * v + 0.6;
        ctx.fillRect(x - r, y - r, r * 2, r * 2);
      }
    }
    ctx.globalAlpha = 0.1; ctx.fillStyle = ink; ctx.fillRect(0, FH * 0.42, W, 1); ctx.fillRect(W / 2, 0, 1, FH);
    ctx.globalAlpha = 1;
    if (BIG_NUMBER) {   // 背景の、巨大な縁取りの番号（隊形が変わるたびに、下からせり上がる）
      const size = Math.min(W * 0.62, FH * 0.5), p = eBack(clamp01(tb / 0.7));
      ctx.save(); ctx.beginPath(); ctx.rect(0, 70, W, size * 1.02); ctx.clip();
      ctx.font = `700 ${size}px "Space Grotesk", Arial, sans-serif`; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${-size * 0.04}px`;
      ctx.globalAlpha = 0.25; ctx.strokeStyle = ink; ctx.lineWidth = 1.2;
      ctx.strokeText(pad(k + 1), W - 26 - G.tx * 10, 70 + size * 0.06 + (1 - p) * size - G.ty * 10);
      ctx.restore();
    }
    if (TICKERS) {
      ticker(FH * 0.24, -0.14, 70, true, ' OC ARCHIVE ◆ CHARACTER INDEX ◆ VOL.01 ◆ MOTION STUDY ◆ 2026 ◆', ink, PAL[bg], T0);
      ticker(FH * 0.6, 0.09, -50, false, ` FORM ${pad(k + 1)} / ${f.name} ◆ LOOP ${LOOP.toFixed(1)}s ◆ 24FPS ◆ ${PAL[bg].toUpperCase()} ◆`, ink, PAL[bg], T0);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 映像編集ソフトのような飾り（選択枠・動きの軌跡） ----------
  function selBox(o, name, ink, bgc) {
    const hw = o.R * Math.max(0.35, o.sx) * 1.1, hh = o.R * Math.max(0.35, o.sy) * 1.1;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot);
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(-hw, -hh, hw * 2, hh * 2);
    for (const [hx, hy] of [[-hw, -hh], [0, -hh], [hw, -hh], [hw, 0], [hw, hh], [0, hh], [-hw, hh], [-hw, 0]]) { ctx.fillStyle = bgc; ctx.fillRect(hx - 3, hy - 3, 6, 6); ctx.strokeRect(hx - 3, hy - 3, 6, 6); }
    ctx.beginPath(); ctx.arc(0, 0, 4, 0, TAU); ctx.moveTo(-8, 0); ctx.lineTo(8, 0); ctx.moveTo(0, -8); ctx.lineTo(0, 8); ctx.stroke();
    ctx.restore();
    T.label(name, o.x - o.R * 0.9, o.y - o.R * 1.25 - 6, ink, 8);
  }
  function motionPath(f, i, T0, ink) {
    if (!f.act(i, T0, K)) return;
    ctx.strokeStyle = ink; ctx.fillStyle = ink; ctx.globalAlpha = 0.6; ctx.lineWidth = 1; ctx.setLineDash([2, 3]); ctx.beginPath();
    const pts = [];
    for (let n = 0; n <= 14; n++) { const q = target(f, i, T0 + n * 0.07); pts.push([q.x * W, q.y * FH]); n ? ctx.lineTo(q.x * W, q.y * FH) : ctx.moveTo(q.x * W, q.y * FH); }
    ctx.stroke(); ctx.setLineDash([]);
    pts.forEach(([x, y], n) => { if (n % 4 === 0) { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-3, -3, 6, 6); ctx.restore(); } });
    ctx.globalAlpha = 1;
  }

  // ---------- 情報の文字・ものさし ----------
  function hud(f, k, tb, loopT, ink, T0) {
    const m = 20, y1 = 58, beat = (f.beats || 1) * BEAT;
    const fr = Math.floor(T0 * 24), tc = `${pad(T0 / 3600)}:${pad((T0 / 60) % 60)}:${pad(T0 % 60)}:${pad(fr % 24)}`;
    T.label(`COMP 01 — ${f.name}`, m, y1, ink, 9);
    T.label('24 FPS', W - m - 44, y1, ink, 9, 'right');
    if (Math.floor(T0 * 1.6) % 2 === 0) { ctx.fillStyle = PAL.red; ctx.beginPath(); ctx.arc(W - m - 34, y1, 3.5, 0, TAU); ctx.fill(); }
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
  window.OC_HERO = { seek(sec) { start = performance.now() - sec * 1000; }, starts, F, BEAT };   // （確認用）
  function frame(now) {
    if (!W) return;
    const dt = Math.min(0.05, Math.max(0.001, (now - last) / 1000)); last = now;
    const T0 = REDUCE ? starts[1] + 1.8 : (now - start) / 1000;
    updateTilt(now, T0);
    const loopT = ((T0 % LOOP) + LOOP) % LOOP;
    let k = NF - 1; for (let n = 0; n < NF; n++) if (loopT < starts[n] + (F[n].beats || 1) * BEAT) { k = n; break; }
    const tb = loopT - starts[k], cur = F[k], prv = F[(k - 1 + NF) % NF], bg = cur.bg;
    const look = cur.to && tb > 1.1 ? cur.to : bg, ink = INK[look] || PAL.ink;   // 画面が新しい色で覆われたら、文字の色も先に切り替える

    backdrop(bg, INK[bg] || PAL.ink, T0, k, tb, cur);
    ctx.save();   // 舞台全体を、傾きに合わせて少し傾ける（カメラのように、ゆっくりズーム・回転もする）
    const cz = CAMERA && !REDUCE ? 1.04 + 0.035 * Math.sin(T0 * 0.27) : 1, cr = CAMERA && !REDUCE ? 0.03 * Math.sin(T0 * 0.31) : 0;
    ctx.translate(W / 2, FH * 0.45); ctx.rotate(G.tx * 0.025 + cr); ctx.transform(1, G.ty * 0.035, -G.tx * 0.035, 1, 0, 0); ctx.scale(cz, cz); ctx.translate(-W / 2, -FH * 0.45);

    const list = [];
    for (let i = 0; i < NA; i++) {
      let A = target(prv, i, T0), B = target(cur, i, T0);
      if (!A && !B) { prevR[i] = 0; continue; }
      const appear = !A, vanish = !B;
      if (appear) A = Object.assign({}, B, { sy: 0, sx: B.sx * 1.5, s: B.s * 0.85 });                                 // 出てくるとき：横一本の線から、広がる
      if (vanish) B = Object.assign({}, A, { sy: 0, sx: A.sx * 1.5, s: A.s * 0.85, dur: 0.5, ease: 'io', delay: undefined });   // 消えるとき：横一本の線に、潰れて消える
      const delay = B.delay !== undefined ? B.delay : i * 0.035, dur = B.dur || MOVE_SEC, q = clamp01((tb - delay) / dur);
      const p = B.ease === 'in' ? eIn(q) : B.ease === 'io' ? eIO(q) : eBack(q), pc = eIO(q);
      const z = lerp(A.z, B.z, pc), rA = T.SHAPES[A.shape] || T.SHAPES.circle, rB = T.SHAPES[B.shape] || T.SHAPES.circle, r = rbuf[i];
      for (let n = 0; n < T.N; n++) r[n] = rA[n] + (rB[n] - rA[n]) * pc;
      let c = rgbOf(pc < 0.5 ? A.c : B.c), c2 = rgbOf(pc < 0.5 ? A.c2 : B.c2), sx = lerp(A.sx, B.sx, pc);   // 色は混ぜずに、パッと切り替える（混ぜると、くすんだ色になるため）
      const fl = lerp(A.flip, B.flip, pc);
      if (fl > 0.01) { const cv0 = Math.cos(T0 * 2.4 + i * 0.9); sx *= 1 - fl * (1 - Math.max(0.05, Math.abs(cv0))); if (cv0 < 0 && fl > 0.5) { const tmp = c; c = c2; c2 = tmp; } }
      const o = {
        i, x: lerp(A.x, B.x, p) * W + G.tx * z * PARALLAX, y: lerp(A.y, B.y, p) * FH + G.ty * z * PARALLAX,
        R: Math.max(0, lerp(A.s, B.s, p)) * M * 0.5, sx, sy: Math.max(0, lerp(A.sy, B.sy, appear ? eBack(q) : vanish ? eIO(q) : pc)), rot: lerp(A.rot, B.rot, p),
        r, wob: lerp(A.wob, B.wob, pc), ph: i * 1.7, c, c2, fill: pc < 0.5 ? A.fill : B.fill, ext: lerp(A.ext, B.ext, pc), z, shape: (pc < 0.5 ? A : B).shape
      };
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
      if (ECHO && !REDUCE && o.R > 2 && o.R < M) {   // 速く動いている図形の、うしろの残像
        const sp = Math.hypot(o.vx, o.vy);
        if (sp > 350) {
          const x0 = o.x, y0 = o.y, a0 = Math.min(1, (sp - 350) / 500);
          for (let n = 3; n >= 1; n--) { o.x = x0 - o.vx * 0.028 * n; o.y = y0 - o.vy * 0.028 * n; T.path(o, T0); ctx.globalAlpha = a0 * (0.32 - n * 0.08); ctx.fillStyle = T.css(o.c); ctx.fill(); }
          o.x = x0; o.y = y0; ctx.globalAlpha = 1;
        }
      }
      T.actor(o, T0);
    });
    if (AE_UI && !(cur.to && tb > 0.9)) {
      motionPath(cur, 14, T0, ink);
      [9, 19].forEach((i, n) => { const o = list.find((q) => q.i === i); if (o && o.R > 8 && o.R < M * 0.35 && o.sy > 0.35 && o.sx > 0.35 && o.x > 0 && o.x < W && o.y > 80 && o.y < FH - 60) selBox(o, `Shape Layer ${pad(i)}`, ink, PAL[look]); });
    }
    [6, 11, 17].forEach((i) => {   // いくつかの図形に、名前と位置のラベル
      const o = list.find((q) => q.i === i);
      if (!o || o.R < 5 || o.R > M * 0.4 || o.sy < 0.35 || o.sx < 0.35 || o.x < 0 || o.x > W || o.y < 70 || o.y > FH - 60) return;
      const dx = o.x > W * 0.6 ? -14 : 14;
      T.tag(o.x + (dx < 0 ? -o.R * 0.7 : o.R * 0.7), o.y - o.R * 0.7, dx, -12, `OBJ_${pad(i)} ${o.shape.toUpperCase()}  ${(o.x / W).toFixed(2)}/${(o.y / FH).toFixed(2)}`, ink);
    });
    ctx.restore();

    hud(cur, k, tb, loopT, ink, T0);
    if (ink !== inkNow) {   // 文字の色。大きな図形と重なっても読めるよう、背景の色でふちを取る
      inkNow = ink; titleEls.forEach((el) => { el.style.color = ink; });
      if (titleEls[0]) { titleEls[0].style.webkitTextStroke = `2px ${PAL[look]}`; titleEls[0].style.paintOrder = 'stroke fill'; }
    }
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
