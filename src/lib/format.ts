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
