// archive.js — 質問解答（MAYAMA 未確認信号 調査記録）
// ・質問と答えは qa.js から読みます（書きかえるのは qa.js だけでOK）
// ・届いた質問は「読めない文字」で出てきて、フィルムが現像されると、日本語に解読されます（同じ文字は、いつも同じ記号になる暗号です）
// ・答えは、そのあとにタイプライターみたいに出てきます
// ・キーワードで、記録をさがせます
(window.OC_LOADED = window.OC_LOADED || []).push('archive');

(function () {
  const $ = (s, r) => (r || document).querySelector(s), root = document.documentElement;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const pad = (n, k) => String(n).padStart(k || 2, '0');
  const plain = (s) => esc(String(s == null ? '' : s).trim()).replace(/\n/g, '<br>');

  // ---------- 中身（qa.js） ----------
  let Q = null;
  try { Q = qa; } catch (e) { /* qa.js が読めていない */ }
  if (!Q || typeof Q !== 'object') {
    Q = {}; const b = document.createElement('div'); b.className = 'ar-warn';
    b.textContent = 'qa.js が読みこめていません（書き間違いかも。カンマ「,」や「}」、「`」を確認してね）'; document.body.appendChild(b);
  }
  const list = (Array.isArray(Q.list) ? Q.list : []).filter((r) => r && (String(r.q || '').trim() || String(r.a || '').trim()));
  const links = [['ウェーブボックスで質問を送る', Q.wavebox], ['マシュマロで質問を送る', Q.marshmallow]].filter((l) => String(l[1] || '').trim());

  // ---------- 読めない文字（暗号）：記号を 48 こ作って、CSS にする ----------
  const N = 48;
  (function glyphs() {
    let s = 7, css = '';
    const R = () => ((s = (s * 1103515245 + 12345) >>> 0) / 4294967296);
    const X = [1.6, 5, 8.4], Y = [1.6, 4.4, 7, 9.6, 12.4], P = () => X[Math.floor(R() * 3)] + ' ' + Y[Math.floor(R() * 5)];
    for (let i = 0; i < N; i++) {
      let d = '';
      const n = 2 + Math.floor(R() * 3);
      for (let k = 0; k < n; k++) {
        const t = R();
        if (t < 0.55) d += 'M' + P() + 'L' + P();
        else if (t < 0.75) { const cx = X[Math.floor(R() * 3)], cy = Y[1 + Math.floor(R() * 3)]; d += 'M' + (cx - 1.8) + ' ' + cy + 'a1.8 1.8 0 1 0 3.6 0a1.8 1.8 0 1 0-3.6 0'; }
        else if (t < 0.9) d += 'M' + P() + 'Q5 ' + Y[Math.floor(R() * 5)] + ' ' + P();
        else d += 'M' + P() + 'h.01';
      }
      css += '.g' + i + "{--gm:url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 10 14'%3E%3Cpath d='" + d + "' fill='none' stroke='%23000' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")}";
    }
    const st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  })();
  const gi = (ch) => (Math.imul(ch.codePointAt(0), 2654435761) >>> 0) % N;   // 同じ文字は、いつも同じ記号
  // 文字を、1字ずつの span に（mode：'cx' は記号で出す、'tx' は見えないところから出す）
  function wrap(el, text, mode) {
    el.innerHTML = [...String(text == null ? '' : text).trim()].map((c) => (c === '\n' ? '<br>' : /\s/.test(c) ? c : '<span class="' + mode + (mode === 'cx' ? ' g' + gi(c) : '') + '">' + esc(c) + '</span>')).join('');
  }
  // 解読（左から順に、記号がちらついて、日本語になる）
  function decode(el, text, mode, ms) {
    return new Promise((done) => {
      if (REDUCE) { el.innerHTML = plain(text); return done(); }
      if (!el.querySelector('.' + mode)) wrap(el, text, mode);
      const sp = [...el.querySelectorAll('.' + mode)], n = sp.length, dur = Math.min(ms || 1400, 260 + n * (mode === 'cx' ? 22 : 9)), t0 = performance.now();
      let shown = 0;
      (function f(now) {
        const k = Math.min(n, Math.floor(((now - t0) / dur) * n));
        for (; shown < k; shown++) { const s = sp[shown]; s.className = mode === 'cx' ? 'hot' : 'tx on'; }
        if (mode === 'cx') for (let i = shown; i < Math.min(n, shown + 7); i++) sp[i].className = 'cx g' + Math.floor(Math.random() * N);
        if (shown < n) requestAnimationFrame(f); else setTimeout(() => { el.innerHTML = plain(text); done(); }, 500);
      })(t0);
    });
  }

  // ---------- いちばん上：ビデオカメラ ----------
  const CAVE = window.AR_CAVE, hcv = $('.ar-cv');
  const cam = CAVE && hcv ? CAVE.hero(hcv) : null; if (!cam && hcv) hcv.remove();
  const hero = $('.ar-hero'), trk = $('.o-trk');   // さわると、画面がみだれて「TRACKING」
  if (hero) hero.addEventListener('click', () => { if (cam) cam.burst(); if (trk) { trk.classList.remove('on'); void trk.offsetWidth; trk.classList.add('on'); } });
  const tc = $('.o-tc'), t0 = performance.now();
  (function clock() {   // タイムコード（時:分:秒:コマ）
    const s = (performance.now() - t0) / 1000;
    if (tc) tc.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(Math.floor(s) % 60) + ':' + pad(Math.floor((s % 1) * 30));
    setTimeout(clock, 1000 / 15);
  })();
  $('.o-files').textContent = 'FILES ' + pad(list.length, 3);
  const sub = $('.ar-subt'), subText = sub ? sub.textContent : '';
  if (sub) { wrap(sub, subText, 'cx'); const go = () => setTimeout(() => decode(sub, subText, 'cx', 2200), 900);
    if (root.classList.contains('ar-wait')) setTimeout(go, 950); else go(); }

  // ---------- 新聞（号外） ----------
  const KAN = '〇一二三四五六七八九', kn = (n) => String(n).split('').map((d) => KAN[+d]).join('');
  const kanNum = (n) => (n < 10 ? KAN[n] : n < 20 ? '十' + (n % 10 ? KAN[n % 10] : '') : KAN[Math.floor(n / 10)] + '十' + (n % 10 ? KAN[n % 10] : ''));
  const dt = new Date(), nd = $('.nw-date');
  if (nd) nd.textContent = kn(dt.getFullYear()) + '年' + kanNum(dt.getMonth() + 1) + '月' + kanNum(dt.getDate()) + '日';
  const ph = $('.nw-photo canvas'); if (CAVE && ph) CAVE.halftone(ph, [140, 120, 300]);
  const ro = $('.nw-key'); if (ro) ro.innerHTML = [...'マヤマ質問'].map((c) => '<span><i class="cx g' + gi(c) + '">' + c + '</i><b>' + c + '</b></span>').join('');
  const cta = links.map((l) => '<a class="ar-send" href="' + esc(String(l[1]).trim()) + '" target="_blank" rel="noopener">' + esc(l[0]) + '</a>').join('');
  document.querySelectorAll('.ar-cta').forEach((c) => { c.innerHTML = cta || '<p class="ar-none">（送り先のアドレスが、qa.js にまだ書かれていません）</p>'; });

  // ---------- 解読済みの記録（フィルム） ----------
  const strip = $('.ar-strip'), cnt = $('.ar-count');
  const frame = (r, i) => { const no = list.length - i;
    return '<article class="fr' + (REDUCE ? '' : ' neg') + '" data-i="' + i + '"><header class="fr-h"><b>FRAME ' + pad(no, 3) + '</b><span>受信 ' + esc(r.date || '----.--.--') + '</span></header>' +
      '<p class="fr-l">受信した信号</p><p class="fr-q">' + plain(r.q) + '</p><p class="fr-l">解読　MAYAMA</p><p class="fr-a">' + plain(r.a) + '</p><i class="fr-edge" aria-hidden="true">MAYAMA 0606 ▸ ' + pad(no, 3) + 'A</i></article>'; };
  strip.innerHTML = list.length ? list.map(frame).join('') : '<article class="fr fr-empty"><header class="fr-h"><b>FRAME 000</b><span>受信待ち</span></header><p class="fr-q">まだ解読された記録はありません。<br>最初の信号を、待っています。</p><div class="ar-cta"></div></article>';
  if (!list.length) $('.fr-empty .ar-cta').innerHTML = cta;
  cnt.textContent = list.length;
  // 近づいたら、まず質問を記号に。見えたら、現像 → 質問を解読 → 答えが出る
  const pre = new IntersectionObserver((en) => en.forEach((e) => { if (!e.isIntersecting) return; const f = e.target; pre.unobserve(f); if (!f.dataset.go) wrap($('.fr-q', f), list[+f.dataset.i].q, 'cx'); }), { rootMargin: '0px 0px 60% 0px' });
  const io = new IntersectionObserver((en) => en.forEach((e) => {
    const f = e.target, r = list[+f.dataset.i]; if (!e.isIntersecting || f.dataset.go) return;
    f.dataset.go = 1; io.unobserve(f); f.classList.remove('neg');
    const q = $('.fr-q', f), a = $('.fr-a', f); wrap(a, r.a, 'tx');
    setTimeout(() => decode(q, r.q, 'cx').then(() => decode(a, r.a, 'tx')), REDUCE ? 0 : 650);
  }), { rootMargin: '0px 0px -25% 0px' });   // 画面の下から 1/4 のところまで来たら
  strip.querySelectorAll('.fr[data-i]').forEach((f) => { pre.observe(f); io.observe(f); });

  // ---------- さがす ----------
  const sq = $('.ar-search input'), hit = $('.ar-hit');
  if (sq) sq.addEventListener('input', () => {
    const k = sq.value.trim().toLowerCase(); let n = 0;
    strip.querySelectorAll('.fr[data-i]').forEach((f) => { const r = list[+f.dataset.i], ok = !k || (String(r.q) + ' ' + String(r.a)).toLowerCase().includes(k); f.hidden = !ok; if (ok) n++; });
    hit.textContent = k ? n + ' 件' + (n ? '発掘' : '。見つかりませんでした') : '';
  });
})();
