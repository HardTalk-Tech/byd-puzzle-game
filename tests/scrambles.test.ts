import { describe, expect, it } from "vitest";
import { gameConfig } from "@/config/game";
import {
  applySwaps,
  areAdjacent,
  isPermutation,
  isSolved,
  manhattanSum,
  misplacedCount,
} from "@/lib/puzzle/board";
import { scramblePool } from "@/lib/puzzle/scramblePool";

const { scrambles, optimalMoves } = scramblePool;

describe("scramble pool", () => {
  it("has 500 entries with an optimum of 16", () => {
    expect(scrambles).toHaveLength(500);
    expect(optimalMoves).toBe(16);
    expect(gameConfig.optimalMoves).toBe(16);
  });

  it("has unique ids and unique boards", () => {
    expect(new Set(scrambles.map((s) => s.id)).size).toBe(500);
    expect(new Set(scrambles.map((s) => s.board.join(","))).size).toBe(500);
  });

  it("every board is a permutation of 0–15", () => {
    for (const s of scrambles) expect(isPermutation(s.board), s.id).toBe(true);
  });

  it("every board has at least 13 tiles out of place", () => {
    for (const s of scrambles) expect(misplacedCount(s.board), s.id).toBeGreaterThanOrEqual(13);
  });

  it("every board has a Manhattan sum of exactly 32 (lower bound 16)", () => {
    for (const s of scrambles) expect(manhattanSum(s.board), s.id).toBe(32);
  });

  it("every stored solution is 16 adjacent swaps that solve the board", () => {
    for (const s of scrambles) {
      expect(s.solution, s.id).toHaveLength(16);
      for (const [a, b] of s.solution) expect(areAdjacent(a, b), `${s.id} ${a}-${b}`).toBe(true);
      expect(isSolved(applySwaps(s.board, s.solution)), s.id).toBe(true);
    }
  });
});
