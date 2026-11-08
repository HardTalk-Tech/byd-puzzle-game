"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HintBar } from "@/components/hud/HintBar";
import { PrizeBanner } from "@/components/hud/PrizeBanner";
import { MoveCounter } from "@/components/hud/MoveCounter";
import { TargetCard } from "@/components/hud/TargetCard";
import { TimeChip } from "@/components/hud/TimeChip";
import { TimerBar } from "@/components/hud/TimerBar";
import { DebugOverlay } from "@/components/kiosk/DebugOverlay";
import { RoundLayout } from "@/components/kiosk/RoundLayout";
import { BoardFrame } from "@/components/puzzle/BoardFrame";
import { PuzzleBoard } from "@/components/puzzle/PuzzleBoard";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { StatChip } from "@/components/ui/StatChip";
import type { Car } from "@/config/cars";
import { gameConfig, uiConfig } from "@/config/game";
import { messages } from "@/content/messages";
import { useCountdown } from "@/hooks/useCountdown";
import { useTimeouts } from "@/hooks/useTimeouts";
import { isSolved, solvedBoard, swap } from "@/lib/puzzle/board";
import type { Board, RoundResult, Scramble, SwapMove } from "@/lib/types";
import { playTone } from "@/lib/utils/sound";

type Phase = "playing" | "won" | "timeup";

interface GameScreenProps {
  car: Car;
  image: string;
  scramble: Scramble;
  onFinish: (result: RoundResult) => void;
}

const DEBUG_AVAILABLE = process.env.NODE_ENV !== "production";

