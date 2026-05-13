import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { JsonLd, SITE_URL, breadcrumbSchema, faqSchema } from "../../_lib/jsonLd";
import { ORDLISTE } from "../../_lib/ordliste";
import { GLOSSARY } from "../../_lib/glossary";

export const revalidate = 86400;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (locale === "no") {
    const title = "AI-ordliste: 30 begreper SMB-eiere bør kjenne";
    const description =
      "En kort, klar ordliste for AI-agenter, agentbaserte systemer, RAG, MCP og 26 andre begreper — på norsk, for SMB-eiere som vurderer AI-automatisering.";
    return {
      title,
      description,
      alternates: { canonical: "/no/ordliste", languages: { no: `${SITE_URL}/no/ordliste`, en: `${SITE_URL}/en/ordliste` } },
      openGraph: { url: `${SITE_URL}/no/ordliste`, title, description }
    };
  }
  const title = "AI Glossary: 30 Terms SMB Owners Should Know";
  const description =
    "A concise, clear glossary for AI agents, agent-based systems, RAG, MCP, and 26 more terms — in plain English, for SMB owners considering AI automation.";
  return {
    title,
    description,
    alternates: { canonical: "/en/ordliste", languages: { en: `${SITE_URL}/en/ordliste`, no: `${SITE_URL}/no/ordliste` } },
    openGraph: { url: `${SITE_URL}/en/ordliste`, title, description }
  };
}

export default async function OrdlistePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const isNo = locale === "no";
  const terms = isNo ? ORDLISTE : GLOSSARY;
  const url = `${SITE_URL}/${locale}/ordliste`;

  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: isNo ? "Ordliste" : "Glossary", url }
  ]);
  const faq = faqSchema(
    terms.map((t) => ({
      q: t.question,
      a: t.definition,
      url: `${url}#${t.slug}`
    }))
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[faq, breadcrumbs]} />

      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {isNo ? "Ordliste" : "Glossary"}
        </p>
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          {isNo
            ? "AI-ordliste på norsk: 30 begreper SMB-eiere bør kjenne"
            : "AI Glossary: 30 Terms SMB Owners Should Know"}
        </h1>
        <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)]">
          {isNo
            ? "AI-agenter, RAG, kontekstvinduer, eskalering, MCP — vi forklarer det vi snakker om i andre artikler. Kort, presist, og uten markedsføringsspråk."
            : "AI agents, RAG, context windows, escalation, MCP — we explain the terms we use across our other articles. Short, precise, and jargon-free."}
        </p>
      </header>

      <nav aria-label={isNo ? "Hopp til begrep" : "Jump to term"} className="mt-12 flex flex-wrap gap-2">
        {terms.map((t) => (
          <a
            key={t.slug}
            href={`#${t.slug}`}
            className="rounded-sm border border-white/10 bg-[var(--color-surface)] px-3 py-1.5 font-mono text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] hover:border-[var(--color-accent)]/50 hover:text-[var(--color-fg)]"
          >
            {t.term}
          </a>
        ))}
      </nav>

      <dl className="mt-16 divide-y divide-white/8 border-y border-white/8">
        {terms.map((t) => (
          <div key={t.slug} id={t.slug} className="py-8">
            <dt>
              <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{t.term}</h2>
              <p className="mt-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t.question}
              </p>
            </dt>
            <dd className="mt-5">
              <p className="text-base leading-7 text-[var(--color-fg)] sm:text-lg sm:leading-8">{t.definition}</p>
              {t.detail ? (
                <p className="mt-4 text-base leading-7 text-[var(--color-muted)]">{t.detail}</p>
              ) : null}
            </dd>
          </div>
        ))}
      </dl>

      <footer className="mt-16 border-t border-white/10 pt-12">
        <p className="font-display text-2xl font-bold tracking-tight">
          {isNo ? "Mangler det et begrep?" : "Missing a term?"}
        </p>
        <p className="mt-3 max-w-xl text-base text-[var(--color-muted)]">
          {isNo
            ? "Si fra hva som mangler — vi oppdaterer ordlisten jevnlig."
            : "Let us know what is missing — we update the glossary regularly."}
        </p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-block rounded-sm bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          {isNo ? "Send oss en melding" : "Send us a message"}
        </Link>
      </footer>
    </div>
  );
}
