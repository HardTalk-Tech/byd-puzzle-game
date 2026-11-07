import { collection, onSnapshot, orderBy, query, Timestamp, type DocumentData } from "firebase/firestore";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { getDb } from "@/lib/firebase/client";
import { PLAYERS_COLLECTION } from "@/lib/players/firestoreRepository";
import { listLocalPlayers } from "@/lib/players/localRepository";
import type { PlayerRecord, PlayerStatus } from "@/lib/types";
import { STORAGE_KEYS } from "@/lib/utils/safeStorage";

const LOCAL_POLL_MS = 2000;

const str = (v: unknown) => (typeof v === "string" ? v : "");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : undefined);
const status = (v: unknown): PlayerStatus => (v === "completed" || v === "timeout" ? v : "playing");

function toRecord(id: string, d: DocumentData): PlayerRecord {
  return {
    name: str(d.name),
    phone: str(d.phone) || id,
    kioskId: str(d.kioskId),
    modelSlug: str(d.modelSlug),
    modelName: str(d.modelName),
    scrambleId: str(d.scrambleId),
    clientCreatedAt: str(d.clientCreatedAt),
    status: status(d.status),
    createdAtMs: d.createdAt instanceof Timestamp ? d.createdAt.toMillis() : null,
    moves: num(d.moves),
    timeMs: num(d.timeMs),
    perfect: typeof d.perfect === "boolean" ? d.perfect : undefined,
    clientFinishedAt: str(d.clientFinishedAt) || undefined,
  };
}

/**
 * Live list of all players, newest first. Firestore: onSnapshot ordered by
 * createdAt. Local mode: localStorage, refreshed on change.
 * Returns an unsubscribe function.
 */
export function subscribePlayers(onData: (players: PlayerRecord[]) => void, onError: (err: Error) => void): () => void {
  if (!isFirebaseConfigured) {
    const refresh = () => onData(listLocalPlayers());
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === STORAGE_KEYS.localPlayers) refresh();
    };
    refresh();
    window.addEventListener("storage", onStorage);
    const timer = setInterval(refresh, LOCAL_POLL_MS);
    return () => {
      window.removeEventListener("storage", onStorage);
      clearInterval(timer);
    };
  }

  const q = query(collection(getDb("staff"), PLAYERS_COLLECTION), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => toRecord(d.id, d.data({ serverTimestamps: "estimate" })))),
    (err) => onError(err),
  );
}
