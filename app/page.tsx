import Link from "next/link";

const agents = [
  {
    name: "Sales Rep",
    role: "Pipeline",
    status: "3 tasks running",
    result: "Sent 12 follow-ups today",
    tone: "bg-lime-300"
  },
  {
    name: "Back-Office",
    role: "Finance",
    status: "Reviewing invoices",
    result: "Flagged 2 anomalies",
    tone: "bg-blue-300"
  },
  {
    name: "Copywriter",
    role: "Content",
    status: "Writing blog post",
    result: "Draft ready for review",
    tone: "bg-rose-300"
  },
  {
    name: "Support",
    role: "Customers",
    status: "Active: 5 tickets",
    result: "Resolved 4 today",
    tone: "bg-emerald-300"
  },
  {
    name: "Analyst",
    role: "Reporting",
    status: "Pulling reports",
    result: "Weekly summary ready",
    tone: "bg-amber-300"
  }
];

const tasks = [
  ["done", "Send Q2 proposal to Acme Corp", "done 2 min ago"],
  ["running", "Reconcile March expenses", "in progress"],
  ["done", "Write 3 LinkedIn posts", "done 14 min ago"],
  ["running", "Book meeting with Anna Karenina", "in progress"],
  ["done", "Update CRM with call notes", "done 1 hr ago"],
  ["queued", "Audit subscription renewals", "queued"]
];

const services = [
  ["AI Agent Implementation", "We design, hire, and deploy your custom AI workforce."],
  ["Back-Office Automation", "Invoices, scheduling, data entry, and reporting handled end to end."],
  ["Hosted Agent Teams", "Fully managed agent teams. We run the infrastructure; you keep the results."],
  ["Agent Templates", "Pre-built agent packages for common business needs, ready to deploy."]
];

export default function HomePage() {
  return (
    <div>
      <section className="mx-auto grid min-h-[calc(100svh-73px)] max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.04fr_0.96fr] lg:py-20">
        <div>
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
        </div>

        <div className="accent-panel overflow-hidden rounded-md p-4 shadow-2xl shadow-black/40 sm:p-5">
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <p className="font-display text-sm font-bold">Crunchtime control room</p>
              <p className="text-xs text-[var(--color-muted)]">Live agent activity</p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-lime-300/10 px-3 py-1 text-xs text-[var(--color-accent)]">
              <span className="status-dot h-2 w-2 rounded-full bg-[var(--color-accent)]" />
              running now
            </div>
          </div>
          <div className="mt-4 grid gap-3">
            {agents.slice(0, 4).map((agent) => (
              <article key={agent.name} className="agent-card relative overflow-hidden rounded-sm p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className={`h-9 w-9 shrink-0 rounded-sm ${agent.tone}`} />
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-bold">{agent.name}</h2>
                      <p className="text-xs text-[var(--color-muted)]">{agent.role}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[0.68rem] text-[var(--color-muted)]">
                    {agent.status}
                  </span>
                </div>
                <p className="mt-3 text-sm text-[var(--color-accent)]">{agent.result}</p>
              </article>
            ))}
          </div>
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

      <section id="agents" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="max-w-3xl">
          <p className="eyebrow">Live right now</p>
          <h2 className="section-title mt-4">A business that keeps moving.</h2>
        </div>

        <div className="workflow-grid mt-12">
          <div className="accent-panel rounded-md p-5">
            <p className="eyebrow">Your AI workforce</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Each agent has a role, a tool belt, and a task queue. They pick up work, do it, and
              move on.
            </p>
            <div className="mt-6 grid gap-3">
              {agents.map((agent) => (
                <article key={agent.name} className="agent-card relative overflow-hidden rounded-sm p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className={`h-8 w-8 shrink-0 rounded-sm ${agent.tone}`} />
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-bold">{agent.name}</h3>
                        <p className="truncate text-xs text-[var(--color-muted)]">{agent.status}</p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--color-accent)]">active</span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--color-fg)]">{agent.result}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="accent-panel rounded-md p-5">
            <p className="eyebrow">What they are working on</p>
            <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
              Every task is tracked, updated in real time, and handed off automatically.
            </p>
            <div className="mt-6 overflow-hidden rounded-sm border border-white/8">
              <div className="demo-rail" />
              <div className="grid gap-2 bg-black/20 p-3">
                {tasks.map(([state, title, meta]) => (
                  <div
                    key={title}
                    data-state={state}
                    className="task-row grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-sm px-3 py-3"
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        state === "done"
                          ? "bg-emerald-300"
                          : state === "running"
                            ? "bg-blue-300"
                            : "bg-[var(--color-accent)]"
                      }`}
                    />
                    <span className="truncate text-sm">{title}</span>
                    <span className="text-xs text-[var(--color-muted)]">{meta}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
