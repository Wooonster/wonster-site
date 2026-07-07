import Link from "next/link";
import { getAllPosts } from "../lib/content";

function ArrowOutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.25 13.75 13.75 6.25M8 6.25h5.75V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export default function BlogHomePage() {
  const posts = getAllPosts();

  return (
    <main className="stacked blog-home blog-index-page">
      <section className="blog-home-section enter-rise delay-1">
        {posts.length > 0 ? (
          <div className="blog-home-entry-list">
            {posts.map((post, index) => (
              <Link key={post.slug} className="blog-home-entry" href={`/posts/${post.slug}`}>
                <span className="blog-home-entry-count">{String(index + 1).padStart(2, "0")}</span>
                <div className="blog-home-entry-copy">
                  <div className="blog-home-entry-meta">
                    <span>{post.date}</span>
                    <span>{post.readingMinutes} min</span>
                    <span>{post.language.toUpperCase()}</span>
                  </div>
                  <h2>{post.title}</h2>
                  <p>{post.summary}</p>
                </div>
                <span className="blog-home-entry-action" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </section>
    </main>
  );
}
