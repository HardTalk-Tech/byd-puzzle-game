#!/usr/bin/env node
// Generates a pool of 4x4 swap-puzzle scrambles where every scramble has an
// EXACT shortest solution of OPTIMAL adjacent swaps (up/down/left/right).
//
// Board format: board[position] = tileId. Solved when board[i] === i.
// Each scramble also stores one optimal solution: a list of [posA, posB] swaps
// (used by tests and the dev-only debug mode, never shown to players).
// Generation is instant (see "generate" below). --verify re-checks every
// scramble with an independent exact solver (takes ~15 s for 500).
// Usage:
//   node scripts/generate-scrambles.mjs                 (defaults below)
//   node scripts/generate-scrambles.mjs --count 500 --optimal 16 --min-misplaced 13 --seed 2026 --out data/scrambles.json
//   node scripts/generate-scrambles.mjs --verify data/scrambles.json

import { writeFileSync, readFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1]?.startsWith("--") || arr[i + 1] === undefined ? "true" : arr[i + 1]]);
    return acc;
  }, [])
);

const N = 4;
const SIZE = N * N;
const COUNT = Number(args.count ?? 500);
const OPTIMAL = Number(args.optimal ?? 16);
const MIN_MISPLACED = Number(args["min-misplaced"] ?? 13);
const SEED = Number(args.seed ?? 2026);
const OUT = args.out ?? "data/scrambles.json";

// ---------- grid helpers ----------
const row = (p) => Math.floor(p / N);
const col = (p) => p % N;
const EDGES = [];
for (let p = 0; p < SIZE; p++) {
  if (col(p) < N - 1) EDGES.push([p, p + 1]);
  if (row(p) < N - 1) EDGES.push([p, p + N]);
}
// Manhattan distance table: DIST[tile][pos]
const DIST = Array.from({ length: SIZE }, (_, t) =>
  Array.from({ length: SIZE }, (_, p) => Math.abs(row(t) - row(p)) + Math.abs(col(t) - col(p)))
);

const manhattanSum = (b) => {
  let s = 0;
  for (let p = 0; p < SIZE; p++) s += DIST[b[p]][p];
  return s;
};
const misplaced = (b) => b.reduce((n, t, p) => n + (t !== p ? 1 : 0), 0);

// ---------- exact solver: IDA* ----------
// Each swap moves two tiles by one square each, so the Manhattan sum drops by
// at most 2 per swap: h = ceil(sum / 2) is an admissible lower bound.
function shortestSolution(start, limit = 40) {
  const b = start.slice();
  let sum = manhattanSum(b);
  let bound = Math.ceil(sum / 2);
  const FOUND = -1;

  function search(g, lastEdge) {
    const f = g + Math.ceil(sum / 2);
    if (f > bound) return f;
    if (sum === 0) return FOUND;
    let min = Infinity;
    for (let e = 0; e < EDGES.length; e++) {
      if (e === lastEdge) continue;
      const [a, c] = EDGES[e];
      const ta = b[a], tc = b[c];
      if (ta === tc) continue;
      const delta = DIST[ta][c] + DIST[tc][a] - DIST[ta][a] - DIST[tc][c];
      b[a] = tc; b[c] = ta; sum += delta;
      const r = search(g + 1, e);
      b[a] = ta; b[c] = tc; sum -= delta;
      if (r === FOUND) return FOUND;
      if (r < min) min = r;
    }
    return min;
  }

  while (bound <= limit) {
    const r = search(0, -1);
    if (r === FOUND) return bound;
    if (r === Infinity) return null;
    bound = r;
  }
  return null;
}

// ---------- seeded RNG (mulberry32) ----------
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- verify mode ----------
if (args.verify) {
  const file = JSON.parse(readFileSync(args.verify, "utf8"));
  let ok = 0;
  const seen = new Set();
  const solves = (s) => {
    if (!Array.isArray(s.solution) || s.solution.length !== file.optimalMoves) return false;
    const b = s.board.slice();
    for (const [a, c] of s.solution) {
      if (!EDGES.some(([x, y]) => (x === a && y === c) || (x === c && y === a))) return false;
      [b[a], b[c]] = [b[c], b[a]];
    }
    return b.every((t, p) => t === p);
  };
  for (const s of file.scrambles) {
    const valid =
      solves(s) &&
      s.board.length === SIZE &&
      new Set(s.board).size === SIZE &&
      misplaced(s.board) >= file.minMisplaced &&
      Math.ceil(manhattanSum(s.board) / 2) === file.optimalMoves &&
      shortestSolution(s.board, file.optimalMoves) === file.optimalMoves &&
      !seen.has(s.board.join(","));
    seen.add(s.board.join(","));
    if (valid) ok++;
    else console.error(`Invalid scramble: ${s.id}`);
  }
  console.log(`${ok}/${file.scrambles.length} scrambles valid (optimal ${file.optimalMoves}, min misplaced ${file.minMisplaced}).`);
  process.exit(ok === file.scrambles.length ? 0 : 1);
}

// ---------- generate ----------
// Build each scramble BACKWARDS from the solved board, using only swaps that
// move BOTH tiles one square further from their home (Manhattan sum +2).
// After OPTIMAL such swaps the Manhattan sum is 2*OPTIMAL, so the lower bound
// is exactly OPTIMAL, and reversing the swaps is an OPTIMAL-move solution.
// Therefore the shortest solution is exactly OPTIMAL - no search needed.
const rand = rng(SEED);
const results = [];
const seen = new Set();
let attempts = 0;
const t0 = Date.now();

function buildScramble() {
  const b = Array.from({ length: SIZE }, (_, i) => i);
  const swaps = [];
  for (let step = 0; step < OPTIMAL; step++) {
    const options = [];
    for (let e = 0; e < EDGES.length; e++) {
      const [a, c] = EDGES[e];
      const ta = b[a], tc = b[c];
      if (DIST[ta][c] - DIST[ta][a] === 1 && DIST[tc][a] - DIST[tc][c] === 1) options.push(e);
    }
    if (options.length === 0) return null; // dead end, start again
    const [a, c] = EDGES[options[Math.floor(rand() * options.length)]];
    [b[a], b[c]] = [b[c], b[a]];
    swaps.push([a, c]);
  }
  return { board: b, solution: swaps.reverse() };
}

while (results.length < COUNT) {
  attempts++;
  if (attempts > COUNT * 1000) throw new Error("Could not find enough scrambles - lower --min-misplaced or --count.");
  const built = buildScramble();
  if (!built || misplaced(built.board) < MIN_MISPLACED) continue;
  const key = built.board.join(",");
  if (seen.has(key)) continue;
  seen.add(key);
  results.push({ id: `s${String(results.length + 1).padStart(3, "0")}`, ...built });
}

const out = {
  gridSize: N,
  optimalMoves: OPTIMAL,
  minMisplaced: MIN_MISPLACED,
  seed: SEED,
  generatedAt: new Date().toISOString(),
  scrambles: results,
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out));
console.log(`Wrote ${results.length} scrambles to ${OUT} in ${((Date.now() - t0) / 1000).toFixed(1)} s.`);
