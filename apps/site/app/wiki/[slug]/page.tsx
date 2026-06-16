import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "../../../components/site-header";
import { getAllWikiEntries, getWikiEntryBySlug, getWikiSlugs, renderWikiEntry } from "../../../lib/wiki";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getWikiSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const entry = getWikiEntryBySlug(slug);

  if (!entry) return {};

  return {
    title: `${entry.title} | Wiki`,
    description: entry.summary
  };
}

export default async function WikiEntryPage({ params }: PageProps) {
  const { slug } = await params;
  const entry = getWikiEntryBySlug(slug);

  if (!entry) notFound();

  const content = await renderWikiEntry(entry);

  const allEntries = getAllWikiEntries();
  const relatedEntries = (entry.related ?? [])
    .map((relSlug) => allEntries.find((e) => e.slug === relSlug))
    .filter((e): e is NonNullable<typeof e> => e != null);

  return (
    <main className="stacked site-home wiki-detail-page">
      <SiteHeader active="wiki" />

      <section className="hero-panel wiki-detail-hero enter-rise delay-1">
        <div className="hero-kicker-row">
          <span className="eyebrow">Wiki</span>
          <div className="issue-stamp">{entry.updated}</div>
        </div>
        <h1 className="display-title wiki-detail-title">{entry.title}</h1>
        <p className="kicker wiki-detail-summary">{entry.summary}</p>
        <div className="wiki-tag-cloud">
          {entry.tags.map((tag) => (
            <span key={tag} className="wiki-tag-pill">{tag}</span>
          ))}
        </div>
      </section>

      <section className="content-panel wiki-detail-body enter-rise delay-2">
        <Link className="index-more-link wiki-back-link" href="/wiki">
          <span>Back to Wiki</span>
        </Link>
        <article className="everyday-paper-prose wiki-prose">{content}</article>

        {relatedEntries.length > 0 && (
          <div className="wiki-related">
            <div className="wiki-related-label">Related</div>
            <div className="wiki-related-list">
              {relatedEntries.map((related) => (
                <Link key={related.slug} className="wiki-related-chip" href={`/wiki/${related.slug}`}>
                  {related.title}
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
