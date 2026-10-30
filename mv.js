// mv.js — 入場したときのメインビジュアル（ポップなコラージュの画面）
// ・うしろの方眼がゆらゆら動き、リボン・星・ハートの風船・紙吹雪などが、ずっと動いています（部品は mv-parts.js）
// ・まんなかに、看板キャラの立ち絵（mv-chara.png）を置きます。画面をタップすると紙吹雪、キャラをタップするとジャンプ
// ・OP があるときは、壁が割れた瞬間に登場します
// ・キャラのプロフィールから戻ると、ここはモーショングラフィックス（hero.js）に替わり、戻るたびにランダムで選ばれます
(window.OC_LOADED = window.OC_LOADED || []).push('mv');

(function () {
  // ===== 変えてもいいところ =====
  const CHARA = 'mv-chara.png';                   // 立ち絵（背景が透明な PNG。index.html と同じ場所に置く）
  const SCRIPT = 'Welcome to';                    // 手書き風の文字
  const TITLE = 'OC ARCHIVE!';                    // 大きなタイトル
  const KANA = 'おーしー・あーかいぶ！';           // タイトルの下の、ふりがな
  const CATCH = 'うちの子たちの、記録と記憶。';     // ひとこと
  const BIG = ['うち', 'の子'];                    // うしろの、うすい大きな文字（2行）
  const HEAD = 'CHARACTER INDEX', SUB = 'VOL.01 — OC ARCHIVE', NUM = '01';
  const TAGS = ['PROFILE', 'WORLD', 'GALLERY'];
  const HELLO = 'Hi!', BADGE = 'OC ARCHIVE • CHARACTER INDEX • ';   // ふきだしの文字・回るバッジの文字
  const MARQUEE = '✦ WELCOME TO OC ARCHIVE ✦ うちの子たちの記録と記憶';   // いちばん下を流れる帯の文字
  const C = { bg: '#ecebe6', grid: '#cfccc4', pink: '#ff3d8e', violet: '#9b7bff', teal: '#3fbfae', yellow: '#ffd21f', gold: '#f1b62e', orange: '#ff8a3d' };
  // ============================
  const mv = document.getElementById('mv'), P = window.OC_MV_PARTS;
  if (!mv || !P) return;
  const root = document.documentElement, body = document.body, REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  Object.entries(C).forEach(([k, v]) => mv.style.setProperty('--' + k, v));
  const stage = mv.querySelector('.mv-stage'), gcv = mv.querySelector('.mv-grid'), ccv = mv.querySelector('.mv-confetti');
  const S = P.S, esc = (s) => String(s).replace(/[&<>"]/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const letters = (s, cls) => [...s].map((ch, i) => '<span class="' + cls + '" style="--i:' + i + '"><b>' + (ch === ' ' ? '&nbsp;' : esc(ch)) + '</b></span>').join('');

  // 部品：[名前, 中身, 登場のしかた, ずっとの動き, 奥行き（マウスで動く量）, スマホの置き場所 [横%, 縦%, 大きさ, 回転], パソコンの置き場所]
  // 大きさ：シールは幅、文字は文字の大きさ（どちらも、画面の大きさに合わせた単位）。立ち絵だけは、画面の高さの%
  const L = [
    ['big', '<div class="mv-big">' + BIG.map(esc).join('<br>') + '</div>', 'fade', '', 0.2, [30, 78, 32, 0], [12, 74, 24, 0]],
    ['rb1', S.ribbon(C.teal, C.violet, P.RIBBON[0]), 'draw', 'wave', 0.3, [8, 12, 84, -14], [7, 10, 62, -6]],
    ['rb2', S.ribbon(C.pink, C.orange, P.RIBBON[1]), 'draw', 'wave', 0.3, [92, 90, 80, 0], [95, 86, 64, 4]],
    ['panel', '<div class="mv-panel"><div class="pn"><i class="mv-sun"></i><i class="mv-dots"></i></div></div>', 'slam', '', 0.45, [57, 40, 70, 3], [57, 44, 100, 3]],
    ['tape1', S.tape(C.yellow), 'pop', '', 0.5, [24, 28, 16, -34], [75, 24, 15, 32]],
    ['head', '<div class="mv-head"><small>' + esc(SUB) + '</small><b>' + esc(HEAD) + '</b></div>', 'drop', '', 0.5, [40, 12.5, 3.6, 0], [50, 9, 3.2, 0]],
    ['num', '<div class="mv-num">' + esc(NUM) + '</div>', 'wipe', '', 0.35, [87, 11, 17, 0], [88, 15, 24, 0]],
    ['badge', S.badge(esc(BADGE), C.yellow, C.pink), 'pop', 'rot', 0.6, [86, 26, 18, 0], [44, 22, 15, 0]],
    ['chara', '<div class="mv-chara"><img src="' + CHARA + '" alt="" draggable="false"></div>', 'rise', 'breathe', 0.9, [63, 53, 60, 0], [64, 52, 86, 0]],
    ['pola', '<div class="mv-pola"><div class="ph"><i></i><i></i><span class="fl"></span></div><b class="cap">&nbsp;</b></div>', 'pop', 'sway2', 0.8, [22, 49, 31, -8], [27, 41, 46, -6]],
    ['tape2', S.tape(C.teal), 'pop', '', 0.8, [22, 39.5, 14, -6], [27, 22.5, 14, -4]],
    ['script', '<div class="mv-script">' + esc(SCRIPT) + '</div>', 'write', '', 0.75, [32, 24, 13, -9], [20, 15, 11, -8]],
    ['title', '<div class="mv-title">' + letters(TITLE, 'l') + '</div>', 'none', '', 1, [48, 68, 14.5, -6], [33, 72, 15.5, -5]],
    ['kana', '<div class="mv-pill">' + esc(KANA) + '</div>', 'up', '', 0.8, [42, 75.5, 3.3, -2], [28, 80, 2.6, -2]],
    ['catch', '<p class="mv-catch">' + letters(CATCH, 'c') + '</p>', 'none', '', 0.6, [45, 81.5, 3.7, 0], [32, 86, 3.1, 0]],
    ['tags', '<div class="mv-tags">' + TAGS.map((t, i) => '<span style="--i:' + i + '">' + esc(t) + '</span>').join('') + '</div>', 'right', '', 0.55, [47, 88, 3, 0], [87, 37, 2.8, 0]],
    ['dots', '<div class="mv-dots3"><i></i><i></i><i></i></div>', 'up', '', 0.2, [50, 92.5, 3, 0], [50, 90, 2.4, 0]],
    ['band', '<div class="mv-band"><div>' + (esc(MARQUEE) + ' ').repeat(8) + '</div></div>', 'right', '', 0.15, [50, 96.5, 3.4, -3], [50, 95.5, 2.4, -2]],
    // シール
    ['burst', S.burst(esc(HELLO), C.pink), 'pop', 'pulse', 1.2, [86, 60, 16, 10], [80, 66, 13, 10]],
    ['bow', S.bow(C.violet, C.teal), 'pop', 'sway', 1.1, [9, 41, 20, -20], [14, 57, 22, -12]],
    ['gh1', S.gheart(C.pink, C.violet), 'pop', 'sway', 1, [8, 31, 10, -16], [8, 46, 10, -14]],
    ['gh2', S.gheart(C.teal, C.yellow), 'pop', 'sway', 1, [35, 60, 10, 12], [6, 64, 9, 10]],
    ['bl1', S.balloon('#ffe9a8', C.gold), 'float', 'float', 1.3, [92, 42, 12, 6], [93, 56, 10, 6]],
    ['bl2', S.balloon('#ffb3d0', C.pink), 'float', 'float', 1.2, [96, 52, 9, -8], [97, 42, 8, -8]],
    ['bl3', S.balloon('#a8f0e6', C.teal), 'float', 'float', 1.4, [6, 73, 10, 10], [48, 34, 8, 10]],
    ['st1', S.star(C.yellow), 'pop', 'spin', 1, [7, 15, 9, -12], [6, 30, 7, -12]],
    ['st2', S.star(C.yellow), 'pop', 'spin', 1, [66, 91, 7, 14], [55, 88, 6, 14]],
    ['sq', S.squig(), 'pop', 'wig', 0.7, [22, 6.5, 17, -4], [36, 6, 12, -4]],
    ['zg1', S.zig(), 'pop', 'wig', 0.7, [71, 20, 13, -12], [66, 8, 10, -12]],
    ['zg2', S.zig(), 'pop', 'wig', 0.7, [93, 82, 9, 8], [8, 92, 10, 8]],
    ['sp1', S.sparkle(C.yellow), 'pop', 'tw', 1.2, [68, 7, 7, 0], [78, 9, 6, 0]],
    ['sp2', S.sparkle(C.pink), 'pop', 'tw', 1.2, [96, 19, 5.5, 0], [96, 24, 4.5, 0]],
    ['sp3', S.sparkle(C.teal), 'pop', 'tw', 1.2, [40, 34, 6, 0], [40, 14, 5, 0]],
    ['shoot', S.shoot(C.yellow), 'pop', 'bob', 1.1, [85, 77, 22, -14], [56, 80, 16, -14]],
  ];
  stage.innerHTML = L.map(([k, html, e, i], n) => '<div class="mv-p mv-' + k + '-p" data-k="' + k + '"><div class="mv-e e-' + e + '" style="--d:' + (0.15 + n * 0.06).toFixed(2) + 's"><div class="mv-i i-' + (i || 'none') + '" style="--ph:-' + ((n * 0.37) % 3).toFixed(2) + 's">' + html + '</div></div></div>').join('');
  const parts = [...stage.children], img = stage.querySelector('.mv-chara img');
  img.addEventListener('error', () => { img.replaceWith(Object.assign(document.createElement('div'), { className: 'mv-ghost', innerHTML: S.ghost() })); }, { once: true });

  // ---------- 写真：うちの子たち（editor.js のキャラ）が、順番に入れ替わる。タップでプロフィールへ ----------
  const OCS = typeof characters === 'object' && characters ? Object.entries(characters) : [], pola = stage.querySelector('.mv-pola');
  let pi = Math.floor(Math.random() * Math.max(1, OCS.length)), pf = 0;
  function shot() {
    if (!OCS.length) return;
    const [id, c] = OCS[pi++ % OCS.length], ly = pola.querySelectorAll('.ph i'), nx = ly[1 - pf];
    nx.style.backgroundImage = 'url("' + encodeURI(c.image || '') + '")'; nx.classList.add('on'); ly[pf].classList.remove('on'); pf = 1 - pf;
    pola.querySelector('.cap').textContent = c.name || id; pola.dataset.id = id;
    pola.classList.remove('flash'); void pola.offsetWidth; pola.classList.add('flash');
  }
  if (!OCS.length) pola.closest('.mv-p').hidden = true;
  pola.addEventListener('click', () => { if (pola.dataset.id && window.showDetail) window.showDetail(pola.dataset.id); });

  // ---------- 置き場所（スマホの縦長か、パソコンの横長かで切り替え） ----------
  let W = 0, H = 0;
  function layout() {
    const r = stage.getBoundingClientRect(); W = r.width; H = r.height; if (!W) return;
    const wide = W / H > 1.05, u = Math.min(W, H * (wide ? 0.6 : 0.62)) / 100;
    mv.style.setProperty('--u', u.toFixed(2) + 'px'); mv.classList.toggle('wide', wide);
    parts.forEach((el, n) => {
      const [k, , , , z, pp, lp] = L[n], [x, y, s, rot] = wide ? lp : pp;
      el.style.left = x + '%'; el.style.top = y + '%'; el.style.setProperty('--r', rot + 'deg'); el.style.setProperty('--z', z);
      if (k === 'chara') { el.style.height = s + '%'; el.style.width = 'auto'; }
      else if (k === 'band') { el.style.width = '140%'; el.style.fontSize = (s * u).toFixed(1) + 'px'; }
      else if (el.querySelector('svg') || k === 'panel' || k === 'pola') el.style.width = (s * u).toFixed(1) + 'px';
      else el.style.fontSize = (s * u).toFixed(1) + 'px';
    });
    grid.size(); conf.size();
  }
  const grid = P.grid(gcv, C.grid), conf = P.confetti(ccv, [C.pink, C.violet, C.teal, C.yellow, C.orange, '#ffffff']);
  new ResizeObserver(layout).observe(stage);

  // ---------- 登場（OP があるときは、壁が割れるまで待つ） ----------
  let started = false;
  function go() {
    if (started) return; started = true;
    const fonts = document.fonts ? Promise.all(['Lilita One', 'Sacramento', 'Oswald', 'M PLUS Rounded 1c'].map((f) => document.fonts.load('800 40px "' + f + '"', 'Aあ').catch(() => {}))) : Promise.resolve();
    Promise.race([fonts, new Promise((r) => setTimeout(r, root.classList.contains('op-on') ? 0 : 1200))]).then(() => { layout(); mv.classList.add('in'); shot(); setInterval(() => { if (vis && !body.classList.contains('is-after')) shot(); }, 3200); });
  }
  if (root.classList.contains('op-hold')) new MutationObserver((m, o) => { if (!root.classList.contains('op-hold')) { o.disconnect(); go(); } }).observe(root, { attributes: true, attributeFilter: ['class'] });
  else go();

  // ---------- マウス・指で、奥行きのあるずれ。タップで紙吹雪 ----------
  let mx = 0, my = 0, tx = 0, ty = 0, px = -1e4, py = -1e4, pw = 0, pt = 0;
  const point = (e) => { const r = stage.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; tx = (px / r.width - 0.5) * 2; ty = (py / r.height - 0.5) * 2; pt = performance.now(); };
  window.addEventListener('pointermove', (e) => { if (e.pointerType === 'mouse' || e.buttons) point(e); }, { passive: true });
  stage.addEventListener('pointerdown', (e) => {
    point(e); if (REDUCE) return;
    const ch = e.target.closest('.mv-chara-p'), st = e.target.closest('.mv-p');
    conf.burst(px, py, ch ? 46 : 22);
    const el = ch || (st && st.querySelector('svg') ? st : null);
    if (el) { el.classList.remove('boing'); void el.offsetWidth; el.classList.add('boing'); }
  });

  // ---------- 毎フレーム：方眼・紙吹雪・ずれ（見えているときだけ） ----------
  let vis = true, last = 0, odd = false;
  new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (!body.classList.contains('is-after')) body.classList.toggle('on-light', vis); }, { threshold: 0.3 }).observe(mv);
  function loop(now) {
    requestAnimationFrame(loop);
    if (!vis || !W || root.classList.contains('op-hold') || body.classList.contains('is-after')) { last = 0; return; }
    const dt = last ? Math.min(3, (now - last) / 16.7) : 1, t = now / 1000; last = now;
    if (now - pt > 2500) { tx *= 0.96; ty *= 0.96; }   // しばらく動かさないと、まん中にもどる
    mx += (tx - mx) * 0.06 * dt; my += (ty - my) * 0.06 * dt; pw += ((now - pt < 1500 ? 1 : 0) - pw) * 0.05 * dt;
    stage.style.setProperty('--mx', mx.toFixed(3)); stage.style.setProperty('--my', my.toFixed(3));
    if ((odd = !odd) || pw > 0.05) grid.draw(REDUCE ? 0 : t, px, py, pw);   // 方眼は、ゆっくりなので1コマおき
    if (!REDUCE) conf.draw(t, dt);
  }
  layout(); requestAnimationFrame(loop);

  // ---------- プロフィールから戻るたびに、上のモーショングラフィックスを、ランダムで選び直す ----------
  let wasIn = body.classList.contains('in-detail');
  new MutationObserver(() => {
    const now = body.classList.contains('in-detail');
    if (wasIn && !now && window.OC_HERO && window.OC_HERO.use) window.OC_HERO.use();
    wasIn = now;
  }).observe(body, { attributes: true, attributeFilter: ['class'] });
})();
