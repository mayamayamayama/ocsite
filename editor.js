// --- キャラクターデータ（提供された情報をそのまま保持） ---
const allCharacters = {
  "Barnard": {
    name: "Barnard",
    tag: "Male / Human",
    image: "Barnard.png",
    description: "筋骨隆々金髪外人の飄々気さくオジです。\n趣味は音楽制作と映画鑑賞です。\nプロンプトによっては上手く出力出来ない場合がありますので、随時改変してみてください。\n衣装は好きなだけ着脱させてください。",
    prompt: "boy, 1man,handsome,short blonde hair, slightly messy hair,blue eyes, sunglasses,white hoodie,baseball cap, headphones, watch,thick beard,goatee, dog tags,heavy stubble beard, scruffy chin beard, an incognito actor, cargo pants, ,sneakers,muscular, cool,black oversized jacket, layered distressed streetwear, multiple belts, silver chains, fingerless gloves, metallic accessories,dark Y2K punk aesthetic,bulky frame,An outfit with a well-balanced color scheme that avoids looking too dark,dark yellow and black backpack,A rugged, masculine face,smile,Cool and masculine eyes,A rugged, manly, handsome older man,High levels of male hormones,Body hair,The dignity and ruggedness of a mature man, devoid of any lingering traces of boyishness,Mature allure"
  },
  "Mele": {
    name: "Mele",
    tag: "Female / Human",
    image: "mele.png",
    description: "気弱なケモ耳少女です。\n一応絵描き設定です。\n可哀想は可愛いを信条に作られたため基本的にNGはないです。\n性格を出すために表情や姿勢に関するプロンプトが含まれているので、必要によって変更してください。",
    prompt: "girl, solo,blonde hair, medium hair, short hair, messy hair, hair bangs, red eyes, black midium size beret, beret, black oversized sweater, brown jacket, dog tags, pendant,white long bottoms,cork sandals,  (((timid))),((down-turned eyes)),-1.0::blush::,puzzled,-1.5::cool::,Slouching,lacking confidence,Drooping outer corners of the eyes,A bewildered look,Thin eyebrows,((Looks weak)),An anxious look on one's face,slightly open mouth,A slightly frightened look in one's eyes,((Looking down slightly)),-1.0::to thrust one's hands into one's pockets::,-0.5::Outward curl of hair::,Retaining a touch of childishness,Goat-like small Blonde ears,Eyes that do not open fully"
  }
};

// --- インデックスカードの動的生成 ---
const grid = document.getElementById('character-grid');

Object.keys(allCharacters).forEach(id => {
  const char = allCharacters[id];
  const card = document.createElement('div');
  card.className = 'card';
  card.setAttribute('data-id', id);

  card.innerHTML = `
    <div class="card-img-container">
      <img class="card-img" src="${char.image}" alt="${char.name}" oncontextmenu="return false;" ondragstart="return false;">
    </div>
    <div class="card-info">
      <h2 class="card-name">${char.name}</h2>
      <span class="card-tag"># ${char.tag}</span>
    </div>
  `;

  // カードタップで滑らかに詳細オーバーレイを表示
  card.addEventListener('click', () => openDetail(id));
  grid.appendChild(card);
});

// --- 詳細画面の開閉処理 ---
const overlay = document.getElementById('detail-overlay');
const profileBox = document.getElementById('profile-box');
const closeBtn = document.getElementById('close-detail-btn');

function openDetail(id) {
  const char = allCharacters[id];
  if (!char) return;

  profileBox.innerHTML = `
    <div class="profile-img-container">
      <img class="profile-img" src="${char.image}" alt="${char.name}">
    </div>
    <div class="profile-info">
      <h1 class="profile-name">${char.name}</h1>
      <span class="profile-tag"># ${char.tag}</span>
      
      <div class="section-title">Story / Profile</div>
      <div class="profile-desc">${char.description}</div>
      
      <div class="section-title">Prompt / Tags</div>
      <pre class="prompt-box">${char.prompt}</pre>
    </div>
  `;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // 背後のスクロールを固定
}

closeBtn.addEventListener('click', closeDetail);

function closeDetail() {
  overlay.classList.remove('active');
  document.body.style.overflow = '';
}

// ESCキーでも詳細画面を閉じられるように設定
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && overlay.classList.contains('active')) {
    closeDetail();
  }
});

// --- コラージュ素材のドラッグ＆ドロップ機能 ---
const items = document.querySelectorAll('.collage-item');
let activeItem = null;
let startX, startY, initialX, initialY;

items.forEach(item => {
  item.addEventListener('mousedown', (e) => {
    activeItem = item;
    startX = e.clientX;
    startY = e.clientY;

    const rect = item.getBoundingClientRect();
    const parentRect = document.getElementById('hero-section').getBoundingClientRect();

    initialX = rect.left - parentRect.left;
    initialY = rect.top - parentRect.top;

    item.style.right = 'auto';
    item.style.bottom = 'auto';
    item.style.left = initialX + 'px';
    item.style.top = initialY + 'px';

    e.preventDefault();
  });
});

document.addEventListener('mousemove', (e) => {
  if (!activeItem) return;
  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  activeItem.style.left = (initialX + dx) + 'px';
  activeItem.style.top = (initialY + dy) + 'px';
});

document.addEventListener('mouseup', () => {
  activeItem = null;
});

// 座標出力
document.getElementById('export-btn').addEventListener('click', () => {
  let output = "";
  items.forEach((item) => {
    const id = item.getAttribute('data-id');
    output += `[${id}] -> top: ${item.style.top}, left: ${item.style.left}\n`;
  });
  alert("現在の配置座標:\n\n" + output);
  console.log(output);
});
