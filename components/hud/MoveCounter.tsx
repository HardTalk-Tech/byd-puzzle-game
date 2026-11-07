"use client";

import { motion } from "motion/react";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";

interface MoveCounterProps {
  moves: number;
  className?: string;
}

/** Big move counter; the number pops on every swap. */
export function MoveCounter({ moves, className = "" }: MoveCounterProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[clamp(12px,2.2cqw,32px)] border border-gold-500/40 bg-graphite-800/80 px-[3cqw] ${className}`}
    >
      <span className="text-k-xs font-semibold uppercase tracking-[0.12em] text-mist">{messages.labels.moves}</span>
      <motion.span
        key={moves}
        initial={{ scale: moves === 0 ? 1 : 1.3 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
        className="font-display inline-block text-k-2xl leading-tight font-black"
        aria-live="polite"
      >
        <TabularNumber value={moves} className="gold-text" />
      </motion.span>
    </div>
  );
}
