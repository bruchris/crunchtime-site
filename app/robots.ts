import type { MetadataRoute } from "next";

const SITE = "https://crunchtime.no";

// Crawlers we explicitly allow. Naming each one matters because some opt-out
// flags (Google-Extended, Applebot-Extended) only apply when the bot is named.
const ALLOWED_BOTS = [
  // Generative search / grounding (live retrieval, citations)
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  // Traditional search
  "Googlebot",
  "Bingbot",
  "DuckDuckBot",
  "Applebot",
  "YandexBot",
  // Misc retrieval
  "Amazonbot",
  "Bytespider",
  "FacebookBot",
  "LinkedInBot",
  "Twitterbot"
];

// Disallowed paths apply to every UA — API surface and noscript fallback
// have no business in an index.
const DISALLOW_PATHS = ["/api/", "/api"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...ALLOWED_BOTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW_PATHS
      })),
      // Catch-all: still allow, but explicitly block the API.
      // Flip this to `disallow: "/"` if you ever want to default-deny unknowns.
      { userAgent: "*", allow: "/", disallow: DISALLOW_PATHS }
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE
  };
}
