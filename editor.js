// 各キャラクターの正確なプロフィールデータ
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

// --- 詳細画面を開く処理 ---
function openDetail(id) {
  const char = allCharacters[id];
  if (!char) return;

  const profileBox = document.getElementById('profile-box');
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

  const overlay = document.getElementById('detail-overlay');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden'; // 背景のスクロールをロック
}

// --- 詳細画面を閉じる処理 ---
function closeDetail() {
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('active');
  document.body.style.overflow = ''; // スクロールロックを解除
}

// ESCキーが押されたときにも詳細画面を閉じる
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeDetail();
  }
});

