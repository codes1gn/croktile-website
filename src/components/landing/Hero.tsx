"use client";

import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@/i18n/routing";
import { useState, useCallback } from "react";
import { HighlightedCode } from "./HighlightedCode";

const codeExamples = [
  {
    label: "Sparse GEMM (FP8 E4M3)",
    file: "gemm_sp_e4m3.co",
    code: `__co__ void spmm(
    global f8_e4m3 [M, PACKED_K] lhs_packed,
    global u8 [M, META_COLS] lhs_meta,
    global f8_e4m3 [N, K] rhs,
    global f16 [M, N] output) {
  parallel {block_m, block_n}
      by [cdiv(M, SPMM_WARP_M),
          cdiv(N, SPMM_WARP_N)] : block {
    shared event full[STAGES], empty[STAGES];
    shared f8_e4m3 [STAGES * SPMM_WARP_M,
                    SPMM_PACKED_TILE_K] lhs_s;
    shared f8_e4m3 [STAGES * SPMM_WARP_N,
                    SPMM_TILE_K] rhs_s;

    parallel p1 by 2 : group-4 {
      inthreads.async (p1 == 0) {
        foreach {iv_k} in [cdiv(K, SPMM_TILE_K)] {
          stage = iv_k % STAGES;
          wait empty[stage];
          tma.copy.async<full[stage]>.swiz<32>
            lhs_packed.subspan(SPMM_WARP_M,
              SPMM_PACKED_TILE_K).at(block_m, iv_k)
            => lhs_s.subspan(SPMM_WARP_M,
              SPMM_PACKED_TILE_K).at(stage, 0);
          trigger full[stage];
        }
      }
      inthreads.async (p1 == 1) {
        mc = mma.fill.f16 0.0f;
        foreach {iv_k} in [cdiv(K, SPMM_TILE_K)] {
          wait full[iv_k % STAGES];
          ma = mma.load.swiz<32>
            lhs_s.at(iv_k % STAGES, 0);
          mb = mma.load.swiz<64>
            rhs_s.at(iv_k % STAGES, 0);
          me = mma.load lhs_meta_s;
          mma.row.row.sp mc, ma, mb, me;
          trigger empty[iv_k % STAGES];
        }
        mma.store mc, output_s;
        tma.copy output_s
          => output.subspan(SPMM_WARP_M,
             SPMM_WARP_N).at(block_m, block_n);
      }
    }
  }
}`,
  },
  {
    label: "Fused MoE (FP8→BF16)",
    file: "moe_gemm.co",
    code: `__co__ void moe_gemm_kernel_bf16(
    global f8_e4m3 [M, K] lhs,
    global f32 [M, DIV_BLK_K] scale_a,
    global f8_e4m3 [EXPERT_N, K] rhs,
    global f32 [EXPERT_DIV_BLK_N, DIV_BLK_K] scale_b,
    global s32 [EXPERTS1] expert_offsets,
    global bf16 [M, N] output, stream s) {

  parallel.async {eid, block_n}
    by [EXPERTS, cdiv(N, WARP_N)] : block
  parallel by 1 : group-4
  parallel t by 128 : thread {
    shared f8_e4m3 [WARP_M, TILE_K] sA;
    shared f8_e4m3 [WARP_N, TILE_K] sB;

    s32 seg_start = expert_offsets.at(eid);
    s32 seg_end   = expert_offsets.at(eid + 1);

    foreach {iv_m} in [cdiv(seg_end-seg_start,
                            WARP_M)] {
      mc = mma.fill.f32 0.0f;
      foreach {iv_k} in [cdiv(K, TILE_K)] {
        dma.copy.swiz<128>.zfill
          lhs.view(WARP_M, TILE_K)
            .from(seg_start + iv_m*WARP_M,
                  iv_k*TILE_K) => sA;
        tma.copy.swiz<128>
          rhs.subspan(WARP_N, TILE_K)
            .at(eid # block_n, iv_k) => sB;
        ma = mma.load.swiz<128> sA;
        mb = mma.load.swiz<128> sB;
        mma.row.row mc, ma, mb;
        mma.scale mc,
          scale_a.view(WARP_M, 1)
            .from(seg_start+iv_m*WARP_M, iv_k),
          scale_b.at(eid # block_n, iv_k);
      }
      mma.store mc, output.view(TILE_M, WARP_N)
        .from(seg_start+iv_m*WARP_M,
              block_n*WARP_N);
    }
  }
}`,
  },
  {
    label: "Persistent Hilbert GEMM",
    file: "matmul_hilbert.co",
    code: `// Persistent kernel with Hilbert curve
// tile scheduling for L2 cache locality
__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output,
    global s32 [T] schedule_m,
    global s32 [T] schedule_n) {

  int total_tiles = cdiv(M, WARP_M)
                  * cdiv(N, WARP_N);

  parallel block_id by NUM_SMS : block {
    shared f16 [WARP_M, TILE_K] lhs_s;
    shared f16 [WARP_N, TILE_K] rhs_s;
    shared f16 [WARP_M, WARP_N] out_s;

    foreach {tile_iter}
        in [cdiv(total_tiles, NUM_SMS)] {
      tile_id = tile_iter # block_id;
      if (tile_id < total_tiles) {
        int bm = schedule_m.at(tile_id);
        int bn = schedule_n.at(tile_id);
        mc = mma.fill.f16 0.0f;
        foreach {iv_k} in [cdiv(K, TILE_K)] {
          tma.copy.swiz<128>
            lhs.subspan(WARP_M, TILE_K)
              .at(bm, iv_k) => lhs_s;
          tma.copy.swiz<128>
            rhs.subspan(WARP_N, TILE_K)
              .at(bn, iv_k) => rhs_s;
          parallel p by 1 : group-4 {
            ma = mma.load.swiz<128> lhs_s;
            mb = mma.load.swiz<128> rhs_s;
            mma.row.row mc, ma, mb;
          }
        }
        mma.store mc, out_s;
        tma.copy out_s
          => output.subspan(WARP_M, WARP_N)
               .at(bm, bn);
      }
    }
  }
}`,
  },
];

export function Hero() {
  const t = useTranslations("hero");
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = useCallback((idx: number) => {
    setActiveTab(idx);
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

          {/* Interactive code showcase with syntax highlighting */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 w-full max-w-4xl"
          >
            <div className="rounded-xl border bg-[var(--card)] overflow-hidden shadow-2xl shadow-black/5 dark:shadow-black/40">
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

              <div className="relative p-5 min-h-[340px] sm:min-h-[380px] font-mono overflow-x-auto">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    <HighlightedCode code={codeExamples[activeTab].code} />
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t bg-[var(--muted)]/50">
                <span className="text-xs font-medium text-[var(--muted-foreground)]">
                  {codeExamples[activeTab].label}
                </span>
                <span className="ml-auto text-xs text-[var(--muted-foreground)]">
                  Real production kernel from choreo repository
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
