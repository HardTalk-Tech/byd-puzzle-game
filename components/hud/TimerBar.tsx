"use client";

import { gameConfig } from "@/config/game";
import { useRemainingMs, type CountdownClock } from "@/hooks/useCountdown";

interface TimerBarProps {
  clock: CountdownClock;
}

/**
 * Full-width gold bar shrinking over the time limit, with a glowing dot
 * riding its end. Pulses and glows brighter in the last seconds.
 * Only transforms are animated (cheap on slow kiosk PCs).
 */
export function TimerBar({ clock }: TimerBarProps) {
  const remaining = useRemainingMs(clock);
  const fraction = Math.max(0, Math.min(1, remaining / clock.durationMs));
  const low = remaining > 0 && remaining <= gameConfig.lowTimeWarningSeconds * 1000;

  return (
    <div
      className="relative h-full min-h-[6px] w-full rounded-full bg-graphite-700 shadow-[inset_0_1px_2px_rgba(0,0,0,0.6)]"
      role="progressbar"
      aria-label="Time left"
      aria-valuemin={0}
      aria-valuemax={gameConfig.timeLimitSeconds}
      aria-valuenow={Math.ceil(remaining / 1000)}
    >
      <div className="absolute inset-0 overflow-hidden rounded-full">
        <div
          className={`timer-bar-fill gold-fill absolute inset-0 rounded-full ${low ? "timer-low glow-strong" : "glow"}`}
          style={{ transform: `scaleX(${fraction})` }}
        />
      </div>
      {/* glowing head at the end of the fill */}
      {fraction > 0 && (
        <div
          aria-hidden
          className="timer-bar-fill pointer-events-none absolute inset-0"
          style={{ transform: `translateX(${(fraction - 1) * 100}%)` }}
        >
          <span
            className={`absolute top-1/2 right-0 aspect-square h-[260%] translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,#FFF7DF_0%,#F3DC9A_35%,rgba(232,200,117,0)_70%)] ${
              low ? "timer-low scale-125" : ""
            }`}
          />
        </div>
      )}
    </div>
  );
}
