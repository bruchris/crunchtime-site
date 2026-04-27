import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Back-Office Finance — Kill the Month-End Spiral",
  description:
    "AI agents that reconcile, categorize, and report so you stop burning the last week of every month. From 1,990 NOK/mo. 14-day trial, no credit card.",
  alternates: {
    canonical: "/back-office/finance"
  },
  openGraph: {
    url: "https://crunchtime.no/back-office/finance"
  }
};

type Tier = {
  name: string;
  price: string;
  interval: string;
  invoices: string;
  pitch: string;
  features: string[];
  highlight?: boolean;
};

const tiers: Tier[] = [
  {
    name: "Starter",
    price: "1,990",
    interval: "/mo",
    invoices: "Up to 100 invoices/month",
    pitch:
      "For owners who want evenings and weekends back. Monthly reconciliation, quarterly VAT summary, email support.",
    features: [
      "Invoice intake + categorization",
      "Monthly bank reconciliation",
      "Quarterly MVA/VAT summary",
      "Your accountant gets a read-only dashboard",
      "Email support"
    ]
  },
  {
    name: "Growth",
    price: "4,490",
    interval: "/mo",
    invoices: "Up to 500 invoices/month",
    pitch:
      "For growing teams that need weekly numbers and expense tracking without hiring a second finance person.",
    features: [
      "Everything in Starter",
      "Weekly reconciliation",
      "Monthly P&L dashboard",
      "Expense categorization",
      "Priority support"
    ],
    highlight: true
  },
  {
    name: "Pro",
    price: "9,990",
    interval: "/mo",
    invoices: "Unlimited invoices",
    pitch:
      "For multi-entity businesses that need a dedicated agent supervisor, custom reporting, and Slack integration.",
    features: [
      "Everything in Growth",
      "Multi-entity support",
      "Dedicated agent supervisor",
      "Custom reporting",
      "Slack integration"
    ]
  }
];

const painPoints = [
  {
    stat: "10+ hrs",
    label: "per month",
    body: "The average Norwegian SMB owner spends 10–20 hours a month on bookkeeping they should not be doing."
  },
  {
    stat: "Last week",
    label: "of every month",
    body: "Month-end close eats 3–5 evenings. Receipts pile up, reconciliation drifts, and VAT deadlines loom."
  },
  {
    stat: "300–600 kr",
    label: "per wasted hour",
    body: "That is your effective cost when a founder does data entry instead of sales, product, or hiring."
  }
];

const howItWorks = [
  {
    step: "1",
    title: "Connect your accounting system",
    body: "Tripletex, Fiken, or PowerOffice. We plug into what you already use — no migration, no lock-in."
  },
  {
    step: "2",
    title: "The agent starts working",
    body: "Invoice intake, categorization, reconciliation, and VAT prep happen continuously in the background."
  },
  {
    step: "3",
    title: "Your accountant stays in the loop",
    body: "They get a read-only dashboard view. We do the grunt work; they keep the judgement seat and sign off monthly."
  }
];

const objections = [
  {
    q: "Can I trust AI with my books?",
    a: "Your accountant keeps their read-only view and signs off monthly. We do the grunt work; they keep the judgement seat. Full audit logs on every transaction."
  },
  {
    q: "What if it breaks at year-end?",
    a: "SLA on reconciliation response time, plus a one-week pause/cancel clause in the contract. We have been through year-end close ourselves."
  },
  {
    q: "I already use Fiken / Tripletex.",
    a: "Good — we plug into those. We are not a replacement for your accounting software; we are the operator of that tool so you do not have to be."
  },
  {
    q: "Is this really cheaper than my accountant?",
    a: "We do not replace your accountant. We replace the hours you spend feeding data into the system they review. Most Starter customers recover 10+ hours in month one."
  }
];

const integrations = ["Tripletex", "Fiken", "PowerOffice", "Shopify", "HubSpot", "Slack"];

