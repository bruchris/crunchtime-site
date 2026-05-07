# Crunchtime — repo guide for Claude Code

## What this is

The marketing site at **crunchtime.no** — a Norwegian AI agency in Bergen. Next.js 16, App Router, RSC + ISR, next-intl (no/en).

Project ticket: [CRUA-33](https://paperclip.bruchris.me) (customer comms site).

## Paperclip org — IMPORTANT

When delegating work to Paperclip agents from this repo, **always target the Crunchtime org**, not any other company in the workspace. The auth token has access to multiple orgs (Frozen Dice, Canvas LMS MCP, etc.) — defaulting to the wrong one routes work to the wrong agents.

### Crunchtime IDs (hard-code these)

```
Company ID:  94dbb427-819a-4ec4-a02e-22fb24589604
Prefix:      CRUA
API base:    https://paperclip.bruchris.me

Website project:
  projectId: aa2b0907-d47d-43b0-8498-60598efc5c75
  goalId:    87858bb1-c9dc-4c5a-8146-582f1151795d

Agents:
  CEO            4ae23056-09ab-4f29-8f04-9d5929c998f4
  CTO            8b83d9eb-0d8f-4d39-9951-2379bfe1f1a6
  CMO            c6fcaf55-42b6-4a02-b0a1-4d8b8e98c935
  LeadDeveloper  006945af-48b9-4a61-8817-8262bb2117f3
  Developer      38ce2be4-c453-4c89-a2fe-ffbde3c7e85e
  QA             252a71ca-6f34-4663-880c-97c779cab3e4
```

The repo path itself encodes the company + project: `~/.paperclip/instances/default/projects/94dbb427-819a-4ec4-a02e-22fb24589604/aa2b0907-d47d-43b0-8498-60598efc5c75/_default`. The first UUID is the Crunchtime company ID; the second is the website project ID. If the path doesn't match these, you're in the wrong worktree.

### Refreshing IDs

```bash
npx paperclipai agent list --api-base https://paperclip.bruchris.me \
  --company-id "94dbb427-819a-4ec4-a02e-22fb24589604" --json
```

## Routing work to the Crunchtime team

| Work type | Assign to | Agent ID |
|---|---|---|
| Cross-functional / strategy / unclear | CEO | `4ae23056-09ab-4f29-8f04-9d5929c998f4` |
| Editorial review of marketing content | CEO | (same) |
| Marketing strategy, content, /insights drafting | CMO | `c6fcaf55-42b6-4a02-b0a1-4d8b8e98c935` |
| Architecture, PR review, deploy decisions | CTO | `8b83d9eb-0d8f-4d39-9951-2379bfe1f1a6` |
| Build features, ship code, TDD | LeadDeveloper | `006945af-48b9-4a61-8817-8262bb2117f3` |
| Address PR review feedback | Developer | `38ce2be4-c453-4c89-a2fe-ffbde3c7e85e` |
| Test, factual review, spec compliance | QA | `252a71ca-6f34-4663-880c-97c779cab3e4` |

Default: CEO if unsure. CEO will delegate.

## Multi-line issue descriptions on Windows

The Paperclip CLI's `--description` flag mangles multi-line text via shell expansion when invoked through cmd.exe or PowerShell. Use `child_process.spawnSync` with `shell: false` and explicit `npx.cmd` to pass multi-line argv intact:

```js
const { spawnSync } = require("child_process");
spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["paperclipai", "issue", "create", ..., "--description", multiLineBody, "--json"],
  { shell: false, stdio: ["inherit", "pipe", "pipe"] }
);
```

Do **not** extract the auth token from `~/.paperclip/auth.json` for direct curl calls — that's been denied by user policy. Use the CLI.

## Stack reference

- Next 16 (App Router, RSC, ISR, route handlers)
- next-intl 4 with `routing.locales = ["no", "en"]`, default `no`
- Tailwind v4 (PostCSS pipeline)
- Vitest + Playwright
- pnpm 10
- @notionhq/client (used for both lead CRM and `/insights` CMS)
- Resend (email)
- AI SDK + Anthropic (Brief Box)

## Key infra docs

- `docs/runbooks/notion-crm-setup.md` — leads database (`NOTION_DATABASE_ID`)
- `docs/runbooks/notion-insights-setup.md` — `/insights` CMS database (`NOTION_INSIGHTS_DATABASE_ID`)

## GEO / SEO context

The site has been hardened for AI search retrieval. See the Notion tracker for the full scope: [GEO Tracker](https://www.notion.so/35969e9f245a81bb800cd51f79586e27). Highlights:
- `app/robots.ts` — explicit per-bot rules for GPTBot, ClaudeBot, PerplexityBot, etc.
- `/llms.txt` and `/llms-full.txt` route handlers with ISR
- JSON-LD: Organization + WebSite + Person on every page; Article + Breadcrumb on /insights posts; Service + FAQPage on /services
- `app/sitemap.ts` with per-route `lastModified` constants (no `new Date()` flooding)
- Anchor IDs on FAQ items, services, pricing tiers for AI deep-linking

## Authoring /insights posts

Workflow is owned by the CMO with CEO + QA review gating. See [docs/runbooks/notion-insights-setup.md](docs/runbooks/notion-insights-setup.md) §10 for the per-post checklist before flipping `Status = published`.
