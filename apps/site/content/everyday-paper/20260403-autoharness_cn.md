---
title: "AutoHarness: Improving LLM Agents by Automatically Synthesizing a Code Harness"
slug: "autoharness-improving-llm-agents-automatically-synthesizing-code-harness"
date: "2026-04-03"
topic: "harness"
cardSummary: "AutoHarness 让 Gemini-2.5-Flash 在环境反馈引导的树搜索中自动合成代码 harness，在 145 个 TextArena 游戏里消除非法动作，并让小模型超过更大的裸模型。"
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.03329"
alphaxivUrl: "https://alphaxiv.org/abs/2603.03329"
authors:
  - "Xinghua Lou"
  - "Miguel Lázaro-Gredilla"
  - "Antoine Dedieu"
  - "Carter Wendelken"
  - "et al."
tags:
  - "harness"
  - "agent"
  - "2026"
---
# 论文分析：AutoHarness — 通过自动合成代码 Harness 改进 LLM Agent

---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | AutoHarness: Improving LLM Agents by Automatically Synthesizing a Code Harness |
| 作者与机构 | Xinghua Lou、Miguel Lázaro-Gredilla、Antoine Dedieu、Carter Wendelken、Wolfgang Lehrach、Kevin P. Murphy，均来自 Google DeepMind |
| 发表载体 / 状态 | arXiv 预印本（arXiv:2603.03329），2026 年 2 月 10 日提交，尚未同行评审 |
| 代码 / 数据可用性 | 论文中未提到代码仓库；TextArena 基准是公开的第三方资源 |
| 可重复性信号 | 训练设置有描述（10 个并行环境、1000 步、每个游戏 20 场对局、合法动作测试使用 10 个随机种子）；未报告置信区间或显著性检验；未提供算力规格 |

---

## 第 1 节 — 研究问题与动机

### 1. 本文解决的具体问题是什么？

当 LLM agent 被部署到受规则约束的环境里（例如棋类或文本游戏），它们经常会尝试违反环境硬约束的动作，也就是 **非法动作**。这和策略次优不同：模型“懂游戏”，但仍会输出语法上或语义上无效的动作。论文把这称为 **动作可适用性问题**：给定状态 $s_t$，确定合法动作集合 $\mathcal{A}_{\text{legal}}(s_t) \subseteq \mathcal{A}$，并确保 agent 只提出 $a \in \mathcal{A}_{\text{legal}}(s_t)$。目标是在不手写 harness、也不微调 LLM 的前提下自动实现这一点。

### 2. 现有方法为何在此失效？

- **仅靠提示的方法**（chain-of-thought、tree-of-thoughts）依赖 LLM 的内部世界模型，而这个模型会幻觉出看似有效的状态转移 `[paper]`。在 Kaggle GameArena 国际象棋比赛中，Gemini-2.5-Flash 的 78% 失败都源于非法动作，即使模型“理解”国际象棋 `[paper]`。
- **微调** 游戏轨迹成本高、速度慢，还会削弱通用指令跟随能力 `[paper]`。
- **手写 harness** 对每个新游戏都要求领域知识，脆弱且不具可扩展性 `[paper]`。
- **代码世界模型生成**（直接生成整个环境转移函数）复杂度过高，而且仍然没有利用 LLM 自身的策略推理能力 `[paper]`。

### 3. 为什么这个问题值得解决？

违反规则是一种硬失败模式，在竞赛环境里会直接判负，不管策略本身多强。更广泛地说，任何把 LLM agent 部署到结构化环境里的场景（机器人、工具调用、带约束 schema 的 API 调用）都会遇到类似的合法性缺口。论文强调，一个 *更小* 的模型加上自动合成的 harness 可以超过 *更大* 的裸模型，这对生产环境中的 AI 成本结构有直接影响 `[paper；超出游戏的推广含义为本文外推 — inferred]`。

---

## 第 2 节 — 技术方案

### 核心贡献

本文提出 **AutoHarness**：用一个 LLM（Gemini-2.5-Flash）在环境反馈引导的树搜索中自动合成 Python 代码 harness，从而在 145 个文本游戏里完全消除非法动作。仅靠 prompt engineering 做不到这一点，因为模型内部的动作合法性模型并不可靠。

### 方法流程

**Harness 合成（训练阶段）：**

1. **初始化**：给 LLM 提供游戏描述和一个 harness 模板，其中包含两个函数桩：
   - `is_legal_action(state, action) -> bool`：动作合法性验证器
   - `propose_action(state) -> action`：动作提议器（用于 harness-as-policy 模式）

2. **带 Thompson sampling 的树搜索**：维护多条 harness 代码假设组成的树。每个节点的启发式值是 **合法动作成功率**。Thompson sampling 决定下一步精化哪个节点，在探索（新增逻辑）和利用（修复已部分有效的 harness）之间平衡 `[paper]`。

3. **Rollout**：10 个并行环境运行，最多 1000 步。遇到非法动作或代码执行失败就提前终止。

4. **Critic**：收集最多 5 个失败步骤及其错误信息。

5. **Refiner（LLM 作为变异算子）**：基础 LLM 接收失败代码和错误反馈，提出更新后的 harness。如果 `is_legal_action()` 返回 True 但动作仍非法，就同时改两个函数；如果它返回 False 且动作非法，就只改 `propose_action()` `[paper]`。

6. **终止条件**：合法动作率达到 1.0 或超时即停止训练。

**三种 harness 模式（测试阶段）：**

| 模式 | 机制 | 推理时是否调用 LLM？ |
|---|---|---|
| harness-as-action-filter | 代码先生成合法动作 *集合*，再由 LLM 排序 | 是 |
| harness-as-action-verifier | LLM 先提动作，代码验证，非法则重新提示 | 是 |
| harness-as-policy | 代码直接提出动作（不再需要 LLM） | **否** |

论文主要关注 **harness-as-action-verifier**，并给出了一些初步的 harness-as-policy 结果。

**训练目标（harness-as-action-verifier）：**

$$
H = \text{legal action success rate} \in [0, 1]
$$

