import Anthropic from "@anthropic-ai/sdk";
import { briefRequestSchema, briefResponseSchema, type BriefResponse, type Lang } from "../../_lib/briefSchema";
import {
  BRIEF_MODEL_ID,
  BRIEF_MAX_TOKENS,
  BRIEF_TEMPERATURE,
  BRIEF_TIMEOUT_MS,
  buildSystemPrompt,
  buildUserPrompt
} from "../../_lib/briefPrompt";
import { getTemplate, pickTemplate } from "../../_lib/cannedTemplates";
import { briefRateLimiter } from "../../_lib/rateLimit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

function fallback(brief: string, lang: Lang): BriefResponse {
  return getTemplate(pickTemplate(brief, lang), lang);
}

function extractText(message: { content: Array<{ type: string; text?: string }> }): string {
  for (const block of message.content) {
    if (block.type === "text" && block.text) return block.text;
  }
  return "";
}

function tryParseJson(raw: string): unknown {
  // Tolerate fenced output even though the prompt forbids it.
  const stripped = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(stripped);
  } catch {
    return null;
  }
}

let cachedClient: Anthropic | null = null;
function getClient(): Anthropic {
  if (cachedClient) return cachedClient;
  cachedClient = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY ?? "",
    timeout: BRIEF_TIMEOUT_MS
  });
  return cachedClient;
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const parsed = briefRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "invalid_request" }, { status: 400 });
  }
  const { brief, lang } = parsed.data;

  const ip = clientIp(req);
  const rl = briefRateLimiter.check(ip);
  if (!rl.ok) {
    return Response.json(
      { error: "rate_limited", retryAfterSec: rl.retryAfterSec },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } }
    );
  }

  // Short input → return canned ask-for-more without burning a token.
  if (brief.trim().length < 6) {
    const tpl = getTemplate("general", lang);
    const askMore =
      lang === "no"
        ? "fortell meg litt mer. Hva er hardt akkurat nå?"
        : "tell me a bit more. What's hard right now?";
    return Response.json({ ...tpl, recommendation: { ...tpl.recommendation, ask: askMore } });
  }

  // Truncate per spec.
  const safeBrief = brief.slice(0, 500);

  try {
    const client = getClient();
    const message = await client.messages.create({
      model: BRIEF_MODEL_ID,
      max_tokens: BRIEF_MAX_TOKENS,
      temperature: BRIEF_TEMPERATURE,
      system: buildSystemPrompt(lang),
      messages: [{ role: "user", content: buildUserPrompt(safeBrief, lang) }]
    });
    const text = extractText(message);
    const json = tryParseJson(text);
    const validated = briefResponseSchema.safeParse(json);
    if (!validated.success) {
      console.warn("[brief] schema validation failed, falling back", validated.error.issues);
      return Response.json(fallback(safeBrief, lang));
    }
    return Response.json(validated.data);
  } catch (err) {
    console.warn("[brief] LLM call failed, falling back", err);
    return Response.json(fallback(safeBrief, lang));
  }
}
