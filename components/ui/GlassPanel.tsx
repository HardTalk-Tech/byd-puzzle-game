import type { HTMLAttributes, ReactNode } from "react";

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/** Blurred dark glass panel with a thin gold border. */
export function GlassPanel({ children, className = "", ...rest }: GlassPanelProps) {
  return (
    <div className={`glass-panel ${className}`} {...rest}>
      {children}
    </div>
  );
}
