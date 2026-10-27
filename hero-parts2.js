// hero-parts2.js — 入場画面の「3Dの部品」の追加分（「抽象」と「山」のバージョンで使います）
// 扇形・低ポリの山・山脈・等高線・地形の網・線。hero-parts.js の次に読み込みます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-parts2');

window.OC_HERO_PARTS2 = function (G, T) {
  const ctx = G.ctx, TAU = Math.PI * 2;
  const { basis, W3, fillCA, shade, col, gradOn, LIGHT, HOLO, path: poly } = T;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const n = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / n, a[1] / n, a[2] / n]; };
  const vis = (pts) => pts.every((q) => q[2] > 0.3);
  const al = (o) => (o.alpha === undefined ? 1 : o.alpha);
  function strokePts(P, closed) { ctx.beginPath(); P.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); if (closed) ctx.closePath(); ctx.stroke(); }

  // ---------- 1) 扇形・輪の一部（ro：外の半径、ri：内の半径、a0〜a1：角度、hatch：斜線の色、ext：厚み） ----------
  function sector(o, t) {
    const B = basis(o.r), ro = o.ro === undefined ? o.w : o.ro, ri = o.ri || 0, a0 = o.a0 || 0, a1 = o.a1 === undefined ? Math.PI : o.a1;
    const n = Math.max(4, Math.ceil(Math.abs(a1 - a0) / 0.1)), loc = [];
    for (let k = 0; k <= n; k++) { const a = a0 + ((a1 - a0) * k) / n; loc.push([Math.cos(a) * ro, Math.sin(a) * ro]); }
    if (ri > 0.001) for (let k = n; k >= 0; k--) { const a = a0 + ((a1 - a0) * k) / n; loc.push([Math.cos(a) * ri, Math.sin(a) * ri]); }
    else loc.push([0, 0]);
    const pts = loc.map(([x, y]) => G.proj(W3(o, B, x, y, 0))); if (!vis(pts)) return;
    ctx.globalAlpha = al(o);
    if (o.ext > 0.01) for (let k = 3; k >= 1; k--) { poly(loc.map(([x, y]) => G.proj(W3(o, B, x, y, -o.ext * k * 0.06)))); ctx.fillStyle = shade(col(o.c2 || o.c), 0.55); ctx.fill(); }
    const style = o.holo ? gradOn(o, B, HOLO, (o.ga || 0) + t * 0.4, ro) : o.g ? gradOn(o, B, o.g, o.ga || 0, ro) : col(o.c);
    fillCA(pts, style, al(o) > 0.6);
    if (o.hatch) {   // 斜線
      ctx.save(); poly(pts); ctx.clip(); ctx.strokeStyle = col(o.hatch); ctx.lineWidth = 1.2; ctx.beginPath();
      const g = o.hg || ro * 0.09, ha = o.ha === undefined ? 0.8 : o.ha, c = Math.cos(ha), s = Math.sin(ha);
      for (let v = -ro; v <= ro; v += g) { const a = G.proj(W3(o, B, -ro * c - v * s, -ro * s + v * c, 0)), b = G.proj(W3(o, B, ro * c - v * s, ro * s + v * c, 0)); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
      ctx.stroke(); ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 2) 低ポリの山（w：すその半径、h：高さ、n：面の数、snow：雪の量 0〜1、seed：形のばらつき） ----------
  function peak(o) {
    const B = basis(o.r), n = Math.max(3, Math.round(o.n || 6)), sd = o.seed || 0, base = [];   // 数は、途中の値にならないよう丸める
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU + sd, rr = o.w * (1 + 0.16 * Math.sin(i * 2.7 + sd * 3)); base.push(W3(o, B, Math.cos(a) * rr, 0, Math.sin(a) * rr)); }
    const apex = W3(o, B, (o.ax || 0) * o.w, o.h, (o.az || 0) * o.w), mid = W3(o, B, 0, o.h * 0.3, 0), cam = G.camPos, faces = [];
    for (let i = 0; i < n; i++) {
      const p0 = base[i], p1 = base[(i + 1) % n], cen = [(p0[0] + p1[0] + apex[0]) / 3, (p0[1] + p1[1] + apex[1]) / 3, (p0[2] + p1[2] + apex[2]) / 3];
      let nm = norm(cross(sub(p1, p0), sub(apex, p0))); if (dot(nm, sub(cen, mid)) < 0) nm = nm.map((v) => -v);
      if (dot(nm, sub(cam, cen)) <= 0) continue;   // 向こう側の面は描かない
      faces.push({ p0, p1, nm, d: dot(sub(cen, cam), sub(cen, cam)) });
    }
    faces.sort((a, b) => b.d - a.d);
    const c0 = col(o.c), sc = col(o.snowc || 'white'); ctx.globalAlpha = al(o);
    faces.forEach(({ p0, p1, nm }) => {
      const lt = 0.62 + 0.5 * Math.max(0, dot(nm, LIGHT)), tri = [p0, p1, apex].map(G.proj); if (!vis(tri)) return;
      fillCA(tri, shade(c0, lt), 0);
      if (o.snow > 0) {   // 雪：頂上のまわりを、ギザギザに白くする
        const at = (p, k) => [apex[0] + (p[0] - apex[0]) * k, apex[1] + (p[1] - apex[1]) * k, apex[2] + (p[2] - apex[2]) * k];
        const m = [(p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2, (p0[2] + p1[2]) / 2];
        fillCA([at(p0, o.snow), at(m, o.snow * 0.62), at(p1, o.snow), apex].map(G.proj), shade(sc, Math.min(1.05, lt + 0.08)), 0);
      }
    });
    ctx.globalAlpha = 1;
  }

  // ---------- 3) 山脈の切り絵（w：幅、h：高さ、seed：形、snow：雪の線の高さ 0〜1、edge：稜線の色、taper：両はしを低くする） ----------
  function ridge(o) {
    const B = basis(o.r), w = o.w, h = o.h, sd = o.seed || 0, K = 30, loc = [[-w / 2, 0]];
    for (let k = 0; k <= K; k++) {
      const u = k / K, tri = (x) => 1 - Math.abs(((x % 1) + 1) % 1 * 2 - 1);   // とがった山の形
      let y = 0.38 + 0.36 * tri(u * 1.3 + sd) + 0.18 * tri(u * 3.1 + sd * 1.9) + 0.05 * tri(u * 7.3 + sd * 2.7);
      if (o.taper) y *= Math.pow(Math.sin(u * Math.PI), 0.4);
      loc.push([-w / 2 + u * w, h * Math.max(0.04, y)]);
    }
    loc.push([w / 2, 0]);
    const pts = loc.map(([x, y]) => G.proj(W3(o, B, x, y, 0))); if (!vis(pts)) return;
    ctx.globalAlpha = al(o);
    let style = col(o.c);
    if (o.g) { const a = G.proj(W3(o, B, 0, h, 0)), b = G.proj(W3(o, B, 0, 0, 0)); style = ctx.createLinearGradient(a[0], a[1], b[0], b[1]); o.g.forEach((c, i) => style.addColorStop(i / (o.g.length - 1), col(c))); }
    fillCA(pts, style, 0);
    if (o.snow) {   // 雪：ある高さより上を白く
      ctx.save(); poly(pts); ctx.clip(); poly([[-w, h * o.snow], [w, h * o.snow], [w, h * 2], [-w, h * 2]].map(([x, y]) => G.proj(W3(o, B, x, y, 0))));
      ctx.fillStyle = col(o.snowc || 'white'); ctx.fill(); ctx.restore();
    }
    if (o.edge) { ctx.strokeStyle = col(o.edge); ctx.lineWidth = 1.2; strokePts(pts.slice(1, -1), false); }
    ctx.globalAlpha = 1;
  }

  // ---------- 4) 等高線の山（w：すその半径、h：高さ、n：線の数、amp：ゆがみ、ph：ゆがみの動き） ----------
  function contour(o) {
    const B = basis(o.r), n = Math.round(o.n || 10), ph = o.ph || 0, amp = o.amp === undefined ? 0.18 : o.amp;
    ctx.strokeStyle = col(o.c); ctx.globalAlpha = al(o);
    for (let k = 0; k < n; k++) {
      const f = k / n, y = f * o.h, r = o.w * Math.pow(1 - f, 0.85), P = [];
      for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU, rr = r * (1 + amp * (0.6 * Math.sin(3 * a + ph + k * 0.35) + 0.4 * Math.sin(5 * a - ph * 0.7 + k * 0.2))); P.push(G.proj(W3(o, B, Math.cos(a) * rr, y, Math.sin(a) * rr))); }
      if (!vis(P)) continue;
      ctx.lineWidth = k % 4 === 0 ? 1.8 : 0.9; strokePts(P, true);
    }
    ctx.globalAlpha = 1;
  }

  // ---------- 5) 地形の網（w：広さ、nx：線の数、amp：山の高さ、sg：山の広がり、ph：波の動き） ----------
  function terrain(o) {
    const B = basis(o.r), nx = Math.max(2, Math.round(o.nx || 18)), w = o.w, amp = o.amp || 1, ph = o.ph || 0, sg = o.sg || 0.35;
    const Hf = (x, z) => { const r2 = (x * x + z * z) / (w * w * sg * sg); return amp * (Math.exp(-r2) * (0.75 + 0.25 * Math.sin(Math.atan2(z, x) * 3 + ph)) + 0.12 * Math.sin((x / w) * 9 + ph) * Math.cos((z / w) * 7 - ph * 0.8)); };
    const P = [];
    for (let i = 0; i < nx; i++) { P.push([]); for (let j = 0; j < nx; j++) { const x = (i / (nx - 1) - 0.5) * w, z = (j / (nx - 1) - 0.5) * w; P[i].push(G.proj(W3(o, B, x, Hf(x, z), z))); } }
    ctx.strokeStyle = col(o.c); ctx.lineWidth = 1; ctx.globalAlpha = al(o);
    for (let i = 0; i < nx; i++) { const row = P[i], colm = P.map((r) => r[i]); if (vis(row)) strokePts(row, false); if (vis(colm)) strokePts(colm, false); }
    ctx.globalAlpha = 1;
  }

  // ---------- 6) 線（pts：つながった点、segs：2点ずつの線、dash：点線） ----------
  function path(o) {
    ctx.strokeStyle = col(o.c || 'cream'); ctx.lineWidth = o.lw || 1; ctx.globalAlpha = al(o) * Math.min(1, o.s);
    if (o.dash) { ctx.setLineDash(o.dash); ctx.lineDashOffset = o.doff || 0; }   // doff：点線を流す
    ctx.lineJoin = 'round'; ctx.lineCap = o.cap || 'butt';
    ctx.beginPath();
    const seg = (a, b) => { const p = G.proj(a), q = G.proj(b); if (p[2] > 0.3 && q[2] > 0.3) { ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); } };
    if (o.pts) { let pen = false; o.pts.forEach((a) => { const p = G.proj(a); if (p[2] > 0.3) { if (pen) ctx.lineTo(p[0], p[1]); else ctx.moveTo(p[0], p[1]); pen = true; } else pen = false; }); }   // つながった線
    if (o.segs) o.segs.forEach(([a, b]) => seg(a, b));
    ctx.stroke(); ctx.setLineDash([]); ctx.lineDashOffset = 0; ctx.lineJoin = 'miter'; ctx.lineCap = 'butt'; ctx.globalAlpha = 1;
  }

  return { sector, peak, ridge, contour, terrain, path };
};
