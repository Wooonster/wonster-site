import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { PostCard } from "../components/post-card";
import { getAllPosts, getAllTags, getArchive, toTagSlug } from "../lib/content";

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
  const featured = allPosts.find((post) => post.date.startsWith("2026")) ?? posts[0] ?? allPosts[0];

  return (
    <main className="stacked blog-home">
      <section className="grid-two blog-home-grid">
        <div className="hero-panel hero-copy enter-rise blog-home-hero">
          <Localized className="eyebrow" zh={dictionaries.zh.blog.eyebrow} en={dictionaries.en.blog.eyebrow} />
          <div className="mono-kicker">Research notes / Markdown / Math / Code</div>
          <h1 className="section-title" style={{ fontSize: "clamp(1.64rem, 3.15vw, 3.02rem)" }}>
            <Localized zh={dictionaries.zh.blog.heading} en={dictionaries.en.blog.heading} />
          </h1>
          <p className="kicker">
            <Localized zh={dictionaries.zh.blog.intro} en={dictionaries.en.blog.intro} />
          </p>
          <div className="signal-grid">
            <div className="signal-chip">
              <strong>{posts.length}</strong>
              <span>live notes</span>
            </div>
            <div className="signal-chip">
              <strong>{tags.length}</strong>
              <span>tag clusters</span>
            </div>
            <div className="signal-chip">
              <strong>MDX</strong>
              <span>math-ready prose</span>
            </div>
          </div>
          <div className="stack-inline">
            <Link className="solid-link" href="/archive">
              <Localized zh={dictionaries.zh.blog.viewArchive} en={dictionaries.en.blog.viewArchive} />
            </Link>
            <Link className="ghost-link" href="/feed.xml">
              <Localized zh={dictionaries.zh.blog.rss} en={dictionaries.en.blog.rss} />
            </Link>
          </div>
        </div>

        <aside className="stacked hero-metadata enter-rise delay-1">
          <section className="content-panel flat-panel blog-side-section">
            <Localized className="section-title" zh="精选文章" en="Featured note" />
            <div className="stacked" style={{ gap: "0.55rem" }}>
              <div className="muted">
                <Localized
                  zh="这里优先展示 2026 年归档里的论文笔记。"
                  en="This slot highlights a note from the 2026 archive first."
                />
              </div>
              {featured ? (
                <Link className="blog-inline-link" href={`/posts/${featured.slug}`}>
                  {featured.title}
                </Link>
              ) : null}
            </div>
          </section>

          <section className="content-panel flat-panel blog-side-section">
            <Localized className="section-title" zh={dictionaries.zh.blog.tags} en={dictionaries.en.blog.tags} />
            <div className="tag-list">
              {tags.map((tag) => (
                <Link key={tag} className="tag" data-accent="true" href={`/tags/${toTagSlug(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          <section className="content-panel flat-panel blog-side-section">
            <Localized className="section-title" zh={dictionaries.zh.blog.archive} en={dictionaries.en.blog.archive} />
            <div className="archive-list">
              {archive.map((entry) => (
                <div key={entry.year} className="meta-row">
                  <span>{entry.year}</span>
                  <span>{entry.posts.length}</span>
                </div>
              ))}
            </div>
          </section>
        </aside>
      </section>

      <section className="section-band enter-rise delay-3">
        <div className="section-head">
          <Localized className="section-title" zh={dictionaries.zh.blog.latest} en={dictionaries.en.blog.latest} />
          <div className="mono-kicker">
            <Localized zh="按研究方向归档" en="Filed by research direction" />
          </div>
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
