// hero-scenes2.js — 入場画面の場面 5〜8。色や形を変えたいときは、ここを直します
// （場面 1〜4 は hero-scenes.js にあります）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes2');

window.OC_HERO_SCENES2 = function (G, T) {
  const { ctx, PAL, TAU, rad, clamp01, e, eBack } = G;
  const S = Math.sin, Co = Math.cos;
  const { P, disc, ring, ell, rect, grect, split, hair, star, star8, plus, poly, holo, sphere, ticks, squiggle, bars, dots, grid, label, tag, otext } = T;
  const fadeTags = (t, d) => { ctx.globalAlpha = e(t, d, 0.5); };

  // 5) 斜めの板の上の、波の線（立体のように見える）
  const iso = {
    name: 'ISOMETRIC', bg: PAL.orange, ink: PAL.navy, lead: PAL.verm, acc: [PAL.navy, PAL.teal, PAL.cream, PAL.verm],
    draw(t, c) {
      const { u, X, Y } = c, q = u, ink = 'rgba(20,27,58,';
      grid(9 * u, 'rgba(232,80,30,.22)', t * 6, 'h');
      for (let k = 0; k < 6; k++) rect(X(18 + k * 1.3), Y(-30 + k * 0.9), 15 * u, 24 * u * e(t, 0.2 + k * 0.05, 0.6), 'rgba(255,236,170,.2)', 0.5);
      const p = e(t, 0, 0.9), [px, py] = P(X(0) + (1 - p) * 70 * u, Y(12) + (1 - p) * 30 * u, 0.3);
      ctx.save(); ctx.translate(px, py); ctx.transform(1, -0.16 + 0.03 * S(t * 0.7), 0.62 + 0.07 * S(t * 0.5), 0.46, 0, 0);
      ctx.strokeStyle = ink + '.75)'; ctx.lineWidth = 1.2;
      for (let k = 0; k < 3; k++) ctx.strokeRect((-30 - k * 1.3) * q, (-24 + k * 1.5) * q, 60 * q, 48 * q);
      ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(-4 * q, 6 * q, 13 * q * e(t, 0.4, 0.7, eBack) * (1 + 0.05 * S(t * 2)), 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(42,42,255,.9)';
      for (let gx = -24; gx <= -4; gx += 3) for (let gy = -18; gy <= 2; gy += 3) { const r = 0.35 * q * (1 + 0.6 * S(t * 3 + gx * 0.3 + gy * 0.2)); ctx.fillRect(gx * q - r, gy * q - r, r * 2, r * 2); }
      ctx.strokeStyle = ink + '.85)'; ctx.lineWidth = 1;
      const amp = e(t, 0.5, 0.8) * 3.2 * q;
      for (let row = 0; row < 14; row++) { ctx.beginPath(); for (let x = 2; x <= 26; x += 1) { const y = (-20 + row * 1.5) * q + S(x * 0.45 + t * 3 + row * 0.28) * amp * S(((x - 2) / 24) * Math.PI); x === 2 ? ctx.moveTo(x * q, y) : ctx.lineTo(x * q, y); } ctx.stroke(); }
      ctx.restore();
      const pn = e(t, 0.3, 0.8, eBack);
      ell(X(9), Y(9) - (1 - pn) * 40 * u, 0.8 * u + 5 * u * Math.abs(Co(t * 1.2)), 14 * u, 0.15, PAL.navy, 0.8);
      ell(X(9), Y(9) - (1 - pn) * 40 * u, 0.3 * u + 1.3 * u * Math.abs(Co(t * 1.2)), 2.4 * u, 0.15, PAL.pink, 0.8);
      holo(X(-6) + (1 - e(t, 0.5, 0.8)) * 60 * u + S(t * 0.7) * 2 * u, Y(-18), 34 * u, 5 * u, rad(14 + 4 * S(t)), t, 1);
      grect(X(-16), Y(-8) - (1 - e(t, 0.6, 0.8)) * 40 * u, 30 * u, 4.5 * u, [PAL.white, PAL.black], 0.9, rad(-22 + 3 * S(t * 0.8)));
      rect(X(24) + (1 - e(t, 0.7, 0.8)) * 50 * u + S(t * 1.1) * 2 * u, Y(15), 9 * u, 2.4 * u, PAL.white, 1);
      star(X(-26), Y(-26), 6 * u * e(t, 0.6, 0.6, eBack), 4, 0.36, t * 0.5, PAL.teal, 1);
      hair(X(28), Y(-36), 7 * u * e(t, 0.8, 0.5), 12, TAU, t * 0.5, ink + '.7)', 0.9);
      otext('+Ma?', X(-22), Y(-38) + S(t * 1.2) * 1.5 * u, 8 * u, ink + '.8)', -0.35 + 0.05 * S(t), 0.9);
      [[-48, 30], [46, 32], [-50, -6]].forEach(([x, y], i) => plus(X(x), Y(y) + S(t + i) * u, 1.8 * u, PAL.navy, 1.5, 0.9));
      fadeTags(t, 1.1);
      tag(X(9), Y(-5), 10 * u, -10 * u, `Z-DEPTH ${(0.46 + 0.05 * S(t)).toFixed(2)}`, PAL.navy);
      tag(X(14), Y(26), 10 * u, 8 * u, 'WAVE ×14', PAL.navy);
      ctx.globalAlpha = 1;
    }
  };

  // 6) 部屋の中に浮かぶ形
  const room = {
    name: 'ROOM', bg: PAL.verm, ink: PAL.cream, lead: PAL.blue, acc: [PAL.cream, PAL.blue, PAL.teal, PAL.orange],
    draw(t, c) {
      const { u, X, Y, W, H, FH } = c, wx = W * 0.34;
      ctx.fillStyle = '#ff7a4c'; ctx.beginPath(); ctx.moveTo(-W, -H); ctx.lineTo(wx, FH * 0.04); ctx.lineTo(wx, FH * 0.66); ctx.lineTo(-W, FH); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#d63f14'; ctx.beginPath(); ctx.moveTo(-W, FH); ctx.lineTo(wx, FH * 0.66); ctx.lineTo(W * 2, FH * 0.66); ctx.lineTo(W * 2, H * 2); ctx.lineTo(-W, H * 2); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 14; k++) rect(X(-44) + k * 1.5 * u, Y(-24), 0.4 * u, 28 * u * e(t, k * 0.03, 0.5), 'rgba(255,240,240,.35)', 0.3);
      sphere(X(-37), Y(-10), 6 * u * (1 + 0.06 * S(t * 2)) * e(t, 0.3, 0.6, eBack), PAL.pink, PAL.verm, 0.35);
      for (let i = 0; i < 5; i++) { const h = (13 + 9 * Math.abs(S(t * 1.8 + i * 1.3))) * u * e(t, i * 0.08, 0.6, eBack); rect(X(-6 + i * 5.4), Y(12) - h, 3.8 * u, h, '#fff4f4', 0.8 + i * 0.03); }
      rect(X(-14), Y(-24) - (1 - e(t, 0.1, 0.7)) * 50 * u, 11 * u, 26 * u, PAL.blue, 0.7);
      const bounce = Math.abs(S(t * 2.2)) * 7 * u;
      sphere(X(7), Y(14) - bounce, 8 * u * e(t, 0.3, 0.7, eBack), '#ffffff', '#2a2a2a', 1);
      ell(X(7), Y(22.5), 7 * u * (1 - bounce / (14 * u)), 1.4 * u, 0, 'rgba(120,20,0,.35)', 0.9);
      holo(X(-14) + (1 - e(t, 0.4, 0.8)) * 70 * u, Y(15), 32 * u, 6 * u, rad(3 + 2 * S(t)), t, 0.9);
      holo(X(10) + (1 - e(t, 0.5, 0.8)) * 70 * u, Y(2), 18 * u, 5 * u, rad(-8 + 3 * S(t * 1.3)), t + 2, 1);
      rect(X(-1), Y(-14), 1.8 * u, 22 * u, PAL.teal, 0.9);
      rect(X(-14), Y(-6.9), 28 * u * e(t, 0.5, 0.6), 1.8 * u, PAL.orange, 1, rad(38) + S(t) * 0.12);
      for (let k = 0; k < 9; k++) ell(X(-30) + k * 1.7 * u, Y(24) + S(t * 2 + k * 0.5) * 0.8 * u, 3 * u * e(t, 0.2, 0.6), 6 * u, 0, 'rgba(255,240,230,.65)', 0.6, 1);
      ell(X(24), Y(-26) + S(t * 1.3) * 1.2 * u, 4.5 * u * e(t, 0.6, 0.5, eBack), 3 * u, 0, PAL.white, 0.9);
      star(X(30), Y(4), 3 * u * e(t, 0.6, 0.5, eBack), 14, 0.72, t, PAL.cream, 1);
      star8(X(-18), Y(28), 5.5 * u * e(t, 0.6, 0.5, eBack), t * 1.3, PAL.cream, 1);
      rect(X(22), Y(-14), 0.4 * u, 26 * u * e(t, 0.7, 0.6), 'rgba(255,240,230,.7)', 0.8, rad(24));
      squiggle(X(28), Y(-36), 16 * u, 0.9 * u, 3, t * 4, PAL.cream, 1.2, 0.9);
      fadeTags(t, 1.1);
      tag(X(7), Y(14) - bounce, 12 * u, -12 * u, `BOUNCE ${(bounce / u).toFixed(1)}`, PAL.cream);
      tag(X(-37), Y(-10), 4 * u, -16 * u, 'LIGHT_06', PAL.cream);
      ctx.globalAlpha = 1;
    }
  };

  // 7) 横に流れる、色の帯（グリッチ）
  const ROWS = [
    { y: -22, h: 6, sp: 9, segs: [[10, '#ffffff'], [14, 'holo'], [9, 'half:teal:cream'], [12, 'verm'], [6, 'peach'], [16, 'gb'], [8, 'orange']] },
    { y: -15, h: 8, sp: -6, segs: [[6, '#ffffff'], [20, 'black'], [16, 'gw'], [10, 'blue'], [12, 'half:navy:cream']] },
    { y: -6, h: 9, sp: 12, segs: [[18, 'pinkg'], [12, 'half:navy:pink'], [9, 'teal'], [14, 'cream'], [10, 'orange']] },
    { y: 4, h: 5, sp: -14, segs: [[9, 'orange'], [14, 'teal'], [12, 'cream'], [10, 'gb'], [8, 'verm']] },
    { y: 10, h: 7, sp: 7, segs: [[22, 'gw'], [8, 'half:orange:white'], [12, 'black'], [9, 'verm']] },
    { y: 18, h: 4, sp: -10, segs: [[14, 'verm'], [8, 'orange'], [18, 'navy'], [10, 'holo']] }
  ];
  const strips = {
    name: 'SIGNAL', bg: '#ececec', ink: PAL.navy, lead: PAL.verm, acc: [PAL.navy, PAL.verm, PAL.teal, PAL.orange],
    draw(t, c) {
      const { u, X, Y } = c, ink = 'rgba(20,27,58,';
      grid(8 * u, ink + '.06)', t * 4, 'h');
      const ww = 96 * u * e(t, 0, 0.8), left = X(0) - ww / 2, right = left + ww, gi = Math.floor(t / 1.3), gl = t - gi * 1.3;
      ctx.save(); ctx.beginPath(); ctx.rect(left, Y(-40), ww, 80 * u); ctx.clip();
      ROWS.forEach((r, i) => {
        const L = r.segs.reduce((a, s) => a + s[0], 0) * u, glitch = i === gi % ROWS.length && gl < 0.18;
        const off = ((t * r.sp * u + (glitch ? 7 * u : 0)) % L + L) % L, y = Y(r.y), h = r.h * u * (1 + 0.15 * S(t * 2 + i)), z = 0.3 + i * 0.12;
        if (glitch) { rect(left, y - 1.5, ww, h, 'rgba(255,47,160,.45)', z); rect(left, y + 1.5, ww, h, 'rgba(0,240,255,.45)', z); }
        for (let x = left - off; x < right; ) for (const [w0, kind] of r.segs) {
          const w = w0 * u; if (x > right) break;
          if (x + w > left) {
            if (kind === 'holo') holo(x, y, w, h, 0, t, z);
            else if (kind === 'gb') grect(x, y, w, h, ['#ffffff', '#1b1b1b'], z);
            else if (kind === 'gw') grect(x, y, w, h, ['#1b1b1b', '#bdbdbd', '#ffffff'], z);
            else if (kind === 'pinkg') grect(x, y, w, h, [PAL.pink, '#ff9ad5', PAL.blue], z, 0, true);
            else if (kind.startsWith('half')) { const [, a, b] = kind.split(':'); rect(x, y, w, h, PAL[a], z); const [cx, cy] = P(x + w / 2, y + h, z); ctx.fillStyle = PAL[b]; ctx.beginPath(); ctx.arc(cx, cy, Math.min(w / 2, h), Math.PI, TAU); ctx.fill(); }
            else rect(x - 0.3, y, w + 0.6, h, PAL[kind] || kind, z);
          }
          x += w;
        }
      });
      ctx.restore();
      const ry = Y(30);
      rect(left, ry, ww, 1, ink + '.6)', 0.6);
      for (let k = 0; k < 40; k++) { const x = left + ((k * 2.4 * u - t * 10 * u) % ww + ww) % ww; rect(x, ry, 1, k % 5 ? 3 : 7, ink + '.6)', 0.6); }
      for (let k = 0; k < 3; k++) { const p = (t * 0.4 + k / 3) % 1; disc(left + ww * p, Y(36), 1 * u, [PAL.verm, PAL.teal, PAL.navy][k], 0.7); }
      bars(X(30), Y(-30), 6, 1.4 * u, 6 * u, t * 1.5, PAL.navy, 0.8);
      label(gl < 0.18 ? 'GLITCH!' : 'SIG_OK', X(-46), Y(-31), PAL.navy, 8, 'left', 0.8);
      [[-50, 42], [48, 40]].forEach(([x, y]) => plus(X(x), Y(y), 1.8 * u, PAL.navy, 1.5, 0.9));
      fadeTags(t, 1);
      tag(X(-20), Y(-6), -12 * u, 32 * u, `OFFSET +${Math.round((t * 120) % 1000)}`, PAL.navy);
      tag(X(26), Y(10), 8 * u, 24 * u, `SIGNAL 0${(gi % 6) + 1}`, PAL.navy);
      ctx.globalAlpha = 1;
    }
  };

  // 8) 大きな丸と、まわりを回る形
  const orbit = {
    name: 'ORBIT', bg: PAL.teal, ink: PAL.cream, lead: PAL.navy, acc: [PAL.cream, PAL.verm, PAL.orange, PAL.navy],
    draw(t, c) {
      const { u, X, Y, W } = c;
      for (let row = 0; row < 2; row++) for (let k = 0; k < 20; k++) {
        const span = W + 40, x = ((k * 18 * u + t * 9 * u * (row ? 1 : -1)) % span + span) % span - 20;
        disc(x, Y(-3 + row * 6) + S(k * 0.8 + t * 1.4) * 2 * u, 0.8 * u, PAL.cream, -0.1);
      }
      ticks(X(0), Y(0), 37 * u, 120, 1.2 * u, t * 0.05, 'rgba(255,250,244,.5)', 0.2, 10);
      const g = e(t, 0, 0.9, eBack), R = 34 * u * g, [a, b] = P(X(0), Y(0), 0.3);
      if (R > 1) {
        ctx.save(); ctx.beginPath(); ctx.arc(a, b, R, 0, TAU); ctx.clip();
        ctx.fillStyle = '#1b1b1b'; ctx.fillRect(a - R, b - R, R * 2, R * 2);
        ctx.translate(a, b); ctx.rotate(-0.1 + 0.25 * S(t * 0.4));
        const gr = ctx.createLinearGradient(0, -R, 0, R); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#8f8f8f');
        ctx.fillStyle = gr; ctx.fillRect(-R, -R, R, R * 2); ctx.restore();
      }
      grect(X(-1), Y(-64) + S(t * 0.8) * 6 * u, 9 * u, 64 * u * e(t, 0.2, 0.8), [PAL.cyan, PAL.blue, PAL.pink, PAL.white], 0.6, 0, true);
      const g2 = e(t, 0.4, 0.8);
      rect(X(-1), Y(0), 2.6 * u, 70 * u * g2, PAL.cream, 0.6); rect(X(1.6), Y(0), 4.2 * u, 70 * u * g2 * (0.9 + 0.1 * S(t * 2)), PAL.verm, 0.65); rect(X(5.8), Y(0), 2.2 * u, 70 * u * g2, PAL.orange, 0.7);
      const o = S(t * 0.9) * 2 * u, pt = e(t, 0.5, 0.6);
      poly([[X(-28) + o + (1 - pt) * -30 * u, Y(-1)], [X(-8) + o, Y(-10)], [X(-8) + o, Y(-1)]], PAL.verm, 0.7);
      split(X(20) + Co(t * 0.5) * 3 * u, Y(18) + S(t * 0.5) * 3 * u, 11 * u * e(t, 0.6, 0.6, eBack), -0.3 + 0.2 * S(t), PAL.blue, PAL.peach, 0.9);
      rect(X(-12), Y(10) + S(t * 1.5) * 1.5 * u, 4 * u, 4 * u, PAL.white, 0.8);
      disc(X(38), Y(2) + S(t) * u, 2.2 * u * e(t, 0.7, 0.4, eBack), PAL.cream, 0.9);
      split(X(-1), Y(-1), 2.4 * u * g, t, PAL.white, PAL.verm, 1);
      for (let j = 0; j < 2; j++) { const an = t * 0.42 + j * Math.PI; disc(X(0) + Co(an) * 44 * u, Y(0) + S(an) * 44 * u, 1.6 * u, [PAL.orange, PAL.cream][j], 0.8); }
      [[-44, -34], [44, -38], [-46, 30]].forEach(([x, y], i) => plus(X(x), Y(y) + S(t + i) * u, 1.8 * u, PAL.cream, 1.5, 0.9));
      fadeTags(t, 1.1);
      tag(X(0) + Co(t * 0.42) * 44 * u, Y(0) + S(t * 0.42) * 44 * u, 10 * u, -10 * u, 'ORBIT 0.42 rad/s', PAL.cream);
      tag(X(-24), Y(-12), -4 * u, -16 * u, 'Ø 68.0', PAL.cream);
      ctx.globalAlpha = 1;
    }
  };

  return [iso, room, strips, orbit];
};
