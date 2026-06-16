---
title: "SFT Variants: From SFT to DFT to ASFT"
date: 2026-06-05
summary: 从交叉熵、重要性采样和 RWR 下界出发，解释为什么 DFT 是概率加权的 SFT，为什么它会漂移，以及 ASFT 如何用 forward KL 锚定这条路线。
tags:
  - LLM Post-Training
  - SFT
  - DFT
  - ASFT
draft: false
featured: true
language: zh
---

SFT、DFT、ASFT 可以被精确地看作同一个问题的三种取舍：在只有正样本示范 $\mathcal{D}^+$ 的条件下，最大化 RL 目标

$$
J(\theta)=\mathbb{E}_{\tau \sim \pi_\theta}[R(\tau)]
$$

的一个可训练下界。SFT 选择固定辅助分布 $q=\pi_{\mathrm{ref}}$，稳定但下界松；DFT 选择 $q \propto \pi_{\mathrm{ref}}\operatorname{sg}[p_\theta]$，下界更紧但会向高概率轨迹自激漂移；ASFT 保留 DFT 的重加权，同时加入 $D_{\mathrm{KL}}(\pi_{\mathrm{base}}\Vert \pi_\theta)$，把「更紧」约束在 base model 的信任域内。

本文的主线很短：SFT 是均匀模仿，DFT 是概率加权模仿，ASFT 是概率加权模仿加分布锚定。

## 1 · Introduction: 后训练的核心矛盾

SFT 是 LLM 后训练中最常用的起点：给定 prompt $x$ 和专家答案 $y^\star$，最大化模型复现专家答案的概率。它便宜、稳定、容易复现，也能快速把模型拉到目标格式上。但近两年的经验结论越来越清晰：SFT 往往擅长「记住示范长什么样」，而 RL 更容易学到可迁移的策略。

DFT 论文的切入点非常锋利：如果把 SFT 梯度改写成 policy gradient 的形式，SFT 并不是一个温和的 imitation objective，而是暗含了一个 $1 / \pi_\theta(y^\star|x)$ 的逆概率权重。模型越不相信专家答案，SFT 的等价策略梯度越会放大这条轨迹。DFT 用当前目标 token 的概率作为 stop-gradient 权重，把这个爆炸分母乘回去。

ASFT 进一步问：DFT 为什么不是一个纯 heuristic？答案是 RWR。SFT、DFT 都可以被写成 RL 目标的下界，区别在于辅助分布 $q(\tau)$ 的选择。DFT 的 $q$ 让下界更紧，但也让训练分布随模型概率自我强化。ASFT 的贡献就是在 DFT loss 上加一个轻量 KL 锚，使紧度和稳定性同时成立。

## 2 · Preliminaries: 统一记号与基础设定

两篇论文中会交替使用 $p_\theta$、$\pi_\theta$、trajectory、response、reference policy、base policy。这里统一如下。

| 记号 | 含义 | 本文约定 |
| --- | --- | --- |
| $x$ | 输入 prompt / state | 固定来自任务分布或数据集 |
| $y=(y_1,\dots,y_T)$ | 模型响应 | $y^\star$ 表示专家示范或正确答案 |
| $\tau=(x,y)$ | 轨迹 | LLM 场景下就是 prompt-response pair |
| $\pi_\theta(y|x)$ | 当前策略 | 也写作 $p_\theta(\tau)$ |
| $\pi_{\mathrm{ref}}$ | reference policy | SFT / RWR 推导里的固定辅助分布 |
| $\pi_{\mathrm{base}}$ | base policy | ASFT 用来做 forward KL 的锚 |
| $\operatorname{sg}[\cdot]$ | stop-gradient | 数值参与前向计算，但不反传梯度 |

## 3 · SFT: 交叉熵到底优化了什么

标准 SFT loss 是：

