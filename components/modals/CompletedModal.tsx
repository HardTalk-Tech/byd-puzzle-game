"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GoldConfetti } from "@/components/effects/GoldConfetti";
import { LightSweep } from "@/components/effects/LightSweep";
import { MedalIcon } from "@/components/icons/MedalIcon";
import { PuzzleIcon } from "@/components/icons/PuzzleIcon";
import { ModalShell } from "@/components/modals/ModalShell";
import { PlaceBadge } from "@/components/modals/PlaceBadge";
import { StatChip } from "@/components/ui/StatChip";
import { TabularNumber } from "@/components/ui/TabularNumber";
import { messages } from "@/content/messages";
import { isPodium, placeForMoves } from "@/lib/puzzle/placing";
import { formatDuration } from "@/lib/utils/format";

interface CompletedModalProps {
  moves: number;
  timeMs: number;
  /** The rebuilt car's picture, shown at the top (non-podium results). */
  carImage?: string;
  carName?: string;
  onOk: () => void;
}

/**
 * Solved, in more than the best possible number of moves. 2nd and 3rd
 * place get a silver / bronze medal; otherwise the rebuilt car is shown
 * (4th–5th also get a place badge).
 */
export function CompletedModal({ moves, timeMs, carImage, carName, onOk }: CompletedModalProps) {
  const place = placeForMoves(moves);
  const podium = isPodium(place);

  return (
    <ModalShell
      label={messages.completed.title}
      onOk={onOk}
      overlay={<GoldConfetti mode={podium ? "perfect" : "burst"} />}
      badge={place !== null ? <PlaceBadge place={place} /> : undefined}
      icon={
        podium ? (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 14, delay: 0.15 }}
            className="glow-strong relative h-[24cqw] w-[24cqw] overflow-hidden rounded-full border-2 border-gold-400/60 bg-graphite-800 p-[2cqw]"
          >
            <MedalIcon metal={place === 2 ? "silver" : "bronze"} place={place} className="h-full w-full" />
            <LightSweep period={2.5} delay={0.6} />
          </motion.div>
        ) : carImage ? (
          // The car they just rebuilt, framed like the "Your car" picture.
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 18, delay: 0.1 }}
            className="gold-frame glow-strong h-[30cqw] w-[30cqw]"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[clamp(10px,2cqw,30px)]">
              <Image
                src={carImage}
                alt={carName ?? ""}
                width={600}
                height={600}
                unoptimized
                draggable={false}
                className="h-full w-full object-cover"
              />
              <LightSweep period={3} delay={0.5} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.1 }}
            className="glow h-[24cqw] w-[24cqw] rounded-full border-2 border-gold-400/60 bg-graphite-800 p-[5cqw] text-gold-400"
          >
            <PuzzleIcon className="h-full w-full" />
          </motion.div>
        )
      }
      title={<span className="gold-text">{messages.completed.title}</span>}
      // With a place badge the cheer says it all: keep the popup short.
      body={place === null ? messages.completed.body : null}
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
