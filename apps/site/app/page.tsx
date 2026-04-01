import Link from "next/link";
import { dictionaries, socialLinks } from "@whatsmy/config";
import { Localized, LocaleToggle, ThemeToggle } from "@whatsmy/ui";

const featuredPosts = [
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

function isExternalLink(href: string) {
  return href.startsWith("http") && !href.includes("whatsmy.fun");
}

function ArrowOutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.25 13.75 13.75 6.25M8 6.25h5.75V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="m5.75 8.25 4.25 4.25 4.25-4.25"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function SitePage() {
  const zhSite = dictionaries.zh.site;
  const enSite = dictionaries.en.site;

  return (
    <main className="stacked site-home">
      <header className="topbar enter-rise">
        <div className="wordmark">
          what's <mark>my</mark>
        </div>
        <details className="settings-details">
          <summary className="settings-summary">
            <span className="settings-summary-copy">
              <Localized zh="界面设置" en="Preferences" />
            </span>
            <span className="settings-summary-icon">
              <ChevronDownIcon />
            </span>
          </summary>
          <div className="settings-panel-shell">
            <div className="content-panel settings-panel">
              <div className="settings-group">
                <Localized className="settings-group-label" zh="语言" en="Language" />
                <LocaleToggle />
              </div>
              <div className="settings-group">
                <Localized className="settings-group-label" zh="主题" en="Theme" />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </details>
      </header>

      <section className="home-hero-grid">
        <div className="hero-panel site-hero-copy site-thesis-panel enter-rise delay-1">
          <div className="hero-kicker-row">
            <Localized className="eyebrow" zh={zhSite.eyebrow} en={enSite.eyebrow} />
            <div className="issue-stamp">Edition 01</div>
          </div>
          <Localized className="mono-kicker" zh={zhSite.identityLine} en={enSite.identityLine} />
          <div className="site-thesis-main">
            <h1 className="display-title">
              <Localized zh={zhSite.heading} en={enSite.heading} />
            </h1>
            <p className="kicker site-lead">
              <Localized zh={zhSite.intro} en={enSite.intro} />
            </p>
            <div className="stack-inline hero-action-row">
              <Link className="solid-link" href="https://blog.whatsmy.fun">
                <Localized zh={zhSite.primaryCta} en={enSite.primaryCta} />
              </Link>
              <Link className="ghost-link" href="#projects">
                <Localized zh={zhSite.secondaryCta} en={enSite.secondaryCta} />
              </Link>
            </div>
          </div>
          <div className="site-inline-ledger">
            <span>paper-first notes</span>
            <span>tooling in public</span>
            <span>cn / en interface</span>
          </div>
        </div>

        <aside className="home-side-rail enter-rise delay-2">
          <section className="signal-panel current-panel">
            <div className="section-head compact-head">
              <Localized className="section-title" zh={zhSite.nowLabel} en={enSite.nowLabel} />
              <div className="panel-index">01</div>
            </div>
            <div className="current-focus-list">
              {zhSite.currentFocus.map((focus, index) => (
                <div key={focus} className="current-focus-item">
                  <span className="focus-counter">{String(index + 1).padStart(2, "0")}</span>
                  <Localized zh={focus} en={enSite.currentFocus[index]} />
                </div>
              ))}
            </div>
          </section>

          <section className="content-panel rail-note-panel">
            <Localized className="section-title rail-note-title" zh="Signal" en="Signal" />
            <p className="kicker rail-note-copy">
              <Localized zh={zhSite.status} en={enSite.status} />
            </p>
            <div className="signal-grid compact-signal-grid">
              <div className="signal-chip">
                <strong>02</strong>
                <span>published notes</span>
              </div>
              <div className="signal-chip">
                <strong>MD + LaTeX</strong>
                <span>paper archive</span>
              </div>
              <div className="signal-chip">
                <strong>Vibe</strong>
                <span>tools in progress</span>
              </div>
            </div>
          </section>
        </aside>
      </section>

      <section className="home-index-grid">
        <section className="content-panel index-panel enter-rise delay-3">
          <div className="section-head index-head">
            <div className="stacked compact-stack">
              <Localized className="eyebrow" zh={zhSite.outputsLabel} en={enSite.outputsLabel} />
              <Localized className="section-title" zh={zhSite.featured} en={enSite.featured} />
            </div>
            <Link className="index-more-link" href="https://blog.whatsmy.fun/archive">
              <span>Archive</span>
              <span className="action-icon" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </Link>
          </div>
          <div className="index-list">
            {featuredPosts.map((post, index) => (
              <Link key={post.href} className="index-entry" href={post.href}>
                <span className="index-entry-count">{String(index + 1).padStart(2, "0")}</span>
                <div className="index-entry-copy">
                  <Localized as="h3" zh={post.title.zh} en={post.title.en} />
                  <Localized as="p" className="kicker index-entry-summary" zh={post.summary.zh} en={post.summary.en} />
                </div>
                <span className="entry-action" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section id="projects" className="content-panel index-panel projects-panel enter-rise delay-4">
          <div className="stacked compact-stack">
            <Localized className="eyebrow" zh={zhSite.projectsLabel} en={enSite.projectsLabel} />
            <Localized className="section-title" zh="轻量项目索引" en="A light project index" />
          </div>
          <div className="project-list">
            {zhSite.projects.map((project, index) => {
              const external = isExternalLink(project.href);

              return (
                <Link
                  key={project.href}
                  className="project-row"
                  href={project.href}
                  rel={external ? "noreferrer" : undefined}
                  target={external ? "_blank" : undefined}
                >
                  <div className="project-row-meta">
                    <span className="project-count">{String(index + 1).padStart(2, "0")}</span>
                    <span className="project-type">{project.type}</span>
                  </div>
                  <div className="project-row-copy">
                    <Localized as="h3" zh={project.title} en={enSite.projects[index].title} />
                    <Localized
                      as="p"
                      className="kicker project-description"
                      zh={project.description}
                      en={enSite.projects[index].description}
                    />
                  </div>
                  <span className="entry-action" aria-hidden="true">
                    <ArrowOutIcon />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      </section>

      <section className="home-elsewhere enter-rise delay-4">
        <div className="section-head compact-head">
          <Localized className="eyebrow" zh={zhSite.links} en={enSite.links} />
          <div className="panel-index">02</div>
        </div>
        <div className="elsewhere-list">
          {socialLinks.map((link) => {
            const external = link.href.startsWith("http");

            return (
              <Link
                key={link.label}
                className="elsewhere-link"
                href={link.href}
                rel={external ? "noreferrer" : undefined}
                target={external ? "_blank" : undefined}
              >
                <span>{link.label}</span>
                <span className="action-icon" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="traffic-footnote enter-rise delay-4" aria-label="Traffic note">
        <div className="traffic-footnote-label">
          <Localized zh="访问统计" en="Traffic note" />
        </div>
        <p className="traffic-footnote-copy">
          <Localized
            zh="本站已启用 Vercel Analytics，用来观察页面访问趋势与内容关注度。"
            en="This site uses Vercel Analytics to understand page-visit trends and which pieces resonate most."
          />
        </p>
      </section>
    </main>
  );
}
