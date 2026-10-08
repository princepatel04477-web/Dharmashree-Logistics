/* Indian formatting (house rule 13). */

export function formatNumberIN(value: number): string {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

/** "+919876543210" → "+91 98765 43210". Returns input unchanged if unparseable. */
export function formatPhoneIN(e164: string): string {
  const digits = e164.replace(/\D/g, "");
  const national = digits.startsWith("91") ? digits.slice(2) : digits;
  if (national.length !== 10) return e164;
  return `+91 ${national.slice(0, 5)} ${national.slice(5)}`;
}

/** "2026-10-15" → "15 Oct 2026" for the review panel. Built from the parts as a
    local date, so a date-only string cannot shift a day in a negative offset.
    Returns input unchanged if unparseable. */
export function formatDateIN(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (match === null) return iso;
  const [, year, month, day] = match;
  if (year === undefined || month === undefined || day === undefined) return iso;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
