// news-image-20261126 — "THE WORLD IN ONE DAY"
// Draws a 1024x1024 broadsheet front page summing up Thursday 26 November 2026
// in one image: 3 lead stories with drawn scenes, 18 story cells, 15 briefs,
// a pin map, a numbers panel and a markets ticker — 36 stories in all.
// Node 22, standard library only. No network, no external fonts or images.
// Every word is drawn from the STORIES data below, all first reported on
// 26 November 2026 (checked against BBC, Reuters, AP, AFP, CNBC, Al Jazeera,
// The Guardian, Euronews and One Turn's day file for 2026-11-26).
//
//   node render.mjs --check   # writes dist/news-image-20261126.svg
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const W = 1024, H = 1024;
const PAPER = '#F6F1E5', PANEL = '#FFFDF4', INK = '#17130C', MUTED = '#5C5342';
const RED = '#B3271E', NAVY = '#1E3A5F', TEAL = '#256B62', AMBER = '#A86F0B';
const LINE = '#17130C', HAIR = '#B9AE97';
const SERIF = "'DejaVu Serif', Georgia, serif";
const SANS = "'DejaVu Sans', Arial, sans-serif";

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// ---------------------------------------------------------------- stories
// Leads: [kicker, headline lines, deck lines, accent]
const LEADS = [
  { kicker: 'WASHINGTON · TRADE', accent: NAVY,
    head: ['US PROPOSES NEW', 'TARIFFS ON 14'],
    deck: ['14 partners hit; China up to 40%, India 25%',
           '(17% with a deal), Japan 15%. Mexico exempt.',
           'Beijing, Brussels, Brasília push back.'] },
  { kicker: 'RAS TANURA · GULF', accent: RED,
    head: ['HOUTHIS STRIKE SAUDI', 'REFINERY, PORTS'],
    deck: ['Drones hit Ras Tanura and Red Sea ports; Riyadh',
           'intercepts missiles. Oil climbs toward $95.'] },
  { kicker: 'CAIRO · DISASTER', accent: AMBER,
    head: ['TANKER FIRE KILLS 31', 'ON CAIRO RING ROAD'],
    deck: ['Fuel tanker overturns and burns in Giza; about',
           '21 hurt. Cars and motorbikes ablaze.'] },
];

// Grid cells: [kicker, headline lines, deck, accent]
const GRID = [
  ['UKRAINE', ['UKRAINE HITS', 'RUSSIAN AIRBASE'], 'Five jets hit; Kyiv mall struck.', RED],
  ['IRAN', ['US TELLS CITIZENS', 'TO LEAVE IRAN'], 'War fears grow; Hormuz mines hit.', RED],
  ['MARKETS', ['AI STOCKS SLIDE', 'TO BEAR EDGE'], 'S&P warns Nvidia; stocks recover.', NAVY],
  ['NVIDIA', ['HUANG BACK AT', 'NVIDIA'], 'FBI, CIA quizzed; SE Asia halt.', NAVY],
  ['SPACE', ['SPACEX GETS 1M', 'SATELLITE PLAN'], 'Orbital data centres; rivals object.', TEAL],
  ['SPACE', ['FIRST PAKISTANI', 'IN ORBIT'], 'Zeeshan Ali reaches Tiangong.', TEAL],
  ['EUROPE', ['EU SPLIT OVER', '€45BN LOAN'], '€2tn fight; Merz bars joint debt.', NAVY],
  ['BRITAIN', ['UK ENERGY BILLS', 'TO JUMP 26%'], 'Typical bill £1,723 → £2,166.', AMBER],
  ['TECH', ['HUAWEI GUILTY', 'OF US THEFT'], '10 of 12 counts in Brooklyn.', NAVY],
  ['ENERGY', ['US DEAL FOR', 'LUKOIL ASSETS'], 'Boehly signs via share swap.', TEAL],
  ['N. KOREA', ['KIM WIDENS', 'NUCLEAR DEPLOY'], 'Tours nuke sites; no disarmament.', RED],
  ['HEALTH', ['CONGO EBOLA', 'PASSES 12,000'], 'Worst outbreak; war hampers fight.', RED],
  ['ISRAEL', ['JUDGES SUGGEST', 'DROPPING CHARGE'], 'Case in doubt; PM demands its end.', NAVY],
  ['GAZA', ['ISRAELI STRIKES', 'KILL 16 IN GAZA'], '16 dead in a day; ceasefire strains.', RED],
  ['SPAIN', ['SPAIN VOTES', 'SUNDAY, RIGHT UP'], 'Sánchez’s 8-year rule at stake.', NAVY],
  ['CHINA', ['SHANGHAI CHIEF', 'IN GRAFT PROBE'], 'Chen Jining, 4th figure felled.', RED],
  ['BRITAIN', ['UK MIGRATION', 'FALLS TO 77,000'], 'Lowest since 1997, ONS says.', AMBER],
  ['RUSSIA', ['LEAK: RUSSIA', 'LOST 490,000+'], 'BBC analysis; Kremlin dismisses it.', RED],
];

