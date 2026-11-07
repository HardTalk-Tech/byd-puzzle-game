"use client";

import { createContext, useContext } from "react";

/** Provided by KioskShell: call on each logo tap; 5 taps within 3 s open the status panel. */
export const StatusTriggerContext = createContext<() => void>(() => {});

export function useStatusTrigger(): () => void {
  return useContext(StatusTriggerContext);
}
