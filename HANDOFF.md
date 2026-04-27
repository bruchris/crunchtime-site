# Crunchtime Site Handoff

Last updated: 2026-04-27
Primary issue: `CRUA-33`

## Purpose

This document is the current-state report and working handoff for the Crunchtime landing page project. It is written so Christian can work directly in the site when useful, then hand implementation or cleanup work back to agents quickly.

## Executive Summary

The first goal is a simple public Crunchtime landing page. That goal is close on the code side and blocked mainly on external infrastructure.

What is already true:

- The website codebase exists locally.
- A public Vercel preview exists.
- Core page surfaces have been built.
- Supporting SEO/artifact work like sitemap, robots, and social images has been added.

What is not done yet:

- `crunchtime.no` is not fully wired into the deploy chain.
- Mail and sender deliverability are not complete.
- Production env vars are not fully verified.
- The code now lives in GitHub, but the branded production chain is still incomplete.

## Source of Truth

- Local site workspace:
  - `C:\Users\Chris\.paperclip\instances\default\projects\94dbb427-819a-4ec4-a02e-22fb24589604\aa2b0907-d47d-43b0-8498-60598efc5c75\_default`
- GitHub repo:
  - `https://github.com/bruchris/crunchtime-site`
- Public Vercel preview:
  - `https://crunchtime-site-17w2auklk-bru-broch.vercel.app`
- Paperclip parent issue:
  - `CRUA-33`

## Current Technical State

### Stack

- Next.js 16
- App Router
- Tailwind v4
- Vercel Hobby

### Current implemented app surface

- `/`
- `/contact`
- `/consulting`
- `/back-office/finance`
- custom `404`
- `robots.txt`
- `sitemap.xml`
- OG/Twitter image routes
- contact form server action

### Important files

- `app/layout.tsx`
- `app/page.tsx`
- `app/contact/page.tsx`
- `app/contact/actions.ts`
- `app/consulting/page.tsx`
- `app/back-office/finance/page.tsx`
- `app/globals.css`
- `app/opengraph-image.tsx`
- `app/twitter-image.tsx`
- `app/robots.ts`
- `app/sitemap.ts`

## Issue-by-Issue Status

### `CRUA-33` parent

Status: blocked

Reason:
- Parent is waiting on child issues to fully clear.

### `CRUA-40` Day 1: domain, DNS, Zoho, deliverability

Status: blocked

This is the most important blocker right now.

Needs:
- `crunchtime.no` DNS to be pointed and verified
- Cloudflare DNS
- mailbox provider decision finalized and configured
- SPF / DKIM / DMARC
- `christian@crunchtime.no` mail-tester score >= 9/10

Without this, the site can exist as a preview but not as the real branded public asset.

### Revised mail recommendation

If `bruchris.me` is already on a real **Google Workspace admin** setup, that is now the preferred path over Zoho.

Why:

- central admin instead of splitting email across providers
- enterprise-ready mail stack from day one
- easier long-term user/account management
- cleaner place to host both `christian@crunchtime.no` and `hello@crunchtime.no`

Recommended approach:

- add `crunchtime.no` into the existing Google Workspace tenant as either a **secondary domain** or a **domain alias**
- create the required sender/support addresses there
- point MX to Google instead of Zoho
- then configure SPF, DKIM, and DMARC for Google sending

Fallback:

- if `bruchris.me` is not a Google Workspace admin tenant and is only simple forwarding/consumer mail, then the old Zoho fallback remains viable

### `CRUA-41` Day 2: scaffold, home, contact

Status: blocked

Code exists, but final acceptance depends on:
- real domain
- Resend verification
- live form test
- Lighthouse on branded deploy

### `CRUA-42` Day 3: consulting page

Status: blocked

Code exists, but final acceptance depends on:
- live deploy
- booking flow validation

### `CRUA-43` Day 4: back-office finance page

Status: done

### `CRUA-44` Day 5: OG, sitemap, robots, polish

Status: done

### `CRUA-45` Day 6: final production deploy and handoff

Status: blocked

Blocked on:
- `CRUA-40`
- `CRUA-41`
- `CRUA-42`

## What Matters Most Now

If the goal is "get the first Crunchtime landing page up", the highest-value sequence is:

1. Create a GitHub repo for the site so source is portable.
2. Finish `CRUA-40` so the real domain and email stack exist.
3. Attach the domain to Vercel and verify env vars.
4. Run final smoke tests.
5. Hand the site to marketing/outbound.

The main thing to understand is that the next bottleneck is not design or React code. It is domain/mail/infrastructure.

## GitHub Status

Current state:

- Connected GitHub account in agent tooling: `bruchris`
- GitHub repo exists: `https://github.com/bruchris/crunchtime-site`
- Local site workspace is now a git repo
- Current source is pushed on `main`

Immediate implication:

- Christian can work locally with the repo as the shared source base
- agents can now patch against a real GitHub-backed codebase instead of only the local managed workspace

## What Christian Can Safely Work On Directly

Good self-serve tasks:

- tweak marketing copy
- adjust page structure and section order
- refine CTA language
- edit pricing copy
- edit the visual design in `app/globals.css`
- adjust component markup in page files

Avoid doing manually unless intentional:

- domain/DNS/provider setup without recording exact values
- mail deliverability changes without documenting them
- Vercel env var changes without noting what was added
- moving files around without updating this handoff

## Best Handoff Pattern Back To Agents

When handing off, comment with:

1. the exact page or file you changed
2. what outcome you want
3. whether this is design, copy, functionality, or deployment
4. whether you changed anything in Vercel, DNS, Zoho, Resend, or Cal.com

Example:

`I updated app/page.tsx and want the hero tightened, CTA clearer, and mobile spacing cleaned up. Do not change the core offer.`

That is enough for a fast follow-up.

## Environment / Provider Checklist

### Domain / DNS

- registrar owns `crunchtime.no`
- Cloudflare active
- Vercel records in place

### Mail

- preferred: Google Workspace tenant handles `crunchtime.no`
- fallback: Zoho tenant created
- `christian@crunchtime.no`
- `hello@crunchtime.no`
- forwarding configured if needed

### Deliverability

- SPF valid
- DKIM valid
- DMARC valid
- mail-tester >= 9/10

### Site runtime

- `RESEND_API_KEY`
- `CONTACT_INBOX`
- `CONTACT_FROM`
- `NEXT_PUBLIC_CAL_BOOKING_LINK`

## Other Technical Artifacts In The Org

The website is not the only code artifact in the org.

Currently visible package-based codebases are:

1. `crunchtime-site`
   - customer-facing site
   - directly relevant to the current landing-page goal

2. `paperclip-payment-rail`
   - Stripe test-mode payment/billing implementation
   - separate from the site

3. `@paperclip/marketplace-template-validator`
   - template schema/validator tooling
   - unrelated to the immediate landing-page launch

For the immediate business goal, only `crunchtime-site` needs active attention.

## Recommended Next Steps

### Immediate

1. Decide whether `bruchris.me` is a real Google Workspace admin tenant and, if yes, use it for `crunchtime.no`
2. Finish `CRUA-40`
3. Post DNS/mail/provider progress in Paperclip comments

### Then

1. Agent completes branded deploy hookup
2. Agent validates forms + booking + SEO artifacts
3. Agent closes the website chain and hands off to CMO

## Notion Note

This report should also live in the Crunchtime Notion teamspace. In the current agent environment, there is no Notion write connector available, so this file and the mirrored Paperclip issue document are the durable copies until Notion access is added.
