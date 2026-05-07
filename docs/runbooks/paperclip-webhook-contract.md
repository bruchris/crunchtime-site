# Paperclip lead-handoff (v2: issue-based)

After every accepted lead, the Crunchtime site creates a Paperclip issue
assigned to a Paperclip agent (default: CMO). The agent reads the issue body,
runs research (website scrape + LinkedIn lookup), generates a personalised
implementation plan, emails it to the visitor, and updates Notion.

> **History:** v1 fired a custom webhook to a non-existent route on Paperclip.
> v2 (current) uses Paperclip's standard issue API instead, so no bespoke
> server-side route is needed.

## Required env vars

| Var | Where it comes from |
|---|---|
| `PAPERCLIP_API_BASE` | `https://paperclip.bruchris.me` |
| `PAPERCLIP_API_TOKEN` | Board key from `~/.paperclip/auth.json` (`credentials["https://paperclip.bruchris.me"].token`). Starts with `pcp_board_…`. Treat as Sensitive. |
| `PAPERCLIP_COMPANY_ID` | `94dbb427-819a-4ec4-a02e-22fb24589604` (the Crunchtime company) |
| `PAPERCLIP_PROJECT_ID` | `aa2b0907-d47d-43b0-8498-60598efc5c75` (Crunchtime Site project) |
| `PAPERCLIP_GOAL_ID` | `87858bb1-c9dc-4c5a-8146-582f1151795d` |
| `PAPERCLIP_AGENT_ID` | `c6fcaf55-42b6-4a02-b0a1-4d8b8e98c935` (CMO). Swap for CEO id `4ae23056-09ab-4f29-8f04-9d5929c998f4` if you'd rather the CEO triage. |

If any one is missing, `/api/lead` skips the issue creation, logs a warning,
and leaves the Notion row at status `New`. The lead is still captured.

## API call

```
POST {PAPERCLIP_API_BASE}/api/companies/{PAPERCLIP_COMPANY_ID}/issues
Authorization: Bearer {PAPERCLIP_API_TOKEN}
Content-Type: application/json; charset=utf-8

{
  "title": "New brief lead: <Company> (<email>)",
  "description": "<full markdown body — see below>",
  "priority": "high",
  "status": "todo",
  "assigneeAgentId": "<PAPERCLIP_AGENT_ID>",
  "projectId": "<PAPERCLIP_PROJECT_ID>",
  "goalId": "<PAPERCLIP_GOAL_ID>"
}
```

**Caller timeout:** 10s per attempt.
**Retry:** 3 attempts total (immediate, 1s, 4s) on 5xx / network. 4xx is
terminal and not retried.

### Response handling

| Response | What the caller does |
|---|---|
| 2xx with `{ id, identifier }` | Notion: `plan-pending`, `Linked Paperclip` URL set, `Notes` summarises issue. |
| 2xx without `id` / `identifier` | Notion: `manual-review` with note. |
| 4xx | Notion: `manual-review` with note (no retry). |
| 5xx / network, 3 fails | Notion: `manual-review` with note. |

## Issue body

The body is markdown. The agent reads it as instructions:

1. Visitor identity (name, email, company, website, language) and Notion link.
2. The free-text brief the visitor submitted.
3. The headline / ask the demo showed them.
4. The demo team (agents + tools) and demo activity log.
5. **What to do** numbered list:
   - Scrape the website (and LinkedIn if surfaced).
   - Sanity-check the demo team against scraped context.
   - Generate a 1-page plan (>= 500 chars, references scraped facts, >= 2 agents) in the visitor's language.
   - Email the plan via Resend with reply-to christian@crunchtime.no.
   - Update Notion to `plan-delivered` (or `plan-needs-review` on sanity-check failure).
   - Mark the issue `done` with a summary comment.

## What the assigned agent should do (Paperclip side)

The assigned agent (CMO by default) is expected to:

1. Patch the linked Notion row to `plan-pending` (already done by the caller, but verify).
2. Run the research pipeline: scrape the website with whatever browsing tool is available, look up LinkedIn if discoverable, draft the plan.
3. Sanity-check the plan against the brief and the scraped data.
4. On pass: send the plan via Resend (reply-to christian@crunchtime.no), patch Notion to `plan-delivered`, set `Plan Sent`, and mark the issue `done`.
5. On guard fail: patch Notion to `plan-needs-review`, post a comment on the issue describing what failed, leave the issue assigned to the CMO for manual follow-up — do **not** email the visitor.

The Crunchtime site does not poll. Notion is the shared state between sites and Paperclip.

## Smoke test

After provisioning the env vars (`.env.local` for dev, Vercel for prod):

1. Submit a real brief on `/no` or `/en`, hit "Send dette på e-post".
2. Notion: a new row should appear within ~1s with status `plan-pending` and a populated `Linked Paperclip` URL.
3. Paperclip: a new `BRU-…` issue should be visible in the Crunchtime project with the lead body.
4. The CMO agent (if running) should pick up the issue per its heartbeat schedule.
