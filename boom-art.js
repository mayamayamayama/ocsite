// boom-art.js — サウンドトラックの 3D に貼る「絵」（ラジカセの前・上・横の面、スピーカー、ボタン、ふた、カセットのラベル）
// 白黒のインクで描いて、オレンジを少しだけ。boom3d.js がこの絵を使って、立体にします
(window.OC_LOADED = window.OC_LOADED || []).push('boom-art');

window.OC_BOOM_ART = (function () {
  // ===== 変えてもいいところ =====
  const INK = '#111111', PAPER = '#f7f4ec', ACCENT = '#ff8a00', SHADOW = '#d86a00';   // 線・紙・アクセント（オレンジ）・床の影（背景より少し濃いオレンジ）
  const LOGO = 'MAYAMA', BRAND = 'MAYAMA TAPES';   // ラジカセのロゴ・カセットのラベルの上の文字
  // ============================
  const BIG = 'Anton, Impact, "Noto Sans JP", sans-serif', MONO = '"Space Mono", ui-monospace, "Noto Sans JP", monospace';
  const cnv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
  const rr = (x, a, b, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(a, b, w, h, r) : x.rect(a, b, w, h); };
  const W = 6.4, H = 3.0, DP = 1.5, S = 320, X = (x) => (x + W / 2) * S, Y = (y) => (H - y) * S;   // ラジカセの大きさ（1 = 320px で描く）
  const CW = 640, CH = 412;   // カセットのラベルの大きさ

  function front(x) {   // 前の面：ラジオの目盛り・スピーカーのまわり・カセットの入るところ
    x.fillStyle = PAPER; x.fillRect(0, 0, W * S, H * S); x.strokeStyle = INK; x.lineJoin = 'round';
    x.lineWidth = 12; x.strokeRect(22, 22, W * S - 44, H * S - 44); x.lineWidth = 8; x.beginPath(); x.moveTo(22, Y(2.3)); x.lineTo(W * S - 22, Y(2.3)); x.stroke();
    [[-3.0, -0.95, ['88', '92', '96', '100', '104', '108'], 'FM'], [0.95, 3.0, ['53', '60', '70', '90', '120', '160'], 'AM']].forEach(([a, b, nums, band], k) => {
      rr(x, X(a), Y(2.9), X(b) - X(a), Y(2.42) - Y(2.9), 14); x.fillStyle = INK; x.fill();
      x.strokeStyle = PAPER; x.lineWidth = 3; for (let q = 0; q <= 40; q++) { const px = X(a) + 26 + (q / 40) * (X(b) - X(a) - 52); x.beginPath(); x.moveTo(px, Y(2.86)); x.lineTo(px, Y(q % 8 ? 2.79 : 2.72)); x.stroke(); }
      x.fillStyle = PAPER; x.font = '700 22px ' + MONO; x.textAlign = 'center'; nums.forEach((n, q) => x.fillText(n, X(a) + 26 + (q / 5) * (X(b) - X(a) - 52), Y(2.52)));
      x.textAlign = k ? 'right' : 'left'; x.font = '700 20px ' + MONO; x.fillText(band, k ? X(b) - 16 : X(a) + 16, Y(2.62) - 2);
      x.strokeStyle = ACCENT; x.lineWidth = 6; const nx = X(a) + (k ? 0.62 : 0.35) * (X(b) - X(a)); x.beginPath(); x.moveTo(nx, Y(2.88)); x.lineTo(nx, Y(2.47)); x.stroke();
    });
    rr(x, X(-0.82), Y(2.9), X(0.82) - X(-0.82), Y(2.42) - Y(2.9), 10); x.fillStyle = INK; x.fill();   // まん中の小さな画面（光る棒は 3D）
    [-2.05, 2.05].forEach((cx) => {
      rr(x, X(cx - 1.02), Y(2.22), 2.04 * S, 2.04 * S, 40); x.fillStyle = INK; x.fill();
      x.fillStyle = PAPER; x.beginPath(); x.arc(X(cx), Y(1.2), 0.99 * S, 0, 7); x.fill(); x.fillStyle = INK; x.beginPath(); x.arc(X(cx), Y(1.2), 0.93 * S, 0, 7); x.fill();
      [[-0.86, -0.86], [0.86, -0.86], [-0.86, 0.86], [0.86, 0.86]].forEach(([a, b]) => { x.fillStyle = PAPER; x.beginPath(); x.arc(X(cx + a), Y(1.2 + b), 16, 0, 7); x.fill(); x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(X(cx + a) - 8, Y(1.2 + b)); x.lineTo(X(cx + a) + 8, Y(1.2 + b)); x.stroke(); });
    });
    rr(x, X(-0.86), Y(1.8), 1.72 * S, 1.24 * S, 18); x.fillStyle = INK; x.fill();
    x.strokeStyle = 'rgba(247,244,236,.35)'; x.lineWidth = 3; x.beginPath(); x.moveTo(X(-0.6), Y(0.75)); x.lineTo(X(0.6), Y(0.75)); x.stroke();
    rr(x, X(-0.86), Y(0.5), 1.72 * S, 0.34 * S, 12); x.fillStyle = INK; x.fill();
    x.textAlign = 'center'; x.font = '400 70px ' + BIG; x.fillText(LOGO, X(0), Y(1.9)); x.font = '700 20px ' + MONO; x.fillText('STEREO · AUTO STOP', X(0), Y(2.21) + 4);
    [-0.68, 0.68].forEach((a) => { x.beginPath(); x.arc(X(a), Y(2.0), 13, 0, 7); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); });
  }
  function top(x) {   // 上の面：音量と音色のつまみ・持ち手の根もと
    const w = W * S, h = DP * S; x.fillStyle = '#fbf9f3'; x.fillRect(0, 0, w, h); x.strokeStyle = INK; x.lineWidth = 12; x.strokeRect(14, 14, w - 28, h - 28);
    [[-2.9, -1.0, 'VOLUME', 0.62], [1.0, 2.9, 'TONE', 0.4]].forEach(([a, b, t, p]) => {
      rr(x, X(a), h * 0.62, X(b) - X(a), 22, 11); x.fillStyle = INK; x.fill(); rr(x, X(a) + p * (X(b) - X(a)) - 22, h * 0.62 - 20, 44, 62, 8); x.fillStyle = PAPER; x.fill(); x.lineWidth = 6; x.stroke();
      x.fillStyle = INK; x.font = '700 26px ' + MONO; x.textAlign = 'left'; x.fillText(t, X(a), h * 0.45);
    });
    [-2.35, 2.35].forEach((a) => { rr(x, X(a) - 56, h * 0.28, 112, h * 0.44, 12); x.fillStyle = INK; x.fill(); });
  }
  function side(x) {   // 横の面：すこし影の色・空気の穴
    const w = DP * S, h = H * S; x.fillStyle = '#e9e5db'; x.fillRect(0, 0, w, h); x.strokeStyle = INK; x.lineWidth = 12; x.strokeRect(14, 14, w - 28, h - 28);
    x.lineWidth = 7; for (let q = 0; q < 7; q++) { const y = h * 0.42 + q * 34; x.beginPath(); x.moveTo(w * 0.25, y); x.lineTo(w * 0.75, y); x.stroke(); }
    x.beginPath(); x.arc(w / 2, h * 0.2, 26, 0, 7); x.stroke();
  }
  function cone(x) {   // スピーカー：白と黒の輪
    [[256, INK], [238, PAPER], [214, INK], [200, PAPER], [168, INK], [154, PAPER], [124, INK], [110, PAPER], [84, INK], [64, PAPER]].forEach(([r, c]) => { x.fillStyle = c; x.beginPath(); x.arc(256, 256, r, 0, 7); x.fill(); });
    x.strokeStyle = INK; x.lineWidth = 10; x.beginPath(); x.arc(256, 256, 60, 0, 7); x.stroke(); x.strokeStyle = PAPER; x.lineWidth = 9; x.beginPath(); x.arc(256, 256, 186, 3.6, 4.4); x.stroke();
  }
  function key(x, k) {   // ボタンの記号（巻きもどし・再生・停止・早送り・取り出し）
    x.fillStyle = '#ffffff'; x.fillRect(0, 0, 96, 80); x.fillStyle = k === 1 ? ACCENT : INK; x.strokeStyle = INK; x.lineWidth = 3;
    const tri = (a, d) => { x.beginPath(); x.moveTo(a, 40); x.lineTo(a + d, 26); x.lineTo(a + d, 54); x.closePath(); x.fill(); x.stroke(); };
    if (k === 0) { tri(22, 24); tri(46, 24); } if (k === 1) { x.beginPath(); x.moveTo(36, 24); x.lineTo(62, 40); x.lineTo(36, 56); x.closePath(); x.fill(); x.stroke(); }
    if (k === 2) x.fillRect(34, 26, 28, 28); if (k === 3) { tri(50, -24); tri(74, -24); } if (k === 4) { x.beginPath(); x.moveTo(48, 22); x.lineTo(66, 44); x.lineTo(30, 44); x.closePath(); x.fill(); x.fillRect(30, 50, 36, 7); }
  }
  function door(x) {   // カセットのふた（窓はすきとおる）
    rr(x, 4, 4, 336, 232, 16); x.fillStyle = PAPER; x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
    x.globalCompositeOperation = 'destination-out'; rr(x, 30, 30, 284, 150, 10); x.fill(); x.globalCompositeOperation = 'source-over';
    rr(x, 30, 30, 284, 150, 10); x.fillStyle = 'rgba(17,17,17,.14)'; x.fill(); x.lineWidth = 6; x.stroke();
    x.fillStyle = 'rgba(255,255,255,.28)'; x.beginPath(); x.moveTo(70, 30); x.lineTo(120, 30); x.lineTo(70, 180); x.lineTo(30, 180); x.lineTo(30, 150); x.closePath(); x.fill();
    x.fillStyle = INK; x.font = '700 17px ' + MONO; x.textAlign = 'center'; x.fillText('PUSH EJECT ▲', 172, 214);
  }
  function grip(x) { x.fillStyle = PAPER; x.fillRect(0, 0, 1024, 48); x.fillStyle = INK; for (let q = 0; q < 22; q++) x.fillRect(330 + q * 16, 8, 7, 32); }   // 持ち手のすべり止め
  function reel(x) {   // カセットの中で回る車
    x.fillStyle = PAPER; x.beginPath(); x.arc(64, 64, 60, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
    x.fillStyle = INK; x.beginPath(); x.arc(64, 64, 30, 0, 7); x.fill(); x.fillStyle = PAPER; for (let q = 0; q < 6; q++) { x.save(); x.translate(64, 64); x.rotate((q * Math.PI) / 3); x.fillRect(-5, -30, 10, 13); x.restore(); }
  }

  // カセットのラベルの丸：キャラの絵を、オレンジの上に黒い点々で（新聞の写真みたいに）
  function halftone(x, img, cx, cy, rad) {
    x.save(); x.beginPath(); x.arc(cx, cy, rad, 0, 7); x.fillStyle = ACCENT; x.fill(); x.clip(); x.fillStyle = INK;
    let ok = false;
    if (img) try {
      const N = 24, [, q] = cnv(N, N), iw = img.naturalWidth, ih = img.naturalHeight, s = Math.min(iw, ih) * 0.62; q.drawImage(img, (iw - s) / 2, ih * 0.05, s, s, 0, 0, N, N);
      const d = q.getImageData(0, 0, N, N).data, st = (rad * 2) / N;
      for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) { const p = (j * N + k) * 4, v = (1 - (0.3 * d[p] + 0.59 * d[p + 1] + 0.11 * d[p + 2]) / 255) * (d[p + 3] / 255), r = Math.sqrt(v) * 0.72 * st; if (r > 0.5) { x.beginPath(); x.arc(cx - rad + (k + 0.5 + (j % 2) * 0.5) * st, cy - rad + (j + 0.5) * st, r, 0, 7); x.fill(); } }
      ok = true;
    } catch (e) { /* 絵が読めないときは、音符 */ }
    if (!ok) { x.font = '400 64px ' + BIG; x.textAlign = 'center'; x.fillText('♪', cx, cy + 22); }
    x.restore(); x.lineWidth = 5; x.strokeStyle = INK; x.beginPath(); x.arc(cx, cy, rad, 0, 7); x.stroke();
  }
  function tape(x, r, no, s, img, empty) {   // カセットの片面（s = 'A' か 'B'）
    const t = r[s]; x.clearRect(0, 0, CW, CH); x.lineJoin = 'round';
    rr(x, 6, 6, CW - 12, CH - 12, 30); x.fillStyle = PAPER; x.fill(); x.lineWidth = 9; x.strokeStyle = INK; x.stroke();
    [[30, 30], [CW - 30, 30], [30, CH - 30], [CW - 30, CH - 30], [CW / 2, CH - 34]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 10, 0, 7); x.lineWidth = 4; x.stroke(); x.beginPath(); x.moveTo(a - 6, b); x.lineTo(a + 6, b); x.stroke(); });
    rr(x, 52, 28, CW - 104, 264, 14); x.fillStyle = '#ffffff'; x.fill(); x.save(); x.clip(); x.fillStyle = INK; x.fillRect(52, 28, CW - 104, 50); x.fillStyle = ACCENT; x.fillRect(52, 192, CW - 104, 9); x.restore(); x.lineWidth = 5; x.stroke();
    x.fillStyle = ACCENT; x.font = '400 40px ' + BIG; x.textAlign = 'left'; x.fillText(s, 70, 68); x.fillStyle = PAPER; x.font = '700 18px ' + MONO; x.fillText(BRAND, 108, 60);
    x.textAlign = 'right'; x.fillText('TAPE ' + no, CW - 70, 60);
    x.textAlign = 'left'; x.fillStyle = INK; x.font = '400 46px ' + BIG; x.fillText(String(r.name || (empty ? 'COMING SOON' : LOGO)).toUpperCase(), 70, 128, 370);
    x.font = '700 22px ' + MONO; x.fillStyle = t ? INK : '#8a877f'; x.fillText(t ? t.t : empty ? 'NO TAPES YET' : '— BLANK —', 70, 162, 370);
    if (t && t.by) { x.font = '400 16px ' + MONO; x.fillStyle = '#55524b'; x.fillText(t.by, 70, 185, 370); }
    halftone(x, img, 520, 132, 52);
    rr(x, 172, 214, 296, 68, 34); x.fillStyle = INK; x.fill();
    x.save(); rr(x, 172, 214, 296, 68, 34); x.clip(); x.fillStyle = '#4a3527'; [[238, 46], [402, 32]].forEach(([a, rad]) => { x.beginPath(); x.arc(a, 248, rad, 0, 7); x.fill(); }); x.restore();
    x.beginPath(); x.moveTo(150, CH - 8); x.lineTo(178, 304); x.lineTo(CW - 178, 304); x.lineTo(CW - 150, CH - 8); x.lineWidth = 5; x.strokeStyle = INK; x.stroke();
    x.fillStyle = INK; [[236, 352], [404, 352]].forEach(([a, b]) => { x.beginPath(); x.arc(a, b, 11, 0, 7); x.fill(); }); [[280, 334], [306, 326], [334, 334]].forEach(([a, b]) => x.fillRect(a, b, 24, 18));
  }
  const REELS = [[238, 248], [402, 248]];   // ラベルの絵の中の、車の位置

  return { INK, PAPER, ACCENT, SHADOW, W, H, DP, S, CW, CH, REELS, cnv, front, top, side, cone, key, door, grip, reel, tape };
})();
