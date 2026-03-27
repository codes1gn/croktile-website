"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { FeatureCard } from "./FeatureCard";
import { ScrollReveal } from "./ScrollReveal";
import { HighlightedCode } from "./HighlightedCode";

const comparisons = [
  {
    label: "Croktile",
    lines: 36,
    file: "matmul_hilbert.co",
    code: `__co__ void matmul(
    global f16 [M, K] lhs,
    global f16 [N, K] rhs,
    global f16 [M, N] output,
    global s32 [T] schedule_m,
    global s32 [T] schedule_n) {
  int total = cdiv(M, WARP_M) * cdiv(N, WARP_N);
  parallel block_id by NUM_SMS : block {
    shared f16 [WARP_M, TILE_K] lhs_s;
    shared f16 [WARP_N, TILE_K] rhs_s;
    shared f16 [WARP_M, WARP_N] out_s;
    foreach {tile} in [cdiv(total, NUM_SMS)] {
      tile_id = tile # block_id;
      if (tile_id < total) {
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
        tma.copy out_s => output.subspan(
          WARP_M, WARP_N).at(bm, bn);
      }
    }
  }
}`,
    highlight: true,
    lang: "choreo",
    source: "",
  },
  {
    label: "Triton",
    lines: 49,
    file: "09-persistent-matmul.py",
    code: `@triton.jit
def matmul_kernel_persistent(
    a_ptr, b_ptr, c_ptr,
    M, N, K,
    stride_am, stride_ak,
    stride_bk, stride_bn,
    stride_cm, stride_cn,
    BLOCK_SIZE_M: tl.constexpr,
    BLOCK_SIZE_N: tl.constexpr,
    BLOCK_SIZE_K: tl.constexpr,
    GROUP_SIZE_M: tl.constexpr,
    NUM_SMS: tl.constexpr):
  start_pid = tl.program_id(axis=0)
  num_pid_m = tl.cdiv(M, BLOCK_SIZE_M)
  num_pid_n = tl.cdiv(N, BLOCK_SIZE_N)
  k_tiles = tl.cdiv(K, BLOCK_SIZE_K)
  num_tiles = num_pid_m * num_pid_n

  tile_id_c = start_pid - NUM_SMS
  num_pid_in_group = GROUP_SIZE_M * num_pid_n
  offs_k_for_mask = tl.arange(0, BLOCK_SIZE_K)

  for tile_id in tl.range(start_pid, num_tiles,
                          NUM_SMS, flatten=True):
    pid_m, pid_n = _compute_pid(
      tile_id, num_pid_in_group,
      num_pid_m, GROUP_SIZE_M, NUM_SMS)
    start_m = pid_m * BLOCK_SIZE_M
    start_n = pid_n * BLOCK_SIZE_N
    offs_am = start_m + tl.arange(0, BLOCK_SIZE_M)
    offs_bn = start_n + tl.arange(0, BLOCK_SIZE_N)
    offs_am = tl.max_contiguous(
      tl.multiple_of(offs_am, BLOCK_SIZE_M),
      BLOCK_SIZE_M)
    offs_bn = tl.max_contiguous(
      tl.multiple_of(offs_bn, BLOCK_SIZE_N),
      BLOCK_SIZE_N)

    accumulator = tl.zeros(
      (BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)
    for ki in range(k_tiles):
      offs_k = ki * BLOCK_SIZE_K + offs_k_for_mask
      a = tl.load(a_ptr + offs_am[:, None] * stride_am
                   + offs_k[None, :] * stride_ak,
                   mask=offs_k_for_mask[None, :]
                        < K - ki * BLOCK_SIZE_K)
      b = tl.load(b_ptr + offs_k[:, None] * stride_bk
                   + offs_bn[None, :] * stride_bn,
                   mask=offs_k_for_mask[:, None]
                        < K - ki * BLOCK_SIZE_K)
      accumulator = tl.dot(a, b, accumulator)
    # ... epilogue: compute output pid, store`,
    highlight: false,
    lang: "python",
    source: "triton-lang.org/tutorials/09-persistent-matmul",
  },
  {
    label: "CUTLASS (CuTeDSL)",
    lines: 110,
    file: "persistent_gemm_hopper.py",
    code: `class PersistentGemm:
  def __init__(self):
    self.bM, self.bN, self.bK = 128, 256, 64
    self.num_consumer = 2
    self.num_producer = 1
    self.atom_layout_mnk = (2, 1, 1)
    self.acc_dtype = cutlass.Float32
    self.op = cute.nvgpu.cpasync \
      .CopyBulkTensorTileG2SOp()
    self.stage = 4

  def __call__(self, ...):
    tiled_mma = sm90_utils \
      .make_trivial_tiled_mma(
        mA.element_type, mB.element_type,
        OperandMajorMode.K, OperandMajorMode.K,
        self.acc_dtype, self.atom_layout_mnk,
        tiler_mn=(64, self.bN))

    tma_atom_a, tma_tensor_a = \
      cute.nvgpu.cpasync.make_tiled_tma_atom(
        self.op, mA, smem_layout,
        (self.bM, self.bK), num_multicast=1)
    tma_atom_b, tma_tensor_b = \
      cute.nvgpu.cpasync.make_tiled_tma_atom(
        self.op, mB, smem_layout,
        (self.bN, self.bK), num_multicast=1)

    tile_sched_params, grid = \
      self._compute_grid(M, N, self.bM, self.bN)

  @cute.kernel
  def kernel(self, ...):
    # Producer: warp group 0
    if warp_group_idx < 1:
      cute.arch.warpgroup_reg_dealloc(24)
      tile_sched = cutlass.utils \
        .StaticPersistentTileScheduler.create(
          tile_sched_params,
          cute.arch.block_idx(),
          cute.arch.grid_dim())
      work_tile = tile_sched \
        .initial_work_tile_info()
      while work_tile.is_valid_tile:
        tile_m, tile_n, _ = work_tile.tile_idx
        for tile_k in cutlass.range(k_tile_cnt):
          mainloop_pipeline.producer_acquire(
            mainloop_producer_state)
          cute.copy(tma_atom_a, tAgA_k, tAsA_pipe,
            tma_bar_ptr=mainloop_pipeline
              .producer_get_barrier(
                mainloop_producer_state),
            mcast_mask=0)
          # ... same for B
          mainloop_pipeline.producer_commit(
            mainloop_producer_state)
        tile_sched.advance_to_next_work()
    # Consumer: warp groups 1-2
    else:
      cute.arch.warpgroup_reg_alloc(240)
      # ... consume tiles with WGMMA`,
    highlight: false,
    lang: "python",
    source: "veitner.bearblog.dev/persistent-gemm-in-cutedsl-on-hopper",
  },
  {
    label: "CUDA + CuTe",
    lines: 95,
    file: "persistent_gemm_sm90.cu",
    code: `using namespace cute;
using namespace cutlass;

template <class TileShape, class ClusterShape>
struct PersistentGemmKernel {
  using MainloopPipeline =
    typename cutlass::PipelineTmaAsync<Stages>;
  using PipelineState =
    typename MainloopPipeline::PipelineState;

  __device__ void operator()(Params const& params) {
    // Warp specialization: producer vs consumer
    int warp_group_idx = canonical_warp_group_idx();
    SharedStorage& storage =
      *reinterpret_cast<SharedStorage*>(
        cute::declare_smem<char, SharedSize>());

    PersistentTileSchedulerSm90 scheduler(
      params.scheduler, blockIdx, gridDim);

    if (warp_group_idx == 0) {
      // Producer: TMA loads A,B → SMEM
      auto work = scheduler.initial_work_tile_info();
      while (work.is_valid_tile) {
        for (int k = 0; k < k_tiles; ++k) {
          pipeline.producer_acquire(state);
          auto [tAgA, tAsA] = tma_partition_A(
            tma_a, work.M_idx, k);
          auto [tBgB, tBsB] = tma_partition_B(
            tma_b, work.N_idx, k);
          copy(tma_a, tAgA, tAsA);
          copy(tma_b, tBgB, tBsB);
          pipeline.producer_commit(state);
          ++state;
        }
        scheduler.advance_to_next_work();
        work = scheduler.get_current_work();
      }
    } else {
      // Consumer: WGMMA accumulate
      auto work = scheduler.initial_work_tile_info();
      auto accum = partition_fragment_C(
        tiled_mma, take<0,2>(TileShape{}));
      while (work.is_valid_tile) {
        clear(accum);
        for (int k = 0; k < k_tiles; ++k) {
          pipeline.consumer_wait(cstate);
          warpgroup_arrive();
          gemm(tiled_mma, accum,
               tCsA(_, _, _, cstate.index()),
               tCsB(_, _, _, cstate.index()),
               accum);
          warpgroup_commit_batch();
          warpgroup_wait<0>();
          pipeline.consumer_release(cstate);
          ++cstate;
        }
        // Epilogue: store accum → GMEM
        epilogue(accum, work.M_idx, work.N_idx);
        scheduler.advance_to_next_work();
        work = scheduler.get_current_work();
      }
    }
  }
};`,
    highlight: false,
    lang: "cpp",
    source: "NVIDIA/cutlass sm90_gemm_tma_warpspecialized_pingpong",
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

        {/* Framework selector */}
        <ScrollReveal delay={0.2}>
          <div className="flex flex-wrap gap-2">
            {comparisons.map((c, i) => (
              <button
                key={c.label}
                onClick={() => setActiveCode(i)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  activeCode === i
                    ? c.highlight
                      ? "bg-mint-500 text-white shadow-lg shadow-mint-500/25"
                      : "bg-[var(--foreground)] text-[var(--background)]"
                    : "border hover:bg-[var(--muted)]"
                }`}
              >
                {c.label}
                <span className="ml-1.5 opacity-60">{c.lines}L</span>
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
              {comparisons[activeCode].highlight && (
                <span className="ml-auto px-2 py-0.5 rounded text-[10px] font-bold bg-mint-500/15 text-mint-500">
                  CROKTILE
                </span>
              )}
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCode}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 overflow-x-auto max-h-[360px] overflow-y-auto"
              >
                <HighlightedCode
                  code={comparisons[activeCode].code}
                  lang={comparisons[activeCode].lang}
                />
              </motion.div>
            </AnimatePresence>
            {comparisons[activeCode].source && (
              <div className="px-4 py-1.5 border-t text-[10px] text-[var(--muted-foreground)] font-mono truncate">
                Source: {comparisons[activeCode].source}
              </div>
            )}
          </div>
        </ScrollReveal>

        {/* LOC comparison bars */}
        <ScrollReveal delay={0.3}>
          <div className="space-y-2 px-1">
            {comparisons.map((c, i) => (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-[var(--muted-foreground)] w-28 text-right font-medium shrink-0">
                  {c.label}
                </span>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(c.lines / 110) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.08 }}
                  className={`h-5 rounded flex items-center pl-2 ${
                    c.highlight
                      ? "bg-mint-500"
                      : "bg-gray-400 dark:bg-gray-600"
                  }`}
                >
                  <span className="text-[10px] font-bold text-white">
                    {c.lines}
                  </span>
                </motion.div>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-[var(--muted-foreground)] mt-2">
            Lines of code — persistent warp-specialized GEMM kernel
          </p>
        </ScrollReveal>
      </div>
    </FeatureCard>
  );
}
