# Crunchtime Site

Customer comms site — MVP landing pages for both GTM plans. Tracked by [CRUA-33](../../README.md).

> Stack: Next.js 16 (App Router) + Tailwind v4 on Vercel Hobby. Domain `crunchtime.no` via Cloudflare DNS. Mail via Zoho Mail Free. Contact form via Resend free tier.

## Local development

```bash
npm install
cp .env.example .env.local  # fill in RESEND_API_KEY + NEXT_PUBLIC_CAL_BOOKING_LINK
npm run dev
```

Dev server on `http://localhost:3000`.

## Deploy (Vercel)

1. `npx vercel link` in this directory (or push to GitHub + connect Vercel project).
2. Set env vars in Vercel project settings:
   - `RESEND_API_KEY` — Resend API key (after verifying `crunchtime.no` in Resend dashboard)
   - `CONTACT_INBOX=hello@crunchtime.no`
   - `CONTACT_FROM=Crunchtime <noreply@crunchtime.no>`
   - `NEXT_PUBLIC_CAL_BOOKING_LINK` — Cal.com link for the Discovery Sprint booking
3. Production deploy: `npx vercel --prod`.
4. In Vercel Project → Settings → Domains: add `crunchtime.no` + `www.crunchtime.no`.
5. Confirm Cloudflare DNS records resolve to Vercel (A `76.76.21.21` + CNAME `www → cname.vercel-dns.com`, both DNS-only / grey cloud).

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

| Path | Day shipped | Status |
|---|---|---|
| `/` | Day 2 (CRUA-41) | scaffold done |
| `/contact` | Day 2 (CRUA-41) | scaffold done |
| `/consulting` | Day 3 (CRUA-42) | placeholder |
| `/back-office/finance` | Day 4 (CRUA-43) | placeholder |
| `/insights` (blog) | v1.1 (week 3–4) | deferred |

## What's deliberately not here yet

- **No `/insights` blog.** Ships in v1.1 (week 3–4) as MDX in repo.
- **No trial-flow UI for Back-Office Finance.** Wires into [CRUA-32](../../../../CRUA/issues/CRUA-32) MVP; v2 scope.
- **No interactive demo sandbox.** v2.
- **No analytics platform beyond Vercel Web Analytics.** Revisit if we need funnel analytics.
