'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NavItem {
  href: string;
  label: string;
}

interface MobileNavProps {
  items: NavItem[];
  ctaHref: string;
  ctaLabel: string;
}

export function MobileNav({ items, ctaHref, ctaLabel }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-label="Toggle navigation"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-[var(--color-fg)]"
      >
        <span className="flex h-3.5 w-4 flex-col justify-between" aria-hidden="true">
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
          <span className="block h-px w-full bg-current" />
        </span>
        Menu
      </button>

      {open && (
        /* Fixed overlay — renders at root stacking context, outside header's compositing layer */
        <div
          className="fixed inset-0 z-[60]"
          onClick={() => setOpen(false)}
        >
          {/* Scrim */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Panel — solid background guaranteed outside header stacking context */}
          <div
            className="absolute right-4 top-[4.5rem] w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 p-4 shadow-[0_32px_80px_rgba(0,0,0,0.8)]"
            style={{ background: '#1a1a18' }}
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex flex-col gap-1 text-sm text-[var(--color-muted)]">
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-transparent px-3 py-2.5 hover:border-white/10 hover:bg-white/[0.04] hover:text-[var(--color-fg)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href={ctaHref}
              onClick={() => setOpen(false)}
              className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-accent)] px-4 py-3 text-sm font-bold text-black hover:bg-[var(--color-accent-strong)]"
            >
              {ctaLabel}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
