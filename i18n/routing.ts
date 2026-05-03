import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["no", "en"] as const,
  defaultLocale: "no",
  localePrefix: "always",
  localeCookie: {
    name: "NEXT_LOCALE",
    maxAge: 60 * 60 * 24 * 365 // 1 year
  }
});

export type Locale = (typeof routing.locales)[number];
