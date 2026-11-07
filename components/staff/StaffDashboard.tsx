"use client";

import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ExportCsvButton } from "@/components/staff/ExportCsvButton";
import { ResetPlayersButton } from "@/components/staff/ResetPlayersButton";
import { ResultsTable } from "@/components/staff/ResultsTable";
import { StaffLogin } from "@/components/staff/StaffLogin";
import { StatsSummary } from "@/components/staff/StatsSummary";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { messages } from "@/content/messages";
import { getDb, getFirebaseAuth } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { subscribePlayers } from "@/lib/players/staffFeed";
import type { PlayerRecord } from "@/lib/types";

type Gate =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "denied"; email: string }
  | { kind: "staff"; email: string }
  | { kind: "local" };

/**
 * Staff dashboard: login gate (email/password + staff/{uid} document),
 * live results, summary and CSV export. In local mode it shows the
 * localStorage test data with a banner.
 */
export function StaffDashboard() {
  const [gate, setGate] = useState<Gate>(isFirebaseConfigured ? { kind: "loading" } : { kind: "local" });
  const [players, setPlayers] = useState<PlayerRecord[] | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  // Firebase auth state → access check via staff/{uid}.
  useEffect(() => {
    if (!isFirebaseConfigured) return;
    const auth = getFirebaseAuth();
    return onAuthStateChanged(auth, async (user) => {
      if (!user || user.isAnonymous) return setGate({ kind: "signedOut" });
      const email = user.email ?? "";
      const snap = await getDoc(doc(getDb("staff"), "staff", user.uid)).catch(() => null);
      setGate(snap?.exists() ? { kind: "staff", email } : { kind: "denied", email });
    });
  }, []);

  const canRead = gate.kind === "staff" || gate.kind === "local";
  useEffect(() => {
    if (!canRead) return;
    return subscribePlayers(
      (rows) => {
        setPlayers(rows);
        setFeedError(null);
      },
      (err) => setFeedError(err.message),
    );
  }, [canRead]);

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
  };
  const signOutStaff = () => {
    setPlayers(null);
    void signOut(getFirebaseAuth());
  };

  return (
    <main className="min-h-dvh bg-ink px-4 py-6 text-ivory sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo className="h-6" eager />
            <h1 className="font-display gold-text text-lg font-bold">{messages.staff.title}</h1>
          </div>
          {(gate.kind === "staff" || gate.kind === "denied") && (
            <div className="flex items-center gap-3 text-sm text-mist">
              <span className="hidden sm:inline">{gate.email}</span>
              <button
                type="button"
                onClick={signOutStaff}
                className="rounded-full border border-graphite-500 px-4 py-1.5 font-semibold text-ivory hover:border-gold-400"
              >
                {messages.staff.signOut}
              </button>
            </div>
          )}
        </header>

        {gate.kind === "local" && (
          <div role="status" className="rounded-xl border border-gold-500/50 bg-gold-500/10 px-4 py-3 text-sm font-semibold text-gold-300">
            {messages.staff.localBanner}
          </div>
        )}

        {gate.kind === "loading" && <p className="text-mist">{messages.staff.loading}</p>}
        {gate.kind === "signedOut" && <StaffLogin onSignIn={signIn} />}
        {gate.kind === "denied" && (
          <div className="glass-panel mx-auto mt-16 max-w-sm p-7 text-center">
            <p className="font-display gold-text text-lg font-bold">{messages.staff.notAllowed}</p>
          </div>
        )}

        {canRead && (
          <>
            {feedError && (
              <p role="alert" className="rounded-xl border border-gold-600 px-4 py-3 text-sm text-gold-300">
                {feedError}
              </p>
            )}
            {players === null ? (
              <p className="text-mist">{messages.staff.loading}</p>
            ) : (
              <>
                <StatsSummary players={players} />
                <div className="flex flex-wrap justify-end gap-3">
                  <ResetPlayersButton players={players} />
                  <ExportCsvButton players={players} />
                </div>
                <ResultsTable players={players} />
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
