"use client";

import { GOLD_STOPS, useGradientId } from "@/components/icons/useGradientId";

export function TrophyIcon({ className }: { className?: string }) {
  const id = useGradientId("trophy");
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M18 8h28v14c0 9.5-6.2 16.5-14 16.5S18 31.5 18 22V8Z"
        fill={`url(#${id})`}
        stroke="#F3DC9A"
        strokeWidth="1.2"
      />
      <path
        d="M18 13H9c0 9 4.2 14 11 14.5M46 13h9c0 9-4.2 14-11 14.5"
        fill="none"
        stroke={`url(#${id})`}
        strokeWidth="3.4"
        strokeLinecap="round"
      />
      <path d="M28 38.5h8l1.5 9h-11l1.5-9Z" fill={`url(#${id})`} />
      <rect x="20" y="47" width="24" height="8" rx="2.5" fill={`url(#${id})`} />
      <path d="M32 14.5l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8 2.4-4.9Z" fill="#0A0A0B" opacity=".55" />
    </svg>
  );
}
