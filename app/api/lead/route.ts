import { NextResponse, after } from "next/server";
import { leadInputSchema } from "../../_lib/leadSchema";
import { isHoneypotTriggered } from "../../_lib/honeypot";
import { insertLead } from "../../_lib/notion";
import { sendLeadAck, sendAdminNotification } from "../../_lib/resend";
import { triggerPaperclipResearchAgent } from "../../_lib/paperclip";

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
    after(() => sendAdminNotification(input, inserted));
    after(() => triggerPaperclipResearchAgent(inserted, input));
    return NextResponse.json(
      { ok: true, ackEmail: "deferred", leadId: inserted.pageId },
      { status: 202 }
    );
  }

  // Admin ping + paperclip webhook fire async.
  after(() => sendAdminNotification(input, inserted));
  after(() => triggerPaperclipResearchAgent(inserted, input));

  return NextResponse.json({ ok: true, leadId: inserted.pageId });
}
