// archive-cave.js — 質問解答のいちばん上：古いビデオカメラで撮った、洞窟の壁画（ぜんぶコードで描いています）
// ・岩の壁と、赤い土や炭で描かれた絵（鳥の頭の人・うずまき・光る円盤・手をあげる人たち・山の印・読めない文字）
// ・ビデオテープみたいに、色が少しずれて、横すじのノイズが流れて、ときどき画面がゆれます
// ・新聞の写真（網点）も、この壁から作ります
(window.OC_LOADED = window.OC_LOADED || []).push('archive-cave');

(function () {
  const S = 480;   // 壁の大きさ（小さく作って、ぼんやり大きく見せる）
  function rnd(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

  // ---------- 岩の壁 ----------
  function wall() {
    const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    const R = rnd(7), G = 64, g = new Float32Array((G + 1) * (G + 1)).map(() => R());
    const val = (u, v) => { const i = Math.floor(u), j = Math.floor(v), fu = u - i, fv = v - j, s = (t) => t * t * (3 - 2 * t);
      const k = (p, q) => g[((i + p) % G) + ((j + q) % G) * (G + 1)]; return k(0, 0) + (k(1, 0) - k(0, 0)) * s(fu) + (k(0, 1) - k(0, 0)) * s(fv) + (k(0, 0) - k(1, 0) - k(0, 1) + k(1, 1)) * s(fu) * s(fv); };
    const fbm = (u, v) => { let t = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { t += a * val(u * f, v * f); a *= 0.5; f *= 2.03; } return t; };
    const im = x.createImageData(S, S), d = im.data;
    for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
      const u = i / 34, v = j / 34, n = fbm(u, v), st = fbm(u * 0.35 + 9, v * 0.35 + 4), k = (j * S + i) * 4;
      const l = 0.32 + n * 0.62, o = Math.max(0, st - 0.52) * 2.2;   // 明るさと、赤い土のしみ
      d[k] = 140 * l + 70 * o; d[k + 1] = 126 * l + 18 * o; d[k + 2] = 106 * l; d[k + 3] = 255;
    }
    x.putImageData(im, 0, 0);
    // ひび
    x.strokeStyle = 'rgba(20,16,12,.55)'; x.lineCap = 'round';
    for (let k = 0; k < 14; k++) { let px = R() * S, py = R() * S, a = R() * 6.3; x.lineWidth = 0.6 + R() * 1.4; x.beginPath(); x.moveTo(px, py);
      for (let s = 0; s < 22; s++) { a += (R() - 0.5) * 0.9; px += Math.cos(a) * 6; py += Math.sin(a) * 6; x.lineTo(px, py); } x.stroke(); }
    paint(x, rnd(21));
    return c;
  }

  // ---------- 壁画（ざらざらの線で） ----------
  function paint(x, R) {
    const OCH = 'rgba(168,64,36,', COAL = 'rgba(24,19,15,';
    const rough = (pts, col, w) => { for (let p = 0; p < 3; p++) { x.strokeStyle = col + (0.4 + R() * 0.25) + ')'; x.lineWidth = w * (0.7 + R() * 0.6); x.beginPath();
      pts.forEach(([a, b], i) => (i ? x.lineTo : x.moveTo).call(x, a + (R() - 0.5) * 2.2, b + (R() - 0.5) * 2.2)); x.stroke(); } };
    const blob = (cx, cy, rx, ry, col) => { for (let p = 0; p < 3; p++) { x.fillStyle = col + (0.3 + R() * 0.2) + ')'; x.beginPath(); x.ellipse(cx + (R() - 0.5) * 2, cy + (R() - 0.5) * 2, rx, ry, 0, 0, 7); x.fill(); } };
    const arc = (cx, cy, r, a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
    x.lineCap = x.lineJoin = 'round';
    // 光る円盤（左上）
    rough(arc(92, 92, 26, 0, 6.3, 28), OCH, 4); blob(92, 92, 12, 12, OCH);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.28; rough([[92 + Math.cos(a) * 34, 92 + Math.sin(a) * 34], [92 + Math.cos(a) * 48, 92 + Math.sin(a) * 48]], OCH, 3); }
    // うずまき（右上）
    rough(Array.from({ length: 90 }, (_, i) => { const a = i * 0.21, r = 3 + i * 0.6; return [345 + Math.cos(a) * r, 128 + Math.sin(a) * r]; }), COAL, 3.4);
    // 鳥の頭の人（まん中の左）
    blob(178, 150, 15, 13, COAL); rough([[188, 146], [232, 176], [236, 182]], COAL, 4);   // 頭とくちばし
    rough([[172, 162], [160, 210], [164, 262], [158, 330]], COAL, 6); rough([[164, 262], [186, 330]], COAL, 5);
    rough([[162, 210], [120, 236], [104, 270]], COAL, 4); rough([[164, 214], [210, 232], [232, 262]], COAL, 4);
    // 手をあげる人たち（下）
    for (let k = 0; k < 4; k++) { const bx = 244 + k * 44, by = 330 + (k % 2) * 8, col = k % 2 ? OCH : COAL;
      blob(bx, by - 46, 7, 8, col); rough([[bx, by - 38], [bx, by - 2]], col, 4.5); rough([[bx - 16, by - 64], [bx - 10, by - 40], [bx, by - 32], [bx + 10, by - 40], [bx + 16, by - 64]], col, 3.5);
      rough([[bx, by - 2], [bx - 10, by + 26]], col, 4); rough([[bx, by - 2], [bx + 10, by + 26]], col, 4); }
    // 山の印（MAYAMA）
    rough([[380, 250], [412, 196], [444, 250], [380, 250]], OCH, 4); rough([[392, 238], [402, 224], [412, 236], [422, 222], [432, 238]], OCH, 3);
    // 手のあと
    blob(62, 300, 17, 21, OCH); [[-12, -26, 4, 14], [-4, -32, 4, 16], [5, -31, 4, 16], [13, -24, 4, 13], [20, -2, 4, 11]].forEach(([a, b, rx, ry]) => blob(62 + a, 300 + b, rx, ry, OCH));
    // 読めない文字の列
    for (let k = 0; k < 18; k++) { const gx = 70 + k * 21, gy = 428; const pts = []; for (let s = 0; s < 3 + Math.floor(R() * 3); s++) pts.push([gx + R() * 12, gy + R() * 18]); rough(pts, k % 3 ? COAL : OCH, 2.2); }
    // こすれて、かすれる
    for (let k = 0; k < 2600; k++) { x.fillStyle = 'rgba(132,118,98,' + (0.18 + R() * 0.3) + ')'; x.fillRect(R() * S, R() * S, 1 + R() * 2, 1 + R() * 2); }
  }

  // 赤・緑・青に分けた壁（ずらして重ねると、ビデオの色ずれ）
  function split(src) {
    const d = src.getContext('2d').getImageData(0, 0, S, S);
    return [0, 1, 2].map((ch) => { const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), o = x.createImageData(S, S);
      for (let i = 0; i < d.data.length; i += 4) { o.data[i + ch] = d.data[i + ch]; o.data[i + 3] = 255; } x.putImageData(o, 0, 0); return c; });
  }
  function noises() {
    return [0, 1, 2, 3].map(() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), o = x.createImageData(128, 128);
      for (let i = 0; i < o.data.length; i += 4) { const v = Math.random() * 255; o.data[i] = o.data[i + 1] = o.data[i + 2] = v; o.data[i + 3] = 255; } x.putImageData(o, 0, 0); return c; });
  }

  let W0 = null;
  const getWall = () => W0 || (W0 = wall());

  // ---------- いちばん上の映像 ----------
  function hero(cv) {
    const x = cv.getContext('2d'); if (!x) return;
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ch = split(getWall()), nz = noises();
    let w = 0, h = 0, vis = false, run = false, last = 0, glitch = 0, nextG = 2.5, mx = 0, my = 0, tx = 0, ty = 0;
    const start = () => { if (!run) { run = true; requestAnimationFrame(f); } };
    function size() { const r = cv.getBoundingClientRect(), k = Math.min(1, 900 / Math.max(1, r.width)); w = cv.width = Math.round(r.width * k); h = cv.height = Math.round(r.height * k); }
    new ResizeObserver(size).observe(cv); size();
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) start(); }).observe(cv);
    addEventListener('pointermove', (e) => { tx = e.clientX / innerWidth - 0.5; ty = e.clientY / innerHeight - 0.5; }, { passive: true });
    function f(now) {
      if (!vis) { run = false; return; }
      requestAnimationFrame(f);
      if (document.hidden || now - last < 41) return; last = now;   // 24コマ
      const t = now / 1000; mx += (tx - mx) * 0.06; my += (ty - my) * 0.06;
      const sc = Math.max(w, h) / S * 1.18, dw = S * sc, dh = S * sc;
      const ox = (w - dw) / 2 + Math.sin(t * 0.07) * (dw - w) * 0.42 - mx * 30, oy = (h - dh) / 2 + Math.cos(t * 0.05) * (dh - h) * 0.3 - my * 22;
      const ab = 2.2 + (glitch > 0 ? 7 : 0);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1; x.fillStyle = '#000'; x.fillRect(0, 0, w, h);
      x.globalCompositeOperation = 'lighter'; x.globalAlpha = 0.93 + Math.random() * 0.07;
      x.drawImage(ch[0], ox + ab, oy, dw, dh); x.drawImage(ch[1], ox, oy, dw, dh); x.drawImage(ch[2], ox - ab, oy + 1, dw, dh);
      x.globalCompositeOperation = 'source-over'; x.globalAlpha = 1;
      // 横に流れる、ゆがんだ帯
      const by = ((t * 0.09) % 1.3 - 0.15) * h, bh = h * 0.07;
      for (let k = 0; k < 5; k++) { const y = by + (k * bh) / 5, sh = bh / 5, dx = (Math.random() - 0.5) * 10; if (y > 0 && y < h) x.drawImage(cv, 0, y, w, sh, dx, y, w, sh); }
      x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, by + bh * 0.4, w, 2);
      // ときどき、画面がゆれる
      if (!REDUCE && t > nextG) { glitch = 0.18; nextG = t + 3 + Math.random() * 5; }
      if (glitch > 0) { glitch -= 0.041; for (let k = 0; k < 6; k++) { const y = Math.random() * h, sh = 4 + Math.random() * 30; x.drawImage(cv, 0, y, w, sh, (Math.random() - 0.5) * 60, y, w, sh); } }
      // ざらざら
      x.globalAlpha = 0.09; x.globalCompositeOperation = 'screen';
      const n = nz[Math.floor(Math.random() * 4)], p = x.createPattern(n, 'repeat'); x.fillStyle = p; x.fillRect(0, 0, w, h);
      x.globalAlpha = 1; x.globalCompositeOperation = 'source-over';
      if (REDUCE) vis = false;
    }
    return { burst() { glitch = 0.45; if (REDUCE) { vis = true; start(); } } };
  }

  // ---------- 新聞の写真（網点） ----------
  function halftone(cv, crop) {
    const x = cv.getContext('2d'), w = cv.width, h = cv.height, [cx, cy, cw] = crop || [130, 150, 300], chh = (cw * h) / w;
    const tmp = document.createElement('canvas'), gw = Math.ceil(w / 4), gh = Math.ceil(h / 4); tmp.width = gw; tmp.height = gh;
    const tx = tmp.getContext('2d'); tx.drawImage(getWall(), cx, cy, cw, chh, 0, 0, gw, gh);
    const d = tx.getImageData(0, 0, gw, gh).data;
    x.clearRect(0, 0, w, h); x.fillStyle = '#1b1915';
    for (let j = 0; j < gh; j++) for (let i = 0; i < gw; i++) {
      const k = (j * gw + i) * 4, l = (d[k] * 0.3 + d[k + 1] * 0.59 + d[k + 2] * 0.11) / 255, r = Math.max(0, (1 - l) * 2.5 - 0.15);
      if (r > 0.2) { x.beginPath(); x.arc(i * 4 + 2, j * 4 + 2, Math.min(2.6, r), 0, 6.3); x.fill(); }
    }
  }

  window.AR_CAVE = { hero, halftone };
})();
