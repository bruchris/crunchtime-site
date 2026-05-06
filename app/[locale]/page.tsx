import { setRequestLocale } from "next-intl/server";
import type { Locale } from "../../i18n/routing";
import { DemoStage } from "./_components/BriefBox/DemoStage";

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="ct-grid-bg">
      <DemoStage lang={locale} />
    </div>
  );
}
