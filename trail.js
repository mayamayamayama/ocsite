// trail.js — コラム（MT. MAYAMA 山行記録）
// ・コラムの文章は column.js から読みます（書きかえるのは column.js だけでOK）
// ・コラム1本が、山登り1回分。文章の長さから、その山の高さと標高グラフ（登りの道）ができます
// ・見出し（##）は、道のとちゅうの「地点」。読みすすめると、下の標高計の人が山を登っていきます
// ・さいごまで読むと、山頂の看板が立ちます
(window.OC_LOADED = window.OC_LOADED || []).push('trail');

(function () {
  const $ = (s, r) => (r || document).querySelector(s), root = document.documentElement;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const pad = (n, k) => String(n).padStart(k || 3, '0'), num = (n) => Math.round(n).toLocaleString();
  const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
  const hash = (s) => { let h = 2166136261; for (const c of String(s)) h = Math.imul(h ^ c.codePointAt(0), 16777619); return h >>> 0; };
  const rnd = (seed) => () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);

  // ---------- 中身（column.js） ----------
  let C = null;
  try { C = columns; } catch (e) { /* column.js が読めていない */ }
  if (!Array.isArray(C)) { C = []; const b = document.createElement('div'); b.className = 'tr-warn'; b.textContent = 'column.js が読みこめていません（書き間違いかも。カンマ「,」や「}」、「`」を確認してね）'; document.body.appendChild(b); }
  const posts = C.filter((p) => p && (p.title || p.text)).map((p, i, a) => prep(p, a.length - i));

  // 本文の書き方：## 見出し ／ ![説明](写真) ／ > 引用 ／ --- 区切り ／ **ふとい字**
  function parse(text) {
    const out = []; let para = [], quote = [];
    const flush = () => { if (para.length) out.push({ k: 'p', s: para.join('\n') }); if (quote.length) out.push({ k: 'q', s: quote.join('\n') }); para = []; quote = []; };
    String(text || '').replace(/\r/g, '').split('\n').forEach((l) => {
      const t = l.trim(); let m;
      if (!t) return flush();
      if ((m = t.match(/^##\s*(.+)$/))) { flush(); out.push({ k: 'h', s: m[1] }); }
      else if ((m = t.match(/^!\[(.*?)\]\((.+?)\)$/))) { flush(); out.push({ k: 'img', s: m[1], src: m[2].trim() }); }
      else if (/^-{3,}$/.test(t)) { flush(); out.push({ k: 'hr', s: '' }); }
      else if ((m = l.match(/^\s*>\s?(.*)$/))) { if (para.length) { out.push({ k: 'p', s: para.join('\n') }); para = []; } quote.push(m[1]); }
      else { if (quote.length) { out.push({ k: 'q', s: quote.join('\n') }); quote = []; } para.push(l.trim()); }
    });
    flush(); return out;
  }
  function prep(p, id) {
    const blocks = parse(p.text), len = (b) => (b.k === 'img' ? 90 : b.k === 'hr' ? 20 : b.s.length + 6);
    const chars = Math.max(1, blocks.reduce((s, b) => s + len(b), 0)); let acc = 0;
    blocks.forEach((b) => { b.t = acc / chars; acc += len(b); });
    const R = rnd(hash(String(p.title) + p.date)), top = Math.round(900 + Math.min(2300, chars * 0.9)), base = 380 + Math.floor(R() * 320);
    const ph = [R() * 6.3, R() * 6.3, R() * 6.3], am = 40 + R() * 80, e = [];
    for (let i = 0; i <= 160; i++) { const t = i / 160; let y = base + (top - base) * Math.pow(t, 1.25) * (0.93 + 0.07 * Math.sin(t * 9 + ph[0])) + am * (Math.sin(t * 17 + ph[1]) * 0.6 + Math.sin(t * 41 + ph[2]) * 0.4) * Math.sin(Math.PI * t); e.push(Math.max(base * 0.9, Math.min(top, y))); }
    e[160] = top;
    let up = 0; for (let i = 1; i < e.length; i++) up += Math.max(0, e[i] - e[i - 1]);
    const plain = blocks.filter((b) => b.k === 'p').map((b) => b.s).join(' ');
    return { id, title: String(p.title || 'Untitled'), date: String(p.date || ''), weather: String(p.weather || ''), cover: String(p.cover || '').trim(), blocks, chars, e, top, min: Math.min(...e), up,
      km: (chars / 350).toFixed(1), min_: Math.max(1, Math.round(chars / 450)), ex: plain.replace(/\*\*/g, '').slice(0, 70) + (plain.length > 70 ? '…' : ''), h: Math.min(1, chars / 4000), wp: blocks.filter((b) => b.k === 'h') };
  }
  const elev = (p, t) => { const x = Math.max(0, Math.min(1, t)) * 160, i = Math.floor(x), f = x - i; return p.e[i] + ((p.e[Math.min(160, i + 1)] || p.e[i]) - p.e[i]) * f; };

  // ---------- 標高グラフ（SVG） ----------
  function prof(p, W, H, full) {
    const t0 = full ? 18 : 4, b0 = full ? 22 : 4, Y = (v) => (H - b0 - ((v - p.min) / Math.max(1, p.top - p.min)) * (H - t0 - b0)).toFixed(1);
    const line = p.e.map((v, i) => (i ? 'L' : 'M') + ((i / 160) * W).toFixed(1) + ' ' + Y(v)).join('');
    let g = '<path class="pf-area" d="' + line + 'L' + W + ' ' + H + 'L0 ' + H + 'Z"/><path class="pf-line" d="' + line + '"/>';
    if (full) {
      for (let m = Math.ceil(p.min / 500) * 500; m < p.top; m += 500) g += '<line class="pf-grid" x1="0" x2="' + W + '" y1="' + Y(m) + '" y2="' + Y(m) + '"/><text class="pf-gl" x="4" y="' + (Y(m) - 3) + '">' + num(m) + 'm</text>';
      p.wp.forEach((b, i) => { const x = (b.t * W).toFixed(1); g += '<g class="pf-wp"><line x1="' + x + '" x2="' + x + '" y1="' + Y(elev(p, b.t)) + '" y2="' + (H - b0) + '"/><circle cx="' + x + '" cy="' + Y(elev(p, b.t)) + '" r="7"/><text x="' + x + '" y="' + (Number(Y(elev(p, b.t))) + 3.5) + '">' + (i + 1) + '</text></g>'; });
      g += '<text class="pf-end" x="2" y="' + (H - 5) + '">登山口</text><text class="pf-end r" x="' + (W - 2) + '" y="' + (H - 5) + '">山頂</text>';
    }
    return '<svg class="pf" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-hidden="true">' + g + (full ? '<g class="pf-me"><line x1="0" x2="0" y1="0" y2="' + H + '"/><circle r="6"/></g>' : '') + '</svg>';
  }
  const WX = { 晴: '<circle cx="8" cy="8" r="3.5"/><path d="M8 1v2M8 13v2M1 8h2M13 8h2M3 3l1.4 1.4M11.6 11.6L13 13M3 13l1.4-1.4M11.6 4.4L13 3"/>', 曇: '<path d="M4 12h8a3 3 0 0 0-.6-5.9A4 4 0 0 0 4 7.5 2.3 2.3 0 0 0 4 12z"/>', くもり: '<path d="M4 12h8a3 3 0 0 0-.6-5.9A4 4 0 0 0 4 7.5 2.3 2.3 0 0 0 4 12z"/>',
    雨: '<path d="M2 8a6 6 0 0 1 12 0zM8 8v5a1.5 1.5 0 0 0 3 0"/>', 雪: '<path d="M8 1v14M2 4.5l12 7M2 11.5l12-7"/>', 霧: '<path d="M2 5h12M1 8h14M3 11h10"/>' };
  const wx = (w) => { const k = Object.keys(WX).find((x) => w.includes(x)); return w ? '<span class="wx">' + (k ? '<svg viewBox="0 0 16 16" aria-hidden="true">' + WX[k] + '</svg>' : '') + esc(w) + '</span>' : ''; };
  const stats = (p) => '<dl class="st"><div><dt>距離</dt><dd>' + p.km + '<small>km</small></dd></div><div><dt>累積標高</dt><dd>+' + num(p.up) + '<small>m</small></dd></div><div><dt>最高地点</dt><dd>' + num(p.top) + '<small>m</small></dd></div><div><dt>コースタイム</dt><dd>' + p.min_ + '<small>分</small></dd></div></dl>';
  const photo = (src, cap, cls) => '<figure class="' + cls + '"><div class="ph"><img src="' + esc(src) + '" alt="' + esc(cap) + '" loading="lazy" decoding="async" draggable="false"><i class="shield"></i></div>' + (cap ? '<figcaption>' + esc(cap) + '</figcaption>' : '') + '</figure>';

  // ---------- 一覧 ----------
  const cards = $('.tr-cards');
  $('.tr-count').textContent = posts.length;
  cards.innerHTML = posts.length ? posts.map((p) => '<a class="tc" href="#post-' + p.id + '"><p class="tc-top"><span>No.' + pad(p.id) + '</span><span>' + esc(p.date) + '</span>' + wx(p.weather) + '</p>' +
    (p.cover ? '<div class="tc-cov ph"><img src="' + esc(p.cover) + '" alt="" loading="lazy" draggable="false"><i class="shield"></i></div>' : '') +
    '<h3>' + esc(p.title) + '</h3>' + prof(p, 300, 46, false) + stats(p) + '<p class="tc-ex">' + esc(p.ex) + '</p></a>').join('')
    : '<p class="tr-empty">まだ記録はありません。<br>最初の山を、準備しています。</p>';

  // ---------- 3D の山なみ ----------
  let D3 = null; const cv = $('.tr-cv');
  if (window.TR3D && cv) { D3 = window.TR3D.start(cv, $('.tr-labels'), posts.map((p) => ({ id: p.id, title: p.title, h: p.h })), (p) => { flown = true; go(p.id); }); D3.ready.catch((e) => { console.warn('[column] 3D なし', e); D3 = null; $('.tr-hero').classList.add('tr-flat'); }); }
  else if (cv) $('.tr-hero').classList.add('tr-flat');
  let flown = false;

  // ---------- 記録をひらく ----------
  const view = $('.tr-view'), page = $('.tr-page'), track = $('.tr-track');
  let cur = null, pushed = false, ys = [], summit = false, raf = 0;
  const go = (id) => { pushed = true; location.hash = 'post-' + id; };
  function open(p) {
    cur = p; summit = false;
    const i = posts.indexOf(p), newer = posts[i - 1], older = posts[i + 1];
    let n = 0;
    const body = p.blocks.map((b) => {
      const at = ' data-t="' + b.t.toFixed(4) + '"';
      if (b.k === 'h') { n++; return '<h2 class="wp"' + at + '><i>' + n + '</i><span>' + inline(b.s) + '</span><small>地点 ' + n + '　標高 ' + num(elev(p, b.t)) + 'm</small></h2>'; }
      if (b.k === 'img') return photo(b.src, b.s, 'tp-img').replace('<figure', '<figure' + at);
      if (b.k === 'q') return '<blockquote' + at + '>' + inline(b.s) + '</blockquote>';
      if (b.k === 'hr') return '<hr' + at + '>';
      return '<p' + at + '>' + inline(b.s) + '</p>';
    }).join('');
    page.innerHTML = '<header class="tp-h"><p class="tc-top"><span>No.' + pad(p.id) + '</span><span>' + esc(p.date) + '</span>' + wx(p.weather) + '</p><h1>' + esc(p.title) + '</h1>' +
      (p.cover ? photo(p.cover, '', 'tp-cov') : '') + stats(p) + '<figure class="tp-prof">' + prof(p, 600, 150, true) + '</figure></header>' +
      '<div class="tp-body">' + body + '</div>' +
      '<footer class="tp-end"><div class="tp-sign" aria-label="山頂"><div class="tp-board"><small>山頂</small><b>' + esc(p.title) + '</b><span>標高 ' + num(p.top) + 'm</span></div><i></i><i></i></div>' +
      '<p class="tp-done">おつかれさまでした。登頂です！</p><div class="tp-nav"><button type="button" class="tp-down">下山する（一覧へ）</button>' +
      (older ? '<a href="#post-' + older.id + '">ひとつ前の山へ<small>' + esc(older.title) + '</small></a>' : '') + (newer ? '<a href="#post-' + newer.id + '">新しい山へ<small>' + esc(newer.title) + '</small></a>' : '') + '</div></footer>';
    track.innerHTML = '<div class="tk-alt"><b>' + num(p.e[0]) + '</b><small>m</small></div><div class="tk-at">登山口</div>' + prof(p, 600, 150, true).replace('class="pf"', 'class="pf tk-pf"') +
      '<div class="tk-meta"><span class="tk-pc">0%</span><span class="tk-rest">残り ' + p.km + 'km</span></div>' +
      (p.wp.length ? '<ol class="tk-wp">' + p.wp.map((b, k) => '<li><button type="button" data-t="' + b.t + '"><i>' + (k + 1) + '</i>' + esc(b.s) + '</button></li>').join('') + '</ol>' : '');
    view.hidden = false; view.scrollTop = 0; root.classList.add('tr-lock');
    requestAnimationFrame(() => { view.classList.add('on'); measure(); onScroll(); });
    if (D3) D3.pause(true);
    page.querySelectorAll('img').forEach((im) => im.addEventListener('load', measure, { once: true }));
  }
  function close() {
    if (!cur) return; cur = null; view.classList.remove('on'); root.classList.remove('tr-lock');
    setTimeout(() => { if (!cur) { view.hidden = true; page.innerHTML = ''; } }, REDUCE ? 0 : 450);
    if (D3) { D3.pause(false); D3.home(); }
  }
  function route() {
    const m = location.hash.match(/^#post-(\d+)$/), p = m && posts.find((x) => x.id === +m[1]);
    if (!p) { flown = false; pushed = false; return close(); }
    if (cur === p) return;
    if (D3 && !cur && !flown && pushed && cv.getBoundingClientRect().bottom > 120) D3.fly(posts.indexOf(p), () => open(p)); else open(p);
    flown = false;
  }
  addEventListener('hashchange', route);
  page.addEventListener('click', (e) => {
    if (e.target.closest('.tp-down')) { if (pushed) { pushed = false; history.back(); } else location.hash = ''; return; }
    const a = e.target.closest('.tp-nav a'); if (a) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); route(); }   // 山から山へは、戻るボタンの数をふやさない
  });
  cards.addEventListener('click', (e) => { if (e.target.closest('.tc')) pushed = true; });
  track.addEventListener('click', (e) => { const b = e.target.closest('[data-t]'); if (!b) return; const t = +b.dataset.t, el = [...page.querySelectorAll('.tp-body [data-t]')].find((x) => +x.dataset.t >= t - 1e-4); if (el) view.scrollTo({ top: el.getBoundingClientRect().top + view.scrollTop - 90, behavior: REDUCE ? 'auto' : 'smooth' }); });
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('.ph')) e.preventDefault(); });

  // ---------- 読みすすめると、山を登る ----------
  function measure() { ys = [...page.querySelectorAll('.tp-body [data-t]')].map((el) => [el.offsetTop, +el.dataset.t]); const b = $('.tp-body', page); if (b) ys.push([b.offsetHeight, 1]); }
  function onScroll() {
    raf = 0; if (!cur || !ys.length) return;
    const b = $('.tp-body', page), a = view.clientHeight * 0.45 - b.getBoundingClientRect().top; let t = 0;
    if (a > 0) { let i = 0; while (i < ys.length - 1 && ys[i + 1][0] <= a) i++; const [y0, t0] = ys[i], [y1, t1] = ys[Math.min(ys.length - 1, i + 1)]; t = y1 > y0 ? t0 + (t1 - t0) * Math.min(1, (a - y0) / (y1 - y0)) : t1; }
    const end = $('.tp-end', page).getBoundingClientRect().top < view.clientHeight * 0.8; if (end) t = 1;
    const e = elev(cur, t), wpI = cur.wp.filter((w) => w.t <= t + 1e-4).length;
    $('.tk-alt b', track).textContent = num(e);
    $('.tk-at', track).textContent = t >= 1 ? '山頂' : wpI ? '地点 ' + wpI + '　' + cur.wp[wpI - 1].s : '登山口';
    $('.tk-pc', track).textContent = Math.round(t * 100) + '%';
    $('.tk-rest', track).textContent = t >= 1 ? '登頂！' : '残り ' + ((1 - t) * cur.km).toFixed(1) + 'km';
    track.querySelectorAll('.tk-wp button').forEach((x, k) => x.classList.toggle('on', k === wpI - 1));
    const me = $('.pf-me', track), x = t * 600, Y = 150 - 22 - ((e - cur.min) / Math.max(1, cur.top - cur.min)) * (150 - 40);
    me.setAttribute('transform', 'translate(' + x.toFixed(1) + ' 0)'); me.querySelector('circle').setAttribute('cy', Y.toFixed(1));
    if (t >= 1 && !summit) { summit = true; page.classList.add('summit'); track.classList.add('top'); try { navigator.vibrate && navigator.vibrate([20, 60, 20]); } catch (er) { /* なにもしない */ } }
  }
  view.addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(onScroll); }, { passive: true });
  addEventListener('resize', () => { if (cur) { measure(); onScroll(); } });
  route();
})();
