import { getTranslations } from "next-intl/server";

const TIERS = ["discovery", "pilot", "retainer"] as const;

export async function PricingTiers({
  locale,
  bookingHref
}: {
  locale: string;
  bookingHref: string;
}) {
  const t = await getTranslations({ locale, namespace: "services.pricing" });
  return (
    <section id="pricing" className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-muted)]">
        {t("sectionLabel")}
      </p>
      <h2 className="font-display mt-6 text-3xl font-extrabold tracking-tight sm:text-5xl">
        {t("headline")}
      </h2>
      <p className="mt-5 max-w-2xl text-base text-[var(--color-muted)]">{t("subline")}</p>
      <ul className="mt-12 grid gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const recommended = tier === "pilot";
          return (
            <li
              key={tier}
              className={
                recommended
                  ? "relative flex flex-col rounded-md border border-[var(--color-accent)] bg-[var(--color-surface)] p-7"
                  : "flex flex-col rounded-md border border-white/8 bg-[var(--color-surface)] p-7"
              }
            >
              {recommended ? (
                <span className="absolute -top-3 left-7 rounded-full bg-[var(--color-accent)] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-black">
                  {t("tiers.pilot.recommendedLabel")}
                </span>
              ) : null}
              <h3 className="font-display text-xl font-bold tracking-tight">
                {t(`tiers.${tier}.name`)}
              </h3>
              <p className="font-display mt-5 text-3xl font-extrabold text-[var(--color-accent)]">
                {t(`tiers.${tier}.price`)}
              </p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-muted)]">
                {t(`tiers.${tier}.duration`)}
              </p>
              <p className="mt-5 text-sm font-medium leading-6">{t(`tiers.${tier}.pitch`)}</p>
              <p className="mt-4 text-sm leading-6 text-[var(--color-muted)]">
                {t(`tiers.${tier}.detail`)}
              </p>
              <a
                href={bookingHref}
                className={
                  recommended
                    ? "mt-7 inline-block rounded-sm bg-[var(--color-accent)] px-4 py-3 text-center text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
                    : "mt-7 inline-block rounded-sm border border-white/15 px-4 py-3 text-center text-sm font-bold hover:bg-white/5"
                }
              >
                {t(`tiers.${tier}.cta`)}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
