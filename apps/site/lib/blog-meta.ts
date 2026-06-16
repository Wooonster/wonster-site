import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type BlogPostMeta = {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  language: "zh" | "en";
};

const BLOG_POSTS_DIR = path.join(process.cwd(), "..", "blog", "content", "posts");

function normalizeFrontmatterDate(value: string | Date | undefined): string {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}

export function getBlogPostMeta(): BlogPostMeta[] {
  if (!fs.existsSync(BLOG_POSTS_DIR)) return [];

  return fs
    .readdirSync(BLOG_POSTS_DIR)
    .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
    .map((f) => {
      const raw = fs.readFileSync(path.join(BLOG_POSTS_DIR, f), "utf8");
      const { data } = matter(raw);

      return {
        slug: path.basename(f, path.extname(f)),
        title: (data.title as string) ?? "",
        date: normalizeFrontmatterDate(data.date as string | Date | undefined),
        summary: (data.summary as string) ?? "",
        tags: (data.tags as string[]) ?? [],
        language: ((data.language as string) ?? "zh") as "zh" | "en",
        draft: (data.draft as boolean) ?? false
      };
    })
    .filter((p) => !("draft" in p && p.draft))
    .map(({ draft: _draft, ...rest }) => rest);
}
