"use client";

import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { LightSweep } from "@/components/effects/LightSweep";

interface GoldButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  children: ReactNode;
  /** Gentle glow pulse (start screen). */
  breathe?: boolean;
  /** Shows a small gold spinner and blocks taps. */
  loading?: boolean;
  /** Looks disabled but still receives taps (e.g. to show what's missing). */
  softDisabled?: boolean;
  size?: "lg" | "xl";
  sweepDelay?: number;
}

const SIZES = {
  // min height 96 px at 1080 width ≈ 8.9cqw
  lg: "min-h-[max(56px,8.9cqw)] px-[6cqw] text-k-md",
  xl: "min-h-[max(64px,11cqw)] px-[8cqw] text-k-lg",
};

/** Gold gradient pill button with a light sweep and pressed state. */
export function GoldButton({
  children,
  breathe = false,
  loading = false,
  softDisabled = false,
  size = "lg",
  sweepDelay,
  disabled,
  className = "",
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  type = "button",
  ...rest
}: GoldButtonProps) {
  const [pressed, setPressed] = useState(false);
  const inactive = disabled || loading || softDisabled;

  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={softDisabled || undefined}
      data-pressed={pressed && !inactive}
      data-breathe={breathe}
      data-state={loading ? "loading" : "idle"}
      className={`gold-button font-display inline-flex items-center justify-center gap-[2cqw] font-bold ${SIZES[size]} ${className}`}
      onPointerDown={(e) => {
        if (!inactive) setPressed(true);
        onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        setPressed(false);
        onPointerUp?.(e);
      }}
      onPointerLeave={(e) => {
        setPressed(false);
        onPointerLeave?.(e);
      }}
      onPointerCancel={(e) => {
        setPressed(false);
        onPointerCancel?.(e);
      }}
      {...rest}
      onClick={loading ? undefined : rest.onClick}
    >
      {!inactive && <LightSweep delay={sweepDelay} />}
      {loading && <span className="spinner" aria-hidden />}
      <span className="relative z-[3]">{children}</span>
    </button>
  );
}
