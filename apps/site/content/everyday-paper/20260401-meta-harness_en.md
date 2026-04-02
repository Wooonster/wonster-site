---
title: "Meta-Harness: End-to-End Optimization of Model Harnesses"
slug: "meta-harness-end-to-end-optimization-model-harnesses"
date: "2026-04-01"
topic: "harness"
cardSummary: "Meta-Harness lets an agentic proposer inspect prior code, execution traces, and scores directly, enabling automated harness search without compressed feedback bottlenecks and beating most hand-designed baselines on TerminalBench-2."
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.28052"
alphaxivUrl: "https://alphaxiv.org/abs/2603.28052"
authors:
  - "Yoonho Lee"
  - "Roshen Nair"
  - "Qizheng Zhang"
  - "Kangwook Lee"
  - "et al."
tags:
  - "harness"
  - "2026"
---
# Paper Analysis: Meta-Harness — End-to-End Optimization of Model Harnesses

---

## Section 0 — Metadata

| Field | Value |
|---|---|
| Title | Meta-Harness: End-to-End Optimization of Model Harnesses |
| Authors & affiliations | Yoonho Lee, Roshen Nair, Qizheng Zhang (Stanford); Kangwook Lee (KRAFTON); Omar Khattab (MIT); Chelsea Finn (Stanford) |
| Venue / status | arXiv preprint (submitted March 30, 2026), not yet peer-reviewed |
| Code / data available | GitHub repo available (53 stars at submission time); URL not confirmed in paper |
| Reproducibility signals | No random seeds reported; no confidence intervals on main results; compute details partially provided (NVIDIA hardware implied by Claude Code usage); no dataset split details beyond "decontaminated" claim for math corpus |

---

## Section 1 — Problem and Motivation

**What specific problem does this paper address?**
Given a frozen LLM $M$ and a task distribution $\mathcal{X}$, the problem is finding an optimal harness $H^*$ — an executable Python program that governs what information the model stores, retrieves, and receives — to maximize expected reward: $H^* = \arg\max_H \mathbb{E}[r(\tau, x)]$. Current harness design is manual, labor-intensive, and produces large performance variance (up to 6× gaps between harnesses on the same model). The paper seeks automated, end-to-end harness search.

**Why do existing methods fail here?**
Prior text optimizers (GEPA, OpenEvolve, TTT-Discover, Best-of-N) are poorly matched to this search space because they severely compress feedback [paper]: some condition only on current candidates, others on scalar scores or short summaries. The paper shows that harness diagnostics require up to 10,000,000 tokens of execution trace information per iteration — far beyond what these pipelines can transmit. Table 3 demonstrates this conclusively: giving the proposer only scores yields 34.6% median accuracy vs. 50.0% with full trace access [paper].

**Why does this problem matter?**
Harness engineering is currently the single largest lever practitioners have over LLM system performance, yet it remains entirely artisanal. Automating it could remove the human bottleneck from a step that demonstrably moves benchmarks by 6× [paper]. The paper's TerminalBench-2 results show an automatically discovered harness (rank #2 publicly) outperforming most hand-engineered entries, making the practical relevance concrete.

---

## Section 2 — Technical Method

**Core contribution:** This paper proposes Meta-Harness, which gives an agentic proposer (Claude Code with Opus 4.6) unrestricted filesystem access to all prior candidate code, execution traces, and scores, enabling causal hypothesis formation about failures that prior compressed-feedback optimizers cannot support.

**Pipeline:**
- *Initialization:* A population of harnesses (zero-shot, few-shot, and hand-crafted baselines) is evaluated and stored in a filesystem 𝒟 alongside their execution traces and scores.
- *Proposal:* A coding agent (Claude Code) queries 𝒟 via standard tools (grep, cat), reads source code (41% of reads), execution traces (40%), and score summaries (6%), then proposes k new harnesses.
- *Evaluation:* Proposed harnesses are executed, interface-compliance-validated, and their results stored back to 𝒟.
- *Iteration:* The loop runs for ~20 iterations (~60 total harness evaluations per domain).
- Training/inference gap: None — the harness is code that wraps inference; there is no gradient-based training.

**What's actually new:** Prior optimizers treat optimization as a text-in/text-out problem, forcing all feedback through a narrow summarization bottleneck. Meta-Harness abandons the summarization assumption entirely: instead of compressing 10M tokens into a prompt, it stores them as files and lets the proposer selectively retrieve what it needs. The key insight is that diagnostic information for code optimization is inherently sparse — you need the specific trace where the harness failed, not an average summary.

**Complexity:**
- Each iteration: O(k × n_eval) harness evaluations where n_eval is the number of held-out examples [inferred]
- Filesystem storage grows linearly with iterations and trace size [inferred]
- Proposer itself (Claude Code Opus 4.6) runs unconstrained agentic sessions; no formal complexity bound given [paper omits this]

---

## Section 3 — Experimental Evidence

**Main results:**

