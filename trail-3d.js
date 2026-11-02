// trail-3d.js — コラムのいちばん上：MT. MAYAMA の山なみ（3D）
// ・コラム1本ごとに、山がひとつ立ちます（本文が長いほど高い山）。山頂には旗と、コラムの名前
// ・地形は、地図みたいな等高線と、標高ごとの色。雲海がゆっくり流れます
// ・横にドラッグすると山が回ります（パソコンはたても）。旗を押すと、その山へ飛んでいって、コラムがひらきます
// ・3D が使えない端末では、この部分は出ません（コラムの一覧は、ふつうに見られます）
(window.OC_LOADED = window.OC_LOADED || []).push('trail-3d');

(function () {
  const SZ = 12, SEG = 170;   // 地面の広さと、こまかさ

  function start(cv, labels, peaks, onPick) {
    let api = null;
    const ready = import('three').then((T) => { api = build(T, cv, labels, peaks, onPick); return api; });
    return { ready, fly: (i, cb) => ready.then((a) => a.fly(i, cb)), home: () => ready.then((a) => a.home()), pause: (b) => ready.then((a) => a.pause(b)) };
  }

  function build(T, cv, labels, peaks, onPick) {
    const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(38, 1, 0.1, 80);

    // ---------- 地形（高さ） ----------
    let s = 11; const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const G = 32, gr = Array.from({ length: (G + 1) * (G + 1) }, rnd);
    const sm = (t) => t * t * (3 - 2 * t), at = (i, j) => gr[(((i % G) + G) % G) + (((j % G) + G) % G) * (G + 1)];
    const vn = (x, y) => { const i = Math.floor(x), j = Math.floor(y), u = sm(x - i), v = sm(y - j); return at(i, j) * (1 - u) * (1 - v) + at(i + 1, j) * u * (1 - v) + at(i, j + 1) * (1 - u) * v + at(i + 1, j + 1) * u * v; };
    const fbm = (x, y) => { let t = 0, a = 0.5; for (let o = 0; o < 5; o++) { t += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return t; };
    // 山の場所：まん中に MT. MAYAMA、まわりにコラムの山（新しいものほど手前）
    const P = [{ x: 0, z: -0.6, a: 2.7, s: 0.95, name: 'MT. MAYAMA', main: true }];
    peaks.forEach((p, i) => { const ang = 1.9 + i * 2.39996, r = 2.4 + 0.62 * Math.sqrt(i); P.push(Object.assign({ x: Math.cos(ang) * r, z: Math.sin(ang) * r * 0.85 + 0.4, a: 1.05 + p.h * 1.3, s: 0.5 + p.h * 0.12 }, p)); });
    function H(x, z) {
      let h = fbm(x * 0.32 + 7, z * 0.32 + 3) * 1.05 - 0.15;
      for (const p of P) { const d2 = (x - p.x) ** 2 + (z - p.z) ** 2; h += p.a * Math.exp(-d2 / (2 * p.s * p.s)) * (0.85 + 0.3 * vn(x * 2.2 + 40, z * 2.2)); }
      const r = Math.hypot(x, z * 1.1) / (SZ / 2); return Math.max(0, h * (1 - sm(Math.min(1, Math.max(0, (r - 0.72) / 0.28)))));
    }
    const geo = new T.PlaneGeometry(SZ, SZ, SEG, SEG); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position; let maxH = 0;
    for (let i = 0; i < pos.count; i++) { const h = H(pos.getX(i), pos.getZ(i)); pos.setY(i, h); maxH = Math.max(maxH, h); }
    geo.computeVertexNormals();
    P.forEach((p) => { p.y = H(p.x, p.z); });

    // ---------- 地形の色：標高ごとの色＋等高線＋かげ（地面のはしは、空にとける） ----------
    const U = { uMax: { value: maxH }, uCam: { value: new T.Vector3() }, uFog: { value: new T.Color('#e7ece9').convertLinearToSRGB() } };
    const land = new T.Mesh(geo, new T.ShaderMaterial({ uniforms: U,
      vertexShader: 'varying float vH; varying vec3 vN; varying vec3 vW; void main() { vH = position.y; vN = normal; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `uniform float uMax; uniform vec3 uCam, uFog; varying float vH; varying vec3 vN; varying vec3 vW;
        void main() {
          float t = clamp(vH / uMax, 0.0, 1.0);
          vec3 c = mix(vec3(0.53, 0.67, 0.45), vec3(0.80, 0.78, 0.52), smoothstep(0.12, 0.42, t));
          c = mix(c, vec3(0.69, 0.52, 0.36), smoothstep(0.42, 0.72, t));
          c = mix(c, vec3(0.96, 0.95, 0.92), smoothstep(0.8, 0.9, t));
          float sh = clamp(dot(normalize(vN), normalize(vec3(-0.55, 0.75, 0.38))), 0.0, 1.0) * 0.72 + 0.34;
          c *= sh;
          float k = vH * 12.0, f = abs(fract(k - 0.5) - 0.5) / max(fwidth(k), 1e-4), k5 = k / 5.0, f5 = abs(fract(k5 - 0.5) - 0.5) / max(fwidth(k5), 1e-4);
          c = mix(c, vec3(0.50, 0.32, 0.17), max((1.0 - min(f, 1.0)) * 0.42, (1.0 - min(f5 / 1.6, 1.0)) * 0.78));
          c = mix(c, uFog, smoothstep(10.0, 21.0, length(vW - uCam)));
          gl_FragColor = vec4(c, 1.0 - smoothstep(0.8, 0.99, length(vW.xz) / 6.0));
        }`, transparent: true }));
    scene.add(land);

    // ---------- 雲海 ----------
    const CU = { uT: { value: 0 } };
    const cloud = new T.Mesh(new T.PlaneGeometry(SZ * 1.6, SZ * 1.6), new T.ShaderMaterial({ uniforms: CU, transparent: true, depthWrite: false,
      vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform float uT; varying vec2 vUv;
        float h(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float n(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
        void main() {
          vec2 p = vUv * 7.0 + vec2(uT * 0.035, uT * 0.014); float v = 0.0, a = 0.5;
          for (int i = 0; i < 4; i++) { v += a * n(p); p *= 2.03; a *= 0.5; }
          float e = smoothstep(0.0, 0.3, vUv.x) * smoothstep(1.0, 0.7, vUv.x) * smoothstep(0.0, 0.3, vUv.y) * smoothstep(1.0, 0.7, vUv.y);
          gl_FragColor = vec4(vec3(1.0), smoothstep(0.42, 0.78, v) * 0.82 * e);
        }` }));
    cloud.rotation.x = -Math.PI / 2; cloud.position.y = maxH * 0.2; cloud.renderOrder = 2; scene.add(cloud);

    // ---------- 登山道（赤い線）と、山頂の旗 ----------
    const red = new T.MeshBasicMaterial({ color: '#d7332b' });
    const start0 = new T.Vector3(0.2, 0, SZ / 2 - 1.1); start0.y = H(start0.x, start0.z);
    P.slice(0, 13).forEach((p, k) => {
      const pts = []; for (let i = 0; i <= 40; i++) { const u = i / 40, x = start0.x + (p.x - start0.x) * u + Math.sin(u * 9 + k) * 0.28 * (1 - u) * u * 4, z = start0.z + (p.z - start0.z) * u + Math.cos(u * 7 + k) * 0.2 * (1 - u); pts.push(new T.Vector3(x, H(x, z) + 0.03, z)); }
      scene.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 90, 0.014, 5), red));
    });
    const poleM = new T.MeshBasicMaterial({ color: '#2b2a26' }), flagG = new T.BufferGeometry();
    flagG.setAttribute('position', new T.Float32BufferAttribute([0, 0.34, 0, 0.22, 0.27, 0, 0, 0.2, 0], 3));
    P.forEach((p) => {
      const g = new T.Group(); g.position.set(p.x, p.y, p.z);
      const pole = new T.Mesh(new T.CylinderGeometry(0.01, 0.01, 0.36, 5), poleM); pole.position.y = 0.18; g.add(pole);
      const fl = new T.Mesh(flagG, new T.MeshBasicMaterial({ color: p.main ? '#f2c230' : red.color, side: T.DoubleSide })); g.add(fl); p.flag = fl;
      scene.add(g);
      const b = document.createElement(p.main ? 'span' : 'button'); b.className = 'tr-flag' + (p.main ? ' main' : '');
      if (p.main) b.innerHTML = '<b>MT. MAYAMA</b><small>標高 ' + Math.round(p.y * 1000).toLocaleString() + 'm</small>';
      else { b.type = 'button'; b.innerHTML = '<small>No.' + String(p.id).padStart(3, '0') + '</small><b></b>'; b.querySelector('b').textContent = p.title; b.addEventListener('click', () => fly(P.indexOf(p) - 1, () => onPick(p))); }
      labels.appendChild(b); p.el = b;
    });

    // ---------- カメラ（ドローンで空からおりてくる → ゆっくり回る） ----------
    const baseY = () => maxH * (cv.clientWidth < cv.clientHeight ? 0.62 : 0.35), tgt = new T.Vector3(0, baseY(), 0);   // たて長の画面では、山を少し下に
    let yaw = 0.35, pitch = 0.5, dist = 13.5, auto = 1, drag = null, intro = REDUCE ? 1 : 0, flyAnim = null, paused = false, vis = true, last = performance.now(), t0 = -1;
    const place = () => { cam.position.set(tgt.x + Math.sin(yaw) * Math.cos(pitch) * dist, tgt.y + Math.sin(pitch) * dist, tgt.z + Math.cos(yaw) * Math.cos(pitch) * dist); cam.lookAt(tgt); };
    function size() { const w = cv.clientWidth || 1, h = cv.clientHeight || 1; R.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < h ? 48 : 36; cam.updateProjectionMatrix(); }
    new ResizeObserver(size).observe(cv); size();
    cv.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, y: e.clientY, yaw, pitch, mouse: e.pointerType === 'mouse' }; auto = 0; });
    addEventListener('pointermove', (e) => { if (!drag) return; yaw = drag.yaw - (e.clientX - drag.x) * 0.006; if (drag.mouse) pitch = Math.max(0.18, Math.min(1.2, drag.pitch + (e.clientY - drag.y) * 0.004)); });
    addEventListener('pointerup', () => { if (drag) { drag = null; setTimeout(() => { if (!drag && !flyAnim) auto = 1; }, 3500); } });
    addEventListener('pointercancel', () => { drag = null; });
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; }).observe(cv);
    const v = new T.Vector3(), ease = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    function fly(i, cb) {   // その山へ飛んでいく
      const p = P[i + 1]; if (!p) { if (cb) cb(); return; }
      const from = { x: tgt.x, y: tgt.y, z: tgt.z, yaw, pitch, dist }, to = { x: p.x, y: p.y * 0.85, z: p.z, yaw: Math.atan2(p.x - 0.2, p.z + 3) * 0.6 + yaw * 0.4, pitch: 0.42, dist: 3.6 };
      auto = 0; flyAnim = { from, to, t0: performance.now(), d: REDUCE ? 1 : 1100, cb };
    }
    function home() { flyAnim = { from: { x: tgt.x, y: tgt.y, z: tgt.z, yaw, pitch, dist }, to: { x: 0, y: baseY(), z: 0, yaw, pitch: 0.5, dist: 13.5 }, t0: performance.now(), d: REDUCE ? 1 : 1200, cb: () => { auto = 1; } }; }
    function frame(now) {
      requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!vis || paused || document.hidden) return;
      if (intro < 1) { if (t0 < 0) t0 = now; intro = Math.min(1, (now - t0) / 3000); const k = ease(intro); dist = 24 - 10.5 * k; pitch = 1.25 - 0.75 * k; yaw = -0.9 + 1.25 * k; }
      else if (auto && !REDUCE) yaw += dt * 0.05;
      if (flyAnim) {
        const u = Math.min(1, (now - flyAnim.t0) / flyAnim.d), k = ease(u), a = flyAnim.from, b = flyAnim.to;
        tgt.set(a.x + (b.x - a.x) * k, a.y + (b.y - a.y) * k, a.z + (b.z - a.z) * k); yaw = a.yaw + (b.yaw - a.yaw) * k; pitch = a.pitch + (b.pitch - a.pitch) * k; dist = a.dist + (b.dist - a.dist) * k;
        if (u >= 1) { const cb = flyAnim.cb; flyAnim = null; if (cb) cb(); }
      }
      place(); U.uCam.value.copy(cam.position); if (!REDUCE) CU.uT.value = now / 1000;
      P.forEach((p) => { p.flag.rotation.y = Math.sin(now / 600 + p.x) * 0.35; });
      R.render(scene, cam);
      // 旗の名前を、山頂の上に
      const w = cv.clientWidth, h = cv.clientHeight;
      P.forEach((p) => { v.set(p.x, p.y + 0.42, p.z).project(cam); const on = v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05;
        p.el.style.visibility = on ? 'visible' : 'hidden'; if (on) p.el.style.transform = 'translate(' + ((v.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - v.y) / 2 * h).toFixed(1) + 'px) translate(-50%,-100%)'; p.el.style.zIndex = String(1000 - Math.round(v.z * 1000)); });
    }
    place(); requestAnimationFrame(frame);
    cv.parentElement.classList.add('tr-3d');
    return { fly, home, pause: (b) => { paused = b; } };
  }

  window.TR3D = { start };
})();
