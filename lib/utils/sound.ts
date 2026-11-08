import { gameConfig } from "@/config/game";

/**
 * Optional short UI tones made with Web Audio (no sound files). Silent
 * unless gameConfig.soundEnabled is true.
 *
 * Browsers only allow audio after a user gesture, and a kiosk that runs
 * all day can lose its audio context (sleep, audio device change). So the
 * context is created / resumed on every screen touch, replaced if it was
 * closed, and tones wait for it to be running before they play.
 */
export type Tone = "key" | "swap" | "bump" | "tick" | "go" | "win" | "timeup";

// [frequency Hz, start offset ms, duration ms]
const TONES: Record<Tone, [number, number, number][]> = {
  key: [[880, 0, 40]],
  swap: [[520, 0, 70]],
  bump: [[180, 0, 90]],
  tick: [[660, 0, 90]],
  go: [[880, 0, 120], [1320, 90, 180]],
  win: [[660, 0, 120], [880, 110, 120], [1320, 220, 260]],
  timeup: [[440, 0, 160], [330, 150, 260]],
};

let context: AudioContext | null = null;

/** The audio context, recreated if the browser closed it. */
function getContext(): AudioContext | null {
  try {
    if (!context || context.state === "closed") context = new AudioContext();
    return context;
  } catch {
    return null; // Web Audio not available
  }
}

/** Wake the audio context inside a user gesture (any touch on the screen). */
function unlock() {
  const ctx = getContext();
  if (ctx && ctx.state !== "running") void ctx.resume().catch(() => undefined);
}

if (typeof window !== "undefined" && gameConfig.soundEnabled) {
  window.addEventListener("pointerdown", unlock, { capture: true, passive: true });
  window.addEventListener("keydown", unlock, { capture: true, passive: true });
}

function schedule(ctx: AudioContext, tone: Tone) {
  for (const [freq, offset, duration] of TONES[tone]) {
    const start = ctx.currentTime + offset / 1000;
    const end = start + duration / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.18, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(end + 0.02);
  }
}

export function playTone(tone: Tone): void {
  if (!gameConfig.soundEnabled || typeof window === "undefined") return;
  const ctx = getContext();
  if (!ctx) return;
  try {
    if (ctx.state === "running") schedule(ctx, tone);
    else
      void ctx
        .resume()
        .then(() => schedule(ctx, tone))
        .catch(() => undefined); // still blocked (no touch yet): stay silent
  } catch {
    // Audio not available: stay silent.
  }
}
