"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const tuneResults = [
  { iter: "baseline", tflops: 671, eff: "22.2%", type: ".co", verified: true, opt: "1p1c, swizzle128/128, prepack, 2-stage" },
  { iter: "iter001", tflops: 759, eff: "25.1%", type: ".co", verified: true, opt: "TMA metadata staging" },
  { iter: "iter016", tflops: 772, eff: "25.5%", type: ".co", verified: true, opt: "Early empty signal + merged barrier" },
  { iter: "iter023", tflops: 811, eff: "26.8%", type: ".cu", verified: true, opt: "SW pipelined consumer + warpgroup_wait<1>" },
  { iter: "iter036", tflops: 897, eff: "29.6%", type: ".cu", verified: true, opt: "1-producer/2-consumer warp specialization" },
  { iter: "iter040", tflops: 1090, eff: "36.0%", type: ".cu", verified: true, opt: "3-stage pipeline (from 2-stage), 1p2c" },
  { iter: "iter068", tflops: 1127, eff: "37.2%", type: ".cu", verified: true, opt: "Early empty arrive + all prior (BEST)" },
];

const sessionTabs = [
  {
    label: "AI Prompt",
    content: `User:
continue experiment on branch
ai-tune/2026-03-24/gemm_sp_f16.
Read two reference experiment branches:
  branch 1: ai-tune/2026-03-21/gemm_sp_f16
  branch 2: ai-tune/2026-03-21/gemm_sp_e4m3
Branch 2 best can achieve over 1100 TFLOPS,
branch 1 best 600+ TFLOPS. Do not directly
copy — optimize stage over stage.
KICK OFF EXPERIMENTS NOW.`,
  },
  {
    label: "AI Analysis",
    content: `AI reads reference branches and analyzes:

Key insights from e4m3 branch (1128 TFLOPS):
• TMA metadata staging: 671 → 760 (+13%)
• Merged barrier:       760 → 767
• Early empty signal:   767 → 772
• SW pipelined wait<1>: 772 → 820
• 1p2c warp spec:       820 → 895 (+9%)
• 3-stage pipeline:     895 → 1108 (+24%)

Current baseline: iter084 at 400.3 TFLOPS
NCU bottleneck: Memory 67.9%, L1TEX 52.9%
Next step: 1p2c warp specialization`,
  },
  {
    label: "Iteration Loop",
    content: `iter105: 1p2c f16 accum → 403.4 TFLOPS
  ✓ Verified, but only +0.8% over baseline
  SMEM doubled (73KB → 147KB), hurts occupancy

iter107: uint2 metadata loads → 404.7 TFLOPS
  ✓ Within noise of baseline — DISCARD
  (false 131 TFLOPS reading = GPU contention)

iter109: Early empty signal → 419.2 TFLOPS
  ✓ Verified, +4.7% — KEEP

iter110: SW pipelined metadata → 388 TFLOPS
  ✗ Regression, WGMMA serialization — DISCARD

3-stage + 1p2c → 490 TFLOPS
  ✓ +22.4% over baseline — KEEP`,
  },
  {
    label: "Context Fit",
    content: `Why CroqTile fits AI tuning:

Kernel:    15 lines of .co  (vs 95 CUDA lines)
Context:   412 characters    (fits in one window)
Compiler:  4 safety checks   (auto-generated)
Output:    Structured errors  (AI can parse)
CLI:       --verbose --arch=sm_90a (documented)
Hidden:    0 error-prone configs exposed

AI iterates 68 times in one session,
reaching 1127 TFLOPS from 671 baseline.
Each iteration: edit .co → compile → run → NCU`,
  },
];

const peakTflops = 1127;

