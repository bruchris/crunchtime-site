# Crunchtime Site

Customer comms site — MVP landing pages for both GTM plans. Tracked by [CRUA-33](../../README.md).

> Stack: Next.js 16 (App Router) + Tailwind v4 on Vercel Hobby. Domain `crunchtime.no` via Cloudflare DNS. Mail via Zoho Mail Free. Contact form via Resend free tier.

## Local development

```bash
npm install
cp .env.local.example .env.local  # see env table below for required values
npm run dev
```

Dev server on `http://localhost:3000`.

## Deploy (Vercel)

1. `npx vercel link --scope bru-broch` in this directory (or push to GitHub + connect Vercel project under the `Bru_Broch` team).
2. Set env vars in Vercel project settings (see `.env.local.example` for the canonical list):
   - `ANTHROPIC_API_KEY` — required for the Brief Box demo (Haiku call)
   - `NOTION_TOKEN`, `NOTION_DATABASE_ID`, and `NOTION_INSIGHTS_DATABASE_ID` — required for the lead CRM and the `/insights` CMS; schemas documented in `docs/runbooks/notion-crm-setup.md` and `docs/runbooks/notion-insights-setup.md`
   - `INSIGHTS_PREVIEW_SECRET` — enables `/api/draft?secret=...&locale=no&slug=...` so QA can view in-review insights posts on preview deployments
   - `RESEND_API_KEY` — required for lead ack + admin notification emails (verify `crunchtime.no` in Resend first)
   - `PAPERCLIP_API_BASE`, `PAPERCLIP_API_TOKEN`, `PAPERCLIP_COMPANY_ID`, `PAPERCLIP_PROJECT_ID`, `PAPERCLIP_GOAL_ID`, `PAPERCLIP_AGENT_ID` — required for the Paperclip lead handoff described in `docs/runbooks/paperclip-webhook-contract.md`
   - `CONTACT_INBOX=hello@crunchtime.no`
   - `CONTACT_FROM=Crunchtime <noreply@crunchtime.no>`
   - `NEXT_PUBLIC_CAL_BOOKING_LINK` — Cal.com link for the booking CTA (optional; falls back to `/contact`)
3. Optional sync helper: `node scripts/push-vercel-envs.mjs` reads `.env.local` and upserts the canonical vars to the linked Vercel project.
4. Production deploy: `npx vercel --prod`.
5. In Vercel Project → Settings → Domains: add `crunchtime.no` + `www.crunchtime.no`.
6. Confirm Cloudflare DNS records resolve to Vercel (A `76.76.21.21` + CNAME `www → cname.vercel-dns.com`, both DNS-only / grey cloud).

## Human-required setup (once per environment)

| Step | Where | Status |
|---|---|---|
| Domain registration | Registrar (domene.shop / one.com) | Day 1 — see [CRUA-40](../../../../CRUA/issues/CRUA-40) playbook |
| Cloudflare DNS zone | https://dash.cloudflare.com | Day 1 |
| Zoho Mail Free + DKIM/SPF/DMARC | https://www.zoho.com/mail | Day 1 |
| Resend account + domain verification | https://resend.com | Day 2 (blocks contact form) |
| Vercel account + project | https://vercel.com | Day 2 (blocks deploy) |
| Cal.com account + Discovery Sprint event type | https://cal.com | Day 2 (blocks booking CTA) |

Full step-by-step for Day 1 infra lives in the [CRUA-40 playbook doc](../../../../CRUA/issues/CRUA-40#document-plan).

## Pages

Bilingual: every route serves `/no/...` (default) and `/en/...`. Bare `/<path>` redirects to the locale-prefixed equivalent.

| Path | Purpose | Status |
|---|---|---|
| `/` | Brief Box demo (the page IS the demo) | shipped on `feat/redesign` |
| `/services` | Tiers, process, results, FAQ, pricing | shipped on `feat/redesign` (replaces `/consulting`, which 301s in) |
| `/contact` | Cal.com iframe + Resend-backed message form | shipped on `feat/redesign` |
| `/api/brief` | POST: brief → Haiku → demo payload | shipped |
| `/api/lead` | POST: lead capture → Notion + Resend + Paperclip webhook | shipped |
| `/api/draft` | GET: enable draft-mode preview for unpublished `/insights` posts | shipped |
| `/insights` | Notion-backed insights hub + article pages | shipped |

## What's deliberately not here yet

- **No trial-flow UI for Back-Office Finance.** Wires into [CRUA-32](../../../../CRUA/issues/CRUA-32) MVP; v2 scope.
- **No interactive demo sandbox.** v2.
- **No analytics platform beyond Vercel Web Analytics.** Revisit if we need funnel analytics.
