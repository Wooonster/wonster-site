---
title: "Composer 2 Technical Report"
slug: "composer-2-technical-report"
date: "2026-04-02"
topic: "agent"
cardSummary: "Composer 2 specializes Kimi K2.5 into an agentic software engineering model through continued coding pretraining and large-scale RL, reaching frontier-level results on CursorBench, SWE-bench Multilingual, and TerminalBench."
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.24477"
alphaxivUrl: "https://alphaxiv.org/abs/2603.24477"
authors:
  - "Aaron Chan"
  - "Ahmed Shalaby"
  - "Alexander Wettig"
  - "Aman Sanger"
  - "et al."
tags:
  - "agent"
  - "2026"
---
# Paper Analysis: Composer 2 Technical Report

---

## Section 0 — Metadata

| Field | Value |
|---|---|
| Title | Composer 2 Technical Report |
| Authors & affiliations | 40+ authors from Cursor Research (Aaron Chan, Ahmed Shalaby, Alexander Wettig et al.) |
| Venue / status | arXiv preprint (submitted March 25–26, 2026), not yet peer-reviewed; technical report format |
| Code / data available | CursorBench benchmark not released publicly; model weights not released; infrastructure (ThunderKittens GEMM kernels) partially open-sourced |
| Reproducibility signals | Hardware specified (NVIDIA B300 GPUs); optimizer specified (AdamW with MXFP8); no random seeds; no confidence intervals on benchmark numbers; sequence lengths and some hyperparameters disclosed |

---

## Section 1 — Problem and Motivation

**What specific problem does this paper address?**
Given a strong open-source base model (Kimi K2.5, 1.04T parameters / 32B active MoE), train a specialized coding agent model optimized for realistic agentic software engineering tasks — multi-step coding workflows in live codebases — rather than for single-call code generation benchmarks. The objective is maximizing task completion rate on CursorBench (internal) and public agentic benchmarks (SWE-bench Multilingual, TerminalBench) while maintaining competitive inference cost and latency.

**Why do existing methods fail here?**
Public benchmarks (SWE-bench Verified) suffer from three documented problems [paper]: (1) domain mismatch — real developer workflows involve larger changes (median 181 lines vs. 7–10 for SWE-bench); (2) over-specification — benchmarks assume narrow correct solutions, while real requests are underspecified; (3) data contamination — OpenAI suspended SWE-bench Verified reporting after evidence that "frontier models could generate gold patches from memory" [paper]. Standard RL with naive advantage normalization (GRPO default) introduces length bias and high-variance KL estimates; the paper identifies and fixes these algorithmic issues.

**Why does this problem matter?**
Cursor is a widely deployed coding assistant; a specialized model that genuinely solves real engineering tasks is commercially significant. The 37% relative improvement over Composer 1.5 on CursorBench, combined with SWE-bench Multilingual SOTA (73.7%), demonstrates that domain-specialized training at scale produces measurably better coding agents than general-purpose frontier models.

---

## Section 2 — Technical Method

**Core contribution:** This paper proposes a two-phase training recipe (continued pretraining on coding data + large-scale RL with domain-matched reward signals) applied to a 1.04T/32B-active MoE base model, combined with algorithmic fixes to standard GRPO (length bias removal, $k_1$ KL estimator, asynchronous weight sync, MoE router replay) that enable stable long-horizon RL on realistic software engineering tasks.

**Pipeline:**

*Phase 1 — Continued Pretraining:*
- Base: Kimi K2.5 (selected via three criteria: FreshBench coding knowledge 83.2%, state tracking distance 86, codebase perplexity 13.81M)
- Three sub-phases: bulk training at 32k sequence length → long-context extension to 256k → targeted SFT
- Multi-token prediction (MTP) layers trained via self-distillation to match main LM head logit distributions at each position — enables speculative decoding
- Precision: MXFP8 on NVIDIA B300 GPUs; per-block quantization (FP8E4M3, block size 16)

