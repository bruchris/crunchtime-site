"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import type { BriefResponse } from "../../../_lib/briefSchema";

interface Props {
  brief: string;
  payload: BriefResponse;
  lang: "no" | "en";
}

type Status = "idle" | "sending" | "ok" | "err";

export function EmailCaptureForm({ brief, payload, lang }: Props) {
  const t = useTranslations("endCard.form");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const submittingRef = useRef(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Fix 1: race guard — prevent double-submit that disabled buttons can't fully prevent.
    if (submittingRef.current) return;
    submittingRef.current = true;

    const form = e.currentTarget;
    const fd = new FormData(form);

    // Client-side honeypot guard — silently succeed for bots.
    // The server also runs isHoneypotTriggered() independently.
    if (fd.get("company_phone")) {
      submittingRef.current = false;
      setStatus("ok");
      return;
    }

    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          company: fd.get("company"),
          website: fd.get("website"),
          // Route schema field is `notes` (plan draft said `note` — route wins).
          notes: fd.get("notes"),
          // Route schema field is `demoPayload` (plan draft said `payload` — route wins).
          demoPayload: payload,
          // Route schema field is `language` (plan draft said `lang` — route wins).
          language: lang,
          brief,
          source: "brief-box-v1",
          company_phone: fd.get("company_phone") ?? "",
        }),
      });
      if (!res.ok) {
        // Fix 3: surface specific validation issues from the API response.
        let specificMsg: string | null = null;
        try {
          const body = await res.json();
          if (Array.isArray(body?.issues) && body.issues.length > 0) {
            specificMsg = body.issues[0]?.message ?? null;
          }
        } catch {
          // JSON parse failed — fall through to generic error.
        }
        setErrorMsg(specificMsg);
        throw new Error(`status ${res.status}`);
      }
      setStatus("ok");
      form.reset();
    } catch {
      setStatus("err");
    } finally {
      submittingRef.current = false;
    }
  }

  if (status === "ok") {
    return (
      <p className={styles.emailSuccess} role="status">
        {t("success")}
      </p>
    );
  }

  const isSending = status === "sending";

  return (
    <form className={styles.emailForm} onSubmit={onSubmit} noValidate>
      <input
        className={styles.emailField}
        name="name"
        required
        placeholder={t("name")}
        autoComplete="name"
        aria-label={t("name")}
        disabled={isSending}
      />
      <input
        className={styles.emailField}
        name="email"
        type="email"
        required
        placeholder={t("email")}
        autoComplete="email"
        aria-label={t("email")}
        disabled={isSending}
      />
      <input
        className={styles.emailField}
        name="company"
        required
        placeholder={t("company")}
        autoComplete="organization"
        aria-label={t("company")}
        disabled={isSending}
      />
      <input
        className={styles.emailField}
        name="website"
        type="url"
        required
        placeholder={t("website")}
        autoComplete="url"
        aria-label={t("website")}
        disabled={isSending}
      />
      {/*
        Field name is `notes` to match /api/lead leadInputSchema.
        Translation key is `note` (matches messages/en.json and messages/no.json).
      */}
      <input
        className={styles.emailField}
        name="notes"
        placeholder={t("note")}
        aria-label={t("note")}
        disabled={isSending}
      />

      {/* Honeypot: visually and programmatically hidden; real users never see it */}
      <input
        className={styles.honeypot}
        name="company_phone"
        tabIndex={-1}
        aria-hidden="true"
        autoComplete="off"
      />

      <button
        type="submit"
        className={styles.ctaPrimary}
        disabled={isSending}
      >
        {isSending ? t("sending") : t("submit")}
      </button>

      {status === "err" && (
        <p className={styles.emailError} role="alert">
          {errorMsg ?? t("error")}
        </p>
      )}
    </form>
  );
}