export default function BackOfficeFinancePage() {
  return (
    <div className="mx-auto max-w-5xl px-6 pb-28 pt-16 sm:pb-20 sm:pt-20">
      <section className="max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-[var(--color-accent)]">
          Back-Office Finance
        </p>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
          Kill the month-end spiral.
        </h1>
        <p className="mt-6 text-lg text-[var(--color-muted)]">
          Our finance agent stack reconciles, categorizes, and reports so your team stops burning
          the last week of every month. Get 10 hours a month of your life back.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/contact?subject=backoffice-trial"
            className="rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
          >
            Start the 14-day trial →
          </Link>
          <a
            href="#pricing"
            className="rounded-md border border-white/10 px-5 py-3 text-sm font-medium hover:bg-white/5"
          >
            See pricing ↓
          </a>
        </div>
        <p className="mt-4 text-xs text-[var(--color-muted)]">
          No credit card required. 14 days, full access.
        </p>
      </section>

      <section className="mt-24 grid gap-6 sm:grid-cols-3">
        {painPoints.map((point) => (
          <article
            key={point.stat}
            className="rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
          >
            <p className="text-3xl font-semibold text-[var(--color-accent)]">{point.stat}</p>
            <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
              {point.label}
            </p>
            <p className="mt-4 text-sm text-[var(--color-muted)]">{point.body}</p>
          </article>
        ))}
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          How it works
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {howItWorks.map((item) => (
            <article
              key={item.step}
              className="rounded-xl border border-white/5 bg-[var(--color-surface)] p-6"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent)]/10 text-sm font-semibold text-[var(--color-accent)]">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-3 text-sm text-[var(--color-muted)]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="pricing" className="mt-24 scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Simple pricing. Cancel anytime.
        </h2>
        <p className="mt-3 max-w-2xl text-[var(--color-muted)]">
          Annual pre-pay saves you two months. Every tier includes your accountant&apos;s read-only
          dashboard view at no extra cost.
        </p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col rounded-xl border p-6 ${
                tier.highlight
                  ? "border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5"
                  : "border-white/5 bg-[var(--color-surface)]"
              }`}
            >
              {tier.highlight && (
                <span className="mb-3 inline-block w-fit rounded-full bg-[var(--color-accent)]/10 px-3 py-1 text-xs font-medium text-[var(--color-accent)]">
                  Most popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{tier.name}</h3>
              <p className="mt-3">
                <span className="text-3xl font-semibold text-[var(--color-accent)]">
                  {tier.price}
                </span>
                <span className="text-sm text-[var(--color-muted)]"> NOK{tier.interval}</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-[var(--color-muted)]">
                {tier.invoices}
              </p>
              <p className="mt-4 text-sm">{tier.pitch}</p>
              <ul className="mt-4 flex-1 space-y-2 text-sm text-[var(--color-muted)]">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <span className="mt-1 block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-accent)]" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/contact?subject=backoffice-trial"
                className={`mt-6 block rounded-md px-4 py-2.5 text-center text-sm font-medium ${
                  tier.highlight
                    ? "bg-[var(--color-accent)] text-black hover:bg-[var(--color-accent-strong)]"
                    : "border border-white/10 hover:bg-white/5"
                }`}
              >
                Start 14-day trial →
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-[var(--color-muted)]">
          One-off onboarding fee: 7,500 NOK (waived on annual plans).
        </p>
      </section>

      <section className="mt-24 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent)]/5 px-6 py-10 sm:px-10">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          First 10 pilot customers: 50% off for 6 months.
        </h2>
        <p className="mt-4 max-w-2xl text-[var(--color-muted)]">
          In exchange for a recorded feedback session every 6 weeks, case-study rights at month 3,
          and a public testimonial at month 6, we give you Starter at half price with onboarding
          waived. Slots are filled as they close.
        </p>
        <Link
          href="/contact?subject=backoffice-trial"
          className="mt-6 inline-block rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
        >
          Claim a pilot slot →
        </Link>
      </section>

      <section className="mt-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Questions, answered
        </h2>
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
            <li key={tool} className="rounded-md border border-white/10 px-3 py-1.5">
              {tool}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-24 max-w-2xl">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Not sure which tier fits?
        </h2>
        <p className="mt-4 text-[var(--color-muted)]">
          Book a 20-minute call. We&apos;ll scope your bookkeeping pain, tell you honestly if the
          Finance bundle makes sense for your setup, and recommend a tier. If it doesn&apos;t fit,
          we&apos;ll say so.
        </p>
        <Link
          href="/contact"
          className="mt-6 inline-block rounded-md bg-[var(--color-accent)] px-5 py-3 text-sm font-medium text-black hover:bg-[var(--color-accent-strong)]"
        >
          Talk to us →
        </Link>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[var(--color-bg)]/95 px-6 py-3 backdrop-blur sm:hidden">
        <Link
          href="/contact?subject=backoffice-trial"
          className="block rounded-md bg-[var(--color-accent)] px-4 py-2.5 text-center text-sm font-medium text-black"
        >
          Start the 14-day trial →
        </Link>
      </div>
    </div>
  );
}
