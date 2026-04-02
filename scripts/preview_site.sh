#!/usr/bin/env bash
# preview_site.sh — deploy a Vercel preview for the wonsterblog site
# Usage: bash scripts/preview_site.sh /path/to/wonsterblog
set -euo pipefail

REPO_DIR="${1:-$(pwd)}"
SITE_DIR="$REPO_DIR/apps/site"

echo "==> Deploying preview from $SITE_DIR ..."
cd "$REPO_DIR"

# Deploy preview using Vercel CLI (must be installed and logged in)
# --yes accepts defaults, --no-wait would skip waiting for build
npx vercel deploy --yes 2>&1 | tee /tmp/vercel-preview-output.txt

PREVIEW_URL=$(grep -Eo 'https://[a-zA-Z0-9._-]+\.vercel\.app' /tmp/vercel-preview-output.txt | tail -1)
echo ""
echo "==> Preview URL: $PREVIEW_URL"
