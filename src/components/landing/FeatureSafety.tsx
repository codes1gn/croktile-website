"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";

const compileChecks = [
  { module: "earlysema.cpp", count: 189, category: "Early Semantic Analysis", examples: ["type mismatch in SELECT", "invalid parallel nesting", "undeclared variable in __co__ scope"] },
  { module: "semacheck.cpp", count: 65, category: "Semantic Validation", examples: ["inconsistent shapes for spanned-operation", "invalid DMA target memory space", "MMA: matrix shapes do not match"] },
  { module: "typeinfer.cpp", count: 38, category: "Type Inference", examples: ["cannot infer element type", "conflicting types in reduction", "incompatible accumulator dtype"] },
  { module: "shapeinfer.cpp", count: 33, category: "Shape Inference", examples: ["tiling factor exceeds data size", "index out of bounds for dimension", "span size mismatch in chunkat"] },
  { module: "loop_vectorize.cpp", count: 16, category: "Loop Vectorization", examples: ["vectorize factor not divisible", "invalid loop bounds for SIMD"] },
  { module: "assess.cpp", count: 4, category: "Static Assessment", examples: ["shape incompatibility proven at compile time"] },
  { module: "codegen + others", count: 8, category: "Code Generation", examples: ["target architecture constraint violated", "DMA size exceeds 2^32 bytes"] },
];

const runtimeChecks = [
  { type: "runtime_check()", count: 128, what: "Host-side shape/alignment checks emitted by codegen", examples: ["k % 64 == 0", "DMA transfer size within limit", "tensor dimension > 0"] },
  { type: "choreo_assert()", count: 558, what: "Verification assertions in test/benchmark kernels", examples: ["values are not equal", "result shape matches expected", "memory bounds valid"] },
  { type: "#error", count: 633, what: "Compile-time config validation in kernel headers", examples: ["WARP_M must be 64 for WGMMA", "TILE_K must equal 2 * PACKED_TILE_K", "SWIZ must be 32, 64, or 128"] },
];

const totalCompileChecks = compileChecks.reduce((s, c) => s + c.count, 0);
const totalRuntimeChecks = runtimeChecks.reduce((s, c) => s + c.count, 0);

export function FeatureSafety() {
  const t = useTranslations("features.safety");
  const [activeTab, setActiveTab] = useState<"compile" | "runtime">("compile");

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

        {/* Toggle: compile vs runtime */}
        <ScrollReveal delay={0.15}>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("compile")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "compile"
                  ? "bg-red-500/10 text-red-500 border border-red-500/30"
                  : "border hover:bg-[var(--muted)]"
              }`}
            >
              Compile-time &middot; {totalCompileChecks} checks
            </button>
            <button
              onClick={() => setActiveTab("runtime")}
              className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "runtime"
                  ? "bg-mint-500/10 text-mint-500 border border-mint-500/30"
                  : "border hover:bg-[var(--muted)]"
              }`}
            >
              Runtime &middot; {totalRuntimeChecks} assertions
            </button>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <AnimatePresence mode="wait">
            {activeTab === "compile" ? (
              <motion.div
                key="compile"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Compiler Error1() call sites across modules
                  </span>
                  <span className="text-xs text-red-500 font-mono font-bold">{totalCompileChecks}</span>
                </div>
                <div className="divide-y">
                  {compileChecks.map((check, i) => (
                    <motion.div
                      key={check.module}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="px-4 py-2.5 hover:bg-[var(--muted)]/50 transition-colors cursor-default group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-red-500/15 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </span>
                          <span className="text-xs font-medium">{check.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-[var(--muted-foreground)]">{check.module}</span>
                          <span className="text-xs font-bold text-red-500 w-8 text-right">{check.count}</span>
                        </div>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {check.examples.map((ex) => (
                          <span key={ex} className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-mono">{ex}</span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
                {/* Bar chart */}
                <div className="px-4 py-3 border-t bg-[var(--muted)]/30">
                  <div className="flex items-end gap-1 h-12">
                    {compileChecks.map((check) => (
                      <motion.div
                        key={check.module}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${(check.count / 189) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="flex-1 bg-red-500/60 rounded-t hover:bg-red-500 transition-colors"
                        title={`${check.category}: ${check.count}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-1 mt-1">
                    {compileChecks.map((check) => (
                      <span key={check.module} className="flex-1 text-[8px] text-center text-[var(--muted-foreground)] truncate">
                        {check.module.replace(".cpp", "")}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="runtime"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-xl border overflow-hidden"
              >
                <div className="px-4 py-2.5 border-b bg-[var(--muted)] flex items-center justify-between">
                  <span className="text-xs font-medium text-[var(--muted-foreground)]">
                    Runtime assertions across test &amp; benchmark .co files
                  </span>
                  <span className="text-xs text-mint-500 font-mono font-bold">{totalRuntimeChecks}</span>
                </div>
                <div className="divide-y">
                  {runtimeChecks.map((check, i) => (
                    <motion.div
                      key={check.type}
                      initial={{ opacity: 0, x: -8 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="px-4 py-3 hover:bg-[var(--muted)]/50 transition-colors cursor-default group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-4 h-4 rounded bg-mint-500/15 flex items-center justify-center shrink-0">
                            <svg className="w-2.5 h-2.5 text-mint-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                          </span>
                          <span className="text-xs font-mono font-medium">{check.type}</span>
                        </div>
                        <span className="text-xs font-bold text-mint-500">{check.count}</span>
                      </div>
                      <p className="text-[10px] text-[var(--muted-foreground)] mt-1 ml-6">{check.what}</p>
                      <div className="mt-1.5 ml-6 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {check.examples.map((ex) => (
                          <span key={ex} className="text-[9px] px-1.5 py-0.5 rounded bg-mint-500/10 text-mint-400 font-mono">{ex}</span>
                        ))}
                      </div>
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