export function GameScreen({ car, image, scramble, onFinish }: GameScreenProps) {
  const [board, setBoard] = useState<Board>(scramble.board);
  const [moves, setMoves] = useState(0);
  const [phase, setPhase] = useState<Phase>("playing");
  const [merged, setMerged] = useState(false);
  const [celebrate, setCelebrate] = useState(false);
  const [moveDuration, setMoveDuration] = useState<number>(gameConfig.swapDurationMs);
  const [peeking, setPeeking] = useState(false);
  // Dev-only debug mode (?debug=1). Never available in a production build.
  const [debug] = useState(
    () => DEBUG_AVAILABLE && typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1",
  );
  const [hint, setHint] = useState<SwapMove | null>(null);
  const [autoSolving, setAutoSolving] = useState(false);

  // Live values for event handlers (never stale between renders).
  const live = useRef({ board: scramble.board, moves: 0, phase: "playing" as Phase });
  const onFinishRef = useRef(onFinish);
  useEffect(() => {
    onFinishRef.current = onFinish;
  });
  const { schedule } = useTimeouts();

  const handleTimeUp = useCallback(() => {
    const s = live.current;
    if (s.phase !== "playing") return;
    s.phase = "timeup";
    setPhase("timeup");
    playTone("timeup");
    setHint(null);
    // Tiles slide into the right places so the player still sees the car.
    setMoveDuration(uiConfig.timeUpSolveMs);
    setBoard(solvedBoard());
    schedule(() => setMerged(true), uiConfig.timeUpSolveMs);
    schedule(
      () => onFinishRef.current({ outcome: "timeout", moves: s.moves, timeMs: gameConfig.timeLimitSeconds * 1000 }),
      uiConfig.timeUpSolveMs + uiConfig.timeUpPauseMs,
    );
  }, [schedule]);

  const clock = useCountdown(gameConfig.timeLimitSeconds * 1000, handleTimeUp);

  // The timer starts when this screen appears, right after "GO!".
  useEffect(() => {
    clock.start();
  }, [clock]);

  const handleSwap = useCallback(
    (a: number, b: number) => {
      const s = live.current;
      if (s.phase !== "playing") return;
      const next = swap(s.board, a, b);
      s.board = next;
      s.moves += 1;
      setBoard(next);
      setMoves(s.moves);
      setHint(null);

      if (isSolved(next)) {
        const timeMs = clock.stop();
        s.phase = "won";
        setPhase("won");
        playTone("win");
        const outcome = s.moves === gameConfig.optimalMoves ? "perfect" : "completed";
        const merge = gameConfig.swapDurationMs;
        schedule(() => setMerged(true), merge);
        schedule(() => setCelebrate(true), merge + uiConfig.winMergeMs);
        schedule(
          () => onFinishRef.current({ outcome, moves: s.moves, timeMs }),
          merge + uiConfig.winMergeMs + uiConfig.winSweepMs,
        );
      }
    },
    [clock, schedule],
  );

  // Debug: boards along the stored optimal solution, to find the next best move.
  const solutionPath = useMemo(
    () => (debug ? scramble.solution.reduce<Board[]>((path, [a, b]) => [...path, swap(path[path.length - 1], a, b)], [scramble.board]) : []),
    [debug, scramble],
  );
  const step = solutionPath.findIndex((b) => b.every((tile, p) => tile === board[p]));
  const solutionStep = step >= 0 && step < scramble.solution.length ? step : null;
  const nextMove = solutionStep === null ? null : scramble.solution[solutionStep];

  const autoSolve = () => {
    if (solutionStep === null) return;
    setAutoSolving(true);
    const remaining = scramble.solution.slice(solutionStep);
    const gap = gameConfig.swapDurationMs + 120;
    remaining.forEach(([a, b], i) => schedule(() => handleSwap(a, b), gap * (i + 1)));
  };

  const interactive = phase === "playing" && !autoSolving && !peeking;

  return (
    <>
      <RoundLayout
        header={
          <>
            <BrandLogo className="h-[max(22px,3.6cqw)]" />
            <span className="font-display gold-text text-k-xs font-bold">{gameConfig.gameTitle}</span>
          </>
        }
        top={
          <>
            <div className="h-[50%]">
              <TargetCard modelName={car.name} image={image} onPeekChange={setPeeking} />
            </div>
            {/* Short prize reminder, visible the whole game. */}
            <div className="flex h-[14%] items-center justify-center pt-[1.4cqw]">
              <PrizeBanner />
            </div>
            <div className="flex h-[28%] items-stretch gap-[2.5cqw] pt-[1.4cqw]">
              <TimeChip clock={clock} className="flex-[1.15]" />
              <MoveCounter moves={moves} className="flex-1" />
              <StatChip
                label={messages.labels.best}
                value={gameConfig.optimalMoves}
                tone="gold"
                size="sm"
                className="flex-[0.7]"
              />
            </div>
            <div className="flex h-[8%] items-center pt-[1cqw]">
              <div className="h-[max(6px,1.1cqw)] w-full">
                <TimerBar clock={clock} />
              </div>
            </div>
          </>
        }
        board={
          <>
            <BoardFrame glow={celebrate || phase !== "playing"} sweep={celebrate}>
              <PuzzleBoard
                board={board}
                image={image}
                interactive={interactive}
                onSwap={handleSwap}
                merged={merged}
                moveDurationMs={moveDuration}
                hintSwap={hint}
              />
            </BoardFrame>
            <AnimatePresence>
              {peeking && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className="gold-frame glow-strong pointer-events-none absolute inset-0 z-20"
                >
                  <Image
                    src={image}
                    alt={car.name}
                    width={1200}
                    height={1200}
                    unoptimized
                    draggable={false}
                    className="h-full w-full rounded-[clamp(10px,2cqw,30px)] object-cover"
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        }
        bottom={<HintBar />}
      />
      {DEBUG_AVAILABLE && debug && phase === "playing" && (
        <DebugOverlay
          scrambleId={scramble.id}
          nextMove={nextMove}
          autoSolving={autoSolving}
          onHint={() => setHint(nextMove)}
          onAutoSolve={autoSolve}
        />
      )}
    </>
  );
}
