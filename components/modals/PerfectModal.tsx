"use client";

import { motion } from "motion/react";
import { GoldConfetti } from "@/components/effects/GoldConfetti";
import { LightSweep } from "@/components/effects/LightSweep";
import { TrophyIcon } from "@/components/icons/TrophyIcon";
import { ModalShell } from "@/components/modals/ModalShell";
import { StatChip } from "@/components/ui/StatChip";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";
import { formatDuration } from "@/lib/utils/format";

interface PerfectModalProps {
  moves: number;
  timeMs: number;
  onOk: () => void;
}

/** Solved in the best possible number of moves. */
export function PerfectModal({ moves, timeMs, onOk }: PerfectModalProps) {
  return (
    <ModalShell
      label={messages.perfect.title}
      onOk={onOk}
      overlay={<GoldConfetti mode="perfect" />}
      icon={
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
          className="glow-strong relative h-[24cqw] w-[24cqw] overflow-hidden rounded-full border-2 border-gold-400/70 bg-graphite-800 p-[4cqw]"
        >
          <TrophyIcon className="h-full w-full" />
          <LightSweep period={2.5} delay={0.6} />
        </motion.div>
      }
      title={
        <motion.span
          initial={{ scale: 2.4, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: -2 }}
          transition={{ type: "spring", stiffness: 420, damping: 16, delay: 0.35 }}
          className="inline-block"
        >
          {/* Gold text on an inner span: Chrome hides background-clip text on a transformed element. */}
          <span className="gold-text">{messages.perfect.title}</span>
        </motion.span>
      }
      body={messages.perfect.body}
      stats={
        <>
          <StatChip label={messages.labels.moves} value={<TabularNumber value={moves} />} tone="gold" size="xl" className="flex-1 py-[2cqw]" />
          <StatChip label={messages.labels.time} value={<TabularNumber value={formatDuration(timeMs)} />} size="xl" className="flex-[1.4] py-[2cqw]" />
        </>
      }
    />
  );
}
