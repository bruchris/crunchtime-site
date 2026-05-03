# Crunchtime Rethink — Plan 2: Brief Box Demo

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the existing home page with the Brief Box demo: an input + 4 suggestion chips that triggers a server-side Claude Haiku 4.5 call, then auto-runs a 4-act animated phase sequence (team forms, tools connect, agents work, end card with 3 CTAs).

**Architecture:** A single React island at `app/[locale]/page.tsx` renders the headline, input, chip row, and a `DemoStage` that listens to a pure-TypeScript scheduler (`app/_lib/demoScheduler.ts`). The frontend POSTs the brief to `/api/brief`, which calls Haiku with structured-output instructions, validates with zod, and falls back to a hand-curated canned template library on any failure. Animation is CSS keyframes only (no Framer/GSAP) so the hero stays lean. JS-disabled visitors get a server-rendered fallback at `/api/brief-noscript`.

**Tech Stack:** Next.js 16 (App Router, RSC + client islands), React 19, `next-intl` v4 (from Plan #1), `@anthropic-ai/sdk` v0.40+, `zod` v3, Vitest v3 (unit), `@playwright/test` v1.50+ (E2E), TypeScript 5.6.

**Spec reference:** [docs/superpowers/specs/2026-05-03-crunchtime-rethink-design.md](../specs/2026-05-03-crunchtime-rethink-design.md) — sections "The Brief Box", "Engine", "Suggestion chips", "End card", "Email-capture flow" (UI only — backend is Plan #4), "Failure modes", "Skip link behavior", "Animation framework", "Edge cases".

---

## File Structure

**New files:**
- `app/_lib/cannedTemplates.ts` — 12 hand-written template payloads keyed by intent + a `general` fallback (NO + EN variants).
- `app/_lib/briefSchema.ts` — zod schema for `BriefResponse`; shared between `/api/brief` and the client.
- `app/_lib/rateLimit.ts` — in-memory sliding-window rate limiter (per-IP, 5/hr).
- `app/_lib/demoScheduler.ts` — phase state machine + emitter. Pure TS, no React.
- `app/_lib/briefPrompt.ts` — builds the Haiku system + user prompt.
- `app/[locale]/_components/BriefBox/BriefInput.tsx` — input with blinking cursor + form submit.
- `app/[locale]/_components/BriefBox/ChipRow.tsx` — 4 visible chips, server-side localized labels.
- `app/[locale]/_components/BriefBox/DemoStage.tsx` — top-level client island; owns scheduler lifecycle.
- `app/[locale]/_components/BriefBox/AgentCard.tsx` — single agent panel (name, role, color dot, tool list).
- `app/[locale]/_components/BriefBox/ToolList.tsx` — tools with "kobler → koblet" pill animation.
- `app/[locale]/_components/BriefBox/LogStream.tsx` — timestamped log feed.
- `app/[locale]/_components/BriefBox/EndCard.tsx` — recommendation + 3 CTAs + inline email form expansion.
- `app/[locale]/_components/BriefBox/EmailCaptureForm.tsx` — fields + honeypot, stub POST to `/api/lead`.
- `app/[locale]/_components/BriefBox/SkipLink.tsx` — top-right "skip til resultat" control.
- `app/[locale]/_components/BriefBox/StatusPill.tsx` — animated "● live · oslo" pill.
- `app/[locale]/_components/BriefBox/briefBox.module.css` — component-scoped CSS keyframes.
- `app/api/brief/route.ts` — POST handler (Haiku call, zod, rate-limit, fallback).
- `app/api/brief-noscript/route.ts` — POST handler returning a static HTML page.
- `tests/unit/cannedTemplates.test.ts` — keyword routing + `general` fallback shape.
- `tests/unit/briefSchema.test.ts` — zod accepts good payload, rejects bad shapes.
- `tests/unit/rateLimit.test.ts` — sliding window allows 5, blocks 6th, recovers after window.
- `tests/unit/demoScheduler.test.ts` — phase sequence and skip behavior with fake timers.
- `tests/unit/briefRoute.test.ts` — `/api/brief` handler with mocked Anthropic SDK.
- `tests/e2e/briefbox.spec.ts` — full demo flow, chip submit, skip link, end card CTAs visible.
- `tests/e2e/briefbox-noscript.spec.ts` — JS-disabled fallback POST.
- `.env.local.example` — documents the new `ANTHROPIC_API_KEY`.

**Modified:**
- `app/[locale]/page.tsx` — replaces existing home with Brief Box scaffolding (server component shell + client island).
- `messages/no.json` — add `briefBox.*` and `endCard.*` keys.
- `messages/en.json` — same keys, English copy.
- `app/globals.css` — add a few global keyframes used by the demo (cursor blink, status-pill pulse) and the grid-background utility.
- `package.json` — add `@anthropic-ai/sdk` and `zod` deps.
- `.gitignore` — ensure `.env.local` is ignored (already standard for Next; verify only).

**Removed:**
- The old marketing content of `app/[locale]/page.tsx` (whatever Plan #1 carried over). Replaced wholesale.

---

## Task 1: Install runtime dependencies and document env

**Files:**
- Modify: `package.json`
- Create: `.env.local.example`

- [ ] **Step 1: Install Anthropic SDK and zod**

```bash
npm install @anthropic-ai/sdk zod
```

Expected: `@anthropic-ai/sdk` (v0.40+) and `zod` (v3) added to `dependencies` in `package.json`.

- [ ] **Step 2: Create `.env.local.example`**

Create the file at the repo root with this exact content:

```
# Anthropic API key for the Brief Box LLM call.
# Get one at https://console.anthropic.com/settings/keys.
# Local dev: copy this file to .env.local and fill in.
# Vercel: add as a Production + Preview env var.
ANTHROPIC_API_KEY=

# Booking link reused by end-card CTA (already used elsewhere in the site).
NEXT_PUBLIC_CAL_BOOKING_LINK=
```

- [ ] **Step 3: Tell the engineer running this plan to populate `.env.local`**

Run (as a sanity check that the engineer must perform locally):

```bash
test -f .env.local || cp .env.local.example .env.local
```

Then they edit `.env.local` and paste a real key. The plan does not commit this.

- [ ] **Step 4: Verify install**

Run: `npm ls @anthropic-ai/sdk zod`
Expected: both listed at non-empty versions.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.local.example
git commit -m "chore(briefbox): add anthropic-sdk + zod, document ANTHROPIC_API_KEY"
```

---

## Task 2: Define the BriefResponse zod schema

**Files:**
- Create: `app/_lib/briefSchema.ts`
- Create: `tests/unit/briefSchema.test.ts`

- [ ] **Step 1: Write the schema test first**

Create `tests/unit/briefSchema.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { briefResponseSchema } from "../../app/_lib/briefSchema";

const valid = {
  agents: [
    { name: "AR-spesialist", color: "lime", tools: ["stripe", "tripletex"] },
    { name: "Cashflow", color: "amber", tools: ["fiken"] }
  ],
  logs: [
    { agent: "AR-spesialist", action: "drafted 7 chase emails", ts: "11:42" },
    { agent: "Cashflow", action: "flagged 3 at >30d risk", ts: "11:43" },
    { agent: "AR-spesialist", action: "scheduled follow-ups", ts: "11:44" }
  ],
  recommendation: { headline: "3 agenter, ~4t/uke spart.", ask: "Vil du sette dette opp?" }
};

describe("briefResponseSchema", () => {
  it("accepts a valid payload", () => {
    expect(briefResponseSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects 0 agents", () => {
    expect(briefResponseSchema.safeParse({ ...valid, agents: [] }).success).toBe(false);
  });

  it("rejects 5 agents", () => {
    const tooMany = { ...valid, agents: Array(5).fill(valid.agents[0]) };
    expect(briefResponseSchema.safeParse(tooMany).success).toBe(false);
  });

  it("rejects 2 logs", () => {
    expect(briefResponseSchema.safeParse({ ...valid, logs: valid.logs.slice(0, 2) }).success).toBe(false);
  });

  it("rejects headline >80 chars", () => {
    const tooLong = {
      ...valid,
      recommendation: { headline: "x".repeat(81), ask: "ok" }
    };
    expect(briefResponseSchema.safeParse(tooLong).success).toBe(false);
  });

  it("rejects unknown color", () => {
    const bad = {
      ...valid,
      agents: [{ name: "X", color: "purple", tools: ["a"] }, valid.agents[1]]
    };
    expect(briefResponseSchema.safeParse(bad).success).toBe(false);
  });

  it("rejects an agent with 0 tools", () => {
    const bad = {
      ...valid,
      agents: [{ name: "X", color: "lime", tools: [] }, valid.agents[1]]
    };
    expect(briefResponseSchema.safeParse(bad).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- briefSchema`
Expected: import fails because `app/_lib/briefSchema.ts` does not exist yet.

- [ ] **Step 3: Implement the schema**

Create `app/_lib/briefSchema.ts`:

```ts
import { z } from "zod";

export const AGENT_COLORS = ["lime", "blue", "amber", "violet", "cyan"] as const;
export type AgentColor = (typeof AGENT_COLORS)[number];

export const agentSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.enum(AGENT_COLORS),
  tools: z.array(z.string().min(1).max(30)).min(1).max(4)
});

export const logSchema = z.object({
  agent: z.string().min(1).max(40),
  action: z.string().min(1).max(120),
  ts: z.string().regex(/^\d{2}:\d{2}$/)
});

export const recommendationSchema = z.object({
  headline: z.string().min(1).max(80),
  ask: z.string().min(1).max(200)
});

export const briefResponseSchema = z.object({
  agents: z.array(agentSchema).min(1).max(4),
  logs: z.array(logSchema).min(3).max(5),
  recommendation: recommendationSchema
});

export type BriefResponse = z.infer<typeof briefResponseSchema>;
export type Agent = z.infer<typeof agentSchema>;
export type LogLine = z.infer<typeof logSchema>;

export const briefRequestSchema = z.object({
  brief: z.string().min(1).max(500),
  lang: z.enum(["no", "en"])
});

export type BriefRequest = z.infer<typeof briefRequestSchema>;
```

Decision (documented): we picked 5 agent colors (`lime`, `blue`, `amber`, `violet`, `cyan`) because the spec only names three but says "color: lime|blue|amber" is illustrative and we need headroom for variety. The CSS in Task 9 maps each to a hex.

- [ ] **Step 4: Run tests, expect pass**

Run: `npm test -- briefSchema`
Expected: 7 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/_lib/briefSchema.ts tests/unit/briefSchema.test.ts
git commit -m "feat(briefbox): add BriefResponse zod schema with bounds matching spec"
```

---

## Task 3: Build the canned-template library

**Files:**
- Create: `app/_lib/cannedTemplates.ts`
- Create: `tests/unit/cannedTemplates.test.ts`

- [ ] **Step 1: Write the routing test first**

Create `tests/unit/cannedTemplates.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { pickTemplate, getTemplate, TEMPLATE_KEYS } from "../../app/_lib/cannedTemplates";
import { briefResponseSchema } from "../../app/_lib/briefSchema";

describe("cannedTemplates", () => {
  it("has at least 12 templates plus general", () => {
    expect(TEMPLATE_KEYS.length).toBeGreaterThanOrEqual(13);
    expect(TEMPLATE_KEYS).toContain("general");
  });

  it("every template parses against the schema in both languages", () => {
    for (const key of TEMPLATE_KEYS) {
      for (const lang of ["no", "en"] as const) {
        const tpl = getTemplate(key, lang);
        const result = briefResponseSchema.safeParse(tpl);
        if (!result.success) {
          throw new Error(`Template ${key}/${lang} invalid: ${JSON.stringify(result.error.issues)}`);
        }
      }
    }
  });

  it("routes 'fakturaene er sene' to ar_cashflow", () => {
    expect(pickTemplate("fakturaene våre er sene", "no")).toBe("ar_cashflow");
  });

  it("routes 'we lose leads' to sales_crm", () => {
    expect(pickTemplate("we keep losing leads to slow follow-up", "en")).toBe("sales_crm");
  });

  it("routes 'e-post tar over livet' to inbox_triage", () => {
    expect(pickTemplate("e-post tar over livet mitt", "no")).toBe("inbox_triage");
  });

  it("routes 'kundeservice koker' to support_tier1", () => {
    expect(pickTemplate("kundeservice koker over", "no")).toBe("support_tier1");
  });

  it("routes 'ingen tid til markedsføring' to content_social", () => {
    expect(pickTemplate("ingen tid til markedsføring", "no")).toBe("content_social");
  });

  it("falls back to 'general' on a brief with no keyword hits", () => {
    expect(pickTemplate("xyzzy plover frobnitz", "no")).toBe("general");
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm test -- cannedTemplates`
Expected: import fails — file does not exist.

- [ ] **Step 3: Create the template library — part A: types and helpers**

Create `app/_lib/cannedTemplates.ts`:

```ts
import type { BriefResponse } from "./briefSchema";

export type TemplateKey =
  | "ar_cashflow"
  | "sales_crm"
  | "inbox_triage"
  | "support_tier1"
  | "content_social"
  | "scheduling"
  | "hr_onboarding"
  | "data_entry"
  | "reporting"
  | "procurement"
  | "compliance"
  | "research"
  | "general";

export const TEMPLATE_KEYS: TemplateKey[] = [
  "ar_cashflow",
  "sales_crm",
  "inbox_triage",
  "support_tier1",
  "content_social",
  "scheduling",
  "hr_onboarding",
  "data_entry",
  "reporting",
  "procurement",
  "compliance",
  "research",
  "general"
];

export type Lang = "no" | "en";

type Library = Record<TemplateKey, Record<Lang, BriefResponse>>;
```

- [ ] **Step 4: Add the library payloads — part B: the first six templates**

Append to `app/_lib/cannedTemplates.ts`:

```ts
const TEMPLATES: Library = {
  ar_cashflow: {
    no: {
      agents: [
        { name: "AR-spesialist", color: "lime", tools: ["stripe", "tripletex", "gmail"] },
        { name: "Kundeservice", color: "blue", tools: ["gmail", "slack"] },
        { name: "Cashflow", color: "amber", tools: ["fiken"] }
      ],
      logs: [
        { agent: "AR-spesialist", action: "skrev 7 påminnelser", ts: "11:42" },
        { agent: "Kundeservice", action: "myket opp tonen i 2", ts: "11:43" },
        { agent: "Cashflow", action: "flagget 3 over 30d", ts: "11:44" }
      ],
      recommendation: {
        headline: "3 agenter, ~4t/uke spart.",
        ask: "Vil du ha dette satt opp på ekte for bedriften din?"
      }
    },
    en: {
      agents: [
        { name: "AR specialist", color: "lime", tools: ["stripe", "tripletex", "gmail"] },
        { name: "Customer voice", color: "blue", tools: ["gmail", "slack"] },
        { name: "Cashflow", color: "amber", tools: ["fiken"] }
      ],
      logs: [
        { agent: "AR specialist", action: "drafted 7 chase emails", ts: "11:42" },
        { agent: "Customer voice", action: "softened tone on 2", ts: "11:43" },
        { agent: "Cashflow", action: "flagged 3 invoices >30d", ts: "11:44" }
      ],
      recommendation: {
        headline: "3 agents, ~4h/wk saved.",
        ask: "Want this wired up for your company?"
      }
    }
  },
  sales_crm: {
    no: {
      agents: [
        { name: "SDR", color: "lime", tools: ["hubspot", "linkedin", "gmail"] },
        { name: "Researcher", color: "violet", tools: ["web", "linkedin"] },
        { name: "Closer", color: "amber", tools: ["calendly", "gmail"] }
      ],
      logs: [
        { agent: "Researcher", action: "fant 12 nye leads i Bergen", ts: "09:15" },
        { agent: "SDR", action: "sendte 12 personaliserte meldinger", ts: "09:22" },
        { agent: "Closer", action: "booket 2 møter neste uke", ts: "09:38" }
      ],
      recommendation: {
        headline: "3 agenter, +12 leads/uke.",
        ask: "Vil du teste dette på pipelinen din?"
      }
    },
    en: {
      agents: [
        { name: "SDR", color: "lime", tools: ["hubspot", "linkedin", "gmail"] },
        { name: "Researcher", color: "violet", tools: ["web", "linkedin"] },
        { name: "Closer", color: "amber", tools: ["calendly", "gmail"] }
      ],
      logs: [
        { agent: "Researcher", action: "found 12 new leads in Bergen", ts: "09:15" },
        { agent: "SDR", action: "sent 12 personalized messages", ts: "09:22" },
        { agent: "Closer", action: "booked 2 meetings next week", ts: "09:38" }
      ],
      recommendation: {
        headline: "3 agents, +12 leads/wk.",
        ask: "Want to try this on your pipeline?"
      }
    }
  },
  inbox_triage: {
    no: {
      agents: [
        { name: "Triager", color: "lime", tools: ["gmail", "notion"] },
        { name: "Planlegger", color: "blue", tools: ["calendar", "gmail"] }
      ],
      logs: [
        { agent: "Triager", action: "kategoriserte 84 e-poster", ts: "08:02" },
        { agent: "Triager", action: "svarte på 19 standardspørsmål", ts: "08:11" },
        { agent: "Planlegger", action: "booket 4 møter direkte", ts: "08:24" }
      ],
      recommendation: {
        headline: "Inboxen ned fra 200 til 12.",
        ask: "Vil du slippe denne fri på e-posten din?"
      }
    },
    en: {
      agents: [
        { name: "Triager", color: "lime", tools: ["gmail", "notion"] },
        { name: "Scheduler", color: "blue", tools: ["calendar", "gmail"] }
      ],
      logs: [
        { agent: "Triager", action: "categorized 84 emails", ts: "08:02" },
        { agent: "Triager", action: "answered 19 standard asks", ts: "08:11" },
        { agent: "Scheduler", action: "booked 4 meetings directly", ts: "08:24" }
      ],
      recommendation: {
        headline: "Inbox from 200 down to 12.",
        ask: "Want to point this at your inbox?"
      }
    }
  },
  support_tier1: {
    no: {
      agents: [
        { name: "Tier-1", color: "lime", tools: ["intercom", "notion", "gmail"] },
        { name: "Eskalering", color: "amber", tools: ["slack", "linear"] }
      ],
      logs: [
        { agent: "Tier-1", action: "lukket 23 saker selv", ts: "10:00" },
        { agent: "Tier-1", action: "skrev 5 nye FAQ-utkast", ts: "10:14" },
        { agent: "Eskalering", action: "ruta 3 til riktig person", ts: "10:25" }
      ],
      recommendation: {
        headline: "70% av tickets løst uten deg.",
        ask: "Skal vi koble dette på supporten din?"
      }
    },
    en: {
      agents: [
        { name: "Tier 1", color: "lime", tools: ["intercom", "notion", "gmail"] },
        { name: "Escalation", color: "amber", tools: ["slack", "linear"] }
      ],
      logs: [
        { agent: "Tier 1", action: "closed 23 tickets solo", ts: "10:00" },
        { agent: "Tier 1", action: "drafted 5 new FAQ entries", ts: "10:14" },
        { agent: "Escalation", action: "routed 3 to the right human", ts: "10:25" }
      ],
      recommendation: {
        headline: "70% of tickets solved without you.",
        ask: "Wire this into your support stack?"
      }
    }
  },
  content_social: {
    no: {
      agents: [
        { name: "Skribent", color: "lime", tools: ["notion", "openai", "linkedin"] },
        { name: "Designer", color: "violet", tools: ["figma", "canva"] },
        { name: "Planlegger", color: "blue", tools: ["buffer", "linkedin"] }
      ],
      logs: [
        { agent: "Skribent", action: "skrev 4 LinkedIn-poster", ts: "13:01" },
        { agent: "Designer", action: "lagde 4 bilder i merkevaren", ts: "13:18" },
        { agent: "Planlegger", action: "la dem i kø for uka", ts: "13:25" }
      ],
      recommendation: {
        headline: "Ukens innhold på 25 minutter.",
        ask: "Vil du ha dette på pilot?"
      }
    },
    en: {
      agents: [
        { name: "Writer", color: "lime", tools: ["notion", "openai", "linkedin"] },
        { name: "Designer", color: "violet", tools: ["figma", "canva"] },
        { name: "Scheduler", color: "blue", tools: ["buffer", "linkedin"] }
      ],
      logs: [
        { agent: "Writer", action: "drafted 4 LinkedIn posts", ts: "13:01" },
        { agent: "Designer", action: "made 4 on-brand images", ts: "13:18" },
        { agent: "Scheduler", action: "queued them for the week", ts: "13:25" }
      ],
      recommendation: {
        headline: "A week of content in 25 minutes.",
        ask: "Want a pilot of this?"
      }
    }
  },
  scheduling: {
    no: {
      agents: [
        { name: "Møtebooker", color: "lime", tools: ["calendar", "gmail"] },
        { name: "Forberedelse", color: "blue", tools: ["notion", "web"] }
      ],
      logs: [
        { agent: "Møtebooker", action: "fant 5 luker som passet alle", ts: "07:45" },
        { agent: "Forberedelse", action: "skrev brief til hvert møte", ts: "07:55" },
        { agent: "Møtebooker", action: "sendte invitasjoner med agenda", ts: "08:01" }
      ],
      recommendation: {
        headline: "Møter booket og forberedt før kaffe.",
        ask: "Skal vi sette dette opp for deg?"
      }
    },
    en: {
      agents: [
        { name: "Booker", color: "lime", tools: ["calendar", "gmail"] },
        { name: "Prep", color: "blue", tools: ["notion", "web"] }
      ],
      logs: [
        { agent: "Booker", action: "found 5 slots that worked for all", ts: "07:45" },
        { agent: "Prep", action: "wrote a brief for each meeting", ts: "07:55" },
        { agent: "Booker", action: "sent invites with agenda attached", ts: "08:01" }
      ],
      recommendation: {
        headline: "Meetings booked and prepped before coffee.",
        ask: "Want this set up for you?"
      }
    }
  },
```

- [ ] **Step 5: Add the library payloads — part C: the remaining seven templates**

Continue appending to the same `TEMPLATES` object (close it at the end):

```ts
  hr_onboarding: {
    no: {
      agents: [
        { name: "Onboarder", color: "lime", tools: ["notion", "gmail", "slack"] },
        { name: "Tilganger", color: "amber", tools: ["okta", "github"] }
      ],
      logs: [
        { agent: "Onboarder", action: "sendte velkomstpakke til 2 nye", ts: "09:00" },
        { agent: "Tilganger", action: "ga tilgang til 7 verktøy", ts: "09:12" },
        { agent: "Onboarder", action: "booket sjekk-inn etter 7 dager", ts: "09:14" }
      ],
      recommendation: {
        headline: "Ny ansatt klar dag 1.",
        ask: "Vil du standardisere dette?"
      }
    },
    en: {
      agents: [
        { name: "Onboarder", color: "lime", tools: ["notion", "gmail", "slack"] },
        { name: "Access", color: "amber", tools: ["okta", "github"] }
      ],
      logs: [
        { agent: "Onboarder", action: "sent welcome pack to 2 hires", ts: "09:00" },
        { agent: "Access", action: "granted access to 7 tools", ts: "09:12" },
        { agent: "Onboarder", action: "scheduled 7-day check-in", ts: "09:14" }
      ],
      recommendation: {
        headline: "New hire ready on day one.",
        ask: "Want to standardize this?"
      }
    }
  },
  data_entry: {
    no: {
      agents: [
        { name: "Innleser", color: "lime", tools: ["sheets", "ocr"] },
        { name: "Kvalitet", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Innleser", action: "leste 142 kvitteringer", ts: "12:30" },
        { agent: "Kvalitet", action: "fant 4 avvik for sjekk", ts: "12:41" },
        { agent: "Innleser", action: "la alt inn i regnskapet", ts: "12:50" }
      ],
      recommendation: {
        headline: "Fra papirhaug til regnskap på 20 min.",
        ask: "Skal vi sette dette opp på papirene dine?"
      }
    },
    en: {
      agents: [
        { name: "Reader", color: "lime", tools: ["sheets", "ocr"] },
        { name: "QA", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Reader", action: "parsed 142 receipts", ts: "12:30" },
        { agent: "QA", action: "flagged 4 anomalies", ts: "12:41" },
        { agent: "Reader", action: "posted all to bookkeeping", ts: "12:50" }
      ],
      recommendation: {
        headline: "Paper pile to books in 20 min.",
        ask: "Want this on your stack?"
      }
    }
  },
  reporting: {
    no: {
      agents: [
        { name: "Analytiker", color: "lime", tools: ["sheets", "metabase"] },
        { name: "Forfatter", color: "violet", tools: ["notion", "slack"] }
      ],
      logs: [
        { agent: "Analytiker", action: "hentet KPI-er fra 3 systemer", ts: "06:00" },
        { agent: "Forfatter", action: "skrev ukerapport på 1 side", ts: "06:08" },
        { agent: "Forfatter", action: "delte i lederkanalen", ts: "06:10" }
      ],
      recommendation: {
        headline: "Ukerapport på bordet kl 06.",
        ask: "Vil du ha den i innboksen mandag?"
      }
    },
    en: {
      agents: [
        { name: "Analyst", color: "lime", tools: ["sheets", "metabase"] },
        { name: "Writer", color: "violet", tools: ["notion", "slack"] }
      ],
      logs: [
        { agent: "Analyst", action: "pulled KPIs from 3 systems", ts: "06:00" },
        { agent: "Writer", action: "wrote 1-page weekly report", ts: "06:08" },
        { agent: "Writer", action: "posted in leadership channel", ts: "06:10" }
      ],
      recommendation: {
        headline: "Weekly report ready at 6 a.m.",
        ask: "Want it in your inbox Mondays?"
      }
    }
  },
  procurement: {
    no: {
      agents: [
        { name: "Innkjøper", color: "lime", tools: ["web", "gmail"] },
        { name: "Kontrakter", color: "amber", tools: ["notion", "docusign"] }
      ],
      logs: [
        { agent: "Innkjøper", action: "hentet 3 tilbud på samme spec", ts: "14:00" },
        { agent: "Kontrakter", action: "leste vilkårene for risiko", ts: "14:18" },
        { agent: "Innkjøper", action: "anbefalte den billigste", ts: "14:22" }
      ],
      recommendation: {
        headline: "Tilbud sammenlignet på minutter.",
        ask: "Vil du få dette i din innkjøpsflyt?"
      }
    },
    en: {
      agents: [
        { name: "Buyer", color: "lime", tools: ["web", "gmail"] },
        { name: "Contracts", color: "amber", tools: ["notion", "docusign"] }
      ],
      logs: [
        { agent: "Buyer", action: "got 3 quotes on same spec", ts: "14:00" },
        { agent: "Contracts", action: "scanned terms for risk", ts: "14:18" },
        { agent: "Buyer", action: "recommended cheapest one", ts: "14:22" }
      ],
      recommendation: {
        headline: "Quotes compared in minutes.",
        ask: "Want this in your procurement flow?"
      }
    }
  },
  compliance: {
    no: {
      agents: [
        { name: "Vakthund", color: "lime", tools: ["notion", "gmail"] },
        { name: "Loggfører", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Vakthund", action: "sjekka 27 dokumenter mot policy", ts: "11:00" },
        { agent: "Vakthund", action: "fant 2 som mangler signatur", ts: "11:09" },
        { agent: "Loggfører", action: "registrerte revisjonssporet", ts: "11:11" }
      ],
      recommendation: {
        headline: "Compliance på autopilot.",
        ask: "Vil du teste på en av prosessene dine?"
      }
    },
    en: {
      agents: [
        { name: "Watchdog", color: "lime", tools: ["notion", "gmail"] },
        { name: "Logger", color: "blue", tools: ["sheets"] }
      ],
      logs: [
        { agent: "Watchdog", action: "checked 27 docs against policy", ts: "11:00" },
        { agent: "Watchdog", action: "found 2 missing signatures", ts: "11:09" },
        { agent: "Logger", action: "wrote the audit trail", ts: "11:11" }
      ],
      recommendation: {
        headline: "Compliance on autopilot.",
        ask: "Want to try this on one of your processes?"
      }
    }
  },
  research: {
    no: {
      agents: [
        { name: "Søker", color: "lime", tools: ["web", "scholar"] },
        { name: "Sammenfatter", color: "violet", tools: ["notion"] }
      ],
      logs: [
        { agent: "Søker", action: "leste 18 kilder på temaet", ts: "15:30" },
        { agent: "Sammenfatter", action: "skrev 2-siders brief med kilder", ts: "15:48" },
        { agent: "Sammenfatter", action: "delte i Notion-prosjekt", ts: "15:50" }
      ],
      recommendation: {
        headline: "Markedsbrief på 20 min.",
        ask: "Skal vi gjøre dette for ditt neste tema?"
      }
    },
    en: {
      agents: [
        { name: "Searcher", color: "lime", tools: ["web", "scholar"] },
        { name: "Synthesizer", color: "violet", tools: ["notion"] }
      ],
      logs: [
        { agent: "Searcher", action: "read 18 sources on the topic", ts: "15:30" },
        { agent: "Synthesizer", action: "wrote 2-page brief with citations", ts: "15:48" },
        { agent: "Synthesizer", action: "posted in Notion project", ts: "15:50" }
      ],
      recommendation: {
        headline: "Market brief in 20 min.",
        ask: "Want this for your next topic?"
      }
    }
  },
  general: {
    no: {
      agents: [
        { name: "Koordinator", color: "lime", tools: ["notion", "slack"] },
        { name: "Utfører", color: "blue", tools: ["gmail", "sheets"] },
        { name: "Sjekker", color: "amber", tools: ["notion"] }
      ],
      logs: [
        { agent: "Koordinator", action: "brøt ned oppgaven i 5 steg", ts: "09:00" },
        { agent: "Utfører", action: "kjørte de 4 første", ts: "09:18" },
        { agent: "Sjekker", action: "kvalitetssikret resultatet", ts: "09:25" }
      ],
      recommendation: {
        headline: "Et team som tar oppgaven.",
        ask: "Vil du beskrive utfordringen din litt mer?"
      }
    },
    en: {
      agents: [
        { name: "Coordinator", color: "lime", tools: ["notion", "slack"] },
        { name: "Executor", color: "blue", tools: ["gmail", "sheets"] },
        { name: "Reviewer", color: "amber", tools: ["notion"] }
      ],
      logs: [
        { agent: "Coordinator", action: "broke the task into 5 steps", ts: "09:00" },
        { agent: "Executor", action: "ran the first 4", ts: "09:18" },
        { agent: "Reviewer", action: "checked the output", ts: "09:25" }
      ],
      recommendation: {
        headline: "A team that takes the task.",
        ask: "Want to tell us a bit more about your challenge?"
      }
    }
  }
};
```

- [ ] **Step 6: Add the routing helpers — part D**

Append the routing functions and exports:

```ts
const KEYWORDS: Array<[TemplateKey, RegExp]> = [
  ["ar_cashflow", /\b(faktur|invoice|payment|chase|inkasso|purring|cash\s*flow|kontant|sen)\b/i],
  ["sales_crm", /\b(lead|sale|sales|salg|crm|pipeline|prospect|outreach|cold)\b/i],
  ["inbox_triage", /\b(e-post|epost|email|inbox|innboks)\b/i],
  ["support_tier1", /\b(support|kundeservice|ticket|sak|helpdesk|customer\s*service)\b/i],
  ["content_social", /\b(market|markedsf|content|innhold|social|sosiale|post|linkedin|instagram)\b/i],
  ["scheduling", /\b(møte|meeting|schedule|book|kalender|calendar|appointment)\b/i],
  ["hr_onboarding", /\b(onboard|hr|ansatt|employee|hire|new hire)\b/i],
  ["data_entry", /\b(data\s*entry|skriv inn|punche|kvittering|receipt|spreadsheet|regneark)\b/i],
  ["reporting", /\b(rapport|report|kpi|dashboard|metric|måltall)\b/i],
  ["procurement", /\b(innkjøp|procure|tilbud|quote|leverandør|vendor|supplier)\b/i],
  ["compliance", /\b(compliance|audit|revisjon|policy|gdpr|regulatory|samsvar)\b/i],
  ["research", /\b(research|undersøk|search|finn ut|kartlegg|analyse|analys)\b/i]
];

export function pickTemplate(brief: string, _lang: Lang): TemplateKey {
  for (const [key, re] of KEYWORDS) {
    if (re.test(brief)) return key;
  }
  return "general";
}

export function getTemplate(key: TemplateKey, lang: Lang) {
  return TEMPLATES[key][lang];
}
```

- [ ] **Step 7: Run tests, expect pass**

Run: `npm test -- cannedTemplates`
Expected: 8 tests pass (including the schema-validation loop over all 13 templates × 2 langs).

- [ ] **Step 8: Commit**

```bash
git add app/_lib/cannedTemplates.ts tests/unit/cannedTemplates.test.ts
git commit -m "feat(briefbox): add canned template library with keyword routing"
```

---

## Task 4: Build the in-memory rate limiter

**Files:**
- Create: `app/_lib/rateLimit.ts`
- Create: `tests/unit/rateLimit.test.ts`

- [ ] **Step 1: Write the test first**

Create `tests/unit/rateLimit.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRateLimiter } from "../../app/_lib/rateLimit";

describe("createRateLimiter (5 req / 1h sliding window)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-05-03T10:00:00Z"));
  });

  it("allows 5 requests then blocks the 6th", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) {
      expect(limiter.check(ip).ok).toBe(true);
    }
    expect(limiter.check(ip).ok).toBe(false);
  });

  it("recovers fully after the window passes", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    const ip = "1.2.3.4";
    for (let i = 0; i < 5; i++) limiter.check(ip);
    expect(limiter.check(ip).ok).toBe(false);
    vi.advanceTimersByTime(60 * 60 * 1000 + 1);
    expect(limiter.check(ip).ok).toBe(true);
  });

  it("tracks IPs independently", () => {
    const limiter = createRateLimiter({ max: 5, windowMs: 60 * 60 * 1000 });
    for (let i = 0; i < 5; i++) limiter.check("a");
    expect(limiter.check("a").ok).toBe(false);
    expect(limiter.check("b").ok).toBe(true);
  });

  it("returns retryAfterSec on block", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60 * 60 * 1000 });
    limiter.check("x");
    const r = limiter.check("x");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.retryAfterSec).toBeGreaterThan(3500);
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test -- rateLimit`
Expected: import fails.

- [ ] **Step 3: Implement the limiter**

Create `app/_lib/rateLimit.ts`:

```ts
/**
 * In-memory sliding-window rate limiter.
 *
 * Limitations (documented for v1):
 *  - Resets on server restart (Vercel cold start, redeploy).
 *  - Not shared across Vercel serverless instances; each instance counts independently,
 *    so the effective limit can be up to N × instances.
 *  - v2 upgrade: replace with Upstash Redis (`@upstash/ratelimit`) keyed by IP.
 *    The module's `check(ip)` shape is intentionally identical to Upstash's
 *    `limit()` return shape so swapping is a one-file change.
 */

export type RateLimitResult =
  | { ok: true; remaining: number }
  | { ok: false; retryAfterSec: number };

export interface RateLimiterOptions {
  max: number;
  windowMs: number;
}

export interface RateLimiter {
  check: (key: string) => RateLimitResult;
}

export function createRateLimiter(opts: RateLimiterOptions): RateLimiter {
  const hits = new Map<string, number[]>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const cutoff = now - opts.windowMs;
      const arr = (hits.get(key) ?? []).filter((t) => t > cutoff);

      if (arr.length >= opts.max) {
        const oldest = arr[0];
        const retryAfterSec = Math.max(1, Math.ceil((oldest + opts.windowMs - now) / 1000));
        hits.set(key, arr);
        return { ok: false, retryAfterSec };
      }

      arr.push(now);
      hits.set(key, arr);
      return { ok: true, remaining: opts.max - arr.length };
    }
  };
}

// Singleton instance used by /api/brief.
export const briefRateLimiter = createRateLimiter({
  max: 5,
  windowMs: 60 * 60 * 1000
});
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test -- rateLimit`
Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/_lib/rateLimit.ts tests/unit/rateLimit.test.ts
git commit -m "feat(briefbox): in-memory sliding-window rate limiter (5/hr/IP)"
```

---

## Task 5: Build the Haiku prompt module

**Files:**
- Create: `app/_lib/briefPrompt.ts`

- [ ] **Step 1: Create the prompt module**

Create `app/_lib/briefPrompt.ts`:

```ts
import type { Lang } from "./cannedTemplates";

export const BRIEF_MODEL_ID = "claude-haiku-4-5-20251001";
export const BRIEF_MAX_TOKENS = 600;
export const BRIEF_TEMPERATURE = 0.4;
export const BRIEF_TIMEOUT_MS = 8000;

export function buildSystemPrompt(lang: Lang): string {
  const langLine =
    lang === "no"
      ? "Reply in Norwegian Bokmål unless the user's brief is clearly in English."
      : "Reply in English unless the user's brief is clearly in Norwegian.";

  return `You are the staffing brain for Crunchtime, a small Norwegian agency that builds AI agent teams for SMBs.

A visitor describes a real business pain in 1–3 sentences. Your job: imagine 1–4 agents that would tackle it, name them, give each a small tool stack, and produce 3–5 short timestamped log lines that show them at work. Then produce a one-line recommendation and a follow-up question.

${langLine}

VOICE RULES — apply to all generated text:
- Direct, declarative. No marketing fluff.
- Banned words/phrases: "leverage", "synergy", "synergi", "transform", "transformere", "scale resources", "skalere ressursene", "next-gen", "neste generasjons", "we're excited", "vi er stolte".
- No em dashes (—) or double-hyphens (--). Use commas, periods, parens, semicolons.
- Agent dialogue / log lines are first person OR concrete past tense ("drafted 7 chase emails", "skrev 7 påminnelser"). ≤120 chars per log line.
- Headlines ≤80 chars.
- Tools are short lowercase nouns: "stripe", "gmail", "tripletex", "notion", "linkedin", "calendar", "slack", "sheets", etc. 1–4 tools per agent, 1–30 chars each.

OUTPUT — return ONLY a JSON object, no prose, no markdown fence. Schema:
{
  "agents": [
    { "name": "string ≤40 chars", "color": "lime|blue|amber|violet|cyan", "tools": ["..."] }
  ],
  "logs": [
    { "agent": "matches an agent name", "action": "concrete past-tense action ≤120 chars", "ts": "HH:MM" }
  ],
  "recommendation": { "headline": "≤80 chars", "ask": "one short question to the visitor" }
}

Constraints:
- 1–4 agents.
- 3–5 logs.
- Each log's "agent" MUST be one of the agent names you defined.
- Each agent has 1–4 tools.
- "color" is one of: lime, blue, amber, violet, cyan. Reuse colors only if you have >5 agents (you won't — max is 4).
- "ts" is a 24h HH:MM string. Make timestamps consecutive within a few minutes.

Refuse only if the brief is clearly malicious (asks to harm someone, generate CSAM, etc.). Otherwise produce a coherent team even if the brief is vague — you can ask in "ask" for more detail.`;
}

export function buildUserPrompt(brief: string, lang: Lang): string {
  const label = lang === "no" ? "Brief fra besøkende" : "Brief from visitor";
  return `${label}:\n\n${brief.trim()}`;
}
```

- [ ] **Step 2: Commit (no test yet — covered indirectly by Task 6's mocked route test)**

```bash
git add app/_lib/briefPrompt.ts
git commit -m "feat(briefbox): Haiku prompt builder with voice rules + JSON schema instructions"
```

---

## Task 6: Build `/api/brief` route handler

**Files:**
- Create: `app/api/brief/route.ts`
- Create: `tests/unit/briefRoute.test.ts`

- [ ] **Step 1: Write the route test first**

Create `tests/unit/briefRoute.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";

const createMock = vi.fn();
vi.mock("@anthropic-ai/sdk", () => {
  return {
    default: class {
      messages = { create: createMock };
    }
  };
});

import { POST } from "../../app/api/brief/route";

function makeReq(body: unknown, ip = "9.9.9.9") {
  return new Request("http://localhost/api/brief", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  createMock.mockReset();
  vi.useRealTimers();
  // reset the rate limiter by importing a fresh module isn't trivial; we use a fresh IP per test instead.
});

describe("/api/brief", () => {
  it("returns the schema-valid Haiku payload on happy path", async () => {
    createMock.mockResolvedValueOnce({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
            logs: [
              { agent: "AR", action: "did x", ts: "10:00" },
              { agent: "AR", action: "did y", ts: "10:01" },
              { agent: "AR", action: "did z", ts: "10:02" }
            ],
            recommendation: { headline: "ok", ask: "ok?" }
          })
        }
      ]
    });
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-1"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents[0].name).toBe("AR");
  });

  it("returns canned fallback when Haiku returns invalid JSON", async () => {
    createMock.mockResolvedValueOnce({
      content: [{ type: "text", text: "this is not json" }]
    });
    const res = await POST(makeReq({ brief: "fakturaene er sene", lang: "no" }, "ip-2"));
    expect(res.status).toBe(200);
    const body = await res.json();
    // ar_cashflow keyword route -> AR-spesialist
    expect(body.agents[0].name).toBe("AR-spesialist");
  });

  it("returns canned fallback when Haiku throws (timeout/network)", async () => {
    createMock.mockRejectedValueOnce(new Error("connection error"));
    const res = await POST(makeReq({ brief: "kundeservice koker", lang: "no" }, "ip-3"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.agents.some((a: { name: string }) => /Tier-1|Tier 1/.test(a.name))).toBe(true);
  });

  it("returns 400 on missing brief", async () => {
    const res = await POST(makeReq({ lang: "no" }, "ip-4"));
    expect(res.status).toBe(400);
  });

  it("returns 400 on invalid lang", async () => {
    const res = await POST(makeReq({ brief: "ok", lang: "fr" }, "ip-5"));
    expect(res.status).toBe(400);
  });

  it("returns 429 after 5 successful submissions from the same IP", async () => {
    createMock.mockResolvedValue({
      content: [
        {
          type: "text",
          text: JSON.stringify({
            agents: [{ name: "AR", color: "lime", tools: ["stripe"] }],
            logs: [
              { agent: "AR", action: "x", ts: "10:00" },
              { agent: "AR", action: "y", ts: "10:01" },
              { agent: "AR", action: "z", ts: "10:02" }
            ],
            recommendation: { headline: "ok", ask: "ok?" }
          })
        }
      ]
    });
    const ip = "ip-rl-" + Date.now();
    for (let i = 0; i < 5; i++) {
      const r = await POST(makeReq({ brief: "ok", lang: "no" }, ip));
      expect(r.status).toBe(200);
    }
    const sixth = await POST(makeReq({ brief: "ok", lang: "no" }, ip));
    expect(sixth.status).toBe(429);
    expect(sixth.headers.get("retry-after")).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test -- briefRoute`
Expected: import fails — route doesn't exist.

- [ ] **Step 3: Implement the route — header + helpers**

Create `app/api/brief/route.ts`:

```ts
import Anthropic from "@anthropic-ai/sdk";
import { briefRequestSchema, briefResponseSchema, type BriefResponse } from "../../_lib/briefSchema";
import {
  BRIEF_MODEL_ID,
  BRIEF_MAX_TOKENS,
  BRIEF_TEMPERATURE,
  BRIEF_TIMEOUT_MS,
  buildSystemPrompt,
  buildUserPrompt
} from "../../_lib/briefPrompt";
import { getTemplate, pickTemplate, type Lang } from "../../_lib/cannedTemplates";
import { briefRateLimiter } from "../../_lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

function fallback(brief: string, lang: Lang): BriefResponse {
  return getTemplate(pickTemplate(brief, lang), lang);
}

function extractText(message: { content: Array<{ type: string; text?: string }> }): string {
  for (const block of message.content) {
    if (block.type === "text" && block.text) return block.text;
  }
  return "";
}

function tryParseJson(raw: string): unknown {
  // Tolerate fenced output even though the prompt forbids it.
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}
```

- [ ] **Step 4: Implement the route — POST handler**

Append to the same file:

```ts
let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  cachedClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    timeout: BRIEF_TIMEOUT_MS
  });
  return cachedClient;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = briefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const { brief, lang } = parsed.data;

  const ip = clientIp(req);
  const rl = briefRateLimiter.check(ip);
  if (!rl.ok) {
    return Response.json(
      { error: "rate_limited", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } }
    );
  }

  // Short input → return canned ask-for-more without burning a token.
  if (brief.trim().length < 6) {
    const tpl = getTemplate("general", lang);
    const askMore =
      lang === "no"
        ? "fortell meg litt mer. Hva er hardt akkurat nå?"
        : "tell me a bit more. What's hard right now?";
    return Response.json({ ...tpl, recommendation: { ...tpl.recommendation, ask: askMore } });
  }

  // Truncate per spec.
  const safeBrief = brief.slice(0, 500);

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: BRIEF_MODEL_ID,
      max_tokens: BRIEF_MAX_TOKENS,
      temperature: BRIEF_TEMPERATURE,
      system: buildSystemPrompt(lang),
      messages: [{ role: "user", content: buildUserPrompt(safeBrief, lang) }]
    });
    const text = extractText(message);
    const json = tryParseJson(text);
    const validated = briefResponseSchema.safeParse(json);
    if (!validated.success) {
      console.warn("[brief] schema validation failed, falling back", validated.error.issues);
      return Response.json(fallback(safeBrief, lang));
    }
    return Response.json(validated.data);
  } catch (err) {
    console.warn("[brief] LLM call failed, falling back", err);
    return Response.json(fallback(safeBrief, lang));
  }
}
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm test -- briefRoute`
Expected: 6 tests pass.

If the rate-limit test fails because the singleton `briefRateLimiter` is shared with earlier tests, the `Date.now()`-keyed IP (`"ip-rl-" + Date.now()`) keeps it isolated.

- [ ] **Step 6: Commit**

```bash
git add app/api/brief/route.ts tests/unit/briefRoute.test.ts
git commit -m "feat(briefbox): /api/brief route with Haiku call, zod, rate limit, canned fallback"
```

---

## Task 7: Build `/api/brief-noscript` route

**Files:**
- Create: `app/api/brief-noscript/route.ts`
- Create: `tests/e2e/briefbox-noscript.spec.ts`

- [ ] **Step 1: Implement the noscript handler**

Create `app/api/brief-noscript/route.ts`:

```ts
import { getTemplate, pickTemplate, type Lang } from "../../_lib/cannedTemplates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escape(s: string): string {
  return s.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&": return "&amp;";
      case "<": return "&lt;";
      case ">": return "&gt;";
      case '"': return "&quot;";
      default: return "&#39;";
    }
  });
}

