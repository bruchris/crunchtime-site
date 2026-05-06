import { getTranslations } from "next-intl/server";

const ITEMS = [
  "safety",
  "messy",
  "waiting",
  "ownership",
  "team",
  "languages",
  "industries",
  "starting"
] as const;

export async function FaqList({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.faq" });
  return (
    <section className="border-t border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
          {t("headline")}
        </h2>
        <ul className="mt-12 divide-y divide-white/8 border-y border-white/8">
          {ITEMS.map((item) => (
            <li key={item}>
              <details className="group py-6">
                <summary className="flex cursor-pointer items-center justify-between gap-6 font-display text-base font-bold tracking-tight sm:text-lg">
                  <span>{t(`items.${item}.q`)}</span>
                  <span
                    aria-hidden
                    className="font-mono text-2xl text-[var(--color-muted)] transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--color-muted)] sm:text-base">
                  {t(`items.${item}.a`)}
                </p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
