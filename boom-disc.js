// boom-disc.js — サウンドトラックの見出しの、大きな 3D レコード（厚みと、つやのある黒い盤）
// ・ページを開くと、画面のはしからころがって来て、パタンと倒れて、くるくる回りつづけます
// ・スクロールすると、見る角度が変わります。パソコンでは、マウスのほうへ少しかたむきます
// ・レコードをタップすると、キュキュッとスクラッチ。再生中は速く回って、リズムにあわせてはずみます
// ・B面にすると、ラベルが青い「SIDE B」に変わります
// ・3D が使えない端末では、かわりに平たいレコードの絵が出ます（boom-fx.css）
(window.OC_LOADED = window.OC_LOADED || []).push('boom-disc');

(function () {
  // ===== 変えてもいいところ =====
  const SIZE = 1;     // レコードの大きさ（1 がふつう。1.2 で大きく）
  const THICK = 1;    // 厚み（1 がふつう。2 で倍の厚さ）
  const SPIN = 1;     // 回る速さ（1 がふつう。0 で止まる）
  const BPM = 96;     // 再生中にはずむ速さ（boom3d.js と同じ）
  // ============================
  const art = document.querySelector('.bx-art'), cv = art && art.querySelector('.bx-cv');
  if (!art || !cv) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches, PC = matchMedia('(min-width: 900px)');
  const fail = (e) => { console.warn('[disc] 3D なし', e); art.classList.add('bx-flat'); };
  import('three').then(build).catch(fail);

  function build(T) {
    let R; try { R = new T.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { return fail(e); }
    R.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
    const scene = new T.Scene(), cam = new T.PerspectiveCamera(34, 1, 0.5, 60); cam.position.z = 10;
    const root = document.documentElement, css = (n, d) => getComputedStyle(root).getPropertyValue(n).trim() || d;
    const col = (h) => new T.Color(h).convertLinearToSRGB();   // シェーダーには、CSS と同じ色の数字をそのまま渡す

    // ---------- 盤の面の絵（みぞ・ラベル・文字） ----------
    const N = 1024, h = N / 2, pc = document.createElement('canvas'); pc.width = pc.height = N; const x = pc.getContext('2d');
    const tex = new T.CanvasTexture(pc); tex.anisotropy = 8;
    const ring = (r, w, c) => { x.beginPath(); x.arc(0, 0, r, 0, 7); x.lineWidth = w; x.strokeStyle = c; x.stroke(); };
    const dot = (r, c) => { x.beginPath(); x.arc(0, 0, r, 0, 7); x.fillStyle = c; x.fill(); };
    let isB = null;
    function paint() {
      isB = root.classList.contains('bx-b');
      const bg = css('--bx-bg', '#ff8a00'), ink = css('--bx-ink', '#111'), paper = css('--bx-paper', '#f7f4ec'), big = css('--bx-big', 'Anton'), mono = css('--bx-mono', 'monospace');
      x.setTransform(1, 0, 0, 1, h, h); x.clearRect(-h, -h, N, N);
      dot(h * 0.996, '#151515');
      for (let r = h * 0.36; r < h * 0.955; r += 3.1) ring(r, 1.3, '#232323');   // 細いみぞ
      [0.47, 0.6, 0.72, 0.85].forEach((k) => ring(h * k, 6, '#0b0b0b'));         // 曲と曲のあいだ
      ring(h * 0.97, h * 0.03, '#121212'); ring(h * 0.988, h * 0.016, paper);       // ふちの光る線（厚みとの境目）
      dot(h * 0.33, bg); ring(h * 0.33, 7, ink); ring(h * 0.3, 2.5, ink);          // ラベル
      x.fillStyle = ink; x.textAlign = 'center'; x.textBaseline = 'middle';
      const txt = 'MAYAMA RECORDS ✦ STEREO ✦ 33⅓ RPM ✦ OC ARCHIVE ✦ '; x.font = '700 21px ' + mono;
      const ws = [...txt].map((c) => x.measureText(c).width), tot = ws.reduce((a, b) => a + b, 0); let a = -Math.PI / 2;
      [...txt].forEach((c, i) => { const da = (ws[i] / tot) * Math.PI * 2; x.save(); x.rotate(a + da / 2 + Math.PI / 2); x.fillText(c, 0, -h * 0.262); x.restore(); a += da; });
      x.font = '400 ' + Math.round(h * 0.135) + 'px ' + big; x.fillText('MAYAMA', 0, -h * 0.04);
      x.font = '700 25px ' + mono; if ('letterSpacing' in x) x.letterSpacing = '6px'; x.fillText(isB ? 'SIDE B' : 'SIDE A', 3, h * 0.085); if ('letterSpacing' in x) x.letterSpacing = '0px';
      x.font = '400 26px ' + big; x.fillText('✦', 0, -h * 0.165);
      dot(h * 0.026, paper); ring(h * 0.026, 3, ink);   // まん中の穴
      tex.needsUpdate = true;
      if (U) { U.paper.value.copy(col(paper)); U.ink.value.copy(col(ink)); shadowM.color.set(css('--bx-deep', '#d86a00')); }
    }

    // ---------- 形：上の面（つやはシェーダーで）・横の厚み・下の面・うしろの影 ----------
    const U = { map: { value: tex }, rot: { value: 0 }, sh: { value: 2.3 }, gl: { value: 1 }, paper: { value: new T.Color() }, ink: { value: new T.Color() } };
    const TH = 0.085 * THICK, disc = new T.Group(), tilt = new T.Group(), pv = new T.Group(); tilt.add(disc); pv.add(tilt); scene.add(pv);
    const top = new T.Mesh(new T.CircleGeometry(1, 160), new T.ShaderMaterial({ uniforms: U,
      vertexShader: 'varying vec2 vP; void main() { vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform sampler2D map; uniform float rot, sh, gl; uniform vec3 paper; varying vec2 vP;
        void main() {
          float c = cos(rot), s = sin(rot), r = length(vP);
          vec4 o = texture2D(map, vec2(c * vP.x - s * vP.y, s * vP.x + c * vP.y) * 0.5 + 0.5);
          float k = cos(atan(vP.y, vP.x) - sh), w = abs(k);   // 中心をとおる、ちょうネクタイ形の光（盤が回っても、光は同じ場所）
          float g = smoothstep(0.962, 0.97, w) * 0.62 + smoothstep(0.855, 0.865, w) * 0.17 + smoothstep(0.996, 0.998, w) * 0.2;
          g *= (k > 0.0 ? 1.0 : 0.62) * step(0.345, r) * step(r, 0.955) * gl;
          gl_FragColor = vec4(mix(o.rgb, paper, g), 1.0);
        }` }));
    top.rotation.x = -Math.PI / 2; top.position.y = TH / 2; disc.add(top);
    const side = new T.Mesh(new T.CylinderGeometry(1, 1, TH, 160, 1, true), new T.ShaderMaterial({ uniforms: U,
      vertexShader: 'varying vec2 vU; void main() { vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `uniform vec3 paper, ink; varying vec2 vU;
        void main() {
          float u = vU.x, d = min(abs(u - 0.91), abs(u - 1.91));   // 手前の左がわに、たての光
          float g = step(d, 0.03) * 0.8 + step(abs(d - 0.052), 0.006) * 0.45 + step(vU.y, 0.1) * 0.25;
          gl_FragColor = vec4(mix(ink * 0.9, paper, g), 1.0);
        }` }));
    disc.add(side);
    const bot = new T.Mesh(new T.CircleGeometry(1, 96), new T.MeshBasicMaterial({ color: '#141414' })); bot.rotation.x = Math.PI / 2; bot.position.y = -TH / 2; disc.add(bot);
    const shadowM = new T.MeshBasicMaterial({ color: '#d86a00' }), shadow = new T.Mesh(new T.CircleGeometry(1, 96), shadowM);
    shadow.rotation.x = -Math.PI / 2; shadow.position.set(0.08, -0.3, 0.12); tilt.add(shadow);   // 盤の少し下・右下に、こい色の影
    paint(); if (document.fonts) { document.fonts.ready.then(paint); ['400 60px Anton', '700 20px "Space Mono"'].forEach((f) => document.fonts.load(f).then(paint, () => {})); }

    // ---------- 置き場所（画面の大きさから決める） ----------
    let cw = 1, ch = 1, Rw = 1, X0 = 0, Y0 = 0, XO = 0;
    // x：横の位置（0 が左はし、1 が右はし）、y：見出しの上からの位置（px）、r：半径（px）、tl：倒れぐあい、rl・yw：ななめの向き
    const pose = () => (PC.matches ? { x: 0.5, y: 170, r: Math.min(cw * 0.47, 270), tl: 0.9, rl: -0.3, yw: 0.16, fov: 52 } : { x: 0.6, y: 175, r: Math.min(cw * 0.7, 420), tl: 0.9, rl: -0.3, yw: 0.16, fov: 52 });
    let P = pose();
    function place() {
      cw = cv.clientWidth || 1; ch = cv.clientHeight || 1; P = pose(); R.setSize(cw, ch, false); cam.aspect = cw / ch; cam.fov = P.fov; cam.position.z = 4.2 / Math.tan((P.fov * Math.PI) / 360); cam.updateProjectionMatrix();
      const upp = (2 * cam.position.z * Math.tan((cam.fov * Math.PI) / 360)) / ch;
      const ox = cv.offsetLeft, oy = cv.offsetTop;   // canvas は見出しより少し大きい
      Rw = P.r * SIZE * upp; X0 = (cw * P.x - cw / 2) * upp; Y0 = -(P.y - oy - ch / 2) * upp; XO = X0 + (cw * (1 - P.x) + P.r * SIZE * 1.3) * upp;
      pv.scale.setScalar(Rw);
      art.style.setProperty('--cx', Math.round(cw * P.x + ox) + 'px'); art.style.setProperty('--cy', Math.round(P.y) + 'px'); art.style.setProperty('--r', Math.round(P.r * SIZE) + 'px');
    }
    new ResizeObserver(place).observe(cv); PC.addEventListener && PC.addEventListener('change', place); place();

    // ---------- さわる・スクロール・マウス ----------
    const ray = new T.Raycaster(), m2 = new T.Vector2();
    const onDisc = (e) => { const b = cv.getBoundingClientRect(); m2.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1); ray.setFromCamera(m2, cam); return ray.intersectObjects([top, side]).length > 0; };
    let hit = -9, mx = 0, my = 0, tx = 0, ty = 0;
    cv.addEventListener('click', (e) => { if (onDisc(e)) hit = now(); });
    cv.addEventListener('contextmenu', (e) => e.preventDefault());
    addEventListener('pointermove', (e) => { if (e.pointerType !== 'mouse') return; tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; cv.style.cursor = onDisc(e) ? 'pointer' : ''; }, { passive: true });
    const head = art.parentElement;
    let vis = true; new IntersectionObserver((en) => { vis = en[0].isIntersecting; }).observe(cv);

    // ---------- 動き ----------
    const now = () => performance.now() / 1000, ease = (u) => 1 - Math.pow(1 - u, 3), back = (u) => 1 + 2.7 * Math.pow(u - 1, 3) + 1.7 * Math.pow(u - 1, 2);
    const mixA = (a, b, u) => a + (b - a) * u, clamp = (v) => Math.max(0, Math.min(1, v));
    const SCR = [[0, 0], [0.22, -1.1], [0.5, 0.42], [0.76, -0.14], [1, 0]];   // スクラッチ（タップから 0.6 秒の、回転のずれ）
    const scr = (u) => { for (let i = 1; i < SCR.length; i++) if (u <= SCR[i][0]) { const [a, va] = SCR[i - 1], [b, vb] = SCR[i], k = (u - a) / (b - a); return va + (vb - va) * (0.5 - Math.cos(k * Math.PI) / 2); } return 0; };
    let t0 = -1, last = now(), ang = 0, spd = 0, pl = 0, started = false;
    function frame() {
      requestAnimationFrame(frame);
      const t = now(), dt = Math.min(0.05, t - last); last = t;
      if (!vis || document.hidden) return;
      if (t0 < 0) { if (root.classList.contains('bx-wait')) return; t0 = t + 0.15; }
      if (root.classList.contains('bx-b') !== isB) paint();
      const e = REDUCE ? 9 : t - t0, playing = document.body.classList.contains('bx-playing');
      pl += ((playing ? 1 : 0) - pl) * Math.min(1, dt * 3);
      const k = clamp(-head.getBoundingClientRect().top / 520);   // スクロールした分
      mx += (tx - mx) * Math.min(1, dt * 3); my += (ty - my) * Math.min(1, dt * 3);
      const wob = REDUCE ? 0 : 1, sp = SPIN * (2.6 + 2.4 * pl) * wob;
      let x0 = X0, tl = P.tl + 0.05 * Math.sin(t * 0.7) * wob + k * 0.42 + my * 0.12, rl = P.rl + 0.035 * Math.sin(t * 0.5) * wob - k * 0.18, yw = P.yw + mx * 0.22, y0 = Y0 + Rw * (0.04 * Math.sin(t * 1.1) * wob - k * 0.25);
      if (e < 0) { pv.visible = false; } else {
        pv.visible = true;
        if (e < 0.95) {   // ① 画面の右はしから、立ったまま、ころがって来る
          const u = ease(e / 0.95); x0 = mixA(XO, X0, u); ang = (x0 - X0) / Rw; tl = Math.PI / 2; rl = 0; yw = 0; spd = 0;
        } else if (e < 1.85) {   // ② パタンと倒れて（少しはねて）、回りはじめる
          const u = clamp((e - 0.95) / 0.9), b = back(u); tl = mixA(Math.PI / 2, tl, b); rl = mixA(0, rl, b); yw = mixA(0, yw, b); y0 += Rw * 0.22 * Math.sin(Math.PI * Math.min(1, u * 1.6)) * (1 - u);
          spd += (sp - spd) * Math.min(1, dt * 2.2); ang += spd * dt;   // レコードは時計まわり
        } else { spd += (sp - spd) * Math.min(1, dt * 2.2); ang += spd * dt; }
        if (!started && e > 1.85) { started = true; art.classList.add('bx-spun'); }
      }
      const hu = (t - hit) / 0.6, hs = hu >= 0 && hu < 1 ? scr(hu) : 0;   // タップ：キュキュッ
      const beat = Math.pow(Math.max(0, Math.cos(t * Math.PI * 2 * (BPM / 60))), 6) * pl * wob;
      U.rot.value = ang + hs; U.sh.value = 2.25 + yw * 0.9 - rl * 0.6 + (tl - P.tl) * 0.8;   // 角度が変わると、光の位置も少し動く
      pv.position.set(x0, y0, 0); pv.rotation.set(0, yw, rl); tilt.rotation.x = tl - (hu >= 0 && hu < 1 ? Math.sin(Math.PI * hu) * 0.07 : 0);
      pv.scale.setScalar(Rw * (1 + beat * 0.035));
      R.render(scene, cam);
    }
    art.classList.add('bx-3d'); requestAnimationFrame(frame);
  }
})();
