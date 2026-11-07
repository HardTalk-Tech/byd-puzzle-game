import { gameConfig } from "@/config/game";

/**
 * Optional short UI tones made with Web Audio (no sound files). Silent
 * unless gameConfig.soundEnabled is true.
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

export function playTone(tone: Tone): void {
  if (!gameConfig.soundEnabled || typeof window === "undefined") return;
  try {
    context ??= new AudioContext();
    const ctx = context;
    if (ctx.state === "suspended") void ctx.resume();
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
  } catch {
    // Audio not available: stay silent.
  }
}
