// site.js — 画面の見た目と動き（editor.js のあとに読み込まれます）
// キャラクターのデータ（characters）は editor.js のものをそのまま使います。ここでは書き換えません。
//
// 表情違いの絵（マウスを乗せたときに差し替わる絵）：
//   「Barnard.png」の表情違いは「Barnard_hover.png」という名前でアップロードするだけで、自動で使われます。
//   名前を変えたいときは、editor.js のキャラクターに  hover: "好きな名前.png"  を足してください。

(function () {
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const ids = Object.keys(characters);
  const pad = (n, l = 2) => String(n).padStart(l, '0');
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  // 絵の台紙の色（[板の色, 丸の色]）。キャラクターの順番に使われます
  const TONES = [['#f2eee4', '#f2b134'], ['#eeeaf3', '#ff6f91'], ['#e9f0ec', '#35c9b0'], ['#f3ebe6', '#ff5a36'], ['#eaeef5', '#5b8cff']];

  // ---------- 飾りの部品（同じ言葉からは、いつも同じ形が出ます） ----------
  function hash(str) { let h = 2166136261; for (const ch of String(str)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rnd(seed) {
    let a = hash(seed) || 1;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), a | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  const hex = (seed, len) => { const r = rnd(seed); let o = ''; while (o.length < len) o += Math.floor(r() * 16).toString(16); return o.toUpperCase(); };
  function barcode(seed, w = 96, h = 22) {
    const r = rnd(seed); let x = 0, bars = '';
    while (x < w) { const bw = 1 + Math.floor(r() * 3), gap = 1 + Math.floor(r() * 3); bars += `<rect x="${x}" y="0" width="${bw}" height="${h}"/>`; x += bw + gap; }
    return `<svg class="barcode" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" aria-hidden="true" fill="currentColor">${bars}</svg>`;
  }
  // 散らばる小さな文字（ときどき1文字だけ変わる）
  function scatter(el, seed, count) {
    if (!el) return;
    const r = rnd(seed);
    el.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const s = document.createElement('span');
      s.textContent = LETTERS[Math.floor(r() * 26)];
      s.style.left = r() * 96 + '%'; s.style.top = r() * 92 + '%';
      if (r() < 0.3) s.className = 'hot';
      el.appendChild(s);
    }
    if (REDUCE) return;
    const timer = setInterval(() => {
      if (!el.isConnected) { clearInterval(timer); return; }
      el.children[Math.floor(Math.random() * el.children.length)].textContent = LETTERS[Math.floor(Math.random() * 26)];
    }, 1100);
  }
  // 円に沿って並ぶ文字
  function ring(text, cls) {
    const id = 'rp' + Math.random().toString(36).slice(2, 7);
    return `<svg class="ring ${cls}" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="${id}" d="M100,100 m-84,0 a84,84 0 1,1 168,0 a84,84 0 1,1 -168,0"/></defs><text><textPath href="#${id}" textLength="526" lengthAdjust="spacing">${text}</textPath></text></svg>`;
  }

  // カードの角の、名前がまわる小さな輪
  function miniRing(name) {
    const id = 'rm' + Math.random().toString(36).slice(2, 7), unit = `${name.toUpperCase()} • `;
    const t = unit.repeat(Math.max(1, Math.round(30 / unit.length)));
    return `<svg viewBox="0 0 200 200" aria-hidden="true"><defs><path id="${id}" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"/></defs><text><textPath href="#${id}" textLength="500" lengthAdjust="spacing">${esc(t)}</textPath></text><circle cx="100" cy="100" r="9"/></svg>`;
  }

  // ---------- 文字を1文字ずつ包む（せり上がるアニメ用） ----------
  function split(el) {
    if (!el || el.dataset.split) return;
    el.dataset.split = '1';
    const text = el.textContent;
    el.setAttribute('aria-label', text);
    el.textContent = '';
    [...text].forEach((c, i) => {
      const outer = document.createElement('span');
      outer.className = 'ch'; outer.setAttribute('aria-hidden', 'true');
      const inner = document.createElement('span');
      inner.textContent = c === ' ' ? '\u00a0' : c;
      inner.style.setProperty('--i', i);
      outer.appendChild(inner); el.appendChild(outer);
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
  const pills = (tag) => String(tag).split('/').map((s) => s.trim()).filter(Boolean).map((s) => `<i>${esc(s)}</i>`).join('');
  function spec(c) {
    const rows = parseDesc(c.description), g = (k) => (rows.find((r) => r[0] === k) || ['', ''])[1];
    return [g('Age') && `${g('Age')}Y`, g('Height') && `${g('Height')}CM`].filter(Boolean).join(' / ');
  }
  const hoverSrc = (c) => c.hover || c.image.replace(/(\.[A-Za-z0-9]+)$/, '_hover$1');
  const toneStyle = (i) => `--t1:${TONES[i % TONES.length][0]};--t2:${TONES[i % TONES.length][1]}`;

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

  // ---------- 画面の四隅の飾り ----------
  const hud = { clock: $('#hud-clock'), scroll: $('#hud-scroll'), sec: $('#hud-sec'), xy: $('#hud-xy') };
  const tickClock = () => { const d = new Date(); hud.clock.textContent = [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => pad(n)).join(':'); };
  setInterval(tickClock, 1000); tickClock();
  const onScroll = () => { const max = document.documentElement.scrollHeight - window.innerHeight; hud.scroll.textContent = pad(Math.round(max > 0 ? (window.scrollY / max) * 100 : 0), 3); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  window.addEventListener('pointermove', (e) => { hud.xy.textContent = `X ${pad(Math.round(e.clientX), 4)} Y ${pad(Math.round(e.clientY), 4)}`; }, { passive: true });

  // ---------- 絵を保存されにくくする（完全には防げませんが、ふつうの保存操作はできなくします） ----------
  document.addEventListener('contextmenu', (e) => { if (e.target.closest('.plate')) e.preventDefault(); });
  document.addEventListener('dragstart', (e) => { if (e.target.tagName === 'IMG') e.preventDefault(); });

  // ---------- 詳細画面 ----------
  function renderDetail(id) {
    const c = characters[id], i = ids.indexOf(id);
    const prevId = ids[(i - 1 + ids.length) % ids.length], nextId = ids[(i + 1) % ids.length];
    const rows = parseDesc(c.description).map(([k, v]) =>
      `<div class="p-row${k ? '' : ' cont'}"><span class="p-key mono">${esc(k)}</span><p class="p-val">${esc(v)}</p></div>`).join('');

    $('#profile-box').innerHTML = `
      <div class="d-head is-in">
        <div class="scatter" id="scatter-head" aria-hidden="true"></div>
        <div class="d-no-row mono"><span class="d-no">${pad(i + 1)} / ${pad(ids.length)}</span><span>ID OC-${pad(i + 1, 3)} / ${hex(id, 6)}</span></div>
        <h1 class="d-name">${esc(c.name)}</h1>
        <div class="pills">${pills(c.tag)}</div>
      </div>
      <div class="d-body">
        <figure class="d-media" style="${toneStyle(i)}">
          <div class="plate d-plate">
            <img src="${esc(c.image)}" alt="${esc(c.name)}" draggable="false">
            <i class="mk tl"></i><i class="mk br"></i><i class="scan"></i>
            <span class="pl tr">OC-${pad(i + 1, 3)}</span><span class="pl bl">&copy; OC ARCHIVE</span>
            <div class="shield"></div>
          </div>
          <figcaption class="mono"><span>FIG. ${pad(i + 1)} — ${esc(c.name)}</span>${barcode(id)}</figcaption>
        </figure>
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
    scatter($('#scatter-head'), 'head' + id, 22);
    $('.copy').onclick = (e) => copyText(c.prompt, e.currentTarget);
    document.querySelectorAll('.d-nav a').forEach((a) => {
      a.onclick = (e) => { e.preventDefault(); window.showDetail(a.dataset.id, true); };
    });
    hud.sec.textContent = `FILE ${pad(i + 1)}`;
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
    hud.sec.textContent = 'INDEX';
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
    a.style.cssText = `--n:${i % 3};${toneStyle(i)}`;
    a.innerHTML = `
      <div class="card-media"><div class="plate">
        <img class="img-a" src="${esc(c.image)}" alt="${esc(c.name)}" draggable="false">
        <i class="scan"></i>
        <span class="pl tr">OC-${pad(i + 1, 3)}</span><span class="pl bl">FIG.${pad(i + 1)}</span>
        <div class="shield"></div>
      </div></div>
      <div class="card-meta">
        <div class="cm-top"><span class="cm-label mono">Character</span><span class="cm-no">${pad(i + 1)}</span></div>
        <div class="pills">${pills(c.tag)}</div>
        <h3 class="card-name" data-text="${esc(c.name)}">${esc(c.name)}</h3>
        <span class="card-spec mono">${esc(spec(c))}</span>
        <span class="card-badge" aria-hidden="true">${miniRing(c.name)}</span>
      </div>`;
    a.addEventListener('click', (e) => { e.preventDefault(); window.showDetail(id, true); });
    a.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') scramble($('.card-name', a), c.name, 500); });
    grid.appendChild(a);
    reveal(a);

    // 表情違いの絵があれば（名前_hover.png）、マウスを乗せたときに差し替える
    const probe = new Image();
    probe.onload = () => {
      const b = document.createElement('img');
      b.className = 'img-b'; b.src = probe.src; b.alt = ''; b.draggable = false;
      $('.plate', a).insertBefore(b, $('.scan', a));
      a.classList.add('has-alt');
    };
    probe.src = hoverSrc(c);
  });

  // ---------- 見出しまわりの飾り ----------
  split($('#list-title'));
  reveal($('#list-head'));
  $('#serial').textContent = `SER. ${hex('serial', 4)}`;
  $('#hexline').textContent = `0x${hex('hexline', 8)}`;
  scatter($('#scatter-band'), 'band', 34);
  $('#rings').innerHTML = ring('OC ARCHIVE • YOU • OC ARCHIVE • YOU • OC ARCHIVE • YOU • ', 'a') + ring('CHARACTER • FILE • CHARACTER • FILE • CHARACTER • FILE • ', 'b');
  const phrase = 'OC ARCHIVE * CHARACTER FILE * VOL.01 * 2026 * ';
  $('#ticker').innerHTML = Array.from({ length: 12 }, () => `<span>${phrase}</span>`).join('');
  $('#go-grid').addEventListener('click', (e) => { e.preventDefault(); grid.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth' }); });

  // ---------- マウスについてくる線と輪（パソコンのみ） ----------
  (function () {
    const hud = $('.hud'), hx = $('#hud-x'), hy = $('#hud-y'), hr = $('#hud-ring');
    if (REDUCE) return;
    let tx = -100, ty = -100, cx = -100, cy = -100;
    window.addEventListener('pointermove', (e) => {
      if (e.pointerType !== 'mouse') { hud.classList.remove('mouse-on'); return; }
      hud.classList.add('mouse-on'); tx = e.clientX; ty = e.clientY;
    }, { passive: true });
    document.documentElement.addEventListener('mouseleave', () => hud.classList.remove('mouse-on'));
    (function loop() {
      cx += (tx - cx) * 0.18; cy += (ty - cy) * 0.18;
      hx.style.transform = `translateX(${cx}px)`; hy.style.transform = `translateY(${cy}px)`; hr.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
  })();

  // ---------- URLの末尾（#名前）でキャラクターを直接開いた場合 ----------
  const first = decodeURIComponent(location.hash.slice(1));
  if (characters[first]) {
    history.replaceState({ screen: 'detail', id: first }, '', `#${first}`);
    openDetail(first);
  }
})();
