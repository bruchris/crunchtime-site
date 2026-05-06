import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CursorEffect } from "../_components/CursorEffect";
import { LocaleToggle } from "./_components/LocaleToggle";
import { routing, type Locale } from "../../i18n/routing";
import "../globals.css";

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

  return (
    <html lang={locale} className={`${syne.variable} ${dmSans.variable}`} data-scroll-behavior="smooth">
      <body className="page-shell flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider>
          <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(10,10,9,0.84)] backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
              <Link href={`/${locale}`} className="font-display flex items-center text-lg font-extrabold tracking-tight">
                Crunch<span className="text-[var(--color-accent)]">time</span>
              </Link>
              <ul className="hidden gap-8 text-sm text-[var(--color-muted)] sm:flex">
                <li>
                  <Link href={`/${locale}/services`} className="hover:text-[var(--color-fg)]">
                    {t("services")}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/contact`} className="hover:text-[var(--color-fg)]">
                    {t("contact")}
                  </Link>
                </li>
              </ul>
              <div className="flex items-center gap-4">
                <LocaleToggle currentLocale={locale as Locale} />
                <Link
                  href={`/${locale}/contact`}
                  className="rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
                >
                  {t("cta")}
                </Link>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-white/8 bg-[var(--color-surface)]">
            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
              <div>
                <p className="font-display text-base font-extrabold text-[var(--color-fg)]">
                  Crunch<span className="text-[var(--color-accent)]">time</span>
                </p>
                <p className="mt-1">{tFooter("tagline")}</p>
              </div>
              <p>© {new Date().getFullYear()} Crunchtime. {tFooter("rights")}.</p>
            </div>
          </footer>
          <CursorEffect />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
