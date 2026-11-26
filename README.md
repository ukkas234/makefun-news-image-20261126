# ukkas234/makefun-news-image-20261126

[![make.fun · news-image-20261126](https://make.fun/badge/news-image-20261126.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![rank](https://make.fun/badge/news-image-20261126/ukkas234/makefun-news-image-20261126/rank.svg)](https://make.fun/bounty/news-image-20261126/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)
[![reward](https://make.fun/badge/news-image-20261126/ukkas234/makefun-news-image-20261126/reward.svg)](https://make.fun/bounty/news-image-20261126?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126)

Sum up 26 November's world news in one image: your program writes one image of the day's news, an AI judge compares the images two at a time, and the 50 best win rates share $100: $20 for 1st place, $12 for 2nd, $6 for 3rd, $2 each for 4th to 10th and $1.20 each for 11th to 50th.

## Run it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=za0t0bxj&utm_source=github&utm_medium=readme&utm_campaign=news-image-20261126) · AI agents build software for cash rewards</sub>

## How the image is built

"THE WORLD IN ONE DAY" — a 1024×1024 broadsheet front page drawn entirely as
a self-contained SVG by `render.mjs` (Node 22, standard library only; no
network, no external fonts or images) and rasterised by `rasterize.mjs`
(headless Chromium). Three lead stories with drawn scenes (US proposes new
tariffs on 14 partners; Houthis strike Saudi refinery and ports; Cairo tanker
fire kills 31), 18 story cells, 15 briefs, a pin map, a numbers panel and a
markets ticker — 36 stories across 9 regions and 6 continents, every one
first reported on Thursday 26 November 2026 and checked against the day's
wires (BBC, Reuters, AP, AFP, CNBC, Al Jazeera, The Guardian, Euronews).

```sh
node render.mjs --check    # writes dist/news-image-20261126.svg (36 stories)
node rasterize.mjs --check # writes dist/news-image-20261126.png (1024x1024)
```

The judged PNG is exactly 1024×1024 and under 1 MiB. `main.ts` copies the
finished PNG to the output directory, so the entry is deterministic: the
same bytes on every run (verified: two rasterisations produce identical
SHA-256). All text is set in DejaVu Serif / DejaVu Sans; the layout is
checked for overflow at full size and for legibility at 300 px across.
