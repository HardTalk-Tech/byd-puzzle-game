import { describe, expect, it } from "vitest";
import { isPodium, ordinal, placeForMoves } from "@/lib/puzzle/placing";

describe("prize places", () => {
  it("maps 16/18/20/22/24 moves to 1st–5th", () => {
    expect([16, 18, 20, 22, 24].map((m) => placeForMoves(m))).toEqual([1, 2, 3, 4, 5]);
  });

  it("gives no place from 26 moves up", () => {
    expect(placeForMoves(26)).toBeNull();
    expect(placeForMoves(40)).toBeNull();
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
    expect([1, 2, 3, 4, 5, 11, 12, 13, 21].map(ordinal)).toEqual(["1st", "2nd", "3rd", "4th", "5th", "11th", "12th", "13th", "21st"]);
  });
});
