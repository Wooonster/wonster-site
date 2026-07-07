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
import GithubSlugger from "github-slugger";

type PostLanguage = "zh" | "en";

type Frontmatter = {
  title: string;
  date: string;
  summary: string;
  tags?: string[];
  draft?: boolean;
  featured?: boolean;
  cover?: string;
  language: PostLanguage;
  readingMinutes?: string;
};

export type Heading = {
  id: string;
  text: string;
  level: number;
};

type PostMeta = Frontmatter & {
  slug: string;
  readingMinutes: string;
};

type Post = PostMeta & {
  source: string;
  headings: Heading[];
};

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "posts");

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

function extractHeadings(markdown: string) {
  const slugger = new GithubSlugger();

  return markdown
    .split("\n")
    .map((line) => {
      const markdownHeading = line.match(/^(##|###)\s+(.*)$/);

      if (markdownHeading) {
        return {
          level: markdownHeading[1].length,
          text: markdownHeading[2].trim()
        };
      }

      const htmlHeading = line.match(/^<h([23])(?:\s[^>]*)?>(.*?)<\/h\1>$/);

      if (!htmlHeading) {
        return null;
      }

      return {
        level: Number(htmlHeading[1]),
        text: htmlHeading[2].replace(/<[^>]+>/g, "").trim()
      };
    })
    .filter((heading): heading is { level: number; text: string } => Boolean(heading))
    .map((heading) => ({
      ...heading,
      id: slugger.slug(heading.text)
    }));
}

function normalizeObsidianMarkdown(markdown: string) {
  return markdown
    .replace(/^!\[\[(.+?)\]\]$/gm, (_, assetName: string) => {
      return `> Embedded asset omitted in web preview: ${assetName}`;
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
    readingMinutes: frontmatter.readingMinutes ?? Math.max(1, Math.round(stats.minutes)).toString()
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
  const posts = getAllPosts();
  const featured = posts.filter((post) => post.featured);

  return (featured.length ? featured : posts).slice(0, limit);
}

export function getPostBySlug(slug: string) {
  return getAllPosts().find((post) => post.slug === slug) ?? null;
}

export function getPostSlugs() {
  return getAllPosts().map((post) => post.slug);
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
