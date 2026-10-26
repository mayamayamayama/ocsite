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
    image: "1deseo.png",
    hoverShow: "profile",
    description: "Age:21/Height:196\nBirthday:12/28\nHobbys:散歩,服屋巡り\nInformation:安定出力難易度高めです。ケモノモードよりもアニメモードのほうが私の場合安定して出力できました。\nリアルな動物のように描写される場合、ネガティブプロンプトに「realistic」等を入力してください。",
    prompt: "boy, 1 furry man,handsome,black panther furry,sunglasses,baseball cap,watch,dog tags,grey Cargo jogger pants, very very muscular, cool,very oversized worn-out red Basketball jersey, jacket ::,tie a jacket around your waist,layered distressed streetwear, multiple leather belts, golden chains, fingerless black gloves, metallic accessories,dark Y2K punk aesthetic,very very bulky frame,dark ,A rugged, masculine face,Cool and masculine eyes,A rugged, manly, handsome older man,High levels of male hormones,Body hair,The dignity and ruggedness of a mature man, devoid of any lingering traces of boyishness,Mature allure,A face that looks, if only slightly, as if the person is in a bad mood,side eyes,calm,An annoyed face,Baring its fangs and acting in a threatening manner,A single scratch on the right eye,golden eyes,Rolling up one's sleeves,Smartphone,Ear piercing,Lip ling　piercing,An armlet on the upper arm,A gold ring ornament on the tail,Brown work boots, not smile"
  },
  "Arceo": {
    name: "Arceo",
    tag: "MALE/NON-HUMAN",
    image: "arceo.png",
    hoverShow: "profile",
    description: "Age:24/Height:200\nBirthday:08/07\nHobbys:読書/運動\nInformation:出力難易度激高だと思います。\n複雑なプロンプトなので適宜改変お願いします。\n私の場合出力モードはケモノです。",
    prompt: "((boy, solo, anthropomorphic doberman cyborg:1.5)), highly muscular build, heavily armored plating, dark grey and matte black primary armor, vibrant yellow secondary color accents and glowing panels, intricate mechanical joint structures. (Anubis-style full face mask head:1.4), pointy ears with internal gold accents, black armor plating with detailed panel lines, (smooth solid face plate without eye slits:1.6), (no eyes:1.5), intricate mechanical components within the mask, (glowing yellow triangular emblem on forehead:1.5). Massively muscled upper body armor with heavily defined pectoral and abdominal plating, Heavily armored arms, mechanical joints, articulated gauntlets,Wrist armor cuffs with detailed mechanical elements. (Primary armor color is gunmetal grey and matte black:1.3), (secondary accent color is vibrant yellow:1.4), glowing yellow vents, detailed technical panels,Intricate and heavy detailed rendering,1.4::digitigrade,strong legs,::"
  },
  "Dylan": {
    name: "Dylan",
    tag: "MALE/NON-HUMAN",
    image: "dylan.png",
    hoverShow: "profile",
    description: "Age:27/Height:211\nBirthday:07/20\nHobbys:水泳/筋トレ\nInformation:Hな絵を生成するときは「A killer whale-like pink penis emerges from a vertically split genital opening」を追加してください。",
    prompt: "boy, 1 furry man,handsome,orca furry,green Workwear,Beige tank top,work clothes,They have their work clothes wrapped around their waist,dog tags,very very muscular, cool,very very bulky frame,dark ,A rugged, masculine face,Cool and masculine eyes,A rugged, manly, handsome man,High levels of male hormones,The dignity and ruggedness of a mature man, devoid of any lingering traces of boyishness,calm,Rolling up one's sleeves,Ear piercing,Lip ling　piercing,An armlet on the upper arm,A silver ring ornament on the tail,Brown work boots,2::eyeless,"
  },
  "Maya": {
    name: "Maya",
    tag: "PERSONA/HUMAN",
    image: "maya.png",
    hoverShow: "profile",
    description: "Age:17/Height:180\nBirthday:02/21\nHobbys:発狂/インターネット\nInformation:代理です。性別不詳なのでお好きにどうぞ。",
    prompt: "androgynous,\ngreen eyes, otaku,1.5::A geeky smile::, Lewd,mole under mouth, mole under eye,\nwhite hair, red inner hair, red highlights, red gradient hair, red hair intake, messy hair, short hair with long hair hanging between eyes, long hairlocks, facial hairlocks, \npatterned red bandana, headscarf,Mountaineering Equipment\n, brown tactical boots,\nred backpack, straps, carabiner, attached water bottle,long hair,long messy ponytail, hair tie, back hair,Snaggletooth,climbing shoes,low ponytail,low-tied hair,Slightly Voluminous ponytail,1.3::Slightly suggestive eyes::,"
  },
  "Waka": {
    name: "Waka",
    tag: "MALE/HUMAN",
    image: "waka.png",
    hoverShow: "profile",
    description: "Age:37/Height:194\nBirthday:03/21\nHobbys:家族を観察すること/キャンプ\nInformation:ニタとの夫妻設定です。\n誘拐してHな絵を生成していただく際はご留意いただけると幸いです。",
    prompt: "boy, very muscular,very bulky frame,1.1::strong arms::,Slightly beard stubble,A calm atmosphere, An expression that reveals no thoughts,Corners of the mouth that neither turn up nor down,verging on black hair,Fluffy hair,Messy hair,Center part,long Wolf cut,A Very long hair at the back,his hair is tied back with an elastic band,The hair at the back falls over both shoulders,oversized worn-out T-shirt with a mysterious print on it,Baggy sweatpants,flip flops,oversized T-shirt,bracelet,Listsband,Ear cuff,They have a checkered garment wrapped around their waist,Looks sluggish,A cool,Eyes like a boy’s,mint green eyes,half-closed eyes, sleepy eyes, heavy eyelids,"
  },
  "Nita": {
    name: "Nita",
    tag: "FEMALE/HUMAN",
    image: "nita.png",
    hoverShow: "profile",
    description: "Age:35/Height:166\nBirthday:10/02\nHobbys:料理/バイク\nInformation:ワカとの夫妻設定です。\n誘拐してHな絵を生成していただく際はご留意いただけると幸いです。",
    prompt: "girl,white hair, messy hair, medium hair, looped hair, hair loop, folded hair, hair clip, hair clamp, claw clip, Hair at the back, folded over once, hair spouting,  long sidelocks, facial hairlocks, antenna hair,green eyes,cool eyes,Upward-slanting eyes,A smile that suggested exasperation,Midriff-baring fashion,30s,black short Cropped tops,An unapproachable atmosphere\n,Upward-slanting ,low-ponytail ,1.4::black jacket::, looking worn and bedraggled,They have a checkered garment wrapped around their waist,sneakers,A ring on the ring finger,Mature woman,strong women,competitive personality,Married woman,Cool atmosphere,A smile that suggested exasperation,A bad-boy vibe,"
  },
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



