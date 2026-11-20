"use client";

import { LightSweep } from "@/components/effects/LightSweep";
import { gameConfig } from "@/config/game";
import { messages } from "@/content/messages";
import { useRemainingMs, type CountdownClock } from "@/hooks/useCountdown";
import { formatCountdown } from "@/lib/utils/format";

interface TimeChipProps {
  clock: CountdownClock;
  className?: string;
}

/** Fixed-width digit cell so the time never jumps (Orbitron has no tabular figures). */
const DIGIT_W = "0.82em";

/**
 * TIME above the board, laid out like the scoreboard under it:
 * label │ big digits, in a gold-framed pill. The colon ticks every second;
 * in the last seconds the pill pulses and the digits turn gold.
 */
export function TimeChip({ clock, className = "" }: TimeChipProps) {
  const remaining = useRemainingMs(clock);
  const low = remaining > 0 && remaining <= gameConfig.lowTimeWarningSeconds * 1000;
  const second = Math.ceil(remaining / 1000);
  const [minutes, seconds] = formatCountdown(remaining).split(":");

  return (
    <div className={`gold-frame h-full ${low ? "timer-low glow-strong" : "glow"} ${className}`}>
      <div
        className="relative flex h-full items-center justify-center gap-[3.5cqw] overflow-hidden rounded-[clamp(10px,2cqw,30px)] bg-[radial-gradient(120%_160%_at_25%_50%,#2e2715_0%,var(--color-graphite-800)_65%)] px-[5cqw]"
        role="timer"
        aria-label={`${messages.labels.time} ${minutes}:${seconds}`}
      >
        {/* Sizes match the kiosk type scale at 1080 px, but may shrink further on small screens. */}
        <span className="font-display text-[clamp(12px,3.4cqw,240px)] font-bold tracking-[0.14em] text-mist">
          {messages.labels.time}
        </span>

        <span aria-hidden className="h-[58%] w-px shrink-0 bg-linear-to-b from-transparent via-gold-400/60 to-transparent" />

        <span
          aria-hidden
          className={`font-display tabular flex text-[clamp(22px,9cqw,300px)] leading-none font-black ${low ? "gold-text" : "text-ivory"}`}
        >
          {minutes.split("").map((d, i) => (
            <span key={`m${i}`} className="inline-block text-center" style={{ width: DIGIT_W }}>
              {d}
            </span>
          ))}
          {/* colon ticks once per second (restarted on each new second) */}
          <span key={second} className="timer-colon inline-block w-[0.36em] text-center">
            :
          </span>
          {seconds.split("").map((d, i) => (
            <span key={`s${i}`} className="inline-block text-center" style={{ width: DIGIT_W }}>
              {d}
            </span>
          ))}
        </span>

        <LightSweep period={7} delay={3} />
      </div>
    </div>
  );
}
