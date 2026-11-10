import type { Batch, BatchStatus } from '../types';

export const STATUS_ORDER: readonly BatchStatus[] = ['verified', 'review', 'withheld'];

export const STATUS_LABEL: Record<BatchStatus, string> = {
  verified: 'Verified',
  review: 'Under review',
  withheld: 'Seal withheld',
};

/** Seal visibility rule: the seal is shown only for verified batches. */
export function sealVisibleFor(status: BatchStatus): boolean {
  return status === 'verified';
}

/** True when the measured post-treatment value is at or below the demo reference limit. */
export function labResultPasses(batch: Pick<Batch, 'afterValue' | 'afterLimit'>): boolean {
  return batch.afterValue <= batch.afterLimit;
}

export interface StatusCounts {
  total: number;
  verified: number;
  review: number;
  withheld: number;
}

export function countByStatus(batches: readonly Batch[]): StatusCounts {
  const counts: StatusCounts = { total: 0, verified: 0, review: 0, withheld: 0 };
  for (const batch of batches) {
    counts.total += 1;
    counts[batch.status] += 1;
  }
  return counts;
}

export interface BatchFilter {
  status?: BatchStatus | 'all';
  mill?: string | 'all';
}

export function filterBatches(batches: readonly Batch[], filter: BatchFilter): Batch[] {
  const statusFilter = filter.status ?? 'all';
  const millFilter = filter.mill ?? 'all';
  return batches.filter(
    (batch) =>
      (statusFilter === 'all' || batch.status === statusFilter) &&
      (millFilter === 'all' || batch.mill === millFilter),
  );
}

export function uniqueMills(batches: readonly Batch[]): string[] {
  return [...new Set(batches.map((batch) => batch.mill))].sort((a, b) => a.localeCompare(b));
}

export interface WaterTotals {
  litersTreated: number;
  litersReused: number;
  reusePercent: number;
}

/** Totals across the given batches, as recorded in each batch's demo data. */
export function waterTotals(batches: readonly Batch[]): WaterTotals {
  const litersTreated = batches.reduce((sum, batch) => sum + batch.litersTreated, 0);
  const litersReused = batches.reduce((sum, batch) => sum + batch.litersReused, 0);
  return { litersTreated, litersReused, reusePercent: reusePercent({ litersTreated, litersReused }) };
}

/** Reused water as a whole percentage of the water treated (0-100). */
export function reusePercent(batch: Pick<Batch, 'litersReused' | 'litersTreated'>): number {
  if (batch.litersTreated <= 0) return 0;
  return Math.round((batch.litersReused / batch.litersTreated) * 100);
}
