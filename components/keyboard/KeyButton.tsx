"use client";

import { useState, type ReactNode } from "react";
import { playTone } from "@/lib/utils/sound";

interface KeyButtonProps {
  children: ReactNode;
  onPress: () => void;
  label?: string;
  variant?: "default" | "accent";
  className?: string;
}

/** One on-screen key: quick gold flash + scale 0.95 on press. */
export function KeyButton({ children, onPress, label, variant = "default", className = "" }: KeyButtonProps) {
  const [pressed, setPressed] = useState(false);
  const [flash, setFlash] = useState(0);

  return (
    <button
      type="button"
      aria-label={label}
      data-pressed={pressed}
      data-variant={variant}
      className={`key font-display flex min-h-[max(48px,8.2cqw)] items-center justify-center font-bold ${className}`}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      onClick={() => {
        setFlash((f) => f + 1);
        playTone("key");
        onPress();
      }}
    >
      {flash > 0 && <span key={flash} aria-hidden className="key-flash" />}
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </button>
  );
}
