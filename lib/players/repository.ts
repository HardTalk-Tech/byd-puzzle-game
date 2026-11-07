import { isFirebaseConfigured } from "@/lib/firebase/config";
import { createFirestoreRepository } from "@/lib/players/firestoreRepository";
import { createLocalRepository } from "@/lib/players/localRepository";
import type { GameResult, NewPlayer } from "@/lib/types";

export interface PlayerRepository {
  hasPlayed(phone: string): Promise<boolean>;
  registerPlayer(input: NewPlayer): void; // fire-and-forget
  saveResult(phone: string, result: GameResult): void; // fire-and-forget
  pendingWrites(): number; // for the status panel
}

/**
 * Firestore when Firebase is configured, otherwise local mode
 * (localStorage). Call in the browser only.
 */
export function createPlayerRepository(): PlayerRepository {
  return isFirebaseConfigured ? createFirestoreRepository() : createLocalRepository();
}
