import { collection, getDocs, writeBatch } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { isFirebaseConfigured } from "@/lib/firebase/config";
import { PLAYERS_COLLECTION } from "@/lib/players/firestoreRepository";
import { listLocalPlayers } from "@/lib/players/localRepository";
import { safeStorage, STORAGE_KEYS } from "@/lib/utils/safeStorage";

/** Firestore allows at most 500 writes per batch. */
const BATCH_SIZE = 450;

/**
 * Staff only: permanently deletes every player and result, so all phone
 * numbers can play again. Firestore needs the staff delete rule in
 * firestore.rules. Resolves with the number of players deleted.
 */
export async function resetAllPlayers(): Promise<number> {
  if (!isFirebaseConfigured) {
    const count = listLocalPlayers().length;
    safeStorage.removeItem(STORAGE_KEYS.localPlayers);
    return count;
  }

  const db = getDb("staff");
  const snap = await getDocs(collection(db, PLAYERS_COLLECTION));
  for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
    const batch = writeBatch(db);
    snap.docs.slice(i, i + BATCH_SIZE).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }
  return snap.size;
}
