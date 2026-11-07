import type { ReactNode } from "react";

interface StatChipProps {
  label: string;
  value: ReactNode;
  tone?: "ivory" | "gold";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const VALUE_SIZES = {
  sm: "text-k-md",
  md: "text-k-xl",
  lg: "text-k-2xl",
  // Result popups: readable from 2–3 metres.
  xl: "text-k-stat leading-[1.1]",
};

/** Small mist label + big Orbitron value. */
export function StatChip({ label, value, tone = "ivory", size = "md", className = "" }: StatChipProps) {
  return (
    <div
      className={`flex min-w-0 flex-col items-center justify-center rounded-[clamp(12px,2.2cqw,32px)] border border-graphite-500/70 bg-graphite-800/80 px-[3cqw] py-[1.4cqw] ${className}`}
    >
      <span className="text-k-xs font-semibold uppercase tracking-[0.12em] text-mist">{label}</span>
      <span className={`font-display font-bold ${VALUE_SIZES[size]} ${tone === "gold" ? "gold-text" : "text-ivory"}`}>
        {value}
      </span>
    </div>
  );
}
