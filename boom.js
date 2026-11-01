// boom.js — サウンドトラック（MAYAMA BOOMBOX）
// ・曲を入れたキャラ（sound.js）が、1本ずつカセットテープになります。並びは editor.js のキャラの順
// ・同じキャラの曲を何回も入れると、そのテープの A面・B面に曲がふえます（先に入れた曲から順に 1曲め、2曲め…）
// ・テープを選んで PLAY → ラジカセのふたが開いて、テープが入って、YouTube か Spotify の曲が流れます
// ・A／B を押すと、大きなレコードが画面のはしからころがって来て裏返り、オレンジ（A面）⇄青（B面）に変わります。そのあと、テープも裏返ります
// ・3D が使えない端末でも、下のテープの背（せ）の一覧から、ふつうに聞けます
(window.OC_LOADED = window.OC_LOADED || []).push('boom');

(function () {
  // ===== 変えてもいいところ =====
  const SHOW_ALL = false;   // true にすると、曲がまだないキャラも「COMING SOON」のテープとして並びます
  // ============================
  const $ = (s) => document.querySelector(s), REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const warn = (t) => { const b = document.createElement('div'); b.className = 'bx-warn'; b.textContent = t; b.onclick = () => b.remove(); document.body.appendChild(b); };
  const num = (i) => String(i + 1).padStart(2, '0');

  // ---------- テープの一覧 ----------
  let chars = {}, list = [];
  try { chars = characters || {}; } catch (e) { /* editor.js がない */ }
  try { list = Array.isArray(sound) ? sound.filter(Boolean) : []; } catch (e) { warn('sound.js が読みこめていません（書き間違いかも。カンマ「,」や「}」を確認してね）'); }
  const one = (s, k) => (s[k + '_url'] || s[k + '_title'] ? { t: String(s[k + '_title'] || 'Untitled'), by: String(s[k + '_artist'] || ''), url: String(s[k + '_url'] || '').trim() } : null);
  const mk = (ss, name, img) => {   // ss：同じテープの曲（先に入れたものから順に）。T.A・T.B が曲の一覧、A・B は 1曲め
    const T = { A: [], B: [] }, last = (k) => ss.map((s) => String(s[k] || '').trim()).filter(Boolean).pop() || '';
    ss.forEach((s) => { const a = one(s, 'a'), b = one(s, 'b'); if (a) T.A.push(a); if (b) T.B.push(b); });
    return { name, img: last('jacket') || img || '', note: last('note'), T, A: T.A[0] || null, B: T.B[0] || null };
  };
  const used = new Set(), recs = [], old = list.slice().reverse();   // sound.js は上に貼るので、下にあるほど先に入れた曲
  Object.keys(chars).forEach((id) => { const c = chars[id] || {}, ss = old.filter((x) => x.chara === id || x.chara === c.name); ss.forEach((s) => used.add(s)); if (ss.length || SHOW_ALL) recs.push(mk(ss, c.name || id, c.image)); });
  const rest = {}; old.forEach((s) => { if (!used.has(s) && (one(s, 'a') || one(s, 'b'))) (rest[String(s.chara || '')] = rest[String(s.chara || '')] || []).push(s); });
  Object.keys(rest).forEach((k) => recs.push(mk(rest[k], k, '')));   // editor.js にいない名前（名前なし）も、名前ごとに 1本
  const EMPTY = !recs.length; if (EMPTY) recs.push(mk([], '', ''));
  const nm = (r) => r.name || (EMPTY ? 'COMING SOON' : 'MAYAMA'), tn = (r, s, i) => s + (r.T[s].length > 1 ? i + 1 : '');   // tn：曲の番号（A面に1曲だけなら A、2曲以上なら A1・A2…）

  // ---------- YouTube・Spotify のアドレスを、ページにうめこむ形に ----------
  function embed(u) {
    let m;
    if (/youtu/.test(u) && (m = u.match(/[?&]list=([\w-]+)/)) && !/[?&]v=|youtu\.be\//.test(u)) return { src: 'https://www.youtube-nocookie.com/embed/videoseries?list=' + m[1], k: 'yt' };
    if ((m = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/))([\w-]{11})/))) return { src: 'https://www.youtube-nocookie.com/embed/' + m[1] + '?autoplay=1&rel=0&playsinline=1', k: 'yt' };
    if ((m = u.match(/open\.spotify\.com\/(?:intl-[\w-]+\/)?(track|album|playlist|artist|episode|show)\/(\w+)/))) return { src: 'https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '?utm_source=generator', k: m[1] === 'track' || m[1] === 'episode' ? 'sp' : 'spl' };
    return null;
  }

  // ---------- テープの背（下の一覧） ----------
  const listEl = $('#bx-list');
  const sum = (r) => ['A', 'B'].filter((s) => r.T[s].length).map((s) => s + '  ' + r.T[s].map((t) => t.t).join(' · ')).join('  /  ') || 'カセットを準備中';
  listEl.innerHTML = recs.map((r, i) => '<button type="button" class="bx-spine' + (!r.A && !r.B ? ' soon' : '') + '" data-i="' + i + '"><i>' + num(i) + '</i><span><b>' + esc(nm(r)) + '</b><small>' + esc(sum(r)) + '</small></span></button>').join('');

  // ---------- 選ぶ・かける・裏返す ----------
  let cur = 0, playing = false, face = 'A', ti = 0;   // ti：今の面の何曲め（0 が 1曲め）
  const D = {};   // 3D のほう（読みこめたら、ここに入る）
  const has = (r, s) => r.T[s].some((t) => t.url), tick = $('#bx-tick');
  const ok = (r, s, i) => (r.T[s][i] && r.T[s][i].url ? i : Math.max(0, r.T[s].findIndex((t) => t.url)));   // 聞ける曲の番号
  function ticker() {   // 流れる帯：今のテープの曲名（再生中は NOW PLAYING）
    if (!tick) return; const r = recs[cur], s = r.T[face][ti];
    const bits = playing ? ['▶ NOW PLAYING', nm(r), 'SIDE ' + tn(r, face, ti) + ' : ' + (s ? s.t + (s.by ? ' — ' + s.by : '') : '')]
      : ['TAPE ' + num(cur), nm(r)].concat(...['A', 'B'].map((k) => r.T[k].map((t, i) => tn(r, k, i) + ' : ' + t.t)), [EMPTY ? 'カセットを準備中' : 'PRESS PLAY']);
    const run = '<span>' + esc(bits.concat('MAYAMA TAPES').join('  ✦  ') + '  ✦  ').repeat(4) + '</span>'; tick.innerHTML = '<div>' + run + run + '</div>';
  }
  function ui() {
    const r = recs[cur];
    $('#bx-no').textContent = 'TAPE ' + num(cur) + ' · SIDE ' + tn(r, face, ti);
    $('#bx-state').textContent = playing ? '● NOW PLAYING' : 'SELECTED';
    $('#bx-name').textContent = nm(r);
    $('#bx-tracks').innerHTML = ['A', 'B'].map((s) => (r.T[s].length ? r.T[s] : [null]).map((t, i) =>   // 曲の一覧（タップでその曲）
      '<button type="button" class="bx-trk' + (t && face === s && ti === i ? ' on' : '') + '" data-s="' + s + '" data-i="' + i + '"' + (t && t.url ? '' : ' disabled') + '><b>' + (t ? tn(r, s, i) : s) + '</b><span>' +
        esc(t ? t.t : s === 'A' && EMPTY ? 'カセットを準備中です' : '— BLANK —') + (t && t.by ? '<small>' + esc(t.by) + '</small>' : '') + '</span></button>').join('')).join('');
    $('#bx-note').textContent = r.note; $('#bx-cat').textContent = 'CAT. NO. MYM-' + String(cur + 1).padStart(3, '0') + ' · STEREO · ℗ OC ARCHIVE';
    const pb = $('#bx-play'); pb.textContent = playing ? '■︎ STOP' : '▶︎ PLAY'; pb.classList.toggle('on', playing); pb.disabled = !has(r, 'A') && !has(r, 'B');
    ['A', 'B'].forEach((s) => { const b = $('#bx-' + s.toLowerCase()); b.classList.toggle('on', face === s); b.disabled = !has(r, s); b.setAttribute('aria-pressed', face === s); });
    $('#bx-prev').disabled = $('#bx-next').disabled = recs.length < 2;
    listEl.querySelectorAll('.bx-spine').forEach((b) => b.classList.toggle('on', +b.dataset.i === cur));
    document.body.classList.toggle('bx-playing', playing); document.documentElement.classList.toggle('bx-b', face === 'B'); ticker();
  }
  function player() {
    const box = $('#bx-player'), s = recs[cur].T[face][ti], e = playing && s && s.url ? embed(s.url) : null;
    if (!playing) { box.innerHTML = ''; box.className = ''; return; }
    if (!e) { box.className = 'msg'; box.innerHTML = s && s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">この曲のページをひらく ↗</a>' : 'この面の曲は、まだありません'; return; }
    box.className = e.k; box.innerHTML = '<iframe src="' + esc(e.src) + '" title="' + esc(s.t) + '" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>';
  }
  const first = (r) => (has(r, 'A') ? 'A' : has(r, 'B') ? 'B' : 'A');
  function select(i) {
    i = (i + recs.length) % recs.length; if (i === cur) return;
    if (playing) stop(); cur = i; face = first(recs[i]); ti = ok(recs[i], face, 0); ui();
  }
  function play(s, i) {
    const r = recs[cur]; if (s) face = s; if (!has(r, face)) face = first(r); if (!has(r, face)) return; ti = ok(r, face, i == null ? ti : i);
    const was = playing; playing = true; ui(); player();
    if (!was) setTimeout(() => $('#bx-now').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'nearest' }), 1400);
  }
  function stop() { playing = false; ui(); player(); }
  let busy = false; const disc = $('#bx-flip');
  function flip(s, i) {   // A面⇄B面：大きなレコードが裏返るあいだに色を変えて、そのあとテープを裏返す（i：その面の何曲めにするか）
    if (s === face || !has(recs[cur], s) || busy) return;
    const go = () => (playing ? play(s, i || 0) : ((face = s), (ti = ok(recs[cur], s, i || 0)), ui()));
    if (REDUCE || !disc || getComputedStyle(disc).position !== 'fixed') return go();   // boom-fx.css がないときは、すぐ切りかえ
    busy = true; disc.className = 'bx-flip go' + (s === 'A' ? ' to-a' : '');
    setTimeout(() => document.documentElement.classList.toggle('bx-b', s === 'B'), 500);
    setTimeout(go, 1000); setTimeout(() => { disc.className = 'bx-flip'; busy = false; }, 1630);
  }
  $('#bx-prev').onclick = () => select(cur - 1); $('#bx-next').onclick = () => select(cur + 1);
  $('#bx-play').onclick = () => (playing ? stop() : play());
  $('#bx-a').onclick = () => flip('A'); $('#bx-b').onclick = () => flip('B');
  $('#bx-tracks').addEventListener('click', (e) => { const b = e.target.closest('.bx-trk'), i = b ? +b.dataset.i : 0; if (b && !b.disabled) b.dataset.s === face ? (!playing || i !== ti) && play(face, i) : flip(b.dataset.s, i); });
  listEl.addEventListener('click', (e) => { const b = e.target.closest('.bx-spine'); if (!b) return; select(+b.dataset.i); $('#bx-stage').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' }); });
  document.querySelectorAll('.bx-rec').forEach((el) => { el.addEventListener('click', () => { el.classList.remove('hit'); void el.offsetWidth; el.classList.add('hit'); }); el.addEventListener('animationend', (e) => e.animationName === 'bxScratch' && el.classList.remove('hit')); });   // 平たいレコード（3D が使えない端末）
  document.addEventListener('contextmenu', (e) => { if (e.target.closest && e.target.closest('canvas, .bx-art')) e.preventDefault(); });   // 絵の上では、右クリック・長押しのメニューを出さない
  addEventListener('keydown', (e) => { if (e.target.closest && e.target.closest('input, textarea')) return; if (e.key === 'ArrowLeft') select(cur - 1); if (e.key === 'ArrowRight') select(cur + 1); });
  face = first(recs[0]); ti = ok(recs[0], face, 0); ui();

  // ---------- 3D のラジカセ（boom3d.js が作る。ここから使えるようにしておく） ----------
  window.OC_BOOM = { recs, D, num, REDUCE, EMPTY, select, play, stop, flip, get cur() { return cur; }, get face() { return face; }, get playing() { return playing; } };
})();
