"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { PuzzleTile } from "@/components/puzzle/PuzzleTile";
import { gameConfig, uiConfig } from "@/config/game";
import { useSwipe } from "@/hooks/useSwipe";
import { areAdjacent, directionBetween, directionToNeighbour, GRID, positionsOf, TILE_COUNT } from "@/lib/puzzle/board";
import type { Board, Direction, SwapMove } from "@/lib/types";
import { playTone } from "@/lib/utils/sound";

interface PuzzleBoardProps {
  board: Board;
  image: string;
  /** false = input locked (reveal, animations, win/time-up, popups). */
  interactive: boolean;
  onSwap?: (a: number, b: number) => void;
  /** Gaps closed, corners squared: the tiles merge into one picture. */
  merged?: boolean;
  highlightCorrect?: boolean;
  /** Tile move duration (defaults to swapDurationMs). */
  moveDurationMs?: number;
  /** Per-tile delay step, for the reveal fly-in. */
  staggerMs?: number;
  /** Dev debug: highlight one swap. */
  hintSwap?: SwapMove | null;
  className?: string;
}

interface ShakeState {
  position: number;
  key: number;
}

/**
 * The 4×4 board. Tiles are absolutely positioned with transforms and keyed
 * by tileId, so a swap just exchanges two positions and both tiles animate.
 * Input: swipe a tile towards a neighbour, or tap-tap two neighbours.
 */
export function PuzzleBoard({
  board,
  image,
  interactive,
  onSwap,
  merged = false,
  highlightCorrect = gameConfig.highlightCorrectTiles,
  moveDurationMs = gameConfig.swapDurationMs,
  staggerMs = 0,
  hintSwap = null,
  className = "",
}: PuzzleBoardProps) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [shake, setShake] = useState<ShakeState>({ position: -1, key: 0 });
  const busyUntil = useRef(0);
  const gestureStart = useRef<{ position: number; wasSelected: boolean } | null>(null);

  const positions = useMemo(() => positionsOf(board), [board]);
  const activeSelection = interactive ? selected : null;

  // Tap-tap selection clears after a few seconds.
  useEffect(() => {
    if (selected === null) return;
    const t = setTimeout(() => setSelected(null), uiConfig.tapSelectionTimeoutMs);
    return () => clearTimeout(t);
  }, [selected]);

  const isBusy = () => performance.now() < busyUntil.current;

  const doSwap = useCallback(
    (a: number, b: number) => {
      busyUntil.current = performance.now() + gameConfig.swapDurationMs;
      setSelected(null);
      playTone("swap");
      onSwap?.(a, b);
    },
    [onSwap],
  );

  const positionFromPoint = (clientX: number, clientY: number): number | null => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return null;
    const col = Math.floor(((clientX - rect.left) / rect.width) * GRID);
    const row = Math.floor(((clientY - rect.top) / rect.height) * GRID);
    if (col < 0 || col >= GRID || row < 0 || row >= GRID) return null;
    return row * GRID + col;
  };

  const handlers = useSwipe({
    getTileSize: () => (boardRef.current?.getBoundingClientRect().width ?? 0) / GRID,
    onStart: (e: PointerEvent<HTMLElement>) => {
      if (!interactive || isBusy()) return false;
      const position = positionFromPoint(e.clientX, e.clientY);
      if (position === null) return false;
      // Second tap of tap-tap: a highlighted neighbour swaps straight away.
      if (selected !== null && areAdjacent(selected, position)) {
        doSwap(selected, position);
        gestureStart.current = null;
        return false;
      }
      gestureStart.current = { position, wasSelected: selected === position };
      setSelected(position);
      return true;
    },
    onSwipe: (direction: Direction) => {
      const start = gestureStart.current;
      gestureStart.current = null;
      if (!start || !interactive) return;
      const target = directionToNeighbour(start.position, direction);
      if (target === null) {
        // Swiping off the board edge: shake, no move counted.
        setSelected(null);
        setShake((s) => ({ position: start.position, key: s.key + 1 }));
        playTone("bump");
        return;
      }
      doSwap(start.position, target);
    },
    onTap: () => {
      const start = gestureStart.current;
      gestureStart.current = null;
      // Tapping the selected tile again deselects it.
      if (start?.wasSelected) setSelected(null);
    },
    onCancel: () => {
      gestureStart.current = null;
      setSelected(null);
    },
  });

  const tiles = [];
  for (let tileId = 0; tileId < TILE_COUNT; tileId++) {
    const position = positions[tileId];
    const targetDirection =
      activeSelection !== null && areAdjacent(activeSelection, position)
        ? directionBetween(activeSelection, position)
        : null;
    tiles.push(
      <PuzzleTile
        key={tileId}
        tileId={tileId}
        position={position}
        image={image}
        correct={highlightCorrect && position === tileId}
        lifted={activeSelection === position}
        targetDirection={targetDirection}
        hinted={hintSwap !== null && (hintSwap[0] === position || hintSwap[1] === position)}
        merged={merged}
        shakeKey={shake.position === position ? shake.key : 0}
        moveDurationMs={moveDurationMs}
        moveDelayMs={staggerMs * tileId}
      />,
    );
  }

  return (
    <div
      ref={boardRef}
      className={`puzzle-board ${className}`}
      role="grid"
      aria-label="Puzzle board"
      aria-disabled={!interactive}
      {...handlers}
    >
      {tiles}
    </div>
  );
}
