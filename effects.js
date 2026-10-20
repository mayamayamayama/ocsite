// effects.js — ノイズの区切り と 点の背景 を描きます

// ===== 動きのスイッチ（true：動く / false：止める） =====
const DOTS_MOVE = true;       // 点の背景を流す
const NOISE_FLICKER = false;  // ノイズをチラつかせる
const SWIRL_MOVE = true;       // 入場画面の渦を回す

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
// 3. 入場画面の背景：渦（筆のような色の筋が、渦を巻いてゆっくり回る）
// ===============================
(function () {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  // ここの数字を変えると見た目が変わります
  const SEED = 7;          // 数字を変えると、別の形の渦になる
  const STROKES = 120;     // 筋の数
  const SPEED = 0.04;      // 回る速さ（大きいほど速い）
  const BASE = '#14162a';  // 背景の色
  // 色（同じ色を2回書くと、その色が増える）
  const COLORS = ['#3ddc65', '#3ddc65', '#a9d6ea', '#a9d6ea', '#d9edf5', '#f39a4c', '#f27a8c', '#f6e24b', '#2f6fd6'];

  // 入場画面を暗くして、タイトルを白くする（effects.css が古いままでも崩れないように、ここで指定）
  hero.style.background = BASE;
  hero.style.position = 'relative';
  hero.style.overflow = 'hidden';
  const h1 = hero.querySelector('h1'), sub = hero.querySelector('.subtitle');
  [h1, sub].forEach((el) => { if (el) { el.style.position = 'relative'; el.style.zIndex = '1'; el.style.textShadow = '0 2px 18px rgba(0,0,0,.45)'; } });
  if (h1) { h1.style.color = '#ffffff'; h1.style.borderBottomColor = 'rgba(255,255,255,.5)'; }
  if (sub) sub.style.color = '#e6e6e6';

  const cv = document.createElement('canvas');
  cv.setAttribute('aria-hidden', 'true');
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none';
  hero.prepend(cv);
  const ctx = cv.getContext('2d');

  // 毎回同じ形になる乱数（SEEDが同じなら、同じ渦）
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = Math.imul(a ^ (a >>> 15), a | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  let W = 0, H = 0, cx, cy, rmax, strokes, dots, visible = true;

  function setup() {
    const rect = hero.getBoundingClientRect();
    W = rect.width; H = rect.height;
    if (!W || !H) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const pad = parseFloat(getComputedStyle(hero).paddingBottom) || 0;  // ノイズが重なる分
    cx = W / 2; cy = (H - pad) / 2;                                      // 渦の中心は、最初の画面の真ん中
    rmax = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.05;
    const k = rmax / 400, rand = rng(SEED);

    strokes = Array.from({ length: STROKES }, () => {
      const r = rmax * (0.04 + 0.96 * Math.pow(rand(), 0.85));
      const len = (60 + 200 * Math.pow(rand(), 1.5)) * k;
      return { r, a0: rand() * Math.PI * 2, da: Math.min(len / r, 2.2), w: (6 + 16 * rand()) * k,
               drift: 0.08 + 0.25 * rand(), color: COLORS[Math.floor(rand() * COLORS.length)] };
    });
    dots = Array.from({ length: 28 }, () => ({
      r: rmax * (0.1 + 0.9 * rand()), a0: rand() * Math.PI * 2, rad: (3 + 10 * rand()) * k,
      color: COLORS[Math.floor(rand() * COLORS.length)] }));
    draw(performance.now());
  }

  function draw(ms) {
    if (!W) return;
    const t = SWIRL_MOVE && !REDUCE_MOTION ? ms / 1000 : 0;
    const spin = (r) => SPEED / (0.35 + r / rmax);   // 中心に近いほど速く回る
    ctx.clearRect(0, 0, W, H);

    const N = 14;
    for (const s of strokes) {
      const rot = s.a0 + t * spin(s.r);
      ctx.fillStyle = s.color; ctx.beginPath();
      for (let pass = 0; pass < 2; pass++) {
        for (let j = 0; j <= N; j++) {
          const u = (pass ? N - j : j) / N, a = rot + u * s.da, R = s.r * (1 + s.drift * (u - 0.5));
          const tp = Math.min(Math.pow(Math.abs(Math.sin(Math.PI * u)), 0.6) * s.w / 2, R * 0.8); // 両端が細い筆の形
          const rr = R + (pass ? -tp : tp);
          ctx.lineTo(cx + rr * Math.cos(a), cy + rr * Math.sin(a));
        }
      }
      ctx.closePath(); ctx.fill();
    }
    for (const d of dots) {
      const a = d.a0 + t * spin(d.r);
      ctx.fillStyle = d.color; ctx.beginPath();
      ctx.arc(cx + d.r * Math.cos(a), cy + d.r * Math.sin(a), d.rad, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 詳細画面から戻ったときなど、大きさが変わったときだけ作り直す
  new ResizeObserver(() => {
    const r = hero.getBoundingClientRect();
    if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) setup();
  }).observe(hero);

  // 画面に見えているときだけ動かす（電池を節約）
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }).observe(hero);
  function loop(ms) { if (visible) draw(ms); requestAnimationFrame(loop); }
  setup();
  if (SWIRL_MOVE && !REDUCE_MOTION) requestAnimationFrame(loop);
})();


