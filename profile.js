// profile.js — プロフィール画面（詳細画面）の文字の動き（リリックモーション）
// ・名前の下に、キャラの言葉（名前・タグ・年齢・身長・誕生日など）が、1つずつ違う動きで出ては消える帯
// ・プロフィールの各行は、見えたときに、言葉が1つずつせり上がる
// ・見出しの文字は、ランダムな文字が並んだあと、正しい文字にそろう
// ・プロンプトの欄は、上から光の線が走って現れる
// 文章そのものは変えずに、見え方だけを変えています。このファイルが無くても、プロフィール画面はふつうに見られます。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('profile');
  const box = document.getElementById('profile-box'), screen = document.getElementById('detail-screen');
  if (!box || !screen) return;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ===== ここの数字を変えると、見た目が変わります =====
  const STEP = 1.35;   // 帯の言葉を、1つ何秒ずつ見せるか
  const ACC = ['#e8501e', '#fa8c14', '#14a39f', '#ff2fa0'];   // キャラごとの差し色（1人目から順に）

  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+';
  let timer = 0, io = null, k = 0, words = [], stage = null, band = null, lastIn = '', t0 = 0;

  // ランダムな文字から、正しい文字にそろえる
  function scramble(el, text, ms) {
    const s0 = performance.now();
    (function f() {
      const p = Math.min(1, (performance.now() - s0) / ms), n = Math.floor(text.length * p);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === ' ' || c === '/' ? c : pick(CH))).join('');
      if (p < 1) setTimeout(f, 40); else el.textContent = text;
    })();
  }

  // 文章を、言葉ごとの小さな箱に分ける（文字そのものは変えない）
  function wrapWords(el) {
    if (el.dataset.ly) return; el.dataset.ly = '1';
    const text = el.textContent, parts = seg ? Array.from(seg.segment(text), (s) => s.segment) : text.split(/(\s+)/);
    el.textContent = ''; let n = 0;
    parts.forEach((s) => {
      if (!s) return;
      if (/^\s+$/.test(s)) { el.appendChild(document.createTextNode(s)); return; }
      const w = document.createElement('span'); w.className = 'w'; w.style.setProperty('--k', Math.min(n++, 45)); w.textContent = s; el.appendChild(w);
    });
  }

  // ---------- 言葉の帯 ----------
  const FX_IN = ['rise', 'flip', 'zoom', 'slide', 'wipe', 'scram'], FX_OUT = ['up', 'drop', 'cut'];
  function show() {
    if (!stage || !stage.isConnected || !screen.classList.contains('active')) { timer = 0; return; }   // 詳細画面を閉じたら止める
    timer = setTimeout(show, STEP * 1000);
    if (document.hidden || !words.length) return;
    const w = words[k % words.length]; k++;
    stage.querySelectorAll('.ly-w:not(.gone)').forEach((o) => { o.classList.add('gone', 'x-' + pick(FX_OUT)); setTimeout(() => o.remove(), 800); });
    let fx = pick(FX_IN); if (fx === lastIn) fx = FX_IN[(FX_IN.indexOf(fx) + 1) % FX_IN.length]; lastIn = fx;
    const el = document.createElement('div'); el.className = `ly-w i-${fx}${w.c ? ' ' + w.c : ''}`; el.dataset.t = w.t;
    [...w.t].forEach((c, n) => { const s = document.createElement('span'); s.className = 'l'; s.style.setProperty('--n', n); s.textContent = c === ' ' ? ' ' : c; el.appendChild(s); });
    stage.appendChild(el);
    const sw = el.offsetWidth, cw = stage.clientWidth;   // 帯からはみ出す長さなら、小さくする
    if (sw > cw) el.style.fontSize = (parseFloat(getComputedStyle(el).fontSize) * cw * 0.97) / sw + 'px';
    if (fx === 'scram') el.querySelectorAll('.l').forEach((s, n) => { const c = s.textContent; if (c.trim()) setTimeout(() => scramble(s, c, 260 + n * 40), 0); });
    const no = ((k - 1) % words.length) + 1, sec = (performance.now() - t0) / 1000;
    band.querySelector('.ly-no').textContent = `LYRIC ${pad(no)} / ${pad(words.length)}`;
    band.querySelector('.ly-bar b').style.width = (no / words.length) * 100 + '%';
    band.querySelector('.ly-tc').textContent = `${pad(Math.floor(sec / 60))}:${pad(Math.floor(sec % 60))}:${pad(Math.floor((sec * 24) % 24))}`;
  }

  // ---------- 詳細画面が描かれるたびに、動きをつける ----------
  function enhance() {
    const head = box.querySelector('.d-head');
    if (!head || head.dataset.ly) return; head.dataset.ly = '1';
    clearTimeout(timer); if (io) io.disconnect();
    const no = (box.querySelector('.d-no') || {}).textContent || '01 / 01', idx = parseInt(no, 10) || 1;
    box.style.setProperty('--hc', ACC[(idx - 1) % ACC.length]); box.classList.add('ly-on');

    // 帯に出す言葉
    const nameEl = head.querySelector('.d-name'), name = nameEl ? nameEl.getAttribute('aria-label') || nameEl.textContent : '';
    const val = (key) => { const r = [...box.querySelectorAll('.p-row')].find((q) => (q.querySelector('.p-key') || {}).textContent === key); return r ? r.querySelector('.p-val').textContent.trim() : ''; };
    const age = val('Age'), h = val('Height'), bd = val('Birthday');
    words = [{ t: name, c: 'lime' }, ...[...head.querySelectorAll('.pills i')].map((e) => ({ t: e.textContent.trim() })),
      age && { t: age + 'Y' }, h && { t: h + 'CM' }, bd && { t: bd, c: 'acc' }, { t: 'FILE ' + pad(idx) }, { t: 'OC-' + pad(idx, 3), c: 'out' }]
      .filter((w) => w && w.t && w.t.length <= 14);

    band = document.createElement('div'); band.className = 'lyric'; band.setAttribute('aria-hidden', 'true');
    band.innerHTML = '<div class="ly-stage"></div><div class="ly-hud mono"><i class="ly-dot"></i><span class="ly-no"></span><span class="ly-bar"><b></b></span><span class="ly-tc">00:00:00</span></div>';
    head.after(band); stage = band.querySelector('.ly-stage');

    // 見えたときに動き出すもの
    box.querySelectorAll('.p-val').forEach(wrapWords);
    const pre = box.querySelector('.prompt');
    if (pre && !pre.nextElementSibling?.classList.contains('ly-scan')) { pre.classList.add('ly-pre'); const sc = document.createElement('i'); sc.className = 'ly-scan'; pre.after(sc); }
    const preBox = pre && pre.closest('section');   // プロンプトは、隠れている間は見張れないので、入っている枠を見張る
    const targets = [...box.querySelectorAll('.p-row, .sec')].concat(preBox ? [preBox] : []);
    if (REDUCE || !('IntersectionObserver' in window)) { targets.forEach((e) => e.classList.add('in')); if (pre) pre.classList.add('in'); }
    else {
      io = new IntersectionObserver((es) => es.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target; io.unobserve(el); el.classList.add('in');
        if (el.classList.contains('sec')) scramble(el, el.textContent, 520);
        if (el === preBox) { pre.classList.add('in'); const sc = pre.nextElementSibling; if (sc && sc.classList.contains('ly-scan')) { sc.style.setProperty('--pt', pre.offsetTop + 'px'); sc.style.setProperty('--ph', pre.offsetHeight + 'px'); sc.classList.add('in'); } }
      }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
      targets.forEach((e) => io.observe(e));
    }
    head.querySelectorAll('.d-no-row span').forEach((s) => scramble(s, s.textContent, 700));
    if (!REDUCE) { k = 0; lastIn = ''; t0 = performance.now(); timer = setTimeout(show, 750); }
    else { words.length && (stage.innerHTML = `<div class="ly-w lime">${words[0].t.replace(/[<&>]/g, '')}</div>`); }
  }

  new MutationObserver(enhance).observe(box, { childList: true });
  new MutationObserver(() => { if (screen.classList.contains('active') && !timer && stage && stage.isConnected && !REDUCE) timer = setTimeout(show, 600); })
    .observe(screen, { attributes: true, attributeFilter: ['class'] });
  enhance();
})();