$$
\mathcal{L}_{\mathrm{SFT}}(\theta)
=-\mathbb{E}_{(x,y^\star)\sim \mathcal{D}^+}
\left[\sum_{t=1}^{T}\log \pi_\theta(y_t^\star|y^\star_{<t},x)\right].
$$

这里容易混淆的一点是：为什么公式里是 $y^\star$ 而不是 $y$？原因很简单：SFT 是离线行为克隆，不需要模型先采样一个回答。训练时我们把专家答案作为 target 喂给模型，只问模型「这个 target 的概率是多少」。

因此 SFT 的梯度是：

$$
\nabla_\theta \mathcal{L}_{\mathrm{SFT}}(\theta)
=-\mathbb{E}_{(x,y^\star)\sim \mathcal{D}^+}
\left[\nabla_\theta \log \pi_\theta(y^\star|x)\right].
$$

这也是它稳定的来源：采样分布不依赖当前策略，梯度方差低；但这也意味着它不会直接问「当前策略采样出来的轨迹能不能拿到高奖励」。

## 4 · 把 SFT 梯度改写成 policy gradient

DFT 的关键不是直接改 loss，而是先把 SFT 梯度从「数据分布下的期望」改写成「当前策略下的期望」。这一步可以概括为 `resample + reweight`：先把专家轨迹嵌入当前策略的采样空间，再用重要性权重恢复原始梯度。

对于固定的 $x$，可写成：

$$
\nabla_\theta \mathcal{L}_{\mathrm{SFT}}
=-\mathbb{E}_{y\sim \pi_\theta(\cdot|x)}
\left[
\frac{\mathbf{1}[y=y^\star]}{\pi_\theta(y|x)}
\nabla_\theta \log \pi_\theta(y|x)
\right].
$$

这条式子揭示了 SFT 的隐式奖励：

$$
R_{\mathrm{SFT}}(x,y)=\frac{\mathbf{1}[y=y^\star]}{\pi_\theta(y|x)}.
$$

如果专家答案当前概率很低，$1/\pi_\theta(y^\star|x)$ 会非常大。于是 SFT 的 policy-gradient 等价形式会过度放大模型本来就不相信的轨迹。DFT 认为这正是 SFT 泛化差的一个病灶。

## 5 · DFT: 概率加权的 SFT

DFT 的核心改动是把目标 token 的当前概率乘回交叉熵，并且对这个概率做 stop-gradient：

$$
\mathcal{L}_{\mathrm{DFT}}(\theta)
=-\mathbb{E}_{\tau \in \mathcal{D}^+}
\left[
\operatorname{sg}[p_\theta(\tau)]\log p_\theta(\tau)
\right].
$$

在 token-level 实现里，$p_\theta$ 通常来自 target token probability：

```python
ce = cross_entropy(policy_logits, labels, reduction="none")
target_prob = torch.exp(-ce)
dft_loss = masked_mean(target_prob.detach() * ce, loss_mask)
```

这个形式不是随便调权重。它是在告诉模型：越是当前模型已经相对相信的正样本，越值得继续强化；越是当前模型极不相信的正样本，先不要让它主导更新。它与 focal loss 有相似的「按概率改写梯度」味道，但方向相反：DFT 更关注高概率正样本，避免低概率正样本的爆炸权重。

DFT 的风险也正从这里来：如果一个低概率答案其实是重要知识、罕见格式或必要推理跳跃，DFT 会低估它。换句话说，DFT 更像一个有适用边界的 objective regularizer，而不是 SFT 的通用替代品。

## 6 · RWR: SFT、DFT 的统一视角

RWR 从 RL 目标出发：

$$
J(\theta)=\mathbb{E}_{\tau\sim \pi_\theta}[R(\tau)].
$$

引入辅助分布 $q(\tau)$ 后，可以把它改写成：

$$
J(\theta)
=\mathbb{E}_{\tau\sim \pi_{\mathrm{ref}}}
\left[
\frac{q(\tau)}{\pi_{\mathrm{ref}}(\tau)}
\frac{\pi_\theta(\tau)}{q(\tau)}
R(\tau)
\right].
$$

