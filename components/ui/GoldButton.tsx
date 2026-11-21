"use client";

import { useRef, type ButtonHTMLAttributes, type ReactNode } from "react";
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
  /**
   * Fires on touch-DOWN (like the keyboard keys) instead of on click, so a
   * finger that slides slightly or a slow kiosk PC never loses the tap.
   * Enter / Space on a focused button still work. Prefer this over onClick
   * for buttons players tap on the kiosk.
   */
  onPress?: () => void;
}

const SIZES = {
  // min height 96 px at 1080 width ≈ 8.9cqw
  lg: "min-h-[max(56px,8.9cqw)] px-[6cqw] text-k-md",
  xl: "min-h-[max(64px,11cqw)] px-[8cqw] text-k-lg",
};

/**
 * Gold gradient pill button with a light sweep and pressed state.
 *
 * The pressed look is set straight on the element (no React state), so a
 * press never re-renders the button – important on slow kiosk PCs.
 */
export function GoldButton({
  children,
  breathe = false,
  loading = false,
  softDisabled = false,
  size = "lg",
  sweepDelay,
  disabled,
  className = "",
  onPress,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  type = "button",
  ...rest
}: GoldButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const inactive = disabled || loading || softDisabled;
  const canPress = !disabled && !loading;

  const setPressed = (pressed: boolean) => {
    if (buttonRef.current) buttonRef.current.dataset.pressed = String(pressed);
  };

  return (
    <button
      ref={buttonRef}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={softDisabled || undefined}
      data-pressed="false"
      data-breathe={breathe}
      data-state={loading ? "loading" : "idle"}
      className={`gold-button font-display inline-flex items-center justify-center gap-[2cqw] font-bold ${SIZES[size]} ${className}`}
      onPointerDown={(e) => {
        onPointerDown?.(e);
        if (e.button !== 0) return; // ignore right / middle mouse buttons
        if (!inactive) setPressed(true);
        if (onPress && canPress) onPress();
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
      onClick={(e) => {
        if (loading) return;
        if (onPress) {
          // Touch and mouse were handled on pointerdown; this only catches Enter / Space.
          if (e.detail === 0) onPress();
          return;
        }
        rest.onClick?.(e);
      }}
    >
      {!inactive && <LightSweep delay={sweepDelay} />}
      {loading && <span className="spinner" aria-hidden />}
      <span className="relative z-[3]">{children}</span>
    </button>
  );
}
