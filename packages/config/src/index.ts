export type ThemePreference = "light" | "dark" | "system";
export type LocalePreference = "zh" | "en";
export type SiteProjectType = "skill" | "plugin" | "writing";

export type SiteProject = {
  title: string;
  description: string;
  href: string;
  type: SiteProjectType;
};

export type Dictionary = {
  site: {
    eyebrow: string;
    heading: string;
    identityLine: string;
    intro: string;
    primaryCta: string;
    secondaryCta: string;
    featured: string;
    links: string;
    status: string;
    nowLabel: string;
    outputsLabel: string;
    projectsLabel: string;
    currentFocus: string[];
    projects: SiteProject[];
  };
  blog: {
    backToHome: string;
  };
  nav: {
    home: string;
    blog: string;
  };
  toggle: {
    locale: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
  };
};

export const dictionaries: Record<LocalePreference, Dictionary> = {
  zh: {
    site: {
      eyebrow: "研究入口",
      heading: "读论文，做工具，写下能留下来的东西。",
      identityLine: "builder / writer / paper reader / tool maker",
      intro: "我在做 AI 论文阅读、vibe coding 项目和知识工作流工具。这里收纳长期笔记、实验中的产品，以及还在生长的判断。",
      primaryCta: "进入博客",
      secondaryCta: "看今日论文",
      featured: "精选文章",
      links: "Elsewhere",
      status: "写作是主线，工具是实验场，归档是长期记忆。",
      nowLabel: "当前关注",
      outputsLabel: "Selected notes",
      projectsLabel: "Projects",
      currentFocus: [
        "把论文阅读沉淀成可复用的 skill 与 workflow。",
        "用轻量工具验证更自然的 AI 使用方式。",
        "持续把零散笔记整理成长期可检索的 archive。"
      ],
      projects: [
        {
          title: "Academic Paper Reading Skill",
          description: "面向论文分析与总结的 ClawHub skill。",
          href: "https://clawhub.ai/wooonster/paper-reading",
          type: "skill"
        },
        {
          title: "Floator",
          description: "用本地 LLM 或 OpenAI-compatible API 做悬浮翻译。",
          href: "https://chromewebstore.google.com/detail/floator/gdpeliflcombcamhhcnehlmagljccpcn",
          type: "plugin"
        },
        {
          title: "Blog",
          description: "当前保留的长文入口与论文训练笔记。",
          href: "https://blog.whatsmy.fun",
          type: "writing"
        }
      ]
    },
    blog: {
      backToHome: "回到博客首页"
    },
    nav: {
      home: "主站",
      blog: "博客"
    },
    toggle: {
      locale: "语言",
      theme: "主题",
      light: "浅色",
      dark: "深色",
      system: "系统"
    }
  },
  en: {
    site: {
      eyebrow: "Research Index",
      heading: "Read papers, build tools, leave behind thinking that lasts.",
      identityLine: "builder / writer / paper reader / tool maker",
      intro: "I work on AI paper reading, vibe-coded products, and tools for knowledge workflows. This is where long-form notes, live experiments, and durable judgment accumulate.",
      primaryCta: "Open the blog",
      secondaryCta: "Check today's paper",
      featured: "Featured writing",
      links: "Elsewhere",
      status: "Writing is the spine. Tools are the lab. The archive is the long memory.",
      nowLabel: "Current focus",
      outputsLabel: "Selected notes",
      projectsLabel: "Projects",
      currentFocus: [
        "Turning paper reading into reusable skills and workflows.",
        "Testing more natural AI usage through lightweight tools.",
        "Consolidating scattered notes into a searchable long-memory archive."
      ],
      projects: [
        {
          title: "Academic Paper Reading Skill",
          description: "A ClawHub skill for deep paper analysis and summarization.",
          href: "https://clawhub.ai/wooonster/paper-reading",
          type: "skill"
        },
        {
          title: "Floator",
          description: "Floating translation powered by local LLMs or OpenAI-compatible APIs.",
          href: "https://chromewebstore.google.com/detail/floator/gdpeliflcombcamhhcnehlmagljccpcn",
          type: "plugin"
        },
        {
          title: "Blog",
          description: "The current long-form writing entry point.",
          href: "https://blog.whatsmy.fun",
          type: "writing"
        }
      ]
    },
    blog: {
      backToHome: "Back to blog home"
    },
    nav: {
      home: "Home",
      blog: "Blog"
    },
    toggle: {
      locale: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System"
    }
  }
};

export const socialLinks = [
  {
    label: "Blog",
    href: "https://blog.whatsmy.fun"
  },
  {
    label: "Github",
    href: "https://github.com/Wooonster"
  },
  {
    label: "Email",
    href: "mailto:wooonster@outlook.com"
  }
] as const;
