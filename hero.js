// hero.js — 入場画面のメインビジュアル（3Dエンジンの本体）
// 3Dの空間の物体のまわりを、カメラが回り続ける1本の長いループです。
// バージョンはいくつかあり、入場するたびに、前回と違うものがランダムで選ばれます。
//   アドレスの最後に ?hero=名前（main / abstract / mountain / game / physics / ancient / elder）で選べます。
// 3Dの部品は hero-parts.js〜hero-parts4.js、飾りは hero-hud.js にあります。
// バージョンは opts で、背景・飾り・質感を差し替えられます（elder が使います）。
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
  const SHOT_SEC = 5.2;       // 1つのショットの長さ（秒）
  const ORBIT_SEC = 22;       // カメラがまわりを1周する秒数（小さくすると速く回る。マイナスにすると逆回り）
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
  const lum = (h) => { const n = parseInt(String(h).slice(1), 16) || 0; return (0.3 * ((n >> 16) & 255) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255; };

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
    const d = [c.t[0] - pos[0], c.t[1] - pos[1], c.t[2] - pos[2]], n = Math.hypot(...d); fw = d.map((v) => v / n); E.fw = fw;
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
  const T2 = typeof window.OC_HERO_PARTS2 === 'function' ? window.OC_HERO_PARTS2(G, T) : null;
  const T3 = typeof window.OC_HERO_PARTS3 === 'function' ? window.OC_HERO_PARTS3(G, T) : null;
  const T4 = typeof window.OC_HERO_PARTS4 === 'function' ? window.OC_HERO_PARTS4(G, T) : null;
  const VERS = [{ id: 'main', make: () => ({ shots: [].concat(window.OC_HERO_SCENES(), typeof window.OC_HERO_SCENES2 === 'function' ? window.OC_HERO_SCENES2() : []), actors: window.OC_HERO_ACTORS || {} }) }];
  if (T2) Object.keys(window.OC_HERO_VERSIONS || {}).forEach((id) => VERS.push({ id, make: window.OC_HERO_VERSIONS[id] }));
  let V = VERS.find((v) => v.id === (location.search.match(/[?&]hero=(\w+)/) || [])[1]), last = '';
  try { last = localStorage.getItem('oc-hero-ver') || ''; } catch (e) {}
  if (!V) { const pool = VERS.length > 1 ? VERS.filter((v) => v.id !== last) : VERS; V = pool[Math.floor(Math.random() * pool.length)]; }   // 前回と違うものを、ランダムに
  try { localStorage.setItem('oc-hero-ver', V.id); } catch (e) {}
  let made; try { made = V.make({ N: T.N, fromFn: T.fromFn, fromPoly: T.fromPoly, ORBIT_SEC, SHOT_SEC, P4: !!T4, HOOKS: true }); } catch (e) { window.OC_HERO_ERR = V.id + ': ' + (e && e.message); V = VERS[0]; made = VERS[0].make(); }   // 失敗したら、いつもの
  const SH = made.shots, ACT = made.actors, O = made.opts || {};   // O：バージョンごとの差し替え（背景・切り抜き・飾り・質感）
  const shp = (v) => (typeof v === 'string' ? T.SHAPES[v] : v && v.length === T.N ? v : null) || T.SHAPES.circle;   // 形の名前、または形そのもの
  const NS = SH.length, LOOP = NS * SHOT_SEC;
  const E = { W: 0, FH: 0, fw, NS, LOOP, SHOT_SEC };   // 飾り（hero-hud.js）に渡す情報
  const HUD = typeof window.OC_HERO_HUD === 'function' ? window.OC_HERO_HUD(G, T, E) : null;
  const morph = {}; Object.keys(ACT).forEach((id) => { morph[id] = new Float32Array(T.N); });

  // ---------- 傾き（マウス → スマホの傾き → 自動のゆらゆら、の順に使う） ----------
  const tilt = { mx: 0, my: 0, mt: -1e9, ox: 0, oy: 0, ot: -1e9 };
  const cl = (v) => Math.max(-1, Math.min(1, v));
  window.addEventListener('pointermove', (ev) => {
    if (ev.pointerType !== 'mouse') return;
    tilt.mx = cl((ev.clientX / window.innerWidth - 0.5) * 2); tilt.my = cl((ev.clientY / window.innerHeight - 0.5) * 2); tilt.mt = performance.now();
  }, { passive: true });
  let baseB = null, baseG = 0;   // スマホの「ふだんの持ち方」。傾けた分だけを使う（ゆっくり、今の持ち方に合わせ直す）
  window.addEventListener('deviceorientation', (ev) => {
    if (ev.gamma == null || ev.beta == null) return;
    if (baseB === null) { baseB = ev.beta; baseG = ev.gamma; }
    baseB += (ev.beta - baseB) * 0.02; baseG += (ev.gamma - baseG) * 0.02;
    tilt.ox = cl((ev.gamma - baseG) / 15); tilt.oy = cl((ev.beta - baseB) / 15); tilt.ot = performance.now();
  }, { passive: true });
  function updateTilt(now, T0) {
    let tx, ty;
    const sx = Math.sin(T0 * 0.37) * 0.5, sy = Math.sin(T0 * 0.23 + 1) * 0.4;   // 自動のゆらゆら
    if (now - tilt.mt < 4000) { tx = tilt.mx; ty = tilt.my; }
    else if (now - tilt.ot < 1500) { tx = cl(tilt.ox + sx * 0.6); ty = cl(tilt.oy + sy * 0.6); }
    else { tx = sx; ty = sy; }
    G.tx += (tx * TILT - G.tx) * 0.05; G.ty += (ty * TILT - G.ty) * 0.05;
  }

  // ---------- 2つの状態のあいだを、なめらかにつなぐ ----------
  const ANG = { sa: 1, ga: 1 };   // 角度として、近い方へ回す値
  function full(id, st) { return st ? Object.assign({ p: [0, 0, 0], r: [0, 0, 0], s: 1, w: 1, sx: 1, sy: 1, ga: 0, sa: 0, bill: 0, scr: [0, 0, 0] }, ACT[id], st) : null; }
  const numArr = (a, b) => Array.isArray(a) && Array.isArray(b) && a.length === b.length && typeof b[0] === 'number' && typeof a[0] === 'number';
  function blend(A, B, p, pc) {
    const o = {};
    for (const k in B) {
      const a = A[k], b = B[k];
      if (typeof b === 'number' && typeof a === 'number') o[k] = ANG[k] ? a + wrapD(b - a) * p : lerp(a, b, p);
      else if (k === 'r' && numArr(a, b)) o[k] = [a[0] + wrapD(b[0] - a[0]) * p, a[1] + wrapD(b[1] - a[1]) * p, a[2] + wrapD(b[2] - a[2]) * p];
      else if (numArr(a, b)) o[k] = a.map((v, i) => lerp(v, b[i], p));   // 位置など、数字の並び
      else o[k] = pc < 0.5 && a !== undefined ? a : b;
    }
    for (const k in A) if (!(k in o)) o[k] = pc < 0.5 ? A[k] : undefined;   // 前のショットだけにある設定は、途中で消す
    return o;
  }
  function camAt(shot, tb, T0) { return Object.assign({ yaw: 0, pitch: 0, dist: 10, zoom: 1, t: [0, 0, 0], roll: 0, tilt: 1, wob: 1 }, shot.cam(tb, T0)); }   // tilt・wob：マウスの傾きと、距離のゆれの強さ

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
    else if (o.type === 'custom') { if (o.draw) o.draw(ctx, G, o, T0, T); }   // バージョンが自分で描く物
    else if (T2 && T2[o.type]) T2[o.type](o, T0);   // 追加の部品（hero-parts2.js）
    else if (T3 && T3[o.type]) T3[o.type](o, T0);   // さらに追加の部品（hero-parts3.js）
    else if (T4 && T4[o.type]) T4[o.type](o, T0);   // 古代の部品（hero-parts4.js）
  }

  // ---------- 1コマを描く ----------
  let start = performance.now(), lastGrain = 0, gx = 0, gy = 0, inkNow = '', strokeNow = '';
  // 重い端末では、自動で質感を軽くする（0：全部 → 1：粒子・ふちの暗さ・色のずれを省く → 2：解像度を下げる）
  let Q = 0, autoQ = true, dtAvg = 16.7, lastNow = 0, runT = 0;
  window.OC_HERO = { seek(sec) { start = performance.now() - sec * 1000; }, setQ(q) { Q = q; autoQ = false; build(); }, get Q() { return Q; }, SHOT_SEC, NS, version: V.id, vers: VERS.map((v) => v.id), p4: !!T4, hooks: true };   // （確認用）
  function frame(now) {
    if (!W) return;
    const T0 = REDUCE ? SHOT_SEC * 1 + 3 : Math.max(0, (now - start) / 1000);
    updateTilt(now, T0);
    const loopT = ((T0 % LOOP) + LOOP) % LOOP, k = Math.min(NS - 1, Math.floor(loopT / SHOT_SEC)), tb = loopT - k * SHOT_SEC;
    const cur = SH[k], prv = SH[(k - 1 + NS) % NS], wipe = prv.bg !== cur.bg && tb < 0.9;
    const bgShow = wipe && tb < 0.4 ? prv.bg : cur.bg, ink = INK[bgShow] || (lum(col(bgShow)) > 0.5 ? PAL.navy : PAL.cream);   // 色が広がりきる少し前に、文字の色を変える

    // カメラ：横の向きは、いつも同じ速さで回り続ける。高さ・距離・見る場所は、ショットごとに変わる
    const ca = camAt(prv, tb + SHOT_SEC, T0), cb = camAt(cur, tb, T0), qc = O.hard ? 1 : eIO(clamp01(tb / 2.2));   // hard：ショットの切り替えで、すぱっと切る
    const tl = lerp(ca.tilt, cb.tilt, qc), wb = lerp(ca.wob, cb.wob, qc);
    const cam = { yaw: (T0 * TAU) / ORBIT_SEC + lerp(ca.yaw, cb.yaw, qc), pitch: lerp(ca.pitch, cb.pitch, qc), dist: Math.exp(lerp(Math.log(ca.dist), Math.log(cb.dist), qc)) * (1 + 0.05 * wb * Math.sin(T0 * 0.37)),
      zoom: lerp(ca.zoom, cb.zoom, qc), t: ca.t.map((v, n) => lerp(v, cb.t[n], qc)), roll: lerp(ca.roll, cb.roll, qc) };
    cam.yaw += G.tx * 0.3 * tl; cam.pitch = Math.max(-0.25, Math.min(1.45, cam.pitch + G.ty * 0.1 * tl));
    setCam(cam);

    // 背景（色が変わるときは、真ん中から丸く広がる）
    ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; G.CA = Q >= 1 ? 0 : CHROMA;   // 重い端末では、色のずれも省く
    const I = { W, H, FH, CX, CY, T0, tb, k, cur, prv, cam, Q, G, dpr };
    if (O.bg) O.bg(ctx, I);
    else if (wipe) {
      ctx.fillStyle = col(prv.bg); ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = col(cur.bg); ctx.beginPath(); ctx.arc(CX, CY, eIO(tb / 0.9) * Math.hypot(W, H), 0, TAU); ctx.fill();
    } else { ctx.fillStyle = col(cur.bg); ctx.fillRect(0, 0, W, H); }

    // 物体（前のショットの状態から、今のショットの状態へ）
    if (O.clip) { ctx.save(); O.clip(ctx, I); }
    const SA = !O.hard && tb < MOVE_SEC + 0.75 ? prv.act(T0, tb + SHOT_SEC) || {} : {}, SB = cur.act(T0, tb) || {}, items = [];   // 前のショットは、動き終わったら計算しない（軽くする）
    let n = 0;
    new Set(Object.keys(SA).concat(Object.keys(SB))).forEach((id) => {
      if (!ACT[id]) return;
      let A = full(id, SA[id]), B = full(id, SB[id]);
      const appear = !A, vanish = !B;
      if (appear) A = O.hard ? B : Object.assign({}, B, { s: 0 });
      if (vanish) B = Object.assign({}, A, { s: 0 });
      const q = clamp01((tb - Math.min(0.6, n++ * 0.03)) / MOVE_SEC), p = eIO(q);
      const o = blend(A, B, p, p);
      o.s = Math.max(0, lerp(A.s, B.s, appear ? eBack(q) : vanish ? eIn(q) : p));
      if (o.type === 'flat') {
        o.shapeName = p < 0.5 ? A.shape : B.shape;
        const ra = shp(A.shape), rb = shp(B.shape), r = morph[id];
        for (let i = 0; i < T.N; i++) r[i] = ra[i] + (rb[i] - ra[i]) * p;
        o.shape = r;
      }
      if (o.scr[0] || o.scr[1] || o.scr[2]) { const d = o.scr; o.p = [0, 1, 2].map((i) => o.p[i] + rt[i] * d[0] + up[i] * d[1] - fw[i] * d[2]); }   // カメラから見た向きで、ずらす
      if (o.bill > 0) { const b = Math.min(1, o.bill), rb = [-cam.pitch, cam.yaw]; o.r = [o.r[0] + wrapD(rb[0] - o.r[0]) * b, o.r[1] + wrapD(rb[1] - o.r[1]) * b, o.r[2]]; }   // カメラの方を向く
      o.id = id;
      items.push({ z: G.proj(o.zp || o.p)[2] - (o.z || 0), o });   // zp：前後の順番を決めるための点（無ければ p）
    });
    if (BIG_NUM && O.bigNum !== false) {   // ずっと奥に浮かぶ、ショット番号（いつもカメラの方を向く）
      const bp = [0, 1, 2].map((i) => cam.t[i] + fw[i] * 7 + rt[i] * 1.6 + up[i] * 0.6);
      const bn = { type: 'text', str: pad(k + 1), p: bp, r: [-cam.pitch, cam.yaw, 0], s: 7, c: ink, alpha: 0.35, id: 'num' };
      items.push({ z: G.proj(bn.p)[2] + 100, o: bn });
    }
    if (HUD && GRID && O.grid !== false) HUD.grid(ink, cam.dist);
    items.sort((a, b) => b.z - a.z);
    items.forEach((it) => draw(it.o, T0));

    if (HUD && GIZMO && !REDUCE && O.gizmo !== false) {
      if (cam.dist < 20) HUD.gizmo(ink);
      if (CALLOUT && tb > 1.9) {
        const ks = Object.keys(SB).filter((id) => id !== cur.sel && ACT[id] && !['lines', 'text', 'path', 'contour', 'terrain', 'cubes', 'tiles', 'glow', 'beam', 'ribbon', 'dust', 'shadow', 'custom'].includes(ACT[id].type) && !ACT[id].z), fade = clamp01((tb - 1.9) / 0.4) * clamp01((SHOT_SEC - tb) / 0.3);
        [ks[1], ks[ks.length - 2]].forEach((id, n) => { const it = id && items.find((q) => q.o.id === id); if (it) HUD.callout(it.o, ink, it.o.p[0] > cam.t[0] - 0.3 ? 1 : -1, fade); });
      }
      if (MINIMAP) HUD.minimap(items, ink, cam);
      if (cur.sel && tb > 1.7) { const it = items.find((q) => q.o.id === cur.sel); if (it && it.o.s > 0.9) HUD.selBox(it.o, cur.sel, ink, col(cur.bg)); }
    }

    if (O.inner) O.inner(ctx, I);   // 切り抜きの中の質感
    if (O.clip) ctx.restore();
    if (O.post) O.post(ctx, I);   // 切り抜きの外の飾り
    // 画面全体の質感：ふちを暗く、フィルムの粒子
    if (VIGNETTE > 0 && Q < 1 && O.vignette !== 0) {
      const g = ctx.createRadialGradient(W / 2, FH * 0.45, Math.min(W, FH) * 0.35, W / 2, FH * 0.45, Math.hypot(W, FH) * 0.65);
      g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${VIGNETTE})`); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    if (HUD && O.hud === false) {}
    else if (HUD) {   // 少し下にスクロールしたとき、サイトの上の文字と重ならないように、その下にもぐらせる
      const sy = window.scrollY || 0; ctx.save();
      if (sy > 0) { ctx.beginPath(); ctx.rect(0, sy + 46, W, H); ctx.clip(); }
      HUD.hud(cur, k, tb, loopT, ink, T0, cam); ctx.restore();
    }
    else T.label('hero-hud.js が読み込めていません', 20, 60, ink, 10);   // 飾りのファイルが無いときの知らせ
    if (GRAIN > 0 && grainPat && Q < 1) {
      const GA = O.grain === undefined ? GRAIN : O.grain;
      if (now - lastGrain > 70) { gx = Math.random() * 256; gy = Math.random() * 256; lastGrain = now; }
      ctx.save(); ctx.globalCompositeOperation = 'overlay'; ctx.globalAlpha = GA; ctx.translate(-gx, -gy); ctx.fillStyle = grainPat; ctx.fillRect(0, 0, W + 256, H + 256); ctx.restore();
    }
    // 大きな文字の色。大きな物体と重なっても読めるよう、背景の色でふちを取る
    if (ink !== inkNow) { inkNow = ink; titleEls.forEach((el) => { el.style.color = ink; }); }
    if (titleEls[0] && col(bgShow) !== strokeNow) { strokeNow = col(bgShow); titleEls[0].style.webkitTextStroke = `2px ${strokeNow}`; titleEls[0].style.paintOrder = 'stroke fill'; }
  }

  // ---------- 大きさを決める ----------
  function build() {
    const r0 = hero.getBoundingClientRect();
    W = r0.width; H = r0.height;
    if (!W || !H || H > 4000 || W > 5000) { W = 0; return; }   // 異常に大きいときは動かさない
    FH = H - (parseFloat(getComputedStyle(hero).paddingBottom) || NOISE_H);
    E.W = W; E.FH = FH; M = Math.min(W, FH); SC = W < FH ? SCALE_TALL : SCALE_WIDE; CX = W > FH * 1.1 ? W * 0.6 : W * 0.5; CY = FH * 0.4;
    if (O.center) [CX, CY] = O.center(W, FH, CX, CY);   // バージョンが、画面の中心を決めることもできる
    dpr = Q >= 2 ? 1 : Math.min(window.devicePixelRatio || 1, 2, Math.sqrt(4e6 / (W * H))); G.dpr = dpr; G.CA = CHROMA;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!grainPat) {   // フィルムの粒子（灰色のまだら模様を、重ね方「オーバーレイ」で重ねる）
      const nc = document.createElement('canvas'); nc.width = nc.height = 256; const c = nc.getContext('2d'), d = c.createImageData(256, 256);
      for (let q = 0; q < d.data.length; q += 4) { const v = 128 + (Math.random() - 0.5) * 200; d.data[q] = d.data[q + 1] = d.data[q + 2] = v; d.data[q + 3] = 255; }
      c.putImageData(d, 0, 0); grainPat = ctx.createPattern(nc, 'repeat');
    }
    frame(performance.now());
  }

  // ---------- ループ ----------
  new ResizeObserver(() => { const r = hero.getBoundingClientRect(); if (Math.abs(r.width - W) > 1 || Math.abs(r.height - H) > 1) build(); }).observe(hero);
  new IntersectionObserver((en) => { visible = en[0].isIntersecting; }).observe(hero);
  function loop(now) {
    if (visible && W) {
      if (lastNow) { const dt = now - lastNow; if (dt < 200) { dtAvg += (dt - dtAvg) * 0.03; runT += dt; } }
      lastNow = now;
      if (autoQ && runT > 3000 && dtAvg > 28 && Q < 2) { Q++; runT = 0; dtAvg = 16.7; if (Q === 2) build(); }
      frame(now);
    } else lastNow = 0;
    requestAnimationFrame(loop);
  }
  build();
  if (!REDUCE) requestAnimationFrame(loop);
})();
