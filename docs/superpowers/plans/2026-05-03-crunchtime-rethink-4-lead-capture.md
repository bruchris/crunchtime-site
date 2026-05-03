# Crunchtime Rethink — Plan 4: Lead Capture

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the server side of the email-capture flow. The Brief Box end card (Plan #2) POSTs to `/api/lead`. This plan owns the route, the zod payload contract, the Notion CRM insert, the Resend ack email (NO + EN), the admin notification, and a fire-and-forget Paperclip research-agent webhook with retry. The route returns success the moment Notion + ack email complete; the webhook + admin ping run via `next/server`'s `after()`. Honeypot rejection is silent. Tests cover validation, honeypot detection, retry behavior, and the form-submit happy path E2E.

**Architecture:**

- **Node-runtime route handler.** `/api/lead` runs on Node (not Edge) because the Notion SDK uses Node primitives. Receives JSON, validates with zod, performs honeypot check, inserts into Notion, sends visitor ack via Resend, returns 200. Admin notification + Paperclip webhook are deferred to `after()` so the response is not blocked.
- **Three external services:**
  - **Notion** — CRM. Single database keyed by lead ID (the Notion page ID), schema fully defined in this plan (Task 2 runbook).
  - **Resend** — Two outbound emails per lead: visitor ack (NO or EN, picked by `language`) and an admin "new lead" ping to `christian@crunchtime.no`.
  - **Paperclip webhook** — async POST to `PAPERCLIP_WEBHOOK_URL`. Three attempts (1st immediate, then 1s and 4s backoff). Bails on 4xx. On terminal failure, the Notion row is patched to `manual-review`.
- **No queue, no DB on this side.** Notion is the queue. The webhook retry is in-process; if the serverless instance dies between attempts, Notion stays at `new` — the admin email always fires first so Christian can re-trigger by hand.
- **Honeypot:** `company_phone` field. If non-empty, return 200 with `{ ok: true }` and log to console.

**Tech Stack:** Next.js 16 App Router (Node-runtime route), TypeScript 5.6, `zod` v3, `@notionhq/client` v2, `resend` v4 SDK, Vitest v3 (unit), Playwright v1.50 (E2E). Email templates as React components rendered by Resend's built-in `react` field.

**Spec reference:** [docs/superpowers/specs/2026-05-03-crunchtime-rethink-design.md](../specs/2026-05-03-crunchtime-rethink-design.md) — primarily the "Email-capture flow" subsection inside "End card". This plan covers steps 3–5 of that flow (Notion insert, Resend ack, Paperclip webhook, admin ping). Step 4's research-agent internals live in Paperclip — this plan only documents the contract.

---

## File Structure

**New:**
- `app/api/lead/route.ts` — POST handler.
- `app/_lib/leadSchema.ts` — zod schema + inferred type. Single source of truth for the API contract.
- `app/_lib/notion.ts` — `insertLead()` and `markLeadStatus()`.
- `app/_lib/resend.ts` — Resend client + `sendLeadAck()` + `sendAdminNotification()`.
- `app/_lib/emails/leadAck.no.tsx`, `leadAck.en.tsx`, `adminLead.tsx` — React email components.
- `app/_lib/paperclip.ts` — `triggerPaperclipResearchAgent()` with retry.
- `app/_lib/honeypot.ts` — `isHoneypotTriggered()` helper.
- `app/_lib/retry.ts` — `retryWithBackoff()` helper.
- `tests/unit/leadSchema.test.ts`, `honeypot.test.ts`, `retry.test.ts`, `paperclip.test.ts`.
- `tests/e2e/lead-capture.spec.ts`.
- `docs/runbooks/notion-crm-setup.md` — Notion database setup guide.
- `docs/runbooks/paperclip-webhook-contract.md` — webhook contract for the receiving side.

**Modified:**
- `package.json` — adds `@notionhq/client`, `resend`, `zod`.
- `.env.local.example` — adds `NOTION_TOKEN`, `NOTION_DATABASE_ID`, `PAPERCLIP_WEBHOOK_URL`. (Create if absent.)
- `app/[locale]/_components/BriefBox/EndCard.tsx` — only if Plan #2's form does not already match this plan's schema (Task 11 verifies).

**Not touched:** `app/contact/actions.ts` — keeps its own raw-fetch Resend call. A future cleanup can consolidate.

---

## Task 1: Install dependencies

**Files:** Modify `package.json`, `package-lock.json`

- [ ] **Step 1: Install runtime deps**

```bash
npm install zod@^3 @notionhq/client@^2 resend@^4
```

`resend` brings `@react-email/render` transitively, so React email components work without an extra install.

- [ ] **Step 2: Verify**

```bash
npm ls zod @notionhq/client resend
```
Expected: each lists a concrete version with no `UNMET` lines.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore(lead): add zod, notion, resend deps"
```

---

## Task 2: Document the Notion CRM database setup

**Files:** Create `docs/runbooks/notion-crm-setup.md`

- [ ] **Step 1: Create the runbook**

```bash
mkdir -p docs/runbooks
```

Create `docs/runbooks/notion-crm-setup.md`:

```markdown
# Notion CRM setup — Crunchtime leads database

The `/api/lead` route writes one row per lead. After this setup, populate `NOTION_TOKEN` and `NOTION_DATABASE_ID` in `.env.local` (local) and Vercel env (Production + Preview + Development).

## 1. Create the integration

1. Visit https://www.notion.so/profile/integrations.
2. New integration → Name: `Crunchtime Site`. Workspace: Christian's. Type: Internal.
3. Capabilities: Read content, Update content, Insert content. (No user-info access.)
4. Save. Copy the "Internal Integration Token" (starts with `secret_` or `ntn_`). This is `NOTION_TOKEN`.

## 2. Create the database

Create a full-page database called "Crunchtime Leads" with these properties (exact names — the API uses them as keys):

| Property | Type | Configuration |
|---|---|---|
| `Name` | Title | (rename auto Title column) |
| `Email` | Email | — |
| `Company` | Rich text | — |
| `Website` | URL | — |
| `Brief` | Rich text | — |
| `Recommendation` | Rich text | — |
| `Language` | Select | Options: `no`, `en` |
| `Source` | Select | Options: `brief-box-v1` |
| `Status` | Select | Options in this order/color: `new` (gray), `plan-pending` (yellow), `plan-delivered` (green), `plan-needs-review` (orange), `manual-review` (red) |
| `Created` | Created time | (system-managed) |
| `Plan Sent` | Date | Include time. Optional. |
| `Notes` | Rich text | — |

Add the Select options in advance — the API does not auto-create options on first write.

## 3. Share with the integration

Database page → `...` menu → Connections → Add connections → search "Crunchtime Site" → confirm.

## 4. Copy the database ID

The 32-char hex string in the database URL: `https://www.notion.so/<workspace>/<DATABASE_ID>?v=<view_id>`. This is `NOTION_DATABASE_ID`.

## 5. Add env vars

`.env.local`:
```
NOTION_TOKEN=ntn_xxx...
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

In Vercel (Project Settings → Environment Variables), add both for Production, Preview, and Development. Mark Sensitive.

## 6. Smoke test

After Plan 4 lands, hit the form on a preview deploy. A new row should appear in Notion within ~1s with Status = `new`.
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/notion-crm-setup.md
git commit -m "docs(lead): notion crm database setup runbook"
```

---

## Task 3: Define the lead payload zod schema

**Files:** Create `app/_lib/leadSchema.ts`, `tests/unit/leadSchema.test.ts`

- [ ] **Step 1: Write the schema**

Create `app/_lib/leadSchema.ts`:

```ts
import { z } from "zod";

// Source of truth for the /api/lead JSON contract. The form in
// app/[locale]/_components/BriefBox/EndCard.tsx must POST a body whose keys
// exactly match this schema. Honeypot field name is `company_phone`. The
// hidden `demoPayload` is the JSON returned by /api/brief.

export const briefRecommendationSchema = z.object({
  headline: z.string().min(1).max(200),
  ask: z.string().min(1).max(500)
});

export const briefAgentSchema = z.object({
  name: z.string().min(1).max(80),
  color: z.string().min(1).max(20),
  tools: z.array(z.string().min(1).max(40)).min(1).max(8)
});

export const briefLogSchema = z.object({
  agent: z.string().min(1).max(80),
  action: z.string().min(1).max(200),
  ts: z.string().min(1).max(20)
});

export const demoPayloadSchema = z.object({
  agents: z.array(briefAgentSchema).min(1).max(6),
  logs: z.array(briefLogSchema).min(1).max(8),
  recommendation: briefRecommendationSchema
});

export const leadInputSchema = z.object({
  // Visible required
  name: z.string().trim().min(1, "navn er påkrevd").max(120),
  email: z.string().trim().toLowerCase().email("ugyldig e-post").max(200),
  company: z.string().trim().min(1, "firmanavn er påkrevd").max(200),
  website: z
    .string()
    .trim()
    .url("nettside må være en gyldig URL")
    .max(500)
    .refine((u) => /^https?:\/\//i.test(u), "nettside må starte med http(s)://"),

  // Visible optional
  notes: z.string().trim().max(2000).optional().default(""),

  // Hidden — populated by the form from demo state
  brief: z.string().trim().min(1).max(500),
  demoPayload: demoPayloadSchema,
  language: z.enum(["no", "en"]),
  source: z.literal("brief-box-v1"),

  // Honeypot. Empty on legit submits; bots fill it.
  company_phone: z.string().max(200).optional().default("")
});

export type LeadInput = z.infer<typeof leadInputSchema>;
export type DemoPayload = z.infer<typeof demoPayloadSchema>;
```

- [ ] **Step 2: Write the tests**

Create `tests/unit/leadSchema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { leadInputSchema } from "../../app/_lib/leadSchema";

const baseValid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  company: "Analytical Engines AS",
  website: "https://example.com",
  notes: "",
  brief: "fakturaene våre er sene",
  demoPayload: {
    agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
    logs: [{ agent: "AR", action: "did a thing", ts: "11:42" }],
    recommendation: { headline: "ok", ask: "ja?" }
  },
  language: "no" as const,
  source: "brief-box-v1" as const,
  company_phone: ""
};

describe("leadInputSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(leadInputSchema.safeParse(baseValid).success).toBe(true);
  });
  it("lowercases the email", () => {
    expect(leadInputSchema.parse({ ...baseValid, email: "ADA@EXAMPLE.COM" }).email).toBe("ada@example.com");
  });
  it("rejects malformed email", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, email: "not-an-email" }).success).toBe(false);
  });
  it("rejects website without protocol", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, website: "example.com" }).success).toBe(false);
  });
  it("rejects empty company", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, company: "   " }).success).toBe(false);
  });
  it("rejects brief over 500 chars", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, brief: "x".repeat(501) }).success).toBe(false);
  });
  it("rejects unknown language", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, language: "de" }).success).toBe(false);
  });
  it("requires source to be the literal", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, source: "other" }).success).toBe(false);
  });
  it("accepts a filled honeypot at parse time (route handles rejection)", () => {
    expect(leadInputSchema.safeParse({ ...baseValid, company_phone: "+47 99 88 77 66" }).success).toBe(true);
  });
  it("trims whitespace on visible fields", () => {
    const r = leadInputSchema.parse({ ...baseValid, name: "  Ada  ", company: "  AE  " });
    expect(r.name).toBe("Ada");
    expect(r.company).toBe("AE");
  });
});
```

- [ ] **Step 3: Run**

```bash
npm test -- leadSchema
```
Expected: 10 passing.

- [ ] **Step 4: Commit**

```bash
git add app/_lib/leadSchema.ts tests/unit/leadSchema.test.ts
git commit -m "feat(lead): zod schema for /api/lead payload + tests"
```

---

## Task 4: Honeypot helper + tests

**Files:** Create `app/_lib/honeypot.ts`, `tests/unit/honeypot.test.ts`

- [ ] **Step 1: Test first**

Create `tests/unit/honeypot.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { isHoneypotTriggered } from "../../app/_lib/honeypot";

describe("isHoneypotTriggered", () => {
  it("returns false for empty string", () => expect(isHoneypotTriggered("")).toBe(false));
  it("returns false for undefined", () => expect(isHoneypotTriggered(undefined)).toBe(false));
  it("returns false for whitespace-only", () => expect(isHoneypotTriggered("   \t\n  ")).toBe(false));
  it("returns true for any non-whitespace content", () => expect(isHoneypotTriggered("anything")).toBe(true));
  it("returns true for a phone-like string", () => expect(isHoneypotTriggered("+47 99 88 77 66")).toBe(true));
});
```

- [ ] **Step 2: Run, expect import error**

```bash
npm test -- honeypot
```

- [ ] **Step 3: Implement**

Create `app/_lib/honeypot.ts`:

```ts
/**
 * The form renders a hidden `company_phone` text input. Real users never see
 * or fill it; bots that scrape forms by field type do. If this returns true,
 * the route returns 200 with a no-op payload — bots get a fake success.
 */
export function isHoneypotTriggered(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.trim().length > 0;
}
```

- [ ] **Step 4: Run, expect 5 passing**

```bash
npm test -- honeypot
```

- [ ] **Step 5: Commit**

```bash
git add app/_lib/honeypot.ts tests/unit/honeypot.test.ts
git commit -m "feat(lead): honeypot detection helper + tests"
```

---

## Task 5: Exponential-backoff retry helper

**Files:** Create `app/_lib/retry.ts`, `tests/unit/retry.test.ts`

- [ ] **Step 1: Test first**

Create `tests/unit/retry.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { retryWithBackoff } from "../../app/_lib/retry";

describe("retryWithBackoff", () => {
  it("returns the result on first success", async () => {
    const fn = vi.fn().mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    const result = await retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("retries on rejection and returns success", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("boom"))
      .mockRejectedValueOnce(new Error("boom"))
      .mockResolvedValue("ok");
    const sleep = vi.fn().mockResolvedValue(undefined);
    const result = await retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep });
    expect(result).toBe("ok");
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenNthCalledWith(1, 1000);
    expect(sleep).toHaveBeenNthCalledWith(2, 4000);
  });

  it("throws the last error after all attempts fail", async () => {
    const err = new Error("terminal");
    const fn = vi.fn().mockRejectedValue(err);
    const sleep = vi.fn().mockResolvedValue(undefined);
    await expect(
      retryWithBackoff(fn, { attempts: 3, delaysMs: [1000, 4000], sleep })
    ).rejects.toBe(err);
    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it("uses real setTimeout when no sleep injected", async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error("boom")).mockResolvedValue("ok");
    const result = await retryWithBackoff(fn, { attempts: 2, delaysMs: [1] });
    expect(result).toBe("ok");
  });
});
```

- [ ] **Step 2: Implement**

Create `app/_lib/retry.ts`:

```ts
export interface RetryOptions {
  attempts: number;
  delaysMs: number[]; // length must be >= attempts - 1
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  const sleep = options.sleep ?? defaultSleep;
  let lastError: unknown;
  for (let attempt = 0; attempt < options.attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (attempt === options.attempts - 1) break;
      await sleep(options.delaysMs[attempt] ?? 0);
    }
  }
  throw lastError;
}
```

- [ ] **Step 3: Run, expect 4 passing**

```bash
npm test -- retry
```

- [ ] **Step 4: Commit**

```bash
git add app/_lib/retry.ts tests/unit/retry.test.ts
git commit -m "feat(lead): exponential-backoff retry helper + tests"
```

---

## Task 6: Notion client wrapper

**Files:** Create `app/_lib/notion.ts`

No unit test in this task — the SDK surface is too large to mock usefully. The wrapper is exercised end-to-end via the E2E in Task 12 (which mocks at the `/api/lead` boundary, not at Notion). The first real-database call after the runbook is followed will surface any property-name typos as a clear 400 from Notion.

- [ ] **Step 1: Implement**

Create `app/_lib/notion.ts`:

```ts
import { Client } from "@notionhq/client";
import type { LeadInput } from "./leadSchema";

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  _client = new Client({ auth: token });
  return _client;
}

function richText(value: string) {
  if (!value) return [];
  return [{ type: "text" as const, text: { content: value.slice(0, 2000) } }];
}

export type LeadStatus =
  | "new"
  | "plan-pending"
  | "plan-delivered"
  | "plan-needs-review"
  | "manual-review";

export interface InsertedLead {
  pageId: string;
  url: string;
}

export async function insertLead(input: LeadInput): Promise<InsertedLead> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) throw new Error("NOTION_DATABASE_ID is not configured");

  const client = getClient();
  const recommendationText = `${input.demoPayload.recommendation.headline}\n\n${input.demoPayload.recommendation.ask}`;

  const response = await client.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: richText(input.name) },
      Email: { email: input.email },
      Company: { rich_text: richText(input.company) },
      Website: { url: input.website },
      Brief: { rich_text: richText(input.brief) },
      Recommendation: { rich_text: richText(recommendationText) },
      Language: { select: { name: input.language } },
      Source: { select: { name: input.source } },
      Status: { select: { name: "new" satisfies LeadStatus } },
      Notes: { rich_text: richText(input.notes ?? "") }
    }
  });

  const url = "url" in response ? (response.url as string) : "";
  return { pageId: response.id, url };
}

export async function markLeadStatus(
  pageId: string,
  status: LeadStatus,
  extra?: { note?: string; planSentAt?: Date }
): Promise<void> {
  const client = getClient();
  const properties: Record<string, unknown> = {
    Status: { select: { name: status } }
  };
  if (extra?.note) properties.Notes = { rich_text: richText(extra.note) };
  if (extra?.planSentAt) {
    properties["Plan Sent"] = { date: { start: extra.planSentAt.toISOString() } };
  }
  await client.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof client.pages.update>[0]["properties"]
  });
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add app/_lib/notion.ts
git commit -m "feat(lead): notion client wrapper with insertLead + markLeadStatus"
```

---

## Task 7: Document the Paperclip webhook contract

**Files:** Create `docs/runbooks/paperclip-webhook-contract.md`

The receiving endpoint lives in Paperclip, not this repo. Document what we send and what we expect.

- [ ] **Step 1: Write the contract**

Create `docs/runbooks/paperclip-webhook-contract.md`:

```markdown
# Paperclip research-agent webhook contract (v1)

The Crunchtime site fires a webhook to Paperclip after every accepted lead. Paperclip runs the research agent (website scrape + LinkedIn lookup + plan generation), emails the resulting plan to the visitor (reply-to `christian@crunchtime.no`), and updates the Notion CRM row.

## Endpoint
- **Method:** `POST`
- **URL:** value of `PAPERCLIP_WEBHOOK_URL`.
- **Auth:** none for v1. (Future: HMAC `X-Crunchtime-Signature`.)
- **Content-Type:** `application/json; charset=utf-8`
- **Caller timeout:** 10s per attempt.
- **Retry:** 3 attempts total; first immediate, then 1s and 4s backoff.

## Request body
```json
{
  "lead_id": "21d4...8a",
  "brief": "fakturaene våre er sene...",
  "recommendation": {
    "headline": "3 agenter, ~4t/uke spart.",
    "ask": "Vil du ha dette satt opp på ekte for bedriften din?"
  },
  "visitor": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "company": "Analytical Engines AS",
    "website": "https://example.com"
  },
  "language": "no",
  "demo_payload": {
    "agents": [{ "name": "AR-spesialist", "color": "lime", "tools": ["stripe", "tripletex"] }],
    "logs": [{ "agent": "AR-spesialist", "action": "drafted 7 chase emails", "ts": "11:42" }],
    "recommendation": { "headline": "...", "ask": "..." }
  },
  "notion_url": "https://www.notion.so/<workspace>/<page>"
}
```

Field notes:
- `lead_id` is the Notion page ID. Paperclip uses it to update the row.
- Top-level `recommendation` duplicates `demo_payload.recommendation` for receiver convenience.
- `language` is `"no"` or `"en"`. Plan generation must respect it.

## Expected response
- **2xx:** `{ "accepted": true, "job_id": "pc_job_abc123" }`. Caller treats any 2xx as success; `job_id` logged.
- **4xx:** caller does NOT retry. Logs body, marks Notion `manual-review` immediately.
- **5xx or network error:** caller retries per schedule. After the 3rd failure, marks Notion `manual-review`.
- **Non-JSON 2xx:** treated as success.

## Paperclip side responsibilities (not in this repo)
1. Patch Notion row to `plan-pending`.
2. Run pipeline (scrape, lookup, plan template).
3. Sanity guards (≥500 chars, references scraped data, ≥2 agents).
4. On pass: email plan via Resend (reply-to `christian@crunchtime.no`); patch Notion to `plan-delivered`, set `Plan Sent`.
5. On guard fail: patch Notion to `plan-needs-review`; email Christian a "review needed" notification; do NOT email the visitor.

The Crunchtime site does not poll. Notion is the shared state.
```

