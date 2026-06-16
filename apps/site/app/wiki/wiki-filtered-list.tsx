"use client";

import Link from "next/link";
import type { GraphNode } from "../../lib/graph";

interface Props {
  nodes: GraphNode[];
  selectedTags: Set<string>;
}

const TYPE_LABEL: Record<GraphNode["type"], string> = {
  wiki: "Wiki entries",
  paper: "Daily papers",
  blog: "Blog posts",
};

const TYPE_COLOR: Record<GraphNode["type"], string> = {
  wiki: "oklch(61% 0.13 29)",
  paper: "oklch(62% 0.09 155)",
  blog: "oklch(58% 0.1 238)",
};

export function WikiFilteredList({ nodes, selectedTags }: Props) {
  if (selectedTags.size === 0) return null;

  const matched = nodes.filter((n) => n.tags.some((t) => selectedTags.has(t)));

  if (matched.length === 0) {
    return (
      <div className="wiki-results-empty">
        No entries match the selected tags.
      </div>
    );
  }

  const groups: Record<GraphNode["type"], GraphNode[]> = { wiki: [], paper: [], blog: [] };
  for (const n of matched) groups[n.type].push(n);

  return (
    <div className="wiki-results">
      {(["wiki", "paper", "blog"] as const).map((type) => {
        const items = groups[type];
        if (items.length === 0) return null;
        return (
          <div key={type} className="wiki-results-group">
            <div className="wiki-results-group-label">
              <span
                className="wiki-results-group-dot"
                style={{ background: TYPE_COLOR[type] }}
              />
              {TYPE_LABEL[type]}
              <span className="wiki-results-group-count">{items.length}</span>
            </div>
            <div className="wiki-results-list">
              {items.map((item, i) => (
                <Link
                  key={item.id}
                  className="wiki-result-row"
                  href={item.url}
                  target={item.type === "blog" ? "_blank" : undefined}
                  rel={item.type === "blog" ? "noreferrer" : undefined}
                  style={{ "--result-i": i } as React.CSSProperties}
                >
                  <span
                    className="wiki-result-accent"
                    style={{ background: TYPE_COLOR[type] }}
                  />
                  <span className="wiki-result-label">{item.label}</span>
                  <span className="wiki-result-tags">
                    {item.tags
                      .filter((t) => selectedTags.has(t))
                      .map((t) => (
                        <span key={t} className="wiki-result-tag">{t}</span>
                      ))}
                  </span>
                  <svg className="wiki-result-arrow" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <path d="M3.5 12 12 3.5M6 3.5h6V9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
