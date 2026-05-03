# Crunchtime Rethink — Plan 3: Services + Contact Rebuild

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/[locale]/services` as a long-scroll page (eyebrow, services, process, results, pricing, FAQ, CTA), simplify `/[locale]/contact` to calendar + form, retire `/[locale]/consulting`, and finalize the `/consulting → /services` redirect strategy.

**Architecture:** Two server components with locale-aware translations driven by `next-intl`. Pricing tiers and FAQ content from the legacy `/consulting` page migrate verbatim (with voice cleanup) into the services page. Contact page strips back to a calendar iframe plus the existing Resend-powered form. The brief-handoff callout reads a `from-brief` query param (set by Plan #2) and renders inline above the services list. Visual identity (Syne + DM Sans, lime accent, hover micro-interactions) carries forward from the existing draft and Plan #1's globals.

**Tech Stack:** Next.js 16 (App Router, RSC), `next-intl` v4, Tailwind v4 utility classes via Plan #1's globals, Vitest v3, `@playwright/test` v1.50+, TypeScript 5.6.

**Spec reference:** [docs/superpowers/specs/2026-05-03-crunchtime-rethink-design.md](../specs/2026-05-03-crunchtime-rethink-design.md) — sections "/services page", "/contact page", "What gets removed", "What gets added" (services + contact subset).

---

## File Structure

**New files:**
- `app/[locale]/services/page.tsx` — long-scroll services page (replaces `/consulting`).
- `app/[locale]/services/_components/ServicesHero.tsx` — eyebrow + headline section.
- `app/[locale]/services/_components/ServicesGrid.tsx` — three service cards with hover underline.
- `app/[locale]/services/_components/ProcessSteps.tsx` — four vertical steps with hover-lit numbers.
- `app/[locale]/services/_components/ResultsGrid.tsx` — 2x2 results cards with tag pills + lime numbers.
- `app/[locale]/services/_components/PricingTiers.tsx` — three pricing cards.
- `app/[locale]/services/_components/FaqList.tsx` — expandable FAQ items (uses `<details>`).
- `app/[locale]/services/_components/CtaBanner.tsx` — full-width lime band.
- `app/[locale]/services/_components/BriefHandoffCallout.tsx` — client component, dismissible.
- `tests/e2e/services.spec.ts` — E2E for the services page.
- `tests/e2e/contact.spec.ts` — E2E for the simplified contact page.
- `tests/e2e/redirects.spec.ts` — E2E for the new `/consulting → /services` redirects.
- `tests/unit/briefHandoff.test.ts` — unit test for brief excerpt truncation helper.
- `app/[locale]/services/_lib/briefExcerpt.ts` — pure helper that truncates the `from-brief` param.

**Modified:**
- `messages/no.json` — add `services.*`, `contact.*`, rename `nav.consulting → nav.services`, footer tweaks.
- `messages/en.json` — same shape, English copy.
- `next.config.mjs` — replace `/consulting → /no/consulting` redirect with `/consulting → /no/services` and add per-locale `/[locale]/consulting → /[locale]/services`.
- `app/[locale]/layout.tsx` — change nav link from `/${locale}/consulting` to `/${locale}/services`, change translation key from `nav.consulting` to `nav.services`.
- `app/[locale]/sitemap.ts` — replace `/consulting` with `/services` in PATHS.
- `app/[locale]/contact/page.tsx` — strip down to calendar iframe + form (no cards, no metrics, no marquee), pull copy from translations.
- `app/[locale]/contact/actions.ts` — rewrite redirect targets to use the locale (so success/error pings go back to `/{locale}/contact`). Keep the Resend wiring untouched.

**Removed:**
- `app/[locale]/consulting/` — entire directory deleted (redirect handles old URLs).

---

## Task 1: Add services and contact message keys

**Files:**
- Modify: `messages/no.json`
- Modify: `messages/en.json`

This task rewrites the two catalogs in full. Each one is the seed from Plan #1 with: (a) `nav.consulting` renamed to `nav.services`, (b) `nav.cta` reworded to "Book en prat" / "Book a call", (c) `footer.tagline` reworded, and (d) two new top-level namespaces: `services` and `contact`.

- [ ] **Step 1: Replace `messages/no.json` with the full Norwegian catalog**

Read the current file to confirm it contains only the seed keys from Plan #1. Then replace its entire contents with:

```json
{
  "nav": {
    "home": "Hjem",
    "services": "Tjenester",
    "contact": "Kontakt",
    "cta": "Book en prat"
  },
  "footer": {
    "tagline": "Norsk AI-byrå, basert i Bergen.",
    "rights": "Alle rettigheter forbeholdt"
  },
  "localeToggle": {
    "label": "Språk",
    "no": "NO",
    "en": "EN"
  },
  "services": {
    "meta": {
      "title": "Tjenester",
      "description": "AI-team som faktisk gjør jobben. Tre tjenester, fire steg, fast pris."
    },
    "hero": {
      "eyebrow": "Tjenester",
      "headline": "AI-team som faktisk gjør jobben.",
      "subline": "Vi bygger agenter som tar det repetitive arbeidet ut av kalenderen din. Fast pris, klar i drift på under en måned."
    },
    "servicesGrid": {
      "sectionLabel": "Hva vi gjør",
      "items": {
        "automation": {
          "number": "01",
          "title": "AI-automatisering og agenter",
          "body": "Vi setter opp agenter som kjører i bakgrunnen, snakker med verktøyene dine (Tripletex, Fiken, Shopify, Slack), og gjør jobben uten at noen må løfte en finger."
        },
        "strategy": {
          "number": "02",
          "title": "AI-strategi og rådgivning",
          "body": "Et par workshops, en prioritert liste over hva som faktisk er verdt å automatisere, og en plan du kan jobbe etter. Ingen plansjeshow."
        },
        "implementation": {
          "number": "03",
          "title": "AI-implementering",
          "body": "Vi bygger og setter i drift én konkret arbeidsflyt fra ende til ende. Fast pris, fast scope, og en runbook du eier etter overlevering."
        }
      }
    },
    "process": {
      "sectionLabel": "Slik jobber vi",
      "headline": "Fire steg, ingen overraskelser.",
      "steps": {
        "discovery": {
          "number": "01",
          "title": "Kartlegging",
          "body": "Vi går gjennom prosessene dine, finner det som koker, og scorer hver kandidat på timer spart per måned."
        },
        "strategy": {
          "number": "02",
          "title": "Strategi",
          "body": "Vi velger den ene arbeidsflyten som gir mest tilbake først, og skriver et tydelig scope med akseptkriterier."
        },
        "build": {
          "number": "03",
          "title": "Bygging",
          "body": "Vi bygger agenten i miljøet ditt, kobler den på verktøyene du allerede bruker, og tester mot ekte data."
        },
        "followup": {
          "number": "04",
          "title": "Oppfølging",
          "body": "To uker med tett oppfølging etter lansering. Etter det kan du ta over selv eller la oss drifte videre på retainer."
        }
      }
    },
    "results": {
      "sectionLabel": "Hva kundene sitter igjen med",
      "headline": "Tall fra de første pilotene.",
      "items": {
        "hours": {
          "tag": "Tid spart",
          "number": "23t",
          "label": "per uke",
          "body": "Snittet på tvers av tre piloter, målt mot baseline før agenten kjørte."
        },
        "throughput": {
          "tag": "Volum",
          "number": "3x",
          "label": "flere saker behandlet",
          "body": "Samme team, tre ganger så mange henvendelser løst innen samme dag."
        },
        "errors": {
          "tag": "Kvalitet",
          "number": "62%",
          "label": "færre feil",
          "body": "Færre tastefeil, færre glemte oppgaver, færre purringer fra kunder."
        },
        "speed": {
          "tag": "Tid til drift",
          "number": "18 dager",
          "label": "fra start til live",
          "body": "Median for en pilot. Vi har gjort det på 11, vi har brukt 25, det varierer med scope."
        }
      }
    },
    "pricing": {
      "sectionLabel": "Pris",
      "headline": "Velg den minste døra.",
      "subline": "Tre nivåer. Ingen åpne retainere. Ingen overraskende fakturaer.",
      "tiers": {
        "discovery": {
          "name": "Discovery Sprint",
          "price": "15 000 kr",
          "duration": "1 til 2 uker",
          "pitch": "Kartlegg tre til fem kandidater, score dem på timer spart, gå hjem med en prioritert liste.",
          "detail": "To workshops. Hvis du går videre med en pilot innen 30 dager, krediteres hele Sprint-honoraret.",
          "cta": "Book en prat"
        },
        "pilot": {
          "name": "Implementation Pilot",
          "price": "45 000 til 90 000 kr",
          "duration": "3 til 5 uker",
          "pitch": "Bygg og lanser én produksjonsagent fra ende til ende.",
          "detail": "Du sitter igjen med en agent som kjører i miljøet ditt, en runbook, og to uker med oppfølging. Fast pris, fast scope.",
          "cta": "Book en prat",
          "recommended": true,
          "recommendedLabel": "Mest valgt"
        },
        "retainer": {
          "name": "Agent Ops Retainer",
          "price": "12 000 kr / mnd",
          "duration": "3 mnd minimum",
          "pitch": "Drifting av agentene, nye arbeidsflyter, månedlig optimalisering.",
          "detail": "Tilgjengelig etter en vellykket pilot. Månedlig rapport på hva som kjørte, hva som feilet, hva vi justerte.",
          "cta": "Book en prat"
        }
      }
    },
    "faq": {
      "sectionLabel": "Spørsmål vi får",
      "headline": "Det vi får spørsmål om.",
      "items": {
        "safety": {
          "q": "Er dette trygt? AI hallusinerer.",
          "a": "Hver agent vi sender ut har avgrenset scope, godkjenningssteg på alt som går ut (e-post, fakturaer, betalinger), og full audit-logg. Du godkjenner policyen før agenten går live."
        },
        "messy": {
          "q": "Dataen vår er rotete.",
          "a": "Det er derfor vi starter med en Discovery Sprint. Vi scoper hva som kan gjøres nå mot hva som krever opprydding først, og priser begge deler."
        },
        "waiting": {
          "q": "Vi venter på ChatGPT Enterprise eller Copilot.",
          "a": "Det er chat-assistenter, de svarer når noen åpner dem. Vi installerer arbeidsflyter, agenter som kjører i bakgrunnen som en del av driften."
        },
        "ownership": {
          "q": "Hvem eier agenten etter lansering?",
          "a": "Du. Den kjører på din konto, mot dine verktøy, på din data. Hvis vi går vår vei i morgen, kjører den videre."
        },
        "team": {
          "q": "Hvem bygger faktisk dette?",
          "a": "Et lite norsk team i Bergen, supervisert av en ansvarlig prinsipal. Vi tar et begrenset antall engasjementer per kvartal."
        },
        "languages": {
          "q": "Snakker agenten norsk?",
          "a": "Ja. Vi tester eksplisitt på norske dokumenter, e-poster og kundedata, ikke bare engelske."
        },
        "industries": {
          "q": "Hvilke bransjer passer best?",
          "a": "Vi har levert mest til regnskap, advokat, og e-handel. Felles for dem: mange små repetitive oppgaver med klare regler."
        },
        "starting": {
          "q": "Hva er første steg?",
          "a": "En 30-minutters samtale. Vi spør hva som koker, du forteller, og vi sier ærlig om en agent er riktig form på løsningen."
        }
      }
    },
    "ctaBanner": {
      "headline": "Klar til å sette agenter i jobb?",
      "subline": "30 minutter på telefon. Vi scoper problemet og sier ærlig om dette er riktig vei.",
      "button": "Book en gratis samtale"
    },
    "briefHandoff": {
      "prefix": "Du kom hit fra en brief om",
      "ask": "Vil du heller booke en prat?",
      "cta": "Book",
      "dismiss": "Lukk"
    }
  },
  "contact": {
    "meta": {
      "title": "Kontakt",
      "description": "Book en 30-minutters prat eller send oss en melding."
    },
    "hero": {
      "eyebrow": "Kontakt",
      "headline": "Book en prat eller skriv til oss.",
      "subline": "Pick et tidspunkt under, eller send melding via skjemaet."
    },
    "calendar": {
      "title": "Velg et tidspunkt",
      "fallback": "Hvis kalenderen ikke laster, åpne den direkte."
    },
    "form": {
      "heading": "Foretrekker e-post?",
      "subheading": "Skriv kort hva som koker. Vi svarer fra hello@crunchtime.no innen én arbeidsdag.",
      "name": "Navn",
      "email": "E-post",
      "company": "Firma",
      "message": "Hva vil du ta av planka?",
      "submit": "Send melding",
      "sentHeading": "Mottatt.",
      "sent": "Vi svarer fra hello@crunchtime.no innen én arbeidsdag.",
      "error": "Noe gikk galt. Send oss heller en e-post på hello@crunchtime.no."
    }
  }
}
```

- [ ] **Step 2: Replace `messages/en.json` with the full English catalog**

```json
{
  "nav": {
    "home": "Home",
    "services": "Services",
    "contact": "Contact",
    "cta": "Book a call"
  },
  "footer": {
    "tagline": "Norwegian AI agency, based in Bergen.",
    "rights": "All rights reserved"
  },
  "localeToggle": {
    "label": "Language",
    "no": "NO",
    "en": "EN"
  },
  "services": {
    "meta": {
      "title": "Services",
      "description": "AI teams that actually do the work. Three services, four steps, fixed price."
    },
    "hero": {
      "eyebrow": "Services",
      "headline": "AI teams that actually do the work.",
      "subline": "We build agents that take the repetitive work off your calendar. Fixed price, live in under a month."
    },
    "servicesGrid": {
      "sectionLabel": "What we do",
      "items": {
        "automation": {
          "number": "01",
          "title": "AI automation and agents",
          "body": "We set up agents that run in the background, talk to your tools (Tripletex, Fiken, Shopify, Slack), and do the work without anyone lifting a finger."
        },
        "strategy": {
          "number": "02",
          "title": "AI strategy and advisory",
          "body": "A couple of workshops, a prioritised list of what is actually worth automating, and a plan you can work from. No slide decks."
        },
        "implementation": {
          "number": "03",
          "title": "AI implementation",
          "body": "We build and ship one concrete workflow end to end. Fixed price, fixed scope, and a runbook you own after handover."
        }
      }
    },
    "process": {
      "sectionLabel": "How we work",
      "headline": "Four steps, no surprises.",
      "steps": {
        "discovery": {
          "number": "01",
          "title": "Discovery",
          "body": "We walk through your processes, find what is grinding, and score every candidate on hours saved per month."
        },
        "strategy": {
          "number": "02",
          "title": "Strategy",
          "body": "We pick the one workflow that pays back the most first, and write a clear scope with acceptance criteria."
        },
        "build": {
          "number": "03",
          "title": "Build",
          "body": "We build the agent in your environment, connect it to the tools you already use, and test against real data."
        },
        "followup": {
          "number": "04",
          "title": "Follow-up",
          "body": "Two weeks of close support after launch. After that you can take it over yourself, or we can run it on retainer."
        }
      }
    },
    "results": {
      "sectionLabel": "What clients walk away with",
      "headline": "Numbers from the first pilots.",
      "items": {
        "hours": {
          "tag": "Time saved",
          "number": "23h",
          "label": "per week",
          "body": "Average across three pilots, measured against baseline before the agent ran."
        },
        "throughput": {
          "tag": "Volume",
          "number": "3x",
          "label": "more cases handled",
          "body": "Same team, three times the inbound resolved within the same day."
        },
        "errors": {
          "tag": "Quality",
          "number": "62%",
          "label": "fewer errors",
          "body": "Fewer typos, fewer forgotten tasks, fewer chase emails from clients."
        },
        "speed": {
          "tag": "Time to live",
          "number": "18 days",
          "label": "from kickoff to live",
          "body": "Median for a pilot. We have done it in 11, we have spent 25, it scales with scope."
        }
      }
    },
    "pricing": {
      "sectionLabel": "Pricing",
      "headline": "Pick the smallest door.",
      "subline": "Three tiers. No open retainers. No surprise invoices.",
      "tiers": {
        "discovery": {
          "name": "Discovery Sprint",
          "price": "15,000 NOK",
          "duration": "1 to 2 weeks",
          "pitch": "Map three to five candidate workflows, score them by hours saved, leave with a prioritised roadmap.",
          "detail": "Two workshops. If you go ahead with a pilot within 30 days, the Sprint fee is credited in full.",
          "cta": "Book a call"
        },
        "pilot": {
          "name": "Implementation Pilot",
          "price": "45,000 to 90,000 NOK",
          "duration": "3 to 5 weeks",
          "pitch": "Build and ship one production workflow end to end.",
          "detail": "You walk away with an agent live in your environment, a runbook, and two weeks of post-launch support. Fixed scope, fixed price.",
          "cta": "Book a call",
          "recommended": true,
          "recommendedLabel": "Most picked"
        },
        "retainer": {
          "name": "Agent Ops Retainer",
          "price": "12,000 NOK / month",
          "duration": "3-month minimum",
          "pitch": "Maintain the agents, add new workflows, monthly optimisation review.",
          "detail": "Available after a successful pilot. Monthly report on what ran, what failed, what we tuned.",
          "cta": "Book a call"
        }
      }
    },
    "faq": {
      "sectionLabel": "Questions we get",
      "headline": "What people ask us.",
      "items": {
        "safety": {
          "q": "Is this safe? AI hallucinates.",
          "a": "Every agent we ship has bounded scope, approval gates on anything outbound (emails, invoices, payments), and full audit logs. You sign off on the policy before the agent goes live."
        },
        "messy": {
          "q": "Our data is messy.",
          "a": "That is what the Discovery Sprint is for. We scope what is doable now versus what needs cleanup first, and we price both."
        },
        "waiting": {
          "q": "We are waiting for ChatGPT Enterprise or Copilot.",
          "a": "Those are chat assistants, they answer when someone opens them. We install workflows: agents that run in the background as part of operations."
        },
        "ownership": {
          "q": "Who owns the agent after launch?",
          "a": "You do. It runs on your account, against your tools, on your data. If we walk away tomorrow, it keeps running."
        },
        "team": {
          "q": "Who actually builds this?",
          "a": "A small Norwegian team in Bergen, supervised by an accountable principal. We take a limited number of engagements per quarter."
        },
        "languages": {
          "q": "Does the agent speak Norwegian?",
          "a": "Yes. We explicitly test on Norwegian documents, emails, and customer data, not just English."
        },
        "industries": {
          "q": "Which industries fit best?",
          "a": "Most of our delivery has been in accounting, law, and e-commerce. The common thread: many small repetitive tasks with clear rules."
        },
        "starting": {
          "q": "What is the first step?",
          "a": "A 30-minute call. We ask what is grinding, you tell us, and we say honestly whether an agent is the right shape for the problem."
        }
      }
    },
    "ctaBanner": {
      "headline": "Ready to put agents on the work?",
      "subline": "30 minutes on a call. We scope the problem and tell you honestly whether this is the right path.",
      "button": "Book a free call"
    },
    "briefHandoff": {
      "prefix": "You came here from a brief about",
      "ask": "Want to book a call instead?",
      "cta": "Book",
      "dismiss": "Dismiss"
    }
  },
  "contact": {
    "meta": {
      "title": "Contact",
      "description": "Book a 30-minute call or send us a message."
    },
    "hero": {
      "eyebrow": "Contact",
      "headline": "Book a call or write to us.",
      "subline": "Pick a slot below, or send a message via the form."
    },
    "calendar": {
      "title": "Pick a time",
      "fallback": "If the calendar does not load, open it directly."
    },
    "form": {
      "heading": "Prefer email?",
      "subheading": "Tell us briefly what is grinding. We reply from hello@crunchtime.no within one business day.",
      "name": "Name",
      "email": "Email",
      "company": "Company",
      "message": "What do you want off your plate?",
      "submit": "Send message",
      "sentHeading": "Got it.",
      "sent": "We will reply from hello@crunchtime.no within one business day.",
      "error": "Something went wrong. Please email us at hello@crunchtime.no."
    }
  }
}
```

- [ ] **Step 3: Verify JSON parses**

Run: `node -e "JSON.parse(require('fs').readFileSync('messages/no.json','utf8')); JSON.parse(require('fs').readFileSync('messages/en.json','utf8')); console.log('ok');"`

Expected: prints `ok`. If it errors, fix the trailing comma or escape that broke parsing.

- [ ] **Step 4: Commit**

```bash
git add messages/no.json messages/en.json
git commit -m "feat(i18n): add services + contact message keys, rename consulting -> services"
```

---

## Task 2: Update layout nav + sitemap

**Files:**
- Modify: `app/[locale]/layout.tsx`
- Modify: `app/[locale]/sitemap.ts`

- [ ] **Step 1: Update the nav link in layout**

Open `app/[locale]/layout.tsx`. Find the `<li>` block that links to `/${locale}/consulting`:

```tsx
<li>
  <Link href={`/${locale}/consulting`} className="hover:text-[var(--color-fg)]">
    {t("consulting")}
  </Link>
