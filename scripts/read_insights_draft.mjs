import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { Client } from "@notionhq/client";

const rootDir = path.resolve(import.meta.dirname, "..");
loadEnvFile(path.join(rootDir, ".env.local"));

const notionToken = process.env.NOTION_TOKEN;
const databaseId = process.env.NOTION_INSIGHTS_DATABASE_ID;

if (!notionToken) {
  console.error("NOTION_TOKEN is not configured in .env.local");
  process.exit(1);
}

if (!databaseId) {
  console.error("NOTION_INSIGHTS_DATABASE_ID is not configured in .env.local");
  process.exit(1);
}

const rawArg = process.argv.slice(2).find((arg) => arg !== "--");
if (!rawArg) {
  console.error("Usage: node scripts/read_insights_draft.mjs <notion-page-url-or-id>");
  process.exit(1);
}

const pageId = normalizePageId(rawArg);
if (!pageId) {
  console.error("Could not parse a Notion page id from the provided argument.");
  process.exit(1);
}

const client = new Client({ auth: notionToken, timeoutMs: 15000 });

try {
  const page = await client.pages.retrieve({ page_id: pageId });
  const blocks = await listAllBlocks(client, pageId);
  const summary = {
    id: page.id,
    url: page.url,
    title: plainText(page.properties?.Title?.title),
    slug: plainText(page.properties?.Slug?.rich_text),
    status: page.properties?.Status?.select?.name ?? null,
    locale: page.properties?.Locale?.select?.name ?? null,
    excerpt: plainText(page.properties?.Excerpt?.rich_text),
    lastEdited: page.last_edited_time,
    blockCount: blocks.length,
    blocks: blocks.map(toPrintableBlock)
  };

  console.log(JSON.stringify(summary, null, 2));
} catch (error) {
  const e = error;
  console.error(
    JSON.stringify(
      {
        ok: false,
        name: e?.name ?? "Error",
        code: e?.code ?? null,
        status: e?.status ?? null,
        message: e?.message ?? String(error),
        body: e?.body ?? null
      },
      null,
      2
    )
  );
  process.exit(1);
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    if (!line || line.trimStart().startsWith("#")) continue;
    const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith("\"") && value.endsWith("\"")) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!(key in process.env)) process.env[key] = value;
  }
}

function normalizePageId(input) {
  const trimmed = input.trim();
  const direct = trimmed.replace(/-/g, "");
  if (/^[0-9a-fA-F]{32}$/.test(direct)) return withHyphens(direct.toLowerCase());

  const urlMatch = trimmed.match(/([0-9a-fA-F]{32})(?:\?|$)/);
  if (urlMatch) return withHyphens(urlMatch[1].toLowerCase());

  return null;
}

function withHyphens(id) {
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

async function listAllBlocks(notionClient, blockId) {
  const blocks = [];
  let cursor;

  do {
    const response = await notionClient.blocks.children.list({
      block_id: blockId,
      page_size: 100,
      start_cursor: cursor
    });
    blocks.push(...response.results);
    cursor = response.has_more ? response.next_cursor ?? undefined : undefined;
  } while (cursor);

  return blocks;
}

function toPrintableBlock(block) {
  const payload = block[block.type] ?? {};
  return {
    type: block.type,
    text: plainText(payload.rich_text),
    hasChildren: Boolean(block.has_children)
  };
}

function plainText(richText) {
  if (!Array.isArray(richText)) return "";
  return richText.map((item) => item?.plain_text ?? "").join("");
}
