"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const compilerSteps = [
  { text: "$ croktile compile kernel.co --verbose", type: "cmd" as const },
  { text: "", type: "blank" as const },
  { text: "[INFO]  Parsing kernel.co (15 lines, 412 chars)", type: "info" as const },
  { text: "[SEMA]  Type inference: 3 symbolic dims resolved", type: "info" as const },
  { text: "[SEMA]  Tiling validation: all 4 chunkat ops valid", type: "info" as const },
  { text: "[CHECK] Shape: f32[M,K] × f32[N,K] → f32[M,N] ✓", type: "check" as const },
  { text: "[CHECK] Shared memory: 2 allocs, auto-sized ✓", type: "check" as const },
  { text: "[CHECK] DMA alignment: 128-byte boundary ✓", type: "check" as const },
  { text: "[GEN]   Target: CUDA (sm_90a)", type: "info" as const },
  { text: "[GEN]   Generated: kernel.cu (87 lines)", type: "info" as const },
  { text: "", type: "blank" as const },
  { text: "Compilation successful. 0 errors, 0 warnings.", type: "success" as const },
];

const stats = [
  { value: "15", label: "Lines of code", sub: "vs 32 in CUDA" },
  { value: "412", label: "Characters", sub: "fits one AI context" },
  { value: "0", label: "Hidden configs", sub: "no error-prone knobs" },
  { value: "4", label: "Safety checks", sub: "auto-generated" },
];

export function FeatureAI() {
  const t = useTranslations("features.ai");
  const [compiling, setCompiling] = useState(false);
  const [showOutput, setShowOutput] = useState(false);

  const points = [t("point1"), t("point2"), t("point3"), t("point4")];

  function handleCompile() {
    setCompiling(true);
    setShowOutput(true);
    setTimeout(() => setCompiling(false), 2000);
  }

  return (
    <FeatureCard
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a4 4 0 0 1 4 4v1a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z" />
          <path d="M16 14a4 4 0 0 1 4 4v2H4v-2a4 4 0 0 1 4-4h8z" />
          <circle cx="12" cy="12" r="10" strokeDasharray="4 4" />
        </svg>
      }
      title={t("title")}
      subtitle={t("subtitle")}
      description={t("description")}
      reversed
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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

        {/* Stats grid */}
        <ScrollReveal delay={0.15}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.08 }}
                whileHover={{ scale: 1.03 }}
                className="rounded-xl border bg-[var(--card)] p-3 text-center cursor-default"
              >
                <div className="text-2xl font-bold text-mint-500">{stat.value}</div>
                <div className="text-xs text-[var(--foreground)] font-medium mt-0.5">{stat.label}</div>
                <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">{stat.sub}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        {/* Interactive compiler */}
        <ScrollReveal delay={0.25}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-[var(--muted)]">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                AI-friendly compiler output
              </span>
              <button
                onClick={handleCompile}
                disabled={compiling}
                className="px-3 py-1 rounded-md text-xs font-medium bg-mint-500 text-white
                           hover:bg-mint-600 transition-all disabled:opacity-50
                           hover:scale-105 active:scale-95"
              >
                {compiling ? "Compiling..." : "Run compile"}
              </button>
            </div>
            <AnimatePresence>
              {showOutput && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="p-4 font-mono text-xs overflow-x-auto space-y-0">
                    {compilerSteps.map((step, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.12 }}
                        className={`leading-6 ${
                          step.type === "cmd" ? "text-[var(--foreground)] font-bold" :
                          step.type === "check" ? "text-mint-600 dark:text-mint-400" :
                          step.type === "success" ? "text-mint-500 font-bold" :
                          step.type === "blank" ? "" :
                          "text-[var(--muted-foreground)]"
                        }`}
                      >
                        {step.text || "\u00A0"}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {!showOutput && (
              <div className="p-6 text-center text-xs text-[var(--muted-foreground)]">
                Click &ldquo;Run compile&rdquo; to see the output
              </div>
            )}
          </div>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
