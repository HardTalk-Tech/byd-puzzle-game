import { gameConfig, rewardConfig, type GiftId } from "@/config/game";
import type { PlayerRecord } from "@/lib/types";

/**
 * Place for a game finished within the time: 16 moves = 1st, 18 = 2nd,
 * 20 = 3rd … 26 = 6th, 28 = 7th, with no upper limit.
 * Returns null for impossible scores (below the optimum).
 */
export function placeForMoves(moves: number, optimal: number = gameConfig.optimalMoves): number | null {
  const extra = moves - optimal;
  if (!Number.isInteger(moves) || extra < 0) return null;
  return Math.floor(extra / rewardConfig.movesPerPlace) + 1;
}

/** Gift for a place: 1st–3rd umbrella, 4th–6th bag, 7th–10th cap, then pen. */
export function giftForPlace(place: number): GiftId {
  const tier = rewardConfig.gifts.find((t) => place <= t.maxPlace) ?? rewardConfig.gifts[rewardConfig.gifts.length - 1];
  return tier.gift;
}

/** 1 → "1st", 2 → "2nd", 3 → "3rd", 4 → "4th" … */
export function ordinal(n: number): string {
  const suffix = n % 100 >= 11 && n % 100 <= 13 ? "th" : (["th", "st", "nd", "rd"][n % 10] ?? "th");
  return `${n}${suffix}`;
}

export const isPodium = (place: number | null): place is number =>
  place !== null && place <= rewardConfig.podiumPlaces;

/** Place and gift for a saved player: only games finished within the time get one. */
export function rewardForPlayer(p: Pick<PlayerRecord, "status" | "moves">): { place: number; gift: GiftId } | null {
  if (p.status !== "completed" || typeof p.moves !== "number") return null;
  const place = placeForMoves(p.moves);
  return place === null ? null : { place, gift: giftForPlace(place) };
}
