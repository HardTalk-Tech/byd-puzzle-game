"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { GoldButton } from "@/components/ui/GoldButton";
import { uiConfig } from "@/config/game";
import { messages } from "@/content/messages";

interface ModalShellProps {
  icon: ReactNode;
  title: ReactNode;
  body: ReactNode;
  /** Large stat chips (moves, time). */
  stats?: ReactNode;
  footnote?: ReactNode;
  onOk: () => void;
  /** Extra layer above the panel, e.g. confetti. */
  overlay?: ReactNode;
  label: string;
}

/**
 * Popup frame: dark blurred backdrop, centred glass panel (~86% width),
 * icon, Orbitron gold title, short text, big stats and one OK button.
 */
export function ModalShell({ icon, title, body, stats, footnote, onOk, overlay, label }: ModalShellProps) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), uiConfig.modalOkGuardMs);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: uiConfig.modalEnterMs / 1000 }}
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 backdrop-blur-[6px]"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.97 }}
        transition={{ duration: uiConfig.modalEnterMs / 1000, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel flex w-[86%] flex-col items-center gap-[2.4cqh] px-[6cqw] pt-[4cqh] pb-[3.5cqh] text-center"
      >
        <div className="flex h-[24cqw] items-center justify-center">{icon}</div>
        <h2 className="font-display text-k-2xl leading-[1.05] font-black">{title}</h2>
        <div className="text-k-sm leading-snug font-semibold text-ivory/90">{body}</div>
        {stats && <div className="flex w-full justify-center gap-[3cqw]">{stats}</div>}
        {footnote && <div className="text-k-xs font-semibold text-mist">{footnote}</div>}
        <GoldButton size="xl" className="mt-[1cqh] w-full" softDisabled={!ready} onClick={() => ready && onOk()}>
          {messages.ok}
        </GoldButton>
      </motion.div>
      {overlay}
    </motion.div>
  );
}
