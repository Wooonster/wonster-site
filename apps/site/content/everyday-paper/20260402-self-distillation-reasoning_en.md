---
title: "Why Does Self-Distillation (Sometimes) Degrade the Reasoning Capability of LLMs?"
slug: "why-self-distillation-sometimes-degrades-llm-reasoning"
date: "2026-04-02"
topic: "reasoning"
cardSummary: "The paper shows that overly information-rich self-distillation suppresses epistemic verbalization, shortening math reasoning traces while hurting OOD accuracy, and clarifies when self-distillation helps versus fails."
source: "arXiv"
arxivUrl: "https://arxiv.org/abs/2603.24472"
alphaxivUrl: "https://alphaxiv.org/abs/2603.24472"
authors:
  - "Jeonghye Kim"
  - "Xufang Luo"
  - "Minbeom Kim"
  - "Sangmook Lee"
  - "et al."
tags:
  - "reasoning"
  - "2026"
---
# Paper Analysis: Why Does Self-Distillation (Sometimes) Degrade the Reasoning Capability of LLMs?

---

## Section 0 — Metadata

| Field | Value |
|---|---|
| Title | Why Does Self-Distillation (Sometimes) Degrade the Reasoning Capability of LLMs? |
| Authors & affiliations | Jeonghye Kim, Minbeom Kim, Sangmook Lee, Dohyung Kim, Jiwon Jeon (KAIST / Seoul National University); Xufang Luo, Dongsheng Li, Yuqing Yang (Microsoft Research) |
| Venue / status | arXiv preprint (submitted March 25, 2026), not yet peer-reviewed |
| Code / data available | GitHub repo available (36 stars at submission); URL not confirmed |
| Reproducibility signals | Models named (DeepSeek-R1-Distill-Qwen-7B, Qwen3-8B, OLMo-3-7B-Instruct); dataset specified (DAPO-Math-17k); evaluation benchmarks specified (AIME24/25, AMC23, MATH500); training details partial; no random seeds reported |

---

## Section 1 — Problem and Motivation

**What specific problem does this paper address?**
Self-distillation — post-training where the same model acts as both teacher (conditioned on ground-truth solutions) and student (unconditioned) via KL-divergence minimization on next-token distributions — consistently reduces response length in math reasoning tasks, yet paradoxically *degrades* mathematical reasoning performance despite training only on correct trajectories. The paper seeks a mechanistic explanation for this failure mode and identifies its boundary conditions.

Formally: given a model $\pi_0$, teacher conditioning $c \in \{\emptyset, s, s\setminus \text{think}, \tilde{y}\}$, and student objective $L_{\mathrm{KL}}(\pi_\theta \,\|\, \pi_{\text{teacher}}(\cdot \mid c))$, why does richer $c$ degrade out-of-distribution reasoning accuracy even when teacher outputs have high answer correctness?

**Why do existing methods fail here?**
Standard self-distillation works by matching student to teacher distributions. When teacher conditioning is rich (full solution s), the teacher produces confident, concise outputs with near-zero uncertainty expressions. The student, trained to match these distributions, learns to suppress "epistemic verbalization" — tokens like "wait," "hmm," "let me reconsider" that maintain multiple hypothesis pathways [paper]. Prior distillation work in chemistry and coding domains does not encounter this failure because those domains have repetitive task types where epistemic expressions are unnecessary; mathematical reasoning requires OOD generalization across compositionally diverse problem types where uncertainty maintenance is critical [paper, inferred].

**Why does this problem matter?**
Self-distillation is widely used as an efficient post-training technique because it avoids the cost of external teacher models. If it systematically degrades mathematical reasoning — the most widely benchmarked capability for frontier models — then practitioners applying it to math-capable models risk catastrophic performance loss (up to 40 pp on AIME24 documented in the paper [paper]). The paper's finding that correct trajectories alone are insufficient for robust reasoning challenges a foundational assumption of behavior cloning.

---

## Section 2 — Technical Method

**Core contribution:** This paper identifies "epistemic verbalization suppression" as the mechanism by which information-rich self-distillation conditioning degrades OOD mathematical reasoning, and demonstrates that this suppression is governed by two factors — teacher information richness and task diversity — providing a principled account of when self-distillation works vs. fails.

**Pipeline (analytical/empirical, not a new training method):**

