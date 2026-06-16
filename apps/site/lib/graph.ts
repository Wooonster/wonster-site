import { getAllWikiEntries } from "./wiki";
import { getEverydayPapers } from "./everyday-paper";
import { getBlogPostMeta } from "./blog-meta";

export type GraphNode = {
  id: string;
  label: string;
  type: "wiki" | "paper" | "blog";
  tags: string[];
  url: string;
};

export type GraphEdge = {
  source: string;
  target: string;
  reason: "related" | "tag";
};

export type GraphData = {
  nodes: GraphNode[];
  edges: GraphEdge[];
  allTags: string[];
};

const MAX_TAG_BUCKET_SIZE = 10;

// Derive semantic tags from paper topic so they bridge into wiki/blog tag space
const TOPIC_TO_TAGS: Record<string, string[]> = {
  vlm:           ["VLM", "Multimodal", "Vision", "MLLM"],
  llm:           ["LLM", "Architecture", "Scaling"],
  reasoning:     ["LLM", "Reasoning", "Training"],
  rl:            ["Training", "Reasoning"],
  agent:         ["LLM", "Reasoning"],
  harness:       ["LLM", "Training"],
  "ai-for-health": [],
  "ai-in-med":   [],
};

// Derive extra tags from blog slug to bridge into wiki tag space
function inferBlogTags(slug: string, existing: string[]): string[] {
  const extras: string[] = [];
  const s = slug.toLowerCase();
  if (s.includes("clip"))        extras.push("Representation Learning", "Vision", "MLLM");
  if (s.includes("vit"))         extras.push("Vision", "Architecture");
  if (s.includes("transformer")) extras.push("Architecture", "Attention");
  if (s.includes("llava"))       extras.push("Multimodal", "Language", "VLM");
  if (s.includes("qwen"))        extras.push("Multimodal", "LLM", "VLM");
  if (s.includes("internvl"))    extras.push("Multimodal", "VLM");
  if (s.includes("deepseek"))    extras.push("Multimodal", "LLM", "VLM");
  if (s.includes("aimv"))        extras.push("Vision", "MLLM");
  if (s.includes("gspo"))        extras.push("Training", "Reasoning");
  return [...new Set([...existing, ...extras])];
}

export function buildGraphData(): GraphData {
  const wikis = getAllWikiEntries();
  const papers = getEverydayPapers();
  const blogs = getBlogPostMeta();

  const nodes: GraphNode[] = [
    ...wikis.map((w) => ({
      id: `wiki:${w.slug}`,
      label: w.title,
      type: "wiki" as const,
      tags: w.tags,
      url: `/wiki/${w.slug}`
    })),
    ...papers.map((p) => ({
      id: `paper:${p.slug}`,
      label: p.title.en,
      type: "paper" as const,
      tags: [...new Set([...(p.tags ?? []), ...(TOPIC_TO_TAGS[p.topic] ?? [])])],
      url: `/everyday-paper/${p.slug}`
    })),
    ...blogs.map((b) => ({
      id: `blog:${b.slug}`,
      label: b.title,
      type: "blog" as const,
      tags: inferBlogTags(b.slug, b.tags),
      url: `https://blog.whatsmy.fun/posts/${b.slug}`
    }))
  ];

  const nodeById = new Map(nodes.map((n) => [n.id, n]));
  const edgeSet = new Set<string>();
  const edges: GraphEdge[] = [];

  function addEdge(a: string, b: string, reason: GraphEdge["reason"]) {
    const key = [a, b].sort().join("::");
    if (edgeSet.has(key)) return;
    edgeSet.add(key);
    edges.push({ source: a, target: b, reason });
  }

  // Explicit wiki → wiki related edges
  for (const w of wikis) {
    for (const rel of w.related ?? []) {
      const targetId = `wiki:${rel}`;
      if (nodeById.has(targetId)) {
        addEdge(`wiki:${w.slug}`, targetId, "related");
      }
    }
  }

  // Cross-type tag edges
  const tagIndex = new Map<string, GraphNode[]>();
  for (const node of nodes) {
    for (const tag of node.tags) {
      const bucket = tagIndex.get(tag) ?? [];
      bucket.push(node);
      tagIndex.set(tag, bucket);
    }
  }

  for (const [, bucket] of tagIndex) {
    if (bucket.length < 2 || bucket.length > MAX_TAG_BUCKET_SIZE) continue;
    for (let i = 0; i < bucket.length; i++) {
      for (let j = i + 1; j < bucket.length; j++) {
        if (bucket[i].type !== bucket[j].type) {
          addEdge(bucket[i].id, bucket[j].id, "tag");
        }
      }
    }
  }

  const allTags = [...new Set(nodes.flatMap((n) => n.tags))].sort();

  return { nodes, edges, allTags };
}