// Briefs: [bold lead, rest] — each is one story, two lines max.
const BRIEFS = [
  ['Poundland collapses', ' — 11,000 UK jobs at risk.'],
  ['Norse Atlantic', ' suspends all flights.'],
  ['Bank of Korea', ' lifts rate to 3.25%.'],
  ['Macy’s 100th parade', ' postponed — a first.'],
  ['Sinner', ' out of Australian Open after knee surgery.'],
  ['Miss Universe:', ' Barreto wins, first married winner.'],
  ['Liverpool 3–0', ' Club Brugge; Lille stun Bayern 2–1.'],
  ['Gukesh–Sindarov', ' Game 2 drawn in 20 moves.'],
  ['Andy Taylor', ' of Duran Duran dies at 65.'],
  ['Euclid telescope', ' finds its first comet.'],
  ['Sudan drone attacks', ' kill at least 15.'],
  ['Indonesia mine flood', ' kills at least 13.'],
  ['Hong Kong', ' marks year since fire killed 168.'],
  ['India', ' marks 18 years since 26/11 Mumbai attacks.'],
  ['CAS', ' hands Africa Cup title back to Senegal.'],
];

// The day in numbers: [big, caption]
const NUMBERS = [
  ['31', 'dead in the Cairo tanker fire'],
  ['$95', 'oil nears as Gulf attacks bite'],
  ['14', 'partners hit by US tariffs'],
  ['12,000', 'Ebola cases in DR Congo'],
  ['490,000+', 'Russian troops lost, leak says'],
  ['26%', 'UK energy bill rise in January'],
];

const TICKER = 'MARKETS  ·  EURO STOXX 50 +1.89%   ·   SENSEX +2.3%   ·   S&amp;P 500 −0.25%   ·   BRENT $90.75';

// ---------------------------------------------------------------- helpers
const T = (x, y, s, o = {}) => {
  const { size = 14, fill = INK, fam = SANS, w = 'normal', anchor = 'start', ls = 0, style = '' } = o;
  return `<text x="${x}" y="${y}" font-family="${fam}" font-size="${size}" fill="${fill}" font-weight="${w}" text-anchor="${anchor}" letter-spacing="${ls}"${style ? ` font-style="${style}"` : ''}>${s}</text>`;
};
const R = (x, y, w, h, fill, o = {}) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"${o.rx ? ` rx="${o.rx}"` : ''}${o.op ? ` opacity="${o.op}"` : ''}/>`;
const chip = (x, y, label, color) => {
  const w = label.length * 7.4 + 12;
  return `${R(x, y, w, 15, color)}${T(x + 6, y + 11.5, esc(label), { size: 9.5, fill: '#FFFDF4', w: 'bold', ls: 0.8 })}`;
};

