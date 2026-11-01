// boom.js — サウンドトラック（MAYAMA BOOMBOX）
// ・曲を入れたキャラ（sound.js）が、1本ずつカセットテープになります。並びは editor.js のキャラの順
// ・テープを選んで PLAY → ラジカセのふたが開いて、テープが入って、YouTube か Spotify の曲が流れます
// ・A／B を押すと、テープが一度出てきて、裏返って B面に。画面を左右にスワイプしても、テープを選べます
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
  const side = (s, k) => (s[k + '_url'] || s[k + '_title'] ? { t: String(s[k + '_title'] || 'Untitled'), by: String(s[k + '_artist'] || ''), url: String(s[k + '_url'] || '').trim() } : null);
  const mk = (s, name, img) => ({ name, img: String(s.jacket || '').trim() || img || '', note: String(s.note || ''), A: side(s, 'a'), B: side(s, 'b') });
  const used = new Set(), recs = [];
  Object.keys(chars).forEach((id) => { const c = chars[id] || {}, s = list.find((x) => x.chara === id || x.chara === c.name); if (s) used.add(s); if (s || SHOW_ALL) recs.push(mk(s || {}, c.name || id, c.image)); });
  list.forEach((s) => { if (!used.has(s) && (s.a_url || s.a_title)) recs.push(mk(s, String(s.chara || ''), '')); });
  const EMPTY = !recs.length; if (EMPTY) recs.push(mk({}, '', ''));

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
  listEl.innerHTML = recs.map((r, i) => '<button type="button" class="bx-spine' + (!r.A && !r.B ? ' soon' : '') + '" data-i="' + i + '"><i>' + num(i) + '</i><span><b>' + esc(r.name || (EMPTY ? 'COMING SOON' : 'MAYAMA')) + '</b><small>' +
    esc(r.A ? 'A  ' + r.A.t + (r.B ? '  /  B  ' + r.B.t : '') : 'カセットを準備中') + '</small></span></button>').join('');

  // ---------- 選ぶ・かける・裏返す ----------
  let cur = 0, playing = false, face = 'A';
  const D = {};   // 3D のほう（読みこめたら、ここに入る）
  const has = (r, s) => !!(r[s] && r[s].url), tick = $('#bx-tick');
  function ticker() {   // 流れる帯：今のテープの曲名（再生中は NOW PLAYING）
    if (!tick) return; const r = recs[cur], nm = r.name || (EMPTY ? 'COMING SOON' : 'MAYAMA'), s = r[face];
    const bits = playing ? ['▶ NOW PLAYING', nm, 'SIDE ' + face + ' : ' + (s ? s.t + (s.by ? ' — ' + s.by : '') : '')]
      : ['TAPE ' + num(cur), nm].concat(['A', 'B'].filter((k) => r[k]).map((k) => k + ' : ' + r[k].t), [EMPTY ? 'カセットを準備中' : 'PRESS PLAY']);
    const run = '<span>' + esc(bits.concat('MAYAMA TAPES').join('  ✦  ') + '  ✦  ').repeat(4) + '</span>'; tick.innerHTML = '<div>' + run + run + '</div>';
  }
  function ui() {
    const r = recs[cur];
    $('#bx-no').textContent = 'TAPE ' + num(cur) + ' · SIDE ' + face;
    $('#bx-state').textContent = playing ? '● NOW PLAYING' : 'SELECTED';
    $('#bx-name').textContent = r.name || (EMPTY ? 'COMING SOON' : 'MAYAMA');
    $('#bx-tracks').innerHTML = ['A', 'B'].map((s) => { const t = r[s];
      return '<button type="button" class="bx-trk' + (face === s ? ' on' : '') + '" data-s="' + s + '"' + (has(r, s) ? '' : ' disabled') + '><b>' + s + '</b><span>' +
        esc(t ? t.t : s === 'A' && EMPTY ? 'カセットを準備中です' : '— BLANK —') + (t && t.by ? '<small>' + esc(t.by) + '</small>' : '') + '</span></button>'; }).join('');
    $('#bx-note').textContent = r.note; $('#bx-cat').textContent = 'CAT. NO. MYM-' + String(cur + 1).padStart(3, '0') + ' · STEREO · ℗ OC ARCHIVE';
    const pb = $('#bx-play'); pb.textContent = playing ? '■︎ STOP' : '▶︎ PLAY'; pb.classList.toggle('on', playing); pb.disabled = !has(r, 'A') && !has(r, 'B');
    ['A', 'B'].forEach((s) => { const b = $('#bx-' + s.toLowerCase()); b.classList.toggle('on', face === s); b.disabled = !has(r, s); b.setAttribute('aria-pressed', face === s); });
    $('#bx-prev').disabled = $('#bx-next').disabled = recs.length < 2;
    listEl.querySelectorAll('.bx-spine').forEach((b) => b.classList.toggle('on', +b.dataset.i === cur));
    document.body.classList.toggle('bx-playing', playing); ticker();
  }
  function player() {
    const box = $('#bx-player'), s = recs[cur][face], e = playing && s && s.url ? embed(s.url) : null;
    if (!playing) { box.innerHTML = ''; box.className = ''; return; }
    if (!e) { box.className = 'msg'; box.innerHTML = s && s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">この曲のページをひらく ↗</a>' : 'この面の曲は、まだありません'; return; }
    box.className = e.k; box.innerHTML = '<iframe src="' + esc(e.src) + '" title="' + esc(s.t) + '" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>';
  }
  const first = (r) => (has(r, 'A') ? 'A' : has(r, 'B') ? 'B' : 'A');
  function select(i) {
    i = (i + recs.length) % recs.length; if (i === cur) return;
    if (playing) stop(); cur = i; face = first(recs[i]); ui();
  }
  function play(s) {
    const r = recs[cur]; if (s) face = s; if (!has(r, face)) face = first(r); if (!has(r, face)) return;
    const was = playing; playing = true; ui(); player();
    if (!was) setTimeout(() => $('#bx-now').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'nearest' }), 1400);
  }
  function stop() { playing = false; ui(); player(); }
  function flip(s) { if (s === face || !has(recs[cur], s)) return; playing ? play(s) : ((face = s), ui()); }
  $('#bx-prev').onclick = () => select(cur - 1); $('#bx-next').onclick = () => select(cur + 1);
  $('#bx-play').onclick = () => (playing ? stop() : play());
  $('#bx-a').onclick = () => flip('A'); $('#bx-b').onclick = () => flip('B');
  $('#bx-tracks').addEventListener('click', (e) => { const b = e.target.closest('.bx-trk'); if (b && !b.disabled) b.dataset.s === face ? !playing && play() : flip(b.dataset.s); });
  listEl.addEventListener('click', (e) => { const b = e.target.closest('.bx-spine'); if (!b) return; select(+b.dataset.i); $('#bx-stage').scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' }); });
  addEventListener('keydown', (e) => { if (e.target.closest && e.target.closest('input, textarea')) return; if (e.key === 'ArrowLeft') select(cur - 1); if (e.key === 'ArrowRight') select(cur + 1); });
  face = first(recs[0]); ui();

  // ---------- 3D のラジカセ（boom3d.js が作る。ここから使えるようにしておく） ----------
  window.OC_BOOM = { recs, D, num, REDUCE, EMPTY, select, play, stop, flip, get cur() { return cur; }, get face() { return face; }, get playing() { return playing; } };
})();
