---
title: Scaling Laws
summary: Empirical power-law relationships between model performance and the three axes of scale — parameters, training tokens, and compute budget.
tags: [Scaling, Training, LLM, Reasoning]
updated: 2026-04-07
related: [transformer]
---

## Overview

Scaling laws describe how the test loss of a language model changes as you increase compute, data, or model size. The central finding: **loss decreases smoothly as a power law** with each resource, enabling principled resource allocation before training.

## Kaplan et al. (2020)

The original OpenAI scaling laws found that for a fixed compute budget $C$, loss follows:

$$L(N, D) \approx \left(\frac{N_c}{N}\right)^{\alpha_N} + \left(\frac{D_c}{D}\right)^{\alpha_D} + L_\infty$$

where $N$ is parameter count, $D$ is training tokens, and $\alpha_N \approx 0.076$, $\alpha_D \approx 0.095$.

Key implication: at fixed compute, **scale the model much faster than the data**. This guided GPT-3 and most contemporaries.

## Chinchilla (Hoffmann et al., 2022)

DeepMind's *Training Compute-Optimal Large Language Models* (Chinchilla) found Kaplan's data exponent was underestimated due to insufficient data in the original regime. Their revised finding:

> For a compute-optimal model, **training tokens should scale 1:1 with parameters** — roughly 20 tokens per parameter.

Chinchilla (70B params, 1.4T tokens) matched or exceeded Gopher (280B params, 300B tokens) at a fraction of the inference cost. The paper shifted the field toward data-rich training regimes.

## Inference-Time Compute Scaling

Recent work (Snell et al., 2024; DeepSeek-R1) extends scaling to *test-time compute*: allocating more tokens for chain-of-thought reasoning improves accuracy roughly as a power law with additional generated tokens. This creates a second scaling axis orthogonal to training compute.

## Practical Takeaways

1. **Don't stop early.** Underfitting is often cheaper to fix by adding data than by adding parameters.
2. **Match data to model.** Roughly 20 tokens per parameter for a compute-optimal run.
3. **Small models can beat large ones** if given substantially more training data (e.g., Llama).
4. **Scaling laws are noisy at capability thresholds.** Emergent behaviors can appear discontinuously.
