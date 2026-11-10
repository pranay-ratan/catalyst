import type { Batch } from '../types';

export const CSV_COLUMNS = [
  'id',
  'brand',
  'garment',
  'mill',
  'country',
  'treatedOn',
  'litersTreated',
  'pollutant',
  'afterValue',
  'afterLimit',
  'unit',
  'lab',
  'reportDate',
  'litersReused',
  'status',
] as const satisfies readonly (keyof Batch)[];

/** Quotes a cell when it holds a comma, quote, or line break; doubles embedded quotes. */
export function escapeCsvCell(value: string | number): string {
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Builds a CSV document (header row first) from batch records. */
export function batchesToCsv(batches: readonly Batch[]): string {
  const header = CSV_COLUMNS.join(',');
  const lines = batches.map((batch) => CSV_COLUMNS.map((column) => escapeCsvCell(batch[column])).join(','));
  return [header, ...lines].join('\n');
}
