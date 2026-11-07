"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { LetterKeyboard } from "@/components/keyboard/LetterKeyboard";
import { NumberPad } from "@/components/keyboard/NumberPad";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { GoldButton } from "@/components/ui/GoldButton";
import { TextField } from "@/components/ui/TextField";
import { gameConfig, PHONE_DIGITS } from "@/config/game";
import { messages } from "@/content/messages";
import { useStatusTrigger } from "@/hooks/useStatusTrigger";
import { formatName, isValidName } from "@/lib/utils/name";
import { formatPhone, isValidPhone } from "@/lib/utils/phone";

type Field = "name" | "phone";

export interface Registration {
  name: string; // formatted, e.g. "Kasun Perera"
  phone: string; // 10 digits
}

interface RegisterScreenProps {
  /** Number check running: spinner on the button. */
  checking: boolean;
  onSubmit: (registration: Registration) => void;
}

export function RegisterScreen({ checking, onSubmit }: RegisterScreenProps) {
  const onLogoTap = useStatusTrigger();
  const [name, setName] = useState(""); // as typed (letters and single spaces)
  const [phone, setPhone] = useState(""); // digits only
  const [field, setField] = useState<Field>("name");
  const [errors, setErrors] = useState<{ name: string | null; phone: string | null }>({ name: null, phone: null });
  const [shake, setShake] = useState({ name: 0, phone: 0 });

  const nameValid = isValidName(name);
  const phoneValid = isValidPhone(phone);
  const canStart = nameValid && phoneValid;

  const flagError = (f: Field) => {
    setErrors((e) => ({
      ...e,
      [f]: f === "name" ? messages.register.errors.nameRequired : messages.register.errors.phoneLength,
    }));
    setShake((s) => ({ ...s, [f]: s[f] + 1 }));
  };

  const selectField = (next: Field) => {
    // Leaving a half-typed phone number: tell them gently.
    if (field === "phone" && next !== "phone" && phone.length > 0 && !phoneValid) flagError("phone");
    setField(next);
  };

  const typeLetter = (letter: string) => {
    setErrors((e) => ({ ...e, name: null }));
    setName((n) => (n.length >= gameConfig.nameMaxLength ? n : n + letter.toLowerCase()));
  };
  const typeSpace = () =>
    setName((n) => (n.length === 0 || n.endsWith(" ") || n.length >= gameConfig.nameMaxLength ? n : n + " "));
  const deleteLetter = () => setName((n) => n.slice(0, -1));
  const goNext = () => {
    if (!nameValid) return flagError("name");
    setField("phone");
  };

  const typeDigit = (d: string) => {
    setErrors((e) => ({ ...e, phone: null }));
    setPhone((p) => (p.length >= PHONE_DIGITS ? p : p + d));
  };
  const clearPhone = () => setPhone("");
  const deleteDigit = () => setPhone((p) => p.slice(0, -1));

  const submit = () => {
    if (checking) return;
    if (!canStart) {
      if (!nameValid) flagError("name");
      if (!phoneValid) flagError("phone");
      setField(!nameValid ? "name" : "phone");
      return;
    }
    onSubmit({ name: formatName(name), phone });
  };

  // A physical keyboard also works (handy for testing on a laptop).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === "Enter") return submit();
      if (e.key === "Tab") {
        e.preventDefault();
        return selectField(field === "name" ? "phone" : "name");
      }
      if (field === "name") {
        if (/^[a-z]$/i.test(e.key)) typeLetter(e.key);
        else if (e.key === " ") typeSpace();
        else if (e.key === "Backspace") deleteLetter();
      } else {
        if (/^\d$/.test(e.key)) typeDigit(e.key);
        else if (e.key === "Backspace") deleteDigit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div className="flex h-full flex-col px-[5cqw] pt-[2cqh] pb-[2.4cqh]">
      <header className="flex h-[13%] flex-col justify-center gap-[1.4cqh]">
        <button type="button" onClick={onLogoTap} aria-label="BYD" className="w-fit">
          <BrandLogo eager />
        </button>
        <h1 className="font-display gold-text text-k-xl leading-tight font-black">{messages.register.heading}</h1>
      </header>

      <GlassPanel className="mt-[1.5cqh] flex flex-col gap-[1.2cqh] px-[4.5cqw] pt-[2.2cqh] pb-[0.8cqh]">
        <TextField
          label={messages.register.nameLabel}
          value={formatName(name) + (name.endsWith(" ") ? " " : "")}
          active={field === "name"}
          error={errors.name}
          shakeKey={shake.name}
          onActivate={() => selectField("name")}
        />
        <TextField
          label={messages.register.phoneLabel}
          value={formatPhone(phone)}
          placeholder="071 234 5678"
          active={field === "phone"}
          error={errors.phone}
          shakeKey={shake.phone}
          onActivate={() => selectField("phone")}
        />
      </GlassPanel>

      <div className="flex flex-1 items-center justify-center">
        <GoldButton size="xl" softDisabled={!canStart} loading={checking} onClick={submit} className="w-full">
          {messages.register.start}
        </GoldButton>
      </div>

      <div className="h-[38%]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={field}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {field === "name" ? (
              <LetterKeyboard onLetter={typeLetter} onSpace={typeSpace} onBackspace={deleteLetter} onNext={goNext} />
            ) : (
              <NumberPad onDigit={typeDigit} onClear={clearPhone} onBackspace={deleteDigit} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
