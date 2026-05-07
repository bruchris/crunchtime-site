"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routing, type Locale } from "../../../i18n/routing";

const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function persistLocale(locale: Locale) {
  if (typeof document === "undefined") return;
  document.cookie = `NEXT_LOCALE=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

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
          onClick={() => persistLocale(loc)}
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
