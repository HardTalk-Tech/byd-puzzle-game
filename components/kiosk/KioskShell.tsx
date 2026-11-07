"use client";

import { AnimatePresence } from "motion/react";
import { useCallback, useRef, useState, type ReactNode } from "react";
import { BackgroundFx } from "@/components/effects/BackgroundFx";
import { StatusPanel } from "@/components/system/StatusPanel";
import { uiConfig } from "@/config/game";
import { StatusTriggerContext } from "@/hooks/useStatusTrigger";

interface KioskShellProps {
  children: ReactNode;
  /** Lighter background effects during play. */
  fxIntensity?: "full" | "light";
  /** For the status panel. */
  getPendingWrites?: () => number;
}

const noPendingWrites = () => 0;

/**
 * Portrait frame: a centred 9:16 column (black sides on landscape
 * screens) with the background effects behind the screens. Also owns the
 * hidden status panel: 5 taps on the logo within 3 s open it.
 */
export function KioskShell({ children, fxIntensity = "full", getPendingWrites = noPendingWrites }: KioskShellProps) {
  const [statusOpen, setStatusOpen] = useState(false);
  const taps = useRef<number[]>([]);

  const registerTap = useCallback(() => {
    const now = performance.now();
    taps.current = [...taps.current.filter((t) => now - t < uiConfig.statusTapWindowMs), now];
    if (taps.current.length >= uiConfig.statusTaps) {
      taps.current = [];
      setStatusOpen(true);
    }
  }, []);

  return (
    <div className="kiosk-viewport">
      <div className="kiosk-root">
        <BackgroundFx intensity={fxIntensity} />
        <StatusTriggerContext.Provider value={registerTap}>
          <div className="relative z-10 h-full w-full">{children}</div>
        </StatusTriggerContext.Provider>
        <AnimatePresence>
          {statusOpen && <StatusPanel onClose={() => setStatusOpen(false)} getPendingWrites={getPendingWrites} />}
        </AnimatePresence>
      </div>
    </div>
  );
}