*Step 1 — Controlled conditioning experiment (Section 3):*
- Four conditioning contexts evaluated: c = ∅, c = s (full solution), c = s\think (solution excluding thinking), c = ỹ (regenerated response)
- Each condition: generate 100 teacher outputs from DeepSeek-R1-Distill-Qwen-7B; measure answer score, response length, epistemic token count
- Epistemic verbalization operationalized as frequency of tokens like "wait," "hmm," "let me reconsider"

*Step 2 — SFT ablation (Section 4):*
- Construct two 800-sample datasets: 𝒟_ug (unguided, ~12k tokens/response, high epistemic markers) and 𝒟_sg (solution-guided, ~2k tokens/response, suppressed epistemic markers)
- Fine-tune on each; evaluate on AIME24/25, AMC23, MATH500

*Step 3 — On-policy self-distillation (SDPO) experiments (Section 5):*
- Compare GRPO vs. SDPO (self-distillation policy optimization) across three models: DeepSeek-R1-Distill-Qwen-7B, Qwen3-8B (thinking ON/OFF), OLMo-3-7B-Instruct
- Ablate EMA rate (0.0 vs. 0.05) and top-k (100 vs. 256)

*Step 4 — Task coverage analysis (Section 6):*
- Compare self-distillation across three domains with different OOD/task-type structure: ScienceQ&A (chemistry, 90% overlap), LiveCodeBench v6 (coding, 100% overlap), DAPO-Math-17k (math, non-overlapping OOD)
- Vary dataset size $|\mathcal{D}| \in \{1, 8, 64, 128, 512\}$ to study coverage effect

**What's actually new:** The paper's key conceptual contribution is naming and isolating "epistemic verbalization" as a mechanistic variable. Prior work observed length reduction with self-distillation but attributed it to efficiency gains; this paper demonstrates that length reduction is a symptom of epistemic suppression and that this suppression specifically harms OOD performance. The two-factor model (information richness × task diversity) is new [paper].

**Complexity:**
- Training: identical to standard GRPO/SDPO — O(batch × seq_len²) for attention [inferred]
- No additional inference cost [inferred]
- The analytical framework is the contribution; no new training algorithm proposed

---

## Section 3 — Experimental Evidence

**Main results — SFT ablation (Section 4, Table 2):**

| Benchmark | Base | SFT on 𝒟_ug (unguided) | SFT on 𝒟_sg (solution-guided) | Δ (guided vs. base) |
|---|---|---|---|---|
| AIME24 | 54.79% [paper] | 51.04% [paper] | 20.21% [paper] | −34.58 |
| AIME25 | 37.92% [paper] | 40.00% [paper] | 12.71% [paper] | −25.21 |
| AMC23 | 89.06% [paper] | 87.66% [paper] | 57.03% [paper] | −32.03 |
| MATH500 | 92.19% [paper] | 90.93% [paper] | 65.52% [paper] | −26.67 |

**Main results — SDPO vs. GRPO (Section 5, OOD evaluation):**

| Model | Benchmark | Base | GRPO | SDPO | Δ (SDPO vs. GRPO) |
|---|---|---|---|---|---|
| DeepSeek-R1-Distill-Qwen-7B | AIME24 | 54.7% [paper] | 56.0% [paper] | ~15% [paper] | −41 |
| DeepSeek-R1-Distill-Qwen-7B | AMC23 | 89.3% [paper] | 91.1% [paper] | ~75% [paper] | −16 |
| Qwen3-8B (thinking ON) | AIME24 | — | stable [paper] | deteriorates [paper] | significant [paper] |

**Ablation findings:**
Key ablation (Table 2): training exclusively on correct solution-guided trajectories (𝒟_sg) causes catastrophic degradation despite 0% training error rate. This directly isolates epistemic suppression as the cause — not answer incorrectness. Fixed teacher (EMA=0.0) consistently outperforms moving teacher (EMA=0.05) by avoiding feedback-loop amplification [paper]. Top-k variation (100 vs. 256) has no significant effect [paper].

**Statistical rigor:**
- No confidence intervals or standard deviations on any result [paper].
- No multiple seeds reported [paper].
- Section 3 uses 100 problems for controlled experiment — small but clearly specified.
- SDPO curves are presented as training dynamics figures rather than point estimates; variance across seeds unknown.

