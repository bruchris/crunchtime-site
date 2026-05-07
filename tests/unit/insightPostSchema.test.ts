import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const mockGetInsightBySlug = vi.fn();
const mockGetTranslations = vi.fn();
const mockSetRequestLocale = vi.fn();
const mockNotFound = vi.fn(() => {
  throw new Error("notFound");
});

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", { href, ...rest }, children)
}));

vi.mock("next-intl/server", () => ({
  getTranslations: (...args: unknown[]) => mockGetTranslations(...args),
  setRequestLocale: (...args: unknown[]) => mockSetRequestLocale(...args)
}));

vi.mock("next-intl", () => ({
  hasLocale: () => true
}));

vi.mock("next/navigation", () => ({
  notFound: () => mockNotFound()
}));

vi.mock("../../app/_lib/insights/notionClient", () => ({
  getInsightBySlug: (...args: unknown[]) => mockGetInsightBySlug(...args)
}));

describe("insight post schema contract", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    mockGetTranslations.mockImplementation(async ({ namespace }: { namespace: string }) => {
      if (namespace === "nav") {
        return (key: string) => (key === "insights" ? "Insights" : key);
      }
      if (namespace === "insights.cta") {
        return (key: string) =>
          ({
            headline: "Talk to Crunchtime",
            subline: "We can build this for your team.",
            button: "Book a call"
          })[key] ?? key;
      }
      return (key: string) => key;
    });
    mockGetInsightBySlug.mockResolvedValue({
      id: "post-1",
      title: "Hvorfor leads dør på 5 minutter",
      slug: "why-leads-die-in-five-minutes",
      locale: "no",
      excerpt: "Kort oppsummering.",
      subtitle: "Dette er underteksten.",
      verticals: ["services"],
      tags: ["Tripletex", "lead routing"],
      cover: "https://example.com/cover.jpg",
      status: "published",
      publishedAt: "2026-05-07T12:00:00.000Z",
      updatedAt: "2026-05-07T12:30:00.000Z",
      pairSlug: null,
      author: "Christian Bru",
      readingTimeMinutes: 6,
      featured: false,
      sources: [
        {
          name: "Example Source",
          url: "https://example.com/source",
          datePublished: "2026-05-01"
        }
      ],
      blocks: [
        {
          kind: "paragraph",
          text: [{ text: "Ingress.", bold: false, italic: false, code: false, href: null }]
        }
      ]
    });
  });

  it("renders Article and Breadcrumb JSON-LD without FAQPage", async () => {
    const module = await import("../../app/[locale]/insights/[slug]/page");
    const Page = module.default;

    const jsx = await Page({
      params: Promise.resolve({ locale: "no", slug: "why-leads-die-in-five-minutes" })
    });
    const html = renderToStaticMarkup(jsx);

    const match = html.match(/<script type="application\/ld\+json">([^<]+)<\/script>/);
    expect(match).toBeTruthy();

    const jsonLd = JSON.parse(match![1]) as Array<{ "@type": string }>;
    expect(jsonLd.map((item) => item["@type"])).toEqual(["Article", "BreadcrumbList"]);
    expect(html).not.toContain("FAQPage");
  });
});
