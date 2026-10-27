// hero-ancient.js — 入場画面の別バージョン「古代」：物体の一覧・道具と、ショット 1（2〜3 は hero-ancient2.js、4〜6 は hero-ancient3.js、7〜8 は hero-ancient4.js）
// ※ スマホで保存すると、とても長いファイルは途中で切れてしまうので、4つに分けています。
// ピラミッドの建設・アンティキティラの歯車・フーリエ級数で描くホルスの目・迷路を作って解く・ストーンヘンジの影・
// モザイク・プラトンの立体・アルファベット3000年の旅。新しい部品（hero-parts4.js）をたくさん使います。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-ancient');

if (typeof window.OC_HERO_PARTS4 === 'function') (window.OC_HERO_VERSIONS = window.OC_HERO_VERSIONS || {}).ancient = function (cfg) {   // 新しい部品（hero-parts4.js）があるときだけ
  if (!cfg.P4) throw new Error('hero.js が古いので、古代の部品が使えません');
  const K = window.OC_HERO_KIT(cfg);
  const { S, Co, PI, TAU, FLOOR, cl, io, range, ang, rnd, fr, add, sub, lerp, lerp3, mat, mmul, mv, eul, nrm, cross, lane, floorRing, eq, spin, hop, orb, camYaw } = K;
  const A = K.roster({});
  K.pool(A, 'ln', 40, () => ({ type: 'path', c: 'navy', lw: 1.5, alpha: 0.9, cap: 'round' }));   // 線
  K.pool(A, 'eq', 10, () => ({ type: 'text', str: '', s: 0.15, c: 'navy', alpha: 0.85, bill: 1 }));   // 式
  K.pool(A, 'so', 24, () => ({ type: 'solid', V: [[0, 0, 0]], F: [], c: 'cream' }));   // 多面体
  K.pool(A, 'gw', 12, () => ({ type: 'glow', w: 0.3, c: 'white' }));   // 光
  K.pool(A, 'bm', 4, () => ({ type: 'beam', a: [0, 0, 0], b: [0, 1, 0], c: 'white' }));   // 光の柱
  K.pool(A, 'cb', 3, () => ({ type: 'cubes', items: [], pal: [['cream', 'cream', 'cream']] }));   // たくさんの立方体
  K.pool(A, 'tl', 3, () => ({ type: 'tiles', items: [], pal: ['cream'] }));   // たくさんのタイル
  K.pool(A, 'rb', 4, () => ({ type: 'ribbon', pts: [], w: 0.05 }));   // リボン
  K.pool(A, 'du', 4, () => ({ type: 'dust', pts: [], size: 0.03, c: 'cream' }));   // ちり・星
  K.pool(A, 'sd', 2, () => ({ type: 'shadow', list: [], c: 'navy', alpha: 0.25 }));   // 影
  K.pool(A, 'gr', 16, () => ({ type: 'gear', w: 0.3, n: 12, c: 'orange', c2: '#c96a00', ext: 0.5 }));   // 歯車
  K.pool(A, 'ep', 28, () => ({ type: 'lines', kind: 'ring', w: 0.3, c: 'cream', lw: 1, alpha: 0.6 }));   // 円
  K.pool(A, 'ty', 12, () => ({ type: 'type', str: 'A', s: 0.6, ext: 0.12, c: 'cream', c2: 'navy' }));   // 立体の文字（roster の ty0〜5 を広げる）

  // ===== 道具 =====
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const wrapA = (a) => a - TAU * Math.round(a / TAU);
  // 点の集まりを包む多面体の面を、自動で求める（凸包）
  const hull3 = (P) => {
    const F = [], seen = new Set();
    for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) for (let k = j + 1; k < P.length; k++) {
      let n = cross(sub(P[j], P[i]), sub(P[k], P[i])); const l = Math.hypot(n[0], n[1], n[2]); if (l < 1e-9) continue; n = n.map((v) => v / l);
      const d = dot(n, P[i]); let pos = 0, neg = 0; P.forEach((p) => { const s = dot(n, p) - d; if (s > 1e-6) pos++; else if (s < -1e-6) neg++; });
      if (pos && neg) continue;
      const mem = []; P.forEach((p, m) => { if (Math.abs(dot(n, p) - d) < 1e-6) mem.push(m); }); const key = mem.join(','); if (seen.has(key)) continue; seen.add(key);
      const c = [0, 0, 0]; mem.forEach((m) => { c[0] += P[m][0] / mem.length; c[1] += P[m][1] / mem.length; c[2] += P[m][2] / mem.length; });
      const u = nrm(sub(P[mem[0]], c)), w = cross(n, u), an = (m) => Math.atan2(dot(sub(P[m], c), w), dot(sub(P[m], c), u));
      mem.sort((a, b) => an(a) - an(b)); F.push(mem);
    }
    return F;
  };
  const solidOf = (V) => ({ V, F: hull3(V) });
  const PHI = (1 + Math.sqrt(5)) / 2, s3 = 1 / Math.sqrt(3);
  const PLATO = {   // プラトンの立体（外接球の半径 1）
    tetra: solidOf([[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((x) => x * s3))),
    cube: solidOf([[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]].map((v) => v.map((x) => x * s3))),
    octa: solidOf([[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]),
    icosa: solidOf([].concat(...[[0, 1, PHI], [1, PHI, 0], [PHI, 0, 1]].map(([a, b, c]) => [[a, b, c], [a, b, -c], [a, -b, c], [a, -b, -c], [-a, b, c], [-a, b, -c], [-a, -b, c], [-a, -b, -c]])).filter((v, i, arr) => arr.findIndex((q) => q.join() === v.join()) === i).map((v) => v.map((x) => x / Math.hypot(1, PHI)))),
    dodeca: solidOf([[1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1], [-1, 1, 1], [-1, 1, -1], [-1, -1, 1], [-1, -1, -1]].concat(...[[0, 1 / PHI, PHI], [1 / PHI, PHI, 0], [PHI, 0, 1 / PHI]].map(([a, b, c]) => [[a, b, c], [a, b, -c], [a, -b, c], [a, -b, -c], [-a, b, c], [-a, b, -c], [-a, -b, c], [-a, -b, -c]])).filter((v, i, arr) => arr.findIndex((q) => q.join() === v.join()) === i).map((v) => v.map((x) => x * s3)))
  };
  // 角すい台（下の半分の幅 hb、上の半分の幅 ht、高さ h。四角）
  const frus4 = (hb, ht, h) => ht < 1e-3 ? { V: [[-hb, 0, -hb], [hb, 0, -hb], [hb, 0, hb], [-hb, 0, hb], [0, h, 0]], F: [[0, 1, 2, 3], [0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]] }
    : { V: [[-hb, 0, -hb], [hb, 0, -hb], [hb, 0, hb], [-hb, 0, hb], [-ht, h, -ht], [ht, h, -ht], [ht, h, ht], [-ht, h, ht]], F: [[0, 1, 2, 3], [4, 5, 6, 7], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7]] };
  // オベリスク（高さ h）
  const OBF = [[0, 1, 2, 3], [0, 1, 5, 4], [1, 2, 6, 5], [2, 3, 7, 6], [3, 0, 4, 7], [4, 5, 8], [5, 6, 8], [6, 7, 8], [7, 4, 8]];
  const obV = (h, b0 = 0.085, b1 = 0.055) => [[-b0, 0, -b0], [b0, 0, -b0], [b0, 0, b0], [-b0, 0, b0], [-b1, h, -b1], [b1, h, -b1], [b1, h, b1], [-b1, h, b1], [0, h + b1 * 2.2, 0]];
  // 柱（n 角形の筒）
  const prism = (n, r, h, r2 = r) => solidOf([].concat(range(n).map((k) => [Co(ang(k, n)) * r, 0, S(ang(k, n)) * r]), range(n).map((k) => [Co(ang(k, n)) * r2, h, S(ang(k, n)) * r2])));
  // カメラの方を向いた板（少しゆらぐ）。P(x, y, z) で板の上の点
  const card = (t, C, sw = 0.3, ph = 0, rx = 0, yo = 0) => { const M = mat(rx, camYaw(t) + yo + sw * S(t * 0.3 + ph), 0); return { M, rr: eul(M), P: (x, y, z = 0) => add(C, mv(M, [x, y, z])), N: mv(M, [0, 0, 1]) }; };
  const RT = (t) => { const c = camYaw(t); return [Co(c), 0, -S(c)]; };
  const onCard = (P0, t, x, y, z = 0) => { const r = RT(t), f = [-r[2], 0, r[0]]; return [P0[0] + r[0] * x + f[0] * z, P0[1] + y, P0[2] + r[2] * x + f[2] * z]; };
  const BC = [['white', '#ffb08a', 'verm'], ['white', '#ffd27a', 'orange'], ['white', '#9ae8e4', 'teal'], ['white', '#9ad7ff', 'blue'], ['white', '#ff9ad5', 'pink'], ['white', '#fff4ea', '#d9b9a6'], ['white', '#5c6aa8', 'navy'], ['white', '#f4ffb0', '#9fbd00']];
  const RAIN = ['verm', 'orange', '#ffd27a', 'teal', 'cyan', 'blue', 'pink', 'navy'];
  const GOLD = '#ffd27a';
  const ANC = ['π ≈ 22/7', 'φ = (1+√5)/2', 'a² + b² = c²', '√2 ≈ 1;24,51,10', 'ΕΥΡΗΚΑ', '360° = 6 × 60', 'MMXXVI', 'ΑΡΧΕΙΟΝ', '1 + 2 + 3 + 4 = 10', 'ΓΕΩΜΕΤΡΙΑ'];
  const ancRing = (o, t, R, y, c, tl = 0.35) => range(10).forEach((k) => { const q = orb(R, t * 0.07 + (k * TAU) / 10, tl, 0.6); o['eq' + k] = { p: [q[0], q[1] + y, q[2]], str: ANC[k], s: 0.14, c }; });
  const X = { dot, wrapA, hull3, solidOf, PLATO, frus4, OBF, obV, prism, card, RT, onCard, BC, RAIN, GOLD, ANC, ancRing };

  // ===== 1) ピラミッド：169個の石が、空の渦から飛んできて、下の段から順に積み上がる =====
  const PB = 0.24, Y0 = -1.7, NL = 7, HB = 1.8, HP = HB * Math.tan(51.84 * PI / 180), FL = 0.62;
  const PPAL = [['#2b3566', '#141b3a', '#5c6aa8'], ['#fff4ea', '#e9cdb8', '#ffffff'], ['#3fc6c2', '#0d7d7a', '#9ae8e4'], ['#ffe1d2', '#d9a58c', '#fff4ea'], ['#5c5cff', '#1d1dc0', '#9ad7ff'], ['#fff4ea', '#e9cdb8', '#ffffff'], ['#ffd27a', '#c99a2e', '#fff0c2'], ['#0b1026', '#05081a', '#1b2347'], ['#ff7a4c', '#b83a12', '#ffb08a']];
  const BLK = [];
  range(NL).forEach((L) => { const n = 13 - 2 * L, h = (n - 1) / 2, cells = [];
    if (n === 1) cells.push([0, 0]); else range(n).forEach((i) => range(n).forEach((j) => { if (i === 0 || j === 0 || i === n - 1 || j === n - 1) cells.push([i - h, j - h]); }));
    cells.sort((p, q) => Math.atan2(p[1], p[0]) - Math.atan2(q[1], q[0]));
    cells.forEach(([i, j], m) => BLK.push({ L, P: [i * PB, Y0 + PB / 2 + L * PB, j * PB], ci: m % 4 === 0 && L < 6 ? (L % 2 ? 8 : 1) : L })); });
  BLK.forEach((k, i) => { k.tl = 0.35 + i * 0.0162; k.a0 = i * 2.39996; k.vr = 2.2 + 0.8 * rnd(i * 3 + 1); k.vh = Y0 + 3.1 + 1.1 * rnd(i * 5 + 2); });
  const LV0 = range(NL).map((L) => BLK.find((k) => k.L === L).tl);
  const vort = (k, i, tt) => { const a = k.a0 + tt * 0.9; return [Co(a) * k.vr, k.vh + 0.12 * S(tt * 2 + i), S(a) * k.vr]; };

  const shots = [
    { // 1) ピラミッド：空の渦をまわる石が、1つずつ飛んできて段を作る。最後にガラスの外装がかぶさり、金の冠石がのると、光の柱が空へ
      name: 'PYRAMID', bg: 'orange', sel: 'fl0',
      cam: (tb, t) => { const k = tb > 4.1 ? Math.exp(-(tb - 4.1) * 4.5) : 0; return { pitch: 0.5 - 0.22 * io(cl(tb / 3.2)) + 0.05 * S(t * 0.4), dist: 10.6, zoom: 1.06 + 0.12 * io(cl((tb - 3) / 2)) + 0.06 * k, t: [0, -0.85 + 0.6 * io(cl(tb / 3.4)) + 0.04 * k * S((tb - 4.1) * 47), 0], roll: 0.035 * k * S((tb - 4.1) * 55) }; },   // 冠石がのった瞬間に、画面がゆれる
      act: (t, tb) => {
        const o = {}, items = [], hb = PB * 0.47, apex = [0, Y0 + HP, 0]; let landed = 0;
        BLK.forEach((k, i) => {
          const tL = k.tl - FL; let p, ry = 0, rx = 0, lay = 2 * k.L;
          if (tb < tL) { p = vort(k, i, tb); ry = tb * 1.3 + i; rx = tb * 0.9 + i * 0.5; lay = 100; }
          else if (tb < k.tl) { const u = (tb - tL) / FL, e = 1 - Math.pow(1 - u, 3), s0 = vort(k, i, tL), w = 1 - e; p = lerp3(s0, k.P, e); p[1] += S(PI * u) * 0.55 * w; ry = wrapA(tL * 1.3 + i) * w; rx = wrapA(tL * 0.9 + i * 0.5) * w; lay = 100; }
          else { p = k.P; landed++; }
          items.push([p[0], p[1], p[2], hb, hb, hb, k.ci, ry, rx, lay]);
        });
        range(NL - 1).forEach((L) => { const n = 11 - 2 * L, g = io(cl((tb - LV0[L]) / 0.3)); if (n < 1 || g <= 0) return; items.push([0, Y0 + (L + 1) * PB - 0.004, 0, (n * PB * g) / 2, 0.004, (n * PB * g) / 2, 7, 0, 0, 2 * L + 1]); });   // 段の内側のふた
        o.cb0 = { items, pal: PPAL, zp: [0, Y0 + 0.6, 0] };
        const hc = HP * io(cl((tb - 3.05) / 0.8));   // ガラスの外装（下から上へ）
        if (hc > 0.01) { const f = frus4(HB + 0.04, (HB + 0.04) * (1 - hc / HP), hc); o.so0 = { p: [0, Y0, 0], V: f.V, F: f.F, c: 'white', alpha: 0.36, edge: 'white', elw: 1.3, two: 1, z: 4 }; }
        const dc = 1 - io(cl((tb - 3.55) / 0.55)), cap = frus4(0.245, 0, 0.31);   // 金の冠石
        o.so1 = { p: [0, Y0 + HP - 0.305 + 1.9 * dc, 0], r: [0, t * 0.6 * dc, 0], V: cap.V, F: cap.F, c: GOLD, edge: 'white', elw: 1.2, z: 5 };
        const hit = tb - 4.1;
        o.gw0 = { p: [0, 1.5, 0], scr: [1.5, 1.0, -4.6], w: 1.05, c: 'white', c2: GOLD, rays: 20, rl: 2.5, rw: 0.045, ra: t * 0.12, alpha: 0.85, z: -20 };   // 太陽
        o.fl0 = { p: [0, 1.5, 0], scr: [1.5, 1.0, -4.62], bill: 1, shape: 'circle', w: 0.62, g: ['white', GOLD], ga: PI / 2, z: -19 };
        if (hit > 0) {
          const g = io(cl(hit / 0.45)), u = cl(hit / 0.55);
          o.bm0 = { a: [0, apex[1] + 0.05, 0], b: [0, apex[1] + 0.05 + 6.5 * g, 0], ra: 0.05, rb: 0.75, c: 'white', c2: GOLD, alpha: 0.95, zp: apex, z: 6 };
          o.gw1 = { p: [apex[0], apex[1] + 0.05, apex[2]], w: 0.3 + 0.15 * S(t * 9), c: 'white', c2: GOLD, rays: 12, rl: 3, rw: 0.08, ra: -t * 0.5, z: 7 };
          [[1, 1], [1, -1], [-1, -1], [-1, 1]].forEach(([a, b], n) => { o['gw' + (2 + n)] = { p: lerp3(apex, [a * HB, Y0, b * HB], io(u)), w: 0.13, c: 'white', c2: GOLD, alpha: 1 - 0.6 * u, z: 6 }; });
          range(3).forEach((n) => { const v = cl((hit - 0.4 - n * 0.16) / 1.1); if (v > 0 && v < 1) o['r' + n] = { p: [0, Y0 + 0.01, 0], r: FLOOR, w: HB * 1.3 + v * 3.2, c: n === 1 ? 'navy' : 'cream', lw: 2, alpha: 1 - v }; });
        }
        // 寸法の線と数字
        const segs = [[[-HB, Y0, HB + 0.3], [HB, Y0, HB + 0.3]], [[-HB, Y0, HB + 0.2], [-HB, Y0, HB + 0.4]], [[HB, Y0, HB + 0.2], [HB, Y0, HB + 0.4]], [[HB + 0.35, Y0, HB + 0.35], [HB + 0.35, Y0 + HP, HB + 0.35]]];
        for (let y = 0; y <= HP + 1e-6; y += HP / 8) segs.push([[HB + 0.35, Y0 + y, HB + 0.35], [HB + 0.5, Y0 + y, HB + 0.35]]);
        o.ln0 = { segs, c: 'navy', lw: 1.2, alpha: 0.85, zp: [HB, Y0, HB] };
        o.ln1 = { pts: [apex, [HB + 0.35, apex[1], HB + 0.35]], c: 'navy', lw: 1, alpha: 0.7, dash: [4, 4], doff: -t * 20, zp: apex };
        o.sc0 = { p: [0, Y0 + 0.01, HB + 0.04], r: [0, PI / 2, 0], ro: 0.5, ri: 0, a0: 0, a1: (51.84 * PI) / 180, c: GOLD, alpha: 0.9 };
        o.tx0 = { p: [0, apex[1] + 0.95, 0], str: 'GIZA · KHUFU · c. 2560 BC', s: 0.13, c: 'navy' };
        o.tx1 = { p: [0, apex[1] + 0.7, 0], str: 'BLOCK ' + String(landed).padStart(3, '0') + ' / 169 · ≈ 2,300,000', s: 0.1, c: 'navy' };
        o.tx2 = { p: [0, Y0 - 0.15, HB + 0.55], str: '230.3 m', s: 0.11, c: 'navy' };
        o.tx3 = { p: [HB + 0.55, Y0 + HP * 0.5, HB + 0.55], str: '146.6 m', s: 0.11, c: 'navy' };
        o.tx4 = { p: [0, Y0 + 0.32, HB + 0.5], str: '51.84°', s: 0.1, c: 'cream' };
        o.tx5 = { p: [-HB - 0.4, Y0 + 1.6, -HB], str: '4b / h = 2π', s: 0.12, c: 'cream' };
        range(8).forEach((i) => { const a = ang(i, 8, PI / 8 + t * 0.05), h = 0.5 + 0.9 * Math.abs(S(t * 1.6 + i * 0.8)); o['so' + (2 + i)] = { p: [Co(a) * 3.35, Y0, S(a) * 3.35], r: [0, -a, 0], V: obV(h), F: OBF, c: i % 3 === 1 ? 'navy' : i % 3 === 2 ? 'teal' : 'cream', edge: i % 3 === 0 ? '#e9cdb8' : null }; });   // オベリスク（音に合わせるように）
        const sand = []; range(220).forEach((i) => { const sp = 0.5 + rnd(i * 7) * 0.9, x = fr(rnd(i * 3 + 1) + t * sp * 0.11) * 10 - 5, z = (rnd(i * 5 + 2) - 0.5) * 8, zz = Math.abs(z) < 2.3 && Math.abs(x) < 2.3 ? Math.sign(z || 1) * 2.3 + z * 0.3 : z; sand.push(x, Y0 + 0.04 + 0.35 * rnd(i * 11) + 0.08 * S(t * 3 + i), zz); });
        o.du0 = { pts: sand, size: 0.028, c: 'cream', alpha: 0.75, z: -40 };
        ancRing(o, t, 4.2, 1.3, 'navy', 0.3);
        spin(o, 0, 8, 4.0, Y0 + 0.4, t, -t * 0.15, 0.26, 0.2);
        lane(o, 't', 0, 14, 4.9, 1.9, 0.35, t * 0.04, -t * 0.2, () => ({ w: 0.15 }));
        o.dots0 = { p: [0, Y0, 0], r: FLOOR, c: 'navy', alpha: 0.35 }; o.r3 = { p: [0, Y0, 0], r: FLOOR, w: 2.9, c: 'cream', alpha: 0.6 };
        return o;
      }
    }
  ];
  const more = (f) => (typeof f === 'function' ? f(K, X, A) : []);   // ほかのファイルのショット（無いときは飛ばす）
  return { shots: shots.concat(more(window.OC_HERO_ANC2), more(window.OC_HERO_ANC3), more(window.OC_HERO_ANC4)), actors: A };
};
