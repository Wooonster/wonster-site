import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { PostCard } from "../components/post-card";
import { getAllPosts, getAllTags, getArchive, getFeaturedPosts, toTagSlug } from "../lib/content";

function isWithinRecentWindow(date: string) {
  const publishedAt = new Date(`${date}T00:00:00`);
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - 18);

  return publishedAt >= cutoff;
}

export default function BlogHomePage() {
  const allPosts = getAllPosts();
  const posts = allPosts.filter((post) => isWithinRecentWindow(post.date));
  const tags = getAllTags();
  const archive = getArchive();
  const featured = getFeaturedPosts(1)[0] ?? posts[0] ?? allPosts[0];

  return (
    <main className="stacked blog-home blog-index-page">
      <section className="blog-index-head enter-rise">
        <div className="blog-index-copy">
          <Localized className="eyebrow" zh="Blog" en="Blog" />
        </div>
        <div className="stack-inline">
          <Link className="ghost-link" href="/archive">
            <Localized zh={dictionaries.zh.blog.viewArchive} en={dictionaries.en.blog.viewArchive} />
          </Link>
          <Link className="ghost-link" href="/feed.xml">
            <Localized zh={dictionaries.zh.blog.rss} en={dictionaries.en.blog.rss} />
          </Link>
        </div>
      </section>

      {featured ? (
        <section className="blog-featured-row enter-rise delay-1">
          <Localized className="post-card-index" zh="精选" en="Pick" />
          <div className="blog-featured-copy">
            <Link href={`/posts/${featured.slug}`}>{featured.title}</Link>
            <p>{featured.summary}</p>
          </div>
        </section>
      ) : null}

      <section className="blog-meta-grid enter-rise delay-2">
        <div className="blog-meta-block">
          <Localized className="article-keywords-label" zh={dictionaries.zh.blog.tags} en={dictionaries.en.blog.tags} />
          <div className="tag-list">
            {tags.map((tag) => (
              <Link key={tag} className="tag" data-accent="true" href={`/tags/${toTagSlug(tag)}`}>
                {tag}
              </Link>
            ))}
          </div>
        </div>
        <div className="blog-meta-block">
          <Localized className="article-keywords-label" zh={dictionaries.zh.blog.archive} en={dictionaries.en.blog.archive} />
          <div className="archive-list">
            {archive.map((entry) => (
              <div key={entry.year} className="meta-row">
                <span>{entry.year}</span>
                <span>{entry.posts.length}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-band enter-rise delay-3">
        <div className="section-head">
          <Localized className="section-title" zh={dictionaries.zh.blog.latest} en={dictionaries.en.blog.latest} />
        </div>
        <div className="post-list">
          {posts.map((post, index) => (
            <PostCard key={post.slug} post={post} index={index} />
          ))}
        </div>
      </section>
    </main>
  );
}
