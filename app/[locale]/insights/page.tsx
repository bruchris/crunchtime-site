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
import { listInsights } from "../../_lib/insights/notionClient";
import type { InsightSummary } from "../../_lib/insights/types";

// ISR: refresh hub every 10 min so newly published posts surface quickly
// without ever rebuilding the site.
export const revalidate = 600;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "insights.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/insights`,
      languages: {
        no: "/no/insights",
        en: "/en/insights",
        "x-default": "/no/insights"
      }
    },
    openGraph: { url: `${SITE_URL}/${locale}/insights` }
  };
}

export default async function InsightsHub({
  params
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "insights.hub" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const posts = await safeList(locale as Locale);

  const url = `${SITE_URL}/${locale}/insights`;
  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: tNav("insights"), url }
  ]);
  const collection = collectionPageSchema({
    url,
    name: t("headline"),
    description: t("subline"),
    inLanguage: locale === "no" ? "nb-NO" : "en-US"
  });

  const featured = posts.find((p) => p.featured) ?? posts[0] ?? null;
  const rest = featured ? posts.filter((p) => p.id !== featured.id) : posts;

  return (
    <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
      <JsonLd data={[collection, breadcrumbs]} />

      <header>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
          {t("eyebrow")}
        </p>
        <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
          {t("headline")}
        </h1>
        <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)]">
          {t("subline")}
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-16 text-base text-[var(--color-muted)]">{t("empty")}</p>
      ) : (
        <>
          {featured ? <FeaturedCard post={featured} locale={locale} /> : null}
          {rest.length > 0 ? (
            <ul className="mt-12 grid gap-px bg-white/8 sm:grid-cols-2">
              {rest.map((post) => (
                <li key={post.id} className="bg-[var(--color-surface)]">
                  <PostCard post={post} locale={locale} />
                </li>
              ))}
            </ul>
          ) : null}
        </>
      )}
    </div>
  );
}

async function safeList(locale: Locale): Promise<InsightSummary[]> {
  // The hub must render even if Notion is unreachable or unconfigured —
  // a marketing page going down because the CMS hiccuped is unacceptable.
  try {
    return await listInsights({ locale });
  } catch (err) {
    console.error("[insights] failed to list posts", err);
    return [];
  }
}

function FeaturedCard({ post, locale }: { post: InsightSummary; locale: string }) {
  return (
    <Link
      href={`/${locale}/insights/${post.slug}`}
      className="mt-16 block rounded-md border border-white/10 bg-[var(--color-surface)] p-8 transition-colors hover:border-[var(--color-accent)]/60 sm:p-12"
    >
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-accent)]">
        {post.verticals[0] ?? "general"}
      </p>
      <h2 className="font-display mt-5 text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">
        {post.title}
      </h2>
      {post.subtitle ? (
        <p className="mt-5 max-w-3xl text-lg leading-8 text-[var(--color-muted)]">
          {post.subtitle}
        </p>
      ) : null}
      <PostMeta post={post} />
    </Link>
  );
}

function PostCard({ post, locale }: { post: InsightSummary; locale: string }) {
  return (
    <Link
      href={`/${locale}/insights/${post.slug}`}
      className="group block p-8 transition-colors duration-300 hover:bg-[#15150f]"
    >
      {post.verticals[0] ? (
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-muted)]">
          {post.verticals[0]}
        </p>
      ) : null}
      <h3 className="font-display mt-5 text-2xl font-bold tracking-tight">
        {post.title}
      </h3>
      {post.excerpt ? (
        <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">{post.excerpt}</p>
      ) : null}
      <PostMeta post={post} />
    </Link>
  );
}

function PostMeta({ post }: { post: InsightSummary }) {
  const date = post.publishedAt ? new Date(post.publishedAt) : null;
  return (
    <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
      {date ? date.toISOString().slice(0, 10) : "—"}
      {post.readingTimeMinutes ? ` · ${post.readingTimeMinutes} min` : null}
      {post.author ? ` · ${post.author}` : null}
    </p>
  );
}
