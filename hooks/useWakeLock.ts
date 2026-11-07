"use client";

import { useEffect } from "react";

/** Keeps the screen on (Screen Wake Lock API); re-requested when the page becomes visible again. */
export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      if (document.visibilityState !== "visible" || (lock && !lock.released)) return;
      try {
        lock = await navigator.wakeLock.request("screen");
        if (cancelled) void lock.release();
      } catch {
        // Not allowed right now (e.g. no user gesture yet / battery saver): try again later.
      }
    };
    const onVisibility = () => void request();
    // Some browsers only grant the lock after a user gesture.
    const onFirstTouch = () => void request();

    void request();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", onFirstTouch, { passive: true });
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", onFirstTouch);
      void lock?.release().catch(() => undefined);
    };
  }, [enabled]);
}
