import { Client } from "@notionhq/client";
import type {
  InsightBlock,
  InsightDetail,
  InsightLocale,
  InsightSource,
  InsightStatus,
  InsightSummary,
  InsightVertical,
  RichSpan
} from "./types";

let _client: Client | null = null;
function getClient(): Client {
  if (_client) return _client;
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  _client = new Client({ auth: token, timeoutMs: 15000 });
  return _client;
}

function databaseId(): string {
  const id = process.env.NOTION_INSIGHTS_DATABASE_ID;
  if (!id) throw new Error("NOTION_INSIGHTS_DATABASE_ID is not configured");
  return id;
}

// `unknown` everywhere because the Notion SDK's Page/Block types are deeply
// nested unions. We narrow at the read boundary and trust the runbook schema.
function plainText(rich: unknown): string {
  if (!Array.isArray(rich)) return "";
  return rich.map((r) => (r as { plain_text?: string }).plain_text ?? "").join("");
}

function richSpans(rich: unknown): RichSpan[] {
  if (!Array.isArray(rich)) return [];
  return rich.map((r) => {
    const span = r as {
      plain_text?: string;
      annotations?: { bold?: boolean; italic?: boolean; code?: boolean };
      href?: string | null;
    };
    return {
      text: span.plain_text ?? "",
      bold: !!span.annotations?.bold,
      italic: !!span.annotations?.italic,
      code: !!span.annotations?.code,
      href: span.href ?? null
    };
  });
}

function selectName(prop: unknown): string | null {
  const v = (prop as { select?: { name?: string } | null }).select;
  return v?.name ?? null;
}

function multiSelectNames(prop: unknown): string[] {
  const v = (prop as { multi_select?: Array<{ name: string }> }).multi_select;
  return v ? v.map((s) => s.name) : [];
}

function dateStart(prop: unknown): string | null {
  const v = (prop as { date?: { start?: string } | null }).date;
  return v?.start ?? null;
}

function fileUrl(prop: unknown): string | null {
  const files = (prop as { files?: Array<{ file?: { url: string }; external?: { url: string } }> }).files;
  if (!files || files.length === 0) return null;
  const f = files[0];
  return f.file?.url ?? f.external?.url ?? null;
}

function pageToSummary(page: unknown): InsightSummary | null {
  const p = page as {
    id: string;
    last_edited_time: string;
    properties: Record<string, unknown>;
  };
  const props = p.properties;

  const status = (selectName(props["Status"]) ?? "draft") as InsightStatus;
  const locale = selectName(props["Locale"]) as InsightLocale | null;
  const slug = plainText((props["Slug"] as { rich_text?: unknown }).rich_text).trim();
  const title = plainText((props["Title"] as { title?: unknown }).title).trim();

  // A row missing any of these can't render; skip.
  if (!locale || !slug || !title) return null;

  return {
    id: p.id,
    title,
    slug,
    locale,
    excerpt: plainText((props["Excerpt"] as { rich_text?: unknown }).rich_text).trim(),
    subtitle: plainText((props["Subtitle"] as { rich_text?: unknown }).rich_text).trim(),
    verticals: multiSelectNames(props["Vertical"]) as InsightVertical[],
    tags: multiSelectNames(props["Tags"]),
    cover: fileUrl(props["Cover"]),
    status,
    publishedAt: dateStart(props["Published"]),
    updatedAt: p.last_edited_time,
    pairSlug:
      plainText((props["Pair slug"] as { rich_text?: unknown }).rich_text).trim() || null,
    author:
      plainText((props["Author"] as { rich_text?: unknown }).rich_text).trim() || null,
    readingTimeMinutes:
      ((props["Reading time"] as { number?: number | null }).number) ?? null,
    featured: !!(props["Featured"] as { checkbox?: boolean }).checkbox,
    sources: parseSources(plainText((props["Sources"] as { rich_text?: unknown }).rich_text))
  };
}

// Sources field is plain text, one source per line, format:
//   "Source name — https://url — YYYY-MM-DD"
// Either separator (em dash, en dash, or hyphen-with-spaces) is accepted.
function parseSources(raw: string): InsightSource[] {
  if (!raw) return [];
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—–-]\s+/).map((p) => p.trim());
      const url = parts.find((p) => /^https?:\/\//i.test(p)) ?? "";
      const date = parts.find((p) => /^\d{4}-\d{2}-\d{2}$/.test(p)) ?? null;
      const name = parts.find((p) => p !== url && p !== date) ?? url;
      return { name, url, datePublished: date };
    })
    .filter((s) => s.url);
}

interface ListOptions {
  locale: InsightLocale;
  vertical?: InsightVertical;
  limit?: number;
  includeUnpublished?: boolean; // for preview-only routes; default false
}

