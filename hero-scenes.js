// hero-scenes.js — 入場画面の場面 1〜4。色や形を変えたいときは、ここを直します
// （場面 5〜8 は hero-scenes2.js にあります）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function (G, T) {
  const { ctx, PAL, TAU, rad, clamp01, e, eBack } = G;
  const S = Math.sin, Co = Math.cos;
  const { disc, ring, arc, ell, rect, split, pie, fan, hair, star8, plus, tri, ticks, squiggle, bars, dots, grid, hatch, halftone, label, tag, blob } = T;
  const deg = (r) => String(Math.round(((r * 180 / Math.PI) % 360 + 360) % 360)).padStart(3, '0');
  const fadeTags = (t, d) => { ctx.globalAlpha = e(t, d, 0.5); };

  // 1) 階段のように積み重なる四角
  const stairs = {
    name: 'STAIRS', bg: PAL.cream, ink: PAL.navy, lead: PAL.orange, acc: [PAL.teal, PAL.orange, PAL.verm, PAL.navy],
    draw(t, c) {
      const { u, X, Y } = c, ink = 'rgba(20,27,58,';
      grid(14 * u, ink + '.07)', -t * 8, 'v');
      ring(X(8), Y(0), 46 * u, ink + '.14)', 1, 0.1, [2, 7], -t * 12);
      ring(X(8), Y(0), 39 * u, ink + '.1)', 1, 0.1);
      ticks(X(8), Y(0), 46 * u, 90, 2, t * 0.08, ink + '.3)', 0.1, 10);
      const hx = X(-46), hy = Y(-38);
      hatch([[hx, hy], [hx + 18 * u, hy], [hx + 18 * u, hy + 7 * u], [hx, hy + 7 * u]], 5, t * 14, ink + '.55)', 1, 0.3);
      const B = [
        { c: 'teal', x: -30, y: -10, w: 52, h: 13, dir: -1, dl: 0, z: 0.4, sub: ['orange', 9.5, 14, 3.5], stripe: 1 },
        { c: 'orange', x: 22, y: -24, w: 44, h: 14, dir: 1, dl: 0.15, z: 0.8, disk: [38, 7, 5.5, 'white', 'verm'] },
        { c: 'navy', x: -46, y: 6, w: 28, h: 16, dir: -1, dl: 0.3, z: 0.6, disk: [6, 7.5, 3.3, 'teal', 'white'], stripe: 1 },
        { c: 'verm', x: -43, y: 22, w: 36, h: 8, dir: 1, dl: 0.45, z: 0.9, disk: [34, 4, 5.2, 'orange', 'verm'] }
      ];
      const pos = B.map((b, i) => {
        const p = e(t, b.dl, 0.8, eBack), slide = S(t * 0.8 + i * 1.7) * 2.6 * u, bx = X(b.x) + b.dir * 90 * u * (1 - p) + slide, by = Y(b.y), w = b.w * u * (1 + 0.04 * S(t * 1.3 + i));
        rect(bx, by, w, b.h * u, PAL[b.c], b.z);
        if (b.sub) rect(bx, by + b.sub[1] * u, b.sub[2] * u * (0.6 + 0.4 * S(t * 1.8 + i) ** 2), b.sub[3] * u, PAL[b.sub[0]], b.z);
        if (b.stripe) rect(bx + ((t * 16 * u) % w), by, 0.7 * u, b.h * u, 'rgba(255,250,244,.5)', b.z);
        if (b.disk) split(bx + b.disk[0] * u, by + b.disk[1] * u, b.disk[2] * u * e(t, b.dl + 0.6, 0.5, eBack), t * (0.8 + i * 0.3) + i, PAL[b.disk[3]], PAL[b.disk[4]], b.z);
        return [bx, by, w];
      });
      const ph = e(t, 0.9, 0.7), hx2 = pos[0][0] + pos[0][2];
      hair(hx2, Y(-3.5), 30 * u * ph * (0.88 + 0.12 * S(t * 1.6)), 14, rad(32 + 12 * S(t * 1.1)), 0, ink + '.85)', 0.5);
      hair(hx2, Y(-3.5), 9 * u * ph, 10, rad(40), Math.PI, ink + '.85)', 0.5);
      const pt = e(t, 0.5, 0.5, eBack), dy = S(t * 2) * 1.5 * u;
      disc(X(-8), Y(-30) + dy, 3.2 * u * pt, PAL.teal, 1); disc(X(-8), Y(-30) + dy, 0.6 * u * pt, PAL.cream, 1);
      for (let j = 0; j < 3; j++) { const a = t * 1.4 + j * 2.1; disc(X(-8) + Co(a) * 6.5 * u, Y(-30) + dy + S(a) * 6.5 * u * 0.5, 0.7 * u * pt, [PAL.verm, PAL.navy, PAL.orange][j], 1); }
      bars(X(24), Y(40), 7, 1.6 * u, 10 * u * e(t, 0.8, 0.5), t, PAL.navy, 0.7);
      squiggle(X(-48), Y(40), 44 * u * e(t, 0.7, 0.8), 1.4 * u, 3, t * 3, PAL.verm, 1.5, 0.6);
      [[-52, -8], [50, -40], [42, 18], [-20, 34]].forEach(([x, y], i) => plus(X(x), Y(y) + S(t * 1.5 + i) * u, 1.8 * u, PAL.navy, 1.5, 0.9));
      fadeTags(t, 1.1);
      tag(pos[0][0] + 6 * u, pos[0][1], -4 * u, -12 * u, `BAR_A  ${Math.round(pos[0][2] / u)}×13`, PAL.navy);
      tag(pos[1][0] + 38 * u, pos[1][1] + 7 * u, 8 * u, -12 * u, `ROT ${deg(t * 1.1 + 1)}°`, PAL.navy);
      tag(pos[3][0] + 20 * u, pos[3][1] + 8 * u, 6 * u, 9 * u, 'STEP 04 / 04', PAL.navy);
      ctx.globalAlpha = 1;
    }
  };

  // 2) 回るコインと、重なった円盤
  const coins = {
    name: 'COINS', bg: PAL.teal, ink: PAL.cream, lead: PAL.navy, acc: [PAL.cream, PAL.orange, PAL.verm, PAL.navy],
    draw(t, c) {
      const { u, X, Y } = c, cr = 'rgba(255,250,244,';
      for (let k = 0; k < 6; k++) { const p = (t * 0.22 + k / 6) % 1; ell(X(0), Y(14), 64 * u * p, 22 * u * p, 0, cr + (0.4 * (1 - p)).toFixed(3) + ')', 0.1, 1); }
      ell(X(0), Y(14), 42 * u, 15 * u, 0, 'rgba(20,27,58,.35)', 0.2, 1);
      for (let j = 0; j < 4; j++) { const a = t * 0.9 + j * 1.57; disc(X(0) + Co(a) * 42 * u, Y(14) + S(a) * 15 * u, 1.2 * u, [PAL.cream, PAL.orange, PAL.verm, PAL.navy][j], 0.3); }
      hatch([[X(-10), Y(-42)], [X(22), Y(-36)], [X(22), Y(-30)], [X(-10), Y(-36)]], 4, t * 10, 'rgba(20,27,58,.45)', 1, 0.3);
      ['orange', 'white', 'verm'].forEach((cn, i) => {
        const p = e(t, i * 0.12, 0.9, eBack), spin = t * 2.2 + i * 0.6, rx = (1 + 3.4 * Math.abs(Co(spin))) * u;
        ell(X(-3 + i * 3.4), Y(-16) - (1 - p) * 60 * u + S(t * 1.6 + i) * 1.2 * u, rx, 10.5 * u, 0.14, PAL[cn], 0.6 + i * 0.1);
      });
      hair(X(9), Y(-26), 12 * u * e(t, 0.6, 0.6), 9, rad(60), -0.6 + 0.25 * S(t * 1.2), cr + '.7)', 0.7);
      const pd = e(t, 0.3, 0.9, eBack), lx = X(-19) - (1 - pd) * 60 * u, by = S(t * 1.2) * u;
      ell(lx, Y(14.5) + by, 11 * u, 5 * u, 0, PAL.navy, 0.5); ell(lx, Y(12.5) + by, 11 * u, 5 * u, 0, PAL.verm, 0.5);
      ell(lx, Y(11) + by, 11 * u, 5 * u, 0, PAL.orange, 0.5); ell(lx, Y(9.4) + by, 11 * u, 5 * u, 0, PAL.white, 0.5);
      ell(lx, Y(9.4) + by, 6 * u * Math.abs(Co(t * 1.3)) + 0.5, 2.4 * u, 0, PAL.navy, 0.5, 1.2);
      star8(X(2), Y(19), 6 * u * e(t, 0.5, 0.6, eBack), t * 1.2, PAL.cream, 0.9);
      const sx = Math.abs(Co(t * 1.4)) * 0.9 + 0.1, pt = e(t, 0.6, 0.7, eBack);
      tri(X(1.4), Y(30.6), 7 * u * pt, 0, PAL.orange, 0.7, sx); tri(X(1), Y(30), 7 * u * pt, 0, PAL.navy, 0.7, sx); tri(X(0.6), Y(29.4), 7 * u * pt, 0, PAL.cream, 0.7, sx);
      [[-8, 1, 1.1, 'orange'], [-5.2, 3.6, 0.9, 'cream'], [11, -4, 1.3, 'cream'], [14, 6, 0.8, 'orange'], [24, -14, 1, 'verm'], [-28, -6, 1.2, 'cream']]
        .forEach(([x, y, r, cn], i) => disc(X(x), Y(y) + S(t * 2 + i) * 0.9 * u, r * u * e(t, 0.7 + i * 0.08, 0.4, eBack), PAL[cn], 1));
      squiggle(X(26), Y(26), 18 * u, 1.2 * u, 2, t * 4, PAL.cream, 1.5, 0.8);
      [[-40, -20], [36, -30], [-34, 30]].forEach(([x, y], i) => plus(X(x), Y(y) + S(t + i) * u, 1.8 * u, PAL.navy, 1.5, 0.9));
      fadeTags(t, 1.1);
      tag(X(4), Y(-24), 9 * u, -10 * u, `SPIN ${Math.round(220 + 30 * S(t * 2))}°/s`, PAL.cream);
      tag(lx - 8 * u, Y(11) + by, -6 * u, 9 * u, 'LAYER ×4', PAL.cream);
      tag(X(2), Y(30), 10 * u, 6 * u, `FLIP ${Math.round(sx * 100)}%`, PAL.cream);
      ctx.globalAlpha = 1;
    }
  };

  // 3) 回る円グラフ（点と斜線の背景）
  const chart = {
    name: 'PIE CHART', bg: PAL.navy, ink: PAL.cream, lead: PAL.orange, acc: [PAL.orange, PAL.teal, PAL.verm, PAL.cream],
    draw(t, c) {
      const { u, X, Y, W, H, FH } = c;
      dots('rgba(250,140,20,.9)', 6.2 * u, 0.42 * u, t * 6, t * 3, -0.3);
      hatch([[-W * 0.3, -H * 0.3], [W * 0.62, -H * 0.3], [-W * 0.3, FH * 0.75]], 7, t * 14, 'rgba(232,80,30,.9)', 2.2, -0.2);
      ticks(X(3), Y(0), 31 * u, 72, 1.3 * u, t * 0.2, 'rgba(255,250,244,.55)', 0.4, 6);
      arc(X(3), Y(0), 35 * u, t * 0.9, t * 0.9 + 1.4, PAL.verm, 2.5, 0.45);
      arc(X(3), Y(0), 38 * u, -t * 0.6, -t * 0.6 + 0.9, PAL.cream, 1, 0.45);
      const k = (i) => eBack(clamp01((t - i * 0.1) / 0.7)) * (1 + 0.07 * S(t * 2 + i * 1.3));
      const F = [0.22, 0.2, 0.28, 0.16, 0.14], col = [PAL.verm, PAL.white, PAL.teal, PAL.orange, PAL.navy2], rot = t * 0.5;
      pie(X(3), Y(0), 25 * u, F.map((f, i) => [f, col[i], k(i)]), rot, 0.5);
      pie(X(3), Y(0), 8.5 * u, [[0.5, PAL.white, k(2)], [0.3, PAL.orange, k(3)], [0.2, PAL.verm, k(4)]], -t * 0.9, 0.6);
      for (let j = 0; j < 3; j++) { const a = -t * 0.6 + j * 2.1; disc(X(3) + Co(a) * 42 * u, Y(0) + S(a) * 42 * u, (1.3 + j * 0.4) * u * e(t, 0.6, 0.5, eBack), [PAL.cream, PAL.orange, PAL.teal][j], 0.8); }
      fadeTags(t, 0.9); let acc0 = rot;
      F.forEach((f, i) => { const a = acc0 + f * Math.PI, r = 29 * u; acc0 += f * TAU; label(Math.round((f + 0.015 * S(t * 1.5 + i)) * 100) + '%', X(3) + Co(a) * r, Y(0) + S(a) * r, PAL.cream, 8, 'center', 0.6); });
      ctx.globalAlpha = 1;
      rect(X(-48), Y(34), 22 * u, 0.6 * u, PAL.cream, 0.7);
      bars(X(-47), Y(34), 7, 1.7 * u, 9 * u * e(t, 0.7, 0.5), t, PAL.orange, 0.7);
      star8(X(-26), Y(24), 4 * u * e(t, 0.8, 0.5, eBack), t * 1.5, PAL.white, 1);
      [[40, -36], [44, 26], [-46, -20]].forEach(([x, y], i) => plus(X(x), Y(y), 1.8 * u, PAL.cream, 1.5, 0.9 - i * 0.1));
      fadeTags(t, 1.2);
      tag(X(3) + 25 * u * Co(rot + 0.9), Y(0) + 25 * u * S(rot + 0.9), 10 * u, -14 * u, `DATA_03  ${deg(rot)}°`, PAL.cream);
      ctx.globalAlpha = 1;
    }
  };

  // 4) 開いたり閉じたりする扇
  const fanScene = {
    name: 'FAN', bg: PAL.cream, ink: PAL.navy, lead: PAL.teal, acc: [PAL.verm, PAL.teal, PAL.orange, PAL.navy],
    draw(t, c) {
      const { u, X, Y } = c, ink = 'rgba(20,27,58,';
      halftone(X(4), Y(-8), 64 * u, 56 * u, 4.6 * u, ink + '.13)', (a, b) => clamp01((a + b) * 0.7 - 0.35 + 0.18 * S(t * 1.4 + a * 5 - b * 3)), 0.1);
      ring(X(0), Y(8), 52 * u, ink + '.25)', 1, 0.3, [3, 6], t * 20);
      ticks(X(0), Y(8), 55 * u, 60, 1.5 * u, -t * 0.1, ink + '.3)', 0.3, 5);
      const base = [[22, 46, 'verm'], [16, 40, 'teal'], [18, 44, 'orange'], [14, 38, 'navy'], [16, 48, 'teal']], br = 1 + 0.14 * S(t * 0.9);
      const secs = base.map(([d, r, cn], i) => { const p = e(t, i * 0.08, 0.8, eBack); return [rad(d) * br * Math.max(0, p), r * u * Math.max(0, p) * (1 + 0.04 * S(t * 1.7 + i)), PAL[cn]]; });
      const used = secs.reduce((a, s) => a + s[0], 0), sway = S(t * 1.3) * 0.06;
      fan(X(0), Y(8), secs, -Math.PI / 2 - used / 2 + sway, 0.4);
      ring(X(0), Y(8), 2.2 * u, PAL.navy, 1.5, 0.5);
      const pb = e(t, 0.3, 1, eBack);
      blob(X(28), Y(36), 26 * u * pb, t, PAL.teal, 0.7, 4, 0.1);
      const rx = -26 + S(t * 0.6) * 7;
      split(X(rx), Y(14), 7.2 * u * e(t, 0.4, 0.7, eBack), rad(-40) + rx * 0.3, PAL.orange, PAL.navy, 0.8);
      const step = Math.floor(t * 2.5);
      for (let n = 0; n < 6; n++) if ((step + n * 3) % 4) rect(X(14 + (n % 3) * 4.6), Y(1 + Math.floor(n / 3) * 4.6), 4 * u * e(t, 0.6 + n * 0.05, 0.4), 4 * u * e(t, 0.6 + n * 0.05, 0.4), n % 2 ? PAL.teal : PAL.verm, 1);
      squiggle(X(-50), Y(-38), 30 * u, 1.2 * u, 3, -t * 3, PAL.navy, 1.4, 0.6);
      [[-46, 34], [44, -36], [-10, -48]].forEach(([x, y], i) => plus(X(x), Y(y) + S(t * 1.3 + i) * u, 1.8 * u, PAL.navy, 1.5, 0.9));
      fadeTags(t, 1.1);
      const ea = -Math.PI / 2 + used / 2 + sway;
      tag(X(0) + Co(ea) * 40 * u, Y(8) + S(ea) * 40 * u, 8 * u, -6 * u, `ANGLE ${Math.round(used * 180 / Math.PI)}°`, PAL.navy);
      tag(X(rx), Y(14), 4 * u, 14 * u, `ROLL ${rx.toFixed(1)}`, PAL.navy);
      tag(X(20), Y(30), -6 * u, 12 * u, 'BLOB_04', PAL.navy);
      ctx.globalAlpha = 1;
    }
  };

  return [stairs, coins, chart, fanScene];
};
