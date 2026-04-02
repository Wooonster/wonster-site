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

export type PaperLinks = {
  arxiv?: string;
  alphaxiv?: string;
  x?: string;
};

export type PaperPrimarySource = "arXiv" | "alphaXiv" | "X";

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

export type DailyPaperEntry = {
  id: string;
  title: string;
  summary: string;
  recommendedAt: string;
  readingMinutes: string;
  author: string;
  links: PaperLinks;
  tags?: readonly string[];
  primaryHref: string | null;
  primarySource: PaperPrimarySource | null;
};

export type DailyPaperGroup = {
  date: string;
  items: DailyPaperEntry[];
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

const EVERYDAY_PAPER_ENTRIES = [
  {
    id: "vit-editorial-pick",
    title: "An Image Is Worth 16x16 Words: Transformers for Image Recognition at Scale",
    summary:
      "A vision-first turning point: replace convolution-heavy image modeling with pure transformer blocks and show that scale, patching, and data can make the approach competitive.",
    recommendedAt: "2026-04-01",
    readingMinutes: "18",
    author: "Alexey Dosovitskiy et al.",
    links: {
      arxiv: "https://arxiv.org/abs/2010.11929"
    },
    tags: ["Vision", "Transformer"]
  },
  {
    id: "clip-editorial-pick",
    title: "Learning Transferable Visual Models From Natural Language Supervision",
    summary:
      "CLIP reframes image understanding as language-aligned contrastive learning, giving us a durable template for zero-shot transfer and multimodal representation design.",
    recommendedAt: "2026-03-31",
    readingMinutes: "16",
    author: "Alec Radford et al.",
    links: {
      alphaxiv: "https://www.alphaxiv.org/abs/2103.00020"
    },
    tags: ["Multimodal", "Representation Learning"]
  },
  {
    id: "llava-editorial-pick",
    title: "Visual Instruction Tuning",
    summary:
      "LLaVA shows how a compact visual projector plus instruction tuning can turn a general LLM into a capable multimodal assistant with surprisingly little architectural complexity.",
    recommendedAt: "2026-03-30",
    readingMinutes: "14",
    author: "Haotian Liu et al.",
    links: {
      arxiv: "https://arxiv.org/abs/2304.08485"
    },
    tags: ["MLLM", "Instruction Tuning"]
  }
] as const;

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

function resolvePaperPrimaryLink(links: PaperLinks) {
  if (links.arxiv) {
    return { href: links.arxiv, source: "arXiv" as const };
  }

  if (links.alphaxiv) {
    return { href: links.alphaxiv, source: "alphaXiv" as const };
  }

  if (links.x) {
    return { href: links.x, source: "X" as const };
  }

  return { href: null, source: null };
}

export function getEverydayPaperGroups() {
  const grouped = new Map<string, DailyPaperEntry[]>();

  for (const paper of EVERYDAY_PAPER_ENTRIES) {
    const primary = resolvePaperPrimaryLink(paper.links);
    const entry: DailyPaperEntry = {
      ...paper,
      primaryHref: primary.href,
      primarySource: primary.source
    };

    grouped.set(entry.recommendedAt, [...(grouped.get(entry.recommendedAt) ?? []), entry]);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, items]) => ({
      date,
      items
    }));
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
