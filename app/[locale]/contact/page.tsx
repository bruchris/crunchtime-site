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
