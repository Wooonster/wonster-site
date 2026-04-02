---
title: "Composer 2 Technical Report"
slug: "composer-2-technical-report"
date: "2026-04-02"
topic: "agent"
cardSummary: "Composer 2 通过编码持续预训练加大规模强化学习，把 Kimi K2.5 专门化为真实软件工程 agent，并在 CursorBench、SWE-bench Multilingual 和 TerminalBench 上达到前沿水平。"
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
# 论文分析：Composer 2 技术报告

---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | Composer 2 Technical Report |
| 作者与机构 | 40+ 位作者，均来自 Cursor Research（Aaron Chan、Ahmed Shalaby、Alexander Wettig 等） |
| 发表载体 / 状态 | arXiv 预印本（2026 年 3 月 25–26 日提交），尚未同行评审；技术报告格式 |
| 代码 / 数据可用性 | CursorBench 基准未公开发布；模型权重未发布；基础设施组件（ThunderKittens GEMM 核）已部分开源 |
| 可重复性信号 | 硬件已指定（NVIDIA B300 GPU）；优化器已指定（AdamW，MXFP8 精度）；序列长度和部分超参数已披露；无随机种子；基准数字无置信区间 |

---

## 第 1 节 — 研究问题与动机

**本文解决的具体问题是什么？**
给定一个强大的开源基础模型（Kimi K2.5，1.04T 参数 / 32B 激活 MoE），通过训练使其专门化为面向真实 agentic 软件工程任务的编码智能体模型——处理真实代码库中的多步编码工作流，而非针对单次代码生成基准。目标是最大化在 CursorBench（内部）和公开 agentic 基准（SWE-bench Multilingual、TerminalBench）上的任务完成率，同时保持有竞争力的推理成本和延迟。

**现有方法为何在此失效？**
公开基准（SWE-bench Verified）存在三个已记录的问题 [paper]：（1）领域不匹配——真实开发工作流涉及更大的变更（中位 181 行 vs. SWE-bench 的 7–10 行）；（2）过度规范——基准假设答案范围窄，而真实请求欠规范；（3）数据污染——OpenAI 暂停 SWE-bench Verified 报告，因为有证据表明"前沿模型可从记忆中生成金质补丁" [paper]。标准 RL 中的朴素优势归一化（GRPO 默认）引入长度偏差和高方差 KL 估计；论文识别并修复了这些算法问题。

**为什么这个问题值得解决？**
Cursor 是广泛部署的编码助手；能真正解决真实工程任务的专用模型具有重要商业价值。相比 Composer 1.5，CursorBench 上 37% 的相对提升，加上 SWE-bench Multilingual SOTA（73.7%），表明规模化领域专用训练可以产生明显优于通用前沿模型的编码智能体。

---

## 第 2 节 — 技术方案

**核心贡献（一句话）：** 本文提出一种两阶段训练方案（编码数据上的持续预训练 + 领域匹配奖励信号的大规模 RL），对 1.04T/32B 激活 MoE 基础模型进行训练，并结合对标准 GRPO 的算法修复（去除长度偏差、k₁ KL 估计器、异步权重同步、MoE 路由器回放），以实现在真实软件工程任务上稳定的长视野 RL。

**方法流程：**

*第一阶段 — 持续预训练：*
- 基础模型：Kimi K2.5（依据三项标准选定：FreshBench 编码知识 83.2%、状态跟踪距离 86、代码库困惑度 13.81M）
- 三个子阶段：32k token 序列长度的主体训练 → 长上下文扩展至 256k → 针对性 SFT
- Multi-Token Prediction（MTP）层通过自蒸馏训练，在每个位置匹配主 LM head 的精确 logit 分布——支持推测解码
- 精度：NVIDIA B300 GPU 上的 MXFP8；逐块量化（FP8E4M3，块大小 16）

