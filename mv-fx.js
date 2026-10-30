// mv-fx.js — メインビジュアル（mv.js）の、キャンバスで描く動き
// ・うしろの方眼：山の地形のように、ゆっくりもり上がったり沈んだりする（指やマウスの所が、山のようにもり上がる）
// ・リボン：表と裏の2色の帯が、ねじれながら、ゆらゆら流れる（登場のときは、のびていく）
// ・紙吹雪：ふわふわ落ちる。タップすると、そこからはじける
(window.OC_LOADED = window.OC_LOADED || []).push('mv-fx');

window.OC_MV_FX = (function () {
  const fit = (cv, max) => { const r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, max); cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr); return [r.width, r.height, dpr]; };

  // ---------- 地形の方眼 ----------
  function terrain(cv, col) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1, cs = 24, cols = 0, rows = 0, F = null;
    function size() { [W, H, dpr] = fit(cv, 1.5); cs = Math.max(18, Math.min(W, H) / 17); cols = Math.ceil(W / cs) + 3; rows = Math.ceil(H / cs) + 4; F = new Float32Array(cols * rows); }
    function draw(t, peaks, px, py, pw) {
      if (!W) return;
      const m = Math.min(W, H), R2 = (m * 0.17) ** 2, A = cs * 0.75;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
        const x = (i - 1) * cs, y = (j - 1) * cs;
        let h = 0.45 * Math.sin(x * 0.0062 + t * 0.35) * Math.cos(y * 0.0071 - t * 0.3) + 0.3 * Math.sin((x * 0.8 + y * 0.6) * 0.0095 + 1.3 + t * 0.4) + 0.2 * Math.cos((y - x * 0.5) * 0.013 - t * 0.45);
        for (const [qx, qy, qr, qa] of peaks) { const dx = x - qx * W, dy = y - qy * H; h += qa * Math.exp(-(dx * dx + dy * dy) / (qr * m) ** 2); }
        if (pw > 0.01) { const dx = x - px, dy = y - py; h += pw * 1.3 * Math.exp(-(dx * dx + dy * dy) / R2); }
        F[j * cols + i] = h;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
      const X = (i, j) => (i - 1) * cs + (F[j * cols + Math.min(cols - 1, i + 1)] - F[j * cols + Math.max(0, i - 1)]) * A * 0.35, Y = (i, j) => (j - 1) * cs - F[j * cols + i] * A;
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) i ? ctx.lineTo(X(i, j), Y(i, j)) : ctx.moveTo(X(i, j), Y(i, j));
      for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) j ? ctx.lineTo(X(i, j), Y(i, j)) : ctx.moveTo(X(i, j), Y(i, j));
      ctx.stroke();
    }
    return { size, draw };
  }

  // ---------- ねじれるリボン ----------
  // R：[{ p: [[x, y], …]（画面の点。この点を通る、なめらかな線）, w: 半分の太さ, a: 表の色, b: 裏の色, tw: ねじれの数, sp: ねじれが流れる速さ, amp: ゆれの大きさ }]
  function ribbons(cv) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
    function size() { [W, H, dpr] = fit(cv, 2); }
    const cr = (a, b, c, d, s) => { const s2 = s * s, s3 = s2 * s; return [0, 1].map((k) => 0.5 * (2 * b[k] + (c[k] - a[k]) * s + (2 * a[k] - 5 * b[k] + 4 * c[k] - d[k]) * s2 + (3 * b[k] - a[k] - 3 * c[k] + d[k]) * s3)); };
    function draw(t, R, grow) {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H); ctx.lineJoin = 'round';
      for (const r of R) {
        const P = r.p.map(([x, y], i) => [x + r.amp * Math.sin(t * 0.7 + i * 1.9), y + r.amp * Math.cos(t * 0.55 + i * 1.3)]), S = [];
        for (let i = 0; i < P.length - 1; i++) for (let k = 0; k < 18; k++) S.push(cr(P[Math.max(0, i - 1)], P[i], P[i + 1], P[Math.min(P.length - 1, i + 2)], k / 18));
        S.push(P[P.length - 1]);
        const n = Math.max(2, Math.floor(S.length * Math.min(1, grow))), E = [];
        for (let j = 0; j < n; j++) {
          const a = S[Math.max(0, j - 1)], b = S[Math.min(S.length - 1, j + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
          const k = Math.cos((r.tw * Math.PI * j) / S.length - t * r.sp), wk = r.w * (Math.abs(k) * 0.7 + 0.3) * Math.sign(k || 1);
          E.push([S[j][0] - (dy / l) * wk, S[j][1] + (dx / l) * wk, S[j][0] + (dy / l) * wk, S[j][1] - (dx / l) * wk, k]);
        }
        for (let j = 0, run = null; j < n - 1; j++) {   // 同じ色が続くところは、まとめて1回でぬる（軽くする）
          const e = E[j], f = E[j + 1], c = e[4] + f[4] >= 0 ? r.a : r.b;
          if (c !== run) { if (run) ctx.fill(); run = c; ctx.fillStyle = c; ctx.beginPath(); }
          ctx.moveTo(e[0], e[1]); ctx.lineTo(f[0], f[1]); ctx.lineTo(f[2], f[3]); ctx.lineTo(e[2], e[3]); ctx.closePath();
          if (j === n - 2) ctx.fill();
        }
      }
    }
    return { size, draw };
  }

  // ---------- 紙吹雪 ----------
  function confetti(cv, cols) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1; const P = [];
    const make = (x, y, burst) => { const a = Math.random() * Math.PI * 2, v = burst ? 3 + Math.random() * 6 : 0;
      return { x, y, vx: burst ? Math.cos(a) * v : (Math.random() - 0.5) * 0.3, vy: burst ? Math.sin(a) * v - 3 : 0.35 + Math.random() * 0.5, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.15,
        w: 4 + Math.random() * 6, h: 3 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0], s: Math.random() < 0.35, ph: Math.random() * 6.3, life: burst ? 1 : -1 }; };
    function size() { [W, H, dpr] = fit(cv, 2); const n = Math.round((W * H) / 20000); while (P.filter((p) => p.life < 0).length < n) P.push(make(Math.random() * W, Math.random() * H, false)); }
    function burst(x, y, n = 26) { for (let i = 0; i < n; i++) P.push(make(x, y, true)); }
    function draw(t, dt) {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        if (p.life >= 0) { p.vy += 0.18 * dt; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.012 * dt; if (p.life <= 0 || p.y > H + 20) { P.splice(i, 1); continue; } }
        p.x += (p.vx + (p.life < 0 ? Math.sin(t * 1.3 + p.ph) * 0.35 : 0)) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.life < 0 && p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(t * 3 + p.ph)); ctx.globalAlpha = p.life >= 0 ? Math.min(1, p.life * 2) : 0.92; ctx.fillStyle = p.c;
        if (p.s) { ctx.beginPath(); ctx.moveTo(0, -p.w / 2); ctx.lineTo(p.w / 2, p.w / 2); ctx.lineTo(-p.w / 2, p.w / 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    return { size, draw, burst };
  }

  return { terrain, ribbons, confetti };
})();
