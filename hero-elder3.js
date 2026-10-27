// hero-elder3.js — 入場画面「未知の古代」のショット 3（hero-elder.js の続き）
// 3) 記録の渦（黒い石碑のまわりを、古い新聞と発掘写真が舞う）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder3');

window.OC_ELDER3 = function (E) {
  const { K, mk, sheet, glyph, garnish } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, fr } = K;
  const F = -2.3, SERIF = 'Georgia, "Times New Roman", serif';
  const fit = (c, t, x, y, mw, font) => { c.font = font; const w = c.measureText(t).width; c.save(); c.translate(x, y); if (w > mw) c.scale(mw / w, 1); c.fillText(t, 0, 0); c.restore(); };
  const paper = (c, w, h, base, n) => { c.fillStyle = base; c.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { const x = rnd(i * 3 + n) * w, y = rnd(i * 7 + n) * h, r = 5 + rnd(i * 11) * 55, g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(110,78,36,' + (0.03 + rnd(i * 13) * 0.11) + ')'); g.addColorStop(1, 'rgba(110,78,36,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); }
    c.fillStyle = 'rgba(60,40,20,.08)'; for (let i = 0; i < 700; i++) c.fillRect(rnd(i * 5.1) * w, rnd(i * 9.7) * h, 1 + rnd(i) * 3, 1); };
  const TXT = ('In an astonishing turn, the expedition working beneath the great ziggurat reports the discovery of remains unlike any known creature. The skull, nearly three times the size of a man\'s, bears an elongated crown and a single vast orbit. Workers refused to continue after the first night, describing a low hum rising from the stones. ' +
    'The burial chamber appears to have been sealed from the inside. Clay tablets recovered nearby are inscribed in a script that matches no known language, and several depict figures descending from a disc of light. Legends of the region speak of beings who came down from the sky to teach mankind the measure of the stars. The excavation has been closed until further notice.').split(' ');
  const column = (c, x, y, w, h, words, size) => { c.font = size + 'px ' + SERIF; let line = '', yy = y, i = 0; while (yy < y + h) { const wd = words[i++ % words.length], t = line ? line + ' ' + wd : wd; if (c.measureText(t).width > w) { c.globalAlpha = 0.5 + rnd(yy * 1.3) * 0.5; c.fillText(line, x, yy); yy += size * 1.25; line = wd; } else line = t; } c.globalAlpha = 1; };
  const smear = (c, y0, y1, w, seed) => { for (let i = 0; i < 12; i++) { const y = y0 + rnd(seed + i * 7) * (y1 - y0), h = 2 + rnd(seed + i * 3) * 9, dx = (rnd(seed + i * 5) - 0.5) * 40; c.drawImage(c.canvas, 0, y, w, h, dx, y, w * (1 + rnd(i + seed) * 0.08), h); } };
  const ell = (c, x, y, rx, ry, a) => { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, TAU); c.fill(); };

  // ===== 3) 記録：発掘写真（網点）・新聞・切り抜き =====
  const PH = mk(500, 300, (c, w, h) => {
    c.fillStyle = '#141414'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 220; i++) { const x = rnd(i * 3.3) * w, y = rnd(i * 5.9) * h, r = 4 + rnd(i * 7.7) * 26, l = (30 + rnd(i * 2.1) * 70) | 0, g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r); g.addColorStop(0, 'rgb(' + l + ',' + l + ',' + l + ')'); g.addColorStop(1, 'rgba(20,20,20,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
    for (let i = 0; i < 15; i++) { const u = i / 14, x = 262 - u * 225, y = 150 + S(u * 2.4) * 58 + u * 22, r = 13 - u * 7; c.fillStyle = '#d4d4d4'; ell(c, x, y, r * 1.15, r * 0.8, -0.5); c.fillStyle = '#7a7a7a'; c.fillRect(x - r * 0.2, y - r * 1.7, r * 0.4, r * 0.9); }
    c.save(); c.translate(352, 118); c.rotate(-0.28); const g = c.createRadialGradient(-20, -34, 8, 0, 0, 120); g.addColorStop(0, '#f4f4f4'); g.addColorStop(0.7, '#bababa'); g.addColorStop(1, '#5e5e5e'); c.fillStyle = g;
    ell(c, 14, -12, 104, 64, 0); c.beginPath(); c.moveTo(-66, 8); c.quadraticCurveTo(-108, 60, -150, 96); c.lineTo(-128, 106); c.quadraticCurveTo(-80, 72, -26, 52); c.closePath(); c.fill();
    c.fillStyle = '#0e0e0e'; ell(c, -8, 6, 31, 39, 0.2); ell(c, -56, 30, 10, 6, 0.5); c.fillStyle = '#e2e2e2'; for (let i = 0; i < 9; i++) { const u = i / 8; c.fillRect(-64 - u * 76, 54 + u * 40, 5, 9); } c.restore();
    [[380, 258, -0.22, 92], [452, 214, -1.15, 70]].forEach(([x, y, a, L]) => { c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#cdcdcd'; c.fillRect(-L, -8, 2 * L, 16); ell(c, -L, 0, 13, 15, 0); ell(c, L, 0, 12, 14, 0); c.restore(); });
  });
  const HT = mk(520, 320, (c, w, h) => {   // 網点の写真（白いふちつき）
    const d = PH.getContext('2d').getImageData(0, 0, 500, 300).data, cs = 5; c.fillStyle = '#e6dccb'; c.fillRect(0, 0, w, h); c.fillStyle = '#1b1830'; c.fillRect(10, 10, 500, 300); c.fillStyle = '#d6d8f6'; c.beginPath();
    for (let y = 0; y < 300; y += cs) for (let x = (y / cs) % 2 ? cs / 2 : 0; x < 500; x += cs) { const i = (Math.min(299, y + 2) * 500 + Math.min(499, x + 2)) * 4, r = cs * 0.64 * Math.sqrt(d[i] / 255); if (r > 0.3) { c.moveTo(x + 12.5 + r, y + 12.5); c.arc(x + 12.5, y + 12.5, r, 0, TAU); } }
    c.fill();
  });
  const P1 = mk(480, 640, (c, w, h) => {
    paper(c, w, h, '#e4d9c6', 60); c.fillStyle = '#1b1712'; c.textAlign = 'center';
    fit(c, 'The Archive Herald', w / 2, 50, w - 50, '700 38px ' + SERIF); c.font = '600 9px ' + SERIF; c.fillText('VOL. XLVII  —  No. 1947  ——  LATE EDITION', w / 2, 68); c.fillRect(20, 75, w - 40, 2.5);
    fit(c, 'EXCAVATION UNCOVERS', w / 2, 122, w - 40, '900 40px ' + SERIF); fit(c, 'REMAINS NOT OF THIS EARTH', w / 2, 164, w - 40, '900 40px ' + SERIF); smear(c, 90, 170, w, 11);
    c.drawImage(HT, 10, 10, 500, 300, 24, 180, 432, 259); c.textAlign = 'left'; [0, 1, 2].forEach((k) => column(c, 22 + k * 150, 462, 138, 165, TXT.slice(k * 31).concat(TXT), 9));
    const eg = c.createRadialGradient(w / 2, h / 2, w * 0.4, w / 2, h / 2, w * 0.85); eg.addColorStop(0, 'rgba(70,45,15,0)'); eg.addColorStop(1, 'rgba(70,45,15,.35)'); c.fillStyle = eg; c.fillRect(0, 0, w, h);
  });
  const P2 = mk(340, 420, (c, w, h) => {
    paper(c, w, h, '#d9d1c1', 26); c.fillStyle = '#16120e'; c.textAlign = 'center';
    fit(c, 'SIGNAL RECEIVED', w / 2, 50, w - 34, '900 38px ' + SERIF); fit(c, 'FROM BEYOND THE STARS', w / 2, 86, w - 34, '900 30px ' + SERIF); smear(c, 22, 92, w, 37);
    c.fillStyle = '#2b3033'; c.fillRect(22, 112, 296, 168); c.fillStyle = '#f2f4f4'; ell(c, 172, 156, 5, 5, 0);
    c.fillStyle = '#0c0d0e'; c.beginPath(); c.moveTo(70, 280); [[70, 244], [104, 244], [104, 226], [134, 226], [134, 208], [150, 208], [150, 198], [196, 198], [196, 208], [212, 208], [212, 226], [242, 226], [242, 244], [276, 244], [276, 280]].forEach(([x, y]) => c.lineTo(x, y)); c.fill();
    c.textAlign = 'left'; column(c, 22, 300, 140, 110, TXT.slice(40).concat(TXT), 9); column(c, 178, 300, 140, 110, TXT.slice(70).concat(TXT), 9);
  });
  const PG = [[P1, 1.25, 1.67], [P2, 0.95, 1.17], [HT, 1.35, 0.83], [P1, 1.15, 1.53], [HT, 1.1, 0.68], [P2, 0.9, 1.11], [HT, 1.2, 0.74]];
  const MONO = { V: [[-0.38, 0, -0.14], [0.38, 0, -0.14], [0.38, 0, 0.14], [-0.38, 0, 0.14], [-0.34, 3.0, -0.12], [0.34, 3.0, -0.12], [0.34, 3.0, 0.12], [-0.34, 3.0, 0.12]], F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]] };

  return [
    { // 3) 記録の渦：黒い石碑のまわりを、新聞と発掘写真がゆっくり渦を巻く。裏を向いた紙は、文字が透けて見える
      name: 'RECORDS', bg: '#0e0c0a', sel: 'so20',
      cam: (tb, t) => ({ pitch: 0.24 + 0.06 * S(t * 0.4), dist: 9.8, zoom: 1.1, t: [0, F + 1.8, 0] }),
      act: (t, tb) => {
        const o = {};
        o.so20 = { p: [0, F, 0], r: [0, t * 0.15, 0], V: MONO.V, F: MONO.F, c: '#0b0b0d', edge: '#c8a26a', elw: 0.9 };
        o.cx4 = { p: [0, F + 1.5, 0], z: 0.2, draw: (ctx, G) => { ctx.strokeStyle = '#ffd08a'; ctx.fillStyle = '#ffd08a'; ctx.lineWidth = 1.4; ctx.lineCap = 'round'; const a = t * 0.15;   // 石碑の文字（光る）
          [1, -1].forEach((sd) => { const n = [S(a) * sd, 0, Co(a) * sd], cam = G.camPos; if ((cam[0] * n[0] + cam[2] * n[2]) < 0.2) return; range(9).forEach((i) => { const c = G.proj([n[0] * 0.15, F + 0.4 + i * 0.28, n[2] * 0.15]); if (c[2] < 0.3) return; const s = (G.f * 0.17) / c[2]; ctx.globalAlpha = 0.55 + 0.45 * S(t * 2 + i); glyph(ctx, (i * 13 + 5) % 40, c[0] - s * 0.3, c[1] - s * 0.5, s); }); });
          ctx.globalAlpha = 1; ctx.lineCap = 'butt'; } };
        o.bm0 = { a: [0, F + 7, 0], b: [0, F, 0], ra: 0.35, rb: 1.2, c: '#ffe2b0', c2: '#8a6a3a', alpha: 0.32, zp: [0, F + 1, -0.5], z: -8 };
        o.gw0 = { p: [0, F + 0.05, 0], w: 1.0, c: '#ffd08a', c2: '#5a3a10', alpha: 0.5, z: -9 };
        PG.forEach(([img, w, h], i) => {   // 渦を巻く紙
          const a = (i / 7) * TAU + t * 0.22, R = 2.15 + 0.25 * S(t * 0.5 + i), C = [Co(a) * R, F + 0.9 + (i % 3) * 0.78 + 0.15 * S(t * 0.7 + i * 1.3), S(a) * R], ro = 0.3 * S(t * 0.4 + i), tl = 0.25 * S(t * 0.5 + i * 2);
          const N = [Co(a), 0, S(a)], T0 = [-S(a), 0, Co(a)], U = [T0[0] * Co(ro), S(ro), T0[2] * Co(ro)], V = [-T0[0] * S(ro) + N[0] * tl, Co(ro), -T0[2] * S(ro) + N[2] * tl];
          const P = (u, v) => { const x = (u - 0.5) * w, y = (0.5 - v) * h, z = 0.05 * S(u * 6 + i) * S(v * 5) + 0.04 * S(t * 3 + u * 4 + i); return [C[0] + U[0] * x + V[0] * y + N[0] * z, C[1] + U[1] * x + V[1] * y, C[2] + U[2] * x + V[2] * y + N[2] * z]; };
          o['cx' + (5 + i)] = { p: C, draw: (ctx, G, ac) => sheet(ctx, G, img, P, 8, 6, Math.min(1, ac.s), (u) => 0.12 * S(u * 9 + i) + 0.05, false) };
        });
        range(10).forEach((i) => { const a = rnd(i * 3) * TAU + t * 0.3, R = 1.2 + rnd(i * 5) * 2.4; o['fl' + i] = { p: [Co(a) * R, F + 0.4 + fr(rnd(i * 7) + t * 0.05) * 3.6, S(a) * R], r: [t * 2 + i, t * 1.3 + i * 2, i], shape: 'square', w: 0.07 + rnd(i * 9) * 0.06, sx: 1, sy: 0.7, c: i % 3 ? '#d9cfbd' : '#8a7a62', alpha: 0.9 }; });
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#120f0c', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#e8c890', '#8a6a3a', '#d9b77a', 0.6);
        return o;
      }
    }
  ];
};
