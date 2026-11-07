export const EVENT_TIME_ZONE = "Asia/Colombo";

/** Time taken as m:ss (rounded down to the second). */
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

/** Countdown as m:ss, rounded up so it shows 2:00 at the start and 0:00 only at the end. */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

const dateTimeParts = new Intl.DateTimeFormat("en-GB", {
  timeZone: EVENT_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

/** ISO timestamp → "2026-11-07 10:00:05" in Sri Lanka time (sortable, Excel-friendly). */
export function formatDateTime(iso: string | undefined | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const part = Object.fromEntries(dateTimeParts.formatToParts(d).map((p) => [p.type, p.value]));
  return `${part.year}-${part.month}-${part.day} ${part.hour}:${part.minute}:${part.second}`;
}

/** Today's date as YYYY-MM-DD in Sri Lanka time (for file names). */
export function todayInColombo(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: EVENT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // en-CA formats as YYYY-MM-DD
}
