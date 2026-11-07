import { CARS, type Car } from "@/config/cars";
import { gameConfig } from "@/config/game";
import { scramblePool } from "@/lib/puzzle/scramblePool";
import type { Scramble } from "@/lib/types";
import { safeStorage, STORAGE_KEYS, type KeyValueStore } from "@/lib/utils/safeStorage";

type Random = () => number;

interface CarBagState {
  queue: string[]; // slugs still to deal in this bag
  last: string | null; // last slug dealt (across refills)
}

function shuffle<T>(items: T[], random: Random): T[] {
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Shuffle bag: deals every car once in random order before any repeats, and
 * never the same car twice in a row across refills. State is persisted.
 */
export function createCarBag(cars: Car[] = CARS, store: KeyValueStore = safeStorage, random: Random = Math.random) {
  const slugs = new Set(cars.map((c) => c.slug));
  const bySlug = new Map(cars.map((c) => [c.slug, c]));

  const load = (): CarBagState => {
    const s = store.getJSON<CarBagState>(STORAGE_KEYS.carBag, { queue: [], last: null });
    const queue = Array.isArray(s?.queue) ? s.queue.filter((slug) => slugs.has(slug)) : [];
    return { queue, last: typeof s?.last === "string" ? s.last : null };
  };

  const ensureFilled = (state: CarBagState): CarBagState => {
    if (state.queue.length > 0) return state;
    const queue = shuffle([...slugs], random);
    if (queue.length > 1 && queue[0] === state.last) {
      const j = 1 + Math.floor(random() * (queue.length - 1));
      [queue[0], queue[j]] = [queue[j], queue[0]];
    }
    const filled = { ...state, queue };
    store.setJSON(STORAGE_KEYS.carBag, filled);
    return filled;
  };

  return {
    /** The car the next deal() will return (used to preload its image). */
    peek(): Car {
      return bySlug.get(ensureFilled(load()).queue[0])!;
    },
    deal(): Car {
      const state = ensureFilled(load());
      const [slug, ...rest] = state.queue;
      store.setJSON(STORAGE_KEYS.carBag, { queue: rest, last: slug });
      return bySlug.get(slug)!;
    },
  };
}

/** Random scramble, excluding the last `memory` used IDs (persisted). */
export function createScramblePicker(
  scrambles: Scramble[] = scramblePool.scrambles,
  memory: number = gameConfig.recentScrambleMemory,
  store: KeyValueStore = safeStorage,
  random: Random = Math.random,
) {
  return {
    pick(): Scramble {
      const stored = store.getJSON<string[]>(STORAGE_KEYS.recentScrambles, []);
      const recent = new Set(Array.isArray(stored) ? stored.slice(-memory) : []);
      let options = scrambles.filter((s) => !recent.has(s.id));
      if (options.length === 0) options = scrambles;
      const chosen = options[Math.floor(random() * options.length)];
      const nextRecent = [...(Array.isArray(stored) ? stored : []), chosen.id].slice(-memory);
      store.setJSON(STORAGE_KEYS.recentScrambles, nextRecent);
      return chosen;
    },
  };
}
