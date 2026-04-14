# Autotune Efficacy Figure Source

This repository keeps the convergence figure self-contained for the website:

- Output SVG used by landing page:
  - `public/autotune-efficacy-convergence.svg`
  - `public/autotune-efficacy-convergence-dark.svg`
- Regeneration script (copied into this repo):
  - `gen-autotune-efficacy-convergence.mjs`

## Regenerate

```bash
npm run gen:autotune-efficacy-figure
```

## Upstream provenance

- Figure usage reference in slides:
  - `croktile-slides/assets/figures/autotune-efficacy-convergence.svg`
- Script lineage:
  - adapted from `gemm_sp_paper/figures/src/autotune-efficacy-convergence.js`
