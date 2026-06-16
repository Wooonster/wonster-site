# Deploy — whatsmy.fun site deployment SOP

Deploy `apps/site` to Vercel for the `whatsmy-site` project.

## Critical rules (read first)

- **Always run from repo root**: `/Users/wonster/Documents/VibeCoding/wonsterblog`
- **Never run from `apps/site`** — the `.vercel/project.json` linkage and build commands require the root
- **Build must pass before any deploy** — no exceptions
- **Default = preview** unless the user says `production`, `prod`, or `正式部署`
- Do not stage/commit `apps/blog/next-env.d.ts` or `apps/site/next-env.d.ts` unless explicitly asked
- Do not touch unrelated dirty files in the worktree

## Preflight (always run these first)

```bash
cd /Users/wonster/Documents/VibeCoding/wonsterblog
git status --short --branch
npm run build --workspace @whatsmy/site
```

If build fails → inspect the failing route's markdown first (MDX parse errors, bare `{}`, raw `<` in tables, LaTeX syntax issues). Fix, then retry. Do not deploy if build fails.

## Preview deploy

Use when: user says "deploy", "preview", or just finished a change and wants a URL.

```bash
cd /Users/wonster/Documents/VibeCoding/wonsterblog
npm run build --workspace @whatsmy/site
npx vercel deploy --yes
```

Report back:
- Preview URL
- Whether build passed
- Any unrelated uncommitted files still present (mention but don't touch)

## Production deploy

Use only when: user explicitly says `production`, `prod`, `正式部署`, or "update the live site".

```bash
cd /Users/wonster/Documents/VibeCoding/wonsterblog
npm run build --workspace @whatsmy/site
git add <only relevant changed files>
# Do NOT add next-env.d.ts, unrelated files
git commit -m "<short descriptive message>"
git push origin main
npx vercel deploy --prod --yes
```

Report back:
- One-sentence summary of what changed
- Build passed confirmation
- Commit hash + message
- Live URL: https://whatsmy.fun
- Vercel deployment/inspection URL
- Any remaining unrelated uncommitted noise files (mention, don't stage)

## Vercel project facts

| Key | Value |
|-----|-------|
| Project name | `whatsmy-site` |
| Root directory (Vercel-side) | `apps/site` |
| Deploy command (local) | run from **repo root** |
| Install command | `cd ../.. && npm install` |
| Build command | `cd ../.. && npm run build --workspace @whatsmy/site` |
| Production domain | https://whatsmy.fun |
| Blog domain | https://blog.whatsmy.fun |

## Expected build output (healthy)

A passing build shows routes including:
- `/ ○`
- `/everyday-paper ○`
- `/everyday-paper/[slug] ●`
- `/wiki ○`
- `/wiki/[slug] ●`

If new wiki or daily paper pages were added, the static page count increases — this is expected.

## Common failure modes

| Symptom | Fix |
|---------|-----|
| MDX parse error on paper/wiki page | Check the markdown for bare `{}`, raw `<tag` in tables, or broken LaTeX |
| `apps/site/apps/site` path error | You're running `vercel deploy` from inside `apps/site` — move to repo root |
| TypeScript error | Run `npm run typecheck --workspace @whatsmy/site`, fix errors first |

## What NOT to do

- Do not deploy without a passing local build
- Do not commit `next-env.d.ts` or other generated noise by default
- Do not revert changes you didn't make
- Do not run `vercel deploy` from `apps/site`
- Do not assume "deploy" means production
