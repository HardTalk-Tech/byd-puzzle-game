import { describe, expect, it } from "vitest";
import { createLocalRepository, listLocalPlayers } from "@/lib/players/localRepository";
import { resetAllPlayers } from "@/lib/players/staffAdmin";
import type { NewPlayer } from "@/lib/types";

// In Node there is no localStorage, so safeStorage uses its in-memory fallback.
const player = (phone: string, name = "Kasun Perera"): NewPlayer => ({
  name,
  phone,
  kioskId: "game-kiosk-1",
  modelSlug: "atto-3",
  modelName: "BYD Atto 3",
  scrambleId: "s001",
  clientCreatedAt: new Date().toISOString(),
});

describe("local repository", () => {
  it("detects duplicates", async () => {
    const repo = createLocalRepository();
    expect(await repo.hasPlayed("0700000001")).toBe(false);
    repo.registerPlayer(player("0700000001"));
    expect(await repo.hasPlayed("0700000001")).toBe(true);
    expect(await repo.hasPlayed("0700000002")).toBe(false);
  });

  it("creates a number once and finishes it once", () => {
    const repo = createLocalRepository();
    repo.registerPlayer(player("0700000003", "First"));
    repo.registerPlayer(player("0700000003", "Second"));
    repo.saveResult("0700000003", { status: "completed", moves: 16, timeMs: 61000, perfect: true, clientFinishedAt: "x" });
    repo.saveResult("0700000003", { status: "timeout", moves: 3, timeMs: 120000, perfect: false, clientFinishedAt: "y" });
    const saved = listLocalPlayers().find((p) => p.phone === "0700000003")!;
    expect(saved.name).toBe("First");
    expect(saved.status).toBe("completed");
    expect(saved.moves).toBe(16);
    expect(saved.perfect).toBe(true);
  });

  it("ignores results for unknown numbers and reports no pending writes", () => {
    const repo = createLocalRepository();
    repo.saveResult("0799999999", { status: "completed", moves: 20, timeMs: 1, perfect: false, clientFinishedAt: "z" });
    expect(listLocalPlayers().some((p) => p.phone === "0799999999")).toBe(false);
    expect(repo.pendingWrites()).toBe(0);
  });

  it("staff reset deletes every player so numbers can play again", async () => {
    const repo = createLocalRepository();
    repo.registerPlayer(player("0700000010"));
    const before = listLocalPlayers().length;
    expect(before).toBeGreaterThan(0);
    expect(await resetAllPlayers()).toBe(before);
    expect(listLocalPlayers()).toHaveLength(0);
    expect(await repo.hasPlayed("0700000010")).toBe(false);
  });
});
