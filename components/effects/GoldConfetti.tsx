"use client";

import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";
import { uiConfig } from "@/config/game";

const GOLD = ["#F3DC9A", "#E8C875", "#C9A24A", "#9C7A2E", "#F4F1EA"];

interface GoldConfettiProps {
  /** "perfect": bursts from both sides, repeating; "burst": one burst. */
  mode: "perfect" | "burst";
}

/** Gold confetti drawn on a canvas inside the kiosk column. */
export function GoldConfetti({ mode }: GoldConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const fire = confetti.create(canvas, { resize: true, useWorker: false, disableForReducedMotion: true });
    const base = { colors: GOLD, ticks: 260, gravity: 0.9, scalar: 1.1 };

    const sides = (count: number) => {
      void fire({ ...base, particleCount: count, angle: 60, spread: 65, startVelocity: 62, origin: { x: 0, y: 0.75 } });
      void fire({ ...base, particleCount: count, angle: 120, spread: 65, startVelocity: 62, origin: { x: 1, y: 0.75 } });
    };

    let interval: ReturnType<typeof setInterval> | undefined;
    if (mode === "perfect") {
      sides(110);
      interval = setInterval(() => sides(35), uiConfig.perfectConfettiRepeatMs);
    } else {
      void fire({ ...base, particleCount: 130, spread: 110, startVelocity: 48, origin: { x: 0.5, y: 0.32 } });
    }

    return () => {
      if (interval) clearInterval(interval);
      fire.reset();
    };
  }, [mode]);

  return <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 z-50 h-full w-full" />;
}
