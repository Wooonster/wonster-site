import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { SiteHeader } from "../components/site-header";
import { getEverydayPapers } from "../lib/everyday-paper";
import { featuredPosts } from "../lib/site-data";

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
  const dailyPaperPicks = getEverydayPapers().slice(0, 5);

  return (
    <main className="site-home home-index-page">
      <SiteHeader active="home" />

      <section className="home-section home-section-featured enter-rise delay-1" aria-labelledby="home-featured-title">
        <div className="home-section-head">
          <h1 id="home-featured-title" className="section-title">
            <Localized zh="精选文章" en="Featured" />
          </h1>
          <Link className="index-more-link" href="https://blog.whatsmy.fun/archive">
            <span>Archive</span>
            <span className="action-icon" aria-hidden="true">
              <ArrowOutIcon />
            </span>
          </Link>
        </div>

        <div className="index-list home-entry-list">
          {featuredPosts.map((post, index) => (
            <Link key={post.href} className="index-entry" href={post.href}>
              <span className="index-entry-count">{String(index + 1).padStart(2, "0")}</span>
              <div className="index-entry-copy">
                <Localized as="h3" zh={post.title.zh} en={post.title.en} />
                <Localized as="p" className="index-entry-summary" zh={post.summary.zh} en={post.summary.en} />
              </div>
              <span className="entry-action" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-section home-section-projects enter-rise delay-2" aria-labelledby="home-projects-title">
        <div className="home-section-head">
          <h2 id="home-projects-title" className="section-title">
            Toy Projs
          </h2>
        </div>

        <div className="project-list home-entry-list">
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
                  <Localized as="p" className="project-description" zh={project.description} en={enSite.projects[index].description} />
                </div>
                <span className="entry-action" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="home-section home-section-daily enter-rise delay-3" aria-labelledby="home-daily-title">
        <div className="home-section-head">
          <h2 id="home-daily-title" className="section-title">
            Daily Paper
          </h2>
          <Link className="index-more-link" href="/everyday-paper">
            <span>Queue</span>
            <span className="action-icon" aria-hidden="true">
              <ArrowOutIcon />
            </span>
          </Link>
        </div>

        <div className="daily-paper-list home-entry-list">
          {dailyPaperPicks.map((paper, index) => (
            <Link key={`${paper.date}-${paper.slug}`} className="daily-paper-row" href={`/everyday-paper/${paper.slug}`}>
              <span className="daily-paper-count">{String(index + 1).padStart(2, "0")}</span>
              <div className="daily-paper-row-copy">
                <Localized as="h3" zh={paper.title.zh} en={paper.title.en} />
                <div className="daily-paper-meta">
                  <span>{paper.date}</span>
                  <span>{paper.source}</span>
                </div>
              </div>
              <span className="entry-action" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
