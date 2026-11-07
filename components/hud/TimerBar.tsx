"use client";

import { gameConfig } from "@/config/game";
import { useRemainingMs, type CountdownClock } from "@/hooks/useCountdown";

interface TimerBarProps {
  clock: CountdownClock;
}

/** Full-width gold bar shrinking over the time limit; pulses in the last seconds. */
export function TimerBar({ clock }: TimerBarProps) {
  const remaining = useRemainingMs(clock);
  const fraction = Math.max(0, Math.min(1, remaining / clock.durationMs));
  const low = remaining > 0 && remaining <= gameConfig.lowTimeWarningSeconds * 1000;

  return (
    <div
      className="relative h-full min-h-[6px] w-full overflow-hidden rounded-full bg-graphite-700"
      role="progressbar"
      aria-label="Time left"
      aria-valuemin={0}
      aria-valuemax={gameConfig.timeLimitSeconds}
      aria-valuenow={Math.ceil(remaining / 1000)}
    >
      <div
        className={`timer-bar-fill gold-fill absolute inset-0 rounded-full ${low ? "timer-low glow-strong" : "glow"}`}
        style={{ transform: `scaleX(${fraction})` }}
      />
    </div>
  );
}
