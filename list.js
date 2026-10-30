// list.js — スマホで、キャラクター一覧を「1列（1枚ずつ大きく）」か「2列（たくさん見わたせる）」に切り替えるボタン
// ・えらんだほうを覚えておきます（次に開いたときも同じ並べ方）
// ・パソコンやタブレットのような広い画面では、ボタンは出ません（もともと何列も並ぶので）。見た目は mv.css のいちばん下
(window.OC_LOADED = window.OC_LOADED || []).push('list');

(function () {
  const grid = document.getElementById('character-grid');
  if (!grid) return;
  const KEY = 'oc-cols';
  let n = 1;
  try { n = localStorage.getItem(KEY) === '2' ? 2 : 1; } catch (e) { /* 覚えられなくても動く */ }

  // ボタン：「VIEW ──── [▯ 1 COL] [▯▯ 2 COL]」
  const bar = document.createElement('div');
  bar.className = 'cols-bar';
  bar.setAttribute('role', 'group');
  bar.setAttribute('aria-label', '一覧の並べ方');
  bar.innerHTML = '<span class="mono">VIEW</span><i class="cols-rule"></i>' + [1, 2].map((k) =>
    '<button type="button" class="cols-btn" data-n="' + k + '" aria-label="' + k + '列で表示">' + '<b></b>'.repeat(k) + '<em class="mono">' + k + ' COL</em></button>').join('');
  grid.parentNode.insertBefore(bar, grid);

  function set(k, save) {
    n = k;
    grid.classList.toggle('cols-2', k === 2);
    bar.querySelectorAll('.cols-btn').forEach((b) => {
      const on = +b.dataset.n === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    if (save) { try { localStorage.setItem(KEY, String(k)); } catch (e) { /* なにもしない */ } }
  }
  bar.addEventListener('click', (e) => {
    const b = e.target.closest('.cols-btn');
    if (b && +b.dataset.n !== n) set(+b.dataset.n, true);
  });
  set(n, false);
})();
