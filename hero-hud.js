// hero-hud.js — 入場画面の「飾り」（3Dの軸・選択枠・床の方眼・注釈・真上から見た図・画面のふちの情報の文字）
// hero.js が使います。hero.js より先に読み込みます。
(window.OC_LOADED = window.OC_LOADED || []).push('hero-hud');

window.OC_HERO_HUD = function (G, T, E) {   // E：画面の大きさやカメラの向きなど（hero.js が毎回書きかえる）
  const ctx = G.ctx, PAL = G.PAL, TAU = Math.PI * 2;
  const pad = (n, l = 2) => String(Math.floor(Math.abs(n))).padStart(l, '0');
  const clamp01 = (x) => Math.max(0, Math.min(1, x));
  const lerp = (a, b, p) => a + (b - a) * p;
  const col = (c) => PAL[c] || c;

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
    let e, lo, hi;
    if (o.type === 'flat') e = [o.w * o.sx, o.w * o.sy, 0.05]; else if (o.type === 'coin') e = [o.w, o.w, o.d / 2];
    else if (o.type === 'box') e = [o.bw / 2, o.bh / 2, o.bd / 2]; else if (o.type === 'strip') e = [o.w / 2, o.h / 2, 0.05];
    else if (o.type === 'solid' && o.V && o.V.length > 1) { lo = [0, 1, 2].map((k) => Math.min(...o.V.map((v) => v[k]))); hi = [0, 1, 2].map((k) => Math.max(...o.V.map((v) => v[k]))); }   // 多面体：頂点の広がりから
    else return;
    if (e) { lo = e.map((v) => -v); hi = e; }
    const B = T.basis(o.r), P = [];
    for (const x of [0, 1]) for (const y of [0, 1]) for (const z of [0, 1]) { const q = [x, y, z].map((s, k) => { const c = (lo[k] + hi[k]) / 2, h = ((hi[k] - lo[k]) / 2) * 1.06; return c + (s ? h : -h); }); P.push(G.proj(T.W3(o, B, q[0], q[1], q[2]))); }
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
    T.label(str, Math.max(14, Math.min(x, E.W - 30 - w)), Math.max(14, y), c, size);
  }
  // 3Dの線分を、カメラの後ろに回り込んだ部分を切り落としてから描く
  function seg3(a, b) {
    const za = (a[0] - G.camPos[0]) * E.fw[0] + (a[1] - G.camPos[1]) * E.fw[1] + (a[2] - G.camPos[2]) * E.fw[2];
    const zb = (b[0] - G.camPos[0]) * E.fw[0] + (b[1] - G.camPos[1]) * E.fw[1] + (b[2] - G.camPos[2]) * E.fw[2], NEAR = 0.4;
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
    const c = G.proj(o.p); if (c[2] < 0.3 || c[0] < 0 || c[0] > E.W || c[1] < 90 || c[1] > E.FH - 60) return;
    if (side > 0 && c[0] + 34 + 74 + 70 > E.W - 14) side = -1; else if (side < 0 && c[0] - 34 - 74 < 14) side = 1;   // はみ出すなら、反対側に出す
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
    const S = E.W < E.FH ? 78 : 118, x0 = E.W < E.FH ? E.W - 20 - S - 34 : E.W - 20 - S - 30, y0 = E.W < E.FH ? 112 : E.FH - 70 - S, k = S / 14;
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
    T.label(`SHOT ${pad(k + 1)} / ${pad(E.NS)} — ${shot.name}`, m, y1, ink, 9);
    T.label(`CAM ${deg(cam.yaw)}° ${deg(cam.pitch)}°  ${Math.round(18 + cam.dist * 3)}mm`, m, y1 + 15, ink, 9);
    T.label('24 FPS', E.W - m - 44, y1, ink, 9, 'right');
    if (Math.floor(T0 * 1.6) % 2 === 0) { ctx.fillStyle = PAL.verm; ctx.beginPath(); ctx.arc(E.W - m - 34, y1, 3.5, 0, TAU); ctx.fill(); }
    T.label('REC', E.W - m, y1, ink, 9, 'right');
    T.label(tc, E.W - m, y1 + 15, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.25; ctx.fillRect(m, y1 + 28, E.W - m * 2, 1); ctx.globalAlpha = 1; ctx.fillRect(m + (E.W - m * 2) * (tb / E.SHOT_SEC) - 1, y1 + 24, 2, 9);
    const rx = E.W - 12, r0 = y1 + 56, r1 = Math.max(r0 + 60, E.FH * 0.6);   // 右のものさし（カメラの距離）
    ctx.globalAlpha = 0.7;
    for (let y = r0; y <= r1; y += 6) { const long = Math.round((y - r0) / 6) % 5 === 0; ctx.fillRect(rx - (long ? 8 : 4), y, long ? 8 : 4, 1); }
    const my = r0 + (r1 - r0) * clamp01((cam.dist - 8) / 34);
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.moveTo(rx - 10, my); ctx.lineTo(rx - 16, my - 4); ctx.lineTo(rx - 16, my + 4); ctx.closePath(); ctx.fill();
    T.label(`Z ${cam.dist.toFixed(1)}`, rx - 19, my, ink, 8, 'right');
    const yb = E.FH - 28, span = E.W - m * 2;   // 下：ループ全体の進み具合
    T.label(`LOOP ${E.LOOP.toFixed(1)}s ▶`, m, yb - 16, ink, 9);
    T.label(`TILT ${G.tx >= 0 ? '+' : ''}${G.tx.toFixed(2)} ${G.ty >= 0 ? '+' : ''}${G.ty.toFixed(2)}`, E.W - m, yb - 16, ink, 9, 'right');
    ctx.fillStyle = ink; ctx.globalAlpha = 0.22; ctx.fillRect(m, yb, span, 2); ctx.globalAlpha = 1; ctx.fillRect(m, yb, span * (loopT / E.LOOP), 2);
    for (let n = 1; n < E.NS; n++) ctx.fillRect(m + span * (n / E.NS), yb - 3, 1, 8);
  }

  return { gizmo, selBox, grid, callout, minimap, hud };
};

