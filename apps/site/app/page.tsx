import Link from "next/link";
import { dictionaries, socialLinks } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { SiteHeader } from "../components/site-header";
import { getCurrentSiteDateStamp } from "../lib/current-date";
import { getEverydayPapers } from "../lib/everyday-paper";
import { featuredPosts } from "../lib/site-data";

function toDayNumber(dateStamp: string) {
  const [year, month, day] = dateStamp.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

function fromDayNumber(dayNumber: number) {
  const date = new Date(dayNumber * 86_400_000);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

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

export default function SitePage() {
  const zhSite = dictionaries.zh.site;
  const enSite = dictionaries.en.site;
  const currentDate = getCurrentSiteDateStamp();
  const allDailyPapers = getEverydayPapers();
  const currentDayNumber = toDayNumber(currentDate);
  const pastWeekStartDate = fromDayNumber(currentDayNumber - 6);
  const todaysPapers = allDailyPapers.filter((paper) => paper.date === currentDate);
  const pastWeekPapers = allDailyPapers
    .filter((paper) => {
      const dayDiff = currentDayNumber - toDayNumber(paper.date);
      return dayDiff >= 0 && dayDiff < 7;
    })
    .slice(0, 6);
  const showingPastWeek = todaysPapers.length === 0;
  const dailyPaperPicks = showingPastWeek ? pastWeekPapers : todaysPapers.slice(0, 5);
  const todayPaperHref = dailyPaperPicks[0] ? `/everyday-paper/${dailyPaperPicks[0].slug}` : "/everyday-paper";

  return (
    <main className="stacked site-home">
      <SiteHeader active="home" />

      <section className="home-hero-grid">
        <div className="hero-panel site-hero-copy site-thesis-panel enter-rise delay-1">
          <div className="hero-kicker-row">
            <Localized className="eyebrow" zh={zhSite.eyebrow} en={enSite.eyebrow} />
          </div>
          <Localized className="mono-kicker" zh={zhSite.identityLine} en={enSite.identityLine} />
          <div className="site-thesis-main">
            <h1 className="display-title site-home-title">
              <Localized zh={zhSite.heading} en={enSite.heading} />
            </h1>
            <p className="kicker site-lead">
              <Localized zh={zhSite.intro} en={enSite.intro} />
            </p>
            <div className="stack-inline hero-action-row">
              <Link className="solid-link" href="https://blog.whatsmy.fun">
                <Localized zh={zhSite.primaryCta} en={enSite.primaryCta} />
              </Link>
              <Link className="ghost-link" href={todayPaperHref}>
                <Localized zh={zhSite.secondaryCta} en={enSite.secondaryCta} />
              </Link>
            </div>
          </div>
        </div>

        <aside className="home-side-rail enter-rise delay-2">
          <section className="signal-panel current-panel flat-panel site-rail-section enter-rise delay-3">
            <div className="section-head compact-head">
              <Localized className="section-title" zh="Daily Paper" en="Daily Paper" />
            </div>
            <div className="daily-paper-list">
              {dailyPaperPicks.length ? (
                dailyPaperPicks.map((paper, index) => (
                  <Link key={`${paper.date}-${paper.slug}`} className="daily-paper-row" href={`/everyday-paper/${paper.slug}`}>
                    <span className="daily-paper-count">{String(index + 1).padStart(2, "0")}</span>
                    <div className="daily-paper-row-copy">
                      <h3>{paper.title}</h3>
                      <div className="daily-paper-meta">
                        <span>{paper.date}</span>
                        <span>{paper.source}</span>
                      </div>
                    </div>
                    <span className="entry-action" aria-hidden="true">
                      <ArrowOutIcon />
                    </span>
                  </Link>
                ))
              ) : (
                <div className="daily-paper-empty">
                  <p>No papers queued between {pastWeekStartDate} and {currentDate} yet.</p>
                  <Link className="index-more-link" href="/everyday-paper">
                    <span>Open archive</span>
                    <span className="action-icon" aria-hidden="true">
                      <ArrowOutIcon />
                    </span>
                  </Link>
                </div>
              )}
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
        </div>
        <nav className="elsewhere-list" aria-label="Elsewhere links">
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
              </Link>
            );
          })}
        </nav>
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
