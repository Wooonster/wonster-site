---
title: "Bridging Perception and Reasoning: Token Reweighting for RLVR in Multimodal LLMs"
slug: "bridging-perception-reasoning-token-reweighting-rlvr-multimodal"
date: "2026-03-26"
topic: "rl"
cardSummary: "Token-Reweighting（ToR）通过熵识别推理 token、视觉敏感度识别感知 token，在 GRPO/DAPO 策略梯度中差异化加权，解决多模态 RLVR 感知-推理拉锯效应，在 5 个数学视觉推理基准上实现一致提升。"
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.25077"
alphaxivUrl: "https://alphaxiv.org/abs/2603.25077"
authors:
  - "Jinda Lu"
  - "Junkang Wu"
  - "Jinghan Li"
  - "Kexin Huang"
  - "et al."
tags:
  - "rl"
  - "2026"
---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | Bridging Perception and Reasoning: Token Reweighting for RLVR in Multimodal LLMs |
| 作者与机构 | Jinda Lu、Junkang Wu、Jinghan Li、Kexin Huang、Shuo Yang、Guoyin Wang、Jiancan Wu、Xiang Wang、Xiangnan He（具体机构未在摘录中列出） |
| 发表载体 / 状态 | arXiv 预印本，2026 年 3 月 26 日（v1） |
| 代码 / 数据可用性 | 未明确提及；训练数据 Geometry3K 公开可用 [paper] |
| 可重复性信号 | 在 Geometry3K（2100 样本）上训练，评测集均为标准公开基准 [paper] |

## 第 1 节 — 研究问题与动机

**本文解决的具体问题是什么？**
将 RLVR（Reinforcement Learning with Verifiable Rewards）扩展至多模态模型时，感知 token（依赖视觉输入的 token）和推理 token（逻辑链式推理 token）在优化目标上存在内在张力，单独优化任一类型均会损害另一能力。

**现有方法为何在此失效？**
现有 RLVR 方法（如 GRPO、DAPO）将所有 token 等权对待，无法区分视觉感知相关 token 与逻辑推理相关 token 的差异化梯度贡献，导致感知-推理能力的"拉锯效应"。[paper]

**为什么这个问题值得解决？**
多模态推理是 VLM 的核心能力，感知与推理的协同优化是提升数学视觉推理、幻觉抑制等任务性能的关键路径。[paper]

## 第 2 节 — 技术方案

**核心贡献（一句话）**: Token-Reweighting（ToR）是一种即插即用策略，通过熵识别推理 token、通过视觉敏感度（有/无图像的 log-prob 差）识别感知 token，并在策略梯度计算中为两类 token 分配差异化权重。

**方法流程**:
- **推理 token 识别**：批次内熵最高的 top-αr 比例 token
- **感知 token 识别**：有/无图像上下文时 log-prob 的绝对差值
- **权重分配**：推理 token 权重 γr，感知 token 权重 γp（最优 γp=0.5），重叠 token（约 12%）使用推理权重
- **基础方法集成**：修改 GRPO/DAPO 目标函数，兼容性强

**真正的新颖点**: 基于信息论（熵）和视觉条件概率差的双维度 token 识别方法；明确建模感知-推理的相互依赖关系。[paper]

**复杂度分析**: Token 识别仅需批次内前向传播计算，额外开销极小；log-prob 差值计算需两次前向传播（有/无图像），但可批处理。[inferred]

## 第 3 节 — 实验验证

| 数据集 | 指标 | 先前 SOTA (GRPO) | 本文结果 (ToR-GRPO) | Δ |
|---|---|---|---|---|
| MathVerse | 准确率 | 50.8 | 53.0 | +2.2 |
| HalluBench | 准确率 | 69.8 | 72.4 | +2.6 |
| MathVision | 准确率 | — | SOTA（ToR-DAPO） | — |
| WeMath | 准确率 | 降低约 2% | 恢复正常 | — |

**消融实验分析**: 测试 token 选择比例（20-80%）和感知权重 γp（0.1-1.5）；γp=0.5 最优；log-prob 差值优于 prob-diff 和 entropy-diff 等替代感知代理。[paper]

**统计严谨性**: 未报告标准差或置信区间；跨 5 个基准的一致改进增强了结果可信度。[inferred]

**潜在混淆因素**: 仅在 Geometry3K（2100 样本）上训练，样本量有限；7B/3B 模型测试，未扩展至更大模型。[paper]

## 第 4 节 — 批判性评审

**方法层面的隐患**: 感知 token 识别需要两次前向传播，在推理密集型场景下计算成本翻倍；"约 12% 重叠 token 使用推理权重"的设计决策缺乏充分理论支撑。[inferred]

**实验层面的问题**: 未与其他多模态 RLVR 方法（如 RLVR-multimodal 特定设计）横向比较；训练集与测试集之间的领域偏移风险（Geometry3K → 多样化数学基准）未深入分析。[inferred]

**声明范围**: 声明局限于数学视觉推理域，跨域泛化未主张。[paper]

**客观优点**: 即插即用设计降低了应用门槛；在多个基准、多个基础方法（GRPO/DAPO）、多个模型大小（3B/7B）上验证了一致性。[paper]

## 第 5 节 — 综合总结

**TL;DR（30 秒摘要）**: ToR 通过熵+视觉敏感度双维度识别推理与感知 token，并在 GRPO/DAPO 策略梯度中差异化加权，解决了多模态 RLVR 中感知-推理的拉锯效应，在 MathVerse、HalluBench 等 5 个基准上实现一致改进。

**创新类型判断**: 算法增量创新（Algorithmic Increment）——在已有 RLVR 框架上引入细粒度 token 级别的差异化优化策略。[paper]

**部署成熟度**: TRL 4-5（研究代码，待工程化集成）。[inferred]

**开放问题**: 感知-推理重叠 token 的最优处理策略；扩展至更大模型（70B+）的效果；在非数学多模态任务（视觉问答、视觉推理）上的泛化能力。[inferred]

**复现注意事项**: Geometry3K 数据集公开；需要支持 GRPO/DAPO 的 RL 训练框架；两次前向传播的感知 token 识别需额外 GPU 内存。[paper]
