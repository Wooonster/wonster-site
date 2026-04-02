#!/usr/bin/env python3
"""
create_everyday_paper_md.py
Combines a metadata JSON file and a Chinese analysis markdown file
into a single frontmatter + body markdown file for the wonsterblog
Everyday Paper section.

Usage:
  python3 scripts/create_everyday_paper_md.py \
    --metadata /tmp/everyday-paper-2026-04-02/<ID>_meta.json \
    --analysis /tmp/everyday-paper-2026-04-02/<ID>_analysis.md \
    --output-dir apps/site/content/everyday-paper
"""

import argparse
import json
import os
import re
import sys


def slugify(text: str, max_len: int = 60) -> str:
    text = text.lower()
    text = re.sub(r"[^a-z0-9\s-]", "", text)
    text = re.sub(r"[\s]+", "-", text.strip())
    text = re.sub(r"-+", "-", text)
    return text[:max_len].rstrip("-")


def build_frontmatter(meta: dict) -> str:
    lines = ["---"]
    lines.append(f'title: "{meta["title"]}"')
    lines.append(f'slug: "{meta["slug"]}"')
    lines.append(f'date: "{meta["date"]}"')
    lines.append(f'topic: "{meta["topic"]}"')
    # cardSummary may contain quotes — escape them
    summary = meta["cardSummary"].replace('"', '\\"')
    lines.append(f'cardSummary: "{summary}"')
    lines.append(f'source: "{meta.get("source", "arXiv")}"')
    lines.append(f'arxivUrl: "{meta["arxivUrl"]}"')
    lines.append(f'alphaxivUrl: "{meta["alphaxivUrl"]}"')
    if meta.get("xUrl"):
        lines.append(f'xUrl: "{meta["xUrl"]}"')
    if meta.get("authors"):
        lines.append("authors:")
        for author in meta["authors"]:
            lines.append(f'  - "{author}"')
    if meta.get("tags"):
        lines.append("tags:")
        for tag in meta["tags"]:
            lines.append(f'  - "{tag}"')
    lines.append("---")
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="Create Everyday Paper markdown file.")
    parser.add_argument("--metadata", required=True, help="Path to _meta.json file")
    parser.add_argument("--analysis", required=True, help="Path to _analysis.md file")
    parser.add_argument("--output-dir", required=True, help="Output directory for .md file")
    args = parser.parse_args()

    # Load metadata
    with open(args.metadata, "r", encoding="utf-8") as f:
        meta = json.load(f)

    # Load analysis
    with open(args.analysis, "r", encoding="utf-8") as f:
        analysis = f.read()

    # Ensure slug exists
    if not meta.get("slug"):
        meta["slug"] = slugify(meta["title"])

    # Build output content
    frontmatter = build_frontmatter(meta)
    content = f"{frontmatter}\n\n{analysis.strip()}\n"

    # Ensure output dir exists
    os.makedirs(args.output_dir, exist_ok=True)

    # Output filename: <date>-<slug>.md
    date_prefix = meta["date"].replace("-", "")
    slug = meta["slug"]
    filename = f"{date_prefix}-{slug}.md"
    output_path = os.path.join(args.output_dir, filename)

    with open(output_path, "w", encoding="utf-8") as f:
        f.write(content)

    print(f"Written: {output_path}")
    return output_path


if __name__ == "__main__":
    main()
