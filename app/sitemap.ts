import type { MetadataRoute } from "next";
import { routing, type Locale } from "../i18n/routing";
import { listInsights } from "./_lib/insights/notionClient";

// Bump per-route when the page content meaningfully changes.
// Using `new Date()` here would mark every URL as freshly modified on each
// build, diluting the lastmod signal that crawlers (and AI engines) use
// to decide what to re-fetch.
const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  lastModified: string; // ISO 8601 (YYYY-MM-DD)
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  // Locales this route is published in. Defaults to all locales when omitted.
  locales?: ReadonlyArray<Locale>;
}> = [
  { path: "", lastModified: "2026-05-07", changeFrequency: "weekly", priority: 1.0 },
  { path: "/services", lastModified: "2026-05-13", changeFrequency: "monthly", priority: 0.8 },
  { path: "/cases", lastModified: "2026-05-13", changeFrequency: "monthly", priority: 0.7 },
  { path: "/insights", lastModified: "2026-05-07", changeFrequency: "weekly", priority: 0.8 },
  { path: "/facts", lastModified: "2026-05-07", changeFrequency: "monthly", priority: 0.5 },
  { path: "/ordliste", lastModified: "2026-05-13", changeFrequency: "monthly", priority: 0.6 },
  { path: "/contact", lastModified: "2026-05-06", changeFrequency: "monthly", priority: 0.6 }
];

// Refresh sitemap every hour so newly published Insight posts appear in
// search engines without redeploying.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://crunchtime.no";

  const staticEntries = routing.locales.flatMap((locale) =>
    STATIC_ROUTES
      .filter((r) => !r.locales || r.locales.includes(locale as Locale))
      .map(({ path, lastModified, changeFrequency, priority, locales }) => ({
        url: `${base}/${locale}${path}`,
        lastModified: new Date(lastModified),
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            (locales ?? routing.locales).map((alt) => [alt, `${base}/${alt}${path}`])
          )
        }
      }))
  );

  const insightEntries = await safeInsightEntries(base);

  return [...staticEntries, ...insightEntries];
}

async function safeInsightEntries(
  base: string
): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [];
  for (const locale of routing.locales) {
    try {
      const posts = await listInsights({ locale: locale as Locale });
      for (const post of posts) {
        const lastModified = new Date(post.updatedAt);
        const languages: Record<string, string> = {
          [locale]: `${base}/${locale}/insights/${post.slug}`
        };
        if (post.pairSlug) {
          const otherLocale = locale === "no" ? "en" : "no";
          languages[otherLocale] = `${base}/${otherLocale}/insights/${post.pairSlug}`;
        }
        entries.push({
          url: `${base}/${locale}/insights/${post.slug}`,
          lastModified,
          changeFrequency: "monthly",
          priority: 0.7,
          alternates: { languages }
        });
      }
    } catch (err) {
      console.error("[sitemap] failed to list insights", { locale, err });
    }
  }
  return entries;
}
