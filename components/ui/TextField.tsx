"use client";

import type { ReactNode } from "react";

interface TextFieldProps {
  label: string;
  /** Text shown in the field (already formatted). */
  value: string;
  placeholder?: string;
  active: boolean;
  error?: string | null;
  /** Increment to replay the shake animation. */
  shakeKey?: number;
  icon?: ReactNode;
  onActivate: () => void;
}

/**
 * Display-only field driven by the on-screen keyboard: no native input,
 * so the device keyboard never opens.
 */
export function TextField({ label, value, placeholder, active, error, shakeKey = 0, icon, onActivate }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-[1cqw]">
      <span className="font-display text-k-xs font-bold text-mist">{label}</span>
      <button
        key={shakeKey}
        type="button"
        role="textbox"
        aria-label={label}
        aria-invalid={Boolean(error)}
        onClick={onActivate}
        data-active={active}
        className={`flex min-h-[max(64px,10.5cqw)] w-full items-center gap-[2cqw] rounded-[clamp(12px,2.2cqw,32px)] border-2 bg-graphite-600 px-[3.4cqw] text-left transition-[border-color,box-shadow] duration-200 ${
          active ? "border-gold-400 glow" : error ? "border-gold-600/80" : "border-graphite-500"
        } ${shakeKey > 0 && error ? "shake" : ""}`}
      >
        {icon && <span className="w-[5cqw] shrink-0 text-gold-400">{icon}</span>}
        <span className="min-w-0 flex-1 truncate text-k-lg font-semibold">
          {value ? (
            <span className="text-ivory">{value}</span>
          ) : (
            !active && <span className="text-graphite-500">{placeholder}</span>
          )}
          {active && <span className="caret" aria-hidden />}
        </span>
      </button>
      <span className="min-h-[1.3em] text-k-xs font-semibold text-gold-300" role={error ? "alert" : undefined}>
        {error ?? ""}
      </span>
    </div>
  );
}
