import type { Metadata } from "next";
import { submitContact } from "./actions";

export const metadata: Metadata = {
  title: "Book a call",
  description: "Book a 30-minute call with Crunchtime and map your first AI agent.",
  alternates: {
    canonical: "/contact"
  },
  openGraph: {
    url: "https://crunchtime.no/contact"
  }
};

export default async function ContactPage({
  searchParams
}: {
  searchParams: Promise<{ sent?: string; error?: string; subject?: string }>;
}) {
  const { sent, error, subject } = await searchParams;
  const bookingLink =
    process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? "https://cal.com/crunchtime/discovery-sprint";

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-24">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <section>
          <p className="eyebrow">Book your call</p>
          <h1 className="hero-title mt-5 text-balance">
            Ready to stop doing everything yourself?
          </h1>
          <p className="mt-7 max-w-2xl text-xl font-light leading-8 text-[var(--color-muted)]">
            Book a 30-minute call. We will map out your first AI agent in the session.
          </p>

          <div className="accent-panel mt-10 rounded-md p-6">
            <p className="eyebrow">No commitment</p>
            <p className="mt-3 leading-7 text-[var(--color-muted)]">
              No jargon. Just clarity on what AI can actually do for your business.
            </p>
          </div>
        </section>

        <section className="accent-panel overflow-hidden rounded-md">
          <div className="border-b border-white/8 p-5">
            <h2 className="font-display text-2xl font-extrabold tracking-tight">
              Pick a time that works
            </h2>
            <p className="mt-2 text-sm text-[var(--color-muted)]">
              Cal.com booking opens here when the production link is configured.
            </p>
          </div>
          <iframe
            title="Crunchtime booking calendar"
            src={bookingLink}
            className="h-[680px] w-full bg-white"
          />
        </section>
      </div>

      <section className="mt-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="accent-panel rounded-md p-6">
          <p className="eyebrow">Prefer email?</p>
          <h2 className="font-display mt-4 text-3xl font-extrabold tracking-tight">
            Tell us what you want off your plate.
          </h2>
          <p className="mt-4 leading-7 text-[var(--color-muted)]">
            We reply from{" "}
            <a href="mailto:hello@crunchtime.no" className="text-[var(--color-accent)]">
              hello@crunchtime.no
            </a>
            . Send the business context, the work that keeps repeating, and the tools your team
            already uses.
          </p>
        </div>

        <div className="accent-panel rounded-md p-6">
          {sent === "1" ? (
            <p className="rounded-sm bg-emerald-500/10 p-4 text-sm text-emerald-200">
              Got it. We will reply from hello@crunchtime.no within one business day.
            </p>
          ) : (
            <form action={submitContact} className="grid gap-4">
              {error ? (
                <p className="rounded-sm bg-rose-500/10 p-3 text-sm text-rose-200">
                  Something went wrong sending that. Please email us directly at
                  hello@crunchtime.no.
                </p>
              ) : null}
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-muted)]">Your name</span>
                <input
                  required
                  name="name"
                  autoComplete="name"
                  className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-muted)]">Email</span>
                <input
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-muted)]">Company</span>
                <input
                  name="company"
                  autoComplete="organization"
                  className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-[var(--color-muted)]">What should your first agent do?</span>
                <textarea
                  required
                  name="message"
                  rows={5}
                  defaultValue={
                    subject === "backoffice-trial"
                      ? "I would like to start a Back-Office Finance 14-day trial."
                      : ""
                  }
                  className="rounded-sm border border-white/10 bg-black/30 px-3 py-3 text-sm focus:border-[var(--color-accent)] focus:outline-none"
                />
              </label>
              {subject ? <input type="hidden" name="subject" value={subject} /> : null}
              <button
                type="submit"
                className="mt-2 rounded-sm bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)] sm:justify-self-start"
              >
                Send message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
