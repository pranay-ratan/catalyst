const DATE_FORMAT = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
const NUMBER_FORMAT = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 2 });

/** Formats an ISO date (YYYY-MM-DD) for display. */
export function formatDate(isoDate: string): string {
  const parsed = new Date(`${isoDate}T00:00:00Z`);
  return Number.isNaN(parsed.getTime()) ? isoDate : DATE_FORMAT.format(parsed);
}

export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}
