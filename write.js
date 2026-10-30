// write.js — OC ARCHIVE 書きこみ帳（スマホで書いて「公開」を押すと、GitHub に保存されて、サイトが更新されます）
// ・最初の1回だけ、GitHub の「鍵（トークン）」をこのページに覚えさせます。鍵は、この端末の中だけに保存されます
// ・構図置き場：画像を選ぶと、NovelAI の画像ならベースプロンプトを自動で読みこみます。画像は自動で軽くしてから送ります
// ・データは data/prompts.json、画像は prompts/ フォルダに入ります（フォルダは自動でできます）
(window.OC_LOADED = window.OC_LOADED || []).push('write');

(function () {
  const DATA = 'data/prompts.json', DIR = 'prompts/', KEY = 'oc-write', MAX = 1600;
  const $ = (s) => document.querySelector(s), esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => '&#' + c.charCodeAt(0) + ';');
  let cfg = {}, data = null, sha = null, order = null, file = null, editing = null, busyNow = false;
  const local = {};   // 公開したばかりの画像（サイトに出るまでのあいだ、ここから見せる）
  try { cfg = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { cfg = {}; }

  // ---------- リポジトリ（サイトのアドレスから、自動で見当をつける） ----------
  function guess() {
    const m = location.hostname.match(/^([^.]+)\.github\.io$/i); if (!m) return { owner: '', repo: '' };
    const seg = location.pathname.split('/').filter(Boolean), first = seg.length > 1 || (seg[0] && !/\.[a-z0-9]+$/i.test(seg[0])) ? seg[0] : '';
    return { owner: m[1], repo: first || m[1] + '.github.io' };
  }
  const g = guess(); $('#repo').value = cfg.owner ? cfg.owner + '/' + cfg.repo : g.owner ? g.owner + '/' + g.repo : '';
  if (cfg.token) $('#token').value = cfg.token;

  // ---------- GitHub とのやりとり ----------
  async function api(path, opt) {
    opt = opt || {};
    let r;
    try {
      r = await fetch('https://api.github.com/repos/' + cfg.owner + '/' + cfg.repo + path, { method: opt.method || 'GET', cache: 'no-store',
        headers: Object.assign({ Authorization: 'Bearer ' + cfg.token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' }, opt.body ? { 'Content-Type': 'application/json' } : {}),
        body: opt.body ? JSON.stringify(opt.body) : undefined });
    } catch (e) { throw new Error('ネットにつながっていないかも。電波のいいところで、もう一度押してね'); }
    if (r.status === 404 && opt.ok404) return null;
    if (!r.ok) {
      const why = { 401: '鍵がちがうか、期限が切れています。「つなぐ」から、鍵を入れなおしてね', 403: '鍵に「書きこみ」の許可がないみたい。鍵の Contents を「Read and write」にしてね',
        404: 'リポジトリが見つかりません。名前と、鍵で選んだリポジトリを確かめてね', 409: 'ほかの更新とぶつかりました。もう一度押してね', 422: 'ほかの更新とぶつかりました。少し待って、もう一度押してね' }[r.status];
      throw new Error(why || 'うまくいきませんでした（' + r.status + '）。少し待って、もう一度押してね');
    }
    return r.status === 204 ? null : r.json();
  }
  const enc = (s) => { const b = new TextEncoder().encode(s); let x = ''; for (let i = 0; i < b.length; i += 32768) x += String.fromCharCode.apply(null, b.subarray(i, i + 32768)); return btoa(x); };
  const dec = (b) => new TextDecoder().decode(Uint8Array.from(atob(b.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
  const ref = () => '?ref=' + encodeURIComponent(cfg.branch);
  async function loadData() {
    const f = await api('/contents/' + DATA + ref(), { ok404: true });
    if (f) { data = JSON.parse(dec(f.content)); sha = f.sha; } else { data = {}; sha = null; }
    data.items = Array.isArray(data.items) ? data.items : []; data.lobby = data.lobby || null; order = null;
  }
  async function saveData(msg) {
    const body = { message: msg, content: enc(JSON.stringify(data, null, 1) + '\n'), branch: cfg.branch }; if (sha) body.sha = sha;
    sha = (await api('/contents/' + DATA, { method: 'PUT', body })).content.sha;
  }
  async function putFile(path, b64, msg) {
    const f = await api('/contents/' + path + ref(), { ok404: true }), body = { message: msg, content: b64, branch: cfg.branch }; if (f) body.sha = f.sha;
    return api('/contents/' + path, { method: 'PUT', body });
  }
  async function delFile(path, msg) {
    if (!path || path.indexOf(DIR) !== 0) return;   // 書きこみ帳が入れたものだけ消す
    const f = await api('/contents/' + path + ref(), { ok404: true }); if (f) await api('/contents/' + path, { method: 'DELETE', body: { message: msg, sha: f.sha, branch: cfg.branch } });
  }

  // ---------- 画面の表示 ----------
  function busy(on, text) { busyNow = on; $('#busy').hidden = !on; if (text) $('#busy-t').textContent = text; }
  function note(text, bad) { const n = $('#note'); n.textContent = text; n.className = 'note' + (bad ? ' bad' : ' ok'); n.hidden = !text; if (text) n.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
  async function run(steps) {   // 何かをするときは、ここを通す（とちゅうの表示と、失敗したときの知らせ）
    if (busyNow) return; note('');
    try { await steps((t) => busy(true, t)); } catch (e) { note(e.message || String(e), true); } finally { busy(false); }
  }
  function showConnected(on) {
    $('#setup').hidden = on; $('#app').hidden = !on;
    $('#who').textContent = on ? cfg.owner + '/' + cfg.repo + '（' + cfg.branch + '）' : '';
  }
  const src = (p) => local[p] || p + '?t=' + Date.now();
  document.addEventListener('error', (e) => {   // サイトにまだ出ていない画像（公開して1〜2分のあいだ）は、GitHub から直接見せる
    const im = e.target, p = im.tagName === 'IMG' && im.getAttribute('src'); if (!p || im.dataset.api || !cfg.token || p.indexOf(DIR) !== 0) return;
    im.dataset.api = 1; api('/contents/' + p.split('?')[0] + ref(), { ok404: true }).then((f) => { if (f && f.content) im.src = 'data:image/' + (/\.jpe?g$/.test(p.split('?')[0]) ? 'jpeg' : 'webp') + ';base64,' + f.content.replace(/\s/g, ''); }).catch(() => {});
  }, true);
  function list() {
    const L = order || data.items;
    $('#count').textContent = L.length;
    $('#list').innerHTML = L.length ? L.map((it, i) => '<li data-id="' + esc(it.id) + '"><img src="' + esc(src(it.image)) + '" alt="" loading="lazy"><div class="t"><b>' + esc(it.title || 'Untitled') + '</b><small>' + esc(it.date || '') + ' ・ ROOM ' + String(i + 1).padStart(2, '0') + '</small></div>' +
      '<div class="b"><button type="button" data-a="up" aria-label="上へ">↑</button><button type="button" data-a="down" aria-label="下へ">↓</button><button type="button" data-a="edit">直す</button><button type="button" data-a="del" class="danger">外す</button></div></li>').join('') :
      '<li class="empty">まだ展示はありません。上の「新しい作品を展示する」から入れてね</li>';
    $('#saveorder').hidden = !order;
    const lb = data.lobby && data.lobby.image; $('#lobby-img').src = lb ? src(lb) : ''; $('#lobby-img').hidden = !lb; $('#lobby-none').hidden = !!lb;
  }

  // ---------- つなぐ ----------
  async function connect(quiet) {
    const m = $('#repo').value.trim().replace(/^https?:\/\/github\.com\//, '').replace(/\/+$/, '').split('/');
    cfg.token = $('#token').value.trim(); cfg.owner = m[0] || ''; cfg.repo = m[1] || '';
    if (!cfg.owner || !cfg.repo || !cfg.token) { if (!quiet) note('リポジトリの名前と、鍵の両方を入れてね', true); return; }
    await run(async (st) => {
      st('GitHub につないでいます…');
      const r = await api(''); cfg.branch = r.default_branch || 'main';
      st('展示のリストを読みこんでいます…'); await loadData();
      try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* 覚えられなくても、今は使える */ }
      showConnected(true); list(); if (!quiet) note('つながりました！');
    });
  }
  $('#connect').addEventListener('click', () => connect(false));
  $('#reconnect').addEventListener('click', () => showConnected(false));
  $('#forget').addEventListener('click', () => {
    if (!confirm('この端末から鍵を消しますか？（GitHub の鍵そのものは消えません）')) return;
    try { localStorage.removeItem(KEY); } catch (e) { /* なにもしない */ } cfg = {}; $('#token').value = ''; showConnected(false); note('この端末から鍵を消しました');
  });

  // ---------- 画像：軽くする・NovelAI のプロンプトを読む ----------
  async function shrink(f, max) {
    const bmp = window.createImageBitmap ? await createImageBitmap(f) : await new Promise((ok, ng) => { const im = new Image(); im.onload = () => ok(im); im.onerror = ng; im.src = URL.createObjectURL(f); });
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height)), w = Math.round(bmp.width * k), h = Math.round(bmp.height * k), c = document.createElement('canvas');
    c.width = w; c.height = h; c.getContext('2d').drawImage(bmp, 0, 0, w, h);
    let blob = await new Promise((ok) => c.toBlob(ok, 'image/webp', 0.86)), ext = 'webp';
    if (!blob || blob.type !== 'image/webp') { blob = await new Promise((ok) => c.toBlob(ok, 'image/jpeg', 0.9)); ext = 'jpg'; }
    const b64 = await new Promise((ok) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(blob); });
    return { b64, ext, w, h, url: URL.createObjectURL(blob) };
  }
  async function naiPrompt(f) {   // NovelAI の PNG には、プロンプトが文字で入っている
    try {
      const u = new Uint8Array(await f.arrayBuffer()); if (u[0] !== 0x89 || u[1] !== 0x50 || u[2] !== 0x4e) return '';
      const dv = new DataView(u.buffer), lat = new TextDecoder('latin1'), utf = new TextDecoder(), T = {};
      for (let p = 8; p + 8 <= u.length;) {
        const n = dv.getUint32(p), type = lat.decode(u.subarray(p + 4, p + 8)), d = u.subarray(p + 8, p + 8 + n);
        if (type === 'tEXt') { const z = d.indexOf(0); T[lat.decode(d.subarray(0, z))] = utf.decode(d.subarray(z + 1)); }
        if (type === 'iTXt') { const z = d.indexOf(0); if (!d[z + 1]) { let q = d.indexOf(0, z + 3) + 1; q = d.indexOf(0, q) + 1; T[lat.decode(d.subarray(0, z))] = utf.decode(d.subarray(q)); } }
        if (type === 'IEND') break; p += 12 + n;
      }
      let c = {}; try { c = JSON.parse(T.Comment || '{}'); } catch (e) { /* なにもしない */ }
      return (c.v4_prompt && c.v4_prompt.caption && c.v4_prompt.caption.base_caption) || c.prompt || T.Description || '';
    } catch (e) { return ''; }
  }

  // ---------- 構図置き場：入れる・直す ----------
  const form = $('#form');
  function openForm(it) {
    editing = it || null; file = null; form.hidden = false; $('#newbtn').hidden = true;
    $('#f-title').value = it ? it.title || '' : ''; $('#f-prompt').value = it ? it.prompt || '' : '';
    $('#f-img').value = ''; $('#f-prev').src = it ? src(it.image) : ''; $('#f-prev').hidden = !it; $('#f-hint').textContent = '';
    $('#f-head').textContent = it ? '作品を直す' : '新しい作品を展示する'; $('#f-go').textContent = it ? '直して公開する' : '公開する';
    form.scrollIntoView({ behavior: 'smooth' });
  }
  function closeForm() { form.hidden = true; $('#newbtn').hidden = false; editing = null; file = null; }
  $('#newbtn').addEventListener('click', () => openForm(null));
  $('#f-cancel').addEventListener('click', closeForm);
  $('#f-img').addEventListener('change', async (e) => {
    file = e.target.files[0] || null; if (!file) return;
    $('#f-prev').src = URL.createObjectURL(file); $('#f-prev').hidden = false;
    const p = await naiPrompt(file);
    if (p) { $('#f-prompt').value = p; $('#f-hint').textContent = '✓ 画像から、ベースプロンプトを読みこみました（直してもOK）'; }
    else $('#f-hint').textContent = 'この画像にはプロンプトが入っていなかったので、下に貼りつけてね';
  });
  $('#f-go').addEventListener('click', () => run(async (st) => {
    const title = $('#f-title').value.trim() || 'Untitled', prompt = $('#f-prompt').value.trim();
    if (!editing && !file) throw new Error('画像を選んでね');
    if (!prompt) throw new Error('ベースプロンプトを入れてね');
    let img = null, id = editing ? editing.id : 'p' + Date.now().toString(36);
    if (file) {
      st('画像を軽くしています…'); img = await shrink(file, MAX);
      st('画像を送っています…（大きいと少しかかります）');
      const path = DIR + id + '-' + Date.now().toString(36) + '.' + img.ext; await putFile(path, img.b64, '構図置き場：画像「' + title + '」'); img.path = path; local[path] = img.url;
    }
    st('展示のリストを更新しています…'); await loadData();
    const d = new Date(), today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    let old = null;
    if (editing) {
      const it = data.items.find((x) => x.id === id); if (!it) throw new Error('その作品が見つかりませんでした（別の端末で外したかも）');
      it.title = title; it.prompt = prompt; if (img) { old = it.image; it.image = img.path; it.w = img.w; it.h = img.h; }
    } else data.items.unshift({ id, title, prompt, image: img.path, w: img.w, h: img.h, date: today });
    await saveData('構図置き場：「' + title + '」を' + (editing ? '直しました' : '展示'));
    if (old) { st('前の画像を片づけています…'); await delFile(old, '構図置き場：前の画像を片づけ').catch(() => {}); }
    closeForm(); list(); note('公開しました！ サイトに出るまで、1〜2分かかります');
  }));

  // ---------- 一覧：直す・外す・並べかえ ----------
  $('#list').addEventListener('click', (e) => {
    const b = e.target.closest('button'), li = e.target.closest('li[data-id]'); if (!b || !li) return;
    const L = order || data.items.slice(), i = L.findIndex((x) => x.id === li.dataset.id), it = L[i];
    if (b.dataset.a === 'edit') return openForm(it);
    if (b.dataset.a === 'up' || b.dataset.a === 'down') { const j = i + (b.dataset.a === 'up' ? -1 : 1); if (j < 0 || j >= L.length) return; [L[i], L[j]] = [L[j], L[i]]; order = L; return list(); }
    if (b.dataset.a === 'del') {
      if (!confirm('「' + (it.title || 'Untitled') + '」を展示から外しますか？（画像も消えます）')) return;
      run(async (st) => {
        st('展示から外しています…'); await loadData(); data.items = data.items.filter((x) => x.id !== it.id); await saveData('構図置き場：「' + (it.title || '') + '」を外しました');
        st('画像を片づけています…'); await delFile(it.image, '構図置き場：画像を片づけ').catch(() => {});
        list(); note('外しました');
      });
    }
  });
  $('#saveorder').addEventListener('click', () => run(async (st) => {
    const ids = order.map((x) => x.id); st('並び順を公開しています…'); await loadData();
    data.items.sort((a, b) => (ids.indexOf(a.id) + 1 || 1e9) - (ids.indexOf(b.id) + 1 || 1e9)); await saveData('構図置き場：並び順を変えました');
    list(); note('並び順を公開しました！');
  }));

  // ---------- ロビーの作品 ----------
  $('#lobby-file').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return; e.target.value = '';
    run(async (st) => {
      st('画像を軽くしています…'); const img = await shrink(f, 2000);
      st('画像を送っています…'); const path = DIR + 'lobby-' + Date.now().toString(36) + '.' + img.ext; await putFile(path, img.b64, '構図置き場：ロビーの作品'); local[path] = img.url;
      st('ロビーをかざりつけています…'); await loadData(); const old = data.lobby && data.lobby.image; data.lobby = { image: path, w: img.w, h: img.h }; await saveData('構図置き場：ロビーの作品を変えました');
      if (old) await delFile(old, '構図置き場：前のロビーの作品を片づけ').catch(() => {});
      list(); note('ロビーの作品を変えました！ サイトに出るまで、1〜2分かかります');
    });
  });

  // ---------- タブ（まだ構図置き場だけ） ----------
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => { if (b.disabled) return; }));
  addEventListener('beforeunload', (e) => { if (busyNow) { e.preventDefault(); e.returnValue = ''; } });

  if (cfg.token && cfg.owner) connect(true); else showConnected(false);
})();
