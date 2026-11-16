import { describe, expect, it } from "vitest";
import { giftForPlace, isPodium, ordinal, placeForMoves, rewardForPlayer } from "@/lib/puzzle/placing";

describe("places", () => {
  it("maps every 2 moves to the next place, with no upper limit", () => {
    expect([16, 18, 20, 22, 24, 26, 28, 34, 36, 50].map((m) => placeForMoves(m))).toEqual([1, 2, 3, 4, 5, 6, 7, 10, 11, 18]);
  });

  it("rejects impossible scores below the optimum", () => {
    expect(placeForMoves(15)).toBeNull();
    expect(placeForMoves(0)).toBeNull();
  });

  it("marks 1st–3rd as the podium", () => {
    expect(isPodium(1)).toBe(true);
    expect(isPodium(3)).toBe(true);
    expect(isPodium(4)).toBe(false);
    expect(isPodium(null)).toBe(false);
  });

  it("formats ordinals", () => {
    expect([1, 2, 3, 4, 5, 11, 12, 13, 21, 22, 23].map(ordinal)).toEqual([
      "1st", "2nd", "3rd", "4th", "5th", "11th", "12th", "13th", "21st", "22nd", "23rd",
    ]);
  });
});

describe("gifts", () => {
  it("1st–3rd umbrella, 4th–6th bag, 7th–10th cap, then pen", () => {
    const gifts = Array.from({ length: 14 }, (_, i) => giftForPlace(i + 1));
    expect(gifts).toEqual([
      "umbrella", "umbrella", "umbrella",
      "bag", "bag", "bag",
      "cap", "cap", "cap", "cap",
      "pen", "pen", "pen", "pen",
    ]);
    expect(giftForPlace(99)).toBe("pen");
  });

  it("only games finished within the time get a place and gift", () => {
    expect(rewardForPlayer({ status: "completed", moves: 16 })).toEqual({ place: 1, gift: "umbrella" });
    expect(rewardForPlayer({ status: "completed", moves: 26 })).toEqual({ place: 6, gift: "bag" });
    expect(rewardForPlayer({ status: "completed", moves: 34 })).toEqual({ place: 10, gift: "cap" });
    expect(rewardForPlayer({ status: "completed", moves: 36 })).toEqual({ place: 11, gift: "pen" });
    expect(rewardForPlayer({ status: "timeout", moves: 20 })).toBeNull();
    expect(rewardForPlayer({ status: "playing" })).toBeNull();
  });
});
