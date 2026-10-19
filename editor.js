// キャラクターデータ
const characters = {
  "Barnard": {
    name: "Barnard",
    tag: "Male / Human",
    image: "Barnard.png",
    description: "Age:38/Height:188\nBirthday:08/29\nHobbys:音楽制作,映画鑑賞\nInformation:出力時にプロンプトによっては上手く衣装が反映されないことがあるので、適宜衣装を消して調整をお願いします。",
    prompt: "boy, 1man,handsome,short blonde hair, slightly messy hair,blue eyes, sunglasses,white hoodie,baseball cap, headphones, watch,thick beard,goatee, dog tags,heavy stubble beard, scruffy chin beard, an incognito actor, cargo pants, ,sneakers,muscular, cool,black oversized jacket, layered distressed streetwear, multiple belts, silver chains, fingerless gloves, metallic accessories,dark Y2K punk aesthetic,bulky frame,An outfit with a well-balanced color scheme that avoids looking too dark,dark yellow and black backpack,A rugged, masculine face,smile,Cool and masculine eyes,A rugged, manly, handsome older man,High levels of male hormones,Body hair,The dignity and ruggedness of a mature man, devoid of any lingering traces of boyishness,Mature allure"
  },
  "Mele": {
    name: "Mele",
    tag: "Female / Human",
    image: "mele.png",
    description: "Age:16/Height:152\nBirthday:04/15\nHobbys:スケッチ,昼寝\nInformation:気弱なキャラクターを立たせるために表情に関するプロットがいくつか採用されてます。状況によって消していただいて結構です。",
  prompt: "girl, solo,blonde hair, medium hair, short hair, messy hair, hair bangs, red eyes, black midium size beret, beret, black oversized sweater, brown jacket, dog tags, pendant,white long bottoms,cork sandals,  (((timid))),((down-turned eyes)),-1.0::blush::,puzzled,-1.5::cool::,Slouching,lacking confidence,Drooping outer corners of the eyes,A bewildered look,Thin eyebrows,((Looks weak)),An anxious look on one's face,slightly open mouth,A slightly frightened look in one's eyes,((Looking down slightly)),-1.0::to thrust one's hands into one's pockets::,-0.5::Outward curl of hair::,Retaining a touch of childishness,Goat-like small Blonde ears,Eyes that do not open fully"
  },
  "Deseo": {
    name: "Deseo",
    tag: "Male / Non-human",
    image: "deseo.png",
    description: "Age:21/Height:196\nBirthday:12/28\nHobbys:散歩,服屋巡り\nInformation:安定出力難易度高めです。ケモノモードよりもアニメモードのほうが私の場合安定して出力できました。\nリアルな動物のように描写される場合、ネガティブプロンプトに「realistic」等を入力してください。",
    prompt: "boy, 1 furry man,handsome,black panther furry,sunglasses,baseball cap,watch,dog tags,grey Cargo jogger pants, very very muscular, cool,very oversized worn-out red Basketball jersey, jacket ::,tie a jacket around your waist,layered distressed streetwear, multiple leather belts, golden chains, fingerless black gloves, metallic accessories,dark Y2K punk aesthetic,very very bulky frame,dark ,A rugged, masculine face,Cool and masculine eyes,A rugged, manly, handsome older man,High levels of male hormones,Body hair,The dignity and ruggedness of a mature man, devoid of any lingering traces of boyishness,Mature allure,A face that looks, if only slightly, as if the person is in a bad mood,side eyes,calm,An annoyed face,Baring its fangs and acting in a threatening manner,A single scratch on the right eye,golden eyes,Rolling up one's sleeves,Smartphone,Ear piercing,Lip ling　piercing,An armlet on the upper arm,A gold ring ornament on the tail,Brown work boots, not smile"
  }
};

// 一覧カードの描画
const grid = document.getElementById('character-grid');
grid.innerHTML = ""; // 初期化

Object.keys(characters).forEach(id => {
  const char = characters[id];
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = () => showDetail(id, true);

  card.innerHTML = `
    <div class="card-img-container">
      <img class="card-img" src="${char.image}" alt="${char.name}" oncontextmenu="return false;" ondragstart="return false;">
    </div>
    <div class="card-info">
      <h2 class="card-name">${char.name}</h2>
      <span class="card-tag"># ${char.tag}</span>
    </div>
  `;
  grid.appendChild(card);
});

// 詳細表示の切り替え処理
function showDetail(id, pushHistory = true) {
  const char = characters[id];
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

  document.title = `${char.name} - OC ARCHIVE`;
  
  // HTML側のID名（index-screen / detail-screen）に合わせました！
  document.getElementById('index-screen').classList.remove('active');
  document.getElementById('detail-screen').classList.add('active');
  window.scrollTo(0, 0);

  // スマホの「戻る」ボタンが効くように履歴を追加
  if (pushHistory) {
    history.pushState({ screen: 'detail', id: id }, '', `#${id}`);
  }
}

// 一覧表示の切り替え処理
function showIndex(pushHistory = true) {
  document.getElementById('detail-screen').classList.remove('active');
  document.getElementById('index-screen').classList.add('active');
  document.title = "OC ARCHIVE";
  window.scrollTo(0, 0);

  if (pushHistory) {
    history.pushState({ screen: 'index' }, '', window.location.pathname);
  }
}

// 「← BACK TO INDEX」ボタンが押されたとき
document.getElementById('back-btn').onclick = () => {
  showIndex(true);
};

// スマホの「戻る」「進む」ボタンが押されたときの処理
window.onpopstate = (event) => {
  if (event.state && event.state.screen === 'detail') {
    showDetail(event.state.id, false);
  } else {
    showIndex(false);
  }
};