// Returns posts ordered by Published desc.
export async function listInsights(opts: ListOptions): Promise<InsightSummary[]> {
  const client = getClient();
  const filters: unknown[] = [
    { property: "Locale", select: { equals: opts.locale } }
  ];
  if (!opts.includeUnpublished) {
    filters.push({ property: "Status", select: { equals: "published" } });
  }
  if (opts.vertical) {
    filters.push({ property: "Vertical", multi_select: { contains: opts.vertical } });
  }

  const response = await client.databases.query({
    database_id: databaseId(),
    page_size: opts.limit ?? 50,
    filter: { and: filters } as Parameters<typeof client.databases.query>[0]["filter"],
    sorts: [{ property: "Published", direction: "descending" }]
  });

  return response.results
    .map((r) => pageToSummary(r))
    .filter((s): s is InsightSummary => s !== null);
}

export async function getInsightBySlug(
  slug: string,
  locale: InsightLocale,
  opts?: { includeUnpublished?: boolean; allowedStatuses?: InsightStatus[] }
): Promise<InsightDetail | null> {
  const client = getClient();
  const filters: unknown[] = [
    { property: "Slug", rich_text: { equals: slug } },
    { property: "Locale", select: { equals: locale } }
  ];
  if (opts?.allowedStatuses?.length) {
    filters.push({
      or: opts.allowedStatuses.map((status) => ({
        property: "Status",
        select: { equals: status }
      }))
    });
  } else if (!opts?.includeUnpublished) {
    filters.push({ property: "Status", select: { equals: "published" } });
  }

  const response = await client.databases.query({
    database_id: databaseId(),
    page_size: 1,
    filter: { and: filters } as Parameters<typeof client.databases.query>[0]["filter"]
  });

  const page = response.results[0];
  if (!page) return null;
  const summary = pageToSummary(page);
  if (!summary) return null;

  const blocks = await fetchBlocks(summary.id);
  return { ...summary, blocks };
}

async function fetchBlocks(blockId: string): Promise<InsightBlock[]> {
  const client = getClient();
  const out: InsightBlock[] = [];
  let cursor: string | undefined;

  do {
    const res = await client.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
      page_size: 100
    });
    for (const b of res.results) {
      const block = await mapBlock(b);
      if (block) out.push(block);
    }
    cursor = res.has_more ? (res.next_cursor ?? undefined) : undefined;
  } while (cursor);

  // Collapse consecutive list items (Notion returns them as individual blocks)
  return collapseLists(out);
}

async function mapBlock(raw: unknown): Promise<InsightBlock | null> {
  const b = raw as { type: string; [k: string]: unknown };
  const t = b.type;

  switch (t) {
    case "heading_2":
      return { kind: "heading", level: 2, text: richSpans((b.heading_2 as { rich_text: unknown }).rich_text) };
    case "heading_3":
      return { kind: "heading", level: 3, text: richSpans((b.heading_3 as { rich_text: unknown }).rich_text) };
    case "heading_1":
      // We treat h1 in body as h2 — the post H1 is the page title.
      return { kind: "heading", level: 2, text: richSpans((b.heading_1 as { rich_text: unknown }).rich_text) };
    case "paragraph":
      return { kind: "paragraph", text: richSpans((b.paragraph as { rich_text: unknown }).rich_text) };
    case "bulleted_list_item":
      return {
        kind: "bulleted-list",
        items: [richSpans((b.bulleted_list_item as { rich_text: unknown }).rich_text)]
      };
    case "numbered_list_item":
      return {
        kind: "numbered-list",
        items: [richSpans((b.numbered_list_item as { rich_text: unknown }).rich_text)]
      };
    case "quote":
      return { kind: "quote", text: richSpans((b.quote as { rich_text: unknown }).rich_text) };
    case "callout": {
      const c = b.callout as { rich_text: unknown; icon?: { type: string; emoji?: string } };
      return {
        kind: "callout",
        text: richSpans(c.rich_text),
        emoji: c.icon?.type === "emoji" ? (c.icon.emoji ?? null) : null
      };
    }
    case "code": {
      const c = b.code as { rich_text: unknown; language?: string };
      return { kind: "code", language: c.language ?? "plain", text: plainText(c.rich_text) };
    }
    case "divider":
      return { kind: "divider" };
    case "image": {
      const img = b.image as {
        type: "file" | "external";
        file?: { url: string };
        external?: { url: string };
        caption?: unknown;
      };
      const url = img.file?.url ?? img.external?.url ?? "";
      if (!url) return null;
      return { kind: "image", url, alt: plainText(img.caption) };
    }
    default:
      return { kind: "unsupported", type: t };
  }
}

// Notion sends consecutive list items as separate blocks; merge them into
// a single `bulleted-list` / `numbered-list` block so the renderer emits
// proper <ul>/<ol> elements with all items inside.
function collapseLists(blocks: InsightBlock[]): InsightBlock[] {
  const out: InsightBlock[] = [];
  for (const b of blocks) {
    const last = out[out.length - 1];
    if (
      (b.kind === "bulleted-list" || b.kind === "numbered-list") &&
      last &&
      last.kind === b.kind
    ) {
      last.items.push(...b.items);
    } else {
      out.push(b);
    }
  }
  return out;
}
