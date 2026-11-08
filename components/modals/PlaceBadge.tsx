"use client";

import { motion } from "motion/react";
import { messages } from "@/content/messages";
import { isPodium, ordinal } from "@/lib/puzzle/placing";

const PODIUM_STYLES = [
  "gold-fill text-ink", // 1st
  "bg-[linear-gradient(135deg,#7E8188,#F1F2F4_50%,#AEB1B8)] text-ink", // 2nd
  "bg-[linear-gradient(135deg,#7A4A22,#E8B07A_50%,#A86A3A)] text-ink", // 3rd
];

/** "2nd place · Superstar!" pill on the win popup; podium places get a metal finish. */
export function PlaceBadge({ place }: { place: number }) {
  const style = isPodium(place)
    ? `${PODIUM_STYLES[place - 1]} glow`
    : "border-2 border-gold-400/70 bg-graphite-800 text-gold-300";
  const cheer = messages.place.cheers[place - 1];
  return (
    <motion.div
      initial={{ scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 380, damping: 15, delay: 0.25 }}
      className="flex flex-col items-center gap-[0.8cqh]"
    >
      <span className={`font-display rounded-full px-[5cqw] py-[1cqw] text-k-lg font-black ${style}`}>
        {messages.place.badge.replace("{place}", ordinal(place))}
      </span>
      {cheer && <span className="font-display text-k-sm font-bold text-ivory">{cheer}</span>}
    </motion.div>
  );
}
