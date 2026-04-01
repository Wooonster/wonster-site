import { getAllPosts } from "../../lib/content";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts();

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>blog.whatsmy.fun</title>
    <link>https://blog.whatsmy.fun</link>
    <description>Markdown-first blog with math and code rendering.</description>
    ${posts
      .map(
        (post) => `<item>
      <title><![CDATA[${post.title}]]></title>
      <link>https://blog.whatsmy.fun/posts/${post.slug}</link>
      <guid>https://blog.whatsmy.fun/posts/${post.slug}</guid>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <description><![CDATA[${post.summary}]]></description>
    </item>`
      )
      .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
}

