"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";
import { HighlightedCode } from "./HighlightedCode";

const shapes = [
  { m: 128, k: 256, n: 512, wm: 64, wn: 128, tk: 64, label: "Small" },
  { m: 1024, k: 1024, n: 1024, wm: 64, wn: 128, tk: 64, label: "Medium" },
  { m: 4096, k: 4096, n: 4096, wm: 64, wn: 256, tk: 64, label: "Large" },
  { m: 8192, k: 2048, n: 16384, wm: 64, wn: 256, tk: 64, label: "Rectangular" },
];

const competitorProblems = [
  {
    framework: "CUDA",
    problem: "All dimensions must be template parameters or runtime arguments with manual size calculations",
    code: `// Must manually compute every buffer size
__shared__ float smA[BM][BK]; // compile-time
// Dynamic SMEM requires manual calc + launch arg
int smem = BM * BK * sizeof(float);
kernel<<<grid, block, smem>>>(...)`,
  },
  {
    framework: "Triton",
    problem: "Block sizes must be tl.constexpr — no dynamic shared memory, no symbolic relationships",
    code: `# Block sizes are compile-time constants
BLOCK_M: tl.constexpr  # can't be symbolic
BLOCK_K: tl.constexpr
# No way to express PACKED_K = K/2
# Must recompile for each shape combination`,
  },
  {
    framework: "Helion",
    problem: "Tile sizes chosen by autotuner — no explicit control over memory hierarchy or relationships",
    code: `# Tile sizes decided by autotuner
for tile_m in hl.tile(M):  # opaque sizing
  for tile_k in hl.tile(K):
    # No control over shared memory layout
    # No symbolic dimension relationships
    acc += a[tile_m, tile_k] @ b[...]`,
  },
];

export function FeatureDynamic() {
  const t = useTranslations("features.dynamic");
  const [activeShape, setActiveShape] = useState(2);
  const [activeProblem, setActiveProblem] = useState(0);
  const shape = shapes[activeShape];

  const points = [t("point1"), t("point2"), t("point3")];

  const blocks_m = Math.ceil(shape.m / shape.wm);
  const blocks_n = Math.ceil(shape.n / shape.wn);
  const k_iters = Math.ceil(shape.k / shape.tk);
  const smem_kb = Math.round((shape.wm * shape.tk * 2 + shape.wn * shape.tk * 2) / 1024);

  return (
    <FeatureCard
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M3 9h18M9 3v18" />
        </svg>
      }
      title={t("title")}
      subtitle={t("subtitle")}
      descBullets={[t("desc1"), t("desc2"), t("desc3"), t("desc4")]}
    >
      <div className="space-y-5">
        <div className="space-y-2">
          {points.map((point, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                <span className="text-[var(--muted-foreground)]">{point}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Interactive shape picker with derived dimensions */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Pick a shape — derived dims update automatically
              </span>
            </div>
            <div className="flex flex-wrap border-b">
              {shapes.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveShape(i)}
                  className={`flex-1 min-w-[5rem] py-2.5 px-3 text-center text-xs font-medium transition-all border-r last:border-r-0 ${
                    activeShape === i
                      ? "bg-mint-500/10 text-mint-500"
                      : "hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="p-4 space-y-3">
              {/* Primary symbolic dims */}
              <div className="flex items-center justify-center gap-3 font-mono text-sm">
                {[
                  { name: "M", val: shape.m },
                  { name: "K", val: shape.k },
                  { name: "N", val: shape.n },
                ].map((d, i) => (
                  <motion.div
                    key={`${d.name}-${activeShape}`}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg bg-mint-500/10 border border-mint-500/20"
                  >
                    <span className="text-[10px] text-[var(--muted-foreground)]">{d.name}</span>
                    <span className="text-base font-bold text-mint-500">{d.val}</span>
                  </motion.div>
                ))}
              </div>
              {/* Derived dimensions */}
              <motion.div
                key={`derived-${activeShape}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center"
              >
                {[
                  { label: "PACKED_K", val: `${shape.k / 2}`, formula: "K/2" },
                  { label: "META_COLS", val: `${shape.k / 8}`, formula: "K/8" },
                  { label: "Grid", val: `${blocks_m}×${blocks_n}`, formula: "⌈M/WM⌉×⌈N/WN⌉" },
                  { label: "SMEM", val: `${smem_kb}KB`, formula: "auto" },
                ].map((d) => (
                  <div
                    key={d.label}
                    className="rounded-lg border bg-[var(--muted)]/50 px-2 py-1.5"
                  >
                    <div className="text-[10px] text-[var(--muted-foreground)]">{d.label}</div>
                    <div className="text-sm font-bold text-[var(--foreground)]">{d.val}</div>
                    <div className="text-[9px] text-mint-500 font-mono">{d.formula}</div>
                  </div>
                ))}
              </motion.div>
              <p className="text-[10px] text-center text-[var(--muted-foreground)]">
                K iterations: {k_iters} &middot; All derived from symbolic M, K, N
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Why competitors can't */}
        <ScrollReveal delay={0.25}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)]">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Why competitors can&apos;t do this
              </span>
            </div>
            <div className="flex border-b">
              {competitorProblems.map((c, i) => (
                <button
                  key={c.framework}
                  onClick={() => setActiveProblem(i)}
                  className={`flex-1 py-2 text-xs font-medium transition-all border-r last:border-r-0 ${
                    activeProblem === i
                      ? "bg-red-500/10 text-red-500"
                      : "hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {c.framework}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeProblem}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-2"
              >
                <p className="text-xs text-red-500 dark:text-red-400 font-medium">
                  {competitorProblems[activeProblem].problem}
                </p>
                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 font-mono text-xs overflow-x-auto">
                  <HighlightedCode
                    code={competitorProblems[activeProblem].code}
                    lang={competitorProblems[activeProblem].framework === "CUDA" ? "cpp" : "python"}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
