// hero-parts4.js — 入場画面の「3Dの部品」のさらに追加分（「古代」のバージョンで使います）
// 本物の多面体・たくさんの立方体・たくさんのタイル・光・光の柱・リボン・ちり・影。hero-parts.js の次に読み込みます。
// どれも「たくさんを、まとめて速く描く」ための部品です。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts4');

window.OC_HERO_PARTS4 = function (G, T) {
  const ctx = G.ctx, TAU = Math.PI * 2;
  const { basis, W3, col, shade, LIGHT } = T;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  const vis = (P) => P.every((q) => q[2] > 0.3);
  const al = (o) => (o.alpha === undefined ? 1 : o.alpha) * Math.min(1, o.s);
  const poly = (P) => { ctx.moveTo(P[0][0], P[0][1]); for (let i = 1; i < P.length; i++) ctx.lineTo(P[i][0], P[i][1]); ctx.closePath(); };
  // 色の明るさを8段階にして、作った色をとっておく（毎回作らないので速い）
  const SH = new Map();
  const tone = (c, k) => { const q = Math.round(k * 12) / 12, key = c + '|' + q; let v = SH.get(key); if (!v) { v = shade(col(c), q); SH.set(key, v); } return v; };
  const rgba = (c, a) => { const h = col(c); if (h[0] !== '#') return h; const n = parseInt(h.slice(1), 16); return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`; };

  // ---------- 1) 多面体（V：頂点、F：面（頂点の番号）、c / fc：色、edge：ふちの色、ex：面をばらす量、two：裏も描く） ----------
  function solid(o) {
    const B = basis(o.r), V = o.V.map((v) => W3(o, B, v[0], v[1], v[2])), cam = G.camPos, ex = (o.ex || 0) * o.s, faces = [];
    const cen = [0, 0, 0]; V.forEach((v) => { cen[0] += v[0] / V.length; cen[1] += v[1] / V.length; cen[2] += v[2] / V.length; });
    o.F.forEach((f, i) => {
      const c = [0, 0, 0]; f.forEach((k) => { c[0] += V[k][0] / f.length; c[1] += V[k][1] / f.length; c[2] += V[k][2] / f.length; });
      let n = norm(cross(sub(V[f[1]], V[f[0]]), sub(V[f[2]], V[f[0]]))); if (dot(n, sub(c, cen)) < 0) n = [-n[0], -n[1], -n[2]];
      const off = ex ? [n[0] * ex, n[1] * ex, n[2] * ex] : null, cc = off ? add(c, off) : c, front = dot(n, sub(cam, cc)) > 0;
      if (!front && !o.two) return;
      const d = sub(cc, cam); faces.push({ f, n, off, front, i, d: dot(d, d) - (front ? 0 : 1e-3) });
    });
    faces.sort((a, b) => b.d - a.d);
    const A = al(o);
    faces.forEach(({ f, n, off, front, i }) => {
      const P = f.map((k) => G.proj(off ? add(V[k], off) : V[k])); if (!vis(P)) return;
      const base = o.fc ? o.fc[i % o.fc.length] : o.c, lt = 0.62 + 0.5 * Math.max(0, dot(n, LIGHT));
      ctx.globalAlpha = A * (front ? 1 : 0.55); ctx.beginPath(); poly(P);
      if (!o.wire) { ctx.fillStyle = tone(base, front ? lt : lt * 0.55); ctx.fill(); }
      if (o.edge) { ctx.strokeStyle = col(o.edge); ctx.lineWidth = o.elw || 1; ctx.lineJoin = 'round'; ctx.stroke(); }
    });
    ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
  }

  // ---------- 2) たくさんの立方体（items：[x, y, z, 横の半分, 高さの半分, 奥の半分, 色の番号, 横の回転, 縦の回転, 層]、pal：[[表, 横, 上]…]） ----------
  const CN = [[0, 0, 1], [0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]], CK = [0, 0, 1, 1, 2, 2];
  function cubes(o) {
    const cam = G.camPos, L = o.items, k = Math.min(1, o.s), order = [];
    for (let i = 0; i < L.length; i++) { const it = L[i], dx = it[0] - cam[0], dy = it[1] - cam[1], dz = it[2] - cam[2]; order.push([dx * dx + dy * dy + dz * dz, i, it[9] || 0]); }
    order.sort((a, b) => a[2] - b[2] || b[0] - a[0]);   // 10番目の数（層）が小さい順に、同じ層では奥から
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.lineJoin = 'round';
    const P = new Array(8), lw = o.elw || 0.8;
    if (o.edge) { ctx.strokeStyle = col(o.edge); ctx.lineWidth = lw; }
    order.forEach(([, i]) => {
      const it = L[i], hx = it[3] * k, hy = it[4] * k, hz = it[5] * k, pal = o.pal[it[6] % o.pal.length], ry = it[7] || 0, rx = it[8] || 0;
      if (hx < 0.002 || hy < 0.002) return;
      const cy = Math.cos(ry), sy = Math.sin(ry), cx = Math.cos(rx), sx = Math.sin(rx), rot = ry || rx;
      const tr = (x, y, z) => { if (!rot) return [it[0] + x, it[1] + y, it[2] + z]; const y1 = y * cx - z * sx, z1 = y * sx + z * cx; return [it[0] + x * cy + z1 * sy, it[1] + y1, it[2] - x * sy + z1 * cy]; };
      let n = 0; for (const z of [1, -1]) { P[n++] = G.proj(tr(-hx, -hy, hz * z)); P[n++] = G.proj(tr(hx, -hy, hz * z)); P[n++] = G.proj(tr(hx, hy, hz * z)); P[n++] = G.proj(tr(-hx, hy, hz * z)); }
      for (let q = 0; q < 8; q++) if (P[q][2] < 0.3) return;
      // 頂点の番号：0〜3 が手前（z+）、4〜7 が奥（z−）。4〜7 は 0〜3 と同じ並び
      for (let fI = 0; fI < 6; fI++) {
        const nl = CN[fI], nw = rot ? sub(tr(nl[0], nl[1], nl[2]), tr(0, 0, 0)) : nl;
        const fc = [it[0] + nw[0] * (fI < 2 ? hz : fI < 4 ? hx : hy), it[1] + nw[1] * (fI < 2 ? hz : fI < 4 ? hx : hy), it[2] + nw[2] * (fI < 2 ? hz : fI < 4 ? hx : hy)];
        if (dot(nw, sub(cam, fc)) <= 0) continue;
        const f = fI === 0 ? [0, 1, 2, 3] : fI === 1 ? [5, 4, 7, 6] : fI === 2 ? [1, 5, 6, 2] : fI === 3 ? [4, 0, 3, 7] : fI === 4 ? [3, 2, 6, 7] : [4, 5, 1, 0];
        ctx.beginPath(); ctx.moveTo(P[f[0]][0], P[f[0]][1]); ctx.lineTo(P[f[1]][0], P[f[1]][1]); ctx.lineTo(P[f[2]][0], P[f[2]][1]); ctx.lineTo(P[f[3]][0], P[f[3]][1]); ctx.closePath();
        ctx.fillStyle = tone(pal[CK[fI]] || pal[0], 0.72 + 0.32 * Math.max(0, dot(nw, LIGHT))); ctx.fill();
        if (o.edge) ctx.stroke();
      }
    });
    ctx.globalAlpha = 1; ctx.lineJoin = 'miter';
  }

  // ---------- 3) たくさんのタイル（モザイク）。items：[x, y, z, 表の色, 裏の色, めくれる角度, 回転]、U / V：面の向き、h：半分の大きさ ----------
  // 同じ色のタイルは、まとめて1回で塗る（何千枚でも軽い）
  function tiles(o) {
    const U = o.U || [1, 0, 0], V = o.V || [0, 0, -1], N = cross(U, V), cam = G.camPos, h0 = (o.h || 0.05) * Math.min(1, o.s), L = o.items, groups = new Map();
    const pf = o.pal, pb = o.back || o.pal;
    for (let i = 0; i < L.length; i++) {
      const it = L[i], f = it[5] || 0, sp = it[6] || 0, h = h0 * (it[7] === undefined ? 1 : it[7]); if (h < 0.002) continue;
      const cs = Math.cos(sp), ss = Math.sin(sp), cf = Math.cos(f), sf = Math.sin(f);
      const u = [U[0] * cs + V[0] * ss, U[1] * cs + V[1] * ss, U[2] * cs + V[2] * ss], v0 = [V[0] * cs - U[0] * ss, V[1] * cs - U[1] * ss, V[2] * cs - U[2] * ss];
      const v = [v0[0] * cf + N[0] * sf, v0[1] * cf + N[1] * sf, v0[2] * cf + N[2] * sf], nn = [N[0] * cf - v0[0] * sf, N[1] * cf - v0[1] * sf, N[2] * cf - v0[2] * sf];
      const c = [it[0], it[1], it[2]], facing = dot(nn, sub(cam, c)) > 0, cc = facing ? pf[it[3] % pf.length] : pb[it[4] % pb.length];
      const lt = 0.66 + 0.4 * Math.abs(dot(nn, LIGHT)), key = tone(cc, lt);
      const q = [G.proj([c[0] + (u[0] + v[0]) * h, c[1] + (u[1] + v[1]) * h, c[2] + (u[2] + v[2]) * h]), G.proj([c[0] + (u[0] - v[0]) * h, c[1] + (u[1] - v[1]) * h, c[2] + (u[2] - v[2]) * h]),
        G.proj([c[0] - (u[0] + v[0]) * h, c[1] - (u[1] + v[1]) * h, c[2] - (u[2] + v[2]) * h]), G.proj([c[0] - (u[0] - v[0]) * h, c[1] - (u[1] - v[1]) * h, c[2] - (u[2] - v[2]) * h])];
      if (q[0][2] < 0.3 || q[2][2] < 0.3) continue;
      let g = groups.get(key); if (!g) { g = []; groups.set(key, g); } g.push(q);
    }
    ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    groups.forEach((list, key) => { ctx.beginPath(); list.forEach(poly); ctx.fillStyle = key; ctx.fill(); });
    ctx.globalAlpha = 1;
  }

  // ---------- 4) 光（w：半径、c：まん中の色、c2：まわりの色、rays：光の筋の数、rl：筋の長さ、rw：筋の太さ、ra：筋の向き） ----------
  function glow(o) {
    const c = G.proj(o.p); if (c[2] < 0.3) return;
    const R = (G.f * o.s * o.w) / c[2]; if (R < 1) return;
    ctx.save(); ctx.globalCompositeOperation = o.mode || 'lighter'; ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha;
    const RR = o.rays ? R * (o.rl || 2.2) : R, g = ctx.createRadialGradient(c[0], c[1], 0, c[0], c[1], RR), k = R / RR;
    g.addColorStop(0, rgba(o.c || 'white', 1)); g.addColorStop(0.2 * k, rgba(o.c || 'white', 0.85)); g.addColorStop(0.5 * k, rgba(o.c2 || o.c || 'white', 0.35)); g.addColorStop(Math.min(1, k), rgba(o.c2 || o.c || 'white', o.rays ? 0.12 : 0)); g.addColorStop(1, rgba(o.c2 || o.c || 'white', 0));
    ctx.fillStyle = g; ctx.beginPath();
    if (o.rays) {   // 光の筋（太陽の絵のような、細い三角形）
      ctx.arc(c[0], c[1], R * 0.5, 0, TAU);
      const n = o.rays, w = o.rw || 0.06, a0 = o.ra || 0;
      for (let i = 0; i < n; i++) { const a = a0 + (i / n) * TAU; ctx.moveTo(c[0] + Math.cos(a - w) * R * 0.3, c[1] + Math.sin(a - w) * R * 0.3); ctx.lineTo(c[0] + Math.cos(a) * RR, c[1] + Math.sin(a) * RR); ctx.lineTo(c[0] + Math.cos(a + w) * R * 0.3, c[1] + Math.sin(a + w) * R * 0.3); ctx.closePath(); }
      ctx.fill('nonzero'); ctx.beginPath(); ctx.arc(c[0], c[1], R, 0, TAU); ctx.globalAlpha *= 0.8;
    } else ctx.arc(c[0], c[1], R, 0, TAU);
    ctx.fill(); ctx.restore();
  }

  // ---------- 5) 光の柱（a から b へ。ra / rb：太さ、c：色） ----------
  function beam(o) {
    const pa = G.proj(o.a), pb = G.proj(o.b); if (pa[2] < 0.3 || pb[2] < 0.3) return;
    const dx = pb[0] - pa[0], dy = pb[1] - pa[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const wa = (G.f * (o.ra || 0.1) * Math.min(1, o.s)) / pa[2], wb = (G.f * (o.rb || 0.3) * Math.min(1, o.s)) / pb[2];
    ctx.save(); ctx.globalCompositeOperation = o.mode || 'lighter';
    [[1, 0.35], [0.38, 0.9]].forEach(([k, a]) => {
      const g = ctx.createLinearGradient(pa[0], pa[1], pb[0], pb[1]); g.addColorStop(0, rgba(o.c || 'white', a)); g.addColorStop(0.6, rgba(o.c2 || o.c || 'white', a * 0.45)); g.addColorStop(1, rgba(o.c2 || o.c || 'white', 0));
      ctx.globalAlpha = o.alpha === undefined ? 1 : o.alpha; ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(pa[0] + nx * wa * k, pa[1] + ny * wa * k); ctx.lineTo(pb[0] + nx * wb * k, pb[1] + ny * wb * k); ctx.lineTo(pb[0] - nx * wb * k, pb[1] - ny * wb * k); ctx.lineTo(pa[0] - nx * wa * k, pa[1] - ny * wa * k); ctx.closePath(); ctx.fill();
    });
    ctx.restore();
  }

  // ---------- 6) リボン（pts：通る点、w：半分の幅、cs：色（長さにそって順に）、tw：ねじれ、face：いつもカメラの方を向く） ----------
  function ribbon(o) {
    const P = o.pts, n = P.length; if (n < 2) return;
    const cam = G.camPos, w = (o.w || 0.05) * Math.min(1, o.s), up = o.up || [0, 1, 0], tw = o.tw || 0, segs = [], E = [];
    for (let i = 0; i < n; i++) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)], t = norm(sub(b, a));
      let s = o.face ? norm(cross(t, sub(P[i], cam))) : norm(cross(t, Math.abs(dot(t, up)) > 0.98 ? [1, 0, 0] : up));
      if (tw) { const th = tw * i + (o.tw0 || 0), c = Math.cos(th), sn = Math.sin(th), tx = cross(t, s); s = [s[0] * c + tx[0] * sn, s[1] * c + tx[1] * sn, s[2] * c + tx[2] * sn]; }
      const wi = w * (o.taper ? Math.min(1, (i / (n - 1)) * 3, ((n - 1 - i) / (n - 1)) * 6 + 0.15) : 1);
      E.push([G.proj([P[i][0] + s[0] * wi, P[i][1] + s[1] * wi, P[i][2] + s[2] * wi]), G.proj([P[i][0] - s[0] * wi, P[i][1] - s[1] * wi, P[i][2] - s[2] * wi]), cross(t, s)]);
    }
    for (let i = 0; i < n - 1; i++) { const m = sub([(P[i][0] + P[i + 1][0]) / 2, (P[i][1] + P[i + 1][1]) / 2, (P[i][2] + P[i + 1][2]) / 2], cam); segs.push([dot(m, m), i]); }
    if (!o.face) segs.sort((a, b) => b[0] - a[0]);
    const cs = o.cs || [o.c || 'verm'], A = al(o);
    ctx.globalAlpha = A;
    segs.forEach(([, i]) => {
      const e0 = E[i], e1 = E[i + 1]; if (e0[0][2] < 0.3 || e1[0][2] < 0.3 || e0[1][2] < 0.3 || e1[1][2] < 0.3) return;
      const nn = norm(e0[2]), facing = dot(nn, sub(cam, P[i])) > 0, lt = o.face ? 1 : (0.6 + 0.45 * Math.abs(dot(nn, LIGHT))) * (facing ? 1 : 0.78);
      ctx.beginPath(); ctx.moveTo(e0[0][0], e0[0][1]); ctx.lineTo(e1[0][0], e1[0][1]); ctx.lineTo(e1[1][0], e1[1][1]); ctx.lineTo(e0[1][0], e0[1][1]); ctx.closePath();
      const style = tone(cs[Math.floor((i / (n - 1)) * cs.length * (o.rep || 1)) % cs.length], lt); ctx.fillStyle = style; ctx.strokeStyle = style; ctx.lineWidth = 0.6; ctx.fill(); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  // ---------- 7) ちり・星・砂（pts：[x, y, z, x, y, z, …] の数字の並び、size：大きさ、max：画面での最大の大きさ、c：色、ci / pal：点ごとの色） ----------
  function dust(o) {
    const P = o.pts, sz = (o.size || 0.03) * Math.min(1, o.s), groups = {};
    for (let i = 0, j = 0; i < P.length; i += 3, j++) {
      const q = G.proj([P[i], P[i + 1], P[i + 2]]); if (q[2] < 0.3) continue;
      const r = Math.min(o.max || 3.5, Math.max(0.6, (G.f * sz) / q[2])), key = o.ci ? o.ci[j] % o.pal.length : 0; (groups[key] = groups[key] || []).push(q[0] - r / 2, q[1] - r / 2, r);
    }
    ctx.globalAlpha = al(o);
    Object.keys(groups).forEach((key) => { const g = groups[key]; ctx.fillStyle = col(o.ci ? o.pal[key] : o.c || 'cream'); ctx.beginPath(); for (let i = 0; i < g.length; i += 3) ctx.rect(g[i], g[i + 1], g[i + 2], g[i + 2]); ctx.fill(); });
    ctx.globalAlpha = 1;
  }

  // ---------- 8) 影（list：物ごとの角の点、L：光の来る向き、y0：床の高さ） ----------
  const hull = (pts) => {   // 囲む形（凸包）
    pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]); const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], hi = [];
    pts.forEach((p) => { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); });
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (hi.length >= 2 && cr(hi[hi.length - 2], hi[hi.length - 1], p) <= 0) hi.pop(); hi.push(p); }
    return lo.slice(0, -1).concat(hi.slice(0, -1));
  };
  function shadow(o) {
    const Lt = norm(o.L || [0.3, 1, 0.2]); if (Lt[1] < 0.04) return;
    const y0 = o.y0 || 0, mx = o.max || 6;
    ctx.globalAlpha = al(o); ctx.fillStyle = col(o.c || 'navy'); ctx.beginPath();
    o.list.forEach((C) => {
      const flat = C.map((p) => { const k = Math.min(mx, (p[1] - y0) / Lt[1]); return [p[0] - Lt[0] * k, p[2] - Lt[2] * k]; });
      const H = hull(flat); if (H.length < 3) return;
      const P = H.map(([x, z]) => G.proj([x, y0, z])); if (!vis(P)) return; poly(P);
    });
    ctx.fill('nonzero'); ctx.globalAlpha = 1;
  }

  return { solid, cubes, tiles, glow, beam, ribbon, dust, shadow };
};
