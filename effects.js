// effects.js — ノイズの区切り と 点の背景 を描きます

// ===== 動きのスイッチ（true：動く / false：止める） =====
const DOTS_MOVE = true;       // 点の背景を流す
const NOISE_FLICKER = false;  // ノイズをチラつかせる

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
  const HEIGHT = 240;            // 高さ（effects.css の #noise-divider の height と同じ数字）
  const DARK = [13, 13, 13];     // 黒い粒の色（サイトの背景色 #0d0d0d）

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

