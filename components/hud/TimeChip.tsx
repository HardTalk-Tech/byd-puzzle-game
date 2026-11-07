"use client";

import { TabularNumber } from "@/components/ui/TabularNumber";
import { gameConfig } from "@/config/game";
import { messages } from "@/content/messages";
import { useRemainingMs, type CountdownClock } from "@/hooks/useCountdown";
import { formatCountdown } from "@/lib/utils/format";

interface TimeChipProps {
  clock: CountdownClock;
  className?: string;
}

/** TIME stat chip; turns gold and pulses in the last seconds. */
export function TimeChip({ clock, className = "" }: TimeChipProps) {
  const remaining = useRemainingMs(clock);
  const low = remaining > 0 && remaining <= gameConfig.lowTimeWarningSeconds * 1000;
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-[clamp(12px,2.2cqw,32px)] border bg-graphite-800/80 px-[3cqw] ${
        low ? "timer-low border-gold-400" : "border-graphite-500/70"
      } ${className}`}
    >
      <span className="text-k-xs font-semibold uppercase tracking-[0.12em] text-mist">{messages.labels.time}</span>
      <span className={`font-display text-k-2xl leading-tight font-black ${low ? "gold-text" : "text-ivory"}`}>
        <TabularNumber value={formatCountdown(remaining)} />
      </span>
    </div>
  );
}
