"use client";

import { useGradientId } from "@/components/icons/useGradientId";

export type MedalMetal = "gold" | "silver" | "bronze";

const METALS: Record<MedalMetal, [string, string, string]> = {
  gold: ["#9C7A2E", "#F3DC9A", "#C9A24A"],
  silver: ["#7E8188", "#F4F5F7", "#AEB1B8"],
  bronze: ["#7A4A22", "#EDB784", "#A86A3A"],
};

/** Medal on a gold ribbon with the place number on it. */
export function MedalIcon({ metal, place, className }: { metal: MedalMetal; place: number; className?: string }) {
  const id = useGradientId(`medal-${metal}`);
  const ribbon = useGradientId("ribbon");
  const [dark, light, mid] = METALS[metal];
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={dark} />
          <stop offset="0.5" stopColor={light} />
          <stop offset="1" stopColor={mid} />
        </linearGradient>
        <linearGradient id={ribbon} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9C7A2E" />
          <stop offset="0.5" stopColor="#E8C875" />
          <stop offset="1" stopColor="#9C7A2E" />
        </linearGradient>
      </defs>
      {/* ribbon */}
      <path d="M20 1h9l7 21h-9L20 1Z" fill={`url(#${ribbon})`} />
      <path d="M44 1h-9l-7 21h9l7-21Z" fill={`url(#${ribbon})`} opacity=".75" />
      {/* medal */}
      <circle cx="32" cy="40" r="22" fill={`url(#${id})`} />
      <circle cx="32" cy="40" r="17" fill="none" stroke="#0A0A0B" strokeOpacity=".22" strokeWidth="2" />
      <text
        x="32"
        y="41.5"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="var(--font-orbitron), Arial Black, sans-serif"
        fontWeight="900"
        fontSize="22"
        fill="#0A0A0B"
        fillOpacity=".78"
      >
        {place}
      </text>
    </svg>
  );
}