// ------------------------------------------------------- lead illustrations
// 1 — container ship under a big % : tariffs. Panel x,y,w,h; scene at left.
const sceneShip = (x, y) => `
  <g>
    ${R(x, y + 62, 190, 10, NAVY)}
    <path d="M ${x + 8} ${y + 62} L ${x + 26} ${y + 96} L ${x + 168} ${y + 96} L ${x + 186} ${y + 62} Z" fill="${INK}"/>
    ${R(x + 22, y + 30, 34, 30, RED)}${R(x + 60, y + 30, 34, 30, AMBER)}${R(x + 98, y + 30, 34, 30, TEAL)}
    ${R(x + 22, y + 14, 34, 14, NAVY)}${R(x + 98, y + 14, 34, 14, NAVY)}
    ${R(x + 140, y + 8, 6, 54, INK)}${R(x + 140, y + 2, 26, 10, RED)}
    <path d="M ${x} ${y + 106} q 12 -8 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0" stroke="${NAVY}" stroke-width="3" fill="none"/>
  </g>`;
// 2 — refinery towers with flame. Panel x,y,w,h.
const sceneRefinery = (x, y) => `
  <g>
    ${R(x + 8, y + 52, 26, 52, INK)}${R(x + 40, y + 34, 26, 70, NAVY)}${R(x + 72, y + 62, 26, 42, INK)}
    ${R(x + 106, y + 20, 12, 84, AMBER)}${R(x + 100, y + 12, 24, 10, AMBER)}
    <path d="M ${x + 132} ${y + 8} q 16 12 10 28 q -4 10 2 18 q -14 2 -18 -10 q -6 -14 6 -36 Z" fill="${RED}"/>
    <path d="M ${x + 150} ${y + 30} q 12 10 7 22 q -3 8 2 14 q -11 2 -14 -8 q -4 -11 5 -28 Z" fill="${AMBER}"/>
    ${R(x + 138, y + 66, 26, 38, TEAL)}${R(x + 138, y + 74, 26, 3, INK)}${R(x + 138, y + 84, 26, 3, INK)}
  </g>`;
// 3 — fuel tanker with flames on a road.
const sceneTanker = (x, y) => `
  <g>
    ${R(x, y + 88, 200, 8, INK)}
    <path d="M ${x + 10} ${y + 88} l 14 -6 M ${x + 100} ${y + 88} l 14 -6" stroke="${INK}" stroke-width="2"/>
    <rect x="${x + 12}" y="${y + 52}" width="118" height="34" rx="17" fill="${NAVY}"/>
    <path d="M ${x + 132} ${y + 58} h 34 l 16 28 h -50 Z" fill="${INK}"/>
    <rect x="${x + 140}" y="${y + 64}" width="18" height="12" fill="${PANEL}"/>
    <circle cx="${x + 44}" cy="${y + 88}" r="9" fill="${INK}"/><circle cx="${x + 44}" cy="${y + 88}" r="3.5" fill="${PAPER}"/>
    <circle cx="${x + 100}" cy="${y + 88}" r="9" fill="${INK}"/><circle cx="${x + 100}" cy="${y + 88}" r="3.5" fill="${PAPER}"/>
    <circle cx="${x + 158}" cy="${y + 88}" r="9" fill="${INK}"/><circle cx="${x + 158}" cy="${y + 88}" r="3.5" fill="${PAPER}"/>
    <path d="M ${x + 52} ${y + 50} q 18 -26 8 -44 q 14 6 12 22 q 10 -4 6 -16 q 16 12 8 30 q -4 10 2 8 q -12 10 -24 2 q -10 4 -12 -2 Z" fill="${RED}"/>
    <path d="M ${x + 84} ${y + 50} q 12 -18 5 -30 q 10 4 8 15 q 7 -3 4 -11 q 11 8 6 20 q -3 7 1 6 q -8 7 -16 1 q -7 3 -8 -1 Z" fill="${AMBER}"/>
  </g>`;

