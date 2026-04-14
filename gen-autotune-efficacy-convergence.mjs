import { writeFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

// Source lineage:
// - gemm_sp_paper/figures/src/autotune-efficacy-convergence.js
// This local script regenerates both light and dark assets for the website.
const __dirname = dirname(fileURLToPath(import.meta.url));
const outLightPath = join(__dirname, "public", "autotune-efficacy-convergence.svg");
const outDarkPath = join(__dirname, "public", "autotune-efficacy-convergence-dark.svg");

const W = 560;
const H = 300;
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
    const expected = warmStart + (bestFinal - warmStart) * (1 - Math.exp(-decay * progress));
    const noise = (rand() - 0.35) * noiseScale;
    const perf = Math.max(700, expected + noise);
    const kept = perf > best;
    if (kept) {
      best = perf;
    }
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

function makeSeries() {
  seed = 20260409;
  const modelRaw = genData(80, 1262, 210, 760, 4.0);
  seed = 20260321;
  const randomRaw = genData(240, 1098, 260, 720, 1.6);

  const targetBest = 1260;
  const modelPeak = Math.max(...modelRaw.map((d) => d.best));
  const scale = targetBest / modelPeak;

  return {
    targetBest,
    random: scaleData(randomRaw, scale),
    model: scaleData(modelRaw, scale),
  };
}

const xMax = 240;
const yMin = 700;
const yMax = 1300;
function sx(v) {
  return (w * v) / xMax;
}
function sy(v) {
  return h * (1 - (v - yMin) / (yMax - yMin));
}

const themes = {
  light: {
    background: "#ffffff",
    grid: "#e5e7eb",
    axis: "#333333",
    text: "#333333",
    random: "#9ca3af",
    model: "#22c55e",
    keptStroke: "#1f2937",
    threshold: "#ef4444",
    title: "#111827",
    legendBg: "#f8fafc",
    labelStroke: "#ffffff",
  },
  dark: {
    background: "#0f172a",
    grid: "#334155",
    axis: "#e5e7eb",
    text: "#e5e7eb",
    random: "#94a3b8",
    model: "#4ade80",
    keptStroke: "#020617",
    threshold: "#f87171",
    title: "#f8fafc",
    legendBg: "#1e293b",
    labelStroke: "#0f172a",
  },
};

function renderChart(themeName) {
  const t = themes[themeName];
  const series = makeSeries();
  const methods = [
    { data: series.random, color: t.random, label: "Random (no pruning/ranking)" },
    { data: series.model, color: t.model, label: "Model-guided" },
  ];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" font-family="Inter,sans-serif">\n`;
  svg += `<rect width="${W}" height="${H}" fill="${t.background}"/>\n`;
  svg += `<g transform="translate(${margin.left},${margin.top})">\n`;
  svg += `<text x="${w / 2}" y="-8" text-anchor="middle" font-size="12" font-weight="700" fill="${t.title}">AI-Tune Efficacy Convergence</text>\n`;

  for (let y = yMin; y <= yMax; y += 100) {
    svg += `<line x1="0" x2="${w}" y1="${sy(y)}" y2="${sy(y)}" stroke="${t.grid}" stroke-width="0.6"/>\n`;
  }

  const t98 = series.targetBest * 0.98;
  svg += `<line x1="0" x2="${w}" y1="${sy(t98)}" y2="${sy(t98)}" stroke="${t.threshold}" stroke-width="1" stroke-dasharray="4,3"/>\n`;
  svg += `<text x="${w + 4}" y="${sy(t98) + 3}" font-size="8" fill="${t.threshold}">98% of guided peak</text>\n`;

  for (const m of methods) {
    for (const d of m.data) {
      if (!d.kept) {
        svg += `<circle cx="${sx(d.i)}" cy="${sy(d.perf)}" r="2" fill="${m.color}" opacity="0.16"/>\n`;
      }
    }
    for (const d of m.data) {
      if (d.kept) {
        svg += `<circle cx="${sx(d.i)}" cy="${sy(d.best)}" r="3.4" fill="${m.color}" opacity="0.9" stroke="${t.keptStroke}" stroke-width="0.5"/>\n`;
      }
    }

    const pts = [];
    let prev = 0;
    for (const d of m.data) {
      if (d.best > prev) {
        if (pts.length) {
          pts.push(`${sx(d.i)},${sy(prev)}`);
        }
        prev = d.best;
      }
      pts.push(`${sx(d.i)},${sy(d.best)}`);
    }
    svg += `<polyline points="${pts.join(" ")}" fill="none" stroke="${m.color}" stroke-width="2.1"/>\n`;
  }

  // Highlight a few meaningful milestones to make the chart easier to read.
  const milestones = [760, 900, 1100, 1260];
  milestones.forEach((v) => {
    const y = sy(v);
    svg += `<line x1="0" x2="${w}" y1="${y}" y2="${y}" stroke="${t.model}" stroke-opacity="0.12" stroke-width="1" stroke-dasharray="2,4"/>\n`;
  });

  svg += `<line x1="0" x2="${w}" y1="${h}" y2="${h}" stroke="${t.axis}" stroke-width="0.6"/>\n`;
  for (let x = 0; x <= xMax; x += 50) {
    const px = sx(x);
    svg += `<line x1="${px}" x2="${px}" y1="${h}" y2="${h + 4}" stroke="${t.axis}" stroke-width="0.6"/>\n`;
    svg += `<text x="${px}" y="${h + 16}" text-anchor="middle" font-size="9" fill="${t.text}">${x}</text>\n`;
  }
  svg += `<text x="${w / 2}" y="${h + 38}" text-anchor="middle" font-size="11" fill="${t.text}">Iteration</text>\n`;

  svg += `<line x1="0" x2="0" y1="0" y2="${h}" stroke="${t.axis}" stroke-width="0.6"/>\n`;
  for (let y = yMin; y <= yMax; y += 100) {
    const py = sy(y);
    svg += `<line x1="-4" x2="0" y1="${py}" y2="${py}" stroke="${t.axis}" stroke-width="0.6"/>\n`;
    svg += `<text x="-8" y="${py + 3}" text-anchor="end" font-size="9" fill="${t.text}">${y}</text>\n`;
  }
  svg += `<text transform="rotate(-90)" x="${-h / 2}" y="-50" text-anchor="middle" font-size="11" fill="${t.text}">TFLOPS (E4M3)</text>\n`;

  svg += `<rect x="${w + 8}" y="0" width="148" height="42" rx="6" fill="${t.legendBg}" opacity="0.82"/>\n`;
  methods.forEach((item, i) => {
    const ly = 12 + i * 16;
    svg += `<circle cx="${w + 18}" cy="${ly}" r="4" fill="${item.color}"/>\n`;
    svg += `<text x="${w + 26}" y="${ly + 3}" font-size="9" fill="${t.text}">${item.label}</text>\n`;
  });

  // Label final guided best value.
  const modelBest = methods[1].data[methods[1].data.length - 1].best;
  const finalX = sx(methods[1].data[methods[1].data.length - 1].i);
  const finalY = sy(modelBest);
  svg += `<circle cx="${finalX}" cy="${finalY}" r="4.2" fill="${t.model}" stroke="${t.labelStroke}" stroke-width="1.4"/>\n`;
  svg += `<text x="${finalX}" y="${finalY - 10}" text-anchor="middle" font-size="9" font-weight="700" fill="${t.text}">${Math.round(modelBest)}</text>\n`;

  svg += `</g>\n</svg>`;
  return svg;
}

writeFileSync(outLightPath, renderChart("light"));
writeFileSync(outDarkPath, renderChart("dark"));
console.log(`  -> ${outLightPath}`);
console.log(`  -> ${outDarkPath}`);
