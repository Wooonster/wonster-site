---
title: Transformer Architecture
summary: A sequence-to-sequence architecture built entirely on attention mechanisms, replacing recurrence and convolutions with parallelizable self-attention layers.
tags: [Architecture, Attention, NLP, LLM, MLLM]
updated: 2026-04-07
related: [vision-language-model, contrastive-learning]
---

## Overview

The Transformer, introduced in *Attention Is All You Need* (Vaswani et al., 2017), discards recurrence and convolutions in favor of **self-attention**. Every position attends to every other position in a single pass, enabling massive parallelism during training.

## Core Components

**Multi-Head Attention** computes attention over $h$ separate subspaces and concatenates the results:

$$\text{MultiHead}(Q,K,V) = \text{Concat}(\text{head}_1,\ldots,\text{head}_h)W^O$$

where each head is:

$$\text{head}_i = \text{Attention}(QW_i^Q, KW_i^K, VW_i^V)$$

**Scaled Dot-Product Attention** prevents softmax saturation in high dimensions:

$$\text{Attention}(Q,K,V) = \text{softmax}\!\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$

**Position-wise FFN** applies two linear layers with a ReLU in between:

$$\text{FFN}(x) = \max(0,\, xW_1 + b_1)W_2 + b_2$$

**Positional Encoding** injects sequence order via sinusoidal signals added to the token embeddings.

## Encoder–Decoder Structure

The original Transformer has two stacks:

- **Encoder**: $N$ identical layers, each with self-attention + FFN + residual connections.
- **Decoder**: $N$ layers with masked self-attention, cross-attention over encoder output, and FFN.

Modern language models (GPT family) use the decoder only; BERT and its variants use the encoder only.

## Scaling Properties

Empirical scaling laws (Kaplan et al., 2020) show that loss decreases smoothly as a power law with model size, data, and compute — the key insight behind the large-scale pretraining paradigm.

## Key Papers

- Vaswani et al. (2017) — [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- Devlin et al. (2018) — BERT
- Brown et al. (2020) — GPT-3
- Kaplan et al. (2020) — Scaling Laws for Neural Language Models