// ===== 読み込みチェック =====
// 入場画面のファイルが足りない・古い・入れ替わっているときは、画面の下に、どのファイルをどうすればいいかを表示します。
// アドレスの最後に ?check をつけると、問題がなくても、くわしい一覧を表示します。
(function () {
  const RELEASE = 'R64';   // このファイル一式の番号
  const NEED = ['op', 'hero-parts', 'hero-parts2', 'hero-parts3', 'hero-parts4', 'hero-kit', 'hero-scenes', 'hero-scenes2', 'hero-abstract', 'hero-abstract2', 'hero-mountain', 'hero-mountain2', 'hero-game', 'hero-game2', 'hero-physics', 'hero-physics2', 'hero-physics3', 'hero-ancient', 'hero-ancient2', 'hero-ancient3', 'hero-ancient4', 'hero-elder', 'hero-elder2', 'hero-elder3', 'hero-elder4', 'hero-elder5', 'hero-elder6', 'hero-elder7', 'hero-hud', 'hero', 'mv-parts', 'mv-fx', 'mv', 'list', 'nav'];
  const SIZE = { 'op': 18687, 'hero-parts': 15846, 'hero-parts2': 8339, 'hero-parts3': 4957, 'hero-parts4': 14046, 'hero-kit': 12068, 'hero-scenes': 14206, 'hero-scenes2': 10102, 'hero-abstract': 19663, 'hero-abstract2': 10831, 'hero-mountain': 18752, 'hero-mountain2': 10900, 'hero-game': 10911, 'hero-game2': 9032, 'hero-physics': 12196, 'hero-physics2': 10704, 'hero-physics3': 9333, 'hero-ancient': 13996, 'hero-ancient2': 13458, 'hero-ancient3': 18352, 'hero-ancient4': 11089, 'hero-elder': 11081, 'hero-elder2': 13262, 'hero-elder3': 9738, 'hero-elder4': 9936, 'hero-elder5': 12845, 'hero-elder6': 11506, 'hero-elder7': 8197, 'hero-hud': 18115, 'hero': 19107, 'mv-parts': 18941, 'mv-fx': 8046, 'mv': 18624, 'list': 1506, 'nav': 14175 };   // 正しいファイルの文字数（中身が古い・切れている・入れ替わっている、を見分ける）
  const near = (n, len) => (n === 'op' ? Math.abs(len - SIZE[n]) <= 120 : len === SIZE[n]);   // op.js は、いちばん上の数字を書きかえても大丈夫なように、少しの差はゆるす
  const nameOf = (s) => (s.getAttribute('src') || '').split('?')[0].replace(/^.*\//, '').replace(/\.js$/, '');
  const look = (src, mode) => fetch(src, { cache: mode }).then((r) => (r.ok ? r.text().then((tx) => ({ len: tx.length, who: (tx.match(/push\('([\w-]+)'\)/) || [])[1] })) : { len: -r.status })).catch(() => null);
  function run() {
    const loaded = window.OC_LOADED || [], els = {}; [...document.scripts].forEach((s) => { const n = nameOf(s); if (n) els[n] = s; });
    const H = window.OC_HERO, msg = [], vers = (H && H.vers) || [];
    const notTag = NEED.filter((n) => !els[n]), notLoaded = NEED.filter((n) => els[n] && !loaded.includes(n));
    if (notTag.length) msg.push('index.html が古いみたい（新しい index.html を入れてね）');
    if (notLoaded.length) msg.push('読み込めていないファイル：' + notLoaded.map((n) => n + '.js').join('、'));
    if (H && (!H.vers || !('p4' in H) || !H.hooks)) msg.push('hero.js が古いみたい（新しい hero.js を入れてね）');
    if (window.OC_HERO_ERR) msg.push('バージョンを作るときにエラー：' + window.OC_HERO_ERR);
    const full = /[?&]check/.test(location.search);
    let box = null;
    const show = (t) => {
      if (!box) { box = document.createElement('div'); box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#d8ff00;color:#141b3a;font:600 12px/1.6 ui-monospace,Menlo,monospace;padding:10px 12px;border-radius:6px;white-space:pre-wrap;max-height:60vh;overflow:auto';
        box.textContent = '入場画面チェック（' + RELEASE + '）'; box.addEventListener('click', () => box.remove()); document.body.appendChild(box); }
      box.textContent += '\n' + t;
    };
    if (msg.length) show(msg.join('\n'));
    if (full) show((msg.length ? '' : '問題なし！\n') + '\n使えるバージョン：' + (vers.join(' / ') || '?') + '\n今のバージョン：' + ((H && H.version) || '?') + '\n\n' + NEED.map((n) => (loaded.includes(n) ? '✓ ' : '✗ ') + n + '.js').join('\n'));
    if (full) opInspect((window.OC_OP && window.OC_OP.cfg) || { VIDEO: 'op.mp4', MODEL: 'kabeban.glb', SKIP_STILL: true }).then(show, () => {});   // OP の動画と glb の中身
    // ファイルの中身を確かめる（まず、今動いているもの。おかしければ、GitHub にあるものも）
    if (!window.fetch || location.protocol === 'file:') return;
    Promise.all(NEED.map((n) => (els[n] ? look(els[n].src, 'default') : Promise.resolve(null)))).then((got) => {
      const bad = NEED.filter((n, i) => got[i] && (!near(n, got[i].len) || got[i].who !== n));
      if (!bad.length) { if (full) show('\nファイルの中身：ぜんぶ正しい！'); return; }
      Promise.all(bad.map((n) => look(els[n].src, 'no-store'))).then((srv) => {
        const kb = (v) => (v / 1024).toFixed(1) + 'KB';
        show('\nファイルの中身のチェック：\n' + bad.map((n, i) => { const q = srv[i], f = '・' + n + '.js：';
          if (!q) return f + '確かめられませんでした';
          if (q.len < 0) return f + 'GitHub に見つからない。名前がちょうど「' + n + '.js」か確かめて、アップロードしてね';
          if (q.who && q.who !== n) return f + '中身が ' + q.who + '.js になっている！ 正しい ' + n + '.js をアップロードしてね';
          if (!near(n, q.len)) return f + '中身が古いか、途中で切れている（' + kb(q.len) + '、正しくは ' + kb(SIZE[n]) + '）。もう一度アップロードしてね';
          return f + 'GitHub は正しいのに、スマホに古いものが残っている。10分ほど待つか、シークレットタブで開いてね';
        }).join('\n'));
      });
    });
  }
  // ---------- OP（op.js）の動画と glb の中身の確認 ----------
  async function opInspect(cfg) {
    const { VIDEO, MODEL, SKIP_STILL } = cfg;
    const L = ['', 'OP（最初の動画と壁のアニメーション）：'], kb = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB');
    const miss = (f) => '見つからない。名前がちょうど「' + f + '」か、index.html と同じ場所にあるか確かめてね';
    const big = (n) => (n > 5 * 1048576 ? '\n  ⚠ 大きいので、スマホだと始まるまで時間がかかるかも（5MB くらいまでがおすすめ）' : '');
    try {
      const r = await fetch(VIDEO, { cache: 'no-store' }), n = +r.headers.get('content-length') || 0;
      if (r.body && r.body.cancel) r.body.cancel().catch(() => {});
      if (!r.ok) L.push('・' + VIDEO + '：' + miss(VIDEO));
      else {
        const m = await new Promise((ok) => { const v = document.createElement('video'); v.muted = true; v.preload = 'metadata';
          const t = setTimeout(() => ok(null), 8000); v.onloadedmetadata = () => { clearTimeout(t); ok(v.videoWidth + '×' + v.videoHeight + '・' + v.duration.toFixed(1) + '秒'); v.removeAttribute('src'); v.load(); };
          v.onerror = () => { clearTimeout(t); ok(false); }; v.src = VIDEO; });
        L.push('・' + VIDEO + '：あり（' + (n ? kb(n) + '・' : '') + (m || (m === false ? 'このブラウザでは再生できない形式。H.264 の mp4 で書き出してね' : '長さは確かめられませんでした')) + '）' + big(n) + (n > 200000 && n < 400000 ? '\n  ⚠ 前の op.mp4 のままかも。新しい op.mp4 をアップロードしてね（自分で作り直した動画なら、気にしなくて大丈夫）' : ''));
      }
    } catch (e) { L.push('・' + VIDEO + '：確かめられませんでした'); }
    try {
      const r = await fetch(MODEL, { cache: 'no-store' });
      if (!r.ok) L.push('・' + MODEL + '：' + miss(MODEL));
      else {
        const buf = await r.arrayBuffer(), j = glbJson(buf);
        if (!j) L.push('・' + MODEL + '：中身が glb ではないみたい。Blender で「glTF バイナリー（.glb）」を選んで書き出してね');
        else {
          const an = j.animations || [], ks = an.flatMap((a) => (a.samplers || []).map((s) => j.accessors[s.input] || {}));
          const sec = Math.max(0, ...ks.map((a) => (a.max || [0])[0])), st = ks.length ? Math.min(...ks.map((a) => (a.min || [0])[0])) : 0;
          L.push('・' + MODEL + '：あり（' + kb(buf.byteLength) + '・パーツ ' + (j.nodes || []).filter((n) => n.mesh !== undefined).length + '・動き ' + an.length + '・長さ ' + sec.toFixed(1) + '秒・カメラ ' + ((j.cameras || []).length ? 'あり' : 'なし→正面から画面いっぱいに写します') + '）' + big(buf.byteLength));
          if (SKIP_STILL && st > 0.05) L.push('  最初の ' + st.toFixed(1) + '秒は止まっているので、とばして、すぐ割れ始めます');
          if (!an.length) L.push('  ⚠ 動きが入っていません。書き出すとき「アニメーション」にチェック。物理演算のときは、先に「オブジェクト → 剛体 → キーフレームに焼き込み」をしてね');
        }
      }
    } catch (e) { L.push('・' + MODEL + '：確かめられませんでした'); }
    try { const T = await import('three'); L.push('・3D の部品（three.js）：読み込めた（r' + T.REVISION + '）'); } catch (e) { L.push('・3D の部品（three.js）：読み込めない（index.html が古いか、ネットの問題）'); }
    const g = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    L.push('・この端末の 3D：' + (g ? '使える' : '使えない（動画のあとは、そのままサイトを出します）'));
    if (g && g.getExtension('WEBGL_lose_context')) g.getExtension('WEBGL_lose_context').loseContext();
    const cn = ['mv-chara'].concat(Array.from({ length: 12 }, (_, i) => 'mv-chara' + (i + 1))).flatMap((b) => [b + '.webp', b + '.png']), cf = await Promise.all(cn.map((n) => fetch(n, { method: 'HEAD', cache: 'no-store' }).then((r) => r.ok && n, () => false)));
    const cl = cf.filter((n) => n && !(n.endsWith('.png') && cf.includes(n.replace('.png', '.webp')))); L.push('', '入場画面の立ち絵：' + (cl.length ? cl.join('、') + '（' + cl.length + '枚。ランダムで出ます）' : '見つからない。mv-chara1.png、mv-chara2.png …の名前でアップロードしてね'));
    return L.join('\n');
  }
  function glbJson(buf) {
    try {
      const d = new DataView(buf);
      if (buf.byteLength < 20 || d.getUint32(0, true) !== 0x46546c67 || d.getUint32(16, true) !== 0x4e4f534a) return null;   // 「glTF」と「JSON」の印
      return JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, d.getUint32(12, true))));
    } catch (e) { return null; }
  }
  if (document.readyState === 'complete') setTimeout(run, 300); else window.addEventListener('load', () => setTimeout(run, 300));
})();
