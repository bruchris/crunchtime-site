import { NextResponse, after } from "next/server";
import { leadInputSchema } from "../../_lib/leadSchema";
import { isHoneypotTriggered } from "../../_lib/honeypot";
import { insertLead } from "../../_lib/notion";
import { sendLeadAck, sendAdminNotification } from "../../_lib/resend";
import { triggerPaperclipResearchAgent } from "../../_lib/paperclip";
import { createRateLimiter } from "../../_lib/rateLimit";

const leadRateLimiter = createRateLimiter({ max: 3, windowMs: 60 * 60 * 1000 });

function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const real = req.headers.get("x-real-ip");
  if (real) return real.trim();
  return "0.0.0.0";
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 });
  }

  const parsed = leadInputSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation failed", issues: parsed.error.issues },
      { status: 400 }
    );
  }
  const input = parsed.data;

  const ip = clientIp(request);
  const rl = leadRateLimiter.check(ip);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSec) } }
    );
  }

  if (isHoneypotTriggered(input.company_phone)) {
    console.log("[honeypot] rejected lead submission", { email: input.email }); // eslint-disable-line no-console
    return NextResponse.json({ ok: true });
  }

  let inserted;
  try {
    inserted = await insertLead(input);
  } catch (err) {
    console.error("[lead] notion insert failed", err); // eslint-disable-line no-console
    return NextResponse.json({ ok: false, error: "could not save lead" }, { status: 502 });
  }

  // Visitor ack synchronously — if it fails, surface partial success.
  try {
    await sendLeadAck(input);
  } catch (err) {
    console.error("[lead] visitor ack failed", err); // eslint-disable-line no-console
    after(async () => {
      try { await sendAdminNotification(input, inserted); }
      catch (e) { console.error("[lead] sendAdminNotification failed", e); } // eslint-disable-line no-console
    });
    after(async () => {
      try { await triggerPaperclipResearchAgent(inserted, input); }
      catch (e) { console.error("[lead] triggerPaperclipResearchAgent failed", e); } // eslint-disable-line no-console
    });
    return NextResponse.json(
      { ok: true, ackEmail: "deferred", leadId: inserted.pageId },
      { status: 202 }
    );
  }

  // Admin ping + paperclip webhook fire async.
  after(async () => {
    try { await sendAdminNotification(input, inserted); }
    catch (err) { console.error("[lead] sendAdminNotification failed", err); } // eslint-disable-line no-console
  });
  after(async () => {
    try { await triggerPaperclipResearchAgent(inserted, input); }
    catch (err) { console.error("[lead] triggerPaperclipResearchAgent failed", err); } // eslint-disable-line no-console
  });

  return NextResponse.json({ ok: true, leadId: inserted.pageId });
}