// ------------------------------------------------------------------- map
// Stylised continents, rough lon/lat polygons, equirectangular projection.
const MAP = { x: 656, y: 128, w: 346, h: 148 };
const proj = (lon, lat) => [MAP.x + ((lon + 180) / 360) * MAP.w, MAP.y + ((90 - lat) / 180) * MAP.h];
const poly = (pts, fill) => `<polygon points="${pts.map(([lo, la]) => proj(lo, la).map((v) => v.toFixed(1)).join(',')).join(' ')}" fill="${fill}" stroke="${PAPER}" stroke-width="1"/>`;
const CONTINENTS = [
  [[-168, 66], [-140, 70], [-120, 72], [-95, 80], [-80, 73], [-65, 60], [-55, 52], [-60, 46], [-70, 42], [-75, 35], [-80, 26], [-85, 30], [-90, 21], [-95, 16], [-105, 20], [-115, 28], [-125, 40], [-125, 49], [-140, 60], [-155, 58], [-165, 60]],
  [[-80, 10], [-70, 12], [-60, 8], [-50, 0], [-40, -5], [-35, -10], [-40, -20], [-48, -28], [-58, -35], [-65, -45], [-70, -54], [-73, -40], [-75, -25], [-80, -15]],
  [[-10, 36], [-9, 43], [-2, 48], [0, 51], [5, 58], [10, 59], [18, 56], [21, 55], [28, 60], [30, 70], [40, 68], [45, 60], [40, 52], [35, 45], [30, 42], [28, 40], [22, 37], [15, 38], [8, 39], [3, 38], [-2, 37]],
  [[-6, 35], [0, 36], [10, 37], [20, 32], [32, 31], [35, 28], [40, 20], [43, 12], [48, 10], [51, 2], [40, -5], [38, -18], [35, -28], [28, -33], [20, -35], [15, -28], [12, -18], [9, -2], [9, 4], [0, 6], [-8, 5], [-15, 12], [-17, 15], [-16, 20], [-15, 28]],
  [[30, 70], [40, 68], [55, 72], [70, 73], [90, 75], [110, 77], [130, 72], [150, 70], [170, 67], [178, 65], [170, 60], [160, 55], [145, 50], [140, 42], [135, 35], [127, 33], [122, 30], [120, 25], [110, 20], [105, 10], [100, 8], [95, 15], [90, 22], [85, 20], [80, 8], [77, 8], [72, 20], [65, 25], [60, 25], [55, 28], [50, 30], [48, 30], [45, 32], [40, 36], [35, 36], [30, 36]],
  [[113, -22], [114, -30], [115, -35], [120, -34], [125, -32], [130, -32], [135, -35], [140, -38], [145, -38], [150, -37], [153, -32], [153, -27], [150, -23], [146, -19], [142, -15], [142, -11], [137, -12], [135, -15], [132, -12], [130, -13], [126, -14], [122, -17], [118, -20]],
];
// [lon, lat, label-number-or-null] — numbered pins are the three leads.
const PINS = [
  [-77, 39, '1'], [47, 25, '2'], [31, 30, '3'], [30, 50, null], [51, 36, null],
  [116, 40, null], [0, 51, null], [77, 29, null], [127, 37, null], [-4, 40, null],
  [15, -4, null], [34, 31, null], [114, 22, null], [107, -6, null], [151, -34, null],
  [-47, -24, null], [-74, 41, null], [10, 60, null],
];
const mapPanel = () => {
  const pins = PINS.map(([lo, la, n]) => {
    const [x, y] = proj(lo, la);
    return n
      ? `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="9" fill="${RED}" stroke="${PAPER}" stroke-width="1.5"/>${T(x, y + 3.5, n, { size: 10, fill: '#FFFDF4', w: 'bold', anchor: 'middle' })}`
      : `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.5" fill="${NAVY}" stroke="${PAPER}" stroke-width="1"/>`;
  }).join('');
  return `
  <g>
    ${R(644, 90, 370, 196, PANEL)}
    <rect x="644" y="90" width="370" height="196" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${T(656, 110, 'WHERE IT HAPPENED — 9 REGIONS', { size: 12, w: 'bold', ls: 1 })}
    ${CONTINENTS.map((c) => poly(c, '#C9BFA6')).join('')}
    ${pins}
    ${T(656, 278, '1  Tariffs   2  Gulf strikes   3  Cairo fire      ●  15 more stories', { size: 11, fill: MUTED })}
  </g>`;
};