</li>
```

Replace with:

```tsx
<li>
  <Link href={`/${locale}/services`} className="hover:text-[var(--color-fg)]">
    {t("services")}
  </Link>
</li>
```

- [ ] **Step 2: Update the sitemap PATHS**

Open `app/[locale]/sitemap.ts`. Find:

```ts
const PATHS = ["", "/consulting", "/contact"];
```

Replace with:

```ts
const PATHS = ["", "/services", "/contact"];
```

- [ ] **Step 3: Verify build still typechecks**

Run: `npm run typecheck`

Expected: no errors. Existing `/[locale]/consulting/page.tsx` will still build (we delete it in Task 9), and the nav now points to `/services` which does not exist yet, but Next does not validate `Link` href targets at compile time.

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/layout.tsx app/[locale]/sitemap.ts
git commit -m "feat: point nav and sitemap at /services instead of /consulting"
```

---

## Task 3: Brief excerpt helper + unit test

**Files:**
- Create: `app/[locale]/services/_lib/briefExcerpt.ts`
- Create: `tests/unit/briefHandoff.test.ts`

- [ ] **Step 1: Write the unit test first**

Create `tests/unit/briefHandoff.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { briefExcerpt } from "../../app/[locale]/services/_lib/briefExcerpt";

describe("briefExcerpt", () => {
  it("returns null for empty input", () => {
    expect(briefExcerpt(undefined)).toBeNull();
    expect(briefExcerpt("")).toBeNull();
    expect(briefExcerpt("   ")).toBeNull();
  });

  it("returns the trimmed brief if shorter than max", () => {
    expect(briefExcerpt("  fakturaene er sene  ")).toBe("fakturaene er sene");
  });

  it("truncates long briefs to 80 chars and adds an ellipsis", () => {
    const long = "a".repeat(200);
    const out = briefExcerpt(long)!;
    expect(out.length).toBeLessThanOrEqual(81);
    expect(out.endsWith("…")).toBe(true);
  });

  it("strips control characters but keeps Norwegian letters", () => {
    expect(briefExcerpt("e-post tar over livet ")).toBe("e-post tar over livet");
    expect(briefExcerpt("å ø æ")).toBe("å ø æ");
  });
});
```

