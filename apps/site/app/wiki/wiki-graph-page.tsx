"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import type { GraphData } from "../../lib/graph";
import { WikiFilteredList } from "./wiki-filtered-list";

const WikiGraph = dynamic(
  () => import("./wiki-graph").then((m) => ({ default: m.WikiGraph })),
  {
    ssr: false,
    loading: () => (
      <div className="wiki-graph-canvas wiki-graph-skeleton" aria-label="Loading graph…">
        <div className="wiki-graph-skeleton-inner" />
      </div>
    ),
  },
);

interface Props {
  data: GraphData;
}

export function WikiGraphPage({ data }: Props) {
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  }

  function clearTags() {
    setSelectedTags(new Set());
  }

  const highlightedNodeIds = useMemo<Set<string> | null>(() => {
    if (selectedTags.size === 0) return null;
    return new Set(
      data.nodes
        .filter((n) => n.tags.some((t) => selectedTags.has(t)))
        .map((n) => n.id),
    );
  }, [data.nodes, selectedTags]);

  const matchCount = highlightedNodeIds?.size ?? 0;

  return (
    <section className="wiki-graph-section">
      {/* Editorial section header */}
      <header className="wiki-graph-header">
        <div className="wiki-graph-header-left">
          <span className="wiki-graph-eyebrow">Concept Map</span>
          <div className="wiki-graph-stat-row">
            <span>{data.nodes.filter((n) => n.type === "wiki").length} entries</span>
            <span className="wiki-graph-stat-sep" />
            <span>{data.nodes.filter((n) => n.type === "paper").length} papers</span>
            <span className="wiki-graph-stat-sep" />
            <span>{data.nodes.filter((n) => n.type === "blog").length} posts</span>
            <span className="wiki-graph-stat-sep" />
            <span>{data.edges.length} connections</span>
          </div>
        </div>

        {selectedTags.size > 0 && (
          <div className="wiki-graph-header-right">
            <span className="wiki-graph-match-count">
              {matchCount} node{matchCount !== 1 ? "s" : ""} matched
            </span>
            <button className="wiki-graph-clear" onClick={clearTags}>
              Clear
            </button>
          </div>
        )}
      </header>

      {/* Tag filter strip */}
      <div className="wiki-graph-tag-strip" role="group" aria-label="Filter by tag">
        {data.allTags.map((tag) => (
          <button
            key={tag}
            className="wiki-tag-filter-btn"
            data-active={selectedTags.has(tag) ? "true" : undefined}
            onClick={() => toggleTag(tag)}
            aria-pressed={selectedTags.has(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Graph */}
      <WikiGraph
        nodes={data.nodes}
        edges={data.edges}
        highlightedNodeIds={highlightedNodeIds}
      />

      {/* Filtered results — animated reveal */}
      <div
        className="wiki-graph-results-wrap"
        data-open={selectedTags.size > 0 ? "true" : undefined}
      >
        <WikiFilteredList nodes={data.nodes} selectedTags={selectedTags} />
      </div>
    </section>
  );
}
