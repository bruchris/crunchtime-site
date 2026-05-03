import type { MetadataRoute } from "next";
import { routing } from "../i18n/routing";

const PATHS = ["", "/consulting", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crunchtime.no";
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}${path}`])
        )
      }
    }))
  );
}
