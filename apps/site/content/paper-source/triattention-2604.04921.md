---
title: "TriAttention: Efficient Long Reasoning with Trigonometric KV Compression"
arxiv: "2604.04921"
authors: "Weian Mao, Xi Lin, Wei Huang, Yuxin Xie, Tianfu Fu, Bohan Zhuang, Song Han, Yukang Chen"
date: "2026-04-06"
venue: "arXiv preprint"
tags: ["KV cache", "attention compression", "long reasoning", "LLM inference", "chain-of-thought", "trigonometric functions"]
---

# TriAttention: Efficient Long Reasoning with Trigonometric KV Compression

## Metadata

| Field | Value |
|---|---|
| Title | TriAttention: Efficient Long Reasoning with Trigonometric KV Compression |
| Authors | Weian Mao, Xi Lin, Wei Huang, Yuxin Xie, Tianfu Fu, Bohan Zhuang, Song Han, Yukang Chen |
| Venue / Status | arXiv preprint, not yet peer-reviewed |
| Date | April 6, 2026 |
| ArXiv ID | 2604.04921 |
| Code | Not confirmed available |

---

## Problem and Motivation

### What problem does this paper address?

Extended reasoning in LLMs — particularly long chain-of-thought (CoT) generation that can span tens of thousands of tokens — causes severe **KV cache memory bottlenecks**. The objective is to compress the KV cache aggressively (reducing memory by an order of magnitude) while maintaining full-attention accuracy on difficult reasoning benchmarks.

### Why do existing methods fail?

Existing KV cache compression methods score token importance using attention scores computed from **post-rotation queries** (i.e., after applying Rotary Position Embedding, RoPE). These scores are **positionally unstable**: the same token can receive very different importance scores depending on its absolute position in the sequence. This instability makes them unreliable selectors for compression — critical tokens may be evicted because their post-rotation score happened to be low at a particular position.

### Why does this problem matter?

Without effective KV compression, long-reasoning models (e.g., $32\text{K}+$ token generation) require GPU memory that exceeds consumer hardware. This creates a hard barrier between frontier reasoning capabilities and practical deployment. A $10\times$ memory reduction with no accuracy loss would fundamentally change what hardware is needed to run state-of-the-art reasoning models.

---

## Technical Method

### Core Contribution

TriAttention proposes using **pre-rotation Q/K concentration** — the observation that query and key vectors cluster around fixed centers in pre-rotation space, stably across positions — as a position-invariant basis for KV cache importance scoring via trigonometric series over token distances, achieving $10.7\times$ memory reduction with no accuracy loss.

### Key Insight: Q/K Concentration

In pre-rotation space (before RoPE is applied), query and key vectors do not scatter randomly — they cluster around fixed directional centers that remain **stable across different sequence positions**. This means the angular relationship between a query center and a key center can reliably predict which *token distances* will receive preferential attention, regardless of absolute position.

Post-rotation attention scores, by contrast, are modulated by the RoPE transformation and become position-dependent, making them unreliable as compression criteria.

### Pipeline

1. **Pre-rotation analysis:** Extract the cluster centers of Q and K vectors in pre-rotation space across training data.
2. **Trigonometric importance scoring:** Model the token-distance preference using a **trigonometric series** — the inner product between pre-rotation Q and K vectors decomposes into sinusoidal functions of token distance. Fit this series to determine which distance ranges receive high attention.
3. **Norm-based weighting:** Combine the distance-based trigonometric score with the **Q/K norm magnitudes** of individual tokens to capture both structural (distance) and content (magnitude) importance.
4. **KV cache compression:** Use the composite score to retain only the most important KV pairs during generation, evicting the rest.
5. **Inference:** The compressed KV cache is used for all subsequent attention computations with no change to the model weights.

### What is Actually New

Prior work assumed post-rotation attention scores are the best available proxy for token importance. TriAttention abandons this assumption by identifying that the *pre-rotation* geometry is more stable and therefore more reliable. The use of a trigonometric series to model distance preferences is novel — it gives the method an analytic, interpretable form rather than a learned heuristic.

### Complexity

- KV memory: **$10.7\times$ reduction** vs. full KV cache `[paper]`
- Throughput: **$2.5\times$ improvement** vs. full attention `[paper]`
- No modification to model weights — inference-time only

---

## Experimental Results

| Dataset | Metric | Leading Baseline | TriAttention | Δ |
|---|---|---|---|---|
| AIME25 ($32\text{K}$ token gen.) | Accuracy | ~50% of full attention | Matches full attention | **+$\sim 50\%$ rel. over baseline** |
| OpenClaw deployment | GPU feasibility | OOM on single consumer GPU | Runs successfully | — |

- Leading baselines achieve only approximately half the accuracy of full attention at similar compression ratios. `[paper]`
- $2.5\times$ throughput improvement and $10.7\times$ KV memory reduction are reported simultaneously. `[paper]`

---

## Critical Assessment

**Strengths:**
- The core insight (pre-rotation stability) is both theoretically grounded and empirically motivated — not just an engineering trick.
- The AIME25 result (matching full attention with $32\text{K}$ generation) is a demanding benchmark that directly targets the long-reasoning use case.
- Consumer GPU deployment of OpenClaw is a concrete, reproducible proof of practical value.
- The trigonometric series formulation gives the method an analytic structure that is more interpretable than attention-score heuristics.

**Concerns:**
- The $10.7\times$ memory reduction and $2.5\times$ throughput figures need to be contextualized: what compression ratio (fraction of KV pairs retained) do these correspond to? The relationship between compression ratio and accuracy degradation is crucial.
- Results are reported on AIME25 (math competition problems). Generalization to other long-reasoning domains (code, science, multi-hop QA) is not confirmed.
- The pre-rotation cluster center analysis likely requires a calibration pass over representative data; the sensitivity of the method to distribution shift between calibration and deployment data is not described.
- No statistical variance reported — a single accuracy number on AIME25 without confidence intervals is limited evidence.

---

## Synthesis

**TL;DR:** TriAttention exploits the positional stability of pre-rotation Q/K geometry to build a trigonometric importance scorer for KV cache compression, achieving $10.7\times$ memory reduction and $2.5\times$ throughput while matching full-attention accuracy on AIME25 with $32\text{K}$-token generation. The main caveat is that results are currently limited to math reasoning benchmarks.

**Innovation Classification:** *Method advance* — the pre-rotation stability insight is a genuine conceptual advance over prior score-based compression methods, not merely an engineering optimization.

**Deployment Readiness:** High potential. The method requires no model weight changes and can be applied post-hoc to existing models. The main prerequisite is a calibration pass to extract pre-rotation cluster centers. Consumer GPU deployment is already demonstrated.

**Open Problems:**
1. How does the accuracy-compression tradeoff curve look across different compression ratios? Is there a cliff or a smooth degradation?
2. Does pre-rotation Q/K concentration hold across all model architectures (e.g., models with grouped-query attention, sliding window attention)?
3. How does TriAttention interact with speculative decoding — can both be combined for further throughput gains?

**Reproduction Gotchas:**
- The calibration step for pre-rotation cluster centers is likely sensitive to the distribution of calibration prompts — use domain-matched data.
- The trigonometric series fitting procedure details (number of terms, fitting algorithm) are critical to reproduce exact results.