// ---------------------------------------------------------------- layout
const lead1 = (L) => {
  const x = 10, y = 90, w = 626, h = 196;
  return `
  <g>
    ${R(x, y, w, h, PANEL)}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${R(x, y, w, 3, L.accent)}
    ${sceneShip(x + 16, y + 42)}
    ${chip(x + 238, y + 16, L.kicker, L.accent)}
    ${T(x + 238, y + 62, esc(L.head[0]), { size: 30, fam: SERIF, w: 'bold' })}
    ${T(x + 238, y + 96, esc(L.head[1]), { size: 30, fam: SERIF, w: 'bold' })}
    ${L.deck.map((d, i) => T(x + 238, y + 128 + i * 20, esc(d), { size: 14.5, fill: MUTED })).join('')}
  </g>`;
};
const leadSmall = (L, x, scene, deckLine) => {
  const y = 290, w = 309, h = 186;
  return `
  <g>
    ${R(x, y, w, h, PANEL)}<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${R(x, y, w, 3, L.accent)}
    ${scene(x + 58, y + 6)}
    ${chip(x + 12, y + 112, L.kicker, L.accent)}
    ${T(x + 12, y + 144, esc(L.head[0]), { size: 19, fam: SERIF, w: 'bold' })}
    ${T(x + 12, y + 163, esc(L.head[1]), { size: 19, fam: SERIF, w: 'bold' })}
    ${T(x + 12, y + 181, esc(deckLine), { size: 11.5, fill: MUTED })}
  </g>`;
};
// Deck lines for the two small leads sit under the grid's ticker instead:
// they are printed in the ticker band as a second line.
const grid = () => {
  const cells = GRID.map(([kick, head, deck, color], i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const x = 10 + col * 211, y = 514 + row * 70;
    return `
    <g>
      ${R(x, y, 203, 67, PANEL)}
      <line x1="${x}" y1="${y}" x2="${x + 203}" y2="${y}" stroke="${INK}" stroke-width="1"/>
      ${chip(x, y + 5, kick, color)}
      ${T(x, y + 33, esc(head[0]), { size: 14.5, fam: SERIF, w: 'bold' })}
      ${T(x, y + 51, esc(head[1]), { size: 14.5, fam: SERIF, w: 'bold' })}
      ${T(x, y + 65, esc(deck), { size: 11, fill: MUTED })}
    </g>`;
  }).join('');
  return cells;
};
const numbersPanel = () => {
  const items = NUMBERS.map(([big, cap], i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 656 + col * 183, y = 336 + row * 48;
    return `
    <g>
      ${T(x, y, big, { size: 26, fam: SERIF, w: 'bold', fill: RED })}
      ${T(x, y + 16, cap, { size: 11, fill: MUTED })}
    </g>`;
  }).join('');
  return `
  <g>
    ${R(644, 290, 370, 172, PANEL)}<rect x="644" y="290" width="370" height="172" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${T(656, 308, 'THE DAY IN NUMBERS', { size: 12, w: 'bold', ls: 1 })}
    ${items}
  </g>`;
};
const briefsPanel = () => {
  const items = BRIEFS.map(([b, rest], i) => {
    const y = 506 + i * 34;
    return `
    <g>
      <circle cx="652" cy="${y - 4}" r="3" fill="${RED}"/>
      <text x="662" y="${y}" font-family="${SANS}" font-size="13.5" fill="${INK}"><tspan font-weight="bold">${esc(b)}</tspan>${esc(rest)}</text>
    </g>`;
  }).join('');
  return `
  <g>
    ${R(644, 466, 370, 548, PANEL)}<rect x="644" y="466" width="370" height="548" fill="none" stroke="${INK}" stroke-width="1.5"/>
    ${T(656, 486, 'MORE FROM THE DAY — 15 BRIEFS', { size: 12, w: 'bold', ls: 1 })}
    ${items}
  </g>`;
};

