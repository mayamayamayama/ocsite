// museum.js — 構図置き場（MAYAMA MUSEUM）
// ・展示のふやしかた（かんたん）：NovelAI の画像の名前を「構図-タイトル.png」にして、いつもどおり GitHub にアップロードするだけ
//   タイトルは名前から、ベースプロンプトは画像の中から、自動で読みとります。順番を決めたいときは「構図-01-タイトル.png」のように番号を入れる
// ・書きこみ帳（write.html）で入れたもの（data/prompts.json）も、いっしょに並びます
// ・暗い展示室を進むと、作品ごとにスポットライトがバチッと灯って、光の中にほこりが舞います
// ・作品の札のボタンで、プロンプトをコピー。作品を押すと、近づいて大きく見られます。右上の「目録」から、作品へとべます
(window.OC_LOADED = window.OC_LOADED || []).push('museum');

(function () {
  // ===== 変えてもいいところ =====
  const DATA = 'data/prompts.json';                       // 展示のリスト（書きこみ帳が作って、更新します）
  const LOBBY = ['museum-lobby.gif', 'museum-lobby.mp4', 'museum-lobby.webm', 'museum-lobby.png', 'museum-lobby.jpg'];  // ロビーで流す GIF・動画（書きこみ帳で選んでいないときは、この名前をさがす）
  const MEDIUM = 'NovelAI — Base Prompt';                  // 作品の札の「技法」の行
  const PREFIX = '構図-';                                   // この名前で始まる画像を、自動で展示する
  // ============================
  const $ = (s, r) => (r || document).querySelector(s), body = document.body, root = document.documentElement;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const pad = (n, k) => String(n).padStart(k || 2, '0');
  const hall = $('#hall'), toast = $('.mu-toast'), lob = $('.mu-lobby');
  const COPY_ICON = '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="5" y="5" width="9" height="9" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M3 11V3h8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  const BLANK = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';   // 読みこむまでの、からっぽの絵
  let items = [], toastT = 0;

  // ---------- 読みこみ ----------
  Promise.all([fetch(DATA + '?t=' + Date.now(), { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null), find()]).then(([d, found]) => {
    items = (d && Array.isArray(d.items) ? d.items.filter((x) => x && x.image) : []).concat(found);
    lobby(d && d.lobby); render(); fill();
  });

  // ---------- 「構図-○○.png」を、サイトのファイルの中からさがす（GitHub に名前の一覧を聞く） ----------
  function repo() {
    const m = location.hostname.match(/^([^.]+)\.github\.io$/i); if (!m) return null;
    const seg = location.pathname.split('/').filter(Boolean), first = seg.length > 1 || (seg[0] && !/\.[a-z0-9]+$/i.test(seg[0])) ? seg[0] : '';
    return m[1] + '/' + (first || m[1] + '.github.io');
  }
  async function find() {
    const R = repo(), K = 'oc-kozu'; if (!R) return [];
    let names = null, c = null;
    try { c = JSON.parse(localStorage.getItem(K)); } catch (e) { /* なにもしない */ }
    if (c && c.r === R && Date.now() - c.t < 120000) names = c.n;   // 2分のあいだは、前に聞いた一覧を使う
    if (!names) {
      try {
        const r = await fetch('https://api.github.com/repos/' + R + '/contents/', { headers: { Accept: 'application/vnd.github+json' } }); if (!r.ok) throw new Error(r.status);
        names = (await r.json()).filter((f) => f.type === 'file' && f.name.indexOf(PREFIX) === 0 && /\.(png|jpe?g|webp)$/i.test(f.name)).map((f) => f.name);
        try { localStorage.setItem(K, JSON.stringify({ r: R, t: Date.now(), n: names })); } catch (e) { /* なにもしない */ }
      } catch (e) { names = c && c.r === R ? c.n : []; }
    }
    return names.map((n) => { const b = n.slice(PREFIX.length).replace(/\.[a-z]+$/i, ''), m = b.match(/^(\d+)[-_ ]*(.*)$/); return { file: n, num: m ? +m[1] : 1e9, title: (m ? m[2] : b) || 'Untitled', image: '', prompt: '' }; })
      .sort((a, b) => a.num - b.num || (a.title < b.title ? -1 : 1));
  }
  async function naiPrompt(u) {   // NovelAI の PNG に入っている、ベースプロンプトを読む
    try {
      const dv = new DataView(u.buffer), lat = new TextDecoder('latin1'), utf = new TextDecoder(), T = {};
      if (u[0] !== 0x89 || u[1] !== 0x50) return '';
      for (let p = 8; p + 8 <= u.length;) {
        const n = dv.getUint32(p), type = lat.decode(u.subarray(p + 4, p + 8)), d = u.subarray(p + 8, p + 8 + n);
        if (type === 'tEXt') { const z = d.indexOf(0); T[lat.decode(d.subarray(0, z))] = utf.decode(d.subarray(z + 1)); }
        if (type === 'iTXt') { const z = d.indexOf(0); if (!d[z + 1]) { let q = d.indexOf(0, z + 3) + 1; q = d.indexOf(0, q) + 1; T[lat.decode(d.subarray(0, z))] = utf.decode(d.subarray(q)); } }
        if (type === 'IEND') break; p += 12 + n;
      }
      let c = {}; try { c = JSON.parse(T.Comment || '{}'); } catch (e) { /* なにもしない */ }
      return (c.v4_prompt && c.v4_prompt.caption && c.v4_prompt.caption.base_caption) || c.prompt || T.Description || '';
    } catch (e) { return ''; }
  }
  async function fill() {   // 見つけた画像を、順番に読みこんで、プロンプトを札に書く
    for (let i = 0; i < items.length; i++) {
      const it = items[i]; if (!it.file) continue;
      const room = document.getElementById('room-' + (i + 1)), img = room && room.querySelector('.mu-mat img'), pr = room && room.querySelector('.mu-prompt');
      try {
        const r = await fetch(encodeURIComponent(it.file)); if (!r.ok) throw new Error(r.status);
        const buf = new Uint8Array(await r.arrayBuffer()); it.prompt = await naiPrompt(buf);
        it.image = URL.createObjectURL(new Blob([buf], { type: r.headers.get('content-type') || 'image/png' }));
        if (img) { img.src = it.image; img.classList.remove('wait'); }
        const th = document.querySelector('.mu-grid [data-i="' + i + '"] .mu-th'); if (th) th.style.backgroundImage = 'url("' + it.image + '")';
      } catch (e) { it.prompt = ''; }
      if (pr) pr.textContent = it.prompt || '（この画像には、プロンプトが入っていませんでした）';
    }
  }
  setTimeout(() => body.classList.add('mu-in'), REDUCE ? 0 : 450);   // 上下の黒い幕がひらく
  try { const w = JSON.parse(localStorage.getItem('oc-write')); if (w && w.token) { const a = document.createElement('a'); a.className = 'mu-own'; a.href = 'write.html'; a.textContent = '＋ 展示する'; body.appendChild(a); } } catch (e) { /* なにもしない */ }   // 書きこみ帳で鍵を入れた端末だけに出るボタン

  // ---------- ロビー ----------
  function lobby(L) {   // GIF・画像・動画（mp4・webm）のどれでも。額縁なしで、ふちがやみに溶ける
    const box = $('.mu-screen'), list = (L && L.image ? [L.image] : []).concat(LOBBY);
    const next = (i) => {
      if (i >= list.length) return;
      const u = list[i], vid = /\.(mp4|webm|mov)(\?|$)/i.test(u), m = document.createElement(vid ? 'video' : 'img');
      if (vid) { m.muted = m.loop = m.autoplay = m.playsInline = true; m.setAttribute('playsinline', ''); m.setAttribute('muted', ''); m.disablePictureInPicture = true; } else { m.alt = ''; m.draggable = false; }
      m.addEventListener(vid ? 'loadeddata' : 'load', () => { box.replaceChildren(m, shield()); box.classList.add('on'); $('.mu-tap').hidden = false; if (vid && m.play) m.play().catch(() => {}); }, { once: true });
      m.addEventListener('error', () => next(i + 1), { once: true }); m.src = u;
    };
    next(0);
  }
  const shield = () => { const s = document.createElement('i'); s.className = 'mu-shield'; return s; };
  const spot = $('.mu-spot');
  if (matchMedia('(hover: hover) and (pointer: fine)').matches && !REDUCE) {   // パソコン：光がマウスについてくる
    lob.addEventListener('pointermove', (e) => { lob.classList.remove('auto'); const r = lob.getBoundingClientRect(); spot.style.transform = 'translate(' + (e.clientX - r.left - r.width / 2) + 'px,' + (e.clientY - r.top - r.height * 0.4) + 'px)'; });
    lob.addEventListener('pointerleave', () => { spot.style.transform = ''; lob.classList.add('auto'); });
  }
  $('.mu-hero').addEventListener('click', () => lob.classList.toggle('allon'));   // 作品を押すと、照明がぜんぶつく

  // ---------- 展示室 ----------
  function render() {
    $('#mu-count').textContent = pad(items.length);
    hall.innerHTML = items.length ? items.map(room).join('') :
      '<section class="mu-room mu-emptyroom"><div class="mu-light"></div><p class="mu-rno">ROOM 01</p><div class="mu-plaque"><p class="mu-no">Now Preparing</p><h2 class="mu-ptitle">ただいま展示の準備中です</h2><p class="mu-medium">PLEASE COME BACK SOON</p></div></section>';
    const io = new IntersectionObserver((en) => en.forEach((e) => {
      if (e.intersectionRatio >= 0.4) e.target.classList.add('lit'); else if (e.intersectionRatio < 0.08) e.target.classList.remove('lit');
    }), { threshold: [0, 0.08, 0.4] });
    hall.querySelectorAll('.mu-room').forEach((r) => io.observe(r));
    const grid = $('.mu-grid');
    grid.innerHTML = items.map((it, i) => '<button type="button" data-i="' + i + '"><span class="mu-th" style="background-image:url(\'' + esc(it.image) + '\')"></span><span class="mu-cn">Room ' + pad(i + 1) + '</span><span class="mu-ct">' + esc(it.title || 'Untitled') + '</span></button>').join('');
  }
  function room(it, i) {
    return '<section class="mu-room" id="room-' + (i + 1) + '"><div class="mu-light"></div><span class="mu-bignum" aria-hidden="true">' + pad(i + 1) + '</span><p class="mu-rno">ROOM ' + pad(i + 1) + '</p>' +
      '<figure class="mu-piece" data-i="' + i + '"><div class="mu-frame"><div class="mu-mat"><img src="' + (it.image ? esc(it.image) : BLANK) + '" alt="' + esc(it.title) + '" decoding="async" draggable="false"' +
      (it.w && it.h ? ' width="' + (+it.w) + '" height="' + (+it.h) + '"' : it.file && !it.image ? ' class="wait"' : '') + '><i class="mu-shield"></i></div></div></figure>' + plaque(it, i, false) + '</section>';
  }
  function plaque(it, i, full) {
    const d = String(it.date || '').replace(/-/g, '.');
    return '<div class="mu-plaque"><p class="mu-no">No.' + pad(it.file ? (it.num < 1e9 ? it.num : i + 1) : items.length - i, 3) + (d ? ' — ' + esc(d) : '') + '</p><h2 class="mu-ptitle">' + esc(it.title || 'Untitled') + '</h2><p class="mu-medium">' + esc(MEDIUM) + '</p>' +
      '<p class="mu-prompt">' + (it.file && !it.image ? '読みこみ中…' : esc(it.prompt)) + '</p><button type="button" class="mu-copy" data-i="' + i + '">' + COPY_ICON + '<span>COPY PROMPT</span></button>' +
      (full ? '' : '<button type="button" class="mu-more" data-i="' + i + '">プロンプトを全部見る</button>') + '</div>';
  }

  // ---------- コピー ----------
  function say(s) { toast.textContent = s; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 1800); }
  function fallback(t) {
    const a = document.createElement('textarea'); a.value = t; a.setAttribute('readonly', ''); a.style.cssText = 'position:fixed;top:-200px;opacity:0';
    body.appendChild(a); a.select(); a.setSelectionRange(0, t.length); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* なにもしない */ } a.remove(); return ok;
  }
  function copy(i, b) {
    const t = String((items[i] || {}).prompt || ''); if (!t) return say('この作品には、コピーできるプロンプトがありません');
    const done = () => { b.classList.add('done'); b.lastChild.textContent = 'COPIED ✓'; say('プロンプトをコピーしました'); setTimeout(() => { b.classList.remove('done'); b.lastChild.textContent = 'COPY PROMPT'; }, 1600); };
    const fail = () => (fallback(t) ? done() : say('コピーできませんでした。「プロンプトを全部見る」から長押しで選んでね'));
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(t).then(done, fail); else fail();
  }
  document.addEventListener('click', (e) => {
    const c = e.target.closest('.mu-copy'); if (c) return copy(+c.dataset.i, c);
    const p = e.target.closest('.mu-piece, .mu-more'); if (p) return view(+p.dataset.i);
    const g = e.target.closest('.mu-grid button'); if (g) { overlay(cat, false); const r = document.getElementById('room-' + (+g.dataset.i + 1)); if (r) r.scrollIntoView(); }
  });
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('.mu-mat, .mu-screen')) e.preventDefault(); });

  // ---------- 目録・近づいて見る ----------
  const cat = $('.mu-cat'), vw = $('.mu-view'), vin = $('.mu-view-in');
  let cur = -1, sx = 0;
  function overlay(el, on) { el.classList.toggle('on', on); root.classList.toggle('mu-lock', cat.classList.contains('on') || vw.classList.contains('on')); }
  $('.mu-catbtn').addEventListener('click', () => overlay(cat, true));
  cat.querySelector('.mu-x').addEventListener('click', () => overlay(cat, false));
  function view(i) {
    if (!items[i]) return; cur = i; const it = items[i];
    vin.innerHTML = '<div class="mu-frame"><div class="mu-mat"><img src="' + esc(it.image) + '" alt="' + esc(it.title) + '" draggable="false"><i class="mu-shield"></i></div></div>' + plaque(it, i, true) +
      '<div class="mu-nav"><button type="button" data-d="-1">← PREV</button><button type="button" data-d="1">NEXT →</button></div>';
    vw.scrollTop = 0; overlay(vw, true);
  }
  vw.querySelector('.mu-x').addEventListener('click', () => overlay(vw, false));
  vw.addEventListener('click', (e) => { const b = e.target.closest('[data-d]'); if (b && items.length) view((cur + +b.dataset.d + items.length) % items.length); });
  vw.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
  vw.addEventListener('touchend', (e) => { const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 70 && items.length > 1) view((cur + (dx < 0 ? 1 : -1) + items.length) % items.length); });
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { overlay(vw, false); overlay(cat, false); }
    if (vw.classList.contains('on') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) view((cur + (e.key === 'ArrowRight' ? 1 : -1) + items.length) % items.length);
  });
  $('.mu-exit a').addEventListener('click', (e) => { if (window.OC_NAV) { e.preventDefault(); window.OC_NAV.go('index.html'); } });

  // ---------- 光の中のほこり（灯っている展示室だけ） ----------
  const cv = $('.mu-dust'), ctx = cv.getContext('2d');
  if (REDUCE || !ctx) return;
  const P = Array.from({ length: 46 }, () => ({ u: Math.random(), v: Math.random(), s: 0.004 + Math.random() * 0.012, r: 0.6 + Math.random() * 1.8, ph: Math.random() * 7 }));
  let W = 0, H = 0, dpr = 1, last = 0;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; };
  addEventListener('resize', size); size();
  (function loop(now) {
    requestAnimationFrame(loop);
    if (now - last < 33) return; const dt = Math.min(3, (now - last) / 33); last = now;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    let rm = null, best = 0;
    hall.querySelectorAll('.mu-room.lit').forEach((r) => { const b = r.getBoundingClientRect(), vis = Math.min(b.bottom, H) - Math.max(b.top, 0); if (vis > best) { best = vis; rm = [b, r]; } });
    if (!rm || root.classList.contains('mu-lock')) return;
    const [b, r] = rm, wide = W >= 900, even = wide && [...hall.children].indexOf(r) % 2 === 1, ax = b.left + b.width * (wide ? (even ? 0.6 : 0.4) : 0.5), ay = b.top - b.height * 0.04, t = now / 1000;
    ctx.fillStyle = '#ffe6b4';
    for (const p of P) {
      p.v += p.s * dt * 0.25; if (p.v > 1) { p.v = 0; p.u = Math.random(); }
      const y = ay + p.v * b.height * 0.8, hw = Math.tan(0.31) * (y - ay), x = ax + (p.u - 0.5 + Math.sin(t * 0.6 + p.ph) * 0.04) * 2 * hw;
      ctx.globalAlpha = Math.max(0, 1 - Math.abs(p.u - 0.5) * 2) * (0.35 + 0.35 * Math.sin(t * 1.7 + p.ph)) * Math.min(1, p.v * 6);
      ctx.beginPath(); ctx.arc(x, y, p.r, 0, 6.29); ctx.fill();
    }
  })(0);
})();
