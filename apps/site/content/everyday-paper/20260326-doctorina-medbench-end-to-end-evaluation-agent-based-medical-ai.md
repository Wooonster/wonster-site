---
title: "Doctorina MedBench: End-to-End Evaluation of Agent-Based Medical AI"
slug: "doctorina-medbench-end-to-end-evaluation-agent-based-medical-ai"
date: "2026-03-26"
topic: "ai-in-med"
cardSummary: "Doctorina MedBench 以多轮交互对话替代静态考试题评测医疗 AI，通过 D.O.T.S. 四维框架在 1000+ 临床案例上评测，显示 Agent 型系统在鉴别诊断和治疗准确率上大幅超越 GPT-5 零样本基线。"
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.25821"
alphaxivUrl: "https://alphaxiv.org/abs/2603.25821"
authors:
  - "Anna Kozlova"
  - "Stanislau Salavei"
  - "Pavel Satalkin"
  - "Hanna Plotnitskaya"
  - "et al."
tags:
  - "ai-in-med"
  - "2026"
---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | Doctorina MedBench: End-to-End Evaluation of Agent-Based Medical AI |
| 作者与机构 | Anna Kozlova、Stanislau Salavei、Pavel Satalkin、Hanna Plotnitskaya、Sergey Parfenyuk（A.I. Doctor Medical Assist LTD，塞浦路斯） |
| 发表载体 / 状态 | arXiv 预印本，2026 年 3 月 26 日（v1） |
| 代码 / 数据可用性 | 1000+ 临床案例数据集，评测框架使用 Pydantic + ICD-10；未提及代码开放 [paper] |
| 可重复性信号 | 使用 Wilcoxon 检验（p&lt;0.001）和 McNemar 检验；LLM-as-Judge 方法已公开 [paper] |

## 第 1 节 — 研究问题与动机

**本文解决的具体问题是什么？**
传统医疗 AI 基准（标准化考试题）不能反映真实临床能力——静态问答与动态多轮诊断对话之间存在巨大鸿沟。本文提出端到端交互式评测框架，评估 Agent 型医疗 AI 在模拟真实诊疗场景中的表现。

**现有方法为何在此失效？**
USMLE、MedQA 等标准化考试基准要求 AI 直接回答问题，而真实诊断需要主动询问病史、分析文件与图像、形成鉴别诊断，并按步骤提供建议——两者能力需求完全不同。[paper]

**为什么这个问题值得解决？**
AI 医疗系统的安全性和有效性评测直接关系到患者安全；现有基准低估了 Agent 型医疗 AI 的实际能力差异，可能导致不安全系统进入临床。[paper]

## 第 2 节 — 技术方案

**核心贡献（一句话）**: Doctorina MedBench 以多轮交互对话替代静态问答，通过 D.O.T.S.（Diagnosis / Observations / Treatment / Step Count）四维度评测，在 1000+ 真实临床案例上比较 AI Doctor 与 GPT-5 基线。

**方法流程**:
- **AI Doctor 架构**：主动诊断系统 + 多 Agent 编排 + 安全协议，处理文字/检验/图像/医疗文档
- **虚拟患者模拟**：独立 LLM Agent 扮演患者，仅回答被问到的问题，不主动透露信息
- **评测管道**：
  - LLM-as-Judge + Pydantic Schema 验证提取
  - 算法化 ICD-10 匹配
  - 确定性评分函数（含安全加权覆盖）
- **三级测试架构**：Level 1（安全陷阱案例）→ Level 2（分类随机采样）→ Level 3（完整回归测试）
- **数据集**：1000+ 案例，750+ 诊断，覆盖内科（50.5%）、妇产科（16.7%）、儿科（16.3%）、外科（16.5%）

**真正的新颖点**: 多 Agent 虚拟患者模拟（约束患者行为以还原真实诊断过程中的信息不对称）；D.O.T.S. 四维评测框架；实时质量监控系统（分钟级模型退化检测）。[paper]

**复杂度分析**: 多 Agent 系统增加交互开销（平均 11.56 轮 vs GPT-5 的 0.66 轮），但提升诊断准确性。[paper]

## 第 3 节 — 实验验证

| 指标 | AI Doctor | GPT-5 基线 | Δ |
|---|---|---|---|
| 诊断准确率 | 89.3% | 84.6% | +4.7pp |
| 治疗准确率 | 53.0% | 38.0% | +15pp |
| 鉴别诊断准确率 | 45.4% | 24.0% | +21.4pp |
| 问诊准确率 | 61.4% | 30.3% | +31.1pp |
| 危重症通过率 | 97.3% | 98.5% | -1.2pp |
| 平均对话轮数 | 11.56 | 0.66 | — |

**消融实验分析**: 人类 GP 医师在 100 个基准案例中诊断准确率 83%，而 AI Doctor 达 87%，验证了框架的参考有效性。[paper]

**统计严谨性**: Wilcoxon 检验（治疗 p&lt;0.001、鉴别诊断 p&lt;0.001）；McNemar 检验（诊断 p=0.043）；统计严谨性较高。[paper]

**潜在混淆因素**: AI Doctor 是论文作者开发的系统，存在评测者与系统设计者同一的利益冲突；GPT-5 以 0.66 轮对话作为基线设定不公平（零样本 vs 专用系统）。[inferred]

## 第 4 节 — 批判性评审

**方法层面的隐患**: 论文作者既是基准设计者又是被评测系统（AI Doctor）的开发者，存在严重利益冲突；GPT-5 的 0.66 轮对话基线设定为非交互模式，比较不公平。[inferred]

**实验层面的问题**: 缺乏与其他医疗 AI 系统（如 Med-Gemini、BioGPT 系）的比较；1000 案例数据集的来源和质量验证机制未详细说明；LLM-as-Judge 在医疗领域的校准验证不充分。[inferred]

**声明范围**: "AI Doctor 超越人类 GP"的声明基于有限样本（100 案例）且存在利益冲突，应谨慎对待。[inferred]

**客观优点**: 交互式评测框架设计新颖；D.O.T.S. 多维评测比单一准确率更全面；实时质量监控系统（分钟级退化检测）对生产部署有实际价值。[paper]

## 第 5 节 — 综合总结

**TL;DR（30 秒摘要）**: Doctorina MedBench 以多轮交互对话替代静态考试题评测医疗 AI，在 1000+ 案例上显示 AI Doctor 在治疗准确率（+15pp）和鉴别诊断（+21pp）上显著优于 GPT-5 基线；但评测者-开发者同一的利益冲突使结论需要独立验证。

**创新类型判断**: 评测框架创新（Evaluation Framework）——方法论贡献大于技术创新。[paper]

**部署成熟度**: 评测框架成熟（TRL 7）；AI Doctor 系统声称接近临床部署，但需第三方验证（TRL 5-6）。[inferred]

**开放问题**: 独立第三方评测；框架在非英语多语言医疗场景的适用性；与电子病历（EHR）集成的评测。[inferred]

**复现注意事项**: 需访问 A.I. Doctor 专有系统；虚拟患者 Agent 可用公开 LLM 近似实现；ICD-10 匹配算法需独立实现。[paper]