- [ ] **Step 2: Run the test, expect failure**

Run: `npm test -- briefHandoff`

Expected: FAIL — module not found.

- [ ] **Step 3: Implement the helper**

Create `app/[locale]/services/_lib/briefExcerpt.ts`:

```ts
const MAX_LEN = 80;

export function briefExcerpt(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const cleaned = raw
    .replace(/[ -]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  if (cleaned.length <= MAX_LEN) return cleaned;
  return cleaned.slice(0, MAX_LEN).trimEnd() + "…";
}
```

- [ ] **Step 4: Run the test, expect pass**

Run: `npm test -- briefHandoff`

Expected: 4 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/services/_lib/briefExcerpt.ts tests/unit/briefHandoff.test.ts
git commit -m "feat(services): add briefExcerpt helper with unit tests"
```

---

## Task 4: Build the services hero, grid, process, results sections

**Files:**
- Create: `app/[locale]/services/_components/ServicesHero.tsx`
- Create: `app/[locale]/services/_components/ServicesGrid.tsx`
- Create: `app/[locale]/services/_components/ProcessSteps.tsx`
- Create: `app/[locale]/services/_components/ResultsGrid.tsx`

- [ ] **Step 1: Create `ServicesHero.tsx`**

```tsx
import { getTranslations } from "next-intl/server";

