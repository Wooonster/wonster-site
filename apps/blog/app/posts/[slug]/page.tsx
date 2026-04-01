import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { getAdjacentPosts, getPostBySlug, getPostSlugs, renderPost, toTagSlug } from "../../../lib/content";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {};
  }

  return {
    title: post.title,
    description: post.summary,
    alternates: {
      canonical: `https://blog.whatsmy.fun/posts/${post.slug}`
    }
  };
}

export default async function PostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const content = await renderPost(post);
  const adjacent = getAdjacentPosts(slug);

  return (
    <main className="stacked">
      <Link className="ghost-link enter-rise" href="/">
        <Localized zh={dictionaries.zh.blog.backToHome} en={dictionaries.en.blog.backToHome} />
      </Link>

      <section className="hero-panel article-hero stacked enter-rise delay-1">
        <div className="eyebrow">{post.language.toUpperCase()}</div>
        <div className="mono-kicker">{post.date} / {post.readingMinutes} min / note</div>
        <h1 className="section-title" style={{ fontSize: "clamp(2.4rem, 4vw, 4rem)" }}>
          {post.title}
        </h1>
        <div className="article-summary-box">
          <p className="kicker" style={{ margin: 0 }}>{post.summary}</p>
        </div>
        <div className="meta-row">
          <Localized
            zh={`${dictionaries.zh.blog.languageLabel}: ${post.language.toUpperCase()}`}
            en={`${dictionaries.en.blog.languageLabel}: ${post.language.toUpperCase()}`}
          />
        </div>
        <div className="tag-list">
          {post.tags.map((tag) => (
            <Link key={tag} className="tag" href={`/tags/${toTagSlug(tag)}`}>
              {tag}
            </Link>
          ))}
        </div>
      </section>

      <section className="article-layout">
        <article className="article-main content-panel enter-rise delay-2">
          <div className="prose">{content}</div>

          <div className="post-navigation">
            {adjacent.previous ? (
              <Link className="content-panel nav-card" href={`/posts/${adjacent.previous.slug}`}>
                <div className="muted">
                  <Localized zh={dictionaries.zh.blog.previous} en={dictionaries.en.blog.previous} />
                </div>
                <div>{adjacent.previous.title}</div>
              </Link>
            ) : (
              <div />
            )}

            {adjacent.next ? (
              <Link className="content-panel nav-card" href={`/posts/${adjacent.next.slug}`}>
                <div className="muted">
                  <Localized zh={dictionaries.zh.blog.next} en={dictionaries.en.blog.next} />
                </div>
                <div>{adjacent.next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </div>
        </article>

        <aside className="article-aside content-panel enter-rise delay-3">
          <Localized className="section-title" zh={dictionaries.zh.blog.tableOfContents} en={dictionaries.en.blog.tableOfContents} />
          <div className="toc-list">
            {post.headings.map((heading) => (
              <a key={heading.id} href={`#${heading.id}`} style={{ paddingLeft: heading.level === 3 ? "1rem" : undefined }}>
                {heading.text}
              </a>
            ))}
          </div>
        </aside>
      </section>
    </main>
  );
}
