export const featuredPosts = [
  {
    href: "https://blog.whatsmy.fun/posts/sft-variants",
    title: {
      zh: "SFT Variants：从 SFT 到 DFT 到 ASFT",
      en: "SFT Variants: from SFT to DFT to ASFT"
    },
    summary: {
      zh: "把 SFT、DFT、ASFT 放进同一个 RWR 视角：概率加权为什么有效，为什么会漂移，以及 forward KL 如何锚住它。",
      en: "SFT, DFT, and ASFT through one RWR lens: why probability reweighting helps, why it drifts, and how forward KL anchors it."
    }
  },
  {
    href: "https://blog.whatsmy.fun/posts/transformer-paper-notes",
    title: {
      zh: "Transformer 论文笔记",
      en: "Transformer paper notes"
    },
    summary: {
      zh: "从注意力机制、架构设计到影响后续大模型发展的关键判断。",
      en: "Attention, architecture, and the ideas that shaped later large-model thinking."
    }
  },
  {
    href: "https://blog.whatsmy.fun/posts/gspo-paper-notes",
    title: {
      zh: "GSPO 论文笔记",
      en: "GSPO paper notes"
    },
    summary: {
      zh: "围绕推理、优化与实验结果的阅读笔记与问题意识整理。",
      en: "A reading log focused on reasoning, optimization, and what the experiments really show."
    }
  }
] as const;
