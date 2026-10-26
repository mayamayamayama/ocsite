// hero.js — 入場画面のメインビジュアル（3Dエンジンの本体）
// 3Dの空間に置いた物体を、動くカメラで撮った、1本の長いループです。
// 平らなポスターに見えていたものが、カメラが回り込むと立体だったと分かる…という、2Dと3Dの入れ替えをくり返します。
// 物体の一覧とショット 1〜4 は hero-scenes.js、ショット 5〜8 は hero-scenes2.js、3Dの部品は hero-parts.js にあります。
// マウスを動かすと（スマホは傾けると）、カメラが少し回り込みます。

(function () {
  const hero = document.getElementById('hero-main');
  if (!hero) return;
  (window.OC_LOADED = window.OC_LOADED || []).push('hero');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  const filesOK = typeof window.OC_HERO_PARTS === 'function' && typeof window.OC_HERO_SCENES === 'function';
  if (!cssOK || !filesOK) { hero.style.display = 'none'; document.body.classList.add('is-after'); return; }   // 必要なファイルが読み込めていないときは、動かさない
  const cv = document.getElementById('hero-cv');
  const ctx = cv.getContext('2d');
  // style.css が古いままでも暴走しないように、大事な指定はここでも行う
  hero.style.cssText += ';position:relative;box-sizing:border-box;overflow:hidden;width:100vw;height:calc(100vh + 240px);height:calc(100svh + 240px);min-height:660px;padding-bottom:240px;background:#fde9dc';
  cv.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block';
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const SHOT_SEC = 4.8;       // 1つのショットの長さ（秒）
  const MOVE_SEC = 1.5;       // 次のショットへ、物体が動くのにかける時間（秒）
  const TILT = 1;             // マウスや傾きで、カメラが回り込む強さ（0で動かない）
  const CHROMA = 1.3;         // 色収差（ふちの水色と桃色のずれ）の幅。0で無し
  const GRAIN = 0.32;         // フィルムの粒子の強さ（0で無し）
  const VIGNETTE = 0.22;      // 画面のふちを、少し暗くする強さ（0で無し）
  const GIZMO = true;         // 3Dの軸や、選択枠などの飾り
  const GRID = true;          // 床の方眼（3Dの空間の広さが分かる）
  const CALLOUT = true;       // 物体から線を引いて、名前と色を書く注釈
  const MINIMAP = true;       // 真上から見た図（右下の小さな四角）
  const BIG_NUM = true;       // 奥に浮かぶ、ショット番号の大きな縁取り文字
  const SCALE_TALL = 1.3;     // スマホ（縦長の画面）での、物体の大きさ
  const SCALE_WIDE = 1.08;    // パソコン（横長の画面）での、物体の大きさ
  const NOISE_H = 240;        // 下にノイズが重なる高さ（effects.js と同じ数字）
  const PAL = { cream: '#fde9dc', teal: '#14a39f', orange: '#fa8c14', verm: '#e8501e', navy: '#141b3a', blue: '#2a2aff', pink: '#ff2fa0', peach: '#ff9a76', cyan: '#00f0ff', white: '#fffaf4', black: '#1b1b1b' };
  const INK = { cream: PAL.navy, teal: PAL.cream, orange: PAL.navy, verm: PAL.cream, navy: PAL.cream, '#ececec': PAL.navy };   // 背景の色ごとの、文字の色

  const TAU = Math.PI * 2;
  const pad = (n, l = 2) => String(Math.floor(Math.abs(n))).padStart(l, '0');
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const wrapD = (d) => d - TAU * Math.round(d / TAU);   // 角度の差を、いちばん近い回り方にする
  const eIn = (t) => t * t * t;
  const eIO = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const eBack = (t) => { const c1 = 1.4, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };
  const col = (c) => PAL[c] || c;

  // ---------- 大きな文字（1文字ずつ、下からせり上がる） ----------
  hero.querySelectorAll('[data-t]').forEach((line) => {
    [...line.dataset.t].forEach((ch, i) => {
      const o = document.createElement('span'); o.className = 'ch'; o.setAttribute('aria-hidden', 'true');
      const s = document.createElement('span'); s.textContent = ch; s.style.setProperty('--i', i + (line.classList.contains('hm-l2') ? 2 : 0));
      o.appendChild(s); line.appendChild(o);
    });
  });
  setTimeout(() => hero.classList.add('is-in'), 150);
  const titleEls = [hero.querySelector('.hm-title'), hero.querySelector('.subtitle')].filter(Boolean);
  titleEls.forEach((el) => { el.style.transition = 'color .35s'; });

  // ---------- 3Dのカメラ ----------
  let W = 0, H = 0, FH = 0, M = 1, SC = 1, CX = 0, CY = 0, dpr = 1, visible = true, grainPat = null;
  const G = { ctx, PAL, tx: 0, ty: 0, f: 1, dpr: 1, CA: 0, camPos: [0, 0, 10] };
  let fw = [0, 0, -1], rt = [1, 0, 0], up = [0, 1, 0], rollC = 1, rollS = 0;
  function setCam(c) {
    const cp = Math.cos(c.pitch), pos = [c.t[0] + c.dist * Math.sin(c.yaw) * cp, c.t[1] + c.dist * Math.sin(c.pitch), c.t[2] + c.dist * Math.cos(c.yaw) * cp];
    const d = [c.t[0] - pos[0], c.t[1] - pos[1], c.t[2] - pos[2]], n = Math.hypot(...d); fw = d.map((v) => v / n);
    const r = [-fw[2], 0, fw[0]], rn = Math.hypot(...r) || 1; rt = r.map((v) => v / rn);
    up = [rt[1] * fw[2] - rt[2] * fw[1], rt[2] * fw[0] - rt[0] * fw[2], rt[0] * fw[1] - rt[1] * fw[0]];
    G.camPos = pos; G.f = M * SC * 0.11 * c.dist * c.zoom; rollC = Math.cos(c.roll || 0); rollS = Math.sin(c.roll || 0);
  }
  G.proj = (p) => {
    const d0 = p[0] - G.camPos[0], d1 = p[1] - G.camPos[1], d2 = p[2] - G.camPos[2];
    const zc = d0 * fw[0] + d1 * fw[1] + d2 * fw[2], xc = d0 * rt[0] + d1 * rt[1] + d2 * rt[2], yc = d0 * up[0] + d1 * up[1] + d2 * up[2];
    const k = G.f / Math.max(zc, 0.05), X = xc * k, Y = -yc * k;
    return [CX + X * rollC - Y * rollS, CY + X * rollS + Y * rollC, zc];
  };

  // ---------- 部品とショットを読み込む ----------
  const T = window.OC_HERO_PARTS(G);
  const SH = [].concat(window.OC_HERO_SCENES(), typeof window.OC_HERO_SCENES2 === 'function' ? window.OC_HERO_SCENES2() : []);
  const ACT = window.OC_HERO_ACTORS || {};
  const NS = SH.length, LOOP = NS * SHOT_SEC;
  const morph = {}; Object.keys(ACT).forEach((id) => { morph[id] = new Float32Array(T.N); });

  // ---------- 傾き（マウス → スマホの傾き → 自動のゆらゆら、の順に使う） ----------
  const tilt = { mx: 0, my: 0, mt: -1e9, ox: 0, oy: 0, ot: -1e9 };
  const cl = (v) => Math.max(-1, Math.min(1, v));
  window.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    tilt.mx = cl((ev.clientX / window.innerWidth - 0.5) * 2); tilt.my = cl((ev.clientY / window.innerHeight - 0.5) * 2); tilt.mt = performance.now();
  }, { passive: true });
  window.addEventListener('deviceorientation', (ev) => {
    if (ev.gamma == null || ev.beta == null) return;
    tilt.ox = cl(ev.gamma / 30); tilt.oy = cl((ev.beta - 45) / 30); tilt.ot = performance.now();
  }, { passive: true });
  function updateTilt(now, T0) {
    let tx, ty;
    if (now - tilt.mt < 4000) { tx = tilt.mx; ty = tilt.my; }
    else if (now - tilt.ot < 1500) { tx = tilt.ox; ty = tilt.oy; }
    else { tx = Math.sin(T0 * 0.37) * 0.5; ty = Math.sin(T0 * 0.23 + 1) * 0.4; }   // 何もしていないときは、自動でゆらゆら
    G.tx += (tx * TILT - G.tx) * 0.05; G.ty += (ty * TILT - G.ty) * 0.05;
  }

  // ---------- 2つの状態のあいだを、なめらかにつなぐ ----------
  const ANG = { sa: 1, ga: 1, a0: 1 };
  function full(id, st) { return st ? Object.assign({ p: [0, 0, 0], r: [0, 0, 0], s: 1, w: 1, sx: 1, sy: 1, ga: 0, sa: 0 }, ACT[id], st) : null; }
  function blend(A, B, p, pc) {
    const o = {};
    for (const k in B) {
      const a = A[k], b = B[k];
      if (typeof b === 'number' && typeof a === 'number') o[k] = ANG[k] ? a + wrapD(b - a) * p : lerp(a, b, p);
      else if (k === 'r' && a) o[k] = [a[0] + wrapD(b[0] - a[0]) * p, a[1] + wrapD(b[1] - a[1]) * p, a[2] + wrapD(b[2] - a[2]) * p];
      else if (k === 'p' && a) o[k] = [lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p)];
      else o[k] = pc < 0.5 && a !== undefined ? a : b;
    }
    for (const k in A) if (!(k in o)) o[k] = A[k];
    return o;
  }
  function camAt(shot, tb, T0) { return Object.assign({ yaw: 0, pitch: 0, dist: 10, zoom: 1, t: [0, 0, 0], roll: 0 }, shot.cam(tb, T0)); }

  // ---------- 1つの物体を描く ----------
  function draw(o, T0) {
    if (o.s < 0.01) return;
    if (o.type === 'flat') T.flat(o, T0);
    else if (o.type === 'coin') T.coin(o, T0);
    else if (o.type === 'box') T.box(o);
    else if (o.type === 'sphere') T.sphere(o);
    else if (o.type === 'lines') T.lines(o, T0);
    else if (o.type === 'aster') T.asterisk(o);
    else if (o.type === 'text') T.text(o);
    else if (o.type === 'strip') T.strip(o, T0);
  }

  // ---------- 飾り：3Dの軸・選択枠 ----------
  function gizmo(ink) {
    const o = G.proj([0, 0, 0]); if (o[2] < 0.3) return;
    [[[1, 0, 0], PAL.verm, 'X'], [[0, 1, 0], PAL.teal, 'Y'], [[0, 0, 1], PAL.blue, 'Z']].forEach(([v, c, n]) => {
      const q = G.proj([v[0] * 0.9, v[1] * 0.9, v[2] * 0.9]); ctx.strokeStyle = c; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
      T.label(n, q[0] + 4, q[1], c, 8);
    });
    ctx.fillStyle = ink; ctx.fillRect(o[0] - 2, o[1] - 2, 4, 4);
  }
  function selBox(o, id, ink, bgc) {
    let e;
    if (o.type === 'flat') e = [o.w * o.sx, o.w * o.sy, 0.05]; else if (o.type === 'coin') e = [o.w, o.w, o.d / 2];
    else if (o.type === 'box') e = [o.bw / 2, o.bh / 2, o.bd / 2]; else if (o.type === 'strip') e = [o.w / 2, o.h / 2, 0.05]; else return;
    const B = T.basis(o.r), P = [];
    for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) P.push(G.proj(T.W3(o, B, x * e[0] * 1.06, y * e[1] * 1.06, z * e[2] * 1.06)));
    if (P.some((q) => q[2] < 0.3)) return;
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = 0.85; ctx.beginPath();
    [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => { ctx.moveTo(P[a][0], P[a][1]); ctx.lineTo(P[b][0], P[b][1]); });
    ctx.stroke();
    P.forEach((q) => { ctx.fillStyle = bgc; ctx.fillRect(q[0] - 2.5, q[1] - 2.5, 5, 5); ctx.strokeRect(q[0] - 2.5, q[1] - 2.5, 5, 5); });
    const top = P.reduce((a, q) => (q[1] < a[1] ? q : a), P[0]);
    labelIn(`3D LAYER — ${id}  [${o.p.map((v) => v.toFixed(1)).join(', ')}]`, top[0] + 8, top[1] - 10, ink, 8);
    ctx.globalAlpha = 1;
  }

  // 画面からはみ出さないように、位置をずらして文字を書く
  const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, monospace';
  function labelIn(str, x, y, c, size) {
    ctx.font = `600 ${size}px ${MONO}`; const w = ctx.measureText(str).width + str.length * 1.4;
    T.label(str, Math.max(14, Math.min(x, W - 30 - w)), Math.max(14, y), c, size);
  }
  // 3Dの線分を、カメラの後ろに回り込んだ部分を切り落としてから描く
  function seg3(a, b) {
    const za = (a[0] - G.camPos[0]) * fw[0] + (a[1] - G.camPos[1]) * fw[1] + (a[2] - G.camPos[2]) * fw[2];
    const zb = (b[0] - G.camPos[0]) * fw[0] + (b[1] - G.camPos[1]) * fw[1] + (b[2] - G.camPos[2]) * fw[2], NEAR = 0.4;
    if (za < NEAR && zb < NEAR) return;
    if (za < NEAR) { const k = (NEAR - za) / (zb - za); a = [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k)]; }
    if (zb < NEAR) { const k = (NEAR - zb) / (za - zb); b = [lerp(b[0], a[0], k), lerp(b[1], a[1], k), lerp(b[2], a[2], k)]; }
    const p = G.proj(a), q = G.proj(b); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]);
  }
  // 床の方眼
  function grid(ink, dist) {
    const Y = -3.05, R = 10, a = clamp01((28 - dist) / 10);   // 正面から遠くで見ている（平らな絵の）ときは、消える
    if (a <= 0) return;
    ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.globalAlpha = 0.11 * a; ctx.beginPath();
    for (let v = -R; v <= R; v++) { seg3([v, Y, -R], [v, Y, R]); seg3([-R, Y, v], [R, Y, v]); }
    ctx.stroke(); ctx.globalAlpha = 0.3 * a; ctx.beginPath(); seg3([-R, Y, 0], [R, Y, 0]); seg3([0, Y, -R], [0, Y, R]); ctx.stroke(); ctx.globalAlpha = 1;
  }
  // 物体から線を引いて、名前と色を書く
  function callout(o, ink, side, fade) {
    const c = G.proj(o.p); if (c[2] < 0.3 || c[0] < 0 || c[0] > W || c[1] < 90 || c[1] > FH - 60) return;
    if (side > 0 && c[0] + 34 + 74 + 70 > W - 14) side = -1; else if (side < 0 && c[0] - 34 - 74 < 14) side = 1;   // はみ出すなら、反対側に出す
    const dx = side * 34, x1 = c[0] + dx, y1 = c[1] - 30, L = 74, x2 = x1 + side * L;
    ctx.globalAlpha = fade; ctx.strokeStyle = ink; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(c[0], c[1], 3.5, 0, TAU); ctx.moveTo(c[0] + side * 3, c[1] - 3); ctx.lineTo(x1, y1); ctx.lineTo(x2, y1); ctx.stroke();
    const seg0 = o.segs ? [].concat(o.segs[1][1])[0] : null;
    const sw = o.segs ? `${o.segs.length} SEG` : o.holo ? 'HOLOGRAM' : o.g ? 'GRADIENT' : o.glass ? 'GLASS' : o.type === 'sphere' ? 'CHROME' : String(col(o.c || ink)).toUpperCase();
    const kind = (o.type === 'flat' ? 'PLANE/' + (typeof o.shapeName === 'string' ? o.shapeName : '') : o.type).toUpperCase();
    const lx = side > 0 ? x1 : x2;
    ctx.fillStyle = seg0 ? col(seg0) : o.holo ? PAL.pink : o.g ? col(o.g[o.g.length - 1]) : o.type === 'sphere' ? '#bdbdbd' : col(o.c || ink); ctx.fillRect(lx, y1 - 18, 8, 8); ctx.strokeRect(lx, y1 - 18, 8, 8);
    T.label(o.id.toUpperCase(), lx + 12, y1 - 14, ink, 8);
    T.label(`${kind} · ${sw}`, lx, y1 + 9, ink, 7);
    ctx.globalAlpha = 1;
  }
  // 真上から見た図
  function minimap(items, ink, cam) {
    const S = W < FH ? 78 : 118, x0 = W < FH ? W - 20 - S - 34 : W - 20 - S - 30, y0 = W < FH ? 112 : FH - 70 - S, k = S / 14;
    const mx = (x) => x0 + S / 2 + Math.max(-7, Math.min(7, x)) * k, my = (z) => y0 + S / 2 + Math.max(-7, Math.min(7, z)) * k;
    ctx.globalAlpha = 0.5; ctx.strokeStyle = ink; ctx.lineWidth = 1; ctx.strokeRect(x0 + 0.5, y0 + 0.5, S, S);
    ctx.globalAlpha = 0.14; ctx.beginPath(); for (let n = 1; n < 4; n++) { ctx.moveTo(x0 + (S * n) / 4, y0); ctx.lineTo(x0 + (S * n) / 4, y0 + S); ctx.moveTo(x0, y0 + (S * n) / 4); ctx.lineTo(x0 + S, y0 + (S * n) / 4); } ctx.stroke();
    ctx.globalAlpha = 1; T.label(`TOP · ${items.length}`, x0, y0 - 9, ink, 7);
    items.forEach(({ o }) => {
      if (o.s < 0.05 || o.z) return;
      const r = Math.max(1.5, Math.min(5, (o.w || 1) * (o.sx || 1) * o.s * 2.2));
      ctx.fillStyle = o.holo ? PAL.pink : o.g ? col(o.g[0]) : col(o.c || ink); ctx.fillRect(mx(o.p[0]) - r / 2, my(-o.p[2]) - r / 2, r, r);
    });
    const cx = mx(G.camPos[0]), cz = my(-G.camPos[2]), tx = mx(cam.t[0]), tz = my(-cam.t[2]), a = Math.atan2(tz - cz, tx - cx);   // カメラと、写っている範囲
    ctx.save(); ctx.beginPath(); ctx.rect(x0, y0, S, S); ctx.clip();
    ctx.strokeStyle = PAL.verm; ctx.globalAlpha = 0.9; ctx.beginPath();
    ctx.moveTo(cx, cz); ctx.lineTo(cx + Math.cos(a - 0.45) * S * 0.7, cz + Math.sin(a - 0.45) * S * 0.7);
    ctx.moveTo(cx, cz); ctx.lineTo(cx + Math.cos(a + 0.45) * S * 0.7, cz + Math.sin(a + 0.45) * S * 0.7); ctx.stroke();
    ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(cx, cz, 3, 0, TAU); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1;
  }

  // ---------- 情報の文字 ----------
  function hud(shot, k, tb, loopT, ink, T0, cam) {
    const m = 20, y1 = 58, fr = Math.floor(T0 * 24), tc = `${pad(T0 / 3600)}:${pad((T0 / 60) % 60)}:${pad(T0 % 60)}:${pad(fr % 24)}`;
    const deg = (r) => pad(((((r * 180) / Math.PI) % 360) + 360) % 360, 3);
    T.label(`SHOT ${pad(k + 1)} / ${pad(NS)} — ${shot.name}`, m, y1, ink, 9);
    T.label(`CAM ${deg(cam.yaw)}° ${deg(cam.pitch)}°  ${Math.round(18 + cam.dist * 3)}mm`, m, y1 + 15, ink, 9);
    T.label('24 FPS', W - m - 44, y1, ink, 9, 'right');
    if (Math.floor(T0 * 1.6) % 2 === 0) { ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(W - m - 34, y1, 3.5, 0, TAU); ctx.fill(); }
    T.label('REC', W - m, y1, ink, 9, 'right');
    T.label(tc, W - m, y1 + 15, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.25; ctx.fillRect(m, y1 + 28, W - m * 2, 1); ctx.globalAlpha = 1; ctx.fillRect(m + (W - m * 2) * (tb / SHOT_SEC) - 1, y1 + 24, 2, 9);
    const rx = W - 12, r0 = y1 + 56, r1 = Math.max(r0 + 60, FH * 0.6);   // 右のものさし（カメラの距離）
    ctx.globalAlpha = 0.7;
    for (let y = r0; y <= r1; y += 6) { const long = Math.round((y - r0) / 6) % 5 === 0; ctx.fillRect(rx - (long ? 8 : 4), y, long ? 8 : 4, 1); }
    const my = r0 + (r1 - r0) * clamp01((cam.dist - 8) / 34);
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(rx - 10, my); ctx.lineTo(rx - 16, my - 4); ctx.lineTo(rx - 16, my + 4); ctx.closePath(); ctx.fill();
    T.label(`Z ${cam.dist.toFixed(1)}`, rx - 19, my, ink, 8, 'right');
    const yb = FH - 28, span = W - m * 2;   // 下：ループ全体の進み具合
    T.label(`LOOP ${LOOP.toFixed(1)}s ▶`, m, yb - 16, ink, 9);
    T.label(`TILT ${G.tx >= 0 ? '+' : ''}${G.tx.toFixed(2)} ${G.ty >= 0 ? '+' : ''}${G.ty.toFixed(2)}`, W - m, yb - 16, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(m, yb, span, 2); ctx.globalAlpha = 1; ctx.fillRect(m, yb, span * (loopT / LOOP), 2);
    for (let n = 1; n < NS; n++) ctx.fillRect(m + span * (n / NS), yb - 3, 1, 8);
  }

  // ---------- 1コマを描く ----------
  let start = performance.now(), lastGrain = 0, gx = 0, gy = 0, inkNow = '', strokeNow = '';
  // 重い端末では、自動で質感を軽くする（0：全部 → 1：粒子とふちの暗さを省く → 2：解像度を下げる）
  let Q = 0, autoQ = true, dtAvg = 16.7, lastNow = 0, runT = 0;
  window.OC_HERO = { seek(sec) { start = performance.now() - sec * 1000; }, setQ(q) { Q = q; autoQ = false; build(); }, get Q() { return Q; }, SHOT_SEC, NS };   // （確認用）
  function frame(now) {
    if (!W) return;
    const T0 = REDUCE ? SHOT_SEC * 1 + 3 : (now - start) / 1000;
    updateTilt(now, T0);
    const loopT = ((T0 % LOOP) + LOOP) % LOOP, k = Math.min(NS - 1, Math.floor(loopT / SHOT_SEC)), tb = loopT - k * SHOT_SEC;
    const cur = SH[k], prv = SH[(k - 1 + NS) % NS], wipe = prv.bg !== cur.bg && tb < 0.9;
    const bgShow = wipe && tb < 0.4 ? prv.bg : cur.bg, ink = INK[bgShow] || PAL.navy;   // 色が広がりきる少し前に、文字の色を変える

    // カメラ（前のショットのカメラから、今のショットのカメラへ）
    const ca = camAt(prv, tb + SHOT_SEC, T0), cb = camAt(cur, tb, T0), qc = eIO(clamp01(tb / 1.8));
    const cam = { yaw: ca.yaw + wrapD(cb.yaw - ca.yaw) * qc, pitch: lerp(ca.pitch, cb.pitch, qc), dist: Math.exp(lerp(Math.log(ca.dist), Math.log(cb.dist), qc)), zoom: lerp(ca.zoom, cb.zoom, qc), t: ca.t.map((v, n) => lerp(v, cb.t[n], qc)), roll: lerp(ca.roll, cb.roll, qc) };
    cam.yaw += G.tx * 0.16; cam.pitch += G.ty * 0.1;
    setCam(cam);

    // 背景（色が変わるときは、真ん中から丸く広がる）
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
    if (wipe) {
      ctx.fillStyle = col(prv.bg); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = col(cur.bg); ctx.beginPath(); ctx.arc(CX, CY, eIO(tb / 0.9) * Math.hypot(W, H), 0, TAU); ctx.fill();
    } else { ctx.fillStyle = col(cur.bg); ctx.fillRect(0, 0, W, H); }

    // 物体（前のショットの状態から、今のショットの状態へ）
    const SA = prv.act(T0, tb + SHOT_SEC) || {}, SB = cur.act(T0, tb) || {}, items = [];
    let n = 0;
    new Set(Object.keys(SA).concat(Object.keys(SB))).forEach((id) => {
      if (!ACT[id]) return;
      let A = full(id, SA[id]), B = full(id, SB[id]);
      const appear = !A, vanish = !B;
      if (appear) A = Object.assign({}, B, { s: 0 });
      if (vanish) B = Object.assign({}, A, { s: 0 });
      const q = clamp01((tb - Math.min(0.6, n++ * 0.03)) / MOVE_SEC), p = eIO(q);
      const o = blend(A, B, p, p);
      o.s = Math.max(0, lerp(A.s, B.s, appear ? eBack(q) : vanish ? eIn(q) : p));
      if (o.type === 'flat') {
        o.shapeName = p < 0.5 ? A.shape : B.shape;
        const ra = T.SHAPES[A.shape] || T.SHAPES.circle, rb = T.SHAPES[B.shape] || T.SHAPES.circle, r = morph[id];
        for (let i = 0; i < T.N; i++) r[i] = ra[i] + (rb[i] - ra[i]) * p;
        o.shape = r;
      }
      o.id = id;
      items.push({ z: G.proj(o.p)[2] - (o.z || 0), o });
    });
    if (BIG_NUM) {   // 奥に浮かぶ、ショット番号（少しだけカメラの方を向く）
      const bn = { type: 'text', str: pad(k + 1), p: [1.4, 0.4, -5.5], r: [0, wrapD(cam.yaw) * 0.6, 0], s: 7, c: ink, alpha: 0.4, id: 'num' };
      items.push({ z: G.proj(bn.p)[2] + 100, o: bn });
    }
    if (GRID) grid(ink, cam.dist);
    items.sort((a, b) => b.z - a.z);
    items.forEach((it) => draw(it.o, T0));

    if (GIZMO && !REDUCE) {
      if (cam.dist < 20) gizmo(ink);
      if (CALLOUT && tb > 1.9) {
        const ks = Object.keys(SB).filter((id) => id !== cur.sel && ACT[id] && ACT[id].type !== 'lines' && ACT[id].type !== 'text' && !ACT[id].z), fade = clamp01((tb - 1.9) / 0.4) * clamp01((SHOT_SEC - tb) / 0.3);
        [ks[1], ks[ks.length - 2]].forEach((id, n) => { const it = id && items.find((q) => q.o.id === id); if (it) callout(it.o, ink, it.o.p[0] > cam.t[0] - 0.3 ? 1 : -1, fade); });
      }
      if (MINIMAP) minimap(items, ink, cam);
      if (cur.sel && tb > 1.7) { const it = items.find((q) => q.o.id === cur.sel); if (it && it.o.s > 0.9) selBox(it.o, cur.sel, ink, col(cur.bg)); }
    }

    // 画面全体の質感：ふちを暗く、フィルムの粒子
    if (VIGNETTE > 0 && Q < 1) {
      const g = ctx.createRadialGradient(W / 2, FH * 0.45, 