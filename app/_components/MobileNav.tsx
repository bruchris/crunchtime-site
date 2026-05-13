'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Portaled to document.body so the overlay is NOT a descendant of the sticky
  // header. The header has backdrop-filter which makes it a containing block for
  // position:fixed children — without a portal the overlay is clipped to the
  // header's bounds and its background doesn't composite against the page.
  const overlay = open ? (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 200 }}
      onClick={() => setOpen(false)}
    >
      {/* Full-viewport scrim */}
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />

      {/* Nav panel — solid surface, no backdrop-filter needed here */}
      <div
        style={{
          position: 'absolute',
          top: '4.5rem',
          right: '1rem',
          width: 'min(18rem, calc(100vw - 2rem))',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.08)',
          background: '#1a1a18',
          padding: '1rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="rounded-xl border border-transparent px-3 py-2.5 text-sm text-[var(--color-muted)] hover:border-white/10 hover:bg-white/[0.04] hover:text-[var(--color-fg)]"
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
  ) : null;

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

      {mounted && createPortal(overlay, document.body)}
    </div>
  );
}
