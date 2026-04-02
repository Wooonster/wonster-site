import fs from "node:fs";
import path from "node:path";
import type { ReactNode } from "react";
import matter from "gray-matter";
import { compileMDX } from "next-mdx-remote/rsc";
import type { LocalePreference } from "@whatsmy/config";
import rehypeKatex from "rehype-katex";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";

type LocalizedValue<T> = {
  zh: T;
  en: T;
};

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

type EverydayPaperVariant = EverydayPaperFrontmatter & {
  locale?: LocalePreference;
  sourceMarkdown: string;
};

export type EverydayPaperEntry = Omit<EverydayPaperFrontmatter, "title" | "cardSummary"> & {
  title: LocalizedValue<string>;
  cardSummary: LocalizedValue<string>;
};

export type EverydayPaper = EverydayPaperEntry & {
  sourceMarkdown: LocalizedValue<string>;
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

function inferLocaleFromFilePath(filePath: string): LocalePreference | undefined {
  if (/_cn\.mdx?$/i.test(filePath)) {
    return "zh";
  }

  if (/_en\.mdx?$/i.test(filePath)) {
    return "en";
  }

  return undefined;
}

function normalizeLocalizedValue<T>(value: Partial<Record<LocalePreference, T>>): LocalizedValue<T> {
  const fallback = value.zh ?? value.en;

  if (!fallback) {
    throw new Error("Expected at least one localized value.");
  }

  return {
    zh: value.zh ?? fallback,
    en: value.en ?? fallback
  };
}

function readEverydayPaperFile(filePath: string): EverydayPaperVariant {
  const source = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const frontmatter = {
    ...(data as EverydayPaperFrontmatter),
    date: normalizeFrontmatterDate((data as EverydayPaperFrontmatter & { date: string | Date }).date),
    locale: inferLocaleFromFilePath(filePath)
  };

  return {
    ...frontmatter,
    sourceMarkdown: normalizePaperMarkdown(content)
  };
}

function getEverydayPaperVariants() {
  if (!fs.existsSync(EVERYDAY_PAPER_DIRECTORY)) {
    return [] as EverydayPaperVariant[];
  }

  return fs
    .readdirSync(EVERYDAY_PAPER_DIRECTORY)
    .filter((file) => file.endsWith(".md") || file.endsWith(".mdx"))
    .map((file) => readEverydayPaperFile(path.join(EVERYDAY_PAPER_DIRECTORY, file)));
}

function mergeEverydayPaperVariants(variants: EverydayPaperVariant[]): EverydayPaper {
  const [firstVariant] = variants;

  if (!firstVariant) {
    throw new Error("Expected at least one paper variant to merge.");
  }

  const localizedTitle: Partial<Record<LocalePreference, string>> = {};
  const localizedSummary: Partial<Record<LocalePreference, string>> = {};
  const localizedMarkdown: Partial<Record<LocalePreference, string>> = {};

  for (const variant of variants) {
    if (variant.locale) {
      localizedTitle[variant.locale] = variant.title;
      localizedSummary[variant.locale] = variant.cardSummary;
      localizedMarkdown[variant.locale] = variant.sourceMarkdown;
      continue;
    }

    localizedTitle.zh = variant.title;
    localizedTitle.en = variant.title;
    localizedSummary.zh = variant.cardSummary;
    localizedSummary.en = variant.cardSummary;
    localizedMarkdown.zh = variant.sourceMarkdown;
    localizedMarkdown.en = variant.sourceMarkdown;
  }

  return {
    slug: firstVariant.slug,
    date: firstVariant.date,
    topic: firstVariant.topic,
    source: firstVariant.source,
    arxivUrl: firstVariant.arxivUrl,
    alphaxivUrl: firstVariant.alphaxivUrl,
    xUrl: firstVariant.xUrl,
    authors: firstVariant.authors,
    tags: firstVariant.tags,
    title: normalizeLocalizedValue(localizedTitle),
    cardSummary: normalizeLocalizedValue(localizedSummary),
    sourceMarkdown: normalizeLocalizedValue(localizedMarkdown)
  };
}

function getMergedEverydayPapers() {
  const groupedPapers = new Map<string, EverydayPaperVariant[]>();

  for (const variant of getEverydayPaperVariants()) {
    const existingVariants = groupedPapers.get(variant.slug) ?? [];
    existingVariants.push(variant);
    groupedPapers.set(variant.slug, existingVariants);
  }

  return [...groupedPapers.values()]
    .map((variants) => mergeEverydayPaperVariants(variants))
    .sort((left, right) => {
      const dateComparison = right.date.localeCompare(left.date);

      if (dateComparison !== 0) {
        return dateComparison;
      }

      return left.slug.localeCompare(right.slug);
    });
}

export function getEverydayPapers() {
  return getMergedEverydayPapers().map(({ sourceMarkdown, ...meta }) => meta);
}

export function getEverydayPaperBySlug(slug: string) {
  return getMergedEverydayPapers().find((paper) => paper.slug === slug) ?? null;
}

export function getEverydayPaperSlugs() {
  return getEverydayPapers().map((paper) => paper.slug);
}

async function compileEverydayPaperMarkdown(source: string) {
  const compiled = await compileMDX({
    source,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkMath],
        rehypePlugins: [rehypeSlug, rehypeKatex]
      }
    }
  });

  return compiled.content;
}

export async function renderEverydayPaper(paper: EverydayPaper): Promise<LocalizedValue<ReactNode>> {
  const zhContent = await compileEverydayPaperMarkdown(paper.sourceMarkdown.zh);

  if (paper.sourceMarkdown.en === paper.sourceMarkdown.zh) {
    return {
      zh: zhContent,
      en: zhContent
    };
  }

  return {
    zh: zhContent,
    en: await compileEverydayPaperMarkdown(paper.sourceMarkdown.en)
  };
}
