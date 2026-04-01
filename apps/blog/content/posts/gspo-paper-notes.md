---
title: GSPO Paper Notes
date: 2026-03-31
summary: 对 Group Sequence Policy Optimization 的动机、目标函数和稳定性分析的阅读笔记。
tags:
  - RLHF
  - Paper Notes
  - Optimization
draft: false
language: zh
---

**Group Sequence Policy Optimization**(GSPO, 组序列策略优化), is a stable, efficient, and performant RL algorithm. 
- GSPO defines the *importance ratio based on sequence likelihood* (which aligning with the basic importance sampling)
- and performs *sequence-level clipping, rewarding, and optimization* (by computing the normalized rewards as the advantages of multiple responses to a query). 
- GSPO also notably *stabilizes MoE RL training*.

> GRPO exhibits severe stability issues when training gigantic LMs, resulting in catastrophic and irreversible model collapse. 

## Preliminaries
A response $y$ to query $x$ (in the query set $\mathcal{D}$) from an autoregressive LM (a policy) $\pi_{\theta}$ parameterized by $\theta$, the likelihood under the policy is
$$
\pi_{\theta}(y|x)=\prod_{t=1}^{|y|} \pi_{\theta}(y_{t}|x,y_{<t})
$$
where $|y|$ denotes the <u>number of tokens</u> in $y$. A query-response pair $(x,y)$ can be scored by a verifier $r$, resulting in a reward $r(x,y)\in[0,1]$.

