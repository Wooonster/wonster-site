import type { MetadataRoute } from "next";
import { getAllPosts } from "../lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://blog.whatsmy.fun";

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9
    }))
  ];
}