export async function ServicesHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.hero" });
  return (
    <section className="mx-auto max-w-5xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        {t("headline")}
      </h1>
      <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)] sm:text-xl">
        {t("subline")}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create `ServicesGrid.tsx` with hover lime underline**

```tsx
import { getTranslations } from "next-intl/server";

const KEYS = ["automation", "strategy", "implementation"] as const;

export async function ServicesGrid({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.servicesGrid" });
  return (
    <section className="border-y border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <ul className="mt-12 grid gap-px bg-white/8 sm:grid-cols-3">
          {KEYS.map((key) => (
            <li
              key={key}
              className="group relative bg-[var(--color-surface)] p-8 transition-colors duration-300 hover:bg-[#15150f]"
            >
              <p className="font-mono text-xs text-[var(--color-muted)]">
                {t(`items.${key}.number`)}
              </p>
              <h3 className="font-display mt-6 text-2xl font-bold tracking-tight">
                <span className="relative inline-block">
                  {t(`items.${key}.title`)}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-0 bg-[var(--color-accent)] transition-[width] duration-500 ease-out group-hover:w-full"
                  />
                </span>
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `ProcessSteps.tsx` with hover-lit numbers**

```tsx
import { getTranslations } from "next-intl/server";

const STEPS = ["discovery", "strategy", "build", "followup"] as const;

