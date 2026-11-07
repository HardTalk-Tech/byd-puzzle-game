"use client";

import { useEffect } from "react";
import { uiConfig } from "@/config/game";
import { messages } from "@/content/messages";

/** Styled "Restarting…" screen; reloads the kiosk at "/" after a few seconds. */
export function RestartingScreen({ error }: { error: unknown }) {
  useEffect(() => {
    console.error(error);
    const t = setTimeout(() => window.location.replace("/"), uiConfig.errorReloadMs);
    return () => clearTimeout(t);
  }, [error]);

  return (
    <div className="kiosk-viewport">
      <div className="kiosk-root flex flex-col items-center justify-center gap-[3cqh] px-[8cqw] text-center">
        <span className="spinner text-[max(40px,12cqw)]" aria-hidden />
        <h1 className="font-display gold-text text-k-2xl font-black">{messages.errorScreen.title}</h1>
        <p className="text-k-sm text-ivory/80">{messages.errorScreen.body}</p>
      </div>
    </div>
  );
}
