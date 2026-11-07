/**
 * localStorage wrapped in try/catch. If storage is blocked or full, values
 * fall back to an in-memory map so the kiosk keeps working.
 */
const memory = new Map<string, string>();

function storage(): Storage | null {
  try {
    if (typeof window === "undefined" || !window.localStorage) return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      const value = storage()?.getItem(key);
      if (value !== null && value !== undefined) return value;
    } catch {
      // fall through to memory
    }
    return memory.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    memory.set(key, value);
    try {
      storage()?.setItem(key, value);
    } catch {
      // memory copy is kept
    }
  },

  removeItem(key: string): void {
    memory.delete(key);
    try {
      storage()?.removeItem(key);
    } catch {
      // ignore
    }
  },

  getJSON<T>(key: string, fallback: T): T {
    const raw = this.getItem(key);
    if (raw === null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },

  setJSON(key: string, value: unknown): void {
    this.setItem(key, JSON.stringify(value));
  },
};

export type KeyValueStore = Pick<typeof safeStorage, "getJSON" | "setJSON">;

/** Storage keys used by the app, in one place. */
export const STORAGE_KEYS = {
  carBag: "byd-puzzle:car-bag",
  recentScrambles: "byd-puzzle:recent-scrambles",
  localPlayers: "byd-puzzle:players",
  pendingWrites: "byd-puzzle:pending-writes",
} as const;
