"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const milestones = [
  { id: 1, x: 210, y: 420, terrain: "grassland" },
  { id: 2, x: 400, y: 310, terrain: "rainforest" },
  { id: 3, x: 620, y: 390, terrain: "desert" },
  { id: 4, x: 820, y: 280, terrain: "mountain" },
  { id: 5, x: 1000, y: 360, terrain: "glacier" },
  { id: 6, x: 1180, y: 260, terrain: "glacier" },
];

const mascotPos = { x: 60, y: 460 };

const pathPoints = [
  mascotPos,
  ...milestones.map((m) => ({ x: m.x, y: m.y })),
  { x: 1320, y: 220 },
];

function buildSmoothPath(pts: { x: number; y: number }[]) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const cpx1 = prev.x + (curr.x - prev.x) * 0.5;
    const cpx2 = prev.x + (curr.x - prev.x) * 0.5;
    d += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
  }
  return d;
}

const trailPath = buildSmoothPath(pathPoints);

function GrasslandTerrain() {
  return (
    <g>
      {/* Rolling hills */}
      <ellipse cx="120" cy="560" rx="200" ry="100" fill="var(--rm-grass)" opacity="0.7" />
      <ellipse cx="300" cy="540" rx="160" ry="80" fill="var(--rm-grass)" opacity="0.55" />
      <ellipse cx="60" cy="530" rx="120" ry="60" fill="var(--rm-grass-dark)" opacity="0.5" />
      {/* Grass tufts */}
      {[40, 80, 140, 200, 260].map((gx) => (
        <g key={gx} transform={`translate(${gx}, ${490 - Math.random() * 30})`}>
          <line x1="0" y1="0" x2="-4" y2="-14" stroke="var(--rm-grass-dark)" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="0" y2="-16" stroke="var(--rm-grass-dark)" strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="4" y2="-12" stroke="var(--rm-grass-dark)" strokeWidth="2" strokeLinecap="round" />
        </g>
      ))}
      {/* Flowers */}
      {[90, 170, 240].map((fx) => (
        <g key={fx} transform={`translate(${fx}, ${480 - Math.random() * 20})`}>
          <circle cx="0" cy="-8" r="3" fill="var(--rm-flower)" />
          <line x1="0" y1="0" x2="0" y2="-5" stroke="var(--rm-grass-dark)" strokeWidth="1.5" />
        </g>
      ))}
    </g>
  );
}

function RainforestTerrain() {
  return (
    <g>
      <ellipse cx="420" cy="520" rx="180" ry="100" fill="var(--rm-forest)" opacity="0.6" />
      <ellipse cx="350" cy="500" rx="120" ry="70" fill="var(--rm-forest-dark)" opacity="0.4" />
      {/* Trees */}
      {[310, 360, 420, 470, 510].map((tx, i) => (
        <g key={tx} transform={`translate(${tx}, ${380 - i * 8})`}>
          <rect x="-3" y="0" width="6" height="30" rx="2" fill="var(--rm-trunk)" />
          <ellipse cx="0" cy="-8" rx={18 + i * 2} ry={22 + i * 2} fill="var(--rm-forest)" opacity={0.8 - i * 0.05} />
          <ellipse cx="-6" cy="-2" rx={12 + i} ry={16 + i} fill="var(--rm-forest-dark)" opacity={0.6} />
        </g>
      ))}
      {/* Vines */}
      <path d="M 340 360 Q 335 380 340 400" stroke="var(--rm-forest-dark)" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M 480 355 Q 485 375 478 395" stroke="var(--rm-forest-dark)" strokeWidth="1.5" fill="none" opacity="0.5" />
    </g>
  );
}

function DesertTerrain() {
  return (
    <g>
      {/* Sand dunes */}
      <ellipse cx="640" cy="540" rx="160" ry="90" fill="var(--rm-sand)" opacity="0.7" />
      <ellipse cx="720" cy="520" rx="120" ry="60" fill="var(--rm-sand-light)" opacity="0.5" />
      <ellipse cx="560" cy="530" rx="100" ry="50" fill="var(--rm-sand)" opacity="0.5" />
      {/* Cacti */}
      {[570, 680, 740].map((cx) => (
        <g key={cx} transform={`translate(${cx}, 430)`}>
          <rect x="-4" y="-30" width="8" height="30" rx="4" fill="var(--rm-cactus)" />
          <rect x="4" y="-24" width="12" height="6" rx="3" fill="var(--rm-cactus)" />
          <rect x="-16" y="-18" width="12" height="6" rx="3" fill="var(--rm-cactus)" />
        </g>
      ))}
      {/* Sun */}
      <circle cx="700" cy="80" r="30" fill="var(--rm-sun)" opacity="0.3" />
      <circle cx="700" cy="80" r="18" fill="var(--rm-sun)" opacity="0.5" />
    </g>
  );
}

