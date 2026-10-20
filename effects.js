// effects.js — ノイズの区切り と 点の背景 を描きます

// ===== 動きのスイッチ（true：動く / false：止める） =====
const DOTS_MOVE = true;       // 点の背景を流す
const NOISE_FLICKER = false;  // ノイズをチラつかせる
const SWIRL_MOVE = true;       // 入場画面の波動を動かす
const FOLLOW = true;           // マウス・指・スマホの傾きに追従する
const TILT = true;             // スマホの傾きにも追従する（FOLLOWがtrueのとき）

// 「動きを減らす」設定の人には、スイッチに関係なく止めた絵だけ出す
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ===============================
// 1. 左右に流れる点の背景
// ===============================
(function () {
  const canvas = document.getElementById('dot-bg');
  const ctx = canvas.getContext('2d');

  // ここの数字を変えると見た目が変わります
  const GAP = 44;                 // 点と点の間隔（大きいほどまばら）
  const SPEED = 10;               // 流れる速さ（大きいほど速い）
  const DOT_COLOR = '#2b2b2b';    // 小さい点の色
  const SQUARE_COLOR = '#777777'; // 目立つ四角の色

  // 各段に、目立つ四角を1〜2個ずつ（位置は最初に一度だけランダムに決める）
  const squares = Array.from({ length: 60 }, () =>
    Array.from({ length: 1 + Math.floor(Math.random() * 2) }, () => Math.random())
  );

  let w, h, dpr, rows;

  function resize() {
    dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    rows = Math.min(Math.ceil(h / GAP) + 1, squares.length);
    draw(performance.now());
  }

  // 線がにじまないよう、画面のピクセルに合わせる
  const snap = (v) => Math.round(v * dpr) / dpr;

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    const cols = Math.ceil(w / GAP) + 1;
    const cycle = cols * GAP; // 1周の長さ（画面の外で折り返すので、つなぎ目は見えない）
    const moving = DOTS_MOVE && !REDUCE_MOTION;

    for (let r = 0; r < rows; r++) {
      const dir = r % 2 === 0 ? 1 : -1;       // 偶数段は右へ、奇数段は左へ
      const move = moving ? (t / 1000) * SPEED * dir : 0;
      const offset = ((move % cycle) + cycle) % cycle;
      const y = r * GAP + GAP / 2;
      const shift = (r % 2) * (GAP / 2);      // 段ごとに半分ずらして、ジグザグに

      ctx.fillStyle = DOT_COLOR;
      for (let c = 0; c < cols; c++) {
        const x = (c * GAP + shift + offset) % cycle;
        ctx.fillRect(snap(x - 1), snap(y - 1), 2, 2);
      }

      ctx.fillStyle = SQUARE_COLOR;
      for (const f of squares[r]) {
        const x = (f * cycle + offset) % cycle;
        ctx.fillRect(snap(x - 3), snap(y - 3), 6, 6);
      }
    }
  }

  function loop(t) {
    draw(t);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  resize();
  if (DOTS_MOVE && !REDUCE_MOTION) requestAnimationFrame(loop);
})();


