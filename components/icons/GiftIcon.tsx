"use client";

import type { GiftId } from "@/config/game";
import { GOLD_STOPS, useGradientId } from "@/components/icons/useGradientId";

const SHADE = "#0A0A0B";

/** Gold icon for each gift: umbrella, bag, cap, pen. */
export function GiftIcon({ gift, className }: { gift: GiftId; className?: string }) {
  const id = useGradientId(`gift-${gift}`);
  const gold = `url(#${id})`;

  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          {GOLD_STOPS.map((s) => (
            <stop key={s.offset} offset={s.offset} stopColor={s.color} />
          ))}
        </linearGradient>
      </defs>

      {gift === "umbrella" && (
        <>
          <path
            d="M5 31C5 16 17 6 32 6s27 10 27 25c-4.5-4-9.5-4-13.5 0-4.5-4-9-4-13.5 0-4.5-4-9-4-13.5 0C14.5 27 9.5 27 5 31Z"
            fill={gold}
          />
          <path d="M32 6c-6 6-9 15-9 25M32 6c6 6 9 15 9 25" stroke={SHADE} strokeOpacity=".28" strokeWidth="1.6" />
          <path d="M32 31v19a5.5 5.5 0 0 1-11 0" stroke={gold} strokeWidth="4.2" strokeLinecap="round" />
          <circle cx="32" cy="5" r="2.2" fill={gold} />
        </>
      )}

      {gift === "bag" && (
        <>
          <path d="M23 24v-6a9 9 0 0 1 18 0v6" stroke={gold} strokeWidth="4.2" strokeLinecap="round" />
          <path d="M12 22h40l-3.2 33a4.5 4.5 0 0 1-4.5 4H19.7a4.5 4.5 0 0 1-4.5-4L12 22Z" fill={gold} />
          <circle cx="23" cy="28" r="2.4" fill={SHADE} fillOpacity=".45" />
          <circle cx="41" cy="28" r="2.4" fill={SHADE} fillOpacity=".45" />
          <path d="M18 50h28" stroke={SHADE} strokeOpacity=".22" strokeWidth="2" />
        </>
      )}

      {gift === "cap" && (
        <>
          <path d="M6 43C6 26 17 15 31 15s24 11 24 26L6 43Z" fill={gold} />
          <path d="M40 41c9 0 17 1 21 4-4 4-15 5-25 3l4-7Z" fill={gold} />
          <path d="M31 16c-4 7-6 16-6 26M31 16c5 7 9 15 10 25" stroke={SHADE} strokeOpacity=".25" strokeWidth="1.6" />
          <circle cx="31" cy="14.5" r="3" fill={gold} />
          <path d="M6 43h34" stroke={SHADE} strokeOpacity=".3" strokeWidth="2" />
        </>
      )}

      {gift === "pen" && (
        <g transform="rotate(-40 32 32)">
          <rect x="26.5" y="3" width="11" height="40" rx="3.5" fill={gold} />
          <path d="M26.5 43h11L32 59l-5.5-16Z" fill={gold} />
          <path d="M30.6 53.5 32 59l1.4-5.5h-2.8Z" fill={SHADE} fillOpacity=".55" />
          <rect x="36.5" y="7" width="3.2" height="17" rx="1.6" fill={gold} stroke={SHADE} strokeOpacity=".3" />
          <rect x="29" y="7" width="2.2" height="30" rx="1.1" fill="#FFF7DF" fillOpacity=".45" />
          <path d="M26.5 37h11" stroke={SHADE} strokeOpacity=".3" strokeWidth="1.6" />
        </g>
      )}
    </svg>
  );
}
