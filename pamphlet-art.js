// pamphlet-art.js — ガイドライン（入山のしおり）の絵：表紙の山と、登山鉄道の路線図
// ・表紙の山は、線がひとりでに描かれていって、あとから色がのります（リソグラフ印刷みたいに、色が少しずれています）
// ・空の色は、見ている時間で変わります（朝焼け・快晴・夕焼け・星空）
// ・路線図の駅は、メニュー（nav.js）の行き先と同じ。駅をタップすると、電車でそのページへ
(window.OC_LOADED = window.OC_LOADED || []).push('pamphlet-art');

(function () {
  const NS = 'http://www.w3.org/2000/svg';
  const C = { paper: '#ebe5cf', ink: '#26407a', red: '#e2412e', grn: '#138467', yel: '#f4bf17' };
  const SKY = {   // 時間ごとの空：[上の色, 下の色, 天気の名前]
    dawn: ['#f3b19b', '#f7dc84', '朝焼け'], day: ['#8fcfd2', '#dcefe6', '快晴'], dusk: ['#e2412e', '#f4bf17', '夕焼け'], night: ['#16244d', '#34508f', '星空'],
  };
  function el(tag, at, parent) {
    const e = document.createElementNS(NS, tag);
    for (const k in at) if (at[k] != null) e.setAttribute(k, at[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  // 線で描く（pathLength=1 にして、CSS の pa-line で、はしから描いていく）。d は描きはじめる秒
  const line = (g, tag, at, d, cls) => el(tag, Object.assign({ pathLength: 1, class: 'pa-line ' + (cls || ''), style: '--d:' + d + 's' }, at), g);
  const fill = (g, tag, at, d, cls) => el(tag, Object.assign({ class: 'pa-fill ' + (cls || ''), style: '--d:' + d + 's' }, at), g);

  // 網点（あみてん）の模様
  function dots(defs, id, color, size, r) {
    const p = el('pattern', { id, width: size, height: size, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(15)' }, defs);
    el('circle', { cx: size / 2, cy: size / 2, r, fill: color }, p);
  }

  // ---------- 表紙の山 ----------
  function cover(svg, tod) {
    const sky = SKY[tod] || SKY.day, night = tod === 'night';
    svg.textContent = '';
    const defs = el('defs', {}, svg);
    const gr = el('linearGradient', { id: 'pa-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': sky[0] }, gr); el('stop', { offset: 1, 'stop-color': sky[1] }, gr);
    dots(defs, 'pa-dg', C.grn, 4.2, 1.35); dots(defs, 'pa-dk', C.ink, 3.4, 1.15); dots(defs, 'pa-dy', C.yel, 4, 1.5);
    const ink = night ? C.paper : C.ink;   // 夜は、空の線を白で

    fill(svg, 'rect', { x: 0, y: 0, width: 400, height: 300, fill: 'url(#pa-sky)' }, 0, 'pa-sky');
    const sk = el('g', { class: 'pa-skyart' }, svg);
    if (night) {   // 星と月
      for (let i = 0; i < 34; i++) { const x = (i * 97) % 390 + 5, y = (i * 53) % 150 + 6; fill(sk, 'circle', { cx: x, cy: y, r: i % 5 ? 0.9 : 1.6, fill: C.paper }, 0.3 + (i % 7) * 0.12, 'pa-star'); }
      fill(sk, 'path', { d: 'M318 34a26 26 0 1 0 22 40a21 21 0 1 1-22-40z', fill: C.yel }, 1.2);
      line(sk, 'path', { d: 'M318 34a26 26 0 1 0 22 40a21 21 0 1 1-22-40z', fill: 'none', stroke: ink, 'stroke-width': 2 }, 0.4);
    } else {
      const sun = tod === 'dawn' ? [325, 150, 30] : tod === 'dusk' ? [86, 138, 32] : [312, 66, 25];
      fill(sk, 'circle', { cx: sun[0], cy: sun[1], r: sun[2], fill: tod === 'dusk' ? C.red : C.yel }, 1.2, 'pa-mul');
      fill(sk, 'circle', { cx: sun[0] + 3, cy: sun[1] + 2, r: sun[2], fill: 'url(#pa-dy)' }, 1.4, 'pa-mul');
      line(sk, 'circle', { cx: sun[0], cy: sun[1], r: sun[2], fill: 'none', stroke: ink, 'stroke-width': 2 }, 0.3);
      for (let i = 0; i < 12; i++) {   // 光の線
        const a = (i / 12) * Math.PI * 2, r0 = sun[2] + 7, r1 = sun[2] + (i % 2 ? 14 : 20);
        line(sk, 'line', { x1: sun[0] + Math.cos(a) * r0, y1: sun[1] + Math.sin(a) * r0, x2: sun[0] + Math.cos(a) * r1, y2: sun[1] + Math.sin(a) * r1, stroke: ink, 'stroke-width': 2, 'stroke-linecap': 'round' }, 0.6 + i * 0.03);
      }
      [[60, 52], [86, 44], [104, 58]].forEach(([x, y], i) => line(sk, 'path', { d: `M${x - 7} ${y - 3}q4 0 7 5q3-5 7-5`, fill: 'none', stroke: ink, 'stroke-width': 1.8, 'stroke-linecap': 'round' }, 1 + i * 0.1));   // 鳥
    }
    // 雲（ゆっくり流れる）
    const cl = el('g', { class: 'pa-cloud' }, svg);
    const cloud = 'M0 0a12 12 0 0 1 20-8a16 16 0 0 1 28 2a11 11 0 0 1 14 14h-62a8 8 0 0 1 0-8z';
    [[150, 92, 1], [26, 120, 0.8]].forEach(([x, y, s], i) => {
      const g = el('g', { transform: `translate(${x} ${y}) scale(${s})` }, cl);
      fill(g, 'path', { d: cloud, fill: night ? '#2c427c' : C.paper }, 1.5);
      line(g, 'path', { d: cloud, fill: 'none', stroke: ink, 'stroke-width': 1.8 }, 0.9 + i * 0.2);
    });

    // 奥の山なみ
    const far = 'M0 196L34 168L62 180L104 140L134 166L160 154L196 176L240 150L276 130L318 160L352 146L400 172V300H0Z';
    fill(svg, 'path', { d: far, fill: night ? '#2c427c' : '#a8d4c0' }, 1.6);
    fill(svg, 'path', { d: far, fill: 'url(#pa-dg)', opacity: 0.55 }, 1.8, 'pa-mul');
    line(svg, 'path', { d: far, fill: 'none', stroke: ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, 0.5);

    // MT. MAYAMA（まん中の大きな山）
    const main = 'M22 300L118 192L148 177L205 60L232 100L250 94L300 160L332 172L394 300Z';
    const shade = 'M205 60L232 100L250 94L300 160L332 172L394 300H248L236 210L222 150Z';
    fill(svg, 'path', { d: main, fill: C.grn }, 1.9, 'pa-mul');
    fill(svg, 'path', { d: shade, fill: 'url(#pa-dk)', opacity: 0.7 }, 2.1, 'pa-mul');
    const mis = el('g', { class: 'pa-mis', transform: 'translate(2.4 1.8)' }, svg);   // 版ずれ（赤い線が、少しずれて重なる）
    const two = (at, d) => { line(mis, 'path', Object.assign({}, at, { stroke: C.red }), d + 0.15); line(svg, 'path', at, d); };
    two({ d: main, fill: 'none', stroke: C.ink, 'stroke-width': 2.6, 'stroke-linejoin': 'round' }, 0);
    ['M205 60L222 150L236 210L248 300', 'M150 176L170 200M118 192L132 214M300 160L290 186M250 94L262 124'].forEach((d, i) => two({ d, fill: 'none', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linecap': 'round' }, 0.5 + i * 0.3));
    // 雪
    const snow = 'M189 95L205 60L232 100L224 96L216 107L207 97L198 104Z';
    fill(svg, 'path', { d: snow, fill: C.paper }, 2);
    line(svg, 'path', { d: snow, fill: 'none', stroke: C.ink, 'stroke-width': 2, 'stroke-linejoin': 'round' }, 0.8);
    // 山頂の旗
    line(svg, 'path', { d: 'M205 60V38', stroke: C.ink, 'stroke-width': 2, fill: 'none' }, 1.1);
    fill(svg, 'path', { d: 'M205 39l18 6l-18 6z', fill: C.red }, 2.2);
    line(svg, 'path', { d: 'M205 39l18 6l-18 6', fill: 'none', stroke: C.ink, 'stroke-width': 1.6 }, 1.3);

    // 登山鉄道（ジグザグにのぼる線路）と、小さな電車・山頂の駅
    const rail = 'M52 292L196 262L122 236L210 206L160 178L214 150L196 128';
    fill(svg, 'path', { d: rail, fill: 'none', stroke: C.ink, 'stroke-width': 7, 'stroke-dasharray': '1.6 4.4' }, 1.5);
    line(svg, 'path', { d: rail, fill: 'none', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, 1);
    const tr = el('g', { transform: 'translate(150 251) rotate(-11)' }, svg);
    fill(tr, 'rect', { x: -11, y: -9, width: 22, height: 11, rx: 2.5, fill: C.red }, 2.4);
    line(tr, 'rect', { x: -11, y: -9, width: 22, height: 11, rx: 2.5, fill: 'none', stroke: C.ink, 'stroke-width': 1.6 }, 1.5);
    fill(tr, 'rect', { x: -7, y: -6.5, width: 5, height: 4, fill: C.paper }, 2.5); fill(tr, 'rect', { x: 1, y: -6.5, width: 5, height: 4, fill: C.paper }, 2.5);
    const hut = el('g', { transform: 'translate(196 128)' }, svg);
    fill(hut, 'path', { d: 'M-8 0v-8h16v8zM-11-8l11-8l11 8z', fill: C.yel }, 2.4);
    line(hut, 'path', { d: 'M-8 0v-8h16v8M-11-8l11-8l11 8z', fill: 'none', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, 1.6);

    // ふもとの木
    for (let i = 0; i < 9; i++) {
      const x = 8 + i * 47 + (i % 2) * 9, y = 300 - (i % 3) * 4, h = 26 + (i % 3) * 7, d = `M${x} ${y}l${h * 0.32} ${-h}l${h * 0.32} ${h}z`;
      fill(svg, 'path', { d, fill: C.grn }, 2.2 + i * 0.04, 'pa-mul');
      line(svg, 'path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, 1.3 + i * 0.05);
    }
    return sky[2];
  }

  // ---------- 路線図 ----------
  // lines：[英語, 日本語, ページ, 番線] の並び（nav.js と同じ）。here：今のページ
  function map(svg, lines, here, onPick) {
    svg.textContent = '';
    const defs = el('defs', {}, svg);
    dots(defs, 'pm-dg', C.grn, 4.4, 1.3);
    const n = lines.length, W = 400, top = 78, bot = 432;
    // 駅の場所：下から上へ、左右にジグザグ。いちばん上は山頂
    const P = lines.map((l, i) => {
      const y = bot - ((bot - top) * i) / Math.max(1, n - 1);
      const x = i === n - 1 ? 214 : i % 2 ? 300 : 92;
      return [x, y];
    });
    // 山のかたちと、等高線
    const hill = `M0 460L0 ${bot - 40}C70 ${bot - 70} 120 ${top + 110} 214 ${top - 34}C300 ${top + 110} 340 ${bot - 80} 400 ${bot - 50}V460Z`;
    el('path', { d: hill, fill: '#cfe3d4' }, svg);
    el('path', { d: hill, fill: 'url(#pm-dg)', opacity: 0.45, class: 'pa-mul' }, svg);
    for (let k = 1; k <= 5; k++) {
      const s = 1 - k * 0.14, cx = 214, cy = top - 34;
      el('path', { d: hill, fill: 'none', stroke: C.grn, 'stroke-width': 1.2 / s, opacity: 0.5, transform: `translate(${cx} ${cy + k * 46}) scale(${s}) translate(${-cx} ${-cy})` }, svg);
    }
    el('path', { d: hill, fill: 'none', stroke: C.ink, 'stroke-width': 2.2 }, svg);
    // 線路（なめらかに）
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let i = 0; i < n - 1; i++) {
      const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n - 1, i + 2)];
      d += `C${p1[0] + (p2[0] - p0[0]) / 6} ${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6} ${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]} ${p2[1]}`;
    }
    el('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 9, 'stroke-dasharray': '2 5' }, svg);
    const route = el('path', { d, fill: 'none', stroke: C.ink, 'stroke-width': 2.4 }, svg);
    const draw = el('path', { d, fill: 'none', stroke: C.red, 'stroke-width': 2.4, pathLength: 1, class: 'pm-run' }, svg);   // 赤い線が、ふもとから山頂へ
    draw.style.strokeDasharray = '1'; draw.style.strokeDashoffset = '1';
    // 山頂の旗
    el('path', { d: `M214 ${top - 34}v-24l20 7l-20 7`, fill: C.red, stroke: C.ink, 'stroke-width': 1.8, 'stroke-linejoin': 'round' }, svg);
    // 電車
    const train = el('g', { class: 'pm-train' }, svg);
    el('rect', { x: -13, y: -8, width: 26, height: 14, rx: 3, fill: C.red, stroke: C.ink, 'stroke-width': 2 }, train);
    el('rect', { x: -8, y: -5, width: 6, height: 5, fill: C.paper }, train); el('rect', { x: 2, y: -5, width: 6, height: 5, fill: C.paper }, train);
    // 駅
    lines.forEach((l, i) => {
      const [x, y] = P[i], href = l[2], cur = href && href.split('#')[0] === here && !href.includes('#'), soon = !href;
      const a = el('a', { href: href || '#', class: 'pm-sta' + (cur ? ' cur' : '') + (soon ? ' soon' : ''), 'data-i': i, 'aria-label': l[1] + (cur ? '（現在地）' : soon ? '（工事中）' : '') }, svg);
      el('circle', { cx: x, cy: y, r: 22, fill: 'transparent' }, a);   // さわれる広さ
      el('circle', { cx: x, cy: y, r: 10, class: 'pm-dot' }, a);
      const right = x < 214 || i === n - 1, tx = i === n - 1 ? x + 26 : right ? x + 18 : x - 18, anc = right ? 'start' : 'end';
      el('text', { x: tx, y: y - 1, 'text-anchor': anc, class: 'pm-jp' }, a).textContent = l[1];
      el('text', { x: tx, y: y + 14, 'text-anchor': anc, class: 'pm-en' }, a).textContent = l[0] + (soon ? '　工事中' : '');
      if (cur) {
        const g = el('g', { class: 'pm-here', transform: `translate(${x} ${y - 24})` }, a);
        el('rect', { x: -24, y: -12, width: 48, height: 19, rx: 9.5, fill: C.red }, g);
        el('text', { x: 0, y: 2, 'text-anchor': 'middle' }, g).textContent = '現在地';
      }
      a.addEventListener('click', (e) => { e.preventDefault(); onPick(l, cur); });
    });
    // 電車を、ふもとと山頂のあいだで行き来させる（見えているときだけ）
    const L = route.getTotalLength(), REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let vis = false, t0 = performance.now();
    new IntersectionObserver((en) => { vis = en[0].isIntersecting; if (vis) requestAnimationFrame(run); }).observe(svg);
    function put(u) {
      const s = Math.max(0.5, Math.min(L - 0.5, u * L)), p = route.getPointAtLength(s), q = route.getPointAtLength(Math.min(L, s + 1)), r = route.getPointAtLength(Math.max(0, s - 1));
      let a = (Math.atan2(q.y - r.y, q.x - r.x) * 180) / Math.PI; if (a > 90 || a < -90) a += 180;
      train.setAttribute('transform', `translate(${p.x.toFixed(1)} ${(p.y - 6).toFixed(1)}) rotate(${a.toFixed(1)})`);
    }
    function run(now) {
      if (!vis) return;
      const k = REDUCE ? 0.5 : (1 - Math.cos(((now - t0) / 9000) * Math.PI)) / 2; put(k);
      if (!REDUCE) requestAnimationFrame(run);
    }
    put(0.5);
  }

  window.PM_ART = { cover, map, SKY };
})();
