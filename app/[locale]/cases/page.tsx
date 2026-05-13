import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import {
  JsonLd,
  SITE_URL,
  breadcrumbSchema,
  collectionPageSchema
} from "../../_lib/jsonLd";

const CASE_KEYS = ["website", "ops", "dev", "intelligence"] as const;

export const revalidate = 3600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cases.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/cases`,
      languages: {
        no: "/no/cases",
        en: "/en/cases",
        "x-default": "/no/cases"
      }
    },
    openGraph: { url: `${SITE_URL}/${locale}/cases`, title: t("title"), description: t("description") }
  };
}

export default async function CasesPage({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const tHero = await getTranslations({ locale, namespace: "cases.hero" });
  const tGrid = await getTranslations({ locale, namespace: "cases.grid" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const url = `${SITE_URL}/${locale}/cases`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: tNav("cases"), url }
  ]);
  const collection = collectionPageSchema({
    url,
    name: tHero("headline"),
    description: tHero("subline"),
    inLanguage: locale === "no" ? "nb-NO" : "en-US"
  });

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[collection, breadcrumbs]} />

      <nav aria-label="Breadcrumb" className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <Link href={`/${locale}`} className="hover:text-[var(--color-fg)]">
          Crunchtime
        </Link>
        <span className="px-2">/</span>
        <span className="text-[var(--color-fg)]">{tNav("cases")}</span>
      </nav>

      <header className="mt-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {tHero("eyebrow")}
        </p>
        <h1 className="font-display mt-6 max-w-4xl text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {tHero("headline")}
        </h1>
        <p className="mt-7 max-w-3xl text-lg font-light leading-8 text-[var(--color-muted)] sm:text-xl">
          {tHero("subline")}
        </p>
      </header>

      <section className="mt-16 sm:mt-20">
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {tGrid("sectionLabel")}
        </p>
        <div className="mt-5 max-w-3xl">
          <h2 className="font-display text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
            {tGrid("headline")}
          </h2>
          <p className="mt-5 text-base leading-7 text-[var(--color-muted)] sm:text-lg">
            {tGrid("subline")}
          </p>
        </div>

        <ul className="mt-10 grid gap-px bg-white/8 lg:grid-cols-2">
          {CASE_KEYS.map((key) => {
            const tags = tGrid.raw(`cards.${key}.tags`) as string[];
            return (
              <li key={key} className="bg-[var(--color-surface)]">
                <article className="flex h-full flex-col p-8 sm:p-10">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-white/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-muted)]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="font-display mt-6 text-balance text-2xl font-extrabold tracking-tight sm:text-3xl">
                    {tGrid(`cards.${key}.title`)}
                  </h3>
                  <p className="mt-5 flex-1 text-base leading-7 text-[var(--color-muted)]">
                    {tGrid(`cards.${key}.summary`)}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
