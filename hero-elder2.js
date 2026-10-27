// hero-elder2.js — 入場画面「未知の古代」のショット 1〜2（hero-elder.js の続き）
// 1) 嵐の夜のジッグラト（たいまつが下から順に灯り、稲妻のあと、空から光の柱が落ちる）　2) 石の輪（立っている石に、光る壁画がひとりでに描かれていく）
(window.OC_LOADED = window.OC_LOADED || []).push('hero-elder2');

window.OC_ELDER2 = function (E) {
  const { K, CLOUD, sprites, flame, garnish, glyph, GL } = E, { S, Co, PI, TAU, FLOOR, cl, io, range, rnd, fr, lerp3 } = K;
  const F = -2.3, BOXF = [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]];
  const tier = (hx, hz, k, h) => ({ V: [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [-hx * k, h, -hz * k], [hx * k, h, -hz * k], [hx * k, h, hz * k], [-hx * k, h, hz * k]], F: BOXF });
  const ramp = (xa, za, xb, zb, yb, w, y0) => { const L = Math.hypot(xb - xa, zb - za), s0 = (-(zb - za) / L) * w, s1 = ((xb - xa) / L) * w;
    return { V: [[xa + s0, y0, za + s1], [xa - s0, y0, za - s1], [xb - s0, yb, zb - s1], [xb + s0, yb, zb + s1], [xb + s0, y0, zb + s1], [xb - s0, y0, zb - s1]], F: [[0, 1, 2, 3], [0, 3, 4], [1, 5, 2], [3, 2, 5, 4], [0, 4, 5, 1]] }; };

  // ===== 1) ジッグラト =====
  const TI = [[2.3, 1.75, 0.58], [1.7, 1.28, 0.52], [1.2, 0.9, 0.47], [0.8, 0.6, 0.43]];
  let zy = F; const ZT = TI.map(([hx, hz, h]) => { const q = { hx, hz, h, y: zy, s: tier(hx, hz, 0.93, h) }; zy += h; return q; }), ZTOP = zy;
  const RAMPS = [ramp(0, ZT[0].hz + 1.6, 0, ZT[1].hz * 0.97, ZT[1].y, 0.22, F), ramp(-2.0, ZT[0].hz + 0.25, -0.32, ZT[0].hz * 0.95, ZT[1].y, 0.15, F), ramp(2.0, ZT[0].hz + 0.25, 0.32, ZT[0].hz * 0.95, ZT[1].y, 0.15, F)];
  const ZSEG = []; ZT.forEach((q) => { for (let x = -q.hx + 0.28; x < q.hx - 0.2; x += 0.32) [1, -1].forEach((s) => ZSEG.push([[x, q.y + 0.04, s * (q.hz * 0.985 + 0.01)], [x * 0.95, q.y + q.h - 0.04, s * (q.hz * 0.93 + 0.01)]])); });
  range(15).forEach((i) => { const z = lerp3([0, F, ZT[0].hz + 1.6], [0, ZT[1].y, ZT[1].hz * 0.97], i / 14); ZSEG.push([[-0.21, z[1] + 0.01, z[2]], [0.21, z[1] + 0.01, z[2]]]); });
  const SHR = [[0, ZTOP + 0.25, 0, 0.46, 0.25, 0.36, 0]]; range(7).forEach((i) => SHR.push([-0.42 + i * 0.14, ZTOP + 0.56, 0.32, 0.04, 0.06, 0.04, 0], [-0.42 + i * 0.14, ZTOP + 0.56, -0.32, 0.04, 0.06, 0.04, 0]));
  const TORCH = []; ZT.forEach((q) => [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([a, b]) => TORCH.push([a * q.hx * 0.93, q.y + q.h + 0.02, b * q.hz * 0.93])));
  const MOON = [-3.6, 4.4, -8];
  const ZCL = range(34).map((i) => { const low = i >= 26, a = rnd(i * 3.1) * TAU, R = low ? 3.2 + rnd(i * 5.3) * 2.4 : 5.6 + rnd(i * 5.3) * 4, c = [Co(a) * R, low ? F + 0.25 + rnd(i * 7.7) * 0.5 : F + 2.4 + rnd(i * 7.7) * 5, S(a) * R, low ? 2 + rnd(i * 2.9) * 1.3 : 2.8 + rnd(i * 2.9) * 2.4, low ? 0.45 : 0.75 + rnd(i * 4.3) * 0.25, 1];   // 下の8つは、地面をはう霧
    const d = Math.hypot(c[0] - MOON[0], c[1] - MOON[1], c[2] - MOON[2]); if (!low) c[5] = d < 3.4 ? 2 : d < 6.5 ? 1 : i % 4 ? 1 : 0; c.push(a, R); return c; });
  const RAIN = range(170).map((i) => [(rnd(i * 3) - 0.5) * 12, rnd(i * 5), (rnd(i * 7) - 0.5) * 12, 1.2 + rnd(i * 11) * 0.8]);
  const bolt = (seed) => { const a = rnd(seed) * TAU, R = 3 + rnd(seed * 3) * 3, P = [[Co(a) * R, F + 7, S(a) * R]]; for (let i = 1; i <= 12; i++) { const q = P[i - 1]; P.push([q[0] + (rnd(seed * 7 + i) - 0.5) * 0.7 - q[0] * 0.04, F + 7 - (i / 12) * 7, q[2] + (rnd(seed * 11 + i) - 0.5) * 0.7 - q[2] * 0.04]); } return P; };
  const FL = [[1.95, 0.06], [2.13, 0.05], [3.72, 0.07]], flash = (tb) => FL.reduce((s, [c, w], i) => s + (i === 1 ? 0.3 : 0.48) * Math.max(0, 1 - Math.abs(tb - c) / w), 0);

  // ===== 2) 石の輪：7つの立石。外側の面に、光る線の絵がひとりでに描かれていく =====
  const circ = (cx, cy, r, n = 16) => range(n + 1).map((i) => [cx + Co((i / n) * TAU) * r, cy + S((i / n) * TAU) * r]);
  const spir = (cx, cy, r, tn = 2.6) => range(40).map((i) => { const a = (i / 39) * tn * TAU, rr = r * (1 - i / 42); return [cx + Co(a) * rr, cy + S(a) * rr]; });
  const hand = (cx, cy, s) => [circ(cx, cy, 0.05 * s, 10)].concat([[-0.6, 0.2, -1.4, 1.0], [-0.25, 0.5, -0.5, 1.7], [0, 0.55, 0, 1.85], [0.25, 0.5, 0.5, 1.7], [0.55, 0.15, 1.2, 0.8]].map(([a, b, c, d]) => [[cx + a * 0.06 * s, cy + b * 0.06 * s], [cx + c * 0.06 * s, cy + d * 0.06 * s]]));
  const wave = (y, ph) => range(13).map((i) => [-0.2 + i / 30, y + 0.045 * S(i * 1.3 + ph)]);
  const DES = [   // 太陽・波と星・手・星のめぐり（と、数をきざむ線）・渦・文字の列・目
    [circ(0, 1.2, 0.15, 24), circ(0, 1.2, 0.09, 18), circ(0, 1.2, 0.03, 10)].concat(range(12).map((k) => { const a = (k / 12) * TAU; return [[Co(a) * 0.19, 1.2 + S(a) * 0.19], [Co(a) * 0.26, 1.2 + S(a) * 0.26]]; }), [[[-0.2, 0.72], [-0.1, 0.82], [0, 0.72], [0.1, 0.82], [0.2, 0.72]], [[-0.2, 0.56], [-0.1, 0.66], [0, 0.56], [0.1, 0.66], [0.2, 0.56]]]),
    [circ(-0.12, 1.62, 0.025, 8), circ(0.02, 1.68, 0.03, 8), circ(0.14, 1.6, 0.02, 8), wave(1.4, 0), wave(1.15, 1.5), wave(0.9, 3), wave(0.65, 4.5)],
    hand(-0.08, 1.3, 1).concat(hand(0.1, 0.95, 1.1), hand(-0.05, 0.55, 0.9)),
    [circ(0, 1.12, 0.035, 10), circ(0, 1.12, 0.1, 20), circ(0, 1.12, 0.17, 24), circ(0, 1.12, 0.24, 28)].concat([[0.1, 0.6], [0.17, 2.5], [0.24, 4.4]].map(([r, a]) => circ(Co(a) * r, 1.12 + S(a) * r, 0.022, 8)), range(5).map((k) => [[-0.16 + k * 0.06, 0.55], [-0.16 + k * 0.06, 0.75]]), [[[-0.19, 0.58], [0.1, 0.72]]]),
    [spir(0, 1.0, 0.24, 3.2), circ(0, 1.0, 0.27, 24)],
    [],
    [[[-0.22, 1.05], [-0.1, 1.17], [0.1, 1.17], [0.23, 1.05], [0.1, 0.95], [-0.1, 0.95], [-0.22, 1.05]], circ(0.0, 1.06, 0.06, 12), [[0.23, 1.05], [0.3, 1.02]], [[-0.04, 0.95], [-0.05, 0.7]], [[0.06, 0.95], [0.12, 0.78], [0.2, 0.72], [0.22, 0.8], [0.18, 0.84]], [[-0.24, 1.25], [0, 1.33], [0.26, 1.25]]]
  ];
  [11, 27, 5, 33, 18].forEach((g, k) => GL[g].L.forEach(([a, b]) => DES[5].push([[-0.08 + a[0] * 0.06, 1.55 - k * 0.24 - a[1] * 0.055], [-0.08 + b[0] * 0.06, 1.55 - k * 0.24 - b[1] * 0.055]])));
  const STN = range(7).map((k) => { const a = (k / 7) * TAU + 0.3, h = 1.75 + rnd(k * 3) * 0.45, hx = 0.31 + rnd(k * 5) * 0.06, hz = 0.13, j = (i) => (rnd(k * 9 + i) - 0.5) * 0.22;
    const segs = []; DES[k].forEach((pl) => { for (let i = 0; i < pl.length - 1; i++) segs.push([pl[i], pl[i + 1]]); });
    return { a, h, hz, V: [[-hx, 0, -hz], [hx, 0, -hz], [hx, 0, hz], [-hx, 0, hz], [-hx * 0.84, h + j(1), -hz * 0.8], [hx * 0.8, h + j(2), -hz * 0.8], [hx * 0.82, h + j(3), hz * 0.8], [-hx * 0.86, h + j(4), hz * 0.8]], segs, col: k === 6 || k === 3 ? '#8ff0ff' : '#ffb46a' }; });
  const SR = 2.35;
  const face = (s, x, y) => { const c = Co(s.a), sn = S(s.a), zz = s.hz * (1 - 0.2 * Math.min(1, y / s.h)) + 0.014; return [c * SR + sn * x + c * zz, F + y, sn * SR - c * x + sn * zz]; };

  return [
    { // 1) ジッグラト：嵐の夜。雲の海のまん中に巨大な神殿。たいまつが下の段から順に灯る。稲妻のあと、空から光の柱が神殿の頂きに落ち、光る文字の輪が浮かぶ
      name: 'ZIGGURAT', bg: '#0b1214', sel: 'so3', flash,
      cam: (tb, t) => ({ pitch: 0.12 + 0.06 * S(t * 0.4), dist: 10.6, zoom: 0.92 + 0.08 * io(cl(tb / 5)), t: [0, -0.9 + 0.55 * io(cl(tb / 5)), 0] }),
      act: (t, tb) => {
        const o = {}, bv = cl((tb - 1.95) / 0.12) * (0.85 + 0.15 * S(t * 23)), TOP = [0, ZTOP + 0.3, 0];
        o.cx0 = { p: [0, F + 4, 0], z: -40, draw: (ctx, G) => sprites(ctx, G, ZCL.map((c) => { const a = c[6] + t * 0.025; return [Co(a) * c[7], c[1], S(a) * c[7], c[3], c[4], c[5]]; }), CLOUD) };
        o.gw10 = { p: MOON, w: 0.8, c: '#ffffff', c2: '#8fb0b8', alpha: 0.8, z: -45 }; o.gw11 = { p: MOON, w: 0.34, c: '#ffffff', alpha: 1, z: -44 };
        ZT.forEach((q, i) => { o['so' + i] = { p: [0, q.y, 0], V: q.s.V, F: q.s.F, c: '#1c2629', edge: '#4f6d76', elw: 0.7 }; });
        RAMPS.forEach((r, i) => { o['so' + (4 + i)] = { p: [0, F + 0.4, ZT[0].hz + 0.6], V: r.V.map((v) => [v[0], v[1] - F - 0.4, v[2] - ZT[0].hz - 0.6]), F: r.F, c: '#202b2e', edge: '#5d7f88', elw: 0.7 }; });
        o.ln0 = { segs: ZSEG, c: '#6f939c', lw: 0.8, alpha: 0.45, zp: [0, F + 0.8, 0], z: 0.6 };
        o.cb0 = { items: SHR, pal: [['#222e31', '#161f22', '#33454a']], zp: [0, ZTOP + 0.3, 0] };
        TORCH.forEach((p, i) => { const on = cl((tb - 0.3 - Math.floor(i / 4) * 0.32) / 0.2); if (on > 0) o['gw' + i] = { p, w: on * (0.11 + 0.03 * S(t * 13 + i * 3)), c: '#ffd08a', c2: '#c0501a', alpha: 0.85 }; });   // 段のかどの、たいまつ（下の段から順に灯る）
        if (bv > 0) {   // 空から落ちる光の柱と、頂きの光
          o.bm0 = { a: [0, F + 9.5, 0], b: TOP, ra: 0.16, rb: 0.55, c: '#e6f8ff', c2: '#5d7a80', alpha: 0.7 * bv, zp: [0, ZTOP + 1.2, -0.3], z: -4 }; o.bm1 = { a: [0, F + 9.5, 0], b: TOP, ra: 0.03, rb: 0.12, c: '#ffffff', alpha: 0.85 * bv, zp: [0, ZTOP + 1.2, -0.2], z: -3.9 };
          o.gw12 = { p: [0, ZTOP + 0.45, 0], w: 0.75 * bv, c: '#ffffff', c2: '#7fd8f0', alpha: 0.8 };
          const sw = cl((tb - 1.95) / 1.1); if (sw < 1) o.ln3 = { pts: range(49).map((i) => [Co((i / 48) * TAU) * (0.3 + sw * 2.6), ZT[3].y + ZT[3].h + 0.02, S((i / 48) * TAU) * (0.3 + sw * 2.6) * 0.75]), c: '#bff2ff', lw: 2, alpha: 0.8 * (1 - sw), zp: TOP, z: 0.5 };
          o.cx1 = { p: [0, ZTOP + 1.1, 0], draw: (ctx, G) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = '#bff2ff'; ctx.fillStyle = '#bff2ff'; ctx.lineWidth = 1.3; ctx.lineCap = 'round';   // 頂きの上に浮かぶ、光る文字の輪
            for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - t * 0.5, c = G.proj([Co(a) * 1.0, ZTOP + 1.1 + 0.04 * S(t * 2 + i), S(a) * 1.0]); if (c[2] < 0.3) continue; const s = (G.f * 0.18) / c[2]; ctx.globalAlpha = bv * (0.6 + 0.35 * S(t * 3 + i)); glyph(ctx, (i * 5 + 2) % 40, c[0] - s * 0.3, c[1] - s * 0.5, s); }
            ctx.restore(); } };
        }
        o.ln2 = { segs: RAIN.map(([x, y0, z, sp]) => { const y = F + 7 - fr(y0 + t * sp * 0.8) * 8.5; return [[x, y, z], [x + 0.06, y - 0.42, z + 0.02]]; }), c: '#a9c4cc', lw: 1, alpha: 0.26, zp: [0, F + 2, 0], z: 1 };   // 雨
        const fv = flash(tb); if (fv > 0.05) o.ln1 = { pts: bolt(Math.floor(tb * 6) + 1), c: '#f2fbff', lw: 2.2, alpha: Math.min(1, fv * 2), zp: [0, F + 3, 0], z: -6 };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#0a1012', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#8fb8c0', '#4f6d76', '#05090a', 1);
        return o;
      }
    },
    { // 2) 石の輪：火を囲む7つの立石。カメラが回ると、外側の面の壁画が順に現れ、光る線でひとりでに描かれていく。火の上には「目」
      name: 'PETROGLYPH', bg: '#0b0908', sel: 'so13',
      cam: (tb, t) => ({ pitch: 0.2 + 0.05 * S(t * 0.4), dist: 9.6, zoom: 1.12, t: [0, F + 1.15, 0] }),
      act: (t, tb) => {
        const o = {};
        STN.forEach((s, k) => {
          o['so' + (10 + k)] = { p: [Co(s.a) * SR, F, S(s.a) * SR], r: [0, PI / 2 - s.a, 0], V: s.V, F: BOXF, c: '#2a2420', edge: '#4e4036', elw: 0.7 };
          const p = cl((tb - 0.25 - k * 0.4) / 1.3), n = p * s.segs.length, m = Math.floor(n); if (p <= 0) return;
          const segs = s.segs.slice(0, m).map(([a, b]) => [face(s, a[0], a[1]), face(s, b[0], b[1])]);
          if (m < s.segs.length) { const [a, b] = s.segs[m], f = n - m; segs.push([face(s, a[0], a[1]), face(s, a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f)]); }
          const zp = face(s, 0, s.h * 0.55), pl = p >= 1 ? 0.75 + 0.25 * S(t * 3 + k) : 1;
          o['ln' + (10 + k)] = { segs, c: s.col, lw: 7, alpha: 0.22 * pl, cap: 'round', zp, z: 0.02 }; o['ln' + (20 + k)] = { segs, c: '#fff4e0', lw: 1.6, alpha: 0.95 * pl, cap: 'round', zp, z: 0.03 };
        });
        o.gw0 = { p: [0, F + 0.35, 0], w: 0.9 + 0.06 * S(t * 9), c: '#ffd08a', c2: '#a03a10', alpha: 0.75 }; o.gw1 = { p: [0, F + 0.3, 0], w: 0.4, c: '#ffffff', c2: '#ffb46a', alpha: 0.9 };
        o.cx2 = { p: [0, F + 0.1, 0], draw: (ctx, G) => { range(5).forEach((i) => { const a = (i / 5) * TAU + 0.4; flame(ctx, G, [Co(a) * 0.12, F + 0.05, S(a) * 0.12], 0.26 + 0.05 * (i % 2), t, i); }); flame(ctx, G, [0, F + 0.05, 0], 0.42, t, 9); } };
        o.cb0 = { items: range(14).map((i) => { const a = (i / 14) * TAU; return [Co(a) * 0.5, F + 0.06, S(a) * 0.5, 0.07, 0.06, 0.06, 0, -a, 0]; }), pal: [['#2a2420', '#1d1814', '#3a322a']], zp: [0, F, 0] };
        const ey = [0, F + 2.1 + 0.08 * S(t * 1.2), 0], open = cl((tb - 1.2) / 0.6);   // 火の上の「目」
        o.cx3 = { p: ey, draw: (ctx, G) => { const c = G.proj(ey); if (c[2] < 0.3) return; const k = G.f / c[2], w = 0.42 * k, h = 0.2 * k * open;
          ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(143,240,255,.9)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(c[0] - w, c[1]); ctx.quadraticCurveTo(c[0], c[1] - h * 2, c[0] + w, c[1]); ctx.quadraticCurveTo(c[0], c[1] + h * 2, c[0] - w, c[1]); ctx.stroke();
          const g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], 0.13 * k); g.addColorStop(0, 'rgba(255,255,255,' + open + ')'); g.addColorStop(0.5, 'rgba(120,230,255,' + 0.8 * open + ')'); g.addColorStop(1, 'rgba(40,120,160,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c[0] + 0.04 * k * S(t * 0.9), c[1], 0.13 * k, 0, TAU); ctx.fill();
          range(12).forEach((i) => { const a = (i / 12) * TAU + t * 0.2; ctx.globalAlpha = 0.35 * open; ctx.beginPath(); ctx.moveTo(c[0] + Co(a) * w * 1.2, c[1] + S(a) * w * 0.6); ctx.lineTo(c[0] + Co(a) * w * 1.6, c[1] + S(a) * w * 0.8); ctx.stroke(); }); ctx.restore(); } };
        o.gw2 = { p: ey, w: 0.9 * open, c: '#8ff0ff', c2: '#1a4a60', alpha: 0.45 };
        o.fl19 = { p: [0, F - 0.01, 0], r: FLOOR, shape: 'circle', w: 4.8, c: '#100c0a', alpha: 0.9, z: -60 };
        garnish(o, t, F, '#ffb46a', '#6a4a30', '#ffb46a', 1.4);
        return o;
      }
    }
  ];
};
