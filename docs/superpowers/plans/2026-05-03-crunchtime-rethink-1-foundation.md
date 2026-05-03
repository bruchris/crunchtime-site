# Crunchtime Rethink — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bilingual route scaffolding (`/no` default, `/en` toggle), test infrastructure (Vitest + Playwright), removal of `/back-office/finance`, cursor color tweak. Existing pages keep working under the new locale routes. Foundation for subsequent plans.

**Architecture:** Wrap all pages in an `app/[locale]/...` route group using `next-intl` middleware. Locale detection via `Accept-Language` header → cookie → URL prefix. Existing page content unchanged in this plan — only the route structure and language scaffolding move. Add Vitest (unit) + Playwright (E2E) so plans #2–4 have a TDD harness.

**Tech Stack:** Next.js 16 (App Router), `next-intl` v4, Vitest v3, `@playwright/test` v1.50+, TypeScript 5.6, npm.

**Spec reference:** [docs/superpowers/specs/2026-05-03-crunchtime-rethink-design.md](../specs/2026-05-03-crunchtime-rethink-design.md) — sections "Bilingual implementation", "What gets removed", "What gets added" (foundation subset only).

---

## File Structure

**New files:**
- `i18n/request.ts` — next-intl per-request configuration (locale + messages loader).
- `i18n/routing.ts` — defines supported locales and default.
- `middleware.ts` — locale detection + URL rewrite at the edge.
- `messages/no.json` — Norwegian message catalog (seed only; full content lands in plans #2–4).
- `messages/en.json` — English message catalog (seed).
- `app/[locale]/layout.tsx` — replaces `app/layout.tsx`, wraps in `NextIntlClientProvider`.
- `app/[locale]/page.tsx` — moved from `app/page.tsx`.
- `app/[locale]/consulting/page.tsx` — moved from `app/consulting/page.tsx`.
- `app/[locale]/contact/page.tsx` — moved from `app/contact/page.tsx`.
- `app/[locale]/contact/actions.ts` — moved from `app/contact/actions.ts`.
- `app/[locale]/_components/LocaleToggle.tsx` — NO|EN toggle pill in nav.
- `app/[locale]/sitemap.ts` — moved from `app/sitemap.ts`, emits both locales.
- `vitest.config.ts` — Vitest setup.
- `playwright.config.ts` — Playwright setup.
- `tests/unit/.gitkeep`, `tests/e2e/.gitkeep` — test directory placeholders.
- `tests/e2e/routing.spec.ts` — E2E for locale routing + redirects + 404.
- `tests/e2e/locale-toggle.spec.ts` — E2E for the language toggle.
- `tests/unit/middleware.test.ts` — unit test for locale detection logic if extracted.

**Modified:**
- `next.config.mjs` — wire up `next-intl` plugin, add 301 redirects, add `/back-office/finance` rewrite to 404.
- `package.json` — new deps + new scripts (`test`, `test:e2e`).
- `app/_components/CursorEffect.tsx` — color reference change to `--color-accent` token (one-line tweak).
- `app/globals.css` — verify `--color-accent` exists; rename if needed to match spec value `#d4ef3a`.
- `.gitignore` — add `playwright-report/`, `test-results/`.
- `tsconfig.json` — add `vitest/globals` + `@playwright/test` types if needed.

**Removed:**
- `app/layout.tsx` — replaced by `app/[locale]/layout.tsx`.
- `app/page.tsx` — moved.
- `app/consulting/` — directory moved.
- `app/contact/` — directory moved.
- `app/back-office/` — directory deleted entirely.
- `app/sitemap.ts` — moved.

---

## Task 1: Add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/unit/sanity.test.ts`

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest @vitest/ui
```

Expected: dependencies added to `devDependencies` in `package.json`.

- [ ] **Step 2: Create `vitest.config.ts`**

Create the file with this exact content:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
    globals: false
  }
});
```

- [ ] **Step 3: Add npm script**

Edit `package.json`. Inside the `"scripts"` block, add the `test` and `test:watch` entries (preserve existing scripts):

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

- [ ] **Step 4: Write a sanity test**

Create `tests/unit/sanity.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("sanity", () => {
  it("runs vitest", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 5: Run the sanity test**

Run: `npm test`
Expected: 1 test, 1 pass.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/unit/sanity.test.ts
git commit -m "chore: add vitest with sanity test"
```

---

## Task 2: Add Playwright

**Files:**
- Modify: `package.json`
- Create: `playwright.config.ts`
- Create: `tests/e2e/sanity.spec.ts`
- Modify: `.gitignore`

- [ ] **Step 1: Install Playwright**

```bash
npm install --save-dev @playwright/test
npx playwright install --with-deps chromium
```

Expected: `@playwright/test` in `devDependencies`; Chromium browser binary downloaded.

- [ ] **Step 2: Create `playwright.config.ts`**

```ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } }
  ],
  webServer: {
    command: "npm run build && npm run start -- -p 3000",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000
  }
});
```

- [ ] **Step 3: Update `.gitignore`**

Append these lines (do not duplicate existing entries):

```
playwright-report/
test-results/
/playwright/.cache/
```

- [ ] **Step 4: Add npm script**

Edit `package.json` `"scripts"` block, add:

```json
"test:e2e": "playwright test"
```

The full scripts block now reads:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

- [ ] **Step 5: Write a sanity E2E test**

Create `tests/e2e/sanity.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test("home page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Crunchtime/);
});
```

- [ ] **Step 6: Run the E2E sanity test**

Run: `npm run test:e2e`
Expected: 1 test passes. The webServer starts Next, the test hits `/`, the title check passes.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json playwright.config.ts tests/e2e/sanity.spec.ts .gitignore
git commit -m "chore: add playwright with sanity test"
```

---

## Task 3: Install next-intl

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install next-intl**

```bash
npm install next-intl@^4
```

Expected: `next-intl` in `dependencies`.

- [ ] **Step 2: Verify install**

Run: `npm ls next-intl`
Expected: a version `4.x.x` listed.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install next-intl"
```

---

## Task 4: Define supported locales

**Files:**
- Create: `i18n/routing.ts`
- Create: `i18n/request.ts`
- Create: `messages/no.json`
- Create: `messages/en.json`

- [ ] **Step 1: Create routing config**

Create `i18n/routing.ts`:

```ts
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["no", "en"] as const,
  defaultLocale: "no",
  localePrefix: "always"
});

export type Locale = (typeof routing.locales)[number];
```

- [ ] **Step 2: Create request config**

Create `i18n/request.ts`:

```ts
import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = (routing.locales as readonly string[]).includes(requested ?? "")
    ? requested!
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
```

- [ ] **Step 3: Create seed Norwegian catalog**

Create `messages/no.json`:

```json
{
  "nav": {
    "home": "Hjem",
    "consulting": "Konsulent",
    "contact": "Kontakt",
    "cta": "Kom i gang"
  },
  "footer": {
    "tagline": "Norsk AI-byrå · Bergen",
    "rights": "Alle rettigheter forbeholdt"
  },
  "localeToggle": {
    "label": "Språk",
    "no": "NO",
    "en": "EN"
  }
}
```

- [ ] **Step 4: Create seed English catalog**

Create `messages/en.json`:

```json
{
  "nav": {
    "home": "Home",
    "consulting": "Consulting",
    "contact": "Contact",
    "cta": "Get started"
  },
  "footer": {
    "tagline": "Norwegian AI agency · Bergen",
    "rights": "All rights reserved"
  },
  "localeToggle": {
    "label": "Language",
    "no": "NO",
    "en": "EN"
  }
}
```

- [ ] **Step 5: Commit**

```bash
git add i18n/ messages/
git commit -m "feat(i18n): add next-intl routing config and seed message catalogs"
```

---

## Task 5: Wire next-intl into next.config

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Update next.config.mjs**

Replace the contents of `next.config.mjs` with:

```js
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot
  }
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 2: Verify build still works**

Run: `npm run build`
Expected: build completes without errors. (Pages still build at old paths since we haven't moved them yet — the next-intl plugin alone doesn't change routing.)

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat(i18n): wire next-intl plugin into next.config"
```

---

## Task 6: Add the locale-detection middleware

**Files:**
- Create: `middleware.ts`

- [ ] **Step 1: Write the routing E2E test first**

Create `tests/e2e/routing.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("locale routing", () => {
  test("root path redirects to /no when Accept-Language is Norwegian", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "Accept-Language": "no,nb;q=0.9,en;q=0.8" });
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/no\/?$/);
  });

  test("root path redirects to /en when Accept-Language is English", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "Accept-Language": "en-US,en;q=0.9" });
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/en\/?$/);
  });

  test("root path falls back to /no when Accept-Language is exotic", async ({ page }) => {
    await page.context().setExtraHTTPHeaders({ "Accept-Language": "ja-JP" });
    const response = await page.goto("/");
    expect(response?.url()).toMatch(/\/no\/?$/);
  });

  test("/no/consulting renders Norwegian consulting page", async ({ page }) => {
    await page.goto("/no/consulting");
    await expect(page).toHaveURL(/\/no\/consulting/);
  });

  test("/en/consulting renders English consulting page", async ({ page }) => {
    await page.goto("/en/consulting");
    await expect(page).toHaveURL(/\/en\/consulting/);
  });
});
```

- [ ] **Step 2: Run the test, expect it to fail**

Run: `npm run test:e2e -- --grep "locale routing"`
Expected: tests FAIL — middleware doesn't exist, locale routes don't exist.

- [ ] **Step 3: Create middleware**

Create `middleware.ts` at the repo root (next to `package.json`):

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};
```

This matcher excludes API routes, Next internals, Vercel internals, and any path containing a dot (static files). All other requests pass through next-intl's locale middleware.

- [ ] **Step 4: Run tests again — they will still fail because pages aren't moved yet**

Run: `npm run test:e2e -- --grep "locale routing"`
Expected: redirect tests now PASS (middleware redirects to /no or /en); /no/consulting and /en/consulting tests FAIL (pages still at /consulting).

This is intentional — Task 7 moves the pages.

- [ ] **Step 5: Commit middleware**

```bash
git add middleware.ts
git commit -m "feat(i18n): add locale-detection middleware"
```

---

## Task 7: Move pages under [locale] route group

**Files:**
- Move: `app/page.tsx` → `app/[locale]/page.tsx`
- Move: `app/consulting/page.tsx` → `app/[locale]/consulting/page.tsx`
- Move: `app/contact/page.tsx` → `app/[locale]/contact/page.tsx`
- Move: `app/contact/actions.ts` → `app/[locale]/contact/actions.ts`
- Move: `app/sitemap.ts` → `app/[locale]/sitemap.ts`
- Move: `app/layout.tsx` → `app/[locale]/layout.tsx` (with edits)
- Move: `app/not-found.tsx` → `app/[locale]/not-found.tsx`

- [ ] **Step 1: Create the directory and move files**

Run these git commands (preserves history):

```bash
mkdir -p "app/[locale]"
git mv app/page.tsx "app/[locale]/page.tsx"
git mv app/consulting "app/[locale]/consulting"
git mv app/contact "app/[locale]/contact"
git mv app/sitemap.ts "app/[locale]/sitemap.ts"
git mv app/not-found.tsx "app/[locale]/not-found.tsx"
git mv app/layout.tsx "app/[locale]/layout.tsx"
```

- [ ] **Step 2: Update imports in moved files**

Imports of `./_components/...` from `app/[locale]/layout.tsx` need to become `../_components/...`:

Edit `app/[locale]/layout.tsx`. Find:
```ts
import { CursorEffect } from "./_components/CursorEffect";
```
Replace with:
```ts
import { CursorEffect } from "../_components/CursorEffect";
```

Find `import "./globals.css";` → replace with `import "../globals.css";`.

- [ ] **Step 3: Update `app/[locale]/layout.tsx` to accept the `locale` param and wrap in NextIntlClientProvider**

Replace the entire file with:

```tsx
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
    <html lang={locale} className={`${syne.variable} ${dmSans.variable}`}>
      <body className="page-shell flex min-h-screen flex-col antialiased">
        <NextIntlClientProvider>
          <header className="sticky top-0 z-50 border-b border-white/8 bg-[rgba(10,10,9,0.84)] backdrop-blur-xl">
            <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
              <Link href={`/${locale}`} className="font-display flex items-center text-lg font-extrabold tracking-tight">
                Crunch<span className="text-[var(--color-accent)]">time</span>
              </Link>
              <ul className="hidden gap-8 text-sm text-[var(--color-muted)] sm:flex">
                <li>
                  <Link href={`/${locale}/consulting`} className="hover:text-[var(--color-fg)]">
                    {t("consulting")}
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
```

- [ ] **Step 4: Delete the empty `app/back-office` directory**

```bash
git rm -r app/back-office
```

Confirm with `git status` — should show deletion of `app/back-office/finance/page.tsx`.

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: build succeeds. Routes shown in output should be `/[locale]`, `/[locale]/consulting`, `/[locale]/contact` and a 404 for `/back-office/*`.

If build fails on missing `LocaleToggle` import — that's expected; Task 8 creates it. Comment out the import + usage temporarily, finish this task, then uncomment in Task 8. Or do Task 8 first, then this step. Either order works.

- [ ] **Step 6: Run E2E routing tests**

Run: `npm run test:e2e -- --grep "locale routing"`
Expected: ALL routing tests pass — root redirects work, `/no/consulting` and `/en/consulting` resolve.

- [ ] **Step 7: Commit**

```bash
git add app/ messages/
git commit -m "feat(i18n): move pages under [locale] route group, delete back-office"
```

---

## Task 8: Build the locale toggle component

**Files:**
- Create: `app/[locale]/_components/LocaleToggle.tsx`
- Create: `tests/e2e/locale-toggle.spec.ts`

- [ ] **Step 1: Write the toggle E2E test first**

Create `tests/e2e/locale-toggle.spec.ts`:

```ts
import { test, expect } from "@playwright/test";

test.describe("locale toggle", () => {
  test("toggles from /no to /en and persists in cookie", async ({ page, context }) => {
    await page.goto("/no");
    await page.getByRole("link", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en\/?$/);

    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(localeCookie?.value).toBe("en");
  });

  test("toggling preserves the current page path", async ({ page }) => {
    await page.goto("/no/consulting");
    await page.getByRole("link", { name: "EN" }).click();
    await expect(page).toHaveURL(/\/en\/consulting/);
  });
});
```

- [ ] **Step 2: Run test, expect failure**

Run: `npm run test:e2e -- --grep "locale toggle"`
Expected: FAIL — no toggle exists yet.

- [ ] **Step 3: Create the LocaleToggle component**

Create `app/[locale]/_components/LocaleToggle.tsx`:

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";

export function LocaleToggle({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  const switchPath = (target: Locale) => {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && (routing.locales as readonly string[]).includes(segments[0])) {
      segments[0] = target;
    } else {
      segments.unshift(target);
    }
    return "/" + segments.join("/");
  };

  return (
    <div className="flex items-center gap-1 text-xs font-mono">
      {routing.locales.map((loc) => (
        <Link
          key={loc}
          href={switchPath(loc)}
          aria-current={loc === currentLocale ? "true" : undefined}
          className={
            loc === currentLocale
              ? "text-[var(--color-accent)]"
              : "text-[var(--color-muted)] hover:text-[var(--color-fg)]"
          }
        >
          {loc.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
```

The cookie persistence is handled by next-intl middleware — it sets `NEXT_LOCALE` automatically when locale changes via URL.

- [ ] **Step 4: Verify import in `app/[locale]/layout.tsx`**

If you commented it out in Task 7 step 5, uncomment now:

```ts
import { LocaleToggle } from "./_components/LocaleToggle";
```

And the JSX:
```tsx
<LocaleToggle currentLocale={locale as Locale} />
```

- [ ] **Step 5: Run tests, expect pass**

Run: `npm run test:e2e -- --grep "locale toggle"`
Expected: both toggle tests PASS.

- [ ] **Step 6: Commit**

```bash
git add app/ tests/
git commit -m "feat(i18n): add locale toggle component"
```

---

## Task 9: Update the moved sitemap to emit both locales

**Files:**
- Modify: `app/[locale]/sitemap.ts`

- [ ] **Step 1: Replace the sitemap content**

Read the current `app/[locale]/sitemap.ts` first (it was moved from `app/sitemap.ts` and likely lists routes without locales). Replace with:

```ts
import type { MetadataRoute } from "next";
import { routing } from "../../i18n/routing";

const PATHS = ["", "/consulting", "/contact"];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://crunchtime.no";
  const now = new Date();

  return routing.locales.flatMap((locale) =>
    PATHS.map((path) => ({
      url: `${base}/${locale}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1.0 : 0.8,
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((alt) => [alt, `${base}/${alt}${path}`])
        )
      }
    }))
  );
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev` (in another terminal). Visit `http://localhost:3000/no/sitemap.xml`. Expected: XML lists 6 URLs (3 paths × 2 locales) with `<xhtml:link rel="alternate">` tags.

Stop the dev server.

- [ ] **Step 3: Commit**

```bash
git add app/[locale]/sitemap.ts
git commit -m "feat(i18n): emit both locales in sitemap with hreflang alternates"
```

---

## Task 10: Update the cursor effect color reference

**Files:**
- Modify: `app/_components/CursorEffect.tsx`
- Modify: `app/globals.css` (verify token only)

- [ ] **Step 1: Read CursorEffect to find color reference**

Run: `grep -n "color\|accent\|#" app/_components/CursorEffect.tsx | head -30`
Look for any hardcoded hex values like `#a3e635` or references to `--color-accent`.

- [ ] **Step 2: Verify `--color-accent` exists in globals.css**

Run: `grep -n "color-accent" app/globals.css`
Expected: at least one `--color-accent: #...;` definition.

If the value is **NOT** `#d4ef3a`, update it:

Edit `app/globals.css`. Find the line `--color-accent: #...;` and change to:
```css
--color-accent: #d4ef3a;
```

If `--color-accent-strong` exists, also set:
```css
--color-accent-strong: #a8c41a;
```

- [ ] **Step 3: Replace any hardcoded cursor color with the token**

In `app/_components/CursorEffect.tsx`, if you find any hardcoded color (e.g. `background: "#a3e635"` or similar), replace it with `var(--color-accent)`. If the cursor styling is in `globals.css` instead, ensure those rules use `var(--color-accent)` not a hex.

- [ ] **Step 4: Manual verify**

Run `npm run dev`, visit `http://localhost:3000/no` in a desktop browser, move your mouse — cursor dot should be lime `#d4ef3a`. Stop the dev server.

- [ ] **Step 5: Commit**

```bash
git add app/_components/CursorEffect.tsx app/globals.css
git commit -m "feat: align cursor effect color with new accent token"
```

---

## Task 11: Add 301 redirect for legacy /consulting bare path

**Files:**
- Modify: `next.config.mjs`
- Modify: `tests/e2e/routing.spec.ts`

Note: in this plan, `/consulting` becomes `/[locale]/consulting` so the bare path no longer exists. Without a redirect, any old link to `https://crunchtime.no/consulting` would 404 (after middleware). We add a redirect that sends bare `/consulting` to `/no/consulting` (the default locale variant). Same for `/contact`.

- [ ] **Step 1: Add redirect tests**

Append to `tests/e2e/routing.spec.ts` (inside the existing `describe` block, before the closing brace):

```ts
  test("/consulting (bare) 301-redirects to /no/consulting", async ({ page }) => {
    const response = await page.goto("/consulting", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/consulting/);
  });

  test("/contact (bare) 301-redirects to /no/contact", async ({ page }) => {
    const response = await page.goto("/contact", { waitUntil: "domcontentloaded" });
    expect(response?.url()).toMatch(/\/no\/contact/);
  });

  test("/back-office/finance returns 404", async ({ page }) => {
    const response = await page.goto("/back-office/finance");
    expect(response?.status()).toBe(404);
  });
```

- [ ] **Step 2: Run tests, expect failure on the back-office and bare-redirect cases**

Run: `npm run test:e2e -- --grep "routing"`
Expected: middleware likely already routes bare paths through default locale redirect — but explicit `redirects()` is more reliable for old URLs and emits a real 301. The back-office test depends on whether middleware passes it through; either way, an explicit handler is cleaner.

- [ ] **Step 3: Add redirects to next.config**

Edit `next.config.mjs`. Add a `redirects()` function inside the config:

```js
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import createNextIntlPlugin from "next-intl/plugin";

const projectRoot = dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    root: projectRoot
  },
  async redirects() {
    return [
      { source: "/consulting", destination: "/no/consulting", permanent: true },
      { source: "/contact", destination: "/no/contact", permanent: true }
    ];
  }
};

export default withNextIntl(nextConfig);
```

The `/back-office/finance` 404 happens automatically because the directory was deleted in Task 7.

- [ ] **Step 4: Run tests, expect pass**

Run: `npm run test:e2e -- --grep "routing"`
Expected: all routing tests pass, including the three new ones.

- [ ] **Step 5: Commit**

```bash
git add next.config.mjs tests/e2e/routing.spec.ts
git commit -m "feat(routing): 301 bare /consulting and /contact to /no variants; verify 404 for /back-office"
```

---

## Task 12: Verify full build + lint + types

**Files:**
- (verification only)

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: no errors. Warnings about console statements are OK; fix any errors.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: production build succeeds. Output should list:
- `/[locale]` (dynamic, includes `/no` and `/en`)
- `/[locale]/consulting`
- `/[locale]/contact`
- `/sitemap.xml` (under each locale)
- Old paths NOT listed (no `/page` or `/consulting/page` at root)

- [ ] **Step 4: Run all unit tests**

Run: `npm test`
Expected: all pass.

- [ ] **Step 5: Run all E2E tests**

Run: `npm run test:e2e`
Expected: all pass — sanity, routing (5 tests), locale-toggle (2 tests), redirects (3 tests).

- [ ] **Step 6: Manual sanity check**

Run `npm run dev`. Visit:
- `http://localhost:3000/` — redirects to `/no` (or `/en` based on your browser's `Accept-Language`).
- `http://localhost:3000/en` — English nav labels visible.
- `http://localhost:3000/no/consulting` — Norwegian consulting page renders (existing content).
- Click NO ↔ EN toggle — URL switches, page reloads with translated nav, cookie set.
- `http://localhost:3000/back-office/finance` — 404.
- Cursor effect: lime dot follows mouse.

Stop the dev server.

- [ ] **Step 7: Commit any final fixes**

If lint/typecheck/build surfaced issues that needed fixes, commit them now:

```bash
git add -A
git commit -m "fix: foundation plan cleanup"
```

If nothing needed fixing, skip this step.

---

## Self-Review Checklist (run after writing the plan)

Run this on yourself before handing the plan to an executor.

**1. Spec coverage** — does the plan implement these spec sections?

- [x] "Bilingual implementation" → Tasks 3–9
- [x] "What gets removed: `/back-office/finance`" → Task 7 step 4
- [x] "Cursor: existing CursorEffect carries forward, color updated to `--accent`" → Task 10
- [x] "Bilingual: routes `/no/...` and `/en/...`, root redirects via Accept-Language, cookie persists" → Tasks 6, 8
- [x] "Sitemap: both locales advertised with `hreflang`" → Task 9
- [x] "Test infrastructure" (implicit prerequisite for plans #2–4) → Tasks 1, 2

**Out of scope for this plan (covered in #2–4):**
- The Brief Box demo, `/api/brief`, canned templates, animation scheduler — Plan #2.
- New `/services` content + simplified `/contact` — Plan #3.
- Lead capture, `/api/lead`, Notion + Resend + Paperclip webhook — Plan #4.

**2. Placeholder scan** — confirmed none of:
- "TBD", "TODO", "implement later" — all task content is concrete.
- "Add appropriate error handling" — only the spec-defined fallback (404, 301) is in scope.
- "Similar to Task N" without code — no such references; each task's code is self-contained.

**3. Type consistency** — `Locale` type defined in `i18n/routing.ts`, imported consistently; `currentLocale` prop name matches between `LocaleToggle` definition and layout usage.

---

## Done Criteria

When all 12 tasks are complete:

- The site has bilingual scaffolding: `/no/...` (default) and `/en/...` (toggle) with cookie persistence.
- `Accept-Language`-based redirect at root.
- Existing pages (home, consulting, contact) render unchanged content but at new URLs.
- `/back-office/finance` returns 404.
- `/consulting` and `/contact` (bare) 301 to `/no/consulting` and `/no/contact`.
- Cursor effect uses the `#d4ef3a` accent color.
- Vitest + Playwright wired in with `npm test` and `npm run test:e2e`.
- All tests green; build, lint, typecheck pass.
- Foundation is in place for Plan #2 (Brief Box demo) to build on top.

---

## Next plan

After this lands and is reviewed, Plan #2 (`docs/superpowers/plans/2026-05-03-crunchtime-rethink-2-briefbox.md`) builds the Brief Box demo at `/[locale]/page.tsx`, replacing the current home content with the new design. Plans #3 and #4 follow.
