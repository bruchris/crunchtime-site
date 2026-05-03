import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["no", "en"] as const,
  defaultLocale: "no",
  localePrefix: "always"
});

export type Locale = (typeof routing.locales)[number];
