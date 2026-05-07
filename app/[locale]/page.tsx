import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Locale } from "../../i18n/routing";
import { DemoStage } from "./_components/BriefBox/DemoStage";

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tFooter = await getTranslations({ locale, namespace: "footer" });

  // Plain-text version of the value prop (translation source uses <accent> markup).
  const description =
    locale === "no"
      ? "Crunchtime er et norsk AI-byrå i Bergen. Beskriv en utfordring — vi setter sammen et team av agenter og viser hvordan de ville løst den. Fast pris, klar i drift på under en måned."
      : "Crunchtime is a Norwegian AI agency in Bergen. Describe a problem — we assemble a team of agents and show how they'd handle it. Fixed price, live in under a month.";

  const title =
    locale === "no"
      ? "Crunchtime — AI-team som faktisk gjør jobben"
      : "Crunchtime — AI teams that actually do the work";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://crunchtime.no/${locale}`
    },
    keywords: [
      "AI agency Norway",
      "AI agents",
      "agentic workflows",
      "workflow automation",
      "Tripletex automation",
      "Fiken automation",
      tFooter("tagline")
    ]
  };
}

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
