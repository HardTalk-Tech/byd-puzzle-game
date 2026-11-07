"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { SweepText } from "@/components/effects/SweepText";
import { RoundLayout } from "@/components/kiosk/RoundLayout";
import { BoardFrame } from "@/components/puzzle/BoardFrame";
import { PuzzleBoard } from "@/components/puzzle/PuzzleBoard";
import { BrandLogo } from "@/components/ui/BrandLogo";
import type { Car } from "@/config/cars";
import { gameConfig, uiConfig } from "@/config/game";
import { messages } from "@/content/messages";
import { solvedBoard, TILE_COUNT } from "@/lib/puzzle/board";
import type { Board, Scramble } from "@/lib/types";
import { playTone } from "@/lib/utils/sound";

interface RevealScreenProps {
  car: Car;
  image: string;
  scramble: Scramble;
  onDone: () => void;
}

interface RevealState {
  count: number | null; // 3, 2, 1 or null
  merged: boolean;
  board: Board;
  go: boolean;
}

/**
 * "Your car is…" → model name → full picture with 3·2·1 → the picture
 * splits into 16 tiles that fly into the scrambled layout → GO!
 * Input stays locked the whole time.
 */
export function RevealScreen({ car, image, scramble, onDone }: RevealScreenProps) {
  const [state, setState] = useState<RevealState>({ count: null, merged: true, board: solvedBoard(), go: false });

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));
    const set = (patch: Partial<RevealState>) => setState((s) => ({ ...s, ...patch }));

    let t = uiConfig.revealIntroMs;
    for (let n = gameConfig.revealCountdownSeconds; n >= 1; n--) {
      const value = n;
      at(t, () => {
        set({ count: value });
        playTone("tick");
      });
      t += 1000;
    }
    at(t, () => set({ count: null, merged: false }));
    t += uiConfig.revealSplitMs;
    at(t, () => set({ board: scramble.board }));
    t += uiConfig.revealFlyMs + uiConfig.revealFlyStaggerMs * TILE_COUNT;
    at(t, () => {
      set({ go: true });
      playTone("go");
    });
    t += uiConfig.revealGoMs;
    at(t, onDone);

    return () => timers.forEach(clearTimeout);
  }, [scramble.board, onDone]);

  return (
    <RoundLayout
      header={
        <>
          <BrandLogo className="h-[max(22px,3.6cqw)]" />
          <span className="font-display gold-text text-k-xs font-bold">{gameConfig.gameTitle}</span>
        </>
      }
      top={
        <div className="flex h-full flex-col items-center justify-center gap-[1.5cqh] text-center">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-k-lg font-semibold text-mist"
          >
            {messages.reveal.intro}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, x: "30%" }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35, type: "spring", stiffness: 160, damping: 20 }}
            className="font-display px-[2cqw] text-k-title leading-[1.05] font-black"
          >
            <SweepText period={3} delay={0.9}>
              {car.name}
            </SweepText>
          </motion.h2>
        </div>
      }
      board={
        <>
          <BoardFrame glow>
            <PuzzleBoard
              board={state.board}
              image={image}
              interactive={false}
              merged={state.merged}
              highlightCorrect={false}
              moveDurationMs={uiConfig.revealFlyMs}
              staggerMs={uiConfig.revealFlyStaggerMs}
            />
          </BoardFrame>
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
            <AnimatePresence>
              {state.count !== null && (
                <motion.span
                  key={state.count}
                  initial={{ opacity: 0, scale: 1.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="font-display absolute text-k-mega font-black drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)]"
                >
                  <span className="gold-text">{state.count}</span>
                </motion.span>
              )}
              {state.go && (
                <motion.span
                  key="go"
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: [0, 1, 1, 0], scale: [0.4, 1.15, 1, 1.3] }}
                  transition={{ duration: uiConfig.revealGoMs / 1000, times: [0, 0.3, 0.7, 1] }}
                  className="font-display absolute text-k-mega font-black drop-shadow-[0_6px_24px_rgba(0,0,0,0.9)]"
                >
                  <span className="gold-text">{messages.reveal.go}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </>
      }
      bottom={null}
    />
  );
}
