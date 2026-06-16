import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type WikiFrontmatter = {
  title: string;
  summary: string;
  tags: string[];
  updated: string;
  related?: string[];
};

export type WikiEntry = WikiFrontmatter & {
  slug: string;
  source: string;
};

const WIKI_DIRECTORY = path.join(process.cwd(), "content", "wiki");

function normalizeFrontmatterDate(value: string | Date) {
  if (typeof value === "string") return value;
  return value.toISOString().slice(0, 10);
}

function readWikiFile(filePath: string): WikiEntry {
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const raw = data as Omit<WikiFrontmatter, "updated"> & { updated: string | Date };

  return {
    ...(raw as WikiFrontmatter),
    updated: normalizeFrontmatterDate(raw.updated),
    slug: path.basename(filePath).replace(path.extname(filePath), ""),
    source: content
  };
}

export function getAllWikiEntries(): WikiEntry[] {
  if (!fs.existsSync(WIKI_DIRECTORY)) return [];

  return fs
    .readdirSync(WIKI_DIRECTORY)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => readWikiFile(path.join(WIKI_DIRECTORY, file)))
    .sort((a, b) => b.updated.localeCompare(a.updated));
}

export function getWikiEntryBySlug(slug: string): WikiEntry | null {
  return getAllWikiEntries().find((entry) => entry.slug === slug) ?? null;
}

export function getWikiSlugs(): string[] {
  return getAllWikiEntries().map((entry) => entry.slug);
}

export async function renderWikiEntry(entry: WikiEntry) {
  const compiled = await compileMDX({
    source: entry.source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex]
      }
    }
  });

  return compiled.content;
}
