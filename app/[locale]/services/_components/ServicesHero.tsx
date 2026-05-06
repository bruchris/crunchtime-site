import { getTranslations } from "next-intl/server";

export async function ServicesHero({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "services.hero" });
  return (
    <section className="mx-auto max-w-5xl px-5 pt-20 pb-16 sm:px-8 sm:pt-28 sm:pb-24">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--color-accent)]">
        {t("eyebrow")}
      </p>
      <h1 className="font-display mt-6 text-balance text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl">
        {t("headline")}
      </h1>
      <p className="mt-7 max-w-2xl text-lg font-light leading-8 text-[var(--color-muted)] sm:text-xl">
        {t("subline")}
      </p>
    </section>
  );
}
