"use client";

import { BackspaceIcon } from "@/components/icons/BackspaceIcon";
import { KeyButton } from "@/components/keyboard/KeyButton";
import { messages } from "@/content/messages";

interface NumberPadProps {
  onDigit: (digit: string) => void;
  onClear: () => void;
  onBackspace: () => void;
}

/** 3×4 grid: 1–9, CLEAR, 0, ⌫. Huge keys. */
export function NumberPad({ onDigit, onClear, onBackspace }: NumberPadProps) {
  return (
    <div className="mx-auto grid h-full w-[86%] grid-cols-3 grid-rows-4 gap-[1.6cqw]">
      {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
        <KeyButton key={d} onPress={() => onDigit(d)} className="text-k-xl">
          {d}
        </KeyButton>
      ))}
      <KeyButton onPress={onClear} className="text-k-sm">
        {messages.labels.clear}
      </KeyButton>
      <KeyButton onPress={() => onDigit("0")} className="text-k-xl">
        0
      </KeyButton>
      <KeyButton onPress={onBackspace} label={messages.labels.backspace}>
        <BackspaceIcon className="w-[8cqw]" />
      </KeyButton>
    </div>
  );
}
