import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Localized } from "@whatsmy/ui";
import { SiteHeader } from "../../../components/site-header";
import { getEverydayPaperBySlug, getEverydayPaperSlugs, renderEverydayPaper } from "../../../lib/everyday-paper";

type PageProps = {
  params: Promise<{ slug: string }>;
};

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

export async function generateStaticParams() {
  return getEverydayPaperSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const paper = getEverydayPaperBySlug(slug);

  if (!paper) {
    return {};
  }

  return {
    title: `${paper.title.en} | Everyday Paper`,
    description: paper.cardSummary.en
  };
}

export default async function EverydayPaperDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const paper = getEverydayPaperBySlug(slug);

  if (!paper) {
    notFound();
  }

  const content = await renderEverydayPaper(paper);

  return (
    <main className="stacked site-home everyday-paper-detail-page">
      <SiteHeader active="everyday-paper" />

      <section className="hero-panel everyday-paper-detail-hero enter-rise delay-1">
        <div className="hero-kicker-row">
          <Localized className="eyebrow" zh="Everyday Paper" en="Everyday Paper" />
          <div className="issue-stamp">{paper.date}</div>
        </div>
        <Localized as="h1" className="display-title everyday-paper-detail-title" zh={paper.title.zh} en={paper.title.en} />
        <Localized
          as="p"
          className="kicker everyday-paper-detail-summary"
          zh={paper.cardSummary.zh}
          en={paper.cardSummary.en}
        />

        <div className="everyday-paper-detail-meta">
          <span>{paper.topic}</span>
          <span>{paper.source}</span>
          {paper.authors?.length ? <span>{paper.authors.join(", ")}</span> : null}
        </div>

        <div className="stack-inline everyday-paper-detail-links">
          <Link className="solid-link" href={paper.arxivUrl} rel="noreferrer" target="_blank">
            <span>arXiv</span>
            <span className="action-icon" aria-hidden="true">
              <ArrowOutIcon />
            </span>
          </Link>
          <Link className="ghost-link" href={paper.alphaxivUrl} rel="noreferrer" target="_blank">
            <span>alphaXiv</span>
            <span className="action-icon" aria-hidden="true">
              <ArrowOutIcon />
            </span>
          </Link>
          {paper.xUrl ? (
            <Link className="ghost-link" href={paper.xUrl} rel="noreferrer" target="_blank">
              <span>X</span>
              <span className="action-icon" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </Link>
          ) : null}
        </div>
      </section>

      <section className="content-panel everyday-paper-detail-body enter-rise delay-2">
        <Link className="index-more-link everyday-paper-back-link" href="/everyday-paper">
          <span>Back to Everyday Paper</span>
        </Link>
        <Localized as="article" className="everyday-paper-prose" zh={content.zh} en={content.en} />
      </section>
    </main>
  );
}