*第二阶段 — 强化学习训练：*
- 每提示多样本的策略梯度算法；单轮次训练（提示不重复）
- 关键算法选择：
  - 移除 GRPO 长度标准化项（避免长度偏差）[paper]
  - 不对组优势进行标准差归一化 [paper]
  - KL 估计器：k₁ = -log r（标准），不使用 k₃（当分布偏离时方差过高，如 Figure 4 所示）[paper]
  - 异步基础设施：推理工作者通过 S3 delta 压缩进行中途权重更新，减少策略陈旧性
  - MoE 路由器回放：训练时覆盖路由器专家分配以匹配推理选择，并过滤以减少 p99 数值不匹配
- 自摘要：链式生成使用摘要作为上下文；最终奖励应用于链中所有 token；相比基于提示的压缩方式始终减少错误 [paper]
- 行为奖励：编码风格、沟通质量的辅助奖励；非线性长度惩罚：
  C_length(k,q)(x) = [(1+kx)^(1-q) - 1] / [k(1-q)]
  该公式激励在简单请求上快速解决，同时允许在难题上进行更长的思考 [paper]

**真正的新颖点：** MoE 路由器回放、k₁ vs. k₃ KL 估计器选择的理论分析、通过 S3 delta 压缩实现的世界规模分布式 RL 异步权重同步，以及链路级奖励的自摘要，是首次在单一系统中组合的工程贡献。领域匹配预训练损失相关性分析（Figure 2，显示交叉熵损失预测下游 RL 性能）为基础模型选择提供了实用指导。

**复杂度分析：**
- 模型：1.04T 总参数，32B 激活（MoE）[paper]
- 上下文：长上下文扩展后最高 256k token [paper]
- 并行化：RL 阶段专家并行度=8，上下文并行度=8 [paper]
- 未报告正式训练算力（论文未提供 FLOPs / GPU 小时）

---

## 第 3 节 — 实验验证

**主要结果表：**

| 基准 | Composer 1 | Composer 1.5 | Composer 2 | GPT-5.4 | Δ vs. Composer 1.5 |
|---|---|---|---|---|---|
| CursorBench | 38.0 [paper] | 44.2 [paper] | 61.3 [paper] | 63.9 [paper] | +17.1 |
| SWE-bench Multilingual | 56.9 [paper] | 65.9 [paper] | 73.7 [paper] | 76.8 [paper] | +7.8 |
| Terminal-Bench | 40.0 [paper] | 47.9 [paper] | 61.7 [paper] | 66.5† [paper] | +13.8 |

† GPT-5.4 安全过滤器拒绝了部分 Terminal-Bench 任务

**消融实验分析：**
Figure 5（RL 训练动态）显示，整个训练过程中平均性能和 best-of-K 性能均持续提升，"未观察到平均性能与 best-of-K 之间的权衡" [paper]。这直接反驳了 RL 仅"重新加权固有推理路径"的常见批评。Figure 2 在 Qwen3-Coder-30B-A3B 的三个计算量级上验证了持续预训练交叉熵损失与下游 RL 准确率之间的线性关系 [paper]。Figure 4 在合成高斯分布上验证了 k₁ vs. k₃ KL 估计器选择 [paper]。

未提供单个 RL 算法变更的消融实验（如单独去除长度归一化、单独测试路由器回放）[paper 缺失]。

**统计严谨性：**
- 基准数字无置信区间或标准差 [paper]。
- 单次报告分数；无多种子评估。
- 未进行显著性检验。
- CursorBench-3 为内部基准；评估方法论无外部验证。

**潜在混淆因素：**
- CursorBench 由构建 Composer 2 的同一团队设计且不公开。即使出于良好意图，测试集构建也可能无意中偏向模型的训练分布 [inferred]。
- 论文引用 SWE-bench Verified 的污染问题来为 CursorBench 辩护——但对 SWE-bench Multilingual 或 TerminalBench 结果未提供污染分析。
- 与 GPT-5.4 的比较在 Terminal-Bench 上使用了安全过滤后的结果（†），可能低估了 GPT-5.4 的能力。
- 效率声明（"成本上的优越 Pareto 前沿"）引用 Figure 11，但无法从论文文本中独立验证。

