"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const checks = [
  { label: "Tiling mismatch", status: "error", detail: "chunk size 4 does not divide input shape[2] = 10", line: "12" },
  { label: "Shape incompatible", status: "error", detail: "lhs inner dim (K=64) != rhs inner dim (K=32)", line: "18" },
  { label: "Memory bounds", status: "pass", detail: "All shared memory accesses within 48KB limit", line: "" },
  { label: "DMA alignment", status: "pass", detail: "All DMA operations aligned to 128-byte boundary", line: "" },
];

const runtimeLines = [
  { text: "$ croktile run kernel.co --runtime-checks", delay: 0 },
  { text: "", delay: 0.1 },
  { text: "[CHECK] Verifying tensor shapes at entry...", delay: 0.3 },
  { text: "[CHECK] lhs: [128, 256] ✓", delay: 0.5 },
  { text: "[CHECK] rhs: [256, 512] ✓", delay: 0.7 },
  { text: "[CHECK] Tiling factors valid ✓", delay: 0.9 },
  { text: "[CHECK] Shared memory: 32KB / 48KB ✓", delay: 1.1 },
  { text: "[PASS] All 4 runtime checks passed.", delay: 1.4 },
];

export function FeatureSafety() {
  const t = useTranslations("features.safety");
  const [showRuntime, setShowRuntime] = useState(false);

  const points = [t("point1"), t("point2"), t("point3")];

  return (
    <FeatureCard
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      }
      title={t("title")}
      subtitle={t("subtitle")}
      description={t("description")}
      reversed
    >
      <div className="space-y-5">
        <div className="space-y-2">
          {points.map((point, i) => (
            <ScrollReveal key={i} delay={i * 0.05}>
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-4 h-4 text-mint-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[var(--muted-foreground)]">{point}</span>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Interactive compile-time checks */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Compile-time analysis
              </span>
              <span className="text-xs text-red-500 font-mono">2 errors</span>
            </div>
            <div className="divide-y">
              {checks.map((check, i) => (
                <motion.div
                  key={check.label}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.1 }}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors cursor-default group"
                >
                  {check.status === "error" ? (
                    <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-mint-500/15 flex items-center justify-center shrink-0">
                      <svg className="w-3 h-3 text-mint-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{check.label}</div>
                    <div className="text-xs text-[var(--muted-foreground)] truncate opacity-0 group-hover:opacity-100 transition-opacity">
                      {check.detail}
                    </div>
                  </div>
                  {check.line && (
                    <span className="text-xs font-mono text-red-400">L{check.line}</span>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {/* Runtime check toggle */}
        <ScrollReveal delay={0.35}>
          <button
            onClick={() => setShowRuntime(!showRuntime)}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border
                       hover:bg-[var(--muted)] transition-all text-left flex items-center justify-between"
          >
            <span>Runtime verification</span>
            <motion.svg
              animate={{ rotate: showRuntime ? 180 : 0 }}
              className="w-4 h-4 text-[var(--muted-foreground)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 9l6 6 6-6" />
            </motion.svg>
          </button>

          <AnimatePresence>
            {showRuntime && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border border-mint-500/30 bg-mint-500/5 overflow-hidden mt-2 p-4 font-mono text-xs">
                  {runtimeLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: line.delay }}
                      className={`leading-6 ${
                        line.text.includes("PASS") ? "text-mint-500 font-bold" :
                        line.text.includes("✓") ? "text-mint-600 dark:text-mint-400" : ""
                      }`}
                    >
                      {line.text}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