// ===============================
// 2. ノイズのグラデーション
//    （透明 → 黒い粒がだんだん増えて、一番下は真っ黒）
// ===============================
(function () {
  const canvas = document.getElementById('noise-divider');
  const ctx = canvas.getContext('2d');

  const GRAIN = 1;               // ざらざらの粗さ（1が一番細かい。大きいほど粗い）
  const HEIGHT = 240;            // ノイズの高さ。変えると入場画面の長さも自動で合う
  const DARK = [13, 13, 13];     // 黒い粒の色（サイトの背景色 #0d0d0d）

  // 入場画面を「画面1つ分＋ノイズの高さ」にして、ノイズの部分は最初の画面の外に置く
  // （effects.css が古いままでも崩れないように、ここでも指定しておく）
  const hero = document.querySelector('.hero');
  if (hero) {
    hero.style.boxSizing = 'border-box';
    hero.style.minHeight = (HEIGHT + 420) + 'px';
    hero.style.height = 'calc(100vh + ' + HEIGHT + 'px)';
    hero.style.height = 'calc(100svh + ' + HEIGHT + 'px)';
    hero.style.paddingBottom = HEIGHT + 'px';
  }
  canvas.style.position = 'relative';
  canvas.style.zIndex = '2';
  canvas.style.height = HEIGHT + 'px';
  canvas.style.marginTop = (-HEIGHT) + 'px';
  canvas.style.pointerEvents = 'none';

  let lastWidth = 0;
  let w, h, img;
  let visible = false;

  function build() {
    // スマホでスクロール中に画面の高さだけ変わったときは作り直さない（チラつき防止）
    if (window.innerWidth === lastWidth) return;
    lastWidth = window.innerWidth;

    const dpr = window.devicePixelRatio || 1;
    w = Math.ceil((lastWidth * dpr) / GRAIN);
    h = Math.ceil((HEIGHT * dpr) / GRAIN);
    canvas.width = w;
    canvas.height = h;
    img = ctx.createImageData(w, h);
    paint();
  }

  function paint() {
    const d = img.data;
    for (let y = 0; y < h; y++) {
      const t = y / (h - 1);          // 上が0、下が1
      const p = t * t * (3 - 2 * t);  // 上はまばら、下に向かって一気に黒へ
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        d[i] = DARK[0];
        d[i + 1] = DARK[1];
        d[i + 2] = DARK[2];
        d[i + 3] = Math.random() < p ? 255 : 0; // 黒い粒 or 透明
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  // 画面に見えているときだけチラつかせる（電池を節約）
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  }).observe(canvas);

  let last = 0;
  function loop(t) {
    if (visible && t - last > 120) {
      paint();
      last = t;
    }
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', build);
  build();
  if (NOISE_FLICKER && !REDUCE_MOTION) requestAnimationFrame(loop);
})();


// ===============================
// 3. マウス・指・スマホの傾きに追従する動き（渦とコラージュで共通で使います）
//    window.OC_POINTER.x / .y が、-1〜1 のなめらかな値になります
// ===============================
window.OC_POINTER = { x: 0, y: 0, moving: false };
(function () {
  if (!FOLLOW || REDUCE_MOTION) return;
  const P = window.OC_POINTER, target = { x: 0, y: 0 };
  let touching = false;
  const clamp = (v) => Math.max(-1, Math.min(1, v));
  const reset = () => { target.x = 0; target.y = 0; };

  window.addEventListener('pointermove', (e) => {
    touching = e.pointerType !== 'mouse';
    target.x = clamp((e.clientX / window.innerWidth - 0.5) * 2);
    target.y = clamp((e.clientY / window.innerHeight - 0.5) * 2);
  });
  ['pointerup', 'pointercancel'].forEach((ev) =>
    window.addEventListener(ev, (e) => { if (e.pointerType !== 'mouse') { touching = false; reset(); } }));
  document.documentElement.addEventListener('mouseleave', reset);

  if (TILT) window.addEventListener('deviceorientation', (e) => {
    if (touching || e.gamma == null || e.beta == null) return;
    target.x = clamp(e.gamma / 25);
    target.y = clamp((e.beta - 40) / 25);
  });

  (function tick() {
    const dx = target.x - P.x, dy = target.y - P.y;
    P.x += dx * 0.07; P.y += dy * 0.07;               // 0.07を小さくすると、ゆっくり追いかける
    P.moving = Math.abs(dx) + Math.abs(dy) > 0.002;
    requestAnimationFrame(tick);
  })();
})();


// ===============================
// 4. 入場画面の背景：中心から広がる波動（ビビットな色の波が、液体のようにうねりながら外へ広がる）
// ===============================
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const P = window.OC_POINTER;

  // ここの数字を変えると見た目が変わります
  const SEED = 7;             // 数字を変えると、別の形の波になる
  const STROKES = 110;        // 細い波の数
  const DOTS = 36;            // 小さいしずくの数
  const SPEED = 50;           // 外へ広がる速さ（大きいほど速い）
  const SPEED_RANGE = [0.6, 1.6]; // 波ごとの速さの幅（[遅い側, 速い側]）
  const BAND_SPEED = 0.55;    // 背景の色の帯が広がる速さ（上の速さに対する割合）
  const BANDS = 7;            // 背景の色の帯の数
  const TWIST = 0.05;         // ほんの少しねじれる量（0でまっすぐ広がる）
  const FOLLOW_AMOUNT = 36;   // 追従で動く量（px。大きいほど大きく動く）
  const WAVE = 1;             // 波のうねり具合（0で波なし。大きいほどぐにゃぐにゃ）
  const BASE = '#14003a';     // 一番奥の色
  // 背景の色の帯（深くて鮮やかな色）
  const BAND_COLORS = ['#14003a', '#6a11cb', '#d4147f', '#0f3bd1', '#00a3a3', '#ff5a1f', '#2a0a6e'];
  // 細い波としずくの色（蛍光色）
  const STROKE_COLORS = ['#00f5ff', '#c6ff00', '#ff2bd6', '#00ff00', '#ffffff', '#ff7a00', '#6600ff'];

  // 入場画面を暗くして、タイトルを白くする（effects.css が古いままでも崩れないように、ここで指定）
  hero.style.background = BASE;
  hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  const h1 = hero.querySelector('h1'), sub = hero.querySelector('.subtitle');
  [h1, sub].forEach((el) => { if (el) { el.style.position = 'relative'; el.style.zIndex = '1'; el.style.textShadow = '0 2px 18px rgba(0,0,0,.55)'; } });
  if (h1) { h1.style.color = '#ffffff'; h1.style.borderBottomColor = 'rgba(255,255,255,.5)'; }
  if (sub) sub.style.color = '#f0f0f0';

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none';
  hero.prepend(cv);
  const ctx = cv.getContext('2d');

  // 毎回同じ形になる乱数（SEEDが同じなら、同じ波）
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TAU = Math.PI * 2, GOLDEN = 2.39996;
  const MOVING = SWIRL_MOVE && !REDUCE_MOTION;
  const mod = (x, n) => ((x % n) + n) % n;
  const N = 26, M = 2 * (N + 1);              // 1本の波を、N個の区間のなめらかな曲線で描く
  const buf = new Float32Array(M * 2), cl = new Float32Array((N + 1) * 4);
  const MB = 48, bx = new Float32Array(MB), by = new Float32Array(MB);
  let W = 0, H = 0, cx, cy, rmax, scale, strokes, dots, visible = true;

  function setup() {
    const rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = parseFloat(getComputedStyle(hero).paddingBottom) || 0;  // ノイズが重なる分
    cx = W / 2; cy = (H - pad) / 2;                                      // 波の中心は、最初の画面の真ん中
    rmax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.05;
    scale = rmax / 400;
    const k = scale, rand = rng(SEED), pickColor = () => STROKE_COLORS[Math.floor(rand() * STROKE_COLORS.length)];

    strokes = Array.from({ length: STROKES }, () => ({
      r0: rand() * rmax, a0: rand() * TAU, da: 0.6 + 2.6 * Math.pow(rand(), 1.2),
      w: (4 + 10 * rand()) * k, drift: (rand() - 0.5) * 0.12, color: pickColor(),
      mul: SPEED_RANGE[0] + (SPEED_RANGE[1] - SPEED_RANGE[0]) * rand(), flip: rand() < 0.5,
      amp: (2 + 6 * rand()) * k,                                  // 波の高さ
      fq: 0.6 + 1.6 * rand(),                                      // 波の数
      ph: rand() * TAU,                                            // 波の位置
      wv: (1.2 + 1.6 * rand()) * (rand() < 0.5 ? -1 : 1),          // 波の進む速さ
      fj: 0.8 + 0.4 * rand(),                                      // 追従の大きさのばらつき
      tw: (rand() < 0.5 ? -1 : 1) * (0.5 + rand())                 // ねじれの向き
    }));
    dots = Array.from({ length: DOTS }, () => ({
      r0: rand() * rmax, a0: rand() * TAU, rad: (2 + 6 * rand()) * k, color: pickColor(),
      mul: SPEED_RANGE[0] + (SPEED_RANGE[1] - SPEED_RANGE[0]) * rand(), fj: 0.8 + 0.4 * rand()
    }));
    draw(performance.now());
  }

  // 背景の「色の帯」の輪郭（ゆらゆら揺れる丸）の道すじを作る
  function blob(x, y, R, A, ph, t) {
    for (let i = 0; i < MB; i++) {
      const th = (i / MB) * TAU;
      const rad = Math.max(R + A * (Math.sin(3 * th + ph + t * 1.1) + 0.6 * Math.sin(5 * th - ph * 1.3 - t * 1.7)), 0);
      bx[i] = x + rad * Math.cos(th); by[i] = y + rad * Math.sin(th);
    }
    ctx.beginPath();
    ctx.moveTo((bx[0] + bx[MB - 1]) / 2, (by[0] + by[MB - 1]) / 2);
    for (let i = 0; i < MB; i++) {
      const j = (i + 1) % MB;
      ctx.quadraticCurveTo(bx[i], by[i], (bx[i] + bx[j]) / 2, (by[i] + by[j]) / 2);
    }
    ctx.closePath();
  }

  // 1本の細い波（点の並び）を、なめらかな曲線でぬりつぶす
  function fillRibbon(ox, oy, color) {
    let n = 0;
    for (let j = 0; j <= N; j++) {
      const o = j * 4, rr = Math.max(cl[o + 2] + cl[o + 3] * 0.5, 0.5);
      buf[n++] = ox + rr * cl[o]; buf[n++] = oy + rr * cl[o + 1];
    }
    for (let j = N; j >= 0; j--) {
      const o = j * 4, rr = Math.max(cl[o + 2] - cl[o + 3] * 0.5, 0.5);
      buf[n++] = ox + rr * cl[o]; buf[n++] = oy + rr * cl[o + 1];
    }
    ctx.fillStyle = color; ctx.beginPath();
    ctx.moveTo((buf[0] + buf[(M - 1) * 2]) / 2, (buf[1] + buf[(M - 1) * 2 + 1]) / 2);
    for (let i = 0; i < M; i++) {
      const a = i * 2, b = ((i + 1) % M) * 2;
      ctx.quadraticCurveTo(buf[a], buf[a + 1], (buf[a] + buf[b]) / 2, (buf[a + 1] + buf[b + 1]) / 2);
    }
    ctx.closePath(); ctx.fill();
  }

  function draw(ms) {
    if (!W) return;
    const t = MOVING ? ms / 1000 : 0;
    const boost = Math.hypot(P.x, P.y);                     // 追従して動いているほど、波が大きくなる
    const v = SPEED * scale;

    // --- 背景：色の帯が、中心から外へ広がる（中心に近い帯ほど、大きく追従して擬似3Dに） ---
    ctx.globalAlpha = 1;
    ctx.fillStyle = BASE; ctx.fillRect(0, 0, W, H);
    const bw = rmax / BANDS, run = (t * v * BAND_SPEED) / bw, n = Math.floor(run), phase = run - n;
    for (let kk = BANDS + 1; kk >= 0; kk--) {
      const R = (kk + phase) * bw, id = kk - n, f = 0.3 + 1.0 * (1 - Math.min(R / rmax, 1));
      blob(cx + P.x * FOLLOW_AMOUNT * 1.2 * f, cy + P.y * FOLLOW_AMOUNT * 1.2 * f,
           R, bw * 0.12 * WAVE * (1 + 0.8 * boost), id * 1.7, t);
      ctx.fillStyle = BAND_COLORS[mod(id, BAND_COLORS.length)]; ctx.fill();
    }

    // --- 細い波：中心で生まれて、外へ広がりながら太くなり、端で消える ---
    for (const s of strokes) {
      const x = s.r0 + v * s.mul * t, c = Math.floor(x / rmax), rt = x - c * rmax;
      const fade = Math.min(1, rt / (0.1 * rmax)) * Math.min(1, (rmax - rt) / (0.25 * rmax));
      if (fade < 0.02) continue;
      const ang = s.a0 + c * GOLDEN + t * TWIST * s.tw;
      const amp = s.amp * WAVE * (1 + 0.8 * boost) * (0.4 + 0.6 * rt / rmax);
      const ph = s.ph + t * s.wv + P.x * 2.2 + P.y * 1.6;   // マウスを動かすと、波が流れる
      const wk = 0.45 + 0.9 * (rt / rmax);                  // 外へ行くほど太く
      for (let j = 0; j <= N; j++) {
        const u = j / N, a = ang + u * s.da, o = j * 4;
        const R = rt * (1 + s.drift * (u - 0.5)) + amp * Math.sin(u * s.fq * TAU + ph);
        const uu = s.flip ? 1 - u : u;                      // しずくの形：片側がふくらんで、反対へ細くなる
        const wd = s.w * wk * Math.pow(Math.abs(Math.sin(Math.PI * Math.pow(uu, 0.55))), 0.8) * (1 + 0.25 * Math.sin(u * 7 + ph * 1.3));
        cl[o] = Math.cos(a); cl[o + 1] = Math.sin(a); cl[o + 2] = R; cl[o + 3] = wd;
      }
      const f = (0.3 + 1.0 * (1 - rt / rmax)) * s.fj;
      ctx.globalAlpha = fade;
      fillRibbon(cx + P.x * FOLLOW_AMOUNT * f, cy + P.y * FOLLOW_AMOUNT * f, s.color);
    }

    // --- 小さなしずく ---
    for (const d of dots) {
      const x = d.r0 + v * d.mul * t, c = Math.floor(x / rmax), rt = x - c * rmax;
      const fade = Math.min(1, rt / (0.1 * rmax)) * Math.min(1, (rmax - rt) / (0.25 * rmax));
      if (fade < 0.02) continue;
      const a = d.a0 + c * GOLDEN, f = (0.3 + 1.0 * (1 - rt / rmax)) * d.fj;
      ctx.globalAlpha = fade; ctx.fillStyle = d.color; ctx.beginPath();
      ctx.arc(cx + P.x * FOLLOW_AMOUNT * f + rt * Math.cos(a), cy + P.y * FOLLOW_AMOUNT * f + rt * Math.sin(a), d.rad * (0.5 + rt / rmax), 0, TAU);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 詳細画面から戻ったときなど、大きさが変わったときだけ作り直す
  new ResizeObserver(() => {
    const r = hero.getBoundingClientRect();
    if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) setup();
  }).observe(hero);

  // 画面に見えているときだけ描く（電池を節約）。動くものがなければ、描き直さない
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
  function loop(ms) { if (visible && (MOVING || P.moving)) draw(ms); requestAnimationFrame(loop); }
  setup();
  if (!REDUCE_MOTION) requestAnimationFrame(loop);
})();