export async function ProcessSteps({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.process" });
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {t("sectionLabel")}
      </p>
      <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {t("headline")}
      </h2>
      <ol className="mt-14 divide-y divide-white/8 border-y border-white/8">
        {STEPS.map((step) => (
          <li
            key={step}
            className="group grid grid-cols-[auto_1fr] gap-8 py-10 transition-colors duration-300 hover:bg-white/[0.02] sm:grid-cols-[140px_1fr] sm:gap-12 sm:py-14"
          >
            <span className="font-display text-4xl font-extrabold text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-6xl">
              {t(`steps.${step}.number`)}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base sm:leading-7">
                {t(`steps.${step}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

- [ ] **Step 4: Create `ResultsGrid.tsx` (2x2 with tag pills + lime numbers)**

```tsx
import { getTranslations } from "next-intl/server";

const ITEMS = ["hours", "throughput", "errors", "speed"] as const;

export async function ResultsGrid({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.results" });
  return (
    <section className="border-y border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {t("headline")}
        </h2>
        <ul className="mt-12 grid gap-px bg-white/8 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li key={item} className="bg-[var(--color-surface)] p-8 sm:p-10">
              <span className="inline-flex items-center rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t(`items.${item}.tag`)}
              </span>
              <p className="font-display mt-6 text-5xl font-extrabold text-[var(--color-accent)] sm:text-6xl">
                {t(`items.${item}.number`)}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">
                {t(`items.${item}.label`)}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                {t(`items.${item}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/services/_components/
git commit -m "feat(services): add hero, services grid, process, results sections"
```

---

## Task 5: Build pricing tiers, FAQ, CTA banner

**Files:**
- Create: `app/[locale]/services/_components/PricingTiers.tsx`
- Create: `app/[locale]/services/_components/FaqList.tsx`
- Create: `app/[locale]/services/_components/CtaBanner.tsx`

- [ ] **Step 1: Create `PricingTiers.tsx`**

```tsx
import { getTranslations } from "next-intl/server";

const TIERS = ["discovery", "pilot", "retainer"] as const;

export async function PricingTiers({
  locale,
  bookingHref
}: {
  locale: string;
  bookingHref: string;
}) {
  const t = await getTranslations({ locale, namespace: "services.pricing" });
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {t("sectionLabel")}
      </p>
      <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {t("headline")}
      </h2>
      <p className="mt-5 max-w-2xl text-base text-[var(--color-muted)]">{t("subline")}</p>
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const recommended = tier === "pilot";
          return (
            <li
              key={tier}
              className={
                recommended
                  ? "relative flex flex-col rounded-md border border-[var(--color-accent)] bg-[var(--color-surface)] p-7"
                  : "flex flex-col rounded-md border border-white/8 bg-[var(--color-surface)] p-7"
              }
            >
              {recommended ? (
                <span className="absolute -top-3 left-7 rounded-full bg-[var(--color-accent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-black">
                  {t("tiers.pilot.recommendedLabel")}
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold tracking-tight">
                {t(`tiers.${tier}.name`)}
              </h3>
              <p className="font-display mt-5 text-3xl font-extrabold text-[var(--color-accent)]">
                {t(`tiers.${tier}.price`)}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t(`tiers.${tier}.duration`)}
              </p>
              <p className="mt-5 text-sm font-medium leading-6">{t(`tiers.${tier}.pitch`)}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                {t(`tiers.${tier}.detail`)}
              </p>
              <a
                href={bookingHref}
                className={
                  recommended
                    ? "mt-7 inline-block rounded-sm bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
                    : "mt-7 inline-block rounded-sm border border-white/15 px-4 py-3 text-center text-sm font-bold hover:bg-white/5"
                }
              >
                {t(`tiers.${tier}.cta`)}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
```

- [ ] **Step 2: Create `FaqList.tsx`**

```tsx
import { getTranslations } from "next-intl/server";

const ITEMS = [
  "safety",
  "messy",
  "waiting",
  "ownership",
  "team",
  "languages",
  "industries",
  "starting"
] as const;

export async function FaqList({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.faq" });
  return (
    <section className="border-t border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {t("headline")}
        </h2>
        <ul className="mt-12 divide-y divide-white/8 border-y border-white/8">
          {ITEMS.map((item) => (
            <li key={item}>
              <details className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between gap-6 font-display text-base font-bold tracking-tight sm:text-lg">
                  <span>{t(`items.${item}.q`)}</span>
                  <span
                    aria-hidden
                    className="font-mono text-2xl text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                  {t(`items.${item}.a`)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Create `CtaBanner.tsx`**

```tsx
import { getTranslations } from "next-intl/server";

export async function CtaBanner({
  locale,
  bookingHref
}: {
  locale: string;
  bookingHref: string;
}) {
  const t = await getTranslations({ locale, namespace: "services.ctaBanner" });
  return (
    <section className="bg-[var(--color-accent)] text-black">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("headline")}
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-black/80">{t("subline")}</p>
        </div>
        <a
          href={bookingHref}
          className="rounded-sm bg-black px-6 py-4 text-sm font-bold text-[var(--color-accent)] hover:bg-[#1a1a18]"
        >
          {t("button")}
        </a>
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add app/[locale]/services/_components/
git commit -m "feat(services): add pricing tiers, FAQ, CTA banner sections"
```

---

## Task 6: Brief-handoff callout (client component)

**Files:**
- Create: `app/[locale]/services/_components/BriefHandoffCallout.tsx`

- [ ] **Step 1: Create the callout**

```tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function BriefHandoffCallout({
  excerpt,
  bookingHref
}: {
  excerpt: string;
  bookingHref: string;
}) {
  const t = useTranslations("services.briefHandoff");
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside
      role="complementary"
      className="mx-auto mt-4 flex max-w-5xl flex-col gap-4 border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-5 py-4 sm:mx-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
    >
      <div className="text-sm leading-6">
        <span className="text-[var(--color-muted)]">{t("prefix")}</span>{" "}
        <span className="font-medium text-[var(--color-fg)]">&ldquo;{excerpt}&rdquo;</span>.{" "}
        <span className="text-[var(--color-muted)]">{t("ask")}</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={bookingHref}
          className="rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          {t("cta")} →
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("dismiss")}
          className="rounded-sm border border-white/12 px-3 py-2 font-mono text-xs text-[var(--color-muted)] hover:bg-white/5"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[locale]/services/_components/BriefHandoffCallout.tsx
git commit -m "feat(services): add brief-handoff callout client component"
```

---

## Task 7: Compose the services page

**Files:**
- Create: `app/[locale]/services/page.tsx`

- [ ] **Step 1: Write an E2E test first**

Create `tests/e2e/services.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("/no/services page", () => {
  test("renders eyebrow, headline, all section labels", async ({ page }) => {
    await page.goto("/no/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI-team som faktisk gjør jobben/
    );
    await expect(page.getByText("AI-automatisering og agenter")).toBeVisible();
    await expect(page.getByText("Kartlegging")).toBeVisible();
    await expect(page.getByText("Discovery Sprint")).toBeVisible();
    await expect(page.getByText("Det vi får spørsmål om.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Book en gratis samtale/ })).toBeVisible();
  });

  test("FAQ items expand on click", async ({ page }) => {
    await page.goto("/no/services");
    const safetySummary = page.getByText("Er dette trygt? AI hallusinerer.");
    await safetySummary.click();
    await expect(page.getByText(/Hver agent vi sender ut har avgrenset scope/)).toBeVisible();
  });

  test("brief-handoff callout shows when ?from-brief is set", async ({ page }) => {
    await page.goto("/no/services?from-brief=fakturaene%20er%20sene");
    await expect(page.getByText(/Du kom hit fra en brief om/)).toBeVisible();
    await expect(page.getByText(/fakturaene er sene/)).toBeVisible();
  });

  test("brief-handoff callout dismisses", async ({ page }) => {
    await page.goto("/no/services?from-brief=fakturaene%20er%20sene");
    const callout = page.getByRole("complementary");
    await expect(callout).toBeVisible();
    await callout.getByRole("button").click();
    await expect(callout).toBeHidden();
  });

  test("/en/services renders English copy", async ({ page }) => {
    await page.goto("/en/services");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /AI teams that actually do the work/
    );
    await expect(page.getByText("AI automation and agents")).toBeVisible();
    await expect(page.getByText("Discovery Sprint")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm run test:e2e -- --grep "/no/services page"`

Expected: FAIL — `/no/services` returns 404 (page not built yet).

- [ ] **Step 3: Create the page**

Create `app/[locale]/services/page.tsx`:

```tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { ServicesHero } from "./_components/ServicesHero";
import { ServicesGrid } from "./_components/ServicesGrid";
import { ProcessSteps } from "./_components/ProcessSteps";
import { ResultsGrid } from "./_components/ResultsGrid";
import { PricingTiers } from "./_components/PricingTiers";
import { FaqList } from "./_components/FaqList";
import { CtaBanner } from "./_components/CtaBanner";
import { BriefHandoffCallout } from "./_components/BriefHandoffCallout";
import { briefExcerpt } from "./_lib/briefExcerpt";

const BOOKING_FALLBACK =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I8SZIfyI8qMSoX5wo0tY3dlfxajUj0eDlrgpzpN29AcUzDT3EEyQmH9PJpCjZ-Q0-DrtAX5oa?gv=true";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/services`,
      languages: {
        no: "/no/services",
        en: "/en/services",
        "x-default": "/no/services"
      }
    },
    openGraph: { url: `https://crunchtime.no/${locale}/services` }
  };
}

export default async function ServicesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ "from-brief"?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const rawBrief = Array.isArray(sp["from-brief"]) ? sp["from-brief"][0] : sp["from-brief"];
  const excerpt = briefExcerpt(rawBrief);

  const bookingHref =
    process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? BOOKING_FALLBACK;

  return (
    <>
      {excerpt ? (
        <BriefHandoffCallout excerpt={excerpt} bookingHref={`/${locale}/contact`} />
      ) : null}
      <ServicesHero locale={locale} />
      <ServicesGrid locale={locale} />
      <ProcessSteps locale={locale} />
      <ResultsGrid locale={locale} />
      <PricingTiers locale={locale} bookingHref={`/${locale}/contact`} />
      <FaqList locale={locale} />
      <CtaBanner locale={locale} bookingHref={`/${locale}/contact`} />
    </>
  );
}
```

Note: pricing CTAs and CTA banner deep-link to `/[locale]/contact` (where the calendar embed lives), not the raw Google Calendar URL — keeps the visitor in our flow. The `bookingHref` env var is reserved here for components that want to link the calendar directly (currently unused in this page; kept available for future use).

- [ ] **Step 4: Run E2E tests, expect all to pass**

Run: `npm run test:e2e -- --grep "/no/services page"`

Expected: 5 tests pass.

- [ ] **Step 5: Commit**

```bash
git add app/[locale]/services/page.tsx tests/e2e/services.spec.ts
git commit -m "feat(services): compose services page from sections + add E2E coverage"
```

---

## Task 8: Simplify the contact page

**Files:**
- Modify: `app/[locale]/contact/page.tsx`
- Modify: `app/[locale]/contact/actions.ts`

- [ ] **Step 1: Write an E2E test for the simplified contact page**

Create `tests/e2e/contact.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("/no/contact page", () => {
  test("renders calendar iframe and contact form", async ({ page }) => {
    await page.goto("/no/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Book en prat eller skriv til oss/
    );
    const iframe = page.locator("iframe[title='Crunchtime booking calendar']");
    await expect(iframe).toBeVisible();
    await expect(page.getByLabel("Navn")).toBeVisible();
    await expect(page.getByLabel("E-post")).toBeVisible();
    await expect(page.getByLabel("Firma")).toBeVisible();
    await expect(page.getByLabel("Hva vil du ta av planka?")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send melding" })).toBeVisible();
  });

  test("does not render the legacy cards / metrics / marquee", async ({ page }) => {
    await page.goto("/no/contact");
    await expect(page.locator(".accent-panel")).toHaveCount(0);
    await expect(page.getByText("No commitment")).toHaveCount(0);
  });

  test("/en/contact renders English copy", async ({ page }) => {
    await page.goto("/en/contact");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Book a call or write to us/
    );
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send message" })).toBeVisible();
  });

  test("success state shows after ?sent=1", async ({ page }) => {
    await page.goto("/no/contact?sent=1");
    await expect(page.getByText("Mottatt.")).toBeVisible();
    await expect(page.getByText(/innen én arbeidsdag/)).toBeVisible();
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm run test:e2e -- --grep "/no/contact page"`

Expected: FAIL — page still has legacy cards / English copy.

- [ ] **Step 3: Replace `app/[locale]/contact/page.tsx`**

Read the current file first to confirm Plan #1's move landed it here. Then replace its entire contents with:

```tsx
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { submitContact } from "./actions";

const BOOKING_FALLBACK =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I8SZIfyI8qMSoX5wo0tY3dlfxajUj0eDlrgpzpN29AcUzDT3EEyQmH9PJpCjZ-Q0-DrtAX5oa?gv=true";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/contact`,
      languages: {
        no: "/no/contact",
        en: "/en/contact",
        "x-default": "/no/contact"
      }
    },
    openGraph: { url: `https://crunchtime.no/${locale}/contact` }
  };
}

export default async function ContactPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const { sent, error } = await searchParams;
  const tHero = await getTranslations({ locale, namespace: "contact.hero" });
  const tCal = await getTranslations({ locale, namespace: "contact.calendar" });
  const tForm = await getTranslations({ locale, namespace: "contact.form" });

  const bookingLink = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? BOOKING_FALLBACK;

  return (
    <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <section>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {tHero("eyebrow")}
        </p>
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {tHero("headline")}
        </h1>
        <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)]">
          {tHero("subline")}
        </p>
      </section>

      <section className="mt-14">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-bold tracking-tight">{tCal("title")}</h2>
          <a
            href={bookingLink}
            className="font-mono text-xs text-[var(--color-muted)] hover:text-[var(--color-accent)]"
            target="_blank"
            rel="noopener"
          >
            {tCal("fallback")} →
          </a>
        </div>
        <iframe
          title="Crunchtime booking calendar"
          src={bookingLink}
          loading="lazy"
          className="block h-[720px] w-full border border-white/8 bg-white"
        />
      </section>

      <section className="mt-16">
        <h2 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
          {tForm("heading")}
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted)]">
          {tForm("subheading")}
        </p>

        {sent === "1" ? (
          <div className="mt-8 max-w-2xl rounded-sm border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 p-6">
            <p className="font-display text-lg font-bold">{tForm("sentHeading")}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">{tForm("sent")}</p>
          </div>
        ) : (
          <form action={submitContact} className="mt-8 grid max-w-2xl gap-4">
            <input type="hidden" name="locale" value={locale} />
            {error ? (
              <p className="rounded-sm border border-rose-500/30 bg-rose-500/10 p-3 text-sm text-rose-200">
                {tForm("error")}
              </p>
            ) : null}
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">{tForm("name")}</span>
              <input
                required
                name="name"
                autoComplete="name"
                className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">{tForm("email")}</span>
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">{tForm("company")}</span>
              <input
                name="company"
                autoComplete="organization"
                className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-[var(--color-muted)]">{tForm("message")}</span>
              <textarea
                required
                name="message"
                rows={5}
                className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
              />
            </label>
            <button
              type="submit"
              className="mt-2 rounded-sm bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)] sm:justify-self-start"
            >
              {tForm("submit")}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Update `app/[locale]/contact/actions.ts` to honor the locale on redirect**

Replace its entire contents with:

```ts
"use server";

import { redirect } from "next/navigation";

const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "hello@crunchtime.no";
const CONTACT_FROM = process.env.CONTACT_FROM ?? "Crunchtime <noreply@crunchtime.no>";
const ALLOWED_LOCALES = new Set(["no", "en"]);

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const localeRaw = String(formData.get("locale") ?? "no").trim();
  const locale = ALLOWED_LOCALES.has(localeRaw) ? localeRaw : "no";

  if (!name || !email || !message) {
    redirect(`/${locale}/contact?error=1`);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact-form: RESEND_API_KEY not configured, cannot deliver submission");
    redirect(`/${locale}/contact?error=1`);
  }

  const subjectLine = `New contact, ${name}${company ? ` (${company})` : ""}`;

  const body = [
    `From: ${name} <${email}>`,
    company ? `Company: ${company}` : null,
    `Locale: ${locale}`,
    "",
    message
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_INBOX],
      reply_to: email,
      subject: subjectLine,
      text: body
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("contact-form: resend send failed", { status: response.status, text });
    redirect(`/${locale}/contact?error=1`);
  }

  redirect(`/${locale}/contact?sent=1`);
}
```

- [ ] **Step 5: Run E2E tests, expect pass**

Run: `npm run test:e2e -- --grep "/no/contact page"`

Expected: all 4 contact tests pass.

- [ ] **Step 6: Commit**

```bash
git add app/[locale]/contact/page.tsx app/[locale]/contact/actions.ts tests/e2e/contact.spec.ts
git commit -m "feat(contact): simplify to calendar + form, locale-aware redirects"
```

---

## Task 9: Delete the old consulting page

**Files:**
- Remove: `app/[locale]/consulting/`

- [ ] **Step 1: Verify no remaining imports point at the consulting page**

Run:

```bash
grep -rn "/consulting" app/ --include="*.tsx" --include="*.ts"
grep -rn "consulting" messages/ || true
```

Expected: only matches inside `app/[locale]/consulting/page.tsx` itself, and no stray references in `messages/` (Task 1 already removed those). If you find a stray Link or import, fix it before deleting.

- [ ] **Step 2: Delete the consulting directory**

```bash
git rm -r "app/[locale]/consulting"
```

Confirm with `git status` that the deletion is staged.

- [ ] **Step 3: Run typecheck and build**

```bash
npm run typecheck && npm run build
```

Expected: both succeed. The build output should list `/[locale]/services` and `/[locale]/contact` but no `/[locale]/consulting`.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: remove /consulting page (replaced by /services)"
```

---

## Task 10: Replace the consulting redirects in next.config

**Files:**
- Modify: `next.config.mjs`
- Create: `tests/e2e/redirects.spec.ts`

- [ ] **Step 1: Write the redirect tests first**

Create `tests/e2e/redirects.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("consulting -> services redirects", () => {
  test("/consulting redirects to /no/services", async ({ page }) => {
    const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/services$/);
  });

  test("/no/consulting redirects to /no/services", async ({ page }) => {
    const response = await page.goto("/no/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/services$/);
  });

  test("/en/consulting redirects to /en/services", async ({ page }) => {
    const response = await page.goto("/en/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/en\/services$/);
  });

  test("/contact still redirects to /no/contact", async ({ page }) => {
    const response = await page.goto("/contact", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/contact$/);
  });
});
```

- [ ] **Step 2: Run, expect failure on the consulting tests**

Run: `npm run test:e2e -- --grep "consulting -> services"`

Expected: FAIL — current `next.config.mjs` redirects `/consulting → /no/consulting`, which now 404s (Task 9 removed it). And `/no/consulting`, `/en/consulting` are 404s with no redirect.

- [ ] **Step 3: Update `next.config.mjs`**

Read the current file first. Replace the `redirects()` function. The full file should now read:

```js
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return [
      { source: "/consulting", destination: "/no/services", permanent: true },
      {
        source: "/:locale(no|en)/consulting",
        destination: "/:locale/services",
        permanent: true
      },
      { source: "/contact", destination: "/no/contact", permanent: true }
    ];
  }
};

export default withNextIntl(nextConfig);
```

The named-group `:locale(no|en)` matches both Norwegian and English consulting URLs and forwards the path to the same locale's services page.

- [ ] **Step 4: Run tests, expect pass**

Run: `npm run test:e2e -- --grep "consulting -> services"`

Expected: 4 tests pass.

- [ ] **Step 5: Update Plan #1's existing routing test that still asserts `/no/consulting` resolves**

Open `tests/e2e/routing.spec.ts`. Find the two tests:

```ts
test("/no/consulting renders Norwegian consulting page", async ({ page }) => {
  await page.goto("/no/consulting");
  await expect(page).toHaveURL(/\/no\/consulting/);
});

test("/en/consulting renders English consulting page", async ({ page }) => {
  await page.goto("/en/consulting");
  await expect(page).toHaveURL(/\/en\/consulting/);
});
```

Replace both with:

```ts
test("/no/services renders the Norwegian services page", async ({ page }) => {
  await page.goto("/no/services");
  await expect(page).toHaveURL(/\/no\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /AI-team som faktisk gjør jobben/
  );
});

test("/en/services renders the English services page", async ({ page }) => {
  await page.goto("/en/services");
  await expect(page).toHaveURL(/\/en\/services$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    /AI teams that actually do the work/
  );
});
```

Also find the bare `/consulting` redirect test from Plan #1's Task 11:

```ts
test("/consulting (bare) 301-redirects to /no/consulting", async ({ page }) => {
  const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
  expect(response?.url()).toMatch(/\/no\/consulting/);
});
```

Replace with:

```ts
test("/consulting (bare) 301-redirects to /no/services", async ({ page }) => {
  const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
  expect(response?.url()).toMatch(/\/no\/services$/);
});
```

- [ ] **Step 6: Run all routing tests**

Run: `npm run test:e2e -- --grep "routing|consulting -> services"`

Expected: every test passes.

- [ ] **Step 7: Commit**

```bash
git add next.config.mjs tests/e2e/redirects.spec.ts tests/e2e/routing.spec.ts
git commit -m "feat(routing): redirect /consulting (all locales) to /services"
```

---

## Task 11: Verify build, lint, types, all tests

**Files:**
- (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`

Expected: zero errors. Address any new errors surfaced by the new components.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`

Expected: zero errors.

- [ ] **Step 3: Build**

Run: `npm run build`

Expected: build succeeds. Routes listed should include:
- `/[locale]` (placeholder, replaced by Plan #2)
- `/[locale]/services`
- `/[locale]/contact`
- No `/[locale]/consulting`.

- [ ] **Step 4: Run all unit tests**

Run: `npm test`

Expected: all pass, including `briefHandoff.test.ts`.

- [ ] **Step 5: Run full E2E suite**

Run: `npm run test:e2e`

Expected: every test passes — sanity, routing, locale-toggle, services (5), contact (4), redirects (4).

- [ ] **Step 6: Manual smoke check**

Run `npm run dev`. Visit:
- `http://localhost:3000/no/services` — long-scroll page, hero → 3 service cards (hover lime underline) → 4 process steps (hover lime number) → 4 results cards → 3 pricing tiers (Pilot highlighted) → 8 FAQ items → lime CTA banner.
- `http://localhost:3000/no/services?from-brief=fakturaene%20er%20sene` — yellow callout above hero, dismiss button works.
- `http://localhost:3000/no/contact` — H1 + calendar iframe + form (no cards). Submit empty → see error state. Submit with valid fields (mock RESEND_API_KEY or expect graceful error redirect).
- `http://localhost:3000/en/services` — English copy renders.
- `http://localhost:3000/consulting` — 301s to `/no/services`.
- `http://localhost:3000/no/consulting` — 301s to `/no/services`.
- `http://localhost:3000/en/consulting` — 301s to `/en/services`.
- Top nav: "Tjenester / Services" link points at `/services`. Locale toggle still works.

Stop the dev server.

- [ ] **Step 7: Commit any final fixes**

If lint, typecheck, or build surfaced fixes, commit them now:

```bash
git add -A
git commit -m "fix: services + contact plan cleanup"
```

If nothing needed fixing, skip this step.

---

## Self-Review Checklist (run after writing the plan)

**1. Spec coverage** — does the plan implement these spec sections?

- [x] "/services page → 8 sections in order" → Tasks 4, 5, 7
- [x] "Eyebrow + headline (no grid bg, no stats row)" → Task 4 step 1
- [x] "Services: 3 cards in 1px-gap grid, hover lime underline animates from left" → Task 4 step 2
- [x] "Process: 4 vertical steps, hover lights number to lime" → Task 4 step 3
- [x] "Results: 4-card 2x2 grid, tag pill, big lime number, label, body" → Task 4 step 4
- [x] "Pricing tiers: existing /consulting content (Discovery / Pilot / Retainer), lime accent on recommended tier" → Task 5 step 1
- [x] "FAQ: 6-8 expandable items, existing /consulting content" → Task 5 step 2 (8 items)
- [x] "CTA banner: full-width lime band with dark text, single Book button" → Task 5 step 3
- [x] "Footer: same as /" → handled by layout (Plan #1)
- [x] "Brief-handoff callout: small dismissible callout above the services section, shows brief excerpt" → Tasks 3, 6, 7
- [x] "/contact: 2 surfaces stacked — Google Calendar iframe (~720px) + Resend form. No cards, no metrics, no marquee" → Task 8
- [x] "Redirect /consulting → /services (preserves outreach links)" → Task 10
- [x] Voice rules: no em dashes, no banned corpspeak, direct headlines → confirmed in messages/no.json + en.json

**Out of scope for this plan (covered by other plans):**
- Brief Box demo on `/` and `/api/brief` → Plan #2.
- Lead-capture form, `/api/lead`, Notion + Resend ack + Paperclip webhook → Plan #4.
- Home page rewrite → Plan #2.

**2. Placeholder scan**
- No "TBD", "TODO", "implement later", "similar to", "add appropriate error handling" without code.
- Every step that writes code has the full code inline.

**3. Voice scan**
- No em dashes (`—`) or `--` in any user-facing string.
- Banned terms ("leverage", "synergi", "transformere", "skalere ressursene", "neste generasjons", "we're excited") absent from copy.
- Headlines are direct and declarative; FAQ answers are matter-of-fact; CTA verbs are concrete ("Book en prat", "Send melding").

**4. Type / key consistency**
- `nav.consulting` removed; `nav.services` added (Task 1 + Task 2).
- `services.*` namespace exists in both NO and EN with identical key trees.
- `briefExcerpt` exported from `_lib/briefExcerpt.ts`, imported in `services/page.tsx`.
- `BriefHandoffCallout` is a client component (`"use client"`); all section components are server components.

**5. Redirect consistency**
- `/consulting` → `/no/services` (single bare path, default locale).
- `/no/consulting` → `/no/services`, `/en/consulting` → `/en/services` (preserves locale).
- `/contact` → `/no/contact` (unchanged from Plan #1, default locale fallback).

---

## Done Criteria

When all 11 tasks are complete:

- `/[locale]/services` is a single long-scroll page with 7 content sections plus footer, in the spec's exact order.
- Service cards animate a lime underline on hover; process step numbers light up to lime on hover.
- The pricing section carries the three tiers (Discovery Sprint, Implementation Pilot, Agent Ops Retainer) with Pilot highlighted, deep-linking to `/[locale]/contact`.
- The FAQ shows 8 expandable items.
- The CTA banner is a full-width lime band with a single primary button.
- Visiting `/[locale]/services?from-brief=...` shows a dismissible callout above the hero with the truncated brief excerpt.
- `/[locale]/contact` shows only the calendar iframe + Resend form, no cards or metrics.
- Form submissions redirect back to the same locale's contact page (`/no/contact?sent=1` or `/en/contact?sent=1`).
- `/consulting`, `/no/consulting`, `/en/consulting` all 301-redirect to the appropriate `/services` URL.
- The old `app/[locale]/consulting/` directory is deleted.
- Nav and sitemap reference `/services`, not `/consulting`.
- All copy is bilingual (NO + EN) and respects the voice rules.
- All tests pass (unit + E2E); build, lint, typecheck pass.

---

## Next plan

After this lands and is reviewed, Plan #4 (`docs/superpowers/plans/2026-05-03-crunchtime-rethink-4-lead-capture.md`) wires the lead-capture flow: the `/api/lead` route, Notion CRM insert, Resend ack email, and Paperclip research-agent webhook. That plan plugs into the email-capture form rendered by Plan #2's end card, so it should land after Plans #2 and #3 are both merged.
