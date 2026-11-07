import { gameConfig } from "@/config/game";
import type { Board, Direction, SwapMove } from "@/lib/types";

/** Pure puzzle logic. A board is board[position] = tileId. */

export const GRID = gameConfig.gridSize;
export const TILE_COUNT = GRID * GRID;

export const rowOf = (p: number) => Math.floor(p / GRID);
export const colOf = (p: number) => p % GRID;

const isPosition = (p: number) => Number.isInteger(p) && p >= 0 && p < TILE_COUNT;

export function solvedBoard(): Board {
  return Array.from({ length: TILE_COUNT }, (_, i) => i);
}

/** The neighbouring position in a direction, or null at the board edge. */
export function directionToNeighbour(p: number, dir: Direction): number | null {
  if (!isPosition(p)) return null;
  const r = rowOf(p);
  const c = colOf(p);
  switch (dir) {
    case "up":
      return r > 0 ? p - GRID : null;
    case "down":
      return r < GRID - 1 ? p + GRID : null;
    case "left":
      return c > 0 ? p - 1 : null;
    case "right":
      return c < GRID - 1 ? p + 1 : null;
  }
}

export const DIRECTIONS: Direction[] = ["up", "down", "left", "right"];

/** Positions next to p (up, down, left, right order, edges skipped). */
export function neighbours(p: number): number[] {
  return DIRECTIONS.map((d) => directionToNeighbour(p, d)).filter((n): n is number => n !== null);
}

export function areAdjacent(a: number, b: number): boolean {
  if (!isPosition(a) || !isPosition(b) || a === b) return false;
  return Math.abs(rowOf(a) - rowOf(b)) + Math.abs(colOf(a) - colOf(b)) === 1;
}

/** Direction from a to its neighbour b, or null if not adjacent. */
export function directionBetween(a: number, b: number): Direction | null {
  return DIRECTIONS.find((d) => directionToNeighbour(a, d) === b) ?? null;
}

/** Returns a new board with the tiles at a and b exchanged. */
export function swap(board: Board, a: number, b: number): Board {
  const next = board.slice();
  next[a] = board[b];
  next[b] = board[a];
  return next;
}

export function isTileCorrect(board: Board, p: number): boolean {
  return board[p] === p;
}

export function isSolved(board: Board): boolean {
  return board.length === TILE_COUNT && board.every((tile, p) => tile === p);
}

/** positionOfTile[tileId] = current position. */
export function positionsOf(board: Board): number[] {
  const positions = new Array<number>(board.length);
  board.forEach((tile, p) => {
    positions[tile] = p;
  });
  return positions;
}

/** Sum over tiles of the Manhattan distance to the tile's home. */
export function manhattanSum(board: Board): number {
  return board.reduce((sum, tile, p) => sum + Math.abs(rowOf(tile) - rowOf(p)) + Math.abs(colOf(tile) - colOf(p)), 0);
}

export function misplacedCount(board: Board): number {
  return board.reduce((n, tile, p) => n + (tile !== p ? 1 : 0), 0);
}

export function isPermutation(board: Board): boolean {
  return board.length === TILE_COUNT && new Set(board).size === TILE_COUNT && board.every(isPosition);
}

/** Applies a list of swaps; throws if a swap is not between neighbours. */
export function applySwaps(board: Board, swaps: SwapMove[]): Board {
  return swaps.reduce((b, [a, c]) => {
    if (!areAdjacent(a, c)) throw new Error(`Swap ${a}↔${c} is not between neighbours`);
    return swap(b, a, c);
  }, board);
}
