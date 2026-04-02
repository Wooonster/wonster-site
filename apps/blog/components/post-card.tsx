import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { toTagSlug, type PostMeta } from "../lib/content";

export function PostCard({ post, index = 0 }: { post: PostMeta; index?: number }) {
  return (
    <article className={`post-card enter-rise delay-${Math.min(index + 1, 4)}`}>
      <div className="meta-row">
        <span>{post.date}</span>
        <span>{post.readingMinutes} min</span>
        <span>{post.language.toUpperCase()}</span>
      </div>
      <h3>{post.title}</h3>
      <p className="muted">{post.summary}</p>
      <div className="tag-list">
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
    </article>
  );
}
