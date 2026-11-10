import { describe, expect, it } from 'vitest';
import { BATCHES } from '../data/batches';
import { batchesToCsv, CSV_COLUMNS, escapeCsvCell } from './csv';

describe('escapeCsvCell', () => {
  it('leaves plain text and numbers unquoted', () => {
    expect(escapeCsvCell('Harbor Dye Works')).toBe('Harbor Dye Works');
    expect(escapeCsvCell(12400)).toBe('12400');
  });

  it('quotes values containing commas', () => {
    expect(escapeCsvCell('Shirt, linen')).toBe('"Shirt, linen"');
  });

  it('doubles embedded quotes and quotes the cell', () => {
    expect(escapeCsvCell('the "demo" mill')).toBe('"the ""demo"" mill"');
  });
});

describe('batchesToCsv', () => {
  it('starts with the header row and has one line per batch', () => {
    const csv = batchesToCsv(BATCHES);
    const lines = csv.split('\n');
    expect(lines[0]).toBe(CSV_COLUMNS.join(','));
    expect(lines).toHaveLength(BATCHES.length + 1);
  });

  it('writes the batch id in the first column of its row', () => {
    const [, firstRow] = batchesToCsv(BATCHES.slice(0, 1)).split('\n');
    expect(firstRow.startsWith('CT-DEMO-0001,')).toBe(true);
  });

  it('returns only the header for an empty list', () => {
    expect(batchesToCsv([])).toBe(CSV_COLUMNS.join(','));
  });
});
