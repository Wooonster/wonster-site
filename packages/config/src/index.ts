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
    eyebrow: string;
    heading: string;
    intro: string;
    everydayPaper: string;
    everydayPaperIntro: string;
    everydayPaperEmpty: string;
    latest: string;
    archive: string;
    tags: string;
    readArticle: string;
    readMore: string;
    backToHome: string;
    allPosts: string;
    readingTime: string;
    previous: string;
    next: string;
    tableOfContents: string;
    noPosts: string;
    filterBy: string;
    viewArchive: string;
    rss: string;
    languageLabel: string;
  };
  nav: {
    home: string;
    blog: string;
    archive: string;
  };
  toggle: {
    locale: string;
    theme: string;
    light: string;
    dark: string;
    system: string;
  };
  footer: {
    copyright: string;
    builtWith: string;
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
          title: "Blog Archive",
          description: "沉淀中的长文笔记、论文阅读与实验记录。",
          href: "https://blog.whatsmy.fun/archive",
          type: "writing"
        }
      ]
    },
    blog: {
      eyebrow: "博客",
      heading: "长文、实验、以及逐步沉淀下来的清晰思考。",
      intro: "文章以 Markdown 为底层内容格式，支持数学公式与代码高亮，后续可直接从 Obsidian 对齐导入。",
      everydayPaper: "Everyday Paper",
      everydayPaperIntro: "按天记录值得反复回看的论文入口。先搭一个轻量的每日推荐层，让近期在读内容和长期归档彼此分开。",
      everydayPaperEmpty: "今天的论文推荐还没有放进来。",
      latest: "最新文章",
      archive: "归档",
      tags: "标签",
      readArticle: "阅读全文",
      readMore: "继续阅读",
      backToHome: "回到博客首页",
      allPosts: "全部文章",
      readingTime: "阅读时间",
      previous: "上一篇",
      next: "下一篇",
      tableOfContents: "目录",
      noPosts: "这个分组下暂时还没有文章。",
      filterBy: "筛选标签",
      viewArchive: "查看归档",
      rss: "RSS 订阅",
      languageLabel: "正文语言"
    },
    nav: {
      home: "主站",
      blog: "博客",
      archive: "归档"
    },
    toggle: {
      locale: "语言",
      theme: "主题",
      light: "浅色",
      dark: "深色",
      system: "系统"
    },
    footer: {
      copyright: "保留所有思考权利。",
      builtWith: "基于 Next.js、Markdown、LaTeX 和 Shiki 构建。"
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
          title: "Blog Archive",
          description: "Long-form notes on papers, systems, and model behavior.",
          href: "https://blog.whatsmy.fun/archive",
          type: "writing"
        }
      ]
    },
    blog: {
      eyebrow: "Blog",
      heading: "Long-form notes, experiments, and thinking that has been sharpened over time.",
      intro: "Posts use Markdown as the source of truth with math support and syntax-highlighted code, ready for future Obsidian import.",
      everydayPaper: "Everyday Paper",
      everydayPaperIntro: "A dated stream of papers worth revisiting, separated from the longer archive of written notes.",
      everydayPaperEmpty: "No paper picks are published here yet.",
      latest: "Latest posts",
      archive: "Archive",
      tags: "Tags",
      readArticle: "Read article",
      readMore: "Read more",
      backToHome: "Back to blog home",
      allPosts: "All posts",
      readingTime: "Reading time",
      previous: "Previous",
      next: "Next",
      tableOfContents: "Contents",
      noPosts: "No posts are published in this section yet.",
      filterBy: "Filter by tag",
      viewArchive: "View archive",
      rss: "RSS feed",
      languageLabel: "Post language"
    },
    nav: {
      home: "Home",
      blog: "Blog",
      archive: "Archive"
    },
    toggle: {
      locale: "Language",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    footer: {
      copyright: "All thinking rights reserved.",
      builtWith: "Built with Next.js, Markdown, LaTeX, and Shiki."
    }
  }
};

export const socialLinks = [
  {
    label: "Email",
    href: "mailto:wooonster@outlook.com"
  },
  {
    label: "Github",
    href: "https://github.com/Wooonster"
  },
  {
    label: "RSS",
    href: "https://blog.whatsmy.fun/feed.xml"
  },
  {
    label: "Blog",
    href: "https://blog.whatsmy.fun"
  }
] as const;
