// list.js — トップページのこまかい動き
// ・スマホで、キャラクター一覧を「1列（1枚ずつ大きく）」か「2列（たくさん見わたせる）」に切り替えるボタン（えらんだほうを覚えます。見た目は mv.css のいちばん下）
// ・入場画面（山の画面）は、1回見たらおしまい。キャラのプロフィールやほかのページへ行ったあとは、トップの上のほうがモーショングラフィックスになります
//   （新しいタブで開きなおすと、また OP と山の画面から。アドレスの最後に ?mv をつけると、いつでも山の画面）
// ・プロフィールから戻るたびに、モーショングラフィックスをランダムで選び直します
// ・パソコンで、一覧のカードをクリックしたら、表情違いの絵のまま、プロフィールへ（一瞬もとの絵に戻らないように）
(window.OC_LOADED = window.OC_LOADED || []).push('list');

(function () {
  const body = document.body, KEY = 'oc-cols', DONE = 'oc-mv-done';

  // ---------- 1列／2列 ----------
  const grid = document.getElementById('character-grid');
  if (grid) {
    let n = 1;
    try { n = localStorage.getItem(KEY) === '2' ? 2 : 1; } catch (e) { /* 覚えられなくても動く */ }
    const bar = document.createElement('div');
    bar.className = 'cols-bar';
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', '一覧の並べ方');
    bar.innerHTML = '<span class="mono">VIEW</span><i class="cols-rule"></i>' + [1, 2].map((k) =>
      '<button type="button" class="cols-btn" data-n="' + k + '" aria-label="' + k + '列で表示">' + '<b></b>'.repeat(k) + '<em class="mono">' + k + ' COL</em></button>').join('');
    grid.parentNode.insertBefore(bar, grid);
    const set = (k, save) => {
      n = k;
      grid.classList.toggle('cols-2', k === 2);
      bar.querySelectorAll('.cols-btn').forEach((b) => {
        const on = +b.dataset.n === k;
        b.classList.toggle('on', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (save) { try { localStorage.setItem(KEY, String(k)); } catch (e) { /* なにもしない */ } }
    };
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('.cols-btn');
      if (b && +b.dataset.n !== n) set(+b.dataset.n, true);
    });
    set(n, false);
  }

  // ---------- 入場画面は1回だけ・戻るたびにモーショングラフィックスを選び直す ----------
  const done = () => { try { sessionStorage.setItem(DONE, '1'); } catch (e) { /* なにもしない */ } };
  const seen = () => { try { return !!sessionStorage.getItem(DONE) && !/[?&]mv(=|&|$)/.test(location.search); } catch (e) { return false; } };
  const pick = () => { if (window.OC_HERO && window.OC_HERO.use) window.OC_HERO.use(); };
  let wasIn = body.classList.contains('in-detail');
  new MutationObserver(() => {
    if (body.classList.contains('is-after')) done();   // プロフィールを開いたら、もう見たことにする
    const now = body.classList.contains('in-detail');
    if (wasIn && !now) pick();
    wasIn = now;
  }).observe(body, { attributes: true, attributeFilter: ['class'] });
  addEventListener('pageshow', (e) => {   // ほかのページから「戻る」で、そのままのページに戻ってきたとき
    if (e.persisted && seen() && !body.classList.contains('is-after')) { body.classList.add('is-after'); pick(); }
  });

  // ---------- 一覧のカード：クリックしたら、表情違いの絵のまま、プロフィールへ ----------
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('.card.has-alt');
    if (a && a.matches(':hover')) { a.classList.add('hold'); setTimeout(() => a.classList.remove('hold'), 1700); }
  }, true);
})();
