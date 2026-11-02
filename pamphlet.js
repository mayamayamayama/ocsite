// pamphlet.js — ガイドライン（MT. MAYAMA 入山のしおり）
// ・文章は guide.js から読みます（書きかえるのは guide.js だけでOK）
// ・下へスクロールすると、じゃばら折りのパンフレットが、1枚ずつひらいていきます
// ・心得の看板を読んだらスタンプ。ぜんぶ集めると、さいごに登頂証明書がもらえます（スタンプは、このスマホに覚えておきます）
// ・うちよそ優待券は、横にひっぱると、きりとり線からちぎれます
// ・読みすすめると、標高計の数字が上がって、さいごに山頂（パソコンでは、左に目次も出ます）
(window.OC_LOADED = window.OC_LOADED || []).push('pamphlet');

(function () {
  const $ = (s, r) => (r || document).querySelector(s), root = document.documentElement, pm = $('#pm');
  if (!pm) return;
  const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  const txt = (s) => esc(String(s == null ? '' : s).trim()).replace(/\n/g, '<br>');
  const pad = (n, k) => String(n).padStart(k || 2, '0');
  const KAN = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  const kan = (i) => (i < 10 ? KAN[i] : i + 1);
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* 覚えられなくても動く */ } } };
  const buzz = (p) => { try { navigator.vibrate && navigator.vibrate(p); } catch (e) { /* なにもしない */ } };

  // ---------- 文章（guide.js） ----------
  let G = null;
  try { G = guide; } catch (e) { /* guide.js が読めていない */ }
  if (!G || typeof G !== 'object') {
    G = {};
    const b = document.createElement('div'); b.className = 'pm-warn';
    b.textContent = 'guide.js が読みこめていません（書き間違いかも。カンマ「,」や「}」、「`」を確認してね）'; document.body.appendChild(b);
  }
  const rules = Array.isArray(G.rules) ? G.rules.filter((r) => r && (r.title || r.text)) : [];
  const chart = Array.isArray(G.chart) ? G.chart.filter(Array.isArray) : [];

  // ---------- 入山番号・時間・天気 ----------
  let no = store.get('oc-guide-no');
  if (!no) { const d = new Date(); no = String(d.getFullYear()).slice(2) + pad(d.getMonth() + 1) + pad(d.getDate()) + '-' + (100 + Math.floor(Math.random() * 900)); store.set('oc-guide-no', no); }
  $('#pm-no').textContent = 'No.' + no;
  const h = new Date().getHours(), q = (location.search.match(/[?&]tod=(\w+)/) || [])[1];
  const tod = q && /^(dawn|day|dusk|night)$/.test(q) ? q : h >= 5 && h < 9 ? 'dawn' : h >= 9 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'dusk' : 'night';
  root.classList.add('tod-' + tod);
  const ART = window.PM_ART;
  if (ART) $('#pm-sky').textContent = ART.cover($('#pm-cover'), tod); else $('#pm-cover').remove();

  // ---------- 看板の絵（ピクトグラム） ----------
  const PICT = {
    OK: '<circle cx="32" cy="32" r="17" fill="none" stroke="currentColor" stroke-width="7"/>',
    NG: '<circle cx="32" cy="32" r="22" fill="none" stroke="currentColor" stroke-width="6"/><path d="M17 17l30 30" stroke="currentColor" stroke-width="6"/>',
    LOVE: '<path d="M32 50S12 37 12 24a10 10 0 0 1 20-3a10 10 0 0 1 20 3c0 13-20 26-20 26z" fill="currentColor"/>',
    ASK: '<path d="M10 14h44v28H30l-12 10v-10h-8z" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/><path d="M27 23a5 5 0 1 1 7 5c-2 1-2 2-2 4" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="37" r="2.4" fill="currentColor"/>',
    STAR: '<path d="M32 9l6.8 14.6l16 1.9l-11.8 11l3.1 15.8L32 44.4l-14.1 7.9l3.1-15.8l-11.8-11l16-1.9z" fill="currentColor"/>',
  };
  const markOf = (m) => (PICT[String(m || '').toUpperCase()] ? String(m).toUpperCase() : 'OK');
  const pict = (m) => '<svg viewBox="0 0 64 64" aria-hidden="true">' + PICT[m] + '</svg>';
  const CHART = { '◎': ['ok2', '大歓迎'], '○': ['ok', 'OK'], '✕': ['ng', 'ダメ'], '×': ['ng', 'ダメ'], '？': ['ask', '相談してね'], '?': ['ask', '相談してね'] };
  const cmark = (m) => { const k = CHART[String(m).trim()] || CHART['？'];
    return '<i class="pq-m ' + k[0] + '" aria-label="' + k[1] + '"><svg viewBox="0 0 32 32" aria-hidden="true">' + (k[0] === 'ok2' ? '<circle cx="16" cy="16" r="12"/><circle cx="16" cy="16" r="6.5"/>' : k[0] === 'ok' ? '<circle cx="16" cy="16" r="11"/>' : k[0] === 'ng' ? '<path d="M7 7l18 18M25 7L7 25"/>' : '<path d="M11 11a5 5 0 1 1 7 5c-2 1-2 2-2 4M16 25v.5"/>') + '</svg></i>'; };

  // ---------- はんこ ----------
  const hanko = (id, mid, sub) => '<svg class="hk" viewBox="0 0 100 100" aria-hidden="true"><defs><path id="' + id + '" d="M50 50m-34 0a34 34 0 1 1 68 0a34 34 0 1 1-68 0"/></defs>' +
    '<circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" stroke-width="1.5"/>' +
    '<text class="hk-ring"><textPath href="#' + id + '" startOffset="0">MT. MAYAMA ✦ 入山の心得 ✦ MT. MAYAMA ✦ 入山の心得 ✦</textPath></text>' +
    '<path d="M30 60l12-17l6 7l8-12l14 22z" fill="currentColor" opacity=".9"/><text x="50" y="40" class="hk-mid">' + mid + '</text><text x="50" y="76" class="hk-sub">' + sub + '</text></svg>';

  // ---------- パンフレットの中身を作る ----------
  const N = rules.length;
  let html = '<section class="pp pp-hello"><h2 class="ph">ようこそ</h2><p class="pt">' + txt(G.hello) + '</p>' +
    (N ? '<div class="ph-how">' + hanko('hk-how', '印', 'STAMP') + '<p>心得の看板を読んだら、スタンプを押してね。<b>' + N + 'こ</b>集めると、さいごに<b>登頂証明書</b>がもらえます。</p></div>' : '') + '</section>';
  if (chart.length) html += '<section class="pp pp-chart"><h2 class="ph">ひと目でわかる早見表</h2><table class="pq"><tbody>' +
    chart.map((c) => '<tr><th>' + esc(c[0]) + '</th><td>' + cmark(c[1]) + '</td><td>' + esc(c[2] || '') + '</td></tr>').join('') +
    '</tbody></table><p class="pq-key">' + ['◎', '○', '✕'].map((m) => cmark(m) + CHART[m][1]).join('') + '</p></section>';
  rules.forEach((r, i) => {
    const m = markOf(r.mark);
    html += '<section class="pp pp-rule m-' + m.toLowerCase() + '" id="rule-' + (i + 1) + '"><div class="pr-sign"><span class="pr-pict">' + pict(m) + '</span><p class="pr-no">入山の心得　その' + kan(i) + '</p><h2 class="pr-title">' + esc(r.title) + '</h2></div>' +
      '<p class="pt">' + txt(r.text) + '</p><button type="button" class="pr-stamp" data-i="' + i + '" aria-pressed="false"><span class="pr-slot">読んだら<br>ここをタップ</span>' + hanko('hk-' + i, 'その' + kan(i), '読了') + '</button></section>';
  });
  const cp = G.coupon || {};
  if (cp.title) html += '<section class="pp pp-coupon"><h2 class="ph">うちよそ優待券</h2><p class="pt">きりとり線から、横にひっぱってちぎってね。</p>' +
    '<div class="pk"><div class="pk-stub"><b>控</b><span>No.' + esc(no) + '</span></div><div class="pk-tk" role="button" tabindex="0" aria-label="券をちぎる">' +
    '<p class="pk-k">MT. MAYAMA 観光協会</p><p class="pk-t">' + esc(cp.title) + '</p><p class="pk-l">有効期限：<b>' + esc(cp.limit || 'ずっと') + '</b></p><p class="pk-n">' + esc(cp.note || '') + '</p></div></div>' +
    '<p class="pk-done" hidden>いってらっしゃい！ ちぎった券は、心の中に持っていってね。<button type="button" class="pk-again">もう一枚ちぎる</button></p></section>';
  if (ART) html += '<section class="pp pp-map"><h2 class="ph">登山鉄道 路線図</h2><p class="pt">ほかの見どころへは、MT. MAYAMA 登山鉄道で。駅をタップすると、電車が来ます。</p><svg class="pm-map" viewBox="0 0 400 460" role="group" aria-label="路線図"></svg>' +
    '<p class="pm-key"><span><i class="k-ok"></i>運行中</span><span><i class="k-cur"></i>現在地</span><span><i class="k-soon"></i>工事中</span></p></section>';
  html += '<section class="pp pp-end"><div class="pe-cert"><p class="pe-h">登頂証明書</p><div class="pe-slots"></div><p class="pe-msg"></p><button type="button" class="pe-go" hidden>まだのところへ</button>' +
    '<div class="pe-big">' + hanko('hk-top', '登頂', 'SUMMIT') + '</div></div>' +
    '<p class="pt pe-bye">' + txt(G.bye) + '</p><p class="pe-enjoy">' + txt(G.enjoy || '楽しんで！') + '</p>' +
    (String(G.contact || '').trim() ? '<a class="pe-contact" href="' + esc(String(G.contact).trim()) + '" target="_blank" rel="noopener">リプ・メッセージはこちら</a>' : '') +
    '<div class="pe-fine"><p>' + txt(G.smallprint) + '</p><p>発行：MT. MAYAMA 観光協会（MAYAMA）' + (G.updated ? '　改訂：' + esc(G.updated) : '') + '</p></div></section>';
  pm.insertAdjacentHTML('beforeend', html);

  // ---------- 路線図 ----------
  if (ART) {
    const NAV = window.OC_NAV, here = location.pathname.split('/').pop() || 'index.html';
    const lines = (NAV && NAV.lines) || [['OC ARCHIVE', 'トップ', 'index.html'], ['CHARACTERS', 'キャラクター一覧', 'index.html#list'], ['GUIDELINE', 'ガイドライン', 'guideline.html'], ['COMPOSITION', '構図置き場', 'composition.html'], ['SOUNDTRACK', 'サウンドトラック', 'soundtrack.html']];
    ART.map($('.pm-map'), lines, here, (l, cur) => {
      if (cur) return say('ここが現在地です');
      if (!l[2]) return say(l[1] + ' は工事中です。開業をお楽しみに！');
      if (NAV && NAV.go) NAV.go(l[2]); else location.href = l[2];
    });
  }

  // ---------- 小さなお知らせ ----------
  let toastT = 0; const toast = document.createElement('div'); toast.className = 'pm-toast'; toast.setAttribute('role', 'status'); document.body.appendChild(toast);
  function say(s) { toast.textContent = s; toast.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove('on'), 2000); }

  // ---------- 標高計と、目次（パソコン） ----------
  const TOP_M = 3333, panels = [...pm.querySelectorAll('.pp')].slice(1);
  const alt = document.createElement('div'); alt.className = 'pm-alt'; alt.setAttribute('aria-hidden', 'true'); alt.innerHTML = '<i><u></u></i><span>標高</span><b>0</b><small>m</small>'; document.body.appendChild(alt);
  const name = (p) => (p.classList.contains('pp-hello') ? 'ようこそ' : p.classList.contains('pp-chart') ? '早見表' : p.classList.contains('pp-rule') ? p.querySelector('.pr-no').textContent.replace('入山の心得　', '') + '　' + p.querySelector('.pr-title').textContent : p.classList.contains('pp-coupon') ? 'うちよそ優待券' : p.classList.contains('pp-map') ? '登山鉄道 路線図' : '登頂証明書');
  const toc = document.createElement('nav'); toc.className = 'pm-toc'; toc.setAttribute('aria-label', 'しおりの目次');
  toc.innerHTML = '<p>しおりの目次</p>' + panels.map((p, i) => '<a href="#" data-i="' + i + '">' + esc(name(p)) + '</a>').join(''); document.body.appendChild(toc);
  toc.addEventListener('click', (e) => { const a = e.target.closest('a'); if (!a) return; e.preventDefault(); panels[+a.dataset.i].scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'start' }); });
  const links = [...toc.querySelectorAll('a')];

  // ---------- じゃばら折り：スクロールすると、1枚ずつひらく ----------
  let raf = 0, cur = -1, lastM = -1;
  function fold() {
    raf = 0; const vh = innerHeight; let c = 0;
    panels.forEach((p, i) => {
      const t = p.getBoundingClientRect().top, u = REDUCE ? 1 : Math.max(0, Math.min(1, (vh - t) / (vh * 0.42)));
      if (p._u !== u) { p._u = u; p.style.setProperty('--u', u.toFixed(3)); p.classList.toggle('open', u > 0.97); }
      if (t < vh * 0.45) c = i;
    });
    if (c !== cur) { cur = c; links.forEach((a, i) => a.classList.toggle('on', i === c)); }
    const max = document.documentElement.scrollHeight - vh, k = max > 0 ? Math.min(1, scrollY / max) : 1, m = Math.round(k * TOP_M);
    if (m !== lastM) { lastM = m; alt.querySelector('b').textContent = k > 0.995 ? '山頂' : m.toLocaleString(); alt.querySelector('small').textContent = k > 0.995 ? '' : 'm'; alt.classList.toggle('top', k > 0.995); alt.style.setProperty('--k', k.toFixed(3)); }
  }
  const ask = () => { if (!raf) raf = requestAnimationFrame(fold); };
  addEventListener('scroll', ask, { passive: true }); addEventListener('resize', ask); fold();
  root.classList.add('pm-ready');

  // ---------- スタンプラリー ----------
  const KEY = 'oc-guide-stamps', keyOf = (i) => String(rules[i].title || i);
  let got = []; try { got = JSON.parse(store.get(KEY)) || []; } catch (e) { got = []; }
  const has = (i) => got.includes(keyOf(i));
  const done = () => N > 0 && rules.every((r, i) => has(i));
  const wasDone = done();
  pm.querySelectorAll('.pr-stamp').forEach((b) => { const i = +b.dataset.i; b.style.setProperty('--r', ((i * 37) % 24) - 12 + 'deg'); if (has(i)) { b.classList.add('on', 'set'); b.setAttribute('aria-pressed', 'true'); } });
  pm.addEventListener('click', (e) => {
    const b = e.target.closest('.pr-stamp'); if (!b || b.classList.contains('on')) return;
    const i = +b.dataset.i; got.push(keyOf(i)); store.set(KEY, JSON.stringify(got));
    b.classList.add('on'); b.setAttribute('aria-pressed', 'true'); buzz(25);
    const s = b.closest('.pp'); s.classList.remove('don'); void s.offsetWidth; s.classList.add('don');   // ドン
    cert(true);
  });
  const slots = $('.pe-slots'), msg = $('.pe-msg'), goBtn = $('.pe-go'), endP = $('.pp-end');
  slots.innerHTML = rules.map((r, i) => '<i title="その' + kan(i) + '">' + kan(i) + '</i>').join('');
  function cert(now) {
    const c = rules.filter((r, i) => has(i)).length;
    slots.querySelectorAll('i').forEach((s, i) => s.classList.toggle('on', has(i)));
    panels.forEach((p, i) => { const b = p.querySelector('.pr-stamp'); if (b) links[i].classList.toggle('got', b.classList.contains('on')); });
    if (!N) { msg.textContent = ''; return; }
    if (done()) {
      msg.innerHTML = 'No.' + esc(no) + ' のあなたは、MT. MAYAMA の入山のしおりを、ぜんぶ読みました。<br><b>' + new Date().toLocaleDateString('ja-JP') + '　登頂おめでとう！</b>';
      goBtn.hidden = true;
      if (!endP.classList.contains('top')) { endP.classList.add('top'); if (now) { endP.classList.add('slam'); setTimeout(() => endP.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' }), 500); setTimeout(confetti, 900); } }
    } else {
      msg.innerHTML = 'スタンプ <b>' + c + ' / ' + N + '</b>　あと ' + (N - c) + 'こで登頂！';
      goBtn.hidden = false;
    }
  }
  goBtn.addEventListener('click', () => { const i = rules.findIndex((r, k) => !has(k)); const s = document.getElementById('rule-' + (i + 1)); if (s) s.scrollIntoView({ behavior: REDUCE ? 'auto' : 'smooth', block: 'center' }); });
  cert(false);
  if (wasDone) endP.classList.add('top');

  // ---------- 紙ふぶき（登頂したとき） ----------
  function confetti() {
    if (REDUCE) return;
    const cv = document.createElement('canvas'), x = cv.getContext('2d'); if (!x) return;
    cv.className = 'pm-confetti'; document.body.appendChild(cv);
    const W = (cv.width = innerWidth), H = (cv.height = innerHeight), col = ['#e2412e', '#f4bf17', '#138467', '#26407a'];
    const P = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, w: 6 + Math.random() * 7, h: 9 + Math.random() * 9, vy: 2 + Math.random() * 3, vx: -1 + Math.random() * 2, a: Math.random() * 6, va: -0.2 + Math.random() * 0.4, c: col[Math.floor(Math.random() * 4)] }));
    const t0 = performance.now();
    (function f(now) {
      const t = now - t0; x.clearRect(0, 0, W, H);
      for (const p of P) { p.x += p.vx + Math.sin(p.a) * 0.6; p.y += p.vy; p.a += p.va; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.scale(1, Math.cos(p.a * 1.7)); x.fillStyle = p.c; x.globalAlpha = Math.min(1, (3400 - t) / 600); x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore(); }
      if (t < 3400) requestAnimationFrame(f); else cv.remove();
    })(t0);
  }

  // ---------- うちよそ優待券：横にひっぱって、ちぎる ----------
  const tk = $('.pk-tk');
  if (tk) {
    const doneP = $('.pk-done'); let sx = null, dx = 0;
    const tear = () => { tk.classList.add('torn'); tk.style.transform = ''; buzz([12, 40, 12]); setTimeout(() => { doneP.hidden = false; }, REDUCE ? 0 : 450); };
    tk.addEventListener('pointerdown', (e) => { if (tk.classList.contains('torn')) return; sx = e.clientX; dx = 0; tk.setPointerCapture(e.pointerId); tk.classList.add('pull'); });
    tk.addEventListener('pointermove', (e) => {
      if (sx == null) return; dx = Math.max(0, e.clientX - sx);
      tk.style.transform = 'translateX(' + (dx * 0.55).toFixed(1) + 'px) rotate(' + (dx * 0.025).toFixed(2) + 'deg)';
      if (dx > tk.offsetWidth * 0.4) { sx = null; tk.classList.remove('pull'); tear(); }
    });
    const up = () => { if (sx == null) return; const tap = dx < 6; sx = null; tk.classList.remove('pull'); tk.style.transform = ''; if (tap) tear(); };
    tk.addEventListener('pointerup', up); tk.addEventListener('pointercancel', () => { sx = null; tk.classList.remove('pull'); tk.style.transform = ''; });
    tk.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !tk.classList.contains('torn')) { e.preventDefault(); tear(); } });
    $('.pk-again').addEventListener('click', () => { doneP.hidden = true; tk.classList.remove('torn'); tk.classList.add('again'); setTimeout(() => tk.classList.remove('again'), 600); });
  }
})();
