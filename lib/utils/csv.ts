import { messages } from "@/content/messages";
import type { PlayerRecord } from "@/lib/types";
import { formatDateTime, formatDuration, todayInColombo } from "@/lib/utils/format";

/** UTF-8 byte order mark, so Excel opens the file as UTF-8. */
export const CSV_BOM = "﻿";
const LINE_BREAK = "\r\n";

/**
 * Quotes a field when it contains a quote, comma or line break, doubling
 * any quotes. Text that Excel would run as a formula (=, +, -, @) gets a
 * leading apostrophe.
 */
export function escapeCsvField(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/**
 * Phone numbers are written as ="0712345678" so Excel keeps the leading
 * zero. Only plain digits are written this way; anything else is escaped
 * as normal text.
 */
export function excelTextNumber(digits: string): string {
  return /^\d+$/.test(digits) ? `="${digits}"` : escapeCsvField(digits);
}

export const PLAYER_CSV_COLUMNS = [
  messages.staff.columns.date,
  messages.staff.columns.name,
  messages.staff.columns.phone,
  messages.staff.columns.model,
  messages.staff.columns.status,
  messages.staff.columns.moves,
  messages.staff.columns.time,
  messages.staff.columns.perfect,
];

export function playerToCsvRow(p: PlayerRecord): string {
  return [
    escapeCsvField(formatDateTime(p.clientCreatedAt)),
    escapeCsvField(p.name),
    excelTextNumber(p.phone),
    escapeCsvField(p.modelName),
    escapeCsvField(messages.staff.statusNames[p.status] ?? p.status),
    escapeCsvField(p.moves ?? ""),
    escapeCsvField(p.timeMs === undefined ? "" : formatDuration(p.timeMs)),
    escapeCsvField(p.perfect ? "Yes" : "No"),
  ].join(",");
}

/** Full CSV text: BOM + header + one row per player, CRLF line endings. */
export function buildPlayersCsv(players: PlayerRecord[]): string {
  const header = PLAYER_CSV_COLUMNS.map(escapeCsvField).join(",");
  return CSV_BOM + [header, ...players.map(playerToCsvRow)].join(LINE_BREAK) + LINE_BREAK;
}

export function playersCsvFileName(now: Date = new Date()): string {
  return `byd-puzzle-players-${todayInColombo(now)}.csv`;
}
