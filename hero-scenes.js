// hero-scenes.js — 入場画面の「登場する物体の一覧」と、ショット 1〜4。
// 3Dの空間に物体を置いて、カメラを動かして撮る、1本の長いループです。（ショット 5〜8 は hero-scenes2.js）
//
// 位置 p:[横, 縦(上が＋), 奥行き(手前が＋)]　回転 r:[縦に倒す, 横に回す, ひねる]（ラジアン）　大きさ s
// 平らな形の shape：circle / square / tri / diamond / half / quarter / lens / spark / sun / wedge
// 色：cream / teal / orange / verm / navy / blue / pink / peach / cyan / white / black、または '#xxxxxx'
(window.OC_LOADED = window.OC_LOADED || []).push('hero-scenes');

window.OC_HERO_SCENES = function () {
  const S = Math.sin, Co = Math.cos, PI = Math.PI, TAU = PI * 2;
  const cl = (x) => Math.max(0, Math.min(1, x)), io = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const FLOOR = [-PI / 2, 0, 0];   // 床に寝かせる向き

  // ===== 登場する物体の一覧（ここに書いた値が、ふだんの見た目） =====
  const A = {
    // 平面のポスター（ショット1・2）
    pTeal: { type: 'flat', shape: 'square', sx: 2.6, sy: 0.65, c: 'teal' },
    pOrSmall: { type: 'flat', shape: 'square', sx: 0.7, sy: 0.18, c: 'orange' },
    pOrange: { type: 'flat', shape: 'square', sx: 2.2, sy: 0.7, c: 'orange' },
    pDisc1: { type: 'flat', shape: 'circle', w: 0.55, c: 'white', split: 'verm' },
    pNavy: { type: 'flat', shape: 'square', sx: 1.4, sy: 0.8, c: 'navy' },
    pDisc2: { type: 'flat', shape: 'circle', w: 0.33, c: 'teal', split: 'white' },
    pVerm: { type: 'flat', shape: 'square', sx: 1.8, sy: 0.4, c: 'verm' },
    pHalf: { type: 'flat', shape: 'half', w: 0.42, c: 'orange' },
    pDot: { type: 'flat', shape: 'circle', w: 0.32, c: 'teal' },
    pFan: { type: 'lines', kind: 'burst', w: 2.4, n: 18, spread: 0.7, a0: 0, c: 'navy' },
    pFan2: { type: 'lines', kind: 'burst', w: 0.9, n: 12, spread: 0.7, a0: PI, c: 'navy' },
    // 正面の大きな丸のポスター（ショット6）
    oRow: { type: 'lines', kind: 'dots', nx: 22, ny: 2, gap: 0.62, dot: 0.05, wave: 0.25, c: 'cream', alpha: 1 },
    oBig: { type: 'flat', shape: 'circle', w: 3, g: ['white', '#a0a0a0'], ga: PI / 2, split: '#1b1b1b' },
    oHolo: { type: 'flat', shape: 'square', sx: 0.42, sy: 2.2, holo: 1, ga: PI / 2 },
    oBar1: { type: 'flat', shape: 'square', sx: 0.2, sy: 2.4, c: 'cream' },
    oBar2: { type: 'flat', shape: 'square', sx: 0.28, sy: 2.4, c: 'verm' },
    oBar3: { type: 'flat', shape: 'square', sx: 0.12, sy: 2.4, c: 'orange' },
    oTri: { type: 'flat', shape: 'wedge', w: 1.1, c: 'verm' },
    oDisc: { type: 'flat', shape: 'circle', w: 1.05, c: 'blue', split: 'peach' },
    oSq: { type: 'flat', shape: 'square', w: 0.18, c: 'white' },
    oCen: { type: 'flat', shape: 'circle', w: 0.2, c: 'white', split: 'verm' },
    // 立体の物
    coin1: { type: 'coin', w: 1.1, d: 0.25, c: 'orange' }, coin2: { type: 'coin', w: 1.1, d: 0.25, c: 'cream' }, coin3: { type: 'coin', w: 1.1, d: 0.25, c: 'verm' },
    stk1: { type: 'coin', w: 1.2, d: 0.2, c: 'navy' }, stk2: { type: 'coin', w: 1.2, d: 0.2, c: 'verm' }, stk3: { type: 'coin', w: 1.2, d: 0.2, c: 'white' },
    chrome: { type: 'sphere', w: 0.75 },
    glass: { type: 'sphere', w: 1.7, glass: 1 },
    ob1: { type: 'sphere', w: 0.16, g: ['white', 'orange'] }, ob2: { type: 'sphere', w: 0.13, g: ['white', 'cream'] }, ob3: { type: 'sphere', w: 0.15, g: ['white', 'verm'] },
    blueBox: { type: 'box', bw: 1.1, bh: 2.6, bd: 0.3, c: 'blue', side: '#1d1dc0', top: '#5c5cff' },
    slab1: { type: 'box', bw: 0.5, bh: 2.8, bd: 0.14, c: '#fff4f4' }, slab2: { type: 'box', bw: 0.5, bh: 2.8, bd: 0.14, c: '#fff4f4' },
    slab3: { type: 'box', bw: 0.5, bh: 2.8, bd: 0.14, c: '#fff4f4' }, slab4: { type: 'box', bw: 0.5, bh: 2.8, bd: 0.14, c: '#fff4f4' },
    holoSlab: { type: 'box', bw: 3.4, bh: 0.32, bd: 0.9, c: '#e8e8ff', holo: 1 },
    chip: { type: 'box', bw: 0.9, bh: 0.18, bd: 0.5, c: 'white' },
    spring: { type: 'lines', kind: 'spring', w: 0.65, L: 2.2, n: 12, c: 'cream' },
    wave: { type: 'lines', kind: 'wave', w: 3.2, h: 2.4, n: 14, amp: 0.5, c: 'navy' },
    frames: { type: 'lines', kind: 'frames', w: 6, h: 5, n: 3, c: 'navy', alpha: 0.75 },
    burst: { type: 'lines', kind: 'burst', w: 0.85, n: 12, spread: TAU, a0: 0, c: 'navy' },
    orbitRing: { type: 'lines', kind: 'ring', w: 4.2, c: 'navy', alpha: 0.45 },
    rip1: { type: 'lines', kind: 'ring', w: 1, c: 'cream' }, rip2: { type: 'lines', kind: 'ring', w: 1, c: 'cream' }, rip3: { type: 'lines', kind: 'ring', w: 1, c: 'cream' },
    floorDots: { type: 'lines', kind: 'dots', nx: 8, ny: 7, gap: 0.3, dot: 0.03, c: 'blue', alpha: 1 },
    floorDisc: { type: 'flat', shape: 'circle', w: 1.6, c: 'verm' },
    greyBar: { type: 'flat', shape: 'square', sx: 1.6, sy: 0.22, g: ['white', 'black'], ga: 0 },
    spark: { type: 'flat', shape: 'spark', w: 0.55, c: 'teal' },
    sun: { type: 'flat', shape: 'sun', w: 0.28, c: 'cream' },
    aster: { type: 'aster', w: 0.7, g: ['cream', 'white', 'pink'] },
    word: { type: 'text', str: 'キャラクター', c: 'navy' },
    pink: { type: 'flat', shape: 'circle', w: 0.8, sx: 0.72, g: ['#ffd0dc', 'pink', 'blue'], ga: 0.8 },
    glow1: { type: 'flat', shape: 'square', sx: 0.75, sy: 1.05, c: '#ffe1a0', alpha: 0.22 }, glow2: { type: 'flat', shape: 'square', sx: 0.75, sy: 1.05, c: '#ffe1a0', alpha: 0.22 },
    glow3: { type: 'flat', shape: 'square', sx: 0.75, sy: 1.05, c: '#ffe1a0', alpha: 0.22 }, glow4: { type: 'flat', shape: 'square', sx: 0.75, sy: 1.05, c: '#fff4d6', alpha: 0.3 },
    rod: { type: 'flat', shape: 'square', sx: 0.09, sy: 1.2, c: 'teal' },
    stick: { type: 'flat', shape: 'square', sx: 0.09, sy: 1.5, c: 'orange' },
    pill: { type: 'flat', shape: 'circle', w: 0.42, sx: 1.4, c: 'white' },
    wallL: { type: 'flat', shape: 'square', sx: 6, sy: 7, c: '#ff7a4c', z: -50 },
    floor: { type: 'flat', shape: 'square', sx: 9, sy: 6, c: '#d63f14', z: -60 },
    wallHatch: { type: 'flat', shape: 'square', sx: 1.4, sy: 1.6, c: '#ff8a5e', stripes: '#ffb39a' },
    tri1: { type: 'flat', shape: 'tri', w: 0.7, c: 'orange' }, tri2: { type: 'flat', shape: 'tri', w: 0.7, c: 'navy' }, tri3: { type: 'flat', shape: 'tri', w: 0.7, c: 'cream' }
  };

  // ===== ショット 1〜4 =====
  const posterFlat = (t) => ({
    pTeal: { p: [-0.4 + 0.25 * S(t * 0.8), 0.5, 0] }, pOrSmall: { p: [-2.3 + 0.25 * S(t * 0.8), 0.05, 0.02], sx: 0.5 + 0.25 * S(t * 1.6) ** 2 },
    pOrange: { p: [2.6 + 0.2 * S(t * 0.7 + 1), 1.6, 0] }, pDisc1: { p: [4.0 + 0.2 * S(t * 0.7 + 1), 1.6, 0.03], sa: t * 1.1 },
    pNavy: { p: [-3.1 + 0.2 * S(t * 0.9 + 2), -0.6, 0] }, pDisc2: { p: [-3.9 + 0.2 * S(t * 0.9 + 2), -0.6, 0.03], sa: -t * 1.4 },
    pVerm: { p: [-2.4 + 0.25 * S(t * 0.6 + 3), -1.85, 0] }, pHalf: { p: [-0.6 + 0.25 * S(t * 0.6 + 3), -1.85, 0.02], r: [0, 0, -PI / 2] },
    pDot: { p: [-1.2, 2.6 + 0.15 * S(t * 2), 0] },
    pFan: { p: [2.25, 0.5, 0], w: 2.4 * (0.88 + 0.12 * S(t * 1.6)), spread: 0.55 + 0.25 * S(t * 1.1) }, pFan2: { p: [2.25, 0.5, 0] }
  });
  const shots = [
    { // 1) 平面のポスター（真正面から見ると、ただの平らな絵）
      name: 'POSTER', bg: 'cream',
      cam: () => ({ yaw: 0, pitch: 0, dist: 40, zoom: 1, t: [0, 0.3, 0] }),
      act: (t) => posterFlat(t)
    },
    { // 2) カメラが回り込むと、それぞれ違う奥行きに浮かぶ板だったと分かる
      name: 'DEPTH', bg: 'cream', sel: 'pOrange',
      cam: (tb) => ({ yaw: 0.75 + 0.12 * S(tb * 0.5), pitch: 0.3, dist: 9, zoom: 0.9, t: [0, -0.2, 0] }),
      act: (t) => {
        const o = posterFlat(t), z = { pTeal: 0, pOrSmall: 0.7, pOrange: -2.6, pDisc1: -2.2, pNavy: 2, pDisc2: 2.5, pVerm: 3.2, pHalf: 3.6, pDot: -1.2, pFan: -1, pFan2: -1 };
        Object.keys(o).forEach((k) => { o[k].p = [o[k].p[0], o[k].p[1], z[k]]; o[k].r = [0, (k.length % 3 - 1) * 0.25, (o[k].r || [0, 0, 0])[2]]; });
        o.frames = { p: [0, -2.6, 0], r: FLOOR, w: 8, h: 7 };
        o.wave = { p: [1.6, -2.5, 1.2], r: FLOOR };
        o.floorDisc = { p: [-1, -2.55, 0.6], r: FLOOR, w: 1.4 };
        o.burst = { p: [3.1, 2.6, -2], r: [0, 0, t * 0.4] };
        o.chrome = { p: [0.8, -2.0 + Math.abs(S(t * 2.4)) * 1.2, 2.4], w: 0.5 };
        return o;
      }
    },
    { // 3) 斜め上から見下ろす床（波線・円盤・回るコイン・虹色の板）
      name: 'ISOMETRIC', bg: 'orange', sel: 'coin3',
      cam: (tb) => ({ yaw: 0.78 + 0.1 * S(tb * 0.6), pitch: 0.62, dist: 14, zoom: 1.05, t: [0, -0.3, 0] }),
      act: (t) => ({
        frames: { p: [0, -1.2, 0], r: FLOOR, w: 6, h: 5 },
        floorDisc: { p: [0.4, -1.18, 0.8], r: FLOOR, w: 1.7 * (1 + 0.04 * S(t * 2)) },
        floorDots: { p: [-1.6, -1.15, -1.0], r: FLOOR },
        wave: { p: [1.2, -1.1, -0.6], r: FLOOR, w: 3, h: 2.2, amp: 0.55 },
        coin3: { p: [1.0, 0.3, 0.4], r: [0, t * 2.2, 0], w: 1.2, d: 0.22, c: 'navy', c2: 'navy' },
        holoSlab: { p: [-0.8, 1.3, -0.8], r: [0.25, 0.5 + 0.2 * S(t * 0.8), 0] },
        greyBar: { p: [-1.8, 0.7, 1.2], r: [0, 0.6, -0.4 + 0.1 * S(t)] },
        chip: { p: [2.4 + 0.2 * S(t * 1.2), -0.85, 1.6] },
        spark: { p: [-2.8, 2.1, -1], r: [0, t, 0] },
        burst: { p: [1.8, 2.6, -1.6], r: [0, 0.4, t * 0.3] },
        word: { p: [1.4, -1.15, 1.9], r: [-PI / 2, 0, -0.5], s: 0.55 },
        glow1: { p: [2.3, 1.0, -2.2] }, glow2: { p: [2.3, 1.0, -1.95] }, glow3: { p: [2.3, 1.0, -1.7] }, glow4: { p: [2.3, 1.0, -1.45] },
        pink: { p: [-0.1, 2.6 + 0.2 * S(t * 1.3), 0.4], r: [0, 0.4 + 0.3 * S(t), 0.3] }
      })
    },
    { // 4) 部屋の中に浮かぶ物（白い板・銀の玉・ガラスの玉・ばね）
      name: 'ROOM', bg: 'verm', sel: 'blueBox',
      cam: (tb) => ({ yaw: -0.42 + 0.14 * S(tb * 0.45), pitch: 0.1, dist: 11, zoom: 1.1, t: [0.4, -0.2, 0] }),
      act: (t) => {
        const o = {
          wallL: { p: [-4.5, 0, 0], r: [0, PI / 2, 0] }, floor: { p: [0, -3, 0], r: FLOOR },
          wallHatch: { p: [-4.45, 0.6, -0.9], r: [0, PI / 2, 0] }, pink: { p: [-4.4, 0.6, -0.4], r: [0, PI / 2, 0], w: 0.7, sx: 0.85, g: ['#ffd0dc', 'pink', 'verm'] },
          blueBox: { p: [-0.5, 0.2, -0.8] },
          chrome: { p: [0.9, -2.25 + Math.abs(S(t * 2.4)) * 1.6, 0.9] },
          glass: { p: [0.3, 0.1, 1.6] },
          spring: { p: [-2.4, -2.2, 0.6], r: [0, PI / 2, 0] },
          holoSlab: { p: [-0.9, -1.6, 1.4], r: [-0.3, 0.2, 0.05], bw: 3.2, bh: 0.08, bd: 0.6 },
          rod: { p: [-0.1, 0.2, 0.4], r: [0, 0, 0.05] }, stick: { p: [-0.3, 0.6, 0.6], r: [0, 0, -0.9 + 0.1 * S(t)] },
          aster: { p: [-1.8, -2.2, 1.8], r: [0, 0.3, t] }, sun: { p: [2.6, 0.8, 0.4], r: [0, 0, t] },
          pill: { p: [2.2, 1.8 + 0.15 * S(t * 1.5), 0] }
        };
        [1, 2, 3, 4].forEach((k) => { const h = 2 + 1.2 * Math.abs(S(t * 1.8 + k * 1.3)); o['slab' + k] = { p: [0.9 + k * 0.72, -3 + h / 2, -1.2], bh: h }; });
        return o;
      }
    }
  ];

  window.OC_HERO_ACTORS = A;
  return shots;
};
