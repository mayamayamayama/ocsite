// profile.js — プロフィール画面（詳細画面）の文字の動き
// ・プロフィールの各行は、見えたときに、黄緑の板がサッと通って、言葉が1つずつせり上がる
// ・見出しの文字は、ランダムな文字が並んだあと、正しい文字にそろう
// ・プロンプトの欄は、上から光の線が走って現れる
// （名前が3Dで起き上がる動きは、profile.css だけで動いています）
// 文章そのものは変えずに、見え方だけを変えています。このファイルが無くても、プロフィール画面はふつうに見られます。

(function () {
  (window.OC_LOADED = window.OC_LOADED || []).push('profile');
  const box = document.getElementById('profile-box');
  if (!box) return;
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const seg = typeof Intl !== 'undefined' && Intl.Segmenter ? new Intl.Segmenter('ja', { granularity: 'word' }) : null;
  const CH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#*/+';
  let io = null;

  // ランダムな文字から、正しい文字にそろえる
  function scramble(el, text, ms) {
    if (REDUCE) return;
    const s0 = performance.now();
    (function f() {
      const p = Math.min(1, (performance.now() - s0) / ms), n = Math.floor(text.length * p);
      el.textContent = text.slice(0, n) + [...text.slice(n)].map((c) => (c === ' ' || c === '/' ? c : CH[Math.floor(Math.random() * CH.length)])).join('');
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

  // ---------- 詳細画面が描かれるたびに、動きをつける ----------
  function enhance() {
    const head = box.querySelector('.d-head');
    if (!head || head.dataset.ly) return; head.dataset.ly = '1';
    if (io) io.disconnect();
    box.classList.add('ly-on');

    box.querySelectorAll('.p-val').forEach(wrapWords);
    const pre = box.querySelector('.prompt');
    if (pre && !(pre.nextElementSibling && pre.nextElementSibling.classList.contains('ly-scan'))) { pre.classList.add('ly-pre'); const sc = document.createElement('i'); sc.className = 'ly-scan'; pre.after(sc); }
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
  }

  new MutationObserver(enhance).observe(box, { childList: true });
  enhance();
})();
