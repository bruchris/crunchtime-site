# Crunchtime site rethink — Design

**Date:** 2026-05-03
**Status:** Approved (pending written review)
**Replaces:** Current home, /consulting, /contact, /back-office/finance

## Goal

Rebuild the crunchtime.no site around a single interactive demo that *feels like an agent team is on the page with you*. Drop the SaaS-template scaffolding (eyebrow + hero + 6 sections + CTA banner) inherited from the current site. Use the demo itself as both the proof and the conversion surface. Drop name-dropping of "Paperclip" and "OpenClaw" in user-facing copy — show what agents *do*, not what they're built on.

The site has three pages:

| Path | Purpose |
|---|---|
| `/` | Lean Brief Box demo. The page IS the demo. Conversion happens at the end card. |
| `/services` | Services + process + results + pricing tiers + FAQ. Long-form pitch for buyers who want detail. |
| `/contact` | Contact form + Google Calendar booking embed. |

Plus bilingual scaffolding: `/no/...` (default) and `/en/...` (toggle in nav). Root `/` redirects based on `Accept-Language` → cookie persists choice.

Old paths:
- `/consulting` → 301 to `/services` (preserves outreach links)
- `/back-office/finance` → removed, 404

## Inspiration

[hey.milo.gg](https://hey.milo.gg) — the *spirit* (alive, exploratory, anti-template, personal voice), not the *form* (sticker board, card stack). milo's magic is that the visitor encounters a person, not a product page. We translate that to "the visitor encounters an agent team, not a service page."

## Brand & visual identity

Carries forward from the existing draft `crunchtime-landingsside (1).html`:

- **Typography:** [Syne](https://fonts.google.com/specimen/Syne) (display, 400/600/700/800) for headlines, CTAs, labels. [DM Sans](https://fonts.google.com/specimen/DM+Sans) (body, 300/400/500) for prose. [JetBrains Mono](https://fonts.google.com/specimen/JetBrains+Mono) (monospace) for the demo's terminal-feel surfaces.
- **Color tokens:**
  - `--black: #0a0a09` (page background)
  - `--white: #f5f3ee` (primary text, slightly off-white)
  - `--accent: #d4ef3a` (lime, used sparingly — CTAs, status pills, highlights)
  - `--accent-dark: #a8c41a` (CTA hover)
  - `--gray: #1a1a18` (surface)
  - `--gray-mid: #2e2e2b`
  - `--gray-light: #8a8a82`
  - `--gray-border: #2a2a27`
- **Accent rule:** lime is the "live" color. Used for active agents, status indicators, primary CTAs, and the typewriter cursor. Never for body text. Never gradient-clipped.
- **Cursor:** existing [`app/_components/CursorEffect.tsx`](../../../app/_components/CursorEffect.tsx) carries forward unchanged. Color reference updated to `--accent` token.
- **Grid background:** subtle `linear-gradient` grid (80×80px, `rgba(212,239,58,0.04)`) on hero region of `/`, masked with a radial gradient so it fades at edges.

## Voice

**Confident core, casual flourishes.** Headlines and CTAs are direct and declarative — they read like a confident Norwegian business. Agent dialogue inside the demo is first-person, conversational, asks questions back. Microcopy and chip suggestions use real-pain language ("det som koker", "e-post tar over livet").

**Voice rules** (encode as guidance for all generated and hand-written copy):

- Headlines / CTAs: direct, declarative. Banned: "we're excited", "leverage", "synergi", "transformere", "skalere ressursene", "neste generasjons".
- Agent dialogue (inside demo): first person, ≤2 short sentences, often ends with a question to the visitor.
- Chips and microcopy: casual phrasing for real SMB pains.
- No em dashes (`—`) or double-hyphens (`--`). Use commas, periods, parens, semicolons.
- No sentence-ending exclamation marks except inside agent dialogue where it's clearly characterized.

**Sample headlines (Norwegian):**

- Hero: "Slipp en utfordring. Møt teamet ditt."
- Hero subline: "Skriv det som koker. Vi setter sammen et team og viser deg hvordan de ville løst det."
- End-card line: "3 agenter, ~4t/uke spart."
- Primary CTA: "Book en 30-min prat"
- Secondary CTA: "Vis meg mer først"
- Tertiary CTA: "Send dette på e-post"

**EN equivalents** sit in the same slot of the message catalog and follow the same voice rules.

## The Brief Box (home `/`)

The home page is the Brief Box. There is no separate hero, no sections below, no marketing scaffolding. The page opens in a single full-viewport state and transitions in place through five phases.

### Layout

Desktop (≥1024px):
- Centered column, max-width ~720px.
- Top: live status pill ("● live · oslo"), small.
- Headline: "Slipp en utfordring. Møt teamet ditt." (Syne 800, ~clamp(2.5rem, 6vw, 5rem)).
- Subline below: ~1 line of DM Sans 300, gray.
- Brief Box: full-width input, monospace, blinking lime cursor. Below the input: 4 chip suggestions.
- Once the visitor submits, the headline and subline collapse upward (smaller, sticky), the chips vanish, and the demo phases render below the input.
- Skip link top-right of the demo region from second 2: "skip til resultat →"

Mobile (<768px):
- Same column, padded for thumbs.
- Headline shorter / wraps at narrower break.
- Demo phases stack vertically. As each phase renders, the page auto-scrolls so the latest content sits ~⅔ down the viewport.
- All CTAs in the end card are full-width.

### Phases

| Phase | Duration | Behavior |
|---|---|---|
| 0. Idle | — | Headline + input + chips. Cursor blinks. Page is alive (cursor effect, status pill animates). |
| 1. Brief in | 0.5s | Visitor hits enter or clicks chip. Input dims, "▸ analyserer..." appears. Backend call fires. |
| 2. Team forms | 3s | Agents stagger in (~700ms each), 2–4 of them, each with role label and "spawner..." subline. |
| 3. Tools connect | 4s | Per agent, tool list reveals; each tool shows "⟳ kobler" → "✓ koblet" pill. Looks like a Paperclip onboarding sequence. |
| 4. They work | 5s | 3–4 timestamped log lines stream into a feed. Each line names an agent and a concrete action. |
| 5. End card | — | Recommendation card slides in. Conversational branch with 3 CTAs. |

Total ~12s desktop, ~14s mobile. Skip link jumps directly to phase 5 (with the recommendation populated, agents listed but un-animated).

### Engine

One LLM call per submission. Server-side route `/api/brief` (POST):

**Input:**
```json
{
  "brief": "fakturaene våre er sene...",
  "lang": "no" | "en"
}
```

**Process:**
1. Rate-limit check (5/hr/IP, sliding window). 429 if exceeded.
2. Length check (1–500 chars). Short input → return canned "tell me more" response.
3. Call Claude Haiku 4.5 with structured-output prompt. Temperature 0.4. Max tokens 600.
4. Validate response shape (zod). On failure → fallback to closest canned template (keyword match against ~12 templates).
5. Return JSON.

**Output:**
```json
{
  "agents": [
    { "name": "AR-spesialist", "color": "lime", "tools": ["stripe", "tripletex", "gmail"] },
    { "name": "Kundeservice", "color": "blue", "tools": ["gmail", "slack"] },
    { "name": "Cashflow", "color": "amber", "tools": ["fiken"] }
  ],
  "logs": [
    { "agent": "AR-spesialist", "action": "drafted 7 chase emails", "ts": "11:42" },
    { "agent": "Kundeservice", "action": "reviewed tone, softened 2", "ts": "11:43" },
    { "agent": "Cashflow", "action": "flagged 3 at >30d risk", "ts": "11:44" }
  ],
  "recommendation": {
    "headline": "3 agenter, ~4t/uke spart.",
    "ask": "Vil du ha dette satt opp på ekte for bedriften din?"
  }
}
```

The frontend receives the JSON and runs the animation timeline against it. JSON validation: agents 1–4, tools 1–4 per agent, logs 3–5, recommendation.headline ≤80 chars.

### Suggestion chips (Norwegian)

5 chips, surface 4 at a time, occasionally cycle:

- "fakturaene er sene" → AR + Cashflow template
- "vi mister leads" → Sales rep + CRM template
- "e-post tar over livet" → Inbox triage + scheduling template
- "kundeservice koker" → Support tier-1 + escalation template
- "ingen tid til markedsføring" → Content + social template

EN equivalents in EN locale.

### End card

Recommendation card. Slides in from below the last log line. Lime left border (2px), `--gray` background, padded.

Layout:
- Eyebrow: "▸ teamet er klart" in lime
- Headline: from `recommendation.headline` (Syne 700, ~1.5rem)
- Body: from `recommendation.ask` (DM Sans 300)
- Three CTAs stacked, each full-width within the card:
  1. **Primary** — "Book en 30-min prat" — lime fill, black text. Opens Google Calendar booking modal (existing `NEXT_PUBLIC_CAL_BOOKING_LINK`).
  2. **Secondary** — "Vis meg mer først" — outlined, navigates to `/services` with the brief preserved as a URL param so /services can show a "from your brief: ..." callout.
  3. **Tertiary** — "Send dette på e-post" — outlined, expands inline to the email-capture form.

### Email-capture flow ("Send dette på e-post")

When the tertiary CTA is clicked:

1. Card expands inline (no modal). Form appears below the three CTAs.
2. Form fields:
   - **Required:** navn, e-post, firmanavn, nettside (URL).
   - **Optional:** "noe annet vi bør vite?" (single line, free text).
   - **Hidden:** brief text, generated JSON, language, source ("brief-box-v1"), timestamp.
   - **Honeypot:** hidden `company_phone` field — bots fill it, humans don't.
3. Submit POSTs to `/api/lead`:
   - Inserts row in Notion CRM (database TBD; Notion integration token in env).
   - Sends ack email via Resend: "Plan kommer på e-post innen 30 min. Vi ser litt på bedriften din først."
   - Triggers Paperclip async job (HTTP webhook to Paperclip with the lead payload).
4. Paperclip research agent (separate component, lives in Paperclip not in this repo):
   - Scrapes visitor's website (text + meta).
   - Looks up LinkedIn company page (public).
   - Identifies industry, size, tech stack signals.
   - Combines with the brief + generated agent suggestions.
   - Generates implementation plan from a markdown template.
   - Sanity guards: plan must be ≥500 chars, must reference scraped data, must propose ≥2 agents. If any guard fails → flag in CRM as "needs review", do not auto-send.
   - On pass: emails plan to visitor via Resend, with reply-to `christian@crunchtime.no`.
   - Updates CRM row: status → "warm: plan delivered" or "warm: needs review".
5. Slack/email ping to Christian for every lead, regardless of plan-send outcome.

The research agent and template live in Paperclip. This site repo only owns the form, the API route, the Notion insert, and the webhook trigger.

### Failure modes

| Scenario | Behavior |
|---|---|
| Empty submit | Tooltip on input: "skriv et reelt problem" |
| 1-word brief ("test", "asdf") | Backend returns canned response: "fortell meg litt mer. Hva er hardt akkurat nå?" |
| Brief >500 chars | Truncate to 500, send as-is |
| LLM call timeout (>8s) | Fallback to closest canned template based on keyword match. Visitor never sees an error. |
| LLM returns invalid JSON | Same fallback. Log to Sentry. |
| Rate limit hit | Show "vi er litt overvelmet. Prøv igjen om en time, eller book en prat direkte" with primary CTA only. |
| LLM refuses ("can't help with that") | Fallback to canned "general" template + soft message: "denne er litt spesiell. La oss ta en prat". |
| All canned templates miss | Use "general" template (5 generic agents, generic tools, generic recommendation). |

### Skip link behavior

"skip til resultat →" appears top-right of the demo region from second 2 onward. Click → skip remaining pending phases, render end card immediately with all data populated (agents listed without spawn animation, logs visible without streaming).

## `/services` page

Single long page. The pitch for visitors who want detail. Built in the style of the attached draft HTML, but adapted to the new visual language (cursor, voice rules, no em dashes).

### Sections, in order

1. **Eyebrow + headline** — "Tjenester" / "AI-team som faktisk gjør jobben". Single hero block, no grid background, no stats row.
2. **Services** — 3 cards in a 1px-gap grid (matches draft HTML). Cards:
   - "AI-automatisering & agenter"
   - "AI-strategi & rådgivning"
   - "AI-implementering"
   - Each: number, icon, title, 3-line description. Hover: lime underline animates from left.
3. **Process** — 4 vertical steps, each in a 2-column row (number | content). Hover: number lights up to lime. Steps from the draft (kartlegging → strategi → bygging → oppfølging).
4. **Results** — 4-card 2×2 grid. Each card: tag pill, big lime number, label, description. Numbers from the draft (23t, 3×, 62%, 18 dager). Update with real numbers as case studies land.
5. **Pricing tiers** — existing `/consulting` content (Discovery Sprint, Implementation Pilot, Retainer). Three cards in a row, lime accent on the recommended tier, each with: name, price, "what's included" list, CTA.
6. **FAQ** — 6–8 expandable items. Existing `/consulting` content carries forward.
7. **CTA banner** — full-width lime band with dark text and a single "Book en gratis samtale" button. Matches the draft HTML pattern.
8. **Footer** — same as `/`.

### Brief-handoff from `/`

If `/services` is reached via the "Vis meg mer først" CTA on `/`, a small dismissible callout appears above the services section: "Du kom hit fra en brief om: '{brief excerpt}'. Vil du heller booke en prat? [Book →]" — the callout shows the visitor we remembered.

## `/contact` page

Minimal. Two surfaces, stacked:

1. Google Calendar appointment-scheduling iframe (full width, ~720px tall, existing `?gv=true` embed).
2. Resend-powered contact form below: navn, firma, e-post, melding, send-button. POSTs to existing `app/contact/actions.ts`.

No cards, no metrics, no marquee. Just "book or write."

## Bilingual implementation

- **Library:** [`next-intl`](https://next-intl-docs.vercel.app).
- **Routes:** `/no/...` (default), `/en/...`. Root `/` redirects based on `Accept-Language` header → first match wins → cookie `NEXT_LOCALE` persists choice for 1 year.
- **Message catalogs:** `messages/no.json`, `messages/en.json`. Top-level keys per page (`home`, `services`, `contact`, `nav`, `footer`, `briefBox`, `endCard`, `errors`).
- **Nav toggle:** "NO | EN" pill in the top-right of the nav. Updates URL + cookie. Persists on next visit.
- **Brief Box LLM call:** `lang` param forwarded to the Haiku prompt — agents reply in the requested language. If the visitor types in the "wrong" language for the locale (e.g. EN brief on `/no`), the LLM responds in their typed language (we detect via the model itself, not regex).
- **Sitemap:** both locales advertised. `<link rel="alternate" hreflang="no" href="..."/>` and `hreflang="en"` on every page.

## Animation framework

No library. Pure CSS animations + a small TypeScript scheduler module.

- **Scheduler:** `app/_lib/demoScheduler.ts` — receives the JSON payload, drives the phase state machine via `setTimeout` and `requestAnimationFrame`. Emits events; React components listen and add/remove CSS classes.
- **CSS:** keyframes for fade-up, slide-in-left (for log lines), pulse (for "● live" pill), typewriter cursor blink. All in `app/globals.css` or component-scoped stylesheets.
- **Why no Framer Motion / GSAP:** the demo is a finite state machine with discrete phases. Library overhead (35kb gzipped for Framer) doesn't justify itself for ~5 distinct animations. Keeps bundle lean — important for a hero that loads first.

## Edge cases

- **JS disabled:** brief input is a real `<form action="/api/brief-noscript">`. Server returns a static "agents would help with..." HTML page generated server-side. Worse experience but functional.
- **Slow connection:** the LLM response is the only network call before the demo plays. Show a subtle "▸ analyserer..." indicator with a 1.5s minimum even if response comes back faster — gives the demo time to "feel" earned.
- **Reduced motion:** `prefers-reduced-motion: reduce` shortens phases to ~2s each (no per-character typewriter, just instant text), no slide-in animations, no auto-scroll on mobile (visitor scrolls manually). End card still appears.
- **Visitor leaves and comes back:** brief input is empty on return — no localStorage. Each visit is fresh.
- **Multiple submissions in one session:** demo replays. Same JSON cache for 30s if same brief (debounce identical submits).
- **Search engine bots:** SSR renders the headline + chips + a static "agents would do this for your business" SEO description (in the right language). No JS needed for indexing.
- **Cursor effect on the demo region:** the existing CursorEffect already handles hover scaling on `button`, `a`, `[role="button"]`. Chips and CTAs inherit. Demo cards (agent panels, log lines) use `pointer-events: none` since they're not interactive — cursor passes through.

## What gets removed

- Current `app/page.tsx` (the SaaS-template home) — fully replaced.
- Current `app/back-office/finance/page.tsx` — deleted, route returns 404.
- Current `app/contact/page.tsx` — simplified per the new contact spec (calendar + form, no cards).
- Current `app/consulting/page.tsx` — content migrates into the new `/services` page, route 301s.
- Marquee component — gone.
- "Powered by Paperclip + OpenClaw" eyebrow — gone.
- "How it works (01·02·03)" section on home — gone.
- Hero metrics (3 hrs / 24/7 / <48 hrs / 100%) — gone from home, retained in `/services` results section.
- Service grid on home — gone.
- "Paperclip is the org chart. OpenClaw is the team." section — gone.

## What gets added

- `app/[locale]/page.tsx` — the new Brief Box home (per locale).
- `app/[locale]/services/page.tsx`.
- `app/[locale]/contact/page.tsx`.
- `app/_components/BriefBox/` — input, chip row, demo phase components, end card.
- `app/_lib/demoScheduler.ts`.
- `app/_lib/cannedTemplates.ts` — ~12 templates keyed by intent + a `general` fallback.
- `app/api/brief/route.ts` — LLM call + validation + canned fallback.
- `app/api/brief-noscript/route.ts` — server-rendered fallback for no-JS submits.
- `app/api/lead/route.ts` — Notion insert + Resend ack + Paperclip webhook.
- `messages/no.json`, `messages/en.json`.
- `next-intl` middleware + config.
- Redirects in `next.config.mjs`: `/consulting` → `/services`, `/back-office/finance` → 404.

## Testing

Manual verification:

1. Submit each chip on `/no/` and `/en/` — agents/tools/recommendation match the chip's intent in the right language.
2. Submit a free-text brief that *doesn't* match any chip — LLM should still produce a coherent agent team.
3. Force the LLM call to time out (kill process or add 10s sleep) — fallback canned template appears, no error visible.
4. Skip link works mid-demo and at every phase.
5. Hit rate limit (6 submits in <1hr from same IP) — friendly throttle message appears, primary CTA still works.
6. Email-capture form: submit valid → ack email arrives, Notion row created, Paperclip webhook fires (mock in tests). Submit honeypot filled → silently rejects.
7. Bilingual: visit `/` from a Norwegian-locale browser → lands on `/no`. Toggle to EN → cookie persists, next `/` visit lands on `/en`.
8. `/services` brief-handoff: navigate from `/` end card → callout shows brief excerpt.
9. Mobile (Chrome devtools, real iPhone): vertical stack, auto-scroll keeps demo in view, end card CTAs full-width and tappable.
10. Reduced motion: `prefers-reduced-motion: reduce` collapses animations, demo still completes, end card still appears.
11. JS disabled: form posts to `/api/brief-noscript`, server-rendered fallback page loads.
12. Cursor effect: works on /, /services, /contact across desktop and touch.
13. Lighthouse: home page should score ≥90 on all axes (Performance, Accessibility, Best Practices, SEO). Services and Contact ≥85.
14. SEO: both `/no/` and `/en/` indexed, `hreflang` correct, sitemap lists both.

## Out of scope (v2 candidates)

- Real Paperclip-backed demo (Engine 3 from brainstorm) — currently using the LLM + scripted animation (Engine 2).
- Cross-session brief history ("you submitted 3 briefs — here they are").
- Sharing the demo result via URL (deep-link to a specific recommendation).
- Case study pages (`/case/uib`, `/case/...`).
- LinkedIn schema for results section (rich snippets).
- Norwegian-only chat widget on `/services` for ambiguous visitors.

## Migration & rollout

1. Build behind a feature flag (`NEXT_PUBLIC_REDESIGN=true`) to allow side-by-side comparison.
2. Internal review on Vercel preview URL.
3. Soft launch: route ~10% of traffic to new home for one week (Vercel split); compare conversion (book + email-capture).
4. Full cutover once metrics are at parity or better.
5. Old home retained at `/_legacy/home` for 30 days, then deleted.

## Reference

- Inspiration: [hey.milo.gg](https://hey.milo.gg)
- Visual draft: `crunchtime-landingsside (1).html` (Norwegian, in repo history)
- Existing cursor spec: [docs/superpowers/specs/2026-05-01-custom-cursor-effect-design.md](2026-05-01-custom-cursor-effect-design.md)
- Brainstorm screens: `.superpowers/brainstorm/1957-1777840536/content/`
