# Notion CMS setup — Crunchtime Insights database

The `/[locale]/insights` hub and `/[locale]/insights/[slug]` post pages render content from a Notion database. ISR (`revalidate = 3600`) keeps the site fresh without redeploys; the `Crunchtime Site` integration created in `notion-crm-setup.md` is reused.

## 1. Reuse the existing integration

The `Crunchtime Site` internal integration created for the leads CRM has the capabilities needed (Read content, Insert content, Update content). No new token is required — `NOTION_TOKEN` already in env covers this.

## 2. Create the database

Create a full-page database called **Crunchtime Insights** (in the Crunchtime teamspace, alongside the leads DB) with these properties (exact names — the renderer keys off them):

| Property | Type | Configuration |
|---|---|---|
| `Title` | Title | The post H1; also used as `<title>` |
| `Slug` | Rich text | URL slug, e.g. `why-leads-die-in-five-minutes`. Lowercase, hyphenated, no locale prefix |
| `Locale` | Select | Options: `no`, `en` |
| `Excerpt` | Rich text | 150–250 chars. Used as `<meta description>` and the Article schema description |
| `Subtitle` | Rich text | Hero deck (one sentence shown under the H1) |
| `Vertical` | Multi-select | Options: `accounting`, `ecommerce`, `law`, `dental`, `real-estate`, `hospitality`, `services`, `general` |
| `Tags` | Multi-select | Freeform — used for `keywords` meta and on-page tag chips |
| `Cover` | Files | OG image; first file is used. 1200×630 recommended |
| `Status` | Select | Options in this order/color: `draft` (gray), `in-review` (yellow), `published` (green), `archived` (red) |
| `Published` | Date | Include time. The publish date used for schema `datePublished` and sitemap `lastmod` |
| `Pair slug` | Rich text | Slug of the same post in the other locale, for hreflang. Optional but strongly recommended |
| `Author` | Rich text | e.g. `Christian Bru` |
| `Reading time` | Number | Minutes (whole number). Optional — auto-estimated if blank |
| `Featured` | Checkbox | Show on hub top row |
| `Sources` | Rich text | One source per line. Format: `Source name — https://url — YYYY-MM-DD`. These render as a Sources footer on the post AND populate the `citation` field in Article JSON-LD. **Required** — every post must cite at least 3 third-party sources |

**Critical:** Add the Select / Multi-select options in advance. The Notion API does not auto-create options on first write; the agents drafting posts will fail silently otherwise.

## 3. Body content

Body lives in the **page content**, not in a property. Supported blocks (rendered as React):

- Headings (h2/h3/h4 — h1 is the post title, don't use it in body)
- Paragraphs (with bold, italic, code, links)
- Bulleted and numbered lists
- Quote
- Callout (rendered as a highlighted info block)
- Code blocks (with syntax highlighting via the language hint)
- Dividers
- Images (with alt text — required for accessibility and AI alt-text indexing)
- Tables (simple)

Unsupported blocks render as a fallback paragraph; check the renderer at [app/_lib/insights/blockRenderer.tsx](../../app/_lib/insights/blockRenderer.tsx) before introducing exotic block types.

## 4. Share with the integration

Database page → `...` menu → Connections → Add connections → search "Crunchtime Site" → confirm. Connection inherits to all pages in the database.

## 5. Copy the database ID

The 32-char hex string in the database URL: `https://www.notion.so/<workspace>/<DATABASE_ID>?v=<view_id>`. This is `NOTION_INSIGHTS_DATABASE_ID`.

## 6. Add env var

`.env.local`:
```
NOTION_INSIGHTS_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

In Vercel (Project Settings → Environment Variables), add for Production, Preview, and Development. Mark Sensitive.

## 7. Authoring workflow

1. Draft the post in Notion. Set `Status = draft` while writing.
2. Move to `Status = in-review` to surface in agent review queues (CEO + QA pass — see Paperclip task templates).
3. Set `Status = published` and fill `Published` date.
4. The site shows the post within an hour (ISR) or instantly if a webhook is wired (see §9).
5. For NO + EN parity: write both locales, set `Pair slug` on each pointing to the other.
6. Current schema contract for post pages is `Article` + `BreadcrumbList` JSON-LD only. Do not expect `FAQPage` on insights posts unless the page model explicitly adds a FAQ section later.

## 8. Smoke test

After the database exists and env vars are set:
```
pnpm dev
```
Open `/no/innsikt` and `/en/insights`. The hub should render even with zero published posts (empty state). Add one row with `Status = published`, `Published = today`, and refresh — the post should appear within ~1s on dev (revalidate is bypassed in dev).

## 9. Optional: instant updates via webhook

To skip the 1-hour ISR window, configure a Notion webhook (Settings → Integrations → Webhooks in your workspace) pointing to `https://crunchtime.no/api/insights-revalidate` with the database filtered. The route reads `x-notion-signature`, calls `revalidateTag("insights")`, and posts go live within seconds. Not implemented yet — file an issue when you want it.

## 10. SEO/GEO checklist per post

Before flipping `Status = published`:
- Title is a question or pain statement (ranks better, gets quoted by AI engines)
- First paragraph literally answers the title in 1–3 sentences
- At least one numeric claim with a source (e.g. "responding within 5 minutes makes a lead 21× more likely to qualify ([source](https://...))")
- At least one named tool relevant to the vertical (Tripletex, Fiken, Shopify, etc.)
- One concrete CTA at the end (book a call OR start a Discovery Sprint)
- `Excerpt` is set and reads as a clean meta description
- `Cover` image is set (1200×630)
- `Pair slug` is set if the counterpart locale exists
