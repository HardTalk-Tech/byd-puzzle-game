import type { ReactNode } from "react";
import { LightSweep } from "@/components/effects/LightSweep";

interface BoardFrameProps {
  children: ReactNode;
  /** Stronger glow (win, completion). */
  glow?: boolean;
  /** Play one light sweep across the picture. */
  sweep?: boolean;
  /** Gold flash over the board (demo completion). */
  flashKey?: number;
}

/** Gold frame with a dark backing that shows through the tile gaps. */
export function BoardFrame({ children, glow = false, sweep = false, flashKey = 0 }: BoardFrameProps) {
  return (
    <div className={`gold-frame w-full transition-shadow duration-500 ${glow ? "glow-strong" : ""}`}>
      <div className="relative overflow-hidden rounded-[clamp(10px,2cqw,30px)] bg-graphite-900">
        {children}
        {sweep && <LightSweep once />}
        {flashKey > 0 && <span key={flashKey} className="gold-flash" />}
      </div>
    </div>
  );
}
