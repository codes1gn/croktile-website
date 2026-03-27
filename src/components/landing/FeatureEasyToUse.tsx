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
    lines: 64,
    file: "09-persistent-matmul.py",
    code: `@triton.jit
def _compute_pid(tile_id, num_pid_in_group,
                 num_pid_m, GROUP_SIZE_M, NUM_SMS):
  group_id = tile_id // num_pid_in_group
  first_pid_m = group_id * GROUP_SIZE_M
  group_size_m = min(num_pid_m - first_pid_m,
                     GROUP_SIZE_M)
  pid_m = first_pid_m + (tile_id % group_size_m)
  pid_n = (tile_id % num_pid_in_group) // group_size_m
  return pid_m, pid_n

@triton.jit
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
    offs_am = tl.where(offs_am < M, offs_am, 0)
    offs_bn = tl.where(offs_bn < N, offs_bn, 0)
    offs_am = tl.max_contiguous(
      tl.multiple_of(offs_am, BLOCK_SIZE_M),
      BLOCK_SIZE_M)
    offs_bn = tl.max_contiguous(
      tl.multiple_of(offs_bn, BLOCK_SIZE_N),
      BLOCK_SIZE_N)
    accumulator = tl.zeros(
      (BLOCK_SIZE_M, BLOCK_SIZE_N), dtype=tl.float32)
    for ki in range(k_tiles):
      offs_k = ki * BLOCK_SIZE_K
             + tl.arange(0, BLOCK_SIZE_K)
      a_ptrs = a_ptr + (offs_am[:, None] * stride_am
             + offs_k[None, :] * stride_ak)
      b_ptrs = b_ptr + (offs_k[:, None] * stride_bk
             + offs_bn[None, :] * stride_bn)
      a = tl.load(a_ptrs, mask=offs_k_for_mask[None,:]
                   < K - ki * BLOCK_SIZE_K, other=0.0)
      b = tl.load(b_ptrs, mask=offs_k_for_mask[:,None]
                   < K - ki * BLOCK_SIZE_K, other=0.0)
      accumulator = tl.dot(a, b, accumulator)
    tile_id_c += NUM_SMS
    pid_m, pid_n = _compute_pid(tile_id_c,
      num_pid_in_group, num_pid_m,
      GROUP_SIZE_M, NUM_SMS)
    offs_cm = pid_m*BLOCK_SIZE_M+tl.arange(0,BLOCK_SIZE_M)
    offs_cn = pid_n*BLOCK_SIZE_N+tl.arange(0,BLOCK_SIZE_N)
    c_ptrs = c_ptr + stride_cm * offs_cm[:, None]
           + stride_cn * offs_cn[None, :]
    c_mask = (offs_cm[:,None]<M) & (offs_cn[None,:]<N)
    c = accumulator.to(tl.float16)
    tl.store(c_ptrs, c, mask=c_mask)`,
    highlight: false,
    lang: "python",
    source: "triton-lang/triton/tutorials/09-persistent-matmul.py",
  },
  {
    label: "CUTLASS (CuTeDSL)",
    lines: 280,
    file: "dense_gemm.py",
    code: `class HopperWgmmaGemmKernel:
  def __init__(self, acc_dtype, tile_shape_mn,
               cluster_shape_mn):
    self.acc_dtype = acc_dtype
    self.cluster_shape_mn = cluster_shape_mn
    self.tile_shape_mnk = (*tile_shape_mn, 1)
    self.atom_layout_mnk = (
      (2,1,1) if tile_shape_mn[0] > 64
      and tile_shape_mn[1] > 128 else (1,1,1))
    self.mma_warp_groups = math.prod(
      self.atom_layout_mnk)
    self.threads_per_cta = (self.mma_warp_groups
      * 128)
    self.smem_capacity = utils \
      .get_smem_capacity_in_bytes("sm_90")
    self.ab_stage = None
    self.epi_stage = None
    self.shared_storage = None

  def _setup_attributes(self):
    self.tile_shape_mnk = (*self.tile_shape_mnk[:2],
      utils.get_k_tile_size(
        self.a_dtype, self.b_dtype))
    self.tiled_mma = sm90_utils \
      .make_trivial_tiled_mma(
        self.a_dtype, self.b_dtype,
        self.a_major, self.b_major,
        self.acc_dtype, self.atom_layout_mnk,
        tiler_mn=(64, self.tile_shape_mnk[1]))
    smem_a = cute.coalesce(sm90_utils
      .make_smem_layout(self.a_dtype,
        self.tile_shape_mnk, self.a_major, 'a'))
    smem_b = cute.coalesce(sm90_utils
      .make_smem_layout(self.b_dtype,
        self.tile_shape_mnk, self.b_major, 'b'))
    ab_smem_bytes = (cute.size(smem_a)
      * cute.sizeof(self.a_dtype)
      + cute.size(smem_b)
      * cute.sizeof(self.b_dtype))
    self.ab_stage = min(self.smem_capacity
      // ab_smem_bytes, 7)
    self.a_smem_layout_staged = cute.blocked_product(
      smem_a, (1, 1, self.ab_stage))
    self.b_smem_layout_staged = cute.blocked_product(
      smem_b, (1, 1, self.ab_stage))
    epi_smem = cute.make_layout(
      (*self.tile_shape_mnk[:2],),
      (*utils.compact_col_major(
        *self.tile_shape_mnk[:2]),))
    epi_bytes = cute.size(epi_smem) * cute.sizeof(
      self.c_dtype)
    self.epi_stage = min(self.smem_capacity
      // epi_bytes, 2)
    self.epi_smem_layout_staged = \
      cute.blocked_product(epi_smem,
        (1, 1, self.epi_stage))
    self.epi_tile = cute.make_shape(
      self.tile_shape_mnk[0],
      self.tile_shape_mnk[1])

  def __call__(self, mA, mB, mC, stream):
    self.a_dtype = mA.element_type
    self.b_dtype = mB.element_type
    self.c_dtype = mC.element_type
    self.a_major = utils.get_major(mA)
    self.b_major = utils.get_major(mB)
    self._setup_attributes()
    tma_a, tma_tA = cute.nvgpu.cpasync \
      .make_tiled_tma_atom(
        cute.nvgpu.cpasync
          .CopyBulkTensorTileG2SOp(),
        mA, self.a_smem_layout_staged,
        self.tile_shape_mnk,
        num_multicast=self.cluster_shape_mn[0])
    tma_b, tma_tB = cute.nvgpu.cpasync \
      .make_tiled_tma_atom(
        cute.nvgpu.cpasync
          .CopyBulkTensorTileG2SOp(),
        mB, self.b_smem_layout_staged,
        cute.make_shape(self.tile_shape_mnk[1],
          self.tile_shape_mnk[2]),
        num_multicast=self.cluster_shape_mn[1])
    M = cute.size(cute.shape(mA), 0)
    N = cute.size(cute.shape(mB), 0)
    grid_m = cute.ceil_div(M, self.tile_shape_mnk[0])
    grid_n = cute.ceil_div(N, self.tile_shape_mnk[1])
    blocks = (grid_m*grid_n, 1, cute.size(
      cute.shape(mA), 2))
    self.kernel[blocks, self.threads_per_cta,
      stream](tma_a, mA, tma_b, mB, mC,
        self.ab_stage, self.epi_stage)

  @cute.kernel
  def kernel(self, tma_atom_a, mA_mkl,
    tma_atom_b, mB_nkl, mC_mnl,
    ab_stage, epi_stage):
    bidx = cute.arch.block_idx()
    tidx = cute.arch.thread_idx()
    M = cute.size(cute.shape(mA_mkl), 0)
    N = cute.size(cute.shape(mB_nkl), 0)
    K = cute.size(cute.shape(mA_mkl), 1)
    grid_m = cute.ceil_div(M,
      self.tile_shape_mnk[0])
    grid_n = cute.ceil_div(N,
      self.tile_shape_mnk[1])
    k_tile_cnt = cute.ceil_div(K,
      self.tile_shape_mnk[2])
    tile_m = bidx.x % grid_m
    tile_n = bidx.x // grid_m
    batch = bidx.z

    sA = cute.make_tensor(cute.smem(
      self.shared_storage.sA),
      self.a_smem_layout_staged)
    sB = cute.make_tensor(cute.smem(
      self.shared_storage.sB),
      self.b_smem_layout_staged)
    pipeline = cute.nvgpu.make_pipeline(
      ab_stage, self.threads_per_cta)
    tma_bar = cute.nvgpu.make_tma_barrier(
      ab_stage)
    mA_mk = mA_mkl[:, :, batch]
    mB_nk = mB_nkl[:, :, batch]
    mC_mn = mC_mnl[:, :, batch]
    gA = cute.local_tile(mA_mk,
      self.tile_shape_mnk[:2], (tile_m, cute._))
    gB = cute.local_tile(mB_nk,
      cute.make_shape(self.tile_shape_mnk[1],
        self.tile_shape_mnk[2]),
      (tile_n, cute._))
    tiled_copy_a = cute.make_tiled_copy(tma_atom_a,
      cute.make_layout((1,)),
      cute.make_layout((1,)))
    tAgA = tiled_copy_a.partition_S(gA)
    tAsA = tiled_copy_a.partition_D(sA)
    tiled_copy_b = cute.make_tiled_copy(tma_atom_b,
      cute.make_layout((1,)),
      cute.make_layout((1,)))
    tBgB = tiled_copy_b.partition_S(gB)
    tBsB = tiled_copy_b.partition_D(sB)
    tiled_mma = self.tiled_mma
    thr_mma = tiled_mma.get_slice(tidx)
    tCsA = thr_mma.partition_A(sA)
    tCsB = thr_mma.partition_B(sB)
    tCrC = thr_mma.partition_C(
      cute.make_tensor(self.acc_dtype,
        tiled_mma.get_shape_mnk()))
    cute.fill(tCrC, 0)
    pipeline.producer_acquire(0)
    for ki in cutlass.range(k_tile_cnt):
      stage = ki % ab_stage
      cute.copy(tma_atom_a, tAgA[:,:,ki],
        tAsA[:,:,stage],
        tma_bar_ptr=tma_bar[stage],
        mcast_mask=cute.nvgpu.elect_mcast_mask(
          self.cluster_shape_mn[0]))
      cute.copy(tma_atom_b, tBgB[:,:,ki],
        tBsB[:,:,stage],
        tma_bar_ptr=tma_bar[stage],
        mcast_mask=cute.nvgpu.elect_mcast_mask(
          self.cluster_shape_mn[1]))
      pipeline.producer_commit(stage)
      next_stage = (ki + 1) % ab_stage
      pipeline.producer_acquire(next_stage)
      pipeline.consumer_wait(stage)
      cute.gemm(tiled_mma,
        tCsA[:,:,:,stage],
        tCsB[:,:,:,stage], tCrC)
      pipeline.consumer_release(stage)
    gC = cute.local_tile(mC_mn,
      self.epi_tile, (tile_m, tile_n))
    tCgC = thr_mma.partition_C(gC)
    cute.copy(tCrC, tCgC)`,
    highlight: false,
    lang: "python",
    source: "NVIDIA/cutlass examples/python/CuTeDSL/hopper/dense_gemm.py",
  },
  {
    label: "CUDA + CuTe",
    lines: 182,
    file: "persistent_gemm_sm90.cu",
    code: `using namespace cute;
using namespace cutlass;

template <class TileShape, class ClusterShape,
  int Stages, class TiledMma,
  class GmemTiledCopyA, class GmemTiledCopyB,
  class SmemLayoutA, class SmemLayoutB>
struct PersistentGemmKernel {
  using MainloopPipeline =
    typename cutlass::PipelineTmaAsync<Stages>;
  using PipelineState =
    typename MainloopPipeline::PipelineState;
  using SharedStorage = SharedStorageType<
    SmemLayoutA, SmemLayoutB, Stages>;

  static constexpr int NumThreads =
    size(TiledMma{});
  static constexpr int SharedSize =
    sizeof(SharedStorage);

  struct Params {
    typename GmemTiledCopyA::Params tma_a;
    typename GmemTiledCopyB::Params tma_b;
    cute::Shape<int,int,int> problem_shape;
    typename PersistentTileSchedulerSm90::Params
      scheduler;
  };

  __device__ void operator()(Params const& params) {
    int warp_group_idx =
      canonical_warp_group_idx();
    int lane_predicate =
      cute::elect_one_sync();
    auto [M, N, K] = params.problem_shape;
    int k_tiles = cute::ceil_div(K,
      get<2>(TileShape{}));
    SharedStorage& storage =
      *reinterpret_cast<SharedStorage*>(
        cute::declare_smem<char, SharedSize>());
    auto& smem_a = storage.smem_a;
    auto& smem_b = storage.smem_b;
    MainloopPipeline pipeline(
      storage.pipeline_storage,
      {warp_group_idx == 0, NumThreads});
    PipelineState smem_pipe_read;
    PipelineState smem_pipe_write =
      cute::make_producer_start_state<
        MainloopPipeline>();

    PersistentTileSchedulerSm90 scheduler(
      params.scheduler, blockIdx, gridDim);
    auto work = scheduler
      .initial_work_tile_info();

    Tensor mA = make_tensor(
      make_gmem_ptr(params.tma_a.gmem_ptr),
      make_shape(M, K),
      params.tma_a.dGmem);
    Tensor mB = make_tensor(
      make_gmem_ptr(params.tma_b.gmem_ptr),
      make_shape(N, K),
      params.tma_b.dGmem);

    TiledMma tiled_mma;
    auto thr_mma = tiled_mma.get_slice(
      threadIdx.x);
    Tensor sA = make_tensor(
      make_smem_ptr(smem_a.data()), SmemLayoutA{});
    Tensor sB = make_tensor(
      make_smem_ptr(smem_b.data()), SmemLayoutB{});

    GmemTiledCopyA gmem_tiled_copy_a;
    GmemTiledCopyB gmem_tiled_copy_b;
    auto tma_a = gmem_tiled_copy_a.get_slice(0);
    auto tma_b = gmem_tiled_copy_b.get_slice(0);
    Tensor tAsA = tma_a.partition_D(sA);
    Tensor tBsB = tma_b.partition_D(sB);

    if (warp_group_idx == 0) {
      while (work.is_valid_tile) {
        int tile_m = work.M_idx;
        int tile_n = work.N_idx;
        Tensor gA = local_tile(mA,
          TileShape{}, make_coord(tile_m, _));
        Tensor gB = local_tile(mB,
          TileShape{}, make_coord(tile_n, _));
        Tensor tAgA = tma_a.partition_S(gA);
        Tensor tBgB = tma_b.partition_S(gB);
        for (int k = 0; k < k_tiles; ++k) {
          pipeline.producer_acquire(
            smem_pipe_write);
          if (lane_predicate) {
            copy(gmem_tiled_copy_a,
              tAgA(_, _, _, k),
              tAsA(_, _, _, smem_pipe_write
                .index()));
            copy(gmem_tiled_copy_b,
              tBgB(_, _, _, k),
              tBsB(_, _, _, smem_pipe_write
                .index()));
          }
          pipeline.producer_commit(
            smem_pipe_write);
          ++smem_pipe_write;
        }
        scheduler.advance_to_next_work();
        work = scheduler.get_current_work();
      }
    } else {
      Tensor tCsA = thr_mma.partition_A(sA);
      Tensor tCsB = thr_mma.partition_B(sB);
      auto accum = partition_fragment_C(
        tiled_mma, take<0,2>(TileShape{}));
      while (work.is_valid_tile) {
        clear(accum);
        for (int k = 0; k < k_tiles; ++k) {
          pipeline.consumer_wait(smem_pipe_read);
          warpgroup_arrive();
          gemm(tiled_mma, accum,
            tCsA(_, _, _, smem_pipe_read.index()),
            tCsB(_, _, _, smem_pipe_read.index()),
            accum);
          warpgroup_commit_batch();
          warpgroup_wait<0>();
          pipeline.consumer_release(
            smem_pipe_read);
          ++smem_pipe_read;
        }
        Tensor mC = make_tensor(
          make_gmem_ptr(params.output),
          make_shape(M, N), params.dC);
        Tensor gC = local_tile(mC,
          take<0,2>(TileShape{}),
          make_coord(work.M_idx, work.N_idx));
        Tensor tCgC = thr_mma.partition_C(gC);
        copy(accum, tCgC);
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
      descBullets={[t("desc1"), t("desc2"), t("desc3"), t("desc4")]}
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
                className="p-4 overflow-x-auto max-h-[420px] overflow-y-auto"
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
                  whileInView={{ width: `${(c.lines / 280) * 100}%` }}
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
