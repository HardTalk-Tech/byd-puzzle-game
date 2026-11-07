"use client";

import { GOLD_STOPS, useGradientId } from "@/components/icons/useGradientId";

/** Friendly car face with a wink (duplicate number popup). */
export function CarWinkIcon({ className }: { className?: string }) {
  const id = useGradientId("carwink");
  return (
    <svg viewBox="0 0 80 64" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>
      <path
        d="M14 30l6.5-14.5A6 6 0 0 1 26 12h28a6 6 0 0 1 5.5 3.5L66 30m-52 0h52a6 6 0 0 1 6 6v10a3 3 0 0 1-3 3H11a3 3 0 0 1-3-3V36a6 6 0 0 1 6-6Z"
        stroke={`url(#${id})`}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M17 49v6M63 49v6" stroke={`url(#${id})`} strokeWidth="6" strokeLinecap="round" />
      {/* open eye */}
      <circle cx="22" cy="38" r="4.5" fill="#F3DC9A" />
      {/* winking eye */}
      <path d="M53 38.5c2.2-2.6 5.8-2.6 8 0" stroke="#F3DC9A" strokeWidth="3.6" strokeLinecap="round" />
      {/* smile */}
      <path d="M33 41c3.8 3.4 10.2 3.4 14 0" stroke="#F3DC9A" strokeWidth="3.4" strokeLinecap="round" />
      <path d="M27 24h26" stroke={`url(#${id})`} strokeWidth="2.5" strokeLinecap="round" opacity=".5" />
    </svg>
  );
}
