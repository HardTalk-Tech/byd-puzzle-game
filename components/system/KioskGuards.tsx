"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useWakeLock } from "@/hooks/useWakeLock";

/**
 * Kiosk behaviour on the game route: keeps the screen awake and blocks the
 * context menu, text selection, image dragging, pinch / ctrl zoom and
 * pull-to-refresh. Double-tap zoom and overscroll are handled in CSS
 * (touch-action, overscroll-behavior). Not active on /staff.
 */
export function KioskGuards() {
  const pathname = usePathname();
  const active = !(pathname?.startsWith("/staff") ?? false);

  useWakeLock(active);

  useEffect(() => {
    if (!active) return;
    const prevent = (e: Event) => e.preventDefault();
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault(); // pinch zoom
    };
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey) e.preventDefault(); // ctrl + wheel / trackpad pinch
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ["+", "-", "=", "0"].includes(e.key)) e.preventDefault();
    };
    const opts = { passive: false } as const;

    document.addEventListener("contextmenu", prevent);
    document.addEventListener("selectstart", prevent);
    document.addEventListener("dragstart", prevent);
    document.addEventListener("gesturestart", prevent, opts); // Safari pinch
    document.addEventListener("touchmove", onTouchMove, opts);
    window.addEventListener("wheel", onWheel, opts);
    window.addEventListener("keydown", onKey);

    // Ask the browser to keep our offline data (ignore failures).
    void navigator.storage?.persist?.().catch(() => undefined);

    return () => {
      document.removeEventListener("contextmenu", prevent);
      document.removeEventListener("selectstart", prevent);
      document.removeEventListener("dragstart", prevent);
      document.removeEventListener("gesturestart", prevent);
      document.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [active]);

  return null;
}
