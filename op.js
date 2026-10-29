// op.js — サイトを開いたときのオープニング（OP）
// ① op.mp4（ロゴの動画）→ ② 終わった瞬間に kabeban.glb（壁が割れる）→ 割れた壁のうしろに、サイト
// ・動画の最後の1コマを壁の表に貼るので、ロゴの画面が、そのまま割れて飛び散ります
// ・同じタブで読み込み直したときは出しません。もう一度見たいときは、アドレスの最後に ?op
// ・見つからない・読み込めないときは、そこをとばします
// ・?check で、op.mp4 と kabeban.glb の中身も表示します
(window.OC_LOADED = window.OC_LOADED || []).push('op');

(function () {
  // ===== 変えてもいいところ =====
  const VIDEO = 'op.mp4';            // ロゴの動画（index.html と同じ場所に置く）
  const MODEL = 'kabeban.glb';       // 壁のアニメーション（同じく）
  const FIT = 'cover';               // 'cover'＝画面いっぱい／'contain'＝動画のはしまで全部見せる
  const VIDEO_SAFE = 0.3;            // cover でも、動画のまん中のこの割合は、かならず見せる（ロゴが切れないように）
  const SITE_BEHIND_WALL = true;     // 壁のうしろにサイトを置く（false にすると、動画の最後の色）
  const LOGO_ON_WALL = true;         // 動画の最後の1コマを、壁の表に貼る（ロゴごと割れる）
  const SKIP_STILL = true;           // glb の最初の「まだ動いていない時間」をとばして、すぐに割れ始める
  const CAM_LIFT = 2.5;              // 割れたあと、カメラを上げる量（画面の高さの何倍か）。下に残るかけらが画面から出ていく（0 で動かさない）
  const FADE_SEC = 0.6;              // 最後に、残ったかけらが消える時間（秒）
  const TONE = 'agx';                // 色の見え方：'agx'（Blender 4 の標準）／'filmic'（Blender 3 の標準）／'standard'
  const EXPOSURE = 1.0;              // 3D の明るさ（1.2 で明るく、0.8 で暗く）
  const LIGHT = 1.0;                 // glb にライトがないときの、ライトの強さ（0 で、なし）
  const SKIP_BUTTON = true;          // 動画のあいだ、右下に SKIP を出す
  const SOUND = false;               // true にすると、動画の音を出す（最初に、画面をタップしてもらう）
  const MAX_TEX = 2048;              // glb の中の画像は、この大きさまで縮める（スマホのため）
  // ============================
  const CDN = 'https://cdn.jsdelivr.net/npm/three@0.160.0/';   // index.html の importmap と同じ番号にする
  const MODEL_WAIT = 8, STALL = 10, MAX_SEC = 90;               // 待つ秒数

  const root = document.documentElement, box = document.getElementById('op');
  const OP = (window.OC_OP = { cfg: { VIDEO, MODEL, SKIP_STILL }, log: [] });   // cfg は ?check 用
  const log = (s) => OP.log.push([s, Math.round(performance.now())]);
  if (!box) return;
  if (!root.classList.contains('op-on')) { box.remove(); return; }
  try { sessionStorage.setItem('oc-op', '1'); } catch (e) { /* 保存できなくても動く */ }

  const video = box.querySelector('video'), cv = box.querySelector('canvas'), T0 = performance.now();
  const shot = document.createElement('canvas');   // 動画の最後の1コマ（壁の表に貼る）
  let phase = 'video', player = null, tap = null, shown = false, lastMove = T0, lastT = -1, lastPaint = 0, dog = 0, vbox = null, kept = false;
  Object.defineProperty(OP, 'phase', { get: () => phase });

  // ---------- ① 動画 ----------
  const ready = loadModel().then((p) => { if (phase === 'done') { if (p) p.dispose(); return null; } player = p; log('model-ready'); return p; },
    (err) => { console.warn('[OP] ' + MODEL + ' を使えません：', err); log('model-fail'); return null; });
  try {
    video.muted = video.defaultMuted = !SOUND; video.playsInline = true;
    video.addEventListener('loadedmetadata', place); window.addEventListener('resize', place);
    video.addEventListener('ended', () => { log('video-end'); toModel(); });
    video.addEventListener('error', () => { console.warn('[OP] ' + VIDEO + ' を再生できません'); log('video-fail'); toModel(); });
    video.addEventListener('playing', () => { log('video-play'); hideTap(); place(); paint(); });
    if (video.requestVideoFrameCallback) {
      const f = (now) => {
        if (phase !== 'video') return;
        if (now - lastPaint > 90) { lastPaint = now; paint(); }
        if (LOGO_ON_WALL && video.duration && video.currentTime > video.duration - 0.4) keep();   // 最後のコマをとっておく
        video.requestVideoFrameCallback(f);
      };
      video.requestVideoFrameCallback(f);
    } else video.addEventListener('timeupdate', paint);
    video.src = VIDEO;
    if (SOUND) showTap(); else play();
    if (SKIP_BUTTON) { const b = btn('op-skip', 'SKIP'); b.addEventListener('click', (e) => { e.stopPropagation(); finish(true); }); setTimeout(() => b.classList.add('on'), 1200); }
    box.addEventListener('click', () => { if (tap && !tap.hidden) { hideTap(); play(); } });
    const stop = (e) => { if (e.cancelable) e.preventDefault(); };   // うしろのページを動かさない
    box.addEventListener('wheel', stop, { passive: false }); box.addEventListener('touchmove', stop, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (phase === 'done' || phase === 'out' || (phase === 'model' && SITE_BEHIND_WALL)) return;
      if (e.key === 'Escape') finish(true); else if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) e.preventDefault();
    });
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
    if (p && p.catch) p.catch((e) => { if (phase === 'video' && e && e.name === 'NotAllowedError') showTap(); });   // 省電力モードなど
  }
  function btn(cls, txt) { const b = document.createElement('button'); b.type = 'button'; b.className = cls; b.textContent = txt; box.appendChild(b); return b; }
  function showTap() { if (!tap) tap = btn('op-tap', 'TAP TO START'); tap.hidden = false; log('tap'); }
  function hideTap() { if (tap) tap.hidden = true; }

  // 動画の大きさ：cover は画面いっぱい。まん中（VIDEO_SAFE）が切れるときは、少し小さく
  function place() {
    const vw = video.videoWidth, vh = video.videoHeight, W = box.clientWidth, H = box.clientHeight; if (!vw || !W) return;
    const c = Math.min(W / vw, H / vh); let s = c;
    if (FIT === 'cover') s = Math.max(c, Math.min(Math.max(W / vw, H / vh), W / (vw * VIDEO_SAFE), H / (vh * VIDEO_SAFE)));
    video.style.transform = s > c * 1.001 ? 'scale(' + (s / c).toFixed(4) + ')' : '';
    vbox = { x: (W - vw * s) / 2, y: (H - vh * s) / 2, w: vw * s, h: vh * s };
  }
  function keep() {
    const vw = video.videoWidth, vh = video.videoHeight; if (!vw) return;
    const s = Math.min(1, 2048 / Math.max(vw, vh)), w = Math.round(vw * s), h = Math.round(vh * s);
    if (shot.width !== w || shot.height !== h) { shot.width = w; shot.height = h; }
    try { shot.getContext('2d').drawImage(video, 0, 0, w, h); kept = true; } catch (e) { /* なにもしない */ }
  }

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
  function paint() { if (phase !== 'video') return; const c = edge(); if (c) video.style.backgroundColor = box.style.backgroundColor = c; }   // うしろの 3D は、まだ隠す

  // ---------- ② 壁のアニメーション ----------
  function toModel() {
    if (phase !== 'video') return;
    phase = 'wait'; hideTap();
    const c = edge(); if (c) box.style.backgroundColor = c;
    if (LOGO_ON_WALL && !kept) keep();
    if (player) return startModel();
    ready.then((p) => { if (phase === 'wait') { if (p) startModel(); else finish(); } });
    setTimeout(() => { if (phase === 'wait') { console.warn('[OP] ' + MODEL + ' の読み込みが間に合わないので、とばします'); finish(); } }, MODEL_WAIT * 1000);
  }
  function startModel() {
    phase = 'model'; log('model-start');
    player.start((t, end) => { if (phase === 'model' && t >= end - FADE_SEC) finish(); }, LOGO_ON_WALL && kept && vbox ? { canvas: shot, rect: vbox } : null);
    video.style.visibility = 'hidden';
    if (SITE_BEHIND_WALL) {   // 壁のうしろは、もうサイト（さわれる）
      box.style.backgroundColor = 'transparent'; box.style.pointerEvents = 'none';
      box.querySelectorAll('button').forEach((b) => { b.hidden = true; });
      showSite();
    }
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
    renderer.setClearColor(0x000000, 0);   // 色をぬらない（うしろのサイトが見える）
    renderer.toneMapping = TONE === 'standard' ? THREE.NoToneMapping : (TONE === 'agx' && THREE.AgXToneMapping) || THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = EXPOSURE;
    const scene = new THREE.Scene(), model = gltf.scene || gltf.scenes[0], extra = [];
    scene.add(model);
    const pm = new THREE.PMREMGenerator(renderer), env = pm.fromScene(new RoomEnvironment(renderer), 0.04).texture;   // まわりの明るさ
    pm.dispose(); scene.environment = env;

    // 大きすぎる画像は縮める（スマホの 3D のメモリが足りなくならないように）
    const big = new Set();
    model.traverse((o) => [].concat(o.material || []).forEach((m) => Object.values(m).forEach((v) => { if (v && v.isTexture && v.image && Math.max(v.image.width || 0, v.image.height || 0) > MAX_TEX) big.add(v); })));
    big.forEach((tx) => {
      const im = tx.image, s = MAX_TEX / Math.max(im.width, im.height), c = document.createElement('canvas');
      c.width = Math.round(im.width * s); c.height = Math.round(im.height * s); c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      tx.image = c; tx.needsUpdate = true;
    });

    // 動き：glb に入っている動きを、ぜんぶ同時に1回だけ再生（最後の形で止める）
    const mixer = new THREE.AnimationMixer(model); let dur = 0, t = 0;
    gltf.animations.forEach((clip) => { const a = mixer.clipAction(clip); a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; a.play(); dur = Math.max(dur, clip.duration); });
    if (SKIP_STILL && gltf.animations.length) {   // どれかが動き始める時刻を探す
      let s0 = Infinity;
      gltf.animations.forEach((clip) => clip.tracks.forEach((tr) => {
        const n = tr.getValueSize(), v = tr.values, T = tr.times;
        for (let k = 1; k < T.length; k++) { let d = 0; for (let c = 0; c < n; c++) d = Math.max(d, Math.abs(v[k * n + c] - v[c])); if (d > 1e-4) { s0 = Math.min(s0, T[k - 1]); break; } }
      }));
      if (isFinite(s0)) t = s0;
    }
    mixer.update(t); model.updateMatrixWorld(true);
    const end = Math.max(dur, t + 1), t1 = t;   // 動きがないときは、1秒見せる

    // カメラ：glb のカメラ。なければ正面（Blender の「前」）から、壁が画面いっぱいに
    let cam = (gltf.cameras || []).find((c) => c.isPerspectiveCamera || c.isOrthographicCamera), baseA, zoom = 1, camY = 0, camD = 0;
    if (cam) baseA = cam.isPerspectiveCamera ? (cam.aspect && cam.aspect !== 1 ? cam.aspect : video.videoWidth ? video.videoWidth / video.videoHeight : cam.aspect || 16 / 9) : (cam.right - cam.left) / (cam.top - cam.bottom);
    else {
      const bb = new THREE.Box3().setFromObject(model);
      if (bb.isEmpty()) throw new Error(MODEL + ' の中に、形がない');
      const s = bb.getSize(new THREE.Vector3()), c = bb.getCenter(new THREE.Vector3()), h = Math.max(s.y, 1e-3), d = h / 2 / Math.tan((15 * Math.PI) / 180) + s.z / 2;
      cam = new THREE.PerspectiveCamera(30, 1, d / 100, d * 100 + s.z);
      cam.position.set(c.x, c.y, c.z + d); cam.lookAt(c); scene.add(cam);
      baseA = Math.max(s.x, 1e-3) / h; zoom = 1.04; camY = cam.position.y; camD = d - s.z / 2;   // はしに、すき間ができないように、少し寄る
    }
    let lit = false; model.traverse((o) => { if (o.isLight) lit = true; });
    if (!lit && LIGHT > 0) {   // ライトがないときは、カメラの右上うしろから当てる
      const sun = new THREE.DirectionalLight(0xffffff, 1.5 * LIGHT); sun.position.set(1.5, 2.5, 1); sun.target.position.set(0, 0, -6);
      cam.add(sun); cam.add(sun.target); if (!cam.parent) scene.add(cam);
    }
    const persp = !!cam.isPerspectiveCamera, fov0 = cam.fov, by0 = (cam.top - cam.bottom) / 2;
    let running = false, raf = 0, last = 0;
    function fit() {
      const w = cv.clientWidth || window.innerWidth, h = cv.clientHeight || window.innerHeight, a = w / h, wide = a > baseA;
      renderer.setSize(w, h, false);
      const k = (FIT === 'cover' ? (wide ? baseA / a : 1) : wide ? 1 : baseA / a) / zoom;   // 縦の広さ
      if (persp) { cam.fov = (2 * Math.atan(Math.tan((fov0 * Math.PI) / 360) * k) * 180) / Math.PI; cam.aspect = a; }
      else { cam.top = by0 * k; cam.bottom = -by0 * k; cam.right = by0 * k * a; cam.left = -by0 * k * a; }
      cam.updateProjectionMatrix();
    }
    // 動画の最後の1コマを、見えている位置のまま、壁の表（カメラを向いた面）に貼る
    const p = new THREE.Vector3(), q = new THREE.Vector3(), n = new THREE.Vector3(), nm = new THREE.Matrix3(), eye = new THREE.Vector3(), front = [];
    const facing = (o, i) => { p.fromBufferAttribute(o.geometry.attributes.position, i).applyMatrix4(o.matrixWorld); n.fromBufferAttribute(o.geometry.attributes.normal, i).applyMatrix3(nm).normalize(); return n.dot(q.copy(eye).sub(p).normalize()) > 0.5; };
    const logoMat = LOGO_ON_WALL ? new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shot), toneMapped: false }) : null;
    fit(); scene.updateMatrixWorld(true); eye.setFromMatrixPosition(cam.matrixWorld);
    if (logoMat) {
      logoMat.map.colorSpace = THREE.SRGBColorSpace; extra.push(logoMat);
      model.traverse((o) => { if (!o.isMesh || !o.geometry.attributes.normal) return; nm.getNormalMatrix(o.matrixWorld); for (let i = 0; i < o.geometry.attributes.position.count; i++) if (facing(o, i)) { front.push(o); return; } });
    }
    function logo(f) {
      const W = cv.clientWidth || window.innerWidth, H = cv.clientHeight || window.innerHeight;
      scene.updateMatrixWorld(true); eye.setFromMatrixPosition(cam.matrixWorld);
      front.forEach((o) => {
        const P = o.geometry.attributes.position, uv = new Float32Array(P.count * 2);
        nm.getNormalMatrix(o.matrixWorld);
        for (let i = 0; i < P.count; i++) {
          if (facing(o, i)) { p.project(cam); uv[i * 2] = (((p.x + 1) / 2) * W - f.rect.x) / f.rect.w; uv[i * 2 + 1] = 1 - (((1 - p.y) / 2) * H - f.rect.y) / f.rect.h; }
          else uv[i * 2] = uv[i * 2 + 1] = 0.002;   // 横や裏は、動画のすみの色
        }
        o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        [].concat(o.material).forEach((m) => extra.includes(m) || extra.push(m)); o.material = logoMat;
      });
      logoMat.map.needsUpdate = true;
    }
    const dummy = logoMat && new THREE.Mesh(new THREE.PlaneGeometry(1e-4, 1e-4), logoMat);   // 貼る瞬間に止まらないよう、先に準備
    if (dummy) scene.add(dummy);
    if (renderer.compileAsync) await renderer.compileAsync(scene, cam); else renderer.compile(scene, cam);
    if (dummy) { scene.remove(dummy); dummy.geometry.dispose(); }
    renderer.render(scene, cam);   // 1枚目を、動画の下に用意しておく
    const ro = new ResizeObserver(() => { fit(); if (!running) renderer.render(scene, cam); }); ro.observe(cv);

    return {
      start(onFrame, frame) {
        if (frame && logoMat && front.length) { try { logo(frame); } catch (e) { console.warn('[OP] ロゴを壁に貼れませんでした', e); } }
        running = true; last = -1; renderer.render(scene, cam);   // 切りかわる瞬間の1枚
        const tick = (now) => {
          if (!running) return;
          const dt = last < 0 ? 1 / 60 : Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; t += dt;   // 重くても飛ばない
          if (camD && CAM_LIFT) { const x = Math.min(1, (t - t1) / (end - t1) / 0.65); cam.position.y = camY + CAM_LIFT * 2 * camD * Math.tan((cam.fov * Math.PI) / 360) * x * x * (3 - 2 * x); }   // カメラを、ゆっくり上へ
          mixer.update(dt); renderer.render(scene, cam); onFrame(t, end);
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      dispose() {
        running = false; cancelAnimationFrame(raf); ro.disconnect(); mixer.stopAllAction();
        const kill = (m) => { Object.values(m).forEach((v) => { if (v && v.isTexture) v.dispose(); }); m.dispose(); };
        model.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.skeleton) o.skeleton.dispose(); [].concat(o.material || []).forEach(kill); });
        extra.forEach(kill); env.dispose(); renderer.dispose(); renderer.forceContextLoss();
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
    if (hero && hero.classList.contains('is-in')) { hero.classList.remove('is-in'); void hero.offsetWidth; hero.classList.add('is-in'); }   // 大きな文字も、もう一度
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

})();
