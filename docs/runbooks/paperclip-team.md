# Paperclip team — Crunchtime

Reference for delegating work from this repo to Paperclip agents.

## Crunchtime org IDs

```
Company ID:  94dbb427-819a-4ec4-a02e-22fb24589604
Prefix:      CRUA
API base:    https://paperclip.bruchris.me
```

Website project (the customer comms site / crunchtime.no):

```
projectId: aa2b0907-d47d-43b0-8498-60598efc5c75
goalId:    87858bb1-c9dc-4c5a-8146-582f1151795d
```

The repo path itself encodes both: `~/.paperclip/instances/default/projects/94dbb427.../aa2b0907.../_default`.

## Agents

| Role | Agent ID | When to assign |
|---|---|---|
| CEO | `4ae23056-09ab-4f29-8f04-9d5929c998f4` | Strategy, editorial review, cross-functional |
| CTO | `8b83d9eb-0d8f-4d39-9951-2379bfe1f1a6` | Architecture, PR review, deploys |
| CMO | `c6fcaf55-42b6-4a02-b0a1-4d8b8e98c935` | Marketing, /insights drafting, outbound |
| LeadDeveloper | `006945af-48b9-4a61-8817-8262bb2117f3` | Ship features, TDD, infra |
| Developer | `38ce2be4-c453-4c89-a2fe-ffbde3c7e85e` | PR review feedback only |
| QA | `252a71ca-6f34-4663-880c-97c779cab3e4` | Tests, factual review, spec compliance |

If unsure: CEO. The CEO will delegate.

## Common commands

```bash
# Auth check
npx paperclipai auth whoami --api-base https://paperclip.bruchris.me

# List Crunchtime agents
npx paperclipai agent list --api-base https://paperclip.bruchris.me \
  --company-id "94dbb427-819a-4ec4-a02e-22fb24589604" --json

# List active issues
npx paperclipai issue list --api-base https://paperclip.bruchris.me \
  --company-id "94dbb427-819a-4ec4-a02e-22fb24589604" --status in_progress --json

# Get one issue
npx paperclipai issue get CRUA-XX --api-base https://paperclip.bruchris.me --json
```

## Multi-line descriptions — Windows constraint

**On Windows the CLI's `--description` flag cannot accept multi-line markdown.** Both cmd.exe and PowerShell collapse newlines in argv before the CLI ever sees them. spawnSync with `shell: false` fails to launch `.cmd` files at all. Tested every reasonable workaround.

Workaround pattern: **put long-form content in a repo runbook and have the issue description be a one-liner pointing to it.**

Example: the GEO content engine plan lives at [`docs/runbooks/geo-content-engine.md`](geo-content-engine.md). Issues created for that initiative each have a 1–2 sentence description like:

```
Draft Post 1 of the GEO content engine. Full spec: docs/runbooks/geo-content-engine.md (skeleton + checklist + sources). Status starts as `draft`; move to `in-review` for CEO review when ready.
```

This is also better long-term: the plan stays version-controlled, diffable, and survives issue cleanup.

Do **not** extract the auth token from `~/.paperclip/auth.json` for direct curl calls — that pattern is denied by user policy. Use the CLI exclusively.

## Issue body conventions

When referencing other issues, use markdown links with the prefix:

```markdown
See [CRUA-33](/CRUA/issues/CRUA-33) for the parent task.
```

Never leave bare IDs unlinked.

## Common mistakes

| Mistake | Fix |
|---|---|
| Targeting the wrong company (Frozen Dice / Canvas LMS MCP) | Always use `94dbb427-819a-4ec4-a02e-22fb24589604` (CRUA) for Crunchtime work |
| `--description "$(cat body.md)"` in PowerShell | Use spawnSync pattern above |
| Omitting `--api-base` | Always include `--api-base https://paperclip.bruchris.me` |
| Creating issues without `--project-id` / `--goal-id` | Use the website project IDs above to roll up correctly |
| Marking task done while in review | Use `in_review` until both CEO and QA sign off where applicable |
