import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crunchtime.no";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/consulting`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: `${base}/back-office/finance`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9
    },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 }
  ];
}