只对 $\pi_\theta/q$ 应用 $u\ge 1+\log u$，得到广义 RWR 下界：

$$
J(\theta)
\ge c_{\mathrm{ref}}
\mathbb{E}_{\tau\in \mathcal{D}^+}
\left[
\frac{q(\tau)}{\pi_{\mathrm{ref}}(\tau)}
\log \pi_\theta(\tau)
\right]
+\mathrm{const}.
$$

下界的松紧取决于 $\pi_\theta/q$ 离 1 有多近。$q=\pi_{\mathrm{ref}}$ 时就是 SFT，稳定但固定；$q$ 越接近当前策略 $\pi_\theta$，不等式越接近取等，下界越紧。但如果 $q$ 追随 $\pi_\theta$ 太快，训练分布本身就会失稳。

ASFT 论文指出，DFT 对应一个特定的辅助分布：

$$
q_{\mathrm{DFT}}(\tau)
=
\frac{
\pi_{\mathrm{ref}}(\tau|\mathcal{D}^+)
\operatorname{sg}[p_\theta(\tau)]
}{
\mathbb{E}_{\tau\sim \pi_{\mathrm{ref}}(\cdot|\mathcal{D}^+)}
[\operatorname{sg}[p_\theta(\tau)]]
}.
$$

把它代入 RWR 下界后，归一化项在当前梯度步中是 stop-gradient 常数，最终恢复 DFT sequence loss。

## 7 · ASFT: 给 DFT 加一个 forward KL 锚

ASFT 的目标可以写成：

$$
\mathcal{L}_{\mathrm{ASFT}}
=
\mathcal{L}_{\mathrm{DFT}}
+\lambda
D_{\mathrm{KL}}(\pi_{\mathrm{base}}\Vert \pi_\theta).
$$

注意这里是 forward KL：base distribution 在左，当前 policy 在右。它的作用是保留 base model 对 token 分布的覆盖，避免 DFT 只沿着当前高概率正样本越来越尖锐。

实现上，ASFT 的核心其实很朴素：

```python
# DFT: CE gives -log p(target), so exp(-CE) recovers p(target).
per_token_ce = F.cross_entropy(policy_logits, labels, ignore_index=-100, reduction="none")
valid = labels != -100
valid_ce = per_token_ce[valid]

with torch.no_grad():
    target_prob = torch.exp(-valid_ce)

dft_loss = (valid_ce * target_prob).mean()

# ASFT: add forward KL from base distribution q to policy log p.
log_policy = F.log_softmax(policy_logits, dim=-1)
base_prob = F.softmax(ref_logits, dim=-1)
token_kl = F.kl_div(log_policy, base_prob, reduction="none").sum(dim=-1)

asft_loss = dft_loss + alpha * token_kl[valid].mean()
```

全参数 ASFT 需要同时维护 $\pi_\theta$ 和 $\pi_{\mathrm{base}}$，显存开销明显变大。ASFT-LoRA 的技巧是利用 $\Delta W=BA$：在同一个模型实例中切换 base weights 与 LoRA-augmented weights 来计算 forward KL，把额外开销压到更接近 SFT 的水平。

## 8 · 实验证据：该相信什么，不该过度相信什么

DFT 论文在推理任务上的一行改动很强。

| 模型 | Base Avg@16 | SFT Avg@16 | DFT Avg@16 | 读法 |
| --- | ---: | ---: | ---: | --- |
| Qwen2.5-Math-1.5B | 15.92 | 18.01 | 31.58 | DFT +13.57 vs SFT |
| Qwen2.5-Math-7B | 21.25 | 23.62 | 37.15 | DFT +13.53 vs SFT |
| DeepSeekMath-7B | 2.64 | 9.82 | 18.15 | 低基线下仍有增益 |
| LLaMA-3.1-8B | 1.00 | 6.33 | 11.02 | 增益较小但一致 |

