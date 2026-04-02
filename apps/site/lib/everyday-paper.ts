import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

export type EverydayPaperFrontmatter = {
  title: string;
  slug: string;
  date: string;
  topic: string;
  cardSummary: string;
  source: "arXiv" | "alphaXiv" | "X";
  arxivUrl: string;
  alphaxivUrl: string;
  xUrl?: string;
  authors?: string[];
  tags?: string[];
};

export type EverydayPaperEntry = EverydayPaperFrontmatter;

export type EverydayPaper = EverydayPaperEntry & {
  sourceMarkdown: string;
};

const EVERYDAY_PAPER_DIRECTORY = path.join(process.cwd(), "content", "everyday-paper");

function normalizeFrontmatterDate(value: string | Date) {
  if (typeof value === "string") {
    return value;
  }

  return value.toISOString().slice(0, 10);
}

function normalizePaperMarkdown(source: string) {
  return source
    .replace(/\\textbf\{([^{}]+)\}/g, "**$1**")
    .replace(/\\textit\{([^{}]+)\}/g, "*$1*")
    .replace(/\\emph\{([^{}]+)\}/g, "*$1*")
    .replace(/\\mathbf\{([^{}]+)\}/g, "$1")
    .replace(/\\mathrm\{([^{}]+)\}/g, "$1")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/~/g, " ");
}

function readEverydayPaperFile(filePath: string): EverydayPaper {
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = {
    ...(data as EverydayPaperFrontmatter),
    date: normalizeFrontmatterDate((data as EverydayPaperFrontmatter & { date: string | Date }).date)
  };

  return {
    ...frontmatter,
    sourceMarkdown: normalizePaperMarkdown(content)
  };
}

export function getEverydayPapers() {
  if (!fs.existsSync(EVERYDAY_PAPER_DIRECTORY)) {
    return [] as EverydayPaperEntry[];
  }

  return fs
    .readdirSync(EVERYDAY_PAPER_DIRECTORY)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => readEverydayPaperFile(path.join(EVERYDAY_PAPER_DIRECTORY, file)))
    .sort((left, right) => right.date.localeCompare(left.date))
    .map(({ sourceMarkdown, ...meta }) => meta);
}

export function getEverydayPaperBySlug(slug: string) {
  if (!fs.existsSync(EVERYDAY_PAPER_DIRECTORY)) {
    return null as EverydayPaper | null;
  }

  const filePath = fs
    .readdirSync(EVERYDAY_PAPER_DIRECTORY)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => path.join(EVERYDAY_PAPER_DIRECTORY, file))
    .find((candidatePath) => readEverydayPaperFile(candidatePath).slug === slug);

  if (!filePath) {
    return null;
  }

  return readEverydayPaperFile(filePath);
}

export function getEverydayPaperSlugs() {
  return getEverydayPapers().map((paper) => paper.slug);
}

export async function renderEverydayPaper(paper: EverydayPaper) {
  const compiled = await compileMDX({
    source: paper.sourceMarkdown,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex]
      }
    }
  });

  return compiled.content;
}