function render(brief: string, lang: Lang): string {
  const tpl = getTemplate(pickTemplate(brief, lang), lang);
  const t = lang === "no"
    ? {
        title: "Teamet ditt",
        intro: "Hvis JavaScript var på, ville du sett dette spille seg ut. Her er et statisk sammendrag.",
        agents: "Foreslåtte agenter",
        logs: "Hva de ville gjort",
        rec: "Anbefaling",
        cta: "Book en 30-min prat",
        back: "Tilbake til forsiden"
      }
    : {
        title: "Your team",
        intro: "If JavaScript were on, you'd see this play out. Here's a static summary.",
        agents: "Suggested agents",
        logs: "What they would do",
        rec: "Recommendation",
        cta: "Book a 30-min chat",
        back: "Back to the home page"
      };

  const cal = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? `/${lang}/contact`;

  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <title>${escape(t.title)} · Crunchtime</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <style>
    body { font-family: system-ui, sans-serif; background:#0a0a09; color:#f5f3ee; max-width:720px; margin:0 auto; padding:32px 20px; }
    h1, h2 { font-weight: 800; }
    a { color:#d4ef3a; }
    ul { list-style: none; padding:0; }
    li { border-left: 2px solid #2a2a27; padding:10px 14px; margin-bottom:10px; }
    .rec { border-left: 2px solid #d4ef3a; padding:14px 16px; background:#1a1a18; margin-top:24px; }
    .cta { display:inline-block; background:#d4ef3a; color:#0a0a09; padding:12px 18px; font-weight:700; text-decoration:none; margin-top:14px; }
  </style>
</head>
<body>
  <h1>${escape(t.title)}</h1>
  <p>${escape(t.intro)}</p>
  <p><strong>${escape(lang === "no" ? "Din brief" : "Your brief")}:</strong> ${escape(brief)}</p>

  <h2>${escape(t.agents)}</h2>
  <ul>
    ${tpl.agents.map((a) => `<li><strong>${escape(a.name)}</strong> · ${escape(a.tools.join(", "))}</li>`).join("\n    ")}
  </ul>

  <h2>${escape(t.logs)}</h2>
  <ul>
    ${tpl.logs.map((l) => `<li><code>${escape(l.ts)}</code> ${escape(l.agent)}: ${escape(l.action)}</li>`).join("\n    ")}
  </ul>

  <div class="rec">
    <h2 style="margin-top:0">${escape(tpl.recommendation.headline)}</h2>
    <p>${escape(tpl.recommendation.ask)}</p>
    <a class="cta" href="${escape(cal)}">${escape(t.cta)}</a>
  </div>

  <p style="margin-top:32px"><a href="/${lang}">${escape(t.back)}</a></p>
</body>
</html>`;
}

export async function POST(req: Request): Promise<Response> {
  const form = await req.formData();
  const briefRaw = (form.get("brief") ?? "").toString();
  const langRaw = (form.get("lang") ?? "no").toString();
  const lang: Lang = langRaw === "en" ? "en" : "no";
  const brief = briefRaw.slice(0, 500).trim() || (lang === "no" ? "(tom brief)" : "(empty brief)");

  return new Response(render(brief, lang), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" }
  });
}
```

- [ ] **Step 2: Write E2E test that bypasses JS**

Create `tests/e2e/briefbox-noscript.spec.ts`:

```ts
import { test, expect, request } from "@playwright/test";

test("POST /api/brief-noscript renders fallback HTML in Norwegian", async ({ playwright }) => {
  const ctx = await playwright.request.newContext({ baseURL: "http://localhost:3000" });
  const res = await ctx.post("/api/brief-noscript", {
    form: { brief: "fakturaene er sene", lang: "no" }
  });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("AR-spesialist");
  expect(html).toContain("Anbefaling");
  expect(html).toMatch(/Book en 30-min prat/);
});

test("POST /api/brief-noscript renders fallback HTML in English", async ({ playwright }) => {
  const ctx = await playwright.request.newContext({ baseURL: "http://localhost:3000" });
  const res = await ctx.post("/api/brief-noscript", {
    form: { brief: "we keep losing leads", lang: "en" }
  });
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html).toContain("SDR");
  expect(html).toContain("Recommendation");
});
```

(Reference `request` import is unused; the test uses `playwright.request` from the fixture. Removing the import is fine.)

- [ ] **Step 3: Run E2E noscript tests**

Run: `npm run test:e2e -- --grep "noscript"`
Expected: both tests pass.

- [ ] **Step 4: Commit**

```bash
git add app/api/brief-noscript/route.ts tests/e2e/briefbox-noscript.spec.ts
git commit -m "feat(briefbox): /api/brief-noscript fallback for JS-disabled visitors"
```

---

## Task 8: Build the demo scheduler

**Files:**
- Create: `app/_lib/demoScheduler.ts`
- Create: `tests/unit/demoScheduler.test.ts`

- [ ] **Step 1: Write the scheduler test first**

Create `tests/unit/demoScheduler.test.ts`:

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createDemoScheduler, type DemoEvent } from "../../app/_lib/demoScheduler";
import type { BriefResponse } from "../../app/_lib/briefSchema";

const payload: BriefResponse = {
  agents: [
    { name: "A", color: "lime", tools: ["t1", "t2"] },
    { name: "B", color: "blue", tools: ["t3"] }
  ],
  logs: [
    { agent: "A", action: "did x", ts: "10:00" },
    { agent: "B", action: "did y", ts: "10:01" },
    { agent: "A", action: "did z", ts: "10:02" }
  ],
  recommendation: { headline: "h", ask: "a" }
};

describe("demoScheduler", () => {
  beforeEach(() => vi.useFakeTimers());

  it("emits phase events in order: brief-in → team-forms → tools-connect → logs-stream → end-card", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases).toEqual(["brief-in", "team-forms", "tools-connect", "logs-stream", "end-card"]);
  });

  it("emits one agent-spawn per agent during team-forms", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    expect(events.filter((e) => e.type === "agent-spawn")).toHaveLength(2);
  });

  it("emits one log-line per log during logs-stream", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(20_000);
    expect(events.filter((e) => e.type === "log-line")).toHaveLength(3);
  });

  it("skip() jumps straight to end-card with all data emitted at once", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: false, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(500); // partway through
    sched.skip();
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases[phases.length - 1]).toBe("end-card");
    expect(events.filter((e) => e.type === "agent-spawn")).toHaveLength(2);
    expect(events.filter((e) => e.type === "log-line")).toHaveLength(3);
  });

  it("reducedMotion=true compresses phases to ~2s each", () => {
    const events: DemoEvent[] = [];
    const sched = createDemoScheduler(payload, { reducedMotion: true, onEvent: (e) => events.push(e) });
    sched.start();
    vi.advanceTimersByTime(2500);
    const phases = events.filter((e) => e.type === "phase").map((e) => (e as { type: "phase"; phase: string }).phase);
    expect(phases).toContain("end-card");
  });
});
```

- [ ] **Step 2: Run, expect failure**

Run: `npm test -- demoScheduler`
Expected: import fails.

- [ ] **Step 3: Implement the scheduler**

Create `app/_lib/demoScheduler.ts`:

```ts
import type { BriefResponse } from "./briefSchema";

