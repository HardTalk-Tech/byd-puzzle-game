import { gameConfig } from "@/config/game";

/** Collapses spaces and gives each word normal capitalisation: "KASUN  perera " → "Kasun Perera". */
export function formatName(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep: string, ch: string) => sep + ch.toUpperCase());
}

/** Required after trimming, at most nameMaxLength characters. */
export function isValidName(raw: string): boolean {
  const name = formatName(raw);
  return name.length > 0 && name.length <= gameConfig.nameMaxLength;
}
