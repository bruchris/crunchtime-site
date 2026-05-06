"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

export function BriefHandoffCallout({
  excerpt,
  bookingHref
}: {
  excerpt: string;
  bookingHref: string;
}) {
  const t = useTranslations("services.briefHandoff");
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <aside
      role="complementary"
      className="mx-auto mt-4 flex max-w-5xl flex-col gap-4 border border-[var(--color-accent)]/40 bg-[var(--color-accent)]/8 px-5 py-4 sm:mx-8 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:px-6"
    >
      <div className="text-sm leading-6">
        <span className="text-[var(--color-muted)]">{t("prefix")}</span>{" "}
        <span className="font-medium text-[var(--color-fg)]">&ldquo;{excerpt}&rdquo;</span>.{" "}
        <span className="text-[var(--color-muted)]">{t("ask")}</span>
      </div>
      <div className="flex items-center gap-3">
        <a
          href={bookingHref}
          className="rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          {t("cta")} →
        </a>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label={t("dismiss")}
          className="rounded-sm border border-white/12 px-3 py-2 font-mono text-xs text-[var(--color-muted)] hover:bg-white/5"
        >
          ×
        </button>
      </div>
    </aside>
  );
}
