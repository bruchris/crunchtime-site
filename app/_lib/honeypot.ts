/**
 * The form renders a hidden `company_phone` text input. Real users never see
 * or fill it; bots that scrape forms by field type do. If this returns true,
 * the route returns 200 with a no-op payload — bots get a fake success.
 */
export function isHoneypotTriggered(value: string | undefined | null): boolean {
  if (!value) return false;
  return value.trim().length > 0;
}
