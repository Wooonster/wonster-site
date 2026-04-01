import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { PostCard } from "../components/post-card";
import { getAllTags, getArchive, getFeaturedPosts, toTagSlug } from "../lib/content";

export default function BlogHomePage() {
  const posts = getFeaturedPosts(6);
  const tags = getAllTags();
  const archive = getArchive();
  const featured = posts[0];

  return (
    <main className="stacked">
      <section className="grid-two">
        <div className="hero-panel hero-copy enter-rise">
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
          <section className="signal-panel">
            <Localized className="section-title" zh="本周信号" en="Signal board" />
            <div className="stacked" style={{ gap: "0.55rem" }}>
              <div className="muted">
                <Localized zh="最新示例来自你的 Obsidian 论文笔记。" en="The latest examples now come directly from your Obsidian paper notes." />
              </div>
              {featured ? (
                <Link className="ghost-link" href={`/posts/${featured.slug}`}>
                  {featured.title}
                </Link>
              ) : null}
            </div>
          </section>

          <section className="content-panel">
            <Localized className="section-title" zh={dictionaries.zh.blog.tags} en={dictionaries.en.blog.tags} />
            <div className="tag-list">
              {tags.map((tag) => (
                <Link key={tag} className="tag" data-accent="true" href={`/tags/${toTagSlug(tag)}`}>
                  {tag}
                </Link>
              ))}
            </div>
          </section>

          <section className="content-panel">
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

      <section className="section-band enter-rise delay-2">
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
