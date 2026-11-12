import type { Batch } from "@/lib/types";

export const REVOKE_REASON = "Seal revoked by the standards board (demo action).";

export function presentBatch(batch: Batch, revokedIds: readonly string[]): Batch {
  if (!revokedIds.includes(batch.id) || batch.status === "withheld") return batch;
  return {
    ...batch,
    status: "withheld",
    withholdReason: REVOKE_REASON,
    alerts: batch.alerts.includes("withheld") ? batch.alerts : ["withheld", ...batch.alerts],
    trail: batch.trail.map((step) => (step.id === "audit" ? { ...step, state: "failed", detail: REVOKE_REASON } : step)),
  };
}

export function combinedStatus(batches: Batch[]) {
  if (batches.some((batch) => batch.status === "withheld")) return "withheld" as const;
  if (batches.some((batch) => batch.status === "review")) return "review" as const;
  return "verified" as const;
}
