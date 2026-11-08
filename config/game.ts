import scrambleData from "@/data/scrambles.json";

/**
 * Every tunable game value lives here. No magic numbers in components.
 * Section 5 of the development plan lists the main keys; `ui` holds the
 * smaller timing and layout values chosen during development.
 */
export const gameConfig = {
  gameTitle: "Build Your Dreams",
  gridSize: 4,
  timeLimitSeconds: 120,
  /** Best possible score (from data/scrambles.json). Equal moves = PERFECT. */
  optimalMoves: scrambleData.optimalMoves,
  lowTimeWarningSeconds: 15,
  revealCountdownSeconds: 3,
  highlightCorrectTiles: true,
  registerIdleSeconds: 60,
  resultIdleSeconds: 60,
  recentScrambleMemory: 100,
  swipeThresholdRatio: 0.18,
  swapDurationMs: 200,
  nameMaxLength: 30,
  soundEnabled: true,
} as const;

/**
 * Prize places shown on the win popup. A finished game always has an even
 * number of moves (each swap flips the tiles' parity), so places go up in
 * steps of 2: 16 = 1st, 18 = 2nd, 20 = 3rd, 22 = 4th, 24 = 5th.
 */
export const rewardConfig = {
  places: 5,
  movesPerPlace: 2,
  /** Places 1–3 get a special medal. */
  podiumPlaces: 3,
} as const;

/** Smaller interaction and animation values (chosen during development). */
export const uiConfig = {
  /** Swipe: one axis must be this many times longer than the other. */
  swipeAxisRatio: 1.3,
  /** Tap-tap selection clears after this long. */
  tapSelectionTimeoutMs: 4000,
  /** Timer display refresh. The timer itself uses performance.now(). */
  timerTickMs: 100,
  /** Rotate tips in the hint bar after this long, then every tipRotateMs. */
  hintTipsAfterMs: 10_000,
  tipRotateMs: 5_000,
  /** "Has this number played?" check limit (section 10.4). */
  duplicateCheckTimeoutMs: 3_000,
  /** How long to wait for the (normally preloaded) car image before the reveal. */
  imageWaitMs: 2_500,
  /** Reveal: pause on the full picture, split, fly into the scramble, GO! */
  revealIntroMs: 900,
  revealSplitMs: 450,
  revealFlyMs: 1_000,
  revealFlyStaggerMs: 25,
  revealGoMs: 700,
  /** Win sequence: tiles merge, a light sweep crosses, then the popup. */
  winMergeMs: 400,
  winSweepMs: 1_000,
  /** Time up: tiles slide home, short pause, then the popup. */
  timeUpSolveMs: 800,
  timeUpPauseMs: 900,
  /** Perfect popup repeats a small confetti burst this often. */
  perfectConfettiRepeatMs: 3_500,
  /** Hidden status panel: taps on the logo within the window. */
  statusTaps: 5,
  statusTapWindowMs: 3_000,
  /** Error pages reload to "/" after this long. */
  errorReloadMs: 5_000,
  /** Start screen demo board timings. */
  demoHoldSolvedMs: 1_600,
  demoSplitMs: 350,
  demoScrambleMs: 900,
  demoScrambleStaggerMs: 20,
  demoPauseMs: 300,
  demoStepMs: 260,
  demoFlashMs: 1_200,
  /** Screen transitions (fade + slight rise). */
  screenTransitionMs: 300,
  modalEnterMs: 300,
  /** OK on a popup is ignored this long, so a stray tap can't hide the result before staff read it. */
  modalOkGuardMs: 800,
} as const;

/** Background effects (section 7.5). */
export const fxConfig = {
  particlesFull: 40,
  particlesLight: 14,
  maxFps: 30,
  /** Cap canvas resolution for slow kiosk PCs. */
  maxDevicePixelRatio: 1.5,
} as const;

/** Phone numbers: exactly this many digits. */
export const PHONE_DIGITS = 10;

/** Kiosk identifier saved with every player. */
export const KIOSK_ID = process.env.NEXT_PUBLIC_KIOSK_ID || "game-kiosk-1";

/** App version (short commit SHA on Vercel, "dev" locally). */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "Live";
