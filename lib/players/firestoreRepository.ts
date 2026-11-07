import {
  doc,
  getDoc,
  getDocFromCache,
  serverTimestamp,
  setDoc,
  updateDoc,
  waitForPendingWrites,
} from "firebase/firestore";
import { uiConfig } from "@/config/game";
import { ensureKioskSignedIn, getDb } from "@/lib/firebase/client";
import type { PlayerRepository } from "@/lib/players/repository";
import type { GameResult, NewPlayer } from "@/lib/types";
import { safeStorage, STORAGE_KEYS } from "@/lib/utils/safeStorage";
import { withTimeout } from "@/lib/utils/withTimeout";

export const PLAYERS_COLLECTION = "players";

/**
 * Firestore repository for the kiosk. Follows the offline rules in
 * section 10.4: writes are never awaited (offline, Firestore applies them
 * to the local cache at once but only resolves when the server confirms),
 * and there are no transactions or batched reads.
 */
export function createFirestoreRepository(): PlayerRepository {
  const db = getDb("kiosk");
  void ensureKioskSignedIn();
  // Retry the anonymous sign-in when the connection comes back, so writes
  // queued during a first offline launch are sent with credentials.
  if (typeof window !== "undefined") window.addEventListener("online", () => void ensureKioskSignedIn());

  // Pending (unsynced) writes. Writes queued before a reload stay in
  // Firestore's own IndexedDB queue; we remember how many and clear the
  // number once Firestore reports everything synced.
  let pending = 0;
  let carried = Math.max(0, Number(safeStorage.getItem(STORAGE_KEYS.pendingWrites)) || 0);
  const persist = () => safeStorage.setItem(STORAGE_KEYS.pendingWrites, String(pending + carried));
  if (carried > 0) {
    void waitForPendingWrites(db)
      .then(() => {
        carried = 0;
        persist();
      })
      .catch(() => undefined);
  }

  const track = (label: string, write: () => Promise<unknown>) => {
    pending += 1;
    persist();
    ensureKioskSignedIn()
      .then(write)
      .catch((err) => console.warn(`Firestore ${label} failed`, err))
      .finally(() => {
        pending -= 1;
        persist();
      });
  };

  const playerRef = (phone: string) => doc(db, PLAYERS_COLLECTION, phone);

  return {
    async hasPlayed(phone) {
      const ref = playerRef(phone);
      try {
        const snap = await withTimeout(
          ensureKioskSignedIn().then(() => getDoc(ref)),
          uiConfig.duplicateCheckTimeoutMs,
        );
        return snap.exists();
      } catch {
        try {
          return (await getDocFromCache(ref)).exists();
        } catch {
          return false; // not in the local cache while offline → treat as a new player
        }
      }
    },

    registerPlayer(input: NewPlayer) {
      track("register", () =>
        setDoc(playerRef(input.phone), { ...input, status: "playing", createdAt: serverTimestamp() }),
      );
    },

    saveResult(phone: string, result: GameResult) {
      track("result", () => updateDoc(playerRef(phone), { ...result, finishedAt: serverTimestamp() }));
    },

    pendingWrites: () => pending + carried,
  };
}
