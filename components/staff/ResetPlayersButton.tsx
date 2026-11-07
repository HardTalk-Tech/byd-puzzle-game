"use client";

import { useState } from "react";
import { ExportCsvButton } from "@/components/staff/ExportCsvButton";
import { messages } from "@/content/messages";
import { resetAllPlayers } from "@/lib/players/staffAdmin";
import type { PlayerRecord } from "@/lib/types";

interface ResetPlayersButtonProps {
  players: PlayerRecord[];
}

type Phase = "closed" | "confirm" | "working" | "done" | "error";

/** Deletes all player data after a typed confirmation. */
export function ResetPlayersButton({ players }: ResetPlayersButtonProps) {
  const t = messages.staff.reset;
  const [phase, setPhase] = useState<Phase>("closed");
  const [typed, setTyped] = useState("");
  const [result, setResult] = useState("");

  const close = () => {
    setPhase("closed");
    setTyped("");
  };

  const reset = async () => {
    setPhase("working");
    try {
      const count = await resetAllPlayers();
      setResult(t.done.replace("{count}", String(count)));
      setPhase("done");
    } catch (err) {
      const code = (err as { code?: string }).code;
      setResult(code === "permission-denied" ? t.permissionDenied : `${t.failed} ${(err as Error).message ?? ""}`);
      setPhase("error");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setPhase("confirm")}
        disabled={players.length === 0}
        className="font-display min-h-11 rounded-full border border-graphite-500 px-5 text-xs font-bold text-mist transition hover:border-gold-400 hover:text-ivory disabled:opacity-40"
      >
        {t.button}
      </button>

      {phase !== "closed" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        >
          <div className="glass-panel flex w-full max-w-md flex-col gap-4 p-6">
            <h2 className="font-display gold-text text-lg font-bold">{t.title}</h2>

            {phase === "done" || phase === "error" ? (
              <>
                <p role={phase === "error" ? "alert" : "status"} className="text-sm text-ivory">
                  {result}
                </p>
                <div className="flex justify-end">
                  <button type="button" onClick={close} className="gold-button font-display min-h-11 px-6 text-xs font-bold">
                    {messages.ok}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm leading-relaxed text-ivory/90">
                  {t.body.replace("{count}", String(players.length))}
                </p>
                <div className="flex items-center justify-between gap-3 rounded-xl border border-graphite-500 px-4 py-3">
                  <span className="text-sm text-mist">{t.exportFirst}</span>
                  <ExportCsvButton players={players} />
                </div>
                <label className="flex flex-col gap-1.5 text-sm text-mist">
                  {t.typeToConfirm}
                  <input
                    value={typed}
                    onChange={(e) => setTyped(e.target.value)}
                    autoComplete="off"
                    autoFocus
                    disabled={phase === "working"}
                    className="rounded-xl border border-graphite-500 bg-graphite-600 px-4 py-2.5 text-base tracking-widest text-ivory outline-none focus:border-gold-400"
                  />
                </label>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={close}
                    disabled={phase === "working"}
                    className="font-display min-h-11 rounded-full border border-graphite-500 px-5 text-xs font-bold disabled:opacity-40"
                  >
                    {t.cancel}
                  </button>
                  <button
                    type="button"
                    onClick={() => void reset()}
                    disabled={typed.trim() !== t.confirmWord || phase === "working"}
                    className="gold-button font-display min-h-11 px-5 text-xs font-bold"
                  >
                    {phase === "working" ? t.working : t.confirm}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
