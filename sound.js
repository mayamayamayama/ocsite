// sound.js — サウンドトラック（MAYAMA BOOMBOX）の曲リスト
//
// 足しかた（キャラを足すときと同じ）：
//   1. 追加ツールの「サウンドトラック」で、コードを作ってコピーする
//   2. GitHub でこのファイルを開いて、えんぴつのマークで編集する
//   3. 下の「const sound = [」のすぐ下に貼って、「Commit changes」
//
// ・chara：editor.js のキャラの名前（"Barnard" など）。そのキャラのカセットテープになって、ラベルにキャラの絵が出ます
// ・a_ が A面、b_ が B面（B面はなくてもOK）。url は、YouTube か Spotify の曲のページのアドレス
// ・曲を入れたキャラだけが、カセットになって並びます（並びは editor.js のキャラの順）

const sound = [
  {
    chara: "Barnard",
    a_title: "Baby",
    a_artist: "Justin Bieber",
    a_url: "https://youtu.be/kffacxfA7G4?si=v8iykyuQb-iXlB1G",
    b_title: "POP SONG",
    b_artist: "米津玄師",
    b_url: "https://youtu.be/mHP6-D-yBEw?si=Ki_GKCPhb3hXz4p2",
  },
  {
    chara: "Mele",
    a_title: "シェードの埃は延長",
    a_artist: "ずっと真夜中で良いのに。",
    a_url: "https://youtu.be/zjEMFuj23B4?si=lXE05RV-Y2wod5Nh",
    b_title: "そのまんまそのまんま、そのままずっとそのまま",
    b_artist: "きくお",
    b_url: "https://youtu.be/CwP1pT6aDcM?si=-oI6kgA1RF_ZturM",
  },
  {
    chara: "Deseo",
    a_title: "RED OUT",
    a_artist: "米津玄師",
    a_url: "https://youtu.be/mKYpA1-5NNs?si=btEbjfx040chKyR-",
    b_title: "僕らまだアンダーグラウンド",
    b_artist: "Eve",
    b_url: "https://youtu.be/nBteO-bU78Y?si=SJd6EbAPbSmHbuIh",
  },
  {
    chara: "Arceo",
    a_title: "レプリカント",
    a_artist: "ヨルシカ",
    a_url: "https://youtu.be/nMPQoiZoN2U?si=MnMFAlZzJS-3NyP4",
    b_title: "ヒューマノイド",
    b_artist: "ずっと真夜中で良いのに。",
    b_url: "https://youtu.be/GAB26GgJ8V8?si=cNYrPU0hyBzLNA4F",
  },
  {
    chara: "Dylan",
    a_title: "老人と海",
    a_artist: "ヨルシカ",
    a_url: "https://youtu.be/WwnZeQiI6hQ?si=v26W-Mv2gSbxSG_V",
    b_title: "ゴーゴー幽霊船",
    b_artist: "米津玄師",
    b_url: "https://youtu.be/2PqxOytUjz0?si=orQBux3Xk23Yh3K1",
  },
  {
    chara: "Maya",
    a_title: "MAD HEAD LOVE",
    a_artist: "米津玄師",
    a_url: "https://youtu.be/xCIJJ2Rb368?si=p6p2zLo8C0wmuFXi",
    b_title: "花弁、それにまつわる音声",
    b_artist: "あばらや",
    b_url: "https://youtu.be/LW1KBCgvEPQ?si=zJNqmr7SmuGtFzQz",
  },
  {
    chara: "Waka",
    a_title: "tummy",
    a_artist: "RADWIMPS",
    a_url: "https://youtu.be/34a3m8-4EvY?si=iKfpuKwkV92UeI4e",
    b_title: "New Man",
    b_artist: "Ed Sheeran",
    b_url: "https://youtu.be/EwzD8U4u76k?si=Lris5HP51jC4dCwR",
  },
  {
    chara: "Nita",
    a_title: "DARMA GRAND PRIX",
    a_artist: "RADWIMPS",
    a_url: "https://youtu.be/pqZqYNPqaL0?si=S9dEaroSvxv3Xoef",
    b_title: "Azalea",
    b_artist: "米津玄師",
    b_url: "https://youtu.be/FqWBQv7h_3I?si=mfC7x0gwcKqX7o7d",
  },
  {
    chara: "Ghazal",
    a_title: "おしゃかしゃま",
    a_artist: "RADWIMPS",
    a_url: "https://youtu.be/7MaF-bWeLGw?si=l2WFoK8Nm-iTMA-1",
    b_title: "FLY AGAIN",
    b_artist: "MAN WITH A MISSION",
    b_url: "https://youtu.be/1QEKNvw4DPU?si=hpJxIsh0JPwID5p3",
  },
];
