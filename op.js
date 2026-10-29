// op.js — サイトを開いたときのオープニング（OP）
// ① op.mp4（ロゴの動画）→ ② 動画が終わった瞬間に kabeban.glb（壁のアニメーション）→ ③ サイト
// ・壁のアニメーションは、動画を見ているあいだに読み込んで、1枚目を動画の下に用意しておきます（すき間なしで切り替わる）
// ・同じタブで読み込み直したとき（うっかり引っぱったときなど）は、OP を出しません。もう一度見たいときは、アドレスの最後に ?op
// ・動画や glb が見つからない・読み込めないときは、そこをとばしてサイトを出します
// ・アドレスの最後に ?check をつけると、op.mp4 と kabeban.glb の中身（長さ・動きの数・カメラ）も表示します
(window.OC_LOADED = window.OC_LOADED || []).push('op');

(function () {
  // ===== 変えてもいいところ =====
  const VIDEO = 'op.mp4';            // ロゴの動画（index.html と同じ場所に置く）
  const MODEL = 'kabeban.glb';       // 壁のアニメーション（同じく）
  const FIT = 'contain';             // 'contain'＝はしまで全部見える ／ 'cover'＝画面いっぱい（はしが切れる）
  const SITE_BEHIND_WALL = false;    // true にすると、壁のうしろに、最初からサイトが見える
  const FADE_SEC = 0.6;              // 最後に、サイトへ切り替わる時間（秒）。アニメーションの終わりに重ねます
  const TONE = 'agx';                // 色の見え方：'agx'（Blender 4 の標準）／'filmic'（Blender 3 の標準）／'standard'
  const EXPOSURE = 1.0;              // 3D の明るさ（1.2 で明るく、0.8 で暗く）
  const LIGHT = 1.0;                 // glb にライトが入っていないときの、ライトの強さ（0 で、ライトなし）
  const SKIP_BUTTON = true;          // 右下に SKIP を出す
  const SOUND = false;               // true にすると、動画の音を出す（最初に、画面をタップしてもらう）
  // ============================
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';   // index.html の importmap と同じ番号にする
  const MODEL_WAIT = 8, STALL = 10, MAX_SEC = 90;               // glb を待つ秒数・動画が止まったままの秒数・OP 全体の最長

  const root = document.documentElement, box = document.getElementById('op');
  const OP = (window.OC_OP = { inspect, log: [] });
  const log = (s) => OP.log.push([s, Math.round(performance.now())]);
  guardPull();
  if (!box) return;
  if (!root.classList.contains('op-on')) { box.remove(); return; }
  try { sessionStorage.setItem('oc-op', '1'); } catch (e) { /* 保存できなくても動く */ }

  const video = box.querySelector('video'), cv = box.querySelector('canvas'), T0 = performance.now();
  let phase = 'video', player = null, tap = null, shown = false, lastMove = T0, lastT = -1, lastPaint = 0, dog = 0;
  Object.defineProperty(OP, 'phase', { get: () => phase });

  // ---------- ① 動画 ----------
  const ready = loadModel().then((p) => { if (phase === 'done') { if (p) p.dispose(); return null; } player = p; log('model-ready'); return p; },
    (err) => { console.warn('[OP] ' + MODEL + ' を使えません：', err); log('model-fail'); return null; });
  try {
    video.style.objectFit = FIT === 'cover' ? 'cover' : 'contain';
    video.muted = video.defaultMuted = !SOUND; video.playsInline = true;
    video.addEventListener('ended', () => { log('video-end'); toModel(); });
    video.addEventListener('error', () => { console.warn('[OP] ' + VIDEO + ' を再生できません'); log('video-fail'); toModel(); });
    video.addEventListener('playing', () => { log('video-play'); hideTap(); paint(); });
    if (video.requestVideoFrameCallback) { const f = (now) => { if (phase !== 'video') return; if (now - lastPaint > 90) { lastPaint = now; paint(); } video.requestVideoFrameCallback(f); }; video.requestVideoFrameCallback(f); }
    else video.addEventListener('timeupdate', paint);
    video.src = VIDEO;
    if (SOUND) showTap(); else play();
    if (SKIP_BUTTON) { const b = btn('op-skip', 'SKIP'); b.addEventListener('click', (e) => { e.stopPropagation(); finish(true); }); setTimeout(() => b.classList.add('on'), 1200); }
    box.addEventListener('click', () => { if (tap && !tap.hidden) { hideTap(); play(); } });
    const stop = (e) => { if (e.cancelable) e.preventDefault(); };   // OP のあいだは、うしろのページを動かさない
    box.addEventListener('wheel', stop, { passive: false }); box.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('keydown', (e) => { if (phase === 'done' || phase === 'out') return; if (e.key === 'Escape') finish(true); else if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault(); });
  } catch (e) { console.error('[OP]', e); done(); }

  // 見張り：動画が進まない・終わったのに合図が来ない・長すぎる、ときは先へ進む
  dog = setInterval(() => {
    const now = performance.now();
    if (tap && !tap.hidden) lastMove = now;
    if (phase === 'video') {
      if (video.currentTime !== lastT) { lastT = video.currentTime; lastMove = now; }
      if (video.duration && video.paused && video.currentTime >= video.duration - 0.1) toModel();
      else if (now - lastMove > STALL * 1000) { console.warn('[OP] 動画が進まないので、とばします'); toModel(); }
    }
    if (now - T0 > MAX_SEC * 1000) finish(true);
  }, 500);

  function play() {
    let p; try { p = video.play(); } catch (e) { showTap(); return; }
    if (p && p.catch) p.catch((e) => { if (phase === 'video' && e && e.name === 'NotAllowedError') showTap(); });   // 省電力モードなどで自動再生できないとき
  }
  function btn(cls, txt) { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = txt; box.appendChild(b); return b; }
  function showTap() { if (!tap) tap = btn('op-tap', 'TAP TO START'); tap.hidden = false; log('tap'); }
  function hideTap() { if (tap) tap.hidden = true; }

  // 動画のまわり（上下や左右のあき）を、動画のはしの色に合わせる
  const sm = document.createElement('canvas'); sm.width = sm.height = 12;
  const sc = sm.getContext('2d', { willReadFrequently: true });
  function edge() {
    if (!video.videoWidth) return null;
    try {
      sc.drawImage(video, 0, 0, 12, 12); const d = sc.getImageData(0, 0, 12, 12).data; let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < 144; i++) { const x = i % 12, y = (i / 12) | 0; if (x && y && x < 11 && y < 11) continue; r += d[i * 4]; g += d[i * 4 + 1]; b += d[i * 4 + 2]; n++; }
      return 'rgb(' + Math.round(r / n) + ',' + Math.round(g / n) + ',' + Math.round(b / n) + ')';
    } catch (e) { return null; }
  }
  function paint() { if (FIT === 'cover' || phase !== 'video') return; const c = edge(); if (c) video.style.backgroundColor = box.style.backgroundColor = c; }   // 動画のうしろの 3D は、まだ見せない

  // ---------- ② 壁のアニメーション ----------
  function toModel() {
    if (phase !== 'video') return;
    phase = 'wait'; hideTap();
    const c = edge(); if (c) box.style.backgroundColor = c;   // 動画の最後の色を、壁のうしろの色にする
    if (player) return startModel();
    ready.then((p) => { if (phase === 'wait') { if (p) startModel(); else finish(); } });
    setTimeout(() => { if (phase === 'wait') { console.warn('[OP] ' + MODEL + ' の読み込みが間に合わないので、とばします'); finish(); } }, MODEL_WAIT * 1000);
  }
  function startModel() {
    phase = 'model'; log('model-start');
    if (SITE_BEHIND_WALL) { box.style.backgroundColor = 'transparent'; showSite(); }
    video.style.visibility = 'hidden';
    player.start((t, end) => { if (phase === 'model' && t >= end - FADE_SEC) finish(); });
  }

  async function loadModel() {
    const file = fetch(MODEL, { cache: 'no-cache' }).then((r) => { if (!r.ok) throw new Error(MODEL + ' が見つからない（' + r.status + '）'); return r.arrayBuffer(); });
    file.catch(() => {});
    const [THREE, { GLTFLoader }, { DRACOLoader }, { RoomEnvironment }] = await Promise.all([import('three'), import('three/addons/loaders/GLTFLoader.js'),
      import('three/addons/loaders/DRACOLoader.js'), import('three/addons/environments/RoomEnvironment.js')]);
    const buf = await file;
    if (phase === 'done') return null;
    const loader = new GLTFLoader().setDRACOLoader(new DRACOLoader().setDecoderPath(CDN + 'examples/jsm/libs/draco/gltf/'));
    const gltf = await loader.parseAsync(buf, '');
    if (phase === 'done') return null;

    const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);   // 色をぬらない（うしろの色・サイトが見える）
    renderer.toneMapping = TONE === 'standard' ? THREE.NoToneMapping : (TONE === 'agx' && THREE.AgXToneMapping) || THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = EXPOSURE;
    const scene = new THREE.Scene(), model = gltf.scene || gltf.scenes[0];
    scene.add(model);
    const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;   // まわりの明るさ（Blender の「ワールド」の代わり）
    pm.dispose(); scene.environment = env;

    // 動き：glb に入っている動きを、ぜんぶ同時に1回だけ再生（最後の形で止める）
    const mixer = new THREE.AnimationMixer(model); let dur = 0;
    gltf.animations.forEach((clip) => { const a = mixer.clipAction(clip); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.play(); dur = Math.max(dur, clip.duration); });
    mixer.update(0); model.updateMatrixWorld(true);
    const end = Math.max(dur, 1);   // 動きがないときは、1秒見せる

    // カメラ：glb にカメラがあればそれを使う。なければ、正面（Blender の「前」）から、壁がちょうど入るように
    let cam = (gltf.cameras || []).find((c) => c.isPerspectiveCamera || c.isOrthographicCamera), baseA;
    if (cam) baseA = cam.isPerspectiveCamera ? (cam.aspect && cam.aspect !== 1 ? cam.aspect : video.videoWidth ? video.videoWidth / video.videoHeight : cam.aspect || 16 / 9) : (cam.right - cam.left) / (cam.top - cam.bottom);
    else {
      const bb = new THREE.Box3().setFromObject(model);
      if (bb.isEmpty()) throw new Error(MODEL + ' の中に、形がない');
      const s = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3()), h = Math.max(s.y, 1e-3), d = h / 2 / Math.tan((15 * Math.PI) / 180) + s.z / 2;
      cam = new THREE.PerspectiveCamera(30, 1, d / 100, d * 100 + s.z);
      cam.position.set(c.x, c.y, c.z + d); cam.lookAt(c); scene.add(cam);
      baseA = Math.max(s.x, 1e-3) / h;
    }
    let lit = false; model.traverse((o) => { if (o.isLight) lit = true; });
    if (!lit && LIGHT > 0) {   // ライトがないときは、カメラの右上うしろから当てる
      const sun = new THREE.DirectionalLight(0xffffff, 1.5 * LIGHT); sun.position.set(1.5, 2.5, 1); sun.target.position.set(0, 0, -6);
      cam.add(sun); cam.add(sun.target); if (!cam.parent) scene.add(cam);
    }
    const persp = !!cam.isPerspectiveCamera, fov0 = cam.fov, by0 = (cam.top - cam.bottom) / 2;
    let running = false, raf = 0, t = 0, last = 0;
    function fit() {
      const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight, a = w / h, wide = a > baseA;
      renderer.setSize(w, h, false);
      const k = FIT === 'cover' ? (wide ? baseA / a : 1) : wide ? 1 : baseA / a;   // 縦の広さを何倍にするか
      if (persp) { cam.fov = (2 * Math.atan(Math.tan((fov0 * Math.PI) / 360) * k) * 180) / Math.PI; cam.aspect = a; }
      else { cam.top = by0 * k; cam.bottom = -by0 * k; cam.right = by0 * k * a; cam.left = -by0 * k * a; }
      cam.updateProjectionMatrix();
    }
    fit();
    if (renderer.compileAsync) await renderer.compileAsync(scene, cam); else renderer.compile(scene, cam);
    renderer.render(scene, cam);   // 1枚目を、動画の下に用意しておく
    const ro = new ResizeObserver(() => { fit(); if (!running) renderer.render(scene, cam); }); ro.observe(cv);

    return {
      start(onFrame) {
        running = true; last = -1;
        const tick = (now) => {
          if (!running) return;
          const dt = last < 0 ? 1 / 60 : Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; t += dt;   // 重い瞬間があっても、飛ばずにゆっくり進む
          mixer.update(dt); renderer.render(scene, cam); onFrame(t, end);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      dispose() {
        running = false; cancelAnimationFrame(raf); ro.disconnect(); mixer.stopAllAction();
        model.traverse((o) => {
          if (o.geometry) o.geometry.dispose(); if (o.skeleton) o.skeleton.dispose();
          [].concat(o.material || []).forEach((m) => { Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); }); m.dispose(); });
        });
        env.dispose(); renderer.dispose(); renderer.forceContextLoss();
      },
      get time() { return t; }, dur
    };
  }

  // ---------- ③ サイトへ ----------
  function showSite() {   // 入場画面を動かし始める（最初から）
    if (shown) return; shown = true;
    root.classList.remove('op-hold');
    const H = window.OC_HERO; if (H && H.seek) H.seek(0);
    const hero = document.getElementById('hero-main');
    if (hero && hero.classList.contains('is-in')) { hero.classList.remove('is-in'); void hero.offsetWidth; hero.classList.add('is-in'); }   // 大きな文字も、もう一度せり上がる
  }
  function finish(fast) {
    if (phase === 'out' || phase === 'done') return;
    phase = 'out'; log('finish'); hideTap(); showSite();
    const s = fast ? 0.3 : FADE_SEC;
    box.style.pointerEvents = 'none'; box.style.transition = 'opacity ' + s + 's ease'; box.style.opacity = '0';
    setTimeout(done, s * 1000 + 60);
  }
  function done() {
    if (phase === 'done') return;
    phase = 'done'; log('done'); clearInterval(dog);
    try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) { /* なにもしない */ }
    if (player) player.dispose();
    shown || showSite(); box.remove(); root.classList.remove('op-on', 'op-hold');
    window.dispatchEvent(new Event('oc-op-end'));
  }

  // ---------- スマホで、画面の上を引っぱって読み込み直す動きを止める ----------
  // ふつうは index.html の CSS（overscroll-behavior）で止まります。それが効かない古いスマホだけ、ここで止めます
  function guardPull() {
    if (window.CSS && CSS.supports && CSS.supports('overscroll-behavior-y', 'none')) return;
    let x = 0, y = 0, top = false;
    const scrolled = (el) => { for (; el && el !== document.body && el !== root; el = el.parentElement) if (el.scrollTop > 0) return true; return false; };
    document.addEventListener('touchstart', (e) => { const p = e.touches[0]; top = e.touches.length === 1 && (window.scrollY || 0) <= 0 && !scrolled(e.target); if (p) { x = p.clientX; y = p.clientY; } }, { passive: true });
    document.addEventListener('touchmove', (e) => {
      const p = e.touches[0]; if (!top || !p || e.touches.length !== 1) return;
      const dy = p.clientY - y, dx = p.clientX - x; x = p.clientX; y = p.clientY;
      if ((window.scrollY || 0) > 0) top = false; else if (dy > 0 && dy >= Math.abs(dx) && e.cancelable) e.preventDefault();
    }, { passive: false });
  }

  // ---------- ?check のときの、ファイルの中身の確認 ----------
  async function inspect() {
    const L = ['', 'OP（最初の動画と壁のアニメーション）：'], kb = (n) => (n >= 1048576 ? (n / 1048576).toFixed(1) + 'MB' : Math.max(1, Math.round(n / 1024)) + 'KB');
    const miss = (f) => '見つからない。名前がちょうど「' + f + '」か、index.html と同じ場所にあるか確かめてね';
    const big = (n) => (n > 15 * 1048576 ? '\n  ⚠ 大きいので、スマホだと始まるまで時間がかかるかも（5MB くらいまでがおすすめ）' : '');
    try {
      const r = await fetch(VIDEO, { cache: 'no-store' }), n = +r.headers.get('content-length') || 0;
      if (r.body && r.body.cancel) r.body.cancel().catch(() => {});
      if (!r.ok) L.push('・' + VIDEO + '：' + miss(VIDEO));
      else {
        const m = await new Promise((ok) => { const v = document.createElement('video'); v.muted = true; v.preload = 'metadata';
          const t = setTimeout(() => ok(null), 8000); v.onloadedmetadata = () => { clearTimeout(t); ok(v.videoWidth + '×' + v.videoHeight + '・' + v.duration.toFixed(1) + '秒'); v.removeAttribute('src'); v.load(); };
          v.onerror = () => { clearTimeout(t); ok(false); }; v.src = VIDEO; });
        L.push('・' + VIDEO + '：あり（' + (n ? kb(n) + '・' : '') + (m || (m === false ? 'このブラウザでは再生できない形式。H.264 の mp4 で書き出してね' : '長さは確かめられませんでした')) + '）' + big(n));
      }
    } catch (e) { L.push('・' + VIDEO + '：確かめられませんでした'); }
    try {
      const r = await fetch(MODEL, { cache: 'no-store' });
      if (!r.ok) L.push('・' + MODEL + '：' + miss(MODEL));
      else {
        const buf = await r.arrayBuffer(), j = glbJson(buf);
        if (!j) L.push('・' + MODEL + '：中身が glb ではないみたい。Blender で「glTF バイナリー（.glb）」を選んで書き出してね');
        else {
          const an = j.animations || [], sec = Math.max(0, ...an.flatMap((a) => (a.samplers || []).map((s) => ((j.accessors[s.input] || {}).max || [0])[0])));
          L.push('・' + MODEL + '：あり（' + kb(buf.byteLength) + '・パーツ ' + (j.nodes || []).filter((n) => n.mesh !== undefined).length + '・動き ' + an.length + '・長さ ' + sec.toFixed(1) + '秒・カメラ ' + ((j.cameras || []).length ? 'あり' : 'なし→正面から写します') + '）' + big(buf.byteLength));
          if (!an.length) L.push('  ⚠ 動きが入っていません。書き出すとき「アニメーション」にチェック。物理演算のときは、先に「オブジェクト → 剛体 → キーフレームに焼き込み」をしてね');
        }
      }
    } catch (e) { L.push('・' + MODEL + '：確かめられませんでした'); }
    try { const T = await import('three'); L.push('・3D の部品（three.js）：読み込めた（r' + T.REVISION + '）'); } catch (e) { L.push('・3D の部品（three.js）：読み込めない（index.html が古いか、ネットの問題）'); }
    const g = document.createElement('canvas').getContext('webgl2') || document.createElement('canvas').getContext('webgl');
    L.push('・この端末の 3D：' + (g ? '使える' : '使えない（動画のあとは、そのままサイトを出します）'));
    if (g && g.getExtension('WEBGL_lose_context')) g.getExtension('WEBGL_lose_context').loseContext();
    return L.join('\n');
  }
  function glbJson(buf) {
    try {
      const d = new DataView(buf);
      if (buf.byteLength < 20 || d.getUint32(0, true) !== 0x46546c67 || d.getUint32(16, true) !== 0x4e4f534a) return null;   // 「glTF」と「JSON」の印
      return JSON.parse(new TextDecoder().decode(new Uint8Array(buf, 20, d.getUint32(12, true))));
    } catch (e) { return null; }
  }
})();
