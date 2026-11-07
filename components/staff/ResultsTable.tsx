"use client";

import { useMemo, useState } from "react";
import { messages } from "@/content/messages";
import type { PlayerRecord } from "@/lib/types";
import { formatDateTime, formatDuration } from "@/lib/utils/format";
import { formatPhone } from "@/lib/utils/phone";

type Filter = "all" | "completed" | "perfect" | "timeout";

const FILTERS: Filter[] = ["all", "completed", "perfect", "timeout"];

const matchesFilter = (p: PlayerRecord, f: Filter) =>
  f === "all" ||
  (f === "completed" && p.status === "completed") ||
  (f === "perfect" && p.status === "completed" && p.perfect === true) ||
  (f === "timeout" && p.status === "timeout");

interface ResultsTableProps {
  players: PlayerRecord[];
}

/** Live results with search (name or phone) and a status filter. */
export function ResultsTable({ players }: ResultsTableProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const digits = term.replace(/\s+/g, "");
    return players.filter(
      (p) =>
        matchesFilter(p, filter) &&
        (!term || p.name.toLowerCase().includes(term) || (digits.length > 0 && p.phone.includes(digits))),
    );
  }, [players, search, filter]);

  const c = messages.staff.columns;

  return (
    <section className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={messages.staff.search}
          className="w-full rounded-xl border border-graphite-500 bg-graphite-600 px-4 py-2.5 text-sm text-ivory outline-none focus:border-gold-400 sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setFilter(f)}
              className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                filter === f ? "border-gold-400 bg-gold-500/15 text-gold-300" : "border-graphite-500 text-mist hover:text-ivory"
              }`}
            >
              {messages.staff.filters[f]}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-panel overflow-x-auto rounded-2xl">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-graphite-500 text-xs tracking-wide text-mist uppercase">
            <tr>
              {[c.date, c.name, c.phone, c.model, c.status, c.moves, c.time, c.perfect].map((h) => (
                <th key={h} className="px-4 py-3 font-semibold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr
                key={p.phone}
                className={`border-b border-graphite-700 last:border-0 ${
                  p.perfect ? "bg-gold-500/10 shadow-[inset_3px_0_0_var(--color-gold-400)]" : ""
                }`}
              >
                <td className="tabular px-4 py-2.5 whitespace-nowrap text-mist">{formatDateTime(p.clientCreatedAt)}</td>
                <td className="px-4 py-2.5 font-semibold">{p.name}</td>
                <td className="tabular px-4 py-2.5 whitespace-nowrap">{formatPhone(p.phone)}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{p.modelName}</td>
                <td className="px-4 py-2.5 whitespace-nowrap">{messages.staff.statusNames[p.status]}</td>
                <td className="font-display tabular px-4 py-2.5 font-bold">{p.moves ?? "–"}</td>
                <td className="font-display tabular px-4 py-2.5">{p.timeMs === undefined ? "–" : formatDuration(p.timeMs)}</td>
                <td className="px-4 py-2.5">
                  {p.perfect && (
                    <span className="gold-fill font-display rounded-full px-2.5 py-1 text-[11px] font-black text-ink">
                      {messages.staff.perfectBadge}
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-mist">
                  {players.length === 0 ? messages.staff.empty : messages.staff.noMatches}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
