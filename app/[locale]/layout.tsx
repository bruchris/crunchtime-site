import type { Metadata, Viewport } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CursorEffect } from "../_components/CursorEffect";
import { LocaleToggle } from "./_components/LocaleToggle";
import { BookingModalProvider } from "./_components/BookingModal/BookingModal";
import { routing, type Locale } from "../../i18n/routing";
import {
  JsonLd,
  organizationSchema,
  websiteSchema,
  founderSchema
} from "../_lib/jsonLd";
import "../globals.css";

const BOOKING_FALLBACK =
  "https://calendar.google.com/calendar/appointments/schedules/AcZssZ3I8SZIfyI8qMSoX5wo0tY3dlfxajUj0eDlrgpzpN29AcUzDT3EEyQmH9PJpCjZ-Q0-DrtAX5oa?gv=true";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700", "800"]
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["300", "400", "500", "700"]
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500"]
});

export const viewport: Viewport = {
  themeColor: "#0a0a09"
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "footer" });

  return {
    metadataBase: new URL("https://crunchtime.no"),
    title: {
      default: "Crunchtime",
      template: "%s · Crunchtime"
    },
    description: t("tagline"),
    alternates: {
      canonical: `/${locale}`,
      languages: {
        no: "/no",
        en: "/en",
        "x-default": "/no"
      }
    },
    openGraph: {
      type: "website",
      locale: locale === "no" ? "nb_NO" : "en_US",
      siteName: "Crunchtime",
      url: `https://crunchtime.no/${locale}`
    },
    twitter: { card: "summary_large_image" }
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "nav" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const tBooking = await getTranslations({ locale, namespace: "booking" });
  const bookingHref = process.env.NEXT_PUBLIC_CAL_BOOKING_LINK ?? BOOKING_FALLBACK;
  const navItems = [
    { href: `/${locale}/services`, label: t("services") },
    { href: `/${locale}/cases`, label: t("cases") },
    { href: `/${locale}/insights`, label: t("insights") },
    { href: `/${locale}/contact`, label: t("contact") }
  ];

  return (
    <html lang={locale} className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable}`} data-scroll-behavior="smooth">
      <body className="page-shell flex min-h-screen flex-col antialiased">
        <JsonLd
          data={[
            organizationSchema(),
            websiteSchema(locale as Locale),
            founderSchema()
          ]}
        />
        <NextIntlClientProvider>
         <BookingModalProvider bookingHref={bookingHref} closeLabel={tBooking("close")}>
          <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[rgba(10,10,9,0.35)] backdrop-blur-2xl backdrop-saturate-150">
            <nav className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-5 py-4 sm:px-8">
              <Link href={`/${locale}`} className="font-display flex items-center text-lg font-extrabold tracking-tight">
                Crunch<span className="text-[var(--color-accent)]">time</span>
              </Link>
              <ul className="hidden gap-8 text-sm text-[var(--color-muted)] sm:flex">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="hover:text-[var(--color-fg)]">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-3 sm:gap-4">
                <LocaleToggle currentLocale={locale as Locale} />
                <Link
                  href={`/${locale}/contact`}
                  className="hidden rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)] sm:inline-flex"
                >
                  {t("cta")}
                </Link>
                <details className="group relative sm:hidden">
                  <summary className="flex list-none items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-fg)] marker:hidden [&::-webkit-details-marker]:hidden">
                    <span className="flex h-3.5 w-4 flex-col justify-between" aria-hidden>
                      <span className="block h-px w-full bg-current" />
                      <span className="block h-px w-full bg-current" />
                      <span className="block h-px w-full bg-current" />
                    </span>
                    Menu
                  </summary>
                  <div className="absolute right-0 top-[calc(100%+0.75rem)] w-[min(18rem,calc(100vw-2.5rem))] rounded-2xl border border-white/10 bg-[rgba(14,14,13,0.96)] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
                    <div className="flex flex-col gap-2 text-sm text-[var(--color-muted)]">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="rounded-xl border border-transparent px-3 py-2 hover:border-white/10 hover:bg-white/[0.04] hover:text-[var(--color-fg)]"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/${locale}/contact`}
                      className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
                    >
                      {t("cta")}
                    </Link>
                  </div>
                </details>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-white/8 bg-[var(--color-surface)]">
            <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 text-sm text-[var(--color-muted)] sm:grid-cols-[1fr_auto] sm:px-8">
              <div>
                <p className="font-display text-base font-extrabold text-[var(--color-fg)]">
                  Crunch<span className="text-[var(--color-accent)]">time</span>
                </p>
                <p className="mt-1 max-w-md">{tFooter("tagline")}</p>
              </div>
              <nav aria-label={t("services")} className="grid grid-cols-2 gap-x-10 gap-y-2 sm:justify-end sm:text-right">
                <Link href={`/${locale}/services`} className="hover:text-[var(--color-fg)]">
                  {t("services")}
                </Link>
                <Link href={`/${locale}/cases`} className="hover:text-[var(--color-fg)]">
                  {t("cases")}
                </Link>
                <Link href={`/${locale}/insights`} className="hover:text-[var(--color-fg)]">
                  {t("insights")}
                </Link>
                <Link href={`/${locale}/facts`} className="hover:text-[var(--color-fg)]">
                  {locale === "no" ? "Fakta" : "Facts"}
                </Link>
                <Link href={`/${locale}/ordliste`} className="hover:text-[var(--color-fg)]">
                  {locale === "no" ? "Ordliste" : "Glossary"}
                </Link>
                <Link href={`/${locale}/contact`} className="hover:text-[var(--color-fg)]">
                  {t("contact")}
                </Link>
                <a href="/llms-full.txt" className="font-mono text-xs hover:text-[var(--color-fg)]" rel="alternate" type="text/markdown">
                  llms-full.txt
                </a>
              </nav>
            </div>
            <div className="border-t border-white/8">
              <p className="mx-auto max-w-7xl px-5 py-5 text-xs text-[var(--color-muted)] sm:px-8">
                © {new Date().getFullYear()} Crunchtime. {tFooter("rights")}.
              </p>
            </div>
          </footer>
          <CursorEffect />
         </BookingModalProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
