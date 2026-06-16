import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { getFeaturedPosts } from "../lib/content";

export default function BlogHomePage() {
  const featured = getFeaturedPosts(1)[0];

  return (
    <main className="stacked blog-home blog-index-page">
      <section className="blog-index-head enter-rise">
        <div className="blog-index-copy">
          <Localized className="eyebrow" zh="布劳格" en="Blog" />
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
    </main>
  );
}
