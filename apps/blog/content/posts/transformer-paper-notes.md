---
title: Transformer Paper Notes
date: 2026-03-31
summary: 对 Transformer 论文的结构化阅读笔记，包含自注意力、位置编码、训练策略与常见为什么问题。
tags:
  - Transformer
  - Paper Notes
  - Attention
draft: false
language: zh
---

Ref:
- [annotated-transformer](http://nlp.seas.harvard.edu/annotated-transformer/)
- [illustrated-transformer](https://jalammar.github.io/illustrated-transformer/)
## Theory
### Model Architecture
Encoder-decoder structure. The **encoder** maps an input sequence of symbol representations $(x_{1},\dots ,x_{n})$ to *a sequence of continuous representations* $\mathbf{z}=(z_{1},\dots,z_{n})$. The **decoder** *generates* an output sequence $(y_{1},\dots, y_{m})$ of symbols *one element at a time*.  At each step the model is **auto-regressive**, consuming the *previously generated symbols as additional input* when generating the next.

The Transformer follows this overall architecture using **stacked self-attention** and **point-wise, fully connected layers** for *both the encoder and decoder*, shown in the left and right halves of Figure 1, respectively.
![[Screenshot 2024-10-04 at 4.28.03 pm.png]]
#### Encoder and Decoder Stacks
***Encoder***
- a stack of $N=6$ identical layers
- a layer has 2 sub-layers
	- a multi-head self-attention mechanism
	- a simple, position-wise fully connected feed-forward network
- apply a residual connection around each of the two sub-layers,
- followed by a layer normalization
- all sub-layers in the model and the embedding layers produce outputs of dimension $d_{\text{model}}=512$

***Decoder***
- a stack of $N=6$ identical layers
- a layer has 3 sub-layers
	- a **masked** multi-head self-attention mechanism, *prevent positions from attending to subsequent positions*, This masking, combined with fact that the output embeddings are offset by one position, *ensures that the predictions for position $i$ can depend only on the known outputs at positions less than $i$*
	- *a multi-head attention over the output of the encoder stack*
	- a simple, position-wise fully connected feed-forward network
- apply a residual connection around each of the two sub-layers,
- followed by a layer normalization

#### Attention
An ==attention== function can be described as *mapping a query and a set of key-value pairs to an output*,  where the query, keys, values, and output are all vectors.

The output is computed as *a weighted sum of the values*, where the weight assigned to each value is *computed by a compatibility function of the query with the corresponding key*.
#### Scaled Dot-Product Attention
The input consists of *queries and keys* of dimension $d_k$ , and *values* of dimension $d_{v}$.
==Compute the dot products of the query with all keys, divided each by $\sqrt{ d_{k} }$, and apply a softmax function to obtain the weights on the values.== Pack queries, keys, and values to matrices. 
$$
Attention(Q, K, V) = \text{softmax}\left( \frac{QK^T}{\sqrt{ d_{k} }} \right)V
$$
**Dot-product attention is much faster and more space-efficient in practice**, since it can be implemented using *highly optimized matrix multiplication* code.  为什么用点积注意力？

For large values of $d_{k}$, the *dot products grow large in magnitude*, *pushing the softmax function into regions where it has extremely small gradients*. To counteract this effect, we scale the dot products by $\frac{1}{\sqrt{ d_{k} }}$.  为什么除以$\sqrt{ d_{k} }$？

Why the dot products get large, assume that the components of $q$ and $k$ are independent random variables with mean $0$ and variance $1$. Then their dot product, $q \cdot k=\sum_{i=1}^{d_{k}}q_{ik_{i}}$, has mean $0$ and variance $d_{k}$.  为什么点积的值会变得很大？

![[Screenshot 2024-10-04 at 4.57.23 pm.png]]
#### Multi-Head Attention
It's beneficial to **linearly project** the queries, keys and values $h$ times with *different, learned linear projections* to $d_k$ , $d_k$ and $d_v$ dimensions, respectively. Then *perform the attention function in parallel*, yielding $d_{v}$-dimensional output values. These are *concatenated and once again projected*, resulting in the final values.
 
Multi-head attention allows the model to *jointly attend to information from different representation subspaces at different positions*. With a single attention head, averaging inhibits this.

$$
\begin{align}
\text{MultiHead}(Q, K, V) &= \text{Concat}(head_{1}, \dots , head_{n})W^O \\
\text{where } head_{i}&=\text{Attention}(QW_{i}^Q, KW_{i}^K, VW_{i}^V)
\end{align}
$$
where the projections are parameter matrices $W_{i}^Q\in \mathbb{R}^{d_{model}\times d_{k}}$, $W_{i}^K\in \mathbb{R}^{d_{model}\times d_{k}}$, $W_{i}^V\in \mathbb{R}^{d_{model}\times d_{v}}$ and $W_{i}^O\in \mathbb{R}^{hd_{v}\times d_{model}}$.

Transformer has $h=8$ parallel attention layers, or heads. For each of these, use $d_{k}=d_{v}=d_{model}/h=64$. Due to the *reduced dimension of each head*, the total computational cost is similar to that of single-head attention with full dimensionality.

#### Applications of Attention in the model
The Transformer uses multi-head attention in three different ways:

- In "encoder-decoder attention" layers, *the queries come from the previous decoder layer, and the memory keys and values come from the output of the encoder*. **This allows every position in the decoder to attend over all positions in the input sequence**. This mimics the typical encoder-decoder attention mechanisms in sequence-to-sequence models.
- The *encoder* contains self-attention layers. *In a self-attention layer* all of the *keys, values and queries come from the same place*, in this case, the output of the previous layer in the encoder. **Each position in the encoder can attend to all positions in the previous layer of the encoder**.
- Similarly, self-attention layers in the decoder allow each position in the decoder to attend to all positions in the decoder up to and including that position. We need *to prevent leftward information flow in the decoder to preserve the auto-regressive property*. We *implement this inside of scaled dot-product attention* by **masking out (setting to $-\infty$)** all values *in the input of the softmax* which correspond *to illegal connections*. 

#### Position-wise Feed-Forward Networks
The fully connected feed-forward network is applied to each position separately and identically. This consists of ==two linear transformations with a ReLU activation in between==.
$$
\text{FFN}(x) = \max(0, xW_{1}+b_{1})W_{2}+b_{2}
$$
While the *linear transformations* are the same across different positions, they *use different parameters from layer to layer*. Another way of describing this is as two convolutions with kernel size 1.

The dimensionality of input and output is $d_{model} = 512$, and the inner-layer has dimensionality $d_{ff} = 2048$.

#### Embeddings and Softmax
Use *learned embeddings* to *convert the input tokens and output tokens to vectors* of dimension $d_{model}$. Use use the usual *learned linear transformation and softmax function* to *convert the decoder output to predicted next-token probabilities*.

*Share the same weight matrix* between the *two embedding layers* and the *pre-softmax linear transformation*. In the embedding layers, we multiply those weights by  $\sqrt{d_{model}}$.

#### Positional Encoding
Since our *model contains no recurrence and no convolution*, in order for the model *to make use of the order of the sequence*, there's need to *inject some information about the relative or absolute position of the tokens in the sequence.* 

Add "**positional encodings**" *to the input embeddings at the bottoms of the encoder and decoder stacks*. The positional encodings have the same dimension $d_{model}$ as the embeddings, so that the *two can be summed*. 

Use sine and cosine functions of different frequencies:
$$
\begin{align}
PE_{(pos, 2i)}&=\sin(pos/10000^{2i/d_{{model}}}) \\
PE_{(pos, 2i+1)}&=\cos(pos/10000^{2i/d_{{model}}})
\end{align}
$$
where $pos$ is the position and $i$ is the dimension, *each dimension of the positional encoding*
*corresponds to a sinusoid*. 

Choose sinusoid functions for positional encodings because hypothesising it would *allow the model to easily learn to attend by relative positions*, since for any fixed offset $k$, $PE_{pos+k}$ can be represented as a *linear function* of $PE_{pos}$.  And it may allow the model to extrapolate to longer sequence lengths.  为什么用正余弦函数做位置编码？
- 不同位置的编码是唯一的，确保模型能够区分序列中的不同位置
- 编码具有连续性和光滑性（相邻位置的编码差距较小），有助于模型捕获序列中的相对位置信息
- **周期性**：正弦和余弦函数具有周期性，便于捕获序列中循环性或周期性的模式
- 正余弦位置编码的设计使得位置之间的*相对距离可以通过简单的向量操作*（如点积）获得

### Why Self-Attention
One is the *total computational complexity per layer*. 

Another is *the amount of computation that can be parallelized*, as measured by the minimum number of sequential operations required.

The third is *the path length between long-range dependencies* in the network.
One key factor affecting the ability to learn such dependencies is *the length of the paths forward and backward signals have to traverse in the network*.  影响长距离学习的因素？
The *shorter these paths* between any combination of positions in the input and output sequences, *the easier it is to learn* long-range dependencies.

### Training
#### Optimizer
Adam optimiser with $\beta_{1}=0.9$, $\beta_{2}=0.98$, and $\epsilon=10^{-9}$. *Vary the learning rate over the course of training*, by
$$
lr = d^{-0.5}_{model}\cdot \min(\text{step\_num}^{-0.5}, \text{step\_num}\cdot\text{warmup\_steps}^{-1.5})
$$
*increasing the learning rate linearly for the first $\text{warmup\_steps}=4000$ training steps*, and *decreasing it thereafter* proportionally to the inverse square root of the step number.
#### Regularization
***Residual Dropout***
Apply *dropout to the output of each sub-layer*, before it is added to the sub-layer input and normalised.
Apply dropout to *the sums of the embeddings and the positional encodings* in both the encoder and decoder stacks

***Label Smoothing***
Apply label smoothing of value $\epsilon_{ls}=0.1$, during training.

This hurts perplexity, as the model learns to be more unsure, but **improves accuracy and BLEU score**.

## PyTorch Implement
https://nlp.seas.harvard.edu/annotated-transformer/

## Interview QAs
#### 简述 Transformer ？Transformer Encoder 有什么子层？优势？
Transformer 是一种基于自注意力机制（Self-Attention）的深度学习模型，是当前许多语言模型（如GPT、BERT）的基础架构。Transformer 的核心是**自注意力机制**（Self-Attention），它*允许模型在处理输入序列时能够对输入的不同部分进行加权，并捕捉序列中远距离的依赖关系*。相比于之前的RNN或LSTM等模型，Transformer *不依赖顺序计算，可以并行处理整个输入序列*，从而极大地提高了训练效率。

Transformer 由**编码器**（Encoder）和**解码器**（Decoder）两部分组成：

1. **编码器（Encoder）**：用于将输入序列映射到一个高维空间的表示，对输入序列编码，生成上下文向量。编码器由多个（6）相同的层（layer）堆叠而成，每一层包括两个子层，即多头自注意力（Multi-head Self-Attention）和位置的前馈神经网络（Point-wise Feed-Forward Neural Network）。
2. **解码器（Decoder）**：用于根据编码器的输出生成目标序列。解码器也由多个（6）层组成，每层除了和编码器类似的自注意力机制和前馈神经网络外，还在此之间插入了一个自注意力机制子层，以关注编码器的输出。与编码器不同，第一个子层的自注意力机制是带有掩码的自注意力层，以避免当前位置的输入与后续位置发生关联，确保位置$i$只能依赖于之前的已知输出，保证自回归属性。
3.  Transformer 在每一个子层之间都会加上一个 残差链接 避免在网络中出现梯度消失的问题， 然后进行 层归一化 用于稳定网络学习过程，使得Transformer编码器非常有效且灵活，适用于处理各种顺序数据任务。

Transformer 的优势

1. **并行化处理**：Transformer不需要像RNN那样依赖顺序，因此训练速度大大提高。
2. **捕捉长距离依赖关系**：自注意力机制使得模型能够有效地捕捉输入序列中的长距离依赖关系。
3. **可扩展性强**：Transformer已经扩展到各种NLP任务（如翻译、问答、文本生成等）以及计算机视觉领域。

#### Encoder和Decoder如何进行交互？
通过交叉注意力 Cross-Attention 机制交互，这一交互过程**允许解码器在生成输出时能够关注编码器生成的输入序列的表示**。

1. **编码器处理输入序列**：encoder通过自注意力和FFN，生成包含输入序列各元素信息，以及他们相对关系。*编码器的输出是对输入序列的高维表示，编码了输入序列的上下文信息*。这个高维表示将被传递到解码器中供其生成输出序列时使用。
2. **解码器**：*解码器生成目标序列*（如翻译后的文本），*在每个时间步预测下一个词*。与编码器不同的是，*解码器需要同时处理输入序列的表示和已经生成的部分输出序列*。
    - **自注意力（Self-Attention）**：解码器首先*通过带有掩码的自注意力机制只对生成的部分目标序列进行处理*，确保在预测当前词时只能看到已经生成的词，而不是未来的词（使用遮掩机制，Masking）。
    - **交叉注意力（Cross-Attention）**：这是编码器和解码器交互的核心。*交叉注意力机制使得解码器能够访问编码器的输出，即对输入序列的表示*。在这个阶段，*解码器对编码器的输出进行注意力计算，获取与当前生成位置相关的输入序列的上下文信息*。这允许解码器在每一步生成时关注输入序列中的重要部分。
    - **前馈神经网络（Feed-Forward Network）**：在交叉注意力之后，解码器还会*通过前馈神经网络进一步处理结果，输出最终的隐藏表示*，用来预测当前步骤的输出。

Key、 Value 来自编码器， Query 来自解码器。

#### attention的注意力矩阵的计算为什么用乘法而不是加法？
Dot-product attention is much **faster** and more **space-efficient** in practice, since it can be implemented using *highly optimized matrix multiplication* code.  
使用乘法计算速度更快。 在计算复杂度上，乘法和加法理论上的复杂度相似，但是在实践中，乘法可以利用*高度优化的矩阵乘法代码*（有成熟的加速实现）使得*点乘速度更快，空间利用率更高*。

#### attention为什么scaled? 为什么除以 $\sqrt{ d_{k} }$?
For large values of $d_{k}$, the *dot products grow large in magnitude*, *pushing the softmax function into regions where it has extremely small gradients*. To counteract this effect, we scale the dot products by $\frac{1}{\sqrt{ d_{k} }}$. 
因为虽然矩阵加法的计算更简单，但是 ADD 形式套着 `tanh` 和 $V$，相当于一个完整的隐层。在整体计算复杂度上两者接近，但是矩阵乘法已经有了非常成熟的加速实现。在 $d_k$（即 attention-dim）较小的时候，两者的效果接近。但是*随着 $d_k$ 增大，ADD 开始显著超越 MUL*。

*极大的点积值将整个 softmax 推向梯度平缓区，使得收敛困难*。出现了“梯度消失”。

Add 是天然地不需要 scaled，Mul 在 较大的时候必须要做 scaled. 

#### 如何对padding做mask操作的？
在 padding 位置置为 -1000/ $-\infty$， 再对注意力矩阵进行想加。

*Implement this inside of scaled dot-product attention* by **masking out (setting to $-\infty$)** all values *in the input of the softmax* which correspond *to illegal connections*. 
在计算 $QK^T$ 得到原始注意力矩阵后， Padding Mask 会*将填充位置的注意力得分设为非常小的负数*，如$-\infty$，以确保在*经过 softmax 函数后，这些位置的注意力权重接近于 0*，从而忽略填充位。
$$
\text{Masked\ Attention}(Q, K, V) = \text{softmax}\left( \frac{QK^T}{\sqrt{ d_{k} }} + \text{Mask} \right)V
$$
其中，Mask 是一个矩阵，对应于填充位置的元素为 $-\infty$，其他位置为 $0$。

#### Transformer的残差结构及意义
Apply a residual connection around each of the two sub-layers. 残差链接直接将某一层的输入添加到后面层的输出上。在*每一个子层（如自注意力层、前馈网络层）之后添加*，从而*在进行非线性变换时保持输入信号的一部分直接传递*，用于解决深层网络的梯度消失问题以及帮助模型更好地训练和收敛。

在 Transformer 中，每个编码器和解码器层都包含残差连接。具体来说，对于一个给定的层（比如自注意力层或前馈神经网络层），其处理过程可以总结为：

1. **层内处理**：输入首先通过层内的主要操作（如自注意力或前馈神经网络）。
2. **加上残差**：将这个操作的原始输入直接加到操作的输出上。
3. **层归一化**：在大多数情况下，加法操作之后会接一个层归一化（Layer Normalization）步骤。
$$
\text{output} = \text{LN}(\text{Layer}(x) + x)
$$
##### 残差连接的作用和意义：

1. **缓解梯度消失问题，促进梯度传递**： 残差连接*允许模型跳过若干层直接将信息传递给更高层*。由于深层网络往往会遇到梯度消失或梯度爆炸问题，*残差结构的直接传递路径使得梯度能够在反向传播时更有效地从深层传递到浅层*，进而使得模型更容易训练。
2. **保留原始信息**： 残差结构允许模型不仅仅依赖非线性变换（如注意力机制或前馈网络）的结果，还能*保留输入的部分原始信息*。对于某些复杂任务，*模型可能无法通过某一层的变换捕捉到所有信息*，因此直*接将原始输入传递到下一层，可以保留关键信息*，避免信息在多层变换中丢失。
3. **加速模型收敛**： 残差连接的引入有效缓解了深层网络难以训练的问题，*使得梯度可以顺利传播，模型更容易找到优化方向*。通过提供一个捷径路径，残差连接可以避免模型陷入局部极小值，使得网络的训练更加稳定，并且能够更快地收敛到全局最优解。
4. **提高模型的表达能力**： 残差连接允许每一层的输出*不仅仅是经过复杂变换后的信息，还包含输入的直接信息*。这样可以使得网络能够更灵活地调整每一层的输出，以适应不同的任务和输入特性，从而增强模型的表达能力。
5. **结合层归一化增强稳定性**： 在 Transformer 中，*残差连接后紧跟着层归一化*（Layer Normalization）。这种结合方式可以*确保模型每层输出的数值范围保持稳定，避免过大或过小的梯度波动*，从而进一步提高训练的稳定性。

#### Transformer为什么使用LN而不是BN？
[为什么不用BN](https://mp.weixin.qq.com/s?__biz=MzUyOTA5OTcwMg==&mid=2247485755&idx=1&sn=e9605a2609236066930ddbeba77a9f15&chksm=fa6777e2cd10fef4c9006dcfa5547469ffaf6fd4507fd2d7bf1ad9c65572795063ae9623643c&scene=21#wechat_redirect)
层归一化因其*与批大小无关*、*适合处理动态长度序列*、以及*在训练和推理阶段行为一致*等优点，被认为是在 Transformer 架构中处理序列数据的更合适的选择。
- **Layer Normalization** 在*处理序列数据时可以保留时间步之间的依赖关系*，而 BN 会引入噪声和不一致性。
- Transformer 的并行计算特点与 LN 更加兼容，BN 可能会成为瓶颈。
- 在*小批量训练和自回归生成任务中，LN 具有更加稳定*的表现。
- LN 有助于深层网络的训练稳定性，*提升收敛速度*，适合复杂的注意力机制。

主要是基于这两种归一化技术的不同特性和在处理序列数据时的适用性考虑：
1. **序列依赖性与批处理的局限性**：
	- **Batch Normalization**依赖于**批次的统计信息**，即通过*计算一个批次内的均值和方差来对数据进行归一化*。这在图像处理任务中很有效，因为*图像数据通常是独立的*、不依赖于其他图像，批量操作不会破坏图像内部的信息。
	- 然而，在**自然语言处理（NLP）** 任务中，输入是**序列数据**（如句子或文本片段），这些数据是*有序*的，并且*各个词汇或符号之间存在依赖关系*。Transformer 中的输入往往是*一个批量内的不同序列长度的句子*。由于每个句子具有不同的上下文依赖，*跨序列的批次归一化可能会引入噪声*，导致序列依赖信息的丢失或不一致。相比之下，**Layer Normalization**是针对每*个时间步（序列中的每个词）的特征维度进行归一化*，它只使用该时间步本身的数据，不依赖于整个批次，因此可以更好地保持序列中的依赖关系。
2. **Transformer 的自注意力机制特点**：
	- **Transformer** 依赖于**自注意力机制**，其运算具*有很强的并行性*，*与 BN 的工作方式并不兼容*。BN 需要在每个训练步骤中使用整个批次的数据来计算均值和方差，这在并行计算中会造成一定的瓶颈。
	- 相反，**Layer Normalization***不依赖于整个批次的统计量*，而是*针对每个输入样本和每个层的神经元进行归一化*。因此，它在处理自注意力机制的过程中更为高效，能够与 Transformer 的并行计算特点更好地结合，提升模型的计算效率。

- **Padding** 的作用是使输入序列在批处理时长度一致，但 padding 不能解决批处理归一化带来的问题。
- **LayerNorm** 在处理变长序列数据时，不依赖于批次内其他序列，因此可以更好地保持序列的依赖关系。
- **注意力掩码和损失掩码** 的机制确保模型在处理带有 padding 的序列时，忽略了 padding 的部分，从而避免了不必要的干扰。
