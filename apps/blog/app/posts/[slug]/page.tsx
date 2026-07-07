import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { ArticleToc } from "../../../components/article-toc";
import { getPostBySlug, getPostSlugs, renderPost } from "../../../lib/content";

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

  return (
    <main className={`stacked article-page article-slug-${post.slug}`}>
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
        <div className="article-title-wrap">
          <h1 className="article-title">{post.title}</h1>
        </div>
        <div className="article-abstract">
          <Localized className="article-abstract-label" zh="0 · 摘要" en="0 · Abstract" />
          <p className="article-abstract-copy">{post.summary}</p>
        </div>
      </header>

      {post.headings.length ? (
        <ArticleToc
          headings={post.headings}
          titleEn="Contents"
          titleZh="目录"
        />
      ) : null}

      <section className="article-layout article-reading-layout">
        <article className="article-main enter-rise delay-2">
          <div className="prose article-prose">{content}</div>
        </article>
      </section>
    </main>
  );
}
