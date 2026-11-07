import type { CSSProperties } from "react";

interface LightSweepProps {
  /** Seconds between sweeps (4–6 s). */
  period?: number;
  /** Start delay in seconds, so several sweeps don't move in sync. */
  delay?: number;
  /** Play a single sweep instead of repeating. */
  once?: boolean;
}

/**
 * A diagonal shine that crosses its parent. The parent must be
 * `position: relative` with `overflow: hidden`. For gold text use
 * <SweepText> instead (the shine stays inside the letters).
 */
export function LightSweep({ period = 5, delay = 0.8, once = false }: LightSweepProps) {
  const style = { "--sweep-period": `${period}s`, "--sweep-delay": `${delay}s` } as CSSProperties;
  return <span aria-hidden className="light-sweep" data-once={once} style={style} />;
}
