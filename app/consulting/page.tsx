import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Agent Consulting for Norwegian SMBs",
  description:
    "Install an autonomous AI agent in under a month. Fixed-price engagements from 15,000 NOK. For Norwegian SMBs in law, accounting, and e-commerce.",
  alternates: {
    canonical: "/consulting"
  },
  openGraph: {
    url: "https://crunchtime.no/consulting"
  }
};

const FIT_CALL_FALLBACK = "https://cal.com/crunchtime/fit-call";
const EMBED_HEIGHT_PX = 720;

type Tier = {
  name: string;
  price: string;
  duration: string;
  pitch: string;
  detail: string;
};

const tiers: Tier[] = [
  {
    name: "AI Discovery Sprint",
    price: "15,000 NOK",
    duration: "1–2 weeks",
    pitch: "Map three to five candidate workflows, score them by hours saved, leave with a prioritised roadmap.",
    detail:
      "Two workshops. If you go ahead with an Implementation Pilot within 30 days, the Sprint fee is credited in full."
  },
  {
    name: "Implementation Pilot",
    price: "45,000–90,000 NOK",
    duration: "3–5 weeks",
    pitch: "Build and deploy one production workflow end-to-end.",
    detail:
      "You leave with a live agent running in your environment, a runbook, and two weeks of post-launch support. Fixed scope, fixed price."
  },
  {
    name: "Agent Ops Retainer",
    price: "12,000 NOK / month",
    duration: "3-month minimum",
    pitch: "Maintain the agents, add new workflows, monthly optimisation review.",
    detail: "Available after a successful Pilot. Monthly report on what ran, what failed, and what we tuned."
  }
];

const examples = [
  {
    title: "Law firm intake agent",
    body:
      "Receives client enquiries, runs conflict-of-interest checks against your matter history, drafts scoping responses for partner review. Replaces 8–15 partner hours per month."
  },
  {
    title: "E-commerce support agent",
    body:
      "Handles tier-1 ticket volume end-to-end — order lookups, returns status, sizing questions — and escalates on refunds or complaints. Replaces 30–60 VA hours per month."
  },
  {
    title: "Accounting reconciliation agent",
    body:
      "Pulls invoices from client Tripletex or Fiken, books against the chart of accounts, queues exceptions for your review. Replaces 20+ hours per month per junior."
  }
];

const pillars = [
  {
    title: "Fixed scope, fixed price.",
    body:
      "You don't pay for experimentation; we do. If a pilot needs a second iteration to hit the acceptance criteria, we absorb it."
  },
  {
    title: "We operate an agent team ourselves.",
    body:
      "The playbook we install in your business is the same one we use internally. It is battle-tested, not theoretical."
  },
  {
    title: "You own the configuration.",
    body:
      "The agent runs in your tenant, on your tools, against your data. If we walk away, it keeps running."
  }
];

const objections = [
  {
    q: "Is this safe? AI hallucinates.",
    a: "Every agent we ship has bounded scope, approval gates on anything external (invoices sent, emails out), and full audit logs. You sign off on the approval policy before the agent goes live."
  },
  {
    q: "Our data is messy.",
    a: "That's what the Discovery Sprint is for. We scope what is doable now vs. what is doable after cleanup, and we price both."
  },
  {
    q: "We're waiting for ChatGPT Enterprise / Copilot.",
    a: "Those are chat assistants — they answer questions when you open them. We install workflows: agents that run unattended, in the background, as part of your operations."
  }
];

const integrations = ["Paperclip", "OpenClaw", "Tripletex", "Fiken", "Shopify", "HubSpot", "Slack"];

