"use client";

import { motion } from "motion/react";
import { LightSweep } from "@/components/effects/LightSweep";
import { TrophyIcon } from "@/components/icons/TrophyIcon";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";

interface MoveCounterProps {
  moves: number;
  /** Best possible score, shown on the right. */
  best: number;
  className?: string;
}

/**
 * Gold scoreboard under the board: MOVES (big gold number that pops with a
 * glow burst on every swap) and BEST with a trophy, in one framed bar.
 */
export function MoveCounter({ moves, best, className = "" }: MoveCounterProps) {
  return (
    <div className={`gold-frame glow h-full ${className}`}>
      <div className="relative flex h-full items-center overflow-hidden rounded-[clamp(10px,2cqw,30px)] bg-[radial-gradient(120%_160%_at_25%_50%,#2e2715_0%,var(--color-graphite-800)_65%)] px-[4cqw]">
        {/* MOVES */}
        <div className="flex flex-1 items-center justify-center gap-[2.5cqw]">
          <span className="font-display text-k-xs font-bold tracking-[0.14em] text-mist">{messages.labels.moves}</span>
          <span className="relative flex items-center justify-center">
            {/* glow burst behind the number on every swap */}
            {moves > 0 && (
              <motion.span
                key={`burst-${moves}`}
                aria-hidden
                className="absolute h-[160%] w-[160%] rounded-full bg-[radial-gradient(circle,rgba(243,220,154,0.55),rgba(232,200,117,0)_65%)]"
                initial={{ opacity: 0.9, scale: 0.5 }}
                animate={{ opacity: 0, scale: 1.4 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            )}
            <motion.span
              key={moves}
              initial={{ scale: moves === 0 ? 1 : 1.35 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
              className="font-display relative inline-block text-k-2xl leading-none font-black"
              aria-live="polite"
            >
              <TabularNumber value={moves} className="gold-text" />
            </motion.span>
          </span>
        </div>

        {/* divider */}
        <span aria-hidden className="h-[58%] w-px bg-linear-to-b from-transparent via-gold-400/60 to-transparent" />

        {/* BEST */}
        <div className="flex items-center gap-[1.8cqw] pl-[4cqw]">
          <TrophyIcon className="h-[max(20px,5.4cqw)] w-auto" />
          <div className="flex flex-col items-start leading-none">
            <span className="font-display text-k-xs font-bold tracking-[0.14em] text-mist">{messages.labels.best}</span>
            <span className="font-display gold-text text-k-lg font-black">
              <TabularNumber value={best} />
            </span>
          </div>
        </div>

        <LightSweep period={6} delay={2} />
      </div>
    </div>
  );
}
