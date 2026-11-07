import type { CSSProperties } from "react";

interface IconProps {
  className?: string;
  style?: CSSProperties;
}

/** Chevron pointing right; rotate it for other directions. */
export function ChevronIcon({ className, style }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className={className} style={style}>
      <path d="M8 4l8 8-8 8" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
