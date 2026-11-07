"use client";

import { useRef, type PointerEvent } from "react";
import { gameConfig, uiConfig } from "@/config/game";
import type { Direction } from "@/lib/types";

interface Gesture {
  pointerId: number;
  startX: number;
  startY: number;
  done: boolean;
}

interface UseSwipeOptions {
  /** Current tile size in px, used for the swipe threshold. */
  getTileSize: () => number;
  /** Called on pointerdown. Return false to ignore this gesture. */
  onStart: (e: PointerEvent<HTMLElement>) => boolean;
  /** Fires once per gesture as soon as the threshold is passed. */
  onSwipe: (direction: Direction) => void;
  /** Pointer released without a swipe. */
  onTap: () => void;
  onCancel?: () => void;
}

/**
 * Pointer-events swipe recogniser (touch and mouse). The swipe fires
 * immediately when the finger passes swipeThresholdRatio × tile size and
 * one axis clearly dominates; it never waits for release.
 */
export function useSwipe({ getTileSize, onStart, onSwipe, onTap, onCancel }: UseSwipeOptions) {
  const gesture = useRef<Gesture | null>(null);

  return {
    onPointerDown(e: PointerEvent<HTMLElement>) {
      if (gesture.current || !e.isPrimary) return;
      if (!onStart(e)) return;
      e.currentTarget.setPointerCapture?.(e.pointerId);
      gesture.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, done: false };
    },
    onPointerMove(e: PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || g.done || e.pointerId !== g.pointerId) return;
      const dx = e.clientX - g.startX;
      const dy = e.clientY - g.startY;
      const ax = Math.abs(dx);
      const ay = Math.abs(dy);
      if (Math.max(ax, ay) < gameConfig.swipeThresholdRatio * getTileSize()) return;
      if (ax >= ay * uiConfig.swipeAxisRatio) {
        g.done = true;
        onSwipe(dx > 0 ? "right" : "left");
      } else if (ay >= ax * uiConfig.swipeAxisRatio) {
        g.done = true;
        onSwipe(dy > 0 ? "down" : "up");
      }
    },
    onPointerUp(e: PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || e.pointerId !== g.pointerId) return;
      gesture.current = null;
      if (!g.done) onTap();
    },
    onPointerCancel(e: PointerEvent<HTMLElement>) {
      const g = gesture.current;
      if (!g || e.pointerId !== g.pointerId) return;
      gesture.current = null;
      onCancel?.();
    },
  };
}
