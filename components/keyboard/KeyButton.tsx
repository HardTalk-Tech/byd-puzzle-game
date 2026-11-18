"use client";

import { memo, useRef, type ReactNode } from "react";
import { playTone } from "@/lib/utils/sound";

interface KeyButtonProps {
  children: ReactNode;
  onPress: () => void;
  label?: string;
  variant?: "default" | "accent";
  className?: string;
}

const FLASH_FRAMES: Keyframe[] = [{ opacity: 1 }, { opacity: 0 }];
const FLASH_TIMING: KeyframeAnimationOptions = { duration: 280, easing: "ease-out" };

/**
 * One on-screen key: quick gold flash + scale 0.95 on press.
 *
 * Built for slow kiosk PCs: the key fires on touch-DOWN (not when the
 * finger lifts, so a slight slide never loses a tap), and the pressed /
 * flash effects are applied straight to the element, so pressing a key
 * never re-renders the keyboard.
 */
export const KeyButton = memo(function KeyButton({ children, onPress, label, variant = "default", className = "" }: KeyButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const flashRef = useRef<HTMLSpanElement>(null);

  const setPressed = (pressed: boolean) => {
    if (buttonRef.current) buttonRef.current.dataset.pressed = String(pressed);
  };

  const press = () => {
    setPressed(true);
    flashRef.current?.animate(FLASH_FRAMES, FLASH_TIMING);
    playTone("key");
    onPress();
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label={label}
      data-pressed="false"
      data-variant={variant}
      className={`key font-display flex min-h-[max(48px,8.2cqw)] items-center justify-center font-bold ${className}`}
      onPointerDown={(e) => {
        if (e.button !== 0) return; // ignore right / middle mouse buttons
        press();
      }}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      // Touch and mouse are handled on pointerdown; this only catches Enter / Space on a focused key.
      onClick={(e) => {
        if (e.detail === 0) press();
      }}
    >
      <span ref={flashRef} aria-hidden className="key-flash" />
      <span className="relative z-[1] flex items-center justify-center">{children}</span>
    </button>
  );
});
