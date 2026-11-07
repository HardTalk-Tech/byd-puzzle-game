import { describe, expect, it } from "vitest";
import {
  applySwaps,
  areAdjacent,
  directionBetween,
  directionToNeighbour,
  isSolved,
  isTileCorrect,
  neighbours,
  positionsOf,
  solvedBoard,
  swap,
} from "@/lib/puzzle/board";
import { tileBackgroundPosition, tileTransform } from "@/lib/puzzle/tileStyle";

describe("neighbours", () => {
  it("returns 2 neighbours for corners", () => {
    expect(neighbours(0).sort((a, b) => a - b)).toEqual([1, 4]);
    expect(neighbours(3).sort((a, b) => a - b)).toEqual([2, 7]);
    expect(neighbours(12).sort((a, b) => a - b)).toEqual([8, 13]);
    expect(neighbours(15).sort((a, b) => a - b)).toEqual([11, 14]);
  });

  it("returns 3 neighbours for edges and 4 for the middle", () => {
    expect(neighbours(1).sort((a, b) => a - b)).toEqual([0, 2, 5]);
    expect(neighbours(4).sort((a, b) => a - b)).toEqual([0, 5, 8]);
    expect(neighbours(5).sort((a, b) => a - b)).toEqual([1, 4, 6, 9]);
  });

  it("never wraps around rows", () => {
    expect(neighbours(3)).not.toContain(4);
    expect(neighbours(4)).not.toContain(3);
  });
});

describe("areAdjacent", () => {
  it("accepts horizontal and vertical neighbours", () => {
    expect(areAdjacent(0, 1)).toBe(true);
    expect(areAdjacent(1, 0)).toBe(true);
    expect(areAdjacent(0, 4)).toBe(true);
    expect(areAdjacent(10, 14)).toBe(true);
  });

  it("rejects diagonals, wraps, self and far tiles", () => {
    expect(areAdjacent(0, 5)).toBe(false);
    expect(areAdjacent(3, 4)).toBe(false);
    expect(areAdjacent(7, 8)).toBe(false);
    expect(areAdjacent(6, 6)).toBe(false);
    expect(areAdjacent(0, 2)).toBe(false);
    expect(areAdjacent(-1, 0)).toBe(false);
    expect(areAdjacent(15, 16)).toBe(false);
  });
});

describe("swap", () => {
  it("returns a new array with two tiles exchanged", () => {
    const board = solvedBoard();
    const next = swap(board, 0, 1);
    expect(next).not.toBe(board);
    expect(board).toEqual(solvedBoard());
    expect(next.slice(0, 3)).toEqual([1, 0, 2]);
  });

  it("swapping twice restores the board", () => {
    const board = solvedBoard();
    expect(swap(swap(board, 5, 9), 5, 9)).toEqual(board);
  });
});

describe("solved detection", () => {
  it("detects the solved board", () => {
    expect(isSolved(solvedBoard())).toBe(true);
    expect(isSolved(swap(solvedBoard(), 14, 15))).toBe(false);
    expect(isSolved([0, 1, 2])).toBe(false);
  });

  it("detects correct tiles", () => {
    const board = swap(solvedBoard(), 0, 1);
    expect(isTileCorrect(board, 0)).toBe(false);
    expect(isTileCorrect(board, 1)).toBe(false);
    expect(isTileCorrect(board, 2)).toBe(true);
  });

  it("maps tiles to positions", () => {
    const board = swap(solvedBoard(), 0, 4);
    const pos = positionsOf(board);
    expect(pos[0]).toBe(4);
    expect(pos[4]).toBe(0);
    expect(pos[7]).toBe(7);
  });
});

describe("edge directions", () => {
  it("returns null at the edges", () => {
    expect(directionToNeighbour(0, "up")).toBeNull();
    expect(directionToNeighbour(0, "left")).toBeNull();
    expect(directionToNeighbour(3, "right")).toBeNull();
    expect(directionToNeighbour(12, "down")).toBeNull();
    expect(directionToNeighbour(15, "right")).toBeNull();
    expect(directionToNeighbour(15, "down")).toBeNull();
  });

  it("returns the neighbour inside the board", () => {
    expect(directionToNeighbour(5, "up")).toBe(1);
    expect(directionToNeighbour(5, "down")).toBe(9);
    expect(directionToNeighbour(5, "left")).toBe(4);
    expect(directionToNeighbour(5, "right")).toBe(6);
  });

  it("finds the direction between neighbours", () => {
    expect(directionBetween(5, 1)).toBe("up");
    expect(directionBetween(5, 6)).toBe("right");
    expect(directionBetween(5, 10)).toBeNull();
  });
});

describe("applySwaps", () => {
  it("rejects swaps between non-neighbours", () => {
    expect(() => applySwaps(solvedBoard(), [[0, 5]])).toThrow();
  });
});

describe("tile style", () => {
  it("slices the background by home position", () => {
    expect(tileBackgroundPosition(0)).toBe("0% 0%");
    expect(tileBackgroundPosition(15)).toBe("100% 100%");
    expect(tileBackgroundPosition(6)).toBe(`${200 / 3}% ${100 / 3}%`);
  });

  it("translates by whole cells", () => {
    expect(tileTransform(0)).toBe("translate3d(0%, 0%, 0)");
    expect(tileTransform(7)).toBe("translate3d(300%, 100%, 0)");
  });
});
