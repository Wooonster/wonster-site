---
title: "AEC-Bench: A Multimodal Benchmark for Agentic Systems in Architecture, Engineering, and Construction"
slug: "aec-bench-multimodal-benchmark-agentic-systems-architecture-engineering"
date: "2026-03-31"
topic: "agent"
cardSummary: "AEC-Bench 是首个面向建筑、工程与施工领域的多模态 Agent 基准，196 个专家任务按三层范围分类；当前最优 Agent 在跨文档合规任务上仅达 23%，核心瓶颈是视觉空间理解与文档检索的协同融合。"
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.29199"
alphaxivUrl: "https://alphaxiv.org/abs/2603.29199"
authors:
  - "Harsh Mankodiya"
  - "Chase Gallik"
  - "Theodoros Galanos"
  - "Andriy Mulyar"
tags:
  - "agent"
  - "2026"
---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | AEC-Bench: A Multimodal Benchmark for Agentic Systems in Architecture, Engineering, and Construction |
| 作者与机构 | Harsh Mankodiya、Chase Gallik、Andriy Mulyar（Nomic AI）；Theodoros Galanos（Aurecon Group） |
| 发表载体 / 状态 | arXiv 预印本，2026 年 3 月 31 日（v1） |
| 代码 / 数据可用性 | 数据集、评测框架和代码均以 Apache 2 许可发布 [paper] |
| 可重复性信号 | 完整开源，196 个任务实例有专家标注，自动评测机制 [paper] |

## 第 1 节 — 研究问题与动机

**本文解决的具体问题是什么？**
建筑、工程与施工（AEC）领域缺乏评测 AI Agent 能力的专业多模态基准。现有通用基准无法反映 AEC 工作流中图纸理解、多图纸推理和跨文档协调等核心挑战。

**现有方法为何在此失效？**
通用编程 Agent 基准不包含 AEC 领域特有任务；现有 AEC AI 工具评测缺乏系统化、标准化方法，难以横向比较不同 Agent 系统。[paper]

**为什么这个问题值得解决？**
AEC 是经济体量巨大（全球建筑业年产值超 10 万亿美元）且数字化转型滞后的领域，AI Agent 自动化潜力显著，系统化基准是评估与推动技术进步的先决条件。[inferred]

## 第 2 节 — 技术方案

**核心贡献（一句话）**: AEC-Bench 提供 196 个专家策划的多模态任务实例，按三层范围分类（单页内、跨图纸页、跨项目文档），并通过 Nomic AI 工具集测试专用文档解析工具对 Agent 性能的影响。

**方法流程**:
- **三层分类法**：
  - Intra-Sheet（单页内）：细节审查、标题验证、标注准确性
  - Intra-Drawing（跨图纸页）：交叉引用验证、图纸索引比较
  - Intra-Project（跨项目文档）：规范对齐、提交件合规审查
- **评测设置**：Codex vs Claude Code 两个 Agent 家族，基础配置 vs Nomic 工具增强配置
- **评测框架**：领域专家设计的任务 + 自动化评分机制

**真正的新颖点**: 三层范围分类法将 AEC 推理从空间定位抽象到跨文档语义协调；量化了专用文档解析工具对不同类型任务的差异化影响。[paper]

**复杂度分析**: 基准规模适中（196 任务），但 AEC 文档处理（PDF 图纸、规范书）的计算成本因文档大小差异显著。[paper]

## 第 3 节 — 实验验证

| 任务层级 | 基础配置平均奖励 | Nomic 工具增强 | Δ（最优任务） |
|---|---|---|---|
| Intra-Sheet | ~57.2% | 部分提升，部分下降 | +32.2%（detail-technical-review） |
| Intra-Drawing | ~72.2% | 中等提升 | — |
| Intra-Project（submittal-review） | 23.1% | 无显著提升 | — |

**消融实验分析**: Nomic 工具在检索敏感任务上显著提升（+32.2%），在视觉定位任务上反而下降，证明工具影响高度任务依赖。[paper]

**统计严谨性**: 基准规模（196 任务）较小；仅测试两个 Agent 家族；未提供置信区间。[inferred]

**潜在混淆因素**: Nomic AI 同时是基准创作者和工具提供商，存在潜在利益冲突；AEC 专家标注的主观性未量化。[inferred]

## 第 4 节 — 批判性评审

**方法层面的隐患**: Codex Agent 100% 依赖 Bash 命令、77% 轨迹使用 pdftotext，说明 Agent 将空间布局退化为线性文本——这是表示层而非工具层的根本局限。[paper]

**实验层面的问题**: Nomic AI 提供工具并发布基准存在利益冲突；submittal-review 任务（23.1%）揭示了专业判断需求，但未提供改进路径。[inferred]

**声明范围**: 论文定位为基准论文，声明集中于当前 Agent 局限性，未过度声明解决方案。[paper]

**客观优点**: 完整开源（Apache 2）；领域专家策划增强了任务真实性；三层分类法为后续研究提供了清晰框架。[paper]

## 第 5 节 — 综合总结

**TL;DR（30 秒摘要）**: AEC-Bench 是首个覆盖建筑、工程、施工领域的多模态 Agent 基准，196 个专家任务按三层范围分类。当前最优 Agent 在跨图纸推理上仅达 72%、跨文档合规任务仅 23%，核心瓶颈是视觉空间理解与文档检索的协同融合。

**创新类型判断**: 基准与数据集贡献（Benchmark & Dataset）——领域空白填补而非方法创新。[paper]

**部署成熟度**: 基准本身成熟（TRL 7）；被评测的 Agent 系统距 AEC 部署仍远（TRL 3-4）。[inferred]

**开放问题**: 视觉空间理解与文本检索的协同表示方法；AEC 专业知识注入；跨文档合规推理的专用架构。[inferred]

**复现注意事项**: 基准完整开源（Apache 2）；需要 Codex/Claude Code API 访问；Nomic 工具需独立配置。[paper]
