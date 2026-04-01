---
title: "LLaVA 系列"
date: 2025-03-13
summary: "use Vicuna(LLaMA 7B) as the LLM $f {\\phi}(\\cdot)$ parameterized by $\\phi$, use a pre trained CLIP vision encoder ViT L/14 , provide the vis…"
tags:
  - "MLLM"
  - "Paper Notes"
draft: false
language: zh
sourcePath: "AI/papers/mllm/4 - LLaVA 系列.md"
---

### LLaVA
![Screenshot 2025-03-13 at 11.53.44 am](/images/obsidian/mllm-llava-系列/screenshot-2025-03-13-at-11-53-44-am.png)
- use *Vicuna(LLaMA 7B)* as the LLM $f_{\phi}(\cdot)$ parameterized by $\phi$, 
- use a pre-trained *CLIP vision encoder ViT-L/14*, provide the vision features $Z_{v}=g(X_{v})$
- use a simple MLP layer to project vision features $Z_{v}$ to the embedding space: $H_{v}=WZ_{v}$

### LLaVA-1.5
![Screenshot 2025-03-13 at 12.02.35 pm](/images/obsidian/mllm-llava-系列/screenshot-2025-03-13-at-12-02-35-pm.png)
- vision encoder: CLIP ViT-L/336px, LLM: Vicuna v1.5 13B
- *2 layer MLP* to improve multimodal capabilities
- to scaling up to higher resolutions, *divide the image into smaller images patches* of the resolution that the vision encoder is trained for, and encode them independently; after obtaining the feature maps of individual patches, then *combine them into a single large feature map of the target resolution*, and feed into LLM  将图片切块成 vision encoder 与训练的分辨率大小，获得每个块的 feature 然后拼接在一起
- To provide the LLM with the global context and to reduce the artifact of the split-encode-merge operation, we *additionally concatenate the feature of a downsampled image* to the merged feature map.  同时将图片缩小后获取全局的特征，与切分后的拼接在一起  resulting model LLaVA-1.5-HD

### [LLaVA-NEXT](https://llava-vl.github.io/blog/2024-01-30-llava-next/)
- *dynamic high resolution*: reduces the model hallucination that conjectures the imagined visual content when confronted with low-resolution images
	- 维持 ViT 不变，编码更高分辨率的图像，结合 resize 图像补充全局信息
- *Scaling LLM backbone*: consider more LLMs, including Mistral-7B and Nous-Hermes-2-Yi-34B. 尝试更大 LLM 基座模型
- *Data Mixture*: *high-quality user instruct data* and *multimodal document/chart data*
