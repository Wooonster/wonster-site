import Link from "next/link";
import { Localized } from "@whatsmy/ui";
import { SiteHeader } from "../../components/site-header";
import { getEverydayPapers } from "../../lib/everyday-paper";

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

export default function EverydayPaperPage() {
  const dailyPaperPicks = getEverydayPapers();

  return (
    <main className="stacked site-home everyday-paper-page">
      <SiteHeader active="everyday-paper" />

      <section className="hero-panel everyday-paper-hero enter-rise delay-1">
        <div className="hero-kicker-row">
          <Localized className="eyebrow" zh="Everyday Paper" en="Everyday Paper" />
          <div className="issue-stamp">Edition 01</div>
        </div>
        <h1 className="display-title everyday-paper-display">
          <Localized zh="每天都能直接打开的论文入口。" en="A paper queue worth opening every day." />
        </h1>
        <p className="kicker everyday-paper-lead">
          <Localized
            zh="这里单独收住近期在看的论文入口，按时间排开，适合快速进入原文、alphaXiv 讲解页，或者外部线程。"
            en="A standalone stream of recent paper picks, arranged by date and designed for quick entry into the original paper, alphaXiv, or an external thread."
          />
        </p>
      </section>

      <section className="content-panel everyday-paper-archive enter-rise delay-2">
        <div className="section-head everyday-paper-archive-head">
          <Localized className="section-title" zh="Paper Queue" en="Paper Queue" />
          <div className="mono-kicker">{`Recent ${String(dailyPaperPicks.length).padStart(2, "0")}`}</div>
        </div>
        <div className="everyday-paper-archive-list">
          {dailyPaperPicks.map((paper, index) => (
            <article key={`${paper.date}-${paper.slug}`} className="everyday-paper-archive-card">
              <div className="everyday-paper-archive-topline">
                <span className="daily-paper-count">{String(index + 1).padStart(2, "0")}</span>
                <span className="everyday-paper-source-pill">{paper.source}</span>
              </div>
              <Link className="everyday-paper-archive-mainlink" href={`/everyday-paper/${paper.slug}`}>
                <h2>{paper.title}</h2>
                <p>{paper.cardSummary}</p>
              </Link>
              <div className="everyday-paper-archive-meta">
                <span>{paper.date}</span>
                <span>{paper.topic}</span>
              </div>
              <div className="stack-inline everyday-paper-archive-links">
                <Link className="index-more-link" href={`/everyday-paper/${paper.slug}`}>
                  <span>Open summary</span>
                </Link>
                <Link className="ghost-link everyday-paper-source-link" href={paper.arxivUrl} target="_blank" rel="noreferrer">
                  <span>arXiv</span>
                  <span className="action-icon everyday-paper-archive-action" aria-hidden="true">
                    <ArrowOutIcon />
                  </span>
                </Link>
                <Link className="ghost-link everyday-paper-source-link" href={paper.alphaxivUrl} target="_blank" rel="noreferrer">
                  <span>alphaXiv</span>
                  <span className="action-icon everyday-paper-archive-action" aria-hidden="true">
                    <ArrowOutIcon />
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
