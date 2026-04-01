import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export type PostLanguage = "zh" | "en";

type Frontmatter = {
  title: string;
  date: string;
  summary: string;
  tags: string[];
  draft?: boolean;
  cover?: string;
  language: PostLanguage;
};

export type Heading = {
  id: string;
  text: string;
  level: number;
};

export type PostMeta = Frontmatter & {
  slug: string;
  readingMinutes: string;
};

export type Post = PostMeta & {
  source: string;
  headings: Heading[];
};

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");
const OBSIDIAN_ASSETS: Record<string, { src: string; alt: string; caption: string }> = {
  "Screenshot 2024-10-04 at 4.28.03 pm.png": {
    src: "/images/obsidian/transformer-encoder-decoder.png",
    alt: "Transformer encoder and decoder architecture",
    caption: "Transformer encoder-decoder overview"
  },
  "Screenshot 2024-10-04 at 4.57.23 pm.png": {
    src: "/images/obsidian/transformer-attention-diagram.png",
    alt: "Scaled dot-product attention diagram",
    caption: "Scaled dot-product attention"
  }
};

const prettyCodeOptions = {
  theme: {
    dark: "github-dark-dimmed",
    light: "github-light"
  },
  keepBackground: false
};

function walk(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const resolved = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(resolved);
    }

    return [resolved];
  });
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
    .replace(/\s+/g, "-");
}

export function toTagSlug(value: string) {
  return slugify(value);
}

function extractHeadings(markdown: string) {
  return markdown
    .split("\n")
    .map((line) => line.match(/^(##|###)\s+(.*)$/))
    .filter((match): match is RegExpMatchArray => Boolean(match))
    .map((match) => ({
      level: match[1].length,
      text: match[2].trim(),
      id: slugify(match[2].trim())
    }));
}

function normalizeObsidianMarkdown(markdown: string) {
  return markdown
    .replace(/^!\[\[(.+?)\]\]$/gm, (_, assetName: string) => {
      const asset = OBSIDIAN_ASSETS[assetName.trim()];

      if (!asset) {
        return `> Embedded asset omitted in web preview: ${assetName}`;
      }

      return `<figure class="obsidian-figure"><img src="${asset.src}" alt="${asset.alt}" /><figcaption>${asset.caption}</figcaption></figure>`;
    })
    .replace(/\[([^\]]+)\]\(obsidian:\/\/[^)]+\)/g, "$1")
    .replace(/\[\[(.+?)(\|.+?)?\]\]/g, "$1")
    .replace(/==(.+?)==/g, '<mark class="obsidian-highlight">$1</mark>')
    .replace(/~=\{[^}]+\}(.+?)=~/g, '<mark class="obsidian-highlight obsidian-highlight-danger">$1</mark>');
}

function readPostFile(filePath: string): Post {
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const normalizedContent = normalizeObsidianMarkdown(content);
  const stats = readingTime(normalizedContent);
  const slug = path.basename(filePath).replace(path.extname(filePath), "");
  const raw = data as Omit<Frontmatter, "date"> & { date: string | Date };
  const frontmatter: Frontmatter = {
    ...raw,
    date: typeof raw.date === "string" ? raw.date : raw.date.toISOString().slice(0, 10)
  };

  return {
    ...frontmatter,
    slug,
    source: normalizedContent,
    headings: extractHeadings(normalizedContent),
    readingMinutes: Math.max(1, Math.round(stats.minutes)).toString()
  };
}

export function getAllPosts() {
  return walk(POSTS_DIRECTORY)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map(readPostFile)
    .filter((post) => !post.draft)
    .sort((left, right) => right.date.localeCompare(left.date));
}

export function getFeaturedPosts(limit = 3) {
  return getAllPosts().slice(0, limit);
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getPostSlugs() {
  return getAllPosts().map((post) => post.slug);
}

export function getPostsByTag(tag: string) {
  return getAllPosts().filter((post) => post.tags.some((entry) => toTagSlug(entry) === tag.toLowerCase()));
}

export function getAllTags() {
  return [...new Set(getAllPosts().flatMap((post) => post.tags))].sort((left, right) => left.localeCompare(right));
}

export function getArchive() {
  const grouped = new Map<string, PostMeta[]>();

  for (const post of getAllPosts()) {
    const year = post.date.slice(0, 4);
    grouped.set(year, [...(grouped.get(year) ?? []), post]);
  }

  return [...grouped.entries()].map(([year, posts]) => ({ year, posts }));
}

export function getAdjacentPosts(slug: string) {
  const posts = getAllPosts();
  const index = posts.findIndex((post) => post.slug === slug);

  return {
    next: index > 0 ? posts[index - 1] : null,
    previous: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null
  };
}

export async function renderPost(post: Post) {
  const compiled = await compileMDX({
    source: post.source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex, [rehypePrettyCode, prettyCodeOptions]]
      }
    }
  });

  return compiled.content;
}
