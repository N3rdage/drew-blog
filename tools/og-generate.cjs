// og-generate.cjs — branded 1200x630 social cards for silly.ninja
// usage: node tools/og-generate.cjs "Post title" "Optional subtitle" out.png
//    or: npm run og -- "Post title" "Optional subtitle" public/og/slug.png
const { Resvg } = require('@resvg/resvg-js');
const fs = require('fs');
const path = require('path');

// Bundled fonts so cards render identically on any machine / CI.
// resvg needs TTF/OTF — it can't read the .woff files in src/assets.
const FONT_DIR = path.join(__dirname, 'fonts');
const FONT_FILES = [
  path.join(FONT_DIR, 'AtkinsonHyperlegible-Regular.ttf'),
  path.join(FONT_DIR, 'AtkinsonHyperlegible-Bold.ttf'),
  path.join(FONT_DIR, 'JetBrainsMono-Regular.ttf'),
];

function wrap(text, maxChars) {
  const words = (text || '').split(/\s+/).filter(Boolean);
  const lines = []; let line = '';
  for (const w of words) {
    if (line && (line.length + 1 + w.length) > maxChars) { lines.push(line); line = w; }
    else { line = line ? line + ' ' + w : w; }
  }
  if (line) lines.push(line);
  return lines;
}
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// pick the largest title size whose wrapped block fits the height budget
function fitTitle(title) {
  for (const size of [64, 58, 52, 46, 40]) {
    const maxChars = Math.floor(760 / (size * 0.6));
    const lines = wrap(title, maxChars);
    const lh = Math.round(size * 1.2);
    if (lines.length * lh <= 250 || size === 40) return { size, lines, lh };
  }
}

function card(title, subtitle) {
  const { size: titleSize, lines: tLines, lh: titleLH } = fitTitle(title);
  const subSize = 28, subLH = 38;
  let sLines = subtitle ? wrap(subtitle, 48) : [];
  if (sLines.length > 2) sLines = sLines.slice(0, 2);

  const blockH = tLines.length * titleLH + (sLines.length ? 20 + sLines.length * subLH : 0);
  const top = 140 + Math.max(0, (360 - blockH) / 2);
  const titleBaseline = top + titleSize;
  const subBaseline = titleBaseline + (tLines.length - 1) * titleLH + 20 + subSize;

  const titleTspans = tLines.map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : titleLH}">${esc(l)}</tspan>`).join('');
  const subTspans = sLines.map((l, i) => `<tspan x="72" dy="${i === 0 ? 0 : subLH}">${esc(l)}</tspan>`).join('');

  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#160d33"/><stop offset="0.5" stop-color="#2a1259"/><stop offset="1" stop-color="#431967"/>
    </linearGradient>
    <radialGradient id="glowMag" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#d946ef" stop-opacity="0.5"/><stop offset="1" stop-color="#d946ef" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="hood" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#3b4a63"/><stop offset="1" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="band" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f472b6"/><stop offset="1" stop-color="#ec4899"/>
    </linearGradient>
    <pattern id="dots" width="36" height="36" patternUnits="userSpaceOnUse">
      <circle cx="3" cy="3" r="2" fill="#ffffff" opacity="0.05"/>
    </pattern>
  </defs>

  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#dots)"/>
  <ellipse cx="1080" cy="120" rx="520" ry="420" fill="url(#glowMag)"/>

  <rect x="72" y="96" width="56" height="6" rx="3" fill="#34d399"/>
  <text x="140" y="108" font-family="JetBrains Mono, monospace" font-size="24" fill="#34d399">~/silly.ninja $</text>

  <text x="72" y="${titleBaseline}" font-family="Atkinson Hyperlegible, sans-serif" font-weight="bold" font-size="${titleSize}" fill="#f8fafc">${titleTspans}</text>
  ${sLines.length ? `<text x="72" y="${subBaseline}" font-family="Atkinson Hyperlegible, sans-serif" font-size="${subSize}" fill="#c4b5fd">${subTspans}</text>` : ''}

  <circle cx="84" cy="556" r="16" fill="url(#hood)"/>
  <rect x="70" y="548" width="28" height="5" rx="2.5" fill="url(#band)" transform="rotate(-6 84 550)"/>
  <circle cx="80" cy="558" r="3" fill="#fff"/><circle cx="89" cy="558" r="3" fill="#fff"/>
  <text x="112" y="565" font-family="Atkinson Hyperlegible, sans-serif" font-weight="bold" font-size="26" fill="#e2e8f0">silly.ninja</text>

  <g>
    <circle cx="1050" cy="600" r="150" fill="url(#hood)"/>
    <rect x="912" y="488" width="300" height="34" rx="17" fill="url(#band)" transform="rotate(-6 1050 505)"/>
    <path d="M1196,496 q40,-2 64,18 q-34,6 -64,12 z" fill="#ec4899"/>
    <ellipse cx="1006" cy="548" rx="30" ry="37" fill="#ffffff"/>
    <ellipse cx="1094" cy="548" rx="30" ry="37" fill="#ffffff"/>
    <circle cx="1000" cy="556" r="15" fill="#0f172a"/>
    <circle cx="1088" cy="556" r="15" fill="#0f172a"/>
    <circle cx="1006" cy="550" r="5" fill="#ffffff"/>
    <circle cx="1094" cy="550" r="5" fill="#ffffff"/>
    <ellipse cx="975" cy="584" rx="17" ry="11" fill="#f472b6" opacity="0.4"/>
    <ellipse cx="1119" cy="584" rx="17" ry="11" fill="#f472b6" opacity="0.4"/>
  </g>
</svg>`;
}

const [,, title = 'Untitled', subtitle = '', out = 'og.png'] = process.argv;
const r = new Resvg(card(title, subtitle), { fitTo: { mode: 'width', value: 1200 }, font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: 'Atkinson Hyperlegible' }, background: 'rgba(0,0,0,0)' });
fs.writeFileSync(out, r.render().asPng());
console.log('wrote', out);
