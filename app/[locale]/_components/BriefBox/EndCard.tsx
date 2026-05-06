"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";
import { EmailCaptureForm } from "./EmailCaptureForm";
import type { BriefResponse } from "../../../_lib/briefSchema";

interface Props {
  visible: boolean;
  brief: string;
  payload: BriefResponse;
  lang: "no" | "en";
}

export function EndCard({ visible, brief, payload, lang }: Props) {
  const t = useTranslations("endCard");
  const [emailOpen, setEmailOpen] = useState(false);

  const calLink = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? `/${lang}/contact`;
  const isExternal = calLink.startsWith("http");
  const servicesHref = `/${lang}/services?from-brief=${encodeURIComponent(brief)}`;

  return (
    <section className={`${styles.endCard} ${visible ? styles.visible : ""}`} aria-live="polite">
      <div className={styles.endEyebrow}>{t("eyebrow")}</div>
      <h2 className={styles.endHeadline}>{payload.recommendation.headline}</h2>
      <p className={styles.endAsk}>{payload.recommendation.ask}</p>
      <div className={styles.ctaStack}>
        <a
          className={styles.ctaPrimary}
          href={calLink}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
        >
          {t("ctaBook")}
        </a>
        <a className={styles.ctaSecondary} href={servicesHref}>
          {t("ctaMore")}
        </a>
        {!emailOpen && (
          <button
            type="button"
            className={styles.ctaTertiary}
            onClick={() => setEmailOpen(true)}
            aria-expanded="false"
          >
            {t("ctaEmail")}
          </button>
        )}
        {emailOpen && <EmailCaptureForm brief={brief} payload={payload} lang={lang} />}
      </div>
    </section>
  );
}
