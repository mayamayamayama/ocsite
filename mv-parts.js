// mv-parts.js — メインビジュアル（mv.js）の部品
// ・シール：星・キラキラ・流れ星・ハートの風船・ギンガムのリボン・ジグザグ・くるくる線・大きなリボンの帯
// ・キャンバス：うしろのゆがんだ方眼、紙吹雪
// 形はぜんぶコードで描いています（画像はいりません）
(window.OC_LOADED = window.OC_LOADED || []).push('mv-parts');

window.OC_MV_PARTS = (function () {
  const INK = '#1d1b1b';
  let uid = 0;
  const svg = (w, h, inner) => '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  const starPath = (cx, cy, R, r, n = 5, rot = -90) => {
    let d = '';
    for (let i = 0; i < n * 2; i++) { const a = ((rot + (i * 180) / n) * Math.PI) / 180, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + Math.cos(a) * q).toFixed(1) + ' ' + (cy + Math.sin(a) * q).toFixed(1); }
    return d + 'Z';
  };
  const HEART = 'M50 88 C20 66 4 48 8 28 C12 10 34 6 50 24 C66 6 88 10 92 28 C96 48 80 66 50 88Z';

  const S = {
    // 星（ふちどり＋白い光）
    star: (c) => svg(100, 100, '<path d="' + starPath(50, 54, 46, 21) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>' +
      '<path d="M38 34 L44 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'),
    // 4つのとげのキラキラ
    sparkle: (c) => svg(100, 100, '<path d="M50 2 C54 36 64 46 98 50 C64 54 54 64 50 98 C46 64 36 54 2 50 C36 46 46 36 50 2Z" fill="' + c + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'),
    // 流れ星（星と、3本のしっぽ）
    shoot: (c) => svg(200, 110, [26, 44, 62].map((y, i) => '<path d="M' + (10 + i * 8) + ' ' + (y + 30) + ' Q 90 ' + (y + 6) + ' 150 ' + (y - 6) + '" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="M' + (10 + i * 8) + ' ' + (y + 30) + ' Q 90 ' + (y + 6) + ' 150 ' + (y - 6) + '" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>').join('') +
      '<path d="' + starPath(160, 40, 36, 16) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>'),
    // ハートの風船（つやつや・ひもつき）
    balloon: (c1, c2) => { const id = 'mvb' + uid++;
      return svg(100, 200, '<defs><radialGradient id="' + id + '" cx="35%" cy="30%" r="80%"><stop offset="0" stop-color="#fff"/><stop offset=".22" stop-color="' + c1 + '"/><stop offset=".75" stop-color="' + c2 + '"/><stop offset="1" stop-color="' + INK + '"/></radialGradient></defs>' +
        '<path d="M50 92 C48 120 56 140 48 165 C42 182 52 192 50 199" fill="none" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M44 96 L56 96 L50 86Z" fill="' + c2 + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<path d="' + HEART + '" fill="url(#' + id + ')" stroke="' + INK + '" stroke-width="3"/>' +
        '<path d="M22 30 Q26 18 38 20" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/><ellipse cx="72" cy="30" rx="6" ry="4" fill="#fff" opacity=".6"/>'); },
    // ギンガムチェックのリボン（ちょうちょ結び）
    bow: (c1, c2) => { const id = 'mvg' + uid++;
      const pat = '<pattern id="' + id + '" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(8)"><rect width="16" height="16" fill="#fff"/><rect width="8" height="16" fill="' + c1 + '" opacity=".55"/><rect width="16" height="8" fill="' + c1 + '" opacity=".55"/><rect width="8" height="8" fill="' + c2 + '" opacity=".35"/></pattern>';
      const o = 'stroke="' + INK + '" stroke-width="4" stroke-linejoin="round" fill="url(#' + id + ')"';
      return svg(200, 130, '<defs>' + pat + '</defs><path d="M90 66 L60 120 L80 112 L88 128 L100 72Z" ' + o + '/><path d="M110 66 L140 120 L120 112 L112 128 L100 72Z" ' + o + '/>' +
        '<path d="M92 60 C60 20 14 8 10 40 C6 76 52 86 92 72Z" ' + o + '/><path d="M108 60 C140 20 186 8 190 40 C194 76 148 86 108 72Z" ' + o + '/>' +
        '<rect x="86" y="50" width="28" height="30" rx="10" ' + o + '/>'); },
    // ギンガムチェックのハート（ぺたっと平たい）
    gheart: (c1, c2) => { const id = 'mvh' + uid++;
      return svg(100, 96, '<defs><pattern id="' + id + '" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)"><rect width="14" height="14" fill="#fff"/><rect width="7" height="14" fill="' + c1 + '" opacity=".6"/><rect width="14" height="7" fill="' + c1 + '" opacity=".6"/><rect width="7" height="7" fill="' + c2 + '" opacity=".4"/></pattern></defs>' +
        '<path d="' + HEART + '" fill="url(#' + id + ')" stroke="' + INK + '" stroke-width="4"/>'); },
    // ジグザグ
    zig: () => svg(120, 40, '<path d="M6 30 L24 10 L42 30 L60 10 L78 30 L96 10 L114 30" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'),
    // くるくる線（はしに丸）
    squig: () => svg(160, 60, '<path d="M8 40 C22 10 34 10 44 36 C54 60 66 56 76 30 C86 6 98 8 106 34 C112 50 124 50 132 32" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="146" cy="24" r="8" fill="none" stroke="' + INK + '" stroke-width="5"/>'),
    // 大きなリボンの帯（表と裏の2色。pathLength=1 で、描いていくアニメーションに使う）
    ribbon: (cA, cB, d) => svg(400, 400, '<path class="rb" d="' + d + '" pathLength="1" fill="none" stroke="' + cB + '" stroke-width="40" stroke-linecap="round" transform="translate(9 10)"/>' +
      '<path class="rb" d="' + d + '" pathLength="1" fill="none" stroke="' + cA + '" stroke-width="34" stroke-linecap="round"/>' +
      '<path class="rb" d="' + d + '" pathLength="1" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".45" transform="translate(-8 -7)"/>'),
    // くるくる回る、まるいバッジ（まわりに文字）
    badge: (txt, c1, c2) => { const id = 'mvc' + uid++;
      return svg(200, 200, '<defs><path id="' + id + '" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs><circle cx="100" cy="100" r="96" fill="' + c1 + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="100" cy="100" r="56" fill="#fff" stroke="' + INK + '" stroke-width="4"/><text font-family="Oswald, sans-serif" font-weight="600" font-size="19" letter-spacing="4.2" fill="' + INK + '"><textPath href="#' + id + '">' + txt + '</textPath></text>' +
        '<path d="' + starPath(100, 102, 40, 17) + '" fill="' + c2 + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>'); },
    // マスキングテープ（しましま・はしがギザギザ）
    tape: (c) => { const id = 'mvt' + uid++, z = (x) => [0, 1, 2, 3, 4, 5, 6].map((i) => (x + (i % 2 ? 5 : 0)) + ' ' + (i * 8.3)).join(' L');
      return svg(170, 50, '<defs><pattern id="' + id + '" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="' + c + '"/><rect width="6" height="14" fill="#fff" opacity=".55"/></pattern></defs>' +
        '<path d="M' + z(4) + ' L' + [6, 5, 4, 3, 2, 1, 0].map((i) => (161 + (i % 2 ? 5 : 0)) + ' ' + (i * 8.3)).join(' L') + 'Z" fill="url(#' + id + ')" opacity=".88"/>'); },
    // ギザギザのふきだし（まんなかに文字）
    burst: (txt, c1) => { let d = ''; for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2, r = i % 2 ? 76 : 96; d += (i ? 'L' : 'M') + (100 + Math.cos(a) * r).toFixed(1) + ' ' + (100 + Math.sin(a) * r * 0.86).toFixed(1); }
      return svg(200, 180, '<path d="' + d + 'Z" fill="' + c1 + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round" transform="translate(0 -6)"/>' +
        '<text x="100" y="112" text-anchor="middle" font-family="Lilita One, sans-serif" font-size="58" fill="#fff" stroke="' + INK + '" stroke-width="7" paint-order="stroke" stroke-linejoin="round">' + txt + '</text>'); },
    // 立ち絵がまだないときの、仮の人影
    ghost: () => svg(200, 420, '<g fill="#d9d8d3" stroke="' + INK + '" stroke-width="4" stroke-dasharray="10 8" stroke-linejoin="round"><circle cx="100" cy="70" r="46"/><path d="M40 410 L52 200 C56 150 76 130 100 130 C124 130 144 150 148 200 L160 410Z"/></g>' +
      '<text x="100" y="290" text-anchor="middle" font-size="22" font-weight="700" fill="' + INK + '">立ち絵</text><text x="100" y="320" text-anchor="middle" font-size="15" fill="' + INK + '">mv-chara.png</text>'),
  };
  // リボンの帯の形（いくつか）
  const RIBBON = [
    'M-20 120 C60 40 140 20 150 90 C160 160 70 170 90 110 C110 50 230 60 280 120 C330 180 380 160 420 120',
    'M-20 300 C80 330 120 220 60 200 C0 180 40 300 140 300 C240 300 260 180 340 200 C400 214 410 260 430 280',
  ];

  // ---------- うしろの、ゆがんだ方眼（ゆっくり、ゆらゆら。指やマウスの近くがふくらむ） ----------
  function grid(cv, col) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1;
    function size() { const r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 1.5); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
    function draw(t, px, py, pw) {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      const cell = Math.max(22, Math.min(W, H) / 16), A = cell * 0.22, R = Math.min(W, H) * 0.28;
      const warp = (x, y) => {
        let dx = A * Math.sin(y * 0.011 + t * 0.7) + A * 0.6 * Math.sin((x + y) * 0.007 - t * 0.45);
        let dy = A * Math.sin(x * 0.012 - t * 0.6) + A * 0.6 * Math.cos((x - y) * 0.006 + t * 0.5);
        if (pw > 0.01) { const ex = x - px, ey = y - py, d = Math.hypot(ex, ey), k = Math.max(0, 1 - d / R); if (k > 0) { const f = k * k * cell * 1.4 * pw / (d + 1); dx += ex * f; dy += ey * f; } }
        return [x + dx, y + dy];
      };
      ctx.strokeStyle = col; ctx.lineWidth = 1; ctx.beginPath();
      const step = cell / 2;
      for (let x = -cell; x <= W + cell; x += cell) { for (let y = -cell, k = 0; y <= H + cell; y += step, k++) { const p = warp(x, y); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } }
      for (let y = -cell; y <= H + cell; y += cell) { for (let x = -cell, k = 0; x <= W + cell; x += step, k++) { const p = warp(x, y); k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); } }
      ctx.stroke();
    }
    return { size, draw };
  }

  // ---------- 紙吹雪（ふわふわ落ちる。タップすると、そこからはじける） ----------
  function confetti(cv, cols) {
    const ctx = cv.getContext('2d'); let W = 0, H = 0, dpr = 1; const P = [];
    const make = (x, y, burst) => { const a = Math.random() * Math.PI * 2, v = burst ? 3 + Math.random() * 6 : 0;
      return { x, y, vx: burst ? Math.cos(a) * v : (Math.random() - 0.5) * 0.3, vy: burst ? Math.sin(a) * v - 3 : 0.35 + Math.random() * 0.5, r: Math.random() * 6.3, vr: (Math.random() - 0.5) * 0.15,
        w: 4 + Math.random() * 6, h: 3 + Math.random() * 4, c: cols[(Math.random() * cols.length) | 0], s: Math.random() < 0.3 ? 1 : 0, ph: Math.random() * 6.3, life: burst ? 1 : -1 }; };
    function size() { const r = cv.getBoundingClientRect(); dpr = Math.min(window.devicePixelRatio || 1, 2); W = r.width; H = r.height; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
      const n = Math.round((W * H) / 26000); while (P.filter((p) => p.life < 0).length < n) P.push(make(Math.random() * W, Math.random() * H, false)); }
    function burst(x, y, n = 26) { for (let i = 0; i < n; i++) P.push(make(x, y, true)); }
    function draw(t, dt) {
      if (!W) return;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
      for (let i = P.length - 1; i >= 0; i--) {
        const p = P[i];
        if (p.life >= 0) { p.vy += 0.18 * dt; p.vx *= 0.985; p.vy *= 0.985; p.life -= 0.012 * dt; if (p.life <= 0 || p.y > H + 20) { P.splice(i, 1); continue; } }
        p.x += (p.vx + (p.life < 0 ? Math.sin(t * 1.3 + p.ph) * 0.35 : 0)) * dt; p.y += p.vy * dt; p.r += p.vr * dt;
        if (p.life < 0 && p.y > H + 10) { p.y = -10; p.x = Math.random() * W; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(1, Math.cos(t * 3 + p.ph)); ctx.globalAlpha = p.life >= 0 ? Math.min(1, p.life * 2) : 0.9; ctx.fillStyle = p.c;
        if (p.s) { ctx.beginPath(); ctx.moveTo(0, -p.w / 2); ctx.lineTo(p.w / 2, p.w / 2); ctx.lineTo(-p.w / 2, p.w / 2); ctx.fill(); } else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
    }
    return { size, draw, burst };
  }

  return { S, RIBBON, grid, confetti, INK };
})();
