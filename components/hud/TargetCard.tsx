"use client";

import { AnimatePresence } from "motion/react";
import Image from "next/image";
import { TapNudge } from "@/components/hud/TapNudge";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { messages } from "@/content/messages";

interface TargetCardProps {
  modelName: string;
  image: string;
  /** Tap the picture (or hold it) to see it large over the board – see usePeekPreview. */
  onPressStart: () => void;
  onPressEnd: () => void;
  onPressCancel: () => void;
  /** Show the one-time "tap here" hand on the picture. */
  nudge: boolean;
}

/** Model name + the completed car picture; visible the whole game. */
export function TargetCard({ modelName, image, onPressStart, onPressEnd, onPressCancel, nudge }: TargetCardProps) {
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
        className="gold-frame relative aspect-square h-full shrink-0 touch-none"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          onPressStart();
        }}
        onPointerUp={onPressEnd}
        onPointerCancel={onPressCancel}
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
        <AnimatePresence>{nudge && <TapNudge key="nudge" />}</AnimatePresence>
      </button>
    </GlassPanel>
  );
}
