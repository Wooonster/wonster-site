import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { getArchive } from "../../lib/content";

export default function ArchivePage() {
  const archive = getArchive();

  return (
    <main className="stacked">
      <section className="hero-panel stacked">
        <Localized className="eyebrow" zh={dictionaries.zh.blog.archive} en={dictionaries.en.blog.archive} />
        <h1 className="section-title">
          <Localized zh={dictionaries.zh.blog.allPosts} en={dictionaries.en.blog.allPosts} />
        </h1>
      </section>

      <section className="stacked">
        {archive.map((entry) => (
          <div key={entry.year} className="content-panel stacked">
            <div className="section-title">{entry.year}</div>
            <div className="archive-list">
              {entry.posts.map((post) => (
                <Link key={post.slug} href={`/posts/${post.slug}`}>
                  <div className="meta-row">
                    <span>{post.date}</span>
                    <span>{post.title}</span>
                    <span>{post.readingMinutes} min</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