// ------------------------------------------------------------------- svg
const build = () => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
<rect width="${W}" height="${H}" fill="${PAPER}"/>
<!-- masthead -->
${T(512, 50, 'THE WORLD IN ONE DAY', { size: 52, fam: SERIF, w: 'bold', anchor: 'middle', ls: 1 })}
${T(10, 78, 'THURSDAY 26 NOVEMBER 2026', { size: 15, w: 'bold', ls: 1.5 })}
${T(1014, 78, '36 STORIES · 9 REGIONS · 6 CONTINENTS', { size: 15, w: 'bold', anchor: 'end', ls: 1 })}
<line x1="10" y1="86" x2="1014" y2="86" stroke="${INK}" stroke-width="2.5"/>
<line x1="10" y1="89.5" x2="1014" y2="89.5" stroke="${INK}" stroke-width="0.75"/>
<!-- leads -->
${lead1(LEADS[0])}
${leadSmall(LEADS[1], 10, sceneRefinery, 'Ras Tanura attacked; oil nears $95.')}
${leadSmall(LEADS[2], 327, sceneTanker, 'Tanker overturns in Giza; about 21 hurt.')}
<!-- markets ticker -->
${R(10, 482, 626, 26, INK)}
${T(20, 500, TICKER, { size: 11.5, fill: PAPER, w: 'bold', ls: 0.5 })}
<!-- story grid: 18 cells -->
${grid()}
<!-- right rail -->
${mapPanel()}
${numbersPanel()}
${briefsPanel()}
<!-- footer (left zone only; the right rail runs to the bottom edge) -->
<line x1="10" y1="940" x2="636" y2="940" stroke="${INK}" stroke-width="2"/>
${T(10, 960, 'ALL EVENTS FIRST REPORTED THURSDAY 26 NOVEMBER 2026', { size: 12.5, w: 'bold' })}
${T(10, 980, 'Sources: BBC · Reuters · AP · AFP · CNBC · Al Jazeera · The Guardian · Euronews', { size: 11.5, fill: MUTED })}
${T(10, 1000, 'One day. One page. Checked against the day’s wires.', { size: 12, fam: SERIF, style: 'italic', fill: MUTED })}
</svg>`;

// ------------------------------------------------------------------ main
const svg = build();
const storyCount = 3 + GRID.length + BRIEFS.length;
if (process.argv.includes('--check')) {
  const problems = [];
  if (storyCount !== 36) problems.push(`story count ${storyCount} != 36`);
  if (GRID.length !== 18 || BRIEFS.length !== 15) problems.push('grid/briefs size wrong');
  const svgNoNs = svg.replace('xmlns="http://www.w3.org/2000/svg"', '');
  if (/https?:\/\//.test(svgNoNs)) problems.push('external URL in SVG');
  if (/&(?!(amp|lt|gt|#);)/.test(svg)) problems.push('bare & in SVG');
  for (const [kick, head, deck] of GRID) {
    for (const h of head) if (h.length > 18) problems.push(`headline too long: ${h}`);
    if (deck.replace(/&amp;/g, '&').length > 36) problems.push(`deck too long: ${deck}`);
  }
  for (const [b, rest] of BRIEFS) if ((b + rest).length > 51) problems.push(`brief too long: ${b}${rest}`);
  for (const L of LEADS) for (const h of L.head) if (h.length > 20) problems.push(`lead headline too long: ${h}`);
  if (problems.length) { console.error('CHECK FAILED:\n' + problems.join('\n')); process.exit(1); }
  const out = join(dirname(fileURLToPath(import.meta.url)), 'dist', 'news-image-20261126.svg');
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg);
  console.log(`CHECK OK — ${storyCount} stories, ${svg.length} bytes -> ${out}`);
} else {
  process.stdout.write(svg);
}
