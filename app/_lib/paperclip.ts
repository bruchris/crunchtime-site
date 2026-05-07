import type { LeadInput } from "./leadSchema";
import type { InsertedLead } from "./notion";
import { markLeadStatus } from "./notion";
import { retryWithBackoff } from "./retry";

// Plan #4 originally fired a custom webhook to Paperclip. Paperclip doesn't
// have a bespoke crunchtime route, so we now create a Paperclip issue
// directly via its API instead. A Paperclip agent (default: CMO) picks the
// issue up from its inbox, runs the research, and emails the visitor.

const RETRY_DELAYS_MS = [1000, 4000];
const RETRY_ATTEMPTS_AFTER_FIRST = 2;
const REQUEST_TIMEOUT_MS = 10_000;

class PaperclipClientError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip api 4xx: ${status}`);
  }
}
class PaperclipServerError extends Error {
  constructor(public status: number, public body: string) {
    super(`paperclip api 5xx or network: ${status}`);
  }
}

interface PaperclipConfig {
  apiBase: string;
  token: string;
  companyId: string;
  projectId: string;
  goalId: string;
  agentId: string;
}

function readConfig(): PaperclipConfig | null {
  const apiBase = process.env.PAPERCLIP_API_BASE?.replace(/\/$/, "");
  const token = process.env.PAPERCLIP_API_TOKEN;
  const companyId = process.env.PAPERCLIP_COMPANY_ID;
  const projectId = process.env.PAPERCLIP_PROJECT_ID;
  const goalId = process.env.PAPERCLIP_GOAL_ID;
  const agentId = process.env.PAPERCLIP_AGENT_ID;
  if (!apiBase || !token || !companyId || !projectId || !goalId || !agentId) return null;
  return { apiBase, token, companyId, projectId, goalId, agentId };
}

function buildIssueBody(lead: InsertedLead, input: LeadInput): { title: string; description: string } {
  const langLabel = input.language === "no" ? "Norsk" : "English";
  const title = `New brief lead: ${input.company} (${input.email})`;

  // Agent reads this. Use markdown — Paperclip renders it.
  const description = [
    `## Lead context`,
    ``,
    `- **Visitor:** ${input.name} <${input.email}>`,
    `- **Company:** ${input.company}`,
    `- **Website:** ${input.website}`,
    `- **Language:** ${langLabel}`,
    `- **Notion row:** [${lead.pageId}](${lead.url})`,
    ``,
    `## What they wrote`,
    ``,
    `> ${input.brief.split("\n").join("\n> ")}`,
    ``,
    input.notes ? `### Extra notes from visitor\n\n${input.notes}\n\n` : "",
    `## What we showed them on /`,
    ``,
    `**Headline:** ${input.demoPayload.recommendation.headline}`,
    ``,
    `**Ask:** ${input.demoPayload.recommendation.ask}`,
    ``,
    `### Demo team`,
    ``,
    ...input.demoPayload.agents.map(
      (a) => `- **${a.name}** (${a.color}) — tools: ${a.tools.join(", ")}`
    ),
    ``,
    `### Demo activity log`,
    ``,
    ...input.demoPayload.logs.map((l) => `- \`${l.ts}\` **${l.agent}** — ${l.action}`),
    ``,
    `## What to do`,
    ``,
    `1. Scrape ${input.website} and (if linkedin URL is on the page) the visitor's LinkedIn.`,
    `2. Sanity-check that the suggested team in the demo above actually fits the brief — adjust agent names / tools if the scraped context contradicts.`,
    `3. Generate a 1-page implementation plan in ${langLabel}, grounded in the scraped context. >= 500 chars, references at least one fact from the website, lists at least 2 agents.`,
    `4. Email the plan to ${input.email} via Resend with reply-to christian@crunchtime.no.`,
    `5. Update the Notion row to \`plan-delivered\` (or \`plan-needs-review\` if the plan failed sanity checks).`,
    `6. Mark this issue \`done\` with a comment summarising what was sent.`
  ]
    .filter(Boolean)
    .join("\n");

  return { title, description };
}

