// nav.js — メニュー（MT. MAYAMA 登山鉄道の発車標）と、ページを移るときの電車
// ・画面の下の「MENU」を押すと、駅の発車標がおりてきて、行き先の文字がパタパタめくれて出てきます
// ・行き先を押すと「発車」に変わって、電車が入ってきて画面をおおい、そのまま次のページへ。次のページで電車が出ていきます
// ・どのページでも、<link nav.css> と、この nav.js を入れれば使えます（head の小さなスクリプトも、いっしょに入れてね）
// ・ひみつの入り口：メニューの左上「MT. MAYAMA RAILWAY」を5回つづけて押すと、書きこみ帳（write.html）がひらきます
(window.OC_LOADED = window.OC_LOADED || []).push('nav');

(function () {
  // ===== 変えてもいいところ =====
  // 行き先：[英語（12文字まで）, 日本語, ページ（'' は準備中）, 番線]
  const LINES = [
    ['OC ARCHIVE', 'トップ', 'index.html', 1],
    ['CHARACTERS', 'キャラクター一覧', 'index.html#list', 2],
    ['GUIDELINE', 'ガイドライン', '', 3],
    ['COMPOSITION', '構図置き場', 'composition.html', 4],
    ['SOUNDTRACK', 'サウンドトラック', '', 5],
    ['Q&A', '質問解答', '', 6],
    ['COLUMN', 'コラム', '', 7],
  ];
  const RAILWAY = 'MT. MAYAMA RAILWAY';
  const ANNOUNCE = '本日も MT. MAYAMA 登山鉄道をご利用いただき、ありがとうございます ✦ THANK YOU FOR RIDING THE MT. MAYAMA LINE ✦ 工事中の駅には、まだ止まりません ✦ ';
  // ============================
  const root = document.documentElement, REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const page = (h) => (h.split('#')[0] || 'index.html'), here = location.pathname.split('/').pop() || 'index.html';
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const pad = (n) => String(n).padStart(2, '0');
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  // ---------- パタパタめくれる文字 ----------
  let jobs = [], raf = 0;
  function flaps(el, text, delay) {
    el.innerHTML = [...text].map(() => '<span class="fl"></span>').join('');
    const now = performance.now();
    [...el.children].forEach((c, i) => {
      const to = text[i] === ' ' ? ' ' : text[i];
      if (REDUCE) { c.textContent = to; return; }
      c.textContent = ' '; jobs.push({ c, to, n: 4 + ((Math.random() * 6) | 0) + (i % 5), at: now + delay + i * 22 });
    });
    if (!raf && jobs.length) raf = requestAnimationFrame(tick);
  }
  function tick(now) {
    jobs = jobs.filter((j) => {
      if (now < j.at) return true;
      if (j.n-- > 0) { j.c.textContent = CH[(Math.random() * CH.length) | 0]; j.at = now + 52; if (j.c.animate) j.c.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.12)' }, { transform: 'scaleY(1)' }], 50); return true; }
      j.c.textContent = j.to; return false;
    });
    raf = jobs.length ? requestAnimationFrame(tick) : 0;
  }

  // ---------- 電車（キャンバスに描く。先頭・まん中・最後の3両。最後は丸くて、テールランプつき） ----------
  // まん中の車両（行き先の表示がある）が画面をおおったところで、ページが切りかわります
  function train(en, jp, top) {
    const cv = document.createElement('canvas'); cv.className = 'nv-train'; cv.setAttribute('aria-hidden', 'true');
    const W = innerWidth, H = innerHeight, r = Math.min(devicePixelRatio || 1, 2), vw = W / 100, vm = Math.min(W, H) / 100, G = 4 * vw;
    cv.width = Math.round(W * r); cv.height = Math.round(H * r); document.body.appendChild(cv);
    const c = cv.getContext('2d'), Y = '#ffd21f', NOSE = Math.min(34 * vm, H / 2);
    const cars = [['front', 120 * vw], ['mid', 150 * vw], ['tail', 120 * vw]];
    const shape = (x, w, k) => {
      c.beginPath();
      if (k === 'front') { c.moveTo(x + NOSE, 0); c.lineTo(x + w, 0); c.lineTo(x + w, H); c.lineTo(x + NOSE, H); c.ellipse(x + NOSE, H / 2, NOSE, H / 2, 0, Math.PI / 2, Math.PI * 1.5); }
      else if (k === 'tail') { c.moveTo(x, 0); c.lineTo(x + w - NOSE, 0); c.ellipse(x + w - NOSE, H / 2, NOSE, H / 2, 0, -Math.PI / 2, Math.PI / 2); c.lineTo(x, H); }
      else c.rect(x, 0, w, H);
      c.closePath();
    };
    const font = (wt, px) => wt + ' ' + Math.round(px) + 'px ui-monospace, "SF Mono", Menlo, Consolas, monospace';
    function car(x, w, k) {
      c.save(); shape(x, w, k); c.fillStyle = Y; c.fill(); c.clip();
      c.fillStyle = '#1d1d1d'; c.fillRect(x, 0, w, 0.06 * H);   // 屋根
      c.fillStyle = '#111'; c.fillRect(x, 0.92 * H, w, 0.08 * H); c.fillRect(x, 0.8382 * H, w, 0.008 * H);   // 床下・細い線
      c.fillStyle = '#ff6b2c'; c.fillRect(x, 0.6992 * H, w, 0.08 * H);   // オレンジの帯
      for (let q = x + 7 * vm, n = 0; q < x + w; q += 47 * vm, n++) {
        if (k === 'front' && q < x + NOSE * 0.7) continue;
        if (k === 'tail' && q + 30 * vm > x + w - NOSE * 0.7) break;
        c.fillStyle = '#26343e'; c.fillRect(q, 0.154 * H, 30 * vm, 0.3 * H);   // 窓
        c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(q + 39.6 * vm, 0, 0.4 * vm, H);   // つなぎ目
      }
      if (k !== 'mid') {   // 先頭のライト・最後のテールランプ
        const lx = k === 'front' ? x + NOSE * 0.62 : x + w - NOSE * 0.62;
        c.shadowColor = k === 'front' ? '#fff6d0' : '#ff2a1a'; c.shadowBlur = 30; c.fillStyle = k === 'front' ? '#fffbe8' : '#ff3b2a';
        c.beginPath(); c.arc(lx, 0.6 * H, 2.6 * vm, 0, 7); c.arc(lx, 0.6 * H + 7 * vm, 2.6 * vm, 0, 7); c.fill(); c.shadowBlur = 0;
      }
      c.restore();
      c.fillStyle = '#141414'; c.font = font(800, Math.max(12, Math.min(3.4 * vw, 20)));
      c.fillText(k === 'mid' ? 'MT. MAYAMA LINE  ◆  2026' : k === 'front' ? 'MT. MAYAMA LINE  ▶' : '◀  MT. MAYAMA LINE', x + (k === 'front' ? NOSE * 1.1 : k === 'tail' ? 6 * vw : 31 * vw), 0.655 * H + 6);
      if (k === 'mid') sign(x + 75 * vw, 0.54 * H);
    }
    function sign(cx, cy) {   // 行き先の表示（オレンジ色に光る文字）
      const w = Math.min(84 * vw, 560), h = Math.max(104, Math.min(w * 0.3, 150)), big = Math.max(26, Math.min(8 * vw, 46));
      c.fillStyle = '#111'; c.fillRect(cx - w / 2 - 7, cy - h / 2 - 7, w + 14, h + 14);
      c.fillStyle = '#090909'; c.strokeStyle = '#2b2b2b'; c.lineWidth = 3; c.fillRect(cx - w / 2, cy - h / 2, w, h); c.strokeRect(cx - w / 2, cy - h / 2, w, h);
      c.textAlign = 'center'; c.fillStyle = 'rgba(255,178,31,.75)'; c.font = font(600, 11); c.fillText(top, cx, cy - h / 2 + 24);
      c.shadowColor = 'rgba(255,178,31,.8)'; c.shadowBlur = 12; c.fillStyle = '#ffb21f'; c.font = font(800, big); c.fillText(en, cx, cy + big * 0.32);
      c.shadowBlur = 0; c.fillStyle = '#fff3d6'; c.font = '600 14px "Hiragino Sans", "Noto Sans JP", sans-serif'; c.fillText(jp, cx, cy + h / 2 - 16); c.textAlign = 'left';
      c.fillStyle = 'rgba(0,0,0,.35)'; for (let yy = cy - h / 2; yy < cy + h / 2; yy += 3) c.fillRect(cx - w / 2, yy, w, 1);   // 光る点の、すじ
    }
    function draw(tx, sp) {   // tx：右へのずれ、sp：速さ（0〜1。速いほど、かたむいて、すじが出る）
      const k = -0.24 * sp;
      c.setTransform(r, 0, k * r, r, -k * (H / 2) * r, 0); c.clearRect(-W, 0, W * 3, H);
      let x = -25 * vw - G - cars[0][1] + tx;
      cars.forEach(([k2, w], i) => {
        if (x < W + H * 0.2 && x + w > -H * 0.2) car(x, w, k2);
        if (i < cars.length - 1 && x + w < W && x + w + G > 0) { c.fillStyle = '#151515'; c.fillRect(x + w - 2, 0.08 * H, G + 4, 0.84 * H); c.fillStyle = '#2a2a2a'; for (let q = 0; q < 5; q++) c.fillRect(x + w + (q / 5) * G, 0.08 * H, 1.5, 0.84 * H); }   // 車両のつなぎ（ほろ）
        x += w + G;
      });
      if (sp > 0.05) {   // 速さのすじと、最後の車両のうしろに残る風
        const end = x - G, a0 = -25 * vw - G - cars[0][1] + tx;
        c.fillStyle = 'rgba(255,255,255,' + (0.22 * sp).toFixed(3) + ')';
        for (let q = 0; q < 16; q++) { const yy = H * (0.04 + q * 0.06), off = ((q * 37) % 11) * vw; c.fillRect(Math.max(a0, -W) + off, yy, Math.min(end, 2 * W) - Math.max(a0, -W) - off, 1.5); }
        const g = c.createLinearGradient(end, 0, end + 45 * vw * sp, 0); g.addColorStop(0, 'rgba(255,210,31,' + (0.35 * sp).toFixed(3) + ')'); g.addColorStop(1, 'rgba(255,210,31,0)');
        c.fillStyle = g; for (let q = 0; q < 9; q++) c.fillRect(end - NOSE * 0.3, H * (0.18 + q * 0.08), 45 * vw * sp, 2 + (q % 3));
      }
    }
    cv.run = (from, to, ms, out) => new Promise((ok) => {   // out：だんだん速く（出ていく）／ でなければ、だんだんゆっくり（入ってくる）
      const t0 = performance.now(), D = REDUCE ? 1 : ms;
      (function f(now) {
        const t = Math.min(1, (now - t0) / D), p = out ? t * t * t : 1 - Math.pow(1 - t, 3), sp = out ? t * t : (1 - t) * (1 - t);
        draw(from + (to - from) * p, REDUCE ? 0 : sp);
        if (t < 1) requestAnimationFrame(f); else ok();
      })(t0);
    });
    cv.span = { inX: W + 149 * vw + H * 0.15, outX: -(249 * vw + H * 0.15 + 45 * vw) };   // 入ってくる前の位置・出ていった後の位置
    draw(0, 0);
    return cv;
  }
  function go(href, en, jp) {   // 電車が入ってきて、画面をおおったら、次のページへ
    try {
      sessionStorage.setItem('nv-go', JSON.stringify({ en, jp, t: Date.now() }));
      if (page(href) === 'index.html') sessionStorage.setItem('oc-op', '1');   // トップに戻るときは、OP を出さない
    } catch (e) { /* 覚えられなくても動く */ }
    const t = train(en, jp, 'NEXT  まもなく');
    t.run(t.span.inX, 0, 820, false).then(() => { location.href = href; });
  }

  // ---------- 着いたとき：電車が出ていく ----------
  let arr = null;
  try { arr = JSON.parse(sessionStorage.getItem('nv-go')); sessionStorage.removeItem('nv-go'); } catch (e) { /* なにもしない */ }
  if (arr && Date.now() - arr.t < 15000) {
    const t = train(arr.en, arr.jp, 'ARRIVED  到着');
    root.classList.remove('nv-arrive');
    setTimeout(() => t.run(0, t.span.outX, 760, true).then(() => t.remove()), REDUCE ? 0 : 450);
  } else root.classList.remove('nv-arrive');
  if (location.hash === '#list') {   // 「キャラクター一覧」で来たとき
    history.replaceState(null, '', location.pathname + location.search);
    addEventListener('load', () => { const l = document.getElementById('list-head'); if (l) l.scrollIntoView(); });
  }
  addEventListener('pageshow', (e) => { if (e.persisted) { document.querySelectorAll('.nv-train').forEach((t) => t.remove()); close(); } });   // 「戻る」で戻ってきたとき

  // ---------- メニューのボタンと発車標 ----------
  const btn = document.createElement('button');
  btn.type = 'button'; btn.className = 'nv-btn'; btn.setAttribute('aria-label', 'メニューを開く');
  btn.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="3" width="14" height="15" rx="4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M7 9h10" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="14" r="1.3" fill="currentColor"/><circle cx="15" cy="14" r="1.3" fill="currentColor"/><path d="M8 18l-2 3M16 18l2 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>MENU';
  const menu = document.createElement('div');
  menu.className = 'nv-menu'; menu.setAttribute('role', 'dialog'); menu.setAttribute('aria-modal', 'true'); menu.setAttribute('aria-label', 'メニュー');
  menu.innerHTML = '<div class="nv-in"><div class="nv-top"><span class="nv-rw">' + esc(RAILWAY) + '</span><span class="nv-clock">00:00:00</span><button type="button" class="nv-close">CLOSE ✕</button></div>' +
    '<h2 class="nv-title">DEPARTURES<small>発車標 — 行き先を選んでください</small></h2>' +
    '<div class="nv-head"><span>時刻 TIME</span><span>行き先 DESTINATION</span><span>番線</span></div><nav class="nv-rows"></nav>' +
    '<p class="nv-ann"><span>' + esc(ANNOUNCE.repeat(2)) + '</span></p><p class="nv-note">© OC ARCHIVE — BY MAYAMA</p></div>';
  const toast = document.createElement('div'); toast.className = 'nv-toast'; toast.setAttribute('role', 'status');
  document.body.append(btn, menu, toast);
  const rows = menu.querySelector('.nv-rows'), clock = menu.querySelector('.nv-clock');
  let timer = 0, toastT = 0, opened = 0;

  function open() {
    const now = new Date();
    rows.innerHTML = LINES.map(([en, jp, href, tr], i) => {
      const t = new Date(now.getTime() + (i + 1) * 4 * 60000), st = !href ? ['soon', '工事中 COMING SOON'] : page(href) === here && !href.includes('#') ? ['here', '現在地 YOU ARE HERE'] : ['ok', '定刻 ON TIME'];
      return '<a class="nv-row' + (href ? '' : ' soon') + '" href="' + esc(href || '#') + '" data-i="' + i + '"><span class="nv-time" data-t="' + pad(t.getHours()) + ':' + pad(t.getMinutes()) + '"></span>' +
        '<span class="nv-dest"><span class="nv-en" data-t="' + esc(en.toUpperCase().slice(0, 12)) + '"></span><span class="nv-jp">' + esc(jp) + '<i class="nv-st ' + st[0] + '">' + st[1] + '</i></span></span>' +
        '<span class="nv-track" data-t="' + tr + '"></span></a>';
    }).join('');
    rows.querySelectorAll('[data-t]').forEach((el, k) => flaps(el, el.dataset.t, 380 + Math.floor(k / 3) * 90));
    root.classList.add('nv-open'); menu.classList.add('open'); opened = Date.now();
    tickClock(); timer = setInterval(tickClock, 1000);
    setTimeout(() => menu.querySelector('.nv-close').focus({ preventScroll: true }), 300);
  }
  function close() {
    root.classList.remove('nv-open'); menu.classList.remove('open'); clearInterval(timer);
  }
  function tickClock() { const d = new Date(); clock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds()); }
  function say(s) { toast.textContent = s; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); }

  btn.addEventListener('click', open);
  let taps = [];   // ひみつの入り口：左上の「MT. MAYAMA RAILWAY」を5回つづけて押すと、書きこみ帳（write.html）へ
  menu.querySelector('.nv-rw').addEventListener('click', () => { const n = Date.now(); taps = taps.filter((x) => n - x < 2500).concat(n); if (taps.length >= 5) location.href = 'write.html'; });
  menu.querySelector('.nv-close').addEventListener('click', close);
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu.classList.contains('open')) close(); });
  rows.addEventListener('click', (e) => {
    const a = e.target.closest('.nv-row'); if (!a) return;
    e.preventDefault();
    const [en, jp, href] = LINES[+a.dataset.i];
    if (!href) { a.classList.remove('nope'); void a.offsetWidth; a.classList.add('nope'); say(jp + ' は工事中です。開業をお楽しみに！'); return; }
    if (page(href) === here) {   // 同じページの中で動く
      close();
      if (window.showIndex && document.body.classList.contains('in-detail')) window.showIndex();
      const t = href.includes('#list') && document.getElementById('list-head');
      setTimeout(() => (t ? t.scrollIntoView({ behavior: 'smooth' }) : scrollTo({ top: 0, behavior: 'smooth' })), 350);
      return;
    }
    const st = a.querySelector('.nv-st'); st.className = 'nv-st go'; st.textContent = '発車 DEPARTING';
    a.querySelectorAll('.fl').forEach((c) => { c.style.color = '#5fe08a'; });
    setTimeout(() => go(href, en, jp), REDUCE ? 0 : 420);
  });

  window.OC_NAV = { open, close, go: (href) => { const l = LINES.find((x) => page(x[2]) === page(href)) || ['OC ARCHIVE', 'トップ']; go(href, l[0], l[1]); } };
})();
