import { gameConfig, rewardConfig } from "@/config/game";

/**
 * Prize place for a solved game: 16 moves = 1st, 18 = 2nd … 24 = 5th.
 * Returns null when the score is outside the prize places.
 */
export function placeForMoves(moves: number, optimal: number = gameConfig.optimalMoves): number | null {
  const extra = moves - optimal;
  if (!Number.isInteger(moves) || extra < 0) return null;
  const place = Math.floor(extra / rewardConfig.movesPerPlace) + 1;
  return place <= rewardConfig.places ? place : null;
}

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th" … */
export function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
}

export const isPodium = (place: number | null): place is number =>
  place !== null && place <= rewardConfig.podiumPlaces;
