"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const kernelBenchmarks = [
  {
    workload: "GEMM FP16",
    shape: "8192×8192×8192",
    croqtile: 471.3,
    baseline: 447.5,
    baselineLabel: "PyTorch",
    ratio: 105.3,
  },
  {
    workload: "GEMM FP8",
    shape: "256×5120×2048",
    croqtile: 262.7,
    baseline: 256.9,
    baselineLabel: "CUTLASS",
    ratio: 102.2,
  },
  {
    workload: "SPMM FP16",
    shape: "4096×8192×8192",
    croqtile: 630.5,
    baseline: 628.5,
    baselineLabel: "cuSparseLt",
    ratio: 100.3,
  },
  {
    workload: "SPMM FP8 E4M3",
    shape: "12288³",
    croqtile: 995.6,
    baseline: 952.1,
    baselineLabel: "cuSparseLt",
    ratio: 104.6,
  },
];

const e2eBenchmarks = [
  {
    model: "Qwen3.5 27B BF16",
    prefillCroq: 5498,
    prefillNative: 6200,
    decodeCroq: 26,
    decodeNative: 28,
  },
  {
    model: "Qwen3.5 27B FP8",
    prefillCroq: 6500,
    prefillNative: 7400,
    decodeCroq: 37,
    decodeNative: 39,
  },
];

export function FeatureZeroCost() {
  const t = useTranslations("features.zeroCost");

  return (
    <FeatureCard
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
        </svg>
      }
      title={t("title")}
      subtitle={t("subtitle")}
      descBullets={[t("desc1"), t("desc2"), t("desc3"), t("desc4")]}
      leftFooter={
        <div className="rounded-lg border border-mint-500/20 bg-mint-500/5 p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-5 h-5 rounded-full bg-mint-500/15 flex items-center justify-center">
              <svg className="w-3 h-3 text-mint-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </span>
            <span className="text-xs font-semibold text-mint-500">{t("whyTitle")}</span>
          </div>
          <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
            {t("whyBody")}
          </p>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Kernel throughput table */}
        <ScrollReveal>
          <div className="rounded-xl border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                Standalone kernel throughput · Hopper
              </span>
              <span className="text-[10px] font-mono text-mint-500">TFLOPS</span>
            </div>
            <div className="divide-y">
              {kernelBenchmarks.map((b, i) => {
                const barWidth = Math.min((b.croqtile / b.baseline) * 100, 110);
                const baseBarWidth = 100;
                return (
                  <motion.div
                    key={b.workload}
                    initial={{ opacity: 0, x: -12 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-xs font-medium">{b.workload}</span>
                        <span className="text-[10px] text-[var(--muted-foreground)] ml-1.5 font-mono">{b.shape}</span>
                      </div>
                      <span className={`text-xs font-bold ${b.ratio >= 100 ? "text-mint-500" : "text-[var(--muted-foreground)]"}`}>
                        {b.ratio}%
                      </span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-[var(--muted-foreground)] w-16 text-right shrink-0">
                          CroqTile
                        </span>
                        <div className="flex-1 h-4 rounded-md bg-[var(--muted)]/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${barWidth}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.08 + 0.2 }}
                            className="h-full rounded-md bg-mint-500/80 flex items-center pl-2"
                          >
                            <span className="text-[9px] font-bold text-white whitespace-nowrap">{b.croqtile}</span>
                          </motion.div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-[var(--muted-foreground)] w-16 text-right shrink-0">
                          {b.baselineLabel}
                        </span>
                        <div className="flex-1 h-4 rounded-md bg-[var(--muted)]/50 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${baseBarWidth}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: i * 0.08 + 0.3 }}
                            className="h-full rounded-md bg-[var(--muted-foreground)]/30 flex items-center pl-2"
                          >
                            <span className="text-[9px] font-bold text-[var(--muted-foreground)] whitespace-nowrap">{b.baseline}</span>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* E2E LLM serving */}
        <ScrollReveal delay={0.15}>
          <div className="rounded-xl border overflow-hidden">
            <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
              <span className="text-xs font-medium text-[var(--muted-foreground)]">
                End-to-end LLM serving · Hopper ×1
              </span>
              <span className="text-[10px] font-mono text-[var(--muted-foreground)]">within 5% of native</span>
            </div>
            <div className="divide-y">
              {e2eBenchmarks.map((b, i) => {
                const prefillPct = ((b.prefillCroq / b.prefillNative) * 100).toFixed(1);
                const decodePct = ((b.decodeCroq / b.decodeNative) * 100).toFixed(1);
                return (
                  <motion.div
                    key={b.model}
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="px-4 py-3"
                  >
                    <div className="text-xs font-medium mb-2">{b.model}</div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 rounded-lg bg-[var(--muted)]/50">
                        <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Prefill</div>
                        <div className="text-sm font-bold text-mint-500">{(b.prefillCroq / 1000).toFixed(1)}k</div>
                        <div className="text-[9px] text-[var(--muted-foreground)]">
                          vs {(b.prefillNative / 1000).toFixed(1)}k · {prefillPct}%
                        </div>
                      </div>
                      <div className="text-center p-2 rounded-lg bg-[var(--muted)]/50">
                        <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Decode</div>
                        <div className="text-sm font-bold text-mint-500">{b.decodeCroq}</div>
                        <div className="text-[9px] text-[var(--muted-foreground)]">
                          vs {b.decodeNative} tok/s · {decodePct}%
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="px-4 py-2.5 border-t bg-[var(--muted)]/30">
              <p className="text-[10px] text-[var(--muted-foreground)] leading-relaxed">
                {t("e2eNote")}
              </p>
            </div>
          </div>
        </ScrollReveal>

      </div>
    </FeatureCard>
  );
}
