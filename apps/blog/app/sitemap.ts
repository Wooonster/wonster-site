import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags, toTagSlug } from "../lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://blog.whatsmy.fun";

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/archive`, changeFrequency: "monthly", priority: 0.8 },
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/posts/${post.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.9
    })),
    ...getAllTags().map((tag) => ({
      url: `${baseUrl}/tags/${toTagSlug(tag)}`,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
