"use client";

import { motion } from "motion/react";
import { HandIcon } from "@/components/icons/HandIcon";
import { uiConfig } from "@/config/game";

const TOTAL_S = uiConfig.peekNudgeMs / 1000;
/** Moment (0–1 of the nudge) when the finger "taps" the picture. */
const TAP_AT = 0.45;

/**
 * One-time "tap here" hint on the small car picture: a hand slides in,
 * taps once (with a gold ripple) and fades away. Purely visual.
 */
export function TapNudge() {
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute inset-0 z-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: TOTAL_S, times: [0, 0.15, 0.8, 1] }}
    >
      {/* ripple where the finger lands */}
      <motion.span
        className="absolute top-1/2 left-1/2 h-[70%] w-[70%] -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-gold-300 shadow-[0_0_18px_rgba(243,220,154,0.8)]"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: [0, 0, 0.95, 0], scale: [0.3, 0.3, 0.9, 1.35] }}
        transition={{ duration: TOTAL_S, times: [0, TAP_AT, TAP_AT + 0.1, TAP_AT + 0.4] }}
      />
      {/* hand: slides in from the lower left, presses, lifts */}
      <motion.div
        className="absolute top-[38%] left-[34%] w-[62%] text-gold-300 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]"
        initial={{ x: "-55%", y: "55%", scale: 1 }}
        animate={{ x: ["-55%", "0%", "0%", "0%", "10%"], y: ["55%", "0%", "0%", "0%", "15%"], scale: [1, 1, 0.82, 1, 1] }}
        transition={{ duration: TOTAL_S, times: [0, TAP_AT - 0.08, TAP_AT, TAP_AT + 0.12, 1], ease: "easeOut" }}
      >
        <HandIcon className="h-auto w-full" />
      </motion.div>
    </motion.div>
  );
}
