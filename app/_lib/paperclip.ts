import type { LeadInput } from "./leadSchema";
import type { InsertedLead } from "./notion";
import { markLeadStatus } from "./notion";
import { retryWithBackoff } from "./retry";

const RETRY_DELAYS_MS = [1000, 4000]; // delay before retries 2 and 3
const RETRY_ATTEMPTS_AFTER_FIRST = 2; // total attempts = 1 + 2 = 3
const REQUEST_TIMEOUT_MS = 10_000;

class WebhookClientError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip webhook 4xx: ${status}`);
  }
}
class WebhookServerError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip webhook 5xx or network: ${status}`);
  }
}

async function postOnce(url: string, body: string): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
      signal: controller.signal
    });
  } catch (err) {
    throw new WebhookServerError(0, err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timer);
  }
  if (response.status >= 200 && response.status < 300) return;
  const text = await response.text().catch(() => "");
  if (response.status >= 400 && response.status < 500) {
    throw new WebhookClientError(response.status, text);
  }
  throw new WebhookServerError(response.status, text);
}

export interface PaperclipTriggerOptions {
  sleep?: (ms: number) => Promise<void>;
}

export async function triggerPaperclipResearchAgent(
  lead: InsertedLead,
  input: LeadInput,
  options: PaperclipTriggerOptions = {}
): Promise<void> {
  const url = process.env.PAPERCLIP_WEBHOOK_URL;
  if (!url) {
    console.warn("[paperclip] PAPERCLIP_WEBHOOK_URL not set — skipping webhook dispatch"); // eslint-disable-line no-console
    return;
  }

  const payload = {
    lead_id: lead.pageId,
    brief: input.brief,
    recommendation: input.demoPayload.recommendation,
    visitor: { name: input.name, email: input.email, company: input.company, website: input.website },
    language: input.language,
    demo_payload: input.demoPayload,
    notion_url: lead.url
  };
  const body = JSON.stringify(payload);

  // First attempt outside retry helper so we can short-circuit on 4xx.
  try {
    await postOnce(url, body);
    console.log("[paperclip] webhook accepted on first attempt", { leadId: lead.pageId }); // eslint-disable-line no-console
    return;
  } catch (err) {
    if (err instanceof WebhookClientError) {
      console.error("[paperclip] 4xx — not retrying", { status: err.status }); // eslint-disable-line no-console
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip webhook 4xx (${err.status}): ${err.body.slice(0, 500)}`
      });
      return;
    }
    // 5xx / network — fall through to retry attempts 2 and 3.
  }

  try {
    await retryWithBackoff(() => postOnce(url, body), {
      attempts: RETRY_ATTEMPTS_AFTER_FIRST,
      delaysMs: RETRY_DELAYS_MS,
      sleep: options.sleep
    });
    console.log("[paperclip] webhook accepted after retry", { leadId: lead.pageId }); // eslint-disable-line no-console
  } catch (err) {
    if (err instanceof WebhookClientError) {
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip webhook 4xx (${err.status}): ${err.body.slice(0, 500)}`
      });
      return;
    }
    const message = err instanceof Error ? err.message : String(err);
    console.error("[paperclip] webhook failed after 3 attempts", { error: message }); // eslint-disable-line no-console
    await markLeadStatus(lead.pageId, "manual-review", {
      note: `paperclip webhook failed after 3 attempts: ${message}`
    });
  }
}