- [ ] **Step 2: Commit**

```bash
git add docs/runbooks/paperclip-webhook-contract.md
git commit -m "docs(lead): paperclip research-agent webhook contract"
```

---

## Task 8: Paperclip webhook trigger with retry

**Files:** Create `app/_lib/paperclip.ts`, `tests/unit/paperclip.test.ts`

- [ ] **Step 1: Test first**

Create `tests/unit/paperclip.test.ts`:

```ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const insertedLead = { pageId: "page-123", url: "https://notion.so/page-123" };
const baseLead = {
  name: "Ada", email: "ada@example.com", company: "AE", website: "https://example.com",
  notes: "", brief: "fakturaene er sene",
  demoPayload: {
    agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
    logs: [{ agent: "AR", action: "did", ts: "11:42" }],
    recommendation: { headline: "3 agenter", ask: "ok?" }
  },
  language: "no" as const, source: "brief-box-v1" as const, company_phone: ""
};

describe("triggerPaperclipResearchAgent", () => {
  const originalEnv = process.env;
  let markStatus: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    process.env = { ...originalEnv, PAPERCLIP_WEBHOOK_URL: "https://paperclip.example.com/hook" };
    vi.resetModules();
    markStatus = vi.fn().mockResolvedValue(undefined);
    vi.doMock("../../app/_lib/notion", () => ({ markLeadStatus: markStatus }));
  });
  afterEach(() => { process.env = originalEnv; vi.restoreAllMocks(); });

  async function run(fetchMock: ReturnType<typeof vi.fn>) {
    vi.stubGlobal("fetch", fetchMock);
    const { triggerPaperclipResearchAgent } = await import("../../app/_lib/paperclip");
    await triggerPaperclipResearchAgent(insertedLead, baseLead, { sleep: async () => {} });
  }
  const okResponse = new Response(JSON.stringify({ accepted: true }), { status: 200 });

  it("succeeds on first attempt and does not flip Notion status", async () => {
    const fetchMock = vi.fn().mockResolvedValue(okResponse);
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(markStatus).not.toHaveBeenCalled();
  });

  it("retries on 5xx and succeeds on the second attempt", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(new Response("nope", { status: 503 }))
      .mockResolvedValueOnce(okResponse);
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(markStatus).not.toHaveBeenCalled();
  });

  it("marks Notion as manual-review after 3 terminal failures", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("server down", { status: 500 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("paperclip webhook failed") }));
  });

  it("does NOT retry on 4xx and marks manual-review immediately", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("bad payload", { status: 400 }));
    await run(fetchMock);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(markStatus).toHaveBeenCalledWith("page-123", "manual-review",
      expect.objectContaining({ note: expect.stringContaining("4xx") }));
  });

  it("is a no-op when PAPERCLIP_WEBHOOK_URL is not set", async () => {
    delete process.env.PAPERCLIP_WEBHOOK_URL;
    const fetchMock = vi.fn();
    await run(fetchMock);
    expect(fetchMock).not.toHaveBeenCalled();
    expect(markStatus).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Implement**

Create `app/_lib/paperclip.ts`:

```ts
import type { LeadInput } from "./leadSchema";
import type { InsertedLead } from "./notion";
import { markLeadStatus } from "./notion";
import { retryWithBackoff } from "./retry";

