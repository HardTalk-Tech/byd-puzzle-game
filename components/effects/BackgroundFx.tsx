"use client";

import { useEffect, useRef } from "react";
import { fxConfig } from "@/config/game";

interface Particle {
  x: number;
  y: number;
  radius: number;
  speed: number; // px per second (CSS px)
  sway: number;
  phase: number;
  alpha: number;
}

interface BackgroundFxProps {
  /** "light" during play: fewer particles. */
  intensity?: "full" | "light";
}

function makeParticle(width: number, height: number, anywhere: boolean): Particle {
  return {
    x: Math.random() * width,
    y: anywhere ? Math.random() * height : height + 10,
    radius: 0.6 + Math.random() * 1.8,
    speed: 10 + Math.random() * 26,
    sway: 6 + Math.random() * 18,
    phase: Math.random() * Math.PI * 2,
    alpha: 0.25 + Math.random() * 0.55,
  };
}

/**
 * Faint drifting hexagon grid (a nod to battery cells) plus tiny gold
 * particles floating upward on a canvas, capped at 30 fps and paused when
 * the tab is hidden.
 */
export function BackgroundFx({ intensity = "full" }: BackgroundFxProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const targetCount = useRef<number>(intensity === "full" ? fxConfig.particlesFull : fxConfig.particlesLight);

  useEffect(() => {
    targetCount.current = intensity === "full" ? fxConfig.particlesFull : fxConfig.particlesLight;
  }, [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const frameInterval = 1000 / fxConfig.maxFps;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let particles: Particle[] = [];
    let raf = 0;
    let last = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, fxConfig.maxDevicePixelRatio);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.max(1, Math.round(width * dpr));
      canvas.height = Math.max(1, Math.round(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);
      for (const p of particles) {
        const x = p.x + Math.sin(time / 1600 + p.phase) * p.sway;
        const twinkle = 0.65 + 0.35 * Math.sin(time / 700 + p.phase * 3);
        const a = p.alpha * twinkle;
        ctx.fillStyle = `rgba(232, 200, 117, ${a * 0.18})`;
        ctx.beginPath();
        ctx.arc(x, p.y, p.radius * 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(243, 220, 154, ${a})`;
        ctx.beginPath();
        ctx.arc(x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const step = (time: number) => {
      raf = requestAnimationFrame(step);
      const elapsed = time - last;
      if (elapsed < frameInterval) return;
      const dt = Math.min(elapsed, 100) / 1000;
      last = time;

      // Particles leaving the top are recycled at the bottom, or dropped
      // while there are more than the target (e.g. when play starts).
      let excess = particles.length - targetCount.current;
      particles = particles.filter((p) => {
        p.y -= p.speed * dt;
        if (p.y >= -10) return true;
        if (excess > 0) {
          excess--;
          return false;
        }
        Object.assign(p, makeParticle(width, height, false));
        return true;
      });
      if (particles.length < targetCount.current) particles.push(makeParticle(width, height, false));
      draw(time);
    };

    const start = () => {
      cancelAnimationFrame(raf);
      if (reducedMotion) {
        draw(0);
        return;
      }
      last = performance.now();
      raf = requestAnimationFrame(step);
    };

    const onVisibility = () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else start();
    };

    resize();
    particles = Array.from({ length: targetCount.current }, () => makeParticle(width, height, true));
    start();

    const observer = new ResizeObserver(() => {
      resize();
      if (reducedMotion) draw(0);
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="hex-layer" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-black/60 to-transparent" />
    </div>
  );
}
