// reel.js — ページのいちばん下の「場面が横にスライドして切り替わる文字」
// 大きな文字が拡大しながら現れて、小さな文字の列が1行ずつ増えて、同じ文字が積み重なっていきます。
// タップ（クリック）で次の場面へ。横にドラッグすると、場面を動かせます。

(function () {
  const reel = document.getElementById('reel');
  if (!reel || typeof characters === 'undefined') return;
  (window.OC_LOADED = window.OC_LOADED || []).push('reel');
  const cssOK = !!getComputedStyle(document.documentElement).getPropertyValue('--oc-css-motion').trim();
  if (!cssOK) { reel.style.display = 'none'; return; }   // motion.css が読み込めていないときは、動かさない
  const REDUCE = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ここの数字を変えると、動きが変わります
  const DWELL = 2800;      // 1つの場面を見せる長さ（ミリ秒）
  const MOVE_MS = 1000;    // 場面が切り替わる長さ（ミリ秒）
  const AUTO = true;       // false で、自動で切り替わらなくなる（タップだけで進む）

  const pad = (n) => String(n).padStart(2, '0');
  reel.style.cssText += ';position:relative;overflow:hidden';
  const scenes = [...reel.querySelectorAll('.rs')], N = scenes.length;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  // ---------- 小さな文字の列 ----------
  const LISTS = [
    [['Character', 'Design', 'Illustration', 'Prompt', 'Profile', 'Story', 'Archive', 'File', 'Sketch', 'Collage', 'Motion', 'Typography'],
     ['Vision', 'Mood', 'Style', 'Art', 'Future', 'Color', 'Editing', 'Palette', 'Wardrobe', 'Silhouette', 'Expression', 'Pose'],
     ['Experience', 'Interaction', 'Atmosphere', 'Texture', 'Light', 'Sound', 'Pattern', 'Motif', 'Flow', 'World', 'Vibes', 'Dream']],
    [['Imagination', 'Harmony', 'Rhythm', 'Feeling', 'Sensation', 'Touch', 'Movement', 'Scene', 'Frame', 'Angle', 'Shape', 'Line'],
     ['Memory', 'Habit', 'Secret', 'Voice', 'Gesture', 'Quirk', 'Temper', 'Scar', 'Charm', 'Fear', 'Hope', 'Name'],
     ['Past', 'Present', 'Origin', 'Journey', 'Trace', 'Echo', 'Signal', 'Orbit', 'Season', 'Night', 'Dawn', 'Future']]
  ];
  reel.querySelectorAll('.rs-cols').forEach((box) => {
    const cols = LISTS[Number(box.dataset.list)] || LISTS[0];
    cols.forEach((words, c) => {
      const col = document.createElement('div'); col.className = 'col';
      const inner = document.createElement('div'); inner.className = 'col-in';
      inner.style.setProperty('--dur', (15 + c * 4) + 's');
      if (c === 1) inner.style.animationDirection = 'reverse';
      [0, 1].forEach(() => words.forEach((w, i) => { const s = document.createElement('span'); s.textContent = `OC'S ${w}`; s.style.setProperty('--n', i + c * 2); inner.appendChild(s); }));
      col.appendChild(inner); box.appendChild(col);   // 同じ列を2回ならべて、上へ流れ続けるようにする
    });
  });

  // ---------- ミニキャラ（3種類を、毎回ランダムに出す） ----------
  // 画像は mini1.png / mini2.png / mini3.png という名前でアップロードしてください。
  // 名前や数を変えたいときは、下の MINIS を書き換えます。まだ画像がないときは、何も出ません。
  const MINIS = ['mini1.png', 'mini2.png', 'mini3.png'];
  const COUNT = 6;         // 一度に出すミニキャラの数
  const thumbs = reel.querySelector('.rs-thumbs'), okMinis = [];
  MINIS.forEach((src) => { const im = new Image(); im.onload = () => okMinis.push(src); im.src = src; });
  function spawnMinis() {
    thumbs.innerHTML = '';
    if (!okMinis.length) return;
    for (let i = 0; i < COUNT; i++) {
      const el = new Image();
      el.src = okMinis[Math.floor(Math.random() * okMinis.length)]; el.alt = ''; el.draggable = false; el.className = 'mini';
      el.style.left = (3 + Math.random() * 80) + '%';
      el.style.bottom = (Math.random() * 42) + '%';
      el.style.width = (15 + Math.random() * 13) + 'vw';
      el.style.animationDelay = `${(i * 0.12).toFixed(2)}s, -${(Math.random() * 4).toFixed(2)}s, -${(Math.random() * 6).toFixed(2)}s`;
      el.style.animationDuration = `.6s, ${(2.6 + Math.random() * 2.4).toFixed(2)}s, ${(5 + Math.random() * 4).toFixed(2)}s`;
      thumbs.appendChild(el);
    }
  }

  // ---------- 大きな文字を、画面の幅いっぱいに合わせる ----------
  let W = 0;
  function fit() {
    W = reel.clientWidth; if (!W) return false;
    reel.querySelectorAll('[data-fit]').forEach((el) => {
      const target = W * parseFloat(el.dataset.fit);
      const items = el.classList.contains('rs-multi') ? [...el.children] : [el];
      items.forEach((it) => { it.style.fontSize = '100px'; const w = it.offsetWidth || it.scrollWidth; if (w) it.style.fontSize = Math.min(700, 100 * target / w) + 'px'; });
    });
    reel.querySelectorAll('.rs').forEach((sc) => {
      const g = sc.querySelector('.rs-giant'), c = sc.querySelector('.rs-cols');
      if (g && c) c.style.top = (g.offsetTop + g.offsetHeight + 34) + 'px';
    });
    const multi = reel.querySelector('.rs-multi'), line = reel.querySelector('.rs-line');
    if (multi && line) line.style.top = (multi.offsetTop + multi.offsetHeight + 16) + 'px';
    return true;
  }

  // ---------- 動かす ----------
  let lastNear = -1, p = 0, anim = null, drag = null, visible = false, lastChange = performance.now(), fitted = false, lastW = 0;
  const layers = scenes.map((sc) => [...sc.querySelectorAll('[data-sp]')].map((el) => [el, parseFloat(el.dataset.sp)]));
  function goTo(target, now) { anim = { from: p, to: target, t0: now, dur: Math.max(450, MOVE_MS * Math.abs(target - p)) }; }

  function render(now) {
    const near = ((Math.round(p) % N) + N) % N;
    if (visible && near === 2 && lastNear !== 2) spawnMinis();   // 3つ目の場面になるたびに、ミニキャラを出しなおす
    lastNear = near;
    scenes.forEach((sc, i) => {
      let d = (((i - p) % N) + N) % N; if (d > N / 2) d -= N;
      sc.classList.toggle('vis', Math.abs(d) < 1.6);
      sc.classList.toggle('on', visible && i === near);
      layers[i].forEach(([el, sp]) => {
        const big = el.classList.contains('rs-giant') || el.classList.contains('rs-multi');
        const wob = big && !REDUCE ? Math.sin(now / 900 + i) * W * 0.012 : 0;      // 大きな文字は、止まっているあいだもゆらゆら動く
        el.style.transform = `translateX(${(d * W * sp + wob).toFixed(1)}px)`;
        if (el.classList.contains('rs-multi') && !REDUCE) [...el.children].forEach((ch, k) => { ch.style.translate = `${(Math.sin(now / 700 + k * 1.1) * W * 0.014).toFixed(1)}px 0`; });
      });
    });
    $no.textContent = `${pad(near + 1)} / ${pad(N)}`;
    const prog = anim || drag ? 1 : Math.min(1, (now - lastChange) / DWELL);
    $bar.style.width = (prog * 100) + '%';
  }
  const $no = document.getElementById('reel-no'), $bar = document.getElementById('reel-bar');

  function loop(now) {
    if (visible) {
      if (!fitted || reel.clientWidth !== lastW) { fitted = fit(); lastW = reel.clientWidth; }
      if (fitted) {
        if (anim) {
          const t = Math.min(1, (now - anim.t0) / anim.dur); p = anim.from + (anim.to - anim.from) * ease(t);
          if (t >= 1) { p = anim.to; anim = null; lastChange = now; }
        } else if (AUTO && !drag && now - lastChange > DWELL) goTo(Math.round(p) + 1, now);
        render(now);
      }
    }
    requestAnimationFrame(loop);
  }

  // ---------- 触る ----------
  reel.addEventListener('pointerdown', (e) => { drag = { x0: e.clientX, p0: p, moved: false }; anim = null; });
  reel.addEventListener('pointermove', (e) => {
    if (!drag || !W) return;
    const dx = e.clientX - drag.x0; if (Math.abs(dx) > 8) drag.moved = true;
    if (drag.moved) p = drag.p0 - dx / W;
  });
  const release = (e) => {
    if (!drag) return;
    const moved = drag.moved, dx = e.clientX - drag.x0, now = performance.now();
    drag = null; lastChange = now;
    if (!moved) goTo(Math.round(p) + 1, now);              // タップ：次の場面へ
    else goTo(Math.round(p - Math.sign(dx) * (Math.abs(dx) > W * 0.12 ? 0.35 : 0)), now);
  };
  reel.addEventListener('pointerup', release);
  reel.addEventListener('pointercancel', () => { drag = null; lastChange = performance.now(); });

  new IntersectionObserver((e) => {
    const was = visible; visible = e[0].isIntersecting;
    if (!visible) scenes.forEach((s) => s.classList.remove('on'));
    else if (!was) { anim = null; p = Math.round(p); lastChange = performance.now(); }   // 見える位置に来たら、その場面から始める
  }).observe(reel);
  new ResizeObserver(() => { fitted = false; }).observe(reel);
  if (REDUCE) { visible = true; fit(); render(performance.now()); return; }
  requestAnimationFrame(loop);
})();
