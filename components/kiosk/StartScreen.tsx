"use client";

import type { ReactNode } from "react";
import { SweepText } from "@/components/effects/SweepText";
import { HandIcon } from "@/components/icons/HandIcon";
import { PuzzleIcon } from "@/components/icons/PuzzleIcon";
import { StopwatchIcon } from "@/components/icons/StopwatchIcon";
import { DemoBoard } from "@/components/puzzle/DemoBoard";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GoldButton } from "@/components/ui/GoldButton";
import { messages } from "@/content/messages";
import { useStatusTrigger } from "@/hooks/useStatusTrigger";

interface StartScreenProps {
  onStart: () => void;
}

const STEP_ICONS: ReactNode[] = [
  <HandIcon key="hand" className="h-full w-full" />,
  <PuzzleIcon key="puzzle" className="h-full w-full" />,
  <StopwatchIcon key="watch" className="h-full w-full" />,
];

/** Attract screen: tapping anywhere starts. */
export function StartScreen({ onStart }: StartScreenProps) {
  const onLogoTap = useStatusTrigger();
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={messages.start.cta}
      onClick={onStart}
      onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onStart()}
      className="flex h-full cursor-pointer flex-col items-center px-[5cqw] pt-[2.4cqh] pb-[3cqh] outline-none"
    >
      <div className="flex h-[6%] items-center justify-center">
        <button
          type="button"
          aria-label="BYD"
          onClick={(e) => {
            // Logo taps open the hidden status panel, not the game.
            e.stopPropagation();
            onLogoTap();
          }}
        >
          <BrandLogo eager />
        </button>
      </div>

      <div className="flex h-[19%] flex-col items-center justify-center gap-[1.6cqh] text-center">
        <h1 className="font-display text-k-title leading-[1.02] font-black">
          <SweepText period={5.5} delay={1.2}>
            {messages.start.title}
          </SweepText>
        </h1>
        <p className="text-k-sm leading-snug font-semibold text-ivory/90">{messages.start.subtitle}</p>
      </div>

      <div className="flex h-[43%] items-center justify-center">
        <div className="w-[min(78cqw,40cqh)]">
          <DemoBoard />
        </div>
      </div>

      <ol className="grid h-[17%] w-full grid-cols-3 items-center gap-[3cqw]">
        {messages.start.steps.map((step, i) => (
          <li key={step} className="flex flex-col items-center gap-[1.2cqw] text-center">
            <span className="relative flex h-[12cqw] w-[12cqw] items-center justify-center rounded-full border border-gold-500/50 bg-graphite-800/80 p-[2.6cqw] text-gold-400">
              {STEP_ICONS[i]}
              <span className="font-display gold-fill absolute -top-[1cqw] -left-[1cqw] flex h-[5.2cqw] w-[5.2cqw] items-center justify-center rounded-full text-k-xs font-black text-ink">
                {i + 1}
              </span>
            </span>
            <span className="text-k-xs leading-tight font-semibold">{step}</span>
          </li>
        ))}
      </ol>

      <div className="flex h-[15%] w-full items-center justify-center">
        {/* Taps bubble up to the screen's own onClick. */}
        <GoldButton breathe size="xl" className="w-[84%]">
          {messages.start.cta}
        </GoldButton>
      </div>
    </div>
  );
}