*Phase 2 — Reinforcement Learning:*
- Policy gradient with multiple samples per prompt; single-epoch regime (no prompt repetition)
- Key algorithmic choices:
  - Removed GRPO length standardization term (avoids length bias) [paper]
  - No group advantage standard deviation normalization [paper]
  - KL estimator: $k_1 = -\log r$ (standard), not $k_3$ (high variance when distributions diverge, as shown in Figure 4) [paper]
  - Asynchronous infrastructure: inference workers update weights mid-rollout via delta compression over S3
  - MoE router replay: training overrides router expert assignment to match inference selections, filtered to reduce p99 numeric mismatch
- Self-summarization: chained generations with summary as context; final reward applies to all tokens in chain; consistently reduces error vs. prompt-based compaction [paper]
- Behavioral rewards: auxiliary rewards for coding style, communication quality; nonlinear length penalty:
  $C_{\mathrm{length}}(k, q)(x) = \frac{(1+kx)^{1-q} - 1}{k(1-q)}$
  This incentivizes quick solutions on easy tasks while permitting longer thinking on hard ones [paper]

**What's actually new:** The specific combination of (a) MoE router replay for training-inference alignment, (b) $k_1$ vs. $k_3$ KL estimator selection backed by theoretical analysis, (c) asynchronous weight synchronization via S3 delta compression for world-scale distributed RL, and (d) self-summarization with chain-level reward are novel engineering contributions not previously combined in a single system. The domain-matched pretraining loss correlation analysis (Figure 2, showing cross-entropy loss predicts downstream RL performance) provides practical guidance for base model selection.

**Complexity:**
- Model: 1.04T total parameters, 32B active (MoE) [paper]
- Context: up to 256k tokens after long-context extension [paper]
- Parallelism: Expert Parallelism=8, Context Parallelism=8 for RL phase [paper]
- No formal training compute reported [paper omits FLOPs / GPU-hours]

---

## Section 3 — Experimental Evidence

**Main results:**

| Benchmark | Composer 1 | Composer 1.5 | Composer 2 | GPT-5.4 | Δ vs. Composer 1.5 |
|---|---|---|---|---|---|
| CursorBench | 38.0 [paper] | 44.2 [paper] | 61.3 [paper] | 63.9 [paper] | +17.1 |
| SWE-bench Multilingual | 56.9 [paper] | 65.9 [paper] | 73.7 [paper] | 76.8 [paper] | +7.8 |
| Terminal-Bench | 40.0 [paper] | 47.9 [paper] | 61.7 [paper] | 66.5† [paper] | +13.8 |

† GPT-5.4 safety filters refused some Terminal-Bench tasks

**Ablation findings:**
Figure 5 (RL training dynamics) shows both average and best-of-K performance increase throughout training with "no observed trade-off between average performance and best-of-K" [paper]. This directly addresses the common criticism that RL merely reweights existing solutions. Figure 2 demonstrates that continued pretraining cross-entropy loss linearly predicts downstream RL accuracy across three compute levels on Qwen3-Coder-30B-A3B [paper]. Figure 4 validates the $k_1$ vs. $k_3$ KL estimator choice on synthetic Gaussians [paper].

No ablation on individual RL algorithmic changes (e.g., length normalization removal in isolation, router replay in isolation) is provided [paper omits this].

**Statistical rigor:**
- No confidence intervals or standard deviations on benchmark numbers [paper].
- Single reported scores; no multi-seed evaluation.
- No significance tests.
- CursorBench-3 is internal; no external verification of evaluation methodology.

**Potential confounds:**
- CursorBench is proprietary and designed by the same team building Composer 2. Even with good intentions, test set construction may inadvertently favor the model's training distribution [inferred].
- The paper cites SWE-bench Verified contamination concerns to justify using CursorBench — but offers no contamination analysis for SWE-bench Multilingual or TerminalBench results.
- Comparison to GPT-5.4 uses safety-filtered results for Terminal-Bench (†), which may undercount GPT-5.4 capabilities.
- Efficiency claim ("superior Pareto frontier in cost") references Figure 11, which is not fully extractable from the paper — the claim cannot be independently verified from the text alone.

