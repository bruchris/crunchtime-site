"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useBookingModal } from "../../_components/BookingModal/BookingModal";

export function BriefHandoffCallout({
  excerpt
}: {
  excerpt: string;
  // bookingHref kept for API compatibility but unused — modal uses provider's URL
  bookingHref?: string;
}) {
  const t = useTranslations("services.briefHandoff");
  const [open, setOpen] = useState(true);
  const { open: openBooking } = useBookingModal();
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
        <button
          type="button"
          onClick={openBooking}
          className="rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
        >
          {t("cta")} →
        </button>
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
