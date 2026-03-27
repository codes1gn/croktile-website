"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const shapes = [
  { m: 128, k: 256, n: 512, label: "Small" },
  { m: 1024, k: 1024, n: 1024, label: "Medium" },
  { m: 4096, k: 4096, n: 4096, label: "Large" },
  { m: 8192, k: 2048, n: 16384, label: "Rectangular" },
];

const symbolicCode = `// One kernel — any shape. No recompilation.
__co__ auto matmul(f32 [M, K] lhs,
                   f32 [N, K] rhs) {
  f32 [M, N] output;
  parallel (blockIdx) {
    shared_a = dma.copy
      lhs.chunkat(bm, 1) => smem;
    shared_b = dma.copy
      rhs.chunkat(bn, 1) => smem;
    within (k : K / bk) {
      mma shared_a.chunkat(1, bk)
          shared_b.chunkat(1, bk)
          => output;
    }
  }
  return output;
}`;

export function FeatureDynamic() {
  const t = useTranslations("features.dynamic");
  const [activeShape, setActiveShape] = useState(0);
  const shape = shapes[activeShape];

  const points = [t("point1"), t("point2"), t("point3")];

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
      description={t("description")}
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

        {/* Interactive shape picker */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center gap-2">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">Pick a shape</span>
            </div>
            <div className="grid grid-cols-4 gap-0 border-b">
              {shapes.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setActiveShape(i)}
                  className={`py-3 px-2 text-center text-xs font-medium transition-all border-r last:border-r-0 ${
                    activeShape === i
                      ? "bg-mint-500/10 text-mint-500"
                      : "hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div className="p-4">
              <div className="flex items-center justify-center gap-3 font-mono text-sm">
                <motion.div
                  key={`m-${activeShape}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-mint-500/10 border border-mint-500/20"
                >
                  <span className="text-xs text-[var(--muted-foreground)]">M</span>
                  <span className="text-lg font-bold text-mint-500">{shape.m}</span>
                </motion.div>
                <span className="text-[var(--muted-foreground)]">&times;</span>
                <motion.div
                  key={`k-${activeShape}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.05 }}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-mint-500/10 border border-mint-500/20"
                >
                  <span className="text-xs text-[var(--muted-foreground)]">K</span>
                  <span className="text-lg font-bold text-mint-500">{shape.k}</span>
                </motion.div>
                <span className="text-[var(--muted-foreground)]">&times;</span>
                <motion.div
                  key={`n-${activeShape}`}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg bg-mint-500/10 border border-mint-500/20"
                >
                  <span className="text-xs text-[var(--muted-foreground)]">N</span>
                  <span className="text-lg font-bold text-mint-500">{shape.n}</span>
                </motion.div>
              </div>
              <motion.p
                key={activeShape}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-center text-[var(--muted-foreground)] mt-3"
              >
                matmul(f32[{shape.m}, {shape.k}], f32[{shape.n}, {shape.k}]) → f32[{shape.m}, {shape.n}]
              </motion.p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b bg-[var(--muted)]">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
              </div>
              <span className="text-xs text-[var(--muted-foreground)] ml-2 font-mono">
                dynamic_matmul.co
              </span>
            </div>
            <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto">
              <pre className="text-[var(--foreground)]"><code>{symbolicCode}</code></pre>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
