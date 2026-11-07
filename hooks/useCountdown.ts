"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { uiConfig } from "@/config/game";

export interface CountdownClock {
  start(): void;
  /** Stops the clock and returns the elapsed time in ms. */
  stop(): number;
  elapsedMs(): number;
  remainingMs(): number;
  readonly durationMs: number;
  subscribe(listener: () => void): () => void;
  /** Called once when the time runs out. */
  setOnExpire(fn: () => void): void;
}

/**
 * Countdown based on performance.now() timestamps (not interval counting),
 * so it stays accurate. Only components that read the time re-render on
 * each tick (see useRemainingMs).
 */
export function createCountdownClock(durationMs: number, onExpire: () => void = () => {}): CountdownClock {
  let startedAt: number | null = null;
  let frozenElapsed = 0;
  let timer: ReturnType<typeof setInterval> | null = null;
  let snapshot = durationMs;
  const listeners = new Set<() => void>();

  const elapsedMs = () => (startedAt === null ? frozenElapsed : Math.min(durationMs, performance.now() - startedAt));
  const emit = () => {
    snapshot = Math.max(0, durationMs - elapsedMs());
    listeners.forEach((l) => l());
  };
  const clear = () => {
    if (timer !== null) clearInterval(timer);
    timer = null;
  };

  const clock: CountdownClock = {
    durationMs,
    start() {
      if (startedAt !== null) return;
      startedAt = performance.now() - frozenElapsed;
      clear();
      timer = setInterval(() => {
        emit();
        if (elapsedMs() >= durationMs) {
          clock.stop();
          onExpire();
        }
      }, uiConfig.timerTickMs);
      emit();
    },
    stop() {
      frozenElapsed = elapsedMs();
      startedAt = null;
      clear();
      emit();
      return Math.round(frozenElapsed);
    },
    elapsedMs,
    remainingMs: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    setOnExpire(fn) {
      onExpire = fn;
    },
  };
  return clock;
}

/** A countdown clock that lives as long as the component. */
export function useCountdown(durationMs: number, onExpire: () => void): CountdownClock {
  const [clock] = useState(() => createCountdownClock(durationMs));
  useEffect(() => {
    clock.setOnExpire(onExpire);
  }, [clock, onExpire]);
  useEffect(() => () => void clock.stop(), [clock]);
  return clock;
}

/** Re-renders the calling component on each clock tick. */
export function useRemainingMs(clock: CountdownClock): number {
  return useSyncExternalStore(clock.subscribe, clock.remainingMs, () => clock.durationMs);
}
