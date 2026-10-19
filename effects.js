// effects.js — ノイズの区切り と 点の背景 を描きます

// 「動きを減らす」設定の人には、動かさずに止めた絵だけ出す
const REDUCE_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// ===============================
// 1. 左右に流れる点の背景
// ===============================
(function () {
  const canvas = document.getElementById('dot-bg');
  const ctx = canvas.getContext('2d');

  // ここの数字を変えると見た目が変わります
  const GAP = 44;             // 点と点の間隔（大きいほどまばら）
  const SPEED = 14;           // 流れる速さ（大きいほど速い）
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

    for (let r = 0; r < rows; r++) {
      const dir = r % 2 === 0 ? 1 : -1;       // 偶数段は右へ、奇数段は左へ
      const move = REDUCE_MOTION ? 0 : (t / 1000) * SPEED * dir;
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
  if (!REDUCE_MOTION) requestAnimationFrame(loop);
})();


// ===============================
// 2. ノイズのグラデーション（上：入場画面の色 → 下：サイトの背景色）
// ===============================
(function () {
  const canvas = document.getElementById('noise-divider');
  const ctx = canvas.getContext('2d');

  const PIXEL = 3;                // ざらざらの粗さ（大きいほど粗い）
  const HEIGHT = 180;             // 高さ（effects.css の #noise-divider と同じ数字）
  const TOP = [232, 232, 232];    // 上の色（effects.css の .hero の背景色と同じにする）
  const BOTTOM = [13, 13, 13];    // 下の色（サイトの背景色 #0d0d0d）
  const FLICKER = true;           // true：ざらざらがゆっくりチラつく / false：止める

  let w, h, img;
  let visible = false;

  function build() {
    w = Math.ceil(window.innerWidth / PIXEL);
    h = Math.ceil(HEIGHT / PIXEL);
    canvas.width = w;
    canvas.height = h;
    img = ctx.createImageData(w, h);
    paint();
  }

  function paint() {
    const d = img.data;
    for (let y = 0; y < h; y++) {
      const p = y / (h - 1); // 上が0、下が1。下に行くほど「暗い点」が増える
      for (let x = 0; x < w; x++) {
        const c = Math.random() < p ? BOTTOM : TOP;
        const i = (y * w + x) * 4;
        d[i] = c[0];
        d[i + 1] = c[1];
        d[i + 2] = c[2];
        d[i + 3] = 255;
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
  if (FLICKER && !REDUCE_MOTION) requestAnimationFrame(loop);
})();