export function FeatureAI() {
  const t = useTranslations("features.ai");
  const [activeSession, setActiveSession] = useState(0);
  const [showResults, setShowResults] = useState(false);

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
      descBullets={[t("desc1"), t("desc2"), t("desc3"), t("desc4"), t("desc5")]}
      reversed
    >
      <div className="space-y-5">
        {/* Tabbed AI session */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border bg-[var(--card)] overflow-hidden">
            <div className="flex border-b bg-[var(--muted)] overflow-x-auto">
              {sessionTabs.map((tab, i) => (
                <button
                  key={tab.label}
                  onClick={() => setActiveSession(i)}
                  className={`px-3.5 py-2.5 text-xs font-medium transition-all whitespace-nowrap border-b-2 shrink-0 ${
                    activeSession === i
                      ? "text-mint-500 border-mint-500 bg-[var(--card)]"
                      : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSession}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-[260px] overflow-y-auto"
              >
                <pre className="text-[var(--foreground)] whitespace-pre-wrap text-left">
                  {sessionTabs[activeSession].content}
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* Results table toggle */}
        <ScrollReveal delay={0.25}>
          <button
            onClick={() => setShowResults(!showResults)}
            aria-expanded={showResults}
            className="w-full py-2.5 px-4 rounded-lg text-sm font-medium border
                       hover:bg-[var(--muted)] transition-all text-left flex items-center justify-between"
          >
            <span>results.tsv — e4m3 sparse GEMM, 68 iterations</span>
            <motion.svg
              animate={{ rotate: showResults ? 180 : 0 }}
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
            {showResults && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="rounded-xl border bg-[var(--card)] overflow-hidden mt-2">
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b bg-[var(--muted)]">
                          <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Iter</th>
                          <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">TFLOPS</th>
                          <th className="px-3 py-2 text-right font-medium text-[var(--muted-foreground)]">Eff%</th>
                          <th className="px-3 py-2 text-center font-medium text-[var(--muted-foreground)]">Type</th>
                          <th className="px-3 py-2 text-left font-medium text-[var(--muted-foreground)]">Key Optimization</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {tuneResults.map((row, i) => (
                          <motion.tr
                            key={row.iter}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.06 }}
                            className={`hover:bg-[var(--muted)]/50 ${
                              row.iter === "iter068" ? "bg-mint-500/5" : ""
                            }`}
                          >
                            <td className="px-3 py-2 font-mono font-medium">
                              {row.iter === "iter068" ? (
                                <span className="text-mint-500">{row.iter}</span>
                              ) : row.iter}
                            </td>
                            <td className="px-3 py-2 text-right font-mono font-bold">
                              <span className={row.tflops >= 1000 ? "text-mint-500" : ""}>
                                {row.tflops}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-mono text-[var(--muted-foreground)]">{row.eff}</td>
                            <td className="px-3 py-2 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                                row.type === ".co" ? "bg-mint-500/15 text-mint-500" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                              }`}>
                                {row.type}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-[var(--muted-foreground)] max-w-[200px] truncate" title={row.opt}>{row.opt}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-3 py-2 border-t text-[10px] text-[var(--muted-foreground)] text-center">
                    H800 PCIe &middot; 4096×8192×8192 &middot; FP8 E4M3 Sparse GEMM &middot; Peak 3026 TFLOPS
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </ScrollReveal>

        {/* TFLOPS bars */}
        <ScrollReveal delay={0.3}>
          <div className="space-y-1">
            {tuneResults.slice(0, 4).concat(tuneResults.slice(-1)).map((step, i) => (
              <div key={step.iter} className="flex items-center gap-2">
                <span className="text-[9px] font-mono text-[var(--muted-foreground)] w-14 text-right shrink-0">
                  {step.iter}
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(step.tflops / peakTflops) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 + i * 0.08 }}
                  className={`h-4 rounded flex items-center pl-1.5 min-w-[32px] ${
                    step.iter === "iter068" ? "bg-mint-400" : "bg-mint-500/70"
                  }`}
                >
                  <span className="text-[8px] font-bold text-white">{step.tflops}</span>
                </motion.div>
              </div>
            ))}
          </div>
          <p className="text-[9px] text-center text-[var(--muted-foreground)] mt-1">
            671 → 1127 TFLOPS (+67.9%) in 68 AI-driven iterations
          </p>
        </ScrollReveal>

        {/* AI-Tune Convergence Chart */}
        <ScrollReveal delay={0.35}>
          <div className="rounded-xl border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                AI-Tune Convergence · E4M3 4096×8192×8192
              </span>
              <span className="text-[10px] font-mono text-mint-500">TFLOPS vs Iteration</span>
            </div>
            <div className="p-3">
              <img
                src="/autotune-efficacy-convergence.svg"
                alt="AI tuning convergence: 671→1127 TFLOPS across 68 iterations"
                className="w-full h-auto rounded ai-convergence-light"
              />
              <img
                src="/autotune-efficacy-convergence-dark.svg"
                alt="AI tuning convergence: 671→1127 TFLOPS across 68 iterations"
                className="w-full h-auto rounded ai-convergence-dark"
              />
            </div>
            <div className="px-4 py-2 border-t bg-[var(--muted)]/30 text-center">
              <span className="text-[10px] text-[var(--muted-foreground)]">
                671 → 1127 TFLOPS (+67.9%) across 68 AI-driven iterations
              </span>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </FeatureCard>
  );
}
