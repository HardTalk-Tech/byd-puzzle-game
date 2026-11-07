"use client";

import Image from "next/image";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { messages } from "@/content/messages";

interface TargetCardProps {
  modelName: string;
  image: string;
  /** Press and hold the picture to see it large over the board. */
  onPeekChange: (peeking: boolean) => void;
}

/** Model name + the completed car picture; visible the whole game. */
export function TargetCard({ modelName, image, onPeekChange }: TargetCardProps) {
  return (
    <GlassPanel className="flex h-full items-center gap-[3cqw] px-[4cqw] py-[2.2cqw]">
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-[0.8cqw]">
        <span className="font-display text-k-xs font-bold text-mist">{messages.game.targetLabel}</span>
        <span className="font-display gold-text text-k-xl leading-[1.05] font-black break-words">{modelName}</span>
        <span className="text-k-xs text-ivory/80">{messages.game.targetHint}</span>
      </div>
      <button
        type="button"
        aria-label={messages.game.targetHint}
        className="gold-frame aspect-square h-full shrink-0 touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          onPeekChange(true);
        }}
        onPointerUp={() => onPeekChange(false)}
        onPointerCancel={() => onPeekChange(false)}
        onLostPointerCapture={() => onPeekChange(false)}
        onContextMenu={(e) => e.preventDefault()}
      >
        <Image
          src={image}
          alt={modelName}
          width={400}
          height={400}
          unoptimized
          loading="eager"
          draggable={false}
          className="h-full w-full rounded-[clamp(10px,2cqw,30px)] object-cover"
        />
      </button>
    </GlassPanel>
  );
}
