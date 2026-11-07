import { describe, expect, it } from "vitest";
import type { PlayerRecord } from "@/lib/types";
import { buildPlayersCsv, CSV_BOM, escapeCsvField, excelTextNumber, playersCsvFileName } from "@/lib/utils/csv";
import { formatCountdown, formatDateTime, formatDuration } from "@/lib/utils/format";

const base: PlayerRecord = {
  name: "Kasun Perera",
  phone: "0712345678",
  kioskId: "game-kiosk-1",
  modelSlug: "atto-3",
  modelName: "BYD Atto 3",
  scrambleId: "s001",
  clientCreatedAt: "2026-11-07T04:30:05.000Z",
  status: "completed",
  createdAtMs: null,
  moves: 16,
  timeMs: 72_400,
  perfect: true,
};

describe("escapeCsvField", () => {
  it("leaves plain text alone", () => {
    expect(escapeCsvField("Kasun Perera")).toBe("Kasun Perera");
    expect(escapeCsvField(16)).toBe("16");
    expect(escapeCsvField(undefined)).toBe("");
  });

  it("quotes commas, quotes and line breaks", () => {
    expect(escapeCsvField("Perera, Kasun")).toBe('"Perera, Kasun"');
    expect(escapeCsvField('The "Racer"')).toBe('"The ""Racer"""');
    expect(escapeCsvField("line\nbreak")).toBe('"line\nbreak"');
    expect(escapeCsvField("cr\r\nlf")).toBe('"cr\r\nlf"');
  });

  it("neutralises formula-like text", () => {
    expect(escapeCsvField("=1+1")).toBe("'=1+1");
    expect(escapeCsvField("+94")).toBe("'+94");
    expect(escapeCsvField("@cmd")).toBe("'@cmd");
  });
});

describe("phone format", () => {
  it('writes phones as ="0712345678" so Excel keeps the leading zero', () => {
    expect(excelTextNumber("0712345678")).toBe('="0712345678"');
  });

  it("escapes anything that is not plain digits", () => {
    expect(excelTextNumber('07"1')).toBe('"07""1"');
  });
});

describe("buildPlayersCsv", () => {
  const csv = buildPlayersCsv([
    base,
    { ...base, phone: "0779999999", name: 'Nimal "Speedy", Jr', status: "timeout", moves: 40, timeMs: 120_000, perfect: false },
    { ...base, phone: "0700000000", status: "playing", moves: undefined, timeMs: undefined, perfect: undefined },
  ]);

  it("starts with a UTF-8 BOM and uses CRLF", () => {
    expect(csv.startsWith(CSV_BOM)).toBe(true);
    expect(csv.split("\r\n")).toHaveLength(5); // header + 3 rows + trailing empty
  });

  it("has the table columns and formatted values", () => {
    const [header, first, second, third] = csv.slice(1).split("\r\n");
    expect(header).toBe("Date & time,Name,Phone,Car model,Status,Moves,Time,Perfect");
    expect(first).toBe('2026-11-07 10:00:05,Kasun Perera,="0712345678",BYD Atto 3,Completed,16,1:12,Yes');
    expect(second).toContain('"Nimal ""Speedy"", Jr"');
    expect(second).toContain("Time up,40,2:00,No");
    expect(third).toContain("Playing,,,No");
  });

  it("formats dates in Sri Lanka time", () => {
    expect(formatDateTime("2026-11-07T04:30:05.000Z")).toBe("2026-11-07 10:00:05");
    expect(formatDateTime("2026-11-07T18:45:00.000Z")).toBe("2026-11-08 00:15:00");
  });

  it("names the file by Colombo date", () => {
    expect(playersCsvFileName(new Date("2026-11-07T20:00:00.000Z"))).toBe("byd-puzzle-players-2026-11-08.csv");
  });
});

describe("time formats", () => {
  it("formats durations and countdowns as m:ss", () => {
    expect(formatDuration(72_400)).toBe("1:12");
    expect(formatDuration(0)).toBe("0:00");
    expect(formatCountdown(120_000)).toBe("2:00");
    expect(formatCountdown(117_001)).toBe("1:58");
    expect(formatCountdown(0)).toBe("0:00");
  });
});