const RETRY_DELAYS_MS = [1000, 4000]; // delay before retries 2 and 3
const RETRY_ATTEMPTS_AFTER_FIRST = 2; // total attempts = 1 + 2 = 3
const REQUEST_TIMEOUT_MS = 10_000;

class WebhookClientError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip webhook 4xx: ${status}`);
  }
}
class WebhookServerError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip webhook 5xx or network: ${status}`);
  }
}

async function postOnce(url: string, body: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
      signal: controller.signal
    });
  } catch (err) {
    throw new WebhookServerError(0, err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timer);
  }
  if (response.status >= 200 && response.status < 300) return;
  const text = await response.text().catch(() => "");
  if (response.status >= 400 && response.status < 500) {
    throw new WebhookClientError(response.status, text);
  }
  throw new WebhookServerError(response.status, text);
}

export interface PaperclipTriggerOptions {
  sleep?: (ms: number) => Promise<void>;
}

export async function triggerPaperclipResearchAgent(
  lead: InsertedLead,
  input: LeadInput,
  options: PaperclipTriggerOptions = {}
): Promise<void> {
  const url = process.env.PAPERCLIP_WEBHOOK_URL;
  if (!url) {
    console.warn("[paperclip] PAPERCLIP_WEBHOOK_URL not set — skipping webhook dispatch");
    return;
  }

  const payload = {
    lead_id: lead.pageId,
    brief: input.brief,
    recommendation: input.demoPayload.recommendation,
    visitor: { name: input.name, email: input.email, company: input.company, website: input.website },
    language: input.language,
    demo_payload: input.demoPayload,
    notion_url: lead.url
  };
  const body = JSON.stringify(payload);

  // First attempt outside retry helper so we can short-circuit on 4xx.
  try {
    await postOnce(url, body);
    console.log("[paperclip] webhook accepted on first attempt", { leadId: lead.pageId });
    return;
  } catch (err) {
    if (err instanceof WebhookClientError) {
      console.error("[paperclip] 4xx — not retrying", { status: err.status });
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip webhook 4xx (${err.status}): ${err.body.slice(0, 500)}`
      });
      return;
    }
    // 5xx / network — fall through to retry attempts 2 and 3.
  }

  try {
    await retryWithBackoff(() => postOnce(url, body), {
      attempts: RETRY_ATTEMPTS_AFTER_FIRST,
      delaysMs: RETRY_DELAYS_MS,
      sleep: options.sleep
    });
    console.log("[paperclip] webhook accepted after retry", { leadId: lead.pageId });
  } catch (err) {
    if (err instanceof WebhookClientError) {
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip webhook 4xx (${err.status}): ${err.body.slice(0, 500)}`
      });
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[paperclip] webhook failed after 3 attempts", { error: message });
    await markLeadStatus(lead.pageId, "manual-review", {
      note: `paperclip webhook failed after 3 attempts: ${message}`
    });
  }
}
```

Counting check against tests: terminal-fail test expects 3 fetch calls — first attempt + 2 retries = 3. ✓ `5xx then 200` test expects 2 fetch calls — first fails, retry attempt 1 succeeds = 2. ✓

- [ ] **Step 3: Run, expect 5 passing**

```bash
npm test -- paperclip
```

- [ ] **Step 4: Commit**

```bash
git add app/_lib/paperclip.ts tests/unit/paperclip.test.ts
git commit -m "feat(lead): paperclip webhook trigger with retry + manual-review fallback"
```

---

## Task 9: Resend client + email templates

**Files:** Create `app/_lib/resend.ts`, `app/_lib/emails/leadAck.no.tsx`, `leadAck.en.tsx`, `adminLead.tsx`

React component bodies — the `resend` SDK takes a `react` field directly and renders to HTML server-side. Inline styles only (email clients ignore `<style>` reliably). Two ack templates differ only in copy; admin template is monospace.

- [ ] **Step 1: NO ack template**

Create `app/_lib/emails/leadAck.no.tsx`:

```tsx
interface Props { name: string; brief: string; }
const wrap: React.CSSProperties = { fontFamily: "system-ui, sans-serif", color: "#0a0a09", lineHeight: 1.5 };
const card: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 24px" };
const quote: React.CSSProperties = { borderLeft: "2px solid #d4ef3a", padding: "8px 14px", margin: 0, background: "#f5f3ee", fontStyle: "italic" };

