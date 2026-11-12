import type { RangeKey } from "@/lib/types";

export const AS_OF = "2026-11-30T18:00:00.000Z";

export const RANGE_OPTIONS: { id: RangeKey; label: string }[] = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "month", label: "This month" },
];

export function rangeBounds(range: RangeKey): { startMs: number; endMs: number } {
  if (range === "month") {
    return {
      startMs: Date.parse("2026-11-01T00:00:00.000Z"),
      endMs: Date.parse("2026-11-30T23:59:59.999Z"),
    };
  }
  const days = range === "7d" ? 7 : range === "30d" ? 30 : 90;
  const endMs = Date.parse(AS_OF);
  return { startMs: endMs - days * 86_400_000, endMs };
}

export function inRange(iso: string, range: RangeKey): boolean {
  const time = Date.parse(iso);
  const bounds = rangeBounds(range);
  return time >= bounds.startMs && time <= bounds.endMs;
}

export function dayKeys(range: RangeKey): string[] {
  const bounds = rangeBounds(range);
  const start = new Date(bounds.startMs);
  const end = new Date(bounds.endMs);
  let cursor = Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
  const last = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const days: string[] = [];
  while (cursor <= last) {
    days.push(new Date(cursor).toISOString().slice(0, 10));
    cursor += 86_400_000;
  }
  return days;
}

export function rangePhrase(range: RangeKey): string {
  if (range === "month") return "November 2026";
  if (range === "7d") return "the last 7 days";
  if (range === "30d") return "the last 30 days";
  return "the last 90 days";
}