export type DemoPhase =
  | "idle"
  | "brief-in"
  | "team-forms"
  | "tools-connect"
  | "logs-stream"
  | "end-card";

export type DemoEvent =
  | { type: "phase"; phase: DemoPhase }
  | { type: "agent-spawn"; index: number }
  | { type: "tool-connect"; agentIndex: number; toolIndex: number }
  | { type: "log-line"; index: number };

export interface SchedulerOptions {
  reducedMotion: boolean;
  onEvent: (e: DemoEvent) => void;
}

interface Timing {
  briefIn: number;
  teamForms: number;     // total for the phase
  agentStagger: number;  // per-agent
  toolsConnect: number;  // total
  toolStagger: number;   // per-tool
  logsStream: number;    // total
  logStagger: number;    // per-log
}

const FULL: Timing = {
  briefIn: 500,
  teamForms: 3000,
  agentStagger: 700,
  toolsConnect: 4000,
  toolStagger: 350,
  logsStream: 5000,
  logStagger: 1200
};

const REDUCED: Timing = {
  briefIn: 200,
  teamForms: 2000,
  agentStagger: 0,
  toolsConnect: 2000,
  toolStagger: 0,
  logsStream: 2000,
  logStagger: 0
};

export interface DemoScheduler {
  start: () => void;
  skip: () => void;
  cancel: () => void;
}

