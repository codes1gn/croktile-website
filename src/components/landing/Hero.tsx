"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useState, useEffect, useCallback } from "react";

const codeExamples = [
  {
    label: "Matrix Multiply",
    file: "sgemm.co",
    code: `__co__ void gpu_matmul(
    f32 [4096, 4096] lhs,
    f32 [4096, 4096] rhs,
    f32 [4096, 4096] output) {

  parallel {p, q} by [64, 64] {
    with index = {m_tile, n_tile, k_tile}
         in [4, 4, 128] {
      shared f32[lhs.span(0)/#p,
                 rhs.span(1)/#q] l2_out;
      foreach k_tile {
        lhs_load = dma.copy
          lhs.chunkat(p, k_tile) => shared;
        rhs_load = dma.copy
          rhs.chunkat(k_tile, q) => shared;
        call mma_kernel(lhs_load.data,
          rhs_load.data, l2_out);
      }
      dma.copy l2_out
        => output.chunkat(p, q);
    }
  }
}`,
  },
  {
    label: "TMA Copy",
    file: "tma_copy.co",
    code: `__co__ auto tma_copy_tiled(
    f32 [6, 16, 128] input) {
  f32 [input.span] output;

  parallel p by 32 : block {
    f = tma.copy.async
      input.chunkat(_, _, p) => shared;
    wait f;
    tma.copy f.data
      => output.chunkat(_, _, p);
  }

  return output;
}`,
  },
  {
    label: "LayerNorm",
    file: "layernorm.co",
    code: `__co__ void layernorm(
    f32[N, M] X,
    f32[M] gamma, f32[M] beta,
    f32[N, M] Y, f32 eps) {

  parallel p by N {
    local = dma.copy
      X.chunkat(p, _) => shared;
    wait local;

    call norm_kernel(local.data,
      gamma, beta, Y.chunkat(p, _),
      eps, M);
  }
}`,
  },
];

function TypeWriter({ text, speed = 18, onDone }: { text: string; speed?: number; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);

  return (
    <>
      {displayed}
      {!done && <span className="inline-block w-[2px] h-[1.1em] bg-mint-400 animate-cursor-blink align-middle ml-[1px]" />}
    </>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const [activeTab, setActiveTab] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const handleTabChange = useCallback((idx: number) => {
    setActiveTab(idx);
    setIsTyping(true);
  }, []);

  const handleTypingDone = useCallback(() => {
    setIsTyping(false);
  }, []);

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-40 dark:opacity-20" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[700px] rounded-full bg-mint-400/10 dark:bg-mint-500/5 blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-20 sm:pt-28 sm:pb-28">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border bg-[var(--card)] text-sm mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-mint-500 animate-pulse" />
            <span className="text-[var(--muted-foreground)]">
              Open Source &middot; Production Ready
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.08]"
          >
            {t("tagline")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl leading-relaxed"
          >
            {t("subtitle")}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row gap-4"
          >
            <Link
              href="/docs"
              className="px-8 py-3.5 text-sm font-semibold bg-mint-500 text-white rounded-xl
                         hover:bg-mint-600 transition-all shadow-lg shadow-mint-500/25
                         hover:shadow-mint-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cta")}
            </Link>
            <a
              href="https://github.com/codes1gn/croktile"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-sm font-semibold border rounded-xl
                         hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-2
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </motion.div>

          {/* Interactive code showcase */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 w-full max-w-4xl"
          >
            <div className="rounded-xl border bg-[var(--card)] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/40">
              {/* Tab bar */}
              <div className="flex items-center border-b bg-[var(--muted)]">
                <div className="flex items-center gap-1.5 px-4 py-3">
                  <span className="w-3 h-3 rounded-full bg-red-400/80" />
                  <span className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <span className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex gap-0 ml-2">
                  {codeExamples.map((ex, i) => (
                    <button
                      key={ex.label}
                      onClick={() => handleTabChange(i)}
                      className={`px-4 py-2.5 text-xs font-medium transition-all border-b-2 ${
                        activeTab === i
                          ? "text-mint-500 border-mint-500 bg-[var(--card)]"
                          : "text-[var(--muted-foreground)] border-transparent hover:text-[var(--foreground)] hover:bg-[var(--card)]/50"
                      }`}
                    >
                      {ex.file}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code area */}
              <div className="relative p-5 min-h-[380px] sm:min-h-[420px] font-mono text-[13px] leading-[1.7] overflow-x-auto">
                <AnimatePresence mode="wait">
                  <motion.pre
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="text-[var(--foreground)]"
                  >
                    <code>
                      <TypeWriter
                        text={codeExamples[activeTab].code}
                        speed={12}
                        onDone={handleTypingDone}
                      />
                    </code>
                  </motion.pre>
                </AnimatePresence>
              </div>

              {/* Bottom bar with badges */}
              <AnimatePresence>
                {!isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-wrap items-center gap-2 px-5 py-3 border-t bg-[var(--muted)]/50"
                  >
                    {["Symbolic Shapes", "DMA Async", "Auto-Tiled", "Compile-Safe"].map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-md text-xs font-medium
                                   bg-mint-500/10 text-mint-600 dark:text-mint-400
                                   border border-mint-500/20"
                      >
                        {tag}
                      </span>
                    ))}
                    <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                      {codeExamples[activeTab].label}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