---

## Section 4 — Critical Assessment

**Methodological concern: internal benchmark** [inferred + paper-evident, moderate]
CursorBench's construction, decontamination, and evaluation criteria are controlled by Cursor Research. The 61.3% on CursorBench vs. 63.9% for GPT-5.4 makes Composer 2 competitive but not best-in-class even on its own benchmark. Without independent access to CursorBench, the primary evaluation claim cannot be reproduced.

**Experimental concern: no ablation on RL algorithmic components** [paper-evident, moderate]
The paper introduces several RL modifications (length normalization removal, $k_1$ estimator, router replay, self-summarization). No experiment isolates the contribution of each change. The theoretical justifications for $k_1$ and length normalization are credible, but the empirical contribution of each is unknown.

**Experimental concern: missing compute transparency** [paper-evident, minor]
A technical report from a well-resourced company training a 1T-parameter model should report GPU-hours and training cost. This omission makes it impossible to assess whether the approach is reproducible by academic groups.

**Claim scope: "SOTA on SWE-bench Multilingual"** [paper-evident, minor]
73.7% is strong, but GPT-5.4 achieves 76.8% [paper]. The "SOTA level" claim requires qualification — it's competitive with but not leading public SOTA.

**Honest strengths:**
- The base model selection methodology (three-dimensional evaluation: FreshBench, state tracking, codebase perplexity) is principled and replicable [paper].
- The $k_1$ vs. $k_3$ KL estimator analysis (Figure 4) is theoretically grounded and practically important for MoE RL stability.
- The RL training dynamics result (no average/best-of-K trade-off) is a meaningful empirical finding that pushes back against a common assumption in the RLHF literature.
- The infrastructure description (Anyrun, asynchronous weight sync, fault tolerance) is unusually detailed for a technical report and genuinely useful for practitioners.

---

## Section 5 — Synthesis

**TL;DR:** Composer 2 applies continued pretraining + large-scale RL to Kimi K2.5 (1.04T/32B MoE) with several algorithmic fixes to standard GRPO, achieving 61.3% on CursorBench (37% relative improvement over Composer 1.5) and 73.7% on SWE-bench Multilingual. The primary caveat is that the main benchmark is internal and unverified, and no ablations isolate the contribution of individual RL modifications.

**Innovation classification:** *Engineering advance* — the training recipe and infrastructure innovations (asynchronous RL at scale, MoE router replay, $k_1$ estimator selection) are engineering improvements within the established SFT + RL framework, not a paradigm shift.

**Deployment readiness:** Deployed in Cursor as a production model. The model itself is not open-sourced; the infrastructure components (ThunderKittens kernels) are partially open. Academic reproduction requires independent access to equivalent compute (~NVIDIA B300 cluster) and training data.

**Open problems:**
1. How much of Composer 2's gain comes from each individual RL modification? Ablating length normalization removal and MoE router replay independently would significantly strengthen the technical contribution.
2. Does the training-time pretraining loss → RL accuracy correlation (Figure 2) hold across different base architectures and domains, or is it specific to coding tasks on MoE models?
3. How do discovered agentic behaviors (multi-step planning, self-correction) change across the RL training curve? A qualitative analysis of behavioral evolution would be scientifically valuable.

**Reproduction gotchas:**
- Requires Kimi K2.5 weights (or equivalent 1T MoE) and NVIDIA B300 GPUs with MXFP8 support.
- MXFP8 precision requires "IEEE-compliant floating-point arithmetic" — not all hardware supports this correctly [paper].
- Anyrun environment management (>500 pods/second, live migration) is custom infrastructure unavailable publicly.
- CursorBench is not released; reproduction must substitute a different agentic benchmark with unknown correlation to the reported results.