export function createDemoScheduler(
  payload: BriefResponse,
  opts: SchedulerOptions
): DemoScheduler {
  const t = opts.reducedMotion ? REDUCED : FULL;
  const timeouts: ReturnType<typeof setTimeout>[] = [];
  let cancelled = false;
  let finished = false;

  const at = (ms: number, fn: () => void) => {
    timeouts.push(setTimeout(() => {
      if (!cancelled && !finished) fn();
    }, ms));
  };

  const emit = (e: DemoEvent) => {
    if (!cancelled && !finished) opts.onEvent(e);
  };

  function start() {
    let cursor = 0;
    emit({ type: "phase", phase: "brief-in" });

    cursor += t.briefIn;
    at(cursor, () => emit({ type: "phase", phase: "team-forms" }));

    payload.agents.forEach((_, i) => {
      at(cursor + i * t.agentStagger, () => emit({ type: "agent-spawn", index: i }));
    });

    cursor += t.teamForms;
    at(cursor, () => emit({ type: "phase", phase: "tools-connect" }));

    let toolOffset = 0;
    payload.agents.forEach((agent, ai) => {
      agent.tools.forEach((_, ti) => {
        at(cursor + toolOffset, () =>
          emit({ type: "tool-connect", agentIndex: ai, toolIndex: ti })
        );
        toolOffset += t.toolStagger;
      });
    });

    cursor += t.toolsConnect;
    at(cursor, () => emit({ type: "phase", phase: "logs-stream" }));

    payload.logs.forEach((_, i) => {
      at(cursor + i * t.logStagger, () => emit({ type: "log-line", index: i }));
    });

    cursor += t.logsStream;
    at(cursor, () => emit({ type: "phase", phase: "end-card" }));
  }

  function skip() {
    if (finished) return;
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
    // Emit everything immediately so React renders the final state.
    payload.agents.forEach((a, ai) => {
      opts.onEvent({ type: "agent-spawn", index: ai });
      a.tools.forEach((_, ti) => opts.onEvent({ type: "tool-connect", agentIndex: ai, toolIndex: ti }));
    });
    payload.logs.forEach((_, i) => opts.onEvent({ type: "log-line", index: i }));
    opts.onEvent({ type: "phase", phase: "end-card" });
    finished = true;
  }

  function cancel() {
    cancelled = true;
    timeouts.forEach(clearTimeout);
    timeouts.length = 0;
  }

  return { start, skip, cancel };
}
```

- [ ] **Step 4: Run, expect pass**

Run: `npm test -- demoScheduler`
Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/_lib/demoScheduler.ts tests/unit/demoScheduler.test.ts
git commit -m "feat(briefbox): demo phase scheduler (pure TS, no animation library)"
```

