import { Client } from "@notionhq/client";
import type { LeadInput } from "./leadSchema";

let _client: Client | null = null;

function getClient(): Client {
  if (_client) return _client;
  const token = process.env.NOTION_TOKEN;
  if (!token) throw new Error("NOTION_TOKEN is not configured");
  _client = new Client({ auth: token });
  return _client;
}

function richText(value: string) {
  if (!value) return [];
  return [{ type: "text" as const, text: { content: value.slice(0, 2000) } }];
}

// Status values match the Notion CRM Select options exactly (case-sensitive).
// "New" (capitalized) is the existing CRM-wide "fresh lead" state we share with
// manual outreach; the lowercase plan-* / manual-review options are brief-box
// specific and added to support the Paperclip pipeline.
export type LeadStatus =
  | "New"
  | "plan-pending"
  | "plan-delivered"
  | "plan-needs-review"
  | "manual-review";

export interface InsertedLead {
  pageId: string;
  url: string;
}

export async function insertLead(input: LeadInput): Promise<InsertedLead> {
  const databaseId = process.env.NOTION_DATABASE_ID;
  if (!databaseId) throw new Error("NOTION_DATABASE_ID is not configured");

  const client = getClient();
  const recommendationText = `${input.demoPayload.recommendation.headline}\n\n${input.demoPayload.recommendation.ask}`;

  const response = await client.pages.create({
    parent: { database_id: databaseId },
    properties: {
      Name: { title: richText(input.name) },
      Email: { email: input.email },
      Company: { rich_text: richText(input.company) },
      Website: { url: input.website },
      Brief: { rich_text: richText(input.brief) },
      Recommendation: { rich_text: richText(recommendationText) },
      Language: { select: { name: input.language } },
      Source: { select: { name: input.source } },
      Status: { select: { name: "New" satisfies LeadStatus } },
      Notes: { rich_text: richText(input.notes ?? "") }
    }
  });

  const url = "url" in response ? (response.url as string) : "";
  return { pageId: response.id, url };
}

export async function markLeadStatus(
  pageId: string,
  status: LeadStatus,
  extra?: { note?: string; planSentAt?: Date }
): Promise<void> {
  const client = getClient();
  const properties: Record<string, unknown> = {
    Status: { select: { name: status } }
  };
  if (extra?.note) properties.Notes = { rich_text: richText(extra.note) };
  if (extra?.planSentAt) {
    properties["Plan Sent"] = { date: { start: extra.planSentAt.toISOString() } };
  }
  await client.pages.update({
    page_id: pageId,
    properties: properties as Parameters<typeof client.pages.update>[0]["properties"]
  });
}
