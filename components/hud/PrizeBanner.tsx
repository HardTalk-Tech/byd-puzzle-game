import { SweepText } from "@/components/effects/SweepText";
import { TrophyIcon } from "@/components/icons/TrophyIcon";
import { messages } from "@/content/messages";

/** "Fewer moves, bigger prize!" – visible the whole game, between the car card and the stats. */
export function PrizeBanner() {
  return (
    <div className="glow flex h-full max-h-[max(36px,6.4cqw)] items-center gap-[2cqw] rounded-full border border-gold-400/70 bg-graphite-800/90 px-[4cqw]">
      <TrophyIcon className="h-[70%] w-auto shrink-0" />
      <span className="font-display text-k-xs leading-none font-black whitespace-nowrap">
        <SweepText period={4} delay={1}>
          {messages.game.prizeHint}
        </SweepText>
      </span>
    </div>
  );
}
