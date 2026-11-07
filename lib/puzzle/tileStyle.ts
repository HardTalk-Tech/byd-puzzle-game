import { colOf, GRID, rowOf } from "@/lib/puzzle/board";

/**
 * Background-position maths for one tile. Each tile shows the whole car
 * image at 400% size, shifted to the slice of its HOME position (tileId).
 */
export function tileBackgroundPosition(tileId: number): string {
  const step = 100 / (GRID - 1);
  return `${colOf(tileId) * step}% ${rowOf(tileId) * step}%`;
}

export const TILE_BACKGROUND_SIZE = `${GRID * 100}% ${GRID * 100}%`;

/**
 * Transform that places a tile (sized 1/GRID of the board) at a position.
 * Percentages in translate() are relative to the tile itself, so one cell
 * is exactly 100%.
 */
export function tileTransform(position: number): string {
  return `translate3d(${colOf(position) * 100}%, ${rowOf(position) * 100}%, 0)`;
}

export const TILE_SIZE_PERCENT = `${100 / GRID}%`;
