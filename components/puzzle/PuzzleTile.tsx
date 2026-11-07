import { memo, type CSSProperties } from "react";
import { ChevronIcon } from "@/components/icons/ChevronIcon";
import { TILE_BACKGROUND_SIZE, TILE_SIZE_PERCENT, tileBackgroundPosition, tileTransform } from "@/lib/puzzle/tileStyle";
import type { Direction } from "@/lib/types";

const CHEVRON_ROTATION: Record<Direction, string> = { right: "0deg", down: "90deg", left: "180deg", up: "270deg" };

interface PuzzleTileProps {
  tileId: number;
  position: number;
  image: string;
  /** Tile is in its home position and highlighting is on. */
  correct: boolean;
  /** Selected / being swiped: lifted with a glow. */
  lifted: boolean;
  /** This tile is a valid swap target: the chevron points this way. */
  targetDirection: Direction | null;
  /** Debug hint highlight. */
  hinted: boolean;
  /** Gaps closed and corners squared (win / full picture). */
  merged: boolean;
  /** Increment to play the edge "no move" shake. */
  shakeKey: number;
  moveDurationMs: number;
  moveDelayMs: number;
}

/** One tile: the whole car image as background, shifted to its home slice. */
export const PuzzleTile = memo(function PuzzleTile({
  tileId,
  position,
  image,
  correct,
  lifted,
  targetDirection,
  hinted,
  merged,
  shakeKey,
  moveDurationMs,
  moveDelayMs,
}: PuzzleTileProps) {
  const outer: CSSProperties = {
    width: TILE_SIZE_PERCENT,
    height: TILE_SIZE_PERCENT,
    transform: tileTransform(position),
    transitionDuration: `${moveDurationMs}ms`,
    transitionDelay: `${moveDelayMs}ms`,
    zIndex: lifted ? 3 : targetDirection ? 2 : 1,
  };
  const face: CSSProperties = {
    backgroundImage: `url("${image}")`,
    backgroundSize: TILE_BACKGROUND_SIZE,
    backgroundPosition: tileBackgroundPosition(tileId),
    // 0.96 leaves a gap of ~1% of the board between tiles.
    transform: `scale(${lifted ? 1.05 : merged ? 1 : 0.96})`,
    borderRadius: merged ? "0%" : "3.5%",
    borderColor: merged ? "transparent" : undefined,
    boxShadow: lifted ? "0 0 24px rgba(232,200,117,.6), 0 10px 30px rgba(0,0,0,.6)" : merged ? "none" : undefined,
  };

  return (
    <div className="puzzle-tile" style={outer} data-tile={tileId} data-pos={position}>
      <div key={shakeKey} className={`absolute inset-0 ${shakeKey > 0 ? "tile-shake" : ""}`}>
        <div className="puzzle-tile-face" style={face}>
          <div className="tile-correct-edge" data-on={correct && !merged}>
            <span className="tile-tick" />
          </div>
          {(targetDirection || hinted) && <div className="tile-neighbour-ring" />}
          {targetDirection && (
            <ChevronIcon
              className="tile-chevron"
              style={{ "--chevron-rotate": CHEVRON_ROTATION[targetDirection] } as CSSProperties}
            />
          )}
        </div>
      </div>
    </div>
  );
});
