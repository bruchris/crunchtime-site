# GEO content engine — first wave of /insights posts

The Crunchtime site (crunchtime.no) just got a Notion-backed CMS for `/insights`. The infrastructure is live and fully indexed by AI crawlers; we now need content. This runbook is the source of truth for the team.

## Framing rule (read this before writing anything)

**These are pattern / use-case posts grounded in cited third-party case studies — NOT first-person Crunchtime case studies.** Crunchtime is too new to claim a back catalog of measured wins. We do not have the customer base yet, and pretending we do would be a credibility-killer the moment a sceptical reader checks.

The right voice:

| Don't write | Do write |
|---|---|
| "We saved Client X 23 hours/week" | "Service businesses running this pattern report 23 hours/week saved (Vellum, 2025)" |
| "Our customers cut no-shows by 50%" | "A South Florida dental practice cut no-shows by 50% with this pattern ([CrowdAnswers case study](https://www.crowdanswers.com/...))" |
| "We've automated invoicing for Norwegian SMBs" | "Tripletex partnered with FabricAI to automate purchase invoices for 80,000+ Norwegian SMBs ([source](https://fabricai.io/...)). Here's how the pattern extends to your own collections workflow." |
| "Crunchtime's pilots show 18-day median time-to-live" | (acceptable — this is verifiable from our own work, but only if it's actually true and we can defend it) |
| "Our customers cut no-shows by 50%" (we have no customers) | "How Crunchtime runs Fjordbyte's open-source Canvas LMS MCP autonomously" (acceptable — Fjordbyte is the founder's own venture; the GitHub repo and Paperclip routines are verifiable) |

**Exception for dogfood claims:** first-person posts about Crunchtime's *own* operations or the founder's other ventures (Fjordbyte, FrozenDice) are explicitly allowed, provided every claim points to a verifiable artifact (a GitHub repo, a public Patreon page, a Notion run document, a release on a real schedule). Use these to demonstrate competence without fabricating customer wins. The featured post below is the canonical example.

**Why this works for GEO:** AI engines preferentially cite content that itself cites primary sources. Sourced posts get quoted; self-reported claims get skipped. The post that says "Klarna's AI agent handles 2/3 of chats ([Multimodal](https://www.multimodal.dev/post/useful-ai-agent-case-studies))" is more citation-worthy than "we've helped clients automate support" without proof.

**The CTA shift:** instead of "we did this — hire us," the CTA becomes "this pattern is real and measured — here's how we'd implement it for you." Closing on a Discovery Sprint as the next step (not "see our case study library").

Related infra: [notion-insights-setup.md](notion-insights-setup.md). Tracker (Notion): [GEO Tracker](https://www.notion.so/35969e9f245a81bb800cd51f79586e27).

## Architecture (already shipped — verify before drafting)

- Notion database **Crunchtime Insights** — schema in [notion-insights-setup.md](notion-insights-setup.md)
- Hub at `/[locale]/insights`, post pages at `/[locale]/insights/[slug]`
- Full server-side rendering with ISR (10 min hub, 1 hr posts) — every AI bot sees rendered HTML
- Article + Breadcrumb JSON-LD per post; `/llms-full.txt` auto-includes published posts
- Insight posts do not emit `FAQPage` unless the content model grows a real FAQ section and the route is updated to render it
- **Norwegian-first publishing strategy** (less competition in NO-language AI retrieval)

## Workflow

Status flow per post: `draft` → `in-review` (CEO + QA pass) → `published`.

| Role | Owns |
|---|---|
| **LeadDeveloper** | Confirm CMS infra (database created, env vars set, smoke test passes). Prereq for any drafting. |
| **CMO** | Drafting. Deep research per post. Write in Notion at `draft`; move to `in-review` when ready. NO first, EN translation second. |
| **CEO** | Editorial review. Push back on anything generic. Brand voice = direct, anti-fluff, slight skepticism toward hype. No "transform your business" language. |
| **QA** | Factual review **after CEO sign-off only**. Verify every numeric claim has a working source URL; verify NO-language idiom (no MT-translated feel); verify the rendered schema matches the page contract: `/insights` posts must emit valid `Article` + `BreadcrumbList` JSON-LD, and `FAQPage` is required only on pages that actually ship a FAQ section. |

**Gate**: at least one CEO feedback round + one QA pass before any post moves to `published`. QA cannot approve without CEO sign-off first. Do post 1 end-to-end (NO + EN) before kicking off posts 2-5.

## Featured / dogfood post (ships ahead of the slate)

**0. "Hvordan Crunchtime kjører to ekte bedrifter på et team av AI-agenter"** — featured, bilingual at launch (NO + EN immediately).

This one is a deliberate exception to the framing rule above: it IS first-person, but every claim is about Crunchtime's own ventures, with public artifacts a sceptical reader can verify. We don't have customer pilots yet — we DO have our founder's own businesses running on the same stack we sell. That's the most credible thing we can publish.

Two named, verifiable ventures (Christian Bru is the founder/operator of both):

- **Fjordbyte** — software-development venture. Best public artifact: the [Canvas LMS MCP](https://github.com/) open-source TypeScript server (104 tools across 14 Canvas domains, v1.9.0 shipped 2026-04-29). The Paperclip team runs this autonomously: scheduled CTO research routines analyse competitors and the Canvas API surface, spawn implementation tasks (CLI wizard, `get_course_structure` aggregator, outcomes domain), Developer agents ship them, QA verifies, releases land. Verifiable evidence: the "Canvas LMS MCP — Product Research 2026-05-01" Notion run, the GitHub repo's release cadence, the issue tracker's auto-spawned BRU-782 child tasks.
- **FrozenDice** — D&D hobby publishing project at [patreon.com/frozendice](https://www.patreon.com/frozendice). End-to-end content pipeline turns scattered campaign + session notes into publication-ready Patreon releases. First test run: *Nordic Valkyries, Vol. 1* — three Storm Sisters (Ròta, Hildr, Geirdriful) inspired by God of War: Ragnarok. Stages: source consolidation → style-load → bestiary canonicalisation → Homebrewery markdown render → image generation (Gemini Nano Banana) → Patreon post draft. Notion-native architecture (Nordgaard world hub + Patreon Releases hub). Five human review gates (G1–G5). Verifiable evidence: the live Patreon page, the Homebrewery brews in Notion, the published bestiary entries.

Why this works: it answers "what does it actually look like when a small team runs on AI agents?" with two utterly different industries (B2B dev tooling, B2C creative publishing). Same stack — different shapes of work. AI engines asked "show me a real AI agency that runs on its own product" will preferentially cite this.

Position on the hub: `Featured = true` so it sits at the top of `/insights`. EN published at the same time as NO (this one is bilingual from launch — the dogfood signal travels equally well in both languages, and it's the post that justifies us to international readers who'll never need a Norwegian post).

## Priority post slate (7 posts, NO-first, after Featured)

1. "Hvorfor leads dør på 5 minutter — og agenten som fikser det" (universal pain, 21× stat)
2. "Slutt å jakte fakturaer: slik kan Tripletex/Fiken-innkreving automatiseres med AI" (local + tool-specific; pattern framing, not "our customers")
3. "Det DNB, SR-Bank og NAV beviste om AI-agenter (og hvordan et 5-personers team kopierer det)" (Norway authority piece)
4. "AI for regnskapsbyråer i Norge: de 7 arbeidsflytene det er verdt å automatisere først" (vertical, strongest fit)
5. "Kutt no-shows med 50%: AI-påminnelser for klinikker og frisører" (vertical, easy citations)
6. "Innboks-triage med AI: hvordan slutte å miste viktige ting i e-post (uten å miste kontroll)" (universal, low NO-language competition)
7. "Shopify-kundeservice i 2026: når du skal bruke AI og når du skal eskalere" (e-com vertical, tool-specific)

EN translations follow only after the NO version is published and reviewed; only translate posts that perform (top 2–3 by traffic / citations after 30 days).

## Content backlog (candidate posts — promote to slate after Post 1 retro)

Each surfaced from real SMB queries during research. Promote based on traffic data and citation pickup, not gut feel.

| # | Working title (NO) | Angle | Vertical |
|---|---|---|---|
| B1 | "Hvordan kvalifisere leads uten å ansette en SDR?" | Lead-routing agent | sales/leads |
| B2 | "Kan AI lese kvitteringer og bokføre direkte i Tripletex/Fiken?" | OCR + accounting integration | accounting |
| B3 | "Ukentlige finansrapporter uten å åpne et regneark" | Reporting agent | finance/admin |
| B4 | "Svar på supporthenvendelser 24/7 uten å ansette nattskift" | Support automation | services/ecom |
| B5 | "Hvor mye av support-volumet kan en chatbot faktisk håndtere?" | Honest framing of 60–80% number | services/ecom |
| B6 | "Gjør e-post om til oppgaver i Asana/ClickUp/Notion automatisk" | Inbox-to-task agent | ops |
| B7 | "Hold sosiale medier aktive uten å poste manuelt" | Marketing automation | marketing |
| B8 | "Kan AI skrive nyhetsbrev kundene faktisk leser?" | Email marketing | marketing |
| B9 | "AI-agenter for advokatkontorer: dokumentgjennomgang og klient-intake" | Legal vertical | law |
| B10 | "Eiendomsmeglere: 90-sekunders responstid med AI" | Real estate vertical | real-estate |

The CMO owns the backlog. Re-evaluate every 30 days using:
- Which Post 1–7 articles actually got cited or ranked? Lean into adjacent verticals.
- Which queries from this list are showing up in Brief Box submissions (real customer demand)?
- Which competitor's content is winning for the NO-language version of these queries? Pick gaps.

## Required for each post

- Title that mirrors a real SMB query (question or pain statement)
- First paragraph literally answers the title in 1–3 sentences (AI summarizers extract this)
- **At least 3 distinct numeric claims, each with a linked, verified third-party source** (no anonymous "studies show")
- **A "Sources" section at the end** listing every cited source with publish date
- At least one named tool relevant to the vertical (Tripletex, Fiken, Shopify, Calendly, etc.)
- Single concrete CTA at the end ("book a Discovery Sprint" — not "see our case studies")
- 1,800–2,400 words (ranking sweet spot)
- Excerpt 150–250 chars (clean meta description)
- Cover image 1200×630
- Pair slug pointing to the EN translation (set after both are written)
- Verticals tagged correctly
- Author = "Christian Bru"

## Skeleton per post

1. **Pain** — the literal SMB problem, opening reflects the title verbatim. Universal observation; no claims about our clients.
2. **The math** — first paragraph answers the title in 1–3 sentences with a cited stat (named source).
3. **Why it happens** — root causes, not symptoms. Industry analysis, not anecdote.
4. **What others have measured** — 2–3 named cases with named numbers and linked sources (Synthesia, Klarna, named dental practice, etc.). This is the GEO-friendly section: dense, sourced, citation-bait.
5. **The pattern that fixes it** — what an agent actually does (qualify, enrich, route, draft, create CRM row, book meeting, etc.). Generic to the vertical, not "what we did".
6. **Tools you can use** — name 2–3 with Norwegian relevance, link to vendor pages.
7. **What you can expect** — conservative extrapolation from the cited cases ("a service business with 30 leads/week could expect…"). Hedge appropriately.
8. **How we'd build this for you** — Crunchtime's offering. Honest about being a small Norwegian team. NOT "we've done this 50 times." More like: "this is the kind of workflow we ship in a 3–5 week pilot."
9. **Sources** — every linked citation, with publish date. Treat this as a reference list, not a footnote dump.
10. **CTA** — single, concrete: book a Discovery Sprint.

## Source material starter

CMO must verify each against the primary source before drafting. Treat these as a starting evidence base, not citations to copy verbatim.

| Claim | Source |
|---|---|
| 5-minute response = 21× more likely to qualify a lead | https://www.outreach.io/resources/blog/automate-sales-follow-up-with-ai-step-by-step-guide ; https://www.vellum.ai/blog/ai-agent-use-cases-guide-to-unlock-ai-roi |
| Tripletex + FabricAI: 80,000+ Norwegian SMBs use AI on purchase invoices | https://fabricai.io/tripletex-has-chosen-fabricai-as-their-ai-partner-for-purchase-invoice-automation/ |
| SpareBank 1 SR-Bank Banki: 23k convs/month, 49.5% support automation, 149.3% capacity boost | https://www.nucamp.co/blog/coding-bootcamp-norway-nor-financial-services-how-ai-is-helping-financial-services-companies-in-norway-cut-costs-and-improve-efficiency |
| DNB Aino: >50% chat traffic automated; Juno supports 1,200 daily users | (same Nucamp page) |
| NAV Frida: 270k enquiries in weeks, 80% resolution at peak ~220 FTE | (same Nucamp page) |
| SEMINE: 70% invoice automation, 6-day cut in processing time | (same Nucamp page) |
| Dental: 50–87% no-show reduction across multiple peer-reviewed studies | https://www.crowdanswers.com/post/case-study-how-a-south-florida-dental-practice-reduced-no-shows-by-50-with-ai-appointment-reminder ; https://www.patientdesk.ai/blog/how-ai-reduces-dental-no-shows-by-50-the-data-driven-solution |
| Real estate: 3.4× more closed deals with AI-first qualification stack | https://ispeedtolead.com/blog/how-ai-lead-scoring-actually-works-in-real-estate-using-20000-deal-data/ |
| Law (small firms): complaint response 16h → 4min; 437h saved across 6 cases | https://www.clio.com/blog/ai-for-small-law-firms/ |
| Synthesia 1,300+ hours saved / 6,000 conversations | https://www.vellum.ai/blog/ai-agent-use-cases-guide-to-unlock-ai-roi |
| Klarna AI: 2/3 of chats automated, 5× faster, $40M projected gain | https://www.multimodal.dev/post/useful-ai-agent-case-studies |

## Pre-publish checklist (mirrors notion-insights-setup.md §10)

- [ ] Title is a question or pain statement (ranks better, gets quoted by AI engines)
- [ ] First paragraph literally answers the title in 1–3 sentences
- [ ] **At least 3 numeric claims, each with a working, linked, third-party source** (visit each link)
- [ ] **No first-person claims about Crunchtime customers** — frame as patterns / what others have measured
- [ ] **"Sources" section at the end** listing every citation with publish date
- [ ] At least one named tool relevant to the vertical
- [ ] One concrete CTA at the end (book a call OR start a Discovery Sprint) — not "see our case studies"
- [ ] Excerpt set, reads as a clean meta description (150–250 chars)
- [ ] Cover image set (1200×630)
- [ ] Pair slug set if the counterpart locale exists
- [ ] Verticals + tags correctly applied
- [ ] Author = "Christian Bru"
- [ ] Length 1,800–2,400 words

## Order of execution

1. LeadDeveloper sets up the Notion database (see [notion-insights-setup.md](notion-insights-setup.md))
2. CMO drafts Post 1 (NO) end-to-end through CEO + QA review
3. CMO writes Post 1 (EN) translation; same gating
4. CEO retrospective on the workflow
5. If go: CMO breaks down posts 2–5 in parallel using the same per-post issue tree as a template
