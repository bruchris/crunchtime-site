import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";
import { ServicesHero } from "./_components/ServicesHero";
import { ServicesGrid } from "./_components/ServicesGrid";
import { ProcessSteps } from "./_components/ProcessSteps";
import { ResultsGrid } from "./_components/ResultsGrid";
import { PricingTiers } from "./_components/PricingTiers";
import { FaqList } from "./_components/FaqList";
import { CtaBanner } from "./_components/CtaBanner";
import { BriefHandoffCallout } from "./_components/BriefHandoffCallout";
import { briefExcerpt } from "./_lib/briefExcerpt";
import {
  JsonLd,
  SITE_URL,
  faqSchema,
  serviceSchema,
  breadcrumbSchema
} from "../../_lib/jsonLd";

const FAQ_KEYS = [
  "safety",
  "messy",
  "waiting",
  "ownership",
  "team",
  "languages",
  "industries",
  "starting"
] as const;

const SERVICE_KEYS = ["automation", "strategy", "implementation"] as const;

const BOOKING_FALLBACK =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I8SZIfyI8qMSoX5wo0tY3dlfxajUj0eDlrgpzpN29AcUzDT3EEyQmH9PJpCjZ-Q0-DrtAX5oa?gv=true";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services.meta" });
  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: `/${locale}/services`,
      languages: {
        no: "/no/services",
        en: "/en/services",
        "x-default": "/no/services"
      }
    },
    openGraph: { url: `https://crunchtime.no/${locale}/services` }
  };
}

export default async function ServicesPage({
  params,
  searchParams
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ "from-brief"?: string | string[] }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const sp = await searchParams;
  const rawBrief = Array.isArray(sp["from-brief"]) ? sp["from-brief"][0] : sp["from-brief"];
  const excerpt = briefExcerpt(rawBrief);

  const bookingHref = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? BOOKING_FALLBACK;

  const tFaq = await getTranslations({ locale, namespace: "services.faq" });
  const tGrid = await getTranslations({ locale, namespace: "services.servicesGrid" });
  const tNav = await getTranslations({ locale, namespace: "nav" });

  const pageUrl = `${SITE_URL}/${locale}/services`;

  const faq = faqSchema(
    FAQ_KEYS.map((k) => ({
      q: tFaq(`items.${k}.q`),
      a: tFaq(`items.${k}.a`),
      url: `${pageUrl}#faq-${k}`
    }))
  );

  const services = SERVICE_KEYS.map((k) =>
    serviceSchema({
      name: tGrid(`items.${k}.title`),
      description: tGrid(`items.${k}.body`),
      serviceType: tGrid(`items.${k}.title`),
      url: `${pageUrl}#${k}`
    })
  );

  const breadcrumbs = breadcrumbSchema([
    { name: "Crunchtime", url: `${SITE_URL}/${locale}` },
    { name: tNav("services"), url: pageUrl }
  ]);

  return (
    <>
      <JsonLd data={[faq, breadcrumbs, ...services]} />
      {excerpt ? (
        <BriefHandoffCallout excerpt={excerpt} bookingHref={bookingHref} />
      ) : null}
      <ServicesHero locale={locale} />
      <ServicesGrid locale={locale} />
      <ProcessSteps locale={locale} />
      <ResultsGrid locale={locale} />
      <PricingTiers locale={locale} bookingHref={bookingHref} />
      <FaqList locale={locale} />
      <CtaBanner locale={locale} bookingHref={bookingHref} />
    </>
  );
}
