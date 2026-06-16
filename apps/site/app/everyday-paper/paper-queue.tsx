"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Localized } from "@whatsmy/ui";
import type { EverydayPaperEntry } from "../../lib/everyday-paper";

type PageSize = 5 | 10 | 20 | "full";

type PaperQueueProps = {
  papers: EverydayPaperEntry[];
};

const pageSizeOptions: PageSize[] = [5, 10, 20, "full"];

function ArrowOutIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="M6.25 13.75 13.75 6.25M8 6.25h5.75V12"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

export function PaperQueue({ papers }: PaperQueueProps) {
  const [pageSize, setPageSize] = useState<PageSize>(5);
  const [page, setPage] = useState(0);
  const resolvedPageSize = pageSize === "full" ? papers.length || 1 : pageSize;
  const pageCount = pageSize === "full" ? 1 : Math.max(1, Math.ceil(papers.length / resolvedPageSize));
  const safePage = Math.min(page, pageCount - 1);
  const start = safePage * resolvedPageSize;
  const visiblePapers = useMemo(
    () => (pageSize === "full" ? papers : papers.slice(start, start + resolvedPageSize)),
    [pageSize, papers, resolvedPageSize, start]
  );
  const rangeStart = papers.length ? start + 1 : 0;
  const rangeEnd = Math.min(start + visiblePapers.length, papers.length);

  function updatePageSize(nextPageSize: PageSize) {
    setPageSize(nextPageSize);
    setPage(0);
  }

  return (
    <div className="paper-queue">
      <div className="paper-queue-toolbar" aria-label="Paper Queue pagination">
        <div className="paper-queue-range">
          {rangeStart}-{rangeEnd} / {papers.length}
        </div>
        <div className="paper-queue-size-row" aria-label="Items per page">
          {pageSizeOptions.map((option) => (
            <button
              key={option}
              className="paper-queue-size-button"
              data-active={pageSize === option}
              onClick={() => updatePageSize(option)}
              type="button"
            >
              {option === "full" ? "Full" : option}
            </button>
          ))}
        </div>
        <div className="paper-queue-pager">
          <button disabled={safePage === 0} onClick={() => setPage((current) => Math.max(0, current - 1))} type="button">
            Prev
          </button>
          <span>
            {safePage + 1} / {pageCount}
          </span>
          <button
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
            type="button"
          >
            Next
          </button>
        </div>
      </div>

      <div className="everyday-paper-archive-list">
        {visiblePapers.map((paper, index) => (
          <article key={`${paper.date}-${paper.slug}`} className="everyday-paper-archive-card">
            <div className="everyday-paper-archive-topline">
              <span className="daily-paper-count">{String(start + index + 1).padStart(2, "0")}</span>
              <span className="everyday-paper-source-pill">{paper.source}</span>
            </div>
            <Link className="everyday-paper-archive-mainlink" href={`/everyday-paper/${paper.slug}`}>
              <Localized as="h2" zh={paper.title.zh} en={paper.title.en} />
              <Localized as="p" zh={paper.cardSummary.zh} en={paper.cardSummary.en} />
            </Link>
            <div className="everyday-paper-archive-meta">
              <span>{paper.date}</span>
              <span>{paper.topic}</span>
            </div>
            <div className="stack-inline everyday-paper-archive-links">
              <Link className="index-more-link" href={`/everyday-paper/${paper.slug}`}>
                <span>Open summary</span>
              </Link>
              <Link className="ghost-link everyday-paper-source-link" href={paper.arxivUrl} target="_blank" rel="noreferrer">
                <span>arXiv</span>
                <span className="action-icon everyday-paper-archive-action" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
              <Link className="ghost-link everyday-paper-source-link" href={paper.alphaxivUrl} target="_blank" rel="noreferrer">
                <span>alphaXiv</span>
                <span className="action-icon everyday-paper-archive-action" aria-hidden="true">
                  <ArrowOutIcon />
                </span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
