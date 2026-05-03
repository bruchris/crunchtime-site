import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CursorEffect } from "./_components/CursorEffect";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://crunchtime.no"),
  title: {
    default: "Crunchtime — Your AI team, hired and running",
    template: "%s · Crunchtime"
  },
  description:
    "Crunchtime builds and manages AI agent teams for businesses. Norwegian AI agency based in Bergen.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Crunchtime",
    url: "https://crunchtime.no"
  },
  twitter: {
    card: "summary_large_image"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="page-shell flex min-h-screen flex-col antialiased">
        <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(10,10,9,0.84)] backdrop-blur-xl">
          <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
            <Link href="/" className="font-display flex items-center text-lg font-extrabold tracking-tight">
              Crunch<span className="text-[var(--color-accent)]">time</span>
            </Link>
            <ul className="hidden gap-8 text-sm text-[var(--color-muted)] sm:flex">
              <li>
                <Link href="/#how-it-works" className="hover:text-[var(--color-fg)]">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#agents" className="hover:text-[var(--color-fg)]">
                  Agents
                </Link>
              </li>
              <li>
                <Link href="/consulting" className="hover:text-[var(--color-fg)]">
                  Consulting
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--color-fg)]">
                  Book a call
                </Link>
              </li>
            </ul>
            <Link
              href="/contact"
              className="rounded-sm bg-[var(--color-accent)] px-4 py-2 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
            >
              Get started
            </Link>
          </nav>
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/8 bg-[var(--color-surface)]">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-10 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between sm:px-8">
            <div>
              <p className="font-display text-base font-extrabold text-[var(--color-fg)]">
                Crunch<span className="text-[var(--color-accent)]">time</span>
              </p>
              <p className="mt-1">Norwegian AI agency · Bergen, Norway</p>
              <p className="mt-1 text-xs opacity-70">Built on Paperclip.</p>
            </div>
            <div className="flex flex-wrap gap-5">
              <Link href="/#how-it-works" className="hover:text-[var(--color-fg)]">
                How it works
              </Link>
              <Link href="/consulting" className="hover:text-[var(--color-fg)]">
                Consulting
              </Link>
              <Link href="/contact" className="hover:text-[var(--color-fg)]">
                Book a call
              </Link>
              <a href="https://paperclip.ing/" className="hover:text-[var(--color-fg)]">
                paperclip.ing
              </a>
            </div>
            <p>© {new Date().getFullYear()} Crunchtime</p>
          </div>
        </footer>
        <CursorEffect />
      </body>
    </html>
  );
}