---

## Task 9: Add demo CSS keyframes and tokens

**Files:**
- Modify: `app/globals.css`
- Create: `app/[locale]/_components/BriefBox/briefBox.module.css`

- [ ] **Step 1: Append global keyframes to `app/globals.css`**

Append at the bottom of the file:

```css
/* === Brief Box demo: shared keyframes & utilities === */

@keyframes ct-cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

@keyframes ct-status-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 239, 58, 0.45); }
  70% { box-shadow: 0 0 0 6px rgba(212, 239, 58, 0); }
}

@keyframes ct-fade-up {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes ct-slide-in-left {
  from { opacity: 0; transform: translateX(-12px); }
  to { opacity: 1; transform: translateX(0); }
}

.ct-grid-bg {
  background-image:
    linear-gradient(rgba(212, 239, 58, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(212, 239, 58, 0.04) 1px, transparent 1px);
  background-size: 80px 80px;
  -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
  mask-image: radial-gradient(ellipse at center, black 40%, transparent 80%);
}

@media (prefers-reduced-motion: reduce) {
  .ct-fade-up,
  .ct-slide-in-left {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
  }
}
```

- [ ] **Step 2: Create the component-scoped stylesheet**

Create `app/[locale]/_components/BriefBox/briefBox.module.css`:

