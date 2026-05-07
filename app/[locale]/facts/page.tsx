import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { JsonLd, SITE_URL, breadcrumbSchema } from "../../_lib/jsonLd";

// /facts is the AI-friendly identity card for Crunchtime. Provable
// claims only — no aspirational stats. AI engines treat structured,
// dated, named facts pages like Wikipedia infoboxes when grounding
// "tell me about X" answers.

export const revalidate = 86400; // 24h — facts change rarely

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface Fact {
  label: { no: string; en: string };
  value: string;
  href?: string;
}

const FACTS: Fact[] = [
  { label: { no: "Navn", en: "Name" }, value: "Crunchtime" },
  { label: { no: "Type", en: "Type" }, value: "AI consulting / agency" },
  { label: { no: "Grunnlagt", en: "Founded" }, value: "2025" },
  { label: { no: "Hovedkontor", en: "Headquarters" }, value: "Bergen, Norway" },
  { label: { no: "Grunnlegger", en: "Founder" }, value: "Christian Bru" },
  { label: { no: "Områder vi betjener", en: "Areas served" }, value: "Norway, Nordics" },
  { label: { no: "Språk", en: "Languages" }, value: "Norsk (nb-NO), English (en-US)" },
  { label: { no: "Kontakt", en: "Contact" }, value: "hello@crunchtime.no", href: "mailto:hello@crunchtime.no" },
  { label: { no: "Nettsted", en: "Website" }, value: "crunchtime.no", href: "https://crunchtime.no" },
  { label: { no: "Tjenester", en: "Services" }, value: "AI automation, AI strategy, AI implementation", href: "/services" },
  { label: { no: "Pris: Discovery Sprint", en: "Price: Discovery Sprint" }, value: "15,000 NOK (1–2 weeks)" },
  { label: { no: "Pris: Implementation Pilot", en: "Price: Implementation Pilot" }, value: "45,000–90,000 NOK (3–5 weeks)" },
  { label: { no: "Pris: Agent Ops Retainer", en: "Price: Agent Ops Retainer" }, value: "12,000 NOK / month (3-month minimum)" },
  { label: { no: "Verktøy vi integrerer mot", en: "Tools we integrate with" }, value: "Tripletex, Fiken, Shopify, Slack, HubSpot, Pipedrive, Notion, Calendly" },
  { label: { no: "Booking", en: "Booking" }, value: "calendar.google.com/…", href: "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I8SZIfyI8qMSoX5wo0tY3dlfxajUj0eDlrgpzpN29AcUzDT3EEyQmH9PJpCjZ-Q0-DrtAX5oa?gv=true" }
];

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const title = locale === "no" ? "Fakta om Crunchtime" : "Facts about Crunchtime";
  const description =
    locale === "no"
      ? "En kort, kildebelagt oppsummering av Crunchtime som selskap — for både mennesker og AI-søkemotorer."
      : "A short, factual identity card for Crunchtime — provable claims only, intended for both humans and AI search engines.";
  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}/facts`,
      languages: { no: "/no/facts", en: "/en/facts", "x-default": "/no/facts" }
    },
    openGraph: { url: `${SITE_URL}/${locale}/facts`, title, description }
  };
}

export default async function FactsPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = locale === "no" ? noCopy : enCopy;
  const url = `${SITE_URL}/${locale}/facts`;

  // schema.org Dataset — AI engines that surface "facts about X" cards
  // pull structured data from this shape preferentially.
  const dataset = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    "@id": url,
    name: t.title,
    description: t.subline,
    url,
    creator: { "@id": `${SITE_URL}/#organization` },
    inLanguage: locale === "no" ? "nb-NO" : "en-US",
    isAccessibleForFree: true,
    license: "https://creativecommons.org/licenses/by/4.0/",
    keywords: ["Crunchtime", "AI agency", "Norway", "Bergen", "AI agents", "automation"],
    variableMeasured: FACTS.map((f) => ({
      "@type": "PropertyValue",
      name: f.label[locale === "no" ? "no" : "en"],
      value: f.value
    }))
  } as const;

  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: t.title, url }
  ]);

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[dataset, breadcrumbs]} />

      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">{t.eyebrow}</p>
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)]">
          {t.subline}
        </p>
      </header>

      <dl className="mt-16 divide-y divide-white/8 border-y border-white/8">
        {FACTS.map((fact) => (
          <div key={fact.label.en} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-6">
            <dt className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
              {fact.label[locale === "no" ? "no" : "en"]}
            </dt>
            <dd className="text-base sm:col-span-2">
              {fact.href ? (
                <a
                  href={fact.href}
                  className="text-[var(--color-fg)] underline decoration-[var(--color-accent)]/40 underline-offset-4 hover:decoration-[var(--color-accent)]"
                  rel={fact.href.startsWith("http") ? "noopener" : undefined}
                >
                  {fact.value}
                </a>
              ) : (
                fact.value
              )}
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-12 text-sm text-[var(--color-muted)]">
        {t.disclaimer}{" "}
        <Link href={`/${locale}/contact`} className="text-[var(--color-accent)] underline underline-offset-4">
          {t.contact}
        </Link>
        .
      </p>
    </div>
  );
}

const noCopy = {
  eyebrow: "Fakta",
  title: "Fakta om Crunchtime",
  subline:
    "En kort, kildebelagt oppsummering av Crunchtime som selskap. Skrevet for både mennesker og AI-søkemotorer som vil grunne påstander om oss i noe verifiserbart.",
  disclaimer: "Ser noe feil ut, eller mangler noe?",
  contact: "Si fra"
};

const enCopy = {
  eyebrow: "Facts",
  title: "Facts about Crunchtime",
  subline:
    "A short, factual identity card for Crunchtime. Written for both humans and AI search engines that want to ground claims about us in something verifiable.",
  disclaimer: "Spot something wrong or missing?",
  contact: "Let us know"
};
