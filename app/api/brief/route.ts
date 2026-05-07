import { generateText, Output } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
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

let cachedProvider: ReturnType<typeof createAnthropic> | null = null;
function getProvider() {
  if (cachedProvider) return cachedProvider;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY is not configured");
  cachedProvider = createAnthropic({ apiKey });
  return cachedProvider;
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

  const safeBrief = brief.slice(0, 500);

  try {
    const anthropic = getProvider();
    const { output } = await generateText({
      model: anthropic(BRIEF_MODEL_ID),
      output: Output.object({ schema: briefResponseSchema }),
      system: buildSystemPrompt(lang),
      prompt: buildUserPrompt(safeBrief, lang),
      maxOutputTokens: BRIEF_MAX_TOKENS,
      temperature: BRIEF_TEMPERATURE,
      abortSignal: AbortSignal.timeout(BRIEF_TIMEOUT_MS)
    });
    return Response.json(output);
  } catch (err) {
    console.error("[brief] structured generation failed, falling back", err);
    return Response.json(fallback(safeBrief, lang));
  }
}
