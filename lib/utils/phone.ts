import { PHONE_MAX_DIGITS, PHONE_MIN_DIGITS } from "@/config/game";

const PHONE_PATTERN = new RegExp(`^\\d{${PHONE_MIN_DIGITS},${PHONE_MAX_DIGITS}}$`);

/** Removes spaces (and other whitespace) from a typed number. */
export function normalizePhone(input: string): string {
  return input.replace(/\s+/g, "");
}

/** 9 or 10 digits after removing spaces. No other rules. */
export function isValidPhone(input: string): boolean {
  return PHONE_PATTERN.test(normalizePhone(input));
}

/**
 * Groups digits for display (also while typing):
 * 10 digits "0712345678" → "071 234 5678", 9 digits "712345678" → "712 345 678".
 */
export function formatPhone(digits: string): string {
  const d = normalizePhone(digits);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");
}