function MountainTerrain() {
  return (
    <g>
      {/* Mountain shapes */}
      <polygon points="760,520 840,250 920,520" fill="var(--rm-mountain)" opacity="0.7" />
      <polygon points="820,520 880,280 960,520" fill="var(--rm-mountain-dark)" opacity="0.5" />
      <polygon points="880,520 940,300 1000,520" fill="var(--rm-mountain)" opacity="0.6" />
      {/* Snow caps */}
      <polygon points="825,280 840,250 855,280" fill="var(--rm-snow)" opacity="0.9" />
      <polygon points="870,310 880,280 900,310" fill="var(--rm-snow)" opacity="0.85" />
      <polygon points="925,330 940,300 955,330" fill="var(--rm-snow)" opacity="0.8" />
      {/* Rocks */}
      {[780, 830, 900].map((rx) => (
        <ellipse key={rx} cx={rx} cy={470} rx={8} ry={5} fill="var(--rm-rock)" opacity="0.5" />
      ))}
    </g>
  );
}

function GlacierTerrain() {
  return (
    <g>
      {/* Ice fields */}
      <ellipse cx="1060" cy="520" rx="180" ry="90" fill="var(--rm-ice)" opacity="0.5" />
      <ellipse cx="1160" cy="500" rx="140" ry="70" fill="var(--rm-ice-light)" opacity="0.4" />
      {/* Icebergs */}
      <polygon points="1000,440 1020,390 1040,440" fill="var(--rm-ice)" opacity="0.7" />
      <polygon points="1080,420 1100,370 1120,420" fill="var(--rm-ice-light)" opacity="0.8" />
      <polygon points="1160,410 1185,350 1210,410" fill="var(--rm-ice)" opacity="0.65" />
      {/* Snowflake accents */}
      {[1020, 1100, 1170, 1230].map((sx) => (
        <g key={sx} transform={`translate(${sx}, ${300 + Math.random() * 60})`}>
          <circle r="2" fill="var(--rm-snow)" opacity="0.6" />
        </g>
      ))}
    </g>
  );
}

function OceanHorizon() {
  return (
    <g>
      {/* Water */}
      <ellipse cx="1350" cy="520" rx="120" ry="80" fill="var(--rm-water)" opacity="0.3" />
      {/* Waves */}
      <path d="M 1280 480 Q 1300 470 1320 480 Q 1340 490 1360 480" stroke="var(--rm-water)" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 1300 500 Q 1320 490 1340 500 Q 1360 510 1380 500" stroke="var(--rm-water)" strokeWidth="1.5" fill="none" opacity="0.3" />
    </g>
  );
}

function MilestoneFlag({ x, y, num, title, desc, side }: {
  x: number; y: number; num: number; title: string; desc: string; side: "top" | "bottom";
}) {
  const cardY = side === "top" ? y - 110 : y + 30;
  const poleEnd = side === "top" ? cardY + 60 : y;
  const poleStart = side === "top" ? y - 10 : y + 10;

  return (
    <g>
      {/* Pole */}
      <line x1={x} y1={poleStart} x2={x} y2={poleEnd} stroke="var(--rm-pole)" strokeWidth="2" strokeLinecap="round" />
      {/* Flag circle */}
      <circle cx={x} cy={y - 10} r="14" fill="var(--rm-flag)" stroke="var(--rm-flag-border)" strokeWidth="2" />
      <text x={x} y={y - 5} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--rm-flag-text)">{num}</text>
      {/* Card */}
      <rect x={x - 70} y={cardY} width="140" height="50" rx="8" fill="var(--rm-card)" stroke="var(--rm-card-border)" strokeWidth="1" />
      <text x={x} y={cardY + 20} textAnchor="middle" fontSize="11" fontWeight="bold" fill="var(--rm-card-title)">{title}</text>
      <text x={x} y={cardY + 36} textAnchor="middle" fontSize="8.5" fill="var(--rm-card-desc)">
        {desc.length > 28 ? desc.slice(0, 26) + "…" : desc}
      </text>
    </g>
  );
}

