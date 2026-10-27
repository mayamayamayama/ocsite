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
// 入場画面のファイルが足りないときは、画面の下に、何が足りないかを表示します。
// アドレスの最後に ?check をつけると、問題がなくても、くわしい一覧を表示します。
(function () {
  const RELEASE = 'R34';   // このファイル一式の番号
  const NEED = ['hero-parts', 'hero-parts2', 'hero-parts3', 'hero-parts4', 'hero-kit', 'hero-scenes', 'hero-scenes2', 'hero-abstract', 'hero-abstract2', 'hero-mountain', 'hero-mountain2', 'hero-game', 'hero-game2', 'hero-physics', 'hero-physics2', 'hero-physics3', 'hero-ancient', 'hero-ancient2', 'hero-ancient3', 'hero-ancient4', 'hero-hud', 'hero'];
  function run() {
    const loaded = window.OC_LOADED || [], tags = [...document.scripts].map((s) => (s.getAttribute('src') || '').split('?')[0].replace(/^.*\//, '').replace(/\.js$/, '')).filter(Boolean);
    const H = window.OC_HERO, msg = [], vers = (H && H.vers) || [];
    const notTag = NEED.filter((n) => !tags.includes(n)), notLoaded = NEED.filter((n) => tags.includes(n) && !loaded.includes(n));
    if (notTag.length) msg.push('index.html が古いみたい（新しい index.html を入れてね）');
    if (notLoaded.length) msg.push('読み込めていないファイル：' + notLoaded.map((n) => n + '.js').join('、'));
    if (H && (!H.vers || !('p4' in H))) msg.push('hero.js が古いみたい（新しい hero.js を入れてね）');
    if (window.OC_HERO_ERR) msg.push('バージョンを作るときにエラー：' + window.OC_HERO_ERR);
    const full = /[?&]check/.test(location.search);
    if (!msg.length && !full) return;
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:8px;right:8px;bottom:8px;z-index:99999;background:#d8ff00;color:#141b3a;font:600 12px/1.6 ui-monospace,Menlo,monospace;padding:10px 12px;border-radius:6px;white-space:pre-wrap;max-height:60vh;overflow:auto';
    const lines = ['入場画面チェック（' + RELEASE + '）'].concat(msg.length ? msg : ['問題なし！']);
    if (full) lines.push('', '使えるバージョン：' + (vers.join(' / ') || '?'), '今のバージョン：' + ((H && H.version) || '?'), '', NEED.map((n) => (loaded.includes(n) ? '✓ ' : '✗ ') + n + '.js').join('\n'));
    box.textContent = lines.join('\n');
    box.addEventListener('click', () => box.remove());
    document.body.appendChild(box);
    // 読み込めなかったファイルが、GitHub にあるのか・無いのかを、確かめて書き足す
    notLoaded.forEach((n) => {
      const el = [...document.scripts].find((s) => (s.getAttribute('src') || '').split('?')[0].replace(/^.*\//, '').replace(/\.js$/, '') === n); if (!el || !window.fetch) return;
      fetch(el.src, { cache: 'no-store' }).then((r) => (r.ok ? r.text().then((tx) => { const m = tx.match(/push\('([\w-]+)'\)/), who = m && m[1];
          return who && who !== n ? '→ ' + n + '.js の中身が、' + who + '.js になっている！ 正しい ' + n + '.js をアップロードしてね'
            : '→ ' + n + '.js は GitHub にあるけど、途中で切れているか、こわれている（' + (tx.length / 1024).toFixed(1) + 'KB）。もう一度アップロードしてね'; })
        : '→ ' + n + '.js が GitHub に見つからない（' + r.status + '）。名前がちょうど「' + n + '.js」か確かめて、アップロードしてね'))
        .catch(() => '→ ' + n + '.js を確かめられませんでした').then((t) => { box.textContent += '\n' + t; });
    });
  }
  if (document.readyState === 'complete') setTimeout(run, 300); else window.addEventListener('load', () => setTimeout(run, 300));
})();
