---
title: "GLM-4.1V-Thinking"
date: 2025-08-02
summary: "GLM 4.1V Thinking (9B base/thinking) is a VLM designed to advance general purpose multimodal reasoning . The model gains the upper capabili…"
tags:
  - "MLLM"
  - "Paper Notes"
draft: false
language: en
sourcePath: "AI/papers/mllm/6 - GLM-4.1V-Thinking.md"
---

GLM-4.1V-Thinking (9B [base](https://huggingface.co/zai-org/GLM-4.1V-9B-Base)/[thinking](https://huggingface.co/zai-org/GLM-4.1V-9B-Thinking)) is a VLM designed to advance general-purpose **multimodal reasoning**. The model gains the upper capability through *large scale pretraining* and then RL with Curriculum Sampling (RLCS).
![](https://raw.githubusercontent.com/THUDM/GLM-4.1V-Thinking/refs/heads/main/resources/rl.jpeg)

## Intro
GLM-4.1V-Thinking's training framework is structured around a unified objective, to comprehensively enhance the model's reasoning capabilities through **scalable RL**. 

The pretraining curated a broad and diverse corpus of knowledge-intensive multimodal data and the SFT stage also used carefully designed, *domain-specific* datasets. The RL phase is conducted with the new introduced RLCS.

RLCS is a multi-domain RL framework that *combines curriculum learning with difficulty-aware sampling* to improve training efficiency by selecting tasks and samples suited to the model's current competence.

### Key findings
- Multi-domain reinforcement learning demonstrates *robust cross-domain generalization* and mutual facilitation.
- Dynamically selecting the most informative rollout problems is essential for both efficiency and performance. 
- A robust and precise *reward system is critical* for multi-domain RL.

## Architecture
The architecture contains 3 components:
- a vision encoder: AIMv2-Huge
	- 3D convolutions, enables temporal downsampling by a factor of 2 for video inputs (duplicate single-image inputs)
- an MLP adapter
- a LLM: GLM

![Screenshot 2025-08-02 at 5.18.21 PM](/images/obsidian/mllm-glm-4-1v-thinking/screenshot-2025-08-02-at-5-18-21-pm.png)

For *arbitrary image resolution* and *aspect ratios*,
- **2D RoPE**, enables the model to effectively process images with extreme aspect ratios (over 200:1) or high resolution (beyond 4K)
- **Retrain the original learnable absolute position embeddings** of the pre-trained ViT

The embeddings are dynamically adapted to variable-resolution inputs via **bicubic interpolation**. For an input image, divide into a grid of $H_{p}\times W_{p}$ patches, the integer coordinates $g=(w,h)$ of each patch are first normalized to a continuous grid $g_{\text{norm}}$ spanning $[-1,1]$:
$$
g_{\text{norm}}=(w_{\text{norm}},h_{\text{norm}})=2\cdot\left( \frac{w+0.5}{W_{p}}, \frac{h+0.5}{H_{p}} \right)-1
$$
The normalized coordinates are then used to sample from the original position embedding table $P_{\text{orig}}$ using a bicubic interpolation function $\mathcal{I}_{\text{bicubic}}$ to generate the final adapted embedding $P_{\text{adapted}}$ for the patch
$$
P_{\text{adapted}}(g)=\mathcal{I}_{\text{bicubic}}(P_{\text{orig}}, g_{\text{norm}})
$$


Extend RoPE to 3D-RoPE in the LLM for spatial awareness on the language side.

For **videos**, *insert a time index token after each frame token*, where the time index is implemented by *encoding each frame’s timestamp as a string*. Unlike multi-image inputs, video frames form a temporally coherent sequence. 

## Pretraining
## SFT
## RLCS
