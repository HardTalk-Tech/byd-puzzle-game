import type { PlayerRepository } from "@/lib/players/repository";
import type { GameResult, NewPlayer, PlayerRecord } from "@/lib/types";
import { safeStorage, STORAGE_KEYS } from "@/lib/utils/safeStorage";

type LocalPlayers = Record<string, PlayerRecord>;

function readAll(): LocalPlayers {
  const data = safeStorage.getJSON<LocalPlayers>(STORAGE_KEYS.localPlayers, {});
  return data && typeof data === "object" ? data : {};
}

function writeAll(players: LocalPlayers) {
  safeStorage.setJSON(STORAGE_KEYS.localPlayers, players);
}

/** All local players, newest first (for the staff dashboard in local mode). */
export function listLocalPlayers(): PlayerRecord[] {
  return Object.values(readAll()).sort((a, b) => b.clientCreatedAt.localeCompare(a.clientCreatedAt));
}

/**
 * Local mode (no Firebase credentials): players and results in
 * localStorage under one key. Same behaviour as Firestore, including the
 * rules: a number is created once and finished once.
 */
export function createLocalRepository(): PlayerRepository {
  return {
    async hasPlayed(phone) {
      return phone in readAll();
    },

    registerPlayer(input: NewPlayer) {
      const players = readAll();
      if (players[input.phone]) return; // create once
      players[input.phone] = { ...input, status: "playing", createdAtMs: Date.now() };
      writeAll(players);
    },

    saveResult(phone: string, result: GameResult) {
      const players = readAll();
      const player = players[phone];
      if (!player || player.status !== "playing") return; // finish once
      players[phone] = { ...player, ...result };
      writeAll(players);
    },

    pendingWrites: () => 0,
  };
}
