import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { toTagSlug, type PostMeta } from "../lib/content";

export function PostCard({ post, index = 0 }: { post: PostMeta; index?: number }) {
  const ordinal = String(index + 1).padStart(2, "0");

  return (
    <article className={`post-card enter-rise delay-${Math.min(index + 1, 4)}`}>
      <div className="post-card-index" aria-hidden="true">
        {ordinal}
      </div>
      <div className="post-card-body">
        <div className="meta-row post-card-meta">
          <span>{post.date}</span>
          <span>{post.readingMinutes} min</span>
          <span>{post.language.toUpperCase()}</span>
        </div>
        <h3>
          <Link href={`/posts/${post.slug}`}>{post.title}</Link>
        </h3>
        <p className="muted post-card-summary">{post.summary}</p>
        <div className="post-card-bottom">
          <div className="tag-list post-card-tags">
            {post.tags.map((tag) => (
              <Link key={tag} className="tag" href={`/tags/${toTagSlug(tag)}`}>
                {tag}
              </Link>
            ))}
          </div>
          <Link className="post-card-link" href={`/posts/${post.slug}`}>
            <Localized zh={dictionaries.zh.blog.readArticle} en={dictionaries.en.blog.readArticle} />
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
