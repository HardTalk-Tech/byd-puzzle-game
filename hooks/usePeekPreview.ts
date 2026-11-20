"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { uiConfig } from "@/config/game";

/**
 * Big car-picture preview, opened from the small picture:
 * - tap  → shows for a few seconds, then closes by itself
 *          (tap the small picture or the big one again to close sooner);
 * - hold → stays open while the finger is down.
 */
export function usePeekPreview() {
  const [open, setOpenState] = useState(false);
  const openRef = useRef(false);
  const downAt = useRef<number | null>(null);
  const openedBeforePress = useRef(false);
  const autoClose = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const setOpen = useCallback((value: boolean) => {
    openRef.current = value;
    setOpenState(value);
  }, []);

  const close = useCallback(() => {
    clearTimeout(autoClose.current);
    setOpen(false);
  }, [setOpen]);

  useEffect(() => () => clearTimeout(autoClose.current), []);

  const onPressStart = useCallback(() => {
    clearTimeout(autoClose.current);
    openedBeforePress.current = openRef.current;
    downAt.current = performance.now();
    setOpen(true);
  }, [setOpen]);

  const onPressEnd = useCallback(() => {
    if (downAt.current === null) return;
    const heldFor = performance.now() - downAt.current;
    downAt.current = null;
    if (heldFor >= uiConfig.peekHoldMs) return close(); // hold: close on release
    if (openedBeforePress.current) return close(); // tap while open: close sooner
    autoClose.current = setTimeout(close, uiConfig.peekTapShowMs); // tap: show for a few seconds
  }, [close]);

  /** Finger lost (e.g. dragged off the screen) while still pressing. */
  const onPressCancel = useCallback(() => {
    if (downAt.current === null) return;
    downAt.current = null;
    close();
  }, [close]);

  return { open, onPressStart, onPressEnd, onPressCancel, close };
}
