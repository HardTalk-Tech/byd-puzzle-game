import { messages } from "@/content/messages";
import type { PlayerRecord } from "@/lib/types";
import { formatDuration } from "@/lib/utils/format";

interface StatsSummaryProps {
  players: PlayerRecord[];
}

/** Totals: players, completed, perfect, time-ups, average moves, fastest. */
export function StatsSummary({ players }: StatsSummaryProps) {
  const completed = players.filter((p) => p.status === "completed");
  const perfect = completed.filter((p) => p.perfect).length;
  const timeUps = players.filter((p) => p.status === "timeout").length;
  const moves = completed.map((p) => p.moves).filter((m): m is number => typeof m === "number");
  const times = completed.map((p) => p.timeMs).filter((t): t is number => typeof t === "number");
  const average = moves.length ? (moves.reduce((a, b) => a + b, 0) / moves.length).toFixed(1) : "–";
  const fastest = times.length ? formatDuration(Math.min(...times)) : "–";

  const cards: { label: string; value: string | number; gold?: boolean }[] = [
    { label: messages.staff.stats.total, value: players.length },
    { label: messages.staff.stats.completed, value: completed.length },
    { label: messages.staff.stats.perfect, value: perfect, gold: true },
    { label: messages.staff.stats.timeUps, value: timeUps },
    { label: messages.staff.stats.averageMoves, value: average },
    { label: messages.staff.stats.fastest, value: fastest, gold: true },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {cards.map((c) => (
        <div key={c.label} className="glass-panel flex flex-col gap-1 rounded-2xl px-4 py-3">
          <span className="text-xs font-semibold tracking-wide text-mist uppercase">{c.label}</span>
          <span className={`font-display tabular text-2xl font-bold ${c.gold ? "gold-text" : "text-ivory"}`}>{c.value}</span>
        </div>
      ))}
    </section>
  );
}
