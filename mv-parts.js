// mv-parts.js — メインビジュアル（mv.js）の部品。テーマは「山」
// ・山：シールみたいな、ポップな山（水玉・しま・チェックのもよう、とろっとした雪、ふちどりとかげ）・いちばん高い山に旗
// ・シール：風船・熱気球・紙ひこうき・星・流れ星・方位磁石・回るバッジ・道しるべ・バーコード・キラキラ・ジグザグ・くるくる線・テープ・あみ点・プラス・鳥・雲
// （キャンバスで描く方眼・リボン・紙吹雪は mv-fx.js）。形はぜんぶコードで描いています（画像はいりません）
(window.OC_LOADED = window.OC_LOADED || []).push('mv-parts');

window.OC_MV_PARTS = (function () {
  const INK = '#161616';
  let uid = 0;
  const f1 = (v) => v.toFixed(1);
  const svg = (w, h, inner, more) => '<svg viewBox="0 0 ' + w + ' ' + h + '" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"' + (more || '') + '>' + inner + '</svg>';
  const star = (cx, cy, R, r, n = 5) => { let d = ''; for (let i = 0; i < n * 2; i++) { const a = ((-90 + (i * 180) / n) * Math.PI) / 180, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + f1(cx + Math.cos(a) * q) + ' ' + f1(cy + Math.sin(a) * q); } return d + 'Z'; };
  const hash = (s) => { let h = 7; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h; };

  const S = {
    // 星（ふちどり＋白い光）
    star: (c) => svg(100, 100, '<path d="' + star(50, 54, 46, 21) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/><path d="M38 34 L44 22" stroke="#fff" stroke-width="5" stroke-linecap="round"/>'),
    // 流れ星（星と、3本のしっぽ）
    shoot: (c) => svg(200, 110, [26, 44, 62].map((y, i) => { const d = 'M' + (10 + i * 8) + ' ' + (y + 30) + ' Q 90 ' + (y + 6) + ' 150 ' + (y - 6); return '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="13" stroke-linecap="round"/><path d="' + d + '" fill="none" stroke="' + c + '" stroke-width="6" stroke-linecap="round"/>'; }).join('') +
      '<path d="' + star(160, 40, 36, 16) + '" fill="' + c + '" stroke="' + INK + '" stroke-width="6" stroke-linejoin="round"/>'),
    // くるくる線（はしに丸）
    squig: () => svg(160, 60, '<path d="M8 40 C22 10 34 10 44 36 C54 60 66 56 76 30 C86 6 98 8 106 34 C112 50 124 50 132 32" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/><circle cx="146" cy="24" r="8" fill="none" stroke="' + INK + '" stroke-width="5"/>'),
    // アルミの風船（星形か丸。ぴかぴか・ひもつき）
    balloon: (kind, c1, c2) => { const id = 'mvb' + uid++, shape = kind === 'star' ? '<path d="' + star(50, 50, 48, 26) + '" ' : '<ellipse cx="50" cy="48" rx="40" ry="44" ';
      return svg(100, 210, '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="' + c1 + '"/><stop offset=".55" stop-color="' + c2 + '"/><stop offset=".72" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient></defs>' +
        '<path d="M50 96 C46 124 58 146 48 170 C42 186 54 198 50 209" fill="none" stroke="' + INK + '" stroke-width="2.5"/><path d="M44 100 L56 100 L50 90Z" fill="' + c2 + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>' +
        shape + 'fill="url(#' + id + ')" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M26 30 Q30 18 42 18" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".9"/><circle cx="66" cy="28" r="4" fill="#fff" opacity=".8"/>'); },
    // 4つのとげのキラキラ
    sparkle: (c) => svg(100, 100, '<path d="M50 2 C54 36 64 46 98 50 C64 54 54 64 50 98 C46 64 36 54 2 50 C36 46 46 36 50 2Z" fill="' + c + '" stroke="' + INK + '" stroke-width="5" stroke-linejoin="round"/>'),
    // ジグザグ
    zig: () => svg(120, 40, '<path d="M6 30 L24 10 L42 30 L60 10 L78 30 L96 10 L114 30" fill="none" stroke="' + INK + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'),
    // マスキングテープ（しましま・はしがギザギザ）
    tape: (c) => { const id = 'mvt' + uid++, z = (x, s) => [0, 1, 2, 3, 4, 5, 6].map((i) => (x + (i % 2 ? s : 0)) + ' ' + f1(i * 8.3));
      return svg(170, 50, '<defs><pattern id="' + id + '" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="14" height="14" fill="' + c + '"/><rect width="6" height="14" fill="#fff" opacity=".5"/></pattern></defs>' +
        '<path d="M' + z(4, 5).join(' L') + ' L' + z(161, 5).reverse().join(' L') + 'Z" fill="url(#' + id + ')" opacity=".9"/>'); },
    // 方位磁石（針がふらふら）
    compass: (c) => svg(120, 120, '<circle cx="60" cy="60" r="55" fill="#fff" stroke="' + INK + '" stroke-width="5"/><circle class="dr" cx="60" cy="60" r="44" fill="none" stroke="' + INK + '" stroke-width="2" stroke-dasharray="2 6.2"/>' +
      ['N', 'E', 'S', 'W'].map((t, i) => '<text x="' + [60, 98, 60, 22][i] + '" y="' + [27, 65, 103, 65][i] + '" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="15" fill="' + INK + '">' + t + '</text>').join('') +
      '<g class="ndl"><path d="M60 22 L69 60 L51 60Z" fill="' + c + '" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/><path d="M60 98 L69 60 L51 60Z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/></g><circle cx="60" cy="60" r="5" fill="' + INK + '"/>'),
    // まわりに文字の、回るバッジ（まんなかに山）
    badge: (txt, c1, c2) => { const id = 'mvc' + uid++;
      return svg(200, 200, '<defs><path id="' + id + '" d="M100 100 m-74 0 a74 74 0 1 1 148 0 a74 74 0 1 1 -148 0"/></defs><circle cx="100" cy="100" r="96" fill="' + c1 + '" stroke="' + INK + '" stroke-width="5"/>' +
        '<circle cx="100" cy="100" r="56" fill="#fff" stroke="' + INK + '" stroke-width="4"/><text font-family="Oswald, sans-serif" font-weight="600" font-size="19" letter-spacing="4.2" fill="' + INK + '"><textPath href="#' + id + '">' + txt + '</textPath></text>' +
        '<path d="M58 128 L88 76 L102 98 L114 84 L142 128Z" fill="' + c2 + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M80 90 L88 76 L96 89 L90 86Z" fill="#fff"/>'); },
    // 道しるべ（板が、それぞれゆれる）
    sign: (t, c) => svg(220, 230, '<rect x="100" y="14" width="14" height="214" fill="#a07a4f" stroke="' + INK + '" stroke-width="4"/>' + t.map((s, i) => {
        const y = 22 + i * 56, r = i % 2 === 0, d = r ? 'M40 ' + y + ' H188 L208 ' + (y + 20) + ' L188 ' + (y + 40) + ' H40Z' : 'M180 ' + y + ' H32 L12 ' + (y + 20) + ' L32 ' + (y + 40) + ' H180Z';
        return '<g class="bd" style="--i:' + i + ';transform-origin:107px ' + (y + 20) + 'px"><path d="' + d + '" fill="' + c[i % c.length] + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><text x="' + (r ? 118 : 104) + '" y="' + (y + 28) + '" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="20" letter-spacing="2" fill="' + INK + '">' + s + '</text></g>'; }).join('')),
    // バーコードのラベル
    barcode: (txt) => { let h = hash(txt), x = 14, b = '';
      while (x < 182) { h = (h * 1103515245 + 12345) >>> 0; const w = 1.5 + (h % 4) * 1.4; b += '<rect x="' + f1(x) + '" y="12" width="' + f1(w) + '" height="46" fill="' + INK + '"/>'; x += w + 1.5 + ((h >> 4) % 3) * 1.6; }
      return svg(196, 84, '<rect x="2" y="2" width="192" height="80" fill="#fff" stroke="' + INK + '" stroke-width="3"/>' + b + '<text x="98" y="75" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="500" font-size="13" letter-spacing="3" fill="' + INK + '">' + txt + '</text>'); },
    // 鳥（羽ばたきながら、横切る）
    birds: () => svg(300, 120, [[30, 60, 1], [80, 40, 0.8], [118, 74, 0.7], [170, 30, 0.6], [214, 58, 0.5]].map(([x, y, s], i) =>
      '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path class="wing" style="--i:' + i + '" d="M-24 -6 Q-12 -16 0 2 Q12 -16 24 -6" fill="none" stroke="' + INK + '" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></g>').join('')),
    // 紙を切ったような雲
    cloud: () => svg(200, 90, '<path d="M24 76 C4 76 4 50 26 50 C24 26 56 18 70 38 C80 12 124 10 132 40 C150 26 180 36 174 58 C196 60 196 76 176 76Z" fill="#fff" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/>'),
    // 熱気球（しまもよう・かごつき）
    hotair: (c1, c2) => { const id = 'mvh' + uid++, e = 'M50 4 C78 4 96 26 95 50 C94 74 72 90 63 104 H37 C28 90 6 74 5 50 C4 26 22 4 50 4Z';
      return svg(100, 142, '<defs><clipPath id="' + id + '"><path d="' + e + '"/></clipPath></defs><path d="M38 104 L41 123 M62 104 L59 123" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<g clip-path="url(#' + id + ')"><rect width="100" height="110" fill="' + c1 + '"/><ellipse cx="50" cy="50" rx="32" ry="62" fill="' + c2 + '"/><ellipse cx="50" cy="50" rx="12" ry="62" fill="' + c1 + '"/></g>' +
        '<path d="' + e + '" fill="none" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M36 103 H64" stroke="' + INK + '" stroke-width="5" stroke-linecap="round"/>' +
        '<rect x="38" y="121" width="24" height="18" rx="3" fill="#d39352" stroke="' + INK + '" stroke-width="3.5"/><path d="M38 128 H62" stroke="' + INK + '" stroke-width="2"/><path d="M22 30 Q26 17 39 14" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".85"/>'); },
    // あみ点（まん中ほど大きい点）
    halftone: (c) => { let d = ''; for (let y = 6, k = 0; y < 200; y += 13, k++) for (let x = 6 + (k % 2) * 6.5; x < 200; x += 13) { const r = 6.4 * (1 - Math.hypot(x - 100, y - 100) / 100); if (r > 0.7) d += '<circle cx="' + f1(x) + '" cy="' + y + '" r="' + f1(r) + '"/>'; }
      return svg(200, 200, '<g fill="' + c + '">' + d + '</g>'); },
    // 紙ひこうき（点線の、くるんとした跡）
    plane: () => svg(240, 120, '<path class="trail" d="M6 104 C40 108 72 98 86 78 C100 58 82 42 68 54 C54 66 72 88 106 84 C140 80 160 56 184 44" fill="none" stroke="' + INK + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="8 8"/>' +
      '<g transform="translate(204 34) rotate(-24)" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"><path d="M34 0 L-28 -16 L-12 2Z" fill="#fff"/><path d="M34 0 L-12 2 L-22 16Z" fill="#d9d6cc"/></g>'),
    // 入山チケット（切り取り線つき）
    ticket: (t, c) => svg(220, 110, '<path d="M8 8 H150 A9 9 0 0 0 168 8 H212 V102 H168 A9 9 0 0 0 150 102 H8Z" fill="' + c + '" stroke="' + INK + '" stroke-width="4" stroke-linejoin="round"/><path d="M159 22 V90" stroke="' + INK + '" stroke-width="3" stroke-dasharray="5 6"/>' +
      '<path d="M22 84 L40 58 L48 70 L56 62 L70 84Z" fill="#fff" stroke="' + INK + '" stroke-width="3" stroke-linejoin="round"/>' +
      '<g font-family="Oswald, sans-serif" font-weight="600" fill="' + INK + '"><text x="20" y="44" font-size="26" textLength="126" lengthAdjust="spacingAndGlyphs">' + t[0] + '</text><text x="78" y="71" font-size="12" textLength="64" lengthAdjust="spacingAndGlyphs">' + t[1] + '</text><text x="78" y="88" font-size="12" textLength="64" lengthAdjust="spacingAndGlyphs">' + t[2] + '</text>' +
      '<text transform="translate(191 56) rotate(-90)" text-anchor="middle" font-size="15" textLength="66" lengthAdjust="spacingAndGlyphs">' + t[3] + '</text></g>'),
    // プラスの記号
    plus: () => svg(100, 100, '<path d="M30 10 V46 M12 28 H48 M74 50 V78 M60 64 H88 M38 74 V92 M29 83 H47" stroke="' + INK + '" stroke-width="6" stroke-linecap="round"/>'),
    // 立ち絵がまだないときの、仮の人影
    ghost: () => svg(200, 420, '<g fill="#d9d6cc" stroke="' + INK + '" stroke-width="4" stroke-dasharray="10 8" stroke-linejoin="round"><circle cx="100" cy="70" r="46"/><path d="M40 410 L52 200 C56 150 76 130 100 130 C124 130 144 150 148 200 L160 410Z"/></g>' +
      '<text x="100" y="290" text-anchor="middle" font-size="22" font-weight="700" fill="' + INK + '">立ち絵</text><text x="100" y="320" text-anchor="middle" font-size="14" fill="' + INK + '">mv-chara1.png</text>'),
  };

  // ---------- 山（ポップなシール風。画面の大きさに合わせて、毎回つくる） ----------
  // 山ひとつ = かげ＋色＋もよう（水玉・しま・チェック）＋雪＋ふちどり。山ごとに別々に、ぽよんと動きます
  // [横の位置, 頂上の高さ, すその広さ, 色（mv.js の C の名前）, もよう（'dots' 水玉・'stripe' しま・'check' チェック・'' なし）, 雪（1 あり）, 奥行き]。いちばん高い山に、旗が立ちます
  const MT = {
    tall: [[0.04, 0.52, 0.85, 'violet', 'dots', 0, 0.3], [0.92, 0.47, 0.8, 'teal', 'dots', 1, 0.35], [0.33, 0.4, 0.6, 'blue', 'stripe', 1, 0.55],
      [0.08, 0.75, 1.05, 'pink', 'check', 0, 0.8], [0.62, 0.8, 1.15, 'yellow', '', 0, 0.85], [1.02, 0.71, 0.95, 'orange', 'dots', 0, 0.8]],
    wide: [[0.06, 0.5, 1.1, 'violet', 'dots', 0, 0.3], [0.57, 0.53, 1.05, 'teal', 'dots', 1, 0.35], [0.94, 0.44, 1.05, 'pink', 'stripe', 1, 0.35], [0.29, 0.36, 0.95, 'blue', 'stripe', 1, 0.55],
      [0.02, 0.77, 1.35, 'orange', 'check', 0, 0.8], [0.46, 0.81, 1.45, 'yellow', '', 0, 0.85], [0.8, 0.79, 1.3, 'violet', 'check', 0, 0.85]],
  };
  function land(W, H, wide, C, u, label) {
    const list = wide ? MT.wide : MT.tall, top = Math.min(...list.map((m) => m[1])); let summit = [0, 0];
    const html = list.map(([cx, py, sp, ck, pat, snow, lz], i) => {
      const h = H + 10 - py * H, hw = sp * h, w = hw * 2, r = Math.min(hw, h) * 0.07, id = 'mvm' + uid++, main = py === top, c = C[ck] || ck;
      const d = 'M0 ' + f1(h) + 'C' + f1(hw * 0.35) + ' ' + f1(h * 0.9) + ' ' + f1(hw * 0.72) + ' ' + f1(h * 0.32) + ' ' + f1(hw - r) + ' ' + f1(r * 0.9) + 'Q' + f1(hw) + ' ' + f1(-r * 0.3) + ' ' + f1(hw + r) + ' ' + f1(r * 0.9) +
        'C' + f1(w - hw * 0.72) + ' ' + f1(h * 0.32) + ' ' + f1(w - hw * 0.35) + ' ' + f1(h * 0.9) + ' ' + f1(w) + ' ' + f1(h) + 'Z';
      const s = u * (pat === 'check' ? 3.4 : pat === 'dots' ? 2.8 : 2.2);
      const pt = pat === 'dots' ? '<circle cx="' + f1(s / 4) + '" cy="' + f1(s / 4) + '" r="' + f1(s * 0.15) + '"/><circle cx="' + f1(s * 0.75) + '" cy="' + f1(s * 0.75) + '" r="' + f1(s * 0.15) + '"/>'
        : pat === 'check' ? '<rect width="' + f1(s / 2) + '" height="' + f1(s) + '"/><rect width="' + f1(s) + '" height="' + f1(s / 2) + '"/>' : '<rect width="' + f1(s * 0.38) + '" height="' + f1(s) + '"/>';
      let out = '<defs>' + (pat && '<pattern id="' + id + 'p" width="' + f1(s) + '" height="' + f1(s) + '" patternUnits="userSpaceOnUse"' + (pat === 'stripe' ? ' patternTransform="rotate(-35)"' : '') + '><g fill="#fff" opacity="' + (pat === 'check' ? 0.3 : 0.4) + '">' + pt + '</g></pattern>') +
        '<clipPath id="' + id + 'c"><path d="' + d + '"/></clipPath></defs>' +
        '<path d="' + d + '" fill="' + INK + '" transform="translate(' + f1(u * 1.1) + ' ' + f1(u * 0.5) + ')"/><path d="' + d + '" fill="' + c + '"/>' + (pat && '<path d="' + d + '" fill="url(#' + id + 'p)"/>');
      if (snow) {   // 雪：下のはしが、とろっとたれる
        const cy = h * (main ? 0.15 : 0.14), st = Math.max(u * 2.4, hw * 0.08); let sd = 'M-10 -10H' + f1(w + 10) + 'V' + f1(cy);
        for (let x = w + 10, k = 0; x > -10; x -= st, k++) sd += 'Q' + f1(x - st / 2) + ' ' + f1(cy + st * (k % 2 ? 0.4 : 1)) + ' ' + f1(x - st) + ' ' + f1(cy);
        out += '<path clip-path="url(#' + id + 'c)" d="' + sd + 'V-10Z" fill="#fff" stroke="' + INK + '" stroke-width="' + f1(u * 0.45) + '" stroke-linejoin="round"/>';
      }
      out += '<path d="' + d + '" fill="none" stroke="' + INK + '" stroke-width="' + f1(u * 0.5) + '" stroke-linejoin="round"/>';
      let flag = '';
      if (main) {   // 頂上：旗・広がる輪・「SUMMIT …」の線
        summit = [cx * W, py * H + r * 0.3];
        flag = '<svg class="mt-top" width="1" height="1" style="left:' + f1(hw) + 'px;top:' + f1(r * 0.3) + 'px" aria-hidden="true">' +
          '<circle class="sping" r="' + f1(u * 3) + '" fill="none" stroke="' + INK + '" stroke-width="' + f1(u * 0.3) + '"/><circle class="sping s2" r="' + f1(u * 3) + '" fill="none" stroke="' + INK + '" stroke-width="' + f1(u * 0.3) + '"/>' +
          '<path d="M0 0 V' + f1(-u * 8) + '" stroke="' + INK + '" stroke-width="' + f1(u * 0.6) + '"/><path class="flg" d="M0 ' + f1(-u * 8) + ' L' + f1(u * 6) + ' ' + f1(-u * 6.4) + ' L0 ' + f1(-u * 4.8) + 'Z" fill="' + C.flag + '" stroke="' + INK + '" stroke-width="' + f1(u * 0.45) + '" stroke-linejoin="round"/>' +
          '<path class="call" pathLength="1" d="M0 ' + f1(-u * 8.8) + ' V' + f1(-u * 14) + '" fill="none" stroke="' + INK + '" stroke-width="' + f1(u * 0.35) + '"/>' +
          '<text class="calt" x="0" y="' + f1(-u * 15.2) + '" text-anchor="middle" font-family="Oswald, sans-serif" font-weight="600" font-size="' + f1(u * 3.2) + '" letter-spacing="' + f1(u * 0.25) + '" fill="' + INK + '" stroke="#fff" stroke-width="' + f1(u * 0.9) + '" paint-order="stroke">' + label + '</text></svg>';
      }
      const m = 3 * u, pic = svg(f1(w + m * 2), f1(h + m * 2), '<g transform="translate(' + f1(m) + ' ' + f1(m) + ')">' + out + '</g>');   // 山の絵（影がはみ出す分、まわりに余白）
      return '<div class="mt" style="left:' + f1(cx * W - hw) + 'px;top:' + f1(py * H) + 'px;width:' + f1(w) + 'px;height:' + f1(h) + 'px;--lz:' + lz + ';--i:' + i + '"><div class="mt-a"><div class="mt-b">' +
        '<img class="mt-pic" alt="" draggable="false" style="left:-' + f1(m) + 'px;top:-' + f1(m) + 'px;width:' + f1(w + m * 2) + 'px;height:' + f1(h + m * 2) + 'px" src="data:image/svg+xml;charset=utf-8,' + encodeURIComponent(pic) + '">' + flag + '</div></div></div>';
    }).join('');
    return { html, summit };
  }


  // ---------- ねじれるリボンの通り道（mv.js が、キャンバスに描きます） ----------
  // リボン：[表の色（mv.js の C の名前）, 裏の色, 太さ, ねじれの数, スマホの通り道, パソコンの通り道]（通り道は、画面の横・縦を 0〜1 で）
  const RIB = [
    ['teal', 'violet', 2.6, 3, [[-0.12, 0.17], [0.04, 0.13], [0.15, 0.06], [0.23, 0.12], [0.17, 0.18], [0.1, 0.12], [0.16, 0.03], [0.28, -0.04], [0.42, -0.1]], [[-0.06, 0.2], [0.04, 0.13], [0.1, 0.05], [0.16, 0.11], [0.12, 0.17], [0.07, 0.11], [0.11, 0.02], [0.2, -0.04], [0.3, -0.1]]],
    ['orange', 'yellow', 2.8, 3, [[1.12, 0.54], [0.98, 0.62], [0.9, 0.71], [0.95, 0.79], [1.02, 0.75], [0.98, 0.68], [0.89, 0.76], [0.84, 0.88], [0.82, 1.1]], [[1.06, 0.46], [0.97, 0.56], [0.92, 0.68], [0.96, 0.77], [1.0, 0.72], [0.97, 0.65], [0.9, 0.74], [0.87, 0.88], [0.86, 1.1]]],
    ['pink', 'violet', 2, 2, [[0.66, -0.07], [0.8, 0.0], [0.92, 0.035], [0.975, 0.0], [0.95, -0.02], [0.925, 0.025], [0.97, 0.085], [1.12, 0.11]], [[0.84, -0.1], [0.9, 0.0], [0.95, 0.06], [0.985, 0.03], [0.97, -0.01], [0.95, 0.04], [0.98, 0.11], [1.08, 0.16]]],
    ['blue', 'teal', 2, 2, [[-0.12, 0.64], [0.03, 0.59], [0.12, 0.64], [0.07, 0.7], [0.01, 0.65], [0.09, 0.56], [0.22, 0.52]], [[-0.06, 0.6], [0.03, 0.54], [0.09, 0.6], [0.05, 0.66], [0.01, 0.6], [0.07, 0.51], [0.17, 0.47]]],
  ];

  return { S, land, INK, RIB };
})();