| Dataset | Metric | Prior SOTA | This paper | Δ |
|---|---|---|---|---|
| Text classification (3-dataset avg, search set) | Accuracy | ACE: 40.9% | 48.6% | +7.7 [paper] |
| Text classification (3-dataset avg, search set) | Context tokens | ACE: 50.8K | 11.4K | −4.4× [paper] |
| Text classification vs. text optimizers (median) | Accuracy | OpenEvolve: 39.1% | 50.0% | +10.9 [paper] |
| Text classification (9-dataset OOD avg) | Accuracy | ACE: 70.2% | 73.1% | +2.9 [paper] |
| IMO-level math (5-model avg, 200 problems) | Pass@1 | BM25: 37.5% | 38.8% | +1.3 [paper] |
| TerminalBench-2 (Opus 4.6) | Pass rate | Terminus-KIRA: 74.7% | 76.4% | +1.7 [paper] |
| TerminalBench-2 (Haiku 4.5) | Pass rate | Terminus-KIRA: 33.7% | 37.6% | +3.9 [paper] |

**Ablation findings:**
Table 3 (text classification) is the paper's strongest ablation. Switching from full trace access to "scores only" drops median accuracy from 50.0% to 34.6%, and from "scores + summary" to 34.9% — nearly identical. The message is clear: summaries provide zero marginal benefit over raw scores; the entire gain comes from raw trace access. [paper]

**Statistical rigor:**
- No confidence intervals or standard deviations on main results [paper]
- No reporting of random seeds or number of independent runs
- No significance tests
- This is a significant quality gap. Results reflect single search runs; we cannot assess variance across independent trials.

**Potential confounds:**
- **TerminalBench-2**: The paper searches and evaluates on the same 89-task benchmark [paper]. This is explicitly framed as following the "discovery problem" paradigm for public leaderboards, but it means overfit risk is nonzero and the +1.7% / +3.9% gains over Terminus-KIRA are measured in-sample.
- **Math baseline selection**: BM25 (the closest comparison) uses fixed retrieval without domain-aware routing; the discovered harness uses a four-route domain-specific router. The comparison is not methodologically symmetric.
- **Proposer dependence**: The proposer is Claude Code Opus 4.6 — both the optimizer and a principal backbone in evaluated harnesses. Anthropic's model is thus doubly advantaged (as optimizer and as target), which is not controlled for.

---

## Section 4 — Critical Assessment

**Methodological concern: proposer-model entanglement** [inferred, moderate]
Claude Code (Opus 4.6) is the proposer. The TerminalBench-2 discovered harness injects an environment bootstrap into Claude Code's own context. The proposer, knowing Claude Code's behavior intimately (being the same model), may be implicitly exploiting self-knowledge. Generalization to non-Claude base models is partially tested in the math section but not in agentic coding.

**Experimental concern: single-run results without variance** [paper-evident, moderate]
All main results represent single search trajectories. A 7.7-point gain on text classification (50 total iterations) could plausibly vary by ±5 points across seeds. Without replications, it is impossible to determine whether Meta-Harness is reliably better or whether the reported gains reflect favorable initialization.

**Experimental concern: TerminalBench-2 in-sample evaluation** [paper-evident, moderate]
The search and the final reported score use the same 89 tasks. The paper defends this as standard practice for the leaderboard, but it means the "automated harness" is specifically optimized for that task set, while hand-designed competitors (Terminus-KIRA, ForgeCode) were presumably not.

**Claim scope: efficiency framing needs qualification** [inferred, minor]
The paper claims "4.4× fewer context tokens" than ACE. This is per task-step, not per search run. A single Meta-Harness search consumes massive compute (Claude Code Opus 4.6 running 20+ iterations with millions of tokens per iteration). The efficiency claim applies to the resulting harness at inference time, not to the search cost itself.

**Honest strengths:**
- The ablation (Table 3) is clean and decisive — the information bottleneck hypothesis is tested directly and the result is unambiguous.
- The qualitative trace analysis (Appendix A.2) showing the proposer forming and revising causal hypotheses is genuinely compelling and unusual in the optimization literature.
- OOD evaluation on 9 unseen text classification datasets (Table 5) confirms the discovered harness transfers, addressing the most obvious critique of benchmark overfitting.

---

## Section 5 — Synthesis

**TL;DR:** Meta-Harness automates harness engineering by giving a coding agent (Claude Code) full filesystem access to all prior search history — code, traces, and scores — rather than compressed summaries. It achieves 7.7-point gains on text classification over the best hand-designed baseline while using 4× fewer tokens, and produces the #2 automated result on TerminalBench-2. The key caveat is that all results are single runs without variance reporting, and the proposer is the same model family as the evaluated base.

**Innovation classification:** *Method advance* — the search space (harness code) is not new, and coding agents as optimizers exist, but giving the proposer raw filesystem access rather than compressed summaries is a meaningful architectural choice with strong empirical support.

**Deployment readiness:** The discovered harnesses are readable Python code and immediately deployable. The search process itself requires substantial API budget (Claude Code Opus 4.6 × 20+ iterations × millions of tokens). Appropriate for teams with infrastructure to run extended agentic evaluations; not suitable for one-shot use.

**Open problems:**
1. How stable are discovered harnesses across random seeds? Variance quantification is essential before trusting search results for production use.
2. Can the search generalize across base model families — i.e., does a harness discovered for Opus 4.6 transfer to Gemini or GPT without re-searching?
3. Can Meta-Harness jointly optimize harness code and model-specific prompts, or does the search space become too large?

**Reproduction gotchas:**
- Requires access to Claude Code with Opus 4.6 and "max reasoning" enabled — not cheap or universally accessible.
- The math corpus decontamination procedure is described qualitatively but not reproducible without the exact 500K-problem corpus.
- TerminalBench-2 environment setup (89-task sandbox) adds significant infrastructure overhead.
- No random seeds reported; reproduction would need to rerun from scratch with unpredictable variance.
