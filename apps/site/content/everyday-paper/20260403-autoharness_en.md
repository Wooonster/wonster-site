---
title: "AutoHarness: Improving LLM Agents by Automatically Synthesizing a Code Harness"
slug: "autoharness-improving-llm-agents-automatically-synthesizing-code-harness"
date: "2026-04-03"
topic: "harness"
cardSummary: "AutoHarness uses Gemini-2.5-Flash to synthesize code harnesses through environment-feedback-guided tree search, eliminating illegal actions across 145 TextArena games and letting a smaller model beat larger vanilla baselines."
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
# Paper Analysis: AutoHarness — Improving LLM Agents by Automatically Synthesizing a Code Harness

---

## Section 0 — Metadata

| Field | Value |
|---|---|
| Title | AutoHarness: Improving LLM Agents by Automatically Synthesizing a Code Harness |
| Authors & affiliations | Xinghua Lou, Miguel Lázaro-Gredilla, Antoine Dedieu, Carter Wendelken, Wolfgang Lehrach, Kevin P. Murphy — all at Google DeepMind |
| Venue / status | arXiv preprint (arXiv:2603.03329), submitted February 10, 2026, not yet peer-reviewed |
| Code / data available | No code repository mentioned in the paper; TextArena is a public third-party benchmark |
| Reproducibility signals | Training setup described (10 parallel environments, 1000 steps, 20 matches per game, 10 random seeds for legal-action testing); no confidence intervals or significance tests reported; compute specs omitted |

---

## Section 1 — Problem and Motivation

### 1. What specific problem does this paper address?

When LLM agents are deployed in rule-constrained environments (for example board games or text games), they frequently attempt actions that violate hard environmental constraints — **illegal actions**. This is distinct from strategic suboptimality: the model may "understand" the game yet still emit syntactically or semantically invalid moves. The paper frames this as the **action applicability problem**: given a state $s_t$, determine the legal action set $\mathcal{A}_{\text{legal}}(s_t) \subseteq \mathcal{A}$ and ensure the agent only proposes $a \in \mathcal{A}_{\text{legal}}(s_t)$. The goal is to solve this automatically, without manual harness engineering and without fine-tuning the LLM.

### 2. Why do existing methods fail here?

- **Prompt-only methods** (chain-of-thought, tree-of-thoughts) rely on the LLM's internal world model, which hallucinates valid transitions `[paper]`. In the Kaggle GameArena chess competition, 78% of Gemini-2.5-Flash losses were due to illegal moves despite the model "understanding" chess `[paper]`.
- **Fine-tuning** on game trajectories is expensive, slow, and degrades general instruction-following capability `[paper]`.
- **Hand-coded harnesses** require domain expertise for every new game, are brittle, and do not scale `[paper]`.
- **Code-world-model generation** (generating the full environment transition function in code) is unnecessarily complex and still fails to leverage the LLM's strategic reasoning ability `[paper]`.

### 3. Why does this problem matter?

Rule violations are a hard failure mode: in competitive settings they lead to automatic loss regardless of strategic quality. More broadly, any deployment of LLM agents in structured environments — robotics, tool use, API calls with constrained schemas — faces the same legality gap. The paper's claim that a *smaller* model with a synthesized harness can outperform a *larger* vanilla model has real cost implications for production AI systems `[paper; the broader generalization beyond games is an inference]`.

---

## Section 2 — Technical Method

### Core Contribution

This paper proposes **AutoHarness**, a framework that uses an LLM (Gemini-2.5-Flash) to automatically synthesize a Python code harness via environment-feedback-guided tree search, enabling complete elimination of illegal actions across 145 text games. Prompt engineering alone cannot achieve this because the model's internal action-legality model is unreliable.

### Pipeline

**Harness synthesis (training phase):**

1. **Initialization**: The LLM is given a game description and a harness template with two function stubs:
   - `is_legal_action(state, action) -> bool` — action verifier
   - `propose_action(state) -> action` — action proposer (for harness-as-policy mode)

2. **Tree search with Thompson sampling**: Multiple harness code hypotheses are maintained in a tree. The heuristic value for each node is the **legal action success rate**. Thompson sampling selects which node to refine next, balancing exploration (new logic) vs. exploitation (repairing a partially working harness) `[paper]`.

3. **Rollout**: 10 parallel environments run for up to 1000 steps. A rollout terminates on an illegal move or code execution failure.

4. **Critic**: Collects up to 5 failed steps with error messages.

5. **Refiner (LLM as mutation operator)**: The base LLM receives the failing code and error feedback, then proposes an updated harness. If `is_legal_action()` returns True but the action is invalid, both functions are refined; if it returns False and the action is invalid, only `propose_action()` is refined `[paper]`.

6. **Termination**: Training stops when legal action rate reaches 1.0 or a timeout is hit.

**Three harness modes (at test time):**

| Mode | Mechanism | LLM at inference? |
|---|---|---|
| harness-as-action-filter | Code generates a legal move *set*; LLM ranks | Yes |
| harness-as-action-verifier | LLM proposes; code verifies; re-prompt if illegal | Yes |
| harness-as-policy | Code proposes the action directly (no LLM needed) | **No** |

The paper focuses mainly on **harness-as-action-verifier**, with preliminary results for harness-as-policy.

**Training objective (harness-as-action-verifier):**

$$
H = \text{legal action success rate} \in [0, 1]
$$
