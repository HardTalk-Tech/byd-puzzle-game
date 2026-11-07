"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { HandIcon } from "@/components/icons/HandIcon";
import { uiConfig } from "@/config/game";
import { messages } from "@/content/messages";

/**
 * Animated hand + "swipe a tile" hint. After a few seconds it rotates
 * short tips.
 */
const LINES = [messages.game.hint, ...messages.game.tips];

export function HintBar() {
  const [index, setIndex] = useState(0); // 0 = main hint, then the tips

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    const first = setTimeout(() => {
      setIndex(1);
      interval = setInterval(() => setIndex((i) => (i + 1) % LINES.length), uiConfig.tipRotateMs);
    }, uiConfig.hintTipsAfterMs);
    return () => {
      clearTimeout(first);
      if (interval) clearInterval(interval);
    };
  }, []);

  const text = LINES[index];

  return (
    <div className="flex h-full items-center justify-center gap-[2.5cqw] px-[4cqw]">
      <span className="hand-swipe w-[7cqw] shrink-0 text-gold-400">
        <HandIcon />
      </span>
      <div className="relative flex min-h-[2.6em] flex-1 items-center">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={text}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="text-k-xs leading-snug font-semibold text-ivory/90"
          >
            {text}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
