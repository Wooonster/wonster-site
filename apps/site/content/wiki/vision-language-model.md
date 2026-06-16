---
title: Vision-Language Models
summary: Models that jointly encode images and text, enabling zero-shot transfer, visual question answering, and image-conditioned generation.
tags: [Multimodal, Vision, Language, MLLM, VLM]
updated: 2026-04-07
related: [transformer, contrastive-learning]
---

## Overview

Vision-Language Models (VLMs) bridge visual and linguistic representations. The core challenge is aligning heterogeneous modalities — pixel patches and token sequences — into a shared embedding space.

## Alignment Strategies

**Contrastive pre-training** (CLIP) pulls matching image–text pairs together while pushing mismatched pairs apart. This creates semantically aligned embeddings without requiring hard-coded labels.

**Projector-based fusion** (LLaVA family) encodes images with a frozen vision encoder, then projects the resulting patch tokens into a language model's token space via a lightweight MLP or cross-attention adapter.

**Unified sequence modeling** (Flamingo, GPT-4V) interleaves visual tokens directly into the autoregressive stream, enabling rich few-shot visual reasoning.

## Representative Models

| Model | Strategy | Year |
|-------|----------|------|
| CLIP | Contrastive | 2021 |
| Flamingo | Cross-attention | 2022 |
| LLaVA | MLP projector | 2023 |
| InternVL | Hybrid | 2024 |
| Qwen2-VL | Dynamic resolution | 2024 |

## Dynamic Resolution

Early VLMs resized all images to a fixed resolution, discarding fine-grained spatial detail. **Dynamic resolution** methods (Qwen2-VL, InternVL2) tile or slice images at their native resolution and encode each tile independently, dramatically improving OCR and dense prediction tasks.

## Evaluation Dimensions

- **VQA** — visual question answering accuracy
- **OCR / document understanding** — reading text in images
- **Spatial reasoning** — object counting, relation grounding
- **Hallucination rate** — fraction of plausible-sounding but incorrect statements

## Open Challenges

- Faithful grounding: models often generate text unsupported by the image.
- Long-context vision: attending over thousands of patch tokens efficiently.
- Video understanding: temporal reasoning across frames.
