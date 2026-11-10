import { describe, expect, it } from 'vitest';
import { BATCHES } from '../data/batches';
import type { Batch } from '../types';
import {
  countByStatus,
  filterBatches,
  labResultPasses,
  reusePercent,
  sealVisibleFor,
  uniqueMills,
  waterTotals,
} from './status';

describe('sealVisibleFor', () => {
  it('shows the seal only for verified batches', () => {
    expect(sealVisibleFor('verified')).toBe(true);
  });

  it('hides the seal for batches under review', () => {
    expect(sealVisibleFor('review')).toBe(false);
  });

  it('hides the seal for withheld batches', () => {
    expect(sealVisibleFor('withheld')).toBe(false);
  });
});

describe('labResultPasses', () => {
  it('passes when the after value is at or below the limit', () => {
    expect(labResultPasses({ afterValue: 0.5, afterLimit: 0.5 })).toBe(true);
  });

  it('fails when the after value is above the limit', () => {
    expect(labResultPasses({ afterValue: 0.82, afterLimit: 0.5 })).toBe(false);
  });
});

describe('seed data status logic', () => {
  it('seeds 8 batches with 5 verified, 2 under review and 1 withheld', () => {
    expect(countByStatus(BATCHES)).toEqual({ total: 8, verified: 5, review: 2, withheld: 1 });
  });

  it('includes the sample garment CT-DEMO-0001', () => {
    expect(BATCHES.some((batch) => batch.id === 'CT-DEMO-0001')).toBe(true);
  });

  it('withheld batch has a failing lab result and verified batches pass', () => {
    const withheld = BATCHES.filter((batch) => batch.status === 'withheld');
    expect(withheld.every((batch) => !labResultPasses(batch))).toBe(true);

    const verified = BATCHES.filter((batch) => batch.status === 'verified');
    expect(verified.every((batch) => labResultPasses(batch))).toBe(true);
  });

  it('keeps every seeded batch id unique', () => {
    const ids = new Set(BATCHES.map((batch) => batch.id));
    expect(ids.size).toBe(BATCHES.length);
  });
});

describe('filterBatches', () => {
  it('returns everything when both filters are "all"', () => {
    expect(filterBatches(BATCHES, { status: 'all', mill: 'all' })).toHaveLength(8);
  });

  it('filters by status', () => {
    const result = filterBatches(BATCHES, { status: 'review' });
    expect(result.map((batch) => batch.id)).toEqual(['CT-DEMO-0004', 'CT-DEMO-0005']);
  });

  it('filters by mill and status together', () => {
    const result = filterBatches(BATCHES, { status: 'verified', mill: 'Harbor Dye Works' });
    expect(result.map((batch) => batch.id)).toEqual(['CT-DEMO-0001']);
  });

  it('lists each mill once, sorted', () => {
    const mills = uniqueMills(BATCHES);
    expect(mills).toEqual([...mills].sort((a, b) => a.localeCompare(b)));
    expect(new Set(mills).size).toBe(mills.length);
  });
});

describe('waterTotals', () => {
  it('sums treated and reused liters across batches', () => {
    const totals = waterTotals([
      { litersTreated: 1000, litersReused: 500 },
      { litersTreated: 3000, litersReused: 1500 },
    ] as Batch[]);
    expect(totals).toEqual({ litersTreated: 4000, litersReused: 2000, reusePercent: 50 });
  });

  it('reports zero totals for an empty list', () => {
    expect(waterTotals([])).toEqual({ litersTreated: 0, litersReused: 0, reusePercent: 0 });
  });
});

describe('reusePercent', () => {
  it('rounds reused liters to a whole percentage of treated liters', () => {
    expect(reusePercent({ litersReused: 9300, litersTreated: 12400 })).toBe(75);
  });

  it('returns 0 when no liters were treated', () => {
    expect(reusePercent({ litersReused: 0, litersTreated: 0 })).toBe(0);
  });
});
