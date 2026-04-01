import Link from "next/link";
import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { PostCard } from "../../../components/post-card";
import { getAllTags, getPostsByTag, toTagSlug } from "../../../lib/content";

type PageProps = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  return getAllTags().map((tag) => ({
    tag: toTagSlug(tag)
  }));
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params;
  const decodedTag = decodeURIComponent(tag);
  const posts = getPostsByTag(decodedTag);

  return (
    <main className="stacked">
      <Link className="ghost-link" href="/">
        <Localized zh={dictionaries.zh.blog.backToHome} en={dictionaries.en.blog.backToHome} />
      </Link>
      <section className="hero-panel stacked">
        <Localized className="eyebrow" zh={dictionaries.zh.blog.filterBy} en={dictionaries.en.blog.filterBy} />
        <h1 className="section-title">#{decodedTag}</h1>
        <p className="kicker">
          <Localized zh={dictionaries.zh.blog.allPosts} en={dictionaries.en.blog.allPosts} />: {posts.length}
        </p>
      </section>

      <section className="post-list">
        {posts.length > 0 ? (
          posts.map((post) => <PostCard key={post.slug} post={post} />)
        ) : (
          <div className="content-panel">
            <Localized zh={dictionaries.zh.blog.noPosts} en={dictionaries.en.blog.noPosts} />
          </div>
        )}
      </section>
    </main>
  );
}
