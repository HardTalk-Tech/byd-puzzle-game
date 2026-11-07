"use client";

import { motion } from "motion/react";
import { useEffect, useState, type ReactNode } from "react";
import { APP_VERSION, KIOSK_ID } from "@/config/game";
import { messages } from "@/content/messages";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { isKioskSignedIn } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { checkOfflineReady } from "@/lib/pwa/offline";

interface StatusPanelProps {
  onClose: () => void;
  getPendingWrites: () => number;
}

const REFRESH_MS = 1000;

/** Hidden diagnostics for staff. Shows no personal data. */
export function StatusPanel({ onClose, getPendingWrites }: StatusPanelProps) {
  const online = useOnlineStatus();
  const [offlineReady, setOfflineReady] = useState<boolean | null>(null);
  const [live, setLive] = useState({ pending: getPendingWrites(), signedIn: isKioskSignedIn() });

  useEffect(() => {
    let cancelled = false;
    const refresh = () => {
      setLive({ pending: getPendingWrites(), signedIn: isKioskSignedIn() });
      void checkOfflineReady().then((ready) => !cancelled && setOfflineReady(ready));
    };
    refresh();
    const t = setInterval(refresh, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(t);
    };
  }, [getPendingWrites]);

  const s = messages.status;
  const yesNo = (v: boolean | null) =>
    v === null ? (
      <span className="text-mist">{s.checking}</span>
    ) : (
      <span className={v ? "text-gold-300" : "text-ivory/70"}>{v ? s.yes : s.no}</span>
    );

  const rows: [string, ReactNode][] = [
    [s.online, yesNo(online)],
    [s.offlineReady, yesNo(offlineReady)],
    [s.firebaseConfigured, yesNo(isFirebaseConfigured)],
    [s.signedIn, yesNo(isFirebaseConfigured ? live.signedIn : false)],
    [s.pendingWrites, <span key="p" className="font-display tabular">{live.pending}</span>],
    [s.kioskId, KIOSK_ID],
    [s.version, APP_VERSION],
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-[60] flex items-center justify-center bg-black/75 backdrop-blur-[6px]"
      role="dialog"
      aria-modal="true"
      aria-label={s.title}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="glass-panel flex w-[88%] flex-col gap-[2.4cqh] p-[6cqw]">
        <h2 className="font-display gold-text text-k-xl font-black">{s.title}</h2>
        <dl className="flex flex-col divide-y divide-graphite-600">
          {rows.map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-[3cqw] py-[1.4cqh] text-k-sm">
              <dt className="text-mist">{label}</dt>
              <dd className="text-right font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="grid grid-cols-2 gap-[3cqw]">
          <button
            type="button"
            onClick={onClose}
            className="font-display min-h-[max(56px,8.9cqw)] rounded-full border border-graphite-500 bg-graphite-700 text-k-sm font-bold"
          >
            {s.close}
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="gold-button font-display min-h-[max(56px,8.9cqw)] text-k-sm font-bold"
          >
            {s.reload}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
