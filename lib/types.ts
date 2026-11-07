/** A board: board[position] = tileId. Solved when board[i] === i. */
export type Board = number[];

export type Direction = "up" | "down" | "left" | "right";

/** One swap: two adjacent positions. */
export type SwapMove = [number, number];

export interface Scramble {
  id: string;
  board: Board;
  /** One optimal solution. Used only by tests and the dev-only debug mode. */
  solution: SwapMove[];
}

export interface ScramblePool {
  gridSize: number;
  optimalMoves: number;
  minMisplaced: number;
  seed: number;
  generatedAt: string;
  scrambles: Scramble[];
}

export type PlayerStatus = "playing" | "completed" | "timeout";
export type FinishedStatus = Exclude<PlayerStatus, "playing">;

/** Fields written once at registration. */
export interface NewPlayer {
  name: string;
  phone: string;
  kioskId: string;
  modelSlug: string;
  modelName: string;
  scrambleId: string;
  clientCreatedAt: string; // ISO, device time
}

/** Fields written once at the end of the game. */
export interface GameResult {
  status: FinishedStatus;
  moves: number;
  timeMs: number;
  perfect: boolean;
  clientFinishedAt: string; // ISO, device time
}

/** A player row as shown on the staff dashboard. */
export interface PlayerRecord extends NewPlayer {
  status: PlayerStatus;
  /** Server time in ms (Firestore) or null when not yet known. */
  createdAtMs: number | null;
  moves?: number;
  timeMs?: number;
  perfect?: boolean;
  clientFinishedAt?: string;
}

/** How a round ended, as shown in the result popups. */
export type RoundOutcome = "perfect" | "completed" | "timeout";

export interface RoundResult {
  outcome: RoundOutcome;
  moves: number;
  timeMs: number;
}
