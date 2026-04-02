import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { ArticleToc } from "../../../components/article-toc";
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
    <main className="stacked article-page">
      <div className="article-topline enter-rise">
        <Link className="article-back-link" href="/">
          <span aria-hidden="true">←</span>
          <Localized zh={dictionaries.zh.blog.backToHome} en={dictionaries.en.blog.backToHome} />
        </Link>
      </div>

      <header className="article-header enter-rise delay-1">
        <div className="article-meta-strip">
          <span>{post.date}</span>
          <span>{post.readingMinutes} min</span>
          <span>{post.language.toUpperCase()}</span>
        </div>
        <h1 className="article-title">{post.title}</h1>
        <div className="article-abstract">
          <Localized className="article-abstract-label" zh="摘要" en="Abstract" />
          <p className="article-abstract-copy">{post.summary}</p>
        </div>
        <div className="article-keywords">
          <Localized className="article-keywords-label" zh="关键词" en="Keywords" />
          <div className="tag-list article-tag-list">
            {post.tags.map((tag) => (
              <Link key={tag} className="tag article-tag" href={`/tags/${toTagSlug(tag)}`}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <section className="article-layout article-reading-layout">
        <article className="article-main enter-rise delay-2">
          <div className="prose article-prose">{content}</div>

          <nav className="post-navigation article-pagination" aria-label="Post navigation">
            {adjacent.previous ? (
              <Link className="article-nav-link" href={`/posts/${adjacent.previous.slug}`}>
                <div className="article-nav-label">
                  <Localized zh={dictionaries.zh.blog.previous} en={dictionaries.en.blog.previous} />
                </div>
                <div className="article-nav-title">{adjacent.previous.title}</div>
              </Link>
            ) : (
              <div />
            )}

            {adjacent.next ? (
              <Link className="article-nav-link article-nav-link-next" href={`/posts/${adjacent.next.slug}`}>
                <div className="article-nav-label">
                  <Localized zh={dictionaries.zh.blog.next} en={dictionaries.en.blog.next} />
                </div>
                <div className="article-nav-title">{adjacent.next.title}</div>
              </Link>
            ) : (
              <div />
            )}
          </nav>
        </article>

        {post.headings.length ? (
          <ArticleToc
            captionEn="Scroll aware"
            captionZh="滑动目录"
            headings={post.headings}
            titleEn="On this page"
            titleZh="本文目录"
          />
        ) : null}
      </section>
    </main>
  );
}
