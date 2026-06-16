import Link from "next/link";
import { getFeaturedPosts } from "../lib/content";

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
  const featured = getFeaturedPosts(1)[0];

  return (
    <main className="stacked blog-home blog-index-page">
      <section className="blog-home-section enter-rise delay-1">
        {featured ? (
          <div className="blog-home-entry-list">
            <Link className="blog-home-entry" href={`/posts/${featured.slug}`}>
              <span className="blog-home-entry-count">{String(1).padStart(2, "0")}</span>
              <div className="blog-home-entry-copy">
                <div className="blog-home-entry-meta">
                  <span>{featured.date}</span>
                  <span>{featured.readingMinutes} min</span>
                  <span>{featured.language.toUpperCase()}</span>
                </div>
                <h2>
                  {featured.title}
                </h2>
                <p>{featured.summary}</p>
              </div>
              <span className="blog-home-entry-action" aria-hidden="true">
                <ArrowOutIcon />
              </span>
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
