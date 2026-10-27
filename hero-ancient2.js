// hero-ancient2.js — 入場画面「古代」のショット 4〜6（hero-ancient.js の続き）
// 迷路を自動で作って解く・ストーンヘンジの影の日時計・1000枚のモザイク。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-ancient2');

window.OC_HERO_ANC2 = function (K, X, A) {
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp, lerp3, mat, mv, eul, nrm, lane, eq, spin, hop, camYaw } = K;
  const { card, BC, RAIN, GOLD, ancRing, wrapA } = X;
  K.pool(A, 'hr', 13, () => ({ type: 'text', str: '', s: 0.12, c: 'navy', alpha: 0.85, bill: 1 }));   // 時刻の文字

  // ===== 4) 迷路：「穴を掘りながら進み、行き止まりで戻る」方法で迷路を作り、水が広がるように距離を調べ、いちばん近い道を見つける =====
  const NC = 9, GN = 2 * NC + 1, BS = 0.21, F0 = -1.6, MZ = (() => {
    const id = (i, j) => j * GN + i, tOpen = new Float32Array(GN * GN).fill(1e9), vis = new Uint8Array(NC * NC), ev = [];
    let seed = 20260; const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
    const stack = [[0, 0]]; vis[0] = 1; ev.push({ open: [id(1, 1)], head: [0, 0], stk: [[0, 0]] });
    while (stack.length) {
      const [ci, cj] = stack[stack.length - 1], nb = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => [ci + a, cj + b]).filter(([a, b]) => a >= 0 && b >= 0 && a < NC && b < NC && !vis[b * NC + a]);
      if (nb.length) { const [ni, nj] = nb[Math.floor(rand() * nb.length)]; vis[nj * NC + ni] = 1; stack.push([ni, nj]); ev.push({ open: [id(ci + ni + 1, cj + nj + 1), id(2 * ni + 1, 2 * nj + 1)], head: [ni, nj], stk: stack.slice() }); }
      else { stack.pop(); if (stack.length) ev.push({ open: [], head: stack[stack.length - 1], stk: stack.slice() }); }
    }
    const T0 = 0.25, DT = 2.0 / ev.length; ev.forEach((e, k) => { e.t = T0 + k * DT; e.open.forEach((b) => { tOpen[b] = Math.min(tOpen[b], e.t); }); });
    const ent = id(1, 0), ext = id(GN - 2, GN - 1); tOpen[ent] = 0.2; tOpen[ext] = T0 + 2.0;
    const dist = new Int32Array(GN * GN).fill(-1), par = new Int32Array(GN * GN).fill(-1), q = [ent]; dist[ent] = 0;   // 幅優先探索（BFS）
    while (q.length) { const b = q.shift(), i = b % GN, j = Math.floor(b / GN); [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([a, c]) => { const ni = i + a, nj = j + c; if (ni < 0 || nj < 0 || ni >= GN || nj >= GN) return; const nb = id(ni, nj); if (tOpen[nb] > 1e8 || dist[nb] >= 0) return; dist[nb] = dist[b] + 1; par[nb] = b; q.push(nb); }); }
    let dmax = 0; dist.forEach((d) => { dmax = Math.max(dmax, d); });
    const path = []; for (let b = ext; b >= 0; b = par[b]) path.unshift(b);
    const pos = (b, y = 0) => [((b % GN) - (GN - 1) / 2) * BS, F0 + y, (Math.floor(b / GN) - (GN - 1) / 2) * BS];
    let P = path.map((b, k) => pos(b, 0.13 + 0.03 * S(k * 0.7)));
    for (let r = 0; r < 2; r++) { const Q = [P[0]]; for (let k = 0; k < P.length - 1; k++) { Q.push(lerp3(P[k], P[k + 1], 0.25), lerp3(P[k], P[k + 1], 0.75)); } Q.push(P[P.length - 1]); P = Q; }   // 角をまるく
    return { id, ev, tOpen, dist, dmax, path, thread: P, pos, onPath: new Set(path) };
  })();
  const WP = [['#2b3566', '#141b3a', '#5c6aa8'], ['#3fc6c2', '#0d7d7a', '#9ae8e4'], ['#5c5cff', '#1d1dc0', '#9ad7ff'], ['#ff8acb', '#c41f7c', '#ffc2e4'], ['#ff7a4c', '#b83a12', '#ffb08a'], ['#ffd27a', '#c99a2e', '#fff8dc']];
  const FLR = ['#e9cdb8'], FLB = ['#ffd27a', '#fa8c14', '#e8501e', '#ff2fa0', '#2a2aff', '#14a39f', '#00f0ff', '#141b3a', '#fffaf4'];
  const BFS0 = 2.35, BFSD = 1.15, TH0 = 3.45, THD = 1.35;

  // ===== 5) ストーンヘンジ：夏至の1日を5秒で。太陽が動くと、石の影がぐるっと回る（日時計）。日の出の光が、まっすぐ祭壇へ =====
  const G0 = -1.9, LAT = (51.18 * PI) / 180, DEC = (23.44 * PI) / 180, AX = (49.9 * PI) / 180;   // 緯度・夏至の赤緯・日の出の方角
  const sunDir = (H) => { const e = -Math.cos(DEC) * S(H), n = S(DEC) * Co(LAT) - Co(DEC) * Co(H) * S(LAT), u = S(DEC) * S(LAT) + Co(DEC) * Co(H) * Co(LAT); return [e, u, -n]; };
  const Hof = (tb) => (tb < 2.6 ? -127 + (tb / 2.6) * 9 : tb < 4.9 ? -118 + ((tb - 2.6) / 2.3) * 240.6 : 122.6 + (tb - 4.9) * 8) * (PI / 180);
  const azv = (az) => [S(az), 0, -Co(az)];   // 北から時計回りの角度 → 床の向き
  const ST = []; {   // 石：[x, y, z, 横, 高さ, 奥, 色, 回転]
    range(30).forEach((k) => { const a = (k / 30) * TAU, R = 1.9; ST.push([Co(a) * R, G0 + 0.36, S(a) * R, 0.1, 0.36, 0.065, 0, -a + PI / 2]); });
    range(30).forEach((k) => { const a = ((k + 0.5) / 30) * TAU, R = 1.9; ST.push([Co(a) * R, G0 + 0.77, S(a) * R, 0.205, 0.05, 0.06, 0, -a + PI / 2]); });
    const axA = Math.atan2(azv(AX)[2], azv(AX)[0]);
    [-1.45, -0.78, 0, 0.78, 1.45].forEach((d, k) => { const a = axA + PI + d, R = k === 2 ? 1.12 : 1.0, h = k === 2 ? 0.6 : 0.5, c = [Co(a) * R, 0, S(a) * R], tg = [-S(a), 0, Co(a)];
      [-1, 1].forEach((s) => ST.push([c[0] + tg[0] * 0.13 * s, G0 + h, c[2] + tg[2] * 0.13 * s, 0.085, h, 0.07, 1, -a + PI / 2])); ST.push([c[0], G0 + 2 * h + 0.055, c[2], 0.23, 0.055, 0.075, 1, -a + PI / 2]); });
    range(40).forEach((k) => { const a = ((k + 0.3) / 40) * TAU, R = 1.45; ST.push([Co(a) * R, G0 + 0.17, S(a) * R, 0.045, 0.17, 0.03, 2, -a + PI / 2]); });
    range(15).forEach((k) => { const a = axA + PI + (k / 14 - 0.5) * 3.3, R = 0.68; ST.push([Co(a) * R, G0 + 0.21, S(a) * R, 0.04, 0.21, 0.03, 2, -a + PI / 2]); });
    const v = azv(AX); ST.push([v[0] * 3.2, G0 + 0.42, v[2] * 3.2, 0.13, 0.42, 0.11, 3, -axA + PI / 2]); ST.push([0, G0 + 0.03, 0, 0.26, 0.03, 0.07, 4, -axA]);
  }
  const STC = ST.map((s) => { const [x, y, z, hx, hy, hz, , ry] = s, c = Co(ry), sn = S(ry), P = []; [-1, 1].forEach((a) => [-1, 1].forEach((b) => [-1, 1].forEach((d) => P.push([x + a * hx * c + d * hz * sn, y + b * hy, z - a * hx * sn + d * hz * c])))); return P; });
  const SPAL = [['#fff4ea', '#e9cdb8', '#ffffff'], ['#2b3566', '#141b3a', '#5c6aa8'], ['#5c5cff', '#1d1dc0', '#9ad7ff'], ['#ff7a4c', '#b83a12', '#ffb08a'], ['#ffd27a', '#c99a2e', '#fff8dc']];
  const RN = ['VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII'];

  // ===== 6) モザイク：1000枚のタイルが竜巻のように集まって、ローマのモザイクになる。波が通ると、全部が裏返って別の絵に =====
  const MG = 0.1, MR = 1.85;
  const MT = []; for (let y = -MR; y <= MR + 1e-6; y += MG) for (let x = -MR; x <= MR + 1e-6; x += MG) { const r = Math.hypot(x, y); if (r <= MR) MT.push([x, y, r, Math.atan2(y, x)]); }
  const MPAL = ['#fffaf4', '#141b3a', '#e8501e', '#14a39f', '#fa8c14', '#ffd27a', '#ff9a76'], MBAK = ['#2a2aff', '#00f0ff', '#fffaf4', '#ff2fa0', '#141b3a', '#14a39f'];
  const mosA = (x, y, r, a) => {   // 表の絵：花・組みひも・雷文（メアンダー）・のこぎり
    if (r < 0.1) return 1; if (r < 0.5) return r < 0.27 * Math.abs(Co(4 * a + PI / 4)) + 0.06 ? 5 : r < 0.46 * Math.abs(Co(4 * a)) + 0.04 ? 2 : 0; if (r < 0.56) return 1;
    if (r < 0.95) { const w1 = 0.69 + 0.13 * S(12 * a), w2 = 0.69 - 0.13 * S(12 * a); return Math.abs(r - w1) < 0.055 ? 3 : Math.abs(r - w2) < 0.055 ? 4 : 0; }
    if (r < 1.03) return 1; if (r < 1.62) { const v = Math.floor((r - 1.03) / (MG * 1.5)), u = Math.floor(((a + PI) * 1.32) / (MG * 1.5)); return (u + v) % 2 ? 1 : 0; }
    if (r < 1.68) return 2; return (r - 1.68) / 0.17 < fr((a * 24) / TAU) ? 4 : 1;
  };
  const mosB = (x, y, r, a) => (r < 0.12 ? 2 : Math.floor(fr((a * 5 + r * 5.5) / TAU) * 5) % 5);   // 裏の絵：うず
  MT.forEach((m, i) => { m.push(mosA(...m), mosB(...m), 0.3 + (m[2] / MR) * 1.6 + rnd(i * 3) * 0.25, rnd(i * 7) * TAU, 2.0 + rnd(i * 5) * 1.8, (rnd(i * 11) - 0.5) * 3.4); });   // 4:表 5:裏 6:着く時間 7:角度 8:半径 9:高さ
  const MFL = 0.7;

  return [
    { // 4) 迷路：石のかたまりを掘り進めて迷路ができる → 入口から色の波が広がる（距離） → いちばん近い道に、アリアドネの糸
      name: 'LABYRINTH', bg: 'cream', sel: 's30',
      cam: (tb, t) => ({ pitch: 1.05 - 0.22 * io(cl((tb - 0.5) / 4)) + 0.05 * S(t * 0.4), dist: 10.2, zoom: 1.16, t: [0, -1.25, 0] }),
      act: (t, tb) => {
        const o = {}, cubes = [], tiles = [], hy = 0.17, dd = MZ.dmax, fin = tb - (TH0 + THD);
        for (let b = 0; b < GN * GN; b++) {
          const to = MZ.tOpen[b], i = b % GN, j = Math.floor(b / GN), x = (i - (GN - 1) / 2) * BS, z = (j - (GN - 1) / 2) * BS, sink = to > 1e8 ? 0 : io(cl((tb - to) / 0.22));
          if (sink < 0.98) { const h = hy * (1 - sink), pc = to < 1e8 && tb > to - 0.02 ? 5 : Math.min(4, Math.floor(((i + j) / (2 * GN)) * 5.2)), jd = Math.hypot(i - GN + 2, j - GN + 1) * BS, jp = fin > 0 ? 0.22 * S(PI * cl(fin * 2.4 - jd * 0.75)) : 0; cubes.push([x, F0 + h + jp, z, BS * 0.47, h, BS * 0.47, jp > 0.02 ? 5 : pc, 0, 0, 0]); }   // ゴールすると、壁が波のようにはねる
          if (to < 1e8 && tb > to) { const d = MZ.dist[b], tf = BFS0 + (d / dd) * BFSD, f = PI * io(cl((tb - tf) / 0.25)), pth = MZ.onPath.has(b) && tb > TH0 + (MZ.path.indexOf(b) / MZ.path.length) * THD;
            tiles.push([x, F0 + 0.004 + 0.12 * S(f), z, 0, pth ? 8 : Math.floor((d / dd) * 7.99), f, 0]); }
        }
        o.cb0 = { items: cubes, pal: WP, zp: [0, F0, 0] }; o.tl0 = { items: tiles, pal: FLR, back: FLB, h: BS * 0.45, zp: [0, F0 - 0.01, 0], z: 0.5 };
        const k = Math.max(0, Math.min(MZ.ev.length - 1, Math.floor((tb - 0.25) / (2.0 / MZ.ev.length)))), e = MZ.ev[k], gen = tb < 2.3;
        if (gen) { const sp = e.stk.map(([ci, cj]) => MZ.pos(MZ.id(2 * ci + 1, 2 * cj + 1), 0.4)); if (sp.length > 1) o.ln0 = { pts: sp, c: 'verm', lw: 2.5, alpha: 0.9, zp: [0, F0, 0], z: 3 };
          const hp = MZ.pos(MZ.id(2 * e.head[0] + 1, 2 * e.head[1] + 1), 0.42); o.b0 = { p: hp, w: 0.1, g: BC[0], zp: [0, F0, 0], z: 3.2 }; o.gw0 = { p: hp, w: 0.35, c: 'white', c2: 'verm', alpha: 0.6, mode: 'source-over', zp: [0, F0, 0], z: 3.1 }; }
        const tp = cl((tb - TH0) / THD), n = Math.floor(tp * (MZ.thread.length - 1));
        if (tp > 0) { const pts = MZ.thread.slice(0, n + 1); if (pts.length > 1) o.rb0 = { pts, w: 0.05, tw: 0.32, cs: ['verm', 'pink', GOLD], rep: 6, zp: [0, F0, 0], z: 3 };
          const hd = MZ.thread[n]; o.chrome0 = { p: [hd[0], hd[1] + 0.06, hd[2]], w: 0.13, zp: [0, F0, 0], z: 3.3 }; }
        const ex = MZ.pos(MZ.id(GN - 2, GN - 1), 0.1);
        if (fin > 0) { const v = cl(fin / 0.9); o.r0 = { p: ex, r: FLOOR, w: 0.2 + v * 1.6, c: 'verm', lw: 2.5, alpha: 1 - v }; o.gw1 = { p: [ex[0], ex[1] + 0.2, ex[2]], w: 0.5 * (1 - v * 0.5), c: GOLD, c2: 'pink', alpha: 0.8 }; }
        const ent = MZ.pos(MZ.id(1, 0), 0.6), exT = MZ.pos(MZ.id(GN - 2, GN - 1), 0.6);
        o.tx2 = { p: [ent[0], ent[1] + 0.1, ent[2] - 0.25], str: 'IN', s: 0.13, c: 'navy' }; o.tx3 = { p: [exT[0], exT[1] + 0.1, exT[2] + 0.25], str: 'OUT', s: 0.13, c: 'navy' };
        o.tx0 = { p: [0, 1.35, 0], str: 'LABYRINTH · KNOSSOS · c. 1700 BC', s: 0.15, c: 'navy' };
        const vis = MZ.ev.slice(0, k + 1).filter((q) => q.open.length).length, dNow = Math.max(0, Math.min(dd, Math.floor(((tb - BFS0) / BFSD) * dd)));
        o.tx1 = { p: [0, 1.1, 0], str: gen ? 'RECURSIVE BACKTRACKER · ' + vis + ' / 81' : tb < TH0 ? 'BFS · FLOOD FILL · d = ' + dNow : "ARIADNE'S THREAD · " + Math.round(tp * (MZ.path.length - 1)) + ' / ' + (MZ.path.length - 1), s: 0.1, c: 'navy' };
        ancRing(o, t, 4.2, 0.3, 'navy', 0.3);
        eq(o, 16, 16, 3.6, -2.3, t, 1.0, 0.18, 0.3, t * 0.05);
        spin(o, 0, 8, 4.0, -1.2, t, -t * 0.15, 0.26, 0.2);
        lane(o, 't', 0, 14, 4.9, 1.7, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.s30 = Object.assign({ p: [2.75, -1.55, -1.6], r: [0, t * 0.4, 0], bw: 0.32, bh: 0.32, bd: 0.32 }, K.bc('verm'));
        o.dots0 = { p: [0, -2.3, 0], r: FLOOR, c: 'navy', alpha: 0.35 }; o.r1 = { p: [0, F0 - 0.01, 0], r: FLOOR, w: 2.95, c: 'navy', alpha: 0.5 };
        return o;
      }
    },
    { // 5) ストーンヘンジ：日の出の光が、ヒールストーンと石の門を通って、まっすぐ祭壇へ。そのあと1日がすぎ、影が日時計のように回る
      name: 'STONEHENGE', bg: 'peach', sel: 's31',
      cam: (tb, t) => ({ pitch: 0.62 - 0.2 * io(cl(tb / 4)) + 0.05 * S(t * 0.4), dist: 10.4, zoom: 1.1, t: [0, -1.35, 0] }),
      act: (t, tb) => {
        // 日の出のとき、カメラが日の出の方角を向くように、遺跡ごと回しておく（ショットの間は変わらない）
        const be = camYaw(t - tb + 2.05) + AX + 0.3, cb = Co(be), sb = S(be), R = (q) => [q[0] * cb + q[2] * sb, q[1], -q[0] * sb + q[2] * cb];
        const o = {}, H = Hof(tb), L0 = sunDir(H), L = R(L0), up = L[1], sunP = [L[0] * 6.2, G0 + L[1] * 6.2, L[2] * 6.2], dawn = cl(1 - (tb - 2.3) / 0.8) * cl((up + 0.04) / 0.06);
        o.cb1 = { items: ST.map((q) => { const r = R(q); return [r[0], r[1], r[2], q[3], q[4], q[5], q[6], q[7] + be]; }), pal: SPAL, zp: [0, G0 + 0.3, 0] };
        o.sd0 = { list: STC.map((C) => C.map(R)), L, y0: G0 + 0.003, c: 'navy', alpha: 0.32 * cl((up + 0.01) / 0.03), max: 7, zp: [0, G0, 0], z: -50 };
        o.fl0 = { p: [0, G0 - 0.005, 0], r: FLOOR, shape: 'circle', w: 3.0, c: '#ffe1d2', alpha: 0.7, z: -60 };
        o.r0 = { p: [0, G0, 0], r: FLOOR, w: 2.85, c: 'cream', lw: 3, alpha: 0.9 }; o.r1 = { p: [0, G0, 0], r: FLOOR, w: 3.05, c: 'navy', lw: 1, alpha: 0.6 };
        const av = R([S(AX), 0, -Co(AX)]), sideV = [-av[2], 0, av[0]];
        o.ln0 = { segs: [-1, 1].map((s) => [add([0, G0, 0], add(lerp3([0, 0, 0], av, 3.0), lerp3([0, 0, 0], sideV, 0.22 * s))), add([0, G0, 0], add(lerp3([0, 0, 0], av, 5.0), lerp3([0, 0, 0], sideV, 0.3 * s)))]), c: 'navy', lw: 1.2, alpha: 0.7, zp: [0, G0, 0] };
        const hs = []; RN.forEach((s, k) => { const Hk = ((k + 6 - 12) * 15 * PI) / 180, d = R(sunDir(Hk)), g = nrm([-d[0], 0, -d[2]]), lit = Math.abs(Hk - H) < 0.13; hs.push([[g[0] * 0.5, G0 + 0.004, g[2] * 0.5], [g[0] * 2.55, G0 + 0.004, g[2] * 2.55]]);
          o['hr' + k] = { p: [g[0] * 2.72, G0 + 0.08, g[2] * 2.72], str: s, s: lit ? 0.16 : 0.11, c: lit ? 'verm' : 'navy', alpha: lit ? 1 : 0.75 }; });
        o.ln1 = { segs: hs, c: 'navy', lw: 1, alpha: 0.4, dash: [3, 4], zp: [0, G0, 0], z: -48 };
        const arc = range(61).map((i) => { const d = R(sunDir(((-122.6 + (i / 60) * 245.2) * PI) / 180)); return [d[0] * 6.2, G0 + d[1] * 6.2, d[2] * 6.2]; });
        o.ln2 = { pts: arc, c: 'cream', lw: 1.5, alpha: 0.8, dash: [2, 6], doff: -t * 15, zp: [0, 1, 0], z: -30 };
        if (up > -0.05) { o.gw0 = { p: sunP, w: 0.75, c: 'white', c2: GOLD, rays: 16, rl: 2.6, rw: 0.05, ra: t * 0.1, alpha: cl((up + 0.05) / 0.1), z: -25 }; o.fl1 = { p: sunP, bill: 1, shape: 'circle', w: 0.42, g: ['white', GOLD], ga: PI / 2, z: -24 }; }
        if (dawn > 0) o.gw2 = { p: [sunP[0], G0 + 0.2, sunP[2]], w: 3.2, c: '#fff0c2', c2: '#ffb24d', alpha: 0.55 * dawn, z: -26 };   // 地平線が明るむ
        const al = cl(1 - Math.abs(tb - 2.05) / 0.6);   // 日の出の一直線
        if (al > 0) { o.bm0 = { a: sunP, b: [0, G0 + 0.1, 0], ra: 0.5, rb: 0.08, c: 'white', c2: GOLD, alpha: al, zp: [0, G0, 0], z: 5 }; o.gw1 = { p: [0, G0 + 0.12, 0], w: 0.7 * al, c: 'white', c2: GOLD, rays: 10, rl: 2.4, rw: 0.08, ra: t, alpha: al, z: 6 }; }
        const hrs = 12 + (H * 180) / PI / 15 + 1.05, hh = Math.floor(((hrs % 24) + 24) % 24), mm = Math.floor(fr(hrs) * 60);
        o.tx0 = { p: [0, 0.95, 0], str: 'STONEHENGE · SUMMER SOLSTICE · 51.18° N', s: 0.12, c: 'navy' };
        o.tx1 = { p: [0, 0.6, 0], str: String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0'), s: 0.32, c: 'navy' };
        o.tx2 = { p: [0, 0.32, 0], str: 'SUN ALT ' + ((Math.asin(Math.max(-1, Math.min(1, up))) * 180) / PI).toFixed(1) + '° · AZ ' + ((((Math.atan2(L0[0], -L0[2]) * 180) / PI) + 360) % 360).toFixed(1) + '°', s: 0.09, c: 'navy' };
        if (al > 0.1) o.tx3 = { p: [av[0] * 3.2, G0 + 1.2, av[2] * 3.2], str: 'HEEL STONE · 04:52', s: 0.1, c: 'verm' };
        o.s31 = Object.assign({ p: [-2.7, -1.1, 1.9], r: [0.3, t * 0.4, 0.2], bw: 0.3, bh: 0.3, bd: 0.3 }, K.bc('navy'));
        ancRing(o, t, 4.3, 0.6, 'navy', 0.3);
        spin(o, 0, 8, 4.0, -1.0, t, t * 0.12, 0.26, 0.2);
        hop(o, 0, 10, 3.6, G0 + 0.12, t, 0.45, -t * 0.2, 0.13);
        lane(o, 't', 0, 14, 5.0, 2.2, 0.35, -t * 0.04, t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, G0 - 0.01, 0], r: FLOOR, c: 'navy', alpha: 0.3 };
        return o;
      }
    },
    { // 6) モザイク：竜巻のようにまわる1000枚のタイルが、内側から順に飛んできて、ローマのモザイクになる。波が通ると、全部が裏返って「うず」の絵に
      name: 'MOSAIC', bg: 'black', sel: 's31',
      cam: (tb, t) => ({ pitch: 0.12 + 0.06 * S(t * 0.4), dist: 10.2, zoom: 1.2 + 0.1 * io(cl(tb / 4)), t: [0, 0.8, 0], tilt: 0.6 }),
      act: (t, tb) => {
        const o = {}, C = [0, 0.85, 0], cd = card(t, C, 0.4, 1.2, -0.04), U = mv(cd.M, [1, 0, 0]), V = mv(cd.M, [0, 1, 0]), items = [];
        MT.forEach((m, i) => {
          const [x, y, r, a, fa, fb, ta, a0, rr, hh] = m, tl = ta - MFL, tor = (tt) => { const an = a0 + tt * 1.5; return [C[0] + Co(an) * rr, C[1] + hh + 0.15 * S(tt * 2 + i), C[2] + S(an) * rr]; };
          let p, f, sp;
          if (tb < tl) { p = tor(tb); f = tb * 3 + i; sp = tb * 2 + i * 0.3; }
          else if (tb < ta) { const u = (tb - tl) / MFL, e = 1 - Math.pow(1 - u, 3), s0 = tor(tl); p = lerp3(s0, cd.P(x, y, 0), e); f = wrapA(tl * 3 + i) * (1 - e); sp = wrapA(tl * 2 + i * 0.3) * (1 - e); }
          else { const tw = 3.0 + r * 0.55, ff = PI * io(cl((tb - tw) / 0.32)), z = 0.18 * S(ff) + 0.025 * S(r * 7 - tb * 5) * cl(tb - ta); p = cd.P(x, y, z); f = ff; sp = 0; }
          items.push([p[0], p[1], p[2], fa, tb > 4.1 ? mosB(x, y, r, a - (tb - 4.1) * 1.6) : fb, f, sp]);   // 裏返ったあと、うずが回り出す
        });
        o.tl0 = { items, pal: MPAL, back: MBAK, U, V, h: MG * 0.44, zp: C };
        const ring = range(73).map((i) => cd.P(Co((i / 72) * TAU) * (MR + 0.12), S((i / 72) * TAU) * (MR + 0.12), 0)); o.ln0 = { pts: ring, c: GOLD, lw: 2, alpha: 0.9, zp: C, z: -0.1 };
        const wv = cl((tb - 3.0) / 1.1); if (wv > 0 && wv < 1) { const rw = wv * (MR + 0.3); o.ln1 = { pts: range(73).map((i) => cd.P(Co((i / 72) * TAU) * rw, S((i / 72) * TAU) * rw, 0.22)), c: 'white', lw: 2.5, alpha: 1 - wv, zp: C, z: -0.2 }; }
        const nIn = MT.filter((m) => tb >= m[6]).length;
        o.tx0 = { p: cd.P(0, -2.25, 0), str: 'OPUS TESSELLATUM · POMPEII · 79 AD', s: 0.13, c: 'cream' };
        o.tx1 = { p: cd.P(0, -2.5, 0), str: 'TESSERAE ' + String(nIn).padStart(4, '0') + ' / ' + MT.length + (tb > 3 ? ' · FLIP ' + Math.round(wv * 100) + '%' : ''), s: 0.09, c: GOLD };
        o.tx2 = { p: cd.P(-1.9, 2.15, 0.3), str: 'MEANDER · GUILLOCHE · ROSETTE', s: 0.08, c: 'cream' };
        o.s31 = Object.assign({ p: [2.6, 2.4, -1.2], r: [0.4, t * 0.5, 0.3], bw: 0.3, bh: 0.3, bd: 0.3 }, K.bc('blue'));
        ancRing(o, t, 4.2, 0.4, 'cream', 0.3);
        spin(o, 0, 10, 3.8, -1.7, t, -t * 0.15, 0.28, 0.25);
        eq(o, 0, 16, 4.3, -2.3, t, 1.2, 0.2, 0.34, -t * 0.05);
        lane(o, 't', 0, 14, 4.9, 2.4, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, -2.3, 0], r: FLOOR, c: 'cream', alpha: 0.3 }; o.r2 = { p: [0, -2.3, 0], r: FLOOR, w: 3.6, c: 'cream', alpha: 0.4 };
        return o;
      }
    }
  ];
};
