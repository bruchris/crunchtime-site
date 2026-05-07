import { Resend } from "resend";
import type { LeadInput } from "./leadSchema";
import type { InsertedLead } from "./notion";
import { LeadAckNo } from "./emails/leadAck.no";
import { LeadAckEn } from "./emails/leadAck.en";
import { AdminLeadEmail } from "./emails/adminLead";

const FROM = process.env.CONTACT_FROM ?? "Crunchtime <noreply@crunchtime.no>";
const REPLY_TO = process.env.CONTACT_INBOX ?? "christian@crunchtime.no";
const ADMIN_INBOX = process.env.CONTACT_INBOX ?? "christian@crunchtime.no";

let _client: Resend | null = null;
function getClient(): Resend {
  if (_client) return _client;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not configured");
  _client = new Resend(key);
  return _client;
}

export async function sendLeadAck(input: LeadInput): Promise<void> {
  const client = getClient();
  const subject = input.language === "no"
    ? "Vi har fått brifen din — plan kommer snart"
    : "We got your brief — plan incoming";
  const react = input.language === "no"
    ? LeadAckNo({ name: input.name, brief: input.brief })
    : LeadAckEn({ name: input.name, brief: input.brief });

  const { error } = await client.emails.send({
    from: FROM, to: [input.email], replyTo: REPLY_TO, subject, react
  });
  if (error) throw new Error(`resend lead-ack failed: ${(error as { message?: string }).message ?? JSON.stringify(error)}`);
}

export async function sendAdminNotification(input: LeadInput, inserted: InsertedLead): Promise<void> {
  const client = getClient();
  const react = AdminLeadEmail({
    name: input.name, email: input.email, company: input.company, website: input.website,
    brief: input.brief, language: input.language, notionUrl: inserted.url
  });
  const { error } = await client.emails.send({
    from: FROM, to: [ADMIN_INBOX], replyTo: input.email,
    subject: `New Crunchtime lead: ${input.company}`, react
  });
  if (error) console.error("[resend] admin notification failed", error); // eslint-disable-line no-console
}
