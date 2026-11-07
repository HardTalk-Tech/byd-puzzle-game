"use client";

import { GOLD_STOPS, useGradientId } from "@/components/icons/useGradientId";

export function StopwatchIcon({ className }: { className?: string }) {
  const id = useGradientId("watch");
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <circle cx="32" cy="36" r="21" stroke={`url(#${id})`} strokeWidth="4.5" />
      <path d="M26 7h12M32 7v8M48.5 17.5l3.5-3.5" stroke={`url(#${id})`} strokeWidth="4.5" strokeLinecap="round" />
      <path d="M32 36V24M32 36l8 6" stroke="#F3DC9A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="32" cy="36" r="2.8" fill="#F3DC9A" />
    </svg>
  );
}
