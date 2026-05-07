import type { Metadata } from "next";
import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound, redirect } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { JsonLd, SITE_URL, breadcrumbSchema, faqSchema } from "../../_lib/jsonLd";
import { ORDLISTE } from "../../_lib/ordliste";

// Norsk AI-ordliste. EN-only readers redirect to home — for now we only
// publish this in Norwegian, where competition is sparse.

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
  if (locale !== "no") return {};
  const title = "AI-ordliste: 30 begreper SMB-eiere bør kjenne";
  const description =
    "En kort, klar ordliste for AI-agenter, agentbaserte systemer, RAG, MCP og 26 andre begreper — på norsk, for SMB-eiere som vurderer AI-automatisering.";
  return {
    title,
    description,
    alternates: { canonical: "/no/ordliste" },
    openGraph: { url: `${SITE_URL}/no/ordliste`, title, description }
  };
}

export default async function OrdlistePage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  // Foreløpig kun norsk versjon. EN-besøkende sendes til hjem.
  if (locale !== "no") redirect("/en");
  setRequestLocale(locale);

  const url = `${SITE_URL}/no/ordliste`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/no` },
    { name: "Ordliste", url }
  ]);
  const faq = faqSchema(
    ORDLISTE.map((t) => ({
      q: t.question,
      a: t.definition,
      url: `${url}#${t.slug}`
    }))
  );

  return (
    <div className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[faq, breadcrumbs]} />

      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">Ordliste</p>
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          AI-ordliste på norsk: 30 begreper SMB-eiere bør kjenne
        </h1>
        <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)]">
          AI-agenter, RAG, kontekstvinduer, eskalering, MCP — vi forklarer det vi snakker om i andre artikler. Kort,
          presist, og uten markedsføringsspråk.
        </p>
      </header>

      <nav aria-label="Hopp til begrep" className="mt-12 flex flex-wrap gap-2">
        {ORDLISTE.map((t) => (
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
        {ORDLISTE.map((t) => (
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
        <p className="font-display text-2xl font-bold tracking-tight">Mangler det et begrep?</p>
        <p className="mt-3 max-w-xl text-base text-[var(--color-muted)]">
          Si fra hva som mangler — vi oppdaterer ordlisten jevnlig.
        </p>
        <Link
          href="/no/contact"
          className="mt-6 inline-block rounded-sm bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          Send oss en melding
        </Link>
      </footer>
    </div>
  );
}
