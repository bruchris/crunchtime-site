import { getTranslations } from "next-intl/server";

const STEPS = ["discovery", "strategy", "build", "followup"] as const;

export async function ProcessSteps({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.process" });
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {t("sectionLabel")}
      </p>
      <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {t("headline")}
      </h2>
      <ol className="mt-14 divide-y divide-white/8 border-y border-white/8">
        {STEPS.map((step) => (
          <li
            key={step}
            className="group grid grid-cols-[auto_1fr] gap-8 py-10 transition-colors duration-300 hover:bg-white/[0.02] sm:grid-cols-[140px_1fr] sm:gap-12 sm:py-14"
          >
            <span className="font-display text-4xl font-extrabold text-[var(--color-muted)] transition-colors duration-300 group-hover:text-[var(--color-accent)] sm:text-6xl">
              {t(`steps.${step}.number`)}
            </span>
            <div>
              <h3 className="font-display text-xl font-bold tracking-tight sm:text-2xl">
                {t(`steps.${step}.title`)}
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--color-muted)] sm:text-base sm:leading-7">
                {t(`steps.${step}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
