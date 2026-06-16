---
title: Contrastive Learning
summary: A self-supervised framework that learns representations by pulling semantically similar samples together and pushing dissimilar ones apart in embedding space.
tags: [Representation Learning, Self-supervised, Training, MLLM, Vision]
updated: 2026-04-07
related: [transformer, vision-language-model]
---

## Core Idea

Contrastive learning avoids manual labels by creating *positive pairs* (augmented views of the same instance) and *negative pairs* (different instances). The loss drives the encoder to assign similar embeddings to positives and dissimilar embeddings to negatives.

## InfoNCE Loss

The most widely used objective is the InfoNCE (Noise-Contrastive Estimation) loss:

$$\mathcal{L} = -\log \frac{\exp(\text{sim}(z_i, z_j)/\tau)}{\sum_{k=1}^{2N} \mathbf{1}_{[k \neq i]} \exp(\text{sim}(z_i, z_k)/\tau)}$$

where $z_i, z_j$ are embeddings of a positive pair, $\tau$ is a temperature hyperparameter, and the denominator sums over all negatives in the batch.

**Temperature $\tau$** controls the sharpness of the distribution. Low $\tau$ concentrates probability on the hardest negatives; high $\tau$ smooths it. Typical values: 0.07–0.1 for CLIP, 0.5 for SimCLR.

## Representative Methods

**SimCLR** (Chen et al., 2020) uses data augmentation (crop, color jitter, blur) to construct positive pairs from a single image. No negative mining — just large batches.

**MoCo** (He et al., 2020) maintains a momentum-updated encoder and a memory queue of negative embeddings, decoupling batch size from the number of negatives.

**CLIP** (Radford et al., 2021) scales contrastive learning to 400M image–text pairs from the internet. Positive pair = (image, its caption). Enables zero-shot transfer to arbitrary downstream tasks.

**DINO / DINOv2** replaces the contrastive objective with a self-distillation scheme: a student encoder is trained to match the output of a momentum teacher, without explicit negatives.

## Why It Works

The representation learned by contrastive objectives tends to capture *semantically invariant* features — properties shared between augmented views — while discarding augmentation-specific noise. This aligns well with downstream classification and retrieval tasks.

## Collapse and Solutions

Without careful design, contrastive models collapse to constant representations:

- **Batch normalization** in SimCLR prevents representation collapse implicitly.
- **Stop-gradient** in BYOL / SimSiam breaks the feedback loop that drives collapse.
- **Redundancy reduction** (Barlow Twins) penalizes off-diagonal correlations in the cross-correlation matrix directly.
