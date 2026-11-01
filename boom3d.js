// boom3d.js — サウンドトラックの 3D（白黒のインクで描いたラジカセ・その上に浮かぶカセットテープ）
// boom.js と boom-art.js（絵）のあとに読みこまれます。3D が使えないときは、boom.js の画面だけで動きます
(window.OC_LOADED = window.OC_LOADED || []).push('boom3d');

(function () {
  const B = window.OC_BOOM, A = window.OC_BOOM_ART; if (!B || !A) return;
  // ===== 変えてもいいところ =====
  const LINE = 1;     // ふちの線の太さ（1 がふつう。1.5 で太く）
  const BPM = 96;     // 再生中に、スピーカーと本体がはずむ速さ
  const TILT = 0.34;  // ラジカセの向き（0 で真正面。大きいほど、左の横の面が見える）
  // ============================
  const $ = (s) => document.querySelector(s), { recs, num, REDUCE, EMPTY } = B;
  Promise.all([import('three'), import('three/addons/utils/BufferGeometryUtils.js')]).then(([T, U]) => build(T, U)).catch((e) => { console.warn('[boombox] 3D なし', e); document.body.classList.add('bx-no3d'); });

  function build(T, U) {
    const stage = $('#bx-stage'), cv = stage.querySelector('canvas');
    const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(30, 1, 0.5, 80);
    const pic = (w, h, draw) => { const [c, x] = A.cnv(w, h); draw(x); const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; t.redraw = () => { draw(x); t.needsUpdate = true; }; return t; };
    const flat = (o) => new T.MeshBasicMaterial(o), WHITE = flat({ color: A.PAPER }), BLACK = flat({ color: A.INK }), ORANGE = flat({ color: A.ACCENT });

    // ふちの線：形を少しふくらませた黒い「裏がわ」を重ねる（マンガのような輪郭になる）
    const olM = {}, olG = new Map();
    function olMat(w) { w = (w * LINE).toFixed(4); if (olM[w]) return olM[w]; const m = flat({ color: A.INK, side: T.BackSide });
      m.onBeforeCompile = (s) => { s.vertexShader = s.vertexShader.replace('#include <begin_vertex>', 'vec3 transformed = position + normal * ' + w + ';'); }; m.customProgramCacheKey = () => 'ol' + w; return (olM[w] = m); }
    function hull(mesh, w) {
      let g = olG.get(mesh.geometry);
      if (!g) { g = mesh.geometry.clone(); Object.keys(g.attributes).forEach((k) => k !== 'position' && g.deleteAttribute(k)); g = U.mergeVertices(g, 1e-3); g.clearGroups(); g.computeVertexNormals(); olG.set(mesh.geometry, g); }
      const h = new T.Mesh(g, olMat(w)); h.raycast = () => {}; mesh.add(h); return mesh;
    }

    // ---------- ラジカセ ----------
    const { W, H, DP, S } = A, FZ = DP / 2;
    const boom = new T.Group(); boom.rotation.y = TILT; scene.add(boom);
    const body = new T.Group(); boom.add(body);   // 再生中にはずむ
    const tF = pic(W * S, H * S, A.front), tT = pic(W * S, DP * S, A.top), sideM = flat({ map: pic(DP * S, H * S, A.side) });
    const box = hull(new T.Mesh(new T.BoxGeometry(W, H, DP), [sideM, sideM, flat({ map: tT }), BLACK, flat({ map: tF }), BLACK]), 0.045); box.position.y = H / 2; body.add(box);
    const coneM = flat({ map: pic(512, 512, A.cone) });
    const cones = [-2.05, 2.05].map((cx) => { const m = hull(new T.Mesh(new T.CylinderGeometry(0.9, 0.9, 0.16, 64), [WHITE, coneM, BLACK]), 0.025); m.rotation.x = Math.PI / 2; m.position.set(cx, 1.2, FZ); body.add(m); return m; });
    const keys = [0, 1, 2, 3, 4].map((k) => {   // 巻きもどし・再生・停止・早送り・取り出し
      const fm = flat({ map: pic(96, 80, (x) => A.key(x, k)) }), m = hull(new T.Mesh(new T.BoxGeometry(0.3, 0.25, 0.16), [WHITE, WHITE, WHITE, WHITE, fm, WHITE]), 0.02);
      m.position.set((k - 2) * 0.335, 0.33, FZ + 0.03); m.userData.key = k; body.add(m); return { m, fm, t: -9 };
    });
    const eqG = new T.BoxGeometry(0.075, 1, 0.02); eqG.translate(0, 0.5, 0);   // 小さな画面の光る棒
    const eq = Array.from({ length: 12 }, (_, i) => { const m = new T.Mesh(eqG, ORANGE); m.position.set(-0.66 + i * 0.12, 2.48, FZ + 0.012); body.add(m); return m; });
    const ledM = flat({ color: '#3a3a3a' }), led = new T.Mesh(new T.CircleGeometry(0.05, 20), ledM); led.position.set(0.68, 2.0, FZ + 0.004); body.add(led);
    const doorM = flat({ map: pic(344, 240, A.door), transparent: true }), lid = new T.Group(); lid.position.set(0, 0.56, FZ + 0.12); body.add(lid);   // ふた：下をじくにして手前に開く
    const door = new T.Mesh(new T.BoxGeometry(1.72, 1.2, 0.04), [WHITE, WHITE, WHITE, WHITE, doorM, doorM]); door.position.y = 0.6; door.renderOrder = 2; lid.add(door);
    const gripM = flat({ map: pic(1024, 48, A.grip) });
    [-2.35, 2.35].forEach((a) => { const p = hull(new T.Mesh(new T.BoxGeometry(0.24, 0.62, 0.36), WHITE), 0.022); p.position.set(a, H + 0.29, -0.05); body.add(p); });
    const bar = hull(new T.Mesh(new T.BoxGeometry(5.0, 0.22, 0.4), [WHITE, WHITE, gripM, WHITE, gripM, WHITE]), 0.025); bar.position.set(0, H + 0.62, -0.05); body.add(bar);
    const ant = new T.Mesh(new T.CylinderGeometry(0.03, 0.04, 4.9, 8), BLACK); ant.rotation.z = Math.PI / 2; ant.position.set(-0.2, H + 0.09, -0.6); body.add(ant);
    const knob = new T.Mesh(new T.SphereGeometry(0.07, 12, 8), BLACK); knob.position.set(2.25, H + 0.09, -0.6); body.add(knob);
    const sh = new T.Shape([[-3.3, -0.8], [3.3, -0.8], [4.2, 0.0], [4.2, 1.5], [-2.4, 1.5], [-3.3, 0.8]].map(([a, b]) => new T.Vector2(a, b)));   // 床の影（右うしろへ）
    const shadow = new T.Mesh(new T.ShapeGeometry(sh), flat({ color: A.SHADOW, side: T.DoubleSide })); shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.002; boom.add(shadow);

    // ---------- カセットテープ ----------
    const TW = 1.62, TH = 1.03, TD = 0.17, reelM = flat({ map: pic(128, 128, A.reel), transparent: true }), reelG = new T.CircleGeometry(0.068, 28), tapeG = new T.BoxGeometry(TW, TH, TD);
    const RL = A.REELS.map(([a, b]) => [(a / A.CW - 0.5) * TW, (0.5 - b / A.CH) * TH]);
    const tapes = recs.map((r, i) => {
      const tp = { img: null, u: 0, fy: 0, reels: [] }, side = (s) => pic(A.CW, A.CH, (x) => A.tape(x, r, num(i), s, tp.img, EMPTY)), ta = side('A'), tb = side('B');
      const m = hull(new T.Mesh(tapeG, [WHITE, WHITE, WHITE, WHITE, flat({ map: ta }), flat({ map: tb })]), 0.03); m.userData.tape = i; scene.add(m);
      [1, -1].forEach((z) => RL.forEach(([a, b]) => { const q = new T.Mesh(reelG, reelM); q.position.set(z * a, b, z * (TD / 2 + 0.003)); if (z < 0) q.rotation.y = Math.PI; m.add(q); tp.reels.push(q); }));
      tp.m = m; tp.redraw = () => { ta.redraw(); tb.redraw(); };
      if (r.img) { const im = new Image(); im.onload = () => { tp.img = im; tp.redraw(); }; im.src = r.img; }
      return tp;
    });
    if (document.fonts) Promise.all(['400 40px Anton', '700 20px "Space Mono"', '400 20px "Space Mono"'].map((f) => document.fonts.load(f).catch(() => {}))).then(() => { tF.redraw(); tT.redraw(); tapes.forEach((tp) => tp.redraw()); });

    // ---------- 大きさ・カメラ ----------
    function fit() {
      const w = stage.clientWidth, h = stage.clientHeight, a = w / h, d = 17; R.setSize(w, h, false); cam.aspect = a;
      cam.fov = (2 * Math.atan(Math.max(4.25 / (d * a), 3.45 / d)) * 180) / Math.PI; cam.position.set(0, 3.05 + d * 0.15, d); cam.lookAt(0, 3.05, 0); cam.updateProjectionMatrix();
    }
    new ResizeObserver(fit).observe(stage); fit();

    // ---------- さわる：スワイプで選ぶ・タップでかける／止める ----------
    let px0 = 0, py0 = 0, pt0 = 0; const ray = new T.Raycaster(), v2 = new T.Vector2();
    const act = (k) => { keys[k].t = performance.now(); if (k === 0) B.select(B.cur - 1); if (k === 1) B.play(); if (k === 2 || k === 4) B.stop(); if (k === 3) B.select(B.cur + 1); };
    cv.addEventListener('pointerdown', (e) => { px0 = e.clientX; py0 = e.clientY; pt0 = performance.now(); });
    cv.addEventListener('pointerup', (e) => {
      const dx = e.clientX - px0, dy = e.clientY - py0;
      if (Math.abs(dx) > 36 && Math.abs(dx) > Math.abs(dy)) return act(dx < 0 ? 3 : 0);
      if (performance.now() - pt0 > 600 || Math.hypot(dx, dy) > 14) return;
      const b = cv.getBoundingClientRect(); v2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(v2, cam);
      const hit = ray.intersectObjects([...tapes.filter((tp) => tp.m.visible).map((tp) => tp.m), box, door, ...cones, ...keys.map((k) => k.m)], false)[0]; if (!hit) return;
      const u = hit.object.userData;
      if (u.key != null) return act(u.key);
      if (u.tape != null && u.tape !== B.cur) return B.select(u.tape);
      act(B.playing ? 2 : 1);
    });

    // ---------- うごき ----------
    const lerp = (a, b, t) => a + (b - a) * t, ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2), toward = (a, b, s) => (Math.abs(b - a) <= s ? b : a + Math.sign(b - a) * s);
    const DECK = new T.Vector3(0, 1.17, FZ + 0.01), APP = new T.Vector3(0, 1.22, FZ + 1.6), POP = new T.Vector3(0, 2.3, FZ + 1.5), SPLIT = 0.62;
    const P0 = new T.Vector3(), P1 = new T.Vector3(), P2 = new T.Vector3(), PA = new T.Vector3(), qF = new T.Quaternion(), qD = new T.Quaternion(), qX = new T.Quaternion(), e3 = new T.Euler(), AY = new T.Vector3(0, 1, 0);
    let car = B.cur, lid0 = 0, pl = 0, vis = true, last = performance.now(); const t00 = last;
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; }).observe(stage);
    (function loop(now) {
      requestAnimationFrame(loop); if (!vis || document.hidden) { last = now; return; }
      const dt = Math.min(0.05, (now - last) / 1000), t = (now - t00) / 1000, bob = REDUCE ? 0 : 1; last = now;
      car = REDUCE ? B.cur : lerp(car, B.cur, 1 - Math.pow(0.002, dt));
      boom.rotation.y = TILT + Math.sin(t * 0.4) * 0.05 * bob; boom.updateMatrixWorld(true); qD.copy(boom.quaternion);
      let open = false, inDeck = null;
      tapes.forEach((tp, i) => {
        // 入る・出る（ふたが開くまで、ふたの前で待つ）／裏返す（ラジカセの中なら、いったん上に出てくる）
        const inT = B.playing && i === B.cur ? 1 : 0, fT = i === B.cur && B.face === 'B' ? Math.PI : 0, near = (u) => ease(u) > SPLIT;
        if (tp.u !== inT) { open = true; const nu = REDUCE ? inT : toward(tp.u, inT, dt / 1.15); if (REDUCE || lid0 > 0.9 || !(near(nu) || near(tp.u))) tp.u = nu; }
        if (tp.fy !== fT) { if (tp.u > 0.5) { open = true; if (REDUCE || lid0 > 0.9) tp.fy = REDUCE ? fT : toward(tp.fy, fT, dt * 3.2); } else tp.fy = REDUCE ? fT : toward(tp.fy, fT, dt * 4.5); }
        // 浮かんでいるところ（選んでいるテープが、まん中で大きく）
        const k = i - car, ak = Math.abs(k), fs = 1.9 - Math.min(ak, 1.4) * 0.56, e = ease(tp.u), m = tp.m;
        P0.set(k * 2.95, 5.4 - Math.min(ak, 2) * 0.4 + Math.sin(t * 1.1 + i * 1.7) * 0.07 * bob, 0.8 - Math.min(ak, 2) * 1.1);
        e3.set(0.1 + Math.sin(t * 0.9 + i) * 0.03 * bob, -k * 0.42 + Math.sin(t * 0.7 + i) * 0.1 * bob, Math.sin(t * 0.8 + i * 2) * 0.05 * bob); qF.setFromEuler(e3);
        PA.copy(APP); body.localToWorld(PA); P2.copy(DECK).lerp(POP, tp.u > 0.5 ? Math.sin(tp.fy) : 0); body.localToWorld(P2);
        if (e <= 0) { m.position.copy(P0); m.quaternion.copy(qF); m.scale.setScalar(fs); m.position.y += Math.sin(tp.fy) * 0.4; }
        else if (e < SPLIT) { const s = e / SPLIT, a = 1 - s; P1.set(PA.x, P0.y, PA.z); m.position.set(a * a * P0.x + 2 * a * s * P1.x + s * s * PA.x, a * a * P0.y + 2 * a * s * P1.y + s * s * PA.y, a * a * P0.z + 2 * a * s * P1.z + s * s * PA.z); m.quaternion.slerpQuaternions(qF, qD, Math.min(1, s * 1.3)); m.scale.setScalar(lerp(fs, 1, s)); }
        else { m.position.lerpVectors(PA, P2, (e - SPLIT) / (1 - SPLIT)); m.quaternion.copy(qD); m.scale.setScalar(1 + Math.sin(tp.fy) * 0.25); }
        if (tp.fy) m.quaternion.multiply(qX.setFromAxisAngle(AY, tp.fy));
        m.visible = ak < 2.4 || tp.u > 0;
        if (tp.u === 1 && tp.fy === fT) inDeck = tp;
      });
      lid0 = REDUCE ? (open ? 1 : 0) : toward(lid0, open ? 1 : 0, dt * 4.5); lid.rotation.x = ease(lid0) * 1.25;
      // 再生中：テープの車が回る・スピーカーと本体がはずむ・光る棒
      const on = !!(inDeck && B.playing); pl = REDUCE ? (on ? 1 : 0) : toward(pl, on ? 1 : 0, dt * 2.5);
      if (on) inDeck.reels.forEach((q, j) => { q.rotation.z -= dt * (j < 2 ? 3.2 : -3.2); });
      const kick = REDUCE ? 0 : Math.exp(-(((t * BPM) / 60) % 1) * 6) * pl;
      body.scale.set(1 - kick * 0.008, 1 + kick * 0.02, 1); cones.forEach((c) => c.scale.set(1 + kick * 0.03, 1 + kick * 2.4, 1 + kick * 0.03));
      eq.forEach((m, i) => { m.scale.y = 0.03 + pl * (0.06 + 0.26 * Math.abs(Math.sin(t * (2.3 + i * 0.37) + i * 1.3)) * (0.55 + 0.45 * Math.min(1, kick / Math.max(pl, 0.01)))); });
      ledM.color.set(on ? A.ACCENT : '#3a3a3a');
      keys.forEach((k, j) => { const down = (j === 1 && B.playing) || now - k.t < 180; k.m.position.z = FZ + (down ? -0.03 : 0.03); k.fm.color.set(down ? '#cfcac0' : '#ffffff'); });
      R.render(scene, cam);
    })(performance.now());
    document.body.classList.add('bx-3d');
  }
})();