export function LeadAckNo({ name, brief }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <html lang="no"><body style={wrap}><div style={card}>
      <p style={{ fontSize: 14, color: "#8a8a82", margin: 0 }}>Crunchtime</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0" }}>Hei {firstName}, vi har fått brifen din.</h1>
      <p style={{ margin: "0 0 16px" }}>Plan kommer på e-post innen 30 min. Vi ser litt på bedriften din først.</p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5a5a52" }}>Du sendte oss:</p>
      <blockquote style={quote}>{brief}</blockquote>
      <p style={{ margin: "24px 0 0", fontSize: 14, color: "#5a5a52" }}>Svar på denne e-posten hvis det haster.</p>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>— Christian, Crunchtime</p>
    </div></body></html>
  );
}
```

- [ ] **Step 2: EN ack template**

Create `app/_lib/emails/leadAck.en.tsx`:

```tsx
interface Props { name: string; brief: string; }
const wrap: React.CSSProperties = { fontFamily: "system-ui, sans-serif", color: "#0a0a09", lineHeight: 1.5 };
const card: React.CSSProperties = { maxWidth: 560, margin: "0 auto", padding: "32px 24px" };
const quote: React.CSSProperties = { borderLeft: "2px solid #d4ef3a", padding: "8px 14px", margin: 0, background: "#f5f3ee", fontStyle: "italic" };

