import type { CSSProperties, ReactNode } from "react";

interface SweepTextProps {
  children: ReactNode;
  /** Seconds between sweeps. */
  period?: number;
  delay?: number;
  className?: string;
}

/** Gold gradient text with a light sweep passing through the letters. */
export function SweepText({ children, period = 5, delay = 0.8, className = "" }: SweepTextProps) {
  const style = { "--sweep-period": `${period}s`, "--sweep-delay": `${delay}s` } as CSSProperties;
  return (
    <span className={`gold-text-sweep ${className}`} style={style}>
      {children}
    </span>
  );
}