DFT 的核心 ablation 也很关键：sentence-level weighting 平均 15.75，geometric-mean weighting 17.21，而 token-level weighting 31.58。也就是说，DFT 的有效形式不是「任意概率加权」，而是 token-level、stop-gradient 的概率加权。

ASFT 论文则说明 DFT 的漂移会被医学和代码任务放大。

| 场景 | SFT | DFT | ASFT | 结论 |
| --- | ---: | ---: | ---: | --- |
| 医疗 10k Avg | 33.37 | 29.19 | 42.03 | DFT 低于 SFT，ASFT 显著修复 |
| 数学 100k Avg | 19.15 | 26.04 | 30.50 | ASFT 在 DFT 之上继续提升 |
| 代码 Avg | 26.4 | 19.8 | 27.0 | DFT 在代码上退化，ASFT 小幅领先 |
| 医疗 RL 初始化 Avg | 40.24 | - | 44.10 | ASFT 是更好的 RL warm start |

这些结果也要谨慎读：两篇论文大多报告点估计，缺少置信区间和显著性检验；ASFT 中「accuracy as a proxy for bound tightness」的说法有启发性，但不能当作严格证明。更高的下界、优化路径、数据质量和模型先验会共同影响最终准确率。

## 9 · Summary: 内容总结与主观判断

从 loss 角度看，SFT 到 ASFT 的演化非常克制：它没有引入偏好对、奖励模型或在线采样，而是在同一份正样本数据上改变「哪些 token / trajectory 值得被更用力学习」。SFT 对所有 target token 一视同仁；DFT 让模型已有概率参与加权；ASFT 再用 base distribution 约束这个自适应权重不要把模型带离原本能力区。

从理论角度看，RWR 是这两篇论文之间真正的桥。DFT 解释了 SFT 的隐式奖励病灶；ASFT 解释了 DFT 为什么是合法的更紧下界，并补上它缺失的锚定。这个链条比「DFT 是一行代码提分」更重要，因为它告诉我们后续还有大量 $q(\tau)$ 的设计空间。

总体而言，DFT 更像一个有明确适用边界的 objective regularizer，而不是 SFT 的通用替代品。它适合模型已有强先验、低概率 token 更可能是噪声或非核心语义的任务；在知识密集、答案分布需要离开 base prior 的任务上，单独 DFT 很危险。ASFT 的价值不只是提高分数，而是把 DFT 从「激进重加权」变成「受约束重加权」，这更接近实际后训练系统需要的东西。

## References

1. Yongliang Wu et al. [On the Generalization of SFT: A Reinforcement Learning Perspective with Reward Rectification](https://arxiv.org/abs/2508.05629). ICLR 2026. Also on [alphaXiv](https://www.alphaxiv.org/abs/2508.05629); code: [yongliang-wu/DFT](https://github.com/yongliang-wu/DFT).
2. He Zhu et al. [Anchored Supervised Fine-Tuning](https://arxiv.org/abs/2509.23753). ICLR 2026. Also on [alphaXiv](https://www.alphaxiv.org/abs/2509.23753); code: [zhuchichi56/ASFT](https://github.com/zhuchichi56/ASFT).
3. Tianzhe Chu et al. [SFT Memorizes, RL Generalizes: A Comparative Study of Foundation Model Post-training](https://arxiv.org/abs/2501.17161). 2025.
4. Chongli Qin and Jost Tobias Springenberg. [Supervised Fine Tuning on Curated Data is Reinforcement Learning (and can be improved)](https://arxiv.org/abs/2507.12856). 2025.
5. Jan Peters and Stefan Schaal. [Using Reward-Weighted Regression for Reinforcement Learning of Task Space Control](https://is.mpg.de/publications/peters_piisadprl_2007). IEEE ADPRL, 2007.
6. hiyouga. [LLaMA-Factory `trainer_utils.py`](https://github.com/hiyouga/LlamaFactory/blob/main/src/llamafactory/train/trainer_utils.py). DFT / ASFT loss utilities.
