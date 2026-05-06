import { getTranslations } from "next-intl/server";

const ITEMS = ["hours", "throughput", "errors", "speed"] as const;

export async function ResultsGrid({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.results" });
  return (
    <section className="border-y border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {t("headline")}
        </h2>
        <ul className="mt-12 grid gap-px bg-white/8 sm:grid-cols-2">
          {ITEMS.map((item) => (
            <li key={item} className="bg-[var(--color-surface)] p-8 sm:p-10">
              <span className="inline-flex items-center rounded-full border border-white/12 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t(`items.${item}.tag`)}
              </span>
              <p className="font-display mt-6 text-5xl font-extrabold text-[var(--color-accent)] sm:text-6xl">
                {t(`items.${item}.number`)}
              </p>
              <p className="mt-2 text-sm font-medium text-[var(--color-fg)]">
                {t(`items.${item}.label`)}
              </p>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
                {t(`items.${item}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
