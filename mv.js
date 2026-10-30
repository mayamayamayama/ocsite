// mv.js — 入場したときのメインビジュアル（テーマは「山」。部品は mv-parts.js、キャンバスは mv-fx.js）
// ・方眼が地形のようにうねり、リボンが流れ、シールみたいな山が、ぽよんと飛び出します
// ・立ち絵は、ランダムで1枚（mv-chara1.webp か .png、mv-chara2 …の名前で。webp が軽い）
// ・タップで紙吹雪。キャラはジャンプ、山はぷるん。道しるべを押すとキャラ一覧へ
// ・OP があるときは、壁が割れた瞬間に登場します
// ・プロフィールから戻ると、モーショングラフィックス（hero.js）に替わります（毎回ランダム）
(window.OC_LOADED = window.OC_LOADED || []).push('mv');

(function () {
  // ===== 変えてもいいところ =====
  const CHARAS = [];                                   // 立ち絵の名前を ['a.png', 'b.png'] と書くと、その中からランダム。空なら mv-chara1〜12 を自動でさがす
  const MOTION = 'auto';                                // 動き：'auto' 重いと自動で少なめ／'lite' いつも少なめ／'full' 全部
  const LINE = 0.7, LINE_COLOR = '#ffffff';            // 立ち絵の白いふちの太さ（0 でなし。1.4 で倍）と色
  const SHADOW = [1.8, 1.6], SHADOW_COLOR = '#2ec4b6'; // 立ち絵の影のずれ（右へ, 下へ。0, 0 でなし）と色
  const NAME = 'MAYAMA';                                // 活動名
  const TITLE = ['OC', 'ARCHIVE'], LABEL = 'BY ' + NAME; // 大きなタイトル（1行目・2行目）と、1行目の横のラベル
  const HEAD = 'CHARACTER INDEX', NUM = '01';
  const BIG = '山';                                     // うしろの、うすい大きな文字
  const ALT = 2026;                                     // 標高（登場するとき、0 から数えあがる）
  const SIGN = ['CHARACTERS', 'PROFILE', 'ARCHIVE'];         // 道しるべの板（押すと、キャラ一覧へ）
  const TAGS = ['PROFILE', 'WORLD', 'ARCHIVE'];         // パソコンで、数字の下にならぶ札
  const BADGE = 'OC ARCHIVE • VOL.01 • ' + NAME + ' • '; // 回るバッジの文字
  const BAR = 'OC-ARCHIVE-001';                          // バーコードの文字
  const MARQUEE = 'OC ARCHIVE ✦ CHARACTER INDEX ✦ BY ' + NAME + ' ✦ VOL.01 ✦';   // いちばん下を流れる帯
  const SIDE = 'OC ARCHIVE ✦ MT. ' + NAME + ' ✦ EST. 2026';   // 右はしの、たて書きの文字
  const ROSTER = 'CLIMBERS';                              // パソコンの、キャラの名前リストの見出し（名前を押すと、そのプロフィールへ）
  const C = { bg: '#eeede9', grid: '#d2d0c9', ink: '#161616', yellow: '#ffd21f', orange: '#ff6b2c', teal: '#2ec4b6', violet: '#8b5cf6', blue: '#2f6bff', pink: '#ff4fa3', lime: '#d8ff00', flag: '#ff3d2e' };
  // 山の色ともようは、mv-parts.js のいちばん下（MT）で変えられます
  // ============================
  const mv = document.getElementById('mv'), P = window.OC_MV_PARTS, FX = window.OC_MV_FX;
  if (!mv || !P || !FX) return;
  const root = document.documentElement, body = document.body, REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.entries(C).forEach(([k, v]) => mv.style.setProperty('--' + k, v)); if (MOTION === 'lite') mv.classList.add('lite');
  const stage = mv.querySelector('.mv-stage'), gcv = mv.querySelector('.mv-topo'), ccv = mv.querySelector('.mv-chips');
  const S = P.S, esc = (s) => String(s).replace(/[&<>"]/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const letters = (s, o) => [...s].map((ch, i) => '<span class="l" style="--i:' + (o + i) + '"><b>' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</b></span>').join('');
  const CL = typeof characters === 'object' && characters ? Object.entries(characters) : [], OCS = CL.length, pad = (n) => String(n).padStart(2, '0');
  const roster = S.roster(CL, esc(ROSTER), esc, pad);

  // 部品：[名前, 中身, 登場, ずっとの動き, 奥行き, スマホ [横%, 縦%, 大きさ, 回転], パソコン]
  // 大きさ：シールは幅、文字は文字の大きさ。立ち絵は画面の高さの%。0 は出さない
  const L = [
    ['big', '<div class="mv-big">' + esc(BIG) + '</div>', 'fade', '', 0.15, [27, 31, 46, 0], [22, 31, 40, 0]],
    ['half', S.halftone(C.pink), 'fade', 'rot', 0.25, [2, 33, 30, 0], [4, 31, 36, 0]],
    ['sun', '<div class="mv-sun"><i></i><b></b></div>', 'sun', '', 0.3, [0, 0, 74, 0], [0, 0, 64, 0]],   // 太陽は、いちばん高い山のうしろ
    ['cl1', S.cloud(), 'fade', 'drift', 0.4, [30, 14, 22, 0], [22, 12, 18, 0]],
    ['cl2', S.cloud(), 'fade', 'drift2', 0.6, [76, 40, 18, 0], [52, 30, 14, 0]],
    ['birds', S.birds(), 'fade', 'fly', 0.5, [38, 19, 36, 0], [40, 15, 30, 0]],
    ['land', '<div class="mv-land"></div>', 'none', '', 0, [0, 0, 0, 0], [0, 0, 0, 0]],
    ['rib', '<canvas class="mv-rib"></canvas>', 'none', '', 0, [0, 0, 0, 0], [0, 0, 0, 0]],
    ['chara', '<div class="mv-chara"></div>', 'rise', 'breathe', 0.9, [64, 54, 58, 0], [66, 53, 86, 0]],
    ['hand', '<div class="mv-hand">@' + esc(NAME) + '</div>', 'drop', '', 0.5, [40, 5.5, 2.6, 0], [33, 4.8, 2.1, 0]],
    ['head', '<div class="mv-head"><b>' + esc(HEAD) + '</b></div>', 'drop', '', 0.5, [40, 10, 3.6, 0], [33, 9, 3.2, 0]],
    ['num', '<div class="mv-num">' + esc(NUM) + '</div>', 'wipe', '', 0.35, [86, 10, 17, 0], [88, 13, 24, 0]],
    ['mt', '<div class="mv-outline">MT.<br>' + esc(NAME) + '</div>', 'fade', '', 0.3, [85, 20.5, 4.8, 0], [76, 11, 4.2, 0]],
    ['tags', '<div class="mv-tags">' + TAGS.map((t, i) => '<span style="--i:' + i + '">' + esc(t) + '</span>').join('') + '</div>', 'right', '', 0.55, [0, 0, 0, 0], [88, 36, 2.5, 0]],
    ['title', '<div class="mv-title"><div class="t1">' + letters(TITLE[0], 0) + '<span class="mv-label">' + esc(LABEL) + '</span></div><div class="t2">' + letters(TITLE[1], TITLE[0].length) + '</div></div>', 'none', '', 1, [42, 69, 19, -4], [29, 66, 22, -3]],
    ['info', '<p class="mv-info">ALT. <b class="alt">0</b> m　/　' + pad(OCS) + ' CHARACTERS　/　VOL.' + esc(NUM) + '</p>', 'up', '', 0.6, [46, 80.5, 2.6, 0], [30, 82, 2.3, 0]],
    ['dots', '<div class="mv-dots3"><i></i><i></i><i></i></div>', 'up', '', 0.2, [50, 91.5, 2.6, 0], [50, 90.5, 2.2, 0]],
    ['side', '<div class="mv-side">' + esc(SIDE) + '</div>', 'fade', '', 0.2, [97.5, 34, 2.2, 0], [98.6, 31, 1.7, 0]],
    ['roster', roster, 'up', '', 0.5, [0, 0, 0, 0], [10.5, 45, OCS ? 2.1 : 0, -2]],
    ['band', '<div class="mv-band"><div>' + (esc(MARQUEE) + ' ').repeat(5) + '</div></div>', 'right', '', 0.15, [50, 97, 3.2, -3], [50, 95.5, 2.4, -2]],
    // シール
    ['compass', S.compass(C.orange), 'pop', 'bob', 1, [12, 21, 15, -8], [7, 25, 11, -8]],
    ['badge', S.badge(esc(BADGE), C.yellow, C.teal), 'pop', 'rot', 0.7, [88, 33, 14, 0], [50, 20, 12, 0]],
    ['bl1', S.balloon('star', '#fff3b0', '#e8a91c'), 'float', 'float', 1.3, [86, 48, 15, 6], [81, 49, 11, 6]],
    ['bl2', S.balloon('round', '#e4d8ff', '#7c4dff'), 'float', 'float', 1.2, [94, 58, 11, -6], [92, 56, 8, -6]],
    ['bl3', S.balloon('round', '#ffd0b8', '#f25a1d'), 'float', 'float', 1.4, [7, 54, 11, 8], [46, 32, 8, 8]],
    ['sign', S.sign(SIGN.map(esc), [C.yellow, '#fff', C.teal]), 'up', '', 1.1, [14, 89, 20, -4], [87, 76, 16, 3]],
    ['hab', S.hotair(C.teal, C.yellow), 'float', 'float', 0.9, [40, 22.5, 12, -5], [54, 43, 21, -5]],
    ['plane', S.plane(), 'pop', 'bob', 0.8, [61, 21, 16, -6], [67, 7, 15, -4]],
    ['plus', S.plus(), 'pop', 'wig', 0.6, [77, 26.5, 7, 0], [80, 27, 7, 0]],
    ['ticket', S.ticket(['SUMMIT PASS', 'MT. ' + esc(NAME), 'ALT. ' + ALT.toLocaleString('en-US') + ' m', 'No.001'], C.yellow), 'pop', 'bob', 0.7, [0, 0, 0, 0], [17, 25, 24, -7]],
    ['cl3', S.cloud(), 'fade', 'drift', 0.5, [0, 0, 0, 0], [79, 40, 10, 0]],
    ['sp5', S.sparkle(C.pink), 'pop', 'tw', 1.2, [25, 25, 5, 0], [40, 22, 5, 0]],
    ['bar', S.barcode(esc(BAR)), 'pop', 'bob', 1, [84, 90, 20, 6], [52, 89.5, 13, -4]],
    ['st1', S.star(C.yellow), 'pop', 'spin', 1, [7, 9, 8, -12], [5, 12, 6, -12]],
    ['st2', S.star(C.orange), 'pop', 'spin', 1, [60, 89, 6, 14], [40, 90, 5, 14]],
    ['shoot', S.shoot(C.yellow), 'pop', 'bob', 1.1, [82, 77, 22, -14], [56, 80, 15, -14]],
    ['sq', S.squig(), 'pop', 'wig', 0.7, [21, 15.5, 15, -4], [44, 8.5, 11, -4]],
    ['tape1', S.tape(C.yellow), 'pop', '', 0.8, [16, 74.5, 12, -24], [12, 75.5, 11, -20]],
    ['tape2', S.tape(C.teal), 'pop', '', 0.5, [60, 8, 11, 14], [48, 7.5, 10, 12]],
    ['sp1', S.sparkle(C.yellow), 'pop', 'tw', 1.2, [70, 6, 7, 0], [62, 16, 6, 0]],
    ['sp2', S.sparkle(C.orange), 'pop', 'tw', 1.2, [95, 41, 5.5, 0], [96, 46, 4.5, 0]],
    ['sp3', S.sparkle(C.teal), 'pop', 'tw', 1.2, [6, 44, 6, 0], [45, 14, 5, 0]],
    ['sp4', S.sparkle(C.violet), 'pop', 'tw', 1.2, [52, 22, 5, 0], [94, 66, 5, 0]],
    ['zg1', S.zig(), 'pop', 'wig', 0.7, [72, 17, 12, -12], [61, 8, 10, -12]],
    ['zg2', S.zig(), 'pop', 'wig', 0.7, [93, 67, 9, 8], [6, 90, 10, 8]],
  ];
  stage.innerHTML = L.map(([k, html, e, i], n) => '<div class="mv-p mv-' + k + '-p" data-k="' + k + '"><div class="mv-e e-' + e + '" style="--d:' + (0.15 + n * 0.05).toFixed(2) + 's"><div class="mv-i i-' + (i || 'none') + '" style="--ph:-' + ((n * 0.37) % 3).toFixed(2) + 's">' + html + '</div></div></div>').join('');
  const ci = L.findIndex((x) => x[0] === 'chara'), parts = [...stage.children], landEl = stage.querySelector('.mv-land'), charaEl = stage.querySelector('.mv-chara'), altEl = stage.querySelector('.alt');
  P.wire(stage.querySelector('.mv-roster'), () => vis && !REDUCE);   // 名前リスト：押すとプロフィールへ。順番に光る
  stage.querySelector('.mv-sign-p').addEventListener('click', () => { const t = document.getElementById('list-head') || document.getElementById('character-grid'); if (t) t.scrollIntoView({ behavior: 'smooth' }); });

  // ---------- 立ち絵：用意したものの中から、前回と違うものをランダムに ----------
  let art = null, artKey = '';
  const ghost = () => { art = null; charaEl.innerHTML = '<div class="mv-ghost">' + S.ghost() + '</div>'; charaEl.classList.add('ready'); };
  function paintChara() {   // 立ち絵に、ふちと影をつけた絵にする（画面の大きさが変わったときだけ）
    if (!art || !H) return; const h = (H * L[ci][wide ? 6 : 5][2]) / 100, key = Math.round(h) + ':' + u.toFixed(2);
    if (key === artKey) return; artKey = key;
    try { charaEl.replaceChildren(FX.outline(art, h, LINE * u, SHADOW[0] * u, SHADOW[1] * u, LINE_COLOR, SHADOW_COLOR)); } catch (e) { charaEl.replaceChildren(art); }
    charaEl.classList.add('ready');
  }
  function findCharas() {
    if (CHARAS.length) return Promise.resolve(CHARAS);
    let got = null; try { got = JSON.parse(sessionStorage.getItem('oc-mv-charas2')); } catch (e) { /* なにもしない */ }
    if (Array.isArray(got) && got.length) return Promise.resolve(got);
    const names = ['mv-chara'].concat(Array.from({ length: 12 }, (_, i) => 'mv-chara' + (i + 1))).flatMap((b) => [b + '.webp', b + '.png']);   // 同じ番号に両方あれば webp を使う
    return Promise.all(names.map((n) => fetch(n, { method: 'HEAD', cache: 'no-cache' }).then((r) => (r.ok ? n : null), () => null))).then((ok) => {
      const list = ok.filter((n) => n && !(n.endsWith('.png') && ok.includes(n.replace('.png', '.webp')))); try { if (list.length) sessionStorage.setItem('oc-mv-charas2', JSON.stringify(list)); } catch (e) { /* なにもしない */ }
      return list; });
  }
  function pickChara(list) {
    if (!list.length) return ghost();
    let last = ''; try { last = localStorage.getItem('oc-mv-last') || ''; } catch (e) { /* なにもしない */ }
    const pool = list.length > 1 ? list.filter((n) => n !== last) : list, name = pool[Math.floor(Math.random() * pool.length)];
    try { localStorage.setItem('oc-mv-last', name); } catch (e) { /* なにもしない */ }
    const img = new Image(); img.alt = ''; img.draggable = false;
    img.onload = () => (img.decode ? img.decode() : Promise.resolve()).catch(() => {}).then(() => { art = img; artKey = ''; paintChara(); });   // 全部読みこんでから出す（半分だけ見えないように）
    img.onerror = () => { const rest = list.filter((n) => n !== name); try { sessionStorage.removeItem('oc-mv-charas2'); } catch (e) { /* なにもしない */ } if (rest.length) pickChara(rest); else ghost(); };
    img.src = name;
  }
  findCharas().then(pickChara, ghost);

  // ---------- 置き場所（スマホの縦長か、パソコンの横長かで切り替え） ----------
  let W = 0, H = 0, u = 4, wide = false, landKey = '', top = [0, 0], peaks = [], ribs = [];
  const sunEl = stage.querySelector('.mv-sun-p');
  function layout() {
    const r = stage.getBoundingClientRect(); W = r.width; H = r.height; if (!W) return;
    wide = W / H > 1.05; u = Math.min(W, H * (wide ? 0.6 : 0.62)) / 100;
    mv.style.setProperty('--u', u.toFixed(2) + 'px'); mv.classList.toggle('wide', wide);
    parts.forEach((el, n) => {
      const [k, , , , z, pp, lp] = L[n], [x, y, s, rot] = wide ? lp : pp;
      el.style.setProperty('--z', z);
      if (k === 'land' || k === 'rib') return;
      if (k === 'sun') { el.style.width = (s * u).toFixed(1) + 'px'; return; }
      el.hidden = !s; if (!s) return;
      el.style.left = x + '%'; el.style.top = y + '%'; el.style.setProperty('--r', rot + 'deg');
      if (k === 'chara') { el.style.height = s + '%'; el.style.width = 'auto'; }
      else if (k === 'band') { el.style.width = '140%'; el.style.fontSize = (s * u).toFixed(1) + 'px'; }
      else if (el.querySelector('svg') || k === 'sun') el.style.width = (s * u).toFixed(1) + 'px';
      else {   // 文字：画面からはみ出すときは、小さくして、内側に寄せる
        el.style.fontSize = (s * u).toFixed(1) + 'px';
        const w = el.offsetWidth, mw = W * 0.92;
        if (w > mw) el.style.fontSize = ((s * u * mw) / w).toFixed(1) + 'px';
        const hw = Math.min(w, mw) / 2 + W * 0.03; el.style.left = Math.min(W - hw, Math.max(hw, (x / 100) * W)).toFixed(1) + 'px';
      }
    });
    const key = Math.round(W) + 'x' + Math.round(H);
    if (key !== landKey) {   // 山なみは、画面の大きさが変わったときだけ作り直す
      landKey = key; const g = P.land(W, H, wide, C, u, 'SUMMIT ' + ALT.toLocaleString('en-US') + ' m');
      landEl.innerHTML = g.html; top = g.summit;
      peaks = [[top[0] / W, top[1] / H, 0.26, 1.2], [0.8, 0.18, 0.2, 0.8], [0.12, 0.84, 0.24, 0.7]];
    }
    sunEl.style.left = top[0].toFixed(1) + 'px'; sunEl.style.top = (top[1] + u * (wide ? 4 : 6)).toFixed(1) + 'px';   // 太陽は、頂上のうしろから半分のぞく
    ribs = P.RIB.map(([a, b, w, tw, pp, lp], i) => ({ a: C[a] || a, b: C[b] || b, w: w * u, tw, sp: 0.9 + i * 0.25, amp: u * 1.4, p: (wide ? lp : pp).map(([x, y]) => [x * W, y * H]) }));
    terrain.size(); rib.size(); conf.size(); paintChara(); tDone = 0;
  }
  const terrain = FX.terrain(gcv, C.grid), rib = FX.ribbons(stage.querySelector('.mv-rib')), conf = FX.confetti(stage.querySelector('.mv-rib'), [C.orange, C.yellow, C.teal, C.violet, C.blue, C.lime, '#ffffff'], true);   // 紙吹雪はリボンと同じキャンバスに（画面全体の重なりをへらす）
  new ResizeObserver(layout).observe(stage);
  if (document.fonts) document.fonts.addEventListener('loadingdone', layout);   // 文字が読み込めたら、はみ出しを直す

  // ---------- 登場（OP があるときは、壁が割れるまで待つ） ----------
  let started = false, t0 = 0;
  function go() {
    if (started) return; started = true;
    const fonts = document.fonts ? Promise.all(['Anton', 'Oswald', 'Dela Gothic One'].map((f) => document.fonts.load('600 40px "' + f + '"', 'A山').catch(() => {}))) : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, root.classList.contains('op-on') ? 0 : 1200))]).then(() => { layout(); mv.classList.add('in'); t0 = performance.now(); });
  }
  if (root.classList.contains('op-hold')) new MutationObserver((m, o) => { if (!root.classList.contains('op-hold')) { o.disconnect(); go(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
  else go();

  // ---------- マウス・指で、奥行きのあるずれ。タップで、紙吹雪がはじける ----------
  let mx = 0, my = 0, tx = 0, ty = 0, px = -1e4, py = -1e4, pw = 0, pt = 0;
  const point = (e, m) => { const r = stage.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; if (m) { tx = (px / r.width - 0.5) * 2; ty = (py / r.height - 0.5) * 2; } pt = performance.now(); };
  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse') point(e, 1); }, { passive: true });   // 奥行きのずれは、マウスだけ（スマホはスクロールのじゃまをしない）
  stage.addEventListener('animationend', (e) => {   // 登場の動きが終わったら外す（動かない部品は、スマホのメモリを使わなくなる）
    const el = e.target, b = /^mv(Boing|Hop|Jelly)$/.test(e.animationName) && el.closest('.boing');
    if (b) b.classList.remove('boing'); else if (el.matches('.mv-e,.mt-a,.l,.mv-label') && !/Boing|Hop|Jelly/.test(e.animationName)) el.classList.add('done');
  });
  stage.addEventListener('click', (e) => {   // タップ（スクロールのときは出ない）
    point(e, 0); if (REDUCE) return;
    const ch = e.target.closest('.mv-chara-p'), st = e.target.closest('.mv-p'), mt = e.target.closest('.mt');
    conf.burst(px, py, ch ? 46 : 24);
    const el = ch || mt || (st && st.querySelector('svg') && !st.matches('.mv-land-p') ? st : null);
    if (el) { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); }
  });

  // ---------- 毎フレーム：方眼・リボン・紙吹雪・標高の数字・ずれ（見えているときだけ） ----------
  let vis = true, last = 0, odd = false, lx = '', ly = '', fr = [], last0 = 0, n3 = 0, tDone = 0, cdt = 0;
  new IntersectionObserver((en) => { vis = en[0].isIntersecting; mv.classList.toggle('off', !vis); if (!body.classList.contains('is-after')) body.classList.toggle('on-light', vis); }, { threshold: 0.3 }).observe(mv);   // 見えないあいだは、動きを止める
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis || !W || root.classList.contains('op-hold') || root.classList.contains('nv-open') || body.classList.contains('is-after')) { last = 0; return; }
    const dt = last ? Math.min(3, (now - last) / 16.7) : 1, t = now / 1000, s = t0 ? (now - t0) / 1000 : 0; last = now;
    if (now - pt > 2500) { tx *= 0.96; ty *= 0.96; }   // しばらく動かさないと、まん中にもどる
    mx += (tx - mx) * 0.06 * dt; my += (ty - my) * 0.06 * dt; pw += ((now - pt < 1500 ? 1 : 0) - pw) * 0.05 * dt;
    const nx = mx.toFixed(3), ny = my.toFixed(3);
    if (nx !== lx || ny !== ly) { stage.style.setProperty('--mx', nx); stage.style.setProperty('--my', ny); lx = nx; ly = ny; }   // ずれは、変わったときだけ
    let lite = mv.classList.contains('lite'); const f = now - last0; last0 = now;
    if (t0 && !lite && MOTION === 'auto' && s > 2.6 && f < 100) { fr.push(f); if (fr.length > 90) { fr.sort((a, b) => a - b); if (fr[45] > 22) mv.classList.add('lite'); fr = []; } }   // ずっと見張って、なめらかでなければ動きをへらす
    n3 = (n3 + 1) % 3; odd = !odd; cdt += dt;
    if ((!n3 && !lite) || pw > 0.05 || !tDone) { terrain.draw(REDUCE || lite ? 0 : t, peaks, px, py, pw); tDone = 1; }   // 方眼は3コマに1回
    if (t0 && (lite ? n3 === 1 : !odd || s < 2)) {   // リボンと紙吹雪は、同じキャンバスに2コマに1回（リボンは、登場のとき、のびていく）
      rib.draw(REDUCE ? 0 : t, ribs, REDUCE ? 1 : Math.max(0, (s - 0.2) / 1.6)); if (!REDUCE) conf.draw(t, Math.min(4, cdt)); cdt = 0;
    }
    if (t0 && s < 4) {
      const k = Math.min(1, Math.max(0, (s - 1.3) / 1.8)), a = Math.round(ALT * (1 - Math.pow(1 - k, 3))).toLocaleString('en-US');
      if (altEl.textContent !== a) altEl.textContent = a;   // 標高が数えあがる（変わったときだけ書く）
    }
  }
  layout(); requestAnimationFrame(loop);

  // ---------- プロフィールから戻るたびに、モーショングラフィックスを選び直す ----------
  let wasIn = body.classList.contains('in-detail');
  new MutationObserver(() => {
    const now = body.classList.contains('in-detail');
    if (wasIn && !now && window.OC_HERO && window.OC_HERO.use) window.OC_HERO.use();
    wasIn = now;
  }).observe(body, { attributes: true, attributeFilter: ['class'] });

  // ---------- 一覧のカード：クリックしたら、表情違いの絵のまま、プロフィールへ ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('.card.has-alt');
    if (a && a.matches(':hover')) { a.classList.add('hold'); setTimeout(() => a.classList.remove('hold'), 1700); }
  }, true);
})();
