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
];