**PPO**
PPO constrains the policy update within a proximal region of the old policy through a clipping mechanism
$$
\mathcal{J}_{\text{PPO}}(\theta)=\mathbb{E}_{x\sim \mathcal{D}, y\sim \pi_{\text{old}}(\cdot|x)}\left[ \frac{1}{|y|} \sum_{t=1}^{|y|}\min\bigg(w_{t}(\theta)\hat{A}_{t}, \text{clip}(w_{t}(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_{t} \bigg)\right]
$$
The importance ratio of the token $y_{t}$ is defined as
$$
w_{t}(\theta)=\frac{\pi_{\theta}(y_{t}|x,y_{<t})}{\pi_{\theta_{\text{old}}}(y_{t}|x,y_{<t})}
$$
the advantage $\hat{A}$ is estimated by another value model, ~={red}which has a similar size to the policy model=~.

**GRPO**
GRPO computes the relative advantage of each response within a group of responses to the same query to change the value model.
$$
\mathcal{J}_{\text{GRPO}}=\mathbb{E}_{x\sim \mathcal{D}, \{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^G\frac{1}{|y_{i}|} \sum_{t=1}^{|y_{i}|}\min\bigg(w_{i,t}(\theta)\hat{A}_{i,t}, \text{clip}(w_{i,t}(\theta), 1-\epsilon, 1+\epsilon)\hat{A}_{i,t} \bigg)\right]
$$
the importance ratio $w_{i,t}(\theta)$ and the advantage $\hat{A}_{i,t}$ of the token $y_{i,t}$ (the $t$-th token of the $i$-th response in the group of $G$)
$$
\begin{align}
w_{i, t}(\theta)&=\frac{\pi_{\theta}(y_{i, t}|x,y_{i, <t})}{\pi_{\theta_{\text{old}}}(y_{i, t}|x,y_{i, <t})} \\
\hat{A}_{i, t}=\hat{A}_{i}&=\frac{r(x,y_{i})-\text{mean}(\{r(x,y_{i})\}_{i=1}^G)}{\text{std}(\{r(x, y_{i})\})_{i=1}^G}
\end{align}
$$

## Motivation
As the growth in model size, sparsity, and response length, it's necessary for a large rollout batch size to maximize hardware utilization during RL. To improve the sample efficiency, it's standard to partition a large batch of rollout into multiple mini-batches for gradient updates. However, this leads to ~={red}an off-policy learning setting=~, where responses $y$ are sampled from an old policy $\pi_{\theta_{\text{old}}}$ rather than the current policy $\pi_{\theta}$ being optimized. The objective of GRPO is ill-posed, which stems from a misapplication of importance sampling weights.   随着模型和输出序列（response）长度变长，强化训练（RL）时需要**更大规模的 rollout batch** 来提高硬件利用率与样本效率。把一个大 batch 拆成若干 mini-batch 来做多次梯度更新，会导致**数据是从旧策略 $\pi_{\theta_{\text{old}}}$​​ 采样**，而在用当前策略 $\pi_{\theta}$​ 优化 —— 这是一个**天然的 off-policy** 问题。PPO/GRPO 里用 clipping 等机制是为了解决这种 off-policy 偏差，而对 GRPO 而言，问题更根本 —— **它的目标（objective）是 ill-posed**，尤其在长序列/长响应任务下会引起方差爆炸与模型崩溃（collapse）。

The principle of [importance sampling](obsidian://open?vault=Notes&file=ANU%2F24S1%2FSML%2FSampling%20Methods) is to estimate the expectation of a function $f$ under a target distribution $\pi_{\text{tar}}$ by re-weighting samples drawn from a behavior distribution $\pi_{\text{beh}}$
$$
\mathbb{E}_{z\sim \pi_{tar}}[f(z)]=\mathbb{E}_{z\sim \pi_{\text{beh}}}\left[ \frac{\pi_{\text{tar}}(z)}{\pi_{\text{beh}}(z)} f(z)\right]
$$
where the $\frac{\pi_{\text{tar}}(z)}{\pi_{\text{beh}}(z)}$ is the importance weight. The IS *relies on averaging over multiples samples ($N\gg 1$)* from the behavior distribution $\pi_{\text{beh}}$ for the importance weight *to effectively correct for the distributional mismatch*. IS 是无偏的估计，而无偏估计往往会有非常大的方差，特别是当权重 $w(z)$ 的分布很重尾（即有少数样本权重很大）时。此时，通过对多个样本取平均（$N >> 1$）可以降低方差，即 **IS 的有效性严重依赖于用来平均的样本数与行为分布与目标分布的接近程度**。

In contrast, GRPO applies the importance weight $\frac{\pi_{\theta}(y_{i, t}|x,y_{i, <t})}{\pi_{\theta_{\text{old}}}(y_{i, t}|x,y_{i, <t})}$ at each token position $y$ and it *fails to perform the intended distribution-correction role* since the weight is based on a single sample $y_{i,t}$ from each next-token distribution $\pi_{\theta_{\text{old}}}(\cdot|x,y_{i,<t})$.  This ~={red}introduces high-variance noise into the training gradients=~, which accumulates over long sequences and is exacerbated by the clipping mechanism, and further leads to irreversible model collapse. 

The failure of the token-level importance weight points to a core principle: **the unit of optimization objective should match the unit of reward**, and the reward is granted to the entire sequence. Thus the importance weight should be performing optimization directly at the **sequence-level**.

GRPO 在每个 token 位置 $t$ 应用了token-level 的重要性权重，并以此来修正梯度／目标（即在 token 级别做 off-policy 校正），这样做的问题是：
1. **单位不匹配（unit mismatch）—— 优化单元 vs. 奖励单元不一致**
	奖励通常是对整个序列（或基于序列的评估）给出的，而 GRPO 在 token 级别做校正。把对序列的单一 reward 分摊或直接与 token-level 修改耦合会产生错误的目标设定——优化“单元”应该与 reward 的单元一致（unit of optimization should match the unit of reward）。
2. **单样本的 token-level 估计方差极大**
	 在 token-level，对于每个 token 只有一个采样 $y_{i,<t}$（下一词分布下的一个样本），用单个样本的比值尝试校正整个分布，这是**高方差且不可靠**的。重要性采样的方差问题在序列长度上累积，会随序列变长而放大。
3. **未能实现真正的分布校正**
	正确的序列权重是完整序列比值的乘积（或以某种方式在序列级别估计）。GRPO 用 token-level 的局部比值代替，**并没有对下一词整个分布做期望化（averaging）**，因此并未实现 intended distribution-correction。
4. **方差累积并被 clipping 放大副作用**
	高方差噪声会在长序列上累积，clipping（PPO/GRPO 常用）虽然抑制极端权重，但在这种高方差情形下会导致不稳定的梯度估计被截断或放大，结合长序列的梯度累积，实证上会触发“不可逆的模型崩溃”。
5. **训练恢复困难（经验观察）**
	一旦模型崩溃，回到早期 checkpoint 并调超参（例如 clipping 范围）常常无效。说明问题并非仅是超参调优能解决，而是目标本身设定有根本问题（ill-posed）。

## Algorithm
The sequence-level importance weight $\frac{\pi_{\theta}(y|x)}{\pi_{\theta_{\text{old}}}(y|x)}$ reflects *how far the response $y$ sampled from $\pi_{\theta_{\text{old}}}(\cdot|x)$ deviates from $\pi_{\theta}(\cdot|x)$*, which *aligns with the sequence-level reward* and serve as a meaningful indicator of the clipping mechanism.

Thus, the Group Sequence Policy Optimization employs the following **sequence-level optimization objective**:
$$
\mathcal{J}_{\text{GSPO}}(\theta)=\mathbb{E}_{x\sim \mathcal{D},\{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^G\min\big(s_{i}(\theta)\hat{A}_{i}, \text{clip}(s_i(\theta),1-\epsilon,1+\epsilon)\hat{A}_{i}\big) \right]
$$
and adopts the **group-based advantage estimation**:
$$
\hat{A}_{i}=\frac{r(x,y_{i})-\text{mean}(\{r(x,y_{i})\}_{i=1}^G)}{\text{std}(\{r(x, y_{i})\})_{i=1}^G}
$$
and defines the **importance ratio** $s_{i}(\theta)$ *based on sequence likelihood*
$$
s_{i}(\theta)=\left( \frac{\pi_{\theta}(y_{i}|x)}{\pi_{\theta_{\text{old}}}(y_{i}|x)} \right)^{1/|y_{i}|}=\exp\left( \frac{1}{{|y_{i}|}}\sum_{t=1}^{|y_{i}|}\log \frac{\pi_{\theta}(y_{i,t}|x,y_{i,<t})}{\pi_{\theta_{\text{old}}}(y_{i,t}|x,y_{i,<t})} \right)
$$

GSPO applies clipping to **entire responses** to exclude the overly off-policy samples form gradient estimation, which *matches both the sequence-level rewarding and optimization*.

GSPO adopts *length normalization* in $s_{i}(\theta)$ to reduce the variance and to control $s_{i}(\theta)$ within a unified numerical range. 

Otherwise, *the likelihood changes of a few tokens* can result in ~={red}dramatic fluctuations of the sequence-level importance ratio=~, and the importance ratios of responses with *different lengths will require varying clipping ranges*. 

### Gradient Analysis
The gradient of the GSPO objective is (clipping is omitted):
$$
\begin{align}
\nabla_{\theta}\mathcal{J}_{\text{GSPO}}&=\nabla_{\theta}\mathbb{E}_{x\sim \mathcal{D}, \{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^Gs_{i}(\theta)\hat{A}_{i} \right] \\
&=\mathbb{E}_{x\sim \mathcal{D}, \{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^Gs_{i}(\theta)\hat{A}_{i} \cdot \nabla_{\theta} \log s_{i}(\theta)\right] \\
&=\mathbb{E}_{x\sim\mathcal{D}, \{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^G\left( \frac{\pi_{\theta}(y_{i}|x)}{\pi_{\theta_{\text{old}}}(y_{i}|x)} \right)^{1/|y_{i}|}\hat{A}_{i}\cdot \frac{1}{|y_{i}|}\sum_{t=1}^{|y_{i}|}\nabla_{\theta}\log \pi_{\theta}(y_{i, t}|x, y_{i,<t}) \right]
\end{align}
$$

Thus, the difference between GSPO and GRPO is *how they weight the gradient of the log likelihoods of the tokens*. 
- GRPO, weights according to the respective importance weight, which varies differently and are not negligible, and accumulates
- GSPO, **weights all the tokens in a response equally**, eliminating the instability of  GRPO.

### GSPO-token
A token-level objective variant for scenarios like multi-turn RL, that desire a *finer-grained advantage adjustment*
$$
\mathcal{J}_{\text{token}}(\theta)=\mathbb{E}_{x\sim\mathcal{D}, \{y_{i}\}_{i=1}^G\sim \pi_{\theta_{\text{old}}}(\cdot|x)}\left[ \frac{1}{G}\sum_{i=1}^G \frac{1}{|y_{i}|}\sum_{t=1}^{|y_{i}|}\min\left(s_{i,t}(\theta)\hat{A}_{i, t}, \text{clip}(s_{i,t}(\theta), 1-\epsilon,1+\epsilon)\hat{A}_{i,t}\right) \right]
$$
where (this term has a numerical value of 1, making $s_{i, t}(\theta)=s_{i}(\theta)$)
$$
s_{i,t}(\theta)=\text{sg}[s_{i}(\theta)]\cdot \frac{\pi_{\theta(y_{i,t}|x, y_{i, <t})}}{\text{sg}[\pi_{\theta(y_{i,t}|x, y_{i, <t})}]}
$$
and $\text{sg}[\cdot]$ is *only taking the numerical value but stopping the gradient* (`detach`).

The gradient is:
$$
\begin{align}
\nabla_\theta J_{\text{GSPO-token}}(\theta) 
&= \nabla_\theta \, \mathbb{E}_{x \sim \mathcal{D}, \{y_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(\cdot|x)} 
\left[ \frac{1}{G} \sum_{i=1}^G \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} s_{i,t}(\theta) \, \hat{A}_{i,t} \right] \\[8pt]
&= \mathbb{E}_{x \sim \mathcal{D}, \{y_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(\cdot|x)} 
\left[ \frac{1}{G} \sum_{i=1}^G s_i(\theta) \cdot \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} 
\hat{A}_{i,t} \frac{\nabla_\theta \pi_\theta(y_{i,t} \mid x, y_{i,<t})}{\pi_\theta(y_{i,t} \mid x, y_{i,<t})} \right]\\[8pt]
&= \mathbb{E}_{x \sim \mathcal{D}, \{y_i\}_{i=1}^G \sim \pi_{\theta_{\text{old}}}(\cdot|x)} 
\left[ \frac{1}{G} \sum_{i=1}^G \left( \frac{\pi_\theta(y_i|x)}{\pi_{\theta_{\text{old}}}(y_i|x)} \right)^{\tfrac{1}{|y_i|}} 
\cdot \frac{1}{|y_i|} \sum_{t=1}^{|y_i|} \hat{A}_{i,t} \nabla_\theta \log \pi_\theta(y_{i,t} \mid x, y_{i,<t}) \right]
\end{align}
$$

## Discussion
GSPO can deliver *continuous performance improvement* through increasing the training compute, regularly updating the query set, and extending the generation length.

A key distinction of GSPO compared to GRPO is the **clipping entire response** rather than individual tokens, and *clipping a much larger fraction of tokens leads to superior training efficiency*.

### Benefit of MoE Training
The sparse activation nature of MoE introduces unique stability challenges, the ~={red}experts activated for the same response can change significantly between gradient updates=~. Thus the importance ratio of token level fluctuate drastically. 

**Routing Replay**
*Cache the activated experts in $\pi_{\theta_{\text{old}}}$ and replay these routing models in $\pi_{\theta}$ when computing the importance ratios* $w_{i,t}(\theta)$, making each token $y_{i, t}$, $\pi_{\theta}(y_{i,t}|x,y_{<t})$, $\pi_{\theta_{\text{old}}}(y_{i,t}|x, y_{<t})$ share the same activated network.

Routing Replay 的做法是缓存旧策略下激活的 experts，并在新策略下 **回放这些路由模式(replay routing modes)** ，从而恢复 token-level 比值的稳定性，保证 GRPO 能在 MoE 上收敛。但代价是额外的**内存 & 通信开销**（要存/传 routing 信息），并且通过「固定/重用路由」会限制 MoE 的实际容量与灵活性（不能充分利用模型潜能）。

**GSPO** resolves the expert-activation volatility issue in MoE models
*GSPO focuses only on the sequence likelihood $\pi_{\theta}(y_{i}|x)$* and is *not sensitive to the individual token likelihood $\pi_{\theta}(y_{i,t}|x,y_{i,<t})$*. 

GSPO 计算并使用序列级的比值 $s_i(\theta)$（即基于整条序列的似然），不去敏感地依赖每个 token 的单次采样概率。尽管 token 激活可能在局部剧变，但 **MoE 模型在整体语言建模能力上是稳定的** —— *即序列级的 likelihood 不会像 token-level 那样剧烈波动*。把重要性校正放在序列级，能减小由单 token 激活变动带来的高方差噪声，从而更稳定地优化序列级目标。

GSPO can *directly use the likelihoods returned by the inference engine for optimization*, avoiding the need for recomputation with the training engine.
