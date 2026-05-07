import { getTranslations } from "next-intl/server";

const KEYS = ["automation", "strategy", "implementation"] as const;

export async function ServicesGrid({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.servicesGrid" });
  return (
    <section className="border-y border-white/8 bg-[var(--color-surface)]">
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
          {t("sectionLabel")}
        </p>
        <ul className="mt-12 grid gap-px bg-white/8 sm:grid-cols-3">
          {KEYS.map((key) => (
            <li
              key={key}
              id={key}
              className="group relative bg-[var(--color-surface)] p-8 transition-colors duration-300 hover:bg-[#15150f]"
            >
              <p className="font-mono text-xs text-[var(--color-muted)]">
                {t(`items.${key}.number`)}
              </p>
              <h3 className="font-display mt-6 text-2xl font-bold tracking-tight">
                <span className="relative inline-block">
                  {t(`items.${key}.title`)}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -bottom-1 left-0 h-[2px] w-0 bg-[var(--color-accent)] transition-[width] duration-500 ease-out group-hover:w-full"
                  />
                </span>
              </h3>
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                {t(`items.${key}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