export function LeadAckEn({ name, brief }: Props) {
  const firstName = name.split(" ")[0] ?? name;
  return (
    <html lang="en"><body style={wrap}><div style={card}>
      <p style={{ fontSize: 14, color: "#8a8a82", margin: 0 }}>Crunchtime</p>
      <h1 style={{ fontSize: 22, fontWeight: 700, margin: "16px 0" }}>Hi {firstName}, we got your brief.</h1>
      <p style={{ margin: "0 0 16px" }}>A plan lands in your inbox within 30 minutes. We are looking at your company first.</p>
      <p style={{ margin: "0 0 16px", fontSize: 14, color: "#5a5a52" }}>You sent us:</p>
      <blockquote style={quote}>{brief}</blockquote>
      <p style={{ margin: "24px 0 0", fontSize: 14, color: "#5a5a52" }}>Reply to this email if it is urgent.</p>
      <p style={{ margin: "8px 0 0", fontSize: 14 }}>— Christian, Crunchtime</p>
    </div></body></html>
  );
}
```

- [ ] **Step 3: Admin template**

Create `app/_lib/emails/adminLead.tsx`:

```tsx
interface Props {
  name: string; email: string; company: string; website: string;
  brief: string; language: "no" | "en"; notionUrl: string;
}

export function AdminLeadEmail(p: Props) {
  return (
    <html lang="en"><body style={{ fontFamily: "ui-monospace, Menlo, monospace", color: "#0a0a09" }}>
      <div style={{ maxWidth: 600, margin: "0 auto", padding: "24px" }}>
        <h2 style={{ fontSize: 16, margin: "0 0 12px" }}>New Crunchtime lead</h2>
        <table style={{ borderCollapse: "collapse", fontSize: 13 }}><tbody>
          <tr><td><b>Name</b></td><td>{p.name}</td></tr>
          <tr><td><b>Email</b></td><td>{p.email}</td></tr>
          <tr><td><b>Company</b></td><td>{p.company}</td></tr>
          <tr><td><b>Website</b></td><td><a href={p.website}>{p.website}</a></td></tr>
          <tr><td><b>Language</b></td><td>{p.language}</td></tr>
        </tbody></table>
        <h3 style={{ fontSize: 14, margin: "16px 0 4px" }}>Brief</h3>
        <pre style={{ whiteSpace: "pre-wrap", background: "#f5f3ee", padding: "10px", fontSize: 13 }}>{p.brief}</pre>
        {p.notionUrl && <p style={{ marginTop: 16, fontSize: 13 }}>→ <a href={p.notionUrl}>Open in Notion</a></p>}
      </div>
    </body></html>
  );
}
```

- [ ] **Step 4: Resend client wrapper**

Create `app/_lib/resend.ts`:

```ts
import { Resend } from "resend";
import type { LeadInput } from "./leadSchema";
import type { InsertedLead } from "./notion";
import { LeadAckNo } from "./emails/leadAck.no";
import { LeadAckEn } from "./emails/leadAck.en";
import { AdminLeadEmail } from "./emails/adminLead";

