"use client";

import { motion } from "motion/react";
import { GoldConfetti } from "@/components/effects/GoldConfetti";
import { PuzzleIcon } from "@/components/icons/PuzzleIcon";
import { ModalShell } from "@/components/modals/ModalShell";
import { StatChip } from "@/components/ui/StatChip";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";
import { formatDuration } from "@/lib/utils/format";

interface CompletedModalProps {
  moves: number;
  timeMs: number;
  onOk: () => void;
}

/** Solved, in more than the best possible number of moves. */
export function CompletedModal({ moves, timeMs, onOk }: CompletedModalProps) {
  return (
    <ModalShell
      label={messages.completed.title}
      onOk={onOk}
      overlay={<GoldConfetti mode="burst" />}
      icon={
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
          className="glow h-[24cqw] w-[24cqw] rounded-full border-2 border-gold-400/60 bg-graphite-800 p-[5cqw] text-gold-400"
        >
          <PuzzleIcon className="h-full w-full" />
        </motion.div>
      }
      title={<span className="gold-text">{messages.completed.title}</span>}
      body={messages.completed.body}
      stats={
        <>
          <StatChip label={messages.labels.moves} value={<TabularNumber value={moves} />} tone="gold" size="xl" className="flex-1 py-[2cqw]" />
          <StatChip label={messages.labels.time} value={<TabularNumber value={formatDuration(timeMs)} />} size="xl" className="flex-[1.4] py-[2cqw]" />
        </>
      }
      footnote={messages.completed.best}
    />
  );
}
