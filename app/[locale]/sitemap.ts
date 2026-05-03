import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crunchtime.no";
  const now = new Date();
  const locales = ["no", "en"] as const;

  return locales.flatMap((locale) => [
    { url: `${base}/${locale}`, lastModified: now, changeFrequency: "weekly" as const, priority: 1 },
    { url: `${base}/${locale}/consulting`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.9 },
    { url: `${base}/${locale}/contact`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.7 }
  ]);
}
