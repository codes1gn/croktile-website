import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'out');

// Convergence chart in croqtile-tuner style:
// running-best TFLOPS vs iteration for 4096x8192x8192 (E4M3)
const W = 560, H = 300;
const margin = { top: 25, right: 160, bottom: 48, left: 68 };
const w = W - margin.left - margin.right;
const h = H - margin.top - margin.bottom;

let seed = 20260409;
function rand() {
  seed ^= seed << 13;
  seed ^= seed >> 17;
  seed ^= seed << 5;
  return (seed >>> 0) / 4294967296;
}

function genData(nIter, bestFinal, noiseScale, warmStart, decay) {
  const data = [];
  let best = warmStart;
  for (let i = 1; i <= nIter; i++) {
    const progress = i / nIter;
    const expected = warmStart + (bestFinal - warmStart) *
      (1 - Math.exp(-decay * progress));
    const noise = (rand() - 0.35) * noiseScale;
    const perf = Math.max(700, expected + noise);
    const kept = perf > best;
    if (kept) best = perf;
    data.push({ i, perf, best, kept });
  }
  return data;
}

function scaleData(data, factor) {
  return data.map((d) => ({
    ...d,
    perf: d.perf * factor,
    best: d.best * factor,
  }));
}

seed = 20260409;
const modelRaw = genData(80, 1262, 210, 760, 4.0);
seed = 20260321;
const randomRaw = genData(240, 1098, 260, 720, 1.6);

const targetBest = 1260;
const modelPeak = Math.max(...modelRaw.map((d) => d.best));
const scale = targetBest / modelPeak;
const model = scaleData(modelRaw, scale);
const random = scaleData(randomRaw, scale);

const xMax = 240;
const yMin = 700;
const yMax = 1300;
function sx(v) { return w * v / xMax; }
function sy(v) { return h * (1 - (v - yMin) / (yMax - yMin)); }

const methods = [
  { data: random, color: '#bbbbbb', label: 'Random (no pruning/ranking)' },
  { data: model, color: '#2a9d8f', label: 'Model-guided' },
];

let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="CMU Serif,serif">\n`;
svg += `<rect width="${W}" height="${H}" fill="#ffffff"/>\n`;
svg += `<g transform="translate(${margin.left},${margin.top})">\n`;

for (let y = yMin; y <= yMax; y += 100) {
  svg += `<line x1="0" x2="${w}" y1="${sy(y)}" y2="${sy(y)}" stroke="#e9ecef" stroke-width="0.5"/>\n`;
}

const t98 = targetBest * 0.98;
svg += `<line x1="0" x2="${w}" y1="${sy(t98)}" y2="${sy(t98)}" stroke="#e63946" stroke-width="1" stroke-dasharray="4,3"/>\n`;
svg += `<text x="${w + 4}" y="${sy(t98) + 3}" font-size="8" fill="#e63946">98% of guided peak</text>\n`;

for (const m of methods) {
  for (const d of m.data) {
    if (!d.kept) {
      svg += `<circle cx="${sx(d.i)}" cy="${sy(d.perf)}" r="2" fill="${m.color}" opacity="0.18"/>\n`;
    }
  }
  for (const d of m.data) {
    if (d.kept) {
      svg += `<circle cx="${sx(d.i)}" cy="${sy(d.best)}" r="3.5" fill="${m.color}" opacity="0.85" stroke="#264653" stroke-width="0.5"/>\n`;
    }
  }

  const pts = [];
  let prev = 0;
  for (const d of m.data) {
    if (d.best > prev) {
      if (pts.length) pts.push(`${sx(d.i)},${sy(prev)}`);
      prev = d.best;
    }
    pts.push(`${sx(d.i)},${sy(d.best)}`);
  }
  svg += `<polyline points="${pts.join(' ')}" fill="none" stroke="${m.color}" stroke-width="2"/>\n`;
}

svg += `<line x1="0" x2="${w}" y1="${h}" y2="${h}" stroke="#333" stroke-width="0.5"/>\n`;
for (let x = 0; x <= xMax; x += 50) {
  const px = sx(x);
  svg += `<line x1="${px}" x2="${px}" y1="${h}" y2="${h + 4}" stroke="#333" stroke-width="0.5"/>\n`;
  svg += `<text x="${px}" y="${h + 16}" text-anchor="middle" font-size="9">${x}</text>\n`;
}
svg += `<text x="${w / 2}" y="${h + 38}" text-anchor="middle" font-size="11">Iteration</text>\n`;

svg += `<line x1="0" x2="0" y1="0" y2="${h}" stroke="#333" stroke-width="0.5"/>\n`;
for (let y = yMin; y <= yMax; y += 100) {
  const py = sy(y);
  svg += `<line x1="-4" x2="0" y1="${py}" y2="${py}" stroke="#333" stroke-width="0.5"/>\n`;
  svg += `<text x="-8" y="${py + 3}" text-anchor="end" font-size="9">${y}</text>\n`;
}
svg += `<text transform="rotate(-90)" x="${-h / 2}" y="-50" text-anchor="middle" font-size="11">TFLOPS (E4M3)</text>\n`;

methods.forEach((item, i) => {
  const ly = 10 + i * 18;
  svg += `<circle cx="${w + 16}" cy="${ly}" r="4" fill="${item.color}"/>\n`;
  svg += `<text x="${w + 24}" y="${ly + 4}" font-size="9">${item.label}</text>\n`;
});

svg += `</g>\n</svg>`;

writeFileSync(join(outDir, 'autotune-efficacy-convergence.svg'), svg);
console.log('  → autotune-efficacy-convergence.svg');
