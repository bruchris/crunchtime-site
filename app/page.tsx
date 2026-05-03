import Link from "next/link";
import { Newsroom } from "./_components/Newsroom";

const services = [
  ["AI Agent Implementation", "We design, hire, and deploy your custom AI workforce."],
  ["Back-Office Automation", "Invoices, scheduling, data entry, and reporting handled end to end."],
  ["Hosted Agent Teams", "Fully managed agent teams. We run the infrastructure; you keep the results."],
  ["Agent Templates", "Pre-built agent packages for common business needs, ready to deploy."]
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto flex min-h-[calc(100svh-73px)] max-w-5xl flex-col justify-center px-5 py-16 sm:px-8 lg:py-20">
        <p className="eyebrow">Norwegian AI agency · Bergen</p>
        <h1 className="hero-title mt-5">
          Your <span className="text-[var(--color-accent)]">AI team</span>, hired and running by
          tomorrow.
        </h1>
        <p className="mt-8 max-w-2xl text-xl font-light leading-8 text-[var(--color-muted)] sm:text-2xl sm:leading-9">
          Crunchtime builds and manages teams of AI agents for your business - agents that work
          in Slack, your inbox, your calendar, your tools. We run them 24/7.
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="#agents"
            className="rounded-sm bg-[var(--color-accent)] px-6 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
          >
            See it live
          </Link>
          <Link
            href="/contact"
            className="rounded-sm border border-white/15 px-6 py-3 text-sm font-bold hover:border-white/35 hover:bg-white/5"
          >
            Book a call
          </Link>
        </div>
      </section>

      <div className="overflow-hidden border-y border-white/8 bg-[var(--color-surface)] py-4">
        <div className="flex w-max animate-[marquee_24s_linear_infinite] gap-12 whitespace-nowrap px-5 text-xs font-bold uppercase tracking-[0.16em] text-[var(--color-muted)]">
          <span>AI agent implementation</span>
          <span>Back-office automation</span>
          <span>Hosted agent teams</span>
          <span>Live activity dashboards</span>
          <span>24/7 task execution</span>
          <span>AI agent implementation</span>
          <span>Back-office automation</span>
          <span>Hosted agent teams</span>
        </div>
      </div>

      <Newsroom />

      <section id="how-it-works" className="border-y border-white/8 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <p className="eyebrow">How Crunchtime works</p>
          <div className="mt-8 grid gap-px overflow-hidden rounded-md border border-white/8 bg-[var(--color-line)] lg:grid-cols-3">
            {[
              [
                "01",
                "Tell us what you need",
                "You describe your business: what you sell, where you are losing time, what you wish someone could just handle. We map it."
              ],
              [
                "02",
                "We hire and configure your AI team",
                "We set up your agent team: sales, back-office, support - each with the skills, tools, and permissions to do your work."
              ],
              [
                "03",
                "They work. You watch.",
                "Your agents run around the clock. You get a live dashboard, Slack updates, and weekly reports on what got shipped."
              ]
            ].map(([num, title, body]) => (
              <article key={num} className="bg-[var(--color-surface)] p-8">
                <p className="font-display text-5xl font-extrabold text-[var(--color-accent)]">
                  {num}
                </p>
                <h3 className="font-display mt-8 text-2xl font-bold tracking-tight">{title}</h3>
                <p className="mt-4 leading-7 text-[var(--color-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24 pt-24 sm:px-8">
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            ["3 hrs", "Average daily time reclaimed per business"],
            ["24/7", "Agents work while you sleep"],
            ["< 48 hrs", "Time from kickoff to first agent live"],
            ["100%", "Tasks tracked, nothing falls through the cracks"]
          ].map(([value, label]) => (
            <div key={value} className="accent-panel rounded-md p-6">
              <p className="font-display text-4xl font-extrabold text-[var(--color-accent)]">
                {value}
              </p>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-white/8 bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
          <p className="eyebrow">What we build for you</p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-white/8 bg-[var(--color-line)] sm:grid-cols-2 lg:grid-cols-4">
            {services.map(([title, body]) => (
              <article key={title} className="bg-[var(--color-surface)] p-6">
                <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">{body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
        <h2 className="section-title">Ready to stop doing everything yourself?</h2>
        <p className="mx-auto mt-6 max-w-2xl text-xl font-light leading-8 text-[var(--color-muted)]">
          Book a 30-minute call. We will map out your first AI agent in the session.
        </p>
        <Link
          href="/contact"
          className="mt-9 inline-block rounded-sm bg-[var(--color-accent)] px-7 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          Book your call
        </Link>
        <p className="mt-4 text-sm text-[var(--color-muted)]">
          No commitment. No jargon. Just clarity on what AI can actually do for your business.
        </p>
      </section>
    </div>
  );
}
