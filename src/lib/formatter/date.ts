/**
 * Formats a `Date` for display, localized to `locale`. Defaults to a medium date
 * (e.g. "Jun 10, 2026" / "10 thg 6, 2026") in a fixed UTC time zone so server-rendered
 * and client-hydrated output always agree.
 */
export function formatDate(
  date: Date,
  locale: string,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...options }).format(date);
}
