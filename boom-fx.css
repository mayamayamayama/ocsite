/* boom-fx.css — サウンドトラックの「演出」
   ・見出しのまわり：画面のはしからころがって来て回りつづけるレコードと、ギター。音符がふわっと出ます
   ・見出しの文字：上から落ちてきて、ときどき波のようにはねます
   ・A面⇄B面：大きなレコードが画面のはしからころがって来て、裏返って、反対へころがって行きます（boom.js が .go をつける） */

/* ---------- 見出しの飾り（大きさは見出しの文字にあわせて em で決めています） ---------- */
.bx-head { position: relative; }
.bx-head > :not(.bx-art) { position: relative; z-index: 1; }
.bx-art { position: absolute; inset: 0; z-index: 0; font-size: clamp(76px, 29vw, 168px); pointer-events: none; user-select: none; -webkit-user-select: none; }
.bx-rec, .bx-gtr > * { pointer-events: auto; cursor: pointer; -webkit-tap-highlight-color: transparent; }   /* さわれる：レコードはスクラッチ、ギターはジャーン */

/* うしろの網点（あみてん）。印刷物みたいな、こい色の点々 */
.bx-art::before { content: ""; position: absolute; left: 1.55em; top: .35em; width: 2.9em; aspect-ratio: 1; border-radius: 50%; background: radial-gradient(circle, var(--bx-deep) 34%, transparent 37%) 0 0 / .07em .07em;
  -webkit-mask: radial-gradient(closest-side, #000 25%, transparent); mask: radial-gradient(closest-side, #000 25%, transparent); }

/* レコード（右上） */
.bx-rec { position: absolute; left: 2.2em; top: .12em; width: 2.04em; aspect-ratio: 1; border-radius: 50%; animation: bxRollIn 1.15s cubic-bezier(.2, .8, .3, 1) .2s both; }
.bx-rec::before { content: ""; position: absolute; inset: 0; border-radius: 50%; background: var(--bx-deep); transform: translate(.06em, .06em); transition: background-color .25s; }
.bx-rec::after { content: ""; position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(from 35deg, transparent 0 4%, rgba(255, 255, 255, .17) 7% 11%, transparent 14% 50%, rgba(255, 255, 255, .11) 54% 58%, transparent 61%); }
.bx-vin { position: relative; display: block; width: 100%; height: 100%; fill: var(--bx-ink); animation: bxSpin 3.2s linear infinite; }
.bx-playing .bx-vin { animation-duration: 1.8s; }
.bx-vin .g { fill: none; stroke: #343434; stroke-width: 1.1; }
.bx-vin .lb { fill: var(--bx-bg); } .bx-vin .lr { fill: none; stroke: var(--bx-ink); stroke-width: .8; } .bx-vin .h { fill: var(--bx-paper); }
.bx-vin text { text-anchor: middle; }
.bx-vin .lt { font: 700 5.4px var(--bx-mono); letter-spacing: .05em; text-anchor: start; }
.bx-vin .lm { font: 400 14px var(--bx-big); letter-spacing: .03em; }
.bx-vin .ls { font: 700 6px var(--bx-mono); letter-spacing: .2em; }
.bx-vin .b, html.bx-b .bx-vin .a { display: none; } html.bx-b .bx-vin .b { display: inline; }
@keyframes bxRollIn { from { transform: translateX(2.6em) rotate(160deg); } }
@keyframes bxSpin { to { transform: rotate(1turn); } }

/* ギター（右。下からスイングして立ち上がり、ゆらゆら） */
.bx-gw { position: absolute; left: 1.98em; top: .72em; width: 1.32em; transform-origin: 50% 84%; rotate: 7deg; animation: bxGtrIn 1s cubic-bezier(.3, 1.45, .5, 1) .5s both; }
@keyframes bxGtrIn { from { transform: translateY(.9em) rotate(28deg); opacity: 0; } 30% { opacity: 1; } }
.bx-gtr { display: block; width: 100%; height: auto; overflow: visible; fill: var(--bx-ink); transform-origin: 50% 84%; animation: bxSway 1.25s ease-in-out 1.5s infinite alternate; }
@keyframes bxSway { from { transform: rotate(-1.2deg); } to { transform: rotate(1.2deg); } }
.bx-gtr .ol { fill: none; stroke: var(--bx-ink); stroke-width: 7; stroke-linejoin: round; }
.bx-gtr .pa { fill: var(--bx-paper); }
.bx-gtr .p { fill: var(--bx-paper); stroke: var(--bx-ink); stroke-width: 1.6; }
.bx-gtr .ac { fill: var(--bx-bg); stroke: var(--bx-ink); stroke-width: 2; transition: fill .25s; }
.bx-gtr .fr, .bx-gtr .st { fill: none; stroke: var(--bx-paper); }
.bx-gtr .fr { stroke-width: 1.3; opacity: .8; } .bx-gtr .st { stroke-width: .7; }
.bx-gtr .dt { fill: var(--bx-paper); }
.bx-playing .bx-gtr .st { animation: bxStr .07s linear infinite alternate; }
@keyframes bxStr { to { transform: translateX(.5px); } }
.bx-playing .bx-gtr { animation-duration: .625s; }

/* さわったとき（boom.js が .hit をつける）：レコードはキュキュッとスクラッチ、ギターはジャーンと大きくゆれる */
.bx-sc { position: relative; width: 100%; height: 100%; }
.bx-rec.hit .bx-sc { animation: bxScratch .55s cubic-bezier(.3, 0, .3, 1); }
@keyframes bxScratch { 25% { transform: rotate(-38deg); } 55% { transform: rotate(16deg); } 78% { transform: rotate(-6deg); } }
.bx-gs { transform-origin: 50% 84%; }
.bx-gw.hit .bx-gs { animation: bxStrum .7s cubic-bezier(.3, 0, .3, 1); }
@keyframes bxStrum { 15% { transform: rotate(-7deg) scale(1.04); } 40% { transform: rotate(5deg); } 65% { transform: rotate(-2deg); } }
.bx-gw.hit .st { animation: bxStr .05s linear 12 alternate; }

/* 音符（ふわっと出て、上へ） */
.bx-nf { position: absolute; width: .2em; opacity: 0; animation: bxNote 3.9s ease-out infinite; }
.bx-nf svg { display: block; width: 100%; height: auto; fill: var(--bx-ink); stroke: var(--bx-paper); stroke-width: 2.4; paint-order: stroke; overflow: visible; }
.bx-nf.n1 { left: 2.38em; top: 2.62em; animation-delay: 1.6s; }
.bx-nf.n2 { left: 2.6em; top: 2.9em; width: .16em; animation-delay: 2.9s; }
.bx-nf.n3 { left: 2.25em; top: 3.05em; width: .24em; animation-delay: 4.2s; }
@keyframes bxNote { 0% { opacity: 0; transform: translate(0, 0) rotate(-14deg) scale(.5); } 14%, 70% { opacity: 1; } 100% { opacity: 0; transform: translate(-.36em, -.8em) rotate(12deg) scale(1); } }
.bx-playing .bx-nf { animation-duration: 2.2s; }

/* 見出しの文字：上から落ちてきて、ときどき波のようにはねる */
.bx-title > b { text-shadow: 3px 0 var(--bx-bg), -3px 0 var(--bx-bg), 0 3px var(--bx-bg), 0 -3px var(--bx-bg), 2px 2px var(--bx-bg), -2px 2px var(--bx-bg), 2px -2px var(--bx-bg), -2px -2px var(--bx-bg), .05em .05em 0 var(--bx-deep); }
.bx-title > span { text-shadow: .05em .05em 0 var(--bx-deep); }
.bx-title i { display: inline-block; font-style: normal; transform-origin: 50% 100%;
  animation: bxDrop .8s cubic-bezier(.3, 1.5, .5, 1) both, bxHop 5.5s ease-in-out infinite; animation-delay: calc(.12s + var(--i) * .06s), calc(2.4s + var(--i) * .07s); }
@keyframes bxDrop { 0% { transform: translateY(-1em) rotate(-14deg); opacity: 0; } 35% { opacity: 1; } 100% { transform: none; opacity: 1; } }
@keyframes bxHop { 0%, 13%, 100% { transform: none; } 5% { transform: translateY(-.12em) rotate(-4deg); } 9% { transform: translateY(.01em) scale(1.04, .94); } }

/* 小さなレベルメーター（いちばん上の小さな文字のとなり） */
.bx-eq { display: inline-flex; align-items: flex-end; gap: 2px; height: 11px; margin-left: 10px; vertical-align: -1px; }
.bx-eq u { width: 3px; height: 100%; background: var(--bx-ink); transform-origin: 50% 100%; animation: bxEq calc(var(--d, .6) * var(--k, 1) * 1s) ease-in-out infinite alternate; }
.bx-eq u:nth-child(2) { --d: .42; } .bx-eq u:nth-child(3) { --d: .74; } .bx-eq u:nth-child(4) { --d: .36; } .bx-eq u:nth-child(5) { --d: .52; }
.bx-playing .bx-eq { --k: .45; }
@keyframes bxEq { from { transform: scaleY(.18); } to { transform: scaleY(1); } }

/* ライナーノーツは少しせまく（右のギターが見えるように） */
.bx-notes { max-width: min(520px, calc(100% - 26px)); }

/* 電車で来たときは、電車がどきはじめるまで動きを止めておく（soundtrack.html が .bx-wait をつける） */
html.bx-wait .bx-head *, html.bx-wait .bx-head *::before { animation-play-state: paused !important; }

/* ---------- A面⇄B面：大きなレコードが画面のはしからころがって来て、裏返って、反対へころがって行く ---------- */
.bx-flip { position: fixed; inset: 0; z-index: 80; display: none; overflow: hidden; pointer-events: none; perspective: 1600px; }
.bx-flip.go { display: block; }
.bx-disc { position: absolute; left: 50%; top: 50%; width: 118vmax; height: 118vmax; margin: -59vmax 0 0 -59vmax; transform-style: preserve-3d; will-change: transform;
  --x0: calc(50vw + 60vmax); --x1: calc(-50vw - 60vmax); --f: 0deg; transform: translateX(var(--x0)); }
.bx-flip.to-a .bx-disc { --x0: calc(-50vw - 60vmax); --x1: calc(50vw + 60vmax); --f: 180deg; }
.bx-flip.go .bx-disc { animation: bxRoll 1.6s both; }
@keyframes bxRoll {
  0% { transform: translateX(var(--x0)) rotateY(var(--f)) rotate(90deg); animation-timing-function: cubic-bezier(.4, 0, .2, 1); }
  31% { transform: translateX(0) rotateY(var(--f)) rotate(0deg); animation-timing-function: cubic-bezier(.6, 0, .3, 1); }
  62% { transform: translateX(0) rotateY(calc(var(--f) + 180deg)) rotate(0deg); animation-timing-function: cubic-bezier(.5, 0, .6, 1); }
  100% { transform: translateX(var(--x1)) rotateY(calc(var(--f) + 180deg)) rotate(90deg); }
}
.bx-disc i { position: absolute; inset: 0; display: grid; place-content: center; justify-items: center; gap: 1vmax; border-radius: 50%; -webkit-backface-visibility: hidden; backface-visibility: hidden; color: var(--bx-ink); font-style: normal;
  background: radial-gradient(circle, var(--bx-ink) 0 .8%, var(--lab) .9% 17%, var(--bx-ink) 17.1% 17.8%, transparent 17.9%),
    conic-gradient(from 25deg, transparent 0 6%, rgba(255, 255, 255, .12) 8% 13%, transparent 15% 50%, rgba(255, 255, 255, .12) 56% 61%, transparent 63%),
    repeating-radial-gradient(circle, #111 0 2px, #2a2a2a 2px 3px);
  box-shadow: inset 0 0 0 .5vmax #111, inset 0 0 0 .8vmax var(--bx-paper); }
.bx-disc i.a { --lab: #ff8a00; } .bx-disc i.b { --lab: #3d7bff; transform: rotateY(180deg); }
.bx-disc b { font: 400 10vmax/1 var(--bx-big); letter-spacing: .01em; }
.bx-disc small { font: 700 1.3vmax/1 var(--bx-mono); letter-spacing: .2em; }

/* パソコン：レコードとギターが左の列におさまるように、見出しの文字を少し小さく */
@media (min-width: 900px) {
  .bx-title, .bx-art { font-size: clamp(84px, 8.4vw, 110px); }
  .bx-rec { left: 2.16em; top: .22em; }
  .bx-gw { left: 2.64em; top: .82em; }
  .bx-notes { max-width: min(520px, calc(100% - clamp(84px, 8.4vw, 110px) * 1.5)); }
}
@media (prefers-reduced-motion: reduce) { .bx-art *, .bx-title i, .bx-eq u { animation: none !important; } }
