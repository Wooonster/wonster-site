"use client";

import { useEffect, useState } from "react";
import { Localized } from "@whatsmy/ui";
import type { Heading } from "../lib/content";

type ArticleTocProps = {
  headings: Heading[];
  titleZh: string;
  titleEn: string;
  captionZh: string;
  captionEn: string;
};

export function ArticleToc({ headings, titleZh, titleEn, captionZh, captionEn }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const syncVisibility = () => {
      setVisible(window.scrollY > 260);
    };

    syncVisibility();
    window.addEventListener("scroll", syncVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", syncVisibility);
    };
  }, []);

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    const syncActiveHeading = () => {
      const current = elements.filter((element) => element.getBoundingClientRect().top <= 140).at(-1) ?? elements[0];
      setActiveId(current.id);
    };

    const observer = new IntersectionObserver(syncActiveHeading, {
      rootMargin: "-16% 0px -68% 0px",
      threshold: [0, 1]
    });

    elements.forEach((element) => observer.observe(element));
    syncActiveHeading();

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return (
    <aside className="article-aside enter-rise delay-3">
      <div className="article-toc-shell" data-visible={visible}>
        <div className="article-toc-meta">
          <Localized className="article-toc-caption" zh={captionZh} en={captionEn} />
          <span className="article-toc-rule" aria-hidden="true" />
        </div>
        <div className="article-toc">
          <Localized className="article-toc-title" zh={titleZh} en={titleEn} />
          <div className="toc-list article-toc-list">
            {headings.map((heading) => (
              <a
                key={heading.id}
                className={`toc-link toc-link-level-${heading.level}`}
                data-active={activeId === heading.id}
                href={`#${heading.id}`}
              >
                {heading.text}
              </a>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
