"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode
} from "react";

interface BookingModalContextValue {
  open: () => void;
  close: () => void;
  isOpen: boolean;
}

const BookingModalContext = createContext<BookingModalContextValue | null>(null);

export function useBookingModal(): BookingModalContextValue {
  const ctx = useContext(BookingModalContext);
  if (!ctx) {
    throw new Error("useBookingModal must be used inside <BookingModalProvider>");
  }
  return ctx;
}

// One provider per locale layout. Wraps the booking iframe in a modal so
// /services CTAs pop the calendar in place instead of routing visitors
// out to calendar.google.com (which costs them their browsing context).
//
// We deliberately do NOT use Google's scheduling-button-script.js: it
// would force its own button styling (blue rounded button) and break the
// brand. An iframe of the same booking URL gives the same scheduling
// flow inside our own UI.
export function BookingModalProvider({
  bookingHref,
  closeLabel,
  children
}: {
  bookingHref: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  // Lock background scroll so the iframe is the only thing the user can
  // interact with while the modal is open.
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isOpen]);

  // Esc closes — basic dialog accessibility.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, close]);

  return (
    <BookingModalContext.Provider value={{ open, close, isOpen }}>
      {children}
      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Booking"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm sm:p-8"
        >
          <div className="relative w-full max-w-3xl">
            <button
              type="button"
              onClick={close}
              aria-label={closeLabel}
              className="absolute -top-11 right-0 rounded-sm border border-white/15 bg-black/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.18em] text-[var(--color-fg)] backdrop-blur hover:border-[var(--color-accent)]/60 hover:bg-white/5"
            >
              {closeLabel} ✕
            </button>
            <iframe
              title="Crunchtime booking calendar"
              src={bookingHref}
              loading="eager"
              className="block h-[80vh] max-h-[780px] w-full rounded-md border border-white/15 bg-white"
            />
          </div>
        </div>
      ) : null}
    </BookingModalContext.Provider>
  );
}
