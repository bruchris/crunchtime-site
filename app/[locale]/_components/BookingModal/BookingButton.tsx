"use client";

import { useBookingModal } from "./BookingModal";

// Drop-in replacement for any <a href={bookingHref}>...</a> CTA on /services
// (or anywhere else under BookingModalProvider). On click, opens the booking
// modal instead of navigating away.
export function BookingButton({
  className,
  children,
  ariaLabel
}: {
  className: string;
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  const { open } = useBookingModal();
  return (
    <button type="button" onClick={open} className={className} aria-label={ariaLabel}>
      {children}
    </button>
  );
}
