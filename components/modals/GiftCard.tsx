"use client";

import { motion } from "motion/react";
import { LightSweep } from "@/components/effects/LightSweep";
import { SweepText } from "@/components/effects/SweepText";
import { GiftIcon } from "@/components/icons/GiftIcon";
import { useGradientId, GOLD_STOPS } from "@/components/icons/useGradientId";
import type { GiftId } from "@/config/game";
import { messages } from "@/content/messages";

/** Longer names (e.g. "Umbrella") use a slightly smaller size so they fit beside the reveal. */
const LONG_NAME = 5;
/** Reveal timeline (seconds after the popup opens). */
const T = { card: 0.5, lid: 1.0, item: 1.15, sticker: 1.5 };

const SPARKLES = [
  { x: "8%", y: "12%", size: "3.4cqw", delay: 0 },
  { x: "82%", y: "6%", size: "2.6cqw", delay: 0.5 },
  { x: "88%", y: "70%", size: "3cqw", delay: 0.9 },
  { x: "2%", y: "74%", size: "2.4cqw", delay: 1.3 },
];

function Sparkle({ size }: { size: string }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size }} aria-hidden>
      <path d="M12 0c1 7 5 11 12 12-7 1-11 5-12 12-1-7-5-11-12-12 7-1 11-5 12-12Z" fill="#F3DC9A" />
    </svg>
  );
}

/** Gold gift box: the lid pops off, then the gift springs out. */
function GiftBox() {
  const id = useGradientId("giftbox");
  const gold = `url(#${id})`;
  const defs = (
    <defs>
      <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
        {GOLD_STOPS.map((s) => (
          <stop key={s.offset} offset={s.offset} stopColor={s.color} />
        ))}
      </linearGradient>
    </defs>
  );
  return (
    <>
      {/* box body */}
      <motion.svg
        viewBox="0 0 64 64"
        aria-hidden
        className="absolute inset-[14%]"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.4, y: "20%" }}
        transition={{ delay: T.item, duration: 0.35, ease: "easeIn" }}
      >
        {defs}
        <rect x="10" y="28" width="44" height="30" rx="4" fill={gold} />
        <rect x="28" y="28" width="8" height="30" fill="#0A0A0B" fillOpacity=".35" />
      </motion.svg>
      {/* lid with bow */}
      <motion.svg
        viewBox="0 0 64 64"
        aria-hidden
        className="absolute inset-[14%]"
        initial={{ y: 0, rotate: 0, opacity: 1 }}
        animate={{ y: "-70%", x: "25%", rotate: 35, opacity: 0 }}
        transition={{ delay: T.lid, duration: 0.5, ease: [0.3, 0.7, 0.4, 1] }}
      >
        {defs}
        <rect x="6" y="18" width="52" height="11" rx="3" fill={gold} />
        <rect x="28" y="18" width="8" height="11" fill="#0A0A0B" fillOpacity=".35" />
        <path d="M32 18c-4-8-14-11-15-5s9 6 15 5Zm0 0c4-8 14-11 15-5s-9 6-15 5Z" fill={gold} stroke="#0A0A0B" strokeOpacity=".25" />
      </motion.svg>
    </>
  );
}

/**
 * Gift reveal on the win popup: a gold box pops open, the gift springs out
 * over turning light rays, the name lands with a playful line, and an
 * "UNLOCKED!" sticker stamps the corner.
 */
export function GiftCard({ gift }: { gift: GiftId }) {
  const name = messages.gift.names[gift];
  const tagline = messages.gift.taglines[gift];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, rotate: -3 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 15, delay: T.card }}
      className="relative w-full"
      role="img"
      aria-label={`${name} – ${tagline}`}
    >
      <div className="gold-frame glow-strong w-full">
        <div className="relative flex items-center gap-[3.5cqw] overflow-hidden rounded-[clamp(10px,2cqw,30px)] bg-[radial-gradient(120%_140%_at_20%_50%,#2e2715_0%,var(--color-graphite-800)_62%)] py-[1.6cqw] pr-[4cqw] pl-[2.5cqw]">
          {/* reveal stage */}
          <div className="relative h-[19cqw] w-[19cqw] shrink-0">
            <motion.span
              className="gift-rays"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: T.item, duration: 0.6 }}
            />
            <GiftBox />
            <motion.div
              className="absolute inset-[10%]"
              initial={{ opacity: 0, scale: 0.2, y: "35%", rotate: -25 }}
              animate={{ opacity: 1, scale: 1, y: "0%", rotate: 0 }}
              transition={{ delay: T.item, type: "spring", stiffness: 260, damping: 11 }}
            >
              {/* gentle float once revealed */}
              <motion.div
                className="h-full w-full"
                animate={{ y: [0, -4, 0], rotate: [0, -4, 0] }}
                transition={{ delay: T.item + 0.8, duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <GiftIcon gift={gift} className="h-full w-full drop-shadow-[0_3px_8px_rgba(0,0,0,0.7)]" />
              </motion.div>
            </motion.div>
            {SPARKLES.map((s, i) => (
              <motion.span
                key={i}
                className="absolute"
                style={{ left: s.x, top: s.y }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], rotate: [0, 90] }}
                transition={{ delay: T.item + s.delay, duration: 1.4, repeat: Infinity, repeatDelay: 0.8 }}
              >
                <Sparkle size={s.size} />
              </motion.span>
            ))}
          </div>

          {/* name + playful line */}
          <motion.div
            className="flex min-w-0 flex-col items-start gap-[1cqw] text-left"
            initial={{ opacity: 0, x: "-12%" }}
            animate={{ opacity: 1, x: "0%" }}
            transition={{ delay: T.item + 0.15, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className={`font-display leading-none font-black whitespace-nowrap ${name.length > LONG_NAME ? "text-k-xl" : "text-k-2xl"}`}
            >
              <SweepText period={3} delay={1.6}>
                {name}
              </SweepText>
            </span>
            <span className="text-k-xs leading-tight font-bold text-ivory">{tagline}</span>
          </motion.div>
          <LightSweep period={3.5} delay={1.8} />
        </div>
      </div>

      {/* "UNLOCKED!" sticker */}
      <motion.span
        className="gold-fill font-display glow-strong absolute -top-[2.2cqw] -right-[1.5cqw] z-10 rounded-[clamp(6px,1cqw,14px)] border-2 border-ink px-[2.4cqw] py-[0.8cqw] text-k-xs font-black text-ink"
        initial={{ opacity: 0, scale: 2.6, rotate: -20 }}
        animate={{ opacity: 1, scale: 1, rotate: 8 }}
        transition={{ delay: T.sticker, type: "spring", stiffness: 420, damping: 14 }}
      >
        {messages.gift.unlocked}
      </motion.span>
    </motion.div>
  );
}