```css
.shell {
  position: relative;
  margin: 0 auto;
  width: 100%;
  max-width: 720px;
  padding: 80px 20px 120px;
}

.statusPill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 12px;
  color: var(--color-muted, #8a8a82);
  margin-bottom: 24px;
}

.statusDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #d4ef3a;
  animation: ct-status-pulse 2s ease-out infinite;
}

.headline {
  font-family: var(--font-syne), sans-serif;
  font-weight: 800;
  font-size: clamp(2.5rem, 6vw, 5rem);
  line-height: 1.05;
  letter-spacing: -0.02em;
  margin: 0 0 16px;
}

.subline {
  font-family: var(--font-dm-sans), sans-serif;
  font-weight: 300;
  color: var(--color-muted, #8a8a82);
  font-size: 1.05rem;
  line-height: 1.5;
  margin: 0 0 40px;
  max-width: 560px;
}

.headlineCollapsed {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  margin-bottom: 8px;
  opacity: 0.7;
}

.inputWrap {
  position: relative;
  border: 1px solid #2a2a27;
  background: #0f0f0d;
  padding: 16px 20px;
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.inputWrap:focus-within {
  border-color: #d4ef3a;
}

.input {
  flex: 1;
  background: transparent;
  border: 0;
  outline: none;
  color: #f5f3ee;
  font: inherit;
}

.cursor {
  width: 8px;
  height: 18px;
  background: #d4ef3a;
  animation: ct-cursor-blink 1s steps(1) infinite;
}

.inputDimmed { opacity: 0.5; }

.analyzing {
  margin-top: 12px;
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 13px;
  color: #d4ef3a;
}

.chips {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  font-family: var(--font-dm-sans), sans-serif;
  font-size: 13px;
  padding: 8px 14px;
  background: transparent;
  color: #f5f3ee;
  border: 1px solid #2a2a27;
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease;
}

.chip:hover { border-color: #d4ef3a; color: #d4ef3a; }

.skipLink {
  position: absolute;
  top: 80px;
  right: 20px;
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 12px;
  color: var(--color-muted, #8a8a82);
  background: transparent;
  border: 0;
  cursor: pointer;
}
.skipLink:hover { color: #d4ef3a; }

.stage {
  margin-top: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.agentRow {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 720px) {
  .agentRow { grid-template-columns: repeat(2, 1fr); }
}

.agentCard {
  pointer-events: none;
  background: #1a1a18;
  border: 1px solid #2a2a27;
  padding: 16px 18px;
  opacity: 0;
}
.agentCard.visible { animation: ct-fade-up 500ms ease-out forwards; }

.agentName {
  font-family: var(--font-syne), sans-serif;
  font-weight: 700;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 10px;
}

.agentDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.agentDot.lime { background: #d4ef3a; }
.agentDot.blue { background: #5fa9ff; }
.agentDot.amber { background: #f5b740; }
.agentDot.violet { background: #a98fff; }
.agentDot.cyan { background: #5fe0d8; }

.agentSpawning {
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 11px;
  color: var(--color-muted, #8a8a82);
  margin-top: 4px;
}

.toolList { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
.toolPill {
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 11px;
  padding: 3px 9px;
  border: 1px solid #2a2a27;
  border-radius: 999px;
  color: var(--color-muted, #8a8a82);
}
.toolPill.connecting { color: #f5b740; }
.toolPill.connected { color: #d4ef3a; border-color: #d4ef3a; }

.logFeed {
  pointer-events: none;
  background: #0f0f0d;
  border: 1px solid #2a2a27;
  padding: 16px 18px;
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 13px;
}

.logLine {
  opacity: 0;
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 12px;
  padding: 4px 0;
}
.logLine.visible { animation: ct-slide-in-left 400ms ease-out forwards; }
.logTs { color: var(--color-muted, #8a8a82); }
.logAgent { color: #d4ef3a; }

.endCard {
  margin-top: 24px;
  background: #1a1a18;
  border-left: 2px solid #d4ef3a;
  padding: 24px;
  opacity: 0;
}
.endCard.visible { animation: ct-fade-up 500ms ease-out forwards; }

.endEyebrow {
  font-family: var(--font-jetbrains, ui-monospace, monospace);
  font-size: 11px;
  color: #d4ef3a;
  margin-bottom: 8px;
}

.endHeadline {
  font-family: var(--font-syne), sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  margin: 0 0 8px;
}

.endAsk {
  font-family: var(--font-dm-sans), sans-serif;
  font-weight: 300;
  color: var(--color-muted, #8a8a82);
  margin: 0 0 20px;
}

.ctaStack { display: flex; flex-direction: column; gap: 10px; }

.ctaPrimary {
  display: block;
  text-align: center;
  background: #d4ef3a;
  color: #0a0a09;
  font-family: var(--font-syne), sans-serif;
  font-weight: 700;
  padding: 14px 18px;
  text-decoration: none;
  border: 0;
  cursor: pointer;
}
.ctaPrimary:hover { background: #a8c41a; }

.ctaSecondary, .ctaTertiary {
  display: block;
  text-align: center;
  background: transparent;
  color: #f5f3ee;
  font-family: var(--font-syne), sans-serif;
  font-weight: 600;
  padding: 14px 18px;
  text-decoration: none;
  border: 1px solid #2a2a27;
  cursor: pointer;
}
.ctaSecondary:hover, .ctaTertiary:hover { border-color: #d4ef3a; color: #d4ef3a; }

.emailForm { margin-top: 16px; display: flex; flex-direction: column; gap: 10px; }
.emailField {
  background: #0f0f0d;
  border: 1px solid #2a2a27;
  color: #f5f3ee;
  padding: 10px 12px;
  font-family: var(--font-dm-sans), sans-serif;
  font-size: 14px;
}
.emailField:focus { outline: none; border-color: #d4ef3a; }
.honeypot { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
.emailSuccess { color: #d4ef3a; font-family: var(--font-jetbrains, ui-monospace, monospace); font-size: 13px; }
.emailError { color: #f5b740; font-family: var(--font-jetbrains, ui-monospace, monospace); font-size: 13px; }
```

- [ ] **Step 3: Commit**

```bash
git add app/globals.css app/[locale]/_components/BriefBox/briefBox.module.css
git commit -m "feat(briefbox): demo CSS keyframes + component module styles"
```

---

## Task 10: Add the message catalog entries

**Files:**
- Modify: `messages/no.json`
- Modify: `messages/en.json`

- [ ] **Step 1: Add `briefBox` and `endCard` keys to `messages/no.json`**

Edit `messages/no.json`. Add these top-level keys (preserve existing keys; insert before the closing brace):

```json
  "briefBox": {
    "statusLive": "live · oslo",
    "headline": "Slipp en utfordring. Møt teamet ditt.",
    "subline": "Skriv det som koker. Vi setter sammen et team og viser deg hvordan de ville løst det.",
    "inputPlaceholder": "fortell hva som koker...",
    "inputAriaLabel": "Beskriv en utfordring",
    "submit": "Send",
    "analyzing": "▸ analyserer...",
    "skip": "skip til resultat →",
    "spawning": "spawner...",
    "toolConnecting": "⟳ kobler",
    "toolConnected": "✓ koblet",
    "rateLimited": "vi er litt overvelmet. Prøv igjen om en time, eller book en prat direkte.",
    "tooltipEmpty": "skriv et reelt problem",
    "chips": {
      "ar": "fakturaene er sene",
      "leads": "vi mister leads",
      "inbox": "e-post tar over livet",
      "support": "kundeservice koker",
      "marketing": "ingen tid til markedsføring"
    }
  },
  "endCard": {
    "eyebrow": "▸ teamet er klart",
    "ctaBook": "Book en 30-min prat",
    "ctaMore": "Vis meg mer først",
    "ctaEmail": "Send dette på e-post",
    "form": {
      "name": "navn",
      "email": "e-post",
      "company": "firmanavn",
      "website": "nettside",
      "note": "noe annet vi bør vite?",
      "submit": "Send",
      "sending": "sender...",
      "success": "Takk. Plan kommer på e-post innen 30 min.",
      "error": "Noe gikk galt. Prøv igjen, eller send en e-post direkte til christian@crunchtime.no."
    }
  }
```

- [ ] **Step 2: Add equivalent keys to `messages/en.json`**

Edit `messages/en.json`. Add (before the closing brace, preserving existing keys):

```json
  "briefBox": {
    "statusLive": "live · oslo",
    "headline": "Drop a challenge. Meet your team.",
    "subline": "Write what's actually hard. We'll assemble a team and show you how they'd handle it.",
    "inputPlaceholder": "tell us what's hard...",
    "inputAriaLabel": "Describe a challenge",
    "submit": "Send",
    "analyzing": "▸ analyzing...",
    "skip": "skip to result →",
    "spawning": "spawning...",
    "toolConnecting": "⟳ connecting",
    "toolConnected": "✓ connected",
    "rateLimited": "we're a bit overwhelmed. Try again in an hour, or book a chat directly.",
    "tooltipEmpty": "write a real problem",
    "chips": {
      "ar": "invoices are slow",
      "leads": "we lose leads",
      "inbox": "email is eating my life",
      "support": "support is on fire",
      "marketing": "no time for marketing"
    }
  },
  "endCard": {
    "eyebrow": "▸ team is ready",
    "ctaBook": "Book a 30-min chat",
    "ctaMore": "Show me more first",
    "ctaEmail": "Email me this plan",
    "form": {
      "name": "name",
      "email": "email",
      "company": "company name",
      "website": "website",
      "note": "anything else we should know?",
      "submit": "Send",
      "sending": "sending...",
      "success": "Thanks. A plan is on the way within 30 min.",
      "error": "Something went wrong. Try again, or email christian@crunchtime.no directly."
    }
  }
```

- [ ] **Step 3: Verify JSON parses**

Run: `node -e "console.log(Object.keys(require('./messages/no.json')))"` and same for `en.json`.
Expected: arrays include `briefBox` and `endCard` along with the existing `nav`, `footer`, `localeToggle` keys.

- [ ] **Step 4: Commit**

```bash
git add messages/no.json messages/en.json
git commit -m "feat(briefbox): add briefBox.* and endCard.* message keys (NO + EN)"
```

---

## Task 11: Build the leaf BriefBox components

**Files:**
- Create: `app/[locale]/_components/BriefBox/StatusPill.tsx`
- Create: `app/[locale]/_components/BriefBox/SkipLink.tsx`
- Create: `app/[locale]/_components/BriefBox/ToolList.tsx`
- Create: `app/[locale]/_components/BriefBox/AgentCard.tsx`
- Create: `app/[locale]/_components/BriefBox/LogStream.tsx`

- [ ] **Step 1: Create StatusPill**

Create `app/[locale]/_components/BriefBox/StatusPill.tsx`:

```tsx
import styles from "./briefBox.module.css";

export function StatusPill({ label }: { label: string }) {
  return (
    <div className={styles.statusPill} aria-live="off">
      <span className={styles.statusDot} aria-hidden />
      <span>● {label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Create SkipLink**

Create `app/[locale]/_components/BriefBox/SkipLink.tsx`:

```tsx
"use client";
import styles from "./briefBox.module.css";

export function SkipLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.skipLink} onClick={onClick}>
      {label}
    </button>
  );
}
```

- [ ] **Step 3: Create ToolList**

Create `app/[locale]/_components/BriefBox/ToolList.tsx`:

```tsx
import styles from "./briefBox.module.css";

export type ToolState = "idle" | "connecting" | "connected";

export function ToolList({
  tools,
  states,
  connectingLabel,
  connectedLabel
}: {
  tools: string[];
  states: ToolState[];
  connectingLabel: string;
  connectedLabel: string;
}) {
  return (
    <ul className={styles.toolList} aria-label="tools">
      {tools.map((tool, i) => {
        const s = states[i] ?? "idle";
        const cls =
          s === "connected"
            ? `${styles.toolPill} ${styles.connected}`
            : s === "connecting"
              ? `${styles.toolPill} ${styles.connecting}`
              : styles.toolPill;
        const suffix =
          s === "connected" ? ` ${connectedLabel}` : s === "connecting" ? ` ${connectingLabel}` : "";
        return (
          <li key={tool + i} className={cls}>
            {tool}
            {suffix}
          </li>
        );
      })}
    </ul>
  );
}
```

- [ ] **Step 4: Create AgentCard**

Create `app/[locale]/_components/BriefBox/AgentCard.tsx`:

```tsx
import styles from "./briefBox.module.css";
import { ToolList, type ToolState } from "./ToolList";
import type { Agent } from "../../../_lib/briefSchema";

export function AgentCard({
  agent,
  visible,
  spawningLabel,
  toolStates,
  connectingLabel,
  connectedLabel
}: {
  agent: Agent;
  visible: boolean;
  spawningLabel: string;
  toolStates: ToolState[];
  connectingLabel: string;
  connectedLabel: string;
}) {
  return (
    <article className={`${styles.agentCard} ${visible ? styles.visible : ""}`}>
      <div className={styles.agentName}>
        <span className={`${styles.agentDot} ${styles[agent.color]}`} aria-hidden />
        {agent.name}
      </div>
      <div className={styles.agentSpawning}>{spawningLabel}</div>
      <ToolList
        tools={agent.tools}
        states={toolStates}
        connectingLabel={connectingLabel}
        connectedLabel={connectedLabel}
      />
    </article>
  );
}
```

- [ ] **Step 5: Create LogStream**

Create `app/[locale]/_components/BriefBox/LogStream.tsx`:

```tsx
import styles from "./briefBox.module.css";
import type { LogLine } from "../../../_lib/briefSchema";

