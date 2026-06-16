"use client";

import { type MouseEvent, useEffect, useState } from "react";
import { Localized } from "@whatsmy/ui";
import type { Heading } from "../lib/content";

type ArticleTocProps = {
  headings: Heading[];
  titleZh: string;
  titleEn: string;
};

export function ArticleToc({ headings, titleZh, titleEn }: ArticleTocProps) {
  const [activeId, setActiveId] = useState(headings[0]?.id ?? "");

  useEffect(() => {
    const elements = headings
      .map((heading) => document.getElementById(heading.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (!elements.length) {
      return;
    }

    let frame = 0;

    const syncActiveHeading = () => {
      frame = 0;

      const visibleHeadings = elements
        .map((element) => ({
          element,
          rect: element.getBoundingClientRect()
        }))
        .filter(({ rect }) => rect.bottom > 0 && rect.top < window.innerHeight);

      const current =
        visibleHeadings.sort((a, b) => a.rect.top - b.rect.top)[0]?.element ??
        elements.filter((element) => element.getBoundingClientRect().top < window.innerHeight * 0.28).at(-1) ??
        elements[0];

      setActiveId(current.id);
    };

    const scheduleSync = () => {
      if (frame) {
        return;
      }

      frame = window.requestAnimationFrame(syncActiveHeading);
    };

    window.addEventListener("scroll", scheduleSync, { passive: true });
    window.addEventListener("resize", scheduleSync);
    syncActiveHeading();

    return () => {
      if (frame) {
        window.cancelAnimationFrame(frame);
      }

      window.removeEventListener("scroll", scheduleSync);
      window.removeEventListener("resize", scheduleSync);
    };
  }, [headings]);

  const handleTocClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();
    setActiveId(id);
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
    window.history.replaceState(null, "", `#${id}`);
  };

  return (
    <aside className="article-aside enter-rise delay-3">
      <nav className="article-toc-shell source-toc" aria-label={`${titleZh} / ${titleEn}`}>
        <div className="toc-rail-marks" aria-hidden="true">
          {headings.map((heading, index) => (
            <span
              key={`rail-${heading.id}`}
              className={`toc-rail-mark${activeId === heading.id ? " active" : ""}`}
              data-pattern={index % 5}
            />
          ))}
        </div>
        <Localized as="h2" className="article-toc-title" zh={titleZh} en={titleEn} />
        <ol className="article-toc-list">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;

            return (
              <li key={heading.id} className={`toc-item toc-item-level-${heading.level}`}>
                <a
                  aria-current={isActive ? "location" : undefined}
                  className={`toc-link toc-link-level-${heading.level}${isActive ? " active" : ""}`}
                  data-active={isActive}
                  href={`#${heading.id}`}
                  onClick={(event) => handleTocClick(event, heading.id)}
                >
                  {heading.text}
                </a>
              </li>
            );
          })}
        </ol>
      </nav>
    </aside>
  );
}
