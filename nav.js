// nav.js — メニュー（MT. MAYAMA 登山鉄道の発車標）と、ページを移るときの電車
// ・画面の下の「MENU」を押すと、駅の発車標がおりてきて、行き先の文字がパタパタめくれて出てきます
// ・行き先を押すと「発車」に変わって、電車が入ってきて画面をおおい、そのまま次のページへ。次のページで電車が出ていきます
// ・どのページでも、<link nav.css> と、この nav.js を入れれば使えます（head の小さなスクリプトも、いっしょに入れてね）
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

  // ---------- 電車 ----------
  function train(en, jp, top) {
    const t = document.createElement('div'); t.className = 'nv-train'; t.setAttribute('aria-hidden', 'true');
    t.innerHTML = '<div class="nv-car"><div class="nv-sign"><small>' + esc(top) + '</small><b>' + esc(en) + '</b><span>' + esc(jp) + '</span></div></div>';
    document.body.appendChild(t); return t;
  }
  function slide(t, from, to, ms, ease) {
    t.classList.add('run');
    const a = t.animate([{ transform: from }, { transform: to }], { duration: REDUCE ? 1 : ms, easing: ease, fill: 'forwards' });
    return new Promise((ok) => { a.onfinish = () => { t.classList.remove('run'); ok(); }; });
  }
  function go(href, en, jp) {   // 電車が入ってきて、画面をおおったら、次のページへ
    try {
      sessionStorage.setItem('nv-go', JSON.stringify({ en, jp, t: Date.now() }));
      if (page(href) === 'index.html') sessionStorage.setItem('oc-op', '1');   // トップに戻るときは、OP を出さない
    } catch (e) { /* 覚えられなくても動く */ }
    const t = train(en, jp, 'NEXT  まもなく');
    slide(t, 'translateX(125vw)', 'translateX(0)', 820, 'cubic-bezier(.1,.7,.22,1)').then(() => { location.href = href; });
  }

  // ---------- 着いたとき：電車が出ていく ----------
  let arr = null;
  try { arr = JSON.parse(sessionStorage.getItem('nv-go')); sessionStorage.removeItem('nv-go'); } catch (e) { /* なにもしない */ }
  if (arr && Date.now() - arr.t < 15000) {
    const t = train(arr.en, arr.jp, 'ARRIVED  到着');
    root.classList.remove('nv-arrive');
    setTimeout(() => slide(t, 'translateX(0)', 'translateX(-175vw)', 760, 'cubic-bezier(.6,0,.8,.4)').then(() => t.remove()), REDUCE ? 0 : 450);
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
  menu.innerHTML = '<div class="nv-in"><div class="nv-top"><span>' + esc(RAILWAY) + '</span><span class="nv-clock">00:00:00</span><button type="button" class="nv-close">CLOSE ✕</button></div>' +
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
