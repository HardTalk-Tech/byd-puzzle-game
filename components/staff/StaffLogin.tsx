"use client";

import { useState, type FormEvent } from "react";
import { messages } from "@/content/messages";

interface StaffLoginProps {
  onSignIn: (email: string, password: string) => Promise<void>;
}

/** Email + password sign-in (Firebase Auth). */
export function StaffLogin({ onSignIn }: StaffLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onSignIn(email.trim(), password);
    } catch {
      setError(messages.staff.signInFailed);
      setBusy(false);
    }
  };

  const input =
    "w-full rounded-xl border border-graphite-500 bg-graphite-600 px-4 py-3 text-base text-ivory outline-none transition focus:border-gold-400 focus:shadow-[0_0_24px_rgba(232,200,117,.35)]";

  return (
    <form onSubmit={submit} className="glass-panel mx-auto mt-16 flex w-full max-w-sm flex-col gap-4 p-7">
      <h1 className="font-display gold-text text-xl font-bold">{messages.staff.title}</h1>
      <label className="flex flex-col gap-1.5 text-sm text-mist">
        {messages.staff.email}
        <input type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} className={input} />
      </label>
      <label className="flex flex-col gap-1.5 text-sm text-mist">
        {messages.staff.password}
        <input
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={input}
        />
      </label>
      {error && (
        <p role="alert" className="text-sm font-semibold text-gold-300">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={busy}
        className="gold-button font-display mt-2 min-h-12 px-6 text-sm font-bold disabled:opacity-70"
      >
        {busy ? messages.staff.signingIn : messages.staff.signIn}
      </button>
    </form>
  );
}
