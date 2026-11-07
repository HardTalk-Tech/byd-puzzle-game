"use client";

import { motion } from "motion/react";
import { StopwatchIcon } from "@/components/icons/StopwatchIcon";
import { ModalShell } from "@/components/modals/ModalShell";
import { StatChip } from "@/components/ui/StatChip";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";

interface TimeUpModalProps {
  moves: number;
  onOk: () => void;
}

/** The clock ran out (the tiles have already slid home behind the popup). */
export function TimeUpModal({ moves, onOk }: TimeUpModalProps) {
  return (
    <ModalShell
      label={messages.timeUp.title}
      onOk={onOk}
      icon={
        <motion.div
          initial={{ scale: 0, rotate: -25 }}
          animate={{ scale: 1, rotate: [0, -8, 8, -4, 0] }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="h-[24cqw] w-[24cqw] rounded-full border-2 border-gold-400/50 bg-graphite-800 p-[4.5cqw]"
        >
          <StopwatchIcon className="h-full w-full" />
        </motion.div>
      }
      title={<span className="gold-text">{messages.timeUp.title}</span>}
      body={messages.timeUp.body}
      stats={
        <StatChip label={messages.labels.moves} value={<TabularNumber value={moves} />} tone="gold" size="xl" className="min-w-[45%] py-[2cqw]" />
      }
    />
  );
}
