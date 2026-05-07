import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../../i18n/routing";
import {
  JsonLd,
  SITE_URL,
  articleSchema,
  breadcrumbSchema
} from "../../../_lib/jsonLd";
import { getInsightBySlug } from "../../../_lib/insights/notionClient";
import { BlockRenderer } from "../../../_lib/insights/blockRenderer";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = await safeGet(slug, locale);
  if (!post) return { title: "Insight" };

  const url = `${SITE_URL}/${locale}/insights/${slug}`;
  const languages: Record<string, string> = { [locale]: `/${locale}/insights/${slug}` };
  if (post.pairSlug) {
    const otherLocale = locale === "no" ? "en" : "no";
    languages[otherLocale] = `/${otherLocale}/insights/${post.pairSlug}`;
  }

  return {
    title: post.title,
    description: post.excerpt || post.subtitle,
    alternates: { canonical: `/${locale}/insights/${slug}`, languages },
    openGraph: {
      url,
      title: post.title,
      description: post.excerpt || post.subtitle,
      type: "article",
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      images: post.cover ? [{ url: post.cover }] : undefined,
      tags: [...post.verticals, ...post.tags]
    },
    keywords: [...post.verticals, ...post.tags]
  };
}

export default async function InsightPost({
  params
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const post = await safeGet(slug, locale as Locale);
  if (!post) notFound();

  const tNav = await getTranslations({ locale, namespace: "nav" });
  const tCta = await getTranslations({ locale, namespace: "insights.cta" });

  const url = `${SITE_URL}/${locale}/insights/${slug}`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: tNav("insights"), url: `${SITE_URL}/${locale}/insights` },
    { name: post.title, url }
  ]);

  const article = articleSchema({
    url,
    headline: post.title,
    description: post.excerpt || post.subtitle,
    datePublished: post.publishedAt ?? post.updatedAt,
    dateModified: post.updatedAt,
    author: post.author,
    image: post.cover,
    about: post.verticals,
    mentions: post.tags,
    inLanguage: locale === "no" ? "nb-NO" : "en-US",
    citations: post.sources.map((s) => ({
      url: s.url,
      name: s.name,
      datePublished: s.datePublished ?? undefined
    }))
  });

  const date = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <article className="mx-auto max-w-3xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[article, breadcrumbs]} />

      <nav aria-label="breadcrumb" className="mb-12 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
        <Link href={`/${locale}/insights`} className="hover:text-[var(--color-accent)]">
          ← {tNav("insights")}
        </Link>
      </nav>

      <header>
        {post.verticals[0] ? (
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
            {post.verticals[0]}
          </p>
        ) : null}
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
          {post.title}
        </h1>
        {post.subtitle ? (
          <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)] sm:text-xl">
            {post.subtitle}
          </p>
        ) : null}
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
          {date ? date.toISOString().slice(0, 10) : "—"}
          {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min` : null}
          {post.author ? ` · ${post.author}` : null}
        </p>
      </header>

      {post.cover ? (
        <figure className="mt-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="w-full rounded-md border border-white/10" />
        </figure>
      ) : null}

      <div className="mt-12">
        <BlockRenderer blocks={post.blocks} />
      </div>

      {post.sources.length > 0 ? (
        <section className="mt-16 border-t border-white/10 pt-12">
          <h2 className="font-display text-xl font-bold tracking-tight">
            {locale === "no" ? "Kilder" : "Sources"}
          </h2>
          <ol className="mt-5 space-y-2 text-sm text-[var(--color-muted)]">
            {post.sources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener"
                  className="text-[var(--color-fg)] underline decoration-[var(--color-accent)]/40 underline-offset-4 hover:decoration-[var(--color-accent)]"
                >
                  {source.name}
                </a>
                {source.datePublished ? (
                  <span className="ml-2 font-mono text-xs">
                    · {source.datePublished}
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className="mt-16 border-t border-white/10 pt-12">
        <p className="font-display text-2xl font-bold tracking-tight">{tCta("headline")}</p>
        <p className="mt-3 max-w-xl text-base text-[var(--color-muted)]">{tCta("subline")}</p>
        <Link
          href={`/${locale}/contact`}
          className="mt-6 inline-block rounded-sm bg-[var(--color-accent)] px-5 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          {tCta("button")}
        </Link>
      </footer>
    </article>
  );
}

async function safeGet(slug: string, locale: Locale) {
  try {
    return await getInsightBySlug(slug, locale);
  } catch (err) {
    console.error("[insights] failed to fetch post", { slug, locale, err });
    return null;
  }
}