---

## 第 4 节 — 批判性评审

**内部基准问题** [inferred + paper-可证实, 中等]
CursorBench 的构建、去污染和评估标准均由 Cursor Research 控制。在自己的基准上，Composer 2 以 61.3% 对 GPT-5.4 的 63.9%，有竞争力但并非同类最佳。没有独立访问 CursorBench，主要评估声明无法复现。

**RL 算法组件缺乏消融** [paper-可证实, 中等]
论文引入了多项 RL 修改（去除长度归一化、k₁ 估计器、路由器回放、自摘要）。没有任何实验单独隔离每项变更的贡献。k₁ 和长度归一化的理论论证可信，但每项的实证贡献未知。

**缺乏算力透明度** [paper-可证实, 轻微]
一家资源充足的公司训练 1T 参数模型的技术报告应报告 GPU 小时和训练成本。这一遗漏使学术团队无法评估方法是否可复现。

**"SWE-bench Multilingual SOTA"声明范围** [paper-可证实, 轻微]
73.7% 是强劲成绩，但 GPT-5.4 达到 76.8% [paper]。"SOTA 级别"的声明需要限定——有竞争力，但并非领先公开 SOTA。

**客观优点：**
- 基础模型选择方法论（三维评估：FreshBench、状态跟踪、代码库困惑度）有原则性且可复现 [paper]。
- k₁ vs. k₃ KL 估计器分析（Figure 4）有理论依据，对 MoE RL 稳定性有实际重要性。
- RL 训练动态结果（平均性能与 best-of-K 无权衡）是反驳 RLHF 文献中常见假设的有意义实证发现。
- 基础设施描述（Anyrun、异步权重同步、容错机制）对于技术报告来说异常详细，对实践者真正有价值。

---

## 第 5 节 — 综合总结

**TL;DR（30 秒摘要）：** Composer 2 将持续预训练 + 大规模 RL 应用于 Kimi K2.5（1.04T/32B MoE），辅以对标准 GRPO 的多项算法修复，在 CursorBench 上实现 61.3%（相比 Composer 1.5 提升 37%），在 SWE-bench Multilingual 上达到 73.7%。主要局限是主要基准为内部专有且未经验证，且无单个 RL 变更的消融实验。

**创新类型判断：** *工程进步* —— 训练方案和基础设施创新（规模化异步 RL、MoE 路由器回放、k₁ 估计器选择）是既有 SFT + RL 框架内的工程改进，而非范式转变。

**部署成熟度：** 已作为生产模型部署在 Cursor 中。模型本身未开源；基础设施组件（ThunderKittens 核）部分开源。学术复现需要同等算力（约 NVIDIA B300 集群）和训练数据。

**开放问题：**
1. Composer 2 的增益中，每项单独的 RL 修改各贡献了多少？对长度归一化去除和 MoE 路由器回放进行独立消融，将显著加强技术贡献。
2. 训练时预训练损失 → RL 准确率的相关性（Figure 2）是否在不同基础架构和领域中成立，还是特定于 MoE 模型上的编码任务？
3. agentic 行为（多步规划、自我纠正）如何随 RL 训练曲线演变？对行为演变的定性分析将有科学价值。

**复现注意事项：**
- 需要 Kimi K2.5 权重（或同等 1T MoE）和支持 MXFP8 的 NVIDIA B300 GPU。
- MXFP8 精度需要"IEEE 兼容浮点算术"——并非所有硬件都能正确支持 [paper]。
- Anyrun 环境管理（每秒 500+ 个 pod、实时迁移）是不公开可用的定制基础设施。
- CursorBench 未发布；复现必须替换为其他 agentic 基准，其与报告结果的相关性未知。
