import { getTranslations } from "next-intl/server";

export async function CtaBanner({
  locale,
  bookingHref
}: {
  locale: string;
  bookingHref: string;
}) {
  const t = await getTranslations({ locale, namespace: "services.ctaBanner" });
  return (
    <section className="bg-[var(--color-accent)] text-black">
      <div className="mx-auto flex max-w-5xl flex-col items-start gap-6 px-5 py-16 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {t("headline")}
          </h2>
          <p className="mt-3 text-base font-medium leading-7 text-black/80">{t("subline")}</p>
        </div>
        <a
          href={bookingHref}
          className="rounded-sm bg-black px-6 py-4 text-sm font-bold text-[var(--color-accent)] hover:bg-[#1a1a18]"
        >
          {t("button")}
        </a>
      </div>
    </section>
  );
}
