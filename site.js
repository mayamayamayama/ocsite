// site.js — 画面の見た目と動き（editor.js のあとに読み込まれます）
// キャラクターのデータ（characters）は editor.js のものをそのまま使います。ここでは書き換えません。

(function () {
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const ids = Object.keys(characters);
  const pad = (n) => String(n).padStart(2, '0');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- 文字を1文字ずつ包む（せり上がるアニメ用） ----------
  function split(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = '1';
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, i) => {
      const outer = document.createElement('span');
      outer.className = 'ch';
      outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = c === ' ' ? '\u00a0' : c;
      inner.style.setProperty('--i', i);
      outer.appendChild(inner);
      el.appendChild(outer);
    });
  }

  // ---------- 文字がランダムな記号から、本物の文字に切り替わる ----------
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*+=';
  function scramble(el, text, dur = 700) {
    cancelAnimationFrame(el._raf);
    if (REDUCE) { el.textContent = text; return; }
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / dur), fixed = Math.floor(p * text.length);
      el.textContent = [...text].map((c, i) => (i < fixed || c === ' ' ? c : GLYPHS[Math.floor(Math.random() * GLYPHS.length)])).join('');
      if (p < 1) el._raf = requestAnimationFrame(step); else el.textContent = text;
    })(t0);
  }

  // ---------- 画面に入ったら現れる ----------
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('is-in');
    const name = e.target.querySelector('.card-name');
    if (name) scramble(name, name.dataset.text, 800);
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  const reveal = (el) => (REDUCE ? el.classList.add('is-in') : io.observe(el));

  // ---------- 画面を切り替えるときの幕 ----------
  const curtain = $('#curtain');
  let busy = false;
  function transition(swap) {
    if (REDUCE || busy) { swap(); return; }
    busy = true;
    curtain.className = 'curtain on in';
    setTimeout(() => {
      swap();
      curtain.className = 'curtain on out';
      setTimeout(() => { curtain.className = 'curtain'; busy = false; }, 800);
    }, 650);
  }

  // ---------- 設定文章を、項目ごとの行にする（文章そのものは変えません） ----------
  function parseDesc(text) {
    const rows = [];
    text.split('\n').forEach((line) => {
      line.split(/\/(?=[A-Za-z]+:)/).forEach((part) => {
        const m = part.match(/^([A-Za-z]+):(.*)$/);
        rows.push(m ? [m[1], m[2]] : ['', part]);
      });
    });
    return rows;
  }

  async function copyText(text, btn) {
    try { await navigator.clipboard.writeText(text); }
    catch (e) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (_) {}
      ta.remove();
    }
    btn.textContent = 'Copied';
    setTimeout(() => { btn.textContent = 'Copy'; }, 1600);
  }

  // ---------- 詳細画面 ----------
  function renderDetail(id) {
    const c = characters[id], i = ids.indexOf(id);
    const prevId = ids[(i - 1 + ids.length) % ids.length], nextId = ids[(i + 1) % ids.length];
    const rows = parseDesc(c.description).map(([k, v]) =>
      `<div class="p-row${k ? '' : ' cont'}"><span class="p-key mono">${esc(k)}</span><p class="p-val">${esc(v)}</p></div>`).join('');

    $('#profile-box').innerHTML = `
      <div class="d-head is-in">
        <span class="d-no mono">${pad(i + 1)} / ${pad(ids.length)}</span>
        <h1 class="d-name">${esc(c.name)}</h1>
        <span class="d-tag mono"># ${esc(c.tag)}</span>
      </div>
      <div class="d-body">
        <figure class="d-media"><img src="${esc(c.image)}" alt="${esc(c.name)}"></figure>
        <div class="d-info">
          <section><h3 class="sec mono">Profile</h3>${rows}</section>
          <section>
            <div class="sec-row"><h3 class="sec mono">Prompt / Tags</h3><button class="copy mono" type="button">Copy</button></div>
            <pre class="prompt">${esc(c.prompt)}</pre>
          </section>
        </div>
      </div>
      <nav class="d-nav">
        <a href="#${esc(prevId)}" data-id="${esc(prevId)}"><span class="mono">&larr; Prev</span><b>${esc(characters[prevId].name)}</b></a>
        <a href="#${esc(nextId)}" data-id="${esc(nextId)}"><span class="mono">Next &rarr;</span><b>${esc(characters[nextId].name)}</b></a>
      </nav>`;

    split($('.d-name'));
    $('.copy').onclick = (e) => copyText(c.prompt, e.currentTarget);
    document.querySelectorAll('.d-nav a').forEach((a) => {
      a.onclick = (e) => { e.preventDefault(); window.showDetail(a.dataset.id, true); };
    });
  }

  function openDetail(id) {
    renderDetail(id);
    document.body.classList.add('is-after');   // 一度開いたら、入場画面は代わりの空間に差し替わる
    document.body.classList.add('in-detail');
    $('#index-screen').classList.remove('active');
    $('#detail-screen').classList.add('active');
    document.title = `${characters[id].name} - OC ARCHIVE`;
    window.scrollTo(0, 0);
  }
  function openIndex() {
    document.body.classList.remove('in-detail');
    $('#detail-screen').classList.remove('active');
    $('#index-screen').classList.add('active');
    document.title = 'OC ARCHIVE';
    window.scrollTo(0, 0);
  }

  // editor.js にある同じ名前の関数を、新しいものに置き換える（戻るボタンなども、これを呼びます）
  window.showDetail = function (id, push = true) {
    if (!characters[id]) return;
    if (push) history.pushState({ screen: 'detail', id }, '', `#${id}`);
    transition(() => openDetail(id));
  };
  window.showIndex = function (push = true) {
    if (push) history.pushState({ screen: 'index' }, '', window.location.pathname);
    transition(openIndex);
  };

  // ---------- 一覧 ----------
  const grid = $('#character-grid');
  grid.innerHTML = '';
  $('#count').textContent = pad(ids.length);
  ids.forEach((id, i) => {
    const c = characters[id];
    const a = document.createElement('a');
    a.className = 'card';
    a.href = `#${id}`;
    a.style.setProperty('--n', i % 3);
    a.innerHTML = `
      <div class="card-media">
        <img src="${esc(c.image)}" alt="${esc(c.name)}" draggable="false" oncontextmenu="return false;">
        <span class="card-no mono">${pad(i + 1)}</span>
      </div>
      <div class="card-meta">
        <h3 class="card-name" data-text="${esc(c.name)}">${esc(c.name)}</h3>
        <span class="card-tag mono"># ${esc(c.tag)}</span>
        <span class="card-arrow" aria-hidden="true">&nearr;</span>
      </div>`;
    a.addEventListener('click', (e) => { e.preventDefault(); window.showDetail(id, true); });
    a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') scramble($('.card-name', a), c.name, 500); });
    grid.appendChild(a);
    reveal(a);
  });

  // ---------- 見出しと入場画面の文字 ----------
  split($('#list-title'));
  reveal($('#list-head'));
  const hero = $('.hero');
  split($('h1', hero));
  hero.style.setProperty('--base', '250ms');
  setTimeout(() => hero.classList.add('is-in'), 150);

  // ---------- URLの末尾（#名前）でキャラクターを直接開いた場合 ----------
  const first = decodeURIComponent(location.hash.slice(1));
  if (characters[first]) {
    history.replaceState({ screen: 'detail', id: first }, '', `#${first}`);
    openDetail(first);
  }
})();
