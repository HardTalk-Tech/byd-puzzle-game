"use client";

import { BackspaceIcon } from "@/components/icons/BackspaceIcon";
import { ChevronIcon } from "@/components/icons/ChevronIcon";
import { KeyButton } from "@/components/keyboard/KeyButton";
import { messages } from "@/content/messages";

const ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];

interface LetterKeyboardProps {
  onLetter: (letter: string) => void;
  onSpace: () => void;
  onBackspace: () => void;
  onNext: () => void;
}

/** QWERTY A–Z, wide SPACE, ⌫ and NEXT → (moves to the phone field). */
export function LetterKeyboard({ onLetter, onSpace, onBackspace, onNext }: LetterKeyboardProps) {
  return (
    <div className="flex h-full flex-col gap-[1.2cqw]">
      {ROWS.map((row, i) => (
        <div key={row} className="flex flex-1 justify-center gap-[1.1cqw]">
          {row.split("").map((letter) => (
            <KeyButton key={letter} onPress={() => onLetter(letter)} className="w-[8.6cqw] text-k-md">
              {letter}
            </KeyButton>
          ))}
          {i === 2 && (
            <KeyButton onPress={onBackspace} label={messages.labels.backspace} className="w-[18cqw]">
              <BackspaceIcon className="w-[6cqw]" />
            </KeyButton>
          )}
        </div>
      ))}
      <div className="flex flex-1 justify-center gap-[1.1cqw]">
        <KeyButton onPress={onSpace} label={messages.labels.space} className="flex-[2.2] text-k-sm">
          {messages.labels.space}
        </KeyButton>
        <KeyButton onPress={onNext} variant="accent" className="flex-1 gap-[1cqw] text-k-sm">
          {messages.labels.next}
          <ChevronIcon className="ml-[1cqw] w-[4cqw]" />
        </KeyButton>
      </div>
    </div>
  );
}
