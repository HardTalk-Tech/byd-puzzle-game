"use client";

import { messages } from "@/content/messages";
import type { PlayerRecord } from "@/lib/types";
import { buildPlayersCsv, playersCsvFileName } from "@/lib/utils/csv";

interface ExportCsvButtonProps {
  /** All rows (not only the filtered ones). */
  players: PlayerRecord[];
}

/** Downloads byd-puzzle-players-YYYY-MM-DD.csv (UTF-8 with BOM). */
export function ExportCsvButton({ players }: ExportCsvButtonProps) {
  const download = () => {
    const blob = new Blob([buildPlayersCsv(players)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = playersCsvFileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <button type="button" onClick={download} className="gold-button font-display min-h-11 px-5 text-xs font-bold">
      {messages.staff.exportCsv} ({players.length})
    </button>
  );
}
