import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import { getAllWikiEntries } from "../../lib/wiki";
import { buildGraphData } from "../../lib/graph";
import { WikiGraphPage } from "./wiki-graph-page";

export const metadata: Metadata = {
  title: "Wiki | whatsmy.fun",
  description: "A persistent knowledge base of ML/AI concepts — compiled once, kept current."
};

export default function WikiPage() {
  const entries = getAllWikiEntries();
  const graphData = buildGraphData();

  return (
    <main className="stacked site-home wiki-page">
      <SiteHeader active="wiki" />

      {/* Hero — editorial, not generic */}
      <section className="wiki-hero enter-rise delay-1">
        <div className="wiki-hero-rule" aria-hidden="true" />
        <div className="wiki-hero-body">
          <div className="wiki-hero-tag">Knowledge Base</div>
          <h1 className="wiki-hero-title">
            Compiled,<br />cross-referenced.
          </h1>
          <p className="wiki-hero-lead">
            ML/AI concepts written once and kept current — each entry synthesises
            primary papers, not summaries of summaries.
          </p>
        </div>
        <div className="wiki-hero-stamp" aria-hidden="true">WIKI</div>
      </section>

      {/* Concept map + tag filter */}
      <WikiGraphPage data={graphData} />

      {/* Entry list */}
      <section className="wiki-index enter-rise delay-3">
        <div className="wiki-index-head">
          <h2 className="wiki-index-title">All entries</h2>
          <span className="wiki-index-count">{entries.length}</span>
        </div>

        <div className="wiki-entry-list">
          {entries.map((entry, index) => (
            <Link
              key={entry.slug}
              className="wiki-entry-row"
              href={`/wiki/${entry.slug}`}
              style={{ "--row-i": index } as React.CSSProperties}
            >
              <span className="wiki-entry-num">{String(index + 1).padStart(2, "0")}</span>
              <div className="wiki-entry-copy">
                <h3 className="wiki-entry-title">{entry.title}</h3>
                <p className="wiki-entry-summary">{entry.summary}</p>
                <div className="wiki-entry-meta">
                  <span className="wiki-entry-date">{entry.updated}</span>
                  {entry.tags.map((tag) => (
                    <span key={tag} className="wiki-entry-tag">{tag}</span>
                  ))}
                </div>
              </div>
              <svg className="wiki-entry-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M6.25 13.75 13.75 6.25M8 6.25h5.75V12"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.6"
                />
              </svg>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