export default function ConsultingPage() {
  const fitCallLink =
    process.env.NEXT_PUBLIC_CAL_FIT_CALL_LINK ??
    process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ??
    FIT_CALL_FALLBACK;
  const embedSrc = fitCallLink.includes("?")
    ? `${fitCallLink}&embed=true`
    : `${fitCallLink}?embed=true`;

  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-16 sm:pb-20 sm:pt-20">
      <section className="max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Consulting
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Install autonomous AI agents into your back office in under a month — fixed price,
          measurable hours saved.
        </h1>
        <p className="mt-6 text-lg text-[var(--color-muted)]">
          We're a Norwegian agent team running on Paperclip. We take one narrow workflow in your
          business, automate it end-to-end, and hand you a working agent you own. No open-ended
          retainers. No &ldquo;AI strategy&rdquo; slides.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <a
            href={fitCallLink}
            className="rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
          >
            Book a 15-min fit call →
          </a>
          <a
            href="#tiers"
            className="rounded-md border border-white/10 px-5 py-3 text-sm font-medium hover:bg-white/5"
          >
            See the engagement ladder ↓
          </a>
        </div>
      </section>

      <section id="tiers" className="mt-24 scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Pick the smallest door.</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className="flex flex-col rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
            >
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-3 text-2xl font-semibold text-[var(--color-accent)]">{tier.price}</p>
              <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                {tier.duration}
              </p>
              <p className="mt-4 text-sm">{tier.pitch}</p>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{tier.detail}</p>
            </article>
          ))}
        </div>
        <div className="mt-8">
          <a
            href={fitCallLink}
            className="inline-block rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
          >
            Book a 15-min fit call →
          </a>
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">What we actually build</h2>
        <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
          Three illustrative examples, one per segment. We'll rotate real customer stories into
          these slots after the first pilot ships.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {examples.map((ex) => (
            <article
              key={ex.title}
              className="rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
            >
              <h3 className="text-lg font-semibold">{ex.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{ex.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Why this, not &ldquo;AI strategy consulting&rdquo;
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
            >
              <h3 className="text-base font-semibold">{pillar.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{pillar.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Objections, answered</h2>
        <dl className="mt-8 space-y-6">
          {objections.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
            >
              <dt className="text-base font-semibold">{item.q}</dt>
              <dd className="mt-3 text-sm text-[var(--color-muted)]">{item.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="mt-24 rounded-xl border border-white/5 bg-[var(--color-surface)] px-6 py-10 sm:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
          Tools we integrate with
        </p>
        <ul className="mt-4 flex flex-wrap gap-3 text-sm text-[var(--color-muted)]">
          {integrations.map((tool) => (
            <li
              key={tool}
              className="rounded-md border border-white/10 px-3 py-1.5"
            >
              {tool}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-6 py-10 sm:px-10">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          First three pilots at 30% off.
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          We're looking for three foundation clients. In exchange for a documented case study and a
          reference call, we discount the Implementation Pilot by 30%. Slots are filled as they
          close. If you want to be one of them, book the fit call and mention &ldquo;foundation&rdquo;.
        </p>
        <a
          href={fitCallLink}
          className="mt-6 inline-block rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
        >
          Book a 15-min fit call →
        </a>
      </section>

      <section className="mt-24 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Who we are</h2>
        <p className="mt-4 text-[var(--color-muted)]">
          We're a Norwegian agent team running on Paperclip. Our operators are AI agents supervised
          by a human principal. We take a small number of consulting engagements per quarter
          alongside building our own AI products. Headquartered in Oslo.
        </p>
      </section>

      <section id="book" className="mt-24 scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">Book the fit call</h2>
        <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
          15 minutes. We'll scope your problem and tell you honestly if an agent system is the right
          shape. If the embed below doesn't load,{" "}
          <a href={fitCallLink} className="text-[var(--color-accent)] hover:underline">
            open the calendar directly
          </a>
          .
        </p>
        <div className="mt-8 overflow-hidden rounded-xl border border-white/5 bg-[var(--color-surface)]">
          <iframe
            title="Book a 15-minute fit call with Crunchtime"
            src={embedSrc}
            loading="lazy"
            className="block h-[720px] w-full border-0"
            style={{ height: `${EMBED_HEIGHT_PX}px` }}
          />
        </div>
        <p className="mt-6 text-sm text-[var(--color-muted)]">
          Prefer email? Send a note via{" "}
          <Link href="/contact" className="text-[var(--color-accent)] hover:underline">
            /contact
          </Link>{" "}
          or write to{" "}
          <a
            href="mailto:hello@crunchtime.no"
            className="text-[var(--color-accent)] hover:underline"
          >
            hello@crunchtime.no
          </a>
          .
        </p>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[var(--color-bg)]/95 px-6 py-3 backdrop-blur sm:hidden">
        <a
          href={fitCallLink}
          className="block rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-medium text-black"
        >
          Book a 15-min fit call →
        </a>
      </div>
    </div>
  );
}
