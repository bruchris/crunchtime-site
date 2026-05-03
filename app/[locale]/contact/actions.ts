"use server";

import { redirect } from "next/navigation";

const CONTACT_INBOX = process.env.CONTACT_INBOX ?? "hello@crunchtime.no";
const CONTACT_FROM = process.env.CONTACT_FROM ?? "Crunchtime <noreply@crunchtime.no>";

export async function submitContact(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();

  if (!name || !email || !message) {
    redirect("/contact?error=1");
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("contact-form: RESEND_API_KEY not configured — cannot deliver submission");
    redirect("/contact?error=1");
  }

  const subjectLine =
    subject === "backoffice-trial"
      ? `Back-Office Finance trial request — ${name}`
      : `New contact — ${name}${company ? ` (${company})` : ""}`;

  const body = [
    `From: ${name} <${email}>`,
    company ? `Company: ${company}` : null,
    "",
    message
  ]
    .filter(Boolean)
    .join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: CONTACT_FROM,
      to: [CONTACT_INBOX],
      reply_to: email,
      subject: subjectLine,
      text: body
    })
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    console.error("contact-form: resend send failed", { status: response.status, text });
    redirect("/contact?error=1");
  }

  redirect("/contact?sent=1");
}
