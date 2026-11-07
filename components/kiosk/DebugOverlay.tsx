"use client";

import type { SwapMove } from "@/lib/types";

interface DebugOverlayProps {
  scrambleId: string;
  nextMove: SwapMove | null;
  autoSolving: boolean;
  onHint: () => void;
  onAutoSolve: () => void;
}

/**
 * Development-only helper (?debug=1 in `npm run dev`). GameScreen only
 * renders it when NODE_ENV !== "production".
 */
export function DebugOverlay({ scrambleId, nextMove, autoSolving, onHint, onAutoSolve }: DebugOverlayProps) {
  const offPath = nextMove === null;
  return (
    <div className="absolute top-[1cqh] right-[2cqw] z-50 flex flex-col gap-2 rounded-xl border border-gold-500/60 bg-black/85 p-3 text-[13px] text-ivory">
      <div className="font-mono">
        DEBUG · scramble <b className="text-gold-300">{scrambleId}</b>
      </div>
      <div className="font-mono text-mist">{offPath ? "board left the solution path" : `next: ${nextMove[0]} ↔ ${nextMove[1]}`}</div>
      <div className="flex gap-2">
        <button type="button" disabled={offPath || autoSolving} onClick={onHint} className="rounded-md bg-graphite-600 px-2 py-1 disabled:opacity-40">
          Next best move
        </button>
        <button type="button" disabled={offPath || autoSolving} onClick={onAutoSolve} className="rounded-md bg-gold-500 px-2 py-1 text-ink disabled:opacity-40">
          Auto-solve (perfect)
        </button>
      </div>
    </div>
  );
}