const FROM = process.env.CONTACT_FROM ?? "Crunchtime <noreply@crunchtime.no>";
const REPLY_TO = "christian@crunchtime.no";
const ADMIN_INBOX = process.env.CONTACT_INBOX ?? "christian@crunchtime.no";

let _client: Resend | null = null;
function getClient(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  _client = new Resend(key);
  return _client;
}

export async function sendLeadAck(input: LeadInput): Promise<void> {
  const client = getClient();
  const subject = input.language === "no"
    ? "Vi har fått brifen din — plan kommer snart"
    : "We got your brief — plan incoming";
  const react = input.language === "no"
    ? LeadAckNo({ name: input.name, brief: input.brief })
    : LeadAckEn({ name: input.name, brief: input.brief });

  const { error } = await client.emails.send({
    from: FROM, to: [input.email], replyTo: REPLY_TO, subject, react
  });
  if (error) throw new Error(`resend lead-ack failed: ${error.message ?? JSON.stringify(error)}`);
}

export async function sendAdminNotification(input: LeadInput, inserted: InsertedLead): Promise<void> {
  const client = getClient();
  const react = AdminLeadEmail({
    name: input.name, email: input.email, company: input.company, website: input.website,
    brief: input.brief, language: input.language, notionUrl: inserted.url
  });
  const { error } = await client.emails.send({
    from: FROM, to: [ADMIN_INBOX], replyTo: input.email,
    subject: `New Crunchtime lead: ${input.company}`, react
  });
  // Admin failure should not break the user flow — log and continue.
  if (error) console.error("[resend] admin notification failed", error);
}
```

Slack delivery is a future enhancement — swapping in a Slack webhook is one new function call site.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 6: Commit**

```bash
git add app/_lib/resend.ts app/_lib/emails/
git commit -m "feat(lead): resend client + lead ack (no/en) and admin notification templates"
```

---

## Task 10: The `/api/lead` route handler

**Files:** Create `app/api/lead/route.ts`

- [ ] **Step 1: Implement**

Create `app/api/lead/route.ts`:

```ts
import { NextResponse, after } from "next/server";
import { leadInputSchema } from "../../_lib/leadSchema";
import { isHoneypotTriggered } from "../../_lib/honeypot";
import { insertLead } from "../../_lib/notion";
import { sendLeadAck, sendAdminNotification } from "../../_lib/resend";
import { triggerPaperclipResearchAgent } from "../../_lib/paperclip";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const input = parsed.data;

  if (isHoneypotTriggered(input.company_phone)) {
    console.log("[honeypot] rejected lead submission", { email: input.email });
    return NextResponse.json({ ok: true });
  }

  let inserted;
  try {
    inserted = await insertLead(input);
  } catch (err) {
    console.error("[lead] notion insert failed", err);
    return NextResponse.json({ ok: false, error: "could not save lead" }, { status: 502 });
  }

  // Visitor ack synchronously — if it fails, surface partial success.
  try {
    await sendLeadAck(input);
  } catch (err) {
    console.error("[lead] visitor ack failed", err);
    after(() => sendAdminNotification(input, inserted));
    after(() => triggerPaperclipResearchAgent(inserted, input));
    return NextResponse.json(
      { ok: true, ackEmail: "deferred", leadId: inserted.pageId },
      { status: 202 }
    );
  }

  // Admin ping + paperclip webhook fire async.
  after(() => sendAdminNotification(input, inserted));
  after(() => triggerPaperclipResearchAgent(inserted, input));

  return NextResponse.json({ ok: true, leadId: inserted.pageId });
}
```

`after` (from `next/server`, stable since Next 15.1) runs the callback after the response is sent without blocking it; on Vercel it uses `waitUntil` under the hood, on `next dev` it runs in-process.

- [ ] **Step 2: Build**

```bash
npm run build
```
Expected: `ƒ /api/lead` listed as a Node-runtime dynamic route.

- [ ] **Step 3: Commit**

```bash
git add app/api/lead/route.ts
git commit -m "feat(lead): /api/lead route — validate, notion insert, ack, async webhook"
```

---

## Task 11: Verify Plan #2 form fields match the schema

**Files:** Possibly modify `app/[locale]/_components/BriefBox/EndCard.tsx` (Plan #2's file)

This task is the integration handshake. Plan #2 owns the React form, this plan owns the API contract.

- [ ] **Step 1: Check whether Plan #2 has been merged**

```bash
ls "app/[locale]/_components/BriefBox/" 2>/dev/null || echo "Plan #2 not merged yet"
```

If "Plan #2 not merged yet" prints, skip to step 3 — the comment header in `app/_lib/leadSchema.ts` (Task 3, Step 1) already documents the contract for the Plan #2 implementer.

- [ ] **Step 2: Verify field names match (only if Plan #2 is merged)**

Read the form component. The submit handler must POST a JSON body whose keys match `leadInputSchema`:

| Form field | JSON key | Notes |
|---|---|---|
| input `name="name"` | `name` | required |
| input `name="email"` | `email` | required |
| input `name="company"` | `company` | required |
| input `name="website"` | `website` | required, URL |
| textarea `name="notes"` | `notes` | optional |
| (hidden) | `brief` | from demo state |
| (hidden) | `demoPayload` | full JSON from `/api/brief` |
| (hidden) | `language` | `"no"` or `"en"` from current locale |
| (hidden) | `source` | literal `"brief-box-v1"` |
| (hidden, honeypot) | `company_phone` | text input, `tabIndex={-1}`, `aria-hidden`, off-screen |

If Plan #2 uses different field names, update the form component to match. **Do not change the schema** — it is the contract for the Paperclip side too.

- [ ] **Step 3: Commit (only if changes were made)**

```bash
git add app/[locale]/_components/BriefBox/EndCard.tsx 2>/dev/null
git status # verify staged changes exist before committing
git commit -m "chore(lead): align form field names with /api/lead schema"
```

If `git status` shows nothing staged, skip the commit.

---

## Task 12: E2E happy path

**Files:** Create `tests/e2e/lead-capture.spec.ts`

The E2E mocks `/api/lead` at the network boundary so we do not call Notion / Resend / Paperclip in CI.

- [ ] **Step 1: Write the test**

Create `tests/e2e/lead-capture.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("lead capture form", () => {
  test("submits a valid payload and shows success", async ({ page }) => {
    let capturedPayload: any = null;

    await page.route("**/api/lead", async (route) => {
      capturedPayload = JSON.parse(route.request().postData() ?? "{}");
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ok: true, leadId: "test-page-123" })
      });
    });

    // Stub /api/brief so the demo completes deterministically.
    await page.route("**/api/brief", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
          logs: [{ agent: "AR", action: "did a thing", ts: "11:42" }],
          recommendation: { headline: "3 agenter, ~4t/uke spart.", ask: "Vil du sette opp?" }
        })
      });
    });

    await page.goto("/no");

    await page.getByRole("textbox", { name: /brief|problem/i }).first().fill("fakturaene er sene");
    await page.keyboard.press("Enter");

    const skip = page.getByRole("link", { name: /skip|hopp/i });
    if (await skip.isVisible().catch(() => false)) {
      await skip.click();
    }

    await page.getByRole("button", { name: /send.*e-?post/i }).click();

    await page.getByLabel(/navn/i).fill("Ada Lovelace");
    await page.getByLabel(/e-?post/i).fill("ada@example.com");
    await page.getByLabel(/firma/i).fill("Analytical Engines AS");
    await page.getByLabel(/nettside/i).fill("https://example.com");

    await page.getByRole("button", { name: /send|submit/i }).last().click();

    await expect(page.getByText(/plan kommer|innen 30 min|takk/i)).toBeVisible({ timeout: 5000 });

    expect(capturedPayload).toMatchObject({
      name: "Ada Lovelace",
      email: "ada@example.com",
      company: "Analytical Engines AS",
      website: "https://example.com",
      language: "no",
      source: "brief-box-v1",
      company_phone: ""
    });
    expect(capturedPayload.brief).toContain("fakturaene");
    expect(capturedPayload.demoPayload?.recommendation?.headline).toBeTruthy();
  });

  test("honeypot fill returns success without contacting downstream", async ({ request }) => {
    const response = await request.post("/api/lead", {
      data: {
        name: "Bot Bot", email: "bot@example.com", company: "Botco",
        website: "https://bot.example.com", notes: "", brief: "test",
        demoPayload: {
          agents: [{ name: "x", color: "lime", tools: ["a"] }],
          logs: [{ agent: "x", action: "y", ts: "00:00" }],
          recommendation: { headline: "h", ask: "a" }
        },
        language: "no", source: "brief-box-v1",
        company_phone: "+47 99 88 77 66"
      }
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ ok: true });
    expect(body.leadId).toBeUndefined();
  });

  test("invalid payload returns 400", async ({ request }) => {
    const response = await request.post("/api/lead", {
      data: { name: "", email: "not-an-email", company: "", website: "not-a-url" }
    });
    expect(response.status()).toBe(400);
    expect((await response.json()).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Plan #2 dependency note**

The first test depends on Plan #2's form existing with field labels matching the regex selectors. If Plan #2 has not landed, mark the first test with `test.skip` and add a comment to re-enable. Tests 2 and 3 hit `/api/lead` directly and run without Plan #2.

- [ ] **Step 3: Run**

```bash
npm run test:e2e -- --grep "lead capture"
```
Expected: 3 passing (or 2 + 1 skipped if Plan #2 not yet merged).

- [ ] **Step 4: Commit**

```bash
git add tests/e2e/lead-capture.spec.ts
git commit -m "test(lead): e2e happy path + honeypot + validation tests for /api/lead"
```

---

## Task 13: Document env vars + final sweep

**Files:** Modify or create `.env.local.example`

- [ ] **Step 1: Update env example**

Open `.env.local.example` (create if absent). Ensure it contains:

```
# Existing
RESEND_API_KEY=
CONTACT_INBOX=christian@crunchtime.no
CONTACT_FROM=Crunchtime <noreply@crunchtime.no>
NEXT_PUBLIC_CAL_BOOKING_LINK=

# Lead capture (Plan 4)
NOTION_TOKEN=
NOTION_DATABASE_ID=
PAPERCLIP_WEBHOOK_URL=
```

The engineer must also add `NOTION_TOKEN`, `NOTION_DATABASE_ID`, and `PAPERCLIP_WEBHOOK_URL` to Vercel project env across **Production**, **Preview**, and **Development** scopes (mark Sensitive). Notion vars also need to live in `.env.local` for `npm run dev`.

- [ ] **Step 2: Lint + typecheck + tests + build**

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

Console statements in `paperclip.ts` and `route.ts` are intentional; if lint flags them, add `// eslint-disable-next-line no-console`.

- [ ] **Step 3: E2E**

```bash
npm run test:e2e
```
Expected: prior plans' tests + lead-capture (3 or 2+1-skipped) all pass.

- [ ] **Step 4: Commit**

```bash
git add .env.local.example
git commit -m "docs(lead): document NOTION + PAPERCLIP env vars in .env.local.example"
```

If lint/type fixes were needed:

```bash
git add -A
git commit -m "fix(lead): cleanup from final sweep"
```

---

## Self-Review Checklist

**1. Spec coverage** — does the plan implement these spec sections?

- [x] "Email-capture flow → Form fields (required + optional + hidden + honeypot)" → Tasks 3, 11
- [x] "Email-capture flow → Insert row in Notion CRM" → Tasks 2, 6, 10
- [x] "Email-capture flow → Send ack email via Resend (NO + EN)" → Task 9
- [x] "Email-capture flow → Trigger Paperclip async job (HTTP webhook)" → Tasks 7, 8, 10
- [x] "Email-capture flow → Slack/email ping to Christian for every lead" → Task 9 (admin email; Slack noted as future)
- [x] "Email-capture flow → Honeypot `company_phone` field" → Tasks 4, 10
- [x] "Email-capture flow → CRM status writeback (`plan-delivered` / `needs-review`)" → Documented in Task 7 (Paperclip side); Crunchtime side handles `manual-review` writeback when its own webhook dispatch fails (Task 8)

**Out of scope (covered elsewhere):**
- Form UI itself — Plan #2. Task 11 is the integration handshake.
- Brief Box demo and `/api/brief` — Plan #2.
- `/services` and `/contact` page rebuilds — Plan #3.
- Research-agent code — lives in Paperclip; contract documented in Task 7.
- Locale routing scaffolding — Plan #1.

**2. Placeholder scan** — none of:
- "TBD" — Notion DB schema fully resolved (Task 2); webhook URL named + contract published (Task 7).
- "TODO", "implement later", "similar to Task N without code" — every task ships complete code.
- "Add appropriate error handling" — every error path enumerated (validation 400, honeypot silent 200, notion-fail 502, ack-fail 202 partial, webhook-fail Notion `manual-review`).

**3. Type & contract consistency** — `LeadInput` is the one inferred type; `insertLead` returns `InsertedLead` consumed by `triggerPaperclipResearchAgent` and `sendAdminNotification`; the webhook payload in `paperclip.ts` matches the Task 7 contract field-for-field.

**4. Honeypot behavior** — verified silent: returns `{ ok: true }` 200, no Notion / Resend / webhook calls fire.

**5. Webhook attempt count** — 3 attempts: 1 immediate + 2 retries with 1s and 4s gaps. Spec wording was "3 attempts: 1s, 4s, 16s" which is ambiguous about whether the first delay precedes attempt 1 or attempt 2. This plan uses the natural interpretation (gaps between attempts). The third gap "16s" only matters for a hypothetical 4th attempt; flag with the spec author if they want a 4th attempt instead.

**6. After-response work** — uses `next/server`'s `after()` so Vercel's `waitUntil` keeps the function warm long enough to drain the webhook + admin email without delaying the visitor's response.

---

## Done Criteria

When all 13 tasks are complete:

- A POST to `/api/lead` with a valid payload writes a row to Notion with all 11 properties populated, sends a NO-or-EN ack to the visitor, sends a `New Crunchtime lead: {company}` email to `christian@crunchtime.no`, and dispatches a Paperclip webhook asynchronously.
- A POST with `company_phone` filled returns `{ ok: true }` and does nothing else.
- A POST with an invalid payload returns 400 with zod issue details.
- The Paperclip webhook retries on 5xx (3 attempts total at 1s / 4s gaps), bails on 4xx, and on terminal failure marks the Notion row `manual-review` with a diagnostic note.
- All env vars are documented in `.env.local.example` and in `docs/runbooks/notion-crm-setup.md`.
- The Notion CRM database schema is fully specified and reproducible from the runbook.
- The Paperclip webhook contract is fully specified in `docs/runbooks/paperclip-webhook-contract.md`.
- Vitest unit suite covers schema validation, honeypot, retry math, and webhook orchestration (all green).
- Playwright E2E covers the form-submit happy path (with `/api/lead` mocked) plus direct API tests for honeypot and validation rejection.
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm test`, `npm run test:e2e` all pass.

---

## Final plan

This is plan 4 of 4 for the Crunchtime site rethink. After this lands and the runbooks have been executed against the real Notion workspace and the real Paperclip endpoint, the rethink is feature-complete:

- **Plan 1** — bilingual scaffolding + test harness.
- **Plan 2** — Brief Box demo (home page + `/api/brief` + canned templates + animation scheduler).
- **Plan 3** — `/services` long-form + simplified `/contact`.
- **Plan 4** (this plan) — lead capture backend.

Cutover follows the spec's "Migration & rollout" steps: feature-flag review on Vercel preview → 10% traffic split for one week → full cutover once conversion metrics are at parity or better. The legacy home stays at `/_legacy/home` for 30 days, then the directory is deleted.