**Potential confounds:**
- The controlled conditioning experiment (Section 3) uses 100 carefully selected problems. If these are not representative of AIME/AMC distribution, the epistemic token count correlation may not generalize [inferred].
- "Epistemic verbalization" is measured by token frequency but not validated against human labeling of genuine uncertainty expression vs. stylistic tokens [inferred].
- SDPO training uses DAPO-Math-17k; GRPO baseline presumably uses the same data. If hyperparameters (learning rate, batch size) are tuned differently for GRPO vs. SDPO, comparisons are asymmetric [paper omits hyperparameter matching details].

---

## Section 4 — Critical Assessment

**Methodological concern: operationalization of epistemic verbalization** [inferred, moderate]
"Epistemic verbalization" is measured as frequency of specific tokens ("wait," "hmm," "let me reconsider"). This is a proxy measure. The paper does not validate that these tokens correspond to functionally distinct reasoning behavior vs. learned stylistic patterns. A model could suppress these tokens while maintaining equivalent hypothesis branching through different linguistic patterns.

**Methodological concern: SDPO degradation may reflect hyperparameter sensitivity** [inferred, moderate]
The paper reports SDPO underperforms GRPO across models, but does not show hyperparameter sweeps for SDPO. Self-distillation objectives may require different learning rates or KL weights than GRPO. The "degradation" may partially reflect suboptimal hyperparameter transfer from GRPO to SDPO.

**Experimental concern: small sample for Section 3** [paper-evident, minor]
The controlled conditioning experiment uses 100 problems — sufficient for the directional finding but not for precise effect size estimation. The epistemic token counts (182.5 vs. 8.8 for unguided vs. solution-guided) are striking but lack variance reporting.

**Claim scope: "epistemic verbalization suppression" as the mechanism** [inferred, moderate]
The paper establishes correlation between epistemic token suppression and OOD degradation across multiple conditions and models. This is strong evidence. However, "suppression" as a mechanism implies the model cannot express uncertainty when needed, rather than simply choosing not to. The distinction matters for interventions: if it's a preference, prompting might restore it; if it's a capability loss, retraining is required.

**Honest strengths:**
- The core empirical finding — correct trajectories alone can catastrophically degrade OOD performance — is surprising, clearly demonstrated, and practically important. This challenges the foundational assumption of behavior cloning.
- The two-factor account (information richness × task diversity) elegantly unifies when self-distillation works (chemistry, coding) vs. fails (diverse math), and is confirmed by the cross-domain analysis in Section 6.
- The fixed vs. moving teacher ablation (Figure 9) is a clean and actionable finding for practitioners.
- Three distinct model families (DeepSeek, Qwen3, OLMo) strengthen the generality claim.

---

## Section 5 — Synthesis

**TL;DR:** Self-distillation degrades mathematical reasoning OOD performance by suppressing epistemic verbalization tokens — not because it trains on incorrect outputs, but because rich teacher conditioning produces confident, uncertainty-free trajectories that the student learns to mimic. Performance drops up to 40 pp on AIME24 are demonstrated across three model families; the failure is specific to high-diversity OOD tasks and does not occur in repetitive domains. The main open question is whether "epistemic verbalization" is a valid proxy for the underlying reasoning mechanism.

**Innovation classification:** *Method advance* — this paper provides a mechanistic explanation for a known empirical phenomenon (self-distillation sometimes hurts math) within the established self-distillation framework, rather than proposing a new training method.

**Deployment readiness:** Directly actionable: (1) avoid solution-conditioned self-distillation for math-capable models unless task distribution is known to be narrow and repetitive; (2) use fixed teachers (EMA=0.0) if applying SDPO. The paper's findings should inform any practitioner applying self-distillation to reasoning models.

**Open problems:**
1. Is epistemic verbalization functionally necessary for OOD reasoning, or is it correlated with some underlying mechanism (e.g., exploration depth, hypothesis tree branching) that is the true driver? Probing experiments could distinguish these.
2. Can the performance loss be recovered by post-hoc fine-tuning that reintroduces epistemic expressions, or is it a structural capability degradation?
3. Does the same degradation occur with cross-model distillation (teacher ≠ student), or is it specific to self-distillation's unique feedback loop?

**Reproduction gotchas:**
- SDPO and GRPO training require careful hyperparameter matching; the paper does not fully specify whether learning rates are identical across both methods.
- Epistemic token counting requires a predefined vocabulary of uncertainty markers; the exact list is not provided in the abstract page.
- DAPO-Math-17k dataset availability should be verified; some prior math datasets have license restrictions.
- Performance on AIME24/25 is highly variable across runs due to small problem count; multiple seeds are needed to confirm the magnitude of degradation reported.
