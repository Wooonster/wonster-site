---
title: "AIMv2"
date: 2025-10-29
summary: "A novel method for pre training of large scale vision encoders, based on autoregressive pretraining to a multimodal setting(image and text)…"
tags:
  - "MLLM"
  - "Paper Notes"
draft: false
language: zh
sourcePath: "AI/papers/mllm/7 - AIMv2.md"
---

A novel method for pre-training of large-scale vision encoders, based on *autoregressive pretraining to a multimodal* setting(image and text), 把自回归预训练扩展到多模态(图像+文本)场景.

The method is to *pair the vision encoder with a multimodal decoder that autoregressively generates raw image patches and text tokens*. 方法是：用多模态解码器与视觉编码器配对，让*解码器自回归地生成原始图像 patch 和文本 token*。

AIMv2 is a family of open vision models pretrained to autoregressively generate both image patches and text tokens. During pretraining, AIMv2 uses a *causal multimodal decoder* that first regresses image patches and then decodes text tokens in an autoregressive manner.
![Screenshot 2025-10-29 at 3.03.09 PM](/images/obsidian/mllm-aimv2/screenshot-2025-10-29-at-3-03-09-pm.png)

# Approach
## Pretraining
- an image $x$ is partitioned into $I$ non-overlapping patches $x_{i}, i\in[1, I]$, forming a sequence of tokens. 
- a text sequence is broken down into subwords $x_{t}, t\in[I,I+T]$.
- concatenate image tokens and text tokens(image+text or text+image都可以，但是选择 image+text，这样文本 token 在因果掩码下能*看到全部已生成的图像 patch*，从而更强地以视觉为条件，有利于训练出更强的*视觉编码器*；同时像素重建先发生在图像段，避免让图像过度依赖文本提示再去“补图”）

The sequence is thus:
$$
P(S)=\prod_{j=1}^{I+T}P(S_{j}|S_{<j})
$$
making the model to autoregressively predict the next token in the sequence.

The pretraining setup:
- a dedicated vision encoder that processes the raw image patches
- then passed to a multimodal decoder alongside the embedded text tokens
- the decoder subsequently performs next-token prediction on the combined sequence
- vision encoder: prefix self-attention; multimodal decoder: causal self-attention

The **loss function** is designed separately for image and text domains:
$$
\begin{align}
L_{\text{img}}=\frac{1}{I}\sum_{i=1}^I \Vert \hat{x}_{i}(x_{<i};\theta)-x_{i}\Vert_{2}^2 \quad l_{2}\text{ pixel-level regression loss}\\
L_{\text{text}}=-\frac{1}{T}\sum_{t=I+1}^{I+T}\log P(x_{t}|x_{<t};\theta)\quad\text{Cross-Entropy}
\end{align}
$$
The overall objective is to *minimize $L_{\text{text}}+\alpha \cdot L_{\text{img}}$ w.r.t. model param $\theta$*. Normalize the images patches following He.

Use separate linear layers to map the final hidden state of the multimodal decoder to the appropriate output dimensions for image patches and vocabulary size for vision and language, respectively.

## Architecture
The vision encoder is ViT.

**Prefix Attention**
Randomly sample the prefix length as $M\sim \mathcal{U}\{1,2,\dots,I-1\}$. The pixel loss is computed exclusively for non-prefix patches, defined as $\{x_{i}|i>M\}$.
- used in vision encoder
- facilitates the use of bidirectional attention during inference without additional tuning

**SwiGLU and RMSNorm**
use SwiGLU as FFN and replace all norm layers with RMSNorm in both vision encoder and multimodal decoder

**Multimodal Decoder**
- Image features and raw text tokens are each linearly projected and embedded into $\mathbb{R}^{d_{\text{dec}}}$.
- decoder employs causal attention in the self-attention operations
- the outputs are processed through 2 separated linear heads to predict the next token in each modality


## Post-Training
**High-resolution Adaptation**