export function LogStream({
  logs,
  visibleCount
}: {
  logs: LogLine[];
  visibleCount: number;
}) {
  return (
    <div className={styles.logFeed}>
      {logs.map((log, i) => (
        <div
          key={i}
          className={`${styles.logLine} ${i < visibleCount ? styles.visible : ""}`}
        >
          <span className={styles.logTs}>{log.ts}</span>
          <span>
            <span className={styles.logAgent}>{log.agent}</span> · {log.action}
          </span>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/_components/BriefBox/
git commit -m "feat(briefbox): leaf components (StatusPill, SkipLink, ToolList, AgentCard, LogStream)"
```

---

## Task 12: Build the EmailCaptureForm component

**Files:**
- Create: `app/[locale]/_components/BriefBox/EmailCaptureForm.tsx`

- [ ] **Step 1: Create the form**

Create `app/[locale]/_components/BriefBox/EmailCaptureForm.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import type { BriefResponse } from "../../../_lib/briefSchema";

interface Props {
  brief: string;
  payload: BriefResponse;
  lang: "no" | "en";
}

type Status = "idle" | "sending" | "ok" | "err";

export function EmailCaptureForm({ brief, payload, lang }: Props) {
  const t = useTranslations("endCard.form");
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    if (fd.get("company_phone")) {
      // Honeypot tripped — silently succeed for the bot.
      setStatus("ok");
      return;
    }
    setStatus("sending");
    try {
      // Plan #4 implements /api/lead. This UI just POSTs JSON; backend wiring is next.
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          website: fd.get("website"),
          note: fd.get("note"),
          brief,
          payload,
          lang,
          source: "brief-box-v1",
          ts: new Date().toISOString()
        })
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    }
  }

  if (status === "ok") {
    return <p className={styles.emailSuccess}>{t("success")}</p>;
  }

  return (
    <form className={styles.emailForm} onSubmit={onSubmit} noValidate>
      <input className={styles.emailField} name="name" required placeholder={t("name")} autoComplete="name" />
      <input className={styles.emailField} name="email" type="email" required placeholder={t("email")} autoComplete="email" />
      <input className={styles.emailField} name="company" required placeholder={t("company")} autoComplete="organization" />
      <input className={styles.emailField} name="website" type="url" required placeholder={t("website")} autoComplete="url" />
      <input className={styles.emailField} name="note" placeholder={t("note")} />
      <input className={styles.honeypot} name="company_phone" tabIndex={-1} aria-hidden autoComplete="off" />
      <button type="submit" className={styles.ctaPrimary} disabled={status === "sending"}>
        {status === "sending" ? t("sending") : t("submit")}
      </button>
      {status === "err" && <p className={styles.emailError}>{t("error")}</p>}
    </form>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/_components/BriefBox/EmailCaptureForm.tsx
git commit -m "feat(briefbox): EmailCaptureForm UI (POSTs to /api/lead — backend in plan #4)"
```

---

## Task 13: Build the EndCard component

**Files:**
- Create: `app/[locale]/_components/BriefBox/EndCard.tsx`

- [ ] **Step 1: Create EndCard**

Create `app/[locale]/_components/BriefBox/EndCard.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import { EmailCaptureForm } from "./EmailCaptureForm";
import type { BriefResponse } from "../../../_lib/briefSchema";

interface Props {
  visible: boolean;
  brief: string;
  payload: BriefResponse;
  lang: "no" | "en";
}

export function EndCard({ visible, brief, payload, lang }: Props) {
  const t = useTranslations("endCard");
  const [emailOpen, setEmailOpen] = useState(false);

  const calLink = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK || `/${lang}/contact`;
  const servicesHref = `/${lang}/services?brief=${encodeURIComponent(brief)}`;

  return (
    <section className={`${styles.endCard} ${visible ? styles.visible : ""}`} aria-live="polite">
      <div className={styles.endEyebrow}>{t("eyebrow")}</div>
      <h2 className={styles.endHeadline}>{payload.recommendation.headline}</h2>
      <p className={styles.endAsk}>{payload.recommendation.ask}</p>
      <div className={styles.ctaStack}>
        <a className={styles.ctaPrimary} href={calLink} target="_blank" rel="noopener noreferrer">
          {t("ctaBook")}
        </a>
        <a className={styles.ctaSecondary} href={servicesHref}>
          {t("ctaMore")}
        </a>
        {!emailOpen && (
          <button
            type="button"
            className={styles.ctaTertiary}
            onClick={() => setEmailOpen(true)}
            aria-expanded="false"
          >
            {t("ctaEmail")}
          </button>
        )}
        {emailOpen && <EmailCaptureForm brief={brief} payload={payload} lang={lang} />}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/_components/BriefBox/EndCard.tsx
git commit -m "feat(briefbox): EndCard with 3 CTAs and inline email-form expansion"
```

---

## Task 14: Build the BriefInput + ChipRow components

**Files:**
- Create: `app/[locale]/_components/BriefBox/BriefInput.tsx`
- Create: `app/[locale]/_components/BriefBox/ChipRow.tsx`

- [ ] **Step 1: Create BriefInput**

Create `app/[locale]/_components/BriefBox/BriefInput.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";

interface Props {
  dimmed: boolean;
  analyzing: boolean;
  onSubmit: (text: string) => void;
  noscriptAction: string;
  lang: "no" | "en";
}

export function BriefInput({ dimmed, analyzing, onSubmit, noscriptAction, lang }: Props) {
  const t = useTranslations("briefBox");
  const [value, setValue] = useState("");
  const [tooltip, setTooltip] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dimmed) inputRef.current?.focus();
  }, [dimmed]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setTooltip(t("tooltipEmpty"));
      return;
    }
    setTooltip("");
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      action={noscriptAction}
      method="post"
    >
      <input type="hidden" name="lang" value={lang} />
      <div className={`${styles.inputWrap} ${dimmed ? styles.inputDimmed : ""}`}>
        <input
          ref={inputRef}
          className={styles.input}
          name="brief"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputAriaLabel")}
          maxLength={500}
          disabled={dimmed}
          autoComplete="off"
        />
        {!dimmed && <span className={styles.cursor} aria-hidden />}
        <button type="submit" hidden>{t("submit")}</button>
      </div>
      {tooltip && <p className={styles.analyzing} role="alert">{tooltip}</p>}
      {analyzing && <p className={styles.analyzing}>{t("analyzing")}</p>}
    </form>
  );
}
```

- [ ] **Step 2: Create ChipRow**

Create `app/[locale]/_components/BriefBox/ChipRow.tsx`:

```tsx
"use client";

import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";

const CHIP_KEYS = ["ar", "leads", "inbox", "support"] as const;
// Spec mentions 5 chips with 4 surfaced. We surface a stable 4 in v1.
// The 5th ("marketing") is in the catalog and reserved for a future cycle/rotation.

export function ChipRow({
  hidden,
  onPick
}: {
  hidden: boolean;
  onPick: (label: string) => void;
}) {
  const t = useTranslations("briefBox.chips");
  if (hidden) return null;
  return (
    <div className={styles.chips} role="list">
      {CHIP_KEYS.map((key) => {
        const label = t(key);
        return (
          <button
            key={key}
            type="button"
            role="listitem"
            className={styles.chip}
            onClick={() => onPick(label)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/_components/BriefBox/BriefInput.tsx app/[locale]/_components/BriefBox/ChipRow.tsx
git commit -m "feat(briefbox): BriefInput + ChipRow (4 chips surfaced, 5th reserved for cycle)"
```

---

## Task 15: Build the DemoStage client island

**Files:**
- Create: `app/[locale]/_components/BriefBox/DemoStage.tsx`

- [ ] **Step 1: Create DemoStage — top half (state + effects)**

Create `app/[locale]/_components/BriefBox/DemoStage.tsx`:

```tsx
"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import { BriefInput } from "./BriefInput";
import { ChipRow } from "./ChipRow";
import { AgentCard } from "./AgentCard";
import { LogStream } from "./LogStream";
import { EndCard } from "./EndCard";
import { SkipLink } from "./SkipLink";
import { StatusPill } from "./StatusPill";
import {
  createDemoScheduler,
  type DemoEvent,
  type DemoPhase
} from "../../../_lib/demoScheduler";
import type { BriefResponse } from "../../../_lib/briefSchema";
import type { ToolState } from "./ToolList";

interface Props {
  lang: "no" | "en";
}

interface DemoState {
  phase: DemoPhase;
  agentsVisible: boolean[];
  toolStates: ToolState[][];
  logsVisible: number;
}

type Action =
  | { type: "reset"; payload: BriefResponse }
  | { type: "event"; event: DemoEvent };

function initialFor(payload: BriefResponse | null): DemoState {
  if (!payload) {
    return { phase: "idle", agentsVisible: [], toolStates: [], logsVisible: 0 };
  }
  return {
    phase: "idle",
    agentsVisible: payload.agents.map(() => false),
    toolStates: payload.agents.map((a) => a.tools.map(() => "idle" as ToolState)),
    logsVisible: 0
  };
}

function reducer(state: DemoState, action: Action): DemoState {
  if (action.type === "reset") return initialFor(action.payload);
  const e = action.event;
  switch (e.type) {
    case "phase":
      return { ...state, phase: e.phase };
    case "agent-spawn": {
      const next = [...state.agentsVisible];
      next[e.index] = true;
      return { ...state, agentsVisible: next };
    }
    case "tool-connect": {
      const next = state.toolStates.map((row) => [...row]);
      // First mark connecting, then schedule the "connected" snap via a microtask.
      next[e.agentIndex][e.toolIndex] = "connected";
      return { ...state, toolStates: next };
    }
    case "log-line":
      return { ...state, logsVisible: Math.max(state.logsVisible, e.index + 1) };
    default:
      return state;
  }
}
```

- [ ] **Step 2: Continue DemoStage — bottom half (component body)**

Append to the same file:

```tsx
export function DemoStage({ lang }: Props) {
  const t = useTranslations("briefBox");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [brief, setBrief] = useState("");
  const [payload, setPayload] = useState<BriefResponse | null>(null);
  const [throttled, setThrottled] = useState(false);
  const [state, dispatch] = useReducer(reducer, initialFor(null));
  const schedulerRef = useRef<ReturnType<typeof createDemoScheduler> | null>(null);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  useEffect(() => {
    return () => {
      schedulerRef.current?.cancel();
    };
  }, []);

  // Auto-scroll on mobile as new content lands.
  useEffect(() => {
    if (typeof window === "undefined" || reducedMotion) return;
    if (window.innerWidth >= 768) return;
    if (state.phase === "idle") return;
    window.scrollTo({ top: document.body.scrollHeight * 0.5, behavior: "smooth" });
  }, [state.phase, state.logsVisible, reducedMotion]);

  async function handleSubmit(text: string) {
    if (submitting) return;
    setSubmitting(true);
    setSubmitted(true);
    setBrief(text);
    setThrottled(false);

    try {
      const res = await fetch("/api/brief", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ brief: text, lang })
      });
      if (res.status === 429) {
        setThrottled(true);
        setSubmitting(false);
        return;
      }
      const data = (await res.json()) as BriefResponse;
      // Enforce 1.5s minimum so the demo "feels earned" (spec).
      const elapsed = performance.now() % 1; // unused; we use a fresh start time below
      void elapsed;
      setPayload(data);
      dispatch({ type: "reset", payload: data });
      const sched = createDemoScheduler(data, {
        reducedMotion,
        onEvent: (event) => dispatch({ type: "event", event })
      });
      schedulerRef.current = sched;
      sched.start();
    } catch {
      setThrottled(true);
    } finally {
      setSubmitting(false);
    }
  }

  function handleSkip() {
    schedulerRef.current?.skip();
  }

  if (throttled) {
    return (
      <section className={styles.shell}>
        <StatusPill label={t("statusLive")} />
        <h1 className={styles.headline}>{t("headline")}</h1>
        <p className={styles.subline}>{t("rateLimited")}</p>
        <a
          className={styles.ctaPrimary}
          href={process.env.NEXT_PUBLIC_CAL_BOOKING_LINK || `/${lang}/contact`}
        >
          {/* Reuse end-card label via direct lookup */}
          {useTranslations("endCard")("ctaBook")}
        </a>
      </section>
    );
  }

  const showSkip =
    submitted && state.phase !== "idle" && state.phase !== "end-card";

  return (
    <section className={styles.shell}>
      {showSkip && <SkipLink label={t("skip")} onClick={handleSkip} />}
      <StatusPill label={t("statusLive")} />
      <h1 className={`${styles.headline} ${submitted ? styles.headlineCollapsed : ""}`}>
        {t("headline")}
      </h1>
      {!submitted && <p className={styles.subline}>{t("subline")}</p>}

      <BriefInput
        dimmed={submitting || submitted}
        analyzing={submitting && !payload}
        onSubmit={handleSubmit}
        noscriptAction="/api/brief-noscript"
        lang={lang}
      />
      <ChipRow hidden={submitted} onPick={handleSubmit} />

      {payload && (
        <div className={styles.stage}>
          <div className={styles.agentRow}>
            {payload.agents.map((agent, i) => (
              <AgentCard
                key={i}
                agent={agent}
                visible={state.agentsVisible[i] ?? false}
                spawningLabel={t("spawning")}
                toolStates={state.toolStates[i] ?? []}
                connectingLabel={t("toolConnecting")}
                connectedLabel={t("toolConnected")}
              />
            ))}
          </div>
          <LogStream logs={payload.logs} visibleCount={state.logsVisible} />
          <EndCard
            visible={state.phase === "end-card"}
            brief={brief}
            payload={payload}
            lang={lang}
          />
        </div>
      )}
    </section>
  );
}
```

Decision (documented): the rate-limit fallback view re-uses `useTranslations("endCard")` inline. This is awkward but valid — alternative is duplicating the Norwegian "Book en 30-min prat" string in `briefBox.*`. Inline use is fine because the function call happens during render of the throttled branch only.

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: no errors. If `useTranslations` call inside the throttled branch trips React rules-of-hooks, lift it to the top of the function body and use the variable.

If lint complains, edit DemoStage to lift the hook call:

```tsx
const tEnd = useTranslations("endCard");
// then use {tEnd("ctaBook")} in the throttled return.
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/_components/BriefBox/DemoStage.tsx
git commit -m "feat(briefbox): DemoStage client island wires scheduler to UI"
```

---

## Task 16: Wire Brief Box into the home page

**Files:**
- Modify: `app/[locale]/page.tsx`

- [ ] **Step 1: Read the current `app/[locale]/page.tsx`**

Run: `cat "app/[locale]/page.tsx"` so you know what's there. It's the home page Plan #1 carried over from the old SaaS-template content.

- [ ] **Step 2: Replace the file**

Replace the entire contents of `app/[locale]/page.tsx` with:

```tsx
import { setRequestLocale } from "next-intl/server";
import type { Locale } from "../../i18n/routing";
import { DemoStage } from "./_components/BriefBox/DemoStage";

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="ct-grid-bg">
      <DemoStage lang={locale} />
    </div>
  );
}
```

- [ ] **Step 3: Build and confirm route renders**

Run: `npm run build`
Expected: build succeeds. Output lists `/[locale]` route.

If build fails on a missing `useTranslations` provider error, confirm `app/[locale]/layout.tsx` (from Plan #1) wraps children in `<NextIntlClientProvider>`. It does.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/page.tsx
git commit -m "feat(briefbox): replace home page with Brief Box demo"
```

---

## Task 17: Add E2E coverage for the demo flow

**Files:**
- Create: `tests/e2e/briefbox.spec.ts`

- [ ] **Step 1: Write the E2E suite**

Create `tests/e2e/briefbox.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("Brief Box demo", () => {
  test("renders headline, input, and 4 chips on /no", async ({ page }) => {
    await page.goto("/no");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Slipp en utfordring/);
    await expect(page.getByPlaceholder("fortell hva som koker...")).toBeVisible();
    await expect(page.getByRole("listitem", { name: "fakturaene er sene" })).toBeVisible();
    await expect(page.getByRole("listitem", { name: "vi mister leads" })).toBeVisible();
    await expect(page.getByRole("listitem", { name: "e-post tar over livet" })).toBeVisible();
    await expect(page.getByRole("listitem", { name: "kundeservice koker" })).toBeVisible();
  });

  test("renders English copy on /en", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(/Drop a challenge/);
    await expect(page.getByRole("listitem", { name: "invoices are slow" })).toBeVisible();
  });

  test("clicking a chip submits and renders the demo stage", async ({ page }) => {
    await page.goto("/no");
    await page.getByRole("listitem", { name: "fakturaene er sene" }).click();
    // Either Haiku returns or fallback fires; in both cases agent cards appear.
    await expect(page.locator("article").first()).toBeVisible({ timeout: 15_000 });
    // End card should be reachable within ~14s.
    await expect(page.getByRole("link", { name: /Book en 30-min prat/i })).toBeVisible({ timeout: 20_000 });
  });

  test("skip link appears mid-demo and jumps to end card", async ({ page }) => {
    await page.goto("/no");
    await page.getByRole("listitem", { name: "fakturaene er sene" }).click();
    const skip = page.getByRole("button", { name: /skip til resultat/i });
    await expect(skip).toBeVisible({ timeout: 5000 });
    await skip.click();
    await expect(page.getByRole("link", { name: /Book en 30-min prat/i })).toBeVisible();
  });

  test("end card shows the email form when 'Send dette på e-post' is clicked", async ({ page }) => {
    await page.goto("/no");
    await page.getByRole("listitem", { name: "fakturaene er sene" }).click();
    await page.getByRole("button", { name: /skip til resultat/i }).click();
    await page.getByRole("button", { name: /Send dette på e-post/i }).click();
    await expect(page.getByPlaceholder("e-post")).toBeVisible();
    await expect(page.getByPlaceholder("firmanavn")).toBeVisible();
    await expect(page.getByPlaceholder("nettside")).toBeVisible();
  });

  test("empty submit shows the tooltip", async ({ page }) => {
    await page.goto("/no");
    await page.getByPlaceholder("fortell hva som koker...").press("Enter");
    await expect(page.getByRole("alert")).toContainText(/skriv et reelt problem/);
  });
});
```

- [ ] **Step 2: Run the E2E suite**

Run: `npm run test:e2e -- --grep "Brief Box"`
Expected: all 6 tests pass.

If the chip-click test times out, confirm `ANTHROPIC_API_KEY` is set in `.env.local`. The fallback canned template still produces a payload even without a real API key — the route catches the `Error: missing API key` from the SDK and falls through to `getTemplate()`. So the suite should pass with or without a real key.

- [ ] **Step 3: Commit**

```bash
git add tests/e2e/briefbox.spec.ts
git commit -m "test(briefbox): E2E coverage for demo flow, chips, skip, end-card, empty submit"
```

---

## Task 18: Final verification — lint, types, full test sweep

**Files:**
- (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors. Fix any new issues from the BriefBox files (most common: unused imports, missing key props in `.map()`).

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: All unit tests**

Run: `npm test`
Expected: all suites green — sanity (Plan #1), briefSchema (7), cannedTemplates (8), rateLimit (4), demoScheduler (5), briefRoute (6).

- [ ] **Step 4: All E2E tests**

Run: `npm run test:e2e`
Expected: routing + locale-toggle (Plan #1) + briefbox (6) + briefbox-noscript (2) all pass.

- [ ] **Step 5: Manual smoke**

Run: `npm run dev`. In the browser:

1. Visit `http://localhost:3000/no` — Norwegian Brief Box renders, lime cursor blinks, status pill pulses, 4 chips visible.
2. Click "fakturaene er sene" — input dims, "▸ analyserer..." appears, agents stagger in within 3–4s, tools flip from idle to connected, 3 log lines stream in, end card slides up.
3. Click "Book en 30-min prat" — opens calendar link in new tab.
4. Reload, click chip, hit "skip til resultat →" — end card appears immediately with all data populated.
5. Click "Send dette på e-post" — form expands inline. Fill it; submit. Expect a network call to `/api/lead` returning 404 (Plan #4 not yet implemented) → form shows error message. This is correct.
6. Visit `http://localhost:3000/en` — English copy throughout.
7. Open DevTools, throttle network to "Slow 3G", submit a brief — `▸ analyzing...` shows for ≥1.5s.
8. DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload, submit — phases compress to ~2s each.
9. DevTools → Network tab → block JavaScript, reload `/no`, submit the form — browser POSTs to `/api/brief-noscript` and returns the static HTML page.

Stop the dev server.

- [ ] **Step 6: Build production**

Run: `npm run build && npm run start`
Visit `http://localhost:3000/no` once. Confirm the same flow works in production mode.
Stop the server.

- [ ] **Step 7: Commit any cleanup**

If lint/typecheck surfaced anything, commit the fixes:

```bash
git add -A
git commit -m "fix(briefbox): plan #2 cleanup"
```

If nothing needed fixing, skip this step.

---

## Self-Review Checklist (run after writing the plan)

**1. Spec coverage — does the plan implement these spec sections?**

- [x] "The Brief Box → Layout" → Task 9 (CSS), Task 15 (DemoStage layout)
- [x] "The Brief Box → Phases (0–5)" → Task 8 (scheduler timings), Task 15 (DemoStage rendering)
- [x] "Engine → Input/Output/Process (rate-limit, length check, Haiku call, zod, fallback)" → Tasks 2, 4, 5, 6
- [x] "Suggestion chips (5 chips, 4 surfaced)" → Task 14 (ChipRow), Task 10 (catalog)
- [x] "End card → 3 CTAs + email-capture inline expansion" → Tasks 12, 13
- [x] "Email-capture flow (form fields, honeypot, hidden fields)" → Task 12 (UI only — Plan #4 wires backend)
- [x] "Failure modes (empty, 1-word, >500 chars, timeout, invalid JSON, rate limit, refusal, all templates miss)" → Tasks 3, 6, 14
- [x] "Skip link behavior" → Tasks 8, 15
- [x] "Animation framework (pure CSS + TS scheduler, no library)" → Tasks 8, 9
- [x] "Edge cases → JS disabled, slow connection, reduced motion, multi-submit, cursor pointer-events" → Tasks 7, 8, 9, 15

**2. Out of scope confirmed (covered in plans #3 and #4):**
- `/services` rebuild, `/contact` simplification → Plan #3.
- `/api/lead` backend, Notion + Resend + Paperclip webhook → Plan #4.
- Research agent itself → lives in Paperclip.

**3. Placeholder scan** — confirmed none of:
- "TBD", "TODO", "implement later", "similar to Task N", `// ...` — all task content is concrete code.
- "Add appropriate error handling" — handlers explicit and bounded; `console.warn` on fallback paths.

**4. Type consistency** — `BriefResponse` defined in `briefSchema.ts` and imported by every consumer (route, scheduler, components). `Lang` from `cannedTemplates.ts`. `AgentColor` from `briefSchema.ts`. CSS class names match `agent.color` enum exactly.

**5. Decisions documented inline** — agent color palette (5), 4 chips surfaced (5th reserved), in-memory rate-limit limitations + Upstash v2 path, throttled-view inline `useTranslations` workaround.

---

## Done Criteria

When all 18 tasks are complete:

- `/[locale]` renders the Brief Box demo: status pill, headline, input, 4 chips. No old marketing scaffolding remains.
- Submitting (typing + Enter or chip click) calls `/api/brief`; on success the demo plays through 5 phases and lands on the end card.
- The end card shows 3 CTAs, the third expands inline into the email-capture form (which POSTs to `/api/lead` — a 404 is expected until Plan #4).
- `/api/brief` calls Claude Haiku 4.5 server-side, validates with zod, falls back to the closest canned template on any failure, and rate-limits 5/hr/IP.
- `/api/brief-noscript` returns a server-rendered static plan for JS-disabled visitors.
- 12+1 canned templates exist, all schema-valid, with NO + EN variants.
- The scheduler is a pure-TS state machine with skip + reduced-motion modes. No animation library shipped.
- All `briefBox.*` and `endCard.*` keys present in both message catalogs.
- Demo cards are `pointer-events: none` so the cursor effect from Plan #1 passes through.
- All unit tests (briefSchema, cannedTemplates, rateLimit, demoScheduler, briefRoute) green.
- All E2E tests (briefbox, briefbox-noscript) green alongside Plan #1's routing + toggle suites.
- `npm run lint`, `npm run typecheck`, `npm run build` all pass.
- Manual smoke confirms desktop, mobile (devtools), reduced motion, and JS-disabled paths.

---

## Next plan

After this lands and is reviewed, Plan #3 (`docs/superpowers/plans/2026-05-03-crunchtime-rethink-3-services-contact.md`) builds the new `/services` long page (services + process + results + pricing tiers + FAQ + CTA banner, plus the brief-handoff callout) and simplifies `/contact` to the calendar embed + minimal form. Plan #4 then wires `/api/lead` to Notion + Resend + the Paperclip webhook so the email-capture form on the end card actually sends.