function ToBeContinued() {
  return (
    <g transform="translate(1310, 200)">
      {/* Arrow */}
      <line x1="0" y1="20" x2="60" y2="0" stroke="var(--rm-arrow)" strokeWidth="3" strokeLinecap="round" />
      <polygon points="60,0 48,6 52,-6" fill="var(--rm-arrow)" />
      {/* Question mark */}
      <text x="72" y="8" fontSize="24" fontWeight="bold" fill="var(--rm-arrow)" opacity="0.7">?</text>
    </g>
  );
}

export function RoadmapMap() {
  const t = useTranslations("roadmap");

  const milestonesData = milestones.map((m) => ({
    ...m,
    title: t(`m${m.id}_title`),
    desc: t(`m${m.id}_desc`),
    side: (m.id % 2 === 0 ? "bottom" : "top") as "top" | "bottom",
  }));

  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">{t("title")}</h1>
            <p className="text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">{t("subtitle")}</p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div className="roadmap-map-container overflow-x-auto pb-4">
            <svg
              viewBox="0 0 1440 600"
              className="w-full min-w-[900px] h-auto"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label={t("title")}
            >
              <defs>
                <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--rm-sky-top)" />
                  <stop offset="100%" stopColor="var(--rm-sky-bottom)" />
                </linearGradient>
                <linearGradient id="groundGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="var(--rm-grass)" />
                  <stop offset="25%" stopColor="var(--rm-forest)" />
                  <stop offset="50%" stopColor="var(--rm-sand)" />
                  <stop offset="75%" stopColor="var(--rm-mountain)" />
                  <stop offset="100%" stopColor="var(--rm-ice)" />
                </linearGradient>
              </defs>

              {/* Sky */}
              <rect width="1440" height="600" fill="url(#skyGrad)" />

              {/* Ground band */}
              <ellipse cx="720" cy="600" rx="800" ry="120" fill="url(#groundGrad)" opacity="0.15" />

              {/* Terrain */}
              <GrasslandTerrain />
              <RainforestTerrain />
              <DesertTerrain />
              <MountainTerrain />
              <GlacierTerrain />
              <OceanHorizon />

              {/* Trail path */}
              <motion.path
                d={trailPath}
                fill="none"
                stroke="var(--rm-trail)"
                strokeWidth="4"
                strokeDasharray="12 8"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />

              {/* Mascot at start */}
              <g transform={`translate(${mascotPos.x - 28}, ${mascotPos.y - 28})`}>
                <image
                  href="/logo-mascot.png"
                  width="56"
                  height="56"
                  style={{ borderRadius: "50%" }}
                />
                <rect x="-12" y="60" width="80" height="22" rx="6" fill="var(--rm-flag)" opacity="0.9" />
                <text x="28" y="75" textAnchor="middle" fontSize="9" fontWeight="bold" fill="var(--rm-flag-text)">
                  {t("current")}
                </text>
              </g>

              {/* Milestones */}
              {milestonesData.map((m) => (
                <MilestoneFlag
                  key={m.id}
                  x={m.x}
                  y={m.y}
                  num={m.id}
                  title={m.title}
                  desc={m.desc}
                  side={m.side}
                />
              ))}

              {/* To be continued */}
              <ToBeContinued />

              {/* Clouds */}
              {[{ cx: 180, cy: 60 }, { cx: 500, cy: 40 }, { cx: 900, cy: 55 }, { cx: 1250, cy: 35 }].map((c, i) => (
                <g key={i} opacity="0.3">
                  <ellipse cx={c.cx} cy={c.cy} rx="40" ry="14" fill="var(--rm-cloud)" />
                  <ellipse cx={c.cx - 20} cy={c.cy + 4} rx="24" ry="10" fill="var(--rm-cloud)" />
                  <ellipse cx={c.cx + 22} cy={c.cy + 3} rx="28" ry="11" fill="var(--rm-cloud)" />
                </g>
              ))}
            </svg>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
