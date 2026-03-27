"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const comparisons = [
  {
    label: "Croktile",
    lines: 15,
    file: "sgemm.co",
    code: `__co__ void gpu_matmul(
    f32 [4096, 4096] lhs,
    f32 [4096, 4096] rhs,
    f32 [4096, 4096] output) {
  parallel {p, q} by [64, 64] {
    with index = {m, n, k} in [4, 4, 128] {
      shared f32[lhs.span(0)/#p,
                 rhs.span(1)/#q] acc;
      foreach k {
        la = dma.copy lhs.chunkat(p, k)
             => shared;
        rb = dma.copy rhs.chunkat(k, q)
             => shared;
        call mma(la.data, rb.data, acc);
      }
      dma.copy acc => output.chunkat(p, q);
    }
  }
}`,
    highlight: true,
  },
  {
    label: "CUDA",
    lines: 32,
    file: "sgemm.cu",
    code: `__global__ void matmul(float* A, float* B,
    float* C, int M, int N, int K) {
  __shared__ float As[BM][BK], Bs[BK][BN];
  int bx = blockIdx.x, by = blockIdx.y;
  int tx = threadIdx.x, ty = threadIdx.y;
  int row = by * BM + ty;
  int col = bx * BN + tx;
  float sum = 0.0f;
  for (int k = 0; k < K; k += BK) {
    As[ty][tx] = A[row * K + k + tx];
    Bs[ty][tx] = B[(k + ty) * N + col];
    __syncthreads();
    #pragma unroll
    for (int kk = 0; kk < BK; kk++)
      sum += As[ty][kk] * Bs[kk][tx];
    __syncthreads();
  }
  C[row * N + col] = sum;
}`,
    highlight: false,
  },
];

export function FeatureEasyToUse() {
  const t = useTranslations("features.easyToUse");
  const [activeCode, setActiveCode] = useState(0);

  const points = [t("point1"), t("point2"), t("point3"), t("point4")];

  return (
    <FeatureCard
      icon={
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      }
      title={t("title")}
      subtitle={t("subtitle")}
      description={t("description")}
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

        {/* Toggle buttons */}
        <ScrollReveal delay={0.2}>
          <div className="flex gap-2">
            {comparisons.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setActiveCode(i)}
                className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                  activeCode === i
                    ? c.highlight
                      ? "bg-mint-500 text-white shadow-lg shadow-mint-500/25"
                      : "bg-[var(--foreground)] text-[var(--background)]"
                    : "border hover:bg-[var(--muted)]"
                }`}
              >
                {c.label} — {c.lines} lines
              </button>
            ))}
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
                {comparisons[activeCode].file}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 font-mono text-xs leading-relaxed overflow-x-auto max-h-[320px] overflow-y-auto"
              >
                <pre className="text-[var(--foreground)]">
                  <code>{comparisons[activeCode].code}</code>
                </pre>
              </motion.div>
            </AnimatePresence>
          </div>
        </ScrollReveal>

        {/* LOC comparison bar */}
        <ScrollReveal delay={0.3}>
          <div className="flex items-end gap-4 px-2">
            <div className="flex-1">
              <div className="text-xs text-[var(--muted-foreground)] mb-1.5 font-medium">Croktile</div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "40%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="h-7 bg-mint-500 rounded-md flex items-center pl-2"
              >
                <span className="text-xs font-bold text-white">15</span>
              </motion.div>
            </div>
            <div className="flex-1">
              <div className="text-xs text-[var(--muted-foreground)] mb-1.5 font-medium">CUDA</div>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "100%" }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="h-7 bg-gray-400 dark:bg-gray-600 rounded-md flex items-center pl-2"
              >
                <span className="text-xs font-bold text-white">32</span>
              </motion.div>
            </div>
          </div>
          <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
            Lines of code for equivalent GEMM kernel
          </p>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