export interface CreatedPaperclipIssue {
  id: string;
  identifier: string;
  url: string;
}

async function createIssueOnce(
  cfg: PaperclipConfig,
  body: { title: string; description: string }
): Promise<CreatedPaperclipIssue> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response: Response;
  try {
    response = await fetch(`${cfg.apiBase}/api/companies/${cfg.companyId}/issues`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${cfg.token}`
      },
      body: JSON.stringify({
        title: body.title,
        description: body.description,
        priority: "high",
        status: "todo",
        assigneeAgentId: cfg.agentId,
        projectId: cfg.projectId,
        goalId: cfg.goalId
      }),
      signal: controller.signal
    });
  } catch (err) {
    throw new PaperclipServerError(0, err instanceof Error ? err.message : String(err));
  } finally {
    clearTimeout(timer);
  }

  const text = await response.text().catch(() => "");
  if (response.status >= 200 && response.status < 300) {
    let parsed: { id?: string; identifier?: string } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new PaperclipServerError(response.status, `non-JSON 2xx response: ${text.slice(0, 200)}`);
    }
    if (!parsed.id || !parsed.identifier) {
      throw new PaperclipServerError(response.status, `missing id/identifier: ${text.slice(0, 200)}`);
    }
    return {
      id: parsed.id,
      identifier: parsed.identifier,
      url: `${cfg.apiBase}/${cfg.companyId.split("-")[0]}/issues/${parsed.identifier}`
    };
  }
  if (response.status >= 400 && response.status < 500) {
    throw new PaperclipClientError(response.status, text);
  }
  throw new PaperclipServerError(response.status, text);
}

export interface PaperclipTriggerOptions {
  sleep?: (ms: number) => Promise<void>;
}

export async function triggerPaperclipResearchAgent(
  lead: InsertedLead,
  input: LeadInput,
  options: PaperclipTriggerOptions = {}
): Promise<void> {
  const cfg = readConfig();
  if (!cfg) {
    console.warn("[paperclip] PAPERCLIP_API_* env vars not all set — skipping issue creation"); // eslint-disable-line no-console
    return;
  }

  const body = buildIssueBody(lead, input);

  // First attempt outside retry helper so we can short-circuit on 4xx.
  let issue: CreatedPaperclipIssue | null = null;
  try {
    issue = await createIssueOnce(cfg, body);
    console.log("[paperclip] issue created on first attempt", { leadId: lead.pageId, issue: issue.identifier }); // eslint-disable-line no-console
  } catch (err) {
    if (err instanceof PaperclipClientError) {
      console.error("[paperclip] 4xx — not retrying", { status: err.status }); // eslint-disable-line no-console
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip api 4xx (${err.status}): ${err.body.slice(0, 500)}`
      });
      return;
    }
    // 5xx / network — fall through to retry attempts.
  }

  if (!issue) {
    try {
      issue = await retryWithBackoff(() => createIssueOnce(cfg, body), {
        attempts: RETRY_ATTEMPTS_AFTER_FIRST,
        delaysMs: RETRY_DELAYS_MS,
        sleep: options.sleep
      });
      console.log("[paperclip] issue created after retry", { leadId: lead.pageId, issue: issue.identifier }); // eslint-disable-line no-console
    } catch (err) {
      if (err instanceof PaperclipClientError) {
        await markLeadStatus(lead.pageId, "manual-review", {
          note: `paperclip api 4xx (${err.status}): ${err.body.slice(0, 500)}`
        });
        return;
      }
      const message = err instanceof Error ? err.message : String(err);
      console.error("[paperclip] issue creation failed after 3 attempts", { error: message }); // eslint-disable-line no-console
      await markLeadStatus(lead.pageId, "manual-review", {
        note: `paperclip api failed after 3 attempts: ${message}`
      });
      return;
    }
  }

  // Success path: flip Notion status to plan-pending and link the Paperclip issue.
  await markLeadStatus(lead.pageId, "plan-pending", {
    paperclipUrl: issue.url,
    note: `Paperclip issue ${issue.identifier} created and assigned.`
  });
}
