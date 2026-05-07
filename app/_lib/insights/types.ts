// Types for the Crunchtime Insights CMS (Notion-backed).
// See docs/runbooks/notion-insights-setup.md for the database schema.

export type InsightLocale = "no" | "en";

export type InsightVertical =
  | "accounting"
  | "ecommerce"
  | "law"
  | "dental"
  | "real-estate"
  | "hospitality"
  | "services"
  | "general";

export type InsightStatus = "draft" | "in-review" | "published" | "archived";

export interface InsightSummary {
  id: string;
  title: string;
  slug: string;
  locale: InsightLocale;
  excerpt: string;
  subtitle: string;
  verticals: InsightVertical[];
  tags: string[];
  cover: string | null;
  status: InsightStatus;
  publishedAt: string | null; // ISO 8601, null if status !== "published"
  updatedAt: string; // ISO 8601 (last_edited_time)
  pairSlug: string | null;
  author: string | null;
  readingTimeMinutes: number | null;
  featured: boolean;
  sources: InsightSource[];
}

export interface InsightSource {
  name: string;
  url: string;
  datePublished: string | null; // ISO 8601 date or null
}

export interface InsightDetail extends InsightSummary {
  blocks: InsightBlock[];
}

// Subset of Notion block types we render. Anything else falls through as
// type "unsupported" so authors get a visible signal during preview.
export type InsightBlock =
  | { kind: "heading"; level: 2 | 3 | 4; text: RichSpan[] }
  | { kind: "paragraph"; text: RichSpan[] }
  | { kind: "bulleted-list"; items: RichSpan[][] }
  | { kind: "numbered-list"; items: RichSpan[][] }
  | { kind: "quote"; text: RichSpan[] }
  | { kind: "callout"; text: RichSpan[]; emoji: string | null }
  | { kind: "code"; language: string; text: string }
  | { kind: "divider" }
  | { kind: "image"; url: string; alt: string }
  | { kind: "unsupported"; type: string };

export interface RichSpan {
  text: string;
  bold: boolean;
  italic: boolean;
  code: boolean;
  href: string | null;
}
