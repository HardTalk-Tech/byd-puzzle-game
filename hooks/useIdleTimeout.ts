"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = ["pointerdown", "keydown", "wheel"] as const;

/**
 * Calls onIdle after `seconds` without any touch, click or key press.
 * Disabled when `enabled` is false (e.g. during play).
 */
export function useIdleTimeout(enabled: boolean, seconds: number, onIdle: () => void) {
  const onIdleRef = useRef(onIdle);
  useEffect(() => {
    onIdleRef.current = onIdle;
  });

  useEffect(() => {
    if (!enabled) return;
    let timer: ReturnType<typeof setTimeout>;
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(() => onIdleRef.current(), seconds * 1000);
    };
    reset();
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true, capture: true }));
    return () => {
      clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset, { capture: true }));
    };
  }, [enabled, seconds]);
}
