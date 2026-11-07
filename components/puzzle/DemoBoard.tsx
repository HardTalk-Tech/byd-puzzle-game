"use client";

import { useEffect, useState } from "react";
import { BoardFrame } from "@/components/puzzle/BoardFrame";
import { PuzzleBoard } from "@/components/puzzle/PuzzleBoard";
import { CARS } from "@/config/cars";
import { uiConfig } from "@/config/game";
import { solvedBoard, swap, TILE_COUNT } from "@/lib/puzzle/board";
import { loadCarImage } from "@/lib/puzzle/carImage";
import { scramblePool } from "@/lib/puzzle/scramblePool";
import type { Board } from "@/lib/types";

interface DemoState {
  image: string | null;
  board: Board;
  merged: boolean;
  moveMs: number;
  stagger: number;
  flashKey: number;
}

const randomIndex = (n: number) => Math.floor(Math.random() * n);

/**
 * Self-playing board for the start screen: a car scrambles, then rebuilds
 * itself swap by swap, flashes gold, and the next car takes over.
 */
export function DemoBoard() {
  const [state, setState] = useState<DemoState>({
    image: null,
    board: solvedBoard(),
    merged: true,
    moveMs: 0,
    stagger: 0,
    flashKey: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = setTimeout(() => {
          timers.delete(t);
          resolve();
        }, ms);
        timers.add(t);
      });
    const update = (patch: Partial<DemoState>) => {
      if (!cancelled) setState((s) => ({ ...s, ...patch }));
    };

    const run = async () => {
      let carIndex = randomIndex(CARS.length);
      while (!cancelled) {
        const car = CARS[carIndex];
        carIndex = (carIndex + 1) % CARS.length;
        const scramble = scramblePool.scrambles[randomIndex(scramblePool.scrambles.length)];
        const image = await loadCarImage(car);
        if (cancelled) return;

        // Full picture.
        update({ image, board: solvedBoard(), merged: true, moveMs: 0, stagger: 0 });
        await wait(uiConfig.demoHoldSolvedMs);
        // Split and scramble.
        update({ merged: false });
        await wait(uiConfig.demoSplitMs);
        update({ board: scramble.board, moveMs: uiConfig.demoScrambleMs, stagger: uiConfig.demoScrambleStaggerMs });
        await wait(uiConfig.demoScrambleMs + uiConfig.demoScrambleStaggerMs * TILE_COUNT + uiConfig.demoPauseMs);
        // Rebuild, one optimal swap at a time.
        let board = scramble.board;
        update({ moveMs: Math.round(uiConfig.demoStepMs * 0.85), stagger: 0 });
        for (const [a, b] of scramble.solution) {
          if (cancelled) return;
          board = swap(board, a, b);
          update({ board });
          await wait(uiConfig.demoStepMs);
        }
        // Merge + gold flash.
        update({ merged: true });
        await wait(uiConfig.demoPauseMs);
        setState((s) => (cancelled ? s : { ...s, flashKey: s.flashKey + 1 }));
        await wait(uiConfig.demoFlashMs);
      }
    };
    void run();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <BoardFrame glow={state.merged} flashKey={state.flashKey}>
      {state.image ? (
        <PuzzleBoard
          board={state.board}
          image={state.image}
          interactive={false}
          merged={state.merged}
          highlightCorrect={false}
          moveDurationMs={state.moveMs}
          staggerMs={state.stagger}
        />
      ) : (
        <div className="aspect-square w-full" />
      )}
    </BoardFrame>
  );
}
