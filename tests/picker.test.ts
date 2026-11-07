import { describe, expect, it } from "vitest";
import { CARS } from "@/config/cars";
import { createCarBag, createScramblePicker } from "@/lib/puzzle/picker";
import { scramblePool } from "@/lib/puzzle/scramblePool";
import type { KeyValueStore } from "@/lib/utils/safeStorage";

function memoryStore(): KeyValueStore {
  const data = new Map<string, string>();
  return {
    getJSON<T>(key: string, fallback: T): T {
      const raw = data.get(key);
      return raw === undefined ? fallback : (JSON.parse(raw) as T);
    },
    setJSON(key: string, value: unknown) {
      data.set(key, JSON.stringify(value));
    },
  };
}

describe("car shuffle bag", () => {
  it("deals all 9 cars before any repeats", () => {
    const bag = createCarBag(CARS, memoryStore());
    for (let round = 0; round < 5; round++) {
      const dealt = Array.from({ length: CARS.length }, () => bag.deal().slug);
      expect(new Set(dealt).size).toBe(CARS.length);
    }
  });

  it("never deals the same car twice in a row across refills", () => {
    const store = memoryStore();
    let previous: string | null = null;
    for (let i = 0; i < 9 * 200; i++) {
      // A fresh bag object each time proves the state is persisted.
      const slug = createCarBag(CARS, store).deal().slug;
      expect(slug).not.toBe(previous);
      previous = slug;
    }
  });

  it("peek returns the car that deal returns next", () => {
    const bag = createCarBag(CARS, memoryStore());
    for (let i = 0; i < 20; i++) {
      const peeked = bag.peek().slug;
      expect(bag.deal().slug).toBe(peeked);
    }
  });
});

describe("scramble picker", () => {
  it("does not reuse any of the last 100 scrambles", () => {
    const picker = createScramblePicker(scramblePool.scrambles, 100, memoryStore());
    const ids: string[] = [];
    for (let i = 0; i < 1000; i++) {
      const id = picker.pick().id;
      expect(ids.slice(-100)).not.toContain(id);
      ids.push(id);
    }
  });
});
