import { PHONE_MAX_DIGITS, PHONE_MIN_DIGITS } from "@/config/game";

/**
 * Starting with 0 → exactly 10 digits (071 234 5678).
 * Starting with any other digit → exactly 9 digits (712 345 678).
 */
const PHONE_PATTERN = new RegExp(`^(?:0\\d{${PHONE_MAX_DIGITS - 1}}|[1-9]\\d{${PHONE_MIN_DIGITS - 1}})$`);

/** Removes spaces (and other whitespace) from a typed number. */
export function normalizePhone(input: string): string {
  return input.replace(/\s+/g, "");
}

export function isValidPhone(input: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(input));
}

/** How many digits this number may have, based on its first digit (10 after a leading 0, otherwise 9). */
export function phoneMaxLength(input: string): number {
  const d = normalizePhone(input);
  return d === "" || d.startsWith("0") ? PHONE_MAX_DIGITS : PHONE_MIN_DIGITS;
}

/**
 * Groups digits for display (also while typing):
 * 10 digits "0712345678" → "071 234 5678", 9 digits "712345678" → "712 345 678".
 */
export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");
}
