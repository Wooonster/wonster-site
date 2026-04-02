---
title: "A prospective clinical feasibility study of a conversational diagnostic AI in an ambulatory primary care clinic"
slug: "prospective-clinical-feasibility-conversational-diagnostic-ai-primary-care"
date: "2026-03-15"
topic: "ai-in-med"
cardSummary: "100 名真实患者与 AMIE（Gemini 2.5）门诊前对话中实现零安全停止，90% 诊断准确率，患者 AI 态度显著改善，为对话诊断 AI 在真实临床环境中的可行性提供了迄今最强证据。"
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.08448"
alphaxivUrl: "https://alphaxiv.org/abs/2603.08448"
authors:
  - "Marc L. Cohen"
  - "Vivek Natarajan"
  - "Mike Schaekermann"
  - "Alan Karthikesalingam"
  - "et al."
tags:
  - "ai-in-med"
  - "2026"
---

## 第 0 节 — 论文元数据

| 字段 | 内容 |
|---|---|
| 标题 | A prospective clinical feasibility study of a conversational diagnostic AI in an ambulatory primary care clinic |
| 作者与机构 | Marc L. Cohen、Vivek Natarajan、Mike Schaekermann、Alan Karthikesalingam、Adam Rodman（共同领导，Beth Israel Deaconess Medical Center / Google DeepMind / 哈佛医学院等 40+ 研究者） |
| 发表载体 / 状态 | arXiv 预印本，2026 年 3 月 15 日（v3），IRB 批准（BIDMC 2024P000095），临床试验预注册 NCT06911398 |
| 代码 / 数据可用性 | 患者隐私数据不开放；AMIE 系统基于 Gemini 2.5 [paper] |
| 可重复性信号 | 预注册临床试验，全流程有 IRB 监督，评测量表标准化（GMCPQ/PACES/PCCBP）[paper] |

## 第 1 节 — 研究问题与动机

**本文解决的具体问题是什么？**
对话式 AI（AMIE）能否在真实临床环境（学术医疗中心急诊初诊门诊）中安全、有效地完成患者病史采集和诊断讨论，并通过持续医师监督保障安全？

**现有方法为何在此失效？**
此前 AMIE 等对话诊断 AI 均在模拟环境（标准化患者）中评测，缺乏真实患者交互数据，无法评估患者接受度、系统安全性和与实际诊疗流程的整合挑战。[paper]

**为什么这个问题值得解决？**
初级医疗面临全球性人力资源短缺；AI 辅助病史采集可将医师从数据收集转向临床决策，潜在提升医疗效率；同时为 AI 医疗应用的监管路径积累证据。[paper]

## 第 2 节 — 技术方案

**核心贡献（一句话）**: 首个前瞻性单臂可行性研究，在学术医疗中心急诊门诊中让 100 名真实患者与 AMIE（基于 Gemini 2.5 + 思考模式）进行文字对话，在持续医师监督下实现零安全停止。

**方法流程**:
- **AMIE 系统**：Gemini 2.5 + 思考模式，五阶段对话结构（接收、病史采集、诊断验证、评估交付、总结）
- **研究设计**：前瞻性单臂可行性研究，2025 年 4 月-11 月，波士顿 BIDMC
- **安全监督**：持续实时医师观察（视频 + 屏幕共享），四项预设停止标准
- **评测维度**：安全性（停止标准触发）、患者满意度（GATAS 量表）、会话质量（GMCPQ/PACES/PCCBP）、诊断准确性（Bond/Graber 分级）

**真正的新颖点**: 真实患者（非标准化患者）前瞻性研究设计；五阶段结构化对话流程；AI 主任医师监督协议的系统化设计。[paper]

**复杂度分析**: 系统延迟未报告；Gemini 2.5 推理模式计算密集；临床部署需要实时安全监督基础设施。[inferred]

## 第 3 节 — 实验验证

| 指标 | AMIE 结果 | 医师结果 | p 值 |
|---|---|---|---|
| 诊断准确率（top-3 包含最终诊断） | 75% | — | — |
| 最终诊断纳入鉴别诊断 | 90% | — | — |
| 鉴别诊断质量 | — | — | p=0.6（无显著差异） |
| 管理计划适当性 | — | — | p=0.1（无显著差异） |
| 成本效益 | — | — | p=0.004（医师更优） |
| 患者 AI 态度改善 | 显著改善 | — | p&lt;0.001（Friedman 检验） |

**消融实验分析**: 不适用（单臂可行性研究）；质性访谈（20 名患者、10 名医师、5 名 AI 督导）提供丰富补充信息。[paper]

**统计严谨性**: IRB 批准的预注册临床试验；多维度标准化量表；安全停止标准预先定义；样本量（100 名患者）适合可行性研究。[paper]

**潜在混淆因素**: 单臂非随机设计无法控制 Hawthorne 效应；患者选择偏向（年轻、科技熟悉、英语母语）；AMIE 获得医师书面记录（信息优势）；仅文字模态（无实物检查）。[paper]

## 第 4 节 — 批判性评审

**方法层面的隐患**: 无随机对照臂，因果推断受限；"诊断准确性无显著差异"（p=0.6）在 n=100 下统计检验效能不足，可能存在假阴性。[inferred]

**实验层面的问题**: 排除妊娠、心理健康、急诊等高风险病例，使安全结论的适用范围受限；持续医师监督产生 Hawthorne 效应，真实自主部署场景下安全性未知。[paper]

**声明范围**: 论文明确定位为"可行性研究"，避免过度声明 AI 诊断等效性，范围诚实。[paper]

**客观优点**: 研究设计严格（IRB/预注册/盲评/多量表）；质性数据丰富；在真实患者中的零安全停止结果具有重要里程碑意义；患者态度改善数据（p&lt;0.001）说服力强。[paper]

## 第 5 节 — 综合总结

**TL;DR（30 秒摘要）**: 100 名真实患者与 AMIE（Gemini 2.5）的门诊前对话中实现零安全停止，90% 诊断准确率，患者 AI 态度显著改善；AMIE 在诊断质量上与医师无显著差异，但在成本效益和实用性上仍不及医师，研究为对话诊断 AI 的临床可行性提供了迄今最强的真实世界证据。

**创新类型判断**: 临床转化研究（Clinical Translation Study）——AI 技术在真实临床场景中的首次前瞻性评估。[paper]

**部署成熟度**: TRL 6-7（真实环境演示，但仍需监督；距离自主临床部署尚需随机对照试验）。[paper]

**开放问题**: 随机对照试验设计；EHR 集成；多模态输入（语音/视频）；多语言支持；高风险病例（急诊/精神健康）的安全架构。[paper]

**复现注意事项**: 患者数据受 HIPAA 保护不可获取；AMIE 系统基于 Gemini 2.5（Google 内部）；研究协议发布于 ClinicalTrials.gov（NCT06911398）。[paper]
