// kozu.js — 構図置き場の作品リスト（キャラクターを足すときの editor.js と同じように、ここに書き足してね）
//
// 足しかた：
//   1. 画像を、index.html と同じ場所にアップロードする（例：kozu1.png）
//   2. GitHub でこのファイルを開いて、えんぴつのマークで編集する
//   3. 下の { 〜 }, のかたまりをコピーして、すぐ下に貼りつけて、中身を書きかえる
//   4. 「Commit changes」を押す
//
// ・title：作品のタイトル
// ・image：画像の名前（"" のあいだは、展示されません）
// ・prompt：公開するベースプロンプト。` と ` のあいだに貼りつけてね（絵柄のタグなど、見せたくないタグは消してから）
// ・上に書いたものほど、展示室の手前（ROOM 01）に飾られます
// ・かたまりの最後の「},」のカンマを忘れないでね

const kozu = [
  {
    title: "持ってあげる",
    image: "kozu1.webp",
    prompt: `three-panel sequential comic, exactly three panels, clear panel borders, same character throughout, consistent appearance and clothing, continuous action, progressively closer camera distance, cinematic manga composition,Composition from an angle,Panel 1 and Panel 2 have the same composition and layout,2::very detailed characters::,

Panel 1: medium shot, 1.5::A man and a woman standing side by side::,1.5::A woman carrying what looks like a heavy load,A man staring intently at a woman's belongings,::
A speech bubble containing 「...」 is coming from a man.,candid moment,A woman with a troubled expression,A woman holding a stack of boxes in her arms,A man with empty hands,A woman bending over while carrying a load,A man with his hands at his sides
2::A woman with a pained expression::

Panel 2: medium shot,A man is reaching out to a woman,A woman looking at a man with a happy expression while holding some items.

Panel 3:medium shot, 2::A man is holding a woman in his arms, princess-style::,1.3::A woman with a bright red face, covering her entire face with both hands::,A man is holding a woman.

clear visual progression, `,
  },
];
