import { millById } from "@/lib/data";
import { dayKeys, inRange } from "@/lib/range";
import type { Batch, Mill, RangeKey, Status } from "@/lib/types";

export { presentBatch } from "@/lib/present";

export const REUSE_OF_VERIFIED = 0.9;

export interface DailyPoint {
  date: string;
  treated: number;
  verified: number;
  codIn: number | null;
  codOut: number | null;
}

export interface Totals {
  treatedM3: number;
  verifiedM3: number;
  reviewM3: number;
  withheldM3: number;
  batchCount: number;
  verificationRate: number;
  avgColour: number;
  waterReusedPct: number;
  daily: DailyPoint[];
}

export interface FeeSplit {
  total: number;
  clearThread: number;
  viridis: number;
}

export interface MonthSummary {
  id: string;
  label: string;
  invoiceStatus: "Paid" | "Issued";
  treatedM3: number;
  verifiedM3: number;
  reviewM3: number;
  withheldM3: number;
  batchCount: number;
}

export interface AlertItem {
  id: string;
  href: string;
  title: string;
  body: string;
  tone: Status;
}

const STATUS_WORDS: Record<Status, string> = {
  verified: "verified",
  review: "under review",
  withheld: "withheld",
};

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function splitFees(verifiedM3: number, feeRate: number, clearShare: number): FeeSplit {
  const totalCents = Math.round(verifiedM3 * feeRate * 100);
  const clearCents = Math.round((totalCents * clearShare) / 100);
  return {
    total: totalCents / 100,
    clearThread: clearCents / 100,
    viridis: (totalCents - clearCents) / 100,
  };
}

export function matchesQuery(batch: Batch, query: string): boolean {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const mill = millById(batch.millId);
  const haystack = [batch.id, STATUS_WORDS[batch.status], mill.name, mill.city, mill.line, mill.unitId, batch.withholdReason ?? ""]
    .join(" ")
    .toLowerCase();
  return haystack.includes(needle);
}

export function totalsFor(list: Batch[], range: RangeKey): Totals {
  const rows = list.filter((batch) => inRange(batch.start, range));
  const treatedM3 = sum(rows.map((batch) => batch.volumeM3));
  const verifiedRows = rows.filter((batch) => batch.status === "verified");
  const verifiedM3 = sum(verifiedRows.map((batch) => batch.volumeM3));
  const reviewM3 = sum(rows.filter((batch) => batch.status === "review").map((batch) => batch.volumeM3));
  const withheldM3 = sum(rows.filter((batch) => batch.status === "withheld").map((batch) => batch.volumeM3));
  const avgColour = rows.length === 0 ? 0 : sum(rows.map((batch) => batch.colourRemoval)) / rows.length;
  return {
    treatedM3,
    verifiedM3,
    reviewM3,
    withheldM3,
    batchCount: rows.length,
    verificationRate: treatedM3 === 0 ? 0 : (verifiedM3 / treatedM3) * 100,
    avgColour,
    waterReusedPct: treatedM3 === 0 ? 0 : ((verifiedM3 * REUSE_OF_VERIFIED) / treatedM3) * 100,
    daily: dailySeries(rows, range),
  };
}

export function dailySeries(rows: Batch[], range: RangeKey): DailyPoint[] {
  return dayKeys(range).map((date) => {
    const onDay = rows.filter((batch) => batch.start.slice(0, 10) === date);
    if (onDay.length === 0) return { date, treated: 0, verified: 0, codIn: null, codOut: null };
    return {
      date,
      treated: sum(onDay.map((batch) => batch.volumeM3)),
      verified: sum(onDay.filter((batch) => batch.status === "verified").map((batch) => batch.volumeM3)),
      codIn: Math.round(sum(onDay.map((batch) => batch.codIn)) / onDay.length),
      codOut: Math.round(sum(onDay.map((batch) => batch.codOut)) / onDay.length),
    };
  });
}

export function monthSummaries(list: Batch[]): MonthSummary[] {
  const months = [
    { id: "2026-09", label: "September 2026", invoiceStatus: "Paid" as const },
    { id: "2026-10", label: "October 2026", invoiceStatus: "Paid" as const },
    { id: "2026-11", label: "November 2026", invoiceStatus: "Issued" as const },
  ];
  return months.map((month) => {
    const rows = list.filter((batch) => batch.start.startsWith(month.id));
    return {
      ...month,
      treatedM3: sum(rows.map((batch) => batch.volumeM3)),
      verifiedM3: sum(rows.filter((batch) => batch.status === "verified").map((batch) => batch.volumeM3)),
      reviewM3: sum(rows.filter((batch) => batch.status === "review").map((batch) => batch.volumeM3)),
      withheldM3: sum(rows.filter((batch) => batch.status === "withheld").map((batch) => batch.volumeM3)),
      batchCount: rows.length,
    };
  });
}

export function alertsFor(list: Batch[]): AlertItem[] {
  return list.flatMap((batch) => {
    const items: AlertItem[] = [];
    if (batch.alerts.includes("withheld")) {
      items.push({
        id: `${batch.id}-withheld`,
        href: `/dashboard/batches/${batch.id}`,
        title: `Batch ${batch.id} withheld`,
        body: batch.withholdReason ?? "This batch did not meet the standard.",
        tone: "withheld",
      });
    }
    if (batch.alerts.includes("drift")) {
      items.push({
        id: `${batch.id}-drift`,
        href: `/dashboard/batches/${batch.id}`,
        title: `Sensor drift on ${batch.id}`,
        body: `Lab cross-check differs from the sensor by ${batch.labDiffPct}%. Still inside the ±10% rule.`,
        tone: "review",
      });
    }
    if (batch.alerts.includes("overdue")) {
      items.push({
        id: `${batch.id}-overdue`,
        href: `/dashboard/batches/${batch.id}`,
        title: `Audit overdue on ${batch.id}`,
        body: "No auditor sign-off within 72 hours.",
        tone: "review",
      });
    }
    return items;
  });
}

export function latestBatch(list: Batch[], mill?: Mill): Batch | undefined {
  const rows = mill ? list.filter((batch) => batch.millId === mill.id) : list;
  return [...rows].sort((a, b) => Date.parse(b.end) - Date.parse(a.end))[0];
}

